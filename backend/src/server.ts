import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initDatabase } from './database';
import { authRateLimiter, apiRateLimiter } from './middleware/auth';
import path from 'path';
import authRouter from './routes/auth';
import productsRouter from './routes/products';
import categoriesRouter from './routes/categories';
import parentCategoriesRouter from './routes/parent-categories';
import cartsRouter from './routes/carts';
import ordersRouter from './routes/orders';
import uploadRouter from './routes/upload';
import brandsRouter from './routes/brands';
import productColorsRouter from './routes/product-colors';
import searchRouter from './routes/search';
import stockNotificationsRouter from './routes/stock-notifications';
import settingsRouter from './routes/settings';
import sitemapRouter from './routes/sitemap';
import robotsRouter from './routes/robots';
import heroImagesRouter from './routes/hero-images';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9000;

// Trust proxy - Required for rate limiting behind Nginx
app.set('trust proxy', 1);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);

// Manually set COOP header
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

// CORS configuration - Allow all origins with credentials
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json({ limit: '10mb' }));

// Apply rate limiting
app.use('/auth', authRateLimiter);
app.use('/store', apiRateLimiter);
app.use('/admin', apiRateLimiter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SEO files
app.use('/', sitemapRouter);
app.use('/', robotsRouter);

// Routes
app.use('/auth', authRouter);
app.use('/store/products', productsRouter);
app.use('/store/parent-categories', parentCategoriesRouter);
app.use('/store/categories', categoriesRouter);
app.use('/store/collections', categoriesRouter); // Alias for backward compatibility
app.use('/store/carts', cartsRouter);
app.use('/store/orders', ordersRouter);
app.use('/store/brands', brandsRouter);
app.use('/store/product-colors', productColorsRouter);
app.use('/store/search', searchRouter);
app.use('/store/stock-notifications', stockNotificationsRouter);
app.use('/store/settings', settingsRouter);
app.use('/store/hero-images', heroImagesRouter);

// Admin routes
app.use('/admin/products', productsRouter);
app.use('/admin/parent-categories', parentCategoriesRouter);
app.use('/admin/categories', categoriesRouter);
app.use('/admin/orders', ordersRouter);
app.use('/admin/upload', uploadRouter);
app.use('/admin/brands', brandsRouter);
app.use('/admin/product-colors', productColorsRouter);
app.use('/admin/stock-notifications', stockNotificationsRouter);
app.use('/admin/settings', settingsRouter);
app.use('/admin/hero-images', heroImagesRouter);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Start server
const startServer = async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`?? Backend server running on http://localhost:${PORT}`);
      console.log(`?? Admin Dashboard: http://localhost:${PORT}/admin`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
