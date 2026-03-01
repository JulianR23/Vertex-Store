import { of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  it('should wrap response in ApiResponse format', (done) => {
    const mockContext = {} as any;
    const mockHandler = { handle: () => of({ id: 1, name: 'test' }) };

    interceptor.intercept(mockContext, mockHandler).subscribe((result) => {
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 1, name: 'test' });
      expect(result.timestamp).toBeDefined();
      done();
    });
  });
});
