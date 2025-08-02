const { executeBatch } = require('../config/database');

// 根據規格文件創建所有資料表
const createTables = async () => {
  const sqlStatements = [
    // 用戶表
    `CREATE TABLE IF NOT EXISTS users (
      user_id INT PRIMARY KEY AUTO_INCREMENT,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      phone_number VARCHAR(20),
      date_of_birth DATE,
      gender ENUM('M', 'F', 'Other'),
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
    )`,

    // 機場表
    `CREATE TABLE IF NOT EXISTS airports (
      airport_id INT PRIMARY KEY AUTO_INCREMENT,
      airport_code VARCHAR(10) UNIQUE NOT NULL,
      airport_name VARCHAR(255) NOT NULL,
      city VARCHAR(100) NOT NULL,
      country VARCHAR(100) NOT NULL,
      timezone VARCHAR(50),
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_code (airport_code),
      INDEX idx_city (city),
      INDEX idx_country (country)
    )`,

    // 航班表
    `CREATE TABLE IF NOT EXISTS flights (
      flight_id INT PRIMARY KEY AUTO_INCREMENT,
      flight_number VARCHAR(20) NOT NULL,
      departure_airport_id INT NOT NULL,
      arrival_airport_id INT NOT NULL,
      departure_datetime DATETIME NOT NULL,
      arrival_datetime DATETIME NOT NULL,
      aircraft_type VARCHAR(50),
      total_seats INT NOT NULL DEFAULT 180,
      available_seats INT NOT NULL DEFAULT 180,
      base_price DECIMAL(10, 2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'TWD',
      status ENUM('scheduled', 'delayed', 'cancelled', 'completed') DEFAULT 'scheduled',
      gate VARCHAR(10),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (departure_airport_id) REFERENCES airports(airport_id),
      FOREIGN KEY (arrival_airport_id) REFERENCES airports(airport_id),
      INDEX idx_flight_number (flight_number),
      INDEX idx_departure (departure_airport_id, departure_datetime),
      INDEX idx_arrival (arrival_airport_id, arrival_datetime),
      INDEX idx_datetime (departure_datetime, arrival_datetime),
      INDEX idx_status (status)
    )`,

    // 訂單表
    `CREATE TABLE IF NOT EXISTS bookings (
      booking_id INT PRIMARY KEY AUTO_INCREMENT,
      booking_reference VARCHAR(20) UNIQUE NOT NULL,
      user_id INT NOT NULL,
      flight_id INT NOT NULL,
      booking_status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
      total_amount DECIMAL(10, 2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'TWD',
      contact_email VARCHAR(255) NOT NULL,
      contact_phone VARCHAR(20),
      special_requests TEXT,
      booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (flight_id) REFERENCES flights(flight_id),
      INDEX idx_reference (booking_reference),
      INDEX idx_user (user_id),
      INDEX idx_flight (flight_id),
      INDEX idx_status (booking_status),
      INDEX idx_date (booking_date)
    )`,

    // 乘客表
    `CREATE TABLE IF NOT EXISTS passengers (
      passenger_id INT PRIMARY KEY AUTO_INCREMENT,
      booking_id INT NOT NULL,
      passenger_type ENUM('adult', 'child', 'infant') DEFAULT 'adult',
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      date_of_birth DATE NOT NULL,
      gender ENUM('M', 'F', 'Other') NOT NULL,
      nationality VARCHAR(100) NOT NULL,
      passport_number VARCHAR(50) NOT NULL,
      passport_expiry DATE,
      seat_number VARCHAR(10),
      meal_preference VARCHAR(50),
      special_assistance TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
      INDEX idx_booking (booking_id),
      INDEX idx_passport (passport_number),
      INDEX idx_seat (seat_number)
    )`,

    // 付款表
    `CREATE TABLE IF NOT EXISTS payments (
      payment_id INT PRIMARY KEY AUTO_INCREMENT,
      booking_id INT NOT NULL,
      payment_method ENUM('credit_card', 'atm_transfer', 'bank_transfer') NOT NULL,
      payment_status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
      amount DECIMAL(10, 2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'TWD',
      transaction_id VARCHAR(100),
      payment_gateway VARCHAR(50),
      card_last_four VARCHAR(4),
      payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP NULL,
      refunded_at TIMESTAMP NULL,
      refund_amount DECIMAL(10, 2) DEFAULT 0,
      payment_details JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
      INDEX idx_booking (booking_id),
      INDEX idx_status (payment_status),
      INDEX idx_method (payment_method),
      INDEX idx_transaction (transaction_id)
    )`,

    // 客服聯繫表
    `CREATE TABLE IF NOT EXISTS contact_requests (
      request_id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NULL,
      name VARCHAR(200) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      category ENUM('booking', 'payment', 'refund', 'flight_change', 'check_in', 'baggage', 'special_needs', 'complaint', 'other') NOT NULL,
      booking_reference VARCHAR(20),
      subject VARCHAR(500) NOT NULL,
      message TEXT NOT NULL,
      priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
      status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
      assigned_to INT NULL,
      subscribe_newsletter BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      resolved_at TIMESTAMP NULL,
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      INDEX idx_user (user_id),
      INDEX idx_category (category),
      INDEX idx_status (status),
      INDEX idx_priority (priority),
      INDEX idx_booking_ref (booking_reference)
    )`,

    // 常見問題表
    `CREATE TABLE IF NOT EXISTS faqs (
      faq_id INT PRIMARY KEY AUTO_INCREMENT,
      category VARCHAR(100) NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      display_order INT DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_category (category),
      INDEX idx_active (is_active),
      INDEX idx_order (display_order)
    )`,

    // 系統日誌表
    `CREATE TABLE IF NOT EXISTS system_logs (
      log_id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NULL,
      action VARCHAR(100) NOT NULL,
      table_name VARCHAR(100),
      record_id INT,
      old_values JSON,
      new_values JSON,
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      INDEX idx_user (user_id),
      INDEX idx_action (action),
      INDEX idx_table (table_name),
      INDEX idx_date (created_at)
    )`,

    // 郵件記錄表
    `CREATE TABLE IF NOT EXISTS email_logs (
      email_id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NULL,
      booking_id INT NULL,
      email_type VARCHAR(50) NOT NULL,
      recipient_email VARCHAR(255) NOT NULL,
      subject VARCHAR(500) NOT NULL,
      status ENUM('pending', 'sent', 'failed', 'bounced') DEFAULT 'pending',
      sent_at TIMESTAMP NULL,
      error_message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
      INDEX idx_user (user_id),
      INDEX idx_booking (booking_id),
      INDEX idx_type (email_type),
      INDEX idx_status (status)
    )`,

    // 座位表
    `CREATE TABLE IF NOT EXISTS seats (
      seat_id INT PRIMARY KEY AUTO_INCREMENT,
      flight_id INT NOT NULL,
      seat_number VARCHAR(10) NOT NULL,
      seat_class ENUM('economy', 'premium_economy', 'business', 'first') DEFAULT 'economy',
      is_available BOOLEAN DEFAULT TRUE,
      is_window BOOLEAN DEFAULT FALSE,
      is_aisle BOOLEAN DEFAULT FALSE,
      extra_cost DECIMAL(8, 2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (flight_id) REFERENCES flights(flight_id),
      UNIQUE KEY unique_flight_seat (flight_id, seat_number),
      INDEX idx_flight (flight_id),
      INDEX idx_available (is_available),
      INDEX idx_class (seat_class)
    )`
  ];

  try {
    await executeBatch(sqlStatements);
    console.log('✅ 所有資料表創建成功');
  } catch (error) {
    console.error('❌ 創建資料表失敗:', error);
    throw error;
  }
};

module.exports = { createTables };
