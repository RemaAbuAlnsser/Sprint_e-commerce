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
            color_name,
            subtotal
          ) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        await this.databaseService.query(itemQuery, [
          orderId,
          item.product_id,
          item.product_name,
          item.product_price,
          item.quantity,
          item.color_name || null,
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
    try {
      // الحصول على معلومات الطلب قبل التحديث
      const orderQuery = 'SELECT total, subtotal, status FROM orders WHERE id = ?';
      const orders: any = await this.databaseService.query(orderQuery, [id]);
      
      if (orders.length === 0) {
        return { success: false, message: 'الطلب غير موجود' };
      }
      
      const oldStatus = orders[0].status;
      const orderTotal = orders[0].total; // السعر الكامل مع التوصيل
      const orderSubtotal = orders[0].subtotal; // سعر المنتجات فقط بدون التوصيل
      
      // تحديث حالة الطلب
      const updateQuery = 'UPDATE orders SET status = ? WHERE id = ?';
      await this.databaseService.query(updateQuery, [status, id]);
      
      // إذا تم تغيير الحالة إلى "delivered"، تحديث الإيرادات وإجمالي المبيعات
      if (status === 'delivered' && oldStatus !== 'delivered') {
        // التحقق من وجود سجل في جدول revenue
        const checkRevenueQuery = 'SELECT id, total_revenue, total_sales FROM revenue LIMIT 1';
        const revenueRecords: any = await this.databaseService.query(checkRevenueQuery);
        
        if (revenueRecords.length > 0) {
          // تحديث الإيرادات (السعر الكامل مع التوصيل) وإجمالي المبيعات (بدون التوصيل)
          const updateRevenueQuery = 'UPDATE revenue SET total_revenue = total_revenue + ?, total_sales = total_sales + ? WHERE id = ?';
          await this.databaseService.query(updateRevenueQuery, [orderTotal, orderSubtotal, revenueRecords[0].id]);
        } else {
          // إنشاء سجل جديد للإيرادات
          const insertRevenueQuery = 'INSERT INTO revenue (total_revenue, total_sales) VALUES (?, ?)';
          await this.databaseService.query(insertRevenueQuery, [orderTotal, orderSubtotal]);
        }
      }
      
      // إذا تم إلغاء طلب كان موصلاً، طرح قيمته من الإيرادات وإجمالي المبيعات
      if (oldStatus === 'delivered' && status !== 'delivered') {
        const updateRevenueQuery = 'UPDATE revenue SET total_revenue = total_revenue - ?, total_sales = total_sales - ? WHERE id = (SELECT id FROM revenue LIMIT 1)';
        await this.databaseService.query(updateRevenueQuery, [orderTotal, orderSubtotal]);
      }
      
      return { success: true, message: 'تم تحديث حالة الطلب بنجاح' };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, message: 'فشل تحديث حالة الطلب', error: error.message };
    }
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

  async getRevenue() {
    try {
      const query = 'SELECT total_revenue, total_sales FROM revenue LIMIT 1';
      const result: any = await this.databaseService.query(query);
      
      if (result.length > 0) {
        return {
          success: true,
          total_revenue: Number(result[0].total_revenue) || 0,
          total_sales: Number(result[0].total_sales) || 0,
        };
      }
      
      return {
        success: true,
        total_revenue: 0,
        total_sales: 0,
      };
    } catch (error) {
      console.error('Error fetching revenue:', error);
      return {
        success: false,
        total_revenue: 0,
        total_sales: 0,
        error: error.message,
      };
    }
  }
}
