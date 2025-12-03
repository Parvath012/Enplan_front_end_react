
// Only import authenticate at the top level
import { authenticate } from '../../../src/api/auth/authService';

// Mock dependencies
jest.mock('axios');
const mockedAxios = require('axios');

describe('authService', () => {
  describe('authenticate', () => {
    const OLD_ENV = process.env;
    beforeEach(() => {
      jest.resetModules();
      process.env = { ...OLD_ENV };
      process.env.REACT_APP_API_BASE_URL = 'http://fake-api';
      process.env.REACT_APP_ADMIN_LOGIN_ID = 'testuser';
      process.env.REACT_APP_ADMIN_PASSWORD = 'testpass';
    });
    afterAll(() => {
      process.env = OLD_ENV;
    });

    it('returns token on success', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { data: { jwtToken: 'token123' } } });
      const token = await authenticate();
      expect(token).toBe('token123');
    });

    it('returns token from root if not in data', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { jwtToken: 'token456' } });
      const token = await authenticate();
      expect(token).toBe('token456');
    });

    it('returns null and logs error on failure', async () => {
      const error = new Error('fail');
      mockedAxios.post.mockRejectedValueOnce(error);
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const token = await authenticate();
      expect(token).toBeNull();
      expect(spy).toHaveBeenCalledWith('Authentication error:', error);
      spy.mockRestore();
    });
  });

  describe('getData', () => {
    it('handles non-Error thrown values in catch block', async () => {
      // @ts-ignore
      global.fetch = jest.fn().mockImplementationOnce(() => { throw 'string error'; });
      const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const data = await getData({}, 'jwt');
      expect(data).toBeNull();
      expect(spy).toHaveBeenCalledWith('string error');
      spy.mockRestore();
    });
    it('returns null and logs error if response.json throws', async () => {
      const fakeResponse = { ok: true, json: async () => { throw new Error('json fail'); } };
      global.fetch = jest.fn().mockResolvedValueOnce(fakeResponse);
      const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const data = await getData({}, 'jwt');
      expect(data).toBeNull();
      expect(spy).toHaveBeenCalledWith(expect.any(Error));
      spy.mockRestore();
    });


    const OLD_ENV = process.env;
    let getData: (payload: Record<string, unknown>, jwtToken: string) => Promise<any>;
    beforeEach(async () => {
      jest.resetModules();
      process.env = { ...OLD_ENV };
      process.env.REACT_APP_ADMIN_API_URL = 'http://fake-data-api';
      // Dynamically import after setting env
      ({ getData } = await import('../../../src/api/auth/authService'));
    });
    afterAll(() => {
      process.env = OLD_ENV;
    });

    it('returns data on success', async () => {
      const fakeResponse = { ok: true, json: async () => ({ result: 1 }) };
      global.fetch = jest.fn().mockResolvedValueOnce(fakeResponse);
      const data = await getData({ foo: 'bar' }, 'jwt');
      expect(data).toEqual({ result: 1 });
      expect(global.fetch).toHaveBeenCalledWith(
        'http://fake-data-api/api/v1/data/Data/ExecuteSqlQueries',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ Authorization: 'Bearer jwt' }),
        })
      );
    });

    it('returns null and logs error on fetch failure', async () => {
      const error = new Error('fetch fail');
      global.fetch = jest.fn().mockRejectedValueOnce(error);
      const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const data = await getData({}, 'jwt');
      expect(data).toBeNull();
      expect(spy).toHaveBeenCalledWith(error);
      spy.mockRestore();
    });

    it('returns null and throws on non-ok response', async () => {
      const fakeResponse = { ok: false, status: 500 };
      global.fetch = jest.fn().mockResolvedValueOnce(fakeResponse);
      const data = await getData({}, 'jwt');
      expect(data).toBeNull();
    });
  });
});
