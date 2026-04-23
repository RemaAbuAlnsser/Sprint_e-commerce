import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../database';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, first_name, last_name } = req.body;
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    const result = await query(
      'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, passwordHash, first_name, last_name]
    );
    
    const user = result.rows[0];
    
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
