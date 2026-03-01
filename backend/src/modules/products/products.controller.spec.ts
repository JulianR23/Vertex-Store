import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

const mockProductResponse = {
  id: 'prod-uuid-1',
  name: 'AirPods Pro',
  description: 'Test',
  imageUrl: 'https://example.com/img.jpg',
  priceInCents: 130000000,
  stock: 10,
  isActive: true,
  createdAt: new Date(),
};

const mockProductsService = {
  findAllActive: jest.fn(),
  findById: jest.fn(),
};

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockProductsService }],
    }).compile();
    controller = module.get<ProductsController>(ProductsController);
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

  describe('findAll', () => {
    it('should return all active products', async () => {
      mockProductsService.findAllActive.mockResolvedValue([
        mockProductResponse,
      ]);
      const result = await controller.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('AirPods Pro');
    });
  });

  describe('findOne', () => {
    it('should return product by id', async () => {
      mockProductsService.findById.mockResolvedValue(mockProductResponse);
      const result = await controller.findOne('prod-uuid-1');
      expect(result.id).toBe('prod-uuid-1');
    });

    it('should propagate NotFoundException', async () => {
      mockProductsService.findById.mockRejectedValue(
        new NotFoundException('Product not found'),
      );
      await expect(controller.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
