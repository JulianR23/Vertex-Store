export interface AuthResponse {
  readonly accessToken: string;
  readonly customer: {
    readonly id: string;
    readonly fullName: string;
    readonly email: string;
    readonly phoneNumber: string;
    readonly documentNumber: string;
  };
}