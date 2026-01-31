import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { UploadModule } from './upload/upload.module';
import { CompaniesModule } from './companies/companies.module';
import { SubcategoriesModule } from './subcategories/subcategories.module';
import { SettingsModule } from './settings/settings.module';
import { ProductColorsModule } from './product-colors/product-colors.module';
import { ProductImagesModule } from './product-images/product-images.module';
import { ProductColorImagesModule } from './product-color-images/product-color-images.module';
import { ExportModule } from './export/export.module';

@Module({
  imports: [
    /**
     * 1️⃣ تحميل Environment Variables
     * - يقرأ فقط .env.production
     * - يوقف السيرفر لو أي متغير ناقص
     */
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.production',
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_USER: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        PORT: Joi.number().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().required(),
      }),
    }),

    /**
     * 2️⃣ Cache (قيمة منطقية للإنتاج)
     */
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 دقائق
      max: 100,
    }),

    /**
     * 3️⃣ باقي الموديلز
     */
    DatabaseModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    UploadModule,
    CompaniesModule,
    SubcategoriesModule,
    SettingsModule,
    ProductColorsModule,
    ProductImagesModule,
    ProductColorImagesModule,
    ExportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
