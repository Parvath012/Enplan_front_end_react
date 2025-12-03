/**
 * Tests for useReportingStructureZoom hook
 */
import { renderHook } from '@testing-library/react';
import { useReportingStructureZoom } from '../../../src/hooks/reportingStructure/useReportingStructureZoom';

// Mock commonApp hook
jest.mock('commonApp/useHierarchyZoom', () => ({
  useHierarchyZoom: jest.fn(() => ({
    zoomIndex: 0,
    zoomSteps: [50, 75, 100, 125, 150],
    zoomIn: jest.fn(),
    zoomOut: jest.fn(),
    zoomReset: jest.fn(),
    reactFlowRef: { current: null }
  }))
}));

describe('useReportingStructureZoom', () => {
  it('should return zoom controls', () => {
    const { result } = renderHook(() => useReportingStructureZoom());

    expect(result.current.zoomIndex).toBe(0);
    expect(result.current.zoomSteps).toEqual([50, 75, 100, 125, 150]);
    expect(result.current.zoomIn).toBeDefined();
    expect(result.current.zoomOut).toBeDefined();
    expect(result.current.zoomReset).toBeDefined();
    expect(result.current.reactFlowRef).toBeDefined();
  });

  it('should return reactFlowRef', () => {
    const { result } = renderHook(() => useReportingStructureZoom());

    expect(result.current.reactFlowRef).toEqual({ current: null });
  });

  it('should call useHierarchyZoom with DEFAULT_ZOOM_INDEX', () => {
    const { useHierarchyZoom } = require('commonApp/useHierarchyZoom');
    const { DEFAULT_ZOOM_INDEX } = require('commonApp/hierarchyConstants');

    renderHook(() => useReportingStructureZoom());

    expect(useHierarchyZoom).toHaveBeenCalledWith(DEFAULT_ZOOM_INDEX);
  });

  it('should return all zoom-related properties', () => {
    const { result } = renderHook(() => useReportingStructureZoom());

    expect(result.current).toHaveProperty('zoomIndex');
    expect(result.current).toHaveProperty('zoomSteps');
    expect(result.current).toHaveProperty('zoomIn');
    expect(result.current).toHaveProperty('zoomOut');
    expect(result.current).toHaveProperty('zoomReset');
    expect(result.current).toHaveProperty('reactFlowRef');
  });

  it('should return functions for zoom controls', () => {
    const { result } = renderHook(() => useReportingStructureZoom());

    expect(typeof result.current.zoomIn).toBe('function');
    expect(typeof result.current.zoomOut).toBe('function');
    expect(typeof result.current.zoomReset).toBe('function');
  });

  it('should return zoomSteps array', () => {
    const { result } = renderHook(() => useReportingStructureZoom());

    expect(Array.isArray(result.current.zoomSteps)).toBe(true);
    expect(result.current.zoomSteps.length).toBeGreaterThan(0);
  });

  it('should return reactFlowRef as object with current property', () => {
    const { result } = renderHook(() => useReportingStructureZoom());

    expect(result.current.reactFlowRef).toBeDefined();
    expect(result.current.reactFlowRef).toHaveProperty('current');
  });
});
