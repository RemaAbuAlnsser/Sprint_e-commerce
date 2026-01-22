import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
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
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 300000,
      max: 100,
    }),
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
