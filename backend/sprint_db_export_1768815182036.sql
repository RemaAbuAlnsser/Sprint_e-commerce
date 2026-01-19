-- Sprint E-Commerce Database Export
-- Generated on: 2026-01-19T09:33:01.904Z

CREATE DATABASE IF NOT EXISTS SprintDB;
USE SprintDB;

-- Table: categories
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `image_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table: categories
INSERT INTO `categories` (`id`, `name`, `description`, `created_at`, `image_url`) VALUES
(1, 'الإلكترونيات', 'أجهزة إلكترونية ومستلزماتها', '2026-01-17 17:11:09', NULL),
(2, 'الملابس', 'ملابس رجالية ونسائية', '2026-01-17 17:11:09', NULL),
(5, 'شناتي نسائية', 'مجموعة من الشركات الفاخرة', '2026-01-17 17:19:37', '/uploads/categories/category-1768670349218-586502281.png'),
(6, 'ساعات نسائية ', NULL, '2026-01-18 20:17:58', '/uploads/categories/category-1768767469357-828527888.png'),
(7, 'ساعات رجالي ', NULL, '2026-01-18 20:20:27', '/uploads/categories/category-1768767618620-317239394.png');

-- Table: companies
DROP TABLE IF EXISTS `companies`;
CREATE TABLE `companies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table: companies
INSERT INTO `companies` (`id`, `name`, `logo_url`, `created_at`) VALUES
(3, 'DIORR', '/uploads/companies/company-1768671084694-298379361.png', '2026-01-17 17:31:32'),
(4, 'Louis Vuitton', '/uploads/companies/company-1768672504310-182596540.png', '2026-01-17 17:55:05'),
(5, 'Gucci', '/uploads/companies/company-1768672558471-258909590.png', '2026-01-17 17:56:00'),
(6, 'Prada', '/uploads/companies/company-1768672710018-162389395.png', '2026-01-17 17:56:40'),
(7, 'Rolex', '/uploads/companies/company-1768767811321-473061786.png', '2026-01-18 20:23:35');

-- Table: order_items
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table: order_items
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `product_price`, `quantity`, `subtotal`, `created_at`) VALUES
(1, 1, 11, 'شنتالاتميمينل', '233.70', 1, '233.70', '2026-01-18 21:17:05'),
(2, 1, 16, 'ساعة رجالي ', '249.78', 1, '249.78', '2026-01-18 21:17:05'),
(3, 1, 12, 'يي', '2344.00', 1, '2344.00', '2026-01-18 21:17:05'),
(4, 2, 11, 'شنتالاتميمينل', '233.70', 1, '233.70', '2026-01-18 21:19:36'),
(5, 2, 16, 'ساعة رجالي ', '249.78', 1, '249.78', '2026-01-18 21:19:36'),
(6, 2, 12, 'يي', '2344.00', 1, '2344.00', '2026-01-18 21:19:36'),
(10, 4, 14, 'ساعة ', '149.90', 1, '149.90', '2026-01-18 21:21:47'),
(11, 4, 16, 'ساعة رجالي ', '249.78', 1, '249.78', '2026-01-18 21:21:47'),
(12, 5, 16, 'ساعة رجالي ', '249.78', 1, '249.78', '2026-01-18 21:22:28'),
(13, 6, 17, 'شنطة ', '200.00', 1, '200.00', '2026-01-18 21:23:43'),
(14, 6, 18, 'شنطة ', '200.00', 1, '200.00', '2026-01-18 21:23:43'),
(15, 7, 13, 'ساعة ', '149.75', 1, '149.75', '2026-01-18 21:24:28'),
(16, 8, 17, 'شنطة ', '200.00', 1, '200.00', '2026-01-18 21:30:19');

-- Table: orders
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(255) NOT NULL,
  `customer_phone` varchar(50) NOT NULL,
  `customer_city` varchar(100) NOT NULL,
  `customer_address` text NOT NULL,
  `shipping_method` enum('express','standard','internal') NOT NULL,
  `shipping_cost` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','card') DEFAULT 'cash',
  `subtotal` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table: orders
INSERT INTO `orders` (`id`, `customer_name`, `customer_phone`, `customer_city`, `customer_address`, `shipping_method`, `shipping_cost`, `payment_method`, `subtotal`, `total`, `status`, `created_at`, `updated_at`) VALUES
(1, 'rema', '0592106935', 'jenin', 'fog', 'express', '20.00', 'cash', '2827.48', '2847.48', 'pending', '2026-01-18 21:17:05', '2026-01-18 21:17:05'),
(2, 'دييما', '0592106935', 'نابلس', 'باب', 'express', '20.00', 'cash', '2827.48', '2847.48', 'pending', '2026-01-18 21:19:36', '2026-01-18 21:19:36'),
(4, 'ذذذ', '0592106935', 'ذذ', 'ذذ', 'express', '20.00', 'cash', '399.68', '419.68', 'pending', '2026-01-18 21:21:47', '2026-01-18 21:21:47'),
(5, 'ذذ', '0592106935', 'ذذ', 'ذذ', 'express', '20.00', 'cash', '249.78', '269.78', 'pending', '2026-01-18 21:22:28', '2026-01-18 21:22:28'),
(6, 'ذذ', '0592106935', 'ذذ', 'ذذ', 'express', '20.00', 'cash', '400.00', '420.00', 'pending', '2026-01-18 21:23:43', '2026-01-18 21:23:43'),
(7, 'ديمزا', '0592106935', 'جنين', 'بمبم', 'express', '20.00', 'cash', '149.75', '169.75', 'cancelled', '2026-01-18 21:24:28', '2026-01-18 21:34:22'),
(8, 'rema', '0592106935', 'jenin', 'fff', 'express', '20.00', 'cash', '200.00', '220.00', 'delivered', '2026-01-18 21:30:19', '2026-01-18 21:34:16');

-- Table: product_colors
DROP TABLE IF EXISTS `product_colors`;
CREATE TABLE `product_colors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `color_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stock` int DEFAULT '0',
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_colors_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table: product_colors
INSERT INTO `product_colors` (`id`, `product_id`, `color_name`, `stock`, `image_url`, `created_at`) VALUES
(1, 11, 'اسود', 1, '/uploads/products/colors/color-1768679724288-382470156.png', '2026-01-17 19:55:30'),
(2, 12, 'ابيض', 2, '/uploads/products/colors/color-1768680288951-432614524.png', '2026-01-17 20:05:17'),
(3, 12, 'احمر', 3, '/uploads/products/colors/color-1768680315428-489177434.png', '2026-01-17 20:05:17');

-- Table: products
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `stock` int DEFAULT '0',
  `status` enum('draft','published') DEFAULT 'published',
  `is_featured` tinyint(1) DEFAULT '0',
  `is_exclusive` tinyint(1) DEFAULT '0',
  `category_id` int DEFAULT NULL,
  `subcategory_id` int DEFAULT NULL,
  `company_id` int DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `hover_image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `category_id` (`category_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `products_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table: products
INSERT INTO `products` (`id`, `name`, `sku`, `description`, `price`, `stock`, `status`, `is_featured`, `is_exclusive`, `category_id`, `subcategory_id`, `company_id`, `image_url`, `hover_image_url`, `created_at`, `updated_at`) VALUES
(1, 'منتج تجريبي 1', NULL, 'وصف المنتج التجريبي الأول', '99.99', 50, 'published', 0, 0, 1, NULL, NULL, NULL, NULL, '2026-01-17 17:11:09', '2026-01-17 17:11:09'),
(2, 'منتج تجريبي 2', NULL, 'وصف المنتج التجريبي الثاني', '149.99', 30, 'published', 0, 0, 2, NULL, NULL, NULL, NULL, '2026-01-17 17:11:09', '2026-01-17 17:11:09'),
(4, 'منتج تجريبي 4', NULL, 'وصف المنتج التجريبي الرابع', '199.99', 20, 'published', 0, 0, NULL, NULL, NULL, NULL, NULL, '2026-01-17 17:11:09', '2026-01-17 17:11:09'),
(5, 'منتج تجريبي 5', NULL, 'وصف المنتج التجريبي الخامس', '129.99', 40, 'published', 0, 0, 1, NULL, NULL, NULL, NULL, '2026-01-17 17:11:09', '2026-01-17 17:11:09'),
(6, 'منتج تجريبي 6', NULL, 'وصف المنتج التجريبي السادس', '89.99', 60, 'published', 0, 0, 2, NULL, NULL, NULL, NULL, '2026-01-17 17:11:09', '2026-01-17 17:11:09'),
(8, 'منتج تجريبي 8', NULL, 'وصف المنتج التجريبي الثامن', '119.99', 35, 'published', 0, 0, NULL, NULL, NULL, NULL, NULL, '2026-01-17 17:11:09', '2026-01-17 17:11:09'),
(9, 'asd', 'PROD-001', 'gh ', '24.89', 2, 'published', 1, 0, 5, NULL, 3, '/uploads/products/product-1768675514656-537440986.png', '/uploads/products/product-hover-1768675520116-806294387.png', '2026-01-17 18:45:56', '2026-01-17 18:45:56'),
(11, 'شنتالاتميمينل', 'PROD-002', NULL, '233.70', -1, 'published', 1, 0, 5, 2, 5, '/uploads/products/product-1768677471832-529244843.png', NULL, '2026-01-17 19:19:22', '2026-01-18 21:19:36'),
(12, 'يي', 'PROD-003', 'css', '2344.00', 3, 'published', 1, 0, 5, 3, 5, '/uploads/products/product-1768680230649-656894972.png', NULL, '2026-01-17 20:05:17', '2026-01-18 21:19:36'),
(13, 'ساعة ', 'PROD-004', NULL, '149.75', 0, 'published', 1, 0, 6, NULL, NULL, '/uploads/products/product-1768767829992-746456970.png', '/uploads/products/product-hover-1768767837303-996683863.png', '2026-01-18 20:24:24', '2026-01-18 21:24:28'),
(14, 'ساعة ', 'PROD-005', NULL, '149.90', 0, 'published', 1, 0, 6, NULL, 7, '/uploads/products/product-1768767882332-309474833.png', '/uploads/products/product-hover-1768767888615-24109806.png', '2026-01-18 20:25:15', '2026-01-18 21:21:47'),
(15, 'ساعة رجالي', 'PROD-006', NULL, '200.00', 3, 'draft', 1, 0, 7, NULL, 7, '/uploads/products/product-1768767933209-149632506.png', '/uploads/products/product-hover-1768767938855-726389360.png', '2026-01-18 20:26:11', '2026-01-18 20:26:11'),
(16, 'ساعة رجالي ', 'PROD-007', NULL, '249.78', -1, 'published', 1, 0, 7, NULL, 7, '/uploads/products/product-1768767982533-983864235.png', '/uploads/products/product-hover-1768767988435-451155805.png', '2026-01-18 20:26:56', '2026-01-18 21:22:28'),
(17, 'شنطة ', 'PROD-008', NULL, '200.00', 2, 'published', 1, 0, 5, 2, 4, '/uploads/products/product-1768768026419-232286179.png', '/uploads/products/product-hover-1768768030778-29952325.png', '2026-01-18 20:27:57', '2026-01-18 21:30:19'),
(18, 'شنطة ', 'PROD-009', NULL, '200.00', 2, 'published', 0, 0, 5, 2, 6, '/uploads/products/product-1768768088408-285760458.png', '/uploads/products/product-hover-1768768093916-179651307.png', '2026-01-18 20:28:45', '2026-01-18 21:23:43');

-- Table: settings
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `site_logo` varchar(255) DEFAULT NULL,
  `site_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table: settings
INSERT INTO `settings` (`id`, `site_logo`, `site_image`, `created_at`, `updated_at`) VALUES
(1, '/uploads/companies/company-1768739499587-836709619.png', '/uploads/categories/category-1768739725952-453575861.jpg', '2026-01-17 19:09:01', '2026-01-18 12:35:28');

-- Table: subcategories
DROP TABLE IF EXISTS `subcategories`;
CREATE TABLE `subcategories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `subcategories_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table: subcategories
INSERT INTO `subcategories` (`id`, `category_id`, `name`, `description`, `image_url`, `created_at`) VALUES
(1, 5, 'شنط حجم صغير', NULL, '/uploads/subcategories/subcategory-1768672278115-35490678.png', '2026-01-17 17:51:20'),
(2, 5, 'شنط حجم وسط', NULL, '/uploads/subcategories/subcategory-1768672349028-500257233.png', '2026-01-17 17:52:42'),
(3, 5, 'شنط حجم كبير', 'جيدد', '/uploads/subcategories/subcategory-1768672372271-386236638.png', '2026-01-17 17:52:59');

-- Table: users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` enum('admin','customer') DEFAULT 'customer',
  `phone` varchar(50) DEFAULT NULL,
  `address` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table: users
INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `phone`, `address`, `created_at`, `updated_at`) VALUES
(1, 'admin@sprint.com', 'admin123', 'Admin', 'admin', NULL, NULL, '2026-01-17 17:11:09', '2026-01-17 17:11:09');

