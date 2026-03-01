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
import { CustomerEntity } from '../../database/entities/customer.entity';
import { CreateTransactionDto } from './models/dto/create-transaction.dto';
import { UpdateTransactionDto } from './models/dto/update-transaction.dto';
import { ok, fail } from '../../shared/utils/result.utils';

const mockCustomer: CustomerEntity = {
  id: 'cust-uuid-1',
  fullName: 'Test User',
  email: 'test@test.com',
  phoneNumber: '+573001234567',
  documentNumber: '12345',
  passwordHash: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  transactions: [],
};

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

describe('TransactionsService', () => {
  let service: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: getRepositoryToken(TransactionEntity), useValue: mockTransactionRepository },
        { provide: ProductsService, useValue: mockProductsService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();
    service = module.get<TransactionsService>(TransactionsService);
    jest.clearAllMocks();
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