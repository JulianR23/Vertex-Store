import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from '../transactions.service';
import { TransactionStatus } from '../../../database/entities/transaction.entity';
import { ok, fail } from '../../../shared/utils/result.utils';

const mockTransactionResponse = {
  id: 'tx-uuid-1',
  reference: 'VS-ABC-12345',
  wompiTransactionId: null,
  status: TransactionStatus.PENDING,
  productAmountInCents: 100000,
  baseFeeInCents: 3000000,
  deliveryFeeInCents: 2000000,
  totalAmountInCents: 5100000,
  currency: 'COP',
  cardLastFour: '1111',
  cardBrand: 'VISA',
  failureReason: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTransactionsService = {
  createPending: jest.fn(),
  updateStatus: jest.fn(),
  findById: jest.fn(),
};

describe('TransactionsController', () => {
  let controller: TransactionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        { provide: TransactionsService, useValue: mockTransactionsService },
      ],
    }).compile();
    controller = module.get<TransactionsController>(TransactionsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return ok status', () => {
      expect(controller.checkHealth()).toEqual({ status: 'ok' });
    });
  });

  describe('create', () => {
    it('should create a transaction successfully', async () => {
      mockTransactionsService.createPending.mockResolvedValue(
        ok(mockTransactionResponse),
      );
      const dto = {
        productId: 'p1',
        card: { token: 'tok', installments: 1 },
        delivery: {
          addressLine: 'A',
          city: 'B',
          department: 'D',
          postalCode: '111',
        },
        customerIp: '1.1.1.1',
      };
      const req = { user: { id: 'cust-1' } } as any;
      const result = await controller.create(dto, req);
      expect(result.id).toBe('tx-uuid-1');
    });

    it('should throw BadRequestException on failure', async () => {
      mockTransactionsService.createPending.mockResolvedValue(
        fail('Out of stock'),
      );
      const dto = {
        productId: 'p1',
        card: { token: 'tok', installments: 1 },
        delivery: {
          addressLine: 'A',
          city: 'B',
          department: 'D',
          postalCode: '111',
        },
        customerIp: '1.1.1.1',
      };
      const req = { user: { id: 'cust-1' } } as any;
      await expect(controller.create(dto, req)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update transaction status', async () => {
      mockTransactionsService.updateStatus.mockResolvedValue(
        ok(mockTransactionResponse),
      );
      const result = await controller.updateStatus('tx-uuid-1', {
        status: TransactionStatus.APPROVED,
      });
      expect(result.id).toBe('tx-uuid-1');
    });

    it('should throw BadRequestException on failure', async () => {
      mockTransactionsService.updateStatus.mockResolvedValue(
        fail('Already processed'),
      );
      await expect(
        controller.updateStatus('tx-uuid-1', {
          status: TransactionStatus.APPROVED,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return transaction by id', async () => {
      mockTransactionsService.findById.mockResolvedValue(
        mockTransactionResponse,
      );
      const result = await controller.findOne('tx-uuid-1');
      expect(result.id).toBe('tx-uuid-1');
    });
  });
});
