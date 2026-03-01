import { detectCardBrand, extractLastFour } from './card.util';

describe('Card Utility', () => {
  describe('detectCardBrand', () => {
    it('should detect VISA card', () => {
      expect(detectCardBrand('4111111111111111')).toBe('VISA');
      expect(detectCardBrand('4000000000000002')).toBe('VISA');
    });

    it('should detect MASTERCARD (5x series)', () => {
      expect(detectCardBrand('5500000000000004')).toBe('MASTERCARD');
      expect(detectCardBrand('5105105105105100')).toBe('MASTERCARD');
    });

    it('should detect MASTERCARD (2x series)', () => {
      expect(detectCardBrand('2221000000000009')).toBe('MASTERCARD');
      expect(detectCardBrand('2720000000000005')).toBe('MASTERCARD');
    });

    it('should return UNKNOWN for unrecognized card', () => {
      expect(detectCardBrand('9999999999999999')).toBe('UNKNOWN');
    });
  });

  describe('extractLastFour', () => {
    it('should extract last 4 digits of a card number', () => {
      expect(extractLastFour('4111111111111111')).toBe('1111');
      expect(extractLastFour('5500000000000004')).toBe('0004');
    });

    it('should handle card numbers with spaces', () => {
      expect(extractLastFour('4111 1111 1111 1111')).toBe('1111');
    });
  });
});