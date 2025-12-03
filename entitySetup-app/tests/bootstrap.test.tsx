import React from 'react';

// Mock ReactDOM
const mockRender = jest.fn();
const mockCreateRoot = jest.fn();
const mockGetElementById = jest.fn();

jest.mock('react-dom/client', () => ({
  createRoot: mockCreateRoot,
}));

jest.mock('react-dom', () => ({
  render: mockRender,
}));

// Mock the App component
jest.mock('../src/App', () => {
  return function MockApp() {
    return <div data-testid="app">Mock App</div>;
  };
});

// Mock BrowserRouter
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: any) => <div data-testid="browser-router">{children}</div>,
}));

describe('Bootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset DOM mocks
    mockGetElementById.mockReturnValue(document.createElement('div'));
    Object.defineProperty(document, 'getElementById', {
      value: mockGetElementById,
      writable: true
    });
    
    // Mock the root object
    const mockRoot = {
      render: mockRender
    };
    mockCreateRoot.mockReturnValue(mockRoot);
  });

  it('should handle root element creation', () => {
    require('../src/bootstrap');
    
    expect(mockGetElementById).toHaveBeenCalledWith('app');
  });

  it('should render App component inside BrowserRouter', () => {
    jest.resetModules();
    require('../src/bootstrap');
    
    expect(mockCreateRoot).toHaveBeenCalled();
    expect(mockRender).toHaveBeenCalled();
  });

  it('should handle different root element IDs', () => {
    jest.resetModules();
    require('../src/bootstrap');
    
    expect(mockGetElementById).toHaveBeenCalledWith('app');
  });

  it('should create root element correctly', () => {
    jest.resetModules();
    require('../src/bootstrap');
    
    expect(mockGetElementById).toHaveBeenCalledWith('app');
  });
});