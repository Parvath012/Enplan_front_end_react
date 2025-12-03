export const useHierarchyZoom = () => ({
  zoom: 1,
  setZoom: jest.fn(),
  zoomIn: jest.fn(),
  zoomOut: jest.fn(),
  resetZoom: jest.fn(),
  zoomToFit: jest.fn()
});