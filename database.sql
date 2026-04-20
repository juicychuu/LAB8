-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 20, 2026 at 10:44 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ecommerce_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total_amount`, `status`, `created_at`) VALUES
(1, 3, 6000.00, 'delivered', '2026-04-15 15:29:36'),
(2, 3, 5475.00, 'delivered', '2026-04-15 15:31:20'),
(3, 3, 4050.00, 'delivered', '2026-04-15 15:32:12'),
(5, 3, 3600.00, 'delivered', '2026-04-15 15:50:15'),
(8, 3, 7125.00, 'delivered', '2026-04-15 16:29:40'),
(9, 3, 6124.00, 'delivered', '2026-04-16 06:23:24'),
(12, 3, 9331.00, 'delivered', '2026-04-16 09:10:06'),
(13, 3, 7998.00, 'delivered', '2026-04-16 09:24:43'),
(14, 3, 9331.00, 'delivered', '2026-04-16 09:40:04'),
(15, 3, 75697.00, 'delivered', '2026-04-16 09:40:29'),
(16, 4, 55.00, 'delivered', '2026-04-16 09:51:53'),
(17, 5, 93875.00, 'delivered', '2026-04-16 12:37:00'),
(18, 3, 675.00, 'delivered', '2026-04-18 13:33:13'),
(19, 3, 6600.00, 'delivered', '2026-04-19 11:09:40'),
(20, 3, 3000.00, 'delivered', '2026-04-19 11:32:09'),
(21, 3, 4242.00, 'delivered', '2026-04-19 12:20:32'),
(22, 6, 3000.00, 'delivered', '2026-04-19 13:13:39'),
(23, 3, 64824.00, 'delivered', '2026-04-19 14:19:40'),
(24, 3, 97236.00, 'delivered', '2026-04-20 18:50:56');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price_at_purchase` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price_at_purchase`) VALUES
(1, 1, 1, 5, 1200.00),
(2, 2, 2, 3, 150.00),
(3, 2, 1, 4, 1200.00),
(4, 2, 3, 3, 75.00),
(5, 3, 2, 1, 150.00),
(6, 3, 3, 1, 75.00),
(13, 5, 1, 3, 1200.00),
(17, 8, 1, 5, 1200.00),
(18, 8, 2, 6, 150.00),
(19, 8, 3, 3, 75.00),
(21, 9, 1, 4, 1200.00),
(33, 18, 3, 9, 75.00),
(34, 19, 3, 8, 75.00),
(35, 19, 1, 5, 1200.00),
(36, 20, 14, 3, 1000.00),
(37, 21, 15, 22, 11.00),
(38, 21, 14, 4, 1000.00),
(39, 22, 14, 3, 1000.00),
(40, 23, 17, 2, 32412.00),
(41, 24, 17, 3, 32412.00);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) DEFAULT 0,
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `category` varchar(100) DEFAULT 'Uncategorized',
  `rating` decimal(3,2) DEFAULT 0.00,
  `num_reviews` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `stock`, `image_url`, `created_at`, `category`, `rating`, `num_reviews`) VALUES
(1, '8K Monitor', 'Ultra-sharp 8K display, 240Hz refresh rate.', 1200.00, 2, NULL, '2026-04-15 14:14:02', 'Uncategorized', 0.00, 0),
(2, 'Mechanical Keyboard', 'RGB mechanical keyboard, Cherry MX switches.', 150.00, 27, NULL, '2026-04-15 14:14:02', 'Uncategorized', 0.00, 0),
(3, 'Wireless Mouse', 'Ergonomic 4000 DPI wireless mouse.', 75.00, 24, NULL, '2026-04-15 14:14:02', 'Uncategorized', 0.00, 0),
(14, 'chair', 'sturdy', 1000.00, 49, NULL, '2026-04-19 11:22:34', 'Home', 1.00, 1),
(15, 'chain', 'long', 11.00, 0, NULL, '2026-04-19 12:13:50', 'Accessories', 3.00, 3),
(16, 'table', 'brown', 11111.00, 21, '/uploads/1776601302006-user-2-belmont-dining-table-1-63847041505.webp', '2026-04-19 12:21:42', 'Home', 3.00, 1),
(17, 'Laptop', 'high end', 32412.00, 17, '/uploads/1776608353965-user-9-download.jpg', '2026-04-19 14:19:13', 'Electronics', 2.75, 4),
(18, 'laptop', '', 2222.00, 22, NULL, '2026-04-20 20:38:19', 'Electronics', 4.00, 1),
(19, 'Laptop rizen', 'gaming', 11111.00, 11, NULL, '2026-04-20 20:38:52', 'Electronics', 0.00, 0);

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `product_id`, `user_id`, `name`, `rating`, `comment`, `created_at`) VALUES
(1, 17, 3, 'Verified Customer', 5, 'great', '2026-04-20 20:12:17'),
(2, 16, 3, 'Verified Customer', 3, 'good', '2026-04-20 20:12:43'),
(3, 14, 3, 'Verified Customer', 1, 'meh', '2026-04-20 20:14:54'),
(4, 17, 9, 'Verified Customer', 3, 'ohw its good', '2026-04-20 20:26:05'),
(5, 17, 3, 'Verified Customer', 1, 'not good', '2026-04-20 20:28:42'),
(6, 17, 3, 'villojan', 2, 'good enough', '2026-04-20 20:34:19'),
(7, 15, 9, 'Verified Customer', 1, 'broken', '2026-04-20 20:34:47'),
(8, 15, 3, 'villojan', 5, 'good', '2026-04-20 20:35:13'),
(9, 15, 6, 'nancy', 3, 'i love it', '2026-04-20 20:36:09'),
(10, 18, 3, 'villojan', 4, 'fast', '2026-04-20 20:39:12');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `profile_pic` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `profile_pic`, `password_hash`, `role`, `created_at`) VALUES
(3, 'villojan', 'villojan@gmail.com', 'avatar/1776341383582-user-3-kkk.jpg', '$2b$10$LE92jH32oS37bRJs8p4oL.eEKToVgrJwdAQDPAq4UT.tbtkMji63O', 'user', '2026-04-15 15:26:19'),
(4, 'angelo', 'angelo@gmail.com', NULL, '$2b$10$ErTZEgpqJdeDDZUnv/MAh.y.fWoOSd5gzShahdJY5KiVfBm0LmHcy', 'admin', '2026-04-16 09:50:54'),
(5, 'carmelo', 'carmelo@gmail.com', 'avatar/1776342967345-user-5-Hopscotch---Twinkl-Move-PE-Y1---Running-and-Jumping-Lesson-5---Island-Jumping-Differentiated-Lesson-Pack---KS1.png', '$2b$10$OJQ4Y1otUlEaoWqBuuzmdOuQMVlMN0MEfDaGuJ3FXBnBekIXsBEfK', 'user', '2026-04-16 12:35:27'),
(6, 'nancy', 'nancy@gmail.com', NULL, '$2b$10$lnct548xD5ICim4veOWBPuktzEcfuLybwwoXPov8QZPBnF4w8alJm', 'admin', '2026-04-19 13:13:10'),
(9, 'SystemRoot', 'Admin@gmail.com', NULL, '$2b$10$PsjjKVmxRWmKV/hbtxZQVu8TwLc9vQdnPN0sgodjJCqwA7FvXiJuy', 'admin', '2026-04-19 14:12:48');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
