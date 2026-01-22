import { Controller, Get, Post, Put, Delete, Body, Param, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CategoriesService } from './categories.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('categories')
@UseInterceptors(CacheInterceptor)
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Public()
  @Get('with-subcategories')
  async findAllWithSubcategories() {
    return this.categoriesService.findAllWithSubcategories();
  }

  @Public()
  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Roles('admin')
  @Post()
  async create(@Body() categoryData: any) {
    return this.categoriesService.create(categoryData);
  }

  @Roles('admin')
  @Put(':id')
  async update(@Param('id') id: string, @Body() categoryData: any) {
    return this.categoriesService.update(+id, categoryData);
  }

  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
