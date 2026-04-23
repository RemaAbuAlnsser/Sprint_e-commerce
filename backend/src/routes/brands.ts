import { Router, Request, Response } from 'express';
import { query } from '../database';
import { formatBrandLogo } from '../utils/image-helper';

const router = Router();

// Get all brands (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        id,
        name,
        logo_url,
        LOWER(REPLACE(name, ' ', '-')) as slug
      FROM brands 
      ORDER BY display_order ASC, name ASC
    `);
    
    const brands = result.rows.map(brand => {
      let logoUrl = brand.logo_url;
      
      if (!logoUrl) {
        const fallbackLogos: { [key: string]: string } = {
          'AJAZZ': 'logos/AJAZZ.webp',
          'ATTACK SHARK': 'logos/ATTACK SHARK.png',
          'AULA': 'logos/Aula_logo_-_4.png',
          'IROK': 'logos/IROK.png',
          'SCYROX': 'logos/SCYROX.png',
          'FIFINE': 'logos/fifine-logo.png',
          'VGN': 'logos/vgn-letter-logo-design-with-polygon-shape-vgn-polygon-and-cube-shape-logo-design-vgn-hexagon-logo-template-white-and-black-colors-vgn-monogram-business-and-real-estate-logo-vector.jpg',
          'XINMENG': 'logos/xinmeng-keyboards-and-mouses-3.jpg',
          'MCHOSE': 'logos/AJAZZ.webp',
          'MONSGEEK': 'logos/AJAZZ.webp',
          'MADLIONS': 'logos/AJAZZ.webp'
        };
        logoUrl = fallbackLogos[brand.name.toUpperCase()] || 'logos/AJAZZ.webp';
      }
      
      return formatBrandLogo({ ...brand, logo_url: logoUrl });
    });
    
    res.json({ brands });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get brand by ID (admin)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM brands WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    res.json({ brand: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create brand (admin)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, logo_url, display_order } = req.body;
    
    let order = display_order;
    if (order === undefined || order === null) {
      const maxResult = await query('SELECT COALESCE(MAX(display_order), 0) as max_order FROM brands');
      order = maxResult.rows[0].max_order + 1;
    }
    
    const result = await query(
      'INSERT INTO brands (name, logo_url, display_order) VALUES ($1, $2, $3) RETURNING *',
      [name, logo_url || null, order]
    );
    res.status(201).json({ brand: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update brand (admin)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, logo_url, display_order } = req.body;
    
    const result = await query(
      'UPDATE brands SET name = $1, logo_url = $2, display_order = COALESCE($3, display_order) WHERE id = $4 RETURNING *',
      [name, logo_url || null, display_order, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    res.json({ brand: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete brand (admin)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM brands WHERE id = $1', [id]);
    res.json({ message: 'Brand deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
