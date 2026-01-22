import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Roles('admin')
  @Get()
  async findAll() {
    return this.ordersService.findAll();
  }

  @Roles('admin', 'customer')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Roles('admin', 'customer')
  @Post()
  async create(@Body() orderData: any) {
    return this.ordersService.create(orderData);
  }

  @Roles('admin')
  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() data: { status: string }) {
    return this.ordersService.updateStatus(+id, data.status);
  }

  @Roles('admin')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.ordersService.delete(+id);
  }
}
