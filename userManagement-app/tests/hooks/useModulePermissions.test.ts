import { renderHook, act } from '@testing-library/react';
import { useModulePermissions } from '../../src/hooks/useModulePermissions';
import * as modulePermissionsService from '../../src/services/modulePermissionsService';

// Mock the service
jest.mock('../../src/services/modulePermissionsService', () => ({
  fetchModulePermissionsFromApi: jest.fn(),
  transformModulePermissionsToLayoutFormat: jest.fn(),
}));

const mockFetchModulePermissionsFromApi = modulePermissionsService.fetchModulePermissionsFromApi as jest.MockedFunction<typeof modulePermissionsService.fetchModulePermissionsFromApi>;
const mockTransformModulePermissionsToLayoutFormat = modulePermissionsService.transformModulePermissionsToLayoutFormat as jest.MockedFunction<typeof modulePermissionsService.transformModulePermissionsToLayoutFormat>;

describe('useModulePermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useModulePermissions());
    
    expect(result.current.modulesData).toEqual({});
    expect(result.current.loading).toBe(true); // Loading starts as true due to useEffect
    expect(result.current.error).toBe(null);
    expect(result.current.rawData).toEqual([]);
  });

  it('should load module permissions successfully', async () => {
    const mockRawData = [
      { id: 1, module: 'Data Management', submodules: { 'Data Entry': ['create', 'read'] }, permission_names: {} },
      { id: 2, module: 'Budgeting', submodules: { 'Budget Planning': ['create', 'update'] }, permission_names: {} }
    ];
    const mockTransformedData = {
      'Data Management': { submodules: { 'Data Entry': ['create', 'read'] } },
      'Budgeting': { submodules: { 'Budget Planning': ['create', 'update'] } }
    };

    mockFetchModulePermissionsFromApi.mockResolvedValue(mockRawData);
    mockTransformModulePermissionsToLayoutFormat.mockReturnValue(mockTransformedData);

    const { result } = renderHook(() => useModulePermissions());

    await act(async () => {
      await result.current.loadModulePermissions();
    });

    expect(mockFetchModulePermissionsFromApi).toHaveBeenCalledTimes(2); // Called once on mount, once in test
    expect(mockTransformModulePermissionsToLayoutFormat).toHaveBeenCalledWith(mockRawData);
    expect(result.current.modulesData).toEqual(mockTransformedData);
    expect(result.current.rawData).toEqual(mockRawData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle API error', async () => {
    const errorMessage = 'API Error';
    mockFetchModulePermissionsFromApi.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useModulePermissions());

    await act(async () => {
      await result.current.loadModulePermissions();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(`Failed to load module permissions: ${errorMessage}`);
    expect(result.current.modulesData).toEqual({});
    expect(result.current.rawData).toEqual([]);
  });

  it('should handle empty data from API', async () => {
    mockFetchModulePermissionsFromApi.mockResolvedValue([]);
    mockTransformModulePermissionsToLayoutFormat.mockReturnValue({});

    const { result } = renderHook(() => useModulePermissions());

    await act(async () => {
      await result.current.loadModulePermissions();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('No module permissions data available');
    expect(result.current.modulesData).toEqual({});
    expect(result.current.rawData).toEqual([]);
  });

  it('should handle null data from API', async () => {
    mockFetchModulePermissionsFromApi.mockResolvedValue(null as any);
    mockTransformModulePermissionsToLayoutFormat.mockReturnValue({});

    const { result } = renderHook(() => useModulePermissions());

    await act(async () => {
      await result.current.loadModulePermissions();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('No module permissions data available');
    expect(result.current.modulesData).toEqual({});
    expect(result.current.rawData).toEqual([]);
  });

  it('should handle undefined data from API', async () => {
    mockFetchModulePermissionsFromApi.mockResolvedValue(undefined as any);
    mockTransformModulePermissionsToLayoutFormat.mockReturnValue({});

    const { result } = renderHook(() => useModulePermissions());

    await act(async () => {
      await result.current.loadModulePermissions();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('No module permissions data available');
    expect(result.current.modulesData).toEqual({});
    expect(result.current.rawData).toEqual([]);
  });

  it('should set loading state during API call', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockFetchModulePermissionsFromApi.mockReturnValue(promise as any);

    const { result } = renderHook(() => useModulePermissions());

    act(() => {
      result.current.loadModulePermissions();
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);

    await act(async () => {
      resolvePromise!([
        { id: 1, module: 'Test', submodules: {}, permission_names: {} }
      ]);
      await promise;
    });

    expect(result.current.loading).toBe(false);
  });

  it('should provide loadModulePermissions function', () => {
    const { result } = renderHook(() => useModulePermissions());
    
    expect(typeof result.current.loadModulePermissions).toBe('function');
  });

  it('should handle transform function returning empty object', async () => {
    const mockRawData = [
      { id: 1, module: 'Test', submodules: {}, permission_names: {} }
    ];
    mockFetchModulePermissionsFromApi.mockResolvedValue(mockRawData);
    mockTransformModulePermissionsToLayoutFormat.mockReturnValue({});

    const { result } = renderHook(() => useModulePermissions());

    await act(async () => {
      await result.current.loadModulePermissions();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('No module permissions data available');
    expect(result.current.modulesData).toEqual({});
  });

  it('should handle transform function returning null', async () => {
    const mockRawData = [
      { id: 1, module: 'Test', submodules: {}, permission_names: {} }
    ];
    mockFetchModulePermissionsFromApi.mockResolvedValue(mockRawData);
    mockTransformModulePermissionsToLayoutFormat.mockReturnValue(null as any);

    const { result } = renderHook(() => useModulePermissions());

    await act(async () => {
      await result.current.loadModulePermissions();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('No module permissions data available');
    expect(result.current.modulesData).toEqual({});
  });
});
