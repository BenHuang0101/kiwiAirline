const mysql = require('mysql2/promise');
require('dotenv').config();

// 資料庫連接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '388062531',
  database: process.env.DB_NAME || 'kiwi_bird_airline',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 創建連接池
const pool = mysql.createPool(dbConfig);

// 測試資料庫連接
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 資料庫連接成功');
    console.log(`📊 連接到資料庫: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ 資料庫連接失敗:', error.message);
    return false;
  }
};

// 執行查詢的輔助函數
const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('資料庫查詢錯誤:', error);
    throw error;
  }
};

// 執行事務的輔助函數
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// 批量執行SQL的輔助函數
const executeBatch = async (sqlStatements) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    for (const sql of sqlStatements) {
      await connection.execute(sql);
    }
    
    await connection.commit();
    console.log('✅ 批量SQL執行成功');
  } catch (error) {
    await connection.rollback();
    console.error('❌ 批量SQL執行失敗:', error);
    throw error;
  } finally {
    connection.release();
  }
};

// 關閉連接池
const closePool = async () => {
  try {
    await pool.end();
    console.log('📊 資料庫連接池已關閉');
  } catch (error) {
    console.error('關閉資料庫連接池錯誤:', error);
  }
};

module.exports = {
  pool,
  query,
  transaction,
  executeBatch,
  testConnection,
  closePool,
  // 新增事務管理函數
  beginTransaction: async () => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    return connection;
  },
  commit: async (connection) => {
    await connection.commit();
    connection.release();
  },
  rollback: async (connection) => {
    try {
      await connection.rollback();
    } finally {
      connection.release();
    }
  }
};
