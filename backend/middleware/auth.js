const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// JWT 認證中間件
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: '缺少認證令牌',
        code: 'MISSING_TOKEN'
      });
    }

    // 驗證 JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查詢用戶資訊
    const users = await query(
      'SELECT id, email, first_name, last_name, is_active FROM users WHERE id = ? AND is_active = TRUE',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: '用戶不存在或已被停用',
        code: 'USER_NOT_FOUND'
      });
    }

    // 將用戶資訊添加到請求對象
    req.user = users[0];
    next();
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

    console.error('認證中間件錯誤:', error);
    return res.status(500).json({
      error: '認證處理失敗',
      code: 'AUTH_ERROR'
    });
  }
};

// 可選認證中間件（用戶可能已登入也可能未登入）
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const users = await query(
        'SELECT id, email, first_name, last_name, is_active FROM users WHERE id = ? AND is_active = TRUE',
        [decoded.userId]
      );

      if (users.length > 0) {
        req.user = users[0];
      }
    }

    next();
  } catch (error) {
    // 可選認證失敗時不阻止請求繼續
    next();
  }
};

// 管理員權限檢查中間件
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: '需要認證',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    // 檢查是否為管理員（可以根據需要調整邏輯）
    if (req.user.email !== 'admin@kiwiairline.com') {
      return res.status(403).json({
        error: '需要管理員權限',
        code: 'ADMIN_REQUIRED'
      });
    }

    next();
  } catch (error) {
    console.error('管理員權限檢查錯誤:', error);
    return res.status(500).json({
      error: '權限檢查失敗',
      code: 'PERMISSION_ERROR'
    });
  }
};

// 記錄用戶操作的中間件
const logUserAction = (action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user ? req.user.user_id : null;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      // 記錄操作日誌
      await query(
        `INSERT INTO system_logs (user_id, action, ip_address, user_agent) 
         VALUES (?, ?, ?, ?)`,
        [userId, action, ipAddress, userAgent]
      );

      next();
    } catch (error) {
      console.error('記錄用戶操作錯誤:', error);
      // 日誌記錄失敗不應該阻止正常流程
      next();
    }
  };
};

// 驗證用戶擁有資源的權限
const checkResourceOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.user_id;
      const resourceId = req.params.id;

      let sql = '';
      let params = [resourceId, userId];

      switch (resourceType) {
        case 'booking':
          sql = 'SELECT booking_id FROM bookings WHERE booking_id = ? AND user_id = ?';
          break;
        case 'payment':
          sql = `SELECT p.payment_id FROM payments p 
                 JOIN bookings b ON p.booking_id = b.booking_id 
                 WHERE p.payment_id = ? AND b.user_id = ?`;
          break;
        default:
          return res.status(400).json({
            error: '不支援的資源類型',
            code: 'INVALID_RESOURCE_TYPE'
          });
      }

      const results = await query(sql, params);

      if (results.length === 0) {
        return res.status(403).json({
          error: '您沒有權限存取此資源',
          code: 'ACCESS_DENIED'
        });
      }

      next();
    } catch (error) {
      console.error('資源權限檢查錯誤:', error);
      return res.status(500).json({
        error: '權限檢查失敗',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  logUserAction,
  checkResourceOwnership
};
