import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.use(compression());
  
  app.enableCors({
    origin: [
      'http://localhost:3001', 
      'http://localhost:3000', 
      'http://localhost:3002',
      'http://104.234.26.192:3000',
      'http://104.234.26.192:3001',
      'http://104.234.26.192:3002',
      'http://104.234.26.192',
    ],
    credentials: true,
  });

  // Serve static files from uploads folder
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
