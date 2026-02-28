import { TransactionStatus } from '../../../../database/entities/transaction.entity';
import { CustomerResponse } from '../../../customers/models/types/customer-response.type';
import { ProductResponse } from '../../../products/types/product-response.types';
import { DeliveryResponse } from '../../../deliveries/types/delivery-response.type';

export interface TransactionResponse {
  readonly id: string;
  readonly reference: string | null;
  readonly wompiTransactionId: string | null;
  readonly status: TransactionStatus;
  readonly productAmountInCents: number;
  readonly baseFeeInCents: number;
  readonly deliveryFeeInCents: number;
  readonly totalAmountInCents: number;
  readonly currency: string;
  readonly cardLastFour: string | null;
  readonly cardBrand: string | null;
  readonly failureReason: string | null;
  readonly product?: ProductResponse;
  readonly customer?: CustomerResponse;
  readonly delivery?: DeliveryResponse;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}