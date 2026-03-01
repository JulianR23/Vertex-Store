import { baseApi } from "./base.api";

interface CustomerResponse {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly phoneNumber: string;
  readonly documentNumber: string;
}

interface AuthResponse {
  readonly accessToken: string;
  readonly customer: CustomerResponse;
}

interface ApiResponse<T> {
  readonly success: boolean;
  readonly data: T;
}

interface RegisterRequest {
  readonly fullName: string;
  readonly email: string;
  readonly phoneNumber: string;
  readonly documentNumber: string;
  readonly password: string;
}

interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<ApiResponse<AuthResponse>, RegisterRequest>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),
    login: builder.mutation<ApiResponse<AuthResponse>, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation } = authApi;
