import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeliveriesController } from './deliveries.controller';
import { DeliveriesService } from './deliveries.service';
import { DeliveryStatus } from '../../database/entities/delivery.entity';

const mockDeliveryResponse = {
  id: 'del-uuid-1',
  addressLine: 'Calle 123',
  city: 'Bogotá',
  department: 'Cundinamarca',
  postalCode: '110111',
  recipientName: 'Juan Pérez',
  status: DeliveryStatus.PENDING,
  transactionId: 'tx-uuid-1',
  createdAt: new Date(),
};

const mockDeliveriesService = {
  findByTransactionId: jest.fn(),
  findById: jest.fn(),
};

describe('DeliveriesController', () => {
  let controller: DeliveriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveriesController],
      providers: [
        { provide: DeliveriesService, useValue: mockDeliveriesService },
      ],
    }).compile();
    controller = module.get<DeliveriesController>(DeliveriesController);
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

  describe('findByTransaction', () => {
    it('should return delivery for a transaction', async () => {
      mockDeliveriesService.findByTransactionId.mockResolvedValue(
        mockDeliveryResponse,
      );
      const result = await controller.findByTransaction('tx-uuid-1');
      expect(result.id).toBe('del-uuid-1');
      expect(mockDeliveriesService.findByTransactionId).toHaveBeenCalledWith(
        'tx-uuid-1',
      );
    });

    it('should propagate NotFoundException', async () => {
      mockDeliveriesService.findByTransactionId.mockRejectedValue(
        new NotFoundException('Delivery not found'),
      );
      await expect(
        controller.findByTransaction('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return delivery by id', async () => {
      mockDeliveriesService.findById.mockResolvedValue(mockDeliveryResponse);
      const result = await controller.findOne('del-uuid-1');
      expect(result.id).toBe('del-uuid-1');
    });

    it('should propagate NotFoundException', async () => {
      mockDeliveriesService.findById.mockRejectedValue(
        new NotFoundException('Delivery not found'),
      );
      await expect(controller.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
