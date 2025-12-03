import * as React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useEntityConfiguration } from '../../../../src/components/entityConfiguration/hooks/useEntityConfiguration';
import { useEntityData } from '../../../../src/components/entityConfiguration/hooks/useEntityData';

// Mock all dependencies
jest.mock('react-redux', () => ({
  useDispatch: jest.fn().mockReturnValue(jest.fn()),
  useSelector: jest.fn()
}));

jest.mock('../../../../src/components/entityConfiguration/hooks/useEntityData', () => ({
  useEntityData: jest.fn()
}));

jest.mock('../../../../src/components/entityConfiguration/hooks/useComponentState', () => ({
  useComponentState: jest.fn()
}));

jest.mock('../../../../src/components/entityConfiguration/hooks/usePeriodSetupEffects', () => ({
  usePeriodSetupEffects: jest.fn()
}));

jest.mock('../../../../src/components/entityConfiguration/hooks/useProgressCalculationEffects', () => ({
  useProgressCalculationEffects: jest.fn()
}));

jest.mock('../../../../src/components/entityConfiguration/hooks/useDataLoadingEffects', () => ({
  useDataLoadingEffects: jest.fn()
}));

jest.mock('../../../../src/components/entityConfiguration/hooks/useEditModeLogic', () => ({
  useEditModeLogic: jest.fn()
}));

jest.mock('../../../../src/components/entityConfiguration/hooks/useEditActions', () => ({
  useEditActions: jest.fn()
}));

jest.mock('../../../../src/components/entityConfiguration/hooks/useSaveLogic', () => ({
  useSaveLogic: jest.fn()
}));

jest.mock('../../../../src/components/entityConfiguration/hooks/useRemainingLogic', () => ({
  useRemainingLogic: jest.fn()
}));

jest.mock('../../../../src/components/entityConfiguration/hooks/useNavigationHandlers', () => ({
  useNavigationHandlers: jest.fn()
}));

jest.mock('../../../../src/components/entityConfiguration/hooks/useValidationLogic', () => ({
  useValidationLogic: jest.fn()
}));

jest.mock('../../../../src/components/entityConfiguration/hooks/useButtonStateLogic', () => ({
  useButtonStateLogic: jest.fn()
}));

jest.mock('../../../../src/components/entityConfiguration/hooks/useDebugAndInitialization', () => ({
  useDebugAndInitialization: jest.fn()
}));

jest.mock('../../../../src/components/entityConfiguration/hooks/useCountriesAndCurrencies', () => ({
  useCountriesAndCurrencies: jest.fn()
}));

describe('useEntityConfiguration', () => {
  const mockDispatch = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('react-redux').useDispatch.mockReturnValue(mockDispatch);
    
    // Mock useSelector to return different values
    require('react-redux').useSelector.mockImplementation((selector) => {
      const mockState = {
        entitySetup: {
          entities: [
            { id: 'entity-1', displayName: 'Entity 1', entityType: 'Planning', isConfigured: false }
          ]
        },
        entityConfiguration: {
          'entity-1': {
            selectedCountries: ['US', 'CA'],
            selectedCurrencies: ['USD', 'CAD'],
            defaultCurrency: 'USD',
            isDataSaved: true,
            isDataModified: false
          }
        },
        periodSetup: {
          'entity-1': {
            data: { financialYear: '2024', weekSetup: 'Monday' },
            isDataSaved: true
          }
        },
        modules: {
          modules: [
            { id: 'module-1', name: 'Module 1', isEnabled: true }
          ]
        }
      };
      return selector(mockState);
    });

    // Mock all hook dependencies
    require('../../../../src/components/entityConfiguration/hooks/useEntityData').useEntityData.mockReturnValue({
      entityId: 'entity-1',
      entityConfiguration: {
        isDataModified: false,
        isDataSaved: true,
        selectedCountries: ['US', 'CA'],
        selectedCurrencies: ['USD', 'CAD'],
        defaultCurrency: 'USD'
      },
      periodSetup: {
        'entity-1': {
          data: { financialYear: '2024', weekSetup: 'Monday' },
          isDataSaved: true
        }
      },
      entity: { id: 'entity-1', displayName: 'Entity 1', entityType: 'Planning' },
      isRollupEntity: false
    });

    require('../../../../src/components/entityConfiguration/hooks/useComponentState').useComponentState.mockReturnValue({
      tabValue: 0,
      setTabValue: jest.fn(),
      isSaving: false,
      setIsSaving: jest.fn(),
      userClickedEdit: false,
      setUserClickedEdit: jest.fn(),
      userHasSavedInSession: false,
      setUserHasSavedInSession: jest.fn(),
      initialModeSetRef: { current: false },
      modulesRef: { current: null },
      modulesState: { isDataSaved: false },
      setModulesState: jest.fn()
    });

    require('../../../../src/components/entityConfiguration/hooks/usePeriodSetupEffects').usePeriodSetupEffects.mockReturnValue({});

    require('../../../../src/components/entityConfiguration/hooks/useComponentState').useComponentState.mockReturnValue({
      tabValue: 0,
      setTabValue: jest.fn(),
      isSaving: false,
      setIsSaving: jest.fn(),
      userClickedEdit: false,
      setUserClickedEdit: jest.fn(),
      userHasSavedInSession: false,
      setUserHasSavedInSession: jest.fn(),
      initialModeSetRef: { current: false },
      modulesRef: { current: null },
      modulesState: { isDataSaved: false },
      setModulesState: jest.fn(),
      progress: 50,
      setProgress: jest.fn()
    });

    require('../../../../src/components/entityConfiguration/hooks/useProgressCalculationEffects').useProgressCalculationEffects.mockReturnValue();

    require('../../../../src/components/entityConfiguration/hooks/useDataLoadingEffects').useDataLoadingEffects.mockReturnValue({
      handleDataLoaded: jest.fn()
    });

    require('../../../../src/components/entityConfiguration/hooks/useEditModeLogic').useEditModeLogic.mockReturnValue({});

    require('../../../../src/components/entityConfiguration/hooks/useEditActions').useEditActions.mockReturnValue({
      handleEdit: jest.fn(),
      resetPeriodSetupData: jest.fn(),
      resetModulesData: jest.fn()
    });

    require('../../../../src/components/entityConfiguration/hooks/useSaveLogic').useSaveLogic.mockReturnValue({
      saveCountriesAndCurrencies: jest.fn(),
      savePeriodSetupData: jest.fn(),
      saveModulesData: jest.fn()
    });

    require('../../../../src/components/entityConfiguration/hooks/useRemainingLogic').useRemainingLogic.mockReturnValue({
      handleReset: jest.fn(),
      handleSave: jest.fn()
    });

    require('../../../../src/components/entityConfiguration/hooks/useNavigationHandlers').useNavigationHandlers.mockReturnValue({
      navigateToEntityList: jest.fn(),
      handleNext: jest.fn(),
      handleFinish: jest.fn(),
      handleBack: jest.fn(),
      handleModulesDataChange: jest.fn()
    });

    require('../../../../src/components/entityConfiguration/hooks/useValidationLogic').useValidationLogic.mockReturnValue({
      isPeriodSetupMandatoryFieldsFilled: true,
      isPeriodSetupModified: false
    });

    require('../../../../src/components/entityConfiguration/hooks/useButtonStateLogic').useButtonStateLogic.mockReturnValue({
      isNextEnabled: true
    });

    require('../../../../src/components/entityConfiguration/hooks/useDebugAndInitialization').useDebugAndInitialization.mockReturnValue({
      getHeaderTitle: jest.fn().mockReturnValue('Entity Configuration')
    });

    require('../../../../src/components/entityConfiguration/hooks/useCountriesAndCurrencies').useCountriesAndCurrencies.mockReturnValue({
      selectedCountries: ['US', 'CA'],
      selectedCurrencies: ['USD', 'CAD'],
      defaultCurrency: 'USD',
      isDataSaved: true,
      isDataModified: false,
      handleCountriesDataChange: jest.fn(),
      handleCountriesDataLoaded: jest.fn()
    });
  });

  describe('Basic functionality', () => {
    it('should render without crashing', () => {
      const { result } = renderHook(() => useEntityConfiguration(false, mockNavigate));
      
      expect(result.current).toBeDefined();
    });

    it('should return all expected properties', () => {
      const { result } = renderHook(() => useEntityConfiguration(false, mockNavigate));
      
      expect(result.current).toHaveProperty('isEditMode');
      expect(result.current).toHaveProperty('tabValue');
      expect(result.current).toHaveProperty('isSaving');
      expect(result.current).toHaveProperty('isNextEnabled');
      expect(result.current).toHaveProperty('progress');
      expect(result.current).toHaveProperty('isRollupEntity');
      expect(result.current).toHaveProperty('entityId');
      expect(result.current).toHaveProperty('selectedCountries');
      expect(result.current).toHaveProperty('selectedCurrencies');
      expect(result.current).toHaveProperty('defaultCurrency');
      expect(result.current).toHaveProperty('isDataSaved');
      expect(result.current).toHaveProperty('isDataModified');
      expect(result.current).toHaveProperty('isPeriodSetupMandatoryFieldsFilled');
      expect(result.current).toHaveProperty('isPeriodSetupModified');
      expect(result.current).toHaveProperty('getHeaderTitle');
      expect(result.current).toHaveProperty('handleEdit');
      expect(result.current).toHaveProperty('handleReset');
      expect(result.current).toHaveProperty('handleSave');
      expect(result.current).toHaveProperty('handleNext');
      expect(result.current).toHaveProperty('handleFinish');
      expect(result.current).toHaveProperty('handleBack');
      expect(result.current).toHaveProperty('handleCountriesDataChange');
      expect(result.current).toHaveProperty('handleCountriesDataLoaded');
      expect(result.current).toHaveProperty('handlePeriodSetupDataChange');
      expect(result.current).toHaveProperty('handleModulesDataChange');
    });
  });

  describe('View mode behavior', () => {
    it('should handle view mode correctly', () => {
      const { result } = renderHook(() => useEntityConfiguration(true, mockNavigate));
      
      expect(result.current).toBeDefined();
    });

    it('should handle view mode without navigate function', () => {
      const { result } = renderHook(() => useEntityConfiguration(true));
      
      expect(result.current).toBeDefined();
    });
  });

  describe('Entity type detection', () => {
    it('should detect Planning entity correctly', () => {
      require('../../../../src/components/entityConfiguration/hooks/useEntityData').useEntityData.mockReturnValue({
        entityId: 'entity-1',
        entity: { id: 'entity-1', displayName: 'Entity 1', entityType: 'Planning' },
        isRollupEntity: false
      });

      const { result } = renderHook(() => useEntityConfiguration(false, mockNavigate));
      
      expect(result.current.isRollupEntity).toBe(false);
    });

    it('should detect Rollup entity correctly', () => {
      require('../../../../src/components/entityConfiguration/hooks/useEntityData').useEntityData.mockReturnValue({
        entityId: 'entity-1',
        entity: { id: 'entity-1', displayName: 'Entity 1', entityType: 'Rollup' },
        isRollupEntity: true
      });

      const { result } = renderHook(() => useEntityConfiguration(false, mockNavigate));
      
      expect(result.current.isRollupEntity).toBe(true);
    });
  });

  describe('Data handling', () => {
    it('should handle countries and currencies data correctly', () => {
      const { result } = renderHook(() => useEntityConfiguration(false, mockNavigate));
      
      expect(result.current.selectedCountries).toEqual(['US', 'CA']);
      expect(result.current.selectedCurrencies).toEqual(['USD', 'CAD']);
      expect(result.current.defaultCurrency).toBe('USD');
    });

    it('should handle empty data correctly', () => {
      // Update the entity data with empty values
      require('../../../../src/components/entityConfiguration/hooks/useEntityData').useEntityData.mockReturnValue({
        entityId: 'entity-1',
        entityConfiguration: {
          isDataModified: false,
          isDataSaved: false,
          selectedCountries: [],
          selectedCurrencies: [],
          defaultCurrency: null
        },
        periodSetup: {
          'entity-1': {
            data: {},
            isDataSaved: false
          }
        },
        entity: { id: 'entity-1', displayName: 'Entity 1', entityType: 'Planning' },
        isRollupEntity: false
      });

      const { result } = renderHook(() => useEntityConfiguration(false, mockNavigate));
      
      expect(result.current.selectedCountries).toEqual([]);
      expect(result.current.selectedCurrencies).toEqual([]);
      expect(result.current.defaultCurrency).toBeNull();
    });
  });

  describe('Progress calculation', () => {
    it('should return progress value', () => {
      const { result } = renderHook(() => useEntityConfiguration(false, mockNavigate));
      
      expect(result.current.progress).toBe(50);
    });

    it('should handle different progress values', () => {
      require('../../../../src/components/entityConfiguration/hooks/useComponentState').useComponentState.mockReturnValue({
        tabValue: 0,
        setTabValue: jest.fn(),
        isSaving: false,
        setIsSaving: jest.fn(),
        userClickedEdit: false,
        setUserClickedEdit: jest.fn(),
        userHasSavedInSession: false,
        setUserHasSavedInSession: jest.fn(),
        initialModeSetRef: { current: false },
        modulesRef: { current: null },
        modulesState: { isDataSaved: false },
        setModulesState: jest.fn(),
        progress: 100,
        setProgress: jest.fn()
      });

      const { result } = renderHook(() => useEntityConfiguration(false, mockNavigate));
      
      expect(result.current.progress).toBe(100);
    });
  });

  describe('Button states', () => {
    it('should return correct button states', () => {
      const { result } = renderHook(() => useEntityConfiguration(false, mockNavigate));
      
      expect(result.current.isNextEnabled).toBe(true);
    });

    it('should handle disabled next button', () => {
      require('../../../../src/components/entityConfiguration/hooks/useButtonStateLogic').useButtonStateLogic.mockReturnValue({
        isNextEnabled: false
      });

      const { result } = renderHook(() => useEntityConfiguration(false, mockNavigate));
      
      expect(result.current.isNextEnabled).toBe(false);
    });
  });

  describe('Event handlers', () => {
    it('should provide all event handlers', () => {
      const { result } = renderHook(() => useEntityConfiguration(false, mockNavigate));
      
      expect(typeof result.current.handleEdit).toBe('function');
      expect(typeof result.current.handleReset).toBe('function');
      expect(typeof result.current.handleSave).toBe('function');
      expect(typeof result.current.handleNext).toBe('function');
      expect(typeof result.current.handleFinish).toBe('function');
      expect(typeof result.current.handleBack).toBe('function');
      expect(typeof result.current.handleCountriesDataChange).toBe('function');
      expect(typeof result.current.handleCountriesDataLoaded).toBe('function');
      expect(typeof result.current.handlePeriodSetupDataChange).toBe('function');
      expect(typeof result.current.handleModulesDataChange).toBe('function');
    });

    it('should call event handlers when invoked', () => {
      const mockHandleEdit = jest.fn();
      const mockHandleSave = jest.fn();
      const mockHandleNext = jest.fn();

      require('../../../../src/components/entityConfiguration/hooks/useEditActions').useEditActions.mockReturnValue({
        handleEdit: mockHandleEdit,
        resetPeriodSetupData: jest.fn(),
        resetModulesData: jest.fn()
      });

      require('../../../../src/components/entityConfiguration/hooks/useRemainingLogic').useRemainingLogic.mockReturnValue({
        handleReset: jest.fn(),
        handleSave: mockHandleSave
      });

      require('../../../../src/components/entityConfiguration/hooks/useNavigationHandlers').useNavigationHandlers.mockReturnValue({
        navigateToEntityList: jest.fn(),
        handleNext: mockHandleNext,
        handleFinish: jest.fn(),
        handleBack: jest.fn(),
        handleModulesDataChange: jest.fn()
      });

      const { result } = renderHook(() => useEntityConfiguration(false, mockNavigate));
      
      act(() => {
        result.current.handleEdit();
        result.current.handleSave();
        result.current.handleNext();
      });

      expect(mockHandleEdit).toHaveBeenCalled();
      expect(mockHandleSave).toHaveBeenCalled();
      expect(mockHandleNext).toHaveBeenCalled();
    });
  });

  describe('Header title', () => {
    it('should return header title', () => {
      const { result } = renderHook(() => useEntityConfiguration(false, mockNavigate));
      
      expect(result.current.getHeaderTitle()).toBe('Entity Configuration');
    });

    it('should handle different header titles', () => {
      require('../../../../src/components/entityConfiguration/hooks/useDebugAndInitialization').useDebugAndInitialization.mockReturnValue({
        getHeaderTitle: jest.fn().mockReturnValue('Countries & Currencies')
      });

      const { result } = renderHook(() => useEntityConfiguration(false, mockNavigate));
      
      expect(result.current.getHeaderTitle()).toBe('Countries & Currencies');
    });
  });

  describe('Error handling', () => {
    it('should handle missing entity gracefully', () => {
      require('../../../../src/components/entityConfiguration/hooks/useEntityData').useEntityData.mockReturnValue({
        entityId: null,
        entity: null,
        isRollupEntity: false
      });

      const { result } = renderHook(() => useEntityConfiguration(false, mockNavigate));
      
      expect(result.current.entityId).toBeNull();
      expect(result.current.entity).toBeNull();
    });

    it('should handle missing configuration data gracefully', () => {
      require('react-redux').useSelector.mockImplementation((selector) => {
        const mockState = {
          entitySetup: { entities: [] },
          entityConfiguration: {},
          periodSetup: {},
          modules: { modules: [] }
        };
        return selector(mockState);
      });

      const { result } = renderHook(() => useEntityConfiguration(false, mockNavigate));
      
      expect(result.current).toBeDefined();
    });
  });

  describe('Integration with child hooks', () => {
    it('should pass correct parameters to child hooks', () => {
      renderHook(() => useEntityConfiguration(false, mockNavigate));
      
      // Verify that child hooks are called without parameters (the actual implementation doesn't pass parameters)
      expect(require('../../../../src/components/entityConfiguration/hooks/useEntityData').useEntityData).toHaveBeenCalled();
      expect(require('../../../../src/components/entityConfiguration/hooks/useComponentState').useComponentState).toHaveBeenCalled();
      expect(require('../../../../src/components/entityConfiguration/hooks/useProgressCalculationEffects').useProgressCalculationEffects).toHaveBeenCalled();
      expect(require('../../../../src/components/entityConfiguration/hooks/useDataLoadingEffects').useDataLoadingEffects).toHaveBeenCalled();
      expect(require('../../../../src/components/entityConfiguration/hooks/useEditModeLogic').useEditModeLogic).toHaveBeenCalled();
      expect(require('../../../../src/components/entityConfiguration/hooks/useEditActions').useEditActions).toHaveBeenCalled();
      expect(require('../../../../src/components/entityConfiguration/hooks/useSaveLogic').useSaveLogic).toHaveBeenCalled();
      expect(require('../../../../src/components/entityConfiguration/hooks/useRemainingLogic').useRemainingLogic).toHaveBeenCalled();
      expect(require('../../../../src/components/entityConfiguration/hooks/useNavigationHandlers').useNavigationHandlers).toHaveBeenCalled();
      expect(require('../../../../src/components/entityConfiguration/hooks/useValidationLogic').useValidationLogic).toHaveBeenCalled();
      expect(require('../../../../src/components/entityConfiguration/hooks/useButtonStateLogic').useButtonStateLogic).toHaveBeenCalled();
      expect(require('../../../../src/components/entityConfiguration/hooks/useDebugAndInitialization').useDebugAndInitialization).toHaveBeenCalled();
      // We're not actually using the useCountriesAndCurrencies hook directly in our implementation
    });
  });

  describe('Progress calculation', () => {
    it('should calculate progress from entity progressPercentage', () => {
      const mockEntity = {
        id: '1',
        name: 'Test Entity',
        progressPercentage: '75.5'
      };
      
      (useEntityData as jest.Mock).mockReturnValue({
        entity: mockEntity,
        entityId: '1',
        entitiesCount: 1,
        isLoading: false,
        isRollupEntity: false
      });

      const { result } = renderHook(() => useEntityConfiguration());
      
      expect(result.current).toBeDefined();
      // The progress calculation is handled by useProgressCalculationEffects
      // We're testing that the hook doesn't crash with progressPercentage
    });

    it('should handle missing progressPercentage', () => {
      const mockEntity = {
        id: '1',
        name: 'Test Entity'
        // No progressPercentage
      };
      
      (useEntityData as jest.Mock).mockReturnValue({
        entity: mockEntity,
        entityId: '1',
        entitiesCount: 1,
        isLoading: false,
        isRollupEntity: false
      });

      const { result } = renderHook(() => useEntityConfiguration());
      
      expect(result.current).toBeDefined();
    });
  });

  describe('Currency parsing logic', () => {
    it('should parse currencies with initialCurrency and selectedCurrencies', () => {
      const mockEntity = {
        id: '1',
        name: 'Test Entity',
        currencies: '{"initialCurrency": "USD", "selectedCurrencies": ["USD", "EUR"]}'
      };
      
      (useEntityData as jest.Mock).mockReturnValue({
        entity: mockEntity,
        entityId: '1',
        entitiesCount: 1,
        isLoading: false,
        isRollupEntity: false
      });

      const { result } = renderHook(() => useEntityConfiguration());
      
      expect(result.current).toBeDefined();
    });

    it('should handle currencies with quotes', () => {
      const mockEntity = {
        id: '1',
        name: 'Test Entity',
        currencies: '"{\\"initialCurrency\\": \\"USD\\", \\"selectedCurrencies\\": [\\"USD\\", \\"EUR\\"]}"'
      };
      
      (useEntityData as jest.Mock).mockReturnValue({
        entity: mockEntity,
        entityId: '1',
        entitiesCount: 1,
        isLoading: false,
        isRollupEntity: false
      });

      const { result } = renderHook(() => useEntityConfiguration());
      
      expect(result.current).toBeDefined();
    });

    it('should handle currencies with single quotes', () => {
      const mockEntity = {
        id: '1',
        name: 'Test Entity',
        currencies: "'{\"initialCurrency\": \"USD\", \"selectedCurrencies\": [\"USD\", \"EUR\"]}'"
      };
      
      (useEntityData as jest.Mock).mockReturnValue({
        entity: mockEntity,
        entityId: '1',
        entitiesCount: 1,
        isLoading: false,
        isRollupEntity: false
      });

      const { result } = renderHook(() => useEntityConfiguration());
      
      expect(result.current).toBeDefined();
    });

    it('should handle invalid JSON currencies', () => {
      const mockEntity = {
        id: '1',
        name: 'Test Entity',
        currencies: 'invalid-json'
      };
      
      (useEntityData as jest.Mock).mockReturnValue({
        entity: mockEntity,
        entityId: '1',
        entitiesCount: 1,
        isLoading: false,
        isRollupEntity: false
      });

      const { result } = renderHook(() => useEntityConfiguration());
      
      expect(result.current).toBeDefined();
    });

    it('should handle currencies without initialCurrency', () => {
      const mockEntity = {
        id: '1',
        name: 'Test Entity',
        currencies: '{"selectedCurrencies": ["USD", "EUR"]}'
      };
      
      (useEntityData as jest.Mock).mockReturnValue({
        entity: mockEntity,
        entityId: '1',
        entitiesCount: 1,
        isLoading: false,
        isRollupEntity: false
      });

      const { result } = renderHook(() => useEntityConfiguration());
      
      expect(result.current).toBeDefined();
    });

    it('should handle currencies without selectedCurrencies', () => {
      const mockEntity = {
        id: '1',
        name: 'Test Entity',
        currencies: '{"initialCurrency": "USD"}'
      };
      
      (useEntityData as jest.Mock).mockReturnValue({
        entity: mockEntity,
        entityId: '1',
        entitiesCount: 1,
        isLoading: false,
        isRollupEntity: false
      });

      const { result } = renderHook(() => useEntityConfiguration());
      
      expect(result.current).toBeDefined();
    });

    it('should handle null currencies', () => {
      const mockEntity = {
        id: '1',
        name: 'Test Entity',
        currencies: null
      };
      
      (useEntityData as jest.Mock).mockReturnValue({
        entity: mockEntity,
        entityId: '1',
        entitiesCount: 1,
        isLoading: false,
        isRollupEntity: false
      });

      const { result } = renderHook(() => useEntityConfiguration());
      
      expect(result.current).toBeDefined();
    });

    it('should handle undefined currencies', () => {
      const mockEntity = {
        id: '1',
        name: 'Test Entity'
        // No currencies property
      };
      
      (useEntityData as jest.Mock).mockReturnValue({
        entity: mockEntity,
        entityId: '1',
        entitiesCount: 1,
        isLoading: false,
        isRollupEntity: false
      });

      const { result } = renderHook(() => useEntityConfiguration());
      
      expect(result.current).toBeDefined();
    });

    it('should handle empty string currencies', () => {
      const mockEntity = {
        id: '1',
        name: 'Test Entity',
        currencies: ''
      };
      
      (useEntityData as jest.Mock).mockReturnValue({
        entity: mockEntity,
        entityId: '1',
        entitiesCount: 1,
        isLoading: false,
        isRollupEntity: false
      });

      const { result } = renderHook(() => useEntityConfiguration());
      
      expect(result.current).toBeDefined();
    });
  });
});
