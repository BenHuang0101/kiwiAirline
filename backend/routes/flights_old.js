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
      class: seatClass,
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
        city: flight.arrival_city,
        country: flight.arrival_country
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
      aircraft: flight.aircraft_type,
      status: flight.status,
      gate: flight.gate
    }));

    // 如果是來回票，搜尋回程航班
    let returnFlights = [];
    if (returnDate) {
      const returnSearchSql = searchSql.replace(
        'dep_airport.airport_code = ? AND arr_airport.airport_code = ?',
        'dep_airport.airport_code = ? AND arr_airport.airport_code = ?'
      );

      const returnSearchParams = [arrival, departure, returnDate, passengers];
      const returnFlightsResult = await query(returnSearchSql, returnSearchParams);

      returnFlights = returnFlightsResult.map(flight => ({
        flightId: flight.flight_id,
        flightNumber: flight.flight_number,
        departure: {
          dateTime: flight.departure_datetime,
          airport: {
            code: flight.departure_airport_code,
            name: flight.departure_airport_name
          },
          city: flight.departure_city,
          country: flight.departure_country
        },
        arrival: {
          dateTime: flight.arrival_datetime,
          airport: {
            code: flight.arrival_airport_code,
            name: flight.arrival_airport_name
          },
          city: flight.arrival_city,
          country: flight.arrival_country
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
        aircraft: flight.aircraft_type,
        status: flight.status,
        gate: flight.gate
      }));
    }

    res.json({
      success: true,
      data: {
        flights: formattedFlights,
        returnFlights,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        },
        searchCriteria: {
          departure,
          arrival,
          departureDate,
          returnDate,
          passengers,
          class: seatClass
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

    // 驗證 flightId
    if (!flightId || isNaN(flightId)) {
      return res.status(400).json({
        error: '無效的航班ID',
        code: 'INVALID_FLIGHT_ID'
      });
    }

    // 查詢航班詳情
    const flights = await query(`
      SELECT 
        f.flight_id,
        f.flight_number,
        f.departure_datetime,
        f.arrival_datetime,
        f.base_price,
        f.currency,
        f.available_seats,
        f.total_seats,
        f.aircraft_type,
        f.status,
        f.gate,
        dep_airport.airport_code as departure_airport_code,
        dep_airport.airport_name as departure_airport_name,
        dep_airport.city as departure_city,
        dep_airport.country as departure_country,
        dep_airport.timezone as departure_timezone,
        arr_airport.airport_code as arrival_airport_code,
        arr_airport.airport_name as arrival_airport_name,
        arr_airport.city as arrival_city,
        arr_airport.country as arrival_country,
        arr_airport.timezone as arrival_timezone,
        TIMESTAMPDIFF(MINUTE, f.departure_datetime, f.arrival_datetime) as duration_minutes
      FROM flights f
      JOIN airports dep_airport ON f.departure_airport_id = dep_airport.airport_id
      JOIN airports arr_airport ON f.arrival_airport_id = arr_airport.airport_id
      WHERE f.flight_id = ? AND f.status != 'cancelled'
    `, [flightId]);

    if (flights.length === 0) {
      return res.status(404).json({
        error: '航班不存在',
        code: 'FLIGHT_NOT_FOUND'
      });
    }

    const flight = flights[0];

    // 獲取座位資訊
    const seats = await query(`
      SELECT 
        seat_number,
        seat_class,
        is_available,
        is_window,
        is_aisle,
        extra_cost
      FROM seats 
      WHERE flight_id = ? 
      ORDER BY seat_number
    `, [flightId]);

    // 格式化回應資料
    const flightDetails = {
      flightId: flight.flight_id,
      flightNumber: flight.flight_number,
      departure: {
        dateTime: flight.departure_datetime,
        airport: {
          code: flight.departure_airport_code,
          name: flight.departure_airport_name
        },
        city: flight.departure_city,
        country: flight.departure_country,
        timezone: flight.departure_timezone
      },
      arrival: {
        dateTime: flight.arrival_datetime,
        airport: {
          code: flight.arrival_airport_code,
          name: flight.arrival_airport_name
        },
        city: flight.arrival_city,
        country: flight.arrival_country,
        timezone: flight.arrival_timezone
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
        total: flight.total_seats,
        details: seats.map(seat => ({
          number: seat.seat_number,
          class: seat.seat_class,
          available: seat.is_available,
          isWindow: seat.is_window,
          isAisle: seat.is_aisle,
          extraCost: parseFloat(seat.extra_cost || 0)
        }))
      },
      aircraft: flight.aircraft_type,
      status: flight.status,
      gate: flight.gate
    };

    res.json({
      success: true,
      data: flightDetails
    });

  } catch (error) {
    console.error('獲取航班詳情錯誤:', error);
    res.status(500).json({
      error: '獲取航班詳情失敗',
      code: 'GET_FLIGHT_DETAILS_ERROR'
    });
  }
});

// 獲取熱門目的地
router.get('/popular/destinations', async (req, res) => {
  try {
    // 查詢熱門目的地（基於航班數量）
    const destinations = await query(`
      SELECT 
        a.airport_code,
        a.airport_name,
        a.city,
        a.country,
        COUNT(f.flight_id) as flight_count,
        MIN(f.base_price) as min_price,
        f.currency
      FROM airports a
      JOIN flights f ON a.airport_id = f.arrival_airport_id
      WHERE f.status = 'scheduled' 
        AND f.departure_datetime > NOW()
        AND a.airport_code != 'TPE'
      GROUP BY a.airport_id, a.airport_code, a.airport_name, a.city, a.country, f.currency
      HAVING flight_count > 0
      ORDER BY flight_count DESC, min_price ASC
      LIMIT 12
    `);

    const formattedDestinations = destinations.map(dest => ({
      airportCode: dest.airport_code,
      airportName: dest.airport_name,
      city: dest.city,
      country: dest.country,
      flightCount: dest.flight_count,
      minPrice: {
        amount: parseFloat(dest.min_price),
        currency: dest.currency
      }
    }));

    res.json({
      success: true,
      data: formattedDestinations
    });

  } catch (error) {
    console.error('獲取熱門目的地錯誤:', error);
    res.status(500).json({
      error: '獲取熱門目的地失敗',
      code: 'GET_POPULAR_DESTINATIONS_ERROR'
    });
  }
});

// 獲取航班狀態
router.get('/:flightId/status', async (req, res) => {
  try {
    const { flightId } = req.params;

    if (!flightId || isNaN(flightId)) {
      return res.status(400).json({
        error: '無效的航班ID',
        code: 'INVALID_FLIGHT_ID'
      });
    }

    const flights = await query(`
      SELECT 
        flight_number,
        departure_datetime,
        arrival_datetime,
        status,
        gate
      FROM flights 
      WHERE flight_id = ?
    `, [flightId]);

    if (flights.length === 0) {
      return res.status(404).json({
        error: '航班不存在',
        code: 'FLIGHT_NOT_FOUND'
      });
    }

    const flight = flights[0];

    res.json({
      success: true,
      data: {
        flightNumber: flight.flight_number,
        departureTime: flight.departure_datetime,
        arrivalTime: flight.arrival_datetime,
        status: flight.status,
        gate: flight.gate,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('獲取航班狀態錯誤:', error);
    res.status(500).json({
      error: '獲取航班狀態失敗',
      code: 'GET_FLIGHT_STATUS_ERROR'
    });
  }
});

module.exports = router;
