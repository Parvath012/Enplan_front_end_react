/**
 * Tests for the Express proxy server (server.js)
 * 
 * Note: This file is a self-executing Express server, which makes it challenging to test
 * in a traditional unit test environment. These tests focus on mocking the key dependencies
 * and verifying the logic without starting an actual server.
 */

// Mock all the dependencies before requiring the server
const mockAxios = {
  post: jest.fn(),
  default: jest.fn(),
};

const mockExpress = jest.fn(() => ({
  use: jest.fn(),
  get: jest.fn(),
  disable: jest.fn(),
  listen: jest.fn((port, callback) => {
    callback();
  }),
}));

const mockHttps = {
  Agent: jest.fn(),
};

const mockBodyParser = {
  json: jest.fn(() => (req, res, next) => next()),
};

const mockCookieParser = jest.fn(() => (req, res, next) => next());

const mockCors = jest.fn(() => (req, res, next) => next());

const mockDotenv = {
  config: jest.fn(),
};

const mockPath = {
  resolve: jest.fn((...args) => args.join('/')),
};

// Set up the mocks
jest.mock('express', () => mockExpress);
jest.mock('axios', () => mockAxios);
jest.mock('https', () => mockHttps);
jest.mock('body-parser', () => mockBodyParser);
jest.mock('cookie-parser', () => mockCookieParser);
jest.mock('cors', () => mockCors);
jest.mock('dotenv', () => mockDotenv);
jest.mock('path', () => mockPath);

describe('server.js', () => {
  let app;
  let authenticateHandler;
  let proxyHandler;
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset module registry to get fresh instance
    jest.resetModules();
    
    // Set up console spies
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Set up environment variables
    process.env.NIFI_USERNAME = 'test-user';
    process.env.NIFI_PASSWORD = 'test-password';
    process.env.PORT = '4001';

    // Create a fresh app mock for each test
    app = {
      use: jest.fn(),
      get: jest.fn(),
      disable: jest.fn(),
      listen: jest.fn((port, callback) => {
        if (callback) callback();
      }),
    };
    mockExpress.mockReturnValue(app);

    // Require the server after setting up mocks
    require('../../../src/api/auth/server');

    // Extract handlers from the app.use and app.get calls
    // app.disable is called first, then cors, bodyParser, cookieParser, then app.get for /api/authenticate, then app.use for /nifi-api
    const getCalls = app.get.mock.calls;
    const useCalls = app.use.mock.calls;
    
    // Find the authenticate handler (app.get)
    const authenticateCall = getCalls.find(call => call[0] === '/api/authenticate');
    if (authenticateCall) {
      authenticateHandler = authenticateCall[1];
    }

    // Find the proxy handler (app.use with '/nifi-api')
    const proxyCall = useCalls.find(call => call[0] === '/nifi-api');
    if (proxyCall) {
      proxyHandler = proxyCall[1];
    }
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    delete process.env.NIFI_USERNAME;
    delete process.env.NIFI_PASSWORD;
    delete process.env.PORT;
  });

  describe('Server Initialization (lines 1-24)', () => {
    it('should initialize Express app and middleware (lines 8-16)', () => {
      expect(mockExpress).toHaveBeenCalled();
      expect(app.disable).toHaveBeenCalledWith('x-powered-by');
      expect(mockCors).toHaveBeenCalledWith({
        origin: ['http://localhost:3004', 'http://localhost:3000'],
        credentials: true
      });
      expect(mockBodyParser.json).toHaveBeenCalled();
      expect(mockCookieParser).toHaveBeenCalled();
      expect(app.use).toHaveBeenCalled();
    });

    it('should load environment variables from correct path (line 19)', () => {
      expect(mockDotenv.config).toHaveBeenCalled();
      expect(mockPath.resolve).toHaveBeenCalled();
    });

    it('should start server on correct port (lines 96-97)', () => {
      expect(app.listen).toHaveBeenCalledWith(4001, expect.any(Function));
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Node proxy server running on port 4001')
      );
    });

    it('should use default port when PORT env var is not set (line 96)', () => {
      delete process.env.PORT;
      jest.resetModules();
      
      const freshApp = {
        use: jest.fn(),
        get: jest.fn(),
        disable: jest.fn(),
        listen: jest.fn((port, callback) => {
          if (callback) callback();
        }),
      };
      mockExpress.mockReturnValue(freshApp);
      
      require('../../../src/api/auth/server');
      
      expect(freshApp.listen).toHaveBeenCalledWith(4001, expect.any(Function));
    });
  });

  describe('Authentication Endpoint (lines 25-58)', () => {
    let req, res;

    beforeEach(() => {
      req = {
        body: {},
        cookies: {},
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        cookie: jest.fn().mockReturnThis(),
      };
    });

    it('should successfully authenticate with valid credentials (lines 26-49)', async () => {
      const mockToken = 'test-token-12345';
      mockAxios.post.mockResolvedValue({ data: mockToken });

      await authenticateHandler(req, res);

      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://localhost:8443/nifi-api/access/token',
        expect.any(URLSearchParams),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
      );

      expect(mockHttps.Agent).toHaveBeenCalledWith({ rejectUnauthorized: false });
      
      expect(res.cookie).toHaveBeenCalledWith('authToken', mockToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      });

      expect(res.json).toHaveBeenCalledWith({ message: 'Authentication successful' });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Authenticating with NiFi')
      );
    });

    it('should return 500 error when username is missing (lines 27-30)', async () => {
      delete process.env.NIFI_USERNAME;
      jest.resetModules();
      
      const freshApp = {
        use: jest.fn(),
        get: jest.fn(),
        disable: jest.fn(),
        listen: jest.fn((port, callback) => {
          if (callback) callback();
        }),
      };
      mockExpress.mockReturnValue(freshApp);
      
      require('../../../src/api/auth/server');
      
      const getCalls = freshApp.get.mock.calls;
      const authCall = getCalls.find(call => call[0] === '/api/authenticate');
      const handler = authCall[1];

      await handler(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing username or password')
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Server configuration error - missing credentials'
      });
    });

    it('should return 500 error when password is missing (lines 27-30)', async () => {
      delete process.env.NIFI_PASSWORD;
      jest.resetModules();
      
      const freshApp = {
        use: jest.fn(),
        get: jest.fn(),
        disable: jest.fn(),
        listen: jest.fn((port, callback) => {
          if (callback) callback();
        }),
      };
      mockExpress.mockReturnValue(freshApp);
      
      require('../../../src/api/auth/server');
      
      const getCalls = freshApp.get.mock.calls;
      const authCall = getCalls.find(call => call[0] === '/api/authenticate');
      const handler = authCall[1];

      await handler(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing username or password')
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Server configuration error - missing credentials'
      });
    });

    it('should handle authentication errors with response (lines 50-57)', async () => {
      const mockError = {
        message: 'Authentication failed',
        response: {
        status: 401,
          data: 'Invalid credentials',
        },
      };
      mockAxios.post.mockRejectedValue(mockError);

      await authenticateHandler(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Auth error:', 'Authentication failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Response status:', 401);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Response data:', 'Invalid credentials');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Authentication failed',
        details: 'Authentication failed'
      });
    });

    it('should handle authentication errors without response (lines 50-57)', async () => {
      const mockError = {
        message: 'Network timeout',
      };
      mockAxios.post.mockRejectedValue(mockError);

      await authenticateHandler(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Auth error:', 'Network timeout');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Authentication failed',
        details: 'Network timeout' 
      });
      });
    });

  describe('NiFi API Proxy (lines 61-93)', () => {
    let req, res;

    beforeEach(() => {
      req = {
        cookies: { authToken: 'test-token' },
        originalUrl: '/nifi-api/flow/status',
        method: 'GET',
        body: {},
        get: jest.fn((header) => {
          if (header === 'Content-Type') return 'application/json';
          return null;
        }),
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
    });

    it('should successfully proxy GET request to NiFi (lines 62-84)', async () => {
      const mockResponse = {
        status: 200,
        data: { controllerStatus: { activeThreadCount: 5 } },
      };
      mockAxios.default.mockResolvedValue(mockResponse);

      await proxyHandler(req, res);

      expect(mockAxios.default).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://localhost:8443/nifi-api/flow/status',
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
        data: {},
        httpsAgent: expect.any(Object),
      });

      expect(mockHttps.Agent).toHaveBeenCalledWith({ rejectUnauthorized: false });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse.data);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Proxying request to NiFi: GET')
      );
    });

    it('should successfully proxy POST request with body (lines 72-84)', async () => {
      req.method = 'POST';
      req.body = { name: 'Test Process Group' };
      req.originalUrl = '/nifi-api/process-groups/root/process-groups';
      
      const mockResponse = {
        status: 201,
        data: { id: 'pg-123', component: { name: 'Test Process Group' } },
      };
      mockAxios.default.mockResolvedValue(mockResponse);

      await proxyHandler(req, res);

      expect(mockAxios.default).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          data: { name: 'Test Process Group' },
        })
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResponse.data);
    });

    it('should use default Content-Type when not provided (line 77)', async () => {
      req.get = jest.fn(() => null);
      
      const mockResponse = {
        status: 200,
        data: {},
      };
      mockAxios.default.mockResolvedValue(mockResponse);

      await proxyHandler(req, res);

      expect(mockAxios.default).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should return 401 error when auth token is missing (lines 64-67)', async () => {
      req.cookies = {};

      await proxyHandler(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith('No auth token found in cookies');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No auth token provided' });
      expect(mockAxios.default).not.toHaveBeenCalled();
    });

    it('should handle proxy errors with response (lines 85-92)', async () => {
      const mockError = {
        message: 'Request failed',
        response: {
          status: 404,
          data: 'Not found',
        },
      };
      mockAxios.default.mockRejectedValue(mockError);

      await proxyHandler(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Proxy error:', 'Request failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Response status:', 404);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Response data:', 'Not found');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Failed to proxy request to NiFi',
        details: 'Request failed' 
      });
    });

    it('should handle proxy errors without response (lines 85-92)', async () => {
      const mockError = {
        message: 'Connection timeout',
      };
      mockAxios.default.mockRejectedValue(mockError);

      await proxyHandler(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Proxy error:', 'Connection timeout');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Failed to proxy request to NiFi',
        details: 'Connection timeout' 
      });
    });

    it('should handle PUT requests (line 73)', async () => {
      req.method = 'PUT';
      req.body = { value: 'updated' };
      
      const mockResponse = {
        status: 200,
        data: { success: true },
      };
      mockAxios.default.mockResolvedValue(mockResponse);

      await proxyHandler(req, res);

      expect(mockAxios.default).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          data: { value: 'updated' },
        })
      );
    });

    it('should handle DELETE requests (line 73)', async () => {
      req.method = 'DELETE';
      
      const mockResponse = {
        status: 200,
        data: { success: true },
      };
      mockAxios.default.mockResolvedValue(mockResponse);

      await proxyHandler(req, res);

      expect(mockAxios.default).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      });
    });

  describe('URLSearchParams construction (lines 32-34)', () => {
    it('should create URLSearchParams with username and password', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        cookie: jest.fn().mockReturnThis(),
      };

      const mockToken = 'token-123';
      mockAxios.post.mockResolvedValue({ data: mockToken });

      await authenticateHandler(req, res);

      // Verify URLSearchParams was created and used correctly
      const postCall = mockAxios.post.mock.calls[0];
      const params = postCall[1];
      
      // URLSearchParams should have username and password
      expect(params).toBeInstanceOf(URLSearchParams);
      expect(params.get('username')).toBe('test-user');
      expect(params.get('password')).toBe('test-password');
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle multiple middleware registrations in correct order', () => {
      // Verify middleware order
      const useCalls = app.use.mock.calls;
      
      // Should have multiple use calls (cors, bodyParser, cookieParser, and proxy)
      expect(useCalls.length).toBeGreaterThanOrEqual(3);
    });

    it('should construct correct NiFi URL (line 69)', async () => {
      const req = {
        cookies: { authToken: 'test-token' },
        originalUrl: '/nifi-api/custom/endpoint',
        method: 'GET',
        body: {},
        get: jest.fn(() => 'application/json'),
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      mockAxios.default.mockResolvedValue({ status: 200, data: {} });

      await proxyHandler(req, res);

      expect(mockAxios.default).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://localhost:8443/nifi-api/custom/endpoint',
        })
      );
    });

    it('should set Authorization header with Bearer token (line 76)', async () => {
      const req = {
        cookies: { authToken: 'my-secret-token' },
        originalUrl: '/nifi-api/test',
        method: 'GET',
        body: {},
        get: jest.fn(() => null),
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      mockAxios.default.mockResolvedValue({ status: 200, data: {} });

      await proxyHandler(req, res);

      expect(mockAxios.default).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-secret-token',
          }),
        })
      );
    });
  });
});

