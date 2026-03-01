import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { TransactionsService } from '../transactions.service';
import { WompiService } from '../../wompi/wompi.service';
import { ok, fail } from '../../../shared/utils/result.utils';

const mockTransactionsService = {
  handleWompiWebhook: jest.fn(),
};

const mockWompiService = {
  validateWebhookSignature: jest.fn(),
};

describe('WebhookController', () => {
  let controller: WebhookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        { provide: TransactionsService, useValue: mockTransactionsService },
        { provide: WompiService, useValue: mockWompiService },
      ],
    }).compile();
    controller = module.get<WebhookController>(WebhookController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleWompiEvent', () => {
    const validDto = {
      event: 'transaction.updated',
      data: {
        transaction: {
          id: 'wompi-tx-1',
          reference: 'VS-REF',
          status: 'APPROVED',
          amount_in_cents: 100000,
        },
      },
      environment: 'test',
      signature: {
        checksum: 'valid-checksum',
        properties: ['transaction.id', 'transaction.status'],
      },
      timestamp: 1234567890,
    };

    it('should throw BadRequestException for invalid signature', async () => {
      mockWompiService.validateWebhookSignature.mockReturnValue(false);
      await expect(controller.handleWompiEvent(validDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return received:true for non-transaction.updated events', async () => {
      mockWompiService.validateWebhookSignature.mockReturnValue(true);
      const dto = { ...validDto, event: 'nequi_token.updated' };
      const result = await controller.handleWompiEvent(dto);
      expect(result).toEqual({ received: true });
    });

    it('should process transaction.updated event successfully', async () => {
      mockWompiService.validateWebhookSignature.mockReturnValue(true);
      mockTransactionsService.handleWompiWebhook.mockResolvedValue(
        ok(undefined),
      );
      const result = await controller.handleWompiEvent(validDto);
      expect(result).toEqual({ received: true });
      expect(mockTransactionsService.handleWompiWebhook).toHaveBeenCalledWith(
        'wompi-tx-1',
        'APPROVED',
      );
    });

    it('should still return received:true when webhook handling fails', async () => {
      mockWompiService.validateWebhookSignature.mockReturnValue(true);
      mockTransactionsService.handleWompiWebhook.mockResolvedValue(
        fail('Not found'),
      );
      const result = await controller.handleWompiEvent(validDto);
      expect(result).toEqual({ received: true });
    });
  });
});
