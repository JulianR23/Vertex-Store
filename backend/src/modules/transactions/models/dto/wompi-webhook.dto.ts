import { IsNotEmpty, IsNumber, IsObject, IsString } from 'class-validator';

export class WompiWebhookDto {
  @IsString()
  @IsNotEmpty()
  readonly event: string;

  @IsObject()
  readonly data: {
    readonly transaction: {
      readonly id: string;
      readonly reference: string;
      readonly status: string;
      readonly amount_in_cents: number;
    };
  };

  @IsString()
  @IsNotEmpty()
  readonly environment: string;

  @IsObject()
  readonly signature: {
    readonly checksum: string;
    readonly properties: string[];
  };

  @IsNumber()
  readonly timestamp: number;
}