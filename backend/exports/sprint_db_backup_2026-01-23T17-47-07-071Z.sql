-- Sprint E-Commerce Database Backup
-- Generated on: 2026-01-23T17:47:07.071Z
-- Database: SprintDB

SET FOREIGN_KEY_CHECKS = 0;

-- Table structure for users
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table users
INSERT INTO `users` VALUES
(1, 'admin@sprint.com', '$2b$10$BwydK6suWaAzyEF0SHaQi./Ky5dudsv0ZklvFgkzG71wW3Op0tpWq', 'Admin', 'admin', NULL, NULL, '2026-01-17 15:11:09', '2026-01-23 17:18:21'),
(2, 'test@sprint.com', '$2b$10$H1/YIY2VTdbhbyTryJoGLecR5rSwcvSsjn8DepXcOFmz5qLjVX4ai', 'Test User', 'customer', NULL, NULL, '2026-01-23 16:53:02', '2026-01-23 16:53:02'),
(3, 'admin@test.com', '$2b$10$BiiICZ3N7df8V7K7nqj2O.4EJq8Oc769XvV6UsDkPuve.Zn/9zSGG', 'Admin Test', 'admin', NULL, NULL, '2026-01-23 16:53:24', '2026-01-23 16:56:49');

-- Table structure for categories
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `image_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table categories
INSERT INTO `categories` VALUES
(1, 'الإلكترونياات', 'أجهزة إلكترونية ومستلزماتها', '2026-01-17 15:11:09', '/uploads/categories/category-1769189230267-858146858.jpg'),
(2, 'الملابس', 'ملابس رجالية ونسائية', '2026-01-17 15:11:09', '/uploads/categories/category-1769189245696-457911661.jpg'),
(5, 'شناتي نسائية', 'مجموعة من الشركات الفاخرة', '2026-01-17 15:19:37', '/uploads/categories/category-1768670349218-586502281.png'),
(6, 'ساعات نسائية ', NULL, '2026-01-18 18:17:58', '/uploads/categories/category-1768767469357-828527888.png'),
(7, 'ساعات رجالي ', NULL, '2026-01-18 18:20:27', '/uploads/categories/category-1768767618620-317239394.png');

-- Table structure for subcategories
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

-- Data for table subcategories
INSERT INTO `subcategories` VALUES
(1, 5, 'شنط حجم صغير', NULL, '/uploads/subcategories/subcategory-1768672278115-35490678.png', '2026-01-17 15:51:20'),
(2, 5, 'شنط حجم وسط', NULL, '/uploads/subcategories/subcategory-1768672349028-500257233.png', '2026-01-17 15:52:42'),
(3, 5, 'شنط حجم كبير', 'جيدد', '/uploads/subcategories/subcategory-1768672372271-386236638.png', '2026-01-17 15:52:59');

-- Table structure for companies
DROP TABLE IF EXISTS `companies`;
CREATE TABLE `companies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table companies
INSERT INTO `companies` VALUES
(3, 'DIORR', '/uploads/companies/company-1768671084694-298379361.png', '2026-01-17 15:31:32'),
(4, 'Louis Vuitton', '/uploads/companies/company-1768672504310-182596540.png', '2026-01-17 15:55:05'),
(5, 'Gucci', '/uploads/companies/company-1768672558471-258909590.png', '2026-01-17 15:56:00'),
(6, 'Prada', '/uploads/companies/company-1768672710018-162389395.png', '2026-01-17 15:56:40'),
(7, 'Rolex', '/uploads/companies/company-1768767811321-473061786.png', '2026-01-18 18:23:35');

-- Table structure for products
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `old_price` decimal(10,2) DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table products
INSERT INTO `products` VALUES
(1, 'منتج تجريبي 1', NULL, 'وصف المنتج التجريبي الأول', '99.99', NULL, 50, 'published', 0, 0, 1, NULL, NULL, NULL, NULL, '2026-01-17 15:11:09', '2026-01-17 15:11:09'),
(2, 'منتج تجريبي 2', NULL, 'وصف المنتج التجريبي الثاني', '149.99', NULL, 30, 'published', 0, 0, 2, NULL, NULL, NULL, NULL, '2026-01-17 15:11:09', '2026-01-17 15:11:09'),
(4, 'منتج تجريبي 4', NULL, 'وصف المنتج التجريبي الرابع', '199.99', NULL, 20, 'published', 0, 0, NULL, NULL, NULL, NULL, NULL, '2026-01-17 15:11:09', '2026-01-17 15:11:09'),
(5, 'منتج تجريبي 5', NULL, 'وصف المنتج التجريبي الخامس', '129.99', NULL, 40, 'published', 0, 0, 1, NULL, NULL, NULL, NULL, '2026-01-17 15:11:09', '2026-01-17 15:11:09'),
(6, 'منتج تجريبي 6', NULL, 'وصف المنتج التجريبي السادس', '89.99', NULL, 60, 'published', 0, 0, 2, NULL, NULL, NULL, NULL, '2026-01-17 15:11:09', '2026-01-17 15:11:09'),
(8, 'منتج تجريبي 8', NULL, 'وصف المنتج التجريبي الثامن', '119.99', NULL, 35, 'published', 0, 0, NULL, NULL, NULL, NULL, NULL, '2026-01-17 15:11:09', '2026-01-17 15:11:09'),
(9, 'asd', 'PROD-001', 'gh ', '24.89', NULL, 2, 'published', 1, 0, 5, NULL, 3, '/uploads/products/product-1768675514656-537440986.png', '/uploads/products/product-hover-1768675520116-806294387.png', '2026-01-17 16:45:56', '2026-01-17 16:45:56'),
(11, 'شنتالاتميمينل', 'PROD-002', NULL, '233.70', NULL, -1, 'published', 1, 0, 5, 2, 5, '/uploads/products/product-1768677471832-529244843.png', NULL, '2026-01-17 17:19:22', '2026-01-18 19:19:36'),
(12, 'حقيبة كتف فاخرة – تصميم أيقوني', 'PROD-003', 'حقيبة أنيقة بتصميمها المنحني المميز المستوحى من سرج الحصان، تعكس ذوقًا راقيًا ولمسة فخامة واضحة. مصنوعة من جلد عالي الجودة بملمس ناعم، مع تفاصيل معدنية بلون ذهبي تضيف لمسة فاخرة وجذابة. اللون العنابي العميق يجعلها خيارًا مثاليًا للإطلالات اليومية والمسائية على حد سواء.
المميزات:
تصميم أيقوني أنثوي لافت
جلد فاخر عالي الجودة
إغلاق أمامي أنيق مع تفصيل معدني مميز
حزام كتف مريح مع حلقات معدنية فاخرة
حجم عملي يناسب الأساسيات اليومية
حقيبة مثالية لمحبات الأناقة الكلاسيكية العصرية، وتُعد قطعة مميزة من توقيع Dior تضيف فخامة واضحة لأي إطلالة.
إذا حابة:', '400.00', '1000.00', 3, 'published', 1, 0, 5, 3, 5, '/uploads/products/product-1768680230649-656894972.png', NULL, '2026-01-17 18:05:17', '2026-01-19 16:02:43'),
(13, 'ساعة ', 'PROD-004', NULL, '149.75', NULL, 5, 'published', 1, 0, 6, NULL, NULL, '/uploads/products/product-1768767829992-746456970.png', '/uploads/products/product-hover-1768767837303-996683863.png', '2026-01-18 18:24:24', '2026-01-19 13:43:12'),
(14, 'ساعة ', 'PROD-005', NULL, '149.90', NULL, 3, 'published', 1, 0, 6, NULL, 7, '/uploads/products/product-1768767882332-309474833.png', '/uploads/products/product-hover-1768767888615-24109806.png', '2026-01-18 18:25:15', '2026-01-23 14:10:36'),
(15, 'ساعة رجالي', 'PROD-006', NULL, '100.00', '200.00', 3, 'published', 1, 0, 7, NULL, 7, '/uploads/products/product-1768767933209-149632506.png', '/uploads/products/product-hover-1768767938855-726389360.png', '2026-01-18 18:26:11', '2026-01-19 15:39:14'),
(16, 'ساعة رجالي ', 'PROD-007', NULL, '150.00', '200.00', 4, 'published', 1, 0, 7, NULL, 7, '/uploads/products/product-1768767982533-983864235.png', '/uploads/products/product-hover-1768767988435-451155805.png', '2026-01-18 18:26:56', '2026-01-19 15:52:43'),
(17, 'شنطة ', 'PROD-008', NULL, '200.00', NULL, 2, 'published', 1, 0, 5, 2, 4, '/uploads/products/product-1768768026419-232286179.png', '/uploads/products/product-hover-1768768030778-29952325.png', '2026-01-18 18:27:57', '2026-01-18 19:30:19'),
(18, 'شنطة ', 'PROD-009', NULL, '200.00', NULL, 1, 'published', 0, 0, 5, 2, 6, '/uploads/products/product-1768768088408-285760458.png', '/uploads/products/product-hover-1768768093916-179651307.png', '2026-01-18 18:28:45', '2026-01-23 17:13:26'),
(22, 'BAg', 'PROD-1010', 'حقيبة كتف فاخرة – تصميم أيقوني
حقيبة أنيقة بتصميمها المنحني المميز المستوحى من سرج الحصان، تعكس ذوقًا راقيًا ولمسة فخامة واضحة. مصنوعة من جلد عالي الجودة بملمس ناعم، مع تفاصيل معدنية بلون ذهبي تضيف لمسة فاخرة وجذابة. اللون العنابي العميق يجعلها خيارًا مثاليًا للإطلالات اليومية والمسائية على حد سواء.
المميزات:
تصميم أيقوني أنثوي لافت
جلد فاخر عالي الجودة
إغلاق أمامي أنيق مع تفصيل معدني مميز
حزام كتف مريح مع حلقات معدنية فاخرة
حجم عملي يناسب الأساسيات اليومية
حقيبة مثالية لمحبات الأناقة الكلاسيكية العصرية، وتُعد قطعة مميزة من توقيع Dior تضيف فخامة واضحة لأي إطلالة.', '200.00', NULL, 20, 'published', 1, 0, 5, 1, 3, '/uploads/products/product-1768838628638-478827508.png', '/uploads/products/product-hover-1768838633554-172282607.png', '2026-01-19 14:05:00', '2026-01-19 14:05:00'),
(23, 'ساعة روليكس', 'PROD-1012', NULL, '200.00', NULL, 19, 'published', 1, 0, 7, NULL, 7, '/uploads/products/product-1768841986945-854861002.png', '/uploads/products/product-hover-1768841991334-725542157.png', '2026-01-19 15:00:53', '2026-01-20 15:15:31'),
(24, 'حقيبة كتف جيدة', 'bag-good', 'حقيبة كتف فاخرة – تصميم أيقوني
حقيبة أنيقة بتصميمها المنحني المميز المستوحى من سرج الحصان، تعكس ذوقًا راقيًا ولمسة فخامة واضحة. مصنوعة من جلد عالي الجودة بملمس ناعم، مع تفاصيل معدنية بلون ذهبي تضيف لمسة فاخرة وجذابة. اللون العنابي العميق يجعلها خيارًا مثاليًا للإطلالات اليومية والمسائية على حد سواء.
المميزات:
تصميم أيقوني أنثوي لافت
جلد فاخر عالي الجودة
إغلاق أمامي أنيق مع تفصيل معدني مميز
حزام كتف مريح مع حلقات معدنية فاخرة
حجم عملي يناسب الأساسيات اليومية
حقيبة مثالية لمحبات الأناقة الكلاسيكية العصرية، وتُعد قطعة مميزة من توقيع Dior تضيف فخامة واضحة لأي إطلالة.
إذا حابة:', '99.89', NULL, 10, 'published', 0, 0, 5, 3, 5, '/uploads/products/product-1768846938275-448839395.png', '/uploads/products/product-hover-1768846962446-574688332.png', '2026-01-19 16:25:00', '2026-01-19 16:32:00'),
(25, 'زيد', 'rrras', 'dawfawfaaaaaaaaaaaaaafsffsfff', '1000.00', '30000.00', 0, 'published', 0, 0, 2, NULL, 7, '/uploads/products/product-1768863863692-318709978.webp', '/uploads/products/product-hover-1768863872418-263098416.webp', '2026-01-19 23:05:58', '2026-01-20 15:14:37');

-- Table structure for product_colors
DROP TABLE IF EXISTS `product_colors`;
CREATE TABLE `product_colors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `color_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `stock` int DEFAULT '0',
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_colors_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table product_colors
INSERT INTO `product_colors` VALUES
(1, 11, 'اسود', 1, '/uploads/products/colors/color-1768679724288-382470156.png', '2026-01-17 17:55:30'),
(2, 12, 'ابيض', 2, '/uploads/products/colors/color-1768680288951-432614524.png', '2026-01-17 18:05:17'),
(3, 12, 'احمر', 3, '/uploads/products/colors/color-1768680315428-489177434.png', '2026-01-17 18:05:17'),
(4, 9, 'ابيض', 2, '/uploads/products/colors/color-1768846813560-771538544.png', '2026-01-19 16:20:27'),
(5, 24, 'اسود', 5, '/uploads/products/colors/color-1768847058474-74941975.png', '2026-01-19 16:25:00'),
(7, 24, 'احمر', 5, '/uploads/products/colors/color-1768847503418-796287503.png', '2026-01-19 16:32:00');

-- Table structure for product_images
DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table product_images
INSERT INTO `product_images` VALUES
(1, 22, '/uploads/products/gallery/gallery-1768838639478-297976626.png', 0, '2026-01-19 14:05:00'),
(2, 22, '/uploads/products/gallery/gallery-1768838644665-183322943.png', 1, '2026-01-19 14:05:00'),
(3, 22, '/uploads/products/gallery/gallery-1768838655595-157087122.png', 2, '2026-01-19 14:05:00'),
(4, 23, '/uploads/products/gallery/gallery-1768841997434-354936150.png', 0, '2026-01-19 15:00:53'),
(5, 23, '/uploads/products/gallery/gallery-1768842001945-292674859.png', 1, '2026-01-19 15:00:53'),
(6, 23, '/uploads/products/gallery/gallery-1768842009138-450834678.png', 2, '2026-01-19 15:00:53'),
(7, 23, '/uploads/products/gallery/gallery-1768842017309-509431330.png', 3, '2026-01-19 15:00:53'),
(8, 24, '/uploads/products/gallery/gallery-1768846970026-83124394.png', 0, '2026-01-19 16:25:00'),
(9, 24, '/uploads/products/gallery/gallery-1768846974124-862132353.png', 1, '2026-01-19 16:25:00');

-- Table structure for product_color_images
DROP TABLE IF EXISTS `product_color_images`;
CREATE TABLE `product_color_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_color_id` int NOT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_color_id` (`product_color_id`),
  CONSTRAINT `product_color_images_ibfk_1` FOREIGN KEY (`product_color_id`) REFERENCES `product_colors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for orders
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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table orders
INSERT INTO `orders` VALUES
(1, 'rema', '0592106935', 'jenin', 'fog', 'express', '20.00', 'cash', '2827.48', '2847.48', 'pending', '2026-01-18 19:17:05', '2026-01-18 19:17:05'),
(2, 'دييما', '0592106935', 'نابلس', 'باب', 'express', '20.00', 'cash', '2827.48', '2847.48', 'pending', '2026-01-18 19:19:36', '2026-01-18 19:19:36'),
(4, 'ذذذ', '0592106935', 'ذذ', 'ذذ', 'express', '20.00', 'cash', '399.68', '419.68', 'pending', '2026-01-18 19:21:47', '2026-01-18 19:21:47'),
(5, 'ذذ', '0592106935', 'ذذ', 'ذذ', 'express', '20.00', 'cash', '249.78', '269.78', 'pending', '2026-01-18 19:22:28', '2026-01-18 19:22:28'),
(6, 'ذذ', '0592106935', 'ذذ', 'ذذ', 'express', '20.00', 'cash', '400.00', '420.00', 'pending', '2026-01-18 19:23:43', '2026-01-18 19:23:43'),
(7, 'ديمزا', '0592106935', 'جنين', 'بمبم', 'express', '20.00', 'cash', '149.75', '169.75', 'cancelled', '2026-01-18 19:24:28', '2026-01-18 19:34:22'),
(8, 'rema', '0592106935', 'jenin', 'fff', 'express', '20.00', 'cash', '200.00', '220.00', 'delivered', '2026-01-18 19:30:19', '2026-01-18 19:34:16'),
(9, 'zaid abu samra', '0594061585', 'fawfawd', 'zadawf', 'internal', '70.00', 'cash', '200.00', '270.00', 'pending', '2026-01-20 15:15:31', '2026-01-20 15:15:31'),
(10, 'omar ali', '0599999999', 'jenin', 'hh', 'express', '20.00', 'cash', '149.90', '169.90', 'pending', '2026-01-23 14:10:36', '2026-01-23 14:10:36'),
(11, 're', '0592106935', 'er', 'ww', 'express', '20.00', 'cash', '200.00', '220.00', 'pending', '2026-01-23 17:13:26', '2026-01-23 17:13:26');

-- Table structure for order_items
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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table order_items
INSERT INTO `order_items` VALUES
(1, 1, 11, 'شنتالاتميمينل', '233.70', 1, '233.70', '2026-01-18 19:17:05'),
(2, 1, 16, 'ساعة رجالي ', '249.78', 1, '249.78', '2026-01-18 19:17:05'),
(3, 1, 12, 'يي', '2344.00', 1, '2344.00', '2026-01-18 19:17:05'),
(4, 2, 11, 'شنتالاتميمينل', '233.70', 1, '233.70', '2026-01-18 19:19:36'),
(5, 2, 16, 'ساعة رجالي ', '249.78', 1, '249.78', '2026-01-18 19:19:36'),
(6, 2, 12, 'يي', '2344.00', 1, '2344.00', '2026-01-18 19:19:36'),
(10, 4, 14, 'ساعة ', '149.90', 1, '149.90', '2026-01-18 19:21:47'),
(11, 4, 16, 'ساعة رجالي ', '249.78', 1, '249.78', '2026-01-18 19:21:47'),
(12, 5, 16, 'ساعة رجالي ', '249.78', 1, '249.78', '2026-01-18 19:22:28'),
(13, 6, 17, 'شنطة ', '200.00', 1, '200.00', '2026-01-18 19:23:43'),
(14, 6, 18, 'شنطة ', '200.00', 1, '200.00', '2026-01-18 19:23:43'),
(15, 7, 13, 'ساعة ', '149.75', 1, '149.75', '2026-01-18 19:24:28'),
(16, 8, 17, 'شنطة ', '200.00', 1, '200.00', '2026-01-18 19:30:19'),
(17, 9, 23, 'ساعة روليكس', '200.00', 1, '200.00', '2026-01-20 15:15:31'),
(18, 10, 14, 'ساعة ', '149.90', 1, '149.90', '2026-01-23 14:10:36'),
(19, 11, 18, 'شنطة ', '200.00', 1, '200.00', '2026-01-23 17:13:26');

-- Table structure for settings
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `site_logo` varchar(255) DEFAULT NULL,
  `site_image` varchar(255) DEFAULT NULL,
  `site_name` varchar(255) DEFAULT NULL,
  `site_description` text,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(50) DEFAULT NULL,
  `address` text,
  `facebook_url` varchar(255) DEFAULT NULL,
  `instagram_url` varchar(255) DEFAULT NULL,
  `whatsapp_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table settings
INSERT INTO `settings` VALUES
(1, '/uploads/companies/company-1769093110255-195980110.png', '/uploads/categories/category-1768739725952-453575861.jpg', 'Spirit Store', 'متجر إلكتروني متكاملل', '', '0566331012', 'نابلس، فلسطين', 'https://www.facebook.com/share/1DZdGtfsGT/?mibextid=wwXIfr', 'https://www.instagram.com/spirit.bags_?igsh=M2I1c21tdXYwdWtm', '+972 56-633-1012', '2026-01-17 17:09:01', '2026-01-22 15:26:07');

-- Table structure for site_images
DROP TABLE IF EXISTS `site_images`;
CREATE TABLE `site_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image_url` varchar(255) NOT NULL,
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_display_order` (`display_order`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table site_images
INSERT INTO `site_images` VALUES
(11, '/uploads/categories/category-1768850763620-9824306.jpg', 0, '2026-01-19 17:26:36'),
(12, '/uploads/categories/category-1768850772064-927172896.jpg', 1, '2026-01-19 17:26:36'),
(13, '/uploads/categories/category-1768850793954-74770926.jpg', 2, '2026-01-19 17:26:36');

SET FOREIGN_KEY_CHECKS = 1;
