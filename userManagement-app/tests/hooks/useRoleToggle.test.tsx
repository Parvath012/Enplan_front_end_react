import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useRoleToggle } from '../../src/hooks/useRoleToggle';
import { toggleRoleStatus, fetchRoles } from '../../src/store/Reducers/roleSlice';

// Mock dependencies
jest.mock('../../src/store/Reducers/roleSlice', () => ({
  toggleRoleStatus: jest.fn(() => ({ type: 'roles/toggleRoleStatus' })),
  fetchRoles: jest.fn(() => ({ type: 'roles/fetchRoles' })),
}));

// Mock AgGridReact
const mockGridRef = {
  current: {
    api: {
      refreshCells: jest.fn(),
    },
  },
} as any;

const createMockStore = () => {
  return configureStore({
    reducer: {
      roles: (state = { roles: [] }) => state,
    },
  });
};

describe('useRoleToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(window, 'alert').mockImplementation();
    jest.useFakeTimers();
    
    // Create a mock that returns a promise with unwrap method
    const mockUnwrap = jest.fn().mockResolvedValue({ id: 1, isEnabled: false });
    (toggleRoleStatus as unknown as jest.Mock).mockReturnValue({
      type: 'roles/toggleRoleStatus',
      unwrap: mockUnwrap,
    });
    (fetchRoles as unknown as jest.Mock).mockImplementation(() => {
      return Promise.resolve({
        type: 'roles/fetchRoles/fulfilled',
      });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('Initial State', () => {
    it('should initialize with empty togglingRoles set', () => {
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useRoleToggle(mockGridRef), { wrapper });
      
      expect(result.current.togglingRoles.size).toBe(0);
    });
  });

  describe('handleToggleStatus', () => {
    it('should toggle role status successfully', async () => {
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useRoleToggle(mockGridRef), { wrapper });
      
      await waitFor(() => {
        expect(result.current).not.toBeNull();
        expect(result.current.handleToggleStatus).toBeDefined();
      });
      
      await act(async () => {
        await result.current.handleToggleStatus(1, true);
      });
      
      expect(toggleRoleStatus).toHaveBeenCalledWith({
        id: 1,
        isEnabled: false,
      });
    });

    it('should prevent multiple rapid clicks', async () => {
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useRoleToggle(mockGridRef), { wrapper });
      
      await waitFor(() => {
        expect(result.current).not.toBeNull();
        expect(result.current.handleToggleStatus).toBeDefined();
      });
      
      // Start first toggle (don't await it yet)
      const firstTogglePromise = result.current.handleToggleStatus(1, true);
      
      // Immediately try second toggle - should be prevented
      await act(async () => {
        await result.current.handleToggleStatus(1, true);
      });
      
      // Verify console.log was called with the exact message
      expect(console.log).toHaveBeenCalledWith('Toggle already in progress for role:', 1);
      
      // Wait for first toggle to complete
      await act(async () => {
        await firstTogglePromise;
      });
    });

    it('should call refreshGrid when gridRef.current exists', async () => {
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useRoleToggle(mockGridRef), { wrapper });
      
      await waitFor(() => {
        expect(result.current).not.toBeNull();
        expect(result.current.handleToggleStatus).toBeDefined();
      });
      
      await act(async () => {
        await result.current.handleToggleStatus(1, true);
      });
      
      // Advance timers to trigger refreshGrid
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      await waitFor(() => {
        expect(mockGridRef.current.api.refreshCells).toHaveBeenCalled();
      });
    });

    it('should refresh grid after successful toggle', async () => {
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useRoleToggle(mockGridRef), { wrapper });
      
      await waitFor(() => {
        expect(result.current).not.toBeNull();
        expect(result.current.handleToggleStatus).toBeDefined();
      });
      
      await act(async () => {
        await result.current.handleToggleStatus(1, true);
      });
      
      expect(fetchRoles).toHaveBeenCalled();
      
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      await waitFor(() => {
        expect(mockGridRef.current.api.refreshCells).toHaveBeenCalled();
      });
    });

    it('should handle toggle error', async () => {
      const mockUnwrap = jest.fn().mockRejectedValue(new Error('Toggle failed'));
      (toggleRoleStatus as unknown as jest.Mock).mockReturnValue({
        type: 'roles/toggleRoleStatus',
        unwrap: mockUnwrap,
      });
      
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useRoleToggle(mockGridRef), { wrapper });
      
      await waitFor(() => {
        expect(result.current).not.toBeNull();
        expect(result.current.handleToggleStatus).toBeDefined();
      });
      
      await act(async () => {
        await result.current.handleToggleStatus(1, true);
      });
      
      expect(console.error).toHaveBeenCalledWith('❌ Error toggling role status:', expect.any(Error));
      expect(window.alert).toHaveBeenCalledWith('An error occurred while updating role status. Please try again.');
    });

    it('should handle numeric role ID conversion', async () => {
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useRoleToggle(mockGridRef), { wrapper });
      
      await waitFor(() => {
        expect(result.current).not.toBeNull();
        expect(result.current.handleToggleStatus).toBeDefined();
      });
      
      await act(async () => {
        await result.current.handleToggleStatus('1' as any, true);
      });
      
      expect(toggleRoleStatus).toHaveBeenCalledWith({
        id: 1,
        isEnabled: false,
      });
    });

    it('should remove role from toggling set after completion', async () => {
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useRoleToggle(mockGridRef), { wrapper });
      
      await waitFor(() => {
        expect(result.current).not.toBeNull();
        expect(result.current.handleToggleStatus).toBeDefined();
      });
      
      await act(async () => {
        await result.current.handleToggleStatus(1, true);
      });
      
      expect(result.current.togglingRoles.size).toBe(0);
    });

    it('should remove role from toggling set even on error', async () => {
      const mockUnwrap = jest.fn().mockRejectedValue(new Error('Toggle failed'));
      (toggleRoleStatus as unknown as jest.Mock).mockReturnValue({
        type: 'roles/toggleRoleStatus',
        unwrap: mockUnwrap,
      });
      
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useRoleToggle(mockGridRef), { wrapper });
      
      await waitFor(() => {
        expect(result.current).not.toBeNull();
        expect(result.current.handleToggleStatus).toBeDefined();
      });
      
      await act(async () => {
        await result.current.handleToggleStatus(1, true);
      });
      
      expect(result.current.togglingRoles.size).toBe(0);
    });

    it('should handle gridRef.current being null', async () => {
      const nullGridRef = { current: null } as any;
      
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useRoleToggle(nullGridRef), { wrapper });
      
      await waitFor(() => {
        expect(result.current).not.toBeNull();
        expect(result.current.handleToggleStatus).toBeDefined();
      });
      
      await act(async () => {
        await result.current.handleToggleStatus(1, true);
      });
      
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      // Should not crash
      expect(result.current.togglingRoles.size).toBe(0);
    });

    it('should handle gridRef.current.api being null', async () => {
      const nullApiGridRef = { current: { api: null } } as any;
      
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useRoleToggle(nullApiGridRef), { wrapper });
      
      await waitFor(() => {
        expect(result.current).not.toBeNull();
        expect(result.current.handleToggleStatus).toBeDefined();
      });
      
      await act(async () => {
        await result.current.handleToggleStatus(1, true);
      });
      
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      // Should not crash
      expect(result.current.togglingRoles.size).toBe(0);
    });

    it('should handle fetchRoles promise rejection', async () => {
      // Mock fetchRoles to return a promise that rejects
      (fetchRoles as unknown as jest.Mock).mockImplementation(() => {
        return Promise.reject(new Error('Fetch failed'));
      });
      
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useRoleToggle(mockGridRef), { wrapper });
      
      await waitFor(() => {
        expect(result.current).not.toBeNull();
        expect(result.current.handleToggleStatus).toBeDefined();
      });
      
      await act(async () => {
        await result.current.handleToggleStatus(1, true);
      });
      
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      // Should not crash even if fetchRoles fails
      expect(result.current.togglingRoles.size).toBe(0);
    });

    it('should handle refreshCells error gracefully', async () => {
      const errorGridRef = {
        current: {
          api: {
            refreshCells: jest.fn(() => {
              throw new Error('Refresh failed');
            }),
          },
        },
      } as any;
      
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useRoleToggle(errorGridRef), { wrapper });
      
      await waitFor(() => {
        expect(result.current).not.toBeNull();
        expect(result.current.handleToggleStatus).toBeDefined();
      });
      
      await act(async () => {
        await result.current.handleToggleStatus(1, true);
      });
      
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      // Should not crash
      expect(result.current.togglingRoles.size).toBe(0);
    });

    it('should log toggle information', async () => {
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useRoleToggle(mockGridRef), { wrapper });
      const consoleLogSpy = jest.spyOn(console, 'log');
      
      await waitFor(() => {
        expect(result.current).not.toBeNull();
        expect(result.current.handleToggleStatus).toBeDefined();
      });
      
      await act(async () => {
        await result.current.handleToggleStatus(1, true);
      });
      
      expect(consoleLogSpy).toHaveBeenCalledWith('=== TOGGLE ROLE STATUS ===');
      expect(consoleLogSpy).toHaveBeenCalledWith('Role ID:', 1);
      expect(consoleLogSpy).toHaveBeenCalledWith('Current isenabled:', true);
      expect(consoleLogSpy).toHaveBeenCalledWith('New isenabled:', false);
    });

    it('should handle refreshGrid when gridRef.current is null', async () => {
      const nullGridRef = { current: null } as any;
      
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useRoleToggle(nullGridRef), { wrapper });
      
      await waitFor(() => {
        expect(result.current).not.toBeNull();
        expect(result.current.handleToggleStatus).toBeDefined();
      });
      
      await act(async () => {
        await result.current.handleToggleStatus(1, true);
      });
      
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      // Should not crash when gridRef.current is null
      expect(result.current.togglingRoles.size).toBe(0);
    });

    it('should handle refreshGrid when gridRef.current.api is null', async () => {
      const nullApiGridRef = { current: { api: null } } as any;
      
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useRoleToggle(nullApiGridRef), { wrapper });
      
      await waitFor(() => {
        expect(result.current).not.toBeNull();
        expect(result.current.handleToggleStatus).toBeDefined();
      });
      
      await act(async () => {
        await result.current.handleToggleStatus(1, true);
      });
      
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      // Should not crash when gridRef.current.api is null
      expect(result.current.togglingRoles.size).toBe(0);
    });

    it('should call refreshGrid after fetchRoles completes', async () => {
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useRoleToggle(mockGridRef), { wrapper });
      
      await waitFor(() => {
        expect(result.current).not.toBeNull();
        expect(result.current.handleToggleStatus).toBeDefined();
      });
      
      await act(async () => {
        await result.current.handleToggleStatus(1, true);
      });
      
      // Wait for fetchRoles to complete and then refreshGrid
      await act(async () => {
        jest.advanceTimersByTime(200);
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(fetchRoles).toHaveBeenCalled();
      expect(mockGridRef.current.api.refreshCells).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero role ID', async () => {
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useRoleToggle(mockGridRef), { wrapper });
      
      await waitFor(() => {
        expect(result.current).not.toBeNull();
        expect(result.current.handleToggleStatus).toBeDefined();
      });
      
      await act(async () => {
        await result.current.handleToggleStatus(0, true);
      });
      
      expect(toggleRoleStatus).toHaveBeenCalledWith({
        id: 0,
        isEnabled: false,
      });
    });

    it('should handle negative role ID', async () => {
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useRoleToggle(mockGridRef), { wrapper });
      
      await waitFor(() => {
        expect(result.current).not.toBeNull();
        expect(result.current.handleToggleStatus).toBeDefined();
      });
      
      await act(async () => {
        await result.current.handleToggleStatus(-1, true);
      });
      
      expect(toggleRoleStatus).toHaveBeenCalledWith({
        id: -1,
        isEnabled: false,
      });
    });

    it('should handle very large role ID', async () => {
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useRoleToggle(mockGridRef), { wrapper });
      
      await waitFor(() => {
        expect(result.current).not.toBeNull();
        expect(result.current.handleToggleStatus).toBeDefined();
      });
      
      await act(async () => {
        await result.current.handleToggleStatus(999999, true);
      });
      
      expect(toggleRoleStatus).toHaveBeenCalledWith({
        id: 999999,
        isEnabled: false,
      });
    });
  });
});


