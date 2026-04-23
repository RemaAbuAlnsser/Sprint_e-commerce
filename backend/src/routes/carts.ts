import { Router, Request, Response } from 'express';
import { query } from '../database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Create cart
router.post('/', async (req: Request, res: Response) => {
  try {
    const result = await query('INSERT INTO carts DEFAULT VALUES RETURNING *');
    res.status(201).json({ cart: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get cart
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const cartResult = await query('SELECT * FROM carts WHERE id = $1', [id]);
    if (cartResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    const itemsResult = await query(`
      SELECT ci.*, pv.title, pv.price, p.title as product_title, p.thumbnail
      FROM cart_items ci
      JOIN product_variants pv ON ci.variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE ci.cart_id = $1
    `, [id]);
    
    const cart = cartResult.rows[0];
    cart.items = itemsResult.rows;
    cart.subtotal = itemsResult.rows.reduce((sum: number, item: any) => sum + (item.unit_price * item.quantity), 0);
    
    res.json({ cart });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add item to cart
router.post('/:id/line-items', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { variant_id, quantity = 1 } = req.body;
    
    // Get variant price
    const variantResult = await query('SELECT price FROM product_variants WHERE id = $1', [variant_id]);
    if (variantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Variant not found' });
    }
    
    const price = variantResult.rows[0].price;
    
    // Check if item already in cart
    const existingItem = await query(
      'SELECT * FROM cart_items WHERE cart_id = $1 AND variant_id = $2',
      [id, variant_id]
    );
    
    if (existingItem.rows.length > 0) {
      await query(
        'UPDATE cart_items SET quantity = quantity + $1 WHERE cart_id = $2 AND variant_id = $3',
        [quantity, id, variant_id]
      );
    } else {
      await query(
        'INSERT INTO cart_items (cart_id, variant_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
        [id, variant_id, quantity, price]
      );
    }
    
    // Update cart timestamp
    await query('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    
    res.json({ message: 'Item added to cart' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update cart item
router.put('/:id/line-items/:itemId', async (req: Request, res: Response) => {
  try {
    const { id, itemId } = req.params;
    const { quantity } = req.body;
    
    if (quantity <= 0) {
      await query('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2', [itemId, id]);
    } else {
      await query('UPDATE cart_items SET quantity = $1 WHERE id = $2 AND cart_id = $3', [quantity, itemId, id]);
    }
    
    res.json({ message: 'Cart updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Remove item from cart
router.delete('/:id/line-items/:itemId', async (req: Request, res: Response) => {
  try {
    const { id, itemId } = req.params;
    await query('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2', [itemId, id]);
    res.json({ message: 'Item removed' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
