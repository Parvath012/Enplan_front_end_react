import { ControllerServiceType } from '../../src/data/controllerServiceTypes';

describe('controllerServiceTypes', () => {
  describe('ControllerServiceType interface', () => {
    it('should define required properties', () => {
      const service: ControllerServiceType = {
        id: 'test-id',
        type: 'TestService',
        version: '1.0.0',
        tags: []
      };

      expect(service.id).toBe('test-id');
      expect(service.type).toBe('TestService');
      expect(service.version).toBe('1.0.0');
      expect(service.tags).toEqual([]);
    });

    it('should support optional fullType property', () => {
      const service: ControllerServiceType = {
        id: 'test-id',
        type: 'TestService',
        fullType: 'org.apache.nifi.services.TestService',
        version: '1.0.0',
        tags: []
      };

      expect(service.fullType).toBe('org.apache.nifi.services.TestService');
    });

    it('should support optional description property', () => {
      const service: ControllerServiceType = {
        id: 'test-id',
        type: 'TestService',
        version: '1.0.0',
        tags: [],
        description: 'A test service description'
      };

      expect(service.description).toBe('A test service description');
    });

    it('should support optional restricted property', () => {
      const restrictedService: ControllerServiceType = {
        id: 'test-id',
        type: 'RestrictedService',
        version: '1.0.0',
        tags: [],
        restricted: true
      };

      expect(restrictedService.restricted).toBe(true);

      const unrestrictedService: ControllerServiceType = {
        id: 'test-id-2',
        type: 'UnrestrictedService',
        version: '1.0.0',
        tags: [],
        restricted: false
      };

      expect(unrestrictedService.restricted).toBe(false);
    });

    it('should support optional bundle property', () => {
      const service: ControllerServiceType = {
        id: 'test-id',
        type: 'TestService',
        version: '1.0.0',
        tags: [],
        bundle: {
          group: 'org.apache.nifi',
          artifact: 'nifi-standard-services-api-nar',
          version: '2.3.0'
        }
      };

      expect(service.bundle).toBeDefined();
      expect(service.bundle?.group).toBe('org.apache.nifi');
      expect(service.bundle?.artifact).toBe('nifi-standard-services-api-nar');
      expect(service.bundle?.version).toBe('2.3.0');
    });

    it('should support tags array', () => {
      const serviceWithTags: ControllerServiceType = {
        id: 'test-id',
        type: 'TestService',
        version: '1.0.0',
        tags: ['database', 'connection', 'pooling']
      };

      expect(serviceWithTags.tags).toHaveLength(3);
      expect(serviceWithTags.tags).toContain('database');
      expect(serviceWithTags.tags).toContain('connection');
      expect(serviceWithTags.tags).toContain('pooling');
    });

    it('should support empty tags array', () => {
      const service: ControllerServiceType = {
        id: 'test-id',
        type: 'TestService',
        version: '1.0.0',
        tags: []
      };

      expect(service.tags).toEqual([]);
      expect(service.tags).toHaveLength(0);
    });

    it('should support all properties together', () => {
      const fullService: ControllerServiceType = {
        id: 'full-service-id',
        type: 'FullService',
        fullType: 'org.apache.nifi.services.FullService',
        version: '2.3.0',
        tags: ['tag1', 'tag2'],
        description: 'A full service with all properties',
        restricted: true,
        bundle: {
          group: 'org.apache.nifi',
          artifact: 'nifi-standard-services-api-nar',
          version: '2.3.0'
        }
      };

      expect(fullService.id).toBe('full-service-id');
      expect(fullService.type).toBe('FullService');
      expect(fullService.fullType).toBe('org.apache.nifi.services.FullService');
      expect(fullService.version).toBe('2.3.0');
      expect(fullService.tags).toEqual(['tag1', 'tag2']);
      expect(fullService.description).toBe('A full service with all properties');
      expect(fullService.restricted).toBe(true);
      expect(fullService.bundle).toBeDefined();
      expect(fullService.bundle?.group).toBe('org.apache.nifi');
      expect(fullService.bundle?.artifact).toBe('nifi-standard-services-api-nar');
      expect(fullService.bundle?.version).toBe('2.3.0');
    });

    it('should handle minimal service definition', () => {
      const minimalService: ControllerServiceType = {
        id: 'minimal-id',
        type: 'MinimalService',
        version: '1.0.0',
        tags: []
      };

      expect(minimalService.id).toBe('minimal-id');
      expect(minimalService.type).toBe('MinimalService');
      expect(minimalService.version).toBe('1.0.0');
      expect(minimalService.tags).toEqual([]);
      expect(minimalService.fullType).toBeUndefined();
      expect(minimalService.description).toBeUndefined();
      expect(minimalService.restricted).toBeUndefined();
      expect(minimalService.bundle).toBeUndefined();
    });

    it('should support different version formats', () => {
      const service1: ControllerServiceType = {
        id: 'test-1',
        type: 'Service1',
        version: '1.0.0',
        tags: []
      };

      const service2: ControllerServiceType = {
        id: 'test-2',
        type: 'Service2',
        version: '2.3.0-SNAPSHOT',
        tags: []
      };

      const service3: ControllerServiceType = {
        id: 'test-3',
        type: 'Service3',
        version: '3',
        tags: []
      };

      expect(service1.version).toBe('1.0.0');
      expect(service2.version).toBe('2.3.0-SNAPSHOT');
      expect(service3.version).toBe('3');
    });
  });
});

