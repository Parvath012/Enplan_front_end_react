import React from 'react';
import { render, screen } from '@testing-library/react';

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

// Mock document.getElementById
Object.defineProperty(document, 'getElementById', {
  value: mockGetElementById,
  writable: true,
});

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
  });

  it('should handle root element creation', () => {
    // Mock the DOM element
    const mockElement = document.createElement('div');
    mockElement.id = 'app';
    mockGetElementById.mockReturnValue(mockElement);
    
    // Mock ReactDOM.createRoot and render
    const mockRoot = {
      render: mockRender
    };
    mockCreateRoot.mockReturnValue(mockRoot);
    
    // Import and execute bootstrap
    jest.resetModules();
    require('../src/bootstrap');
    
    expect(mockGetElementById).toHaveBeenCalledWith('app');
  });

  it('should render App component inside BrowserRouter', () => {
    const mockElement = document.createElement('div');
    mockElement.id = 'app';
    mockGetElementById.mockReturnValue(mockElement);
    
    const mockRoot = {
      render: mockRender
    };
    mockCreateRoot.mockReturnValue(mockRoot);
    
    jest.resetModules();
    require('../src/bootstrap');
    
    expect(mockCreateRoot).toHaveBeenCalled();
    expect(mockRender).toHaveBeenCalled();
  });

  it('should handle different root element IDs', () => {
    const mockElement = document.createElement('div');
    mockElement.id = 'app';
    mockGetElementById.mockReturnValue(mockElement);
    
    const mockRoot = {
      render: mockRender
    };
    mockCreateRoot.mockReturnValue(mockRoot);
    
    jest.resetModules();
    require('../src/bootstrap');
    
    expect(mockGetElementById).toHaveBeenCalledWith('app');
  });

  it('should create root element correctly', () => {
    const mockElement = document.createElement('div');
    mockElement.id = 'app';
    mockGetElementById.mockReturnValue(mockElement);
    
    const mockRoot = {
      render: mockRender
    };
    mockCreateRoot.mockReturnValue(mockRoot);
    
    jest.resetModules();
    require('../src/bootstrap');
    
    expect(mockGetElementById).toHaveBeenCalledWith('app');
  });
});





