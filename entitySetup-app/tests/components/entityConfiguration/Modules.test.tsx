import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Modules, { ModulesRef } from '../../../src/components/entityConfiguration/Modules';

// Mock dependencies
jest.mock('../../../src/components/entityConfiguration/ModuleCard', () => {
  return function MockModuleCard({ module, isEditMode, onToggle, onConfigure }: any) {
    return (
      <div data-testid={`module-card-${module.id}`}>
        <input
          type="checkbox"
          checked={module.isEnabled}
          onChange={(e) => onToggle(module.id, e.target.checked)}
          data-testid={`module-checkbox-${module.id}`}
        />
        <span data-testid={`module-name-${module.id}`}>{module.name}</span>
        <button onClick={() => onConfigure(module.id)} data-testid={`configure-${module.id}`}>
          Configure
        </button>
      </div>
    );
  };
});

jest.mock('../../../src/store/Actions/entitySetupActions', () => ({
  fetchModules: jest.fn(() => ({ type: 'entitySetup/fetchModules' })),
  saveEntityModulesAction: jest.fn(() => ({ type: 'entitySetup/saveEntityModules' }))
}));

jest.mock('../../../src/services/entitySaveService', () => ({
  parseModulesJson: jest.fn((json) => {
    if (!json) return [];
    try {
      return JSON.parse(json);
    } catch {
      return [];
    }
  })
}));

describe('Modules', () => {
  let store: any;
  const mockOnModuleSave = jest.fn();
  const mockOnDataChange = jest.fn();

  const defaultStoreState = {
    entitySetup: {
      modules: [
        { id: 'module1', name: 'Module 1', description: 'Description 1' },
        { id: 'module2', name: 'Module 2', description: 'Description 2' },
        { id: 'module3', name: 'Module 3', description: 'Description 3' }
      ],
      loading: false,
      error: null
    },
    entities: {
      items: [
        {
          id: 'entity1',
          legalBusinessName: 'Entity 1',
          modules: JSON.stringify(['module1', 'module2'])
        }
      ]
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    store = configureStore({
      reducer: {
        entitySetup: (state = defaultStoreState.entitySetup) => state,
        entities: (state = defaultStoreState.entities) => state
      }
    });
  });

  const renderWithStore = (props: any = {}) => {
    return render(
      <Provider store={store}>
        <Modules
          isEditMode={true}
          entityId="entity1"
          onModuleSave={mockOnModuleSave}
          onDataChange={mockOnDataChange}
          {...props}
        />
      </Provider>
    );
  };

  describe('Component Rendering', () => {
    it('should render instruction text', () => {
      renderWithStore();
      expect(screen.getByText('Please select Module you want to enable in the system.')).toBeInTheDocument();
    });

    it('should render modules list', () => {
      renderWithStore();
      expect(screen.getByTestId('module-card-module1')).toBeInTheDocument();
      expect(screen.getByTestId('module-card-module2')).toBeInTheDocument();
      expect(screen.getByTestId('module-card-module3')).toBeInTheDocument();
    });

    it('should render loading state', () => {
      store = configureStore({
        reducer: {
          entitySetup: (state = { ...defaultStoreState.entitySetup, loading: true }) => state,
          entities: (state = defaultStoreState.entities) => state
        }
      });

      const { container } = render(
        <Provider store={store}>
          <Modules isEditMode={true} entityId="entity1" />
        </Provider>
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render error state', () => {
      store = configureStore({
        reducer: {
          entitySetup: (state = { ...defaultStoreState.entitySetup, error: 'Error message' }) => state,
          entities: (state = defaultStoreState.entities) => state
        }
      });

      render(
        <Provider store={store}>
          <Modules isEditMode={true} entityId="entity1" />
        </Provider>
      );

      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('should render empty state when no modules', () => {
      store = configureStore({
        reducer: {
          entitySetup: (state = { ...defaultStoreState.entitySetup, modules: [] }) => state,
          entities: (state = defaultStoreState.entities) => state
        }
      });

      render(
        <Provider store={store}>
          <Modules isEditMode={true} entityId="entity1" />
        </Provider>
      );

      expect(screen.getByText('No modules available')).toBeInTheDocument();
    });
  });

  describe('Module Selection', () => {
    it('should toggle module selection', () => {
      renderWithStore();

      const checkbox = screen.getByTestId('module-checkbox-module1');
      expect(checkbox).not.toBeChecked();

      fireEvent.change(checkbox, { target: { checked: true } });
      expect(checkbox).toBeChecked();
    });

    it('should call onDataChange when module is toggled', () => {
      renderWithStore();

      const checkbox = screen.getByTestId('module-checkbox-module1');
      fireEvent.change(checkbox, { target: { checked: true } });

      expect(mockOnDataChange).toHaveBeenCalled();
    });

    it('should load saved modules from entity', () => {
      renderWithStore();

      // Modules from entity should be selected
      const checkbox1 = screen.getByTestId('module-checkbox-module1');
      const checkbox2 = screen.getByTestId('module-checkbox-module2');
      
      // These should be checked based on entity modules
      expect(checkbox1).toBeChecked();
      expect(checkbox2).toBeChecked();
    });

    it('should handle module with id "0"', () => {
      store = configureStore({
        reducer: {
          entitySetup: (state = {
            ...defaultStoreState.entitySetup,
            modules: [
              { id: '0', name: 'Module 0', description: 'Description 0' }
            ]
          }) => state,
          entities: (state = defaultStoreState.entities) => state
        }
      });

      render(
        <Provider store={store}>
          <Modules isEditMode={true} entityId="entity1" />
        </Provider>
      );

      expect(screen.getByTestId('module-card-module-0')).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('should show warning when more than 10 modules selected', () => {
      const manyModules = Array.from({ length: 11 }, (_, i) => ({
        id: `module${i}`,
        name: `Module ${i}`,
        description: `Description ${i}`
      }));

      store = configureStore({
        reducer: {
          entitySetup: (state = { ...defaultStoreState.entitySetup, modules: manyModules }) => state,
          entities: (state = defaultStoreState.entities) => state
        }
      });

      render(
        <Provider store={store}>
          <Modules isEditMode={true} entityId="entity1" />
        </Provider>
      );

      // Select all modules
      for (let i = 0; i < 11; i++) {
        const checkbox = screen.getByTestId(`module-checkbox-module${i}`);
        if (!checkbox.checked) {
          fireEvent.change(checkbox, { target: { checked: true } });
        }
      }

      waitFor(() => {
        expect(screen.getByText(/Too many modules enabled/)).toBeInTheDocument();
      });
    });

    it('should not show validation message when 10 or fewer modules selected', () => {
      renderWithStore();

      expect(screen.queryByText(/Too many modules enabled/)).not.toBeInTheDocument();
    });
  });

  describe('Ref Methods', () => {
    it('should expose saveModulesToEntity via ref', async () => {
      const ref = React.createRef<ModulesRef>();

      renderWithStore({ ref });

      expect(ref.current).toBeDefined();
      expect(ref.current?.saveModulesToEntity).toBeDefined();

      await act(async () => {
        await ref.current?.saveModulesToEntity();
      });

      expect(mockOnModuleSave).toHaveBeenCalled();
    });

    it('should expose resetModules via ref', () => {
      const ref = React.createRef<ModulesRef>();

      renderWithStore({ ref });

      expect(ref.current?.resetModules).toBeDefined();

      act(() => {
        ref.current?.resetModules();
      });

      expect(mockOnDataChange).toHaveBeenCalled();
    });

    it('should handle saveModulesToEntity without entityId', async () => {
      const ref = React.createRef<ModulesRef>();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <Provider store={store}>
          <Modules ref={ref} isEditMode={true} />
        </Provider>
      );

      await act(async () => {
        await ref.current?.saveModulesToEntity();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Entity ID is required to save modules');
      consoleSpy.mockRestore();
    });

    it('should reset modules to saved state', () => {
      const ref = React.createRef<ModulesRef>();

      renderWithStore({ ref });

      // Toggle a module off
      const checkbox = screen.getByTestId('module-checkbox-module3');
      fireEvent.change(checkbox, { target: { checked: true } });

      jest.clearAllMocks();

      // Reset
      act(() => {
        ref.current?.resetModules();
      });

      expect(mockOnDataChange).toHaveBeenCalled();
    });

    it('should reset to empty array when entity has no modules', () => {
      store = configureStore({
        reducer: {
          entitySetup: (state = defaultStoreState.entitySetup) => state,
          entities: (state = {
            items: [{ id: 'entity1', legalBusinessName: 'Entity 1', modules: null }]
          }) => state
        }
      });

      const ref = React.createRef<ModulesRef>();

      render(
        <Provider store={store}>
          <Modules ref={ref} isEditMode={true} entityId="entity1" onDataChange={mockOnDataChange} />
        </Provider>
      );

      act(() => {
        ref.current?.resetModules();
      });

      expect(mockOnDataChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Entity Changes', () => {
    it('should reset loaded flag when entityId changes', () => {
      const { rerender } = renderWithStore();

      // Change entityId
      rerender(
        <Provider store={store}>
          <Modules isEditMode={true} entityId="entity2" onDataChange={mockOnDataChange} />
        </Provider>
      );

      expect(screen.getByText('Please select Module you want to enable in the system.')).toBeInTheDocument();
    });

    it('should load modules when entity changes', () => {
      store = configureStore({
        reducer: {
          entitySetup: (state = defaultStoreState.entitySetup) => state,
          entities: (state = {
            items: [
              { id: 'entity2', legalBusinessName: 'Entity 2', modules: JSON.stringify(['module3']) }
            ]
          }) => state
        }
      });

      render(
        <Provider store={store}>
          <Modules isEditMode={true} entityId="entity2" onDataChange={mockOnDataChange} />
        </Provider>
      );

      const checkbox3 = screen.getByTestId('module-checkbox-module3');
      expect(checkbox3).toBeChecked();
    });
  });

  describe('Horizontal Scroll', () => {
    it('should check for horizontal overflow', () => {
      jest.useFakeTimers();
      const mockQuerySelector = jest.fn(() => ({
        scrollWidth: 1000,
        clientWidth: 500
      }));
      document.querySelector = mockQuerySelector;

      renderWithStore();

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(mockQuerySelector).toHaveBeenCalledWith('.modules-scroll-container');
      jest.useRealTimers();
    });

    it('should add resize event listener', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      const { unmount } = renderWithStore();

      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

      unmount();
      expect(jest.spyOn(window, 'removeEventListener')).toHaveBeenCalled();
    });
  });

  describe('Module Configuration', () => {
    it('should handle configure button click', () => {
      renderWithStore();

      const configureButton = screen.getByTestId('configure-module1');
      fireEvent.click(configureButton);

      // Function should be defined but does nothing currently
      expect(configureButton).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle modules with null id', () => {
      store = configureStore({
        reducer: {
          entitySetup: (state = {
            ...defaultStoreState.entitySetup,
            modules: [
              { id: null, name: 'Module Null', description: 'Description' }
            ]
          }) => state,
          entities: (state = defaultStoreState.entities) => state
        }
      });

      render(
        <Provider store={store}>
          <Modules isEditMode={true} entityId="entity1" />
        </Provider>
      );

      expect(screen.getByTestId('module-card-module-0')).toBeInTheDocument();
    });

    it('should handle invalid JSON in entity modules', () => {
      store = configureStore({
        reducer: {
          entitySetup: (state = defaultStoreState.entitySetup) => state,
          entities: (state = {
            items: [{ id: 'entity1', legalBusinessName: 'Entity 1', modules: 'invalid json' }]
          }) => state
        }
      });

      render(
        <Provider store={store}>
          <Modules isEditMode={true} entityId="entity1" />
        </Provider>
      );

      // Should not crash
      expect(screen.getByText('Please select Module you want to enable in the system.')).toBeInTheDocument();
    });

    it('should handle empty modules JSON', () => {
      store = configureStore({
        reducer: {
          entitySetup: (state = defaultStoreState.entitySetup) => state,
          entities: (state = {
            items: [{ id: 'entity1', legalBusinessName: 'Entity 1', modules: '' }]
          }) => state
        }
      });

      render(
        <Provider store={store}>
          <Modules isEditMode={true} entityId="entity1" />
        </Provider>
      );

      // Should handle empty string
      expect(screen.getByText('Please select Module you want to enable in the system.')).toBeInTheDocument();
    });

    it('should handle isEditMode false', () => {
      renderWithStore({ isEditMode: false });

      expect(screen.getByTestId('module-card-module1')).toBeInTheDocument();
    });

    it('should handle missing onModuleSave', async () => {
      const ref = React.createRef<ModulesRef>();

      render(
        <Provider store={store}>
          <Modules ref={ref} isEditMode={true} entityId="entity1" />
        </Provider>
      );

      await act(async () => {
        await ref.current?.saveModulesToEntity();
      });

      // Should not throw
      expect(ref.current).toBeDefined();
    });

    it('should handle missing onDataChange', () => {
      render(
        <Provider store={store}>
          <Modules isEditMode={true} entityId="entity1" />
        </Provider>
      );

      const checkbox = screen.getByTestId('module-checkbox-module1');
      fireEvent.change(checkbox, { target: { checked: true } });

      // Should not throw
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe('Display Name', () => {
    it('should set displayName correctly', () => {
      renderWithStore();
      expect(Modules.displayName).toBe('Modules');
    });
  });
});
