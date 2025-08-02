// 測試資料庫連接的簡單腳本
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testDatabase() {
  console.log('🔍 測試資料庫連接...');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root', 
    password: process.env.DB_PASSWORD || '388062531',
    port: process.env.DB_PORT || 3306
  };
  
  console.log('📋 連接配置:', {
    host: config.host,
    user: config.user,
    password: '***隱藏***',
    port: config.port
  });

  try {
    // 1. 測試基本連接
    console.log('1️⃣ 測試基本 MySQL 連接...');
    const connection = await mysql.createConnection(config);
    console.log('✅ MySQL 連接成功');

    // 2. 檢查現有資料庫
    console.log('2️⃣ 檢查現有資料庫...');
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('📋 現有資料庫:', databases.map(db => db.Database));

    // 3. 檢查目標資料庫是否存在
    const targetDb = 'kiwiairline';
    const dbExists = databases.some(db => db.Database === targetDb);
    
    if (!dbExists) {
      console.log('3️⃣ 創建資料庫 kiwiairline...');
      await connection.execute(`CREATE DATABASE ${targetDb} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log('✅ 資料庫創建成功');
    } else {
      console.log('✅ 資料庫 kiwiairline 已存在');
    }

    // 4. 重新連接到目標資料庫
    await connection.end();
    const dbConnection = await mysql.createConnection({
      ...config,
      database: targetDb
    });
    console.log('✅ 成功連接到資料庫 kiwiairline');

    // 5. 檢查現有資料表
    console.log('4️⃣ 檢查現有資料表...');
    const [tables] = await dbConnection.execute('SHOW TABLES');
    console.log('📋 現有資料表:', tables.map(table => Object.values(table)[0]));

    await dbConnection.end();
    console.log('🎉 資料庫測試完成！');
    
    return true;
  } catch (error) {
    console.error('❌ 資料庫連接失敗:', error.message);
    console.error('💡 錯誤詳情:', error);
    return false;
  }
}

// 執行測試
testDatabase()
  .then(success => {
    if (success) {
      console.log('\n🚀 可以繼續執行遷移腳本');
    } else {
      console.log('\n⚠️  請檢查 MySQL 服務和連接配置');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ 測試腳本執行失敗:', error);
    process.exit(1);
  });
