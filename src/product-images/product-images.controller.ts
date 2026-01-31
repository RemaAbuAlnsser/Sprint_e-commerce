import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ProductImagesService } from './product-images.service';

@Controller('product-images')
export class ProductImagesController {
  constructor(private productImagesService: ProductImagesService) {}

  @Get('product/:productId')
  async findByProduct(@Param('productId') productId: string) {
    return this.productImagesService.findByProduct(+productId);
  }

  @Post()
  async create(@Body() imageData: any) {
    return this.productImagesService.create(imageData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.productImagesService.remove(+id);
  }
}
