-- 奇異鳥航空訂票網站 - 測試資料插入腳本
-- 按照資料庫設計文件插入測試資料

USE kiwi_bird_airline;

-- 插入測試用戶資料
INSERT INTO users (id, first_name, last_name, email, password_hash, phone_number, is_active) VALUES
(UUID(), '王', '小明', 'ming.wang@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewmyOSW3E1YOUIqe', '0912345678', TRUE),
(UUID(), '李', '小華', 'hua.lee@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewmyOSW3E1YOUIqe', '0987654321', TRUE),
(UUID(), '張', '美玲', 'mei.zhang@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewmyOSW3E1YOUIqe', '0956789123', TRUE),
(UUID(), '陳', '大偉', 'david.chen@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewmyOSW3E1YOUIqe', '0923456789', TRUE),
(UUID(), '林', '雅雯', 'yawen.lin@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewmyOSW3E1YOUIqe', '0934567890', TRUE);

-- 插入航班資料（使用正確的設計欄位）
INSERT INTO flights (id, flight_number, departure_airport, arrival_airport, departure_time, arrival_time, aircraft_model, total_seats, available_seats, base_price, currency, status, gate, terminal) VALUES
(UUID(), 'KW001', 'TPE', 'KIX', '2025-07-25 08:30:00', '2025-07-25 12:20:00', 'Airbus A320', 180, 150, 12800.00, 'TWD', 'scheduled', 'A12', 'T1'),
(UUID(), 'KW002', 'KIX', 'TPE', '2025-07-25 14:00:00', '2025-07-25 17:30:00', 'Airbus A320', 180, 165, 13200.00, 'TWD', 'scheduled', 'B5', 'T1'),
(UUID(), 'KW003', 'TPE', 'NRT', '2025-07-26 09:15:00', '2025-07-26 13:45:00', 'Boeing 737-800', 189, 120, 15600.00, 'TWD', 'scheduled', 'C8', 'T2'),
(UUID(), 'KW004', 'NRT', 'TPE', '2025-07-26 15:30:00', '2025-07-26 18:45:00', 'Boeing 737-800', 189, 145, 16200.00, 'TWD', 'scheduled', 'D3', 'T1'),
(UUID(), 'KW005', 'TPE', 'ICN', '2025-07-27 07:45:00', '2025-07-27 11:15:00', 'Airbus A321', 220, 180, 9800.00, 'TWD', 'scheduled', 'A5', 'T1'),
(UUID(), 'KW006', 'ICN', 'TPE', '2025-07-27 13:20:00', '2025-07-27 16:40:00', 'Airbus A321', 220, 195, 10200.00, 'TWD', 'scheduled', 'B12', 'T1'),
(UUID(), 'KW007', 'TPE', 'SIN', '2025-07-28 10:30:00', '2025-07-28 15:10:00', 'Boeing 777-300ER', 396, 250, 18900.00, 'TWD', 'scheduled', 'D8', 'T2'),
(UUID(), 'KW008', 'SIN', 'TPE', '2025-07-28 17:45:00', '2025-07-28 22:30:00', 'Boeing 777-300ER', 396, 280, 19500.00, 'TWD', 'scheduled', 'A15', 'T3'),
(UUID(), 'KW009', 'TPE', 'BKK', '2025-07-29 11:20:00', '2025-07-29 14:35:00', 'Airbus A330', 277, 200, 14200.00, 'TWD', 'scheduled', 'C4', 'T2'),
(UUID(), 'KW010', 'BKK', 'TPE', '2025-07-29 16:15:00', '2025-07-29 21:25:00', 'Airbus A330', 277, 230, 14800.00, 'TWD', 'scheduled', 'B7', 'T2');

-- 插入乘客資料
INSERT INTO passengers (id, first_name, last_name, passport_number, date_of_birth, nationality, gender, email, phone_number) VALUES
(UUID(), '王', '小明', 'A123456789', '1990-05-15', 'TW', 'M', 'ming.wang@email.com', '0912345678'),
(UUID(), '李', '小華', 'B987654321', '1985-08-22', 'TW', 'F', 'hua.lee@email.com', '0987654321'),
(UUID(), '張', '美玲', 'C456789123', '1992-03-10', 'TW', 'F', 'mei.zhang@email.com', '0956789123'),
(UUID(), '陳', '大偉', 'D789123456', '1988-11-07', 'TW', 'M', 'david.chen@email.com', '0923456789'),
(UUID(), '林', '雅雯', 'E321654987', '1995-12-25', 'TW', 'F', 'yawen.lin@email.com', '0934567890'),
(UUID(), 'John', 'Smith', 'US1234567', '1987-06-18', 'US', 'M', 'john.smith@email.com', '0945678901'),
(UUID(), 'Mary', 'Johnson', 'US7654321', '1991-09-03', 'US', 'F', 'mary.johnson@email.com', '0967891234'),
(UUID(), 'Tanaka', 'Hiroshi', 'JP9876543', '1983-04-14', 'JP', 'M', 'hiroshi.tanaka@email.com', '0978912345'),
(UUID(), 'Kim', 'MinJung', 'KR5432167', '1994-01-28', 'KR', 'F', 'minjung.kim@email.com', '0989123456'),
(UUID(), 'Wong', 'KaiMing', 'HK1357924', '1989-10-12', 'HK', 'M', 'kaiming.wong@email.com', '0991234567');

-- 插入 FAQ 資料
INSERT INTO faq (id, category, question, answer, tags, sort_order, is_active, view_count) VALUES
(UUID(), 'booking', '如何線上預訂機票？', '您可以在我們的網站首頁選擇出發地、目的地、日期後搜尋航班，選擇合適的航班後填寫乘客資訊即可完成預訂。', '["預訂", "線上", "機票"]', 1, TRUE, 0),
(UUID(), 'booking', '可以預訂多少位乘客的機票？', '每次預訂最多可以為9位乘客預訂機票。', '["預訂", "乘客", "人數限制"]', 2, TRUE, 0),
(UUID(), 'booking', '預訂後多久會收到確認信？', '預訂完成並付款成功後，您將立即收到電子機票確認信。', '["確認信", "電子機票", "預訂"]', 3, TRUE, 0),
(UUID(), 'payment', '接受哪些付款方式？', '我們接受信用卡、金融卡、ATM轉帳和銀行轉帳等付款方式。', '["付款", "信用卡", "轉帳"]', 4, TRUE, 0),
(UUID(), 'payment', '付款安全嗎？', '是的，我們使用業界標準的加密技術保護您的付款資訊。', '["付款", "安全", "加密"]', 5, TRUE, 0),
(UUID(), 'flight', '可以選擇座位嗎？', '是的，在預訂過程中您可以選擇偏好的座位（部分座位可能需要額外費用）。', '["座位", "選擇", "偏好"]', 6, TRUE, 0),
(UUID(), 'flight', '航班延誤怎麼辦？', '如遇航班延誤，我們會立即通知您並協助安排後續行程。', '["延誤", "通知", "協助"]', 7, TRUE, 0),
(UUID(), 'refund', '如何申請退票？', '您可以在「我的訂票」頁面選擇要取消的訂單，按照指示申請退票。', '["退票", "取消", "申請"]', 8, TRUE, 0),
(UUID(), 'refund', '退票需要手續費嗎？', '根據票價規則，部分機票可能需要收取退票手續費，詳情請查看您的票價條款。', '["退票", "手續費", "票價規則"]', 9, TRUE, 0),
(UUID(), 'account', '如何修改個人資料？', '登入後點選「個人設定」即可修改您的個人資料。', '["個人資料", "修改", "設定"]', 10, TRUE, 0),
(UUID(), 'account', '忘記密碼怎麼辦？', '請點選登入頁面的「忘記密碼」連結，輸入您的電子郵件地址，我們會發送重設密碼的連結給您。', '["密碼", "忘記", "重設"]', 11, TRUE, 0),
(UUID(), 'general', '客服服務時間？', '我們的客服團隊服務時間為週一至週日 09:00-21:00。', '["客服", "服務時間", "聯絡"]', 12, TRUE, 0),
(UUID(), 'general', '如何聯絡客服？', '您可以透過電話、電子郵件或線上客服系統聯絡我們。', '["客服", "聯絡方式", "支援"]', 13, TRUE, 0);
