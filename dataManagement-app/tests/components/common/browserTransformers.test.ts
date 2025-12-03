import {
  createTransformApiResponse
} from '../../../src/components/common/browserTransformers';

describe('browserTransformers', () => {
  describe('createTransformApiResponse', () => {
    it('should return empty array when response is null', () => {
      const transform = createTransformApiResponse('processorTypes', 'proc-');
      const result = transform(null);
      expect(result).toEqual([]);
    });

    it('should return empty array when response is undefined', () => {
      const transform = createTransformApiResponse('processorTypes', 'proc-');
      const result = transform(undefined);
      expect(result).toEqual([]);
    });

    it('should return empty array when response key is missing', () => {
      const transform = createTransformApiResponse('processorTypes', 'proc-');
      const result = transform({});
      expect(result).toEqual([]);
    });

    it('should transform API response correctly', () => {
      const transform = createTransformApiResponse('processorTypes', 'proc-');
      const apiResponse = {
        processorTypes: [
          {
            type: 'org.apache.nifi.processors.TestProcessor',
            bundle: {
              group: 'org.apache.nifi',
              artifact: 'nifi-test-nar',
              version: '1.20.0'
            },
            description: 'Test Processor Description',
            restricted: false,
            tags: ['test', 'processor']
          }
        ]
      };

      const result = transform(apiResponse);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'TestProcessor',
        fullType: 'org.apache.nifi.processors.TestProcessor',
        version: '1.20.0',
        description: 'Test Processor Description',
        restricted: false,
        tags: ['test', 'processor']
      });
      expect(result[0].id).toContain('proc-');
    });

    it('should generate unique IDs for each item', () => {
      const transform = createTransformApiResponse('processorTypes', 'proc-');
      const apiResponse = {
        processorTypes: [
          {
            type: 'org.apache.nifi.processors.TestProcessor1',
            bundle: { group: 'org.apache.nifi', artifact: 'nifi-test-nar', version: '1.20.0' }
          },
          {
            type: 'org.apache.nifi.processors.TestProcessor2',
            bundle: { group: 'org.apache.nifi', artifact: 'nifi-test-nar', version: '1.20.0' }
          }
        ]
      };

      const result = transform(apiResponse);

      expect(result).toHaveLength(2);
      expect(result[0].id).not.toBe(result[1].id);
    });

    it('should handle duplicate IDs by appending index', () => {
      const transform = createTransformApiResponse('processorTypes', 'proc-');
      const apiResponse = {
        processorTypes: [
          {
            type: 'org.apache.nifi.processors.TestProcessor',
            bundle: { group: 'org.apache.nifi', artifact: 'nifi-test-nar', version: '1.20.0' }
          },
          {
            type: 'org.apache.nifi.processors.TestProcessor',
            bundle: { group: 'org.apache.nifi', artifact: 'nifi-test-nar', version: '1.20.0' }
          }
        ]
      };

      const result = transform(apiResponse);

      expect(result).toHaveLength(2);
      expect(result[0].id).not.toBe(result[1].id);
    });

    it('should extract type name from full type', () => {
      const transform = createTransformApiResponse('processorTypes', 'proc-');
      const apiResponse = {
        processorTypes: [
          {
            type: 'org.apache.nifi.processors.standard.TestProcessor',
            bundle: { group: 'org.apache.nifi', artifact: 'nifi-test-nar', version: '1.20.0' }
          }
        ]
      };

      const result = transform(apiResponse);

      expect(result[0].type).toBe('TestProcessor');
      expect(result[0].fullType).toBe('org.apache.nifi.processors.standard.TestProcessor');
    });

    it('should handle missing bundle version', () => {
      const transform = createTransformApiResponse('processorTypes', 'proc-');
      const apiResponse = {
        processorTypes: [
          {
            type: 'org.apache.nifi.processors.TestProcessor',
            bundle: { group: 'org.apache.nifi', artifact: 'nifi-test-nar' }
          }
        ]
      };

      const result = transform(apiResponse);

      expect(result[0].version).toBe('2.3.0');
      expect(result[0].bundle).toBeUndefined();
    });

    it('should handle missing bundle', () => {
      const transform = createTransformApiResponse('processorTypes', 'proc-');
      const apiResponse = {
        processorTypes: [
          {
            type: 'org.apache.nifi.processors.TestProcessor'
          }
        ]
      };

      const result = transform(apiResponse);

      expect(result[0].version).toBe('2.3.0');
      expect(result[0].bundle).toBeUndefined();
    });

    it('should handle null bundle', () => {
      const transform = createTransformApiResponse('processorTypes', 'proc-');
      const apiResponse = {
        processorTypes: [
          {
            type: 'org.apache.nifi.processors.TestProcessor',
            bundle: null
          }
        ]
      };

      const result = transform(apiResponse);

      expect(result[0].version).toBe('2.3.0');
      expect(result[0].bundle).toBeUndefined();
    });

    it('should extract description from various fields', () => {
      const transform = createTransformApiResponse('processorTypes', 'proc-');
      const apiResponse = {
        processorTypes: [
          {
            type: 'org.apache.nifi.processors.TestProcessor',
            bundle: { group: 'org.apache.nifi', artifact: 'nifi-test-nar', version: '1.20.0' },
            description: 'Test Description'
          }
        ]
      };

      const result = transform(apiResponse);

      expect(result[0].description).toBe('Test Description');
    });

    it('should handle restricted flag', () => {
      const transform = createTransformApiResponse('processorTypes', 'proc-');
      const apiResponse = {
        processorTypes: [
          {
            type: 'org.apache.nifi.processors.TestProcessor',
            bundle: { group: 'org.apache.nifi', artifact: 'nifi-test-nar', version: '1.20.0' },
            restricted: true
          }
        ]
      };

      const result = transform(apiResponse);

      expect(result[0].restricted).toBe(true);
    });

    it('should default restricted to false when not provided', () => {
      const transform = createTransformApiResponse('processorTypes', 'proc-');
      const apiResponse = {
        processorTypes: [
          {
            type: 'org.apache.nifi.processors.TestProcessor',
            bundle: { group: 'org.apache.nifi', artifact: 'nifi-test-nar', version: '1.20.0' }
          }
        ]
      };

      const result = transform(apiResponse);

      expect(result[0].restricted).toBe(false);
    });

    it('should work with different response keys', () => {
      const transform = createTransformApiResponse('controllerServiceTypes', 'cst-');
      const apiResponse = {
        controllerServiceTypes: [
          {
            type: 'org.apache.nifi.services.TestService',
            bundle: { group: 'org.apache.nifi', artifact: 'nifi-test-nar', version: '1.20.0' }
          }
        ]
      };

      const result = transform(apiResponse);

      expect(result).toHaveLength(1);
      expect(result[0].id).toContain('cst-');
    });

    it('should work with different ID prefixes', () => {
      const transform1 = createTransformApiResponse('processorTypes', 'proc-');
      const transform2 = createTransformApiResponse('processorTypes', 'cst-');

      const apiResponse = {
        processorTypes: [
          {
            type: 'org.apache.nifi.processors.TestProcessor',
            bundle: { group: 'org.apache.nifi', artifact: 'nifi-test-nar', version: '1.20.0' }
          }
        ]
      };

      const result1 = transform1(apiResponse);
      const result2 = transform2(apiResponse);

      expect(result1[0].id).toContain('proc-');
      expect(result2[0].id).toContain('cst-');
    });

    it('should handle empty array in response', () => {
      const transform = createTransformApiResponse('processorTypes', 'proc-');
      const apiResponse = {
        processorTypes: []
      };

      const result = transform(apiResponse);

      expect(result).toEqual([]);
    });

    it('should normalize IDs by removing special characters', () => {
      const transform = createTransformApiResponse('processorTypes', 'proc-');
      const apiResponse = {
        processorTypes: [
          {
            type: 'org.apache.nifi.processors.Test@Processor#123',
            bundle: { group: 'org.apache.nifi', artifact: 'nifi-test-nar', version: '1.20.0' }
          }
        ]
      };

      const result = transform(apiResponse);

      expect(result[0].id).not.toContain('@');
      expect(result[0].id).not.toContain('#');
    });
  });
});

