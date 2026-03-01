import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { CustomerEntity } from '../../database/entities/customer.entity';
import { RegisterDto } from './models/dto/register.dto';
import { LoginDto } from './models/dto/login.dto';

const mockCustomer: CustomerEntity = {
  id: 'cust-uuid-1',
  fullName: 'Juan Pérez',
  email: 'juan@test.com',
  phoneNumber: '+573001234567',
  documentNumber: '1234567890',
  passwordHash: '$2b$10$hashedpassword',
  createdAt: new Date(),
  updatedAt: new Date(),
  transactions: [],
};

const mockRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(() => 'mock.jwt.token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(CustomerEntity), useValue: mockRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    const inputDto: RegisterDto = {
      fullName: 'Juan Pérez',
      email: 'juan@test.com',
      phoneNumber: '+573001234567',
      documentNumber: '1234567890',
      password: 'password123',
    };

    it('should register a new customer successfully', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockCustomer);
      mockRepository.save.mockResolvedValue(mockCustomer);
      const actualResult = await service.register(inputDto);
      expect(actualResult.isSuccess).toBe(true);
      if (actualResult.isSuccess) {
        expect(actualResult.value.accessToken).toBe('mock.jwt.token');
        expect(actualResult.value.customer.email).toBe('juan@test.com');
      }
    });

    it('should return fail when email is already registered', async () => {
      mockRepository.findOne.mockResolvedValue(mockCustomer);
      const actualResult = await service.register(inputDto);
      expect(actualResult.isSuccess).toBe(false);
      if (!actualResult.isSuccess) {
        expect(actualResult.error).toContain('email ya está registrado');
      }
    });
  });

  describe('login', () => {
    const inputDto: LoginDto = {
      email: 'juan@test.com',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      mockRepository.findOne.mockResolvedValue(mockCustomer);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      const actualResult = await service.login(inputDto);
      expect(actualResult.isSuccess).toBe(true);
      if (actualResult.isSuccess) {
        expect(actualResult.value.accessToken).toBe('mock.jwt.token');
      }
    });

    it('should return fail when customer does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const actualResult = await service.login(inputDto);
      expect(actualResult.isSuccess).toBe(false);
      if (!actualResult.isSuccess) {
        expect(actualResult.error).toBe('Credenciales inválidas');
      }
    });

    it('should return fail when password is incorrect', async () => {
      mockRepository.findOne.mockResolvedValue(mockCustomer);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
      const actualResult = await service.login(inputDto);
      expect(actualResult.isSuccess).toBe(false);
      if (!actualResult.isSuccess) {
        expect(actualResult.error).toBe('Credenciales inválidas');
      }
    });
  });
});