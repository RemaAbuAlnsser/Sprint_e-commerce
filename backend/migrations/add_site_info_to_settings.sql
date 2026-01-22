-- Add site information columns to settings table
ALTER TABLE `settings` 
ADD COLUMN `site_name` VARCHAR(255) DEFAULT NULL AFTER `site_image`,
ADD COLUMN `site_description` TEXT DEFAULT NULL AFTER `site_name`,
ADD COLUMN `contact_email` VARCHAR(255) DEFAULT NULL AFTER `site_description`,
ADD COLUMN `contact_phone` VARCHAR(50) DEFAULT NULL AFTER `contact_email`,
ADD COLUMN `address` TEXT DEFAULT NULL AFTER `contact_phone`,
ADD COLUMN `facebook_url` VARCHAR(255) DEFAULT NULL AFTER `address`,
ADD COLUMN `instagram_url` VARCHAR(255) DEFAULT NULL AFTER `facebook_url`,
ADD COLUMN `whatsapp_url` VARCHAR(255) DEFAULT NULL AFTER `instagram_url`;
