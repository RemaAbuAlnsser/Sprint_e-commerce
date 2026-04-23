-- =====================================================
-- Script to DELETE ALL DATA from Magnetix Database
-- ⚠️ WARNING: This will permanently delete all data!
-- =====================================================

-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- Delete all data from tables (in correct order to respect dependencies)

-- 1. Delete product-related data first
DELETE FROM product_images;
DELETE FROM product_colors;
DELETE FROM product_variants;
DELETE FROM products;

-- 2. Delete categories (subcategories first, then parent categories)
DELETE FROM categories WHERE parent_id IS NOT NULL;
DELETE FROM categories WHERE parent_id IS NULL;

-- 3. Delete brands
DELETE FROM brands;

-- 4. Delete hero images
DELETE FROM hero_images;

-- 5. Delete stock notifications
DELETE FROM stock_notifications;

-- 6. Delete cart items
DELETE FROM cart_items;

-- 7. Delete orders and order items
DELETE FROM order_items;
DELETE FROM orders;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- Reset sequences (auto-increment counters) - optional
-- This will reset IDs to start from 1 again
ALTER SEQUENCE IF EXISTS products_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS categories_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS brands_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS product_variants_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS product_colors_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS product_images_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS hero_images_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS stock_notifications_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS cart_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS orders_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS order_items_id_seq RESTART WITH 1;

-- Verify deletion
SELECT 'Products' as table_name, COUNT(*) as remaining_rows FROM products
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Brands', COUNT(*) FROM brands
UNION ALL
SELECT 'Product Variants', COUNT(*) FROM product_variants
UNION ALL
SELECT 'Product Colors', COUNT(*) FROM product_colors
UNION ALL
SELECT 'Product Images', COUNT(*) FROM product_images
UNION ALL
SELECT 'Hero Images', COUNT(*) FROM hero_images
UNION ALL
SELECT 'Stock Notifications', COUNT(*) FROM stock_notifications
UNION ALL
SELECT 'Cart Items', COUNT(*) FROM cart_items
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Order Items', COUNT(*) FROM order_items;
