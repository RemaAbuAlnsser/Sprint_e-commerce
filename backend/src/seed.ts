import bcrypt from 'bcryptjs';
import { query, initDatabase } from './database';
import dotenv from 'dotenv';

dotenv.config();

const seed = async () => {
  try {
    console.log('🌱 Starting database seed...');
    
    await initDatabase();
    
    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'noor@spirit.com';
    const adminPassword = process.env.ADMIN_PASSWORD || '12341234';
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    
    await query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES ($1, $2, 'Admin', 'Spirit', 'admin')
      ON CONFLICT (email) DO UPDATE SET password_hash = $2, role = 'admin'
    `, [adminEmail, passwordHash]);
    console.log('✅ Admin user created: ' + adminEmail);
    
    // Create regions
    await query(`
      INSERT INTO regions (id, name, currency_code, tax_rate) VALUES
        (gen_random_uuid(), 'Saudi Arabia', 'SAR', 15),
        (gen_random_uuid(), 'United States', 'USD', 0)
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Regions created');
    
    // Create parent categories (الأقسام الرئيسية)
    const parentCategories = [
      { name: 'مكياج', handle: 'makeup', description: 'جميع منتجات المكياج والتجميل', display_order: 1 },
      { name: 'عناية بالبشرة', handle: 'skincare', description: 'منتجات العناية بالبشرة والوجه', display_order: 2 },
      { name: 'عطور', handle: 'perfumes', description: 'عطور نسائية ورجالية فاخرة', display_order: 3 },
      { name: 'عناية بالشعر', handle: 'haircare', description: 'منتجات العناية بالشعر', display_order: 4 }
    ];
    
    const parentCatMap: { [key: string]: string } = {};
    
    for (const pCat of parentCategories) {
      const result = await query(`
        INSERT INTO parent_categories (name, handle, description, display_order)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (handle) DO UPDATE 
        SET name = $1, description = $3, display_order = $4
        RETURNING id, handle
      `, [pCat.name, pCat.handle, pCat.description, pCat.display_order]);
      
      parentCatMap[pCat.handle] = result.rows[0].id;
    }
    console.log('✅ Parent categories created');
    
    // Create subcategories (الأقسام الثانوية)
    const subcategories = [
      // مكياج
      { name: 'أحمر شفاه', handle: 'lipstick', description: 'أحمر شفاه بألوان متنوعة', parent: 'makeup', display_order: 1 },
      { name: 'ماسكارا', handle: 'mascara', description: 'ماسكارا لرموش كثيفة', parent: 'makeup', display_order: 2 },
      { name: 'كونسيلر', handle: 'concealer', description: 'كونسيلر لإخفاء العيوب', parent: 'makeup', display_order: 3 },
      { name: 'فاونديشن', handle: 'foundation', description: 'كريم أساس بدرجات متعددة', parent: 'makeup', display_order: 4 },
      { name: 'آيلاينر', handle: 'eyeliner', description: 'آيلاينر سائل وقلم', parent: 'makeup', display_order: 5 },
      
      // عناية بالبشرة
      { name: 'مرطبات', handle: 'moisturizers', description: 'كريمات مرطبة للبشرة', parent: 'skincare', display_order: 1 },
      { name: 'سيروم', handle: 'serums', description: 'سيروم للعناية المركزة', parent: 'skincare', display_order: 2 },
      { name: 'منظفات', handle: 'cleansers', description: 'غسول ومنظفات الوجه', parent: 'skincare', display_order: 3 },
      { name: 'ماسكات', handle: 'masks', description: 'ماسكات للعناية بالبشرة', parent: 'skincare', display_order: 4 },
      { name: 'واقي شمس', handle: 'sunscreen', description: 'واقي شمس للحماية من الأشعة', parent: 'skincare', display_order: 5 },
      
      // عطور
      { name: 'عطور نسائية', handle: 'women-perfumes', description: 'عطور فاخرة للنساء', parent: 'perfumes', display_order: 1 },
      { name: 'عطور رجالية', handle: 'men-perfumes', description: 'عطور فاخرة للرجال', parent: 'perfumes', display_order: 2 },
      { name: 'عطور يونيسكس', handle: 'unisex-perfumes', description: 'عطور مشتركة', parent: 'perfumes', display_order: 3 },
      
      // عناية بالشعر
      { name: 'شامبو', handle: 'shampoo', description: 'شامبو لجميع أنواع الشعر', parent: 'haircare', display_order: 1 },
      { name: 'بلسم', handle: 'conditioner', description: 'بلسم لترطيب الشعر', parent: 'haircare', display_order: 2 },
      { name: 'ماسك شعر', handle: 'hair-mask', description: 'ماسكات للعناية العميقة', parent: 'haircare', display_order: 3 },
      { name: 'زيوت شعر', handle: 'hair-oils', description: 'زيوت طبيعية للشعر', parent: 'haircare', display_order: 4 }
    ];
    
    const catMap: { [key: string]: string } = {};
    
    for (const subCat of subcategories) {
      const parentId = parentCatMap[subCat.parent];
      if (parentId) {
        const result = await query(`
          INSERT INTO categories (name, handle, description, parent_category_id, display_order)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (handle) DO UPDATE 
          SET name = $1, description = $3, parent_category_id = $4, display_order = $5
          RETURNING id, handle
        `, [subCat.name, subCat.handle, subCat.description, parentId, subCat.display_order]);
        
        catMap[subCat.handle] = result.rows[0].id;
      }
    }
    console.log('✅ Subcategories created');
    
    // Get category IDs for products
    const catResult = await query('SELECT id, handle FROM categories');
    catResult.rows.forEach((row: any) => { 
      if (!catMap[row.handle]) {
        catMap[row.handle] = row.id; 
      }
    });
    
    // Create products with variants
    const products = [
      {
        title: 'كيبورد ميكانيكي RGB احترافي',
        subtitle: 'كيبورد للألعاب عالي الأداء',
        description: 'كيبورد ميكانيكي عالي الجودة مع إضاءة RGB قابلة للتخصيص، مفاتيح Cherry MX',
        handle: 'mechanical-keyboard-rgb-pro',
        thumbnail: '/images/keyboard-1.jpg',
        status: 'published',
        category: 'keyboards',
        variants: [
          { title: 'Red Switch', sku: 'KB-RGB-RED', price: 29900, inventory_quantity: 50 },
          { title: 'Blue Switch', sku: 'KB-RGB-BLUE', price: 29900, inventory_quantity: 30 },
          { title: 'Brown Switch', sku: 'KB-RGB-BROWN', price: 31900, inventory_quantity: 25 }
        ]
      },
      {
        title: 'ماوس ألعاب 16000 DPI',
        subtitle: 'ماوس احترافي للاعبين',
        description: 'ماوس ألعاب عالي الدقة مع 16000 DPI وإضاءة RGB، 7 أزرار قابلة للبرمجة',
        handle: 'gaming-mouse-16000dpi',
        thumbnail: '/images/mouse-1.jpg',
        status: 'published',
        category: 'mice',
        variants: [
          { title: 'أسود', sku: 'MS-16K-BLK', price: 14900, inventory_quantity: 100 },
          { title: 'أبيض', sku: 'MS-16K-WHT', price: 15900, inventory_quantity: 50 }
        ]
      },
      {
        title: 'سماعة ألعاب 7.1 صوت محيطي',
        subtitle: 'سماعة احترافية للألعاب',
        description: 'سماعة ألعاب مع صوت محيطي 7.1 ومايكروفون قابل للفصل، مريحة للاستخدام الطويل',
        handle: 'gaming-headset-7-1',
        thumbnail: '/images/headset-1.jpg',
        status: 'published',
        category: 'headsets',
        variants: [
          { title: 'سلكية', sku: 'HS-71-WIRED', price: 29900, inventory_quantity: 40 },
          { title: 'لاسلكية', sku: 'HS-71-WIRELESS', price: 39900, inventory_quantity: 25 }
        ]
      },
      {
        title: 'ماوس باد كبير 90x40 سم',
        subtitle: 'ماوس باد XXL للمكتب',
        description: 'ماوس باد كبير الحجم مناسب للمكتب بالكامل، سطح ناعم ومقاوم للماء',
        handle: 'large-mousepad-90x40',
        thumbnail: '/images/mousepad-1.jpg',
        status: 'published',
        category: 'accessories',
        variants: [
          { title: 'أسود', sku: 'MP-XXL-BLK', price: 7900, inventory_quantity: 80 },
          { title: 'RGB', sku: 'MP-XXL-RGB', price: 12900, inventory_quantity: 45 }
        ]
      }
    ];
    
    for (const product of products) {
      const productResult = await query(`
        INSERT INTO products (title, subtitle, description, handle, thumbnail, status, category_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (handle) DO UPDATE SET title = $1, status = $6
        RETURNING id
      `, [product.title, product.subtitle, product.description, product.handle, product.thumbnail, product.status, catMap[product.category]]);
      
      const productId = productResult.rows[0].id;
      
      // Delete existing variants and add new ones
      await query('DELETE FROM product_variants WHERE product_id = $1', [productId]);
      
      for (const variant of product.variants) {
        await query(`
          INSERT INTO product_variants (product_id, title, sku, price, inventory_quantity)
          VALUES ($1, $2, $3, $4, $5)
        `, [productId, variant.title, variant.sku, variant.price, variant.inventory_quantity]);
      }
    }
    console.log('✅ Products and variants created');
    
    console.log('🎉 Database seed completed successfully!');
    console.log('');
    console.log('📧 Admin Login: ' + adminEmail);
    console.log('🔑 Password: ' + adminPassword);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
