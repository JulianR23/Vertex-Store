import { baseApi } from './base.api';

interface CardInput {
  readonly token: string;
  readonly installments: number;
}

interface DeliveryInput {
  readonly addressLine: string;
  readonly city: string;
  readonly department: string;
  readonly postalCode: string;
}

interface CreateTransactionRequest {
  readonly productId: string;
  readonly card: CardInput;
  readonly delivery: DeliveryInput;
  readonly customerIp: string;
}

export interface TransactionResponse {
  readonly id: string;
  readonly reference: string;
  readonly wompiTransactionId: string | null;
  readonly status: string;
  readonly productAmountInCents: number;
  readonly baseFeeInCents: number;
  readonly deliveryFeeInCents: number;
  readonly totalAmountInCents: number;
  readonly currency: string;
  readonly cardLastFour: string | null;
  readonly cardBrand: string | null;
  readonly failureReason: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface ApiResponse<T> {
  readonly success: boolean;
  readonly data: T;
}

export const transactionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createTransaction: builder.mutation<
      ApiResponse<TransactionResponse>,
      CreateTransactionRequest
    >({
      query: (body) => ({
        url: '/transactions',
        method: 'POST',
        body,
      }),
    }),
    getTransaction: builder.query<ApiResponse<TransactionResponse>, string>({
      query: (id) => `/transactions/${id}`,
    }),
  }),
});

export const { useCreateTransactionMutation, useGetTransactionQuery } = transactionsApi;