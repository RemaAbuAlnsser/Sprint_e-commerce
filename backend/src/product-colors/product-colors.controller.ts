import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ProductColorsService } from './product-colors.service';

@Controller('product-colors')
export class ProductColorsController {
  constructor(private readonly productColorsService: ProductColorsService) {}

  @Get('available-colors')
  async getAvailableColors() {
    return this.productColorsService.findAllUniqueColors();
  }

  @Get('product/:productId')
  async getProductColors(@Param('productId') productId: string) {
    return this.productColorsService.findByProduct(parseInt(productId));
  }

  @Post()
  async create(@Body() colorData: any) {
    return this.productColorsService.create(colorData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() colorData: any) {
    return this.productColorsService.update(parseInt(id), colorData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.productColorsService.remove(parseInt(id));
  }

  @Post('decrease-stock')
  async decreaseStock(@Body() data: { product_id: number; color_id: number; quantity: number }) {
    return this.productColorsService.decreaseStock(data.product_id, data.color_id, data.quantity);
  }
}
