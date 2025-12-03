import reducer, { EntitySetupState, EntitySetupFormData } from '../../../src/store/Reducers/entitySetupReducer';
import {
  setFormData,
  updateField,
  resetForm,
  setLoading,
  setError,
  setSuccess,
  setCountries,
  setCurrencies,
  setEntityTypes,
  setStates,
  setCountryStateMap,
  setFileUpload,
  setEditMode,
  setOriginalFormData,
  setFormModified,
  setModules,
} from '../../../src/store/Actions/entitySetupActions';

describe('entitySetupReducer', () => {
  const initial: EntitySetupState = reducer(undefined, { type: '@@INIT' } as any);

  describe('Basic Actions', () => {
    it('handles setFormData and updateField', () => {
      const next = reducer(initial, setFormData({ ...initial.formData, legalBusinessName: 'A' }));
      expect(next.formData.legalBusinessName).toBe('A');
      const updated = reducer(next, updateField({ field: 'displayName', value: 'B' }));
      expect(updated.formData.displayName).toBe('B');
    });

    it('resets form and clears flags', () => {
      const withFlags = reducer(initial, setError('x'));
      const reset = reducer(withFlags, resetForm());
      expect(reset.formData.legalBusinessName).toBe('');
      expect(reset.error).toBeNull();
      expect(reset.success).toBeNull();
    });

    it('sets loading, error, success', () => {
      let s = reducer(initial, setLoading(true));
      expect(s.loading).toBe(true);
      s = reducer(s, setError('err'));
      expect(s.error).toBe('err');
      s = reducer(s, setSuccess('ok'));
      expect(s.success).toBe('ok');
    });

    it('sets lists and file upload', () => {
      let s = reducer(initial, setCountries(['US']));
      expect(s.countries).toEqual(['US']);
      s = reducer(s, setEntityTypes(['Corp']));
      expect(s.entityTypes).toEqual(['Corp']);
      s = reducer(s, setStates(['CA']));
      expect(s.states).toEqual(['CA']);
      const file = new File(['x'], 'a.png', { type: 'image/png' });
      s = reducer(s, setFileUpload(file));
      expect(s.formData.entityLogo).toBe(file);
    });
  });

  describe('Form Data Management', () => {
    it('handles setFormData in create mode', () => {
      const formData: EntitySetupFormData = {
        legalBusinessName: 'Test Company',
        displayName: 'Test Display',
        entityType: 'Planning Entity',
        assignedEntity: [],
        addressLine1: '123 Main St',
        addressLine2: '',
        country: 'US',
        state: 'CA',
        city: 'Los Angeles',
        pinZipCode: '90210',
        entityLogo: null,
        setAsDefault: false,
        addAnother: false,
      };

      const state = reducer(initial, setFormData(formData));
      expect(state.formData).toEqual(formData);
      expect(state.isFormModified).toBe(true); // Should be true because form has values
    });

    it('handles setFormData in edit mode with original data', () => {
      const originalData: EntitySetupFormData = {
        legalBusinessName: 'Original Company',
        displayName: 'Original Display',
        entityType: 'Planning Entity',
        assignedEntity: [],
        addressLine1: '123 Main St',
        addressLine2: '',
        country: 'US',
        state: 'CA',
        city: 'Los Angeles',
        pinZipCode: '90210',
        entityLogo: null,
        setAsDefault: false,
        addAnother: false,
      };

      const modifiedData: EntitySetupFormData = {
        ...originalData,
        legalBusinessName: 'Modified Company',
      };

      // Set up edit mode with original data
      let state = reducer(initial, setEditMode(true));
      state = reducer(state, setOriginalFormData(originalData));
      
      // Set modified form data
      state = reducer(state, setFormData(modifiedData));
      
      expect(state.formData).toEqual(modifiedData);
      expect(state.isFormModified).toBe(true);
    });

    it('handles setFormData in edit mode with identical data', () => {
      const originalData: EntitySetupFormData = {
        legalBusinessName: 'Original Company',
        displayName: 'Original Display',
        entityType: 'Planning Entity',
        assignedEntity: [],
        addressLine1: '123 Main St',
        addressLine2: '',
        country: 'US',
        state: 'CA',
        city: 'Los Angeles',
        pinZipCode: '90210',
        entityLogo: null,
        setAsDefault: false,
        addAnother: false,
      };

      // Set up edit mode with original data
      let state = reducer(initial, setEditMode(true));
      state = reducer(state, setOriginalFormData(originalData));
      
      // Set identical form data
      state = reducer(state, setFormData(originalData));
      
      expect(state.formData).toEqual(originalData);
      expect(state.isFormModified).toBe(false);
    });
  });

  describe('Field Updates', () => {
    it('handles updateField in create mode', () => {
      const state = reducer(initial, updateField({ field: 'legalBusinessName', value: 'Test Company' }));
      expect(state.formData.legalBusinessName).toBe('Test Company');
      expect(state.isFormModified).toBe(true);
    });

    it('handles updateField in edit mode with changes', () => {
      const originalData: EntitySetupFormData = {
        legalBusinessName: 'Original Company',
        displayName: 'Original Display',
        entityType: 'Planning Entity',
        assignedEntity: [],
        addressLine1: '123 Main St',
        addressLine2: '',
        country: 'US',
        state: 'CA',
        city: 'Los Angeles',
        pinZipCode: '90210',
        entityLogo: null,
        setAsDefault: false,
        addAnother: false,
      };

      // Set up edit mode
      let state = reducer(initial, setEditMode(true));
      state = reducer(state, setOriginalFormData(originalData));
      state = reducer(state, setFormData(originalData));
      
      // Update a field
      state = reducer(state, updateField({ field: 'legalBusinessName', value: 'Modified Company' }));
      
      expect(state.formData.legalBusinessName).toBe('Modified Company');
      expect(state.isFormModified).toBe(true);
    });

    it('handles updateField with array values', () => {
      const state = reducer(initial, updateField({ field: 'assignedEntity', value: ['entity1', 'entity2'] }));
      expect(state.formData.assignedEntity).toEqual(['entity1', 'entity2']);
      expect(state.isFormModified).toBe(true);
    });

    it('handles updateField with boolean values', () => {
      const state = reducer(initial, updateField({ field: 'setAsDefault', value: true }));
      expect(state.formData.setAsDefault).toBe(true);
      expect(state.isFormModified).toBe(true);
    });
  });

  describe('Form Reset', () => {
    it('resets form in create mode', () => {
      const stateWithData = reducer(initial, updateField({ field: 'legalBusinessName', value: 'Test Company' }));
      const resetState = reducer(stateWithData, resetForm());
      
      expect(resetState.formData.legalBusinessName).toBe('');
      expect(resetState.isFormModified).toBe(false);
      expect(resetState.error).toBeNull();
      expect(resetState.success).toBeNull();
    });

    it('resets form in edit mode to original data', () => {
      const originalData: EntitySetupFormData = {
        legalBusinessName: 'Original Company',
        displayName: 'Original Display',
        entityType: 'Planning Entity',
        assignedEntity: [],
        addressLine1: '123 Main St',
        addressLine2: '',
        country: 'US',
        state: 'CA',
        city: 'Los Angeles',
        pinZipCode: '90210',
        entityLogo: null,
        setAsDefault: false,
        addAnother: false,
      };

      // Set up edit mode with modifications
      let state = reducer(initial, setEditMode(true));
      state = reducer(state, setOriginalFormData(originalData));
      state = reducer(state, setFormData(originalData));
      state = reducer(state, updateField({ field: 'legalBusinessName', value: 'Modified Company' }));
      
      // Reset form
      state = reducer(state, resetForm());
      
      expect(state.formData).toEqual(originalData);
      expect(state.isFormModified).toBe(false);
    });

    it('sets proper default values for new entities on reset', () => {
      const state = reducer(initial, resetForm());
      
      expect(state.formData.isDeleted).toBe(false);
      expect(state.formData.isConfigured).toBe(false);
      expect(state.formData.isEnabled).toBe(true);
      expect(state.formData.softDeleted).toBe(false);
      expect(state.formData.createdAt).toBeUndefined();
      expect(state.formData.lastUpdatedAt).toBeUndefined();
    });
  });

  describe('File Upload', () => {
    it('handles setFileUpload in create mode', () => {
      const file = new File(['content'], 'test.png', { type: 'image/png' });
      const state = reducer(initial, setFileUpload(file));
      
      expect(state.formData.entityLogo).toBe(file);
      expect(state.isFormModified).toBe(true);
    });

    it('handles setFileUpload in edit mode', () => {
      const originalData: EntitySetupFormData = {
        legalBusinessName: 'Original Company',
        displayName: 'Original Display',
        entityType: 'Planning Entity',
        assignedEntity: [],
        addressLine1: '123 Main St',
        addressLine2: '',
        country: 'US',
        state: 'CA',
        city: 'Los Angeles',
        pinZipCode: '90210',
        entityLogo: null,
        setAsDefault: false,
        addAnother: false,
      };

      const file = new File(['content'], 'test.png', { type: 'image/png' });

      // Set up edit mode
      let state = reducer(initial, setEditMode(true));
      state = reducer(state, setOriginalFormData(originalData));
      state = reducer(state, setFormData(originalData));
      
      // Upload file
      state = reducer(state, setFileUpload(file));
      
      expect(state.formData.entityLogo).toBe(file);
      expect(state.isFormModified).toBe(true);
    });
  });

  describe('Edit Mode Management', () => {
    it('handles setEditMode true', () => {
      const state = reducer(initial, setEditMode(true));
      expect(state.isEditMode).toBe(true);
      expect(state.isFormModified).toBe(false);
    });

    it('handles setEditMode false', () => {
      const originalData: EntitySetupFormData = {
        legalBusinessName: 'Original Company',
        displayName: 'Original Display',
        entityType: 'Planning Entity',
        assignedEntity: [],
        addressLine1: '123 Main St',
        addressLine2: '',
        country: 'US',
        state: 'CA',
        city: 'Los Angeles',
        pinZipCode: '90210',
        entityLogo: null,
        setAsDefault: false,
        addAnother: false,
      };

      // Set up edit mode with original data
      let state = reducer(initial, setEditMode(true));
      state = reducer(state, setOriginalFormData(originalData));
      
      // Exit edit mode
      state = reducer(state, setEditMode(false));
      
      expect(state.isEditMode).toBe(false);
      expect(state.originalFormData).toBeNull();
    });

    it('handles setOriginalFormData', () => {
      const originalData: EntitySetupFormData = {
        legalBusinessName: 'Original Company',
        displayName: 'Original Display',
        entityType: 'Planning Entity',
        assignedEntity: [],
        addressLine1: '123 Main St',
        addressLine2: '',
        country: 'US',
        state: 'CA',
        city: 'Los Angeles',
        pinZipCode: '90210',
        entityLogo: null,
        setAsDefault: false,
        addAnother: false,
      };

      const state = reducer(initial, setOriginalFormData(originalData));
      expect(state.originalFormData).toEqual(originalData);
      expect(state.isFormModified).toBe(false);
    });

    it('handles setFormModified', () => {
      const state = reducer(initial, setFormModified(true));
      expect(state.isFormModified).toBe(true);
      
      const state2 = reducer(state, setFormModified(false));
      expect(state2.isFormModified).toBe(false);
    });
  });

  describe('Data Lists', () => {
    it('handles setCountries', () => {
      const countries = ['United States', 'Canada', 'Mexico'];
      const state = reducer(initial, setCountries(countries));
      expect(state.countries).toEqual(countries);
    });

    it('handles setCurrencies', () => {
      const currencies = [
        { id: '1', currencyName: 'USD' },
        { id: '2', currencyName: 'EUR' }
      ];
      const state = reducer(initial, setCurrencies(currencies));
      expect(state.currencies).toEqual(currencies);
    });

    it('handles setEntityTypes', () => {
      const entityTypes = ['Planning Entity', 'Rollup Entity'];
      const state = reducer(initial, setEntityTypes(entityTypes));
      expect(state.entityTypes).toEqual(entityTypes);
    });

    it('handles setStates', () => {
      const states = ['California', 'New York', 'Texas'];
      const state = reducer(initial, setStates(states));
      expect(state.states).toEqual(states);
    });

    it('handles setCountryStateMap', () => {
      const countryStateMap = {
        'United States': ['California', 'New York'],
        'Canada': ['Ontario', 'Quebec']
      };
      const state = reducer(initial, setCountryStateMap(countryStateMap));
      expect(state.countryStateMap).toEqual(countryStateMap);
    });

    it('handles setModules', () => {
      const modules = [
        { id: '1', name: 'Module 1', description: 'Description 1', isEnabled: true, isConfigured: false },
        { id: '2', name: 'Module 2', description: 'Description 2', isEnabled: false, isConfigured: true }
      ];
      const state = reducer(initial, setModules(modules));
      expect(state.modules).toEqual(modules);
    });
  });

  describe('Helper Functions', () => {
    it('hasFormValues returns true for non-empty string', () => {
      const formData: EntitySetupFormData = {
        ...initial.formData,
        legalBusinessName: 'Test Company'
      };
      const state = reducer(initial, setFormData(formData));
      expect(state.isFormModified).toBe(true);
    });

    it('hasFormValues returns true for non-empty array', () => {
      const formData: EntitySetupFormData = {
        ...initial.formData,
        assignedEntity: ['entity1', 'entity2']
      };
      const state = reducer(initial, setFormData(formData));
      expect(state.isFormModified).toBe(true);
    });

    it('hasFormValues returns true for true boolean', () => {
      const formData: EntitySetupFormData = {
        ...initial.formData,
        setAsDefault: true
      };
      const state = reducer(initial, setFormData(formData));
      expect(state.isFormModified).toBe(true);
    });

    it('hasFormValues returns true for file upload', () => {
      const file = new File(['content'], 'test.png', { type: 'image/png' });
      const state = reducer(initial, setFileUpload(file));
      expect(state.isFormModified).toBe(true);
    });

    it('hasFormValues returns false for empty form', () => {
      // Create a truly empty form data object
      const emptyFormData: EntitySetupFormData = {
        legalBusinessName: '',
        displayName: '',
        entityType: '',
        assignedEntity: [],
        addressLine1: '',
        addressLine2: '',
        country: '',
        state: '',
        city: '',
        pinZipCode: '',
        entityLogo: null,
        setAsDefault: false,
        addAnother: false,
      };
      const state = reducer(initial, setFormData(emptyFormData));
      expect(state.isFormModified).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('handles unknown action type', () => {
      const state = reducer(initial, { type: 'UNKNOWN_ACTION' } as any);
      expect(state).toEqual(initial);
    });

    it('handles updateField with complex object', () => {
      const complexObject = { nested: { value: 'test' } };
      const state = reducer(initial, updateField({ field: 'someField', value: complexObject }));
      expect((state.formData as any).someField).toEqual(complexObject);
    });

    it('handles resetForm with error and success states', () => {
      let state = reducer(initial, setError('Test error'));
      state = reducer(state, setSuccess('Test success'));
      state = reducer(state, resetForm());
      
      expect(state.error).toBeNull();
      expect(state.success).toBeNull();
    });
  });
});


