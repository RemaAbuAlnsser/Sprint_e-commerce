import { Router, Request, Response } from 'express';
import { query } from '../database';
import { formatCategoryImage, formatProductImages } from '../utils/image-helper';

const router = Router();

// Get all categories
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status = 'published') as product_count
      FROM categories c
      ORDER BY c.name
    `);
    
    const formattedCategories = result.rows.map(formatCategoryImage);
    
    res.json({ categories: formattedCategories });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get category by ID or handle
router.get('/:idOrHandle', async (req: Request, res: Response) => {
  try {
    const { idOrHandle } = req.params;
    const result = await query(
      'SELECT * FROM categories WHERE id::text = $1 OR handle = $1',
      [idOrHandle]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const formattedCategory = formatCategoryImage(result.rows[0]);
    
    res.json({ category: formattedCategory });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get products by category
router.get('/:idOrHandle/products', async (req: Request, res: Response) => {
  try {
    const { idOrHandle } = req.params;
    
    const catResult = await query(
      'SELECT id FROM categories WHERE id::text = $1 OR handle = $1',
      [idOrHandle]
    );
    
    if (catResult.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const result = await query(`
      SELECT p.*, 
        (SELECT json_agg(v.*) FROM product_variants v WHERE v.product_id = p.id) as variants
      FROM products p
      WHERE p.category_id = $1 AND p.status = 'published'
      ORDER BY p.created_at DESC
    `, [catResult.rows[0].id]);
    
    const formattedProducts = result.rows.map(formatProductImages);
    
    res.json({ products: formattedProducts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create category (admin)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, handle, description, image_url, parent_category_id, display_order } = req.body;
    
    const result = await query(
      `INSERT INTO categories (name, handle, description, image_url, parent_category_id, display_order) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, handle, description, image_url, parent_category_id || null, display_order || 0]
    );
    
    res.status(201).json({ category: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'فئة بهذا المعرف موجودة بالفعل' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Update category (admin)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, handle, description, image_url, parent_category_id, display_order } = req.body;
    
    const result = await query(
      `UPDATE categories 
       SET name = COALESCE($1, name), 
           handle = COALESCE($2, handle), 
           description = COALESCE($3, description), 
           image_url = COALESCE($4, image_url),
           parent_category_id = COALESCE($5, parent_category_id),
           display_order = COALESCE($6, display_order),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [name, handle, description, image_url, parent_category_id, display_order, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ category: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'فئة بهذا المعرف موجودة بالفعل' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Delete category (admin)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // First, set category_id to NULL for all products in this category
    await query('UPDATE products SET category_id = NULL WHERE category_id = $1', [id]);
    
    // Then delete the category
    const result = await query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
