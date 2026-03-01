import { baseApi } from "./base.api";

export interface ProductResponse {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly priceInCents: number;
  readonly stock: number;
  readonly isActive: boolean;
  readonly createdAt: string;
}

interface ApiResponse<T> {
  readonly success: boolean;
  readonly data: T;
}

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ApiResponse<ProductResponse[]>, void>({
      query: () => "/products",
    }),
    getProductById: builder.query<ApiResponse<ProductResponse>, string>({
      query: (id) => `/products/${id}`,
    }),
  }),
});

export const { useGetProductsQuery, useGetProductByIdQuery } = productsApi;
