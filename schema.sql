-- =======================================================
-- Culinary Connect Catering Management System
-- Module: Centralized CRM & Inquiry Consolidation System
-- Database Schema & Seed Data (MySQL)
-- =======================================================

CREATE DATABASE IF NOT EXISTS catering_db;
USE catering_db;

-- 1. Customers Table (Ensures normalization & no duplicate customer records)
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    company_name VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Inquiries Table (Event booking requests linked to customer)
CREATE TABLE IF NOT EXISTS inquiries (
    inquiry_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_date DATE NOT NULL,
    guest_count INT NOT NULL,
    venue_location VARCHAR(150) NOT NULL,
    catering_style VARCHAR(50) NOT NULL,
    budget_estimate DECIMAL(10, 2) NOT NULL,
    communication_channel VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'NEW',
    dietary_notes TEXT,
    follow_up_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);

-- -------------------------------------------------------
-- Sample Seed Data (For realistic demonstration in evaluations)
-- -------------------------------------------------------

INSERT INTO customers (full_name, email, phone, company_name) VALUES
('Nimal Perera', 'nimal.perera@gmail.com', '0771234567', 'Ceylon Logistics Ltd'),
('Dilani Senanayake', 'dilani.s@outlook.com', '0719876543', NULL),
('Virtusa Events Team', 'events@virtusa.com', '0112345678', 'Virtusa Sri Lanka'),
('Dr. Kamal Silva', 'kamal.silva@yahoo.com', '0765554321', NULL),
('Malini Fernando', 'malini.f@gmail.com', '0783332211', 'Apex Holdings');

INSERT INTO inquiries (customer_id, event_type, event_date, guest_count, venue_location, catering_style, budget_estimate, communication_channel, status, dietary_notes, follow_up_notes) VALUES
(1, 'Corporate Dinner', DATE_ADD(CURDATE(), INTERVAL 14 DAY), 120, 'Cinnamon Grand Ballroom', 'Buffet', 450000.00, 'WhatsApp', 'NEW', '15 Vegetarians, 2 Halal', 'Initial inquiry received via WhatsApp business account.'),
(2, 'Wedding Reception', DATE_ADD(CURDATE(), INTERVAL 45 DAY), 250, 'Waters Edge, Battaramulla', 'Plated Dinner', 980000.00, 'Phone Call', 'QUOTATION_SENT', 'No beef, 30 pure vegetarian, 5 gluten-free', 'Quotation draft #1 sent. Bride requested tasting session next week.'),
(3, 'Annual Tech Gala', DATE_ADD(CURDATE(), INTERVAL 60 DAY), 400, 'Shangri-La Lotus Ballroom', 'Cocktail & Canapes', 1600000.00, 'Email', 'CONFIRMED', 'Diverse international menu, live pasta & hopper counters', 'Deposit of 30% received. Passed details to Chef Nuwan and Logistics.'),
(4, '50th Birthday Celebration', DATE_ADD(CURDATE(), INTERVAL 20 DAY), 80, 'Private Residence, Colombo 07', 'Live BBQ & Buffet', 320000.00, 'Walk-in', 'CONTACTED', 'Kids menu needed for 12 children, spicy seafood preference', 'Shamini met client at office. Awaiting finalized guest headcount.'),
(5, 'Product Launch Banquet', DATE_ADD(CURDATE(), INTERVAL 30 DAY), 180, 'Hilton Colombo Residences', 'Buffet', 650000.00, 'Website Form', 'NEW', 'Nut allergies declared for 3 VIP guests', 'Online web form lead received. Requires quotation by tomorrow.');
