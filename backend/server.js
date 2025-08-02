const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./config/database');
// 暫時註釋掉不存在的模組
// const { createTables } = require('./database/migrate');
// const { seedData } = require('./database/seed');

// 導入路由
const authRoutes = require('./routes/auth');
const flightRoutes = require('./routes/flights');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const supportRoutes = require('./routes/support');
const airportRoutes = require('./routes/airports');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3001;

// 中間件設定
app.use(helmet()); // 安全標頭
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://kiwiairline.com', 'https://www.kiwiairline.com']
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 速率限制
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15分鐘
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 限制每個IP 100個請求
  message: {
    error: '請求過於頻繁，請稍後再試',
    code: 'TOO_MANY_REQUESTS'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// 日誌中間件
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// 解析請求
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/airports', airportRoutes);
app.use('/api/users', userRoutes);

// 根路由
app.get('/', (req, res) => {
  res.json({
    message: '歡迎使用奇異鳥航空 API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      flights: '/api/flights',
      bookings: '/api/bookings',
      payments: '/api/payments',
      support: '/api/support',
      airports: '/api/airports',
      users: '/api/users'
    }
  });
});

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({
    error: '找不到請求的資源',
    code: 'NOT_FOUND',
    path: req.originalUrl,
    method: req.method
  });
});

// 全域錯誤處理中間件
app.use((error, req, res, next) => {
  console.error('伺服器錯誤:', error);

  // JWT 錯誤處理
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

  // 資料庫錯誤處理
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: '資料重複',
      code: 'DUPLICATE_ENTRY'
    });
  }

  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      error: '參考的資料不存在',
      code: 'FOREIGN_KEY_CONSTRAINT'
    });
  }

  // 驗證錯誤處理
  if (error.isJoi) {
    return res.status(400).json({
      error: '資料驗證失敗',
      code: 'VALIDATION_ERROR',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  // 預設錯誤處理
  const status = error.status || error.statusCode || 500;
  const message = error.message || '內部伺服器錯誤';

  res.status(status).json({
    error: message,
    code: error.code || 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 優雅關閉處理
const gracefulShutdown = () => {
  console.log('🔄 開始優雅關閉伺服器...');
  
  server.close(() => {
    console.log('✅ HTTP 伺服器已關閉');
    
    // 關閉資料庫連接
    require('./config/database').closePool().then(() => {
      console.log('✅ 資料庫連接已關閉');
      process.exit(0);
    }).catch((error) => {
      console.error('❌ 關閉資料庫連接時發生錯誤:', error);
      process.exit(1);
    });
  });
};

// 監聽關閉信號
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// 未捕獲的異常處理
process.on('uncaughtException', (error) => {
  console.error('未捕獲的異常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未處理的 Promise 拒絕:', reason);
  process.exit(1);
});

// 啟動伺服器
const startServer = async () => {
  try {
    // 測試資料庫連接
    console.log('🔍 測試資料庫連接...');
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('無法連接到資料庫');
    }
    console.log('✅ 資料庫連接成功！');

    // 啟動伺服器
    const server = app.listen(PORT, () => {
      console.log('🚀 奇異鳥航空 API 伺服器啟動成功！');
      console.log(`📍 伺服器位址: http://localhost:${PORT}`);
      console.log(`🌍 環境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 資料庫: kiwi_bird_airline@localhost:3306`);
      console.log('💡 使用 Ctrl+C 停止伺服器');
    });

    // 設定全域 server 變數供優雅關閉使用
    global.server = server;

    return server;
  } catch (error) {
    console.error('❌ 啟動伺服器失敗:', error);
    process.exit(1);
  }
};

// 如果直接執行此檔案則啟動伺服器
if (require.main === module) {
  startServer();
}

module.exports = app;
