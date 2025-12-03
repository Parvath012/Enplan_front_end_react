import { ProcessorType } from '../../src/data/processorTypes';

describe('processorTypes', () => {
  describe('ProcessorType interface', () => {
    it('should define required properties', () => {
      const processor: ProcessorType = {
        id: 'test-id',
        type: 'TestProcessor',
        version: '1.0.0',
        tags: []
      };

      expect(processor.id).toBe('test-id');
      expect(processor.type).toBe('TestProcessor');
      expect(processor.version).toBe('1.0.0');
      expect(processor.tags).toEqual([]);
    });

    it('should support optional fullType property', () => {
      const processor: ProcessorType = {
        id: 'test-id',
        type: 'TestProcessor',
        fullType: 'org.apache.nifi.processors.standard.TestProcessor',
        version: '1.0.0',
        tags: []
      };

      expect(processor.fullType).toBe('org.apache.nifi.processors.standard.TestProcessor');
    });

    it('should support optional description property', () => {
      const processor: ProcessorType = {
        id: 'test-id',
        type: 'TestProcessor',
        version: '1.0.0',
        tags: [],
        description: 'A test processor description'
      };

      expect(processor.description).toBe('A test processor description');
    });

    it('should support optional restricted property', () => {
      const restrictedProcessor: ProcessorType = {
        id: 'test-id',
        type: 'RestrictedProcessor',
        version: '1.0.0',
        tags: [],
        restricted: true
      };

      expect(restrictedProcessor.restricted).toBe(true);

      const unrestrictedProcessor: ProcessorType = {
        id: 'test-id-2',
        type: 'UnrestrictedProcessor',
        version: '1.0.0',
        tags: [],
        restricted: false
      };

      expect(unrestrictedProcessor.restricted).toBe(false);
    });

    it('should support optional bundle property', () => {
      const processor: ProcessorType = {
        id: 'test-id',
        type: 'TestProcessor',
        version: '1.0.0',
        tags: [],
        bundle: {
          group: 'org.apache.nifi',
          artifact: 'nifi-standard-processors-nar',
          version: '2.3.0'
        }
      };

      expect(processor.bundle).toBeDefined();
      expect(processor.bundle?.group).toBe('org.apache.nifi');
      expect(processor.bundle?.artifact).toBe('nifi-standard-processors-nar');
      expect(processor.bundle?.version).toBe('2.3.0');
    });

    it('should support tags array', () => {
      const processorWithTags: ProcessorType = {
        id: 'test-id',
        type: 'TestProcessor',
        version: '1.0.0',
        tags: ['file', 'read', 'write']
      };

      expect(processorWithTags.tags).toHaveLength(3);
      expect(processorWithTags.tags).toContain('file');
      expect(processorWithTags.tags).toContain('read');
      expect(processorWithTags.tags).toContain('write');
    });

    it('should support empty tags array', () => {
      const processor: ProcessorType = {
        id: 'test-id',
        type: 'TestProcessor',
        version: '1.0.0',
        tags: []
      };

      expect(processor.tags).toEqual([]);
      expect(processor.tags).toHaveLength(0);
    });

    it('should support all properties together', () => {
      const fullProcessor: ProcessorType = {
        id: 'full-processor-id',
        type: 'FullProcessor',
        fullType: 'org.apache.nifi.processors.standard.FullProcessor',
        version: '2.3.0',
        tags: ['tag1', 'tag2'],
        description: 'A full processor with all properties',
        restricted: true,
        bundle: {
          group: 'org.apache.nifi',
          artifact: 'nifi-standard-processors-nar',
          version: '2.3.0'
        }
      };

      expect(fullProcessor.id).toBe('full-processor-id');
      expect(fullProcessor.type).toBe('FullProcessor');
      expect(fullProcessor.fullType).toBe('org.apache.nifi.processors.standard.FullProcessor');
      expect(fullProcessor.version).toBe('2.3.0');
      expect(fullProcessor.tags).toEqual(['tag1', 'tag2']);
      expect(fullProcessor.description).toBe('A full processor with all properties');
      expect(fullProcessor.restricted).toBe(true);
      expect(fullProcessor.bundle).toBeDefined();
      expect(fullProcessor.bundle?.group).toBe('org.apache.nifi');
      expect(fullProcessor.bundle?.artifact).toBe('nifi-standard-processors-nar');
      expect(fullProcessor.bundle?.version).toBe('2.3.0');
    });

    it('should handle minimal processor definition', () => {
      const minimalProcessor: ProcessorType = {
        id: 'minimal-id',
        type: 'MinimalProcessor',
        version: '1.0.0',
        tags: []
      };

      expect(minimalProcessor.id).toBe('minimal-id');
      expect(minimalProcessor.type).toBe('MinimalProcessor');
      expect(minimalProcessor.version).toBe('1.0.0');
      expect(minimalProcessor.tags).toEqual([]);
      expect(minimalProcessor.fullType).toBeUndefined();
      expect(minimalProcessor.description).toBeUndefined();
      expect(minimalProcessor.restricted).toBeUndefined();
      expect(minimalProcessor.bundle).toBeUndefined();
    });

    it('should support different version formats', () => {
      const processor1: ProcessorType = {
        id: 'test-1',
        type: 'Processor1',
        version: '1.0.0',
        tags: []
      };

      const processor2: ProcessorType = {
        id: 'test-2',
        type: 'Processor2',
        version: '2.3.0-SNAPSHOT',
        tags: []
      };

      const processor3: ProcessorType = {
        id: 'test-3',
        type: 'Processor3',
        version: '3',
        tags: []
      };

      expect(processor1.version).toBe('1.0.0');
      expect(processor2.version).toBe('2.3.0-SNAPSHOT');
      expect(processor3.version).toBe('3');
    });

    it('should support bundle with all required fields', () => {
      const processor: ProcessorType = {
        id: 'test-id',
        type: 'TestProcessor',
        version: '2.3.0',
        tags: [],
        bundle: {
          group: 'org.apache.nifi',
          artifact: 'nifi-standard-processors-nar',
          version: '2.3.0'
        }
      };

      expect(processor.bundle).toBeDefined();
      expect(processor.bundle?.group).toBe('org.apache.nifi');
      expect(processor.bundle?.artifact).toBe('nifi-standard-processors-nar');
      expect(processor.bundle?.version).toBe('2.3.0');
    });

    it('should handle restricted processors correctly', () => {
      const restrictedProcessor: ProcessorType = {
        id: 'restricted-id',
        type: 'RestrictedProcessor',
        version: '1.0.0',
        tags: [],
        restricted: true
      };

      expect(restrictedProcessor.restricted).toBe(true);

      const nonRestrictedProcessor: ProcessorType = {
        id: 'non-restricted-id',
        type: 'NonRestrictedProcessor',
        version: '1.0.0',
        tags: [],
        restricted: false
      };

      expect(nonRestrictedProcessor.restricted).toBe(false);
    });
  });
});

