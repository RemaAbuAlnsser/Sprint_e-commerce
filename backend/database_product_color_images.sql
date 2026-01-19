-- جدول صور الألوان الفرعية
CREATE TABLE IF NOT EXISTS product_color_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_color_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_color_id) REFERENCES product_colors(id) ON DELETE CASCADE,
  INDEX idx_product_color_id (product_color_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
