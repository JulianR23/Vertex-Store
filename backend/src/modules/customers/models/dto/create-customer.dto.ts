import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';


export class CreateCustomerDto {
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