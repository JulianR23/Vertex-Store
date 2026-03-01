import { ok, fail, mapResult, chainResult } from './result.utils';

describe('Result Utility', () => {
  describe('ok', () => {
    it('should create a successful result with a value', () => {
      const result = ok(42);
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) expect(result.value).toBe(42);
    });
  });

  describe('fail', () => {
    it('should create a failed result with an error', () => {
      const result = fail('something went wrong');
      expect(result.isSuccess).toBe(false);
      if (!result.isSuccess) expect(result.error).toBe('something went wrong');
    });
  });

  describe('mapResult', () => {
    it('should transform the value when result is successful', () => {
      const inputResult = ok(5);
      const actualResult = mapResult(inputResult, (v) => v * 2);
      expect(actualResult.isSuccess).toBe(true);
      if (actualResult.isSuccess) expect(actualResult.value).toBe(10);
    });

    it('should pass through the error when result is failed', () => {
      const inputResult = fail('error');
      const actualResult = mapResult(inputResult, (v: number) => v * 2);
      expect(actualResult.isSuccess).toBe(false);
    });
  });

  describe('chainResult', () => {
    it('should chain a successful result into another result', () => {
      const inputResult = ok(5);
      const actualResult = chainResult(inputResult, (v) => ok(v + 1));
      expect(actualResult.isSuccess).toBe(true);
      if (actualResult.isSuccess) expect(actualResult.value).toBe(6);
    });

    it('should not execute the transform when result is failed', () => {
      const inputResult = fail('error');
      const mockTransform = jest.fn(() => ok(99));
      chainResult(inputResult, mockTransform);
      expect(mockTransform).not.toHaveBeenCalled();
    });
  });
});