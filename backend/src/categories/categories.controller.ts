import { Controller, Get, Post, Put, Delete, Body, Param, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CategoriesService } from './categories.service';

@Controller('categories')
@UseInterceptors(CacheInterceptor)
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get('with-subcategories')
  async findAllWithSubcategories() {
    return this.categoriesService.findAllWithSubcategories();
  }

  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Post()
  async create(@Body() categoryData: any) {
    return this.categoriesService.create(categoryData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() categoryData: any) {
    return this.categoriesService.update(+id, categoryData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
