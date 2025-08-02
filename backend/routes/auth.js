const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { query } = require('../config/database');

const router = express.Router();

// 資料驗證規則
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': '請輸入有效的電子信箱',
    'any.required': '電子信箱為必填欄位'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': '密碼至少需要6個字元',
    'any.required': '密碼為必填欄位'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': '確認密碼必須與密碼相同',
    'any.required': '確認密碼為必填欄位'
  }),
  firstName: Joi.string().min(1).max(100).required().messages({
    'string.min': '姓氏不能為空',
    'string.max': '姓氏不能超過100個字元',
    'any.required': '姓氏為必填欄位'
  }),
  lastName: Joi.string().min(1).max(100).required().messages({
    'string.min': '名字不能為空',
    'string.max': '名字不能超過100個字元',
    'any.required': '名字為必填欄位'
  }),
  phoneNumber: Joi.string().pattern(/^[0-9+\-\s\(\)]+$/).allow('').messages({
    'string.pattern.base': '電話號碼格式不正確'
  }),
  agreeToTerms: Joi.boolean().valid(true).required().messages({
    'any.only': '必須同意服務條款',
    'any.required': '必須同意服務條款'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': '請輸入有效的電子信箱',
    'any.required': '電子信箱為必填欄位'
  }),
  password: Joi.string().required().messages({
    'any.required': '密碼為必填欄位'
  }),
  rememberMe: Joi.boolean().default(false)
});

// JWT Token 生成
const generateTokens = (userId) => {
  const payload = { userId };
  
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
  
  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  
  return { accessToken, refreshToken };
};

// 用戶註冊
router.post('/register', async (req, res) => {
  try {
    // 驗證請求資料
    const { error, value } = registerSchema.validate(req.body);
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

    const { email, password, firstName, lastName, phoneNumber } = value;

    // 檢查電子信箱是否已存在
    const existingUsers = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        error: '此電子信箱已被註冊',
        code: 'EMAIL_ALREADY_EXISTS'
      });
    }

    // 加密密碼
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 創建用戶
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone_number) 
       VALUES (?, ?, ?, ?, ?)`,
      [email, passwordHash, firstName, lastName, phoneNumber || null]
    );

    // 生成 JWT Token
    const { accessToken, refreshToken } = generateTokens(result.insertId);

    res.status(201).json({
      success: true,
      message: '註冊成功',
      data: {
        user: {
          id: result.insertId,
          email,
          firstName,
          lastName,
          phoneNumber: phoneNumber || null
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('註冊錯誤:', error);
    res.status(500).json({
      error: '註冊失敗，請稍後再試',
      code: 'REGISTRATION_ERROR'
    });
  }
});

// 用戶登入
router.post('/login', async (req, res) => {
  try {
    // 驗證請求資料
    const { error, value } = loginSchema.validate(req.body);
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

    const { email, password } = value;

    // 查詢用戶
    const users = await query(
      'SELECT id, email, password_hash, first_name, last_name, phone_number, is_active FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: '電子信箱或密碼錯誤',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const user = users[0];

    // 檢查用戶是否啟用
    if (!user.is_active) {
      return res.status(401).json({
        error: '帳戶已被停用',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // 驗證密碼
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: '電子信箱或密碼錯誤',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // 更新最後登入時間
    await query(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [user.id]
    );

    // 生成 JWT Token
    const { accessToken, refreshToken } = generateTokens(user.id);

    res.json({
      success: true,
      message: '登入成功',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phoneNumber: user.phone_number
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('登入錯誤:', error);
    res.status(500).json({
      error: '登入失敗，請稍後再試',
      code: 'LOGIN_ERROR'
    });
  }
});

// 用戶登出
router.post('/logout', (req, res) => {
  // 在實際應用中，這裡可能需要將 token 加入黑名單
  res.json({
    success: true,
    message: '登出成功'
  });
});

// 驗證 Token
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: '缺少認證令牌',
        code: 'MISSING_TOKEN'
      });
    }

    // 驗證 JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 查詢用戶資訊
    const users = await query(
      'SELECT id, email, first_name, last_name, phone_number FROM users WHERE id = ? AND is_active = TRUE',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: '用戶不存在或已被停用',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: '驗證成功',
      data: {
        user: {
          id: users[0].id,
          email: users[0].email,
          firstName: users[0].first_name,
          lastName: users[0].last_name,
          phoneNumber: users[0].phone_number
        }
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: '無效的認證令牌',
        code: 'INVALID_TOKEN'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: '認證令牌已過期',
        code: 'TOKEN_EXPIRED'
      });
    }

    console.error('Token驗證錯誤:', error);
    res.status(500).json({
      error: '驗證失敗',
      code: 'VERIFICATION_ERROR'
    });
  }
});

module.exports = router;
