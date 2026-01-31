import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ProductColorsService {
  constructor(private databaseService: DatabaseService) {}

  async findByProduct(productId: number) {
    const query = 'SELECT * FROM product_colors WHERE product_id = ?';
    return this.databaseService.query(query, [productId]);
  }

  async findAllUniqueColors() {
    const query = 'SELECT DISTINCT color_name FROM product_colors ORDER BY color_name';
    return this.databaseService.query(query, []);
  }

  async create(colorData: any) {
    const query = `
      INSERT INTO product_colors (product_id, color_name, stock, image_url)
      VALUES (?, ?, ?, ?)
    `;
    const values = [
      colorData.product_id,
      colorData.color_name,
      colorData.stock || 0,
      colorData.image_url || null,
    ];

    const result: any = await this.databaseService.query(query, values);
    
    // Update total product stock
    await this.updateProductTotalStock(colorData.product_id);
    
    return {
      success: true,
      id: result.insertId,
      message: 'تم إضافة اللون بنجاح',
    };
  }

  async update(id: number, colorData: any) {
    const query = `
      UPDATE product_colors 
      SET color_name = ?, stock = ?, image_url = ?
      WHERE id = ?
    `;
    const values = [
      colorData.color_name,
      colorData.stock || 0,
      colorData.image_url || null,
      id,
    ];

    await this.databaseService.query(query, values);
    
    // Get product_id to update total stock
    const colorQuery = 'SELECT product_id FROM product_colors WHERE id = ?';
    const colorResult: any = await this.databaseService.query(colorQuery, [id]);
    
    if (colorResult.length > 0) {
      await this.updateProductTotalStock(colorResult[0].product_id);
    }
    
    return { success: true, message: 'تم تحديث اللون بنجاح' };
  }

  async remove(id: number) {
    // Get product_id before deleting
    const colorQuery = 'SELECT product_id FROM product_colors WHERE id = ?';
    const colorResult: any = await this.databaseService.query(colorQuery, [id]);
    
    const query = 'DELETE FROM product_colors WHERE id = ?';
    await this.databaseService.query(query, [id]);
    
    // Update total product stock
    if (colorResult.length > 0) {
      await this.updateProductTotalStock(colorResult[0].product_id);
    }
    
    return { success: true, message: 'تم حذف اللون بنجاح' };
  }

  async updateProductTotalStock(productId: number) {
    // Calculate total stock from all colors
    const query = 'SELECT SUM(stock) as total_stock FROM product_colors WHERE product_id = ?';
    const result: any = await this.databaseService.query(query, [productId]);
    
    const totalStock = result[0]?.total_stock || 0;
    
    // Update product stock
    const updateQuery = 'UPDATE products SET stock = ? WHERE id = ?';
    await this.databaseService.query(updateQuery, [totalStock, productId]);
  }

  async decreaseStock(productId: number, colorId: number, quantity: number) {
    // Decrease color stock
    const query = 'UPDATE product_colors SET stock = stock - ? WHERE id = ? AND product_id = ?';
    await this.databaseService.query(query, [quantity, colorId, productId]);
    
    // Update total product stock
    await this.updateProductTotalStock(productId);
    
    return { success: true, message: 'تم تحديث المخزون' };
  }
}
