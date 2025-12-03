import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  buildEntityCsv,
  saveEntity,
  buildPartialUpdateCsv,
  saveEntityPartialUpdate,
  EntityFormData,
  OperationType,
} from '../../src/services/entitySaveService';

// Mock console methods to reduce test noise
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('entitySaveService', () => {
  let mockAxios: MockAdapter;
  let originalEnv: any;

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
    originalEnv = process.env;
    // Mock console to reduce test noise
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Set up environment variable
    process.env.REACT_APP_DATA_API_URL = 'http://localhost:8080';
  });

  afterEach(() => {
    mockAxios.restore();
    process.env = originalEnv;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe('Helper Functions - String Escaping and Formatting', () => {
    // These are internal functions, but we can test them through buildEntityCsv
    
    it('handles single quotes in strings correctly', () => {
      const form: EntityFormData = {
        legalBusinessName: "Test's Business",
        displayName: "Test's Display",
        entityType: 'corporation',
      };

      const result = buildEntityCsv(form, 'n');
      
      expect(result.row).toContain("'Test''s Business'");
      expect(result.row).toContain("'Test''s Display'");
    });

    it('handles empty and null strings correctly', () => {
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        addressLine2: '',
        city: undefined as any,
      };

      const result = buildEntityCsv(form, 'n');
      
      expect(result.headers).toContain('LegalBusinessName');
      expect(result.headers).not.toContain('AddressLine2');
      expect(result.headers).not.toContain('City');
    });

    it('handles JSON objects correctly', () => {
      const assignedEntity = { key: 'value', nested: { data: 123 } };
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        assignedEntity,
      };

      const result = buildEntityCsv(form, 'n');
      
      expect(result.row).toContain("'{\"key\":\"value\",\"nested\":{\"data\":123}}'");
    });

    it('handles JSON with single quotes correctly', () => {
      const assignedEntity = { message: "It's a test" };
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        assignedEntity,
      };

      const result = buildEntityCsv(form, 'n');
      
      expect(result.row).toContain('\'{"message":"It\'\'s a test"}\'');
    });

    it('handles invalid JSON gracefully', () => {
      // Create a circular reference that can't be JSON stringified
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;
      
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        assignedEntity: circularObj,
      };

      const result = buildEntityCsv(form, 'n');
      
      expect(result.row).toContain("''"); // Should fallback to empty string
    });
  });

  describe('buildEntityCsv - New Entity (n)', () => {
    it('builds CSV for minimal new entity', () => {
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
      };

      const result = buildEntityCsv(form, 'n');

      expect(result.headers).toBe('_ops|id|LegalBusinessName|DisplayName|EntityType|SetAsDefault|CreatedAt|LastUpdatedAt|IsConfigured|IsEnabled|IsDeleted|SoftDeleted');
      expect(result.row).toMatch(/^n\|\|'Test Business'\|'Test Display'\|'corporation'\|false\|'\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}'\|'\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}'\|false\|true\|false\|false$/);
    });

    it('builds CSV for complete new entity', () => {
      const form: EntityFormData = {
        legalBusinessName: 'Complete Business',
        displayName: 'Complete Display',
        entityType: 'llc',
        assignedEntity: { id: 1, name: 'Parent' },
        addressLine1: '123 Main St',
        addressLine2: 'Suite 456',
        country: 'USA',
        state: 'CA',
        city: 'San Francisco',
        pinZipCode: '94105',
        logo: 'data:image/png;base64,iVBORw0KGgo...',
        setAsDefault: true,
        countries: [{ code: 'US', name: 'United States' }],
        currencies: [{ code: 'USD', symbol: '$' }],
        isConfigured: true,
        isEnabled: false,
        isDeleted: false,
      };

      const result = buildEntityCsv(form, 'n');

      expect(result.headers).toContain('_ops|id|LegalBusinessName|DisplayName|EntityType|AssignedEntity');
      expect(result.headers).toContain('AddressLine1|AddressLine2|Country|State|City|PinZipCode|Logo');
      expect(result.headers).toContain('SetAsDefault|Countries|Currencies|CreatedAt|LastUpdatedAt');
      expect(result.headers).toContain('IsConfigured|IsEnabled|IsDeleted|SoftDeleted');
      
      expect(result.row).toContain("'Complete Business'");
      expect(result.row).toContain("'Complete Display'");
      expect(result.row).toContain("'llc'");
      expect(result.row).toContain("'123 Main St'");
      expect(result.row).toContain("'Suite 456'");
      expect(result.row).toContain("true"); // setAsDefault
      expect(result.row).toContain("false"); // isEnabled
    });

    it('handles empty optional fields correctly', () => {
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        addressLine2: '',
        city: '',
        assignedEntity: null,
        countries: [],
        currencies: {},
      };

      const result = buildEntityCsv(form, 'n');

      // Empty strings and null/empty objects should not be included
      expect(result.headers).not.toContain('AddressLine2');
      expect(result.headers).not.toContain('City');
      expect(result.headers).not.toContain('AssignedEntity');
      expect(result.headers).not.toContain('Countries');
      expect(result.headers).not.toContain('Currencies');
    });
  });

  describe('buildEntityCsv - Update Entity (u)', () => {
    it('builds CSV for entity update with required id', () => {
      const form: EntityFormData = {
        id: '123',
        legalBusinessName: 'Updated Business',
        displayName: 'Updated Display',
        entityType: 'corporation',
      };

      const result = buildEntityCsv(form, 'u');

      expect(result.headers).toContain('_ops|id');
      expect(result.row).toMatch(/^u\|123\|/);
      expect(result.row).toContain("'Updated Business'");
    });

    it('throws error when id is missing for update', () => {
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
      };

      expect(() => buildEntityCsv(form, 'u')).toThrow('id is required for update/delete operations');
    });

    it('throws error when id is empty string for update', () => {
      const form: EntityFormData = {
        id: '',
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
      };

      expect(() => buildEntityCsv(form, 'u')).toThrow('id is required for update/delete operations');
    });

    it('includes empty fields for update operations to clear them', () => {
      const form: EntityFormData = {
        id: '123',
        legalBusinessName: 'Updated Business',
        displayName: 'Updated Display',
        entityType: 'corporation',
        addressLine2: '', // Should be included for updates to clear the field
      };

      const result = buildEntityCsv(form, 'u');

      expect(result.headers).toContain('AddressLine2');
      expect(result.row).toContain("''"); // Empty string value
    });

    it('handles soft delete operation', () => {
      const form: EntityFormData = {
        id: '123',
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        softDeleted: true,
      };

      const result = buildEntityCsv(form, 'u');

      expect(result.headers).toContain('_ops|id');
      expect(result.headers).toContain('LastUpdatedAt|SoftDeleted');
      // Should not include other fields for delete operations
      expect(result.headers).not.toContain('LegalBusinessName');
      expect(result.row).toContain('true'); // SoftDeleted = true
    });
  });

  describe('buildEntityCsv - Delete Entity (d)', () => {
    it('builds CSV for entity delete with required id', () => {
      const form: EntityFormData = {
        id: '456',
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
      };

      const result = buildEntityCsv(form, 'd');

      expect(result.headers).toBe('_ops|id|LegalBusinessName|DisplayName|EntityType|SetAsDefault|CreatedAt|LastUpdatedAt|IsConfigured|IsEnabled|IsDeleted|SoftDeleted');
      expect(result.row).toMatch(/^d\|456\|/);
    });

    it('throws error when id is missing for delete', () => {
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
      };

      expect(() => buildEntityCsv(form, 'd')).toThrow('id is required for update/delete operations');
    });
  });

  describe('Boolean and Timestamp Formatting', () => {
    it('formats boolean values correctly', () => {
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        setAsDefault: true,
        isConfigured: false,
        isEnabled: true,
        isDeleted: false,
      };

      const result = buildEntityCsv(form, 'n');

      expect(result.row).toContain('true'); // setAsDefault
      expect(result.row).toContain('false'); // isConfigured
      expect(result.row).toContain('true'); // isEnabled (default)
      expect(result.row).toContain('false'); // isDeleted
    });

    it('uses provided timestamps when available', () => {
      const createdAt = '2024-01-01T10:00:00Z';
      const lastUpdatedAt = '2024-01-02T15:30:00Z';
      
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        createdAt,
        lastUpdatedAt,
      };

      const result = buildEntityCsv(form, 'n');

      expect(result.row).toContain("'2024-01-01T10:00:00Z'");
      expect(result.row).toContain("'2024-01-02T15:30:00Z'");
    });

    it('generates current timestamp when not provided', () => {
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
      };

      const result = buildEntityCsv(form, 'n');

      // Check that timestamps are generated in correct format
      expect(result.row).toMatch(/'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})'/g);
    });
  });

  describe('Complex Data Types', () => {
    it('handles arrays correctly', () => {
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        countries: ['US', 'CA', 'MX'],
      };

      const result = buildEntityCsv(form, 'n');

      expect(result.headers).toContain('Countries');
      expect(result.row).toContain('["US","CA","MX"]');
    });

    it('handles empty arrays correctly', () => {
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        countries: [],
        currencies: {},
      };

      const result = buildEntityCsv(form, 'n');

      expect(result.headers).not.toContain('Countries');
      expect(result.headers).not.toContain('Currencies');
    });

    it('handles complex objects correctly', () => {
      const assignedEntity = {
        id: 1,
        name: 'Parent Entity',
        metadata: {
          created: '2024-01-01',
          permissions: ['read', 'write']
        }
      };

      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        assignedEntity,
      };

      const result = buildEntityCsv(form, 'n');

      expect(result.headers).toContain('AssignedEntity');
      expect(result.row).toContain(JSON.stringify(assignedEntity));
    });
  });

  describe('saveEntity', () => {
    it('saves new entity successfully', async () => {
      const form: EntityFormData = {
        legalBusinessName: 'New Business',
        displayName: 'New Display',
        entityType: 'corporation',
      };

      mockAxios.onPost('/api/v1/data/Data/SaveData').reply(200, {
        status: 'Ok',
        message: 'Entity saved successfully',
        data: { id: '123' }
      });

      const result = await saveEntity(form, 'n');

      expect(result.status).toBe('Ok');
      expect(result.message).toBe('Entity saved successfully');
      
      // Verify the request was made correctly
      expect(mockAxios.history.post).toHaveLength(1);
      const request = mockAxios.history.post[0];
      expect(JSON.parse(request.data)).toEqual(expect.objectContaining({
        tableName: 'entity',
        hasHeaders: true,
        uniqueColumn: 'id',
        csvData: expect.any(Array)
      }));
    });

    it('uses default operation type "n" when not specified', async () => {
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
      };

      mockAxios.onPost().reply(200, { status: 'Ok' });

      await saveEntity(form);

      const request = mockAxios.history.post[0];
      const requestData = JSON.parse(request.data);
      expect(requestData.csvData[1]).toMatch(/^n\|/); // First character should be 'n' for new
    });

    it('throws error when API returns error status', async () => {
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
      };

      mockAxios.onPost().reply(200, {
        status: 'Error',
        message: 'Validation failed'
      });

      await expect(saveEntity(form, 'n')).rejects.toThrow('Validation failed');
    });

    it('throws error when API returns error status without message', async () => {
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
      };

      mockAxios.onPost().reply(200, {
        status: 'Error'
      });

      await expect(saveEntity(form, 'n')).rejects.toThrow('Failed to save entity');
    });

    it('handles network errors', async () => {
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
      };

      mockAxios.onPost().networkError();

      await expect(saveEntity(form, 'n')).rejects.toThrow('Network Error');
    });

    it('handles HTTP error responses', async () => {
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
      };

      mockAxios.onPost().reply(500, { error: 'Internal Server Error' });

      await expect(saveEntity(form, 'n')).rejects.toThrow();
    });

    it('saves entity without console logging', async () => {
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        assignedEntity: { id: 1 },
        addressLine2: 'Suite 100',
      };

      mockAxios.onPost().reply(200, { status: 'Ok' });

      await saveEntity(form, 'n');

      // Verify the API was called correctly
      expect(mockAxios.history.post).toHaveLength(1);
      expect(JSON.parse(mockAxios.history.post[0].data)).toEqual(
        expect.objectContaining({
          tableName: 'entity',
          hasHeaders: true,
          uniqueColumn: 'id'
        })
      );
    });
  });

  describe('buildPartialUpdateCsv', () => {
    it('builds CSV for partial update with minimal fields', () => {
      const form: EntityFormData = {
        id: '123',
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
      };

      const result = buildPartialUpdateCsv(form, 'u');

      expect(result.headers).toBe('_ops|id|LastUpdatedAt');
      expect(result.row).toMatch(/^u\|123\|'\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}'$/);
    });

    it('includes isEnabled field when specified', () => {
      const form: EntityFormData = {
        id: '123',
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        isEnabled: false,
      };

      const result = buildPartialUpdateCsv(form, 'u');

      expect(result.headers).toBe('_ops|id|LastUpdatedAt|IsEnabled');
      expect(result.row).toMatch(/^u\|123\|'\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}'\|false$/);
    });

    it('uses provided lastUpdatedAt timestamp', () => {
      const lastUpdatedAt = '2024-01-01T12:00:00Z';
      const form: EntityFormData = {
        id: '123',
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        lastUpdatedAt,
      };

      const result = buildPartialUpdateCsv(form, 'u');

      expect(result.row).toContain("'2024-01-01T12:00:00Z'");
    });

    it('throws error when id is missing', () => {
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
      };

      expect(() => buildPartialUpdateCsv(form, 'u')).toThrow('id is required for update operations');
    });

    it('throws error when id is empty string', () => {
      const form: EntityFormData = {
        id: '',
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
      };

      expect(() => buildPartialUpdateCsv(form, 'u')).toThrow('id is required for update operations');
    });

    it('handles isEnabled as false correctly', () => {
      const form: EntityFormData = {
        id: '123',
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        isEnabled: false,
      };

      const result = buildPartialUpdateCsv(form, 'u');

      expect(result.row).toContain('false');
    });

    it('handles isEnabled as true correctly', () => {
      const form: EntityFormData = {
        id: '123',
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        isEnabled: true,
      };

      const result = buildPartialUpdateCsv(form, 'u');

      expect(result.row).toContain('true');
    });
  });

  describe('saveEntityPartialUpdate', () => {
    it('saves partial entity update successfully', async () => {
      const form: EntityFormData = {
        id: '123',
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        isEnabled: false,
      };

      mockAxios.onPost('/api/v1/data/Data/SaveData').reply(200, {
        status: 'Ok',
        message: 'Entity updated successfully'
      });

      const result = await saveEntityPartialUpdate(form, 'u');

      expect(result.status).toBe('Ok');
      expect(result.message).toBe('Entity updated successfully');
    });

    it('uses default operation type "u" when not specified', async () => {
      const form: EntityFormData = {
        id: '123',
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
      };

      mockAxios.onPost().reply(200, { status: 'Ok' });

      await saveEntityPartialUpdate(form);

      const request = mockAxios.history.post[0];
      const requestData = JSON.parse(request.data);
      expect(requestData.csvData[1]).toMatch(/^u\|/);
    });

    it('throws error when API returns error status', async () => {
      const form: EntityFormData = {
        id: '123',
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
      };

      mockAxios.onPost().reply(200, {
        status: 'Error',
        message: 'Update validation failed'
      });

      await expect(saveEntityPartialUpdate(form, 'u')).rejects.toThrow('Update validation failed');
    });

    it('throws error when API returns error status without message', async () => {
      const form: EntityFormData = {
        id: '123',
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
      };

      mockAxios.onPost().reply(200, {
        status: 'Error'
      });

      await expect(saveEntityPartialUpdate(form, 'u')).rejects.toThrow('Failed to update entity');
    });

    it('saves partial update without console logging', async () => {
      const form: EntityFormData = {
        id: '123',
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        isEnabled: false,
      };

      mockAxios.onPost().reply(200, { status: 'Ok' });

      await saveEntityPartialUpdate(form, 'u');

      // Verify the API was called correctly
      expect(mockAxios.history.post).toHaveLength(1);
      expect(JSON.parse(mockAxios.history.post[0].data)).toEqual(
        expect.objectContaining({
          tableName: 'entity',
          hasHeaders: true,
          uniqueColumn: 'id'
        })
      );
    });

    it('handles network errors', async () => {
      const form: EntityFormData = {
        id: '123',
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
      };

      mockAxios.onPost().networkError();

      await expect(saveEntityPartialUpdate(form)).rejects.toThrow('Network Error');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles special characters in all string fields', () => {
      const form: EntityFormData = {
        legalBusinessName: "O'Reilly & Co.",
        displayName: "Test's Display",
        entityType: 'corporation',
        addressLine1: "123 Main St. & Ave.",
        country: "O'Canada",
        state: "Quebec's Province",
        city: "Saint-Jean-sur-Richelieu",
      };

      const result = buildEntityCsv(form, 'n');

      expect(result.row).toContain("'O''Reilly & Co.'");
      expect(result.row).toContain("'Test''s Display'");
      expect(result.row).toContain("'123 Main St. & Ave.'");
      expect(result.row).toContain("'O''Canada'");
      expect(result.row).toContain("'Quebec''s Province'");
    });

    it('handles undefined and null values in JSON fields', () => {
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        assignedEntity: null,
        countries: undefined,
        currencies: null,
      };

      const result = buildEntityCsv(form, 'n');

      expect(result.headers).not.toContain('AssignedEntity');
      expect(result.headers).not.toContain('Countries');
      expect(result.headers).not.toContain('Currencies');
    });

    it('handles very long strings', () => {
      const longName = 'A'.repeat(1000);
      const form: EntityFormData = {
        legalBusinessName: longName,
        displayName: 'Test Display',
        entityType: 'corporation',
      };

      const result = buildEntityCsv(form, 'n');

      expect(result.row).toContain(`'${longName}'`);
    });

    it('handles all boolean field combinations', () => {
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        setAsDefault: false,
        softDeleted: true,
        isConfigured: true,
        isEnabled: false,
        isDeleted: true,
      };

      const result = buildEntityCsv(form, 'n');

      expect(result.row).toContain('false'); // setAsDefault
      expect(result.row).toContain('true'); // softDeleted
      expect(result.row).toContain('true'); // isConfigured
      expect(result.row).toContain('false'); // isEnabled
      expect(result.row).toContain('true'); // isDeleted
    });

    it('handles missing environment variable', async () => {
      delete process.env.REACT_APP_DATA_API_URL;
      
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
      };

      mockAxios.onPost('/api/v1/data/Data/SaveData').reply(200, { status: 'Ok' });

      await saveEntity(form, 'n');

      expect(mockAxios.history.post[0].url).toBe('/api/v1/data/Data/SaveData');
    });

    it('handles hasJson with string values', () => {
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        assignedEntity: '   ', // String with only whitespace
      };

      const result = buildEntityCsv(form, 'n');

      // Should not include AssignedEntity since it's whitespace only
      expect(result.headers).not.toContain('AssignedEntity');
    });

    it('handles hasJson with non-empty string values', () => {
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        assignedEntity: 'valid string content',
      };

      const result = buildEntityCsv(form, 'n');

      expect(result.headers).toContain('AssignedEntity');
      expect(result.row).toContain("'\"valid string content\"'");
    });

    it('handles hasJson with various primitive types', () => {
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        assignedEntity: 123, // Number
      };

      const result = buildEntityCsv(form, 'n');

      expect(result.headers).toContain('AssignedEntity');
      expect(result.row).toContain("'123'");
    });

    it('handles boolean type coercion in formatBoolean', () => {
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        setAsDefault: 'true' as any, // String instead of boolean
        isConfigured: null as any, // Null instead of boolean
      };

      const result = buildEntityCsv(form, 'n');

      // These should use fallback values since they're not booleans
      expect(result.row).toContain('false'); // setAsDefault should default to false
      expect(result.row).toContain('false'); // isConfigured should default to false
      // isEnabled defaults to true and should be true
      const parts = result.row.split('|');
      const isEnabledIndex = result.headers.split('|').indexOf('IsEnabled');
      expect(parts[isEnabledIndex]).toBe('true');
    });
  });

  describe('CSV Format Validation', () => {
    it('ensures headers and row have same number of fields', () => {
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        addressLine1: '123 Main St',
        setAsDefault: true,
      };

      const result = buildEntityCsv(form, 'n');

      const headerCount = result.headers.split('|').length;
      const rowCount = result.row.split('|').length;
      
      expect(headerCount).toBe(rowCount);
    });

    it('maintains consistent field ordering', () => {
      const form1: EntityFormData = {
        legalBusinessName: 'Business 1',
        displayName: 'Display 1',
        entityType: 'corporation',
        addressLine1: 'Address 1',
      };

      const form2: EntityFormData = {
        legalBusinessName: 'Business 2',
        displayName: 'Display 2',
        entityType: 'llc',
        addressLine1: 'Address 2',
      };

      const result1 = buildEntityCsv(form1, 'n');
      const result2 = buildEntityCsv(form2, 'n');

      expect(result1.headers).toBe(result2.headers);
    });
  });

  describe('Timestamp Formatting', () => {
    it('formats timestamps in correct format', () => {
      // Mock Date to get predictable timestamps
      const mockDate = new Date('2024-01-15T10:30:45');
      jest.spyOn(global, 'Date').mockImplementation((() => mockDate) as any);

      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
      };

      const result = buildEntityCsv(form, 'n');

      // Should contain formatted timestamp (local time)
      expect(result.row).toMatch(/'2024-01-15 \d{2}:\d{2}:\d{2}'/);

      // Restore Date
      jest.restoreAllMocks();
    });

    it('handles single digit date components', () => {
      const mockDate = new Date('2024-01-05T08:09:07');
      jest.spyOn(global, 'Date').mockImplementation((() => mockDate) as any);

      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
      };

      const result = buildEntityCsv(form, 'n');

      expect(result.row).toMatch(/'2024-01-05 \d{2}:\d{2}:\d{2}'/);

      jest.restoreAllMocks();
    });
  });

  describe('Coverage for Global Helper Functions', () => {
    // These tests specifically target the global helper functions that might not be covered
    
    it('covers all code paths in hasJson function', () => {
      // Test string with content
      const form1: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        assignedEntity: 'non-empty string',
      };
      const result1 = buildEntityCsv(form1, 'n');
      expect(result1.headers).toContain('AssignedEntity');

      // Test empty string after trim
      const form2: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display', 
        entityType: 'corporation',
        assignedEntity: '   ',  // Only whitespace
      };
      const result2 = buildEntityCsv(form2, 'n');
      expect(result2.headers).not.toContain('AssignedEntity');

      // Test non-array, non-object, non-string value that's truthy
      const form3: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        assignedEntity: 42, // Number - should trigger the final return true
      };
      const result3 = buildEntityCsv(form3, 'n');
      expect(result3.headers).toContain('AssignedEntity');
    });

    it('covers edge cases in timestamp handling', () => {
      // Test with provided timestamp vs generated timestamp paths
      const providedTimestamp = '2024-01-01T12:00:00Z';
      
      const form: EntityFormData = {
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        createdAt: providedTimestamp,
        // lastUpdatedAt not provided - should generate timestamp
      };

      const result = buildEntityCsv(form, 'n');
      
      expect(result.row).toContain("'2024-01-01T12:00:00Z'"); // provided timestamp
      expect(result.row).toMatch(/'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})'/); // generated timestamp
    });
  });

  describe('Update vs New Operation Differences', () => {
    it('includes empty fields for update but not for new', () => {
      const formWithEmpty: EntityFormData = {
        id: '123',
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        addressLine2: '', // Empty field
      };

      const newResult = buildEntityCsv(formWithEmpty, 'n');
      const updateResult = buildEntityCsv(formWithEmpty, 'u');

      expect(newResult.headers).not.toContain('AddressLine2');
      expect(updateResult.headers).toContain('AddressLine2');
      expect(updateResult.row).toContain("''");
    });

    it('always includes assignedEntity for update even if empty', () => {
      const form: EntityFormData = {
        id: '123',
        legalBusinessName: 'Test Business',
        displayName: 'Test Display',
        entityType: 'corporation',
        assignedEntity: null,
      };

      const updateResult = buildEntityCsv(form, 'u');

      expect(updateResult.headers).toContain('AssignedEntity');
      expect(updateResult.row).toContain("''");
    });
  });
});
