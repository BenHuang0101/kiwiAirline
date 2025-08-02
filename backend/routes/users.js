const express = require('express');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 更新用戶資料驗證規則
const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(1).max(100).messages({
    'string.min': '名字不能為空',
    'string.max': '名字不能超過100個字元'
  }),
  lastName: Joi.string().min(1).max(100).messages({
    'string.min': '姓氏不能為空',
    'string.max': '姓氏不能超過100個字元'
  }),
  phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{7,14}$/).messages({
    'string.pattern.base': '請輸入有效的電話號碼'
  }),
  dateOfBirth: Joi.date().max('now').messages({
    'date.max': '出生日期不能是未來的日期'
  }),
  gender: Joi.string().valid('male', 'female', 'other').messages({
    'any.only': '請選擇有效的性別'
  }),
  preferredLanguage: Joi.string().valid('zh-TW', 'en-US', 'ja-JP').messages({
    'any.only': '請選擇支援的語言'
  }),
  marketingConsent: Joi.boolean()
});

// 更改密碼驗證規則
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': '當前密碼為必填欄位'
  }),
  newPassword: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
    'string.min': '新密碼至少需要8個字元',
    'string.pattern.base': '新密碼必須包含至少一個小寫字母、一個大寫字母和一個數字',
    'any.required': '新密碼為必填欄位'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': '確認密碼必須與新密碼相同',
    'any.required': '確認密碼為必填欄位'
  })
});

// 獲取用戶資料
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const users = await query(
      `SELECT user_id, email, first_name, last_name, phone_number, 
              date_of_birth, gender, preferred_language, marketing_consent,
              email_verified, created_at, last_login
       FROM users WHERE user_id = ?`,
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: '用戶不存在',
        code: 'USER_NOT_FOUND'
      });
    }

    // 獲取用戶統計資料
    const bookingStats = await query(
      `SELECT 
         COUNT(*) as total_bookings,
         COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
         COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings
       FROM bookings WHERE user_id = ?`,
      [req.user.user_id]
    );

    const totalSpent = await query(
      `SELECT COALESCE(SUM(amount), 0) as total_amount
       FROM payments 
       WHERE user_id = ? AND status = 'completed'`,
      [req.user.user_id]
    );

    res.json({
      message: '用戶資料取得成功',
      data: {
        ...users[0],
        stats: {
          ...bookingStats[0],
          total_spent: totalSpent[0].total_amount
        }
      }
    });

  } catch (error) {
    console.error('獲取用戶資料錯誤:', error);
    res.status(500).json({
      error: '獲取用戶資料失敗',
      code: 'GET_PROFILE_ERROR'
    });
  }
});

// 更新用戶資料
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    // 驗證請求資料
    const { error, value } = updateProfileSchema.validate(req.body, { 
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        error: '資料驗證失敗',
        code: 'VALIDATION_ERROR',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // 檢查是否有資料需要更新
    if (Object.keys(value).length === 0) {
      return res.status(400).json({
        error: '沒有提供要更新的資料',
        code: 'NO_UPDATE_DATA'
      });
    }

    // 建立更新查詢
    const updateFields = [];
    const updateValues = [];

    Object.keys(value).forEach(key => {
      if (value[key] !== undefined) {
        // 轉換欄位名稱（camelCase to snake_case）
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        updateFields.push(`${dbField} = ?`);
        updateValues.push(value[key]);
      }
    });

    updateFields.push('updated_at = NOW()');
    updateValues.push(req.user.user_id);

    const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`;
    
    await query(updateQuery, updateValues);

    // 返回更新後的用戶資料
    const updatedUser = await query(
      `SELECT user_id, email, first_name, last_name, phone_number, 
              date_of_birth, gender, preferred_language, marketing_consent,
              email_verified, updated_at
       FROM users WHERE user_id = ?`,
      [req.user.user_id]
    );

    res.json({
      message: '用戶資料更新成功',
      data: updatedUser[0]
    });

  } catch (error) {
    console.error('更新用戶資料錯誤:', error);
    res.status(500).json({
      error: '更新用戶資料失敗',
      code: 'UPDATE_PROFILE_ERROR'
    });
  }
});

// 更改密碼
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    // 驗證請求資料
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: '密碼驗證失敗',
        code: 'VALIDATION_ERROR',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    const { currentPassword, newPassword } = value;

    // 獲取當前用戶密碼
    const users = await query(
      'SELECT password_hash FROM users WHERE user_id = ?',
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: '用戶不存在',
        code: 'USER_NOT_FOUND'
      });
    }

    // 驗證當前密碼
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: '當前密碼不正確',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // 檢查新密碼是否與當前密碼相同
    const isSamePassword = await bcrypt.compare(newPassword, users[0].password_hash);
    if (isSamePassword) {
      return res.status(400).json({
        error: '新密碼不能與當前密碼相同',
        code: 'SAME_PASSWORD'
      });
    }

    // 加密新密碼
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // 更新密碼
    await query(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE user_id = ?',
      [newPasswordHash, req.user.user_id]
    );

    res.json({
      message: '密碼更改成功',
      data: {
        changedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('更改密碼錯誤:', error);
    res.status(500).json({
      error: '更改密碼失敗',
      code: 'CHANGE_PASSWORD_ERROR'
    });
  }
});

// 刪除帳戶
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        error: '請提供密碼以確認刪除',
        code: 'PASSWORD_REQUIRED'
      });
    }

    // 驗證密碼
    const users = await query(
      'SELECT password_hash FROM users WHERE user_id = ?',
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: '用戶不存在',
        code: 'USER_NOT_FOUND'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, users[0].password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({
        error: '密碼不正確',
        code: 'INVALID_PASSWORD'
      });
    }

    // 檢查是否有未完成的預訂
    const activeBookings = await query(
      'SELECT COUNT(*) as count FROM bookings WHERE user_id = ? AND status = "confirmed"',
      [req.user.user_id]
    );

    if (activeBookings[0].count > 0) {
      return res.status(400).json({
        error: '您還有未完成的預訂，無法刪除帳戶',
        code: 'ACTIVE_BOOKINGS_EXIST'
      });
    }

    // 軟刪除用戶（設為非活動狀態）
    await query(
      'UPDATE users SET is_active = FALSE, deleted_at = NOW(), updated_at = NOW() WHERE user_id = ?',
      [req.user.user_id]
    );

    res.json({
      message: '帳戶已成功刪除',
      data: {
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('刪除帳戶錯誤:', error);
    res.status(500).json({
      error: '刪除帳戶失敗',
      code: 'DELETE_ACCOUNT_ERROR'
    });
  }
});

// 獲取用戶活動記錄
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // 這裡可以從多個表格獲取用戶活動
    const activities = await query(
      `SELECT 
         'booking' as type,
         booking_id as id,
         CONCAT('預訂航班 ', f.flight_number) as description,
         b.created_at as timestamp
       FROM bookings b
       JOIN flights f ON b.flight_id = f.flight_id
       WHERE b.user_id = ?
       
       UNION ALL
       
       SELECT 
         'payment' as type,
         payment_id as id,
         CONCAT('付款 $', amount) as description,
         created_at as timestamp
       FROM payments
       WHERE user_id = ?
       
       ORDER BY timestamp DESC
       LIMIT ? OFFSET ?`,
      [req.user.user_id, req.user.user_id, limit, offset]
    );

    res.json({
      message: '用戶活動記錄獲取成功',
      data: {
        activities,
        pagination: {
          page,
          limit
        }
      }
    });

  } catch (error) {
    console.error('獲取用戶活動錯誤:', error);
    res.status(500).json({
      error: '獲取用戶活動失敗',
      code: 'GET_ACTIVITY_ERROR'
    });
  }
});

// 驗證電子郵件
router.post('/verify-email', authenticateToken, async (req, res) => {
  try {
    // 這裡應該包含電子郵件驗證邏輯
    // 例如發送驗證郵件、檢查驗證碼等
    
    res.json({
      message: '電子郵件驗證功能暫未實現',
      data: {
        note: '此功能需要整合郵件服務'
      }
    });

  } catch (error) {
    console.error('驗證電子郵件錯誤:', error);
    res.status(500).json({
      error: '驗證電子郵件失敗',
      code: 'VERIFY_EMAIL_ERROR'
    });
  }
});

module.exports = router;
