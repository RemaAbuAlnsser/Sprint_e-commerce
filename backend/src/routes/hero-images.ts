import { Router, Request, Response } from 'express';
import { query } from '../database';

const router = Router();

// Get all active hero images (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM hero_images WHERE is_active = true ORDER BY position ASC'
    );
    
    res.json({ images: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all hero images including inactive (admin only)
router.get('/all', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM hero_images ORDER BY position ASC'
    );
    
    res.json({ images: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add new hero image (admin only)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { image_url } = req.body;
    
    if (!image_url) {
      return res.status(400).json({ error: 'Image URL is required' });
    }
    
    // Get the highest position
    const positionResult = await query(
      'SELECT COALESCE(MAX(position), -1) as max_position FROM hero_images'
    );
    const nextPosition = positionResult.rows[0].max_position + 1;
    
    const result = await query(
      'INSERT INTO hero_images (image_url, position) VALUES ($1, $2) RETURNING *',
      [image_url, nextPosition]
    );
    
    res.json({ image: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update hero image (admin only)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { image_url, position, is_active } = req.body;
    
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    if (image_url !== undefined) {
      updates.push(`image_url = $${paramCount++}`);
      values.push(image_url);
    }
    
    if (position !== undefined) {
      updates.push(`position = $${paramCount++}`);
      values.push(position);
    }
    
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const result = await query(
      `UPDATE hero_images SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    res.json({ image: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete hero image (admin only)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM hero_images WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reorder hero images (admin only)
router.post('/reorder', async (req: Request, res: Response) => {
  try {
    const { imageIds } = req.body; // Array of image IDs in new order
    
    if (!Array.isArray(imageIds)) {
      return res.status(400).json({ error: 'imageIds must be an array' });
    }
    
    // Update positions
    for (let i = 0; i < imageIds.length; i++) {
      await query(
        'UPDATE hero_images SET position = $1 WHERE id = $2',
        [i, imageIds[i]]
      );
    }
    
    const result = await query(
      'SELECT * FROM hero_images ORDER BY position ASC'
    );
    
    res.json({ images: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
