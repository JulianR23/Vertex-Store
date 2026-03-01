import { generateTransactionReference } from './reference.util';

describe('Reference Utility', () => {
  describe('generateTransactionReference', () => {
    it('should generate a reference starting with VS-', () => {
      const ref = generateTransactionReference();
      expect(ref).toMatch(/^VS-/);
    });

    it('should generate unique references', () => {
      const ref1 = generateTransactionReference();
      const ref2 = generateTransactionReference();
      expect(ref1).not.toBe(ref2);
    });

    it('should have the correct format VS-{timestamp}-{shortId}', () => {
      const ref = generateTransactionReference();
      const parts = ref.split('-');
      expect(parts.length).toBeGreaterThanOrEqual(3);
      expect(parts[0]).toBe('VS');
    });
  });
});
