import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ok, fail } from '../../shared/utils/result.utils';

const mockAuthResponse = {
  accessToken: 'mock.jwt.token',
  customer: {
    id: 'cust-uuid-1',
    fullName: 'Juan Pérez',
    email: 'juan@test.com',
    phoneNumber: '+573001234567',
    documentNumber: '1234567890',
  },
};

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();
    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      fullName: 'Juan Pérez',
      email: 'juan@test.com',
      phoneNumber: '+573001234567',
      documentNumber: '1234567890',
      password: 'password123',
    };

    it('should register successfully', async () => {
      mockAuthService.register.mockResolvedValue(ok(mockAuthResponse));
      const result = await controller.register(registerDto);
      expect(result.accessToken).toBe('mock.jwt.token');
      expect(result.customer.email).toBe('juan@test.com');
    });

    it('should throw ConflictException when email exists', async () => {
      mockAuthService.register.mockResolvedValue(
        fail('El email ya está registrado'),
      );
      await expect(controller.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const loginDto = { email: 'juan@test.com', password: 'password123' };

    it('should login successfully', async () => {
      mockAuthService.login.mockResolvedValue(ok(mockAuthResponse));
      const result = await controller.login(loginDto);
      expect(result.accessToken).toBe('mock.jwt.token');
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      mockAuthService.login.mockResolvedValue(fail('Credenciales inválidas'));
      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
