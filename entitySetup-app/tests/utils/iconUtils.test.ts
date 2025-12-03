import { getIconUrl, getIconPath } from '../../src/utils/iconUtils';

describe('iconUtils', () => {
  const originalLocation = { ...window.location } as any;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, hostname: 'localhost', pathname: '/', port: '3005' },
    });
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', { writable: true, value: originalLocation });
    process.env = originalEnv;
  });

  describe('getIconUrl', () => {
    it('returns mock path in test environment', () => {
      process.env.NODE_ENV = 'test';
      expect(getIconUrl('test-icon.svg')).toBe('/mock-icons/test-icon.svg');
    });

    it('returns relative path in local non-remote context', () => {
      process.env.NODE_ENV = 'development';
      (window.location as any).hostname = 'localhost';
      (window.location as any).pathname = '/';
      
      expect(getIconUrl('a.svg')).toBe('/icons/a.svg');
    });

    it('uses remote base when running under admin app path', () => {
      process.env.NODE_ENV = 'development';
      (window.location as any).pathname = '/admin/entity-setup/list';
      
      expect(getIconUrl('b.svg')).toBe('http://remote:3005/icons/b.svg');
    });

    it('uses remote base when not localhost', () => {
      process.env.NODE_ENV = 'development';
      (window.location as any).hostname = 'example.com';
      (window.location as any).port = '3000';
      
      expect(getIconUrl('c.svg')).toBe('http://remote:3005/icons/c.svg');
    });

    it('handles different icon file extensions', () => {
      process.env.NODE_ENV = 'development';
      (window.location as any).hostname = 'localhost';
      
      expect(getIconUrl('icon.png')).toBe('/icons/icon.png');
      expect(getIconUrl('icon.jpg')).toBe('/icons/icon.jpg');
      expect(getIconUrl('icon.gif')).toBe('/icons/icon.gif');
    });

    it('handles icons with special characters in name', () => {
      process.env.NODE_ENV = 'development';
      (window.location as any).hostname = 'localhost';
      
      expect(getIconUrl('icon-with-dashes.svg')).toBe('/icons/icon-with-dashes.svg');
      expect(getIconUrl('icon_with_underscores.svg')).toBe('/icons/icon_with_underscores.svg');
    });

    it('handles empty icon name', () => {
      process.env.NODE_ENV = 'development';
      (window.location as any).hostname = 'localhost';
      
      expect(getIconUrl('')).toBe('/icons/');
    });

    it('handles undefined window object', () => {
      process.env.NODE_ENV = 'development';
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      
      expect(getIconUrl('test.svg')).toBe('/icons/test.svg');
      
      global.window = originalWindow;
    });

    it('handles undefined location object', () => {
      process.env.NODE_ENV = 'development';
      const originalLocation = window.location;
      // @ts-ignore
      delete window.location;
      
      expect(getIconUrl('test.svg')).toBe('/icons/test.svg');
      
      window.location = originalLocation;
    });
  });

  describe('getIconPath', () => {
    it('returns the same result as getIconUrl', () => {
      process.env.NODE_ENV = 'development';
      (window.location as any).hostname = 'localhost';
      
      const iconName = 'test-icon.svg';
      expect(getIconPath(iconName)).toBe(getIconUrl(iconName));
    });

    it('handles different icon names', () => {
      process.env.NODE_ENV = 'development';
      (window.location as any).hostname = 'localhost';
      
      expect(getIconPath('icon1.svg')).toBe('/icons/icon1.svg');
      expect(getIconPath('icon2.png')).toBe('/icons/icon2.png');
    });
  });

  describe('Edge Cases', () => {
    it('handles null icon name', () => {
      process.env.NODE_ENV = 'development';
      (window.location as any).hostname = 'localhost';
      
      expect(getIconUrl(null as any)).toBe('/icons/null');
    });

    it('handles undefined icon name', () => {
      process.env.NODE_ENV = 'development';
      (window.location as any).hostname = 'localhost';
      
      expect(getIconUrl(undefined as any)).toBe('/icons/undefined');
    });

    it('handles numeric icon name', () => {
      process.env.NODE_ENV = 'development';
      (window.location as any).hostname = 'localhost';
      
      expect(getIconUrl(123 as any)).toBe('/icons/123');
    });

    it('handles boolean icon name', () => {
      process.env.NODE_ENV = 'development';
      (window.location as any).hostname = 'localhost';
      
      expect(getIconUrl(true as any)).toBe('/icons/true');
    });
  });

  describe('Environment Detection', () => {
    it('detects test environment correctly', () => {
      process.env.NODE_ENV = 'test';
      expect(getIconUrl('test.svg')).toBe('/mock-icons/test.svg');
    });

    it('detects production environment', () => {
      process.env.NODE_ENV = 'production';
      (window.location as any).hostname = 'localhost';
      
      expect(getIconUrl('prod.svg')).toBe('/icons/prod.svg');
    });

    it('detects development environment', () => {
      process.env.NODE_ENV = 'development';
      (window.location as any).hostname = 'localhost';
      
      expect(getIconUrl('dev.svg')).toBe('/icons/dev.svg');
    });
  });

  describe('Path Detection', () => {
    it('detects admin app path correctly', () => {
      process.env.NODE_ENV = 'development';
      (window.location as any).pathname = '/admin/some-path';
      
      expect(getIconUrl('admin.svg')).toBe('http://remote:3005/icons/admin.svg');
    });

    it('detects non-admin path correctly', () => {
      process.env.NODE_ENV = 'development';
      (window.location as any).pathname = '/regular-path';
      (window.location as any).hostname = 'localhost';
      
      expect(getIconUrl('regular.svg')).toBe('/icons/regular.svg');
    });

    it('detects non-localhost hostname correctly', () => {
      process.env.NODE_ENV = 'development';
      (window.location as any).hostname = 'staging.example.com';
      
      expect(getIconUrl('staging.svg')).toBe('http://remote:3005/icons/staging.svg');
    });

    it('detects localhost hostname correctly', () => {
      process.env.NODE_ENV = 'development';
      (window.location as any).hostname = 'localhost';
      (window.location as any).pathname = '/';
      
      expect(getIconUrl('local.svg')).toBe('/icons/local.svg');
    });
  });
});


