import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductEntity } from './entities/product.entity';
import { CustomerEntity } from './entities/customer.entity';
import { TransactionEntity } from './entities/transaction.entity';
import { DeliveryEntity } from './entities/delivery.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'vertex_user'),
        password: configService.get<string>('DB_PASSWORD', 'vertex_password'),
        database: configService.get<string>('DB_NAME', 'vertex_store'),
        entities: [ProductEntity, CustomerEntity, TransactionEntity, DeliveryEntity],
        synchronize: configService.get<string>('TYPEORM_SYNCHRONIZE', 'false') === 'true',
        logging: false,
      }),
    }),
  ],
})
export class DatabaseModule {}