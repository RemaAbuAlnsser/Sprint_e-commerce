import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ProductColorImagesService } from './product-color-images.service';

@Controller('product-color-images')
export class ProductColorImagesController {
  constructor(private productColorImagesService: ProductColorImagesService) {}

  @Get('color/:colorId')
  async getColorImages(@Param('colorId') colorId: string) {
    return this.productColorImagesService.getColorImages(+colorId);
  }

  @Post()
  async create(@Body() imageData: any) {
    return this.productColorImagesService.create(imageData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.productColorImagesService.remove(+id);
  }
}
