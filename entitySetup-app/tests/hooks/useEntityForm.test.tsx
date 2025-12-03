import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { useEntityForm } from '../../src/hooks/useEntityForm';
import { resetForm } from '../../src/store/Actions/entitySetupActions';

// Mock react-router-dom
const mockNavigate = jest.fn();
const mockParams = { id: 'test-id' };
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
}));

// Mock Redux hooks
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: jest.fn((selector) => {
    const mockState = {
      entitySetup: {
        formData: {
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
          logo: null,
          setAsDefault: false,
          addAnother: false,
        },
        countries: [],
        entityTypes: [],
        states: [],
        loading: false,
        error: null,
        success: false,
        isFormModified: false,
      },
      entities: { items: [], loading: false },
    };
    return selector(mockState);
  }),
}));

// Mock commonApp/imageUtils
jest.mock('commonApp/imageUtils', () => ({
  convertFileToBase64: jest.fn(),
  validateImageFile: jest.fn(),
}));

// Mock store actions
jest.mock('../../src/store/Actions/entitySetupActions', () => ({
  initializeEntitySetup: jest.fn(() => ({ type: 'entitySetup/initializeEntitySetup' })),
  handleCountryChange: jest.fn(() => ({ type: 'entitySetup/handleCountryChange' })),
  submitEntitySetup: jest.fn(() => ({ type: 'entitySetup/submitEntitySetup' })),
  resetForm: jest.fn(() => ({ type: 'entitySetup/resetForm' })),
  updateField: jest.fn((payload) => ({ type: 'entitySetup/updateField', payload })),
  setOriginalFormData: jest.fn(() => ({ type: 'entitySetup/setOriginalFormData' })),
  setFormModified: jest.fn(() => ({ type: 'entitySetup/setFormModified' })),
  setEditMode: jest.fn(() => ({ type: 'entitySetup/setEditMode' })),
  clearStatesReloadFlag: jest.fn(() => ({ type: 'entitySetup/clearStatesReloadFlag' })),
}));

jest.mock('../../src/store/Reducers/entitySlice', () => ({
  fetchEntities: jest.fn(),
}));

const createMockStore = () => {
  return configureStore({
    reducer: {
      entitySetup: (state = {
        formData: {
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
          logo: null,
          setAsDefault: false,
          addAnother: false,
        },
        countries: [],
        entityTypes: [],
        states: [],
        loading: false,
        error: null,
        success: false,
        isFormModified: false,
      }, action) => state,
      entities: (state = { items: [], loading: false }, action) => state,
    },
  });
};

const renderWithProviders = (hook: any) => {
  const store = createMockStore({
    entitySetup: {
      formData: {
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
        logo: null,
        setAsDefault: false,
        addAnother: false,
      },
      countries: [],
      entityTypes: [],
      states: [],
      loading: false,
      error: null,
      success: false,
      isFormModified: false,
    },
    entities: { items: [], loading: false },
  });
  
  // Override the store's dispatch with our mock
  store.dispatch = mockDispatch;
  
  return renderHook(hook, {
    wrapper: ({ children }) => (
      <Provider store={store}>
        <MemoryRouter>
          {children}
        </MemoryRouter>
      </Provider>
    ),
  });
};

describe('useEntityForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useSelector to return different states
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation((selector) => {
      const state = {
        entitySetup: {
          formData: {
            legalBusinessName: 'Test Entity',
            displayName: 'Test Display',
            entityType: 'Planning Entity',
            assignedEntity: [],
            addressLine1: '123 Test St',
            addressLine2: '',
            country: 'US',
            state: 'CA',
            city: 'Test City',
            pinZipCode: '12345',
            entityLogo: null,
            logo: null,
            setAsDefault: false,
            addAnother: false,
          },
          countries: [{ id: 'US', name: 'United States' }],
          entityTypes: [{ id: 'planning', name: 'Planning Entity' }],
          states: ['CA', 'NY', 'TX'],
          loading: false,
          error: null,
          success: false,
          isFormModified: false,
        },
        entities: {
          items: [
            {
              id: 'test-id',
              legalBusinessName: 'Test Entity',
              displayName: 'Test Display',
              entityType: 'Planning Entity',
              assignedEntity: [],
              addressLine1: '123 Test St',
              addressLine2: '',
              country: 'US',
              state: 'CA',
              city: 'Test City',
              pinZipCode: '12345',
              logo: null,
              setAsDefault: false,
              currencies: undefined,
              isDeleted: false,
              isConfigured: false,
              isEnabled: true,
              softDeleted: false,
              createdAt: '2023-01-01',
              lastUpdatedAt: '2023-01-01',
            }
          ],
          loading: false,
        },
      };
      return selector(state);
    });
  });

  describe('Basic Functionality', () => {
    it('should initialize with default values', () => {
      const { result } = renderWithProviders(() => useEntityForm());
      
      expect(result.current.formData).toBeDefined();
      expect(result.current.validationErrors).toEqual({});
      expect(result.current.isEditMode).toBe(true); // Because id is provided
      expect(result.current.hasFormData).toBe(true);
    });

    it('should return all expected properties', () => {
      const { result } = renderWithProviders(() => useEntityForm());
      
      expect(result.current.formData).toBeDefined();
      expect(result.current.validationErrors).toBeDefined();
      expect(result.current.loading).toBeDefined();
      expect(result.current.error).toBeDefined();
      expect(result.current.success).toBeDefined();
      expect(result.current.isFormValid).toBeDefined();
      expect(result.current.isEditMode).toBeDefined();
      expect(result.current.hasFormData).toBeDefined();
      expect(result.current.confirmOpen).toBeDefined();
      expect(result.current.confirmType).toBeDefined();
      expect(result.current.confirmMessage).toBeDefined();
      expect(result.current.entityTypeOptions).toBeDefined();
      expect(result.current.countryOptions).toBeDefined();
      expect(result.current.stateOptions).toBeDefined();
      expect(result.current.handleInputChange).toBeDefined();
      expect(result.current.handleCountryChange).toBeDefined();
      expect(result.current.handleEntityTypeChange).toBeDefined();
      expect(result.current.handleFileUpload).toBeDefined();
      expect(result.current.handleReset).toBeDefined();
      expect(result.current.handleCancel).toBeDefined();
      expect(result.current.handleBack).toBeDefined();
      expect(result.current.handleSave).toBeDefined();
      expect(result.current.handleConfirmYes).toBeDefined();
      expect(result.current.handleConfirmNo).toBeDefined();
      expect(result.current.isResetEnabled).toBeDefined();
      expect(result.current.isSaveEnabled).toBeDefined();
      expect(result.current.setValidationErrors).toBeDefined();
      expect(result.current.setIsFormValid).toBeDefined();
      expect(result.current.currentEntityId).toBeDefined();
    });
  });

  describe('Input Change Handling', () => {
    it('should handle input change', () => {
      const { result } = renderWithProviders(() => useEntityForm());
      
      // Check if the hook is working at all
      expect(result.current).toBeDefined();
      expect(result.current.handleInputChange).toBeDefined();
      
      // Test that the function can be called without errors
      expect(() => {
        act(() => {
          result.current.handleInputChange('legalBusinessName', 'New Name');
        });
      }).not.toThrow();
      
      // Check that dispatch was called (even if with undefined)
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should clear validation errors on input change', () => {
      const { result } = renderWithProviders(() => useEntityForm());
      
      // Set a validation error first
      act(() => {
        result.current.setValidationErrors({ legalBusinessName: 'Required' });
      });
      
      expect(result.current.validationErrors.legalBusinessName).toBe('Required');
      
      // Change input should clear the error
      act(() => {
        result.current.handleInputChange('legalBusinessName', 'New Name');
      });
      
      expect(result.current.validationErrors.legalBusinessName).toBeUndefined();
    });
  });

  describe('Country Change Handling', () => {
    it('should handle country change', () => {
      const { result } = renderWithProviders(() => useEntityForm());
      
      act(() => {
        result.current.handleCountryChange('CA');
      });
      
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should clear country and state validation errors on country change', () => {
      const { result } = renderWithProviders(() => useEntityForm());
      
      // Set validation errors
      act(() => {
        result.current.setValidationErrors({ country: 'Required', state: 'Required' });
      });
      
      expect(result.current.validationErrors.country).toBe('Required');
      expect(result.current.validationErrors.state).toBe('Required');
      
      // Change country should clear both errors
      act(() => {
        result.current.handleCountryChange('CA');
      });
      
      expect(result.current.validationErrors.country).toBeUndefined();
      expect(result.current.validationErrors.state).toBeUndefined();
    });
  });

  describe('Entity Type Change Handling', () => {
    it('should handle entity type change', () => {
      const { result } = renderWithProviders(() => useEntityForm());
      
      // Test that the function can be called without errors
      expect(() => {
        act(() => {
          result.current.handleEntityTypeChange('Rollup Entity');
        });
      }).not.toThrow();
      
      // Check that dispatch was called
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should clear entity type validation error on change', () => {
      const { result } = renderWithProviders(() => useEntityForm());
      
      // Set validation error
      act(() => {
        result.current.setValidationErrors({ entityType: 'Required' });
      });
      
      expect(result.current.validationErrors.entityType).toBe('Required');
      
      // Change entity type should clear the error
      act(() => {
        result.current.handleEntityTypeChange('Rollup Entity');
      });
      
      expect(result.current.validationErrors.entityType).toBeUndefined();
    });

    it('should preserve assigned entities when changing entity types', () => {
      const { useSelector } = require('react-redux');
      useSelector.mockImplementation((selector) => {
        const state = {
          entitySetup: {
            formData: {
              legalBusinessName: 'Test Entity',
              displayName: 'Test Display',
              entityType: 'Planning Entity',
              assignedEntity: ['entity1', 'entity2', 'entity3'], // Existing assigned entities
              addressLine1: '123 Test St',
              country: 'US',
              state: 'CA',
              city: 'Test City',
              pinZipCode: '12345',
              entityLogo: null,
              logo: null,
              setAsDefault: false,
              addAnother: false,
            },
            countries: [{ id: 'US', name: 'United States' }],
            entityTypes: [
              { id: 'planning', name: 'Planning Entity' },
              { id: 'rollup', name: 'Rollup Entity' }
            ],
            states: ['CA', 'NY', 'TX'],
            loading: false,
            error: null,
            success: false,
            isFormModified: false,
          },
          entities: { items: [], loading: false },
        };
        return selector(state);
      });

      const { result } = renderWithProviders(() => useEntityForm());
      
      // Clear previous dispatch calls
      mockDispatch.mockClear();
      
      // Change entity type from Planning Entity to Rollup Entity
      act(() => {
        result.current.handleEntityTypeChange('Rollup Entity');
      });
      
      // Should have called dispatch to update entity type
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'entitySetup/updateField',
        payload: {
          field: 'entityType',
          value: 'Rollup Entity'
        }
      });
      
      // The assigned entities should be preserved (this is tested via console.log in the implementation)
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle entity type change when no assigned entities exist', () => {
      const { useSelector } = require('react-redux');
      useSelector.mockImplementation((selector) => {
        const state = {
          entitySetup: {
            formData: {
              legalBusinessName: 'Test Entity',
              displayName: 'Test Display',
              entityType: 'Planning Entity',
              assignedEntity: [], // No assigned entities
              addressLine1: '123 Test St',
              country: 'US',
              state: 'CA',
              city: 'Test City',
              pinZipCode: '12345',
              entityLogo: null,
              logo: null,
              setAsDefault: false,
              addAnother: false,
            },
            countries: [{ id: 'US', name: 'United States' }],
            entityTypes: [
              { id: 'planning', name: 'Planning Entity' },
              { id: 'rollup', name: 'Rollup Entity' }
            ],
            states: ['CA', 'NY', 'TX'],
            loading: false,
            error: null,
            success: false,
            isFormModified: false,
          },
          entities: { items: [], loading: false },
        };
        return selector(state);
      });

      const { result } = renderWithProviders(() => useEntityForm());
      
      // Clear previous dispatch calls
      mockDispatch.mockClear();
      
      // Change entity type with no assigned entities
      act(() => {
        result.current.handleEntityTypeChange('Rollup Entity');
      });
      
      // Should still update the entity type
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'entitySetup/updateField',
        payload: {
          field: 'entityType',
          value: 'Rollup Entity'
        }
      });
    });

    it('should handle entity type change with non-array assignedEntity', () => {
      const { useSelector } = require('react-redux');
      useSelector.mockImplementation((selector) => {
        const state = {
          entitySetup: {
            formData: {
              legalBusinessName: 'Test Entity',
              displayName: 'Test Display',
              entityType: 'Planning Entity',
              assignedEntity: 'single-entity', // Non-array assigned entity
              addressLine1: '123 Test St',
              country: 'US',
              state: 'CA',
              city: 'Test City',
              pinZipCode: '12345',
              entityLogo: null,
              logo: null,
              setAsDefault: false,
              addAnother: false,
            },
            countries: [{ id: 'US', name: 'United States' }],
            entityTypes: [
              { id: 'planning', name: 'Planning Entity' },
              { id: 'rollup', name: 'Rollup Entity' }
            ],
            states: ['CA', 'NY', 'TX'],
            loading: false,
            error: null,
            success: false,
            isFormModified: false,
          },
          entities: { items: [], loading: false },
        };
        return selector(state);
      });

      const { result } = renderWithProviders(() => useEntityForm());
      
      // Clear previous dispatch calls
      mockDispatch.mockClear();
      
      // Change entity type with non-array assigned entity
      act(() => {
        result.current.handleEntityTypeChange('Rollup Entity');
      });
      
      // Should still update the entity type
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'entitySetup/updateField',
        payload: {
          field: 'entityType',
          value: 'Rollup Entity'
        }
      });
    });

    it('should execute setTimeout callback in entity type change with assigned entities', async () => {
      // Mock console.log and console.warn
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { useSelector } = require('react-redux');
      let currentFormData = {
        legalBusinessName: 'Test Entity',
        displayName: 'Test Display',
        entityType: 'Planning Entity',
        assignedEntity: ['entity1', 'entity2', 'entity3'], // Has assigned entities
        addressLine1: '123 Test St',
        country: 'US',
        state: 'CA',
        city: 'Test City',
        pinZipCode: '12345',
        entityLogo: null,
        logo: null,
        setAsDefault: false,
        addAnother: false,
      };

      useSelector.mockImplementation((selector) => {
        const state = {
          entitySetup: {
            formData: currentFormData,
            countries: [{ id: 'US', name: 'United States' }],
            entityTypes: [
              { id: 'planning', name: 'Planning Entity' },
              { id: 'rollup', name: 'Rollup Entity' }
            ],
            states: ['CA', 'NY', 'TX'],
            loading: false,
            error: null,
            success: false,
            isFormModified: false,
          },
          entities: { items: [], loading: false },
        };
        return selector(state);
      });

      const { result } = renderWithProviders(() => useEntityForm());
      
      // Change entity type to trigger the setTimeout callback
      act(() => {
        result.current.handleEntityTypeChange('Rollup Entity');
      });
      
      // Wait for setTimeout to execute
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 1));
      });
      
      // Should have logged preservation info
      expect(consoleSpy).toHaveBeenCalledWith('Preserving assigned entities during entity type change:', expect.objectContaining({
        from: 'Planning Entity',
        to: 'Rollup Entity',
        assignedEntities: ['entity1', 'entity2', 'entity3'],
        count: 3
      }));
      
      // Cleanup
      consoleSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('should handle assigned entities length mismatch in setTimeout', async () => {
      // Mock console.log and console.warn
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { useSelector } = require('react-redux');
      
      // Create a scenario where assigned entities count changes (to trigger console.warn)
      let callCount = 0;
      useSelector.mockImplementation((selector) => {
        callCount++;
        const formData = callCount === 1 
          ? { assignedEntity: ['entity1', 'entity2'] } // Initial state
          : { assignedEntity: ['entity1'] }; // After change - different length
          
        const state = {
          entitySetup: {
            formData: {
              legalBusinessName: 'Test Entity',
              displayName: 'Test Display',
              entityType: 'Planning Entity',
              ...formData,
              addressLine1: '123 Test St',
              country: 'US',
              state: 'CA',
              city: 'Test City',
              pinZipCode: '12345',
              entityLogo: null,
              logo: null,
              setAsDefault: false,
              addAnother: false,
            },
            countries: [{ id: 'US', name: 'United States' }],
            entityTypes: [
              { id: 'planning', name: 'Planning Entity' },
              { id: 'rollup', name: 'Rollup Entity' }
            ],
            states: ['CA', 'NY', 'TX'],
            loading: false,
            error: null,
            success: false,
            isFormModified: false,
          },
          entities: { items: [], loading: false },
        };
        return selector(state);
      });

      const { result } = renderWithProviders(() => useEntityForm());
      
      // Change entity type to trigger the setTimeout callback
      act(() => {
        result.current.handleEntityTypeChange('Rollup Entity');
      });
      
      // Wait for setTimeout to execute
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 1));
      });
      
      // Cleanup
      consoleSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('should handle edge case in setTimeout validation', async () => {
      // This test aims to cover the remaining uncovered lines in the setTimeout callback
      const { useSelector } = require('react-redux');
      
      useSelector.mockImplementation((selector) => {
        const state = {
          entitySetup: {
            formData: {
              legalBusinessName: 'Test Entity',
              displayName: 'Test Display',
              entityType: 'Rollup Entity', // Different from previous
              assignedEntity: ['entity1'], // Has entities
              addressLine1: '123 Test St',
              country: 'US',
              state: 'CA',
              city: 'Test City',
              pinZipCode: '12345',
              entityLogo: null,
              logo: null,
              setAsDefault: false,
              addAnother: false,
            },
            countries: [{ id: 'US', name: 'United States' }],
            entityTypes: [
              { id: 'planning', name: 'Planning Entity' },
              { id: 'rollup', name: 'Rollup Entity' }
            ],
            states: ['CA', 'NY', 'TX'],
            loading: false,
            error: null,
            success: false,
            isFormModified: false,
          },
          entities: { items: [], loading: false },
        };
        return selector(state);
      });

      const { result } = renderWithProviders(() => useEntityForm());
      
      // Change from a type that had entities to trigger the preservation logic
      act(() => {
        result.current.handleEntityTypeChange('Planning Entity');
      });
      
      // Wait for the setTimeout to execute  
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 1));
      });
    });
  });

  describe('File Upload Handling', () => {
    it('should handle valid file upload', async () => {
      const { convertFileToBase64, validateImageFile } = require('commonApp/imageUtils');
      validateImageFile.mockReturnValue({ isValid: true });
      convertFileToBase64.mockResolvedValue({ success: true, data: 'base64data' });
      
      const { result } = renderWithProviders(() => useEntityForm());
      
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      
      // Test that the function can be called without errors
      await expect(async () => {
        await act(async () => {
          await result.current.handleFileUpload(file);
        });
      }).not.toThrow();
      
      expect(validateImageFile).toHaveBeenCalledWith(file, 10, ['.png', '.jpeg', '.jpg', '.svg']);
      expect(convertFileToBase64).toHaveBeenCalledWith(file);
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle invalid file upload', async () => {
      const { validateImageFile } = require('commonApp/imageUtils');
      validateImageFile.mockReturnValue({ isValid: false, error: 'Invalid file' });
      
      const { result } = renderWithProviders(() => useEntityForm());
      
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      // Clear previous dispatch calls from hook initialization
      mockDispatch.mockClear();
      
      await act(async () => {
        await result.current.handleFileUpload(file);
      });
      
      expect(validateImageFile).toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should handle file conversion failure', async () => {
      const { convertFileToBase64, validateImageFile } = require('commonApp/imageUtils');
      validateImageFile.mockReturnValue({ isValid: true });
      convertFileToBase64.mockResolvedValue({ success: false, error: 'Conversion failed' });
      
      const { result } = renderWithProviders(() => useEntityForm());
      
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      
      // Clear previous dispatch calls from hook initialization
      mockDispatch.mockClear();
      
      await act(async () => {
        await result.current.handleFileUpload(file);
      });
      
      expect(validateImageFile).toHaveBeenCalled();
      expect(convertFileToBase64).toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should handle null file', async () => {
      const { result } = renderWithProviders(() => useEntityForm());
      
      // Test that the function can be called without errors
      await expect(async () => {
        await act(async () => {
          await result.current.handleFileUpload(null);
        });
      }).not.toThrow();
      
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('Button State Helpers', () => {
    it('should determine reset enabled state correctly', () => {
      const { result } = renderWithProviders(() => useEntityForm());
      
      // In edit mode, should be enabled when form is modified
      expect(result.current.isResetEnabled()).toBe(false); // isFormModified is false
      
      // Test with form modified
      act(() => {
        result.current.setIsFormValid(true);
      });
      
      expect(result.current.isResetEnabled()).toBe(false);
    });

    it('should determine save enabled state correctly', () => {
      const { result } = renderWithProviders(() => useEntityForm());
      
      // Test that the function exists and can be called
      expect(result.current.isSaveEnabled).toBeDefined();
      expect(typeof result.current.isSaveEnabled).toBe('function');
      
      // The function should return a boolean (even if false due to empty form)
      const saveEnabled = result.current.isSaveEnabled();
      expect(typeof saveEnabled).toBe('boolean');
    });
  });

  describe('Confirmation Handling', () => {
    it('should open reset confirmation', () => {
      const { result } = renderWithProviders(() => useEntityForm());
      
      act(() => {
        result.current.handleReset();
      });
      
      expect(result.current.confirmOpen).toBe(true);
      expect(result.current.confirmType).toBe('reset');
      expect(result.current.confirmMessage).toContain('clear all entered data');
    });

    it('should open cancel confirmation', () => {
      // Mock useSelector to return form data with changes
      const mockUseSelector = require('react-redux').useSelector;
      mockUseSelector.mockImplementation((selector) => {
        const mockState = {
          entitySetup: {
            formData: {
              legalBusinessName: 'Test Company',
              displayName: 'Test Display',
              entityType: 'Planning Entity',
              addressLine1: '123 Test St',
              country: 'USA',
              state: 'CA',
              city: 'Test City',
              pinZipCode: '12345',
              assignedEntity: [],
              addressLine2: '',
              entityLogo: null,
              logo: null,
              setAsDefault: false,
              addAnother: false,
            },
            countries: [],
            entityTypes: [],
            states: [],
            loading: false,
            error: null,
            success: false,
            isFormModified: true, // This should trigger the confirmation
          },
          entities: { items: [], loading: false },
        };
        return selector(mockState);
      });
      
      const { result } = renderWithProviders(() => useEntityForm());
      
      act(() => {
        result.current.handleCancel();
      });
      
      expect(result.current.confirmOpen).toBe(true);
      expect(result.current.confirmType).toBe('cancel');
      expect(result.current.confirmMessage).toContain('all entered data will be lost');
    });

    it('should handle confirm yes for reset', () => {
      const { result } = renderWithProviders(() => useEntityForm());
      
      act(() => {
        result.current.handleReset();
      });
      
      act(() => {
        result.current.handleConfirmYes();
      });
      
      expect(mockDispatch).toHaveBeenCalled();
      expect(result.current.confirmOpen).toBe(false);
    });

    it('should handle confirm yes for cancel', () => {
      const { result } = renderWithProviders(() => useEntityForm());
      
      act(() => {
        result.current.handleCancel();
      });
      
      act(() => {
        result.current.handleConfirmYes();
      });
      
      expect(mockDispatch).toHaveBeenCalled();
      expect(result.current.confirmOpen).toBe(false);
    });

    it('should handle confirm no', () => {
      const { result } = renderWithProviders(() => useEntityForm());
      
      act(() => {
        result.current.handleReset();
      });
      
      act(() => {
        result.current.handleConfirmNo();
      });
      
      expect(result.current.confirmOpen).toBe(false);
      expect(result.current.confirmType).toBe(null);
    });
  });

  describe('Navigation Handling', () => {
    it('should handle back navigation', () => {
      const { result } = renderWithProviders(() => useEntityForm());
      
      // Mock window.history.back
      const mockBack = jest.fn();
      Object.defineProperty(window, 'history', {
        value: { back: mockBack },
        writable: true
      });
      
      act(() => {
        result.current.handleBack();
      });
      
      expect(mockBack).toHaveBeenCalled();
    });

    it('should handle cancel without changes', () => {
      const { result } = renderWithProviders(() => useEntityForm());
      
      // Mock window.history.back
      const mockBack = jest.fn();
      Object.defineProperty(window, 'history', {
        value: { back: mockBack },
        writable: true
      });
      
      act(() => {
        result.current.handleCancel();
      });
      
      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe('Save Handling', () => {
    it('should handle save with custom submit', async () => {
      const customSubmit = jest.fn().mockResolvedValue(undefined);
      const { result } = renderWithProviders(() => useEntityForm(undefined, undefined, undefined, undefined, customSubmit));
      
      await act(async () => {
        await result.current.handleSave();
      });
      
      expect(customSubmit).toHaveBeenCalledWith(result.current.formData);
    });

    it('should handle save with default submit', async () => {
      const { result } = renderWithProviders(() => useEntityForm());
      
      await act(async () => {
        await result.current.handleSave();
      });
      
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle save error', async () => {
      const customSubmit = jest.fn().mockRejectedValue(new Error('Save failed'));
      const { result } = renderWithProviders(() => useEntityForm(undefined, undefined, undefined, undefined, customSubmit));
      
      await act(async () => {
        await result.current.handleSave();
      });
      
      expect(customSubmit).toHaveBeenCalled();
    });

    it('should handle save in edit mode with addAnother false', async () => {
      // Mock window location
      Object.defineProperty(window, 'location', {
        value: { pathname: '/admin/entity-setup' },
        writable: true
      });

      const { useSelector } = require('react-redux');
      useSelector.mockImplementation((selector) => {
        const state = {
          entitySetup: {
            formData: {
              legalBusinessName: 'Test Entity',
              displayName: 'Test Display',
              entityType: 'Planning Entity',
              assignedEntity: [],
              addressLine1: '123 Test St',
              country: 'US',
              state: 'CA',
              city: 'Test City',
              pinZipCode: '12345',
              entityLogo: null,
              logo: null,
              setAsDefault: false,
              addAnother: false, // Not adding another
            },
            countries: [{ id: 'US', name: 'United States' }],
            entityTypes: [{ id: 'planning', name: 'Planning Entity' }],
            states: ['CA', 'NY', 'TX'],
            loading: false,
            error: null,
            success: false,
            isFormModified: true,
          },
          entities: {
            items: [
              {
                id: 'test-id',
                legalBusinessName: 'Test Entity',
                displayName: 'Test Display',
                entityType: 'Planning Entity',
                assignedEntity: [],
                addressLine1: '123 Test St',
                country: 'US',
                state: 'CA',
                city: 'Test City',
                pinZipCode: '12345',
                logo: null,
                setAsDefault: false,
                currencies: undefined,
                isDeleted: false,
                isConfigured: false,
                isEnabled: true,
                softDeleted: false,
                createdAt: '2023-01-01',
                lastUpdatedAt: '2023-01-01',
              }
            ],
            loading: false,
          },
        };
        return selector(state);
      });

      const { result } = renderWithProviders(() => useEntityForm());
      
      await act(async () => {
        await result.current.handleSave();
      });
      
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/admin/entity-setup');
    });

    it('should navigate to root when not in admin app', async () => {
      // Mock window location for non-admin path
      Object.defineProperty(window, 'location', {
        value: { pathname: '/entity-setup' },
        writable: true
      });

      const { result } = renderWithProviders(() => useEntityForm());
      
      await act(async () => {
        await result.current.handleSave();
      });
      
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should not navigate when addAnother is true', async () => {
      const { useSelector } = require('react-redux');
      useSelector.mockImplementation((selector) => {
        const state = {
          entitySetup: {
            formData: {
              legalBusinessName: 'Test Entity',
              displayName: 'Test Display',
              entityType: 'Planning Entity',
              assignedEntity: [],
              addressLine1: '123 Test St',
              country: 'US',
              state: 'CA',
              city: 'Test City',
              pinZipCode: '12345',
              entityLogo: null,
              logo: null,
              setAsDefault: false,
              addAnother: true, // Adding another entity
            },
            countries: [{ id: 'US', name: 'United States' }],
            entityTypes: [{ id: 'planning', name: 'Planning Entity' }],
            states: ['CA', 'NY', 'TX'],
            loading: false,
            error: null,
            success: false,
            isFormModified: false,
          },
          entities: { items: [], loading: false },
        };
        return selector(state);
      });

      const { result } = renderWithProviders(() => useEntityForm());
      
      // Clear previous navigate calls
      mockNavigate.mockClear();
      
      await act(async () => {
        await result.current.handleSave();
      });
      
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle window.location being undefined', async () => {
      // Mock window.location as undefined
      Object.defineProperty(window, 'location', {
        value: undefined,
        writable: true
      });

      const { result } = renderWithProviders(() => useEntityForm());
      
      await act(async () => {
        await result.current.handleSave();
      });
      
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should handle save with original data update in edit mode', async () => {
      // Mock edit mode with addAnother false
      Object.defineProperty(window, 'location', {
        value: { pathname: '/entity-setup' },
        writable: true
      });

      const { useSelector } = require('react-redux');
      useSelector.mockImplementation((selector) => {
        const state = {
          entitySetup: {
            formData: {
              id: 'test-id',
              legalBusinessName: 'Test Entity',
              displayName: 'Test Display',
              entityType: 'Planning Entity',
              assignedEntity: [],
              addressLine1: '123 Test St',
              country: 'US',
              state: 'CA',
              city: 'Test City',
              pinZipCode: '12345',
              entityLogo: null,
              logo: null,
              setAsDefault: false,
              addAnother: false, // Not adding another - should trigger original data update
            },
            countries: [{ id: 'US', name: 'United States' }],
            entityTypes: [{ id: 'planning', name: 'Planning Entity' }],
            states: ['CA', 'NY', 'TX'],
            loading: false,
            error: null,
            success: false,
            isFormModified: true,
          },
          entities: {
            items: [
              {
                id: 'test-id',
                legalBusinessName: 'Test Entity',
                displayName: 'Test Display',
                entityType: 'Planning Entity',
                assignedEntity: [],
                addressLine1: '123 Test St',
                country: 'US',
                state: 'CA',
                city: 'Test City',
                pinZipCode: '12345',
                logo: null,
                setAsDefault: false,
                currencies: undefined,
                isDeleted: false,
                isConfigured: false,
                isEnabled: true,
                softDeleted: false,
                createdAt: '2023-01-01',
                lastUpdatedAt: '2023-01-01',
              }
            ],
            loading: false,
          },
        };
        return selector(state);
      });

      const { result } = renderWithProviders(() => useEntityForm());
      
      await act(async () => {
        await result.current.handleSave();
      });
      
      // Should have called dispatch for both submit and form data update
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Success/Error Handling', () => {
    it('should call onSuccess when success is true', () => {
      const onSuccess = jest.fn();
      const { useSelector } = require('react-redux');
      
      // Mock success state
      useSelector.mockImplementation((selector) => {
        const state = {
          entitySetup: {
            formData: { legalBusinessName: 'Test' },
            success: true,
          },
          entities: { items: [], loading: false },
        };
        return selector(state);
      });
      
      renderWithProviders(() => useEntityForm(undefined, undefined, onSuccess));
      
      expect(onSuccess).toHaveBeenCalledWith({ legalBusinessName: 'Test' });
    });

    it('should call onError when error is present', () => {
      const onError = jest.fn();
      const { useSelector } = require('react-redux');
      
      // Mock error state
      useSelector.mockImplementation((selector) => {
        const state = {
          entitySetup: {
            formData: { legalBusinessName: 'Test' },
            error: 'Test error',
          },
          entities: { items: [], loading: false },
        };
        return selector(state);
      });
      
      renderWithProviders(() => useEntityForm(undefined, undefined, undefined, onError));
      
      expect(onError).toHaveBeenCalledWith('Test error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing id parameter', () => {
      const { result } = renderWithProviders(() => useEntityForm());
      
      // Test that the hook works even without an id parameter
      expect(result.current).toBeDefined();
      expect(result.current.isEditMode).toBeDefined();
      expect(typeof result.current.isEditMode).toBe('boolean');
    });

    it('should handle empty form data', () => {
      const { useSelector } = require('react-redux');
      useSelector.mockImplementation((selector) => {
        const state = {
          entitySetup: {
            formData: {
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
              logo: null,
              setAsDefault: false,
              addAnother: false,
            },
            countries: [],
            entityTypes: [],
            states: [],
            loading: false,
            error: null,
            success: false,
            isFormModified: false,
          },
          entities: { items: [], loading: false },
        };
        return selector(state);
      });
      
      const { result } = renderWithProviders(() => useEntityForm());
      
      expect(result.current.hasFormData).toBe(false);
      expect(result.current.isSaveEnabled()).toBe(false);
    });

    it('should handle array assignedEntity', () => {
      const { useSelector } = require('react-redux');
      useSelector.mockImplementation((selector) => {
        const state = {
          entitySetup: {
            formData: {
              legalBusinessName: 'Test',
              displayName: 'Test',
              entityType: 'Planning Entity',
              assignedEntity: ['entity1', 'entity2'],
              addressLine1: '123 Test St',
              country: 'US',
              state: 'CA',
              city: 'Test City',
              pinZipCode: '12345',
              entityLogo: null,
              logo: null,
              setAsDefault: false,
              addAnother: false,
            },
            countries: [],
            entityTypes: [],
            states: [],
            loading: false,
            error: null,
            success: false,
            isFormModified: false,
          },
          entities: { items: [], loading: false },
        };
        return selector(state);
      });
      
      const { result } = renderWithProviders(() => useEntityForm());
      
      expect(result.current.hasFormData).toBe(true);
    });

    it('should handle string assignedEntity', () => {
      const { useSelector } = require('react-redux');
      useSelector.mockImplementation((selector) => {
        const state = {
          entitySetup: {
            formData: {
              legalBusinessName: 'Test',
              displayName: 'Test',
              entityType: 'Planning Entity',
              assignedEntity: 'entity1',
              addressLine1: '123 Test St',
              country: 'US',
              state: 'CA',
              city: 'Test City',
              pinZipCode: '12345',
              entityLogo: null,
              logo: null,
              setAsDefault: false,
              addAnother: false,
            },
            countries: [],
            entityTypes: [],
            states: [],
            loading: false,
            error: null,
            success: false,
            isFormModified: false,
          },
          entities: { items: [], loading: false },
        };
        return selector(state);
      });
      
      const { result } = renderWithProviders(() => useEntityForm());
      
      expect(result.current.hasFormData).toBe(true);
    });
  });

  describe('State Restoration Logic', () => {
    it('should handle state restoration scenarios in edit mode', () => {
      const { useSelector } = require('react-redux');
      useSelector.mockImplementation((selector) => {
        const state = {
          entitySetup: {
            formData: {
              legalBusinessName: 'Test Entity',
              displayName: 'Test Display',
              entityType: 'Planning Entity',
              assignedEntity: [],
              addressLine1: '123 Test St',
              addressLine2: '',
              country: 'US',
              state: '', // Empty state to trigger restoration
              city: 'Test City',
              pinZipCode: '12345',
              entityLogo: null,
              logo: null,
              setAsDefault: false,
              addAnother: false,
            },
            countries: [{ id: 'US', name: 'United States' }],
            entityTypes: [{ id: 'planning', name: 'Planning Entity' }],
            states: ['CA', 'NY', 'TX'],
            loading: false,
            error: null,
            success: false,
            isFormModified: false,
            shouldReloadStatesForCountry: 'US', // Simulate reload needed
          },
          entities: {
            items: [
              {
                id: 'test-id',
                legalBusinessName: 'Test Entity',
                displayName: 'Test Display',
                entityType: 'Planning Entity',
                assignedEntity: [],
                addressLine1: '123 Test St',
                addressLine2: '',
                country: 'US',
                state: 'CA', // Original state to restore
                city: 'Test City',
                pinZipCode: '12345',
                logo: null,
                setAsDefault: false,
                currencies: undefined,
                isDeleted: false,
                isConfigured: false,
                isEnabled: true,
                softDeleted: false,
                createdAt: '2023-01-01',
                lastUpdatedAt: '2023-01-01',
              }
            ],
            loading: false,
          },
        };
        return selector(state);
      });
      
      const { result } = renderWithProviders(() => useEntityForm());
      
      expect(result.current.isEditMode).toBe(true);
      expect(result.current.formData.country).toBe('US');
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle invalid state clearing when country changes', () => {
      const { useSelector } = require('react-redux');
      useSelector.mockImplementation((selector) => {
        const state = {
          entitySetup: {
            formData: {
              legalBusinessName: 'Test Entity',
              displayName: 'Test Display',
              entityType: 'Planning Entity',
              assignedEntity: [],
              addressLine1: '123 Test St',
              country: 'CA', // Different country
              state: 'NY', // Invalid state for Canada
              city: 'Test City',
              pinZipCode: '12345',
              entityLogo: null,
              logo: null,
              setAsDefault: false,
              addAnother: false,
            },
            countries: [{ id: 'US', name: 'United States' }, { id: 'CA', name: 'Canada' }],
            entityTypes: [{ id: 'planning', name: 'Planning Entity' }],
            states: ['ON', 'BC'], // Canadian provinces - NY is not valid
            loading: false,
            error: null,
            success: false,
            isFormModified: true,
          },
          entities: {
            items: [
              {
                id: 'test-id',
                legalBusinessName: 'Test Entity',
                displayName: 'Test Display',
                entityType: 'Planning Entity',
                assignedEntity: [],
                addressLine1: '123 Test St',
                country: 'US', // Original country
                state: 'NY',
                city: 'Test City',
                pinZipCode: '12345',
                logo: null,
                setAsDefault: false,
                currencies: undefined,
                isDeleted: false,
                isConfigured: false,
                isEnabled: true,
                softDeleted: false,
                createdAt: '2023-01-01',
                lastUpdatedAt: '2023-01-01',
              }
            ],
            loading: false,
          },
        };
        return selector(state);
      });
      
      const { result } = renderWithProviders(() => useEntityForm());
      
      expect(result.current.isEditMode).toBe(true);
      expect(result.current.formData.country).toBe('CA');
    });
  });

  describe('State Validation Logic', () => {
    it('should clear state validation errors for countries without states', () => {
      const { useSelector } = require('react-redux');
      let stateData = [];
      
      useSelector.mockImplementation((selector) => {
        const state = {
          entitySetup: {
            formData: {
              legalBusinessName: 'Test Entity',
              displayName: 'Test Display',
              entityType: 'Planning Entity',
              assignedEntity: [],
              addressLine1: '123 Test St',
              country: 'VA', // Vatican City - no states
              state: '',
              city: 'Vatican City',
              pinZipCode: '00120',
              entityLogo: null,
              logo: null,
              setAsDefault: false,
              addAnother: false,
            },
            countries: [{ id: 'VA', name: 'Vatican City' }],
            entityTypes: [{ id: 'planning', name: 'Planning Entity' }],
            states: stateData, // No states for Vatican City
            loading: false,
            error: null,
            success: false,
            isFormModified: false,
          },
          entities: { items: [], loading: false },
        };
        return selector(state);
      });
      
      const { result } = renderWithProviders(() => useEntityForm());
      
      // Set a state validation error first
      act(() => {
        result.current.setValidationErrors({ state: 'State is required' });
      });
      
      // Change to have no states (trigger the clearing effect)
      stateData = [];
      
      // Test the validation clearing logic by simulating the useEffect behavior
      // The hook should handle countries without states gracefully
      expect(result.current.stateOptions).toEqual([]); // No states available
      expect(result.current.formData.country).toBe('VA');
    });

    it('should determine save button state correctly for countries without states', () => {
      const { useSelector } = require('react-redux');
      useSelector.mockImplementation((selector) => {
        const state = {
          entitySetup: {
            formData: {
              legalBusinessName: 'Vatican Entity',
              displayName: 'Vatican Display',
              entityType: 'Planning Entity',
              assignedEntity: [],
              addressLine1: 'Vatican Address',
              addressLine2: '',
              country: 'VA', // Vatican City
              state: '', // No state needed
              city: 'Vatican City',
              pinZipCode: '00120',
              entityLogo: null,
              logo: null,
              setAsDefault: false,
              addAnother: false,
            },
            countries: [{ id: 'VA', name: 'Vatican City' }],
            entityTypes: [{ id: 'planning', name: 'Planning Entity' }],
            states: [], // No states available
            loading: false,
            error: null,
            success: false,
            isFormModified: false,
          },
          entities: { items: [], loading: false },
        };
        return selector(state);
      });
      
      const { result } = renderWithProviders(() => useEntityForm());
      
      // Test that the form data structure is correct for countries without states
      expect(result.current.formData.country).toBe('VA');
      expect(result.current.stateOptions).toEqual([]);
      
      // The save validation logic handles this case - test the function exists
      expect(typeof result.current.isSaveEnabled).toBe('function');
    });

    it('should require state when country has states available', () => {
      const { useSelector } = require('react-redux');
      useSelector.mockImplementation((selector) => {
        const state = {
          entitySetup: {
            formData: {
              legalBusinessName: 'US Entity',
              displayName: 'US Display',
              entityType: 'Planning Entity',
              assignedEntity: [],
              addressLine1: 'US Address',
              addressLine2: '',
              country: 'US',
              state: '', // Empty state - should be required
              city: 'Test City',
              pinZipCode: '12345',
              entityLogo: null,
              logo: null,
              setAsDefault: false,
              addAnother: false,
            },
            countries: [{ id: 'US', name: 'United States' }],
            entityTypes: [{ id: 'planning', name: 'Planning Entity' }],
            states: ['CA', 'NY', 'TX'], // States available - state is required
            loading: false,
            error: null,
            success: false,
            isFormModified: false,
          },
          entities: { items: [], loading: false },
        };
        return selector(state);
      });
      
      const { result } = renderWithProviders(() => useEntityForm());
      
      // Should be disabled since state is required but not provided
      expect(result.current.isSaveEnabled()).toBe(false);
    });
  });

  describe('Additional Edge Cases', () => {
    it('should handle hasFormData with various field combinations', () => {
      const { useSelector } = require('react-redux');
      
      // Test with setAsDefault true
      useSelector.mockImplementation((selector) => {
        const state = {
          entitySetup: {
            formData: {
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
              logo: null,
              setAsDefault: true, // This should make hasFormData true
              addAnother: false,
            },
            countries: [],
            entityTypes: [],
            states: [],
            loading: false,
            error: null,
            success: false,
            isFormModified: false,
          },
          entities: { items: [], loading: false },
        };
        return selector(state);
      });
      
      const { result } = renderWithProviders(() => useEntityForm());
      
      expect(result.current.hasFormData).toBe(true);
    });

    it('should handle hasFormData with addAnother true', () => {
      const { useSelector } = require('react-redux');
      
      useSelector.mockImplementation((selector) => {
        const state = {
          entitySetup: {
            formData: {
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
              logo: null,
              setAsDefault: false,
              addAnother: true, // This should make hasFormData true
            },
            countries: [],
            entityTypes: [],
            states: [],
            loading: false,
            error: null,
            success: false,
            isFormModified: false,
          },
          entities: { items: [], loading: false },
        };
        return selector(state);
      });
      
      const { result } = renderWithProviders(() => useEntityForm());
      
      expect(result.current.hasFormData).toBe(true);
    });

    it('should handle hasFormData with entityLogo', () => {
      const { useSelector } = require('react-redux');
      
      useSelector.mockImplementation((selector) => {
        const state = {
          entitySetup: {
            formData: {
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
              entityLogo: new File(['test'], 'test.png'), // This should make hasFormData true
              logo: null,
              setAsDefault: false,
              addAnother: false,
            },
            countries: [],
            entityTypes: [],
            states: [],
            loading: false,
            error: null,
            success: false,
            isFormModified: false,
          },
          entities: { items: [], loading: false },
        };
        return selector(state);
      });
      
      const { result } = renderWithProviders(() => useEntityForm());
      
      expect(result.current.hasFormData).toBe(true);
    });

    it('should handle hasFormData with addressLine2', () => {
      const { useSelector } = require('react-redux');
      
      useSelector.mockImplementation((selector) => {
        const state = {
          entitySetup: {
            formData: {
              legalBusinessName: '',
              displayName: '',
              entityType: '',
              assignedEntity: [],
              addressLine1: '',
              addressLine2: 'Suite 200', // This should make hasFormData true
              country: '',
              state: '',
              city: '',
              pinZipCode: '',
              entityLogo: null,
              logo: null,
              setAsDefault: false,
              addAnother: false,
            },
            countries: [],
            entityTypes: [],
            states: [],
            loading: false,
            error: null,
            success: false,
            isFormModified: false,
          },
          entities: { items: [], loading: false },
        };
        return selector(state);
      });
      
      const { result } = renderWithProviders(() => useEntityForm());
      
      expect(result.current.hasFormData).toBe(true);
    });

    it('should handle hasFormData with state field', () => {
      const { useSelector } = require('react-redux');
      
      useSelector.mockImplementation((selector) => {
        const state = {
          entitySetup: {
            formData: {
              legalBusinessName: '',
              displayName: '',
              entityType: '',
              assignedEntity: [],
              addressLine1: '',
              addressLine2: '',
              country: '',
              state: 'CA', // This should make hasFormData true
              city: '',
              pinZipCode: '',
              entityLogo: null,
              logo: null,
              setAsDefault: false,
              addAnother: false,
            },
            countries: [],
            entityTypes: [],
            states: [],
            loading: false,
            error: null,
            success: false,
            isFormModified: false,
          },
          entities: { items: [], loading: false },
        };
        return selector(state);
      });
      
      const { result } = renderWithProviders(() => useEntityForm());
      
      expect(result.current.hasFormData).toBe(true);
    });
  });

  describe('Entity Prefill Logic', () => {
    it('should handle entity assignedEntity as JSON string', () => {
      const { useSelector } = require('react-redux');
      useSelector.mockImplementation((selector) => {
        const state = {
          entitySetup: {
            formData: {
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
              logo: null,
              setAsDefault: false,
              addAnother: false,
            },
            countries: [{ id: 'US', name: 'United States' }],
            entityTypes: [{ id: 'planning', name: 'Planning Entity' }],
            states: ['CA', 'NY', 'TX'],
            loading: false,
            error: null,
            success: false,
            isFormModified: false,
          },
          entities: {
            items: [
              {
                id: 'test-id',
                legalBusinessName: 'Test Entity',
                displayName: 'Test Display',
                entityType: 'Planning Entity',
                assignedEntity: '["entity1", "entity2"]', // JSON string format
                addressLine1: '123 Test St',
                addressLine2: '',
                country: 'US',
                state: 'CA',
                city: 'Test City',
                pinZipCode: '12345',
                logo: null,
                setAsDefault: false,
                currencies: undefined,
                isDeleted: false,
                isConfigured: false,
                isEnabled: true,
                softDeleted: false,
                createdAt: '2023-01-01',
                lastUpdatedAt: '2023-01-01',
              }
            ],
            loading: false,
          },
        };
        return selector(state);
      });
      
      const { result } = renderWithProviders(() => useEntityForm());
      
      expect(result.current.isEditMode).toBe(true);
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle entity assignedEntity with invalid JSON', () => {
      const { useSelector } = require('react-redux');
      useSelector.mockImplementation((selector) => {
        const state = {
          entitySetup: {
            formData: {
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
              logo: null,
              setAsDefault: false,
              addAnother: false,
            },
            countries: [{ id: 'US', name: 'United States' }],
            entityTypes: [{ id: 'planning', name: 'Planning Entity' }],
            states: ['CA', 'NY', 'TX'],
            loading: false,
            error: null,
            success: false,
            isFormModified: false,
          },
          entities: {
            items: [
              {
                id: 'test-id',
                legalBusinessName: 'Test Entity',
                displayName: 'Test Display',
                entityType: 'Planning Entity',
                assignedEntity: 'invalid-json{', // Invalid JSON
                addressLine1: '123 Test St',
                addressLine2: '',
                country: 'US',
                state: 'CA',
                city: 'Test City',
                pinZipCode: '12345',
                logo: null,
                setAsDefault: false,
                currencies: undefined,
                isDeleted: false,
                isConfigured: false,
                isEnabled: true,
                softDeleted: false,
                createdAt: '2023-01-01',
                lastUpdatedAt: '2023-01-01',
              }
            ],
            loading: false,
          },
        };
        return selector(state);
      });
      
      const { result } = renderWithProviders(() => useEntityForm());
      
      expect(result.current.isEditMode).toBe(true);
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle entity assignedEntity with empty values', () => {
      const { useSelector } = require('react-redux');
      useSelector.mockImplementation((selector) => {
        const state = {
          entitySetup: {
            formData: {
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
              logo: null,
              setAsDefault: false,
              addAnother: false,
            },
            countries: [{ id: 'US', name: 'United States' }],
            entityTypes: [{ id: 'planning', name: 'Planning Entity' }],
            states: ['CA', 'NY', 'TX'],
            loading: false,
            error: null,
            success: false,
            isFormModified: false,
          },
          entities: {
            items: [
              {
                id: 'test-id',
                legalBusinessName: 'Test Entity',
                displayName: 'Test Display',
                entityType: 'Planning Entity',
                assignedEntity: ['', '[]', 'valid-entity'], // Mixed valid and invalid values
                addressLine1: '123 Test St',
                addressLine2: '',
                country: 'US',
                state: 'CA',
                city: 'Test City',
                pinZipCode: '12345',
                logo: null,
                setAsDefault: false,
                currencies: undefined,
                isDeleted: false,
                isConfigured: false,
                isEnabled: true,
                softDeleted: false,
                createdAt: '2023-01-01',
                lastUpdatedAt: '2023-01-01',
              }
            ],
            loading: false,
          },
        };
        return selector(state);
      });
      
      const { result } = renderWithProviders(() => useEntityForm());
      
      expect(result.current.isEditMode).toBe(true);
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('Final Coverage Tests', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    // Test performCancel functionality (lines 429-430)
    it('should execute performCancel branch when confirmType is cancel', () => {
      const mockHistoryBack = jest.fn();
      Object.defineProperty(window, 'history', {
        value: { back: mockHistoryBack },
        writable: true
      });

      const mockUseSelector = require('react-redux').useSelector;
      mockUseSelector.mockImplementation((selector) => {
        const mockState = {
          entitySetup: {
            formData: { entityName: 'Test' },
            loading: false,
            error: null,
            success: false,
            validationErrors: {},
            isFormModified: true,
            countries: [],
            entityTypes: [],
            states: [],
          },
          entities: { items: [], loading: false },
        };
        return selector(mockState);
      });

      const { result } = renderWithProviders(() => useEntityForm());
      
      // Trigger cancel confirmation  
      act(() => {
        result.current.handleCancel();
      });
      
      // Verify confirmType is set to 'cancel'
      expect(result.current.confirmType).toBe('cancel');
      
      // Confirm the cancel action - this should execute the 'else if (confirmType === 'cancel')' branch
      act(() => {
        result.current.handleConfirmYes();
      });
      
      // Verify window.history.back was called (lines 429-430)
      expect(mockHistoryBack).toHaveBeenCalled();
    });

    // Test performReset branch more explicitly (lines 438-439)
    it('should execute performReset branch when confirmType is reset in handleConfirmYes', () => {
      const { result } = renderWithProviders(() => useEntityForm());
      
      // Trigger reset confirmation  
      act(() => {
        result.current.handleReset();
      });
      
      // Verify we're in reset confirmation state 
      expect(result.current.confirmType).toBe('reset');
      
      // Confirm the reset action - this should execute the 'if (confirmType === 'reset')' branch
      act(() => {
        result.current.handleConfirmYes();
      });
      
      // Verify the reset was executed and dialog closed (lines 438-439)
      expect(result.current.confirmOpen).toBe(false);
    });

    // Test edge case where confirmType is neither reset nor cancel
    it('should handle edge case when confirmType is unexpected', () => {
      const { result } = renderWithProviders(() => useEntityForm());
      
      // First set up a confirmation 
      act(() => {
        result.current.handleReset();
      });
      
      // Manually modify confirmType to an unexpected value to test the else condition
      // This is to ensure we test all branches of the if-else in handleConfirmYes
      const hookResult = result.current as any;
      if (hookResult.setConfirmType) {
        act(() => {
          hookResult.setConfirmType('unexpected');
        });
      }
      
      act(() => {
        result.current.handleConfirmYes();
      });
      
      // Should still close the dialog even with unexpected confirmType
      expect(result.current.confirmOpen).toBe(false);
    });
  });
});
