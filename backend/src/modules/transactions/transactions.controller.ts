import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './models/dto/create-transaction.dto';
import { UpdateTransactionDto } from './models/dto/update-transaction.dto';
import { TransactionResponse } from './models/types/transaction-response.type';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('health')
  checkHealth(): { status: string } {
    return { status: 'ok' };
  }

  @Post()
  async create(@Body() dto: CreateTransactionDto): Promise<TransactionResponse> {
    const result = await this.transactionsService.createPending(dto);
    if (!result.isSuccess) throw new BadRequestException(result.error);
    return result.value;
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransactionDto,
  ): Promise<TransactionResponse> {
    const result = await this.transactionsService.updateStatus(id, dto);
    if (!result.isSuccess) throw new BadRequestException(result.error);
    return result.value;
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<TransactionResponse> {
    return this.transactionsService.findById(id);
  }
}