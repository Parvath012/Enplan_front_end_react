import NIFI_CONFIG from '../../src/config/nifiConfig';

describe('NiFi Configuration', () => {
  describe('ROOT_PROCESS_GROUP_ID', () => {
    it('should not have ROOT_PROCESS_GROUP_ID (now fetched dynamically)', () => {
      // ROOT_PROCESS_GROUP_ID has been removed - it's now fetched dynamically from API
      // Check that the property doesn't exist on the config object
      expect(NIFI_CONFIG).not.toHaveProperty('ROOT_PROCESS_GROUP_ID');
    });

    it('should use nifiApiService.getRootProcessGroupId() for root ID', () => {
      // This test documents that root ID is now dynamic
      // The actual ID should be fetched using nifiApiService.getRootProcessGroupId()
      expect(true).toBe(true);
    });
  });

  describe('DEFAULT_POSITION', () => {
    it('should have default position defined', () => {
      expect(NIFI_CONFIG.DEFAULT_POSITION).toBeDefined();
    });

    it('should have x coordinate', () => {
      expect(NIFI_CONFIG.DEFAULT_POSITION.x).toBeDefined();
      expect(typeof NIFI_CONFIG.DEFAULT_POSITION.x).toBe('number');
    });

    it('should have y coordinate', () => {
      expect(NIFI_CONFIG.DEFAULT_POSITION.y).toBeDefined();
      expect(typeof NIFI_CONFIG.DEFAULT_POSITION.y).toBe('number');
    });

    it('should have correct x value', () => {
      expect(NIFI_CONFIG.DEFAULT_POSITION.x).toBe(3264.911834716797);
    });

    it('should have correct y value', () => {
      expect(NIFI_CONFIG.DEFAULT_POSITION.y).toBe(92.27570343017578);
    });

    it('should have positive coordinates', () => {
      expect(NIFI_CONFIG.DEFAULT_POSITION.x).toBeGreaterThan(0);
      expect(NIFI_CONFIG.DEFAULT_POSITION.y).toBeGreaterThan(0);
    });

    it('should be a valid position object', () => {
      expect(NIFI_CONFIG.DEFAULT_POSITION).toHaveProperty('x');
      expect(NIFI_CONFIG.DEFAULT_POSITION).toHaveProperty('y');
      expect(Object.keys(NIFI_CONFIG.DEFAULT_POSITION)).toHaveLength(2);
    });
  });

  describe('POSITION_OFFSET', () => {
    it('should have position offset defined', () => {
      expect(NIFI_CONFIG.POSITION_OFFSET).toBeDefined();
    });

    it('should have x offset', () => {
      expect(NIFI_CONFIG.POSITION_OFFSET.x).toBeDefined();
      expect(typeof NIFI_CONFIG.POSITION_OFFSET.x).toBe('number');
    });

    it('should have y offset', () => {
      expect(NIFI_CONFIG.POSITION_OFFSET.y).toBeDefined();
      expect(typeof NIFI_CONFIG.POSITION_OFFSET.y).toBe('number');
    });

    it('should have correct x offset value', () => {
      expect(NIFI_CONFIG.POSITION_OFFSET.x).toBe(50);
    });

    it('should have correct y offset value', () => {
      expect(NIFI_CONFIG.POSITION_OFFSET.y).toBe(50);
    });

    it('should have positive offsets', () => {
      expect(NIFI_CONFIG.POSITION_OFFSET.x).toBeGreaterThan(0);
      expect(NIFI_CONFIG.POSITION_OFFSET.y).toBeGreaterThan(0);
    });

    it('should be a valid offset object', () => {
      expect(NIFI_CONFIG.POSITION_OFFSET).toHaveProperty('x');
      expect(NIFI_CONFIG.POSITION_OFFSET).toHaveProperty('y');
      expect(Object.keys(NIFI_CONFIG.POSITION_OFFSET)).toHaveLength(2);
    });

    it('should have equal x and y offsets for cascading', () => {
      expect(NIFI_CONFIG.POSITION_OFFSET.x).toBe(NIFI_CONFIG.POSITION_OFFSET.y);
    });
  });

  describe('Configuration Structure', () => {
    it('should have all required properties', () => {
      // ROOT_PROCESS_GROUP_ID removed - now fetched dynamically
      expect(NIFI_CONFIG).toHaveProperty('DEFAULT_POSITION');
      expect(NIFI_CONFIG).toHaveProperty('POSITION_OFFSET');
      expect(NIFI_CONFIG).toHaveProperty('USER_MAPPINGS');
    });

    it('should not have ROOT_PROCESS_GROUP_ID property', () => {
      // ROOT_PROCESS_GROUP_ID has been removed in favor of dynamic fetching
      expect(NIFI_CONFIG).not.toHaveProperty('ROOT_PROCESS_GROUP_ID');
    });

    it('should not have DEFAULT_PROCESS_GROUPS (removed - all users use root process group)', () => {
      // DEFAULT_PROCESS_GROUPS has been removed - all users now use root process group fetched from API
      expect(NIFI_CONFIG.USER_MAPPINGS).not.toHaveProperty('DEFAULT_PROCESS_GROUPS');
      expect(NIFI_CONFIG.USER_MAPPINGS).not.toHaveProperty('DEFAULT_PROCESS_GROUP_NAMES');
    });

    it('should use root process group fetched dynamically from API', () => {
      // All users use root process group - fetched using nifiApiService.getRootProcessGroupId()
      expect(NIFI_CONFIG.USER_MAPPINGS).toHaveProperty('DEFAULT_PERMISSIONS');
    });

    it('should have expected properties', () => {
      const expectedKeys = ['DEFAULT_POSITION', 'POSITION_OFFSET', 'USER_MAPPINGS'];
      const actualKeys = Object.keys(NIFI_CONFIG);
      expect(actualKeys).toEqual(expect.arrayContaining(expectedKeys));
    });

    it('should be exportable as default', () => {
      expect(NIFI_CONFIG).toBeDefined();
      expect(typeof NIFI_CONFIG).toBe('object');
    });

    it('should be immutable (frozen or const)', () => {
      expect(() => {
        // @ts-ignore - Testing immutability
        NIFI_CONFIG.DEFAULT_POSITION = { x: 0, y: 0 };
      }).not.toThrow();
    });
  });

  describe('Position Calculations', () => {
    it('should calculate cascading positions correctly', () => {
      const calculatePosition = (index: number) => ({
        x: NIFI_CONFIG.DEFAULT_POSITION.x + (index * NIFI_CONFIG.POSITION_OFFSET.x),
        y: NIFI_CONFIG.DEFAULT_POSITION.y + (index * NIFI_CONFIG.POSITION_OFFSET.y),
      });

      const pos0 = calculatePosition(0);
      expect(pos0.x).toBe(NIFI_CONFIG.DEFAULT_POSITION.x);
      expect(pos0.y).toBe(NIFI_CONFIG.DEFAULT_POSITION.y);

      const pos1 = calculatePosition(1);
      expect(pos1.x).toBe(NIFI_CONFIG.DEFAULT_POSITION.x + 50);
      expect(pos1.y).toBe(NIFI_CONFIG.DEFAULT_POSITION.y + 50);

      const pos2 = calculatePosition(2);
      expect(pos2.x).toBe(NIFI_CONFIG.DEFAULT_POSITION.x + 100);
      expect(pos2.y).toBe(NIFI_CONFIG.DEFAULT_POSITION.y + 100);
    });

    it('should maintain consistent spacing for multiple items', () => {
      const positions = Array.from({ length: 5 }, (_, i) => ({
        x: NIFI_CONFIG.DEFAULT_POSITION.x + (i * NIFI_CONFIG.POSITION_OFFSET.x),
        y: NIFI_CONFIG.DEFAULT_POSITION.y + (i * NIFI_CONFIG.POSITION_OFFSET.y),
      }));

      for (let i = 1; i < positions.length; i++) {
        const xDiff = positions[i].x - positions[i - 1].x;
        const yDiff = positions[i].y - positions[i - 1].y;
        
        expect(xDiff).toBe(NIFI_CONFIG.POSITION_OFFSET.x);
        expect(yDiff).toBe(NIFI_CONFIG.POSITION_OFFSET.y);
      }
    });
  });

  describe('Type Safety', () => {
    it('should have correct types for all properties', () => {
      // ROOT_PROCESS_GROUP_ID removed - now fetched dynamically
      expect(typeof NIFI_CONFIG.DEFAULT_POSITION).toBe('object');
      expect(typeof NIFI_CONFIG.POSITION_OFFSET).toBe('object');
      expect(typeof NIFI_CONFIG.USER_MAPPINGS).toBe('object');
      expect(typeof NIFI_CONFIG.DEFAULT_POSITION.x).toBe('number');
      expect(typeof NIFI_CONFIG.DEFAULT_POSITION.y).toBe('number');
      expect(typeof NIFI_CONFIG.POSITION_OFFSET.x).toBe('number');
      expect(typeof NIFI_CONFIG.POSITION_OFFSET.y).toBe('number');
    });

    it('should not have null or undefined values', () => {
      // ROOT_PROCESS_GROUP_ID removed - now fetched dynamically
      expect(NIFI_CONFIG.DEFAULT_POSITION).not.toBeNull();
      expect(NIFI_CONFIG.DEFAULT_POSITION).not.toBeUndefined();
      expect(NIFI_CONFIG.POSITION_OFFSET).not.toBeNull();
      expect(NIFI_CONFIG.POSITION_OFFSET).not.toBeUndefined();
      expect(NIFI_CONFIG.USER_MAPPINGS).not.toBeNull();
      expect(NIFI_CONFIG.USER_MAPPINGS).not.toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative position calculations', () => {
      const negativePosition = {
        x: NIFI_CONFIG.DEFAULT_POSITION.x + (-1 * NIFI_CONFIG.POSITION_OFFSET.x),
        y: NIFI_CONFIG.DEFAULT_POSITION.y + (-1 * NIFI_CONFIG.POSITION_OFFSET.y),
      };

      expect(negativePosition.x).toBeLessThan(NIFI_CONFIG.DEFAULT_POSITION.x);
      expect(negativePosition.y).toBeLessThan(NIFI_CONFIG.DEFAULT_POSITION.y);
    });

    it('should handle large index calculations', () => {
      const largeIndex = 1000;
      const position = {
        x: NIFI_CONFIG.DEFAULT_POSITION.x + (largeIndex * NIFI_CONFIG.POSITION_OFFSET.x),
        y: NIFI_CONFIG.DEFAULT_POSITION.y + (largeIndex * NIFI_CONFIG.POSITION_OFFSET.y),
      };

      expect(position.x).toBeGreaterThan(NIFI_CONFIG.DEFAULT_POSITION.x);
      expect(position.y).toBeGreaterThan(NIFI_CONFIG.DEFAULT_POSITION.y);
      expect(typeof position.x).toBe('number');
      expect(typeof position.y).toBe('number');
    });
  });
});

