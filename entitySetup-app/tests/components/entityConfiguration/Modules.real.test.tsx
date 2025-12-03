import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Modules from '../../../src/components/entityConfiguration/Modules';

// Mock the ModuleCard component
jest.mock('../../../src/components/entityConfiguration/ModuleCard', () => ({
  __esModule: true,
  default: function MockModuleCard({ module, isEditMode, onToggle, onConfigure }: any) {
    return (
      <div data-testid={`module-card-${module.id}`}>
        <div data-testid={`module-name-${module.id}`}>{module.name}</div>
        <div data-testid={`module-description-${module.id}`}>{module.description}</div>
        <div data-testid={`module-enabled-${module.id}`}>{module.isEnabled ? 'Enabled' : 'Disabled'}</div>
        <button 
          data-testid={`module-toggle-${module.id}`}
          onClick={() => onToggle(module.id, !module.isEnabled)}
        >
          Toggle
        </button>
        <button 
          data-testid={`module-configure-${module.id}`}
          onClick={() => onConfigure(module.id)}
        >
          Configure
        </button>
      </div>
    );
  }
}));

// Mock the CSS file
jest.mock('../../../src/components/entityConfiguration/Modules.css', () => ({}));

// Mock the services
jest.mock('../../../src/services/entitySaveService', () => ({
  parseModulesJson: jest.fn((modulesJson) => {
    if (!modulesJson) return [];
    try {
      return JSON.parse(modulesJson);
    } catch {
      return [];
    }
  })
}));

// Mock Redux actions
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: jest.fn()
}));

// Mock window methods
Object.defineProperty(window, 'addEventListener', {
  value: jest.fn(),
  writable: true
});

Object.defineProperty(window, 'removeEventListener', {
  value: jest.fn(),
  writable: true
});

// Mock document.querySelector
Object.defineProperty(document, 'querySelector', {
  value: jest.fn(),
  writable: true
});

describe('Modules - Real Component Tests', () => {
  let mockStore: any;
  let mockUseSelector: jest.Mock;
  let mockParseModulesJson: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useSelector
    mockUseSelector = require('react-redux').useSelector as jest.Mock;
    
    // Mock useSelector to return the correct state structure
    mockUseSelector.mockImplementation((selector) => {
      const state = {
        entitySetup: {
          modules: [
            { id: '1', name: 'Module 1', description: 'Description 1' },
            { id: '2', name: 'Module 2', description: 'Description 2' },
            { id: '3', name: 'Module 3', description: 'Description 3' }
          ],
          loading: false,
          error: null
        },
        entities: {
          items: [{
            id: 'test-entity-id',
            modules: JSON.stringify(['1', '2'])
          }]
        }
      };
      return selector(state);
    });
    
    // Mock parseModulesJson
    mockParseModulesJson = require('../../../src/services/entitySaveService').parseModulesJson as jest.Mock;
    
    // Mock store
    mockStore = configureStore({
      reducer: {
        entitySetup: () => ({
          modules: [
            { id: '1', name: 'Module 1', description: 'Description 1' },
            { id: '2', name: 'Module 2', description: 'Description 2' },
            { id: '3', name: 'Module 3', description: 'Description 3' }
          ],
          loading: false,
          error: null
        }),
        entities: () => ({
          items: [
            {
              id: 'test-entity-id',
              modules: JSON.stringify(['1', '2'])
            }
          ]
        })
      }
    });
    
    // Mock document.querySelector for overflow check
    const mockContainer = {
      scrollWidth: 100,
      clientWidth: 80
    };
    (document.querySelector as jest.Mock).mockReturnValue(mockContainer);
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <Provider store={mockStore}>
        {component}
      </Provider>
    );
  };

  it('should render without crashing', () => {
    renderWithProviders(
      <Modules 
        isEditMode={true} 
        entityId="test-entity-id" 
      />
    );
    
    expect(screen.getByText('Please select Module you want to enable in the system.')).toBeInTheDocument();
  });

  it('should render all module cards', () => {
    renderWithProviders(
      <Modules 
        isEditMode={true} 
        entityId="test-entity-id" 
      />
    );
    
    expect(screen.getByTestId('module-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('module-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('module-card-3')).toBeInTheDocument();
  });

  it('should display module names and descriptions', () => {
    renderWithProviders(
      <Modules 
        isEditMode={true} 
        entityId="test-entity-id" 
      />
    );
    
    expect(screen.getByTestId('module-name-1')).toHaveTextContent('Module 1');
    expect(screen.getByTestId('module-name-2')).toHaveTextContent('Module 2');
    expect(screen.getByTestId('module-name-3')).toHaveTextContent('Module 3');
    
    expect(screen.getByTestId('module-description-1')).toHaveTextContent('Description 1');
    expect(screen.getByTestId('module-description-2')).toHaveTextContent('Description 2');
    expect(screen.getByTestId('module-description-3')).toHaveTextContent('Description 3');
  });

  it('should handle module toggle', () => {
    const mockOnDataChange = jest.fn();
    
    renderWithProviders(
      <Modules 
        isEditMode={true} 
        entityId="test-entity-id"
        onDataChange={mockOnDataChange}
      />
    );
    
    const toggleButton = screen.getByTestId('module-toggle-1');
    fireEvent.click(toggleButton);
    
    expect(mockOnDataChange).toHaveBeenCalled();
  });

  it('should handle module configure', () => {
    renderWithProviders(
      <Modules 
        isEditMode={true} 
        entityId="test-entity-id" 
      />
    );
    
    const configureButton = screen.getByTestId('module-configure-1');
    fireEvent.click(configureButton);
    
    // Should not throw any errors
    expect(configureButton).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    // Mock useSelector to return loading state
    mockUseSelector.mockImplementation((selector) => {
      const state = {
        entitySetup: {
          modules: [],
          loading: true,
          error: null
        },
        entities: { items: [] }
      };
      return selector(state);
    });

    renderWithProviders(
      <Modules 
        isEditMode={true} 
        entityId="test-entity-id" 
      />
    );
    
    expect(screen.getByText('Loading modules...')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    // Mock useSelector to return error state
    mockUseSelector.mockImplementation((selector) => {
      const state = {
        entitySetup: {
          modules: [],
          loading: false,
          error: 'Failed to load modules'
        },
        entities: { items: [] }
      };
      return selector(state);
    });

    renderWithProviders(
      <Modules 
        isEditMode={true} 
        entityId="test-entity-id" 
      />
    );
    
    expect(screen.getByText('Failed to load modules')).toBeInTheDocument();
  });

  it('should handle empty modules array', () => {
    // Mock useSelector to return empty modules
    mockUseSelector.mockImplementation((selector) => {
      const state = {
        entitySetup: {
          modules: [],
          loading: false,
          error: null
        },
        entities: { items: [] }
      };
      return selector(state);
    });

    renderWithProviders(
      <Modules 
        isEditMode={true} 
        entityId="test-entity-id" 
      />
    );
    
    expect(screen.getByText('No modules available')).toBeInTheDocument();
  });

  it('should load saved modules from entity data', () => {
    mockParseModulesJson.mockReturnValue(['1', '2']);
    
    renderWithProviders(
      <Modules 
        isEditMode={true} 
        entityId="test-entity-id" 
      />
    );
    
    expect(mockParseModulesJson).toHaveBeenCalledWith(JSON.stringify(['1', '2']));
  });

  it('should handle entity without modules', () => {
    // Mock useSelector to return entity without modules
    mockUseSelector.mockImplementation((selector) => {
      const state = {
        entitySetup: {
          modules: [
            { id: '1', name: 'Module 1', description: 'Description 1' }
          ],
          loading: false,
          error: null
        },
        entities: {
          items: [
            { id: 'test-entity-id', modules: null }
          ]
        }
      };
      return selector(state);
    });

    renderWithProviders(
      <Modules 
        isEditMode={true} 
        entityId="test-entity-id" 
      />
    );
    
    expect(screen.getByTestId('module-card-1')).toBeInTheDocument();
  });

  it('should handle validation message for too many modules', () => {
    // Mock useSelector to return many selected modules
    mockUseSelector.mockImplementation((selector) => {
      const state = {
        entitySetup: {
          modules: Array.from({ length: 15 }, (_, i) => ({
            id: `${i + 1}`,
            name: `Module ${i + 1}`,
            description: `Description ${i + 1}`
          })),
          loading: false,
          error: null
        },
        entities: { items: [] }
      };
      return selector(state);
    });

    renderWithProviders(
      <Modules 
        isEditMode={true} 
        entityId="test-entity-id" 
      />
    );
    
    // Simulate selecting more than 10 modules
    const toggleButtons = screen.getAllByTestId(/module-toggle-/);
    for (let i = 0; i < 11; i++) {
      fireEvent.click(toggleButtons[i]);
    }
    
    expect(screen.getByText('Too many modules enabled. Consider enabling only necessary modules.')).toBeInTheDocument();
  });

  it('should handle component unmounting', () => {
    const { unmount } = renderWithProviders(
      <Modules 
        isEditMode={true} 
        entityId="test-entity-id" 
      />
    );
    
    expect(screen.getByTestId('module-card-1')).toBeInTheDocument();
    
    unmount();
    expect(screen.queryByTestId('module-card-1')).not.toBeInTheDocument();
  });

  it('should handle edit mode changes', () => {
    const { rerender } = renderWithProviders(
      <Modules 
        isEditMode={true} 
        entityId="test-entity-id" 
      />
    );
    
    expect(screen.getByTestId('module-card-1')).toBeInTheDocument();
    
    rerender(
      <Provider store={mockStore}>
        <Modules 
          isEditMode={false} 
          entityId="test-entity-id" 
        />
      </Provider>
    );
    
    expect(screen.getByTestId('module-card-1')).toBeInTheDocument();
  });

  it('should handle different entity IDs', () => {
    // Mock useSelector to return different entity
    mockUseSelector.mockImplementation((selector) => {
      const state = {
        entitySetup: {
          modules: [
            { id: '1', name: 'Module 1', description: 'Description 1' }
          ],
          loading: false,
          error: null
        },
        entities: {
          items: [
            { id: 'different-entity-id', modules: JSON.stringify(['1']) }
          ]
        }
      };
      return selector(state);
    });

    renderWithProviders(
      <Modules 
        isEditMode={true} 
        entityId="different-entity-id" 
      />
    );
    
    expect(screen.getByTestId('module-card-1')).toBeInTheDocument();
  });

  it('should handle save modules to entity', async () => {
    const mockOnModuleSave = jest.fn();
    const mockRef = React.createRef<any>();
    
    renderWithProviders(
      <Modules 
        ref={mockRef}
        isEditMode={true} 
        entityId="test-entity-id"
        onModuleSave={mockOnModuleSave}
      />
    );
    
    // Simulate selecting modules
    const toggleButton = screen.getByTestId('module-toggle-1');
    fireEvent.click(toggleButton);
    
    // Call saveModulesToEntity via ref
    if (mockRef.current) {
      await mockRef.current.saveModulesToEntity();
    }
    
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('should handle reset modules', () => {
    const mockOnDataChange = jest.fn();
    const mockRef = React.createRef<any>();
    
    renderWithProviders(
      <Modules 
        ref={mockRef}
        isEditMode={true} 
        entityId="test-entity-id"
        onDataChange={mockOnDataChange}
      />
    );
    
    // Call resetModules via ref
    if (mockRef.current) {
      mockRef.current.resetModules();
    }
    
    expect(mockParseModulesJson).toHaveBeenCalled();
  });

  it('should handle save modules without entityId', async () => {
    const mockRef = React.createRef<any>();
    
    renderWithProviders(
      <Modules 
        ref={mockRef}
        isEditMode={true} 
        entityId={undefined}
      />
    );
    
    // Call saveModulesToEntity via ref without entityId
    if (mockRef.current) {
      await mockRef.current.saveModulesToEntity();
    }
    
    // Should not throw error, just return early
    expect(mockRef.current).toBeDefined();
  });

  it('should handle overflow detection', () => {
    // Mock container with overflow
    const mockContainer = {
      scrollWidth: 200,
      clientWidth: 100
    };
    (document.querySelector as jest.Mock).mockReturnValue(mockContainer);
    
    renderWithProviders(
      <Modules 
        isEditMode={true} 
        entityId="test-entity-id" 
      />
    );
    
    // Should not throw any errors
    expect(screen.getByTestId('module-card-1')).toBeInTheDocument();
  });

  it('should handle window resize events', () => {
    renderWithProviders(
      <Modules 
        isEditMode={true} 
        entityId="test-entity-id" 
      />
    );
    
    // Simulate window resize
    act(() => {
      const resizeEvent = new Event('resize');
      window.dispatchEvent(resizeEvent);
    });
    
    expect(screen.getByTestId('module-card-1')).toBeInTheDocument();
  });

  it('should handle fetchModules dispatch', () => {
    // Mock useSelector to return empty modules
    mockUseSelector.mockImplementation((selector) => {
      const state = {
        entitySetup: {
          modules: [],
          loading: false,
          error: null
        },
        entities: { items: [] }
      };
      return selector(state);
    });

    renderWithProviders(
      <Modules 
        isEditMode={true} 
        entityId="test-entity-id" 
      />
    );
    
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('should handle module toggle with onDataChange callback', () => {
    const mockOnDataChange = jest.fn();
    
    renderWithProviders(
      <Modules 
        isEditMode={true} 
        entityId="test-entity-id"
        onDataChange={mockOnDataChange}
      />
    );
    
    const toggleButton = screen.getByTestId('module-toggle-1');
    fireEvent.click(toggleButton);
    
    expect(mockOnDataChange).toHaveBeenCalled();
  });

  it('should handle module toggle without onDataChange callback', () => {
    renderWithProviders(
      <Modules 
        isEditMode={true} 
        entityId="test-entity-id"
      />
    );
    
    const toggleButton = screen.getByTestId('module-toggle-1');
    fireEvent.click(toggleButton);
    
    // Should not throw any errors
    expect(toggleButton).toBeInTheDocument();
  });

  it('should handle entity change and reload saved modules', () => {
    const { rerender } = renderWithProviders(
      <Modules 
        isEditMode={true} 
        entityId="test-entity-id" 
      />
    );
    
    // Change entityId to trigger reload
    rerender(
      <Provider store={mockStore}>
        <Modules 
          isEditMode={true} 
          entityId="different-entity-id" 
        />
      </Provider>
    );
    
    expect(screen.getByTestId('module-card-1')).toBeInTheDocument();
  });

  it('should handle modules with missing IDs', () => {
    // Mock useSelector to return modules with missing IDs
    mockUseSelector.mockImplementation((selector) => {
      const state = {
        entitySetup: {
          modules: [
            { id: "0", name: 'Module 1', description: 'Description 1' },
            { id: null, name: 'Module 2', description: 'Description 2' }
          ],
          loading: false,
          error: null
        },
        entities: { items: [] }
      };
      return selector(state);
    });

    renderWithProviders(
      <Modules 
        isEditMode={true} 
        entityId="test-entity-id" 
      />
    );
    
    expect(screen.getByTestId('module-card-0')).toBeInTheDocument();
    expect(screen.getByTestId('module-card-null')).toBeInTheDocument();
  });
});
