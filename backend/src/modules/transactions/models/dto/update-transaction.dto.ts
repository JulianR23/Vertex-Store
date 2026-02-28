import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TransactionStatus } from '../../../../database/entities/transaction.entity';

export class UpdateTransactionDto {
  @IsEnum(TransactionStatus)
  readonly status: TransactionStatus;

  @IsString()
  @IsOptional()
  readonly wompiTransactionId?: string;

  @IsString()
  @IsOptional()
  readonly failureReason?: string;
}