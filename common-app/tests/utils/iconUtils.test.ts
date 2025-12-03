import { getIconUrl } from '../../src/utils/iconUtils';

// Mock window.location
const mockLocation = {
  port: '3000',
  pathname: '/admin/user-management'
};

// Mock process.env
const originalEnv = process.env;

describe('iconUtils', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true
    });
    
    // Reset process.env
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original process.env
    process.env = originalEnv;
  });

  describe('getIconUrl', () => {
    it('should return relative path when not in remote module context', () => {
      // Mock non-remote module context (port not 3000 and pathname doesn't start with /admin)
      Object.defineProperty(window, 'location', {
        value: { 
          port: '3006', 
          pathname: '/user-management',
          origin: 'http://localhost:3006'
        },
        writable: true
      });

      const result = getIconUrl('test-icon.png');
      expect(result).toBe('/icons/test-icon.png');
    });

    it('should return relative path when port is not 3000 and pathname does not start with /admin', () => {
      // Mock standalone mode
      Object.defineProperty(window, 'location', {
        value: { 
          port: '3006', 
          pathname: '/some-path',
          origin: 'http://localhost:3006'
        },
        writable: true
      });

      const result = getIconUrl('test-icon.png');
      expect(result).toBe('/icons/test-icon.png');
    });

    it('should return user management app URL when in user management context (admin path)', () => {
      // Mock user management context in admin
      Object.defineProperty(window, 'location', {
        value: { 
          port: '3000', 
          pathname: '/admin/user-management',
          origin: 'http://localhost:3000'
        },
        writable: true
      });

      const result = getIconUrl('welcome_image.png');
      expect(result).toBe('http://localhost:3006/icons/welcome_image.png');
    });

    it('should return user management app URL when in user management context (standalone path)', () => {
      // Mock user management context standalone - should still work if port is 3000
      Object.defineProperty(window, 'location', {
        value: { 
          port: '3000', 
          pathname: '/user-management',
          origin: 'http://localhost:3000'
        },
        writable: true
      });

      const result = getIconUrl('welcome_image.png');
      expect(result).toBe('http://localhost:3006/icons/welcome_image.png');
    });

    it('should return entity setup app URL when in entity setup context (admin path)', () => {
      // Mock entity setup context in admin
      Object.defineProperty(window, 'location', {
        value: { 
          port: '3000', 
          pathname: '/admin/entity-setup',
          origin: 'http://localhost:3000'
        },
        writable: true
      });

      const result = getIconUrl('welcome_image.png');
      expect(result).toBe('http://localhost:3005/icons/welcome_image.png');
    });

    it('should return entity setup app URL when in entity setup context (standalone path)', () => {
      // Mock entity setup context standalone
      Object.defineProperty(window, 'location', {
        value: { 
          port: '3000', 
          pathname: '/entity-setup',
          origin: 'http://localhost:3000'
        },
        writable: true
      });

      const result = getIconUrl('welcome_image.png');
      expect(result).toBe('http://localhost:3005/icons/welcome_image.png');
    });

    it('should return admin app URL when in admin context but app not detected', () => {
      // Mock admin context but no specific app
      Object.defineProperty(window, 'location', {
        value: { 
          port: '3000', 
          pathname: '/admin/some-other-app',
          origin: 'http://localhost:3000'
        },
        writable: true
      });

      const result = getIconUrl('test-icon.png');
      expect(result).toBe('http://localhost:3000/icons/test-icon.png');
    });

    it('should handle different icon names', () => {
      Object.defineProperty(window, 'location', {
        value: { 
          port: '3000', 
          pathname: '/admin/user-management',
          origin: 'http://localhost:3000'
        },
        writable: true
      });

      expect(getIconUrl('welcome_image.png')).toBe('http://localhost:3006/icons/welcome_image.png');
      expect(getIconUrl('logo.svg')).toBe('http://localhost:3006/icons/logo.svg');
      expect(getIconUrl('icon.jpg')).toBe('http://localhost:3006/icons/icon.jpg');
    });

    it('should handle empty icon name', () => {
      Object.defineProperty(window, 'location', {
        value: { 
          port: '3000', 
          pathname: '/admin/user-management',
          origin: 'http://localhost:3000'
        },
        writable: true
      });

      const result = getIconUrl('');
      expect(result).toBe('http://localhost:3006/icons/');
    });

    it('should handle icon name with special characters', () => {
      Object.defineProperty(window, 'location', {
        value: { 
          port: '3000', 
          pathname: '/admin/entity-setup',
          origin: 'http://localhost:3000'
        },
        writable: true
      });

      const result = getIconUrl('icon-with-dashes.png');
      expect(result).toBe('http://localhost:3005/icons/icon-with-dashes.png');
    });

    it('should handle icon name with spaces', () => {
      Object.defineProperty(window, 'location', {
        value: { 
          port: '3000', 
          pathname: '/admin/user-management',
          origin: 'http://localhost:3000'
        },
        writable: true
      });

      const result = getIconUrl('icon with spaces.png');
      expect(result).toBe('http://localhost:3006/icons/icon with spaces.png');
    });

    it('should handle origin replacement correctly', () => {
      Object.defineProperty(window, 'location', {
        value: { 
          port: '3000', 
          pathname: '/admin/user-management',
          origin: 'https://example.com:3000'
        },
        writable: true
      });

      const result = getIconUrl('test.png');
      expect(result).toBe('https://example.com:3006/icons/test.png');
    });

    it('should handle different ports (non-3000)', () => {
      // Test with different port numbers - should use relative path
      Object.defineProperty(window, 'location', {
        value: { 
          port: '8080', 
          pathname: '/admin/user-management',
          origin: 'http://localhost:8080'
        },
        writable: true
      });

      const result = getIconUrl('test-icon.png');
      expect(result).toBe('/icons/test-icon.png');
    });

    it('should handle port 3000 with admin pathname', () => {
      Object.defineProperty(window, 'location', {
        value: { 
          port: '3000', 
          pathname: '/admin',
          origin: 'http://localhost:3000'
        },
        writable: true
      });

      const result = getIconUrl('test-icon.png');
      expect(result).toBe('http://localhost:3000/icons/test-icon.png');
    });

    it('should handle different path patterns', () => {
      // Test with different path patterns
      const testCases = [
        { pathname: '/admin/user-management/some-page', port: '3000', origin: 'http://localhost:3000', expected: 'http://localhost:3006/icons/test-icon.png' },
        { pathname: '/user-management/some-page', port: '3000', origin: 'http://localhost:3000', expected: 'http://localhost:3006/icons/test-icon.png' },
        { pathname: '/admin/entity-setup/some-page', port: '3000', origin: 'http://localhost:3000', expected: 'http://localhost:3005/icons/test-icon.png' },
        { pathname: '/entity-setup/some-page', port: '3000', origin: 'http://localhost:3000', expected: 'http://localhost:3005/icons/test-icon.png' }
      ];

      testCases.forEach(({ pathname, port, origin, expected }) => {
        Object.defineProperty(window, 'location', {
          value: { port, pathname, origin },
          writable: true
        });

        const result = getIconUrl('test-icon.png');
        expect(result).toBe(expected);
      });
    });

    it('should handle origin with different formats', () => {
      Object.defineProperty(window, 'location', {
        value: { 
          port: '3000', 
          pathname: '/admin/user-management',
          origin: 'http://172.16.20.116:3000'
        },
        writable: true
      });

      const result = getIconUrl('test-icon.png');
      expect(result).toBe('http://172.16.20.116:3006/icons/test-icon.png');
    });

    it('should handle complex path scenarios', () => {
      // Test with nested paths
      Object.defineProperty(window, 'location', {
        value: { 
          port: '3000', 
          pathname: '/admin/user-management/users/create',
          origin: 'http://localhost:3000'
        },
        writable: true
      });

      const result = getIconUrl('user-icon.png');
      expect(result).toBe('http://localhost:3006/icons/user-icon.png');
    });

    it('should handle case sensitivity in path matching (includes is case-sensitive)', () => {
      // Test case sensitivity - includes is case-sensitive
      Object.defineProperty(window, 'location', {
        value: { 
          port: '3000', 
          pathname: '/admin/USER-MANAGEMENT',
          origin: 'http://localhost:3000'
        },
        writable: true
      });

      const result = getIconUrl('test-icon.png');
      // Should not match 'user-management' due to case, so falls back to admin origin
      expect(result).toBe('http://localhost:3000/icons/test-icon.png');
    });

    it('should handle pathname that starts with /admin but no app detected', () => {
      Object.defineProperty(window, 'location', {
        value: { 
          port: '3000', 
          pathname: '/admin',
          origin: 'http://localhost:3000'
        },
        writable: true
      });

      const result = getIconUrl('test-icon.png');
      expect(result).toBe('http://localhost:3000/icons/test-icon.png');
    });
  });
});

