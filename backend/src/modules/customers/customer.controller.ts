import { Controller, Post, Get, Body, Param, ParseUUIDPipe, NotFoundException, ConflictException } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './models/dto/create-customer.dto';
import { CustomerResponse } from './models/types/customer-response.type';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('health')
  checkHealth(): { status: string } {
    return { status: 'ok' };
  }

  @Post()
  async create(@Body() dto: CreateCustomerDto): Promise<CustomerResponse> {
    const result = await this.customersService.create(dto);
    if (!result.isSuccess) throw new ConflictException(result.error);
    return result.value;
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CustomerResponse> {
    const customer = await this.customersService.findById(id);
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);
    return customer;
  }
}