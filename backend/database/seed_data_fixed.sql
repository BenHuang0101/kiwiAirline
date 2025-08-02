-- Test Data for Kiwi Bird Airline Database
-- Insert test data following database design document

USE kiwi_bird_airline;

-- Insert test users
INSERT INTO users (id, first_name, last_name, email, password_hash, phone_number, is_active) VALUES
(UUID(), 'Ming', 'Wang', 'ming.wang@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewmyOSW3E1YOUIqe', '0912345678', TRUE),
(UUID(), 'Hua', 'Lee', 'hua.lee@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewmyOSW3E1YOUIqe', '0987654321', TRUE),
(UUID(), 'Mei', 'Zhang', 'mei.zhang@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewmyOSW3E1YOUIqe', '0956789123', TRUE),
(UUID(), 'David', 'Chen', 'david.chen@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewmyOSW3E1YOUIqe', '0923456789', TRUE),
(UUID(), 'Yawen', 'Lin', 'yawen.lin@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewmyOSW3E1YOUIqe', '0934567890', TRUE);

-- Insert flights data
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

-- Insert passengers data
INSERT INTO passengers (id, first_name, last_name, passport_number, date_of_birth, nationality, gender, email, phone_number) VALUES
(UUID(), 'Ming', 'Wang', 'A123456789', '1990-05-15', 'TW', 'M', 'ming.wang@email.com', '0912345678'),
(UUID(), 'Hua', 'Lee', 'B987654321', '1985-08-22', 'TW', 'F', 'hua.lee@email.com', '0987654321'),
(UUID(), 'Mei', 'Zhang', 'C456789123', '1992-03-10', 'TW', 'F', 'mei.zhang@email.com', '0956789123'),
(UUID(), 'David', 'Chen', 'D789123456', '1988-11-07', 'TW', 'M', 'david.chen@email.com', '0923456789'),
(UUID(), 'Yawen', 'Lin', 'E321654987', '1995-12-25', 'TW', 'F', 'yawen.lin@email.com', '0934567890'),
(UUID(), 'John', 'Smith', 'US1234567', '1987-06-18', 'US', 'M', 'john.smith@email.com', '0945678901'),
(UUID(), 'Mary', 'Johnson', 'US7654321', '1991-09-03', 'US', 'F', 'mary.johnson@email.com', '0967891234'),
(UUID(), 'Hiroshi', 'Tanaka', 'JP9876543', '1983-04-14', 'JP', 'M', 'hiroshi.tanaka@email.com', '0978912345'),
(UUID(), 'MinJung', 'Kim', 'KR5432167', '1994-01-28', 'KR', 'F', 'minjung.kim@email.com', '0989123456'),
(UUID(), 'KaiMing', 'Wong', 'HK1357924', '1989-10-12', 'HK', 'M', 'kaiming.wong@email.com', '0991234567');

-- Insert FAQ data
INSERT INTO faq (id, category, question, answer, tags, sort_order, is_active, view_count) VALUES
(UUID(), 'booking', 'How to book tickets online?', 'You can select departure, destination, and date on our homepage, then choose suitable flights and fill in passenger information.', '["booking", "online", "tickets"]', 1, TRUE, 0),
(UUID(), 'booking', 'How many passengers can I book for?', 'You can book tickets for up to 9 passengers per booking.', '["booking", "passengers", "limit"]', 2, TRUE, 0),
(UUID(), 'booking', 'When will I receive confirmation?', 'You will receive an electronic ticket confirmation immediately after successful booking and payment.', '["confirmation", "ticket", "booking"]', 3, TRUE, 0),
(UUID(), 'payment', 'What payment methods do you accept?', 'We accept credit cards, debit cards, ATM transfers, and bank transfers.', '["payment", "credit card", "transfer"]', 4, TRUE, 0),
(UUID(), 'payment', 'Is payment secure?', 'Yes, we use industry-standard encryption to protect your payment information.', '["payment", "security", "encryption"]', 5, TRUE, 0),
(UUID(), 'flight', 'Can I choose my seat?', 'Yes, you can select preferred seats during booking (some seats may require additional fees).', '["seat", "selection", "preference"]', 6, TRUE, 0),
(UUID(), 'flight', 'What if my flight is delayed?', 'We will notify you immediately of any delays and assist with your travel arrangements.', '["delay", "notification", "assistance"]', 7, TRUE, 0),
(UUID(), 'refund', 'How to request a refund?', 'You can cancel your booking in the My Bookings page and follow the instructions to request a refund.', '["refund", "cancel", "booking"]', 8, TRUE, 0),
(UUID(), 'refund', 'Are there refund fees?', 'Depending on fare rules, some tickets may incur refund fees. Please check your ticket terms.', '["refund", "fees", "fare rules"]', 9, TRUE, 0),
(UUID(), 'account', 'How to update personal information?', 'After logging in, click on Personal Settings to modify your personal information.', '["profile", "update", "settings"]', 10, TRUE, 0),
(UUID(), 'account', 'What if I forget my password?', 'Click Forgot Password on the login page and enter your email. We will send you a password reset link.', '["password", "forgot", "reset"]', 11, TRUE, 0),
(UUID(), 'general', 'Customer service hours?', 'Our customer service team is available Monday to Sunday, 09:00-21:00.', '["customer service", "hours", "contact"]', 12, TRUE, 0),
(UUID(), 'general', 'How to contact customer service?', 'You can contact us via phone, email, or online customer service system.', '["customer service", "contact", "support"]', 13, TRUE, 0);
