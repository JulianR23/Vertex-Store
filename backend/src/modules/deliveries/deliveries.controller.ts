import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { DeliveryResponse } from './types/delivery-response.type';

@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Get('health')
  checkHealth(): { status: string } {
    return { status: 'ok' };
  }

  @Get('by-transaction/:transactionId')
  async findByTransaction(
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
  ): Promise<DeliveryResponse> {
    return this.deliveriesService.findByTransactionId(transactionId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<DeliveryResponse> {
    return this.deliveriesService.findById(id);
  }
}