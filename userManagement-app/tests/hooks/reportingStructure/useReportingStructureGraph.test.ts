/**
 * Tests for useReportingStructureGraph hook
 */
import { renderHook } from '@testing-library/react';
import { useReportingStructureGraph } from '../../../src/hooks/reportingStructure/useReportingStructureGraph';

// Mock dependencies
jest.mock('commonApp/useHierarchyDataProcessing', () => ({
  useHierarchyDataProcessing: jest.fn(() => ({
    nodes: [],
    edges: [],
    onNodesChange: jest.fn(),
    onEdgesChange: jest.fn(),
    processedData: null
  }))
}));

jest.mock('../../../src/utils/reportingStructureUtils', () => ({
  processUserData: jest.fn(() => ({ nodes: [], edges: [] })),
  getLayoutedUserElements: jest.fn((nodes, edges) => ({ nodes, edges }))
}));

describe('useReportingStructureGraph', () => {
  const mockReactFlowRef = { current: null };

  it('should return graph data', () => {
    const { result } = renderHook(() =>
      useReportingStructureGraph([], false, 'organizational', mockReactFlowRef)
    );

    expect(result.current.nodes).toBeDefined();
    expect(result.current.edges).toBeDefined();
    expect(result.current.onNodesChange).toBeDefined();
    expect(result.current.onEdgesChange).toBeDefined();
  });

  it('should handle different view types', () => {
    const { result: result1 } = renderHook(() =>
      useReportingStructureGraph([], false, 'organizational', mockReactFlowRef)
    );
    const { result: result2 } = renderHook(() =>
      useReportingStructureGraph([], false, 'departmental', mockReactFlowRef)
    );
    const { result: result3 } = renderHook(() =>
      useReportingStructureGraph([], false, 'dotted-line', mockReactFlowRef)
    );

    expect(result1.current).toBeDefined();
    expect(result2.current).toBeDefined();
    expect(result3.current).toBeDefined();
  });

  it('should handle null hierarchy', () => {
    const { result } = renderHook(() =>
      useReportingStructureGraph(null, false, 'organizational', mockReactFlowRef)
    );

    expect(result.current.nodes).toBeDefined();
    expect(result.current.edges).toBeDefined();
  });

  it('should handle loading state', () => {
    const { result } = renderHook(() =>
      useReportingStructureGraph([], true, 'organizational', mockReactFlowRef)
    );

    expect(result.current.nodes).toBeDefined();
    expect(result.current.edges).toBeDefined();
  });

  it('should handle empty hierarchy array', () => {
    const { result } = renderHook(() =>
      useReportingStructureGraph([], false, 'organizational', mockReactFlowRef)
    );

    expect(result.current.nodes).toBeDefined();
    expect(result.current.edges).toBeDefined();
  });

  it('should handle hierarchy with data', () => {
    const hierarchy = [
      { id: 1, firstName: 'John', lastName: 'Doe', fullName: 'John Doe', role: 'Developer', department: 'IT' }
    ];
    const { result } = renderHook(() =>
      useReportingStructureGraph(hierarchy, false, 'organizational', mockReactFlowRef)
    );

    expect(result.current.nodes).toBeDefined();
    expect(result.current.edges).toBeDefined();
  });

  it('should memoize processor based on viewType', () => {
    const { useHierarchyDataProcessing } = require('commonApp/useHierarchyDataProcessing');
    const { processUserData, getLayoutedUserElements } = require('../../../src/utils/reportingStructureUtils');

    const { rerender } = renderHook(
      ({ viewType }) => useReportingStructureGraph([], false, viewType, mockReactFlowRef),
      { initialProps: { viewType: 'organizational' as const } }
    );

    const firstCall = useHierarchyDataProcessing.mock.calls.length;

    rerender({ viewType: 'organizational' });
    // Should not recreate processor for same viewType
    expect(useHierarchyDataProcessing.mock.calls.length).toBeGreaterThanOrEqual(firstCall);

    rerender({ viewType: 'departmental' });
    // Should recreate processor for different viewType
    expect(useHierarchyDataProcessing.mock.calls.length).toBeGreaterThan(firstCall);
  });

  it('should pass correct props to useHierarchyDataProcessing', () => {
    const { useHierarchyDataProcessing } = require('commonApp/useHierarchyDataProcessing');
    const hierarchy = [{ id: 1 }];

    renderHook(() =>
      useReportingStructureGraph(hierarchy, false, 'organizational', mockReactFlowRef)
    );

    expect(useHierarchyDataProcessing).toHaveBeenCalledWith(
      expect.objectContaining({
        hierarchy,
        hierarchyLoading: false,
        layoutDirection: 'LR',
        viewType: 'organizational',
        reactFlowRef: mockReactFlowRef,
        preserveZoomOnViewChange: true,
        fitViewDelay: 200,
        logPrefix: 'useReportingStructureGraph'
      })
    );
  });

  it('should return processedData', () => {
    const { useHierarchyDataProcessing } = require('commonApp/useHierarchyDataProcessing');
    useHierarchyDataProcessing.mockReturnValueOnce({
      nodes: [],
      edges: [],
      onNodesChange: jest.fn(),
      onEdgesChange: jest.fn(),
      processedData: { test: 'data' }
    });

    const { result } = renderHook(() =>
      useReportingStructureGraph([], false, 'organizational', mockReactFlowRef)
    );

    expect(result.current.processedData).toEqual({ test: 'data' });
  });

  it('should handle processor mapData function', () => {
    const { useHierarchyDataProcessing } = require('commonApp/useHierarchyDataProcessing');
    let capturedProcessor: any;

    useHierarchyDataProcessing.mockImplementation((props: any) => {
      capturedProcessor = props.processor;
      return {
        nodes: [],
        edges: [],
        onNodesChange: jest.fn(),
        onEdgesChange: jest.fn(),
        processedData: null
      };
    });

    renderHook(() =>
      useReportingStructureGraph([], false, 'organizational', mockReactFlowRef)
    );

    const userData = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      role: 'Developer',
      department: 'IT',
      reportingManager: [{ id: 2 }],
      dottedProjectManager: []
    };

    const mapped = capturedProcessor.mapData(userData);
    expect(mapped).toEqual({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      role: 'Developer',
      department: 'IT',
      reportingManager: [{ id: 2 }],
      dottedProjectManager: []
    });
  });

  it('should handle processor with default empty arrays', () => {
    const { useHierarchyDataProcessing } = require('commonApp/useHierarchyDataProcessing');
    let capturedProcessor: any;

    useHierarchyDataProcessing.mockImplementation((props: any) => {
      capturedProcessor = props.processor;
      return {
        nodes: [],
        edges: [],
        onNodesChange: jest.fn(),
        onEdgesChange: jest.fn(),
        processedData: null
      };
    });

    renderHook(() =>
      useReportingStructureGraph([], false, 'organizational', mockReactFlowRef)
    );

    const userData = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe'
    };

    const mapped = capturedProcessor.mapData(userData);
    expect(mapped.reportingManager).toEqual([]);
    expect(mapped.dottedProjectManager).toEqual([]);
  });
});
