export type CardBrand = 'VISA' | 'MASTERCARD' | 'UNKNOWN';

const CARD_PATTERNS: Record<Exclude<CardBrand, 'UNKNOWN'>, RegExp> = {
  VISA: /^4/,
  MASTERCARD: /^5[1-5]|^2[2-7]/,
};

/**
 * Detects the card brand from the first digits of the card number.
 */
export const detectCardBrand = (cardNumber: string): CardBrand => {
  const sanitized = cardNumber.replace(/\s/g, '');
  for (const [brand, pattern] of Object.entries(CARD_PATTERNS)) {
    if (pattern.test(sanitized)) return brand as CardBrand;
  }
  return 'UNKNOWN';
};

/**
 * Extracts the last 4 digits of a card number.
 */
export const extractLastFour = (cardNumber: string): string => {
  const sanitized = cardNumber.replace(/\s/g, '');
  return sanitized.slice(-4);
};