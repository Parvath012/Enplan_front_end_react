import { renderHook, act } from '@testing-library/react';
import { useRegionCountry } from '../../src/hooks/useRegionCountry';
import * as regionCountryService from '../../src/services/regionCountryService';

// Mock the service
jest.mock('../../src/services/regionCountryService', () => ({
  fetchRegionCountryFromApi: jest.fn(),
  transformRegionCountryToDropdownOptions: jest.fn(),
}));

const mockFetchRegionCountryFromApi = regionCountryService.fetchRegionCountryFromApi as jest.MockedFunction<typeof regionCountryService.fetchRegionCountryFromApi>;
const mockTransformRegionCountryToDropdownOptions = regionCountryService.transformRegionCountryToDropdownOptions as jest.MockedFunction<typeof regionCountryService.transformRegionCountryToDropdownOptions>;

describe('useRegionCountry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear console logs
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useRegionCountry());
    
    expect(result.current.dropdownOptions).toEqual({
      regions: [],
      countries: [],
      divisions: [],
      groups: [],
      departments: [],
      classes: [],
      subClasses: [],
    });
    expect(result.current.loading).toBe(true); // Loading starts as true due to useEffect
    expect(result.current.error).toBe(null);
    expect(result.current.rawData).toEqual([]);
  });

  it('should load region country data successfully', async () => {
    const mockRawData = [
      { id: 1, region: 'North America', country: 'USA', division: 'Retail', group: 'Electronics', department: 'Sales', class: 'Electronics', subClass: 'Phones' },
      { id: 2, region: 'Europe', country: 'UK', division: 'Online', group: 'Fashion', department: 'Marketing', class: 'Clothing', subClass: 'Shirts' }
    ];
    const mockTransformedData = {
      regions: ['North America', 'Europe'],
      countries: ['USA', 'UK'],
      divisions: ['Retail', 'Online'],
      groups: ['Electronics', 'Fashion'],
      departments: ['Sales', 'Marketing'],
      classes: ['Electronics', 'Clothing'],
      subClasses: ['Phones', 'Shirts'],
    };

    mockFetchRegionCountryFromApi.mockResolvedValue(mockRawData);
    mockTransformRegionCountryToDropdownOptions.mockReturnValue(mockTransformedData);

    const { result } = renderHook(() => useRegionCountry());

    await act(async () => {
      await result.current.loadRegionCountry();
    });

    expect(mockFetchRegionCountryFromApi).toHaveBeenCalledTimes(2); // Called once on mount, once in test
    expect(mockTransformRegionCountryToDropdownOptions).toHaveBeenCalledWith(mockRawData);
    expect(result.current.dropdownOptions).toEqual(mockTransformedData);
    expect(result.current.rawData).toEqual(mockRawData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle API error', async () => {
    const errorMessage = 'API Error';
    mockFetchRegionCountryFromApi.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useRegionCountry());

    await act(async () => {
      await result.current.loadRegionCountry();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(`Failed to load data: ${errorMessage}`);
    expect(result.current.dropdownOptions).toEqual({
      regions: [],
      countries: [],
      divisions: [],
      groups: [],
      departments: [],
      classes: [],
      subClasses: [],
    });
    expect(result.current.rawData).toEqual([]);
  });

  it('should handle empty array from API', async () => {
    mockFetchRegionCountryFromApi.mockResolvedValue([]);
    mockTransformRegionCountryToDropdownOptions.mockReturnValue({
      regions: [],
      countries: [],
      divisions: [],
      groups: [],
      departments: [],
      classes: [],
      subClasses: [],
    });

    const { result } = renderHook(() => useRegionCountry());

    await act(async () => {
      await result.current.loadRegionCountry();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('No data available from API');
    expect(result.current.dropdownOptions).toEqual({
      regions: [],
      countries: [],
      divisions: [],
      groups: [],
      departments: [],
      classes: [],
      subClasses: [],
    });
  });

  it('should handle null data from API', async () => {
    mockFetchRegionCountryFromApi.mockResolvedValue(null as any);

    const { result } = renderHook(() => useRegionCountry());

    await act(async () => {
      await result.current.loadRegionCountry();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('No data available from API');
  });

  it('should handle undefined data from API', async () => {
    mockFetchRegionCountryFromApi.mockResolvedValue(undefined as any);

    const { result } = renderHook(() => useRegionCountry());

    await act(async () => {
      await result.current.loadRegionCountry();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('No data available from API');
  });

  it('should handle transform function returning empty options', async () => {
    const mockRawData = [
      { id: 1, region: 'Test', country: 'Test', division: 'Test', group: 'Test', department: 'Test', class: 'Test', subClass: 'Test' }
    ];
    mockFetchRegionCountryFromApi.mockResolvedValue(mockRawData);
    mockTransformRegionCountryToDropdownOptions.mockReturnValue({
      regions: [],
      countries: [],
      divisions: [],
      groups: [],
      departments: [],
      classes: [],
      subClasses: [],
    });

    const { result } = renderHook(() => useRegionCountry());

    await act(async () => {
      await result.current.loadRegionCountry();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('No valid options available');
  });

  it('should handle transform function returning null', async () => {
    const mockRawData = [
      { id: 1, region: 'Test', country: 'Test', division: 'Test', group: 'Test', department: 'Test', class: 'Test', subClass: 'Test' }
    ];
    mockFetchRegionCountryFromApi.mockResolvedValue(mockRawData);
    mockTransformRegionCountryToDropdownOptions.mockReturnValue(null as any);

    const { result } = renderHook(() => useRegionCountry());

    await act(async () => {
      await result.current.loadRegionCountry();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to load data: Cannot convert undefined or null to object');
  });

  it('should set loading state during API call', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockFetchRegionCountryFromApi.mockReturnValue(promise as any);

    const { result } = renderHook(() => useRegionCountry());

    act(() => {
      result.current.loadRegionCountry();
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);

    await act(async () => {
      resolvePromise!([
        { id: 1, region: 'Test', country: 'Test', division: 'Test', group: 'Test', department: 'Test', class: 'Test', subClass: 'Test' }
      ]);
      await promise;
    });

    expect(result.current.loading).toBe(false);
  });

  it('should provide loadRegionCountry function', () => {
    const { result } = renderHook(() => useRegionCountry());
    
    expect(typeof result.current.loadRegionCountry).toBe('function');
  });

  it('should log messages during data loading', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const mockRawData = [
      { id: 1, region: 'Test', country: 'Test', division: 'Test', group: 'Test', department: 'Test', class: 'Test', subClass: 'Test' }
    ];
    const mockTransformedData = {
      regions: ['Test'],
      countries: ['Test'],
      divisions: ['Test'],
      groups: ['Test'],
      departments: ['Test'],
      classes: ['Test'],
      subClasses: ['Test'],
    };

    mockFetchRegionCountryFromApi.mockResolvedValue(mockRawData);
    mockTransformRegionCountryToDropdownOptions.mockReturnValue(mockTransformedData);

    const { result } = renderHook(() => useRegionCountry());

    await act(async () => {
      await result.current.loadRegionCountry();
    });

    expect(consoleSpy).toHaveBeenCalledWith('useRegionCountry: Starting to load region country data...');
    expect(consoleSpy).toHaveBeenCalledWith('useRegionCountry: Raw data received:', mockRawData);
    expect(consoleSpy).toHaveBeenCalledWith('useRegionCountry: Transformed dropdown options:', mockTransformedData);
    expect(consoleSpy).toHaveBeenCalledWith('useRegionCountry: Successfully loaded data');
  });

  it('should log warnings for empty data', async () => {
    const consoleSpy = jest.spyOn(console, 'warn');
    mockFetchRegionCountryFromApi.mockResolvedValue([]);

    const { result } = renderHook(() => useRegionCountry());

    await act(async () => {
      await result.current.loadRegionCountry();
    });

    expect(consoleSpy).toHaveBeenCalledWith('useRegionCountry: No data received from API');
  });

  it('should log warnings for invalid options', async () => {
    const consoleSpy = jest.spyOn(console, 'warn');
    const mockRawData = [
      { id: 1, region: 'Test', country: 'Test', division: 'Test', group: 'Test', department: 'Test', class: 'Test', subClass: 'Test' }
    ];
    mockFetchRegionCountryFromApi.mockResolvedValue(mockRawData);
    mockTransformRegionCountryToDropdownOptions.mockReturnValue({
      regions: [],
      countries: [],
      divisions: [],
      groups: [],
      departments: [],
      classes: [],
      subClasses: [],
    });

    const { result } = renderHook(() => useRegionCountry());

    await act(async () => {
      await result.current.loadRegionCountry();
    });

    expect(consoleSpy).toHaveBeenCalledWith('useRegionCountry: No valid dropdown options generated');
  });

  it('should log errors for API failures', async () => {
    const consoleSpy = jest.spyOn(console, 'error');
    const error = new Error('API Error');
    mockFetchRegionCountryFromApi.mockRejectedValue(error);

    const { result } = renderHook(() => useRegionCountry());

    await act(async () => {
      await result.current.loadRegionCountry();
    });

    expect(consoleSpy).toHaveBeenCalledWith('useRegionCountry: Error fetching region country data:', error);
  });
});
