import { renderHook, act } from '@testing-library/react';
import { useComponentState } from '../../../../src/components/entityConfiguration/hooks/useComponentState';
import * as tabSessionStorage from '../../../../src/utils/tabSessionStorage';

// Mock dependencies
jest.mock('../../../../src/components/entityConfiguration/Modules', () => ({
  ModulesRef: {
    saveModulesToEntity: jest.fn(),
    resetModules: jest.fn()
  }
}));

// Mock the router hook and sessionStorage utilities
const mockLocation = {
  pathname: '/entity-configuration',
  search: '',
  hash: '',
  state: null,
  key: 'test'
};

jest.mock('react-router-dom', () => ({
  useLocation: () => mockLocation
}));

// Mock sessionStorage utilities
jest.mock('../../../../src/utils/tabSessionStorage', () => ({
  saveEntityConfigTab: jest.fn(),
  getEntityConfigTab: jest.fn(() => null),
  clearEntityConfigTab: jest.fn(),
  isEntityConfigurationPage: jest.fn(() => true),
  shouldRestoreTabForEntity: jest.fn(() => true)
}));

// Mock timers for interval testing
jest.useFakeTimers();

describe('useComponentState', () => {
  describe('Basic functionality', () => {
    it('should render without crashing', () => {
      const { result } = renderHook(() => useComponentState(false));
      
      expect(result.current).toBeDefined();
      expect(result.current.tabValue).toBeDefined();
      expect(result.current.setTabValue).toBeDefined();
      expect(result.current.isSaving).toBeDefined();
      expect(result.current.setIsSaving).toBeDefined();
      expect(result.current.userClickedEdit).toBeDefined();
      expect(result.current.setUserClickedEdit).toBeDefined();
      expect(result.current.userHasSavedInSession).toBeDefined();
      expect(result.current.setUserHasSavedInSession).toBeDefined();
      expect(result.current.initialModeSetRef).toBeDefined();
      expect(result.current.modulesRef).toBeDefined();
      expect(result.current.modulesState).toBeDefined();
      expect(result.current.setModulesState).toBeDefined();
    });

    it('should return all expected properties', () => {
      const { result } = renderHook(() => useComponentState(false));
      
      expect(typeof result.current.tabValue).toBe('number');
      expect(typeof result.current.setTabValue).toBe('function');
      expect(typeof result.current.isSaving).toBe('boolean');
      expect(typeof result.current.setIsSaving).toBe('function');
      expect(typeof result.current.userClickedEdit).toBe('boolean');
      expect(typeof result.current.setUserClickedEdit).toBe('function');
      expect(typeof result.current.userHasSavedInSession).toBe('boolean');
      expect(typeof result.current.setUserHasSavedInSession).toBe('function');
      expect(typeof result.current.initialModeSetRef).toBe('object');
      expect(typeof result.current.modulesRef).toBe('object');
      expect(typeof result.current.modulesState).toBe('object');
      expect(typeof result.current.setModulesState).toBe('function');
    });
  });

  describe('Initial state values', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useComponentState(false));
      
      expect(result.current.tabValue).toBe(0);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.userClickedEdit).toBe(false);
      expect(result.current.userHasSavedInSession).toBe(false);
      expect(result.current.initialModeSetRef.current).toBe(false);
      expect(result.current.modulesRef.current).toBeNull();
      expect(result.current.modulesState).toEqual({
        isDataSaved: false,
        isDataModified: false,
        savedModules: [],
        currentModules: []
      });
    });
  });

  describe('State setters', () => {
    it('should update tabValue when setTabValue is called', () => {
      const { result } = renderHook(() => useComponentState(false));
      
      act(() => {
        result.current.setTabValue(1);
      });
      
      expect(result.current.tabValue).toBe(1);
    });

    it('should update isSaving when setIsSaving is called', () => {
      const { result } = renderHook(() => useComponentState(false));
      
      act(() => {
        result.current.setIsSaving(true);
      });
      
      expect(result.current.isSaving).toBe(true);
    });

    it('should update userClickedEdit when setUserClickedEdit is called', () => {
      const { result } = renderHook(() => useComponentState(false));
      
      act(() => {
        result.current.setUserClickedEdit(true);
      });
      
      expect(result.current.userClickedEdit).toBe(true);
    });

    it('should update userHasSavedInSession when setUserHasSavedInSession is called', () => {
      const { result } = renderHook(() => useComponentState(false));
      
      act(() => {
        result.current.setUserHasSavedInSession(true);
      });
      
      expect(result.current.userHasSavedInSession).toBe(true);
    });

    it('should update modulesState when setModulesState is called', () => {
      const { result } = renderHook(() => useComponentState(false));
      
      const newModulesState = {
        isDataSaved: true,
        isDataModified: true,
        savedModules: ['module1', 'module2'],
        currentModules: ['module1', 'module2', 'module3']
      };
      
      act(() => {
        result.current.setModulesState(newModulesState);
      });
      
      expect(result.current.modulesState).toEqual(newModulesState);
    });

    it('should update modulesState with function when setModulesState is called with function', () => {
      const { result } = renderHook(() => useComponentState(false));
      
      act(() => {
        result.current.setModulesState(prevState => ({
          ...prevState,
          isDataSaved: true
        }));
      });
      
      expect(result.current.modulesState.isDataSaved).toBe(true);
      expect(result.current.modulesState.savedModules).toEqual([]);
      expect(result.current.modulesState.currentModules).toEqual([]);
    });
  });

  describe('Ref management', () => {
    it('should provide initialModeSetRef that can be modified', () => {
      const { result } = renderHook(() => useComponentState(false));
      
      expect(result.current.initialModeSetRef.current).toBe(false);
      
      act(() => {
        result.current.initialModeSetRef.current = true;
      });
      
      expect(result.current.initialModeSetRef.current).toBe(true);
    });

    it('should provide modulesRef that can be modified', () => {
      const { result } = renderHook(() => useComponentState(false));
      
      expect(result.current.modulesRef.current).toBeNull();
      
      const mockModulesRef = {
        saveModulesToEntity: jest.fn(),
        resetModules: jest.fn()
      };
      
      act(() => {
        result.current.modulesRef.current = mockModulesRef;
      });
      
      expect(result.current.modulesRef.current).toBe(mockModulesRef);
    });
  });

  describe('State persistence', () => {
    it('should maintain state across re-renders', () => {
      const { result, rerender } = renderHook(() => useComponentState(false));
      
      act(() => {
        result.current.setTabValue(2);
        result.current.setIsSaving(true);
        result.current.setUserClickedEdit(true);
        result.current.setUserHasSavedInSession(true);
      });
      
      rerender();
      
      expect(result.current.tabValue).toBe(2);
      expect(result.current.isSaving).toBe(true);
      expect(result.current.userClickedEdit).toBe(true);
      expect(result.current.userHasSavedInSession).toBe(true);
    });

    it('should maintain ref values across re-renders', () => {
      const { result, rerender } = renderHook(() => useComponentState(false));
      
      act(() => {
        result.current.initialModeSetRef.current = true;
        result.current.modulesRef.current = { 
          saveModulesToEntity: jest.fn(),
          resetModules: jest.fn()
        };
      });
      
      rerender();
      
      expect(result.current.initialModeSetRef.current).toBe(true);
      expect(result.current.modulesRef.current).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle negative tab values', () => {
      const { result } = renderHook(() => useComponentState(false));
      
      act(() => {
        result.current.setTabValue(-1);
      });
      
      expect(result.current.tabValue).toBe(-1);
    });

    it('should handle large tab values', () => {
      const { result } = renderHook(() => useComponentState(false));
      
      act(() => {
        result.current.setTabValue(999);
      });
      
      expect(result.current.tabValue).toBe(999);
    });

    it('should handle empty modulesState', () => {
      const { result } = renderHook(() => useComponentState(false));
      
      const emptyState = {
        isDataSaved: false,
        isDataModified: false,
        savedModules: [],
        currentModules: []
      };
      
      act(() => {
        result.current.setModulesState(emptyState);
      });
      
      expect(result.current.modulesState).toEqual(emptyState);
    });

    it('should handle updated modulesState', () => {
      const { result } = renderHook(() => useComponentState(false));
      
      const updatedState = {
        isDataSaved: true,
        isDataModified: true,
        savedModules: ['module1'],
        currentModules: ['module1', 'module2']
      };
      
      act(() => {
        result.current.setModulesState(updatedState);
      });
      
      expect(result.current.modulesState).toEqual(updatedState);
    });
  });

  describe('Multiple state updates', () => {
    it('should handle multiple rapid state updates', () => {
      const { result } = renderHook(() => useComponentState(false));
      
      act(() => {
        result.current.setTabValue(1);
        result.current.setTabValue(2);
        result.current.setTabValue(0);
        result.current.setIsSaving(true);
        result.current.setIsSaving(false);
        result.current.setUserClickedEdit(true);
        result.current.setUserClickedEdit(false);
      });
      
      expect(result.current.tabValue).toBe(0);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.userClickedEdit).toBe(false);
    });

    it('should handle complex modulesState updates', () => {
      const { result } = renderHook(() => useComponentState(false));
      
      act(() => {
        result.current.setModulesState({
          isDataSaved: true,
          isDataModified: true,
          savedModules: ['module1'],
          currentModules: ['module1', 'module2']
        });
        
        result.current.setModulesState(prevState => ({
          ...prevState,
          currentModules: [...prevState.currentModules, 'module3']
        }));
      });
      
      expect(result.current.modulesState).toEqual({
        isDataSaved: true,
        isDataModified: true,
        savedModules: ['module1'],
        currentModules: ['module1', 'module2', 'module3']
      });
    });
  });

  describe('Hook isolation', () => {
    it('should maintain separate state for multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useComponentState(false));
      const { result: result2 } = renderHook(() => useComponentState(false));
      
      act(() => {
        result1.current.setTabValue(1);
        result2.current.setTabValue(2);
      });
      
      expect(result1.current.tabValue).toBe(1);
      expect(result2.current.tabValue).toBe(2);
    });
  });

  describe('Type safety', () => {
    it('should maintain correct types for all state values', () => {
      const { result } = renderHook(() => useComponentState(false));
      
      // Test that all state values have expected types
      expect(typeof result.current.tabValue).toBe('number');
      expect(typeof result.current.isSaving).toBe('boolean');
      expect(typeof result.current.userClickedEdit).toBe('boolean');
      expect(typeof result.current.userHasSavedInSession).toBe('boolean');
      expect(typeof result.current.modulesState).toBe('object');
      
      // Test that all setters are functions
      expect(typeof result.current.setTabValue).toBe('function');
      expect(typeof result.current.setIsSaving).toBe('function');
      expect(typeof result.current.setUserClickedEdit).toBe('function');
      expect(typeof result.current.setUserHasSavedInSession).toBe('function');
      expect(typeof result.current.setModulesState).toBe('function');
    });
  });

  describe('SessionStorage integration', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.clearAllTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
      jest.useFakeTimers();
    });

    it('should call getEntityConfigTab on initialization', () => {
      renderHook(() => useComponentState(false));
      expect(tabSessionStorage.getEntityConfigTab).toHaveBeenCalled();
    });

    it('should restore tab value from sessionStorage when available', () => {
      (tabSessionStorage.getEntityConfigTab as jest.Mock).mockReturnValue({ tabValue: 2, entityId: 'test-entity' });
      (tabSessionStorage.shouldRestoreTabForEntity as jest.Mock).mockReturnValue(true);
      
      const { result } = renderHook(() => useComponentState(false, 'test-entity'));
      
      expect(result.current.tabValue).toBe(2);
    });

    it('should not restore tab value if entityId does not match', () => {
      (tabSessionStorage.getEntityConfigTab as jest.Mock).mockReturnValue({ tabValue: 2, entityId: 'different-entity' });
      (tabSessionStorage.shouldRestoreTabForEntity as jest.Mock).mockReturnValue(false);
      
      const { result } = renderHook(() => useComponentState(false, 'test-entity'));
      
      expect(result.current.tabValue).toBe(0);
    });

    it('should save to sessionStorage when setTabValue is called', () => {
      const { result } = renderHook(() => useComponentState(false, 'test-entity'));
      
      act(() => {
        result.current.setTabValue(3);
      });
      
      expect(tabSessionStorage.saveEntityConfigTab).toHaveBeenCalledWith(3, 'test-entity');
    });

    it('should clear sessionStorage when not on entity configuration page', () => {
      (tabSessionStorage.isEntityConfigurationPage as jest.Mock).mockReturnValue(false);
      
      renderHook(() => useComponentState(false));
      
      expect(tabSessionStorage.clearEntityConfigTab).toHaveBeenCalled();
    });

    it('should clear sessionStorage when entity ID changes', () => {
      (tabSessionStorage.getEntityConfigTab as jest.Mock).mockReturnValue({ tabValue: 2, entityId: 'old-entity' });
      
      const { rerender } = renderHook((entityId) => useComponentState(false, entityId), {
        initialProps: 'old-entity'
      });
      
      rerender('new-entity');
      
      expect(tabSessionStorage.clearEntityConfigTab).toHaveBeenCalled();
    });

    it('should run periodic cleanup check', () => {
      (tabSessionStorage.isEntityConfigurationPage as jest.Mock).mockReturnValue(true);
      Object.defineProperty(window, 'location', {
        value: { pathname: '/entity-configuration' },
        writable: true
      });

      const { result } = renderHook(() => useComponentState(false));
      
      // Mock window.location.pathname change
      Object.defineProperty(window, 'location', {
        value: { pathname: '/other-page' },
        writable: true
      });
      
      // Advance timers to trigger the interval
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      // The periodic check should have detected navigation away
      expect(result.current.tabValue).toBe(0);
    });

    it('should cleanup on unmount when not on entity configuration page', () => {
      (tabSessionStorage.isEntityConfigurationPage as jest.Mock).mockReturnValue(false);
      Object.defineProperty(window, 'location', {
        value: { pathname: '/other-page' },
        writable: true
      });
      
      const { unmount } = renderHook(() => useComponentState(false));
      
      unmount();
      
      expect(tabSessionStorage.clearEntityConfigTab).toHaveBeenCalled();
    });
  });

  describe('Location-aware behavior', () => {
    it('should respond to location pathname changes', () => {
      mockLocation.pathname = '/entity-configuration';
      const { result, rerender } = renderHook(() => useComponentState(false));
      
      expect(result.current.tabValue).toBe(0);
      
      // Simulate navigation away
      mockLocation.pathname = '/other-page';
      (tabSessionStorage.isEntityConfigurationPage as jest.Mock).mockReturnValue(false);
      
      rerender();
      
      expect(tabSessionStorage.clearEntityConfigTab).toHaveBeenCalled();
    });

    it('should handle view mode initialization', () => {
      const { result } = renderHook(() => useComponentState(true));
      
      expect(result.current.isEditMode).toBe(false);
    });

    it('should handle edit mode initialization', () => {
      const { result } = renderHook(() => useComponentState(false));
      
      expect(result.current.isEditMode).toBe(true);
    });
  });

  describe('Additional state properties', () => {
    it('should provide all expected state properties', () => {
      const { result } = renderHook(() => useComponentState(false));
      
      // Check for additional properties not covered in basic tests
      expect(result.current.isEditMode).toBeDefined();
      expect(result.current.setIsEditMode).toBeDefined();
      expect(result.current.progress).toBeDefined();
      expect(result.current.setProgress).toBeDefined();
      expect(result.current.originalPeriodSetupSaveStatus).toBeDefined();
      expect(result.current.setOriginalPeriodSetupSaveStatus).toBeDefined();
    });

    it('should update isEditMode correctly', () => {
      const { result } = renderHook(() => useComponentState(false));
      
      expect(result.current.isEditMode).toBe(true);
      
      act(() => {
        result.current.setIsEditMode(false);
      });
      
      expect(result.current.isEditMode).toBe(false);
    });

    it('should update progress correctly', () => {
      const { result } = renderHook(() => useComponentState(false));
      
      expect(result.current.progress).toBe(0);
      
      act(() => {
        result.current.setProgress(50);
      });
      
      expect(result.current.progress).toBe(50);
    });

    it('should update originalPeriodSetupSaveStatus correctly', () => {
      const { result } = renderHook(() => useComponentState(false));
      
      expect(result.current.originalPeriodSetupSaveStatus).toBeNull();
      
      act(() => {
        result.current.setOriginalPeriodSetupSaveStatus(true);
      });
      
      expect(result.current.originalPeriodSetupSaveStatus).toBe(true);
    });
  });

  describe('Complex scenarios', () => {
    it('should handle sessionStorage restoration with window location double-check', () => {
      (tabSessionStorage.getEntityConfigTab as jest.Mock).mockReturnValue({ tabValue: 5, entityId: 'test' });
      (tabSessionStorage.shouldRestoreTabForEntity as jest.Mock).mockReturnValue(true);
      (tabSessionStorage.isEntityConfigurationPage as jest.Mock).mockReturnValue(true);
      
      Object.defineProperty(window, 'location', {
        value: { pathname: '/entity-configuration' },
        writable: true
      });
      
      const { result } = renderHook(() => useComponentState(false, 'test'));
      
      expect(result.current.tabValue).toBe(5);
    });

    it('should clear sessionStorage if window location check fails during restoration', () => {
      (tabSessionStorage.getEntityConfigTab as jest.Mock).mockReturnValue({ tabValue: 5, entityId: 'test' });
      (tabSessionStorage.shouldRestoreTabForEntity as jest.Mock).mockReturnValue(true);
      (tabSessionStorage.isEntityConfigurationPage as jest.Mock).mockReturnValueOnce(true).mockReturnValueOnce(false);
      
      Object.defineProperty(window, 'location', {
        value: { pathname: '/other-page' },
        writable: true
      });
      
      const { result } = renderHook(() => useComponentState(false, 'test'));
      
      expect(result.current.tabValue).toBe(0);
      expect(tabSessionStorage.clearEntityConfigTab).toHaveBeenCalled();
    });
  });
});
