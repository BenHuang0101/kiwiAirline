const express = require('express');
const Joi = require('joi');
const { query } = require('../config/database');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// 搜尋航班的驗證規則
const searchFlightsSchema = Joi.object({
  departure: Joi.string().length(3).required().messages({
    'string.length': '出發機場代碼必須是3個字元',
    'any.required': '出發機場為必填欄位'
  }),
  arrival: Joi.string().length(3).required().messages({
    'string.length': '抵達機場代碼必須是3個字元',
    'any.required': '抵達機場為必填欄位'
  }),
  departureDate: Joi.date().min('now').required().messages({
    'date.min': '出發日期不能是過去日期',
    'any.required': '出發日期為必填欄位'
  }),
  returnDate: Joi.date().min(Joi.ref('departureDate')).allow('').messages({
    'date.min': '回程日期不能早於出發日期'
  }),
  passengers: Joi.number().integer().min(1).max(9).default(1).messages({
    'number.min': '乘客人數至少為1人',
    'number.max': '乘客人數最多為9人'
  }),
  class: Joi.string().valid('economy', 'premium_economy', 'business', 'first').default('economy'),
  sort: Joi.string().valid('price', 'duration', 'departure_time', 'arrival_time').default('price'),
  order: Joi.string().valid('asc', 'desc').default('asc'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

// 搜尋航班
router.get('/search', optionalAuth, async (req, res) => {
  try {
    // 驗證查詢參數
    const { error, value } = searchFlightsSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        error: '搜尋參數驗證失敗',
        code: 'VALIDATION_ERROR',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    const {
      departure,
      arrival,
      departureDate,
      returnDate,
      passengers,
      class: flightClass,
      sort,
      order,
      page,
      limit
    } = value;

    // 驗證機場代碼格式（IATA 代碼應該是3個大寫字母）
    if (!/^[A-Z]{3}$/.test(departure) || !/^[A-Z]{3}$/.test(arrival)) {
      return res.status(400).json({
        error: '機場代碼格式錯誤，請使用3個大寫字母的IATA代碼',
        code: 'INVALID_AIRPORT_FORMAT'
      });
    }

    // 構建搜尋查詢
    let searchSql = `
      SELECT 
        f.id as flight_id,
        f.flight_number,
        f.departure_time,
        f.arrival_time,
        f.departure_airport,
        f.arrival_airport,
        f.base_price,
        f.currency,
        f.available_seats,
        f.total_seats,
        f.aircraft_model,
        f.status,
        f.gate,
        f.terminal,
        TIMESTAMPDIFF(MINUTE, f.departure_time, f.arrival_time) as duration_minutes
      FROM flights f
      WHERE f.departure_airport = ?
        AND f.arrival_airport = ?
        AND DATE(f.departure_time) = DATE(?)
        AND f.available_seats >= ?
        AND f.status = 'scheduled'
    `;

    const searchParams = [departure, arrival, departureDate, passengers];

    // 添加排序
    const sortMapping = {
      price: 'f.base_price',
      duration: 'duration_minutes',
      departure_time: 'f.departure_time',
      arrival_time: 'f.arrival_time'
    };

    searchSql += ` ORDER BY ${sortMapping[sort]} ${order.toUpperCase()}`;

    // 添加分頁
    const offset = (page - 1) * limit;
    searchSql += ` LIMIT ${limit} OFFSET ${offset}`;

    // 執行搜尋
    const flights = await query(searchSql, searchParams);

    // 獲取總數量
    let countSql = `
      SELECT COUNT(*) as total
      FROM flights f
      WHERE f.departure_airport = ?
        AND f.arrival_airport = ?
        AND DATE(f.departure_time) = DATE(?)
        AND f.available_seats >= ?
        AND f.status = 'scheduled'
    `;

    const [countResult] = await query(countSql, searchParams);
    const totalCount = countResult.total;

    // 格式化航班資料
    const formattedFlights = flights.map(flight => ({
      flightId: flight.flight_id,
      flightNumber: flight.flight_number,
      departure: {
        dateTime: flight.departure_time,
        airport: {
          code: flight.departure_airport,
          name: flight.departure_airport // 暫時使用代碼作為名稱，之後可以建立機場對應表
        }
      },
      arrival: {
        dateTime: flight.arrival_time,
        airport: {
          code: flight.arrival_airport,
          name: flight.arrival_airport // 暫時使用代碼作為名稱
        }
      },
      duration: {
        hours: Math.floor(flight.duration_minutes / 60),
        minutes: flight.duration_minutes % 60,
        totalMinutes: flight.duration_minutes
      },
      price: {
        amount: parseFloat(flight.base_price),
        currency: flight.currency
      },
      seats: {
        available: flight.available_seats,
        total: flight.total_seats
      },
      aircraft: flight.aircraft_model,
      status: flight.status,
      gate: flight.gate,
      terminal: flight.terminal
    }));

    // 計算分頁資訊
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    res.json({
      success: true,
      data: {
        flights: formattedFlights,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasMore,
          limit
        },
        searchCriteria: {
          departure,
          arrival,
          departureDate,
          returnDate,
          passengers,
          class: flightClass
        }
      }
    });

  } catch (error) {
    console.error('搜尋航班錯誤:', error);
    res.status(500).json({
      error: '搜尋航班失敗',
      code: 'FLIGHT_SEARCH_ERROR'
    });
  }
});

// 獲取航班詳情
router.get('/:flightId', optionalAuth, async (req, res) => {
  try {
    const { flightId } = req.params;

    // 驗證UUID格式
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(flightId)) {
      return res.status(400).json({
        error: '無效的航班ID格式',
        code: 'INVALID_FLIGHT_ID'
      });
    }

    const flightSql = `
      SELECT 
        f.id as flight_id,
        f.flight_number,
        f.departure_time,
        f.arrival_time,
        f.departure_airport,
        f.arrival_airport,
        f.base_price,
        f.currency,
        f.available_seats,
        f.total_seats,
        f.aircraft_model,
        f.status,
        f.gate,
        f.terminal,
        TIMESTAMPDIFF(MINUTE, f.departure_time, f.arrival_time) as duration_minutes
      FROM flights f
      WHERE f.id = ?
    `;

    const [flight] = await query(flightSql, [flightId]);

    if (!flight) {
      return res.status(404).json({
        error: '找不到指定的航班',
        code: 'FLIGHT_NOT_FOUND'
      });
    }

    // 格式化航班資料
    const formattedFlight = {
      flightId: flight.flight_id,
      flightNumber: flight.flight_number,
      departure: {
        dateTime: flight.departure_time,
        airport: {
          code: flight.departure_airport,
          name: flight.departure_airport
        }
      },
      arrival: {
        dateTime: flight.arrival_time,
        airport: {
          code: flight.arrival_airport,
          name: flight.arrival_airport
        }
      },
      duration: {
        hours: Math.floor(flight.duration_minutes / 60),
        minutes: flight.duration_minutes % 60,
        totalMinutes: flight.duration_minutes
      },
      price: {
        amount: parseFloat(flight.base_price),
        currency: flight.currency
      },
      seats: {
        available: flight.available_seats,
        total: flight.total_seats
      },
      aircraft: flight.aircraft_model,
      status: flight.status,
      gate: flight.gate,
      terminal: flight.terminal
    };

    res.json({
      success: true,
      data: formattedFlight
    });

  } catch (error) {
    console.error('獲取航班詳情錯誤:', error);
    res.status(500).json({
      error: '獲取航班詳情失敗',
      code: 'FLIGHT_DETAIL_ERROR'
    });
  }
});

module.exports = router;
