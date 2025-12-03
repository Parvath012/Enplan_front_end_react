import { logDetailedError } from '../../src/utils/errorLogger';

describe('errorLogger', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('logDetailedError', () => {
    it('should log basic error message', () => {
      const error = new Error('Test error');
      
      logDetailedError('Test context', error);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Test context:', error);
    });

    it('should log error with response', () => {
      const error: any = new Error('Test error');
      error.response = {
        status: 404,
        data: { message: 'Not found' }
      };
      
      logDetailedError('API Error', error);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('API Error:', error);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error response:', 404, { message: 'Not found' });
    });

    it('should log error with request but no response', () => {
      const error: any = new Error('Network error');
      error.request = { url: '/api/test', method: 'GET' };
      
      logDetailedError('Network Error', error);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Network Error:', error);
      expect(consoleErrorSpy).toHaveBeenCalledWith('No response received. Request was:', error.request);
    });

    it('should handle error without response or request', () => {
      const error = new Error('Simple error');
      
      logDetailedError('Simple Error', error);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Simple Error:', error);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle different error contexts', () => {
      const error = new Error('Test');
      
      logDetailedError('Authentication Failed', error);
      logDetailedError('Validation Error', error);
      logDetailedError('Database Error', error);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Authentication Failed:', error);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Validation Error:', error);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Database Error:', error);
    });
  });
});

