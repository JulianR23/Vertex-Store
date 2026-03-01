import { HttpException, HttpStatus } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: any;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockRequest = { url: '/test', method: 'GET' };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };
  });

  it('should handle HttpException', () => {
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);
    filter.catch(exception, mockHost as any);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        path: '/test',
      }),
    );
  });

  it('should handle HttpException with object response', () => {
    const exception = new HttpException(
      { message: ['Invalid field'], statusCode: 400 },
      HttpStatus.BAD_REQUEST,
    );
    filter.catch(exception, mockHost as any);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: ['Invalid field'],
      }),
    );
  });

  it('should handle unknown exceptions as 500', () => {
    const exception = new Error('Something broke');
    filter.catch(exception, mockHost as any);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'An unexpected error occurred',
      }),
    );
  });

  it('should handle non-Error exceptions', () => {
    filter.catch('string error', mockHost as any);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'An unexpected error occurred',
      }),
    );
  });
});
