import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ProductsService {
  constructor(private databaseService: DatabaseService) {}

  async findAll() {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `;
    return this.databaseService.query(query);
  }

  async findByCategory(categoryId: number) {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ? AND p.status = 'published'
      ORDER BY p.created_at DESC
    `;
    return this.databaseService.query(query, [categoryId]);
  }

  async findBySubcategory(subcategoryId: number) {
    const query = `
      SELECT p.*, c.name as category_name, s.name as subcategory_name
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      WHERE p.subcategory_id = ? AND p.status = 'published'
      ORDER BY p.created_at DESC
    `;
    return this.databaseService.query(query, [subcategoryId]);
  }

  async findDeals() {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.old_price IS NOT NULL AND p.old_price > p.price AND p.status = 'published'
      ORDER BY ((p.old_price - p.price) / p.old_price) DESC
    `;
    return this.databaseService.query(query);
  }

  async findOne(id: number) {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `;
    const products: any = await this.databaseService.query(query, [id]);
    const product = products[0] || null;
    
    if (product) {
      const imagesQuery = `
        SELECT id, image_url, display_order 
        FROM product_images 
        WHERE product_id = ? 
        ORDER BY display_order ASC, id ASC
      `;
      const images: any = await this.databaseService.query(imagesQuery, [id]);
      console.log(`Product ID ${id}: Found ${images.length} images in product_images table`);
      console.log('Images data:', images);
      product.images = images || [];
    }
    
    return product;
  }

  async findBySku(sku: string) {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.sku = ?
    `;
    const products: any = await this.databaseService.query(query, [sku]);
    const product = products[0] || null;
    
    if (product) {
      const imagesQuery = `
        SELECT id, image_url, display_order 
        FROM product_images 
        WHERE product_id = ? 
        ORDER BY display_order ASC, id ASC
      `;
      const images: any = await this.databaseService.query(imagesQuery, [product.id]);
      product.images = images || [];
    }
    
    return product;
  }

  async create(productData: any) {
    // فحص تكرار SKU إذا تم إدخاله
    if (productData.sku) {
      const checkSkuQuery = 'SELECT id, name FROM products WHERE sku = ?';
      const existingProducts: any = await this.databaseService.query(checkSkuQuery, [productData.sku]);
      
      if (existingProducts.length > 0) {
        return {
          success: false,
          message: `المعرف (SKU) "${productData.sku}" مستخدم مسبقاً في المنتج: ${existingProducts[0].name}`,
        };
      }
    }

    const query = `
      INSERT INTO products (name, sku, description, price, old_price, stock, category_id, subcategory_id, company_id, image_url, hover_image_url, status, is_featured, is_exclusive)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      productData.name,
      productData.sku || null,
      productData.description || null,
      productData.price,
      productData.old_price || null,
      productData.stock || 0,
      productData.category_id,
      productData.subcategory_id || null,
      productData.company_id || null,
      productData.image_url || null,
      productData.hover_image_url || null,
      productData.status || 'published',
      productData.is_featured || false,
      productData.is_exclusive || false,
    ];

    const result: any = await this.databaseService.query(query, values);
    return {
      success: true,
      id: result.insertId,
      message: 'تم إضافة المنتج بنجاح',
    };
  }

  async update(id: number, productData: any) {
    const query = `
      UPDATE products 
      SET name = ?, sku = ?, description = ?, price = ?, old_price = ?, stock = ?, category_id = ?, subcategory_id = ?, company_id = ?, image_url = ?, hover_image_url = ?, status = ?, is_featured = ?, is_exclusive = ?
      WHERE id = ?
    `;
    const values = [
      productData.name,
      productData.sku || null,
      productData.description || null,
      productData.price,
      productData.old_price || null,
      productData.stock || 0,
      productData.category_id,
      productData.subcategory_id || null,
      productData.company_id || null,
      productData.image_url || null,
      productData.hover_image_url || null,
      productData.status || 'published',
      productData.is_featured || false,
      productData.is_exclusive || false,
      id,
    ];

    await this.databaseService.query(query, values);
    return { success: true, message: 'Product updated successfully' };
  }

  async remove(id: number) {
    const query = 'DELETE FROM products WHERE id = ?';
    await this.databaseService.query(query, [id]);
    return { success: true, message: 'تم حذف المنتج بنجاح' };
  }

  async getProductImages(productId: number) {
    const query = `
      SELECT id, image_url, display_order 
      FROM product_images 
      WHERE product_id = ? 
      ORDER BY display_order ASC, id ASC
    `;
    return this.databaseService.query(query, [productId]);
  }
}
