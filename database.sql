-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 18, 2026 at 02:38 PM
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
(4, 2, 1650.00, 'delivered', '2026-04-15 15:42:47'),
(5, 3, 3600.00, 'delivered', '2026-04-15 15:50:15'),
(6, 2, 3750.00, 'delivered', '2026-04-15 16:23:38'),
(7, 2, 750.00, 'delivered', '2026-04-15 16:24:06'),
(8, 3, 7125.00, 'delivered', '2026-04-15 16:29:40'),
(9, 3, 6124.00, 'delivered', '2026-04-16 06:23:24'),
(10, 2, 351825.00, 'delivered', '2026-04-16 07:49:24'),
(11, 2, 52242.00, 'delivered', '2026-04-16 09:09:46'),
(12, 3, 9331.00, 'delivered', '2026-04-16 09:10:06'),
(13, 3, 7998.00, 'delivered', '2026-04-16 09:24:43'),
(14, 3, 9331.00, 'delivered', '2026-04-16 09:40:04'),
(15, 3, 75697.00, 'delivered', '2026-04-16 09:40:29'),
(16, 4, 55.00, 'delivered', '2026-04-16 09:51:53'),
(17, 5, 93875.00, 'delivered', '2026-04-16 12:37:00');

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
(10, 4, 1, 1, 1200.00),
(11, 4, 2, 2, 150.00),
(12, 4, 3, 2, 75.00),
(13, 5, 1, 3, 1200.00),
(14, 6, 1, 3, 1200.00),
(15, 6, 2, 1, 150.00),
(16, 7, 3, 10, 75.00),
(17, 8, 1, 5, 1200.00),
(18, 8, 2, 6, 150.00),
(19, 8, 3, 3, 75.00),
(21, 9, 1, 4, 1200.00);

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
  `category` varchar(100) DEFAULT 'Uncategorized'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `stock`, `image_url`, `created_at`, `category`) VALUES
(1, '8K Monitor', 'Ultra-sharp 8K display, 240Hz refresh rate.', 1200.00, 2, NULL, '2026-04-15 14:14:02', 'Uncategorized'),
(2, 'Mechanical Keyboard', 'RGB mechanical keyboard, Cherry MX switches.', 150.00, 27, NULL, '2026-04-15 14:14:02', 'Uncategorized'),
(3, 'Wireless Mouse', 'Ergonomic 4000 DPI wireless mouse.', 75.00, 41, NULL, '2026-04-15 14:14:02', 'Uncategorized');

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
(2, 'kurt', 'kurt@gmail.com', 'avatar/1776341538361-user-2-WIN_20231121_19_27_09_Pro.jpg', '$2b$10$VtPvMzdbok0Jd/zYwGGLcODevV47uRUze53YQyK8RtzP853E8yaiK', 'admin', '2026-04-15 15:11:41'),
(3, 'villojan', 'villojan@gmail.com', 'avatar/1776341383582-user-3-kkk.jpg', '$2b$10$LE92jH32oS37bRJs8p4oL.eEKToVgrJwdAQDPAq4UT.tbtkMji63O', 'user', '2026-04-15 15:26:19'),
(4, 'angelo', 'angelo@gmail.com', NULL, '$2b$10$ErTZEgpqJdeDDZUnv/MAh.y.fWoOSd5gzShahdJY5KiVfBm0LmHcy', 'user', '2026-04-16 09:50:54'),
(5, 'carmelo', 'carmelo@gmail.com', 'avatar/1776342967345-user-5-Hopscotch---Twinkl-Move-PE-Y1---Running-and-Jumping-Lesson-5---Island-Jumping-Differentiated-Lesson-Pack---KS1.png', '$2b$10$OJQ4Y1otUlEaoWqBuuzmdOuQMVlMN0MEfDaGuJ3FXBnBekIXsBEfK', 'user', '2026-04-16 12:35:27');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
