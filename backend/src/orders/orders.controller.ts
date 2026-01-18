import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  async findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Post()
  async create(@Body() orderData: any) {
    return this.ordersService.create(orderData);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() data: { status: string }) {
    return this.ordersService.updateStatus(+id, data.status);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.ordersService.delete(+id);
  }
}
