import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from '../../database/entities/transaction.entity';
import { DeliveryEntity } from '../../database/entities/delivery.entity';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { CustomersModule } from '../customers/customer.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionEntity, DeliveryEntity]),
    CustomersModule,
    ProductsModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}