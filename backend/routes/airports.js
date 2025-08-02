const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// 獲取所有機場列表
router.get('/', async (req, res) => {
  try {
    const search = req.query.search;
    const country = req.query.country;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT 
        airport_id,
        airport_code,
        airport_name,
        city,
        country,
        timezone,
        latitude,
        longitude,
        is_active
      FROM airports 
      WHERE is_active = TRUE
    `;
    
    const params = [];

    // 搜尋功能（機場代碼、名稱、城市）
    if (search) {
      sql += ` AND (
        airport_code LIKE ? OR 
        airport_name LIKE ? OR 
        city LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // 按國家篩選
    if (country) {
      sql += ' AND country = ?';
      params.push(country);
    }

    // 排序：按機場代碼
    sql += ' ORDER BY airport_code ASC';
    
    // 分頁
    sql += ` LIMIT ${limit} OFFSET ${offset}`;

    const airports = await query(sql, params);

    // 獲取總數量
    let countSql = 'SELECT COUNT(*) as total FROM airports WHERE is_active = TRUE';
    let countParams = [];

    if (search) {
      countSql += ` AND (
        airport_code LIKE ? OR 
        airport_name LIKE ? OR 
        city LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (country) {
      countSql += ' AND country = ?';
      countParams.push(country);
    }

    const [countResult] = await query(countSql, countParams);

    const formattedAirports = airports.map(airport => ({
      id: airport.airport_id,
      code: airport.airport_code,
      name: airport.airport_name,
      city: airport.city,
      country: airport.country,
      timezone: airport.timezone,
      coordinates: {
        latitude: parseFloat(airport.latitude),
        longitude: parseFloat(airport.longitude)
      }
    }));

    res.json({
      success: true,
      data: {
        airports: formattedAirports,
        pagination: {
          page,
          limit,
          total: countResult.total,
          totalPages: Math.ceil(countResult.total / limit),
          hasNext: page * limit < countResult.total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('獲取機場列表錯誤:', error);
    res.status(500).json({
      error: '獲取機場列表失敗',
      code: 'GET_AIRPORTS_ERROR'
    });
  }
});

// 獲取特定機場詳情
router.get('/:airportCode', async (req, res) => {
  try {
    const { airportCode } = req.params;

    // 驗證機場代碼格式
    if (!/^[A-Z]{3}$/.test(airportCode)) {
      return res.status(400).json({
        error: '無效的機場代碼格式',
        code: 'INVALID_AIRPORT_CODE'
      });
    }

    const airports = await query(`
      SELECT 
        airport_id,
        airport_code,
        airport_name,
        city,
        country,
        timezone,
        latitude,
        longitude,
        is_active
      FROM airports 
      WHERE airport_code = ? AND is_active = TRUE
    `, [airportCode]);

    if (airports.length === 0) {
      return res.status(404).json({
        error: '機場不存在',
        code: 'AIRPORT_NOT_FOUND'
      });
    }

    const airport = airports[0];

    // 獲取從此機場出發的航班統計
    const departureStats = await query(`
      SELECT 
        COUNT(*) as total_flights,
        COUNT(DISTINCT arrival_airport_id) as destinations
      FROM flights 
      WHERE departure_airport_id = ? 
        AND departure_datetime > NOW() 
        AND status = 'scheduled'
    `, [airport.airport_id]);

    // 獲取抵達此機場的航班統計
    const arrivalStats = await query(`
      SELECT 
        COUNT(*) as total_flights,
        COUNT(DISTINCT departure_airport_id) as origins
      FROM flights 
      WHERE arrival_airport_id = ? 
        AND departure_datetime > NOW() 
        AND status = 'scheduled'
    `, [airport.airport_id]);

    // 獲取熱門目的地（從此機場出發）
    const popularDestinations = await query(`
      SELECT 
        arr_airport.airport_code,
        arr_airport.airport_name,
        arr_airport.city,
        arr_airport.country,
        COUNT(*) as flight_count,
        MIN(f.base_price) as min_price,
        f.currency
      FROM flights f
      JOIN airports arr_airport ON f.arrival_airport_id = arr_airport.airport_id
      WHERE f.departure_airport_id = ? 
        AND f.departure_datetime > NOW() 
        AND f.status = 'scheduled'
      GROUP BY arr_airport.airport_id, arr_airport.airport_code, 
               arr_airport.airport_name, arr_airport.city, 
               arr_airport.country, f.currency
      ORDER BY flight_count DESC
      LIMIT 10
    `, [airport.airport_id]);

    const stats = {
      departures: departureStats[0] || { total_flights: 0, destinations: 0 },
      arrivals: arrivalStats[0] || { total_flights: 0, origins: 0 }
    };

    res.json({
      success: true,
      data: {
        id: airport.airport_id,
        code: airport.airport_code,
        name: airport.airport_name,
        city: airport.city,
        country: airport.country,
        timezone: airport.timezone,
        coordinates: {
          latitude: parseFloat(airport.latitude),
          longitude: parseFloat(airport.longitude)
        },
        statistics: {
          totalDepartureFlights: stats.departures.total_flights,
          totalDestinations: stats.departures.destinations,
          totalArrivalFlights: stats.arrivals.total_flights,
          totalOrigins: stats.arrivals.origins
        },
        popularDestinations: popularDestinations.map(dest => ({
          airportCode: dest.airport_code,
          airportName: dest.airport_name,
          city: dest.city,
          country: dest.country,
          flightCount: dest.flight_count,
          minPrice: {
            amount: parseFloat(dest.min_price),
            currency: dest.currency
          }
        }))
      }
    });

  } catch (error) {
    console.error('獲取機場詳情錯誤:', error);
    res.status(500).json({
      error: '獲取機場詳情失敗',
      code: 'GET_AIRPORT_DETAILS_ERROR'
    });
  }
});

// 獲取機場的航班時刻表
router.get('/:airportCode/schedule', async (req, res) => {
  try {
    const { airportCode } = req.params;
    const type = req.query.type || 'departures'; // departures 或 arrivals
    const date = req.query.date || new Date().toISOString().split('T')[0];
    
    // 驗證機場代碼
    if (!/^[A-Z]{3}$/.test(airportCode)) {
      return res.status(400).json({
        error: '無效的機場代碼格式',
        code: 'INVALID_AIRPORT_CODE'
      });
    }

    // 驗證類型
    if (!['departures', 'arrivals'].includes(type)) {
      return res.status(400).json({
        error: '無效的時刻表類型',
        code: 'INVALID_SCHEDULE_TYPE'
      });
    }

    // 檢查機場是否存在
    const airports = await query(
      'SELECT airport_id FROM airports WHERE airport_code = ? AND is_active = TRUE',
      [airportCode]
    );

    if (airports.length === 0) {
      return res.status(404).json({
        error: '機場不存在',
        code: 'AIRPORT_NOT_FOUND'
      });
    }

    const airportId = airports[0].airport_id;

    let sql, params;

    if (type === 'departures') {
      sql = `
        SELECT 
          f.flight_id,
          f.flight_number,
          f.departure_datetime,
          f.arrival_datetime,
          f.status,
          f.gate,
          arr_airport.airport_code as destination_code,
          arr_airport.airport_name as destination_name,
          arr_airport.city as destination_city,
          arr_airport.country as destination_country
        FROM flights f
        JOIN airports arr_airport ON f.arrival_airport_id = arr_airport.airport_id
        WHERE f.departure_airport_id = ?
          AND DATE(f.departure_datetime) = ?
          AND f.departure_datetime >= NOW() - INTERVAL 2 HOUR
        ORDER BY f.departure_datetime ASC
      `;
      params = [airportId, date];
    } else {
      sql = `
        SELECT 
          f.flight_id,
          f.flight_number,
          f.departure_datetime,
          f.arrival_datetime,
          f.status,
          f.gate,
          dep_airport.airport_code as origin_code,
          dep_airport.airport_name as origin_name,
          dep_airport.city as origin_city,
          dep_airport.country as origin_country
        FROM flights f
        JOIN airports dep_airport ON f.departure_airport_id = dep_airport.airport_id
        WHERE f.arrival_airport_id = ?
          AND DATE(f.arrival_datetime) = ?
          AND f.arrival_datetime >= NOW() - INTERVAL 2 HOUR
        ORDER BY f.arrival_datetime ASC
      `;
      params = [airportId, date];
    }

    const flights = await query(sql, params);

    const formattedFlights = flights.map(flight => {
      const baseInfo = {
        flightId: flight.flight_id,
        flightNumber: flight.flight_number,
        status: flight.status,
        gate: flight.gate
      };

      if (type === 'departures') {
        return {
          ...baseInfo,
          departureTime: flight.departure_datetime,
          arrivalTime: flight.arrival_datetime,
          destination: {
            code: flight.destination_code,
            name: flight.destination_name,
            city: flight.destination_city,
            country: flight.destination_country
          }
        };
      } else {
        return {
          ...baseInfo,
          departureTime: flight.departure_datetime,
          arrivalTime: flight.arrival_datetime,
          origin: {
            code: flight.origin_code,
            name: flight.origin_name,
            city: flight.origin_city,
            country: flight.origin_country
          }
        };
      }
    });

    res.json({
      success: true,
      data: {
        airportCode,
        scheduleType: type,
        date,
        flights: formattedFlights,
        totalFlights: formattedFlights.length
      }
    });

  } catch (error) {
    console.error('獲取航班時刻表錯誤:', error);
    res.status(500).json({
      error: '獲取航班時刻表失敗',
      code: 'GET_AIRPORT_SCHEDULE_ERROR'
    });
  }
});

// 獲取所有國家列表
router.get('/countries/list', async (req, res) => {
  try {
    const countries = await query(`
      SELECT 
        DISTINCT country,
        COUNT(*) as airport_count
      FROM airports 
      WHERE is_active = TRUE
      GROUP BY country
      ORDER BY country ASC
    `);

    const formattedCountries = countries.map(country => ({
      name: country.country,
      airportCount: country.airport_count
    }));

    res.json({
      success: true,
      data: formattedCountries
    });

  } catch (error) {
    console.error('獲取國家列表錯誤:', error);
    res.status(500).json({
      error: '獲取國家列表失敗',
      code: 'GET_COUNTRIES_ERROR'
    });
  }
});

// 機場搜尋建議（自動完成）
router.get('/search/suggestions', async (req, res) => {
  try {
    const query_term = req.query.q;
    const limit = parseInt(req.query.limit) || 10;

    if (!query_term || query_term.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const suggestions = await query(`
      SELECT 
        airport_code,
        airport_name,
        city,
        country
      FROM airports 
      WHERE is_active = TRUE
        AND (
          airport_code LIKE ? OR 
          airport_name LIKE ? OR 
          city LIKE ?
        )
      ORDER BY 
        CASE 
          WHEN airport_code LIKE ? THEN 1
          WHEN city LIKE ? THEN 2
          ELSE 3
        END,
        airport_code ASC
      LIMIT ?
    `, [
      `${query_term}%`,
      `%${query_term}%`,
      `%${query_term}%`,
      `${query_term}%`,
      `${query_term}%`,
      limit
    ]);

    const formattedSuggestions = suggestions.map(suggestion => ({
      code: suggestion.airport_code,
      name: suggestion.airport_name,
      city: suggestion.city,
      country: suggestion.country,
      display: `${suggestion.airport_code} - ${suggestion.city}, ${suggestion.country}`
    }));

    res.json({
      success: true,
      data: formattedSuggestions
    });

  } catch (error) {
    console.error('機場搜尋建議錯誤:', error);
    res.status(500).json({
      error: '機場搜尋建議失敗',
      code: 'AIRPORT_SEARCH_SUGGESTIONS_ERROR'
    });
  }
});

module.exports = router;
