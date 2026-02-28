import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductResponse } from './types/product-response.types';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('health')
  checkHealth(): { status: string } {
    return { status: 'ok' };
  }

  @Get()
  async findAll(): Promise<ProductResponse[]> {
    return this.productsService.findAllActive();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ProductResponse> {
    return this.productsService.findById(id);
  }
}