import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // =========================
  // Trust proxy (important with Nginx + HTTPS)
  // =========================
  app.set('trust proxy', 1);

  // =========================
  // Global API prefix
  // =========================
  app.setGlobalPrefix('api');

  // =========================
  // Enable compression
  // =========================
  app.use(compression());

  // =========================
  // Smart CORS Configuration
  // =========================
  const allowedOrigins = [
    // Local development
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',

    // Production frontend
    'https://spiritt.net',
    'https://www.spiritt.net',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow server-to-server & tools (Postman, cron jobs)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
  });

  // =========================
  // Static uploads
  // =========================
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 API running on port ${port}`);
}

bootstrap();

