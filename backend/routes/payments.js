const express = require('express');
const Joi = require('joi');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 付款驗證規則
const processPaymentSchema = Joi.object({
  bookingId: Joi.number().integer().positive().required().messages({
    'number.positive': '預訂ID必須是正整數',
    'any.required': '預訂ID為必填欄位'
  }),
  paymentMethod: Joi.string().valid('credit_card', 'debit_card', 'bank_transfer', 'paypal').required().messages({
    'any.only': '請選擇有效的付款方式',
    'any.required': '付款方式為必填欄位'
  }),
  cardDetails: Joi.when('paymentMethod', {
    is: Joi.string().valid('credit_card', 'debit_card'),
    then: Joi.object({
      cardNumber: Joi.string().pattern(/^[0-9]{16}$/).required().messages({
        'string.pattern.base': '信用卡號碼必須是16位數字',
        'any.required': '信用卡號碼為必填欄位'
      }),
      expiryMonth: Joi.number().integer().min(1).max(12).required().messages({
        'number.min': '到期月份必須在1-12之間',
        'number.max': '到期月份必須在1-12之間',
        'any.required': '到期月份為必填欄位'
      }),
      expiryYear: Joi.number().integer().min(new Date().getFullYear()).required().messages({
        'number.min': '到期年份不能是過去的年份',
        'any.required': '到期年份為必填欄位'
      }),
      cvv: Joi.string().pattern(/^[0-9]{3,4}$/).required().messages({
        'string.pattern.base': 'CVV必須是3-4位數字',
        'any.required': 'CVV為必填欄位'
      }),
      cardholderName: Joi.string().min(2).max(100).required().messages({
        'string.min': '持卡人姓名至少2個字元',
        'string.max': '持卡人姓名不能超過100個字元',
        'any.required': '持卡人姓名為必填欄位'
      })
    }).required()
  })
});

// 處理付款
router.post('/process', authenticateToken, async (req, res) => {
  try {
    // 驗證請求資料
    const { error, value } = processPaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: '付款資料驗證失敗',
        code: 'VALIDATION_ERROR',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    const { bookingId, paymentMethod, cardDetails } = value;

    // 檢查預訂是否存在且屬於當前用戶
    const bookings = await query(
      'SELECT * FROM bookings WHERE booking_id = ? AND user_id = ? AND status = "confirmed"',
      [bookingId, req.user.user_id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        error: '找不到有效的預訂',
        code: 'BOOKING_NOT_FOUND'
      });
    }

    const booking = bookings[0];

    // 檢查是否已經付款
    const existingPayments = await query(
      'SELECT * FROM payments WHERE booking_id = ? AND status = "completed"',
      [bookingId]
    );

    if (existingPayments.length > 0) {
      return res.status(400).json({
        error: '此預訂已經完成付款',
        code: 'ALREADY_PAID'
      });
    }

    // 模擬付款處理
    const paymentResult = await processPaymentMock(paymentMethod, booking.total_amount, cardDetails);

    if (!paymentResult.success) {
      // 記錄失敗的付款
      await query(
        'INSERT INTO payments (booking_id, user_id, amount, payment_method, status, transaction_id, failure_reason, created_at) VALUES (?, ?, ?, ?, "failed", ?, ?, NOW())',
        [bookingId, req.user.user_id, booking.total_amount, paymentMethod, paymentResult.transactionId, paymentResult.error]
      );

      return res.status(400).json({
        error: '付款處理失敗',
        code: 'PAYMENT_FAILED',
        reason: paymentResult.error
      });
    }

    // 記錄成功的付款
    const paymentInsert = await query(
      'INSERT INTO payments (booking_id, user_id, amount, payment_method, status, transaction_id, payment_gateway_response, created_at) VALUES (?, ?, ?, ?, "completed", ?, ?, NOW())',
      [bookingId, req.user.user_id, booking.total_amount, paymentMethod, paymentResult.transactionId, JSON.stringify(paymentResult.response)]
    );

    // 更新預訂狀態為已付款
    await query(
      'UPDATE bookings SET payment_status = "paid", updated_at = NOW() WHERE booking_id = ?',
      [bookingId]
    );

    res.json({
      message: '付款處理成功',
      data: {
        paymentId: paymentInsert.insertId,
        transactionId: paymentResult.transactionId,
        amount: booking.total_amount,
        status: 'completed',
        paymentMethod: paymentMethod
      }
    });

  } catch (error) {
    console.error('付款處理錯誤:', error);
    res.status(500).json({
      error: '付款處理失敗',
      code: 'PAYMENT_PROCESSING_ERROR'
    });
  }
});

// 模擬付款處理功能
async function processPaymentMock(paymentMethod, amount, cardDetails) {
  // 模擬處理時間
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 模擬成功
  return {
    success: true,
    transactionId: 'TXN_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    response: {
      approvalCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      processorResponse: 'Approved',
      timestamp: new Date().toISOString()
    }
  };
}

// 獲取付款歷史
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const payments = await query(
      'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [req.user.user_id, limit, offset]
    );

    const totalResult = await query(
      'SELECT COUNT(*) as total FROM payments WHERE user_id = ?',
      [req.user.user_id]
    );
    const total = totalResult[0].total;

    res.json({
      message: '付款歷史查詢成功',
      data: {
        payments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('查詢付款歷史錯誤:', error);
    res.status(500).json({
      error: '查詢付款歷史失敗',
      code: 'PAYMENT_HISTORY_ERROR'
    });
  }
});

// 獲取特定付款詳情
router.get('/:paymentId', authenticateToken, async (req, res) => {
  try {
    const paymentId = parseInt(req.params.paymentId);

    if (!paymentId || paymentId <= 0) {
      return res.status(400).json({
        error: '無效的付款ID',
        code: 'INVALID_PAYMENT_ID'
      });
    }

    const payments = await query(
      'SELECT * FROM payments WHERE payment_id = ? AND user_id = ?',
      [paymentId, req.user.user_id]
    );

    if (payments.length === 0) {
      return res.status(404).json({
        error: '找不到付款記錄',
        code: 'PAYMENT_NOT_FOUND'
      });
    }

    res.json({
      message: '付款詳情查詢成功',
      data: payments[0]
    });

  } catch (error) {
    console.error('查詢付款詳情錯誤:', error);
    res.status(500).json({
      error: '查詢付款詳情失敗',
      code: 'PAYMENT_DETAIL_ERROR'
    });
  }
});

// 申請退款
router.post('/:paymentId/refund', authenticateToken, async (req, res) => {
  try {
    const paymentId = parseInt(req.params.paymentId);
    const { reason } = req.body;

    if (!paymentId || paymentId <= 0) {
      return res.status(400).json({
        error: '無效的付款ID',
        code: 'INVALID_PAYMENT_ID'
      });
    }

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        error: '退款原因至少需要10個字元',
        code: 'INVALID_REFUND_REASON'
      });
    }

    // 檢查付款記錄
    const payments = await query(
      'SELECT * FROM payments WHERE payment_id = ? AND user_id = ? AND status = "completed"',
      [paymentId, req.user.user_id]
    );

    if (payments.length === 0) {
      return res.status(404).json({
        error: '找不到可退款的付款記錄',
        code: 'PAYMENT_NOT_FOUND'
      });
    }

    const payment = payments[0];
    const refundAmount = payment.amount * 0.9; // 扣除10%手續費

    res.json({
      message: '退款申請已提交',
      data: {
        refundAmount,
        status: 'pending',
        note: '退款申請已提交，我們將在3-5個工作日內處理'
      }
    });

  } catch (error) {
    console.error('退款申請錯誤:', error);
    res.status(500).json({
      error: '退款申請失敗',
      code: 'REFUND_REQUEST_ERROR'
    });
  }
});

module.exports = router;
