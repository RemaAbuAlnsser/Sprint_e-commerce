import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Upload single image
router.post('/', (req: Request, res: Response, next: any) => {
  const uploadSingle = upload.single('file');
  uploadSingle(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return only filename - backend will add /uploads/ when serving
    res.json({
      success: true,
      url: req.file.filename,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Upload multiple images
router.post('/multiple', upload.array('images', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const images = files.map(file => ({
      url: file.filename,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
    }));
    
    res.json({ success: true, images });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
