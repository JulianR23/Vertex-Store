import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import {
  TransactionEntity,
  TransactionStatus,
} from '../../database/entities/transaction.entity';
import { ProductsService } from '../products/products.service';
import { CustomersService } from '../customers/customers.service';
import { CreateTransactionDto } from './models/dto/create-transaction.dto';
import { UpdateTransactionDto } from './models/dto/update-transaction.dto';
import { ok, fail } from '../../shared/utils/result.utils';

const mockTransaction: TransactionEntity = {
  id: 'tx-uuid-1',
  reference: 'VS-ABC-12345678',
  wompiTransactionId: null,
  status: TransactionStatus.PENDING,
  productAmountInCents: 130000000,
  baseFeeInCents: 300000,
  deliveryFeeInCents: 200000,
  totalAmountInCents: 130500000,
  currency: 'COP',
  cardLastFour: '1111',
  cardBrand: 'VISA',
  failureReason: null,
  productId: 'prod-uuid-1',
  customerId: 'cust-uuid-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  product: {} as any,
  customer: {} as any,
  delivery: {} as any,
};

const mockQueryRunner = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: {
    create: jest.fn(),
    save: jest.fn(),
  },
};

const mockDataSource = {
  createQueryRunner: jest.fn(() => mockQueryRunner),
  getRepository: jest.fn(() => ({ update: jest.fn() })),
};

const mockTransactionRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
};

const mockProductsService = {
  hasStock: jest.fn(),
  findById: jest.fn(),
  decrementStock: jest.fn(),
};

const mockCustomersService = {
  create: jest.fn(),
};

describe('TransactionsService', () => {
  let service: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: getRepositoryToken(TransactionEntity), useValue: mockTransactionRepository },
        { provide: ProductsService, useValue: mockProductsService },
        { provide: CustomersService, useValue: mockCustomersService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();
    service = module.get<TransactionsService>(TransactionsService);
    jest.clearAllMocks();
  });

  describe('createPending', () => {
    const inputDto: CreateTransactionDto = {
      productId: 'prod-uuid-1',
      customer: {
        fullName: 'Test User',
        email: 'test@test.com',
        phoneNumber: '+573001234567',
        documentNumber: '12345',
      },
      card: {
        cardNumber: '4111111111111111',
        cardHolder: 'Test User',
        expiryMonth: '12',
        expiryYear: '2027',
        cvv: '123',
      },
      delivery: {
        addressLine: 'Calle 123',
        city: 'Medellín',
        department: 'Antioquia',
        postalCode: '050001',
      },
    };

    it('should return fail when product has no stock', async () => {
      mockProductsService.hasStock.mockResolvedValue(ok(false));
      const actualResult = await service.createPending(inputDto);
      expect(actualResult.isSuccess).toBe(false);
      if (!actualResult.isSuccess) expect(actualResult.error).toContain('out of stock');
    });

    it('should return fail when stock check fails', async () => {
      mockProductsService.hasStock.mockResolvedValue(fail('Product not found'));
      const actualResult = await service.createPending(inputDto);
      expect(actualResult.isSuccess).toBe(false);
    });

    it('should create transaction successfully when stock is available', async () => {
      mockProductsService.hasStock.mockResolvedValue(ok(true));
      mockCustomersService.create.mockResolvedValue(
        ok({ id: 'cust-uuid-1', fullName: 'Test User', email: 'test@test.com', phoneNumber: '+573001234567', documentNumber: '12345', createdAt: new Date() }),
      );
      mockProductsService.findById.mockResolvedValue({
        id: 'prod-uuid-1',
        priceInCents: 130000000,
      });
      const savedTx = { ...mockTransaction, id: 'tx-uuid-1' };
      mockQueryRunner.manager.create
        .mockReturnValueOnce(savedTx)
        .mockReturnValueOnce({});
      mockQueryRunner.manager.save
        .mockResolvedValueOnce(savedTx)
        .mockResolvedValueOnce({});
      mockTransactionRepository.findOne.mockResolvedValue({
        ...mockTransaction,
        product: { id: 'prod-uuid-1', name: 'AirPods' },
        customer: { id: 'cust-uuid-1', fullName: 'Test' },
        delivery: { id: 'del-uuid-1', city: 'Medellín' },
      });
      const actualResult = await service.createPending(inputDto);
      expect(actualResult.isSuccess).toBe(true);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should return fail when transaction not found', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(null);
      const inputDto: UpdateTransactionDto = { status: TransactionStatus.APPROVED };
      const actualResult = await service.updateStatus('non-existent', inputDto);
      expect(actualResult.isSuccess).toBe(false);
    });

    it('should return fail when transaction is already processed', async () => {
      mockTransactionRepository.findOne.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.APPROVED,
      });
      const inputDto: UpdateTransactionDto = { status: TransactionStatus.APPROVED };
      const actualResult = await service.updateStatus('tx-uuid-1', inputDto);
      expect(actualResult.isSuccess).toBe(false);
    });

    it('should update status to APPROVED and decrement stock', async () => {
      mockTransactionRepository.findOne
        .mockResolvedValueOnce({ ...mockTransaction })
        .mockResolvedValueOnce({ ...mockTransaction, status: TransactionStatus.APPROVED, product: {}, customer: {}, delivery: {} });
      mockTransactionRepository.save.mockResolvedValue({});
      mockProductsService.decrementStock.mockResolvedValue(ok({}));
      const inputDto: UpdateTransactionDto = {
        status: TransactionStatus.APPROVED,
        wompiTransactionId: 'wompi-123',
      };
      const actualResult = await service.updateStatus('tx-uuid-1', inputDto);
      expect(actualResult.isSuccess).toBe(true);
      expect(mockProductsService.decrementStock).toHaveBeenCalledWith('prod-uuid-1');
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException when transaction not found', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(null);
      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});