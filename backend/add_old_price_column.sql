-- إضافة حقل السعر قبل الخصم إلى جدول products
ALTER TABLE products ADD COLUMN old_price DECIMAL(10, 2) DEFAULT NULL AFTER price;
