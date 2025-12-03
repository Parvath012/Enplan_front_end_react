import * as React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useEditModeLogic } from '../../../../src/components/entityConfiguration/hooks/useEditModeLogic';

// Mock dependencies
jest.mock('../../../../src/store/Actions/entityConfigurationActions', () => ({
  determineEditMode: jest.fn(),
  isNewlyCreatedEntity: jest.fn()
}));

describe('useEditModeLogic', () => {
  const mockSetIsEditMode = jest.fn();
  const mockSetUserClickedEdit = jest.fn();
  const mockDetermineEditMode = jest.fn();
  const mockIsNewlyCreatedEntity = jest.fn();

  const defaultParams = {
    isViewMode: false,
    tabValue: 0,
    isDataSaved: false,
    entityId: 'entity-123',
    periodSetup: { 'entity-123': { isDataSaved: false } },
    userClickedEdit: false,
    modulesState: { isDataSaved: false },
    entity: { id: 'entity-123', displayName: 'Test Entity' },
    entityConfiguration: { isDataSaved: false },
    setIsEditMode: mockSetIsEditMode,
    setUserClickedEdit: mockSetUserClickedEdit
  };

  beforeEach(() => {
    jest.clearAllMocks();
    require('../../../../src/store/Actions/entityConfigurationActions').determineEditMode.mockImplementation(mockDetermineEditMode);
    require('../../../../src/store/Actions/entityConfigurationActions').isNewlyCreatedEntity.mockImplementation(mockIsNewlyCreatedEntity);
    
    mockDetermineEditMode.mockReturnValue(true);
    mockIsNewlyCreatedEntity.mockReturnValue(false);
  });

  describe('Basic functionality', () => {
    it('should render without crashing', () => {
      const { result } = renderHook(() => useEditModeLogic(defaultParams));
      
      expect(result.current).toBeDefined();
      expect(result.current.determineEditMode).toBeDefined();
    });

    it('should return determineEditMode function', () => {
      const { result } = renderHook(() => useEditModeLogic(defaultParams));
      
      expect(typeof result.current.determineEditMode).toBe('function');
    });
  });

  describe('determineEditMode callback', () => {
    it('should call isNewlyCreatedEntity with correct parameters', () => {
      const { result } = renderHook(() => useEditModeLogic(defaultParams));
      
      act(() => {
        result.current.determineEditMode();
      });
      
      expect(mockIsNewlyCreatedEntity).toHaveBeenCalledWith(
        defaultParams.entity,
        defaultParams.entityConfiguration
      );
    });

    it('should call determineEditMode with correct parameters', () => {
      mockIsNewlyCreatedEntity.mockReturnValue(true);
      
      const { result } = renderHook(() => useEditModeLogic(defaultParams));
      
      act(() => {
        result.current.determineEditMode();
      });
      
      expect(mockDetermineEditMode).toHaveBeenCalledWith({
        isViewMode: defaultParams.isViewMode,
        tabValue: defaultParams.tabValue,
        isDataSaved: defaultParams.isDataSaved,
        entityId: defaultParams.entityId,
        periodSetup: defaultParams.periodSetup,
        userClickedEdit: defaultParams.userClickedEdit,
        modulesState: defaultParams.modulesState,
        isNewlyCreatedEntity: true
      });
    });

    it('should return result from determineEditMode', () => {
      mockDetermineEditMode.mockReturnValue(false);
      
      const { result } = renderHook(() => useEditModeLogic(defaultParams));
      
      let editModeResult;
      act(() => {
        editModeResult = result.current.determineEditMode();
      });
      
      expect(editModeResult).toBe(false);
    });
  });

  describe('useEffect behavior', () => {
    it('should not set edit mode when userClickedEdit is true', () => {
      const paramsWithUserClickedEdit = {
        ...defaultParams,
        userClickedEdit: true
      };
      
      renderHook(() => useEditModeLogic(paramsWithUserClickedEdit));
      
      expect(mockSetIsEditMode).not.toHaveBeenCalled();
    });

    it('should set edit mode when userClickedEdit is false', () => {
      mockDetermineEditMode.mockReturnValue(true);
      
      renderHook(() => useEditModeLogic(defaultParams));
      
      expect(mockSetIsEditMode).toHaveBeenCalledWith(true);
    });

    it('should set edit mode to false when determineEditMode returns false', () => {
      mockDetermineEditMode.mockReturnValue(false);
      
      renderHook(() => useEditModeLogic(defaultParams));
      
      expect(mockSetIsEditMode).toHaveBeenCalledWith(false);
    });
  });

  describe('Dependency changes', () => {
    it('should re-run effect when dependencies change', () => {
      const { rerender } = renderHook(
        ({ params }) => useEditModeLogic(params),
        { initialProps: { params: defaultParams } }
      );
      
      expect(mockSetIsEditMode).toHaveBeenCalledWith(true);
      
      // Clear previous calls
      mockSetIsEditMode.mockClear();
      
      // Rerender with different tabValue
      const newParams = {
        ...defaultParams,
        tabValue: 1
      };
      
      rerender({ params: newParams });
      
      expect(mockSetIsEditMode).toHaveBeenCalledWith(true);
    });

    it('should not re-run effect when userClickedEdit changes to true', () => {
      const { rerender } = renderHook(
        ({ params }) => useEditModeLogic(params),
        { initialProps: { params: defaultParams } }
      );
      
      expect(mockSetIsEditMode).toHaveBeenCalledWith(true);
      
      // Clear previous calls
      mockSetIsEditMode.mockClear();
      
      // Rerender with userClickedEdit: true
      const newParams = {
        ...defaultParams,
        userClickedEdit: true
      };
      
      rerender({ params: newParams });
      
      expect(mockSetIsEditMode).not.toHaveBeenCalled();
    });
  });

  describe('Callback memoization', () => {
    it('should memoize determineEditMode callback', () => {
      const { result, rerender } = renderHook(
        ({ params }) => useEditModeLogic(params),
        { initialProps: { params: defaultParams } }
      );
      
      const firstCallback = result.current.determineEditMode;
      
      rerender({ params: defaultParams });
      
      const secondCallback = result.current.determineEditMode;
      
      expect(firstCallback).toBe(secondCallback);
    });

    it('should create new callback when dependencies change', () => {
      const { result, rerender } = renderHook(
        ({ params }) => useEditModeLogic(params),
        { initialProps: { params: defaultParams } }
      );
      
      const firstCallback = result.current.determineEditMode;
      
      const newParams = {
        ...defaultParams,
        tabValue: 1
      };
      
      rerender({ params: newParams });
      
      const secondCallback = result.current.determineEditMode;
      
      expect(firstCallback).not.toBe(secondCallback);
    });
  });

  describe('Edge cases', () => {
    it('should handle null entity', () => {
      const paramsWithNullEntity = {
        ...defaultParams,
        entity: null
      };
      
      const { result } = renderHook(() => useEditModeLogic(paramsWithNullEntity));
      
      act(() => {
        result.current.determineEditMode();
      });
      
      expect(mockIsNewlyCreatedEntity).toHaveBeenCalledWith(null, defaultParams.entityConfiguration);
    });

    it('should handle null entityConfiguration', () => {
      const paramsWithNullConfig = {
        ...defaultParams,
        entityConfiguration: null
      };
      
      const { result } = renderHook(() => useEditModeLogic(paramsWithNullConfig));
      
      act(() => {
        result.current.determineEditMode();
      });
      
      expect(mockIsNewlyCreatedEntity).toHaveBeenCalledWith(defaultParams.entity, null);
    });

    it('should handle undefined entityId', () => {
      const paramsWithUndefinedEntityId = {
        ...defaultParams,
        entityId: undefined
      };
      
      const { result } = renderHook(() => useEditModeLogic(paramsWithUndefinedEntityId));
      
      act(() => {
        result.current.determineEditMode();
      });
      
      expect(mockDetermineEditMode).toHaveBeenCalledWith({
        isViewMode: defaultParams.isViewMode,
        tabValue: defaultParams.tabValue,
        isDataSaved: defaultParams.isDataSaved,
        entityId: undefined,
        periodSetup: defaultParams.periodSetup,
        userClickedEdit: defaultParams.userClickedEdit,
        modulesState: defaultParams.modulesState,
        isNewlyCreatedEntity: false
      });
    });

    it('should handle different tab values', () => {
      const testCases = [
        { tabValue: 0, expectedTab: 0 },
        { tabValue: 1, expectedTab: 1 },
        { tabValue: 2, expectedTab: 2 }
      ];

      testCases.forEach(({ tabValue, expectedTab }) => {
        const params = {
          ...defaultParams,
          tabValue
        };
        
        const { result } = renderHook(() => useEditModeLogic(params));
        
        act(() => {
          result.current.determineEditMode();
        });
        
        expect(mockDetermineEditMode).toHaveBeenCalledWith(
          expect.objectContaining({
            tabValue: expectedTab
          })
        );
      });
    });

    it('should handle different isDataSaved values', () => {
      const testCases = [
        { isDataSaved: true, expectedSaved: true },
        { isDataSaved: false, expectedSaved: false }
      ];

      testCases.forEach(({ isDataSaved, expectedSaved }) => {
        const params = {
          ...defaultParams,
          isDataSaved
        };
        
        const { result } = renderHook(() => useEditModeLogic(params));
        
        act(() => {
          result.current.determineEditMode();
        });
        
        expect(mockDetermineEditMode).toHaveBeenCalledWith(
          expect.objectContaining({
            isDataSaved: expectedSaved
          })
        );
      });
    });

    it('should handle different userClickedEdit values', () => {
      const testCases = [
        { userClickedEdit: true, expectedClicked: true },
        { userClickedEdit: false, expectedClicked: false }
      ];

      testCases.forEach(({ userClickedEdit, expectedClicked }) => {
        const params = {
          ...defaultParams,
          userClickedEdit
        };
        
        const { result } = renderHook(() => useEditModeLogic(params));
        
        act(() => {
          result.current.determineEditMode();
        });
        
        expect(mockDetermineEditMode).toHaveBeenCalledWith(
          expect.objectContaining({
            userClickedEdit: expectedClicked
          })
        );
      });
    });
  });

  describe('Integration with determineEditMode', () => {
    it('should pass all required parameters to determineEditMode', () => {
      const { result } = renderHook(() => useEditModeLogic(defaultParams));
      
      act(() => {
        result.current.determineEditMode();
      });
      
      expect(mockDetermineEditMode).toHaveBeenCalledWith({
        isViewMode: false,
        tabValue: 0,
        isDataSaved: false,
        entityId: 'entity-123',
        periodSetup: { 'entity-123': { isDataSaved: false } },
        userClickedEdit: false,
        modulesState: { isDataSaved: false },
        isNewlyCreatedEntity: false
      });
    });
  });

  describe('State updates', () => {
    it('should call setIsEditMode with correct value', () => {
      mockDetermineEditMode.mockReturnValue(true);
      
      renderHook(() => useEditModeLogic(defaultParams));
      
      expect(mockSetIsEditMode).toHaveBeenCalledWith(true);
    });

    it('should not call setIsEditMode when userClickedEdit is true', () => {
      const paramsWithUserClickedEdit = {
        ...defaultParams,
        userClickedEdit: true
      };
      
      renderHook(() => useEditModeLogic(paramsWithUserClickedEdit));
      
      expect(mockSetIsEditMode).not.toHaveBeenCalled();
    });
  });
});
