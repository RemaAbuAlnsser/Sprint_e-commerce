import { Router, Request, Response } from 'express';
import { query } from '../database';

const router = Router();

// Create order from cart (public - no auth required)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, shipping_address, items, payment_method, notes } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.unit_price * item.quantity), 0);
    const shipping_total = 0; // Free shipping
    const tax_total = 0; // No tax
    const total = subtotal + shipping_total;
    
    // Create order
    const orderResult = await query(`
      INSERT INTO orders (
        email, 
        shipping_address, 
        billing_address,
        subtotal, 
        shipping_total, 
        tax_total, 
        total,
        status,
        payment_status,
        fulfillment_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', 'awaiting', 'not_fulfilled') 
      RETURNING *
    `, [
      email, 
      JSON.stringify(shipping_address), 
      JSON.stringify(shipping_address),
      subtotal, 
      shipping_total, 
      tax_total, 
      total
    ]);
    
    const order = orderResult.rows[0];
    
    // Create order items and update inventory
    for (const item of items) {
      // Get variant and product details including thumbnail
      const variantResult = await query(`
        SELECT pv.id, pv.title, pv.inventory_quantity, p.thumbnail
        FROM product_variants pv
        LEFT JOIN products p ON pv.product_id = p.id
        WHERE pv.id = $1
      `, [item.variant_id]);
      
      if (variantResult.rows.length === 0) {
        console.warn(`Variant ${item.variant_id} not found, skipping`);
        continue;
      }
      
      const variant = variantResult.rows[0];
      
      // Check if enough inventory
      if (variant.inventory_quantity < item.quantity) {
        throw new Error(`Not enough inventory for ${variant.title}. Available: ${variant.inventory_quantity}, Requested: ${item.quantity}`);
      }
      
      // Insert order item with thumbnail
      await query(`
        INSERT INTO order_items (order_id, variant_id, title, quantity, unit_price, color, thumbnail)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [order.id, variant.id, variant.title, item.quantity, item.unit_price, item.color, variant.thumbnail]);
      
      // Update variant inventory
      await query(`
        UPDATE product_variants 
        SET inventory_quantity = inventory_quantity - $1 
        WHERE id = $2
      `, [item.quantity, variant.id]);
      
      console.log(`Updated inventory for ${variant.title}: ${variant.inventory_quantity} -> ${variant.inventory_quantity - item.quantity}`);
      
      // Update color inventory if color is specified
      if (item.color) {
        // Get product_id from variant
        const productResult = await query(
          'SELECT product_id FROM product_variants WHERE id = $1',
          [variant.id]
        );
        
        if (productResult.rows.length > 0) {
          const productId = productResult.rows[0].product_id;
          
          // Update color inventory
          await query(`
            UPDATE product_colors 
            SET inventory_quantity = inventory_quantity - $1 
            WHERE product_id = $2 AND color_name = $3
          `, [item.quantity, productId, item.color]);
          
          console.log(`Updated color inventory for ${item.color}: -${item.quantity}`);
        }
      }
    }
    
    res.status(201).json({ order });
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get order by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const orderResult = await query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Get order items with product details
    const itemsResult = await query(`
      SELECT 
        oi.*,
        p.title as product_title,
        COALESCE(oi.thumbnail, p.thumbnail) as thumbnail
      FROM order_items oi
      LEFT JOIN product_variants pv ON oi.variant_id = pv.id
      LEFT JOIN products p ON pv.product_id = p.id
      WHERE oi.order_id = $1
    `, [id]);
    
    const order = orderResult.rows[0];
    order.items = itemsResult.rows.map((item: any) => ({
      ...item,
      title: item.product_title || item.title,
      thumbnail: item.thumbnail
    }));
    
    res.json({ order });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all orders (admin)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, limit = 1000, offset = 0 } = req.query;
    
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params: any[] = [];
    
    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }
    
    sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await query(sql, params);
    res.json({ orders: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status (admin)
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, payment_status, fulfillment_status } = req.body;
    
    const result = await query(`
      UPDATE orders SET status = COALESCE($1, status), 
        payment_status = COALESCE($2, payment_status),
        fulfillment_status = COALESCE($3, fulfillment_status)
      WHERE id = $4 RETURNING *
    `, [status, payment_status, fulfillment_status, id]);
    
    res.json({ order: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete order (admin)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Delete order items first (foreign key constraint)
    await query('DELETE FROM order_items WHERE order_id = $1', [id]);
    
    // Delete order
    await query('DELETE FROM orders WHERE id = $1', [id]);
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
