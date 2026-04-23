import { Router, Request, Response } from 'express';
import { query } from '../database';

const router = Router();

// Get colors for a product (public)
router.get('/product/:productId', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const result = await query(
      'SELECT * FROM product_colors WHERE product_id = $1 ORDER BY created_at ASC',
      [productId]
    );
    res.json({ colors: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add color to product (admin)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { product_id, color_name, image_url } = req.body;
    const result = await query(
      'INSERT INTO product_colors (product_id, color_name, image_url) VALUES ($1, $2, $3) RETURNING *',
      [product_id, color_name, image_url]
    );
    res.status(201).json({ color: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update color (admin)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { color_name, image_url } = req.body;
    const result = await query(
      'UPDATE product_colors SET color_name = $1, image_url = $2 WHERE id = $3 RETURNING *',
      [color_name, image_url, id]
    );
    res.json({ color: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete color (admin)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM product_colors WHERE id = $1', [id]);
    res.json({ message: 'Color deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
