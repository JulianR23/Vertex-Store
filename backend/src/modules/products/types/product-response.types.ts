export interface ProductResponse {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly priceInCents: number;
  readonly stock: number;
  readonly isActive: boolean;
  readonly createdAt: Date;
}