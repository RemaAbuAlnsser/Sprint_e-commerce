import { Router, Request, Response } from 'express';
import { query } from '../database';

const router = Router();

// Subscribe to stock notification
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { product_id, variant_id, email } = req.body;

    if (!product_id || !variant_id || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if already subscribed
    const existing = await query(
      'SELECT id FROM stock_notifications WHERE product_id = $1 AND variant_id = $2 AND email = $3 AND notified = false',
      [product_id, variant_id, email]
    );

    if (existing.rows.length > 0) {
      return res.json({ success: true, message: 'Already subscribed' });
    }

    // Create notification subscription
    await query(
      'INSERT INTO stock_notifications (product_id, variant_id, email) VALUES ($1, $2, $3)',
      [product_id, variant_id, email]
    );

    res.json({ success: true, message: 'Subscribed successfully' });
  } catch (error: any) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get unread notifications for a user (by email)
router.get('/user/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    const result = await query(
      `SELECT 
        un.id,
        un.message,
        un.created_at,
        p.id as product_id,
        p.title as product_title,
        p.thumbnail as product_image,
        p.handle as product_handle,
        pv.id as variant_id,
        pv.price as variant_price
      FROM user_notifications un
      JOIN products p ON un.product_id = p.id
      JOIN product_variants pv ON un.variant_id = pv.id
      WHERE un.email = $1 AND un.read = false
      ORDER BY un.created_at DESC`,
      [email]
    );

    res.json({ notifications: result.rows });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.put('/read/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await query(
      'UPDATE user_notifications SET read = true WHERE id = $1',
      [id]
    );

    res.json({ success: true });
  } catch (error: any) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get all pending notifications
router.get('/admin/pending', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT 
        sn.id,
        sn.email,
        sn.created_at,
        p.title as product_title,
        pv.title as variant_title,
        pv.inventory_quantity
      FROM stock_notifications sn
      JOIN products p ON sn.product_id = p.id
      JOIN product_variants pv ON sn.variant_id = pv.id
      WHERE sn.notified = false
      ORDER BY sn.created_at DESC`
    );

    res.json({ notifications: result.rows });
  } catch (error: any) {
    console.error('Get pending notifications error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check and notify users when stock is updated (called internally when variant inventory is updated)
export async function checkAndNotifyStockUpdate(variantId: string, newQuantity: number) {
  try {
    // Only notify if stock is now available
    if (newQuantity <= 0) {
      return;
    }

    // Get all pending notifications for this variant
    const notifications = await query(
      `SELECT 
        sn.id,
        sn.email,
        sn.product_id,
        sn.variant_id,
        p.title as product_title,
        p.thumbnail as product_image,
        p.handle as product_handle,
        pv.title as variant_title,
        pv.price as variant_price
      FROM stock_notifications sn
      JOIN products p ON sn.product_id = p.id
      JOIN product_variants pv ON sn.variant_id = pv.id
      WHERE sn.variant_id = $1 AND sn.notified = false`,
      [variantId]
    );

    if (notifications.rows.length === 0) {
      return;
    }

    // Create user notifications and mark as notified
    for (const notification of notifications.rows) {
      // Create in-app notification
      await query(
        `INSERT INTO user_notifications (email, product_id, variant_id, message)
         VALUES ($1, $2, $3, $4)`,
        [
          notification.email,
          notification.product_id,
          notification.variant_id,
          `المنتج "${notification.product_title}" أصبح متوفراً الآن!`
        ]
      );

      // Mark stock notification as notified
      await query(
        'UPDATE stock_notifications SET notified = true, notified_at = CURRENT_TIMESTAMP WHERE id = $1',
        [notification.id]
      );

      // Here you would send email notification
      // For now, we'll just log it
      console.log(`📧 Stock notification sent to ${notification.email} for product: ${notification.product_title}`);
    }

    console.log(`✅ Notified ${notifications.rows.length} users about stock update for variant ${variantId}`);
  } catch (error) {
    console.error('Error in checkAndNotifyStockUpdate:', error);
  }
}

export default router;
