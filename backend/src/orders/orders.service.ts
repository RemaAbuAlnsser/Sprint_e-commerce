import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class OrdersService {
  constructor(private databaseService: DatabaseService) {}

  async findAll() {
    const query = `
      SELECT 
        o.id,
        o.customer_name,
        o.customer_phone,
        o.customer_city,
        o.customer_address,
        o.shipping_method,
        o.shipping_cost,
        o.payment_method,
        o.subtotal,
        o.total,
        o.status,
        o.created_at,
        o.updated_at,
        COUNT(oi.id) as items_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id, o.customer_name, o.customer_phone, o.customer_city, o.customer_address, 
               o.shipping_method, o.shipping_cost, o.payment_method, o.subtotal, o.total, 
               o.status, o.created_at, o.updated_at
      ORDER BY o.created_at DESC
    `;
    return this.databaseService.query(query);
  }

  async findOne(id: number) {
    const orderQuery = `
      SELECT o.*
      FROM orders o
      WHERE o.id = ?
    `;
    
    const itemsQuery = `
      SELECT oi.*, p.image_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `;

    const orders: any = await this.databaseService.query(orderQuery, [id]);
    const items = await this.databaseService.query(itemsQuery, [id]);

    if (orders.length === 0) {
      return null;
    }

    return {
      ...orders[0],
      items,
    };
  }

  async create(data: any) {
    try {
      // فحص توفر الكمية لكل منتج قبل إنشاء الطلب
      const unavailableProducts: any[] = [];
      
      for (const item of data.items) {
        const checkStockQuery = 'SELECT id, name, stock FROM products WHERE id = ?';
        const products: any = await this.databaseService.query(checkStockQuery, [item.product_id]);
        
        if (products.length === 0) {
          unavailableProducts.push({
            name: item.product_name,
            reason: 'المنتج غير موجود'
          });
          continue;
        }
        
        const product = products[0];
        
        if (product.stock < item.quantity) {
          unavailableProducts.push({
            name: product.name,
            requestedQty: item.quantity,
            availableQty: product.stock,
            reason: product.stock === 0 ? 'غير متوفر' : `الكمية المتوفرة: ${product.stock} فقط`
          });
        }
      }
      
      // إذا كان هناك منتجات غير متوفرة، إرجاع رسالة خطأ
      if (unavailableProducts.length > 0) {
        return {
          success: false,
          message: 'بعض المنتجات غير متوفرة بالكمية المطلوبة',
          unavailableProducts
        };
      }
      
      // إنشاء الطلب
      const orderQuery = `
        INSERT INTO orders (
          customer_name, 
          customer_phone, 
          customer_city, 
          customer_address,
          shipping_method,
          shipping_cost,
          payment_method,
          subtotal,
          total,
          status
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `;
      
      const orderResult: any = await this.databaseService.query(orderQuery, [
        data.customer_name,
        data.customer_phone,
        data.customer_city,
        data.customer_address,
        data.shipping_method,
        data.shipping_cost,
        data.payment_method,
        data.subtotal,
        data.total,
      ]);

      const orderId = orderResult.insertId;

      // إضافة عناصر الطلب وتحديث المخزون
      for (const item of data.items) {
        const itemQuery = `
          INSERT INTO order_items (
            order_id, 
            product_id, 
            product_name,
            product_price,
            quantity, 
            subtotal
          ) 
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        await this.databaseService.query(itemQuery, [
          orderId,
          item.product_id,
          item.product_name,
          item.product_price,
          item.quantity,
          item.subtotal,
        ]);

        // تحديث المخزون - إنقاص الكمية
        const updateStockQuery = 'UPDATE products SET stock = stock - ? WHERE id = ?';
        await this.databaseService.query(updateStockQuery, [
          item.quantity,
          item.product_id,
        ]);
      }

      return { success: true, orderId, message: 'تم إنشاء الطلب بنجاح وتحديث المخزون' };
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, message: 'فشل إنشاء الطلب', error: error.message };
    }
  }

  async updateStatus(id: number, status: string) {
    const query = 'UPDATE orders SET status = ? WHERE id = ?';
    await this.databaseService.query(query, [status, id]);
    return { success: true, message: 'تم تحديث حالة الطلب بنجاح' };
  }

  async delete(id: number) {
    try {
      const query = 'DELETE FROM orders WHERE id = ?';
      await this.databaseService.query(query, [id]);
      return { success: true, message: 'تم حذف الطلب بنجاح' };
    } catch (error) {
      console.error('Error deleting order:', error);
      return { success: false, message: 'فشل حذف الطلب' };
    }
  }
}
