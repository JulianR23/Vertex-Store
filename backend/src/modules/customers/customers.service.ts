import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../../database/entities/customer.entity';
import { CreateCustomerDto } from './models/dto/create-customer.dto';
import { CustomerResponse } from './models/types/customer-response.type';
import { Result, ok, fail } from '..//../shared/utils/result.utils';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
  ) {}

  /**
   * Creates a new customer. Fails if a customer with the same email already exists.
   */
  async create(dto: CreateCustomerDto): Promise<Result<CustomerResponse, string>> {
    const existing = await this.customerRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      return fail(`A customer with email ${dto.email} already exists`);
    }
    const customer = this.customerRepository.create(dto);
    const saved = await this.customerRepository.save(customer);
    return ok(this.toResponse(saved));
  }

  /**
   * Retrieves a customer by ID.
   */
  async findById(id: string): Promise<CustomerResponse | null> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) return null;
    return this.toResponse(customer);
  }

  private readonly toResponse = (customer: CustomerEntity): CustomerResponse => ({
    id: customer.id,
    fullName: customer.fullName,
    email: customer.email,
    phoneNumber: customer.phoneNumber,
    documentNumber: customer.documentNumber,
    createdAt: customer.createdAt,
  });
}