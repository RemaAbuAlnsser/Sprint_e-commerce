import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CompaniesService } from './companies.service';

@Controller('companies')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Get()
  async findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.companiesService.findOne(+id);
  }

  @Post()
  async create(@Body() companyData: any) {
    return this.companiesService.create(companyData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() companyData: any) {
    return this.companiesService.update(+id, companyData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.companiesService.remove(+id);
  }
}
