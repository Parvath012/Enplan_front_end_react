import {
  ENTITY_CONFIGURATION_ACTIONS,
  setSelectedCountries,
  setSelectedCurrencies,
  setDefaultCurrency,
  setIsDefaultCurrency,
  setOriginalData,
  setDataModified,
  setDataSaved,
  resetConfiguration,
  toggleCountry,
  toggleCurrency,
  setDefaultCurrencyAction,
  saveConfiguration,
  resetConfigurationAction,
  isCountriesTabNextEnabled,
  isPeriodSetupTabNextEnabled,
  isModulesTabNextEnabled,
  getEditButtonVisibility,
  getFormModifiedState,
  getSaveDisabledState,
  getHeaderTitle,
  isNewlyCreatedEntity,
  determineEditMode,
  isPeriodSetupMandatoryFieldsFilled,
  isPeriodSetupModified,
} from '../../../src/store/Actions/entityConfigurationActions';

// Mock console.log to avoid noise in tests
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('entityConfigurationActions', () => {
  describe('Action Types', () => {
    it('should have correct action type constants', () => {
      expect(ENTITY_CONFIGURATION_ACTIONS.SET_SELECTED_COUNTRIES).toBe('entityConfiguration/setSelectedCountries');
      expect(ENTITY_CONFIGURATION_ACTIONS.SET_SELECTED_CURRENCIES).toBe('entityConfiguration/setSelectedCurrencies');
      expect(ENTITY_CONFIGURATION_ACTIONS.SET_DEFAULT_CURRENCY).toBe('entityConfiguration/setDefaultCurrency');
      expect(ENTITY_CONFIGURATION_ACTIONS.SET_IS_DEFAULT_CURRENCY).toBe('entityConfiguration/setIsDefaultCurrency');
      expect(ENTITY_CONFIGURATION_ACTIONS.SET_ORIGINAL_DATA).toBe('entityConfiguration/setOriginalData');
      expect(ENTITY_CONFIGURATION_ACTIONS.SET_DATA_MODIFIED).toBe('entityConfiguration/setDataModified');
      expect(ENTITY_CONFIGURATION_ACTIONS.SET_DATA_SAVED).toBe('entityConfiguration/setDataSaved');
      expect(ENTITY_CONFIGURATION_ACTIONS.RESET_CONFIGURATION).toBe('entityConfiguration/resetConfiguration');
    });
  });

  describe('Action Creators', () => {
    it('should create setSelectedCountries action', () => {
      const action = setSelectedCountries({ entityId: 'test-id', countries: ['US', 'CA'] });
      expect(action.type).toBe(ENTITY_CONFIGURATION_ACTIONS.SET_SELECTED_COUNTRIES);
      expect(action.payload).toEqual({ entityId: 'test-id', countries: ['US', 'CA'] });
    });

    it('should create setSelectedCurrencies action', () => {
      const action = setSelectedCurrencies({ entityId: 'test-id', currencies: ['USD', 'CAD'] });
      expect(action.type).toBe(ENTITY_CONFIGURATION_ACTIONS.SET_SELECTED_CURRENCIES);
      expect(action.payload).toEqual({ entityId: 'test-id', currencies: ['USD', 'CAD'] });
    });

    it('should create setDefaultCurrency action', () => {
      const action = setDefaultCurrency({ entityId: 'test-id', defaultCurrency: ['USD'] });
      expect(action.type).toBe(ENTITY_CONFIGURATION_ACTIONS.SET_DEFAULT_CURRENCY);
      expect(action.payload).toEqual({ entityId: 'test-id', defaultCurrency: ['USD'] });
    });

    it('should create setIsDefaultCurrency action', () => {
      const action = setIsDefaultCurrency({ entityId: 'test-id', isDefault: 'USD' });
      expect(action.type).toBe(ENTITY_CONFIGURATION_ACTIONS.SET_IS_DEFAULT_CURRENCY);
      expect(action.payload).toEqual({ entityId: 'test-id', isDefault: 'USD' });
    });

    it('should create setOriginalData action', () => {
      const action = setOriginalData({
        entityId: 'test-id',
        data: {
          countries: ['US'],
          currencies: ['USD'],
          defaultCurrency: ['USD'],
          isDefault: 'USD',
          isInitialCurrency: true,
        },
      });
      expect(action.type).toBe(ENTITY_CONFIGURATION_ACTIONS.SET_ORIGINAL_DATA);
      expect(action.payload).toEqual({
        entityId: 'test-id',
        data: {
          countries: ['US'],
          currencies: ['USD'],
          defaultCurrency: ['USD'],
          isDefault: 'USD',
          isInitialCurrency: true,
        },
      });
    });

    it('should create setDataModified action', () => {
      const action = setDataModified({ entityId: 'test-id', isModified: true });
      expect(action.type).toBe(ENTITY_CONFIGURATION_ACTIONS.SET_DATA_MODIFIED);
      expect(action.payload).toEqual({ entityId: 'test-id', isModified: true });
    });

    it('should create setDataSaved action', () => {
      const action = setDataSaved({ entityId: 'test-id', isSaved: true });
      expect(action.type).toBe(ENTITY_CONFIGURATION_ACTIONS.SET_DATA_SAVED);
      expect(action.payload).toEqual({ entityId: 'test-id', isSaved: true });
    });

    it('should create resetConfiguration action', () => {
      const action = resetConfiguration({ entityId: 'test-id' });
      expect(action.type).toBe(ENTITY_CONFIGURATION_ACTIONS.RESET_CONFIGURATION);
      expect(action.payload).toEqual({ entityId: 'test-id' });
    });
  });

  describe('Thunk Actions', () => {
    let mockDispatch: jest.Mock;
    let mockGetState: jest.Mock;

    beforeEach(() => {
      mockDispatch = jest.fn();
      mockGetState = jest.fn();
    });

    describe('toggleCountry', () => {
      it('should add country when not selected', () => {
        const mockState = {
          entityConfiguration: {
            'test-id': {
              selectedCountries: ['US'],
              selectedCurrencies: [],
              defaultCurrency: [],
              isDefault: null,
              originalData: { countries: [], currencies: [], defaultCurrency: [], isDefault: null },
              isDataModified: false,
              isDataSaved: false,
            },
          },
          entities: {
            items: [{ id: 'test-id', country: 'US' }],
          },
        };
        mockGetState.mockReturnValue(mockState);

        const thunk = toggleCountry('CA', 'test-id');
        thunk(mockDispatch, mockGetState);

        expect(mockDispatch).toHaveBeenCalledWith(
          setSelectedCountries({ entityId: 'test-id', countries: ['US', 'CA'] })
        );
        expect(mockDispatch).toHaveBeenCalledWith(
          setDataModified({ entityId: 'test-id', isModified: expect.any(Boolean) })
        );
      });

      it('should remove country when selected', () => {
        const mockState = {
          entityConfiguration: {
            'test-id': {
              selectedCountries: ['US', 'CA'],
              selectedCurrencies: [],
              defaultCurrency: [],
              isDefault: null,
              originalData: { countries: [], currencies: [], defaultCurrency: [], isDefault: null },
              isDataModified: false,
              isDataSaved: false,
            },
          },
          entities: {
            items: [{ id: 'test-id', country: 'US' }],
          },
        };
        mockGetState.mockReturnValue(mockState);

        const thunk = toggleCountry('CA', 'test-id');
        thunk(mockDispatch, mockGetState);

        expect(mockDispatch).toHaveBeenCalledWith(
          setSelectedCountries({ entityId: 'test-id', countries: ['US'] })
        );
      });

      it('should not remove pre-populated country', () => {
        const mockState = {
          entityConfiguration: {
            'test-id': {
              selectedCountries: ['US', 'CA'],
              selectedCurrencies: [],
              defaultCurrency: [],
              isDefault: null,
              originalData: { countries: [], currencies: [], defaultCurrency: [], isDefault: null },
              isDataModified: false,
              isDataSaved: false,
            },
          },
          entities: {
            items: [{ id: 'test-id', country: 'US' }],
          },
        };
        mockGetState.mockReturnValue(mockState);

        const thunk = toggleCountry('US', 'test-id');
        thunk(mockDispatch, mockGetState);

        // Should not dispatch any action for pre-populated country
        expect(mockDispatch).not.toHaveBeenCalledWith(
          setSelectedCountries({ entityId: 'test-id', countries: ['CA'] })
        );
      });
    });

    describe('toggleCurrency', () => {
      it('should add currency when not selected', () => {
        const mockState = {
          entityConfiguration: {
            'test-id': {
              selectedCountries: [],
              selectedCurrencies: ['USD'],
              defaultCurrency: [],
              isDefault: null,
              originalData: { countries: [], currencies: [], defaultCurrency: [], isDefault: null },
              isDataModified: false,
              isDataSaved: false,
            },
          },
        };
        mockGetState.mockReturnValue(mockState);

        const thunk = toggleCurrency('CAD', 'test-id');
        thunk(mockDispatch, mockGetState);

        expect(mockDispatch).toHaveBeenCalledWith(
          setSelectedCurrencies({ entityId: 'test-id', currencies: ['USD', 'CAD'] })
        );
      });

      it('should remove currency when selected', () => {
        const mockState = {
          entityConfiguration: {
            'test-id': {
              selectedCountries: [],
              selectedCurrencies: ['USD', 'CAD'],
              defaultCurrency: [],
              isDefault: null,
              originalData: { countries: [], currencies: [], defaultCurrency: [], isDefault: null },
              isDataModified: false,
              isDataSaved: false,
            },
          },
        };
        mockGetState.mockReturnValue(mockState);

        const thunk = toggleCurrency('CAD', 'test-id');
        thunk(mockDispatch, mockGetState);

        expect(mockDispatch).toHaveBeenCalledWith(
          setSelectedCurrencies({ entityId: 'test-id', currencies: ['USD'] })
        );
      });

      it('should not remove currency in defaultCurrency', () => {
        const mockState = {
          entityConfiguration: {
            'test-id': {
              selectedCountries: [],
              selectedCurrencies: ['USD', 'CAD'],
              defaultCurrency: ['USD'],
              isDefault: null,
              originalData: { countries: [], currencies: [], defaultCurrency: [], isDefault: null },
              isDataModified: false,
              isDataSaved: false,
            },
          },
        };
        mockGetState.mockReturnValue(mockState);

        const thunk = toggleCurrency('USD', 'test-id');
        thunk(mockDispatch, mockGetState);

        // Should not dispatch any action for currency in defaultCurrency
        expect(mockDispatch).not.toHaveBeenCalledWith(
          setSelectedCurrencies({ entityId: 'test-id', currencies: ['CAD'] })
        );
      });

      it('should clear isDefault when removing currency that was default', () => {
        const mockState = {
          entityConfiguration: {
            'test-id': {
              selectedCountries: [],
              selectedCurrencies: ['USD', 'CAD'],
              defaultCurrency: [],
              isDefault: 'CAD',
              originalData: { countries: [], currencies: [], defaultCurrency: [], isDefault: null },
              isDataModified: false,
              isDataSaved: false,
            },
          },
        };
        mockGetState.mockReturnValue(mockState);

        const thunk = toggleCurrency('CAD', 'test-id');
        thunk(mockDispatch, mockGetState);

        expect(mockDispatch).toHaveBeenCalledWith(
          setIsDefaultCurrency({ entityId: 'test-id', isDefault: null })
        );
      });
    });

    describe('setDefaultCurrencyAction', () => {
      it('should set default currency when different from current', () => {
        const mockState = {
          entityConfiguration: {
            'test-id': {
              selectedCountries: [],
              selectedCurrencies: ['USD', 'CAD'],
              defaultCurrency: [],
              isDefault: 'USD',
              originalData: { countries: [], currencies: [], defaultCurrency: [], isDefault: null },
              isDataModified: false,
              isDataSaved: false,
            },
          },
        };
        mockGetState.mockReturnValue(mockState);

        const thunk = setDefaultCurrencyAction('CAD', 'test-id');
        thunk(mockDispatch, mockGetState);

        expect(mockDispatch).toHaveBeenCalledWith(
          setIsDefaultCurrency({ entityId: 'test-id', isDefault: 'CAD' })
        );
        expect(mockDispatch).toHaveBeenCalledWith(
          setDataModified({ entityId: 'test-id', isModified: expect.any(Boolean) })
        );
      });

      it('should not set default currency when same as current', () => {
        const mockState = {
          entityConfiguration: {
            'test-id': {
              selectedCountries: [],
              selectedCurrencies: ['USD', 'CAD'],
              defaultCurrency: [],
              isDefault: 'USD',
              originalData: { countries: [], currencies: [], defaultCurrency: [], isDefault: null },
              isDataModified: false,
              isDataSaved: false,
            },
          },
        };
        mockGetState.mockReturnValue(mockState);

        const thunk = setDefaultCurrencyAction('USD', 'test-id');
        thunk(mockDispatch, mockGetState);

        expect(mockDispatch).not.toHaveBeenCalledWith(
          setIsDefaultCurrency({ entityId: 'test-id', isDefault: 'USD' })
        );
      });
    });

    describe('saveConfiguration', () => {
      it('should save configuration and update state', () => {
        const mockState = {
          entityConfiguration: {
            'test-id': {
              selectedCountries: ['US'],
              selectedCurrencies: ['USD'],
              defaultCurrency: ['USD'],
              isDefault: 'USD',
              originalData: { countries: [], currencies: [], defaultCurrency: [], isDefault: null },
              isDataModified: true,
              isDataSaved: false,
            },
          },
        };
        mockGetState.mockReturnValue(mockState);

        const thunk = saveConfiguration('test-id');
        thunk(mockDispatch, mockGetState);

        expect(mockDispatch).toHaveBeenCalledWith(
          setOriginalData({
            entityId: 'test-id',
            data: {
              countries: ['US'],
              currencies: ['USD'],
              defaultCurrency: ['USD'],
              isDefault: 'USD',
            },
          })
        );
        expect(mockDispatch).toHaveBeenCalledWith(
          setDataModified({ entityId: 'test-id', isModified: false })
        );
        expect(mockDispatch).toHaveBeenCalledWith(
          setDataSaved({ entityId: 'test-id', isSaved: true })
        );
      });
    });

    describe('resetConfigurationAction', () => {
      it('should reset configuration to original data', () => {
        const mockState = {
          entityConfiguration: {
            'test-id': {
              selectedCountries: ['US', 'CA'],
              selectedCurrencies: ['USD', 'CAD'],
              defaultCurrency: ['USD'],
              isDefault: 'USD',
              originalData: {
                countries: ['US'],
                currencies: ['USD'],
                defaultCurrency: ['USD'],
                isDefault: 'USD',
              },
              isDataModified: true,
              isDataSaved: true,
            },
          },
        };
        mockGetState.mockReturnValue(mockState);

        const thunk = resetConfigurationAction('test-id');
        thunk(mockDispatch, mockGetState);

        expect(mockDispatch).toHaveBeenCalledWith(
          setSelectedCountries({ entityId: 'test-id', countries: ['US'] })
        );
        expect(mockDispatch).toHaveBeenCalledWith(
          setSelectedCurrencies({ entityId: 'test-id', currencies: ['USD'] })
        );
        expect(mockDispatch).toHaveBeenCalledWith(
          setDefaultCurrency({ entityId: 'test-id', defaultCurrency: ['USD'] })
        );
        expect(mockDispatch).toHaveBeenCalledWith(
          setIsDefaultCurrency({ entityId: 'test-id', isDefault: 'USD' })
        );
        expect(mockDispatch).toHaveBeenCalledWith(
          setDataModified({ entityId: 'test-id', isModified: false })
        );
      });

      it('should not reset if entity configuration does not exist', () => {
        const mockState = {
          entityConfiguration: {},
        };
        mockGetState.mockReturnValue(mockState);

        const thunk = resetConfigurationAction('test-id');
        thunk(mockDispatch, mockGetState);

        expect(mockDispatch).not.toHaveBeenCalled();
      });
    });
  });

  describe('Helper Functions', () => {
    describe('isCountriesTabNextEnabled', () => {
      it('should enable next button when data is saved and not in edit mode', () => {
        const result = isCountriesTabNextEnabled(['US'], ['USD'], true, false);
        expect(result).toBe(true);
      });

      it('should disable next button when data is not saved', () => {
        const result = isCountriesTabNextEnabled(['US'], ['USD'], false, false);
        expect(result).toBe(false);
      });

      it('should disable next button when in edit mode', () => {
        const result = isCountriesTabNextEnabled(['US'], ['USD'], true, true);
        expect(result).toBe(false);
      });
    });

    describe('isPeriodSetupTabNextEnabled', () => {
      it('should enable next button when data is saved and not in edit mode', () => {
        const periodSetup = {
          'test-id': {
            isDataSaved: true,
          },
        };
        const result = isPeriodSetupTabNextEnabled('test-id', periodSetup, false, false);
        expect(result).toBe(true);
      });

      it('should disable next button when data is not saved', () => {
        const periodSetup = {
          'test-id': {
            isDataSaved: false,
          },
        };
        const result = isPeriodSetupTabNextEnabled('test-id', periodSetup, false, false);
        expect(result).toBe(false);
      });

      it('should disable next button when in edit mode', () => {
        const periodSetup = {
          'test-id': {
            isDataSaved: true,
          },
        };
        const result = isPeriodSetupTabNextEnabled('test-id', periodSetup, true, false);
        expect(result).toBe(false);
      });
    });

    describe('isModulesTabNextEnabled', () => {
      it('should enable next button when data is saved and not in edit mode', () => {
        const modulesState = {
          isDataSaved: true,
        };
        const result = isModulesTabNextEnabled(modulesState, false, false);
        expect(result).toBe(true);
      });

      it('should disable next button when data is not saved', () => {
        const modulesState = {
          isDataSaved: false,
        };
        const result = isModulesTabNextEnabled(modulesState, false, false);
        expect(result).toBe(false);
      });

      it('should disable next button when in edit mode', () => {
        const modulesState = {
          isDataSaved: true,
        };
        const result = isModulesTabNextEnabled(modulesState, true, false);
        expect(result).toBe(false);
      });
    });

    describe('getEditButtonVisibility', () => {
      it('should show edit button for Countries tab when data is saved and not in edit mode', () => {
        const params = {
          tabValue: 0,
          isEditMode: false,
          isDataSaved: true,
          selectedCountries: ['US'],
          selectedCurrencies: ['USD'],
          entityId: 'test-id',
          periodSetup: {},
          modulesState: {},
        };
        const result = getEditButtonVisibility(params);
        expect(result).toBe(true);
      });

      it('should hide edit button for Countries tab when in edit mode', () => {
        const params = {
          tabValue: 0,
          isEditMode: true,
          isDataSaved: true,
          selectedCountries: ['US'],
          selectedCurrencies: ['USD'],
          entityId: 'test-id',
          periodSetup: {},
          modulesState: {},
        };
        const result = getEditButtonVisibility(params);
        expect(result).toBe(false);
      });

      it('should show edit button for Period Setup tab when data is saved and not in edit mode', () => {
        const params = {
          tabValue: 1,
          isEditMode: false,
          isDataSaved: false,
          selectedCountries: [],
          selectedCurrencies: [],
          entityId: 'test-id',
          periodSetup: {
            'test-id': {
              isDataSaved: true,
            },
          },
          modulesState: {},
        };
        const result = getEditButtonVisibility(params);
        expect(result).toBe(true);
      });

      it('should show edit button for Modules tab when data is saved and not in edit mode', () => {
        const params = {
          tabValue: 2,
          isEditMode: false,
          isDataSaved: false,
          selectedCountries: [],
          selectedCurrencies: [],
          entityId: 'test-id',
          periodSetup: {},
          modulesState: {
            isDataSaved: true,
          },
        };
        const result = getEditButtonVisibility(params);
        expect(result).toBe(true);
      });
    });

    describe('getFormModifiedState', () => {
      it('should return isDataModified for Countries tab', () => {
        const result = getFormModifiedState(0, true, () => false, {});
        expect(result).toBe(true);
      });

      it('should return isPeriodSetupModified for Period Setup tab', () => {
        const result = getFormModifiedState(1, false, () => true, {});
        expect(result).toBe(true);
      });

      it('should return modulesState.isDataModified for Modules tab', () => {
        const modulesState = { isDataModified: true };
        const result = getFormModifiedState(2, false, () => false, modulesState);
        expect(result).toBe(true);
      });

      it('should return false for unknown tab', () => {
        const result = getFormModifiedState(3, true, () => true, { isDataModified: true });
        expect(result).toBe(false);
      });
    });

    describe('getSaveDisabledState', () => {
      it('should disable save for Countries tab when data is saved and not modified', () => {
        const params = {
          tabValue: 0,
          selectedCountries: ['US'],
          selectedCurrencies: ['USD'],
          isDataModified: false,
          isDataSaved: true,
          isPeriodSetupMandatoryFieldsFilled: () => true,
          isPeriodSetupModified: () => false,
          modulesState: {},
        };
        const result = getSaveDisabledState(params);
        expect(result).toBe(true);
      });

      it('should enable save for Countries tab when data is modified', () => {
        const params = {
          tabValue: 0,
          selectedCountries: ['US'],
          selectedCurrencies: ['USD'],
          isDataModified: true,
          isDataSaved: true,
          isPeriodSetupMandatoryFieldsFilled: () => true,
          isPeriodSetupModified: () => false,
          modulesState: {},
        };
        const result = getSaveDisabledState(params);
        expect(result).toBe(false);
      });

      it('should disable save for Period Setup tab when mandatory fields not filled', () => {
        const params = {
          tabValue: 1,
          selectedCountries: [],
          selectedCurrencies: [],
          isDataModified: false,
          isDataSaved: false,
          isPeriodSetupMandatoryFieldsFilled: () => false,
          isPeriodSetupModified: () => true,
          modulesState: {},
        };
        const result = getSaveDisabledState(params);
        expect(result).toBe(true);
      });

      it('should enable save for Period Setup tab when mandatory fields filled and modified', () => {
        const params = {
          tabValue: 1,
          selectedCountries: [],
          selectedCurrencies: [],
          isDataModified: false,
          isDataSaved: false,
          isPeriodSetupMandatoryFieldsFilled: () => true,
          isPeriodSetupModified: () => true,
          modulesState: {},
        };
        const result = getSaveDisabledState(params);
        expect(result).toBe(false);
      });

      it('should disable save for Modules tab when not modified', () => {
        const params = {
          tabValue: 2,
          selectedCountries: [],
          selectedCurrencies: [],
          isDataModified: false,
          isDataSaved: false,
          isPeriodSetupMandatoryFieldsFilled: () => true,
          isPeriodSetupModified: () => false,
          modulesState: { isDataModified: false },
        };
        const result = getSaveDisabledState(params);
        expect(result).toBe(true);
      });

      it('should enable save for Modules tab when modified', () => {
        const params = {
          tabValue: 2,
          selectedCountries: [],
          selectedCurrencies: [],
          isDataModified: false,
          isDataSaved: false,
          isPeriodSetupMandatoryFieldsFilled: () => true,
          isPeriodSetupModified: () => false,
          modulesState: { isDataModified: true },
        };
        const result = getSaveDisabledState(params);
        expect(result).toBe(false);
      });
    });

    describe('getHeaderTitle', () => {
      it('should return correct title for Countries tab', () => {
        const result = getHeaderTitle(0);
        expect(result).toBe('Countries and Currency');
      });

      it('should return correct title for Period Setup tab', () => {
        const result = getHeaderTitle(1);
        expect(result).toBe('Period Setup');
      });

      it('should return correct title for Modules tab', () => {
        const result = getHeaderTitle(2);
        expect(result).toBe('System Modules');
      });

      it('should return default title for unknown tab', () => {
        const result = getHeaderTitle(3);
        expect(result).toBe('Entity Configuration');
      });
    });

    describe('isNewlyCreatedEntity', () => {
      it('should return true for newly created entity', () => {
        const entity = { id: 'test-id', isConfigured: false };
        const entityConfiguration = { isDataSaved: false };
        const result = isNewlyCreatedEntity(entity, entityConfiguration);
        expect(result).toBe(true);
      });

      it('should return false for configured entity', () => {
        const entity = { id: 'test-id', isConfigured: true };
        const entityConfiguration = { isDataSaved: false };
        const result = isNewlyCreatedEntity(entity, entityConfiguration);
        expect(result).toBe(false);
      });

      it('should return false for entity with saved configuration', () => {
        const entity = { id: 'test-id', isConfigured: false };
        const entityConfiguration = { isDataSaved: true };
        const result = isNewlyCreatedEntity(entity, entityConfiguration);
        expect(result).toBe(false);
      });

      it('should return false for null entity', () => {
        const result = isNewlyCreatedEntity(null, {});
        expect(result).toBe(false);
      });
    });

    describe('determineEditMode', () => {
      it('should return false for view mode', () => {
        const params = {
          isViewMode: true,
          tabValue: 0,
          isDataSaved: false,
          entityId: 'test-id',
          periodSetup: {},
          userClickedEdit: false,
          modulesState: {},
        };
        const result = determineEditMode(params);
        expect(result).toBe(false);
      });

      it('should return true for newly created entity on Countries tab', () => {
        const params = {
          isViewMode: false,
          tabValue: 0,
          isDataSaved: false,
          entityId: 'test-id',
          periodSetup: {},
          userClickedEdit: false,
          modulesState: {},
          isNewlyCreatedEntity: true,
        };
        const result = determineEditMode(params);
        expect(result).toBe(true);
      });
    });

    describe('isPeriodSetupMandatoryFieldsFilled', () => {
      it('should return false for non-Period Setup tab', () => {
        const result = isPeriodSetupMandatoryFieldsFilled(0, 'test-id', {});
        expect(result).toBe(false);
      });

      it('should return false when periodSetupState is null', () => {
        const result = isPeriodSetupMandatoryFieldsFilled(1, 'test-id', {});
        expect(result).toBe(false);
      });

      it('should return false when data is null', () => {
        const periodSetup = {
          'test-id': {
            data: null,
          },
        };
        const result = isPeriodSetupMandatoryFieldsFilled(1, 'test-id', periodSetup);
        expect(result).toBe(false);
      });

      it('should return true when all mandatory fields are filled', () => {
        const periodSetup = {
          'test-id': {
            data: {
              financialYear: {
                name: 'FY 2024',
                startMonth: 'January',
                endMonth: 'December',
                historicalDataStartFY: '2020',
                spanningYears: '5',
              },
              weekSetup: {
                name: 'Week 1',
                monthForWeekOne: 'January',
                startingDayOfWeek: 'Monday',
              },
            },
          },
        };
        const result = isPeriodSetupMandatoryFieldsFilled(1, 'test-id', periodSetup);
        expect(result).toBe(true);
      });

      it('should return false when financial year fields are missing', () => {
        const periodSetup = {
          'test-id': {
            data: {
              financialYear: {
                name: '',
                startMonth: 'January',
                endMonth: 'December',
                historicalDataStartFY: '2020',
                spanningYears: '5',
              },
              weekSetup: {
                name: 'Week 1',
                monthForWeekOne: 'January',
                startingDayOfWeek: 'Monday',
              },
            },
          },
        };
        const result = isPeriodSetupMandatoryFieldsFilled(1, 'test-id', periodSetup);
        expect(result).toBe(false);
      });

      it('should return false when week setup fields are missing', () => {
        const periodSetup = {
          'test-id': {
            data: {
              financialYear: {
                name: 'FY 2024',
                startMonth: 'January',
                endMonth: 'December',
                historicalDataStartFY: '2020',
                spanningYears: '5',
              },
              weekSetup: {
                name: '',
                monthForWeekOne: 'January',
                startingDayOfWeek: 'Monday',
              },
            },
          },
        };
        const result = isPeriodSetupMandatoryFieldsFilled(1, 'test-id', periodSetup);
        expect(result).toBe(false);
      });
    });

    describe('isPeriodSetupModified', () => {
      it('should return false for non-Period Setup tab', () => {
        const result = isPeriodSetupModified(0, 'test-id', {});
        expect(result).toBe(false);
      });

      it('should return false when periodSetupState is null', () => {
        const result = isPeriodSetupModified(1, 'test-id', {});
        expect(result).toBe(false);
      });

      it('should return false when originalData is null', () => {
        const periodSetup = {
          'test-id': {
            data: { test: 'data' },
            originalData: null,
          },
        };
        const result = isPeriodSetupModified(1, 'test-id', periodSetup);
        expect(result).toBe(false);
      });

      it('should return true when data has changed', () => {
        const periodSetup = {
          'test-id': {
            data: { test: 'new data' },
            originalData: { test: 'old data' },
          },
        };
        const result = isPeriodSetupModified(1, 'test-id', periodSetup);
        expect(result).toBe(true);
      });

      it('should return false when data has not changed', () => {
        const periodSetup = {
          'test-id': {
            data: { test: 'same data' },
            originalData: { test: 'same data' },
          },
        };
        const result = isPeriodSetupModified(1, 'test-id', periodSetup);
        expect(result).toBe(false);
      });
    });
  });
});





