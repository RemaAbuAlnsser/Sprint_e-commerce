import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/magnetix_store',
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export const initDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        role VARCHAR(20) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS parent_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        handle VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        image_url TEXT,
        banner_image TEXT,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        handle VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        image_url TEXT,
        parent_category_id UUID REFERENCES parent_categories(id) ON DELETE CASCADE,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Add banner_image column to parent_categories if it doesn't exist
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parent_categories' AND column_name = 'banner_image') THEN
          ALTER TABLE parent_categories ADD COLUMN banner_image TEXT;
        END IF;
      END $$;

      -- Add parent_category_id column if it doesn't exist (for existing databases)
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'parent_category_id') THEN
          ALTER TABLE categories ADD COLUMN parent_category_id UUID REFERENCES parent_categories(id) ON DELETE CASCADE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'display_order') THEN
          ALTER TABLE categories ADD COLUMN display_order INTEGER DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'is_active') THEN
          ALTER TABLE categories ADD COLUMN is_active BOOLEAN DEFAULT true;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'updated_at') THEN
          ALTER TABLE categories ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS brands (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        logo_url TEXT,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        title_en VARCHAR(255),
        subtitle VARCHAR(255),
        description TEXT,
        handle VARCHAR(255) UNIQUE NOT NULL,
        thumbnail TEXT,
        hover_image TEXT,
        status VARCHAR(20) DEFAULT 'draft',
        category_id UUID REFERENCES categories(id),
        brand_id UUID REFERENCES brands(id),
        show_in_latest BOOLEAN DEFAULT true,
        is_exclusive BOOLEAN DEFAULT false,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Add is_exclusive column if it doesn't exist (for existing databases)
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_exclusive') THEN
          ALTER TABLE products ADD COLUMN is_exclusive BOOLEAN DEFAULT false;
        END IF;
      END $$;

      -- Add display_order to products if it doesn't exist
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'display_order') THEN
          ALTER TABLE products ADD COLUMN display_order INTEGER DEFAULT 0;
        END IF;
      END $$;

      -- Add title_en to products if it doesn't exist
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'title_en') THEN
          ALTER TABLE products ADD COLUMN title_en VARCHAR(255);
        END IF;
      END $$;

      -- Add display_order to brands if it doesn't exist
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brands' AND column_name = 'display_order') THEN
          ALTER TABLE brands ADD COLUMN display_order INTEGER DEFAULT 0;
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS product_colors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        color_name VARCHAR(100) NOT NULL,
        image_url TEXT,
        inventory_quantity INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Add inventory_quantity to product_colors if it doesn't exist
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_colors' AND column_name = 'inventory_quantity') THEN
          ALTER TABLE product_colors ADD COLUMN inventory_quantity INTEGER DEFAULT 0;
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS product_variants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        sku VARCHAR(100),
        price INTEGER NOT NULL DEFAULT 0,
        compare_at_price INTEGER,
        inventory_quantity INTEGER DEFAULT 0,
        options JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS product_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        alt TEXT,
        position INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS carts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        email VARCHAR(255),
        region VARCHAR(50) DEFAULT 'sa',
        currency_code VARCHAR(10) DEFAULT 'SAR',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS cart_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
        variant_id UUID REFERENCES product_variants(id),
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        display_id SERIAL,
        cart_id UUID REFERENCES carts(id),
        user_id UUID REFERENCES users(id),
        email VARCHAR(255),
        shipping_address JSONB,
        billing_address JSONB,
        subtotal INTEGER DEFAULT 0,
        shipping_total INTEGER DEFAULT 0,
        tax_total INTEGER DEFAULT 0,
        total INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'pending',
        payment_status VARCHAR(20) DEFAULT 'awaiting',
        fulfillment_status VARCHAR(20) DEFAULT 'not_fulfilled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        variant_id UUID REFERENCES product_variants(id),
        title VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price INTEGER NOT NULL DEFAULT 0,
        thumbnail TEXT,
        color VARCHAR(100)
      );
      
      -- Add thumbnail and color columns if they don't exist (for existing databases)
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'thumbnail') THEN
          ALTER TABLE order_items ADD COLUMN thumbnail TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'color') THEN
          ALTER TABLE order_items ADD COLUMN color VARCHAR(100);
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS regions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        currency_code VARCHAR(10) NOT NULL,
        tax_rate DECIMAL(5,2) DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS shipping_options (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        region_id UUID REFERENCES regions(id),
        name VARCHAR(100) NOT NULL,
        price INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS stock_notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        notified BOOLEAN DEFAULT false,
        notified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_stock_notifications_product_id ON stock_notifications(product_id);
      CREATE INDEX IF NOT EXISTS idx_stock_notifications_variant_id ON stock_notifications(variant_id);
      CREATE INDEX IF NOT EXISTS idx_stock_notifications_email ON stock_notifications(email);
      CREATE INDEX IF NOT EXISTS idx_stock_notifications_notified ON stock_notifications(notified);

      CREATE TABLE IF NOT EXISTS user_notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_user_notifications_email ON user_notifications(email);
      CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON user_notifications(read);

      CREATE TABLE IF NOT EXISTS site_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        setting_key VARCHAR(255) UNIQUE NOT NULL,
        setting_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_settings_key ON site_settings(setting_key);

      CREATE TABLE IF NOT EXISTS hero_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        image_url TEXT NOT NULL,
        position INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_hero_images_position ON hero_images(position);
      CREATE INDEX IF NOT EXISTS idx_hero_images_active ON hero_images(is_active);

      INSERT INTO site_settings (setting_key, setting_value)
      VALUES ('hero_background_image', '/uploads/background/background2.webp')
      ON CONFLICT (setting_key) DO NOTHING;

      INSERT INTO site_settings (setting_key, setting_value)
      VALUES ('hero_background_dimensions', '1920x1080')
      ON CONFLICT (setting_key) DO NOTHING;
    `);
    console.log('✅ Database tables initialized');
  } finally {
    client.release();
  }
};

export default pool;
