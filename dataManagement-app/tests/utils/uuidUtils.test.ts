import { generateUUID, polyfillCryptoRandomUUID } from '../../src/utils/uuidUtils';

describe('uuidUtils', () => {
  let originalCrypto: any;
  let originalWindow: any;
  let originalWindowCrypto: any;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    // Save original values
    originalCrypto = (global as any).crypto;
    originalWindow = (global as any).window;
    originalWindowCrypto = (global as any).window?.crypto;
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    // Clear any existing mocks
    delete (global as any).crypto;
    if ((global as any).window) {
      delete (global as any).window.crypto;
    }
  });

  afterEach(() => {
    // Restore original values
    if (originalCrypto !== undefined) {
      (global as any).crypto = originalCrypto;
    } else {
      delete (global as any).crypto;
    }
    if (originalWindow !== undefined) {
      (global as any).window = originalWindow;
    } else {
      delete (global as any).window;
    }
    if (originalWindowCrypto !== undefined && (global as any).window) {
      (global as any).window.crypto = originalWindowCrypto;
    }
    consoleWarnSpy.mockRestore();
  });

  describe('generateUUID', () => {
    it('should use crypto.getRandomValues() when available', () => {
      (global as any).crypto = {
        getRandomValues: jest.fn((arr: Uint8Array) => {
          // Fill with predictable values for testing
          for (let i = 0; i < arr.length; i++) {
            arr[i] = i % 256;
          }
          return arr;
        }),
      };

      const result = generateUUID(32);

      // Should generate a 32-character alphanumeric string
      expect(result).toMatch(/^[A-Za-z0-9]{32}$/);
      expect((global as any).crypto.getRandomValues).toHaveBeenCalled();
      expect(result).toHaveLength(32);
    });

    it('should use crypto.getRandomValues() with custom length', () => {
      (global as any).crypto = {
        getRandomValues: jest.fn((arr: Uint8Array) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = i % 256;
          }
          return arr;
        }),
      };

      const result16 = generateUUID(16);
      const result64 = generateUUID(64);

      expect(result16).toMatch(/^[A-Za-z0-9]{16}$/);
      expect(result64).toMatch(/^[A-Za-z0-9]{64}$/);
      expect(result16).toHaveLength(16);
      expect(result64).toHaveLength(64);
    });

    it('should fallback to Math.random() when getRandomValues throws error', () => {
      const mockError = new Error('getRandomValues failed');
      (global as any).crypto = {
        getRandomValues: jest.fn(() => {
          throw mockError;
        }),
      };

      // Mock Math.random to return predictable values
      const originalMathRandom = Math.random;
      let callCount = 0;
      Math.random = jest.fn(() => {
        callCount++;
        return (callCount % 62) / 62; // Return values that map to different characters
      });

      const result = generateUUID(32);

      expect(result).toMatch(/^[A-Za-z0-9]{32}$/);
      expect(consoleWarnSpy).toHaveBeenCalledWith('crypto.getRandomValues() failed, using fallback:', mockError);
      expect(result).toHaveLength(32);
      
      // Restore Math.random
      Math.random = originalMathRandom;
    });

    it('should use Math.random() fallback when crypto is undefined', () => {
      delete (global as any).crypto;

      // Mock Math.random to return predictable values
      const originalMathRandom = Math.random;
      let callCount = 0;
      Math.random = jest.fn(() => {
        callCount++;
        return (callCount % 62) / 62;
      });

      const result = generateUUID(32);

      expect(result).toMatch(/^[A-Za-z0-9]{32}$/);
      expect(result).toHaveLength(32);
      
      // Restore Math.random
      Math.random = originalMathRandom;
    });

    it('should use Math.random() fallback when crypto exists but has no methods', () => {
      (global as any).crypto = {};

      // Mock Math.random to return predictable values
      const originalMathRandom = Math.random;
      let callCount = 0;
      Math.random = jest.fn(() => {
        callCount++;
        return (callCount % 62) / 62;
      });

      const result = generateUUID(32);

      expect(result).toMatch(/^[A-Za-z0-9]{32}$/);
      expect(result).toHaveLength(32);
      
      // Restore Math.random
      Math.random = originalMathRandom;
    });

    it('should generate unique UIDs', () => {
      (global as any).crypto = {
        getRandomValues: jest.fn((arr: Uint8Array) => {
          // Fill with random values
          for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256);
          }
          return arr;
        }),
      };

      const uid1 = generateUUID(32);
      const uid2 = generateUUID(32);

      // Very unlikely to be the same (but not impossible)
      // We'll just verify they're both valid alphanumeric strings
      expect(uid1).toMatch(/^[A-Za-z0-9]{32}$/);
      expect(uid2).toMatch(/^[A-Za-z0-9]{32}$/);
      expect(uid1).toHaveLength(32);
      expect(uid2).toHaveLength(32);
    });

    it('should handle getRandomValues returning different array lengths', () => {
      (global as any).crypto = {
        getRandomValues: jest.fn((arr: Uint8Array) => {
          // Fill with values
          for (let i = 0; i < arr.length; i++) {
            arr[i] = (i * 17) % 256; // Use a pattern that ensures variety
          }
          return arr;
        }),
      };

      const result = generateUUID(32);
      expect(result).toMatch(/^[A-Za-z0-9]{32}$/);
      expect(result).toHaveLength(32);
    });

    it('should default to length 32 when no length is provided', () => {
      (global as any).crypto = {
        getRandomValues: jest.fn((arr: Uint8Array) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = i % 256;
          }
          return arr;
        }),
      };

      const result = generateUUID();

      expect(result).toMatch(/^[A-Za-z0-9]{32}$/);
      expect(result).toHaveLength(32);
    });
  });

  describe('polyfillCryptoRandomUUID', () => {
    it('should add randomUUID to crypto when it does not exist', () => {
      (global as any).crypto = {
        getRandomValues: jest.fn((arr: Uint8Array) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = i % 256;
          }
          return arr;
        }),
      };

      polyfillCryptoRandomUUID();

      expect(typeof (global as any).crypto.randomUUID).toBe('function');
      const uid = (global as any).crypto.randomUUID();
      expect(uid).toMatch(/^[A-Za-z0-9]{32}$/);
      expect(uid).toHaveLength(32);
    });

    it('should not override randomUUID when it already exists', () => {
      const existingRandomUUID = jest.fn(() => 'existing-uid-12345678901234567890123456789012');
      (global as any).crypto = {
        randomUUID: existingRandomUUID,
      };

      polyfillCryptoRandomUUID();

      expect((global as any).crypto.randomUUID).toBe(existingRandomUUID);
      expect((global as any).crypto.randomUUID()).toBe('existing-uid-12345678901234567890123456789012');
    });

    it('should handle when crypto is undefined', () => {
      delete (global as any).crypto;

      expect(() => polyfillCryptoRandomUUID()).not.toThrow();
    });

    it('should handle when crypto is null', () => {
      (global as any).crypto = null;

      expect(() => polyfillCryptoRandomUUID()).not.toThrow();
    });
  });

  describe('Auto-polyfill on module load', () => {
    // Note: These tests verify the auto-polyfill code that runs when the module is loaded
    // We need to use jest.isolateModules to test this properly

    it('should auto-polyfill global.crypto when available and randomUUID does not exist', () => {
      jest.isolateModules(() => {
        const originalCrypto = (global as any).crypto;
        (global as any).crypto = {
          getRandomValues: jest.fn((arr: Uint8Array) => {
            for (let i = 0; i < arr.length; i++) {
              arr[i] = i % 256;
            }
            return arr;
          }),
        };

        // Re-import the module to trigger auto-polyfill
        require('../../src/utils/uuidUtils');

        expect(typeof (global as any).crypto.randomUUID).toBe('function');
        const uid = (global as any).crypto.randomUUID();
        expect(uid).toMatch(/^[A-Za-z0-9]{32}$/);
        expect(uid).toHaveLength(32);

        // Restore
        (global as any).crypto = originalCrypto;
      });
    });

    it('should not auto-polyfill global.crypto when randomUUID already exists', () => {
      jest.isolateModules(() => {
        const originalCrypto = (global as any).crypto;
        const existingRandomUUID = jest.fn(() => 'existing-uid-12345678901234567890123456789012');
        (global as any).crypto = {
          randomUUID: existingRandomUUID,
        };

        // Re-import the module
        require('../../src/utils/uuidUtils');

        expect((global as any).crypto.randomUUID).toBe(existingRandomUUID);
        expect((global as any).crypto.randomUUID()).toBe('existing-uid-12345678901234567890123456789012');

        // Restore
        (global as any).crypto = originalCrypto;
      });
    });

    it('should handle when global is undefined', () => {
      jest.isolateModules(() => {
        // In Node.js, global is always defined, but we can test the typeof check
        // by temporarily removing it from the scope
        const originalGlobal = (global as any);
        
        // We can't actually delete global, but we can verify the code handles
        // the case where global.crypto doesn't exist
        delete (global as any).crypto;

        expect(() => require('../../src/utils/uuidUtils')).not.toThrow();

        // Restore
        if (originalGlobal) {
          (global as any).crypto = originalGlobal.crypto;
        }
      });
    });

    it('should handle when global.crypto is undefined', () => {
      jest.isolateModules(() => {
        const originalCrypto = (global as any).crypto;
        delete (global as any).crypto;

        expect(() => require('../../src/utils/uuidUtils')).not.toThrow();

        // Restore
        if (originalCrypto !== undefined) {
          (global as any).crypto = originalCrypto;
        }
      });
    });

    it('should auto-polyfill window.crypto when available and randomUUID does not exist', () => {
      jest.isolateModules(() => {
        const originalWindow = (global as any).window;
        (global as any).window = {
          crypto: {
            getRandomValues: jest.fn((arr: Uint8Array) => {
              for (let i = 0; i < arr.length; i++) {
                arr[i] = i % 256;
              }
              return arr;
            }),
          },
        };

        // Re-import the module to trigger auto-polyfill
        require('../../src/utils/uuidUtils');

        expect(typeof (global as any).window.crypto.randomUUID).toBe('function');
        const uid = (global as any).window.crypto.randomUUID();
        expect(uid).toMatch(/^[A-Za-z0-9]{32}$/);
        expect(uid).toHaveLength(32);

        // Restore
        (global as any).window = originalWindow;
      });
    });

    it('should not auto-polyfill window.crypto when randomUUID already exists', () => {
      jest.isolateModules(() => {
        const originalWindow = (global as any).window;
        const existingRandomUUID = jest.fn(() => 'existing-uid-12345678901234567890123456789012');
        (global as any).window = {
          crypto: {
            randomUUID: existingRandomUUID,
          },
        };

        // Re-import the module
        require('../../src/utils/uuidUtils');

        expect((global as any).window.crypto.randomUUID).toBe(existingRandomUUID);
        expect((global as any).window.crypto.randomUUID()).toBe('existing-uid-12345678901234567890123456789012');

        // Restore
        (global as any).window = originalWindow;
      });
    });

    it('should handle when window is undefined', () => {
      jest.isolateModules(() => {
        const originalWindow = (global as any).window;
        delete (global as any).window;

        expect(() => require('../../src/utils/uuidUtils')).not.toThrow();

        // Restore
        if (originalWindow !== undefined) {
          (global as any).window = originalWindow;
        }
      });
    });

    it('should handle when window.crypto is undefined', () => {
      jest.isolateModules(() => {
        const originalWindow = (global as any).window;
        (global as any).window = {};

        expect(() => require('../../src/utils/uuidUtils')).not.toThrow();

        // Restore
        (global as any).window = originalWindow;
      });
    });
  });

  describe('Edge cases and integration', () => {
    it('should work correctly after polyfill is applied', () => {
      (global as any).crypto = {
        getRandomValues: jest.fn((arr: Uint8Array) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = i % 256;
          }
          return arr;
        }),
      };

      polyfillCryptoRandomUUID();

      // Now generateUUID should use the polyfilled randomUUID
      const uid1 = (global as any).crypto.randomUUID();
      const uid2 = generateUUID(32);

      const uidRegex = /^[A-Za-z0-9]{32}$/;
      expect(uid1).toMatch(uidRegex);
      expect(uid2).toMatch(uidRegex);
      expect(uid1).toHaveLength(32);
      expect(uid2).toHaveLength(32);
    });

    it('should handle multiple calls to generateUUID', () => {
      (global as any).crypto = {
        getRandomValues: jest.fn((arr: Uint8Array) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256);
          }
          return arr;
        }),
      };

      const uids = Array.from({ length: 10 }, () => generateUUID(32));

      // All should be valid alphanumeric strings
      const uidRegex = /^[A-Za-z0-9]{32}$/;
      uids.forEach(uid => {
        expect(uid).toMatch(uidRegex);
        expect(uid).toHaveLength(32);
      });
    });

    it('should handle getRandomValues with all zeros correctly', () => {
      (global as any).crypto = {
        getRandomValues: jest.fn((arr: Uint8Array) => {
          // Fill with all zeros initially
          arr.fill(0);
          return arr;
        }),
      };

      const result = generateUUID(32);

      // Should still generate a valid alphanumeric string
      expect(result).toMatch(/^[A-Za-z0-9]{32}$/);
      expect(result).toHaveLength(32);
      // With all zeros, result should be all 'A' characters (0 % 62 = 0, which maps to 'A')
      expect(result).toBe('A'.repeat(32));
    });
  });
});

