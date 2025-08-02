// 簡單的測試服務器
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// 基本中間件
app.use(cors());
app.use(express.json());

// 測試路由
app.get('/', (req, res) => {
  res.json({
    message: '🎉 奇異鳥航空後端 API 服務器運行中！',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '服務器健康狀態良好'
  });
});

// 啟動服務器
app.listen(PORT, () => {
  console.log('🚀 奇異鳥航空後端 API 服務器已啟動！');
  console.log(`📡 服務器運行在: http://localhost:${PORT}`);
  console.log(`💚 健康檢查: http://localhost:${PORT}/api/health`);
  console.log('=====================================');
});

module.exports = app;
