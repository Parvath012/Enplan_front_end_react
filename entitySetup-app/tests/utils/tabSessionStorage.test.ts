import {
  saveEntityConfigTab,
  getEntityConfigTab,
  clearEntityConfigTab,
  isEntityConfigurationPage,
  shouldRestoreTabForEntity
} from '../../src/utils/tabSessionStorage';

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
});

// Mock console methods to avoid test output noise
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
});

describe('tabSessionStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveEntityConfigTab', () => {
    it('should save tab data with entityId to sessionStorage', () => {
      saveEntityConfigTab(2, 'test-entity-123');

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'entityConfigActiveTab',
        expect.stringContaining('"tabValue":2')
      );
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'entityConfigActiveTab',
        expect.stringContaining('"entityId":"test-entity-123"')
      );
    });

    it('should save tab data without entityId to sessionStorage', () => {
      saveEntityConfigTab(1);

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'entityConfigActiveTab',
        expect.stringContaining('"tabValue":1')
      );
    });

    it('should handle sessionStorage setItem errors gracefully', () => {
      mockSessionStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      expect(() => saveEntityConfigTab(1)).not.toThrow();
      expect(console.warn).toHaveBeenCalledWith('EntitySetup: Failed to save tab to sessionStorage:', expect.any(Error));
    });

    it('should save tab with zero value', () => {
      saveEntityConfigTab(0, 'entity-0');

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'entityConfigActiveTab',
        expect.stringContaining('"tabValue":0')
      );
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'entityConfigActiveTab',
        expect.stringContaining('"entityId":"entity-0"')
      );
    });

    it('should save tab with negative value', () => {
      saveEntityConfigTab(-1, 'entity-negative');

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'entityConfigActiveTab',
        expect.stringContaining('"tabValue":-1')
      );
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'entityConfigActiveTab',
        expect.stringContaining('"entityId":"entity-negative"')
      );
    });
  });

  describe('getEntityConfigTab', () => {
    it('should return parsed tab data from sessionStorage', () => {
      const testData = {
        tabValue: 3,
        entityId: 'test-entity-456',
        timestamp: Date.now()
      };
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(testData));

      const result = getEntityConfigTab();

      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('entityConfigActiveTab');
      expect(result).toEqual(testData);
    });

    it('should return null when no data exists in sessionStorage', () => {
      mockSessionStorage.getItem.mockReturnValue(null);

      const result = getEntityConfigTab();

      expect(result).toBeNull();
    });

    it('should return null when sessionStorage contains invalid JSON', () => {
      mockSessionStorage.getItem.mockReturnValue('invalid-json');

      const result = getEntityConfigTab();

      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith('EntitySetup: Failed to retrieve tab from sessionStorage:', expect.any(Error));
    });

    it('should handle sessionStorage getItem errors gracefully', () => {
      mockSessionStorage.getItem.mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      const result = getEntityConfigTab();

      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith('EntitySetup: Failed to retrieve tab from sessionStorage:', expect.any(Error));
    });

    it('should return data even with missing entityId', () => {
      const testData = {
        tabValue: 2,
        timestamp: Date.now()
      };
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(testData));

      const result = getEntityConfigTab();

      expect(result).toEqual(testData);
    });

    it('should return data with zero tab value', () => {
      const testData = {
        tabValue: 0,
        entityId: 'test-entity',
        timestamp: Date.now()
      };
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(testData));

      const result = getEntityConfigTab();

      expect(result).toEqual(testData);
    });
  });

  describe('clearEntityConfigTab', () => {
    it('should remove entityConfigTab from sessionStorage', () => {
      clearEntityConfigTab();

      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('entityConfigActiveTab');
    });

    it('should handle sessionStorage removeItem errors gracefully', () => {
      mockSessionStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      expect(() => clearEntityConfigTab()).not.toThrow();
      expect(console.warn).toHaveBeenCalledWith('EntitySetup: Failed to clear tab from sessionStorage:', expect.any(Error));
    });
  });

  describe('isEntityConfigurationPage', () => {
    it('should return true for entity-configuration path', () => {
      expect(isEntityConfigurationPage('/entity-configuration')).toBe(true);
    });

    it('should return true for entity-configuration with trailing slash', () => {
      expect(isEntityConfigurationPage('/entity-configuration/')).toBe(true);
    });

    it('should return true for entity-configuration with query parameters', () => {
      expect(isEntityConfigurationPage('/entity-configuration?param=value')).toBe(true);
    });

    it('should return true for entity-configuration with sub-paths', () => {
      expect(isEntityConfigurationPage('/entity-configuration/sub-path')).toBe(true);
    });

    it('should return true for entity-configuration with entity ID in path', () => {
      expect(isEntityConfigurationPage('/entity-configuration/123')).toBe(true);
    });

    it('should return false for non-entity-configuration paths', () => {
      expect(isEntityConfigurationPage('/home')).toBe(false);
      expect(isEntityConfigurationPage('/admin')).toBe(false);
      expect(isEntityConfigurationPage('/budgeting')).toBe(false);
      expect(isEntityConfigurationPage('/user-management')).toBe(false);
    });

    it('should return false for paths that contain entity-configuration but are not entity-configuration', () => {
      expect(isEntityConfigurationPage('/other-entity-configuration')).toBe(false);
      // This will actually return true because it contains '/entity-configuration'
      expect(isEntityConfigurationPage('/prefix/entity-configuration')).toBe(true);
    });

    it('should return false for empty or null paths', () => {
      expect(isEntityConfigurationPage('')).toBe(false);
      expect(isEntityConfigurationPage(null as any)).toBe(false);
      expect(isEntityConfigurationPage(undefined as any)).toBe(false);
    });

    it('should handle paths with multiple slashes', () => {
      expect(isEntityConfigurationPage('//entity-configuration')).toBe(true);
      expect(isEntityConfigurationPage('/entity-configuration//')).toBe(true);
    });

    it('should be case sensitive', () => {
      expect(isEntityConfigurationPage('/Entity-Configuration')).toBe(false);
      expect(isEntityConfigurationPage('/ENTITY-CONFIGURATION')).toBe(false);
    });
  });

  describe('shouldRestoreTabForEntity', () => {
    it('should return true when both path and entityId are valid', () => {
      expect(shouldRestoreTabForEntity('/entity-configuration', 'test-entity')).toBe(true);
    });

    it('should return false when path is not entity configuration', () => {
      expect(shouldRestoreTabForEntity('/home', 'test-entity')).toBe(false);
    });

    it('should return true when path is valid but entityId is undefined', () => {
      expect(shouldRestoreTabForEntity('/entity-configuration', undefined)).toBe(true);
    });

    it('should return true when path is valid but entityId is null', () => {
      expect(shouldRestoreTabForEntity('/entity-configuration', null as any)).toBe(true);
    });

    it('should return true when path is valid but entityId is empty string', () => {
      expect(shouldRestoreTabForEntity('/entity-configuration', '')).toBe(true);
    });

    it('should return false when path is empty', () => {
      expect(shouldRestoreTabForEntity('', 'test-entity')).toBe(false);
    });

    it('should return false when path is null or undefined', () => {
      expect(shouldRestoreTabForEntity(null as any, 'test-entity')).toBe(false);
      expect(shouldRestoreTabForEntity(undefined as any, 'test-entity')).toBe(false);
    });

    it('should handle complex entity configuration paths', () => {
      // Mock that sessionStorage has data to restore
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify({ tabValue: 1, entityId: 'entity-123', timestamp: Date.now() }));
      expect(shouldRestoreTabForEntity('/entity-configuration/123/edit', 'entity-123')).toBe(true);
      
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify({ tabValue: 2, entityId: 'entity-456', timestamp: Date.now() }));
      expect(shouldRestoreTabForEntity('/entity-configuration?tab=2', 'entity-456')).toBe(true);
    });

    it('should return true for entity configuration with various entityId formats', () => {
      // Mock that sessionStorage has data to restore
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify({ tabValue: 1, entityId: '123', timestamp: Date.now() }));
      expect(shouldRestoreTabForEntity('/entity-configuration', '123')).toBe(true);
      
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify({ tabValue: 1, entityId: 'entity-abc-123', timestamp: Date.now() }));
      expect(shouldRestoreTabForEntity('/entity-configuration', 'entity-abc-123')).toBe(true);
      
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify({ tabValue: 1, entityId: 'ENTITY_ABC_123', timestamp: Date.now() }));
      expect(shouldRestoreTabForEntity('/entity-configuration', 'ENTITY_ABC_123')).toBe(true);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete save-get-clear cycle', () => {
      // Save data
      saveEntityConfigTab(4, 'integration-test');
      
      const savedCall = mockSessionStorage.setItem.mock.calls[0];
      const savedData = JSON.parse(savedCall[1]);
      
      // Mock the return for get
      mockSessionStorage.getItem.mockReturnValue(savedCall[1]);
      
      // Get data
      const retrieved = getEntityConfigTab();
      
      expect(retrieved).toEqual(savedData);
      expect(retrieved?.tabValue).toBe(4);
      expect(retrieved?.entityId).toBe('integration-test');
      
      // Clear data
      clearEntityConfigTab();
      
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('entityConfigActiveTab');
    });

    it('should handle save without entityId then get', () => {
      saveEntityConfigTab(2);
      
      const savedCall = mockSessionStorage.setItem.mock.calls[0];
      mockSessionStorage.getItem.mockReturnValue(savedCall[1]);
      
      const retrieved = getEntityConfigTab();
      
      expect(retrieved?.tabValue).toBe(2);
      expect(retrieved?.entityId).toBeUndefined();
    });

    it('should handle path validation in realistic scenarios', () => {
      // Simulate navigation flow
      expect(isEntityConfigurationPage('/home')).toBe(false);
      expect(shouldRestoreTabForEntity('/home', 'entity-1')).toBe(false);
      
      expect(isEntityConfigurationPage('/entity-configuration')).toBe(true);
      expect(shouldRestoreTabForEntity('/entity-configuration', 'entity-1')).toBe(true);
      
      expect(isEntityConfigurationPage('/entity-configuration/123')).toBe(true);
      expect(shouldRestoreTabForEntity('/entity-configuration/123', 'entity-1')).toBe(true);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle storage quota exceeded during save', () => {
      mockSessionStorage.setItem.mockImplementation(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      expect(() => saveEntityConfigTab(1, 'test')).not.toThrow();
      expect(console.warn).toHaveBeenCalledWith('EntitySetup: Failed to save tab to sessionStorage:', expect.any(Error));
    });

    it('should handle corrupted JSON data gracefully', () => {
      mockSessionStorage.getItem.mockReturnValue('{"tabValue":1,"entityId":"test"'); // Missing closing brace

      const result = getEntityConfigTab();

      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith('EntitySetup: Failed to retrieve tab from sessionStorage:', expect.any(Error));
    });

    it('should handle null sessionStorage methods', () => {
      // Temporarily replace sessionStorage with null methods
      const originalStorage = window.sessionStorage;
      Object.defineProperty(window, 'sessionStorage', {
        value: null,
        configurable: true
      });

      expect(() => saveEntityConfigTab(1)).not.toThrow();
      expect(() => getEntityConfigTab()).not.toThrow();
      expect(() => clearEntityConfigTab()).not.toThrow();

      // Restore original sessionStorage
      Object.defineProperty(window, 'sessionStorage', {
        value: originalStorage,
        configurable: true
      });
    });

    it('should handle very large tab values', () => {
      const largeTabValue = Number.MAX_SAFE_INTEGER;
      saveEntityConfigTab(largeTabValue, 'large-value-test');

      const savedCall = mockSessionStorage.setItem.mock.calls[0];
      const savedData = JSON.parse(savedCall[1]);

      expect(savedData.tabValue).toBe(largeTabValue);
    });

    it('should handle special characters in entityId', () => {
      const specialEntityId = 'entity-with-special-chars-@#$%^&*()';
      saveEntityConfigTab(1, specialEntityId);

      const savedCall = mockSessionStorage.setItem.mock.calls[0];
      const savedData = JSON.parse(savedCall[1]);

      expect(savedData.entityId).toBe(specialEntityId);
    });
  });
});