import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class OrdersService {
  constructor(private databaseService: DatabaseService) {}

  async findAll() {
    const query = `
      SELECT o.*, u.name as customer_name, u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `;
    return this.databaseService.query(query);
  }

  async findOne(id: number) {
    const orderQuery = `
      SELECT o.*, u.name as customer_name, u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `;
    
    const itemsQuery = `
      SELECT oi.*, p.name as product_name, p.image_url
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
    const connection = this.databaseService.getConnection();
    
    try {
      await connection.beginTransaction();

      const orderQuery = `
        INSERT INTO orders (user_id, total_amount, status, shipping_address) 
        VALUES (?, ?, ?, ?)
      `;
      
      const orderResult: any = await this.databaseService.query(orderQuery, [
        data.user_id,
        data.total_amount,
        'pending',
        data.shipping_address,
      ]);

      const orderId = orderResult.insertId;

      for (const item of data.items) {
        const itemQuery = `
          INSERT INTO order_items (order_id, product_id, quantity, price) 
          VALUES (?, ?, ?, ?)
        `;
        
        await this.databaseService.query(itemQuery, [
          orderId,
          item.product_id,
          item.quantity,
          item.price,
        ]);

        const updateStockQuery = 'UPDATE products SET stock = stock - ? WHERE id = ?';
        await this.databaseService.query(updateStockQuery, [
          item.quantity,
          item.product_id,
        ]);
      }

      await connection.commit();

      return { success: true, orderId, message: 'تم إنشاء الطلب بنجاح' };
    } catch (error) {
      await connection.rollback();
      return { success: false, message: 'فشل إنشاء الطلب' };
    }
  }

  async updateStatus(id: number, status: string) {
    const query = 'UPDATE orders SET status = ? WHERE id = ?';
    await this.databaseService.query(query, [status, id]);
    return { success: true, message: 'تم تحديث حالة الطلب بنجاح' };
  }
}
