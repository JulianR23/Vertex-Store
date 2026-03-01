import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CardInfoDto {
  @IsString()
  @IsNotEmpty()
  readonly token: string;

  @IsInt()
  @Min(1)
  @Max(36)
  readonly installments: number;
}

export class DeliveryInfoDto {
  @IsString()
  @IsNotEmpty()
  @Length(5, 200)
  readonly addressLine: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  readonly city: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  readonly department: string;

  @IsString()
  @Length(0, 20)
  readonly postalCode: string;
}

export class CreateTransactionDto {
  @IsUUID()
  readonly productId: string;

  @ValidateNested()
  @Type(() => CardInfoDto)
  readonly card: CardInfoDto;

  @ValidateNested()
  @Type(() => DeliveryInfoDto)
  readonly delivery: DeliveryInfoDto;

  @IsString()
  @IsNotEmpty()
  readonly customerIp: string;
}