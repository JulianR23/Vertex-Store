import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CustomerEntity } from '../../database/entities/customer.entity';
import { RegisterDto } from './models/dto/register.dto';
import { LoginDto } from './models/dto/login.dto';
import { AuthResponse } from './models/types/auth-response.type';
import { JwtPayload } from './models/types/jwt-payload.type';
import { Result, ok, fail } from '../../shared/utils/result.utils';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registers a new customer. Fails if email is already taken.
   */
  async register(dto: RegisterDto): Promise<Result<AuthResponse, string>> {
    const existing = await this.customerRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      return fail('El email ya está registrado');
    }
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const customer = this.customerRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      documentNumber: dto.documentNumber,
      passwordHash,
    });
    const saved = await this.customerRepository.save(customer);
    return ok(this.buildAuthResponse(saved));
  }

  /**
   * Validates credentials and returns a JWT token.
   */
  async login(dto: LoginDto): Promise<Result<AuthResponse, string>> {
    const customer = await this.customerRepository.findOne({
      where: { email: dto.email },
      select: ['id', 'fullName', 'email', 'phoneNumber', 'documentNumber', 'passwordHash'],
    });
    if (!customer) {
      return fail('Credenciales inválidas');
    }
    const isPasswordValid = await bcrypt.compare(dto.password, customer.passwordHash);
    if (!isPasswordValid) {
      return fail('Credenciales inválidas');
    }
    return ok(this.buildAuthResponse(customer));
  }

  private buildAuthResponse(customer: CustomerEntity): AuthResponse {
    const payload: JwtPayload = {
      sub: customer.id,
      email: customer.email,
      fullName: customer.fullName,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        documentNumber: customer.documentNumber,
      },
    };
  }
}