import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from '../../database/entities/transaction.entity';
import { DeliveryEntity } from '../../database/entities/delivery.entity';
import { TransactionsController } from './controllers/transactions.controller';
import { WebhookController } from './controllers/webhook.controller';
import { TransactionsService } from './transactions.service';
import { ProductsModule } from '../products/products.module';
import { AuthModule } from '../auth/auth.module';
import { WompiModule } from '../wompi/wompi.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionEntity, DeliveryEntity]),
    ProductsModule,
    AuthModule,
    WompiModule,
  ],
  controllers: [TransactionsController, WebhookController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}