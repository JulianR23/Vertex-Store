import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  ParseUUIDPipe,
  BadRequestException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TransactionsService } from '../transactions.service';
import { CreateTransactionDto } from '../models/dto/create-transaction.dto';
import { UpdateTransactionDto } from '../models/dto/update-transaction.dto';
import { TransactionResponse } from '../models/types/transaction-response.type';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { CustomerEntity } from '../../../database/entities/customer.entity';

interface RequestWithCustomer extends Request {
  user: CustomerEntity;
}

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('health')
  checkHealth(): { status: string } {
    return { status: 'ok' };
  }

  @Post()
  @UseGuards(JwtGuard)
  async create(
    @Body() dto: CreateTransactionDto,
    @Request() req: RequestWithCustomer,
  ): Promise<TransactionResponse> {
    const result = await this.transactionsService.createPending(dto, req.user);
    if (!result.isSuccess) throw new BadRequestException(result.error);
    return result.value;
  }

  @Patch(':id/status')
  @UseGuards(JwtGuard)
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransactionDto,
  ): Promise<TransactionResponse> {
    const result = await this.transactionsService.updateStatus(id, dto);
    if (!result.isSuccess) throw new BadRequestException(result.error);
    return result.value;
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<TransactionResponse> {
    return this.transactionsService.findById(id);
  }
}