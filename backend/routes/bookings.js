const express = require('express');
const Joi = require('joi');
const { query, beginTransaction, commit, rollback } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// 輔助函數：生成預訂編號
function generateBookingNumber() {
  const prefix = 'KW';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

// 輔助函數：生成確認碼
function generateConfirmationCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const router = express.Router();

// 預訂驗證規則
const createBookingSchema = Joi.object({
  flightId: Joi.string().guid().required().messages({
    'string.guid': '航班ID必須是有效的UUID格式',
    'any.required': '航班ID為必填欄位'
  }),
  returnFlightId: Joi.string().guid().allow(null).messages({
    'string.guid': '回程航班ID必須是有效的UUID格式'
  }),
  passengers: Joi.array().min(1).max(9).items(
    Joi.object({
      firstName: Joi.string().min(1).max(50).required().messages({
        'string.min': '名字不能為空',
        'string.max': '名字不能超過50個字元',
        'any.required': '名字為必填欄位'
      }),
      lastName: Joi.string().min(1).max(50).required().messages({
        'string.min': '姓氏不能為空',
        'string.max': '姓氏不能超過50個字元',
        'any.required': '姓氏為必填欄位'
      }),
      email: Joi.string().email().required().messages({
        'string.email': '請輸入有效的電子郵件地址',
        'any.required': '電子郵件為必填欄位'
      }),
      phone: Joi.string().pattern(/^\+?[1-9]\d{7,14}$/).required().messages({
        'string.pattern.base': '請輸入有效的電話號碼',
        'any.required': '電話號碼為必填欄位'
      }),
      dateOfBirth: Joi.date().max('now').required().messages({
        'date.max': '出生日期不能是未來日期',
        'any.required': '出生日期為必填欄位'
      }),
      gender: Joi.string().valid('male', 'female', 'other').required().messages({
        'any.only': '性別必須是 male、female 或 other',
        'any.required': '性別為必填欄位'
      }),
      nationality: Joi.string().length(2).required().messages({
        'string.length': '國籍代碼必須是2個字元',
        'any.required': '國籍為必填欄位'
      }),
      passportNumber: Joi.string().min(5).max(20).required().messages({
        'string.min': '護照號碼至少5個字元',
        'string.max': '護照號碼不能超過20個字元',
        'any.required': '護照號碼為必填欄位'
      }),
      passportExpiry: Joi.date().min('now').required().messages({
        'date.min': '護照到期日必須是未來日期',
        'any.required': '護照到期日為必填欄位'
      }),
      seatPreference: Joi.string().valid('window', 'aisle', 'middle', 'none').default('none'),
      mealPreference: Joi.string().valid('regular', 'vegetarian', 'vegan', 'halal', 'kosher', 'none').default('regular'),
      specialRequests: Joi.string().max(500).allow('').messages({
        'string.max': '特殊需求不能超過500個字元'
      })
    })
  ).required().messages({
    'array.min': '至少需要1位乘客資訊',
    'array.max': '最多只能預訂9位乘客',
    'any.required': '乘客資訊為必填欄位'
  }),
  contactInfo: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': '請輸入有效的聯絡電子郵件',
      'any.required': '聯絡電子郵件為必填欄位'
    }),
    phone: Joi.string().pattern(/^\+?[1-9]\d{7,14}$/).required().messages({
      'string.pattern.base': '請輸入有效的聯絡電話',
      'any.required': '聯絡電話為必填欄位'
    })
  }).required().messages({
    'any.required': '聯絡資訊為必填欄位'
  }),
  payment: Joi.object({
    cardNumber: Joi.string().pattern(/^\d{13,19}$/).required().messages({
      'string.pattern.base': '信用卡號碼格式不正確',
      'any.required': '信用卡號碼為必填欄位'
    }),
    expiryMonth: Joi.number().integer().min(1).max(12).required().messages({
      'number.min': '到期月份必須在1-12之間',
      'number.max': '到期月份必須在1-12之間',
      'any.required': '到期月份為必填欄位'
    }),
    expiryYear: Joi.number().integer().min(new Date().getFullYear()).required().messages({
      'number.min': '到期年份不能是過去年份',
      'any.required': '到期年份為必填欄位'
    }),
    cvv: Joi.string().pattern(/^\d{3,4}$/).required().messages({
      'string.pattern.base': 'CVV必須是3或4位數字',
      'any.required': 'CVV為必填欄位'
    }),
    cardholderName: Joi.string().min(2).max(100).required().messages({
      'string.min': '持卡人姓名至少2個字元',
      'string.max': '持卡人姓名不能超過100個字元',
      'any.required': '持卡人姓名為必填欄位'
    })
  }).required().messages({
    'any.required': '付款資訊為必填欄位'
  })
});

// 創建預訂
router.post('/', authenticateToken, async (req, res) => {
  const connection = await beginTransaction();
  
  try {
    // 驗證請求資料
    const { error, value } = createBookingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: '預訂資料驗證失敗',
        code: 'VALIDATION_ERROR',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    const { flightId, returnFlightId, passengers, contactInfo, payment } = value;
    const userId = req.user.id; // 使用 id 而不是 userId

    // 檢查航班是否存在且可預訂
    const flights = await query(`
      SELECT 
        id,
        flight_number,
        departure_time,
        arrival_time,
        base_price,
        currency,
        available_seats,
        status
      FROM flights 
      WHERE id = ? AND status = 'scheduled' AND available_seats >= ?
    `, [flightId, passengers.length], connection);

    if (flights.length === 0) {
      await rollback(connection);
      return res.status(400).json({
        error: '航班不存在或座位不足',
        code: 'FLIGHT_NOT_AVAILABLE'
      });
    }

    const mainFlight = flights[0];
    let returnFlight = null;

    // 如果有回程航班，檢查回程航班
    if (returnFlightId) {
      const returnFlights = await query(`
        SELECT 
          flight_id,
          flight_number,
          departure_datetime,
          arrival_datetime,
          base_price,
          currency,
          available_seats,
          status
        FROM flights 
        WHERE flight_id = ? AND status = 'scheduled' AND available_seats >= ?
      `, [returnFlightId, passengers.length], connection);

      if (returnFlights.length === 0) {
        await rollback(connection);
        return res.status(400).json({
          error: '回程航班不存在或座位不足',
          code: 'RETURN_FLIGHT_NOT_AVAILABLE'
        });
      }

      returnFlight = returnFlights[0];
    }

    // 計算總價格
    const totalPrice = returnFlight 
      ? (parseFloat(mainFlight.base_price) + parseFloat(returnFlight.base_price)) * passengers.length
      : parseFloat(mainFlight.base_price) * passengers.length;

    const bookingId = uuidv4(); // 為預訂生成UUID

    // 創建預訂記錄
    await query(`
      INSERT INTO bookings (
        id,
        user_id,
        booking_number,
        flight_id,
        passenger_count,
        total_amount,
        currency,
        status,
        contact_email,
        contact_phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `, [
      bookingId,
      userId,
      generateBookingNumber(),
      flightId,
      passengers.length,
      totalPrice,
      mainFlight.currency,
      contactInfo.email,
      contactInfo.phone
    ], connection);

    // 創建乘客記錄並建立關聯
    for (const passenger of passengers) {
      const passengerId = uuidv4(); // 為每位乘客生成UUID

      // 首先，創建乘客記錄
      await query(`
        INSERT INTO passengers (
          id,
          first_name,
          last_name,
          passport_number,
          date_of_birth,
          nationality,
          gender,
          email,
          phone_number
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        passengerId,
        passenger.firstName,
        passenger.lastName,
        passenger.passportNumber,
        passenger.dateOfBirth,
        passenger.nationality,
        passenger.gender === 'male' ? 'M' : passenger.gender === 'female' ? 'F' : 'OTHER',
        passenger.email,
        passenger.phone
      ], connection);
      
      // 然後，在 booking_passengers 表中建立關聯
      await query(`
        INSERT INTO booking_passengers (booking_id, passenger_id) 
        VALUES (?, ?)
      `, [bookingId, passengerId], connection);
    }

    // 處理付款（模擬付款處理）
    const paymentResult = await processPayment(payment, totalPrice, mainFlight.currency);
    
    if (!paymentResult.success) {
      await rollback(connection);
      return res.status(400).json({
        error: '付款處理失敗',
        code: 'PAYMENT_FAILED',
        details: paymentResult.error
      });
    }

    // 創建付款記錄
    await query(`
      INSERT INTO payments (
        booking_id,
        payment_method,
        amount,
        currency,
        transaction_id,
        status,
        processed_at
      ) VALUES (?, 'credit_card', ?, ?, ?, 'completed', NOW())
    `, [
      bookingId,
      totalPrice,
      mainFlight.currency,
      paymentResult.transactionId
    ], connection);

    // 更新預訂狀態為已確認
    await query(`
      UPDATE bookings 
      SET status = 'confirmed', confirmation_code = ?
      WHERE id = ?
    `, [generateConfirmationCode(), bookingId], connection);

    // 更新航班可用座位數
    await query(`
      UPDATE flights 
      SET available_seats = available_seats - ? 
      WHERE id = ?
    `, [passengers.length, flightId], connection);

    if (returnFlightId) {
      await query(`
        UPDATE flights 
        SET available_seats = available_seats - ? 
        WHERE id = ?
      `, [passengers.length, returnFlightId], connection);
    }

    await commit(connection);

    // 獲取完整的預訂資訊
    const completeBooking = await getBookingDetails(bookingId, userId);

    res.status(201).json({
      success: true,
      message: '預訂成功',
      data: completeBooking
    });

  } catch (error) {
    await rollback(connection);
    console.error('創建預訂錯誤:', error);
    res.status(500).json({
      error: '預訂處理失敗',
      code: 'BOOKING_CREATION_ERROR'
    });
  }
});

// 獲取用戶預訂列表
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // 獲取預訂列表
    const bookings = await query(`
      SELECT 
        b.id as booking_id,
        b.booking_number,
        b.passenger_count as total_passengers,
        b.total_amount,
        b.currency,
        b.status as booking_status,
        b.booking_date,
        f.flight_number as outbound_flight_number,
        f.departure_time as outbound_departure,
        f.arrival_time as outbound_arrival,
        f.departure_airport as outbound_departure_code,
        f.arrival_airport as outbound_arrival_code
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id
      WHERE b.user_id = ?
      ORDER BY b.booking_date DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);

    // 獲取預訂總數
    const totalBookingsResult = await query(
      'SELECT COUNT(*) as total FROM bookings WHERE user_id = ?',
      [userId]
    );
    const totalBookings = totalBookingsResult[0].total;

    res.json({
      success: true,
      data: bookings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalBookings / limit),
        totalItems: totalBookings
      }
    });
  } catch (error) {
    console.error('獲取預訂列表錯誤:', error);
    res.status(500).json({
      error: '獲取預訂列表失敗',
      code: 'GET_BOOKINGS_ERROR'
    });
  }
});

// 獲取特定預訂詳情
router.get('/:bookingId', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await getBookingDetails(bookingId, userId);

    if (!booking) {
      return res.status(404).json({
        error: '預訂不存在',
        code: 'BOOKING_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('獲取預訂詳情錯誤:', error);
    res.status(500).json({
      error: '獲取預訂詳情失敗',
      code: 'GET_BOOKING_DETAILS_ERROR'
    });
  }
});

// 取消預訂
router.post('/:bookingId/cancel', authenticateToken, async (req, res) => {
  const connection = await beginTransaction();
  
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    // 檢查預訂是否存在且屬於當前用戶
    const bookings = await query(`
      SELECT 
        id as booking_id,
        flight_id as outbound_flight_id,
        passenger_count as total_passengers,
        status as booking_status
      FROM bookings 
      WHERE id = ? AND user_id = ? AND status IN ('confirmed', 'pending')
    `, [bookingId, userId], connection);

    if (bookings.length === 0) {
      await rollback(connection);
      return res.status(404).json({
        error: '預訂不存在或無法取消',
        code: 'BOOKING_NOT_CANCELLABLE'
      });
    }

    const booking = bookings[0];

    // 更新預訂狀態為已取消
    await query(`
      UPDATE bookings 
      SET status = 'cancelled'
      WHERE id = ?
    `, [bookingId], connection);

    // 恢復航班座位數
    await query(`
      UPDATE flights 
      SET available_seats = available_seats + ? 
      WHERE id = ?
    `, [booking.total_passengers, booking.outbound_flight_id], connection);

    // 處理退款（模擬退款處理）
    await query(`
      UPDATE payments
      SET status = 'refunded', refunded_at = NOW()
      WHERE booking_id = ?
    `, [bookingId], connection);

    await commit(connection);

    res.json({
      success: true,
      message: '預訂已取消，退款將在3-5個工作日內處理'
    });

  } catch (error) {
    await rollback(connection);
    console.error('取消預訂錯誤:', error);
    res.status(500).json({
      error: '取消預訂失敗',
      code: 'BOOKING_CANCELLATION_ERROR'
    });
  }
});

// 輔助函數
async function processPayment(paymentInfo, amount, currency) {
  // 模擬付款處理
  // 在實際應用中，這裡會連接到付款網關（如 Stripe, PayPal 等）
  
  // 簡单的卡號驗證
  const cardNumber = paymentInfo.cardNumber;
  if (cardNumber.startsWith('4000000000000002')) {
    // 模擬付款失敗
    return {
      success: false,
      error: '信用卡被拒絕'
    };
  }

  // 模擬成功付款
  return {
    success: true,
    transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  };
}

// 輔助函數：獲取預訂詳情
async function getBookingDetails(bookingId, userId) {
  const bookings = await query(`
    SELECT 
      b.id as booking_id,
      b.booking_number,
      b.status as booking_status,
      b.passenger_count,
      b.total_amount,
      b.currency,
      b.contact_email,
      b.contact_phone,
      b.booking_date,
      b.confirmation_code,
      f.flight_number,
      f.departure_airport,
      f.arrival_airport,
      f.departure_time,
      f.arrival_time,
      f.gate,
      f.terminal
    FROM bookings b
    JOIN flights f ON b.flight_id = f.id
    WHERE b.id = ? AND b.user_id = ?
  `, [bookingId, userId]);

  if (bookings.length === 0) {
    return null;
  }

  const booking = bookings[0];

  const passengers = await query(`
    SELECT p.*
    FROM passengers p
    JOIN booking_passengers bp ON p.id = bp.passenger_id
    WHERE bp.booking_id = ?
  `, [booking.booking_id]);

  return { ...booking, passengers };
}

module.exports = router;
