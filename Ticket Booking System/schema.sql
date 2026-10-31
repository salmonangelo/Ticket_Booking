-- =============================================================================
-- Ticket Booking System - Database Schema for XAMPP (phpMyAdmin / MySQL)
-- =============================================================================

-- 1. Create Database if it doesn't already exist
CREATE DATABASE IF NOT EXISTS `ticket_booking_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `ticket_booking_db`;

-- 2. Create 'events' table
CREATE TABLE IF NOT EXISTS `events` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(150) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `description` VARCHAR(1000),
    `venue` VARCHAR(150) NOT NULL,
    `show_date` DATE NOT NULL,
    `show_time` VARCHAR(20) NOT NULL,
    `ticket_price` DOUBLE NOT NULL,
    `total_seats` INT NOT NULL DEFAULT 50,
    `image_url` VARCHAR(500),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Create 'bookings' table
CREATE TABLE IF NOT EXISTS `bookings` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `booking_code` VARCHAR(20) NOT NULL UNIQUE,
    `event_id` BIGINT NOT NULL,
    `customer_name` VARCHAR(100) NOT NULL,
    `customer_email` VARCHAR(100) NOT NULL,
    `customer_phone` VARCHAR(20) NOT NULL,
    `seat_numbers` VARCHAR(255) NOT NULL,
    `number_of_seats` INT NOT NULL,
    `total_amount` DOUBLE NOT NULL,
    `payment_method` VARCHAR(30) DEFAULT 'CARD',
    `status` VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    `booking_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_bookings_event` FOREIGN KEY (`event_id`) 
        REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Sample Seed Data
INSERT INTO `events` (`title`, `category`, `description`, `venue`, `show_date`, `show_time`, `ticket_price`, `total_seats`, `image_url`)
VALUES 
('Interstellar: IMAX Special', 'Movie', 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival. Experience Nolan\'s masterpiece in full IMAX format.', 'PVR Superplex IMAX - Screen 1', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '19:00', 15.00, 50, 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80'),
('Coldplay: Music of the Spheres Tour', 'Concert', 'Live in concert performing hits like Yellow, Viva La Vida, Fix You, and latest album specials with kinetic stages and LED wristbands.', 'National Arena Stadium', DATE_ADD(CURDATE(), INTERVAL 4 DAY), '20:30', 75.00, 50, 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'),
('Dune: Part Two', 'Movie', 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.', 'Cinepolis VIP Cinema - Audi 3', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '17:45', 14.50, 50, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'),
('Trevor Noah: \'Off The Record\' Tour', 'Comedy', 'Global comedy sensation Trevor Noah brings his acclaimed stand-up world tour full of sharp wit, international commentary, and laughter.', 'Grand Opera Concert Hall', DATE_ADD(CURDATE(), INTERVAL 6 DAY), '19:30', 45.00, 50, 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=800&q=80'),
('The Lion King: Broadway Musical', 'Theater', 'More than 100 million people around the world have experienced the awe-inspiring visual artistry, music, and theatrical magic.', 'Metropolitan Arts Pavilion', DATE_ADD(CURDATE(), INTERVAL 8 DAY), '18:00', 60.00, 50, 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80'),
('Formula 1 Night Championship', 'Sports', 'Feel the thunder and speed under the neon floodlights as the world\'s top drivers battle for the podium.', 'Marina Bay Grand Circuit', DATE_ADD(CURDATE(), INTERVAL 12 DAY), '21:00', 120.00, 50, 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80');

