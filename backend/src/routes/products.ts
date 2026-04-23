import { Router, Request, Response } from 'express';
import { query } from '../database';
import { AuthRequest } from '../middleware/auth';
import { checkAndNotifyStockUpdate } from './stock-notifications';
import { formatProductImages } from '../utils/image-helper';

const router = Router();

// Get all products (public)
router.get('/', async (req: Request, res: Response) => {
  try {
        const { category, status, limit = 1000, offset = 0, latest } = req.query;

    
    let sql = `
      SELECT p.*, c.name as category_name, c.handle as category_handle, b.name as brand_name,
        (SELECT json_agg(v.*) FROM product_variants v WHERE v.product_id = p.id) as variants,
        (SELECT json_agg(i.* ORDER BY i.position) FROM product_images i WHERE i.product_id = p.id) as images,
        (SELECT json_agg(pc.*) FROM product_colors pc WHERE pc.product_id = p.id) as colors
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    // Only filter by status if explicitly provided and not 'all'
    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND p.status = $${params.length}`;
    } else if (!status) {
      // Default to published only if no status parameter
      sql += ` AND p.status = 'published'`;
    }
    
    if (category) {
      params.push(category);
      sql += ` AND (c.handle = $${params.length} OR c.id::text = $${params.length})`;
    }
    
    // Filter by show_in_latest if requested
    if (latest === 'true') {
      sql += ` AND p.show_in_latest = true`;
    }
    
    sql += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await query(sql, params);
    
    const formattedProducts = result.rows.map(formatProductImages);
    
    res.json({ products: formattedProducts, count: formattedProducts.length });
  } catch (error: any) {
    console.error('Products API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get product by ID or handle (public)
router.get('/:idOrHandle', async (req: Request, res: Response) => {
  try {
    const { idOrHandle } = req.params;
    
    const result = await query(`
      SELECT p.*, c.name as category_name, c.handle as category_handle, b.name as brand_name,
        (SELECT json_agg(v.*) FROM product_variants v WHERE v.product_id = p.id) as variants,
        (SELECT json_agg(i.* ORDER BY i.position) FROM product_images i WHERE i.product_id = p.id) as images,
        (SELECT json_agg(pc.*) FROM product_colors pc WHERE pc.product_id = p.id) as colors
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.id::text = $1 OR p.handle = $1
    `, [idOrHandle]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const formattedProduct = formatProductImages(result.rows[0]);
    
    res.json({ product: formattedProduct });
  } catch (error: any) {
    console.error('Get product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create product (admin)
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, title_en, subtitle, description, handle, thumbnail, hover_image, status, category_id, brand_id, show_in_latest, is_exclusive, variants, images, colors } = req.body;
    
    const productResult = await query(
      `INSERT INTO products (title, title_en, subtitle, description, handle, thumbnail, hover_image, status, category_id, brand_id, show_in_latest, is_exclusive)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [title, title_en || null, subtitle, description, handle, thumbnail, hover_image, status || 'draft', category_id, brand_id, show_in_latest !== false, is_exclusive || false]
    );
    
    const product = productResult.rows[0];
    
    // Add variants
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        await query(
          `INSERT INTO product_variants (product_id, title, sku, price, compare_at_price, inventory_quantity, options)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [product.id, variant.title, variant.sku, variant.price, variant.compare_at_price || null, variant.inventory_quantity || 0, JSON.stringify(variant.options || {})]
        );
      }
    }
    
    // Add images
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await query(
          `INSERT INTO product_images (product_id, url, alt, position) VALUES ($1, $2, $3, $4)`,
          [product.id, images[i].url, images[i].alt, i]
        );
      }
    }
    
    // Add colors
    if (colors && colors.length > 0) {
      for (const color of colors) {
        await query(
          `INSERT INTO product_colors (product_id, color_name, image_url, inventory_quantity) VALUES ($1, $2, $3, $4)`,
          [product.id, color.color_name, color.image_url, color.inventory_quantity || 0]
        );
      }
    }
    
    res.status(201).json({ product });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update product (admin)
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, title_en, subtitle, description, handle, thumbnail, hover_image, status, category_id, brand_id, show_in_latest, is_exclusive, variants, colors, images } = req.body;
    
    console.log('📝 Updating product:', id);
    console.log('📝 is_exclusive value:', is_exclusive);
    
    let result;
    try {
      result = await query(
        `UPDATE products SET title = $1, title_en = $2, subtitle = $3, description = $4, handle = $5, 
         thumbnail = $6, hover_image = $7, status = $8, category_id = $9, brand_id = $10, show_in_latest = $11, is_exclusive = $12, updated_at = CURRENT_TIMESTAMP
         WHERE id = $13 RETURNING *`,
        [title, title_en || null, subtitle, description, handle, thumbnail, hover_image, status, category_id, brand_id, show_in_latest !== false, is_exclusive || false, id]
      );
      console.log('✅ UPDATE succeeded');
    } catch (sqlError: any) {
      console.error('❌ SQL Error:', sqlError.message);
      throw sqlError;
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update variants if provided
    if (variants && variants.length > 0) {
      // Get old inventory quantities before update
      const oldVariants = await query('SELECT id, inventory_quantity FROM product_variants WHERE product_id = $1', [id]);
      const oldInventoryMap = new Map(oldVariants.rows.map((v: any) => [v.id, v.inventory_quantity]));
      
      // Get existing variant IDs
      const existingVariantIds = oldVariants.rows.map((v: any) => v.id);
      const incomingVariantIds = variants.filter((v: any) => v.id).map((v: any) => v.id);
      
      // Delete variants that are no longer in the list
      const variantsToDelete = existingVariantIds.filter((id: string) => !incomingVariantIds.includes(id));
      if (variantsToDelete.length > 0) {
        await query('DELETE FROM product_variants WHERE id = ANY($1::uuid[])', [variantsToDelete]);
      }
      
      // Update or insert variants
      for (const variant of variants) {
        if (variant.id && existingVariantIds.includes(variant.id)) {
          // Update existing variant
          const oldQuantity = oldInventoryMap.get(variant.id) || 0;
          
          await query(
            `UPDATE product_variants 
             SET title = $1, sku = $2, price = $3, compare_at_price = $4, inventory_quantity = $5, options = $6
             WHERE id = $7`,
            [variant.title, variant.sku, variant.price, variant.compare_at_price || null, variant.inventory_quantity || 0, JSON.stringify(variant.options || {}), variant.id]
          );
          
          // Check if inventory increased from 0 to positive
          if (oldQuantity === 0 && (variant.inventory_quantity || 0) > 0) {
            await checkAndNotifyStockUpdate(variant.id, variant.inventory_quantity);
          }
        } else {
          // Insert new variant
          const insertResult = await query(
            `INSERT INTO product_variants (product_id, title, sku, price, compare_at_price, inventory_quantity, options)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [id, variant.title, variant.sku, variant.price, variant.compare_at_price || null, variant.inventory_quantity || 0, JSON.stringify(variant.options || {})]
          );
          
          const newVariantId = insertResult.rows[0].id;
          
          // Check if new variant has stock
          if ((variant.inventory_quantity || 0) > 0) {
            await checkAndNotifyStockUpdate(newVariantId, variant.inventory_quantity);
          }
        }
      }
    }
    
    // Update colors if provided
    if (colors !== undefined) {
      // Delete existing colors and add new ones
      await query('DELETE FROM product_colors WHERE product_id = $1', [id]);
      
      if (colors && colors.length > 0) {
        for (const color of colors) {
          await query(
            `INSERT INTO product_colors (product_id, color_name, image_url, inventory_quantity) VALUES ($1, $2, $3, $4)`,
            [id, color.color_name, color.image_url, color.inventory_quantity || 0]
          );
        }
      }
    }

    // Update images if provided
    if (images !== undefined) {
      await query('DELETE FROM product_images WHERE product_id = $1', [id]);
      
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await query(
            `INSERT INTO product_images (product_id, url, alt, position) VALUES ($1, $2, $3, $4)`,
            [id, images[i].url, images[i].alt || '', i]
          );
        }
      }
    }
    
    res.json({ product: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product (admin)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ message: 'Product deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
