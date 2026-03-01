import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryEntity } from '../../database/entities/delivery.entity';
import { DeliveryResponse } from './types/delivery-response.type';

@Injectable()
export class DeliveriesService {
  constructor(
    @InjectRepository(DeliveryEntity)
    private readonly deliveryRepository: Repository<DeliveryEntity>,
  ) {}

  /**
   * Retrieves a delivery by transaction ID.
   */
  async findByTransactionId(transactionId: string): Promise<DeliveryResponse> {
    const delivery = await this.deliveryRepository.findOne({
      where: { transactionId },
    });
    if (!delivery) {
      throw new NotFoundException(`Delivery for transaction ${transactionId} not found`);
    }
    return this.toResponse(delivery);
  }

  /**
   * Retrieves a delivery by ID.
   */
  async findById(id: string): Promise<DeliveryResponse> {
    const delivery = await this.deliveryRepository.findOne({ where: { id } });
    if (!delivery) throw new NotFoundException(`Delivery ${id} not found`);
    return this.toResponse(delivery);
  }

  private readonly toResponse = (delivery: DeliveryEntity): DeliveryResponse => ({
    id: delivery.id,
    addressLine: delivery.addressLine,
    city: delivery.city,
    department: delivery.department,
    postalCode: delivery.postalCode,
    recipientName: delivery.recipientName,
    status: delivery.status,
    transactionId: delivery.transactionId,
    createdAt: delivery.createdAt,
  });
}