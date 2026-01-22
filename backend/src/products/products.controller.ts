import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ProductsService } from './products.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('products')
@UseInterceptors(CacheInterceptor)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Public()
  @Get()
  async findAll() {
    return this.productsService.findAll();
  }

  @Public()
  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('category') category: string,
    @Query('min_price') minPrice: string,
    @Query('max_price') maxPrice: string,
    @Query('sort') sort: string,
  ) {
    return this.productsService.search({
      query,
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sort: sort || 'relevance',
    });
  }

  @Public()
  @Get('search/suggestions')
  async searchSuggestions(@Query('q') query: string) {
    return this.productsService.getSearchSuggestions(query);
  }

  @Public()
  @Get('search/popular')
  async getPopular() {
    return this.productsService.getPopularSearches();
  }

  @Public()
  @Get('deals')
  async findDeals() {
    return this.productsService.findDeals();
  }

  @Public()
  @Get('category/:categoryId')
  async findByCategory(@Param('categoryId') categoryId: string) {
    return this.productsService.findByCategory(+categoryId);
  }

  @Public()
  @Get('subcategory/:subcategoryId')
  async findBySubcategory(@Param('subcategoryId') subcategoryId: string) {
    return this.productsService.findBySubcategory(+subcategoryId);
  }

  @Public()
  @Get('sku/:sku')
  async findBySku(@Param('sku') sku: string) {
    return this.productsService.findBySku(sku);
  }

  @Public()
  @Get(':id/images')
  async getProductImages(@Param('id') id: string) {
    return this.productsService.getProductImages(+id);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Roles('admin')
  @Post()
  async create(@Body() productData: any) {
    return this.productsService.create(productData);
  }

  @Roles('admin')
  @Put(':id')
  async update(@Param('id') id: string, @Body() productData: any) {
    return this.productsService.update(+id, productData);
  }

  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
