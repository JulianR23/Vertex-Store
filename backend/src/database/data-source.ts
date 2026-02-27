import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { ProductEntity } from './entities/product.entity';
import { CustomerEntity } from './entities/customer.entity';
import { TransactionEntity } from './entities/transaction.entity';
import { DeliveryEntity } from './entities/delivery.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'vertex_user',
  password: process.env.DB_PASSWORD ?? 'vertex_password',
  database: process.env.DB_NAME ?? 'vertex_store',
  entities: [ProductEntity, CustomerEntity, TransactionEntity, DeliveryEntity],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});