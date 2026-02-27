import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { TransactionEntity } from './transaction.entity';

export enum DeliveryStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

@Entity('deliveries')
export class DeliveryEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  addressLine: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  department: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postalCode: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  recipientName: string | null;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
  })
  status: DeliveryStatus;

  @OneToOne(() => TransactionEntity, (transaction) => transaction.delivery)
  @JoinColumn({ name: 'transaction_id' })
  transaction: TransactionEntity;

  @Column({ name: 'transaction_id' })
  transactionId: string;
}