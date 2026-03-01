export type WompiTransactionStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'DECLINED'
  | 'VOIDED'
  | 'ERROR';

export interface WompiCardPaymentMethod {
  readonly type: 'CARD';
  readonly token: string;
  readonly installments: number;
}

export interface WompiCreateTransactionInput {
  readonly acceptanceToken: string;
  readonly amountInCents: number;
  readonly currency: string;
  readonly customerEmail: string;
  readonly reference: string;
  readonly signature: string;
  readonly paymentMethod: WompiCardPaymentMethod;
  readonly customerIp: string;
}

export interface WompiTransactionResponse {
  readonly id: string;
  readonly reference: string;
  readonly status: WompiTransactionStatus;
  readonly statusMessage: string;
  readonly amountInCents: number;
  readonly currency: string;
  readonly paymentMethodType: string;
  readonly createdAt: string;
}

export interface WompiMerchantResponse {
  readonly data: {
    readonly id: number;
    readonly name: string;
    readonly presigned_acceptance: {
      readonly acceptance_token: string;
      readonly permalink: string;
      readonly type: string;
    };
  };
}

export interface WompiWebhookEvent {
  readonly event: string;
  readonly data: {
    readonly transaction: {
      readonly id: string;
      readonly reference: string;
      readonly status: WompiTransactionStatus;
      readonly amountInCents: number;
      readonly paymentMethodType: string;
    };
  };
  readonly environment: string;
  readonly signature: {
    readonly checksum: string;
    readonly properties: string[];
  };
  readonly timestamp: number;
}