import { Module } from '@nestjs/common';
import { ProductColorImagesController } from './product-color-images.controller';
import { ProductColorImagesService } from './product-color-images.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductColorImagesController],
  providers: [ProductColorImagesService],
  exports: [ProductColorImagesService],
})
export class ProductColorImagesModule {}
