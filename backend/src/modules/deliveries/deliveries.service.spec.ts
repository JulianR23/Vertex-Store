import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import {
  DeliveryEntity,
  DeliveryStatus,
} from '../../database/entities/delivery.entity';

const mockDelivery: DeliveryEntity = {
  id: 'del-uuid-1',
  addressLine: 'Calle 123',
  city: 'Bogotá',
  department: 'Cundinamarca',
  postalCode: '110111',
  recipientName: 'Juan Pérez',
  status: DeliveryStatus.PENDING,
  transactionId: 'tx-uuid-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  transaction: {} as any,
};

const mockRepository = {
  findOne: jest.fn(),
};

describe('DeliveriesService', () => {
  let service: DeliveriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveriesService,
        {
          provide: getRepositoryToken(DeliveryEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();
    service = module.get<DeliveriesService>(DeliveriesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByTransactionId', () => {
    it('should return a delivery when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockDelivery);
      const result = await service.findByTransactionId('tx-uuid-1');
      expect(result.id).toBe('del-uuid-1');
      expect(result.city).toBe('Bogotá');
      expect(result.transactionId).toBe('tx-uuid-1');
    });

    it('should throw NotFoundException when delivery not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findByTransactionId('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findById', () => {
    it('should return a delivery when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockDelivery);
      const result = await service.findById('del-uuid-1');
      expect(result.id).toBe('del-uuid-1');
      expect(result.addressLine).toBe('Calle 123');
    });

    it('should throw NotFoundException when delivery not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
