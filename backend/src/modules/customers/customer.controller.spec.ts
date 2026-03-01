import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CustomersController } from './customer.controller';
import { CustomersService } from './customers.service';
import { ok, fail } from '../../shared/utils/result.utils';

const mockCustomerResponse = {
  id: 'cust-uuid-1',
  fullName: 'Juan Pérez',
  email: 'juan@test.com',
  phoneNumber: '+573001234567',
  documentNumber: '1234567890',
  createdAt: new Date(),
};

const mockCustomersService = {
  create: jest.fn(),
  findById: jest.fn(),
};

describe('CustomersController', () => {
  let controller: CustomersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        { provide: CustomersService, useValue: mockCustomersService },
      ],
    }).compile();
    controller = module.get<CustomersController>(CustomersController);
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
    const createDto = {
      fullName: 'Juan Pérez',
      email: 'juan@test.com',
      phoneNumber: '+573001234567',
      documentNumber: '1234567890',
    };

    it('should create a customer successfully', async () => {
      mockCustomersService.create.mockResolvedValue(ok(mockCustomerResponse));
      const result = await controller.create(createDto);
      expect(result.id).toBe('cust-uuid-1');
    });

    it('should throw ConflictException when email exists', async () => {
      mockCustomersService.create.mockResolvedValue(
        fail('A customer with email juan@test.com already exists'),
      );
      await expect(controller.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    it('should return customer by id', async () => {
      mockCustomersService.findById.mockResolvedValue(mockCustomerResponse);
      const result = await controller.findOne('cust-uuid-1');
      expect(result.id).toBe('cust-uuid-1');
    });

    it('should throw NotFoundException when customer not found', async () => {
      mockCustomersService.findById.mockResolvedValue(null);
      await expect(controller.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
