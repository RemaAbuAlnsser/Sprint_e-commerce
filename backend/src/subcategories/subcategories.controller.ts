import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { SubcategoriesService } from './subcategories.service';

@Controller('subcategories')
export class SubcategoriesController {
  constructor(private subcategoriesService: SubcategoriesService) {}

  @Get()
  async findAll() {
    return this.subcategoriesService.findAll();
  }

  @Get('category/:categoryId')
  async findByCategory(@Param('categoryId') categoryId: string) {
    return this.subcategoriesService.findByCategory(+categoryId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.subcategoriesService.findOne(+id);
  }

  @Post()
  async create(@Body() subcategoryData: any) {
    return this.subcategoriesService.create(subcategoryData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() subcategoryData: any) {
    return this.subcategoriesService.update(+id, subcategoryData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.subcategoriesService.remove(+id);
  }
}
