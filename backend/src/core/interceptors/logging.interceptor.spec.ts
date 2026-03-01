import { of } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
  });

  it('should log and pass through the response', (done) => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', url: '/test' }),
      }),
    } as any;
    const mockHandler = { handle: () => of('response') };

    interceptor.intercept(mockContext, mockHandler).subscribe((result) => {
      expect(result).toBe('response');
      done();
    });
  });
});
