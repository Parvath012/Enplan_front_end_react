/**
 * Tests for useReportingStructureData hook
 */
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useReportingStructureData } from '../../../src/hooks/reportingStructure/useReportingStructureData';

describe('useReportingStructureData', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        users: (state = {
          hierarchy: [{ id: 1, firstName: 'John' }],
          hierarchyLoading: false,
          hierarchyError: null
        }, action) => state
      }
    });
  });

  const wrapper = ({ children }: any) => (
    <Provider store={store}>{children}</Provider>
  );

  it('should return hierarchy from Redux state', () => {
    const { result } = renderHook(() => useReportingStructureData(), { wrapper });

    expect(result.current.hierarchy).toEqual([{ id: 1, firstName: 'John' }]);
    expect(result.current.hierarchyLoading).toBe(false);
    expect(result.current.hierarchyError).toBeNull();
  });

  it('should return loading state', () => {
    store = configureStore({
      reducer: {
        users: (state = {
          hierarchy: null,
          hierarchyLoading: true,
          hierarchyError: null
        }, action) => state
      }
    });

    const wrapper2 = ({ children }: any) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useReportingStructureData(), { wrapper: wrapper2 });

    expect(result.current.hierarchyLoading).toBe(true);
  });

  it('should return error state', () => {
    store = configureStore({
      reducer: {
        users: (state = {
          hierarchy: null,
          hierarchyLoading: false,
          hierarchyError: 'Error message'
        }, action) => state
      }
    });

    const wrapper2 = ({ children }: any) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useReportingStructureData(), { wrapper: wrapper2 });

    expect(result.current.hierarchyError).toBe('Error message');
  });

  it('should return null hierarchy when state has null', () => {
    store = configureStore({
      reducer: {
        users: (state = {
          hierarchy: null,
          hierarchyLoading: false,
          hierarchyError: null
        }, action) => state
      }
    });

    const wrapper2 = ({ children }: any) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useReportingStructureData(), { wrapper: wrapper2 });

    expect(result.current.hierarchy).toBeNull();
    expect(result.current.hierarchyLoading).toBe(false);
    expect(result.current.hierarchyError).toBeNull();
  });

  it('should return empty array hierarchy', () => {
    store = configureStore({
      reducer: {
        users: (state = {
          hierarchy: [],
          hierarchyLoading: false,
          hierarchyError: null
        }, action) => state
      }
    });

    const wrapper2 = ({ children }: any) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useReportingStructureData(), { wrapper: wrapper2 });

    expect(result.current.hierarchy).toEqual([]);
    expect(result.current.hierarchyLoading).toBe(false);
  });

  it('should return all three properties', () => {
    const { result } = renderHook(() => useReportingStructureData(), { wrapper });

    expect(result.current).toHaveProperty('hierarchy');
    expect(result.current).toHaveProperty('hierarchyLoading');
    expect(result.current).toHaveProperty('hierarchyError');
  });
});
