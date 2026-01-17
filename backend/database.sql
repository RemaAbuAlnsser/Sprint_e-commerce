-- Create database
CREATE DATABASE IF NOT EXISTS SprintDB;
USE SprintDB;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'customer') DEFAULT 'customer',
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INT DEFAULT 0,
  category_id INT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
  shipping_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password, name, role) VALUES 
('admin@sprint.com', 'admin123', 'Admin', 'admin')
ON DUPLICATE KEY UPDATE email=email;

-- Insert sample categories
INSERT INTO categories (name, description) VALUES 
('الإلكترونيات', 'أجهزة إلكترونية ومستلزماتها'),
('الملابس', 'ملابس رجالية ونسائية'),
('المنزل', 'أدوات ومستلزمات منزلية'),
('الرياضة', 'معدات رياضية')
ON DUPLICATE KEY UPDATE name=name;

-- Insert sample products (only if categories exist)
INSERT IGNORE INTO products (name, description, price, stock, category_id) VALUES 
('منتج تجريبي 1', 'وصف المنتج التجريبي الأول', 99.99, 50, 1),
('منتج تجريبي 2', 'وصف المنتج التجريبي الثاني', 149.99, 30, 2),
('منتج تجريبي 3', 'وصف المنتج التجريبي الثالث', 79.99, 100, 3),
('منتج تجريبي 4', 'وصف المنتج التجريبي الرابع', 199.99, 20, 4),
('منتج تجريبي 5', 'وصف المنتج التجريبي الخامس', 129.99, 40, 1),
('منتج تجريبي 6', 'وصف المنتج التجريبي السادس', 89.99, 60, 2),
('منتج تجريبي 7', 'وصف المنتج التجريبي السابع', 159.99, 25, 3),
('منتج تجريبي 8', 'وصف المنتج التجريبي الثامن', 119.99, 35, 4);
