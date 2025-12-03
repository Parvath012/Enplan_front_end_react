import * as React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useCountriesAndCurrencies } from '../../../../src/components/entityConfiguration/hooks/useCountriesAndCurrencies';
import { fetchEntitiesFromApi } from '../../../../src/services/entitySetupService';
import * as actions from '../../../../src/store/Actions/entityConfigurationActions';

// Mock dependencies
jest.mock('react-redux', () => ({
  useDispatch: jest.fn().mockReturnValue(jest.fn())
}));

jest.mock('../../../../src/services/entitySetupService', () => ({
  fetchEntitiesFromApi: jest.fn()
}));

// Mock action creators
jest.mock('../../../../src/store/Actions/entityConfigurationActions', () => ({
  setSelectedCountries: jest.fn(() => 'setSelectedCountries'),
  setSelectedCurrencies: jest.fn(() => 'setSelectedCurrencies'),
  setDefaultCurrency: jest.fn(() => 'setDefaultCurrency'),
  setIsDefaultCurrency: jest.fn(() => 'setIsDefaultCurrency'),
  setOriginalData: jest.fn(() => 'setOriginalData'),
  setDataModified: jest.fn(() => 'setDataModified'),
  setDataSaved: jest.fn(() => 'setDataSaved'),
  toggleCountry: jest.fn(() => 'toggleCountry'),
  toggleCurrency: jest.fn(() => 'toggleCurrency'),
  setDefaultCurrencyAction: jest.fn(() => 'setDefaultCurrencyAction'),
}));

describe('useCountriesAndCurrencies', () => {
  // Set up mocks before each test
  const mockDispatch = jest.fn();
  const entityId = 'entity-123';

  beforeEach(() => {
    jest.clearAllMocks();
    require('react-redux').useDispatch.mockReturnValue(mockDispatch);
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: `/entity/${entityId}`,
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('State initialization', () => {
    it('should initialize with default state values', () => {
      const { result } = renderHook(() => useCountriesAndCurrencies(entityId));

      expect(result.current.countrySearch).toBe('');
      expect(result.current.currencySearch).toBe('');
      expect(result.current.allCountries).toEqual([]);
      expect(result.current.isLoadingCountries).toBe(true);
      expect(result.current.hasFetchedData).toBe(false);
      expect(result.current.isLoadingData).toBe(true);
      expect(result.current.currenciesFetchedRef.current).toBe(false);
    });
  });

  describe('fetchSavedData', () => {
    it('should fetch and process entity data correctly', async () => {
      // Setup mock entity data
      const mockEntities = [
        {
          id: entityId,
          countries: {
            selectedCountries: ['USA', 'UK']
          },
          currencies: {
            selectedCurrencies: ['USD', 'GBP'],
            defaultCurrency: 'USD'
          },
          country: 'USA'
        }
      ];

      // Setup fetch mock to return our test data
      (fetchEntitiesFromApi as jest.Mock).mockResolvedValueOnce(mockEntities);
      
      const { result } = renderHook(() => useCountriesAndCurrencies(entityId));
      
      // Call the function
      await act(async () => {
        await result.current.fetchSavedData();
      });
      
      // Check if API was called
      expect(fetchEntitiesFromApi).toHaveBeenCalled();
      
      // Check if dispatch was called
      expect(mockDispatch).toHaveBeenCalled();
      
      // Check if loading state was updated
      expect(result.current.isLoadingData).toBe(false);
    });

    it('should handle API errors gracefully', async () => {
      // Setup fetch mock to throw an error
      const error = new Error('API error');
      (fetchEntitiesFromApi as jest.Mock).mockRejectedValueOnce(error);
      
      // Spy on console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const { result } = renderHook(() => useCountriesAndCurrencies(entityId));
      
      // Call the function
      await act(async () => {
        await result.current.fetchSavedData();
      });
      
      // Check if error was logged
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching saved data:', error);
      
      // Check if loading state was updated despite the error
      expect(result.current.isLoadingData).toBe(false);
      
      // Restore console.error
      consoleSpy.mockRestore();
    });

    it('should handle missing entity gracefully', async () => {
      // Setup fetch mock to return entities without our target
      const mockEntities = [
        { id: 'different-entity' }
      ];
      
      (fetchEntitiesFromApi as jest.Mock).mockResolvedValueOnce(mockEntities);
      
      const { result } = renderHook(() => useCountriesAndCurrencies(entityId));
      
      // Call the function
      await act(async () => {
        await result.current.fetchSavedData();
      });
      
      // Verify dispatch wasn't called with entity data
      expect(mockDispatch).not.toHaveBeenCalledWith('setSelectedCountries');
      expect(mockDispatch).not.toHaveBeenCalledWith('setSelectedCurrencies');
      expect(mockDispatch).not.toHaveBeenCalledWith('setDefaultCurrency');
      
      // Check if loading state was updated
      expect(result.current.isLoadingData).toBe(false);
    });

    it('should not fetch when entityId is not provided', async () => {
      const { result } = renderHook(() => useCountriesAndCurrencies(undefined));
      
      await act(async () => {
        await result.current.fetchSavedData();
      });
      
      // Should not call the API
      expect(fetchEntitiesFromApi).not.toHaveBeenCalled();
      
      // Should set loading to false
      expect(result.current.isLoadingData).toBe(false);
    });
  });

  describe('handleCountryToggle', () => {
    it('should dispatch toggleCountry action with correct parameters', () => {
      const { result } = renderHook(() => useCountriesAndCurrencies(entityId));
      
      act(() => {
        result.current.handleCountryToggle('USA');
      });
      
      expect(actions.toggleCountry).toHaveBeenCalledWith('USA', entityId);
      // The mock returns the action object/value itself, not the action name
      expect(mockDispatch).toHaveBeenCalledWith(actions.toggleCountry('USA', entityId));
    });
  });

  describe('handleCurrencyToggle', () => {
    it('should dispatch toggleCurrency action with correct parameters', () => {
      const { result } = renderHook(() => useCountriesAndCurrencies(entityId));
      
      act(() => {
        result.current.handleCurrencyToggle('USD');
      });
      
      expect(actions.toggleCurrency).toHaveBeenCalledWith('USD', entityId);
      // The mock returns the action object/value itself, not the action name
      expect(mockDispatch).toHaveBeenCalledWith(actions.toggleCurrency('USD', entityId));
    });
  });

  describe('handleSetDefaultCurrency', () => {
    it('should dispatch setDefaultCurrencyAction with correct parameters', () => {
      const { result } = renderHook(() => useCountriesAndCurrencies(entityId));
      
      act(() => {
        result.current.handleSetDefaultCurrency('USD');
      });
      
      expect(actions.setDefaultCurrencyAction).toHaveBeenCalledWith('USD', entityId);
      // The mock returns the action object/value itself, not the action name
      expect(mockDispatch).toHaveBeenCalledWith(actions.setDefaultCurrencyAction('USD', entityId));
    });
  });

  describe('State setters', () => {
    it('should update countrySearch state', () => {
      const { result } = renderHook(() => useCountriesAndCurrencies(entityId));
      
      act(() => {
        result.current.setCountrySearch('USA');
      });
      
      expect(result.current.countrySearch).toBe('USA');
    });

    it('should update currencySearch state', () => {
      const { result } = renderHook(() => useCountriesAndCurrencies(entityId));
      
      act(() => {
        result.current.setCurrencySearch('USD');
      });
      
      expect(result.current.currencySearch).toBe('USD');
    });

    it('should update allCountries state', () => {
      const { result } = renderHook(() => useCountriesAndCurrencies(entityId));
      const countries = ['USA', 'UK', 'Germany'];
      
      act(() => {
        result.current.setAllCountries(countries);
      });
      
      expect(result.current.allCountries).toEqual(countries);
    });

    it('should update isLoadingCountries state', () => {
      const { result } = renderHook(() => useCountriesAndCurrencies(entityId));
      
      act(() => {
        result.current.setIsLoadingCountries(false);
      });
      
      expect(result.current.isLoadingCountries).toBe(false);
    });

    it('should update hasFetchedData state', () => {
      const { result } = renderHook(() => useCountriesAndCurrencies(entityId));
      
      act(() => {
        result.current.setHasFetchedData(true);
      });
      
      expect(result.current.hasFetchedData).toBe(true);
    });

    it('should update isLoadingData state', () => {
      const { result } = renderHook(() => useCountriesAndCurrencies(entityId));
      
      act(() => {
        result.current.setIsLoadingData(false);
      });
      
      expect(result.current.isLoadingData).toBe(false);
    });
  });

  describe('Error handling in parseCurrenciesData', () => {
    it('should handle invalid JSON data in currencies field', async () => {
      // Setup mock entity data with invalid JSON in currencies
      const mockEntities = [
        {
          id: entityId,
          countries: { selectedCountries: ['USA'] },
          currencies: 'invalid-json-string{',
          country: 'USA'
        }
      ];

      (fetchEntitiesFromApi as jest.Mock).mockResolvedValueOnce(mockEntities);
      
      const { result } = renderHook(() => useCountriesAndCurrencies(entityId));
      
      await act(async () => {
        await result.current.fetchSavedData();
      });
      
      // The hook should handle invalid JSON gracefully and not crash
      expect(result.current.isLoadingData).toBe(false);
      
      // Verify that actions were called (the hook processed the data gracefully)
      expect(actions.setSelectedCountries).toHaveBeenCalled();
      expect(actions.setSelectedCurrencies).toHaveBeenCalled();
    });

    it('should handle entity with no currencies field', async () => {
      // Setup mock entity data without currencies field
      const mockEntities = [
        {
          id: entityId,
          countries: { selectedCountries: ['USA'] },
          country: 'USA'
          // No currencies field
        }
      ];
      
      (fetchEntitiesFromApi as jest.Mock).mockResolvedValueOnce(mockEntities);
      
      const { result } = renderHook(() => useCountriesAndCurrencies(entityId));
      
      await act(async () => {
        await result.current.fetchSavedData();
      });
      
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('Effect hooks and state resets', () => {
    it('should reset hasFetchedData when entityId changes', () => {
      const { result, rerender } = renderHook(
        ({ id }) => useCountriesAndCurrencies(id),
        { initialProps: { id: 'initial-entity' } }
      );
      
      // Set hasFetchedData to true
      act(() => {
        result.current.setHasFetchedData(true);
      });
      
      expect(result.current.hasFetchedData).toBe(true);
      
      // Change entityId
      rerender({ id: 'new-entity' });
      
      // Should reset hasFetchedData to false
      expect(result.current.hasFetchedData).toBe(false);
      expect(result.current.isLoadingData).toBe(true);
    });
  });

  describe('parseCountriesData edge cases', () => {
    it('should handle entity with only manual selections (no entity country)', async () => {
      const mockEntities = [
        {
          id: entityId,
          countries: {
            selectedCountries: ['Germany', 'France']
          },
          currencies: {
            selectedCurrencies: ['EUR'],
            defaultCurrency: 'EUR'
          }
          // No country field
        }
      ];
      
      (fetchEntitiesFromApi as jest.Mock).mockResolvedValueOnce(mockEntities);
      
      const { result } = renderHook(() => useCountriesAndCurrencies(entityId));
      
      await act(async () => {
        await result.current.fetchSavedData();
      });
      
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle entity with country but empty manual selections', async () => {
      const mockEntities = [
        {
          id: entityId,
          countries: {
            selectedCountries: []
          },
          currencies: {
            selectedCurrencies: ['USD'],
            defaultCurrency: 'USD'
          },
          country: 'Canada'
        }
      ];
      
      (fetchEntitiesFromApi as jest.Mock).mockResolvedValueOnce(mockEntities);
      
      const { result } = renderHook(() => useCountriesAndCurrencies(entityId));
      
      await act(async () => {
        await result.current.fetchSavedData();
      });
      
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle entity with countries as string format', async () => {
      const mockEntities = [
        {
          id: entityId,
          countries: '"{\\"selectedCountries\\": [\\"Brazil\\", \\"Mexico\\"]}"',
          currencies: {
            selectedCurrencies: ['BRL'],
            defaultCurrency: 'BRL'
          },
          country: 'Brazil'
        }
      ];
      
      (fetchEntitiesFromApi as jest.Mock).mockResolvedValueOnce(mockEntities);
      
      const { result } = renderHook(() => useCountriesAndCurrencies(entityId));
      
      await act(async () => {
        await result.current.fetchSavedData();
      });
      
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('parseCurrenciesDataFromEntity edge cases', () => {
    it('should handle currencies with isDefault field', async () => {
      const mockEntities = [
        {
          id: entityId,
          countries: { selectedCountries: ['USA'] },
          currencies: {
            selectedCurrencies: ['USD'],
            defaultCurrency: 'USD',
            isDefault: 'true',
            initialCurrency: true
          },
          country: 'USA'
        }
      ];
      
      (fetchEntitiesFromApi as jest.Mock).mockResolvedValueOnce(mockEntities);
      
      const { result } = renderHook(() => useCountriesAndCurrencies(entityId));
      
      await act(async () => {
        await result.current.fetchSavedData();
      });
      
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle currencies with explicit isSaved field', async () => {
      const mockEntities = [
        {
          id: entityId,
          countries: { selectedCountries: ['USA'] },
          currencies: {
            selectedCurrencies: ['USD'],
            defaultCurrency: 'USD',
            isSaved: true
          },
          country: 'USA'
        }
      ];
      
      (fetchEntitiesFromApi as jest.Mock).mockResolvedValueOnce(mockEntities);
      
      const { result } = renderHook(() => useCountriesAndCurrencies(entityId));
      
      await act(async () => {
        await result.current.fetchSavedData();
      });
      
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle currencies as string format', async () => {
      const mockEntities = [
        {
          id: entityId,
          countries: { selectedCountries: ['USA'] },
          currencies: '"{\\"selectedCurrencies\\": [\\"USD\\"], \\"defaultCurrency\\": \\"USD\\"}"',
          country: 'USA'
        }
      ];
      
      (fetchEntitiesFromApi as jest.Mock).mockResolvedValueOnce(mockEntities);
      
      const { result } = renderHook(() => useCountriesAndCurrencies(entityId));
      
      await act(async () => {
        await result.current.fetchSavedData();
      });
      
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('Window location handling', () => {
    it('should extract entityId from URL for action creators', () => {
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/entity/test-entity-id',
        },
        writable: true,
      });
      
      const { result } = renderHook(() => useCountriesAndCurrencies());
      
      act(() => {
        result.current.handleCountryToggle('USA');
      });
      
      // The action creator should have been called with the extracted entityId
      expect(actions.toggleCountry).toHaveBeenCalledWith('USA', 'test-entity-id');
      expect(mockDispatch).toHaveBeenCalledWith(actions.toggleCountry('USA', 'test-entity-id'));
    });
  });
});
