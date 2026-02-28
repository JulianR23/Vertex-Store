import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CardInfoDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{13,19}$/, { message: 'cardNumber must be 13-19 digits' })
  readonly cardNumber: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  readonly cardHolder: string;

  
  @IsString()
  @Matches(/^(0[1-9]|1[0-2])$/, { message: 'expiryMonth must be 01-12' })
  readonly expiryMonth: string;

  
  @IsString()
  @Matches(/^\d{4}$/, { message: 'expiryYear must be 4 digits' })
  readonly expiryYear: string;

  
  @IsString()
  @Matches(/^\d{3,4}$/, { message: 'cvv must be 3 or 4 digits' })
  readonly cvv: string;
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

export class CustomerInfoDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  readonly fullName: string;


  @IsEmail()
  readonly email: string;


  @IsString()
  @IsNotEmpty()
  @Length(7, 20)
  readonly phoneNumber: string;

  
  @IsString()
  @IsNotEmpty()
  @Length(5, 20)
  readonly documentNumber: string;
}

export class CreateTransactionDto {
  
  @IsUUID()
  readonly productId: string;

  @ValidateNested()
  @Type(() => CustomerInfoDto)
  readonly customer: CustomerInfoDto;

  
  @ValidateNested()
  @Type(() => CardInfoDto)
  readonly card: CardInfoDto;

  
  @ValidateNested()
  @Type(() => DeliveryInfoDto)
  readonly delivery: DeliveryInfoDto;
}