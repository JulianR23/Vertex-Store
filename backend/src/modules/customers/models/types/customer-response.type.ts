export interface CustomerResponse {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly phoneNumber: string;
  readonly documentNumber: string;
  readonly createdAt: Date;
}