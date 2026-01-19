import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
  providers: [AppService],
})
export class AppModule {}
