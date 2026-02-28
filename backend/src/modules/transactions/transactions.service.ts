import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  TransactionEntity,
  TransactionStatus,
} from '../../database/entities/transaction.entity';
import { DeliveryEntity, DeliveryStatus } from '../../database/entities/delivery.entity';
import { CreateTransactionDto } from './models/dto/create-transaction.dto';
import { UpdateTransactionDto } from './models/dto/update-transaction.dto';
import { TransactionResponse } from './models/types/transaction-response.type';
import { CustomersService } from '../customers/customers.service';
import { ProductsService } from '../products/products.service';
import { FEE_CONSTANTS, CURRENCY } from '../../shared/constants/fees.constants';
import { generateTransactionReference } from '../../shared/utils/reference.util';
import { detectCardBrand, extractLastFour } from '../../shared/utils/card.util';
import { Result, ok, fail } from '../../shared/utils/result.utils';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    private readonly customersService: CustomersService,
    private readonly productsService: ProductsService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a PENDING transaction with associated customer and delivery.
   * Uses ACID transaction to ensure atomicity.
   */
  async createPending(dto: CreateTransactionDto): Promise<Result<TransactionResponse, string>> {
    const stockResult = await this.productsService.hasStock(dto.productId);
    if (!stockResult.isSuccess) return fail(stockResult.error);
    if (!stockResult.value) return fail('Product is out of stock');

    const customerResult = await this.customersService.create(dto.customer);
    if (!customerResult.isSuccess) return fail(customerResult.error);

    const product = await this.productsService.findById(dto.productId);
    const totalAmountInCents =
      product.priceInCents + FEE_CONSTANTS.BASE_FEE_IN_CENTS + FEE_CONSTANTS.DELIVERY_FEE_IN_CENTS;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaction = queryRunner.manager.create(TransactionEntity, {
        reference: generateTransactionReference(),
        status: TransactionStatus.PENDING,
        productAmountInCents: product.priceInCents,
        baseFeeInCents: FEE_CONSTANTS.BASE_FEE_IN_CENTS,
        deliveryFeeInCents: FEE_CONSTANTS.DELIVERY_FEE_IN_CENTS,
        totalAmountInCents,
        currency: CURRENCY,
        cardLastFour: extractLastFour(dto.card.cardNumber),
        cardBrand: detectCardBrand(dto.card.cardNumber),
        productId: dto.productId,
        customerId: customerResult.value.id,
      });
      const savedTransaction = await queryRunner.manager.save(transaction);

      const delivery = queryRunner.manager.create(DeliveryEntity, {
        addressLine: dto.delivery.addressLine,
        city: dto.delivery.city,
        department: dto.delivery.department,
        postalCode: dto.delivery.postalCode,
        recipientName: dto.customer.fullName,
        status: DeliveryStatus.PENDING,
        transactionId: savedTransaction.id,
      });
      await queryRunner.manager.save(delivery);
      await queryRunner.commitTransaction();

      const fullTransaction = await this.findById(savedTransaction.id);
      return ok(fullTransaction);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Updates a transaction status after Wompi payment response.
   */
  async updateStatus(
    id: string,
    dto: UpdateTransactionDto,
  ): Promise<Result<TransactionResponse, string>> {
    const transaction = await this.transactionRepository.findOne({ where: { id } });
    if (!transaction) return fail(`Transaction ${id} not found`);
    if (transaction.status !== TransactionStatus.PENDING) {
      return fail(`Transaction is already ${transaction.status}`);
    }

    transaction.status = dto.status;
    if (dto.wompiTransactionId) transaction.wompiTransactionId = dto.wompiTransactionId;
    if (dto.failureReason) transaction.failureReason = dto.failureReason;

    await this.transactionRepository.save(transaction);

    if (dto.status === TransactionStatus.APPROVED) {
      await this.productsService.decrementStock(transaction.productId);
      await this.dataSource.getRepository(DeliveryEntity).update(
        { transactionId: id },
        { status: DeliveryStatus.ASSIGNED },
      );
    }

    const updated = await this.findById(id);
    return ok(updated);
  }

  /**
   * Retrieves a transaction by ID with all relations.
   */
  async findById(id: string): Promise<TransactionResponse> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['product', 'customer', 'delivery'],
    });
    if (!transaction) throw new NotFoundException(`Transaction ${id} not found`);
    return this.toResponse(transaction);
  }

  private readonly toResponse = (t: TransactionEntity): TransactionResponse => ({
    id: t.id,
    reference: t.reference,
    wompiTransactionId: t.wompiTransactionId,
    status: t.status,
    productAmountInCents: t.productAmountInCents,
    baseFeeInCents: t.baseFeeInCents,
    deliveryFeeInCents: t.deliveryFeeInCents,
    totalAmountInCents: t.totalAmountInCents,
    currency: t.currency,
    cardLastFour: t.cardLastFour,
    cardBrand: t.cardBrand,
    failureReason: t.failureReason,
    product: t.product
      ? {
          id: t.product.id,
          name: t.product.name,
          description: t.product.description,
          imageUrl: t.product.imageUrl,
          priceInCents: t.product.priceInCents,
          stock: t.product.stock,
          isActive: t.product.isActive,
          createdAt: t.product.createdAt,
        }
      : undefined,
    customer: t.customer
      ? {
          id: t.customer.id,
          fullName: t.customer.fullName,
          email: t.customer.email,
          phoneNumber: t.customer.phoneNumber,
          documentNumber: t.customer.documentNumber,
          createdAt: t.customer.createdAt,
        }
      : undefined,
    delivery: t.delivery
      ? {
          id: t.delivery.id,
          addressLine: t.delivery.addressLine,
          city: t.delivery.city,
          department: t.delivery.department,
          postalCode: t.delivery.postalCode,
          recipientName: t.delivery.recipientName,
          status: t.delivery.status,
          transactionId: t.delivery.transactionId,
          createdAt: t.delivery.createdAt,
        }
      : undefined,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  });
}