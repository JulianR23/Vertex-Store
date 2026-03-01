import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../../../database/entities/customer.entity';
import { JwtPayload } from '../models/types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'fallback_secret',
    });
  }

  async validate(payload: JwtPayload): Promise<CustomerEntity> {
    const customer = await this.customerRepository.findOne({
      where: { id: payload.sub },
    });
    if (!customer) {
      throw new UnauthorizedException('Token inválido');
    }
    return customer;
  }
}