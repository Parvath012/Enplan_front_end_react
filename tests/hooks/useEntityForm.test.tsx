import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useEntityForm } from '../../src/hooks/useEntityForm';

// Mock react-router-dom completely
const mockNavigate = jest.fn();
const mockParams = { id: 'test-id' };
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
  BrowserRouter: ({ children }: any) => children,
  MemoryRouter: ({ children }: any) => children,
  Router: ({ children }: any) => children,
}));

// Mock Redux hooks
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: jest.fn(),
}));

// Mock commonApp/imageUtils
jest.mock('commonApp/imageUtils', () => ({
  convertFileToBase64: jest.fn(),
  validateImageFile: jest.fn(),
}));

// Mock store actions
jest.mock('../../src/store/Actions/entitySetupActions', () => ({
  initializeEntitySetup: jest.fn(),
  handleCountryChange: jest.fn(),
  submitEntitySetup: jest.fn(),
  resetForm: jest.fn(),
  updateField: jest.fn(),
  setOriginalFormData: jest.fn(),
  setFormModified: jest.fn(),
  setEditMode: jest.fn(),
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
  const store = createMockStore();
  return renderHook(hook, {
    wrapper: ({ children }) => (
      <Provider store={store}>
        {children}
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
      
      act(() => {
        result.current.handleInputChange('legalBusinessName', 'New Name');
      });
      
      expect(mockDispatch).toHaveBeenCalledWith({
        field: 'legalBusinessName',
        value: 'New Name'
      });
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
      
      act(() => {
        result.current.handleEntityTypeChange('Rollup Entity');
      });
      
      expect(mockDispatch).toHaveBeenCalledWith({
        field: 'entityType',
        value: 'Rollup Entity'
      });
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
  });

  describe('File Upload Handling', () => {
    it('should handle valid file upload', async () => {
      const { convertFileToBase64, validateImageFile } = require('commonApp/imageUtils');
      validateImageFile.mockReturnValue({ isValid: true });
      convertFileToBase64.mockResolvedValue({ success: true, data: 'base64data' });
      
      const { result } = renderWithProviders(() => useEntityForm());
      
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      
      await act(async () => {
        await result.current.handleFileUpload(file);
      });
      
      expect(validateImageFile).toHaveBeenCalledWith(file, 10, ['.png', '.jpeg', '.jpg', '.svg']);
      expect(convertFileToBase64).toHaveBeenCalledWith(file);
      expect(mockDispatch).toHaveBeenCalledWith({
        field: 'entityLogo',
        value: file
      });
      expect(mockDispatch).toHaveBeenCalledWith({
        field: 'logo',
        value: 'base64data'
      });
    });

    it('should handle invalid file upload', async () => {
      const { validateImageFile } = require('commonApp/imageUtils');
      validateImageFile.mockReturnValue({ isValid: false, error: 'Invalid file' });
      
      const { result } = renderWithProviders(() => useEntityForm());
      
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      
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
      
      await act(async () => {
        await result.current.handleFileUpload(file);
      });
      
      expect(validateImageFile).toHaveBeenCalled();
      expect(convertFileToBase64).toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should handle null file', async () => {
      const { result } = renderWithProviders(() => useEntityForm());
      
      await act(async () => {
        await result.current.handleFileUpload(null);
      });
      
      expect(mockDispatch).toHaveBeenCalledWith({
        field: 'entityLogo',
        value: null
      });
      expect(mockDispatch).toHaveBeenCalledWith({
        field: 'logo',
        value: null
      });
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
      
      // Should be enabled when all required fields are filled
      expect(result.current.isSaveEnabled()).toBe(true);
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
      const { useParams } = require('react-router-dom');
      useParams.mockReturnValue({});
      
      const { result } = renderWithProviders(() => useEntityForm());
      
      expect(result.current.isEditMode).toBe(false);
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
});
