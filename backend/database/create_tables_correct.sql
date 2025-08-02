-- 奇異鳥航空訂票網站 - 資料庫建立腳本
-- 嚴格按照資料庫設計文件建立

USE kiwi_bird_airline;

-- 1. 建立 users 表
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_users_phone (phone_number),
    INDEX idx_users_created_at (created_at)
);

-- 2. 建立 flights 表
CREATE TABLE flights (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    flight_number VARCHAR(10) NOT NULL UNIQUE,
    departure_airport VARCHAR(3) NOT NULL,
    arrival_airport VARCHAR(3) NOT NULL,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    aircraft_model VARCHAR(50),
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'TWD',
    status ENUM('scheduled', 'boarding', 'departed', 'arrived', 'cancelled', 'delayed') NOT NULL DEFAULT 'scheduled',
    gate VARCHAR(10),
    terminal VARCHAR(10),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_flights_departure (departure_airport, departure_time),
    INDEX idx_flights_route (departure_airport, arrival_airport),
    INDEX idx_flights_status (status)
);

-- 3. 建立 passengers 表
CREATE TABLE passengers (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    passport_number VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    nationality VARCHAR(2) NOT NULL,
    gender ENUM('M', 'F', 'OTHER'),
    email VARCHAR(100),
    phone_number VARCHAR(15),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_passengers_passport (passport_number),
    INDEX idx_passengers_name (first_name, last_name)
);

-- 4. 建立 bookings 表
CREATE TABLE bookings (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    booking_number VARCHAR(20) NOT NULL UNIQUE,
    user_id CHAR(36) NOT NULL,
    flight_id CHAR(36) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'modified', 'completed') NOT NULL DEFAULT 'pending',
    passenger_count INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'TWD',
    contact_email VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(15) NOT NULL,
    booking_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmation_code VARCHAR(10),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_bookings_status (status),
    INDEX idx_bookings_date (booking_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE RESTRICT
);

-- 5. 建立 booking_passengers 表
CREATE TABLE booking_passengers (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    booking_id CHAR(36) NOT NULL,
    passenger_id CHAR(36) NOT NULL,
    seat_number VARCHAR(5),
    ticket_number VARCHAR(15),
    check_in_time TIMESTAMP NULL,
    boarding_pass VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_booking_passenger (booking_id, passenger_id),
    INDEX idx_booking_passengers_ticket (ticket_number),
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (passenger_id) REFERENCES passengers(id) ON DELETE RESTRICT
);

-- 6. 建立 payments 表
CREATE TABLE payments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    booking_id CHAR(36) NOT NULL UNIQUE,
    transaction_id VARCHAR(50),
    payment_method ENUM('credit_card', 'debit_card', 'atm_transfer', 'bank_transfer') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'TWD',
    status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
    gateway_response JSON,
    card_last_four VARCHAR(4),
    card_brand VARCHAR(20),
    processed_at TIMESTAMP NULL,
    refunded_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    refunded_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_payments_transaction (transaction_id),
    INDEX idx_payments_status (status),
    INDEX idx_payments_method (payment_method),
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT
);

-- 7. 建立 support_tickets 表
CREATE TABLE support_tickets (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    ticket_number VARCHAR(20) NOT NULL UNIQUE,
    user_id CHAR(36),
    booking_id CHAR(36),
    category ENUM('booking', 'payment', 'flight', 'refund', 'technical', 'general') NOT NULL,
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'waiting_customer', 'resolved', 'closed') NOT NULL DEFAULT 'open',
    assigned_agent VARCHAR(50),
    contact_name VARCHAR(100) NOT NULL,
    contact_email VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(15),
    resolution TEXT,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_tickets_status (status),
    INDEX idx_tickets_category (category),
    INDEX idx_tickets_priority (priority),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

-- 8. 建立 faq 表
CREATE TABLE faq (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    category ENUM('booking', 'payment', 'flight', 'refund', 'account', 'general') NOT NULL,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    tags JSON,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    view_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_faq_category (category),
    INDEX idx_faq_active (is_active),
    INDEX idx_faq_sort (sort_order)
);

-- 9. 建立 booking_modifications 表
CREATE TABLE booking_modifications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    booking_id CHAR(36) NOT NULL,
    modification_type ENUM('date_change', 'passenger_change', 'flight_change') NOT NULL,
    old_flight_id CHAR(36),
    new_flight_id CHAR(36),
    old_passenger_data JSON,
    new_passenger_data JSON,
    price_difference DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    modification_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    reason VARCHAR(500),
    status ENUM('pending', 'approved', 'rejected', 'completed') NOT NULL DEFAULT 'pending',
    processed_by VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX fk_modifications_booking (booking_id),
    INDEX idx_modifications_type (modification_type),
    INDEX idx_modifications_status (status),
    INDEX idx_modifications_created (created_at),

    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (old_flight_id) REFERENCES flights(id) ON DELETE SET NULL,
    FOREIGN KEY (new_flight_id) REFERENCES flights(id) ON DELETE SET NULL
);

-- 10. 建立 system_logs 表
CREATE TABLE system_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    log_level ENUM('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL') NOT NULL DEFAULT 'INFO',
    category VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    user_id CHAR(36),
    booking_id CHAR(36),
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    request_url VARCHAR(500),
    stack_trace TEXT,
    metadata JSON,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_logs_level (log_level),
    INDEX idx_logs_category (category),
    INDEX idx_logs_user (user_id),
    INDEX idx_logs_booking (booking_id),
    INDEX idx_logs_created (created_at),
    INDEX idx_logs_level_created (log_level, created_at)
);
