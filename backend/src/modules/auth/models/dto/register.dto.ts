import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class RegisterDto {
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

  @IsString()
  @MinLength(8)
  readonly password: string;
}