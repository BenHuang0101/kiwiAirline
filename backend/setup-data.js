// 創建支援資料表和初始數據
require('dotenv').config();
const mysql = require('mysql2/promise');

async function createSupportTablesAndData() {
  console.log('🚀 創建支援資料表和初始數據...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '388062531',
    database: process.env.DB_NAME || 'kiwiairline',
    port: process.env.DB_PORT || 3306
  });

  try {
    // 1. 創建常見問題表
    console.log('1️⃣ 創建常見問題表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS faqs (
        faq_id INT PRIMARY KEY AUTO_INCREMENT,
        category ENUM('booking', 'cancellation', 'refund', 'flight_info', 'special_assistance', 'baggage', 'technical', 'feedback', 'other') NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        display_order INT DEFAULT 0,
        is_featured BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        view_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_featured (is_featured),
        INDEX idx_active (is_active),
        INDEX idx_display_order (display_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ 常見問題表創建成功');

    // 2. 創建聯絡請求表
    console.log('2️⃣ 創建聯絡請求表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS contact_requests (
        request_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NULL,
        inquiry_number VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        subject VARCHAR(200) NOT NULL,
        category ENUM('booking', 'cancellation', 'refund', 'flight_info', 'special_assistance', 'baggage', 'technical', 'feedback', 'other') NOT NULL,
        message TEXT NOT NULL,
        booking_number VARCHAR(20),
        priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
        status ENUM('new', 'in_progress', 'waiting_for_customer', 'resolved', 'closed') DEFAULT 'new',
        admin_response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        responded_at TIMESTAMP NULL,
        resolved_at TIMESTAMP NULL,
        INDEX idx_inquiry_number (inquiry_number),
        INDEX idx_user_id (user_id),
        INDEX idx_category (category),
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ 聯絡請求表創建成功');

    // 3. 創建座位表
    console.log('3️⃣ 創建座位表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS seats (
        seat_id INT PRIMARY KEY AUTO_INCREMENT,
        flight_id INT NOT NULL,
        seat_number VARCHAR(5) NOT NULL,
        seat_class ENUM('economy', 'premium_economy', 'business', 'first') DEFAULT 'economy',
        is_available BOOLEAN DEFAULT TRUE,
        is_window BOOLEAN DEFAULT FALSE,
        is_aisle BOOLEAN DEFAULT FALSE,
        extra_cost DECIMAL(8, 2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_flight_id (flight_id),
        INDEX idx_seat_number (seat_number),
        INDEX idx_available (is_available),
        INDEX idx_class (seat_class),
        UNIQUE KEY unique_flight_seat (flight_id, seat_number),
        FOREIGN KEY (flight_id) REFERENCES flights(flight_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ 座位表創建成功');

    // 4. 插入機場初始數據
    console.log('4️⃣ 插入機場初始數據...');
    const airports = [
      ['TPE', '桃園國際機場', '台北', '台灣', 'Asia/Taipei', 25.0777, 121.2328],
      ['TSA', '台北松山機場', '台北', '台灣', 'Asia/Taipei', 25.0694, 121.5519],
      ['KHH', '高雄國際機場', '高雄', '台灣', 'Asia/Taipei', 22.5771, 120.3498],
      ['NRT', '成田國際機場', '東京', '日本', 'Asia/Tokyo', 35.7647, 140.3864],
      ['HND', '羽田機場', '東京', '日本', 'Asia/Tokyo', 35.5494, 139.7798],
      ['ICN', '仁川國際機場', '首爾', '南韓', 'Asia/Seoul', 37.4602, 126.4407],
      ['HKG', '香港國際機場', '香港', '香港', 'Asia/Hong_Kong', 22.3080, 113.9185],
      ['SIN', '樟宜機場', '新加坡', '新加坡', 'Asia/Singapore', 1.3644, 103.9915],
      ['BKK', '蘇凡納布機場', '曼谷', '泰國', 'Asia/Bangkok', 13.6900, 100.7501],
      ['KUL', '吉隆坡國際機場', '吉隆坡', '馬來西亞', 'Asia/Kuala_Lumpur', 2.7456, 101.7072],
      ['LAX', '洛杉磯國際機場', '洛杉磯', '美國', 'America/Los_Angeles', 33.9425, -118.4081],
      ['SFO', '舊金山國際機場', '舊金山', '美國', 'America/Los_Angeles', 37.6213, -122.3790],
      ['LHR', '希斯洛機場', '倫敦', '英國', 'Europe/London', 51.4700, -0.4543],
      ['CDG', '戴高樂機場', '巴黎', '法國', 'Europe/Paris', 49.0097, 2.5479],
      ['FRA', '法蘭克福機場', '法蘭克福', '德國', 'Europe/Berlin', 50.0379, 8.5622]
    ];

    for (const airport of airports) {
      await connection.execute(`
        INSERT IGNORE INTO airports (airport_code, airport_name, city, country, timezone, latitude, longitude)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, airport);
    }
    console.log('✅ 機場數據插入成功');

    // 5. 插入常見問題初始數據
    console.log('5️⃣ 插入常見問題初始數據...');
    const faqs = [
      ['booking', '如何預訂機票？', '您可以在我們的網站上搜尋航班，選擇合適的航班後填寫乘客資訊並完成付款即可。', 1, true],
      ['booking', '可以為他人預訂機票嗎？', '可以，您可以在預訂時填寫其他乘客的資訊。請確保所有資訊準確無誤。', 2, true],
      ['booking', '預訂後可以修改乘客資訊嗎？', '部分資訊可以修改，如聯絡方式。姓名等重要資訊修改可能需要額外費用，請聯絡客服。', 3, false],
      ['cancellation', '如何取消機票？', '登入您的帳戶，在「我的預訂」中找到要取消的訂單，點擊取消即可。請注意取消政策。', 1, true],
      ['cancellation', '取消機票需要手續費嗎？', '根據票種和取消時間，可能會收取手續費。詳細規定請查看訂票條款。', 2, true],
      ['refund', '退款需要多久時間？', '退款通常需要3-5個工作日處理，實際到帳時間視您的銀行而定。', 1, true],
      ['refund', '退款金額如何計算？', '退款金額=票價-手續費-其他費用。具體金額會在退款時顯示。', 2, false],
      ['flight_info', '如何查詢航班狀態？', '您可以在官網首頁輸入航班號查詢即時狀態，或在「我的預訂」中查看。', 1, true],
      ['flight_info', '航班延誤或取消怎麼辦？', '我們會主動通知您並協助改簽或退款。您也可以聯絡客服處理。', 2, true],
      ['baggage', '行李規定是什麼？', '經濟艙免費托運行李23kg，手提行李7kg。超重需額外付費。', 1, true],
      ['baggage', '危險物品可以帶上飛機嗎？', '嚴禁攜帶易燃易爆等危險物品。詳細清單請查看安全須知。', 2, false],
      ['special_assistance', '需要特殊協助如何申請？', '預訂時可選擇特殊需求，或提前48小時聯絡客服安排。', 1, false],
      ['technical', '網站無法正常使用怎麼辦？', '請嘗試清除瀏覽器快取或使用其他瀏覽器。如仍有問題請聯絡技術支援。', 1, false]
    ];

    for (const faq of faqs) {
      await connection.execute(`
        INSERT INTO faqs (category, question, answer, display_order, is_featured)
        VALUES (?, ?, ?, ?, ?)
      `, faq);
    }
    console.log('✅ 常見問題數據插入成功');

    // 6. 插入範例航班數據
    console.log('6️⃣ 插入範例航班數據...');
    
    // 先獲取機場ID
    const airportIds = await connection.execute(`
      SELECT airport_id, airport_code FROM airports 
      WHERE airport_code IN ('TPE', 'NRT', 'ICN', 'HKG', 'SIN', 'BKK')
    `);
    
    const airportMap = {};
    airportIds[0].forEach(airport => {
      airportMap[airport.airport_code] = airport.airport_id;
    });

    // 創建一些範例航班（未來7天）
    const flights = [
      // TPE to NRT
      ['KW101', airportMap['TPE'], airportMap['NRT'], '2025-07-19 08:00:00', '2025-07-19 12:30:00', 12500, 'TWD', 150, 180, 'A320', 'A1'],
      ['KW102', airportMap['NRT'], airportMap['TPE'], '2025-07-19 14:00:00', '2025-07-19 17:30:00', 12500, 'TWD', 145, 180, 'A320', 'B2'],
      
      // TPE to ICN
      ['KW201', airportMap['TPE'], airportMap['ICN'], '2025-07-20 09:00:00', '2025-07-20 12:45:00', 8500, 'TWD', 160, 180, 'B737', 'C3'],
      ['KW202', airportMap['ICN'], airportMap['TPE'], '2025-07-20 15:00:00', '2025-07-20 18:30:00', 8500, 'TWD', 155, 180, 'B737', 'D4'],
      
      // TPE to HKG
      ['KW301', airportMap['TPE'], airportMap['HKG'], '2025-07-21 10:00:00', '2025-07-21 12:00:00', 6500, 'TWD', 170, 180, 'A321', 'E5'],
      ['KW302', airportMap['HKG'], airportMap['TPE'], '2025-07-21 16:00:00', '2025-07-21 18:15:00', 6500, 'TWD', 165, 180, 'A321', 'F6'],
      
      // TPE to SIN
      ['KW401', airportMap['TPE'], airportMap['SIN'], '2025-07-22 11:00:00', '2025-07-22 15:45:00', 15500, 'TWD', 140, 180, 'B787', 'G7'],
      ['KW402', airportMap['SIN'], airportMap['TPE'], '2025-07-22 18:00:00', '2025-07-22 22:45:00', 15500, 'TWD', 135, 180, 'B787', 'H8'],
      
      // TPE to BKK
      ['KW501', airportMap['TPE'], airportMap['BKK'], '2025-07-23 12:00:00', '2025-07-23 15:30:00', 11500, 'TWD', 175, 180, 'A330', 'I9'],
      ['KW502', airportMap['BKK'], airportMap['TPE'], '2025-07-23 19:00:00', '2025-07-23 23:45:00', 11500, 'TWD', 170, 180, 'A330', 'J10']
    ];

    for (const flight of flights) {
      await connection.execute(`
        INSERT INTO flights (
          flight_number, departure_airport_id, arrival_airport_id, 
          departure_datetime, arrival_datetime, base_price, currency,
          available_seats, total_seats, aircraft_type, gate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, flight);
    }
    console.log('✅ 航班數據插入成功');

    // 檢查創建的表格和數據
    console.log('7️⃣ 檢查數據庫狀態...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 資料表:', tables.map(table => Object.values(table)[0]));

    const [airportCount] = await connection.execute('SELECT COUNT(*) as count FROM airports');
    const [flightCount] = await connection.execute('SELECT COUNT(*) as count FROM flights');
    const [faqCount] = await connection.execute('SELECT COUNT(*) as count FROM faqs');

    console.log(`📊 機場數量: ${airportCount[0].count}`);
    console.log(`📊 航班數量: ${flightCount[0].count}`);
    console.log(`📊 FAQ數量: ${faqCount[0].count}`);

    await connection.end();
    console.log('🎉 支援資料表和初始數據創建完成！');
    
    return true;
  } catch (error) {
    console.error('❌ 創建支援資料失敗:', error.message);
    console.error(error);
    await connection.end();
    return false;
  }
}

// 執行創建
createSupportTablesAndData()
  .then(success => {
    if (success) {
      console.log('\n🚀 所有後端資料準備完成！可以啟動服務器了');
    } else {
      console.log('\n⚠️ 資料準備失敗');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ 腳本執行失敗:', error);
    process.exit(1);
  });
