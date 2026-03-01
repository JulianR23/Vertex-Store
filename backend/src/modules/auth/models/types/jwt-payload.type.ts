export interface JwtPayload {
  readonly sub: string;
  readonly email: string;
  readonly fullName: string;
}