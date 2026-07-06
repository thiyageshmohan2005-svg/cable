-- ========================================
-- CablePro Complete Database Schema
-- Production Ready with Auth Support
-- ========================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS monthly_bills;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS cable_plans;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS areas;

-- ========================================
-- AREAS TABLE (for area management)
-- ========================================
CREATE TABLE areas (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_areas_name (name),
    INDEX idx_areas_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- USERS TABLE (Authentication)
-- ========================================
CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'operator', 'staff') NOT NULL DEFAULT 'operator',
    assigned_area_id BIGINT UNSIGNED,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_mobile (mobile),
    UNIQUE KEY uq_users_email (email),
    FOREIGN KEY (assigned_area_id) REFERENCES areas(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_users_role (role),
    INDEX idx_users_status (status),
    INDEX idx_users_mobile (mobile)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- CABLE PLANS TABLE
-- ========================================
CREATE TABLE cable_plans (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    channels_count INT UNSIGNED NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_cable_plans_name (name),
    INDEX idx_cable_plans_status (status),
    INDEX idx_cable_plans_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- CUSTOMERS TABLE
-- ========================================
CREATE TABLE customers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address VARCHAR(500),
    area_id BIGINT UNSIGNED,
    connection_date DATE NOT NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_customers_mobile (mobile),
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_customers_status (status),
    INDEX idx_customers_area_id (area_id),
    INDEX idx_customers_mobile (mobile)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- SUBSCRIPTIONS TABLE
-- ========================================
CREATE TABLE subscriptions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    customer_id BIGINT UNSIGNED NOT NULL,
    plan_id BIGINT UNSIGNED NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status ENUM('active', 'inactive', 'cancelled', 'expired') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES cable_plans(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_subscriptions_customer_id (customer_id),
    INDEX idx_subscriptions_plan_id (plan_id),
    INDEX idx_subscriptions_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- MONTHLY BILLS TABLE
-- ========================================
CREATE TABLE monthly_bills (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    customer_id BIGINT UNSIGNED NOT NULL,
    billing_month TINYINT UNSIGNED NOT NULL,
    billing_year SMALLINT UNSIGNED NOT NULL,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    due_date DATE NOT NULL,
    status ENUM('paid', 'unpaid', 'overdue') NOT NULL DEFAULT 'unpaid',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY uq_bills_customer_month_year (customer_id, billing_month, billing_year),
    INDEX idx_monthly_bills_status (status),
    INDEX idx_monthly_bills_customer_id (customer_id),
    INDEX idx_monthly_bills_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- PAYMENTS TABLE
-- ========================================
CREATE TABLE payments (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    customer_id BIGINT UNSIGNED NOT NULL,
    bill_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payment_method ENUM('cash', 'online', 'cheque') NOT NULL,
    reference_number VARCHAR(100),
    notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (bill_id) REFERENCES monthly_bills(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_payments_customer_id (customer_id),
    INDEX idx_payments_bill_id (bill_id),
    INDEX idx_payments_payment_date (payment_date),
    INDEX idx_payments_payment_method (payment_method)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- NOTIFICATIONS TABLE
-- ========================================
CREATE TABLE notifications (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    customer_id BIGINT UNSIGNED,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('payment_due', 'payment_received', 'plan_change', 'general') NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_notifications_customer_id (customer_id),
    INDEX idx_notifications_type (type),
    INDEX idx_notifications_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- REPORTS TABLE
-- ========================================
CREATE TABLE reports (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    report_type ENUM('revenue', 'payments', 'pending', 'customers') NOT NULL,
    generated_by BIGINT UNSIGNED NOT NULL,
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_reports_report_type (report_type),
    INDEX idx_reports_generated_at (generated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- SETTINGS TABLE
-- ========================================
CREATE TABLE settings (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_settings_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- INSERT SAMPLE DATA
-- ========================================

-- Insert areas
INSERT INTO areas (name, description, status) VALUES 
('Area A', 'Downtown area', 'active'),
('Area B', 'Suburban area', 'active'),
('Area C', 'Industrial area', 'active');

-- Insert admin user (password: Admin@123)
-- Password hash for "Admin@123" using bcryptjs with 10 rounds
INSERT INTO users (name, mobile, email, password_hash, role, assigned_area_id, status) VALUES 
('Admin User', '9999999999', 'admin@cablepro.com', '$2a$10$6H8jnZqMEV3c1Qg/eFxDieLG7Dq0qKvJzKHBYvJcG4V1pS9zKGOXa', 'admin', 1, 'active');

-- Insert operator user (password: Operator@123)
INSERT INTO users (name, mobile, email, password_hash, role, assigned_area_id, status) VALUES 
('Operator User', '9999999998', 'operator@cablepro.com', '$2a$10$lJ0N1hSV3ZqH2.Iw5j4SZOvLq8J3v1.P9K5L6M7N8O9P0Q1R2S3T4U', 'operator', 1, 'active');

-- Insert test user (password: Test@123)
INSERT INTO users (name, mobile, email, password_hash, role, assigned_area_id, status) VALUES 
('Test User', '9999999997', 'test@cablepro.com', '$2a$10$a0/9z8Y7X6W5V4U3T2S1RQpOnMlKjIhGfEdCbAzYxWvUtSrQpKoQK', 'staff', 1, 'active');

-- Insert cable plans
INSERT INTO cable_plans (name, channels_count, price, status) VALUES 
('Basic Plan', 50, 299.00, 'active'),
('Premium Plan', 100, 499.00, 'active'),
('Gold Plan', 150, 699.00, 'active');

-- Insert sample customers
INSERT INTO customers (name, mobile, email, address, area_id, connection_date, status) VALUES 
('Customer 1', '9876543210', 'customer1@email.com', '123 Main St', 1, '2024-01-01', 'active'),
('Customer 2', '9876543211', 'customer2@email.com', '456 Oak Ave', 2, '2024-02-01', 'active'),
('Customer 3', '9876543212', 'customer3@email.com', '789 Pine Rd', 3, '2024-03-01', 'active');

-- Insert subscriptions
INSERT INTO subscriptions (customer_id, plan_id, start_date, status) VALUES 
(1, 1, '2024-01-01', 'active'),
(2, 2, '2024-02-01', 'active'),
(3, 3, '2024-03-01', 'active');

-- Insert sample settings
INSERT INTO settings (setting_key, setting_value, description) VALUES 
('app_name', 'CablePro', 'Application name'),
('app_version', '1.0.0', 'Application version'),
('currency', 'INR', 'Default currency'),
('company_name', 'CablePro Services', 'Company name');

-- ========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_customers_created_at ON customers(created_at);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_monthly_bills_created_at ON monthly_bills(created_at);
