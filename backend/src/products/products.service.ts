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

  async findOne(id: number) {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `;
    const products: any = await this.databaseService.query(query, [id]);
    return products[0] || null;
  }

  async create(productData: any) {
    const query = `
      INSERT INTO products (name, sku, description, price, stock, category_id, subcategory_id, company_id, image_url, hover_image_url, status, is_featured, is_exclusive)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      productData.name,
      productData.sku || null,
      productData.description || null,
      productData.price,
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
      message: 'Product created successfully',
    };
  }

  async update(id: number, productData: any) {
    const query = `
      UPDATE products 
      SET name = ?, sku = ?, description = ?, price = ?, stock = ?, category_id = ?, subcategory_id = ?, company_id = ?, image_url = ?, hover_image_url = ?, status = ?, is_featured = ?, is_exclusive = ?
      WHERE id = ?
    `;
    const values = [
      productData.name,
      productData.sku || null,
      productData.description || null,
      productData.price,
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
}
