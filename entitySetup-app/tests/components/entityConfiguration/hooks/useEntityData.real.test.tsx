import { renderHook } from '@testing-library/react';
import { useEntityData } from '../../../../src/components/entityConfiguration/hooks/useEntityData';
import { useSelector } from 'react-redux';
import { useParams, useLocation } from 'react-router-dom';

// Mock react-redux
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
  useLocation: jest.fn(),
}));

// Mock the utility function
jest.mock('../../../../src/utils/entityConfigurationStateUtils', () => ({
  getEntityConfigurationState: jest.fn(),
}));

const mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>;

describe('useEntityData - Real Hook Tests', () => {
  const mockGetEntityConfigurationState = require('../../../../src/utils/entityConfigurationStateUtils').getEntityConfigurationState;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUseParams.mockReturnValue({ entityId: 'test-entity-1' });
    mockUseLocation.mockReturnValue({
      pathname: '/entity-setup/test-entity-1',
      search: '',
      hash: '',
      state: null,
      key: 'test-key'
    });
    
    mockGetEntityConfigurationState.mockReturnValue({
      data: { name: 'Test Entity' },
      loading: false,
      error: null
    });
  });

  it('should return entity data with URL params', () => {
    mockUseParams.mockReturnValue({ entityId: 'test-entity-1' });
    mockUseLocation.mockReturnValue({
      pathname: '/entity-setup/test-entity-1',
      search: '',
      hash: '',
      state: null,
      key: 'test-key'
    });

    mockUseSelector.mockImplementation((selector) => {
      const mockState = {
        periodSetup: { data: 'test-period-setup' },
        entities: {
          items: [
            { id: 'test-entity-1', name: 'Test Entity 1', entityType: 'Planning' },
            { id: 'test-entity-2', name: 'Test Entity 2', entityType: 'Rollup' }
          ],
          loading: false
        }
      };
      return selector(mockState);
    });

    const { result } = renderHook(() => useEntityData());

    expect(result.current.entityId).toBe('test-entity-1');
    expect(result.current.entity).toEqual({ id: 'test-entity-1', name: 'Test Entity 1', entityType: 'Planning' });
    expect(result.current.entitiesCount).toBe(2);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isRollupEntity).toBe(false);
    expect(result.current.periodSetup).toEqual({ data: 'test-period-setup' });
    expect(mockGetEntityConfigurationState).toHaveBeenCalledWith(expect.anything(), 'test-entity-1');
  });

  it('should fallback to pathname when params.entityId is undefined', () => {
    mockUseParams.mockReturnValue({ entityId: undefined });
    mockUseLocation.mockReturnValue({
      pathname: '/entity-setup/fallback-entity',
      search: '',
      hash: '',
      state: null,
      key: 'test-key'
    });

    mockUseSelector.mockImplementation((selector) => {
      const mockState = {
        periodSetup: { data: 'test-period-setup' },
        entities: {
          items: [
            { id: 'fallback-entity', name: 'Fallback Entity', entityType: 'Rollup' }
          ],
          loading: false
        }
      };
      return selector(mockState);
    });

    const { result } = renderHook(() => useEntityData());

    expect(result.current.entityId).toBe('fallback-entity');
    expect(result.current.entity).toEqual({ id: 'fallback-entity', name: 'Fallback Entity', entityType: 'Rollup' });
    expect(result.current.isRollupEntity).toBe(true);
  });

  it('should handle empty pathname gracefully', () => {
    mockUseParams.mockReturnValue({ entityId: undefined });
    mockUseLocation.mockReturnValue({
      pathname: '',
      search: '',
      hash: '',
      state: null,
      key: 'test-key'
    });

    mockUseSelector.mockImplementation((selector) => {
      const mockState = {
        periodSetup: {},
        entities: {
          items: [],
          loading: false
        }
      };
      return selector(mockState);
    });

    const { result } = renderHook(() => useEntityData());

    expect(result.current.entityId).toBe('');
    expect(result.current.entity).toBeUndefined();
    expect(result.current.entitiesCount).toBe(0);
  });

  it('should handle undefined state gracefully', () => {
    mockUseParams.mockReturnValue({ entityId: 'test-entity' });
    mockUseLocation.mockReturnValue({
      pathname: '/entity-setup/test-entity',
      search: '',
      hash: '',
      state: null,
      key: 'test-key'
    });

    mockUseSelector.mockImplementation((selector) => {
      const mockState = {
        periodSetup: undefined,
        entities: undefined
      };
      return selector(mockState);
    });

    const { result } = renderHook(() => useEntityData());

    expect(result.current.entityId).toBe('test-entity');
    expect(result.current.entity).toBeUndefined();
    expect(result.current.entitiesCount).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.periodSetup).toEqual({});
  });

  it('should handle null entityId', () => {
    mockUseParams.mockReturnValue({ entityId: null });
    mockUseLocation.mockReturnValue({
      pathname: '/entity-setup/',
      search: '',
      hash: '',
      state: null,
      key: 'test-key'
    });

    mockUseSelector.mockImplementation((selector) => {
      const mockState = {
        periodSetup: { data: 'test' },
        entities: {
          items: [],
          loading: false
        }
      };
      return selector(mockState);
    });

    const { result } = renderHook(() => useEntityData());

    expect(result.current.entityId).toBe('');
    expect(mockGetEntityConfigurationState).toHaveBeenCalledWith(expect.anything(), null);
  });

  it('should detect rollup entity correctly', () => {
    mockUseParams.mockReturnValue({ entityId: 'rollup-entity' });
    mockUseLocation.mockReturnValue({
      pathname: '/entity-setup/rollup-entity',
      search: '',
      hash: '',
      state: null,
      key: 'test-key'
    });

    mockUseSelector.mockImplementation((selector) => {
      const mockState = {
        periodSetup: {},
        entities: {
          items: [
            { id: 'rollup-entity', name: 'Rollup Entity', entityType: 'Rollup Entity' }
          ],
          loading: false
        }
      };
      return selector(mockState);
    });

    const { result } = renderHook(() => useEntityData());

    expect(result.current.isRollupEntity).toBe(true);
  });

  it('should handle case-insensitive rollup detection', () => {
    mockUseParams.mockReturnValue({ entityId: 'mixed-case-entity' });
    mockUseLocation.mockReturnValue({
      pathname: '/entity-setup/mixed-case-entity',
      search: '',
      hash: '',
      state: null,
      key: 'test-key'
    });

    mockUseSelector.mockImplementation((selector) => {
      const mockState = {
        periodSetup: {},
        entities: {
          items: [
            { id: 'mixed-case-entity', name: 'Mixed Case Entity', entityType: 'ROLLUP' }
          ],
          loading: false
        }
      };
      return selector(mockState);
    });

    const { result } = renderHook(() => useEntityData());

    expect(result.current.isRollupEntity).toBe(true);
  });

  it('should handle loading state', () => {
    mockUseParams.mockReturnValue({ entityId: 'loading-entity' });
    mockUseLocation.mockReturnValue({
      pathname: '/entity-setup/loading-entity',
      search: '',
      hash: '',
      state: null,
      key: 'test-key'
    });

    mockUseSelector.mockImplementation((selector) => {
      const mockState = {
        periodSetup: {},
        entities: {
          items: [],
          loading: true
        }
      };
      return selector(mockState);
    });

    const { result } = renderHook(() => useEntityData());

    expect(result.current.isLoading).toBe(true);
  });

  it('should handle complex pathname with multiple slashes', () => {
    mockUseParams.mockReturnValue({ entityId: undefined });
    mockUseLocation.mockReturnValue({
      pathname: '/entity-setup/complex/path/entity-id',
      search: '',
      hash: '',
      state: null,
      key: 'test-key'
    });

    mockUseSelector.mockImplementation((selector) => {
      const mockState = {
        periodSetup: {},
        entities: {
          items: [
            { id: 'entity-id', name: 'Complex Path Entity', entityType: 'Planning' }
          ],
          loading: false
        }
      };
      return selector(mockState);
    });

    const { result } = renderHook(() => useEntityData());

    expect(result.current.entityId).toBe('entity-id');
    expect(result.current.entity).toEqual({ id: 'entity-id', name: 'Complex Path Entity', entityType: 'Planning' });
  });

  it('should handle undefined entityType', () => {
    mockUseParams.mockReturnValue({ entityId: 'no-type-entity' });
    mockUseLocation.mockReturnValue({
      pathname: '/entity-setup/no-type-entity',
      search: '',
      hash: '',
      state: null,
      key: 'test-key'
    });

    mockUseSelector.mockImplementation((selector) => {
      const mockState = {
        periodSetup: {},
        entities: {
          items: [
            { id: 'no-type-entity', name: 'No Type Entity', entityType: undefined }
          ],
          loading: false
        }
      };
      return selector(mockState);
    });

    const { result } = renderHook(() => useEntityData());

    expect(result.current.isRollupEntity).toBe(false);
  });

  it('should handle null entityType', () => {
    mockUseParams.mockReturnValue({ entityId: 'null-type-entity' });
    mockUseLocation.mockReturnValue({
      pathname: '/entity-setup/null-type-entity',
      search: '',
      hash: '',
      state: null,
      key: 'test-key'
    });

    mockUseSelector.mockImplementation((selector) => {
      const mockState = {
        periodSetup: {},
        entities: {
          items: [
            { id: 'null-type-entity', name: 'Null Type Entity', entityType: null }
          ],
          loading: false
        }
      };
      return selector(mockState);
    });

    const { result } = renderHook(() => useEntityData());

    expect(result.current.isRollupEntity).toBe(false);
  });

  it('should handle empty string entityType', () => {
    mockUseParams.mockReturnValue({ entityId: 'empty-type-entity' });
    mockUseLocation.mockReturnValue({
      pathname: '/entity-setup/empty-type-entity',
      search: '',
      hash: '',
      state: null,
      key: 'test-key'
    });

    mockUseSelector.mockImplementation((selector) => {
      const mockState = {
        periodSetup: {},
        entities: {
          items: [
            { id: 'empty-type-entity', name: 'Empty Type Entity', entityType: '' }
          ],
          loading: false
        }
      };
      return selector(mockState);
    });

    const { result } = renderHook(() => useEntityData());

    expect(result.current.isRollupEntity).toBe(false);
  });

  it('should handle multiple entities with correct count', () => {
    mockUseParams.mockReturnValue({ entityId: 'entity-1' });
    mockUseLocation.mockReturnValue({
      pathname: '/entity-setup/entity-1',
      search: '',
      hash: '',
      state: null,
      key: 'test-key'
    });

    mockUseSelector.mockImplementation((selector) => {
      const mockState = {
        periodSetup: {},
        entities: {
          items: [
            { id: 'entity-1', name: 'Entity 1', entityType: 'Planning' },
            { id: 'entity-2', name: 'Entity 2', entityType: 'Rollup' },
            { id: 'entity-3', name: 'Entity 3', entityType: 'Custom' }
          ],
          loading: false
        }
      };
      return selector(mockState);
    });

    const { result } = renderHook(() => useEntityData());

    expect(result.current.entitiesCount).toBe(3);
    expect(result.current.entity).toEqual({ id: 'entity-1', name: 'Entity 1', entityType: 'Planning' });
  });

  it('should handle entity not found in items', () => {
    mockUseParams.mockReturnValue({ entityId: 'not-found-entity' });
    mockUseLocation.mockReturnValue({
      pathname: '/entity-setup/not-found-entity',
      search: '',
      hash: '',
      state: null,
      key: 'test-key'
    });

    mockUseSelector.mockImplementation((selector) => {
      const mockState = {
        periodSetup: {},
        entities: {
          items: [
            { id: 'other-entity', name: 'Other Entity', entityType: 'Planning' }
          ],
          loading: false
        }
      };
      return selector(mockState);
    });

    const { result } = renderHook(() => useEntityData());

    expect(result.current.entity).toBeUndefined();
    expect(result.current.entitiesCount).toBe(1);
  });

  it('should maintain consistent return structure', () => {
    mockUseParams.mockReturnValue({ entityId: 'consistent-entity' });
    mockUseLocation.mockReturnValue({
      pathname: '/entity-setup/consistent-entity',
      search: '',
      hash: '',
      state: null,
      key: 'test-key'
    });

    mockUseSelector.mockImplementation((selector) => {
      const mockState = {
        periodSetup: { data: 'test' },
        entities: {
          items: [
            { id: 'consistent-entity', name: 'Consistent Entity', entityType: 'Planning' }
          ],
          loading: false
        }
      };
      return selector(mockState);
    });

    const { result } = renderHook(() => useEntityData());

    expect(result.current).toHaveProperty('entityId');
    expect(result.current).toHaveProperty('entityConfiguration');
    expect(result.current).toHaveProperty('periodSetup');
    expect(result.current).toHaveProperty('entity');
    expect(result.current).toHaveProperty('entitiesCount');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('isRollupEntity');
  });

  it('should handle re-renders correctly', () => {
    mockUseParams.mockReturnValue({ entityId: 'rerender-entity' });
    mockUseLocation.mockReturnValue({
      pathname: '/entity-setup/rerender-entity',
      search: '',
      hash: '',
      state: null,
      key: 'test-key'
    });

    mockUseSelector.mockImplementation((selector) => {
      const mockState = {
        periodSetup: { data: 'test-data' },
        entities: {
          items: [
            { id: 'rerender-entity', name: 'Rerender Entity', entityType: 'Planning' }
          ],
          loading: false
        }
      };
      return selector(mockState);
    });

    const { result, rerender } = renderHook(() => useEntityData());

    // First render
    expect(result.current.periodSetup).toEqual({ data: 'test-data' });
    expect(result.current.entity).toEqual({ id: 'rerender-entity', name: 'Rerender Entity', entityType: 'Planning' });

    // Re-render should maintain the same values
    rerender();

    expect(result.current.periodSetup).toEqual({ data: 'test-data' });
    expect(result.current.entity).toEqual({ id: 'rerender-entity', name: 'Rerender Entity', entityType: 'Planning' });
  });
});
