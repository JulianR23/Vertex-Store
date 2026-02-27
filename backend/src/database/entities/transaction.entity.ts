import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ProductEntity } from './product.entity';
import { CustomerEntity } from './customer.entity';
import { DeliveryEntity } from './delivery.entity';

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  FAILED = 'FAILED',
  VOIDED = 'VOIDED',
}

@Entity('transactions')
export class TransactionEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100, nullable: true })
  wompiTransactionId: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  reference: string | null;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'int' })
  productAmountInCents: number;

  @Column({ type: 'int' })
  baseFeeInCents: number;

  @Column({ type: 'int' })
  deliveryFeeInCents: number;

  @Column({ type: 'int' })
  totalAmountInCents: number;

  @Column({ type: 'varchar', length: 3, default: 'COP' })
  currency: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  cardLastFour: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  cardBrand: string | null;

  @Column({ type: 'text', nullable: true })
  failureReason: string | null;

  @ManyToOne(() => ProductEntity, (product) => product.transactions)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => CustomerEntity, (customer) => customer.transactions)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @Column({ name: 'customer_id' })
  customerId: string;

  @OneToOne(() => DeliveryEntity, (delivery) => delivery.transaction)
  delivery: DeliveryEntity;
}