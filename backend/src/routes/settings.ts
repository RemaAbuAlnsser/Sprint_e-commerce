import { Router, Request, Response } from 'express';
import { query } from '../database';

const router = Router();

// Get all settings (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM site_settings');
    
    // Convert to key-value object
    const settings: { [key: string]: string } = {};
    result.rows.forEach((row: any) => {
      settings[row.setting_key] = row.setting_value;
    });
    
    res.json({ settings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific setting (public)
router.get('/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const result = await query(
      'SELECT * FROM site_settings WHERE setting_key = $1',
      [key]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    res.json({ setting: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update or create setting (admin only)
router.put('/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    // Check if setting exists
    const existing = await query(
      'SELECT * FROM site_settings WHERE setting_key = $1',
      [key]
    );
    
    let result;
    if (existing.rows.length > 0) {
      // Update existing setting
      result = await query(
        'UPDATE site_settings SET setting_value = $1, updated_at = CURRENT_TIMESTAMP WHERE setting_key = $2 RETURNING *',
        [value, key]
      );
    } else {
      // Create new setting
      result = await query(
        'INSERT INTO site_settings (setting_key, setting_value) VALUES ($1, $2) RETURNING *',
        [key, value]
      );
    }
    
    res.json({ setting: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete setting (admin only)
router.delete('/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    
    const result = await query(
      'DELETE FROM site_settings WHERE setting_key = $1 RETURNING *',
      [key]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    res.json({ message: 'Setting deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
