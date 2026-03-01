import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CustomersService } from './customers.service';
import { CustomerEntity } from '../../database/entities/customer.entity';
import { CreateCustomerDto } from './models/dto/create-customer.dto';

const mockCustomer: CustomerEntity = {
  id: 'cust-uuid-1',
  fullName: 'Juan Pérez',
  email: 'juan@test.com',
  phoneNumber: '+573001234567',
  documentNumber: '1234567890',
  createdAt: new Date(),
  updatedAt: new Date(),
  transactions: [],
};

const mockRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

describe('CustomersService', () => {
  let service: CustomersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getRepositoryToken(CustomerEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();
    service = module.get<CustomersService>(CustomersService);
    jest.clearAllMocks();
  });

  describe('findOrCreate', () => {
    it('should return existing customer when email is found', async () => {
      mockRepository.findOne.mockResolvedValue(mockCustomer);
      const inputDto: CreateCustomerDto = {
        fullName: 'Juan Pérez',
        email: 'juan@test.com',
        phoneNumber: '+573001234567',
        documentNumber: '1234567890',
      };
      const actualResult = await service.create(inputDto);
      expect(actualResult.isSuccess).toBe(true);
      if (actualResult.isSuccess) {
        expect(actualResult.value.id).toBe('cust-uuid-1');
        expect(mockRepository.create).not.toHaveBeenCalled();
      }
    });

    it('should create a new customer when email is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockCustomer);
      mockRepository.save.mockResolvedValue(mockCustomer);
      const inputDto: CreateCustomerDto = {
        fullName: 'Juan Pérez',
        email: 'new@test.com',
        phoneNumber: '+573001234567',
        documentNumber: '1234567890',
      };
      const actualResult = await service.create(inputDto);
      expect(actualResult.isSuccess).toBe(true);
      expect(mockRepository.create).toHaveBeenCalledWith(inputDto);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return customer when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockCustomer);
      const actualResult = await service.findById('cust-uuid-1');
      expect(actualResult).not.toBeNull();
      expect(actualResult?.email).toBe('juan@test.com');
    });

    it('should return null when customer not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const actualResult = await service.findById('non-existent');
      expect(actualResult).toBeNull();
    });
  });
});