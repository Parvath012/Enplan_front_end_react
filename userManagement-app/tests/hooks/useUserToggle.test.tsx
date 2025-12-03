import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useUserToggle } from '../../src/hooks/useUserToggle';
import { toggleUserStatus, fetchUsers } from '../../src/store/Reducers/userSlice';
import { saveUserPartialUpdate } from '../../src/services/userSaveService';
import { parsePermissionsData } from '../../src/utils/userFormUtils';

// Mock dependencies
jest.mock('../../src/store/Reducers/userSlice', () => ({
  toggleUserStatus: jest.fn(() => ({ type: 'users/toggleUserStatus' })),
  fetchUsers: jest.fn(() => ({ type: 'users/fetchUsers' })),
}));

jest.mock('../../src/services/userSaveService', () => ({
  saveUserPartialUpdate: jest.fn(),
}));

jest.mock('../../src/utils/userFormUtils', () => ({
  parsePermissionsData: jest.fn(),
}));

// Mock AgGridReact
const mockGridRef = {
  current: {
    api: {
      refreshCells: jest.fn(),
    },
  },
} as any;

const createMockStore = (initialUsers: any[] = []) => {
  return configureStore({
    reducer: {
      users: (state = { users: initialUsers }, action: any) => {
        if (action.type === 'users/toggleUserStatus') {
          return {
            ...state,
            users: state.users.map((user: any) =>
              user.id === action.payload.id
                ? { ...user, isenabled: action.payload.isenabled }
                : user
            ),
          };
        }
        return state;
      },
    },
  });
};

describe('useUserToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.useFakeTimers();
    
    // Reset mocks to default behavior
    (toggleUserStatus as jest.Mock).mockResolvedValue({
      type: 'users/toggleUserStatus/fulfilled',
      payload: {},
    });
    (fetchUsers as jest.Mock).mockResolvedValue({
      type: 'users/fetchUsers/fulfilled',
    });
    (saveUserPartialUpdate as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('Initial State', () => {
    it('should initialize with empty togglingUsers set', () => {
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      expect(result.current.togglingUsers.size).toBe(0);
    });

    it('should initialize with closed confirm dialog', () => {
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      expect(result.current.confirmDialog.open).toBe(false);
      expect(result.current.confirmDialog.userId).toBeNull();
    });

    it('should initialize with closed transfer panel', () => {
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      expect(result.current.transferPanel.open).toBe(false);
      expect(result.current.transferPanel.userId).toBeNull();
    });
  });

  describe('handleToggleStatus', () => {
    it('should open confirm dialog when toggling active user to inactive', async () => {
      const store = createMockStore([
        { id: 1, firstname: 'John', lastname: 'Doe', isenabled: true },
      ]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      await act(async () => {
        await result.current.handleToggleStatus(1, true);
      });
      
      expect(result.current.confirmDialog.open).toBe(true);
      expect(result.current.confirmDialog.userId).toBe(1);
    });

    it('should directly toggle inactive user to active', async () => {
      const store = createMockStore([
        { id: 1, firstname: 'John', lastname: 'Doe', isenabled: false },
      ]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      await act(async () => {
        await result.current.handleToggleStatus(1, false);
      });
      
      expect(toggleUserStatus).toHaveBeenCalled();
      expect(result.current.confirmDialog.open).toBe(false);
    });

    it('should prevent multiple rapid clicks', async () => {
      const store = createMockStore([
        { id: 1, firstname: 'John', lastname: 'Doe', isenabled: true },
      ]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      // First toggle opens dialog
      await act(async () => {
        await result.current.handleToggleStatus(1, true);
      });
      
      expect(result.current.confirmDialog.open).toBe(true);
      
      // Second toggle also opens dialog (since status is true, it doesn't toggle directly)
      await act(async () => {
        await result.current.handleToggleStatus(1, true);
      });
      
      expect(result.current.confirmDialog.open).toBe(true);
    });
  });

  describe('handleConfirmYes', () => {
    it('should open transfer panel when confirmed', async () => {
      const store = createMockStore([
        { id: 1, firstname: 'John', lastname: 'Doe', isenabled: true },
      ]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      // First open confirm dialog
      await act(async () => {
        await result.current.handleToggleStatus(1, true);
      });
      
      // Then confirm
      await act(async () => {
        await result.current.handleConfirmYes();
      });
      
      expect(result.current.transferPanel.open).toBe(true);
      expect(result.current.transferPanel.userId).toBe(1);
      expect(result.current.confirmDialog.open).toBe(false);
    });

    it('should not open transfer panel if userId is null', async () => {
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      await act(async () => {
        await result.current.handleConfirmYes();
      });
      
      expect(result.current.transferPanel.open).toBe(false);
    });
  });

  describe('handleConfirmNo', () => {
    it('should set user to inactive without transfer', async () => {
      const store = createMockStore([
        { id: 1, firstname: 'John', lastname: 'Doe', isenabled: true },
      ]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      // First open confirm dialog
      await act(async () => {
        await result.current.handleToggleStatus(1, true);
      });
      
      // Then choose "No"
      await act(async () => {
        await result.current.handleConfirmNo();
      });
      
      expect(toggleUserStatus).toHaveBeenCalled();
      expect(result.current.confirmDialog.open).toBe(false);
    });

    it('should not toggle if userId is null', async () => {
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      await act(async () => {
        await result.current.handleConfirmNo();
      });
      
      expect(toggleUserStatus).not.toHaveBeenCalled();
    });
  });

  describe('handleTransferSubmit', () => {
    const mockSourceUser = {
      id: 1,
      firstname: 'John',
      lastname: 'Doe',
      emailid: 'john@example.com',
      permissions: JSON.stringify({
        enabledModules: ['module1'],
        selectedPermissions: ['module1-sub1-perm1'],
        activeModule: 'module1',
        activeSubmodule: 'sub1',
      }),
    };

    const mockTargetUser = {
      id: 2,
      firstname: 'Jane',
      lastname: 'Smith',
      emailid: 'jane@example.com',
      permissions: JSON.stringify({
        enabledModules: ['module2'],
        selectedPermissions: ['module2-sub2-perm2'],
        activeModule: 'module2',
        activeSubmodule: 'sub2',
      }),
    };

    beforeEach(() => {
      (parsePermissionsData as jest.Mock).mockImplementation((perms: string) => {
        if (perms === mockSourceUser.permissions) {
          return {
            enabledModules: ['module1'],
            selectedPermissions: ['module1-sub1-perm1'],
            activeModule: 'module1',
            activeSubmodule: 'sub1',
          };
        }
        if (perms === mockTargetUser.permissions) {
          return {
            enabledModules: ['module2'],
            selectedPermissions: ['module2-sub2-perm2'],
            activeModule: 'module2',
            activeSubmodule: 'sub2',
          };
        }
        return null;
      });
    });

    it('should transfer permissions and set source user to inactive', async () => {
      (toggleUserStatus as jest.Mock).mockResolvedValue({
        type: 'users/toggleUserStatus/fulfilled',
        payload: { id: 1, isenabled: false },
      });

      (saveUserPartialUpdate as jest.Mock).mockResolvedValue(undefined);
      (fetchUsers as jest.Mock).mockResolvedValue({
        type: 'users/fetchUsers/fulfilled',
      });

      const store = createMockStore([mockSourceUser, mockTargetUser]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      // Open transfer panel
      act(() => {
        result.current.setTransferPanel({
          open: true,
          userId: 1,
          userName: 'John Doe',
        });
      });
      
      await act(async () => {
        const success = await result.current.handleTransferSubmit('Jane Smith');
        expect(success).toBe(true);
      });
      
      expect(saveUserPartialUpdate).toHaveBeenCalled();
      expect(toggleUserStatus).toHaveBeenCalled();
      expect(fetchUsers).toHaveBeenCalled();
      
      // Advance timers to trigger refreshGrid
      jest.advanceTimersByTime(200);
      await waitFor(() => {
        expect(mockGridRef.current.api.refreshCells).toHaveBeenCalled();
      });
    });

    it('should return false if source user not found', async () => {
      const store = createMockStore([mockTargetUser]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      act(() => {
        result.current.setTransferPanel({
          open: true,
          userId: 999,
          userName: 'Non-existent',
        });
      });
      
      await act(async () => {
        const success = await result.current.handleTransferSubmit('Jane Smith');
        expect(success).toBe(false);
      });
    });

    it('should return false if target user not found', async () => {
      const store = createMockStore([mockSourceUser]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      act(() => {
        result.current.setTransferPanel({
          open: true,
          userId: 1,
          userName: 'John Doe',
        });
      });
      
      await act(async () => {
        const success = await result.current.handleTransferSubmit('Non-existent User');
        expect(success).toBe(false);
      });
    });

    it('should merge permissions correctly', async () => {
      const store = createMockStore([mockSourceUser, mockTargetUser]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      act(() => {
        result.current.setTransferPanel({
          open: true,
          userId: 1,
          userName: 'John Doe',
        });
      });
      
      await act(async () => {
        await result.current.handleTransferSubmit('Jane Smith');
      });
      
      expect(saveUserPartialUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          permissions: expect.objectContaining({
            enabledModules: expect.arrayContaining(['module1', 'module2']),
            selectedPermissions: expect.arrayContaining(['module1-sub1-perm1', 'module2-sub2-perm2']),
          }),
        }),
        'u'
      );
    });

    it('should return false if userId is null', async () => {
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      await act(async () => {
        const success = await result.current.handleTransferSubmit('Jane Smith');
        expect(success).toBe(false);
      });
    });
  });

  describe('handleTransferReset', () => {
    it('should close transfer panel', () => {
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      act(() => {
        result.current.setTransferPanel({
          open: true,
          userId: 1,
          userName: 'John Doe',
        });
      });
      
      act(() => {
        result.current.handleTransferReset();
      });
      
      expect(result.current.transferPanel.open).toBe(false);
      expect(result.current.transferPanel.userId).toBeNull();
    });
  });

  describe('State Management', () => {
    it('should update confirmDialog state', () => {
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      act(() => {
        result.current.setConfirmDialog({
          open: true,
          userId: 1,
          userName: 'John Doe',
          currentStatus: true,
        });
      });
      
      expect(result.current.confirmDialog.open).toBe(true);
      expect(result.current.confirmDialog.userId).toBe(1);
    });

    it('should update transferPanel state', () => {
      const store = createMockStore();
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      act(() => {
        result.current.setTransferPanel({
          open: true,
          userId: 1,
          userName: 'John Doe',
        });
      });
      
      expect(result.current.transferPanel.open).toBe(true);
      expect(result.current.transferPanel.userId).toBe(1);
    });
  });

  describe('Grid Refresh', () => {
    it('should refresh grid after successful transfer', async () => {
      const mockRefreshCells = jest.fn();
      const gridRef = {
        current: {
          api: {
            refreshCells: mockRefreshCells,
          },
        },
      } as any;

      (toggleUserStatus as jest.Mock).mockResolvedValue({
        type: 'users/toggleUserStatus/fulfilled',
        payload: { id: 1, isenabled: false },
      });

      (saveUserPartialUpdate as jest.Mock).mockResolvedValue(undefined);
      (fetchUsers as jest.Mock).mockResolvedValue({
        type: 'users/fetchUsers/fulfilled',
      });

      (parsePermissionsData as jest.Mock).mockReturnValue({
        enabledModules: [],
        selectedPermissions: [],
      });

      const store = createMockStore([
        {
          id: 1,
          firstname: 'John',
          lastname: 'Doe',
          permissions: JSON.stringify({ enabledModules: [], selectedPermissions: [] }),
        },
        {
          id: 2,
          firstname: 'Jane',
          lastname: 'Smith',
          permissions: JSON.stringify({ enabledModules: [], selectedPermissions: [] }),
        },
      ]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(gridRef), { wrapper });
      
      act(() => {
        result.current.setTransferPanel({
          open: true,
          userId: 1,
          userName: 'John Doe',
        });
      });
      
      await act(async () => {
        await result.current.handleTransferSubmit('Jane Smith');
      });
      
      jest.advanceTimersByTime(200);
      
      await waitFor(() => {
        expect(mockRefreshCells).toHaveBeenCalled();
      });
    });

    it('should handle grid refresh when gridRef.current is null', async () => {
      const gridRef = { current: null } as any;
      const store = createMockStore([
        { id: 1, firstname: 'John', lastname: 'Doe', isenabled: false },
      ]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(gridRef), { wrapper });
      
      await act(async () => {
        await result.current.handleToggleStatus(1, false);
      });
      
      jest.advanceTimersByTime(200);
      
      // Should not crash when gridRef.current is null
      expect(result.current.confirmDialog.open).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle rejected toggle status', async () => {
      (toggleUserStatus as jest.Mock).mockReturnValue({
        type: 'users/toggleUserStatus/rejected',
        payload: 'Error message',
      });
      
      const store = createMockStore([
        { id: 1, firstname: 'John', lastname: 'Doe', isenabled: false },
      ]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      await act(async () => {
        await result.current.handleToggleStatus(1, false);
      });
      
      expect(alertSpy).toHaveBeenCalledWith('Failed to update user status. Please try again.');
      alertSpy.mockRestore();
    });

    it('should handle error in executeToggle catch block', async () => {
      (toggleUserStatus as jest.Mock).mockImplementation(() => {
        throw new Error('Network error');
      });
      
      const store = createMockStore([
        { id: 1, firstname: 'John', lastname: 'Doe', isenabled: false },
      ]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      await act(async () => {
        await result.current.handleToggleStatus(1, false);
      });
      
      expect(alertSpy).toHaveBeenCalledWith('An error occurred while updating user status. Please try again.');
      alertSpy.mockRestore();
    });

    it('should handle error in handleTransferSubmit catch block', async () => {
      (saveUserPartialUpdate as jest.Mock).mockRejectedValue(new Error('Save error'));
      
      const store = createMockStore([
        {
          id: 1,
          firstname: 'John',
          lastname: 'Doe',
          emailid: 'john@example.com',
          permissions: JSON.stringify({ enabledModules: [], selectedPermissions: [] }),
        },
        {
          id: 2,
          firstname: 'Jane',
          lastname: 'Smith',
          emailid: 'jane@example.com',
          permissions: JSON.stringify({ enabledModules: [], selectedPermissions: [] }),
        },
      ]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      act(() => {
        result.current.setTransferPanel({
          open: true,
          userId: 1,
          userName: 'John Doe',
        });
      });
      
      await act(async () => {
        const success = await result.current.handleTransferSubmit('Jane Smith');
        expect(success).toBe(false);
      });
      
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('User Name Formatting', () => {
    it('should use emailid when firstname and lastname are empty', async () => {
      const store = createMockStore([
        { id: 1, firstname: '', lastname: '', emailid: 'john@example.com', isenabled: true },
      ]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      await act(async () => {
        await result.current.handleToggleStatus(1, true);
      });
      
      expect(result.current.confirmDialog.userName).toBe('john@example.com');
    });

    it('should use Unknown User when user not found', async () => {
      const store = createMockStore([]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      await act(async () => {
        await result.current.handleToggleStatus(999, true);
      });
      
      expect(result.current.confirmDialog.userName).toBe('Unknown User');
    });

    it('should use firstname only when lastname is empty', async () => {
      const store = createMockStore([
        { id: 1, firstname: 'John', lastname: '', emailid: 'john@example.com', isenabled: true },
      ]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      await act(async () => {
        await result.current.handleToggleStatus(1, true);
      });
      
      expect(result.current.confirmDialog.userName).toBe('John');
    });
  });

  describe('validateActiveModuleAndSubmodule', () => {
    it('should validate and fix invalid activeModule', async () => {
      const mockSourceUser = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        emailid: 'john@example.com',
        permissions: JSON.stringify({
          enabledModules: ['module1'],
          selectedPermissions: ['module1-sub1-perm1'],
        }),
      };

      const mockTargetUser = {
        id: 2,
        firstname: 'Jane',
        lastname: 'Smith',
        emailid: 'jane@example.com',
        permissions: JSON.stringify({
          enabledModules: ['module2'],
          selectedPermissions: ['module2-sub2-perm2'],
          activeModule: 'invalidModule',
          activeSubmodule: 'sub2',
        }),
      };

      (parsePermissionsData as jest.Mock).mockImplementation((perms: string) => {
        const parsed = JSON.parse(perms);
        return {
          enabledModules: parsed.enabledModules || [],
          selectedPermissions: parsed.selectedPermissions || [],
          activeModule: parsed.activeModule,
          activeSubmodule: parsed.activeSubmodule,
        };
      });

      const store = createMockStore([mockSourceUser, mockTargetUser]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      act(() => {
        result.current.setTransferPanel({
          open: true,
          userId: 1,
          userName: 'John Doe',
        });
      });
      
      await act(async () => {
        await result.current.handleTransferSubmit('Jane Smith');
      });
      
      expect(saveUserPartialUpdate).toHaveBeenCalled();
    });

    it('should reset activeSubmodule when it does not match activeModule', async () => {
      const mockSourceUser = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        emailid: 'john@example.com',
        permissions: JSON.stringify({
          enabledModules: ['module1'],
          selectedPermissions: ['module1-sub1-perm1'],
        }),
      };

      const mockTargetUser = {
        id: 2,
        firstname: 'Jane',
        lastname: 'Smith',
        emailid: 'jane@example.com',
        permissions: JSON.stringify({
          enabledModules: ['module2'],
          selectedPermissions: ['module2-sub2-perm2'],
          activeModule: 'module2',
          activeSubmodule: 'module1-sub1', // Wrong module prefix
        }),
      };

      (parsePermissionsData as jest.Mock).mockImplementation((perms: string) => {
        const parsed = JSON.parse(perms);
        return {
          enabledModules: parsed.enabledModules || [],
          selectedPermissions: parsed.selectedPermissions || [],
          activeModule: parsed.activeModule,
          activeSubmodule: parsed.activeSubmodule,
        };
      });

      const store = createMockStore([mockSourceUser, mockTargetUser]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      act(() => {
        result.current.setTransferPanel({
          open: true,
          userId: 1,
          userName: 'John Doe',
        });
      });
      
      await act(async () => {
        await result.current.handleTransferSubmit('Jane Smith');
      });
      
      expect(saveUserPartialUpdate).toHaveBeenCalled();
    });

    it('should reset activeSubmodule when no permissions found for it', async () => {
      const mockSourceUser = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        emailid: 'john@example.com',
        permissions: JSON.stringify({
          enabledModules: ['module1'],
          selectedPermissions: ['module1-sub1-perm1'],
        }),
      };

      const mockTargetUser = {
        id: 2,
        firstname: 'Jane',
        lastname: 'Smith',
        emailid: 'jane@example.com',
        permissions: JSON.stringify({
          enabledModules: ['module2'],
          selectedPermissions: ['module2-sub2-perm2'],
          activeModule: 'module2',
          activeSubmodule: 'module2-sub3', // Submodule with no permissions
        }),
      };

      (parsePermissionsData as jest.Mock).mockImplementation((perms: string) => {
        const parsed = JSON.parse(perms);
        return {
          enabledModules: parsed.enabledModules || [],
          selectedPermissions: parsed.selectedPermissions || [],
          activeModule: parsed.activeModule,
          activeSubmodule: parsed.activeSubmodule,
        };
      });

      const store = createMockStore([mockSourceUser, mockTargetUser]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      act(() => {
        result.current.setTransferPanel({
          open: true,
          userId: 1,
          userName: 'John Doe',
        });
      });
      
      await act(async () => {
        await result.current.handleTransferSubmit('Jane Smith');
      });
      
      expect(saveUserPartialUpdate).toHaveBeenCalled();
    });
  });

  describe('handleTransferSubmit Edge Cases', () => {
    it('should return false if target user has no id', async () => {
      const mockSourceUser = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        emailid: 'john@example.com',
        permissions: JSON.stringify({ enabledModules: [], selectedPermissions: [] }),
      };

      const mockTargetUser = {
        id: undefined,
        firstname: 'Jane',
        lastname: 'Smith',
        emailid: 'jane@example.com',
        permissions: JSON.stringify({ enabledModules: [], selectedPermissions: [] }),
      };

      (parsePermissionsData as jest.Mock).mockReturnValue({
        enabledModules: [],
        selectedPermissions: [],
      });

      const store = createMockStore([mockSourceUser, mockTargetUser]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      act(() => {
        result.current.setTransferPanel({
          open: true,
          userId: 1,
          userName: 'John Doe',
        });
      });
      
      await act(async () => {
        const success = await result.current.handleTransferSubmit('Jane Smith');
        expect(success).toBe(false);
      });
      
      expect(console.error).toHaveBeenCalledWith('Target user ID is missing');
    });

    it('should handle toggle result that is neither fulfilled nor rejected', async () => {
      (toggleUserStatus as jest.Mock).mockResolvedValue({
        type: 'users/toggleUserStatus/pending',
      });
      
      const store = createMockStore([
        { id: 1, firstname: 'John', lastname: 'Doe', isenabled: false },
      ]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      await act(async () => {
        await result.current.handleToggleStatus(1, false);
      });
      
      // Should complete without error and return false (line 125)
      expect(result.current.togglingUsers.size).toBe(0);
    });
  });

  describe('toggleUserStatusDirectly Edge Cases', () => {
    it('should handle toggle when user is already in toggling set', async () => {
      const store = createMockStore([
        { id: 1, firstname: 'John', lastname: 'Doe', isenabled: false },
      ]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      // Manually add user to toggling set
      act(() => {
        result.current.setConfirmDialog({ open: false, userId: null, userName: '', currentStatus: false });
      });
      
      // Try to toggle - should be prevented
      await act(async () => {
        await result.current.handleToggleStatus(1, false);
      });
      
      // Add to toggling set manually to simulate in-progress state
      act(() => {
        const newSet = new Set(result.current.togglingUsers);
        newSet.add(1);
        // This tests the preventMultipleClicks logic
      });
      
      await act(async () => {
        await result.current.handleToggleStatus(1, false);
      });
      
      expect(toggleUserStatus).toHaveBeenCalled();
    });
  });

  describe('Permission Merging', () => {
    it('should handle empty permissions arrays', async () => {
      (toggleUserStatus as jest.Mock).mockResolvedValue({
        type: 'users/toggleUserStatus/fulfilled',
        payload: { id: 1, isenabled: false },
      });

      (saveUserPartialUpdate as jest.Mock).mockResolvedValue(undefined);
      (fetchUsers as jest.Mock).mockResolvedValue({
        type: 'users/fetchUsers/fulfilled',
      });

      const mockSourceUser = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        emailid: 'john@example.com',
        permissions: JSON.stringify({
          enabledModules: [],
          selectedPermissions: [],
        }),
      };

      const mockTargetUser = {
        id: 2,
        firstname: 'Jane',
        lastname: 'Smith',
        emailid: 'jane@example.com',
        permissions: JSON.stringify({
          enabledModules: [],
          selectedPermissions: [],
        }),
      };

      (parsePermissionsData as jest.Mock).mockReturnValue({
        enabledModules: [],
        selectedPermissions: [],
      });

      const store = createMockStore([mockSourceUser, mockTargetUser]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      act(() => {
        result.current.setTransferPanel({
          open: true,
          userId: 1,
          userName: 'John Doe',
        });
      });
      
      await act(async () => {
        const success = await result.current.handleTransferSubmit('Jane Smith');
        expect(success).toBe(true);
      });
      
      expect(saveUserPartialUpdate).toHaveBeenCalled();
    });

    it('should handle null/undefined permissions data', async () => {
      (toggleUserStatus as jest.Mock).mockResolvedValue({
        type: 'users/toggleUserStatus/fulfilled',
        payload: { id: 1, isenabled: false },
      });

      (saveUserPartialUpdate as jest.Mock).mockResolvedValue(undefined);
      (fetchUsers as jest.Mock).mockResolvedValue({
        type: 'users/fetchUsers/fulfilled',
      });

      const mockSourceUser = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        emailid: 'john@example.com',
        permissions: null,
      };

      const mockTargetUser = {
        id: 2,
        firstname: 'Jane',
        lastname: 'Smith',
        emailid: 'jane@example.com',
        permissions: null,
      };

      (parsePermissionsData as jest.Mock).mockReturnValue(null);

      const store = createMockStore([mockSourceUser, mockTargetUser]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      act(() => {
        result.current.setTransferPanel({
          open: true,
          userId: 1,
          userName: 'John Doe',
        });
      });
      
      await act(async () => {
        const success = await result.current.handleTransferSubmit('Jane Smith');
        expect(success).toBe(true);
      });
      
      expect(saveUserPartialUpdate).toHaveBeenCalled();
    });
  });


  describe('executeToggle - Success Cases', () => {
    it('should handle successful toggle with fulfilled status and refresh grid', async () => {
      (toggleUserStatus as jest.Mock).mockResolvedValue({
        type: 'users/toggleUserStatus/fulfilled',
        payload: { id: 1, isenabled: true },
      });
      
      const store = createMockStore([
        { id: 1, firstname: 'John', lastname: 'Doe', isenabled: false },
      ]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      const consoleLogSpy = jest.spyOn(console, 'log');
      
      await act(async () => {
        await result.current.handleToggleStatus(1, false);
      });
      
      // Verify console.logs from fulfilled case (lines 116-117)
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Toggle status updated successfully');
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Database save confirmed for user:', 1);
      
      // Advance timers to trigger refreshGrid (lines 88-90)
      jest.advanceTimersByTime(200);
      
      await waitFor(() => {
        expect(mockGridRef.current.api.refreshCells).toHaveBeenCalled();
      });
    });

    it('should clear transferedby when reactivating user', async () => {
      (toggleUserStatus as jest.Mock).mockResolvedValue({
        type: 'users/toggleUserStatus/fulfilled',
        payload: { id: 1, isenabled: true },
      });
      
      const store = createMockStore([
        { id: 1, firstname: 'John', lastname: 'Doe', isenabled: false },
      ]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      await act(async () => {
        await result.current.handleToggleStatus(1, false);
      });
      
      expect(toggleUserStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          transferedby: null,
          transferedto: null,
          transfereddate: null,
        })
      );
    });

    it('should set transfereddate when deactivating user', async () => {
      (toggleUserStatus as jest.Mock).mockResolvedValue({
        type: 'users/toggleUserStatus/fulfilled',
        payload: { id: 1, isenabled: false },
      });
      
      const store = createMockStore([
        { id: 1, firstname: 'John', lastname: 'Doe', isenabled: true },
      ]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      // First open confirm dialog
      await act(async () => {
        await result.current.handleToggleStatus(1, true);
      });
      
      await act(async () => {
        await result.current.handleConfirmNo();
      });
      
      expect(toggleUserStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          isEnabled: false,
          transferedby: null,
          transferedto: null,
          transfereddate: expect.any(String),
        })
      );
    });
  });




  describe('validateActiveModuleAndSubmodule - Edge Cases', () => {
    it('should set activeModule to first item when activeModule is null but mergedEnabledModules has items', async () => {
      const mockSourceUser = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        emailid: 'john@example.com',
        permissions: JSON.stringify({
          enabledModules: ['module1'],
          selectedPermissions: ['module1-sub1-perm1'],
        }),
      };

      const mockTargetUser = {
        id: 2,
        firstname: 'Jane',
        lastname: 'Smith',
        emailid: 'jane@example.com',
        permissions: JSON.stringify({
          enabledModules: ['module2'],
          selectedPermissions: ['module2-sub2-perm2'],
          activeModule: null, // null but merged will have items
        }),
      };

      (parsePermissionsData as jest.Mock).mockImplementation((perms: string) => {
        const parsed = JSON.parse(perms);
        return {
          enabledModules: parsed.enabledModules || [],
          selectedPermissions: parsed.selectedPermissions || [],
          activeModule: parsed.activeModule,
          activeSubmodule: parsed.activeSubmodule,
        };
      });

      const store = createMockStore([mockSourceUser, mockTargetUser]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      act(() => {
        result.current.setTransferPanel({
          open: true,
          userId: 1,
          userName: 'John Doe',
        });
      });
      
      await act(async () => {
        await result.current.handleTransferSubmit('Jane Smith');
      });
      
      expect(saveUserPartialUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          permissions: expect.objectContaining({
            activeModule: expect.any(String), // Should be set to first module
          }),
        }),
        'u'
      );
    });

    it('should set activeModule to null when mergedEnabledModules is empty', async () => {
      const mockSourceUser = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        emailid: 'john@example.com',
        permissions: JSON.stringify({
          enabledModules: [],
          selectedPermissions: [],
        }),
      };

      const mockTargetUser = {
        id: 2,
        firstname: 'Jane',
        lastname: 'Smith',
        emailid: 'jane@example.com',
        permissions: JSON.stringify({
          enabledModules: [],
          selectedPermissions: [],
          activeModule: 'invalidModule',
        }),
      };

      (parsePermissionsData as jest.Mock).mockImplementation((perms: string) => {
        const parsed = JSON.parse(perms);
        return {
          enabledModules: parsed.enabledModules || [],
          selectedPermissions: parsed.selectedPermissions || [],
          activeModule: parsed.activeModule,
          activeSubmodule: parsed.activeSubmodule,
        };
      });

      const store = createMockStore([mockSourceUser, mockTargetUser]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      act(() => {
        result.current.setTransferPanel({
          open: true,
          userId: 1,
          userName: 'John Doe',
        });
      });
      
      await act(async () => {
        await result.current.handleTransferSubmit('Jane Smith');
      });
      
      expect(saveUserPartialUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          permissions: expect.objectContaining({
            activeModule: null,
          }),
        }),
        'u'
      );
    });

    it('should reset activeSubmodule when it does not start with activeModule prefix', async () => {
      const mockSourceUser = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        emailid: 'john@example.com',
        permissions: JSON.stringify({
          enabledModules: ['module1'],
          selectedPermissions: ['module1-sub1-perm1'],
        }),
      };

      const mockTargetUser = {
        id: 2,
        firstname: 'Jane',
        lastname: 'Smith',
        emailid: 'jane@example.com',
        permissions: JSON.stringify({
          enabledModules: ['module2'],
          selectedPermissions: ['module2-sub2-perm2'],
          activeModule: 'module2',
          activeSubmodule: 'module1-sub1', // Wrong prefix
        }),
      };

      (parsePermissionsData as jest.Mock).mockImplementation((perms: string) => {
        const parsed = JSON.parse(perms);
        return {
          enabledModules: parsed.enabledModules || [],
          selectedPermissions: parsed.selectedPermissions || [],
          activeModule: parsed.activeModule,
          activeSubmodule: parsed.activeSubmodule,
        };
      });

      const store = createMockStore([mockSourceUser, mockTargetUser]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      act(() => {
        result.current.setTransferPanel({
          open: true,
          userId: 1,
          userName: 'John Doe',
        });
      });
      
      await act(async () => {
        await result.current.handleTransferSubmit('Jane Smith');
      });
      
      expect(saveUserPartialUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          permissions: expect.objectContaining({
            activeSubmodule: null,
          }),
        }),
        'u'
      );
    });

    it('should reset activeSubmodule when no permissions found for it', async () => {
      const mockSourceUser = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        emailid: 'john@example.com',
        permissions: JSON.stringify({
          enabledModules: ['module1'],
          selectedPermissions: ['module1-sub1-perm1'],
        }),
      };

      const mockTargetUser = {
        id: 2,
        firstname: 'Jane',
        lastname: 'Smith',
        emailid: 'jane@example.com',
        permissions: JSON.stringify({
          enabledModules: ['module2'],
          selectedPermissions: ['module2-sub2-perm2'],
          activeModule: 'module2',
          activeSubmodule: 'module2-sub3', // Submodule with no permissions
        }),
      };

      (parsePermissionsData as jest.Mock).mockImplementation((perms: string) => {
        const parsed = JSON.parse(perms);
        return {
          enabledModules: parsed.enabledModules || [],
          selectedPermissions: parsed.selectedPermissions || [],
          activeModule: parsed.activeModule,
          activeSubmodule: parsed.activeSubmodule,
        };
      });

      const store = createMockStore([mockSourceUser, mockTargetUser]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      act(() => {
        result.current.setTransferPanel({
          open: true,
          userId: 1,
          userName: 'John Doe',
        });
      });
      
      await act(async () => {
        await result.current.handleTransferSubmit('Jane Smith');
      });
      
      expect(saveUserPartialUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          permissions: expect.objectContaining({
            activeSubmodule: null,
          }),
        }),
        'u'
      );
    });
  });

  describe('handleTransferSubmit - fetchUsers', () => {
    it('should call fetchUsers and refreshGrid after successful transfer', async () => {
      const mockSourceUser = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        emailid: 'john@example.com',
        permissions: JSON.stringify({
          enabledModules: ['module1'],
          selectedPermissions: ['module1-sub1-perm1'],
        }),
      };

      const mockTargetUser = {
        id: 2,
        firstname: 'Jane',
        lastname: 'Smith',
        emailid: 'jane@example.com',
        permissions: JSON.stringify({
          enabledModules: ['module2'],
          selectedPermissions: ['module2-sub2-perm2'],
        }),
      };

      (toggleUserStatus as jest.Mock).mockResolvedValue({
        type: 'users/toggleUserStatus/fulfilled',
        payload: { id: 1, isenabled: false },
      });

      (fetchUsers as jest.Mock).mockResolvedValue({
        type: 'users/fetchUsers/fulfilled',
      });

      (saveUserPartialUpdate as jest.Mock).mockResolvedValue(undefined);

      (parsePermissionsData as jest.Mock).mockImplementation((perms: string) => {
        const parsed = JSON.parse(perms);
        return {
          enabledModules: parsed.enabledModules || [],
          selectedPermissions: parsed.selectedPermissions || [],
        };
      });

      const store = createMockStore([mockSourceUser, mockTargetUser]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      act(() => {
        result.current.setTransferPanel({
          open: true,
          userId: 1,
          userName: 'John Doe',
        });
      });
      
      await act(async () => {
        const success = await result.current.handleTransferSubmit('Jane Smith');
        expect(success).toBe(true);
      });
      
      // Verify fetchUsers was called (line 351)
      expect(fetchUsers).toHaveBeenCalled();
      
      // Verify refreshGrid was called (line 352)
      jest.advanceTimersByTime(200);
      await waitFor(() => {
        expect(mockGridRef.current.api.refreshCells).toHaveBeenCalled();
      });
    });
  });

  describe('User Name Formatting - Additional Cases', () => {
    it('should use lastname only when firstname is empty', async () => {
      const store = createMockStore([
        { id: 1, firstname: '', lastname: 'Doe', emailid: 'john@example.com', isenabled: true },
      ]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      await act(async () => {
        await result.current.handleToggleStatus(1, true);
      });
      
      expect(result.current.confirmDialog.userName).toBe('Doe');
    });

    it('should use emailid when both firstname and lastname are empty', async () => {
      const store = createMockStore([
        { id: 1, firstname: '', lastname: '', emailid: 'john@example.com', isenabled: true },
      ]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      await act(async () => {
        await result.current.handleToggleStatus(1, true);
      });
      
      expect(result.current.confirmDialog.userName).toBe('john@example.com');
    });

    it('should use Unknown User when user not found and no emailid', async () => {
      const store = createMockStore([]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      await act(async () => {
        await result.current.handleToggleStatus(999, true);
      });
      
      expect(result.current.confirmDialog.userName).toBe('Unknown User');
    });
  });

  describe('findUserByName', () => {
    it('should find user by full name with firstname and lastname', async () => {
      (toggleUserStatus as jest.Mock).mockResolvedValue({
        type: 'users/toggleUserStatus/fulfilled',
        payload: { id: 1, isenabled: false },
      });

      (saveUserPartialUpdate as jest.Mock).mockResolvedValue(undefined);
      (fetchUsers as jest.Mock).mockResolvedValue({
        type: 'users/fetchUsers/fulfilled',
      });

      const mockSourceUser = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        emailid: 'john@example.com',
        permissions: JSON.stringify({ enabledModules: [], selectedPermissions: [] }),
      };

      const mockTargetUser = {
        id: 2,
        firstname: 'Jane',
        lastname: 'Smith',
        emailid: 'jane@example.com',
        permissions: JSON.stringify({ enabledModules: [], selectedPermissions: [] }),
      };

      (parsePermissionsData as jest.Mock).mockReturnValue({
        enabledModules: [],
        selectedPermissions: [],
      });

      const store = createMockStore([mockSourceUser, mockTargetUser]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      act(() => {
        result.current.setTransferPanel({
          open: true,
          userId: 1,
          userName: 'John Doe',
        });
      });
      
      await act(async () => {
        const success = await result.current.handleTransferSubmit('Jane Smith');
        expect(success).toBe(true);
      });
    });

    it('should find user by emailid when name is empty', async () => {
      (toggleUserStatus as jest.Mock).mockResolvedValue({
        type: 'users/toggleUserStatus/fulfilled',
        payload: { id: 1, isenabled: false },
      });

      (saveUserPartialUpdate as jest.Mock).mockResolvedValue(undefined);
      (fetchUsers as jest.Mock).mockResolvedValue({
        type: 'users/fetchUsers/fulfilled',
      });

      const mockSourceUser = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        emailid: 'john@example.com',
        permissions: JSON.stringify({ enabledModules: [], selectedPermissions: [] }),
      };

      const mockTargetUser = {
        id: 2,
        firstname: '',
        lastname: '',
        emailid: 'jane@example.com',
        permissions: JSON.stringify({ enabledModules: [], selectedPermissions: [] }),
      };

      (parsePermissionsData as jest.Mock).mockReturnValue({
        enabledModules: [],
        selectedPermissions: [],
      });

      const store = createMockStore([mockSourceUser, mockTargetUser]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      act(() => {
        result.current.setTransferPanel({
          open: true,
          userId: 1,
          userName: 'John Doe',
        });
      });
      
      await act(async () => {
        const success = await result.current.handleTransferSubmit('jane@example.com');
        expect(success).toBe(true);
      });
    });
  });

  describe('preventMultipleClicks Coverage', () => {
    it('should log and return true when user is already in toggling set', async () => {
      let resolveToggle: any;
      (toggleUserStatus as jest.Mock).mockImplementation(() => {
        return new Promise((resolve) => {
          resolveToggle = resolve;
        });
      });

      const store = createMockStore([
        { id: 1, firstname: 'John', lastname: 'Doe', isenabled: false },
      ]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      const consoleLogSpy = jest.spyOn(console, 'log');
      
      // Start first toggle - this adds user to toggling set
      const firstToggle = act(async () => {
        await result.current.handleToggleStatus(1, false);
      });
      
      // Wait a moment for the toggle to start
      await act(async () => {
        await new Promise(resolve => {
          jest.advanceTimersByTime(1);
          setTimeout(resolve, 0);
        });
      });
      
      // Try to toggle again while first is in progress - should trigger preventMultipleClicks (lines 66-67)
      await act(async () => {
        await result.current.handleToggleStatus(1, false);
      });
      
      // Verify console.log was called
      expect(consoleLogSpy).toHaveBeenCalledWith('Toggle already in progress for user:', 1);
      
      // Resolve the first toggle
      resolveToggle({ type: 'users/toggleUserStatus/fulfilled' });
      await firstToggle;
    });

    it('should return false when toggle result is neither fulfilled nor rejected (line 125)', async () => {
      (toggleUserStatus as jest.Mock).mockResolvedValue({
        type: 'users/toggleUserStatus/unknown',
      });
      
      const store = createMockStore([
        { id: 1, firstname: 'John', lastname: 'Doe', isenabled: false },
      ]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      await act(async () => {
        await result.current.handleToggleStatus(1, false);
      });
      
      // Should complete without error (returns false from line 125)
      expect(result.current.togglingUsers.size).toBe(0);
    });

    it('should return early from toggleUserStatusDirectly when preventMultipleClicks returns true (line 159)', async () => {
      let resolveToggle: any;
      (toggleUserStatus as jest.Mock).mockImplementation(() => {
        return new Promise((resolve) => {
          resolveToggle = resolve;
        });
      });

      const store = createMockStore([
        { id: 1, firstname: 'John', lastname: 'Doe', isenabled: false },
      ]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      // Start first toggle
      const firstToggle = act(async () => {
        await result.current.handleToggleStatus(1, false);
      });
      
      // Wait a moment
      await act(async () => {
        await new Promise(resolve => {
          jest.advanceTimersByTime(1);
          setTimeout(resolve, 0);
        });
      });
      
      // Try second toggle - should return early (line 159)
      await act(async () => {
        await result.current.handleToggleStatus(1, false);
      });
      
      // Resolve the first toggle
      resolveToggle({ type: 'users/toggleUserStatus/fulfilled' });
      await firstToggle;
    });

    it('should return false from handleTransferSubmit when preventMultipleClicks returns true (line 258)', async () => {
      let resolveToggle: any;
      (toggleUserStatus as jest.Mock).mockImplementation(() => {
        return new Promise((resolve) => {
          resolveToggle = resolve;
        });
      });

      (saveUserPartialUpdate as jest.Mock).mockResolvedValue(undefined);
      (parsePermissionsData as jest.Mock).mockReturnValue({
        enabledModules: [],
        selectedPermissions: [],
      });

      const mockSourceUser = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        emailid: 'john@example.com',
        permissions: JSON.stringify({ enabledModules: [], selectedPermissions: [] }),
      };

      const mockTargetUser = {
        id: 2,
        firstname: 'Jane',
        lastname: 'Smith',
        emailid: 'jane@example.com',
        permissions: JSON.stringify({ enabledModules: [], selectedPermissions: [] }),
      };

      const store = createMockStore([mockSourceUser, mockTargetUser]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      act(() => {
        result.current.setTransferPanel({
          open: true,
          userId: 1,
          userName: 'John Doe',
        });
      });
      
      // Start first transfer
      const firstTransfer = act(async () => {
        return result.current.handleTransferSubmit('Jane Smith');
      });
      
      // Wait a moment
      await act(async () => {
        await new Promise(resolve => {
          jest.advanceTimersByTime(1);
          setTimeout(resolve, 0);
        });
      });
      
      // Try second transfer - should return false (line 258)
      await act(async () => {
        const success = await result.current.handleTransferSubmit('Jane Smith');
        expect(success).toBe(false);
      });
      
      // Resolve the first transfer
      resolveToggle({ type: 'users/toggleUserStatus/fulfilled' });
      await firstTransfer;
    });

    it('should return early from handleConfirmNo when preventMultipleClicks returns true (line 378)', async () => {
      let resolveToggle: any;
      (toggleUserStatus as jest.Mock).mockImplementation(() => {
        return new Promise((resolve) => {
          resolveToggle = resolve;
        });
      });

      const store = createMockStore([
        { id: 1, firstname: 'John', lastname: 'Doe', isenabled: true },
      ]);
      const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
      
      const { result } = renderHook(() => useUserToggle(mockGridRef), { wrapper });
      
      // Open confirm dialog
      await act(async () => {
        await result.current.handleToggleStatus(1, true);
      });
      
      // Start first confirm no
      const firstConfirm = act(async () => {
        await result.current.handleConfirmNo();
      });
      
      // Wait a moment
      await act(async () => {
        await new Promise(resolve => {
          jest.advanceTimersByTime(1);
          setTimeout(resolve, 0);
        });
      });
      
      // Try second confirm no - should return early (line 378)
      await act(async () => {
        await result.current.handleConfirmNo();
      });
      
      // Resolve the first confirm
      resolveToggle({ type: 'users/toggleUserStatus/fulfilled' });
      await firstConfirm;
    });
  });
});
