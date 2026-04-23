import { Router } from 'express';
import { query } from '../database';

const router = Router();

// Get all parent categories
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        pc.*,
        COUNT(DISTINCT c.id) as subcategories_count,
        COUNT(DISTINCT p.id) as products_count
      FROM parent_categories pc
      LEFT JOIN categories c ON c.parent_category_id = pc.id AND c.is_active = true
      LEFT JOIN products p ON p.category_id = c.id AND p.status = 'published'
      WHERE pc.is_active = true
      GROUP BY pc.id
      ORDER BY pc.display_order ASC, pc.name ASC
    `);
    
    res.json({ parent_categories: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single parent category with subcategories
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const parentResult = await query(
      'SELECT * FROM parent_categories WHERE id = $1',
      [id]
    );
    
    if (parentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Parent category not found' });
    }
    
    const categoriesResult = await query(
      `SELECT * FROM categories 
       WHERE parent_category_id = $1 AND is_active = true
       ORDER BY display_order ASC, name ASC`,
      [id]
    );
    
    res.json({
      parent_category: parentResult.rows[0],
      subcategories: categoriesResult.rows
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get parent category by handle
router.get('/handle/:handle', async (req, res) => {
  try {
    const { handle } = req.params;
    
    const parentResult = await query(
      'SELECT * FROM parent_categories WHERE handle = $1 AND is_active = true',
      [handle]
    );
    
    if (parentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Parent category not found' });
    }
    
    const categoriesResult = await query(
      `SELECT * FROM categories 
       WHERE parent_category_id = $1 AND is_active = true
       ORDER BY display_order ASC, name ASC`,
      [parentResult.rows[0].id]
    );
    
    res.json({
      parent_category: parentResult.rows[0],
      subcategories: categoriesResult.rows
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get products by parent category handle
router.get('/handle/:handle/products', async (req, res) => {
  try {
    const { handle } = req.params;
    const { subcategory } = req.query;
    
    const parentResult = await query(
      'SELECT id FROM parent_categories WHERE handle = $1 AND is_active = true',
      [handle]
    );
    
    if (parentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Parent category not found' });
    }
    
    const parentId = parentResult.rows[0].id;
    
    let sql = `
      SELECT p.*, c.name as category_name, c.handle as category_handle, b.name as brand_name,
        (SELECT json_agg(v.*) FROM product_variants v WHERE v.product_id = p.id) as variants,
        (SELECT json_agg(i.*) FROM product_images i WHERE i.product_id = p.id) as images,
        (SELECT json_agg(pc.*) FROM product_colors pc WHERE pc.product_id = p.id) as colors
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE c.parent_category_id = $1 AND p.status = 'published'
    `;
    const params: any[] = [parentId];
    
    if (subcategory) {
      params.push(subcategory);
      sql += ` AND (c.handle = $${params.length} OR c.id::text = $${params.length})`;
    }
    
    sql += ` ORDER BY p.created_at DESC`;
    
    const result = await query(sql, params);
    
    res.json({ products: result.rows, count: result.rows.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create parent category (Admin only)
router.post('/', async (req, res) => {
  try {
    const { name, handle, description, image_url, banner_image, display_order } = req.body;
    
    if (!name || !handle) {
      return res.status(400).json({ error: 'Name and handle are required' });
    }
    
    const result = await query(
      `INSERT INTO parent_categories (name, handle, description, image_url, banner_image, display_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, handle, description || null, image_url || null, banner_image || null, display_order || 0]
    );
    
    res.status(201).json({ parent_category: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Parent category with this handle already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Update parent category (Admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, handle, description, image_url, banner_image, display_order, is_active } = req.body;
    
    const result = await query(
      `UPDATE parent_categories 
       SET name = COALESCE($1, name),
           handle = COALESCE($2, handle),
           description = COALESCE($3, description),
           image_url = COALESCE($4, image_url),
           banner_image = COALESCE($5, banner_image),
           display_order = COALESCE($6, display_order),
           is_active = COALESCE($7, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [name, handle, description, image_url, banner_image, display_order, is_active, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parent category not found' });
    }
    
    res.json({ parent_category: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Parent category with this handle already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Delete parent category (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM parent_categories WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parent category not found' });
    }
    
    res.json({ message: 'Parent category deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
