import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductEntity } from '../../database/entities/product.entity';

const mockProduct: ProductEntity = {
  id: 'uuid-1',
  name: 'AirPods Pro',
  description: 'Test description',
  imageUrl: 'https://example.com/image.jpg',
  priceInCents: 130000000,
  stock: 10,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  transactions: [],
};

const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();
    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  describe('findAllActive', () => {
    it('should return array of active products', async () => {
      mockRepository.find.mockResolvedValue([mockProduct]);
      const actualResult = await service.findAllActive();
      expect(actualResult).toHaveLength(1);
      expect(actualResult[0].id).toBe('uuid-1');
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { createdAt: 'ASC' },
      });
    });
  });

  describe('findById', () => {
    it('should return a product when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockProduct);
      const actualResult = await service.findById('uuid-1');
      expect(actualResult.id).toBe('uuid-1');
      expect(actualResult.name).toBe('AirPods Pro');
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('decrementStock', () => {
    it('should decrement stock and return updated product', async () => {
      const inputProduct = { ...mockProduct, stock: 5 };
      const expectedProduct = { ...mockProduct, stock: 4 };
      mockRepository.findOne.mockResolvedValue(inputProduct);
      mockRepository.save.mockResolvedValue(expectedProduct);
      const actualResult = await service.decrementStock('uuid-1');
      expect(actualResult.isSuccess).toBe(true);
      if (actualResult.isSuccess) expect(actualResult.value.stock).toBe(4);
    });

    it('should return fail when product not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const actualResult = await service.decrementStock('non-existent');
      expect(actualResult.isSuccess).toBe(false);
    });

    it('should return fail when product is out of stock', async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockProduct, stock: 0 });
      const actualResult = await service.decrementStock('uuid-1');
      expect(actualResult.isSuccess).toBe(false);
      if (!actualResult.isSuccess) expect(actualResult.error).toContain('out of stock');
    });
  });

  describe('hasStock', () => {
    it('should return ok(true) when stock is available', async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockProduct, stock: 3 });
      const actualResult = await service.hasStock('uuid-1');
      expect(actualResult.isSuccess).toBe(true);
      if (actualResult.isSuccess) expect(actualResult.value).toBe(true);
    });

    it('should return ok(false) when stock is zero', async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockProduct, stock: 0 });
      const actualResult = await service.hasStock('uuid-1');
      expect(actualResult.isSuccess).toBe(true);
      if (actualResult.isSuccess) expect(actualResult.value).toBe(false);
    });
  });
});