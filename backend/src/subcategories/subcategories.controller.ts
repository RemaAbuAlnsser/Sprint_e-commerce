import { Controller, Get, Post, Put, Delete, Body, Param, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { SubcategoriesService } from './subcategories.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('subcategories')
@UseInterceptors(CacheInterceptor)
export class SubcategoriesController {
  constructor(private subcategoriesService: SubcategoriesService) {}

  @Public()
  @Get()
  async findAll() {
    return this.subcategoriesService.findAll();
  }

  @Public()
  @Get('category/:categoryId')
  async findByCategory(@Param('categoryId') categoryId: string) {
    return this.subcategoriesService.findByCategory(+categoryId);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.subcategoriesService.findOne(+id);
  }

  @Roles('admin')
  @Post()
  async create(@Body() subcategoryData: any) {
    return this.subcategoriesService.create(subcategoryData);
  }

  @Roles('admin')
  @Put(':id')
  async update(@Param('id') id: string, @Body() subcategoryData: any) {
    return this.subcategoriesService.update(+id, subcategoryData);
  }

  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.subcategoriesService.remove(+id);
  }
}
