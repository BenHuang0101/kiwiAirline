const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

// 插入基礎資料
const seedData = async () => {
  try {
    console.log('🌱 開始插入種子資料...');

    // 插入機場資料
    const airports = [
      ['TPE', '台灣桃園國際機場', '台北', '台灣', 'Asia/Taipei', 25.0797, 121.2342],
      ['TSA', '台北松山機場', '台北', '台灣', 'Asia/Taipei', 25.0694, 121.5519],
      ['KHH', '高雄國際機場', '高雄', '台灣', 'Asia/Taipei', 22.5771, 120.3498],
      ['NRT', '成田國際機場', '東京', '日本', 'Asia/Tokyo', 35.7647, 140.3864],
      ['HND', '東京羽田機場', '東京', '日本', 'Asia/Tokyo', 35.5494, 139.7798],
      ['ICN', '仁川國際機場', '首爾', '韓國', 'Asia/Seoul', 37.4602, 126.4407],
      ['PVG', '上海浦東國際機場', '上海', '中國', 'Asia/Shanghai', 31.1443, 121.8083],
      ['HKG', '香港國際機場', '香港', '香港', 'Asia/Hong_Kong', 22.3089, 113.9148],
      ['SIN', '新加坡樟宜機場', '新加坡', '新加坡', 'Asia/Singapore', 1.3644, 103.9915],
      ['BKK', '蘇凡納布機場', '曼谷', '泰國', 'Asia/Bangkok', 13.6900, 100.7501],
      ['KUL', '吉隆坡國際機場', '吉隆坡', '馬來西亞', 'Asia/Kuala_Lumpur', 2.7456, 101.7072],
      ['MNL', '尼諾伊·阿基諾國際機場', '馬尼拉', '菲律賓', 'Asia/Manila', 14.5086, 121.0194],
      ['LAX', '洛杉磯國際機場', '洛杉磯', '美國', 'America/Los_Angeles', 33.9425, -118.4081],
      ['SFO', '舊金山國際機場', '舊金山', '美國', 'America/Los_Angeles', 37.6213, -122.3790],
      ['LHR', '倫敦希斯洛機場', '倫敦', '英國', 'Europe/London', 51.4700, -0.4543],
      ['CDG', '巴黎戴高樂機場', '巴黎', '法國', 'Europe/Paris', 49.0097, 2.5479],
      ['FRA', '法蘭克福機場', '法蘭克福', '德國', 'Europe/Berlin', 50.0379, 8.5622],
      ['DXB', '杜拜國際機場', '杜拜', '阿聯酋', 'Asia/Dubai', 25.2532, 55.3657],
      ['SYD', '雪梨機場', '雪梨', '澳洲', 'Australia/Sydney', -33.9399, 151.1753],
      ['MEL', '墨爾本機場', '墨爾本', '澳洲', 'Australia/Melbourne', -37.6690, 144.8410]
    ];

    for (const airport of airports) {
      await query(
        `INSERT IGNORE INTO airports (airport_code, airport_name, city, country, timezone, latitude, longitude) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        airport
      );
    }
    console.log('✅ 機場資料插入完成');

    // 插入測試用戶
    const hashedPassword = await bcrypt.hash('123456', 12);
    const users = [
      ['admin@kiwiairline.com', hashedPassword, '系統', '管理員', '0912345678', '1990-01-01', 'M', '台灣', 'A123456789', true, true],
      ['test@example.com', hashedPassword, '測試', '用戶', '0987654321', '1985-05-15', 'F', '台灣', 'B987654321', true, true],
      ['john.doe@email.com', hashedPassword, 'John', 'Doe', '+1234567890', '1988-03-20', 'M', '美國', 'US1234567', true, true]
    ];

    for (const user of users) {
      await query(
        `INSERT IGNORE INTO users (email, password_hash, first_name, last_name, phone_number, date_of_birth, gender, nationality, passport_number, is_active, email_verified) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        user
      );
    }
    console.log('✅ 測試用戶插入完成');

    // 插入航班資料
    const flights = [
      // 台北 → 東京
      ['KW001', 1, 4, '2024-08-01 08:00:00', '2024-08-01 12:00:00', 'A350-900', 300, 280, 12000.00, 'TWD', 'scheduled'],
      ['KW002', 4, 1, '2024-08-01 14:00:00', '2024-08-01 17:00:00', 'A350-900', 300, 290, 11500.00, 'TWD', 'scheduled'],
      ['KW003', 1, 5, '2024-08-02 09:30:00', '2024-08-02 13:30:00', 'B777-300ER', 350, 320, 13500.00, 'TWD', 'scheduled'],
      
      // 台北 → 首爾
      ['KW101', 1, 6, '2024-08-01 10:00:00', '2024-08-01 13:30:00', 'A330-300', 280, 250, 10000.00, 'TWD', 'scheduled'],
      ['KW102', 6, 1, '2024-08-01 15:30:00', '2024-08-01 19:00:00', 'A330-300', 280, 260, 9800.00, 'TWD', 'scheduled'],
      
      // 台北 → 上海
      ['KW201', 1, 7, '2024-08-01 11:00:00', '2024-08-01 13:00:00', 'A321neo', 200, 180, 8000.00, 'TWD', 'scheduled'],
      ['KW202', 7, 1, '2024-08-01 16:00:00', '2024-08-01 18:00:00', 'A321neo', 200, 170, 7800.00, 'TWD', 'scheduled'],
      
      // 台北 → 香港
      ['KW301', 1, 8, '2024-08-01 12:30:00', '2024-08-01 14:30:00', 'A320neo', 180, 160, 6500.00, 'TWD', 'scheduled'],
      ['KW302', 8, 1, '2024-08-01 17:30:00', '2024-08-01 19:30:00', 'A320neo', 180, 150, 6200.00, 'TWD', 'scheduled'],
      
      // 台北 → 新加坡
      ['KW401', 1, 9, '2024-08-01 13:00:00', '2024-08-01 17:30:00', 'B787-9', 290, 270, 15000.00, 'TWD', 'scheduled'],
      ['KW402', 9, 1, '2024-08-01 20:00:00', '2024-08-02 00:30:00', 'B787-9', 290, 280, 14800.00, 'TWD', 'scheduled'],
      
      // 台北 → 曼谷
      ['KW501', 1, 10, '2024-08-01 14:30:00', '2024-08-01 17:30:00', 'A330-200', 260, 240, 12500.00, 'TWD', 'scheduled'],
      ['KW502', 10, 1, '2024-08-01 21:30:00', '2024-08-02 02:30:00', 'A330-200', 260, 230, 12200.00, 'TWD', 'scheduled'],
      
      // 長程航線
      ['KW801', 1, 13, '2024-08-01 23:30:00', '2024-08-01 18:30:00', 'B777-300ER', 350, 320, 45000.00, 'TWD', 'scheduled'], // 台北→洛杉磯
      ['KW901', 1, 15, '2024-08-01 01:30:00', '2024-08-01 07:30:00', 'A350-1000', 350, 330, 35000.00, 'TWD', 'scheduled'], // 台北→倫敦
      ['KW1001', 1, 19, '2024-08-01 22:00:00', '2024-08-02 09:00:00', 'B787-9', 290, 270, 25000.00, 'TWD', 'scheduled'] // 台北→雪梨
    ];

    for (const flight of flights) {
      await query(
        `INSERT IGNORE INTO flights (flight_number, departure_airport_id, arrival_airport_id, departure_datetime, arrival_datetime, aircraft_type, total_seats, available_seats, base_price, currency, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        flight
      );
    }
    console.log('✅ 航班資料插入完成');

    // 插入常見問題
    const faqs = [
      ['booking', '如何查詢我的訂票記錄？', '您可以登入會員帳號後，在「我的訂票記錄」頁面查看所有的訂票資訊。如果您沒有會員帳號，可以使用訂票編號和電子信箱進行查詢。', 1],
      ['booking', '如何取消或更改訂票？', '您可以在訂票記錄中點擊「取消訂票」或「更改訂票」按鈕。請注意，取消或更改可能會產生手續費，詳細規定請參考購票條款。', 2],
      ['payment', '如何申請退款？', '退款申請需要根據您購買的票價類型而定。可退票的訂票可以在線上申請退款，不可退票的訂票則需要符合特殊條件才能申請。', 3],
      ['other', '忘記密碼怎麼辦？', '請在登入頁面點擊「忘記密碼」，輸入您的電子信箱地址，系統會發送重設密碼的連結到您的信箱。', 4],
      ['baggage', '可以攜帶多少行李？', '行李限制依據您的票價類型而定。一般經濟艙可攜帶20公斤托運行李和7公斤手提行李。詳細規定請參考行李政策。', 5],
      ['check_in', '如何線上報到？', '您可以在航班起飛前24小時開始線上報到。請準備好您的訂票編號和護照資訊，在我們的官網或手機APP完成報到手續。', 6]
    ];

    for (const faq of faqs) {
      await query(
        `INSERT IGNORE INTO faqs (category, question, answer, display_order) VALUES (?, ?, ?, ?)`,
        faq
      );
    }
    console.log('✅ 常見問題插入完成');

    console.log('🎉 所有種子資料插入完成！');
  } catch (error) {
    console.error('❌ 插入種子資料失敗:', error);
    throw error;
  }
};

module.exports = { seedData };
