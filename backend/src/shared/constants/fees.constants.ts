export const FEE_CONSTANTS = {
  BASE_FEE_IN_CENTS: parseInt(process.env.BASE_FEE_AMOUNT ?? '300000', 10),
  DELIVERY_FEE_IN_CENTS: parseInt(process.env.DELIVERY_FEE_AMOUNT ?? '200000', 10),
} as const;

export const CURRENCY = 'COP' as const;

export const TRANSACTION_REFERENCE_PREFIX = 'VS' as const;