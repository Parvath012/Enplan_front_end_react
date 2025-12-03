/**
 * Tests for useReportingStructure hook
 */
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useReportingStructure } from '../../../src/hooks/reportingStructure/useReportingStructure';

// Mock dependencies
jest.mock('../../../src/hooks/reportingStructure/useReportingStructureData', () => ({
  useReportingStructureData: jest.fn(() => ({
    hierarchy: [],
    hierarchyLoading: false,
    hierarchyError: null
  }))
}));

jest.mock('../../../src/hooks/reportingStructure/useReportingStructureZoom', () => ({
  useReportingStructureZoom: jest.fn(() => ({
    zoomIndex: 0,
    zoomSteps: [50, 75, 100, 125, 150],
    zoomIn: jest.fn(),
    zoomOut: jest.fn(),
    zoomReset: jest.fn(),
    reactFlowRef: { current: null }
  }))
}));

jest.mock('../../../src/hooks/reportingStructure/useReportingStructureGraph', () => ({
  useReportingStructureGraph: jest.fn(() => ({
    nodes: [],
    edges: [],
    onNodesChange: jest.fn(),
    onEdgesChange: jest.fn(),
    processedData: null
  }))
}));

jest.mock('../../../src/store/Reducers/userSlice', () => ({
  fetchUserHierarchy: jest.fn(() => ({ type: 'users/fetchUserHierarchy' }))
}));

describe('useReportingStructure', () => {
  let store: any;

  beforeEach(() => {
    jest.clearAllMocks();
    store = configureStore({
      reducer: {
        users: (state = {
          hierarchy: [],
          hierarchyLoading: false
        }, action) => state
      }
    });
  });

  const wrapper = ({ children }: any) => (
    <Provider store={store}>{children}</Provider>
  );

  it('should return initial state', () => {
    const { result } = renderHook(() => useReportingStructure('organizational'), { wrapper });

    expect(result.current.hierarchy).toEqual([]);
    expect(result.current.hierarchyLoading).toBe(false);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.zoomIndex).toBe(0);
    expect(result.current.nodes).toEqual([]);
    expect(result.current.edges).toEqual([]);
  });

  it('should calculate totalCount from hierarchy', () => {
    const { useReportingStructureData } = require('../../../src/hooks/reportingStructure/useReportingStructureData');
    useReportingStructureData.mockReturnValueOnce({
      hierarchy: [{ id: 1 }, { id: 2 }, { id: 3 }],
      hierarchyLoading: false,
      hierarchyError: null
    });

    const { result } = renderHook(() => useReportingStructure('organizational'), { wrapper });

    expect(result.current.totalCount).toBe(3);
  });

  it('should handle different view types', () => {
    const { result: result1 } = renderHook(() => useReportingStructure('organizational'), { wrapper });
    const { result: result2 } = renderHook(() => useReportingStructure('departmental'), { wrapper });
    const { result: result3 } = renderHook(() => useReportingStructure('dotted-line'), { wrapper });

    expect(result1.current).toBeDefined();
    expect(result2.current).toBeDefined();
    expect(result3.current).toBeDefined();
  });

  it('should return zoom controls', () => {
    const { result } = renderHook(() => useReportingStructure('organizational'), { wrapper });

    expect(result.current.zoomIn).toBeDefined();
    expect(result.current.zoomOut).toBeDefined();
    expect(result.current.zoomReset).toBeDefined();
    expect(result.current.zoomSteps).toBeDefined();
    expect(result.current.reactFlowRef).toBeDefined();
  });

  it('should return graph data', () => {
    const { result } = renderHook(() => useReportingStructure('organizational'), { wrapper });

    expect(result.current.nodes).toBeDefined();
    expect(result.current.edges).toBeDefined();
    expect(result.current.onNodesChange).toBeDefined();
    expect(result.current.onEdgesChange).toBeDefined();
  });

  it('should fetch hierarchy when no data exists', () => {
    const { useReportingStructureData } = require('../../../src/hooks/reportingStructure/useReportingStructureData');
    const { fetchUserHierarchy } = require('../../../src/store/Reducers/userSlice');
    const mockDispatch = jest.fn();
    
    useReportingStructureData.mockReturnValueOnce({
      hierarchy: null,
      hierarchyLoading: false,
      hierarchyError: null
    });

    store.dispatch = mockDispatch;

    renderHook(() => useReportingStructure('organizational'), { wrapper });

    expect(mockDispatch).toHaveBeenCalled();
  });

  it('should fetch hierarchy when switching to dotted-line view', () => {
    const { useReportingStructureData } = require('../../../src/hooks/reportingStructure/useReportingStructureData');
    const mockDispatch = jest.fn();
    
    useReportingStructureData.mockReturnValueOnce({
      hierarchy: [{ id: 1 }],
      hierarchyLoading: false,
      hierarchyError: null
    });

    store.dispatch = mockDispatch;

    const { rerender } = renderHook(
      ({ viewType }) => useReportingStructure(viewType),
      { 
        wrapper,
        initialProps: { viewType: 'organizational' as const }
      }
    );

    jest.clearAllMocks();

    rerender({ viewType: 'dotted-line' });

    expect(mockDispatch).toHaveBeenCalled();
  });

  it('should fetch hierarchy when switching from dotted-line view', () => {
    const { useReportingStructureData } = require('../../../src/hooks/reportingStructure/useReportingStructureData');
    const mockDispatch = jest.fn();
    
    useReportingStructureData.mockReturnValueOnce({
      hierarchy: [{ id: 1 }],
      hierarchyLoading: false,
      hierarchyError: null
    });

    store.dispatch = mockDispatch;

    const { rerender } = renderHook(
      ({ viewType }) => useReportingStructure(viewType),
      { 
        wrapper,
        initialProps: { viewType: 'dotted-line' as const }
      }
    );

    jest.clearAllMocks();

    rerender({ viewType: 'organizational' });

    expect(mockDispatch).toHaveBeenCalled();
  });

  it('should skip fetch when switching between organizational and departmental', () => {
    const { useReportingStructureData } = require('../../../src/hooks/reportingStructure/useReportingStructureData');
    const mockDispatch = jest.fn();
    
    useReportingStructureData.mockReturnValue({
      hierarchy: [{ id: 1 }],
      hierarchyLoading: false,
      hierarchyError: null
    });

    store.dispatch = mockDispatch;

    const { rerender } = renderHook(
      ({ viewType }) => useReportingStructure(viewType),
      { 
        wrapper,
        initialProps: { viewType: 'organizational' as const }
      }
    );

    jest.clearAllMocks();

    rerender({ viewType: 'departmental' });

    // Should not fetch when switching between organizational and departmental
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('should use default viewType when not provided', () => {
    const { result } = renderHook(() => useReportingStructure(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.hierarchy).toBeDefined();
  });

  it('should calculate totalCount as 0 when hierarchy is null', () => {
    const { useReportingStructureData } = require('../../../src/hooks/reportingStructure/useReportingStructureData');
    useReportingStructureData.mockReturnValueOnce({
      hierarchy: null,
      hierarchyLoading: false,
      hierarchyError: null
    });

    const { result } = renderHook(() => useReportingStructure('organizational'), { wrapper });

    expect(result.current.totalCount).toBe(0);
  });

  it('should calculate totalCount correctly for non-empty hierarchy', () => {
    const { useReportingStructureData } = require('../../../src/hooks/reportingStructure/useReportingStructureData');
    useReportingStructureData.mockReturnValueOnce({
      hierarchy: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
      hierarchyLoading: false,
      hierarchyError: null
    });

    const { result } = renderHook(() => useReportingStructure('organizational'), { wrapper });

    expect(result.current.totalCount).toBe(5);
  });

  it('should return processedData from graph hook', () => {
    const { useReportingStructureGraph } = require('../../../src/hooks/reportingStructure/useReportingStructureGraph');
    useReportingStructureGraph.mockReturnValueOnce({
      nodes: [],
      edges: [],
      onNodesChange: jest.fn(),
      onEdgesChange: jest.fn(),
      processedData: { nodes: [], edges: [] }
    });

    const { result } = renderHook(() => useReportingStructure('organizational'), { wrapper });

    expect(result.current.processedData).toBeDefined();
  });
});
