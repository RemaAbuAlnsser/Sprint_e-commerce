import { Module } from '@nestjs/common';
import { ProductColorsController } from './product-colors.controller';
import { ProductColorsService } from './product-colors.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductColorsController],
  providers: [ProductColorsService],
  exports: [ProductColorsService],
})
export class ProductColorsModule {}
