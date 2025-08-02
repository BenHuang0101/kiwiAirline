// 簡化版資料庫遷移腳本
require('dotenv').config();
const mysql = require('mysql2/promise');

async function createBasicTables() {
  console.log('🚀 開始創建資料表...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '388062531',
    database: process.env.DB_NAME || 'kiwiairline',
    port: process.env.DB_PORT || 3306
  });

  try {
    // 1. 用戶表
    console.log('1️⃣ 創建用戶表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone_number VARCHAR(20),
        date_of_birth DATE,
        gender ENUM('male', 'female', 'other'),
        nationality VARCHAR(100),
        passport_number VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        email_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255),
        reset_password_token VARCHAR(255),
        reset_password_expires TIMESTAMP NULL,
        INDEX idx_email (email),
        INDEX idx_phone (phone_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ 用戶表創建成功');

    // 2. 機場表
    console.log('2️⃣ 創建機場表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS airports (
        airport_id INT PRIMARY KEY AUTO_INCREMENT,
        airport_code CHAR(3) UNIQUE NOT NULL,
        airport_name VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL,
        timezone VARCHAR(50) DEFAULT 'UTC',
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_airport_code (airport_code),
        INDEX idx_city (city),
        INDEX idx_country (country)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ 機場表創建成功');

    // 3. 航班表
    console.log('3️⃣ 創建航班表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS flights (
        flight_id INT PRIMARY KEY AUTO_INCREMENT,
        flight_number VARCHAR(10) NOT NULL,
        departure_airport_id INT NOT NULL,
        arrival_airport_id INT NOT NULL,
        departure_datetime DATETIME NOT NULL,
        arrival_datetime DATETIME NOT NULL,
        base_price DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'TWD',
        available_seats INT NOT NULL DEFAULT 0,
        total_seats INT NOT NULL DEFAULT 180,
        aircraft_type VARCHAR(50),
        status ENUM('scheduled', 'boarding', 'departed', 'arrived', 'cancelled', 'delayed') DEFAULT 'scheduled',
        gate VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_flight_number (flight_number),
        INDEX idx_departure_airport (departure_airport_id),
        INDEX idx_arrival_airport (arrival_airport_id),
        INDEX idx_departure_time (departure_datetime),
        INDEX idx_status (status),
        FOREIGN KEY (departure_airport_id) REFERENCES airports(airport_id),
        FOREIGN KEY (arrival_airport_id) REFERENCES airports(airport_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ 航班表創建成功');

    // 4. 預訂表
    console.log('4️⃣ 創建預訂表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        booking_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        booking_number VARCHAR(20) UNIQUE NOT NULL,
        outbound_flight_id INT NOT NULL,
        return_flight_id INT NULL,
        total_passengers INT NOT NULL DEFAULT 1,
        total_amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'TWD',
        booking_status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
        contact_email VARCHAR(255) NOT NULL,
        contact_phone VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        confirmed_at TIMESTAMP NULL,
        cancelled_at TIMESTAMP NULL,
        INDEX idx_booking_number (booking_number),
        INDEX idx_user_id (user_id),
        INDEX idx_outbound_flight (outbound_flight_id),
        INDEX idx_status (booking_status),
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (outbound_flight_id) REFERENCES flights(flight_id),
        FOREIGN KEY (return_flight_id) REFERENCES flights(flight_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ 預訂表創建成功');

    // 5. 乘客表
    console.log('5️⃣ 創建乘客表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS passengers (
        passenger_id INT PRIMARY KEY AUTO_INCREMENT,
        booking_id INT NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        date_of_birth DATE NOT NULL,
        gender ENUM('male', 'female', 'other') NOT NULL,
        nationality VARCHAR(100) NOT NULL,
        passport_number VARCHAR(50) NOT NULL,
        passport_expiry DATE NOT NULL,
        seat_preference ENUM('window', 'aisle', 'middle', 'none') DEFAULT 'none',
        meal_preference ENUM('regular', 'vegetarian', 'vegan', 'halal', 'kosher', 'none') DEFAULT 'regular',
        special_requests TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_booking_id (booking_id),
        INDEX idx_passport (passport_number),
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ 乘客表創建成功');

    // 6. 付款表
    console.log('6️⃣ 創建付款表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        payment_id INT PRIMARY KEY AUTO_INCREMENT,
        booking_id INT NOT NULL,
        payment_method ENUM('credit_card', 'debit_card', 'bank_transfer', 'paypal') NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'TWD',
        transaction_id VARCHAR(100) UNIQUE NOT NULL,
        payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
        payment_date TIMESTAMP NULL,
        refund_date TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_booking_id (booking_id),
        INDEX idx_transaction_id (transaction_id),
        INDEX idx_status (payment_status),
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ 付款表創建成功');

    // 檢查創建的表格
    console.log('7️⃣ 檢查創建的資料表...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 已創建的資料表:', tables.map(table => Object.values(table)[0]));

    await connection.end();
    console.log('🎉 資料表創建完成！');
    
    return true;
  } catch (error) {
    console.error('❌ 創建資料表失敗:', error.message);
    console.error(error);
    await connection.end();
    return false;
  }
}

// 執行遷移
createBasicTables()
  .then(success => {
    if (success) {
      console.log('\n🚀 資料庫遷移成功！可以啟動後端服務器了');
    } else {
      console.log('\n⚠️ 資料庫遷移失敗');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ 遷移腳本執行失敗:', error);
    process.exit(1);
  });
