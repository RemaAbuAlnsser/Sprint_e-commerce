import { Controller, Get, Post, Put, Delete, Body, Param, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CompaniesService } from './companies.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('companies')
@UseInterceptors(CacheInterceptor)
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Public()
  @Get()
  async findAll() {
    return this.companiesService.findAll();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.companiesService.findOne(+id);
  }

  @Roles('admin')
  @Post()
  async create(@Body() companyData: any) {
    return this.companiesService.create(companyData);
  }

  @Roles('admin')
  @Put(':id')
  async update(@Param('id') id: string, @Body() companyData: any) {
    return this.companiesService.update(+id, companyData);
  }

  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.companiesService.remove(+id);
  }
}
