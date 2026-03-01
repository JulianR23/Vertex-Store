import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { WompiService } from './wompi.service';

// Mock global fetch
const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

const mockConfigService = {
  get: jest.fn((key: string, defaultValue?: string) => {
    const config: Record<string, string> = {
      WOMPI_API_URL: 'https://api-sandbox.co.uat.wompi.dev/v1',
      WOMPI_PUBLIC_KEY: 'pub_test_key',
      WOMPI_PRIVATE_KEY: 'prv_test_key',
      WOMPI_INTEGRITY_KEY: 'integrity_test_key',
    };
    return config[key] ?? defaultValue ?? '';
  }),
};

describe('WompiService', () => {
  let service: WompiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WompiService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();
    service = module.get<WompiService>(WompiService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchAcceptanceToken', () => {
    it('should return acceptance token on success', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            presigned_acceptance: { acceptance_token: 'test-token' },
          },
        }),
      });
      const result = await service.fetchAcceptanceToken();
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) expect(result.value).toBe('test-token');
    });

    it('should return fail when response is not ok', async () => {
      mockFetch.mockResolvedValue({ ok: false });
      const result = await service.fetchAcceptanceToken();
      expect(result.isSuccess).toBe(false);
    });

    it('should return fail on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      const result = await service.fetchAcceptanceToken();
      expect(result.isSuccess).toBe(false);
    });
  });

  describe('createTransaction', () => {
    const input = {
      acceptanceToken: 'tok',
      amountInCents: 100000,
      currency: 'COP',
      customerEmail: 'test@test.com',
      reference: 'VS-REF',
      signature: 'sig',
      paymentMethod: {
        type: 'CARD' as const,
        token: 'card_tok',
        installments: 1,
      },
      customerIp: '127.0.0.1',
    };

    it('should create transaction successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            id: 'wompi-tx-1',
            reference: 'VS-REF',
            status: 'PENDING',
            status_message: 'pending',
            amount_in_cents: 100000,
            currency: 'COP',
            payment_method_type: 'CARD',
            created_at: '2025-01-01T00:00:00Z',
          },
        }),
      });
      const result = await service.createTransaction(input);
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) expect(result.value.id).toBe('wompi-tx-1');
    });

    it('should return fail when response is not ok', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: { messages: ['Invalid card'] } }),
      });
      const result = await service.createTransaction(input);
      expect(result.isSuccess).toBe(false);
    });

    it('should return fail when response error has no messages', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ data: null }),
      });
      const result = await service.createTransaction(input);
      expect(result.isSuccess).toBe(false);
    });

    it('should return fail on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      const result = await service.createTransaction(input);
      expect(result.isSuccess).toBe(false);
    });
  });

  describe('fetchTransactionStatus', () => {
    it('should return transaction status on success', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: { status: 'APPROVED' } }),
      });
      const result = await service.fetchTransactionStatus('wompi-tx-1');
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) expect(result.value).toBe('APPROVED');
    });

    it('should return fail when response is not ok', async () => {
      mockFetch.mockResolvedValue({ ok: false });
      const result = await service.fetchTransactionStatus('wompi-tx-1');
      expect(result.isSuccess).toBe(false);
    });

    it('should return fail on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      const result = await service.fetchTransactionStatus('wompi-tx-1');
      expect(result.isSuccess).toBe(false);
    });
  });

  describe('generateSignature', () => {
    it('should generate a SHA-256 hex signature', () => {
      const result = service.generateSignature('VS-REF', 100000, 'COP');
      const expected = crypto
        .createHash('sha256')
        .update('VS-REF100000COPintegrity_test_key')
        .digest('hex');
      expect(result).toBe(expected);
    });
  });

  describe('validateWebhookSignature', () => {
    it('should return true for valid signature', () => {
      const properties = ['transaction.id', 'transaction.status'];
      const eventData = { transaction: { id: 'tx-1', status: 'APPROVED' } };
      const timestamp = 1234567890;
      const concatenated =
        'tx-1' + 'APPROVED' + timestamp + 'integrity_test_key';
      const checksum = crypto
        .createHash('sha256')
        .update(concatenated)
        .digest('hex');
      const result = service.validateWebhookSignature(
        properties,
        eventData as any,
        timestamp,
        checksum,
      );
      expect(result).toBe(true);
    });

    it('should return false for invalid signature', () => {
      const result = service.validateWebhookSignature(
        ['transaction.id'],
        { transaction: { id: 'tx-1' } } as any,
        123,
        'invalid-checksum',
      );
      expect(result).toBe(false);
    });
  });
});
