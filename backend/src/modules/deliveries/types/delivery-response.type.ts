import { DeliveryStatus } from '../../../database/entities/delivery.entity';

export interface DeliveryResponse {
  readonly id: string;
  readonly addressLine: string;
  readonly city: string;
  readonly department: string;
  readonly postalCode: string | null;
  readonly recipientName: string | null;
  readonly status: DeliveryStatus;
  readonly transactionId: string;
  readonly createdAt: Date;
}