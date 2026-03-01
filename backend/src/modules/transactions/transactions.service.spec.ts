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
import { WompiService } from '../wompi/wompi.service';
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
  update: jest.fn(),
};

const mockProductsService = {
  hasStock: jest.fn(),
  findById: jest.fn(),
  decrementStock: jest.fn(),
};

const mockWompiService = {
  generateSignature: jest.fn(() => 'mock-signature'),
  fetchAcceptanceToken: jest.fn(),
  createTransaction: jest.fn(),
  fetchTransactionStatus: jest.fn(),
  validateWebhookSignature: jest.fn(),
};

describe('TransactionsService', () => {
  let service: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(TransactionEntity),
          useValue: mockTransactionRepository,
        },
        { provide: ProductsService, useValue: mockProductsService },
        { provide: WompiService, useValue: mockWompiService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();
    service = module.get<TransactionsService>(TransactionsService);
    jest.clearAllMocks();
  });

  describe('updateStatus', () => {
    it('should return fail when transaction not found', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(null);
      const inputDto: UpdateTransactionDto = {
        status: TransactionStatus.APPROVED,
      };
      const actualResult = await service.updateStatus('non-existent', inputDto);
      expect(actualResult.isSuccess).toBe(false);
    });

    it('should return fail when transaction is already processed', async () => {
      mockTransactionRepository.findOne.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.APPROVED,
      });
      const inputDto: UpdateTransactionDto = {
        status: TransactionStatus.APPROVED,
      };
      const actualResult = await service.updateStatus('tx-uuid-1', inputDto);
      expect(actualResult.isSuccess).toBe(false);
    });

    it('should update status to APPROVED and decrement stock', async () => {
      mockTransactionRepository.findOne
        .mockResolvedValueOnce({ ...mockTransaction })
        .mockResolvedValueOnce({
          ...mockTransaction,
          status: TransactionStatus.APPROVED,
          product: {},
          customer: {},
          delivery: {},
        });
      mockTransactionRepository.save.mockResolvedValue({});
      mockProductsService.decrementStock.mockResolvedValue(ok({}));
      const inputDto: UpdateTransactionDto = {
        status: TransactionStatus.APPROVED,
        wompiTransactionId: 'wompi-123',
      };
      const actualResult = await service.updateStatus('tx-uuid-1', inputDto);
      expect(actualResult.isSuccess).toBe(true);
      expect(mockProductsService.decrementStock).toHaveBeenCalledWith(
        'prod-uuid-1',
      );
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException when transaction not found', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(null);
      await expect(service.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return transaction when found and not pending', async () => {
      const tx = {
        ...mockTransaction,
        status: TransactionStatus.APPROVED,
        product: {
          id: 'p1',
          name: 'P',
          description: '',
          imageUrl: '',
          priceInCents: 100,
          stock: 5,
          isActive: true,
          createdAt: new Date(),
        },
        customer: {
          id: 'c1',
          fullName: 'C',
          email: 'c@c.com',
          phoneNumber: '123',
          documentNumber: '456',
          createdAt: new Date(),
        },
        delivery: {
          id: 'd1',
          addressLine: 'A',
          city: 'B',
          department: 'D',
          postalCode: '111',
          recipientName: 'R',
          status: 'PENDING',
          transactionId: 'tx-uuid-1',
          createdAt: new Date(),
        },
      };
      mockTransactionRepository.findOne.mockResolvedValue(tx);
      const result = await service.findById('tx-uuid-1');
      expect(result.id).toBe('tx-uuid-1');
    });

    it('should sync from Wompi when transaction is PENDING with wompiTransactionId', async () => {
      const tx = {
        ...mockTransaction,
        status: TransactionStatus.PENDING,
        wompiTransactionId: 'wompi-123',
        product: {
          id: 'p1',
          name: 'P',
          description: '',
          imageUrl: '',
          priceInCents: 100,
          stock: 5,
          isActive: true,
          createdAt: new Date(),
        },
        customer: {
          id: 'c1',
          fullName: 'C',
          email: 'c@c.com',
          phoneNumber: '123',
          documentNumber: '456',
          createdAt: new Date(),
        },
        delivery: {
          id: 'd1',
          addressLine: 'A',
          city: 'B',
          department: 'D',
          postalCode: '111',
          recipientName: 'R',
          status: 'PENDING',
          transactionId: 'tx-uuid-1',
          createdAt: new Date(),
        },
      };
      mockWompiService.fetchTransactionStatus.mockResolvedValue(ok('PENDING'));
      mockTransactionRepository.findOne
        .mockResolvedValueOnce(tx)
        .mockResolvedValueOnce({ ...tx, status: TransactionStatus.PENDING });
      const result = await service.findById('tx-uuid-1');
      expect(result.id).toBe('tx-uuid-1');
      expect(mockWompiService.fetchTransactionStatus).toHaveBeenCalledWith(
        'wompi-123',
      );
    });
  });

  describe('handleWompiWebhook', () => {
    it('should return fail when transaction not found by wompiTransactionId', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(null);
      const result = await service.handleWompiWebhook('wompi-999', 'APPROVED');
      expect(result.isSuccess).toBe(false);
    });

    it('should return ok when transaction is not PENDING', async () => {
      mockTransactionRepository.findOne.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.APPROVED,
        wompiTransactionId: 'wompi-123',
      });
      const result = await service.handleWompiWebhook('wompi-123', 'APPROVED');
      expect(result.isSuccess).toBe(true);
    });

    it('should apply APPROVED status and decrement stock', async () => {
      mockTransactionRepository.findOne.mockResolvedValue({
        ...mockTransaction,
        wompiTransactionId: 'wompi-123',
      });
      mockProductsService.decrementStock.mockResolvedValue(ok({}));
      const result = await service.handleWompiWebhook('wompi-123', 'APPROVED');
      expect(result.isSuccess).toBe(true);
      expect(mockProductsService.decrementStock).toHaveBeenCalledWith(
        'prod-uuid-1',
      );
    });

    it('should apply FAILED status for DECLINED', async () => {
      mockTransactionRepository.findOne.mockResolvedValue({
        ...mockTransaction,
        wompiTransactionId: 'wompi-123',
      });
      const result = await service.handleWompiWebhook('wompi-123', 'DECLINED');
      expect(result.isSuccess).toBe(true);
      expect(mockProductsService.decrementStock).not.toHaveBeenCalled();
    });
  });

  describe('createPending', () => {
    const mockCustomerEntity: CustomerEntity = {
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

    const createDto: CreateTransactionDto = {
      productId: 'prod-uuid-1',
      card: { token: 'tok_test', installments: 1 },
      delivery: {
        addressLine: 'Calle 123',
        city: 'Bogotá',
        department: 'Cundinamarca',
        postalCode: '110111',
      },
      customerIp: '127.0.0.1',
    };

    it('should return fail when product has no stock', async () => {
      mockProductsService.hasStock.mockResolvedValue(ok(false));
      const result = await service.createPending(createDto, mockCustomerEntity);
      expect(result.isSuccess).toBe(false);
      if (!result.isSuccess)
        expect(result.error).toBe('Product is out of stock');
    });

    it('should return fail when hasStock fails', async () => {
      mockProductsService.hasStock.mockResolvedValue(fail('Product not found'));
      const result = await service.createPending(createDto, mockCustomerEntity);
      expect(result.isSuccess).toBe(false);
    });

    it('should return fail when acceptance token fetch fails', async () => {
      mockProductsService.hasStock.mockResolvedValue(ok(true));
      mockProductsService.findById.mockResolvedValue({ priceInCents: 100000 });
      mockWompiService.fetchAcceptanceToken.mockResolvedValue(
        fail('Network error'),
      );
      const result = await service.createPending(createDto, mockCustomerEntity);
      expect(result.isSuccess).toBe(false);
    });

    it('should create pending transaction and call wompi', async () => {
      mockProductsService.hasStock.mockResolvedValue(ok(true));
      mockProductsService.findById.mockResolvedValue({ priceInCents: 100000 });
      mockWompiService.fetchAcceptanceToken.mockResolvedValue(
        ok('accept-token'),
      );
      mockQueryRunner.manager.create.mockReturnValue({ id: 'new-tx' });
      mockQueryRunner.manager.save.mockResolvedValue({ id: 'new-tx' });
      mockWompiService.createTransaction.mockResolvedValue(
        ok({ id: 'wompi-new' }),
      );
      const txWithRelations = {
        id: 'new-tx',
        reference: 'VS-ABC',
        wompiTransactionId: 'wompi-new',
        status: TransactionStatus.PENDING,
        productAmountInCents: 100000,
        baseFeeInCents: 3000000,
        deliveryFeeInCents: 2000000,
        totalAmountInCents: 5100000,
        currency: 'COP',
        cardLastFour: null,
        cardBrand: null,
        failureReason: null,
        product: {
          id: 'p1',
          name: 'P',
          description: '',
          imageUrl: '',
          priceInCents: 100,
          stock: 5,
          isActive: true,
          createdAt: new Date(),
        },
        customer: {
          id: 'c1',
          fullName: 'C',
          email: 'c@c.com',
          phoneNumber: '123',
          documentNumber: '456',
          createdAt: new Date(),
        },
        delivery: {
          id: 'd1',
          addressLine: 'A',
          city: 'B',
          department: 'D',
          postalCode: '111',
          recipientName: 'R',
          status: 'PENDING',
          transactionId: 'new-tx',
          createdAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockTransactionRepository.findOne.mockResolvedValue(txWithRelations);
      const result = await service.createPending(createDto, mockCustomerEntity);
      expect(result.isSuccess).toBe(true);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should handle wompi transaction creation failure', async () => {
      mockProductsService.hasStock.mockResolvedValue(ok(true));
      mockProductsService.findById.mockResolvedValue({ priceInCents: 100000 });
      mockWompiService.fetchAcceptanceToken.mockResolvedValue(
        ok('accept-token'),
      );
      mockQueryRunner.manager.create.mockReturnValue({ id: 'new-tx' });
      mockQueryRunner.manager.save.mockResolvedValue({ id: 'new-tx' });
      mockWompiService.createTransaction.mockResolvedValue(fail('Wompi error'));
      const result = await service.createPending(createDto, mockCustomerEntity);
      expect(result.isSuccess).toBe(false);
    });
  });
});
