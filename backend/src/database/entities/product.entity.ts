import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { TransactionEntity } from './transaction.entity';

@Entity('products')
export class ProductEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 255 })
  imageUrl: string;

  @Column({ type: 'int' })
  priceInCents: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => TransactionEntity, (transaction) => transaction.product)
  transactions: TransactionEntity[];
}