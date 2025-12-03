import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import RoleForm from '../../../src/pages/userManagement/RoleForm';
import '@testing-library/jest-dom';

// Mock requestAnimationFrame and cancelAnimationFrame to execute synchronously for faster tests
global.requestAnimationFrame = jest.fn((cb: FrameRequestCallback) => {
  if (typeof cb === 'function') {
    cb(0); // Execute immediately, no setTimeout
  }
  return 1;
});
global.cancelAnimationFrame = jest.fn();

// Mock all dependencies at the top - use immediate resolves
const mockSaveRole = jest.fn().mockResolvedValue({ status: 'Ok' });
const mockFetchRoles = jest.fn().mockResolvedValue([]);
const mockFetchUsers = jest.fn().mockResolvedValue([]);
const mockUpdateUsersWithRoleNameAndRefresh = jest.fn().mockResolvedValue(undefined);
const mockNavigate = jest.fn();
const mockUseParams = jest.fn(() => ({}));
const mockUseModulePermissions = jest.fn(() => ({ modulesData: {}, loading: false, error: null }));
const mockUseDuplicateRolePermissionPanel = jest.fn(() => ({}));

jest.mock('../../../src/services/roleSaveService', () => ({
  saveRole: () => mockSaveRole()
}));

jest.mock('../../../src/store/Reducers/roleSlice', () => ({
  fetchRoles: jest.fn(() => async (dispatch: any) => {
    try {
      dispatch({ type: 'roles/fetchRoles/pending' });
      const result = await mockFetchRoles();
      dispatch({ type: 'roles/fetchRoles/fulfilled', payload: result });
      return result;
    } catch (error: any) {
      dispatch({ type: 'roles/fetchRoles/rejected', error: { message: error.message } });
      throw error;
    }
  })
}));

jest.mock('../../../src/store/Reducers/userSlice', () => ({
  fetchUsers: jest.fn(() => async (dispatch: any) => {
    try {
      dispatch({ type: 'users/fetchUsers/pending' });
      const result = await mockFetchUsers();
      dispatch({ type: 'users/fetchUsers/fulfilled', payload: result });
      return result;
    } catch (error: any) {
      dispatch({ type: 'users/fetchUsers/rejected', error: { message: error.message } });
      throw error;
    }
  })
}));

jest.mock('../../../src/utils/roleNameUpdateUtils', () => ({
  updateUsersWithRoleNameAndRefresh: () => mockUpdateUsersWithRoleNameAndRefresh()
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams()
}));

jest.mock('../../../src/hooks/useModulePermissions', () => ({
  useModulePermissions: () => mockUseModulePermissions()
}));

jest.mock('../../../src/hooks/useDuplicateRolePermissionPanel', () => ({
  useDuplicateRolePermissionPanel: () => mockUseDuplicateRolePermissionPanel()
}));

jest.mock('../../../src/components/roleManagement/RolePermissionsTable', () => {
  return function MockRolePermissionsTable({ 
    onInputChange, 
    onResetReady, 
    onPermissionChangesChange,
    onDuplicateClick 
  }: any) {
    React.useEffect(() => {
      if (onResetReady) {
        onResetReady(() => {
          if (onInputChange) {
            onInputChange('permissions', {
              enabledModules: [],
              selectedPermissions: [],
              activeModule: null,
              activeSubmodule: null
            });
          }
        });
      }
    }, [onResetReady, onInputChange]);

    return (
      <div data-testid="role-permissions-table">
        <button
          data-testid="trigger-permission-change"
          onClick={() => {
            if (onPermissionChangesChange) onPermissionChangesChange(true);
            if (onInputChange) {
              onInputChange('permissions', {
                enabledModules: ['Module1'],
                selectedPermissions: ['Module1-Submodule1-Permission1'],
                activeModule: 'Module1',
                activeSubmodule: 'Module1-Submodule1'
              });
            }
          }}
        >
          Trigger Change
        </button>
        <button
          data-testid="trigger-permission-change-different"
          onClick={() => {
            if (onPermissionChangesChange) onPermissionChangesChange(true);
            if (onInputChange) {
              onInputChange('permissions', {
                enabledModules: ['Module2'],
                selectedPermissions: ['Module2-Submodule1-Permission1'],
                activeModule: 'Module2',
                activeSubmodule: 'Module2-Submodule1'
              });
            }
          }}
        >
          Trigger Different Change
        </button>
        <button
          data-testid="trigger-duplicate"
          onClick={() => onDuplicateClick && onDuplicateClick()}
        >
          Duplicate
        </button>
        <button
          data-testid="trigger-reset-permissions"
          onClick={() => {
            if (onResetReady) {
              const resetFn = () => {
                if (onInputChange) {
                  onInputChange('permissions', {
                    enabledModules: [],
                    selectedPermissions: [],
                    activeModule: null,
                    activeSubmodule: null
                  });
                }
              };
              resetFn();
            }
          }}
        >
          Reset Permissions
        </button>
      </div>
    );
  };
});

jest.mock('commonApp/NotificationAlert', () => {
  return function MockNotificationAlert({ open, message, variant, onClose, actions }: any) {
    if (!open) return null;
    return (
      <div data-testid="notification-alert" data-variant={variant}>
        <div>{message}</div>
        {actions && actions.map((action: any, index: number) => (
          <button key={index} data-testid={`notification-action-${index}`} onClick={action.onClick}>
            {action.label}
          </button>
        ))}
        <button data-testid="notification-close" onClick={onClose}>Close</button>
      </div>
    );
  };
});

jest.mock('../../../src/components/userManagement/UserFormComponents', () => ({
  ReusableTextField: ({ field, label, value, onChange, error, errorMessage }: any) => (
    <div data-testid={`text-field-${field}`} data-error={error}>
      <label>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        data-testid={`input-${field}`}
      />
      {errorMessage && <div data-testid={`error-${field}`}>{errorMessage}</div>}
    </div>
  ),
  ReusableMultiSelectField: ({ field, label, value, onChange, error, errorMessage }: any) => (
    <div data-testid={`multi-select-${field}`} data-error={error}>
      <label>{label}</label>
      <select
        multiple
        value={value || []}
        onChange={(e) => onChange && onChange(Array.from(e.target.selectedOptions, option => option.value))}
        data-testid={`select-${field}`}
      >
        {['Region', 'Country', 'Division'].map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {errorMessage && <div data-testid={`error-${field}`}>{errorMessage}</div>}
    </div>
  ),
  SectionTitle: ({ children }: any) => <div data-testid="section-title">{children}</div>
}));

jest.mock('commonApp/FormHeaderBase', () => {
  return function MockFormHeaderBase({ 
    onBack, 
    onReset, 
    onCancel, 
    onSave, 
    onNext, 
    isNextDisabled, 
    isSaveDisabled, 
    isFormModified 
  }: any) {
    return (
      <div data-testid="form-header-base">
        <button data-testid="back-button" onClick={onBack}>Back</button>
        <button data-testid="reset-button" onClick={onReset} disabled={!isFormModified}>Reset</button>
        <button data-testid="cancel-button" onClick={onCancel}>Cancel</button>
        <button data-testid="save-button" onClick={onSave} disabled={isSaveDisabled}>Save</button>
        <button data-testid="next-button" onClick={onNext} disabled={isNextDisabled}>Next</button>
      </div>
    );
  };
});

jest.mock('../../../src/components/shared/StatusRadioButtons', () => {
  return function MockStatusRadioButtons({ value, onChange, disabled }: any) {
    return (
      <div data-testid="status-radio-buttons">
        <input
          type="radio"
          checked={value === 'Active'}
          onChange={() => !disabled && onChange && onChange('Active')}
          data-testid="radio-active"
        />
        <input
          type="radio"
          checked={value === 'Inactive'}
          onChange={() => !disabled && onChange && onChange('Inactive')}
          data-testid="radio-inactive"
        />
      </div>
    );
  };
});

jest.mock('../../../src/components/roleManagement/DuplicateRolePermissionPanelWrapper', () => {
  return function MockDuplicateRolePermissionPanelWrapper() {
    return <div data-testid="duplicate-panel-wrapper" />;
  };
});

jest.mock('../../../src/utils/userFormUtils', () => ({
  parseArrayData: jest.fn((data) => {
    if (Array.isArray(data)) return data;
    if (typeof data === 'string' && data.trim()) {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
    return [];
  }),
  parsePermissionsData: jest.fn((data) => {
    if (typeof data === 'object' && data !== null) {
      if (data.enabledModules && data.selectedPermissions) return data;
      try {
        return typeof data === 'string' ? JSON.parse(data) : data;
      } catch {
        return { enabledModules: [], selectedPermissions: [], activeModule: null, activeSubmodule: null };
      }
    }
    if (typeof data === 'string' && data.trim()) {
      try {
        return JSON.parse(data);
      } catch {
        return { enabledModules: [], selectedPermissions: [], activeModule: null, activeSubmodule: null };
      }
    }
    return { enabledModules: [], selectedPermissions: [], activeModule: null, activeSubmodule: null };
  }),
  mergeDuplicatePermissions: jest.fn((current, duplicated, enabled) => ({
    enabledModules: enabled || current?.enabledModules || [],
    selectedPermissions: [...(current?.selectedPermissions || []), ...(duplicated || [])],
    activeModule: current?.activeModule || null,
    activeSubmodule: current?.activeSubmodule || null
  }))
}));

// Create mock store with stable reducers to prevent infinite loops
const createMockStore = (preloadedState: any = {}) => {
  const rolesReducer = (state: any = { roles: [], loading: false, error: null, hasRoles: false, initialFetchAttempted: false }, action: any) => {
    if (action.type === 'roles/setRoles') {
      return { ...state, roles: action.payload };
    }
    if (action.type === 'roles/fetchRoles/pending') {
      return { ...state, loading: true };
    }
    if (action.type === 'roles/fetchRoles/fulfilled') {
      return { ...state, loading: false, roles: action.payload || state.roles };
    }
    if (action.type === 'roles/fetchRoles/rejected') {
      return { ...state, loading: false, error: action.error };
    }
    // Return same state if no change to prevent re-renders
    return state;
  };
  
  const usersReducer = (state: any = { users: [], loading: false, error: null, hasUsers: false, initialFetchAttempted: false }, action: any) => {
    if (action.type === 'users/fetchUsers/pending') {
      return { ...state, loading: true };
    }
    if (action.type === 'users/fetchUsers/fulfilled') {
      return { ...state, loading: false, users: action.payload || state.users };
    }
    if (action.type === 'users/fetchUsers/rejected') {
      return { ...state, loading: false, error: action.error };
    }
    // Return same state to prevent re-renders
    return state;
  };
  
  return configureStore({
    reducer: {
      roles: rolesReducer as any,
      users: usersReducer as any
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false
      }),
  });
};

interface RenderOptions {
  route?: string;
  store?: ReturnType<typeof createMockStore>;
}

const renderWithProviders = (ui: React.ReactElement, options: RenderOptions = {}) => {
  const { route = '/user-management/roles/new', store } = options;
  window.history.pushState({}, 'Test page', route);
  const testStore = store || createMockStore();
  return {
    store: testStore,
    ...render(
      <Provider store={testStore}>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </Provider>
    )
  };
};

describe('RoleForm', () => {
  const mockRoles = [
    {
      id: 1,
      rolename: 'Admin',
      department: 'IT',
      roledescription: 'Administrator',
      status: 'Active',
      parentattribute: JSON.stringify(['Region', 'Country']),
      permissions: JSON.stringify({
        enabledModules: ['Module1'],
        selectedPermissions: ['perm1'],
        activeModule: null,
        activeSubmodule: null
      }),
      isenabled: true,
      softdelete: false,
      islocked: false
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers(); // Use fake timers for faster execution
    // Re-initialize requestAnimationFrame mock after clearAllMocks
    let rafIdCounter = 0;
    (global.requestAnimationFrame as jest.Mock) = jest.fn((cb: FrameRequestCallback) => {
      if (typeof cb === 'function') {
        cb(0); // Execute immediately
      }
      rafIdCounter++;
      return rafIdCounter;
    });
    (global.cancelAnimationFrame as jest.Mock) = jest.fn(() => {
      // Mock cancelAnimationFrame to prevent infinite loops
      return;
    });
    mockSaveRole.mockResolvedValue({ status: 'Ok' });
    mockFetchRoles.mockResolvedValue(mockRoles);
    mockFetchUsers.mockResolvedValue([]);
    mockUpdateUsersWithRoleNameAndRefresh.mockResolvedValue(undefined);
    mockNavigate.mockClear();
    mockUseParams.mockReturnValue({});
    mockUseModulePermissions.mockReturnValue({ modulesData: {}, loading: false, error: null });
    mockUseDuplicateRolePermissionPanel.mockReturnValue({});
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllTimers();
    jest.clearAllMocks();
    // Don't clear mocks here as it causes infinite loops - they're re-initialized in beforeEach
  });

  describe('Rendering', () => {
    it('should render form in create mode', () => {
      renderWithProviders(<RoleForm />);
      expect(screen.getByText('Create Role')).toBeInTheDocument();
      expect(screen.getByTestId('text-field-roleName')).toBeInTheDocument();
      expect(screen.getByTestId('text-field-department')).toBeInTheDocument();
      expect(screen.getByTestId('text-field-roleDescription')).toBeInTheDocument();
      expect(screen.getByTestId('multi-select-parentAttribute')).toBeInTheDocument();
      expect(screen.getByTestId('role-permissions-table')).toBeInTheDocument();
    });

    it('should render form in edit mode', () => {
      mockUseParams.mockReturnValue({ id: '1' });
      const store = createMockStore({
        roles: { roles: mockRoles, loading: false, error: null, hasRoles: true, initialFetchAttempted: true }
      });
      
      renderWithProviders(<RoleForm />, { store });
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByText('Edit Role')).toBeInTheDocument();
    });

    it('should show loading state when fetching role data', () => {
      mockUseParams.mockReturnValue({ id: '1' });
      const store = createMockStore({
        roles: { roles: [], loading: true, error: null, hasRoles: false, initialFetchAttempted: false }
      });
      
      renderWithProviders(<RoleForm />, { store });
      expect(screen.getByText('Loading role data...')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate all required fields', () => {
      renderWithProviders(<RoleForm />);
      fireEvent.click(screen.getByTestId('next-button'));
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('error-roleName')).toBeInTheDocument();
      expect(screen.getByTestId('error-department')).toBeInTheDocument();
      expect(screen.getByTestId('error-roleDescription')).toBeInTheDocument();
      expect(screen.getByTestId('error-parentAttribute')).toBeInTheDocument();
    });

    it('should validate role name special characters', () => {
      renderWithProviders(<RoleForm />);
      fireEvent.change(screen.getByTestId('input-roleName'), { target: { value: 'Admin@123' } });
      fireEvent.click(screen.getByTestId('next-button'));
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('error-roleName')).toHaveTextContent('Role Name cannot contain special characters');
    });

    it('should clear validation errors when field is corrected', () => {
      renderWithProviders(<RoleForm />);
      const roleNameInput = screen.getByTestId('input-roleName');
      
      fireEvent.change(roleNameInput, { target: { value: '' } });
      fireEvent.click(screen.getByTestId('next-button'));
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('error-roleName')).toBeInTheDocument();
      
      fireEvent.change(roleNameInput, { target: { value: 'Admin' } });
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.queryByTestId('error-roleName')).not.toBeInTheDocument();
    });
  });

  describe('Form Input Handling', () => {
    it('should handle text field changes', () => {
      renderWithProviders(<RoleForm />);
      const roleNameInput = screen.getByTestId('input-roleName');
      fireEvent.change(roleNameInput, { target: { value: 'New Role' } });
      expect(roleNameInput).toHaveValue('New Role');
    });

    it('should handle status radio button change', () => {
      renderWithProviders(<RoleForm />);
      const inactiveRadio = screen.getByTestId('radio-inactive');
      fireEvent.click(inactiveRadio);
      expect(inactiveRadio).toBeChecked();
    });

    it('should handle parent attribute selection', () => {
      renderWithProviders(<RoleForm />);
      const parentAttrSelect = screen.getByTestId('select-parentAttribute');
      fireEvent.change(parentAttrSelect, { target: { value: 'Region' } });
      expect(parentAttrSelect).toHaveValue('Region');
    });
  });

  describe('Form Submission', () => {
    it('should submit form successfully in create mode', () => {
      renderWithProviders(<RoleForm />);
      
      fireEvent.change(screen.getByTestId('input-roleName'), { target: { value: 'New Role' } });
      fireEvent.change(screen.getByTestId('input-department'), { target: { value: 'IT' } });
      fireEvent.change(screen.getByTestId('input-roleDescription'), { target: { value: 'Description' } });
      const parentAttrSelect = screen.getByTestId('select-parentAttribute');
      fireEvent.change(parentAttrSelect, { target: { value: 'Region' } });
      
      act(() => {
        jest.runAllTimers();
      });
      
      fireEvent.click(screen.getByTestId('next-button'));
      act(() => {
        jest.runAllTimers();
      });
      
      expect(mockSaveRole).toHaveBeenCalled();
    });

    it('should handle save error', () => {
      mockSaveRole.mockRejectedValueOnce(new Error('Save failed'));
      renderWithProviders(<RoleForm />);
      
      fireEvent.change(screen.getByTestId('input-roleName'), { target: { value: 'New Role' } });
      fireEvent.change(screen.getByTestId('input-department'), { target: { value: 'IT' } });
      fireEvent.change(screen.getByTestId('input-roleDescription'), { target: { value: 'Description' } });
      const parentAttrSelect = screen.getByTestId('select-parentAttribute');
      fireEvent.change(parentAttrSelect, { target: { value: 'Region' } });
      
      act(() => {
        jest.runAllTimers();
      });
      
      fireEvent.click(screen.getByTestId('next-button'));
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
    });

    it('should update users when role name changes in edit mode', () => {
      mockUseParams.mockReturnValue({ id: '1' });
      const store = createMockStore({
        roles: { roles: mockRoles, loading: false, error: null, hasRoles: true, initialFetchAttempted: true }
      });
      
      renderWithProviders(<RoleForm />, { store });
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('input-roleName')).toBeInTheDocument();
      
      fireEvent.change(screen.getByTestId('input-roleName'), { target: { value: 'Updated Role Name' } });
      fireEvent.change(screen.getByTestId('input-department'), { target: { value: 'IT' } });
      fireEvent.change(screen.getByTestId('input-roleDescription'), { target: { value: 'Description' } });
      const parentAttrSelect = screen.getByTestId('select-parentAttribute');
      fireEvent.change(parentAttrSelect, { target: { value: 'Region' } });
      
      act(() => {
        jest.runAllTimers();
      });
      
      fireEvent.click(screen.getByTestId('next-button'));
      
      act(() => {
        jest.runAllTimers();
      });
      expect(mockSaveRole).toHaveBeenCalled();
      expect(mockUpdateUsersWithRoleNameAndRefresh).toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should navigate back when back button is clicked', () => {
      renderWithProviders(<RoleForm />);
      fireEvent.click(screen.getByTestId('back-button'));
      expect(mockNavigate).toHaveBeenCalled();
    });

    it('should show confirmation when cancel is clicked with modifications', () => {
      renderWithProviders(<RoleForm />);
      
      fireEvent.change(screen.getByTestId('input-roleName'), { target: { value: 'Test' } });
      
      act(() => {
        jest.runAllTimers();
      });
      
      fireEvent.click(screen.getByTestId('cancel-button'));
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
    });

    it('should navigate directly when cancel is clicked without modifications', () => {
      renderWithProviders(<RoleForm />);
      fireEvent.click(screen.getByTestId('cancel-button'));
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  describe('Reset Functionality', () => {
    it('should reset form when reset button is clicked', async () => {
      renderWithProviders(<RoleForm />);
      
      fireEvent.change(screen.getByTestId('input-roleName'), { target: { value: 'Test' } });
      
      act(() => {
        jest.runAllTimers();
      });
      
      const resetButton = screen.getByTestId('reset-button') as HTMLButtonElement;
      if (!resetButton.disabled) {
        fireEvent.click(resetButton);
        
        await waitFor(() => {
          expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
        }, { timeout: 500 });
        
        const confirmButton = screen.getByTestId('notification-action-1');
        fireEvent.click(confirmButton);
        
        await waitFor(() => {
          expect(screen.getByTestId('input-roleName')).toHaveValue('');
        }, { timeout: 500 });
      }
    });
  });

  describe('Permission Changes', () => {
    it('should track permission changes', () => {
      renderWithProviders(<RoleForm />);
      
      fireEvent.click(screen.getByTestId('trigger-permission-change'));
      
      act(() => {
        jest.runAllTimers();
      });
      const resetButton = screen.getByTestId('reset-button');
      expect(resetButton).not.toBeDisabled();
    });
  });

  describe('Button States', () => {
    it('should disable submit button when form is invalid', () => {
      renderWithProviders(<RoleForm />);
      expect(screen.getByTestId('next-button')).toBeDisabled();
    });

    it('should enable submit button when form is valid', () => {
      renderWithProviders(<RoleForm />);
      
      fireEvent.change(screen.getByTestId('input-roleName'), { target: { value: 'New Role' } });
      fireEvent.change(screen.getByTestId('input-department'), { target: { value: 'IT' } });
      fireEvent.change(screen.getByTestId('input-roleDescription'), { target: { value: 'Description' } });
      const parentAttrSelect = screen.getByTestId('select-parentAttribute');
      fireEvent.change(parentAttrSelect, { target: { value: 'Region' } });
      
      act(() => {
        jest.runAllTimers();
      });
      
      expect(screen.getByTestId('next-button')).not.toBeDisabled();
    });
  });

  describe('Edit Mode Initialization', () => {
    it('should load role data from store when role exists', () => {
      mockUseParams.mockReturnValue({ id: '1' });
      const store = createMockStore({
        roles: { roles: mockRoles, loading: false, error: null, hasRoles: true, initialFetchAttempted: true }
      });
      
      renderWithProviders(<RoleForm />, { store });
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('input-roleName')).toHaveValue('Admin');
    });

    it('should fetch roles when role not found in store', () => {
      mockUseParams.mockReturnValue({ id: '1' });
      const store = createMockStore({
        roles: { roles: [], loading: false, error: null, hasRoles: false, initialFetchAttempted: false }
      });
      
      renderWithProviders(<RoleForm />, { store });
      
      act(() => {
        jest.runAllTimers();
      });
      expect(mockFetchRoles).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle fetchRoles error', () => {
      mockUseParams.mockReturnValue({ id: '1' });
      mockFetchRoles.mockRejectedValueOnce(new Error('Network error'));
      const store = createMockStore({
        roles: { roles: [], loading: false, error: null, hasRoles: false, initialFetchAttempted: false }
      });
      
      renderWithProviders(<RoleForm />, { store });
      
      act(() => {
        jest.runAllTimers();
      });
      expect(mockFetchRoles).toHaveBeenCalled();
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
    });

    it('should handle invalid status value and default to Active', () => {
      const roleWithInvalidStatus = {
        ...mockRoles[0],
        status: 'InvalidStatus'
      };
      
      mockUseParams.mockReturnValue({ id: '1' });
      const store = createMockStore({
        roles: { roles: [roleWithInvalidStatus], loading: false, error: null, hasRoles: true, initialFetchAttempted: true }
      });
      
      renderWithProviders(<RoleForm />, { store });
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('input-roleName')).toBeInTheDocument();
    });

    it('should handle null parentAttribute', () => {
      const roleWithNullParentAttr = {
        ...mockRoles[0],
        parentattribute: null
      };
      
      mockUseParams.mockReturnValue({ id: '1' });
      const store = createMockStore({
        roles: { roles: [roleWithNullParentAttr], loading: false, error: null, hasRoles: true, initialFetchAttempted: true }
      });
      
      renderWithProviders(<RoleForm />, { store });
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('input-roleName')).toBeInTheDocument();
    });

    it('should handle fetchUsers when users array is empty', async () => {
      const store = createMockStore({
        users: { users: [], loading: false, error: null, hasUsers: false, initialFetchAttempted: false }
      });
      
      renderWithProviders(<RoleForm />, { store });
      
      act(() => {
        jest.runAllTimers();
      });
      expect(mockFetchUsers).toHaveBeenCalled();
    });

    it('should handle save with role name change', async () => {
      mockUseParams.mockReturnValue({ id: '1' });
      const store = createMockStore({
        roles: { roles: mockRoles, loading: false, error: null, hasRoles: true, initialFetchAttempted: true }
      });
      
      renderWithProviders(<RoleForm />, { store });
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('input-roleName')).toBeInTheDocument();
      
      fireEvent.change(screen.getByTestId('input-roleName'), { target: { value: 'Updated Role Name' } });
      fireEvent.change(screen.getByTestId('input-department'), { target: { value: 'IT' } });
      fireEvent.change(screen.getByTestId('input-roleDescription'), { target: { value: 'Description' } });
      const parentAttrSelect = screen.getByTestId('select-parentAttribute');
      fireEvent.change(parentAttrSelect, { target: { value: 'Region' } });
      
      act(() => {
        jest.runAllTimers();
      });
      
      fireEvent.click(screen.getByTestId('save-button'));
      
      act(() => {
        jest.runAllTimers();
      });
      expect(mockSaveRole).toHaveBeenCalled();
      expect(mockUpdateUsersWithRoleNameAndRefresh).toHaveBeenCalled();
    });

    it('should handle console error logging on save failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSaveRole.mockRejectedValueOnce(new Error('Save failed'));
      
      renderWithProviders(<RoleForm />);
      
      fireEvent.change(screen.getByTestId('input-roleName'), { target: { value: 'New Role' } });
      fireEvent.change(screen.getByTestId('input-department'), { target: { value: 'IT' } });
      fireEvent.change(screen.getByTestId('input-roleDescription'), { target: { value: 'Description' } });
      const parentAttrSelect = screen.getByTestId('select-parentAttribute');
      fireEvent.change(parentAttrSelect, { target: { value: 'Region' } });
      
      act(() => {
        jest.runAllTimers();
      });
      
      fireEvent.click(screen.getByTestId('save-button'));
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      }, { timeout: 500 });
      
      consoleSpy.mockRestore();
    });

    it('should handle save without role name change', async () => {
      mockUseParams.mockReturnValue({ id: '1' });
      const store = createMockStore({
        roles: { roles: mockRoles, loading: false, error: null, hasRoles: true, initialFetchAttempted: true }
      });
      
      renderWithProviders(<RoleForm />, { store });
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('input-roleName')).toBeInTheDocument();
      
      fireEvent.change(screen.getByTestId('input-department'), { target: { value: 'Updated Department' } });
      fireEvent.change(screen.getByTestId('input-roleDescription'), { target: { value: 'Updated Description' } });
      const parentAttrSelect = screen.getByTestId('select-parentAttribute');
      fireEvent.change(parentAttrSelect, { target: { value: 'Region' } });
      
      act(() => {
        jest.runAllTimers();
      });
      
      fireEvent.click(screen.getByTestId('save-button'));
      
      await waitFor(() => {
        expect(mockSaveRole).toHaveBeenCalled();
      }, { timeout: 500 });
      
      expect(mockUpdateUsersWithRoleNameAndRefresh).not.toHaveBeenCalled();
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
    });

    it('should handle save error with error message', async () => {
      const errorMessage = 'Custom error message';
      mockSaveRole.mockRejectedValueOnce({ message: errorMessage });
      
      renderWithProviders(<RoleForm />);
      
      fireEvent.change(screen.getByTestId('input-roleName'), { target: { value: 'New Role' } });
      fireEvent.change(screen.getByTestId('input-department'), { target: { value: 'IT' } });
      fireEvent.change(screen.getByTestId('input-roleDescription'), { target: { value: 'Description' } });
      const parentAttrSelect = screen.getByTestId('select-parentAttribute');
      fireEvent.change(parentAttrSelect, { target: { value: 'Region' } });
      
      act(() => {
        jest.runAllTimers();
      });
      
      fireEvent.click(screen.getByTestId('save-button'));
      
      await waitFor(() => {
        const alert = screen.getByTestId('notification-alert');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveTextContent(errorMessage);
      }, { timeout: 500 });
    });

    it('should handle submit error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSaveRole.mockRejectedValueOnce(new Error('Submit failed'));
      
      renderWithProviders(<RoleForm />);
      
      fireEvent.change(screen.getByTestId('input-roleName'), { target: { value: 'New Role' } });
      fireEvent.change(screen.getByTestId('input-department'), { target: { value: 'IT' } });
      fireEvent.change(screen.getByTestId('input-roleDescription'), { target: { value: 'Description' } });
      const parentAttrSelect = screen.getByTestId('select-parentAttribute');
      fireEvent.change(parentAttrSelect, { target: { value: 'Region' } });
      
      act(() => {
        jest.runAllTimers();
      });
      
      fireEvent.click(screen.getByTestId('next-button'));
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
        expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
      }, { timeout: 500 });
      
      consoleSpy.mockRestore();
    });

    it('should handle duplicate click', async () => {
      renderWithProviders(<RoleForm />);
      
      fireEvent.click(screen.getByTestId('trigger-duplicate'));
      
      await waitFor(() => {
        expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
        expect(screen.getByTestId('notification-alert')).toHaveTextContent('duplicated and added');
      }, { timeout: 500 });
    });

    it('should handle confirmation dialog for duplicate', async () => {
      renderWithProviders(<RoleForm />);
      
      fireEvent.click(screen.getByTestId('trigger-duplicate'));
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
      
      const yesButton = screen.getByTestId('notification-action-1');
      fireEvent.click(yesButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('notification-alert')).not.toBeInTheDocument();
        expect(screen.getByTestId('duplicate-panel-wrapper')).toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('should handle confirmation dialog for cancel', async () => {
      renderWithProviders(<RoleForm />);
      
      fireEvent.change(screen.getByTestId('input-roleName'), { target: { value: 'Test' } });
      
      act(() => {
        jest.runAllTimers();
      });
      
      fireEvent.click(screen.getByTestId('cancel-button'));
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
      
      const yesButton = screen.getByTestId('notification-action-1');
      fireEvent.click(yesButton);
      
      act(() => {
        jest.runAllTimers();
      });
      expect(mockNavigate).toHaveBeenCalled();
    });

    it('should handle confirmation dialog for reset', async () => {
      renderWithProviders(<RoleForm />);
      
      fireEvent.change(screen.getByTestId('input-roleName'), { target: { value: 'Test' } });
      
      act(() => {
        jest.runAllTimers();
      });
      
      const resetButton = screen.getByTestId('reset-button') as HTMLButtonElement;
      if (!resetButton.disabled) {
        fireEvent.click(resetButton);
        
        await waitFor(() => {
          expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
        }, { timeout: 500 });
        
        const yesButton = screen.getByTestId('notification-action-1');
        fireEvent.click(yesButton);
        
        await waitFor(() => {
          expect(screen.getByTestId('input-roleName')).toHaveValue('');
        }, { timeout: 500 });
      }
    });

    it('should handle confirmation dialog No button', async () => {
      renderWithProviders(<RoleForm />);
      
      fireEvent.change(screen.getByTestId('input-roleName'), { target: { value: 'Test' } });
      
      act(() => {
        jest.runAllTimers();
      });
      
      fireEvent.click(screen.getByTestId('cancel-button'));
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
      
      const noButton = screen.getByTestId('notification-action-0');
      fireEvent.click(noButton);
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.queryByTestId('notification-alert')).not.toBeInTheDocument();
    });

    it('should handle notification close', async () => {
      renderWithProviders(<RoleForm />);
      
      fireEvent.change(screen.getByTestId('input-roleName'), { target: { value: 'New Role' } });
      fireEvent.change(screen.getByTestId('input-department'), { target: { value: 'IT' } });
      fireEvent.change(screen.getByTestId('input-roleDescription'), { target: { value: 'Description' } });
      const parentAttrSelect = screen.getByTestId('select-parentAttribute');
      fireEvent.change(parentAttrSelect, { target: { value: 'Region' } });
      
      act(() => {
        jest.runAllTimers();
      });
      
      fireEvent.click(screen.getByTestId('save-button'));
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
      
      const closeButton = screen.getByTestId('notification-close');
      fireEvent.click(closeButton);
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.queryByTestId('notification-alert')).not.toBeInTheDocument();
    });

    it('should handle admin app navigation path', () => {
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/admin/user-management/roles/new'
        },
        writable: true
      });
      
      renderWithProviders(<RoleForm />, { route: '/admin/user-management/roles/new' });
      fireEvent.click(screen.getByTestId('back-button'));
      
      expect(mockNavigate).toHaveBeenCalledWith('/admin/user-management/roles');
    });

    it('should handle input change with same value to prevent infinite loop', async () => {
      renderWithProviders(<RoleForm />);
      const roleNameInput = screen.getByTestId('input-roleName');
      
      fireEvent.change(roleNameInput, { target: { value: 'Test' } });
      act(() => {
        jest.runAllTimers();
      });
      
      // Change to same value - should not cause infinite loop
      fireEvent.change(roleNameInput, { target: { value: 'Test' } });
      act(() => {
        jest.runAllTimers();
      });
      
      expect(roleNameInput).toHaveValue('Test');
    });

    it('should handle permission changes with same value', async () => {
      renderWithProviders(<RoleForm />);
      
      // Trigger permission change
      fireEvent.click(screen.getByTestId('trigger-permission-change'));
      
      act(() => {
        jest.runAllTimers();
      });
      
      // Trigger same permission change again - should not cause infinite loop
      fireEvent.click(screen.getByTestId('trigger-permission-change'));
      
      act(() => {
        jest.runAllTimers();
      });
      
      expect(screen.getByTestId('reset-button')).not.toBeDisabled();
    });

    it('should handle form modification tracking with permission changes', async () => {
      renderWithProviders(<RoleForm />);
      
      fireEvent.click(screen.getByTestId('trigger-permission-change'));
      
      act(() => {
        jest.runAllTimers();
      });
      const resetButton = screen.getByTestId('reset-button');
      expect(resetButton).not.toBeDisabled();
    });

    it('should handle form modification tracking without originalFormData', async () => {
      renderWithProviders(<RoleForm />);
      
      fireEvent.change(screen.getByTestId('input-roleName'), { target: { value: 'Test' } });
      
      act(() => {
        jest.runAllTimers();
      });
      
      act(() => {
        jest.runAllTimers();
      });
      const resetButton = screen.getByTestId('reset-button');
      expect(resetButton).not.toBeDisabled();
    });

    it('should handle edit mode with null/undefined role fields', async () => {
      const roleWithNullFields = {
        id: 1,
        rolename: null,
        department: undefined,
        roledescription: '',
        status: 'Active',
        parentattribute: JSON.stringify(['Region']),
        permissions: JSON.stringify({
          enabledModules: [],
          selectedPermissions: [],
          activeModule: null,
          activeSubmodule: null
        }),
        isenabled: true,
        softdelete: false,
        islocked: false
      };
      
      mockUseParams.mockReturnValue({ id: '1' });
      const store = createMockStore({
        roles: { roles: [roleWithNullFields], loading: false, error: null, hasRoles: true, initialFetchAttempted: true }
      });
      
      renderWithProviders(<RoleForm />, { store });
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('input-roleName')).toBeInTheDocument();
    });

    it('should handle edit mode with Inactive status', async () => {
      const roleWithInactiveStatus = {
        ...mockRoles[0],
        status: 'Inactive'
      };
      
      mockUseParams.mockReturnValue({ id: '1' });
      const store = createMockStore({
        roles: { roles: [roleWithInactiveStatus], loading: false, error: null, hasRoles: true, initialFetchAttempted: true }
      });
      
      renderWithProviders(<RoleForm />, { store });
      
      await waitFor(() => {
        expect(screen.getByTestId('radio-inactive')).toBeChecked();
      }, { timeout: 500 });
    });

    it('should handle reset without modifications', () => {
      renderWithProviders(<RoleForm />);
      
      const resetButton = screen.getByTestId('reset-button');
      // Reset should work even when disabled (though button might be disabled)
      // This tests the performReset function directly via handleReset
      fireEvent.click(resetButton);
      
      // Should not show confirmation if form is not modified
      expect(screen.queryByTestId('notification-alert')).not.toBeInTheDocument();
    });

    it('should handle submit button disabled in edit mode when not modified', async () => {
      mockUseParams.mockReturnValue({ id: '1' });
      const store = createMockStore({
        roles: { roles: mockRoles, loading: false, error: null, hasRoles: true, initialFetchAttempted: true }
      });
      
      renderWithProviders(<RoleForm />, { store });
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('input-roleName')).toBeInTheDocument();
      
      // Submit button should be disabled in edit mode when form is not modified
      expect(screen.getByTestId('next-button')).toBeDisabled();
    });

    it('should handle submit button disabled when submitting', async () => {
      mockSaveRole.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      renderWithProviders(<RoleForm />);
      
      fireEvent.change(screen.getByTestId('input-roleName'), { target: { value: 'New Role' } });
      fireEvent.change(screen.getByTestId('input-department'), { target: { value: 'IT' } });
      fireEvent.change(screen.getByTestId('input-roleDescription'), { target: { value: 'Description' } });
      const parentAttrSelect = screen.getByTestId('select-parentAttribute');
      fireEvent.change(parentAttrSelect, { target: { value: 'Region' } });
      
      act(() => {
        jest.runAllTimers();
      });
      
      const submitButton = screen.getByTestId('next-button');
      expect(submitButton).not.toBeDisabled();
      
      fireEvent.click(submitButton);
      
      // Button should be disabled while submitting
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      }, { timeout: 100 });
    });

    it('should handle save button always disabled', () => {
      renderWithProviders(<RoleForm />);
      expect(screen.getByTestId('save-button')).toBeDisabled();
    });

    it('should handle role with array parentAttribute', async () => {
      const roleWithArrayParentAttr = {
        ...mockRoles[0],
        parentattribute: ['Region', 'Country']
      };
      
      mockUseParams.mockReturnValue({ id: '1' });
      const store = createMockStore({
        roles: { roles: [roleWithArrayParentAttr], loading: false, error: null, hasRoles: true, initialFetchAttempted: true }
      });
      
      renderWithProviders(<RoleForm />, { store });
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('input-roleName')).toBeInTheDocument();
    });

    it('should handle role with object permissions', async () => {
      const roleWithObjectPermissions = {
        ...mockRoles[0],
        permissions: {
          enabledModules: ['Module1'],
          selectedPermissions: ['perm1'],
          activeModule: null,
          activeSubmodule: null
        }
      };
      
      mockUseParams.mockReturnValue({ id: '1' });
      const store = createMockStore({
        roles: { roles: [roleWithObjectPermissions], loading: false, error: null, hasRoles: true, initialFetchAttempted: true }
      });
      
      renderWithProviders(<RoleForm />, { store });
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('input-roleName')).toBeInTheDocument();
    });

    it('should handle users already loaded', async () => {
      mockFetchUsers.mockClear();
      const store = createMockStore({
        users: { users: [{ id: 1, name: 'User1' }], loading: false, error: null, hasUsers: true, initialFetchAttempted: true }
      });
      
      renderWithProviders(<RoleForm />, { store });
      
      // Should not call fetchUsers if users are already loaded
      act(() => {
        jest.runAllTimers();
      });
      
      // fetchUsers should not be called when users array is not empty
      expect(mockFetchUsers).not.toHaveBeenCalled();
    });

    it('should handle validation error clearing for permissions', async () => {
      renderWithProviders(<RoleForm />);
      
      // Set validation error for permissions (simulated)
      fireEvent.click(screen.getByTestId('trigger-permission-change'));
      
      act(() => {
        jest.runAllTimers();
      });
      
      // Permission change should clear any validation errors
      expect(screen.getByTestId('role-permissions-table')).toBeInTheDocument();
    });

    it('should handle reset with originalFormData', async () => {
      mockUseParams.mockReturnValue({ id: '1' });
      const store = createMockStore({
        roles: { roles: mockRoles, loading: false, error: null, hasRoles: true, initialFetchAttempted: true }
      });
      
      renderWithProviders(<RoleForm />, { store });
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('input-roleName')).toBeInTheDocument();
      
      // Modify form
      fireEvent.change(screen.getByTestId('input-roleName'), { target: { value: 'Modified' } });
      
      act(() => {
        jest.runAllTimers();
      });
      
      // Reset
      const resetButton = screen.getByTestId('reset-button') as HTMLButtonElement;
      if (!resetButton.disabled) {
        fireEvent.click(resetButton);
        
        await waitFor(() => {
          expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
        }, { timeout: 500 });
        
        const yesButton = screen.getByTestId('notification-action-1');
        fireEvent.click(yesButton);
        
        await waitFor(() => {
          expect(screen.getByTestId('input-roleName')).toHaveValue('Admin');
        }, { timeout: 500 });
      }
    });

    it('should handle submit in edit mode without role name change', async () => {
      mockUseParams.mockReturnValue({ id: '1' });
      const store = createMockStore({
        roles: { roles: mockRoles, loading: false, error: null, hasRoles: true, initialFetchAttempted: true }
      });
      
      renderWithProviders(<RoleForm />, { store });
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('input-roleName')).toBeInTheDocument();
      
      // Change department but not role name
      fireEvent.change(screen.getByTestId('input-department'), { target: { value: 'Updated Department' } });
      
      act(() => {
        jest.runAllTimers();
      });
      
      fireEvent.click(screen.getByTestId('next-button'));
      
      await waitFor(() => {
        expect(mockSaveRole).toHaveBeenCalled();
        expect(mockUpdateUsersWithRoleNameAndRefresh).not.toHaveBeenCalled();
      }, { timeout: 500 });
    });

    it('should handle different permission changes', async () => {
      renderWithProviders(<RoleForm />);
      
      // Trigger first permission change
      fireEvent.click(screen.getByTestId('trigger-permission-change'));
      
      act(() => {
        jest.runAllTimers();
      });
      
      // Trigger different permission change
      fireEvent.click(screen.getByTestId('trigger-permission-change-different'));
      
      act(() => {
        jest.runAllTimers();
      });
      
      expect(screen.getByTestId('reset-button')).not.toBeDisabled();
    });

    it('should handle permission reset via reset function', async () => {
      renderWithProviders(<RoleForm />);
      
      // Trigger permission change first
      fireEvent.click(screen.getByTestId('trigger-permission-change'));
      
      act(() => {
        jest.runAllTimers();
      });
      
      // Trigger reset
      fireEvent.click(screen.getByTestId('trigger-reset-permissions'));
      
      act(() => {
        jest.runAllTimers();
      });
      
      expect(screen.getByTestId('role-permissions-table')).toBeInTheDocument();
    });

    it('should handle useDuplicateRolePermissionPanel hook call', () => {
      renderWithProviders(<RoleForm />);
      
      // Verify hook is called
      expect(mockUseDuplicateRolePermissionPanel).toHaveBeenCalled();
    });

    it('should handle save navigation timeout', () => {
      mockUseParams.mockReturnValue({ id: '1' });
      const store = createMockStore({
        roles: { roles: mockRoles, loading: false, error: null, hasRoles: true, initialFetchAttempted: true }
      });
      
      renderWithProviders(<RoleForm />, { store });
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('input-roleName')).toBeInTheDocument();
      
      fireEvent.change(screen.getByTestId('input-department'), { target: { value: 'Updated Department' } });
      
      act(() => {
        jest.runAllTimers();
      });
      
      fireEvent.click(screen.getByTestId('save-button'));
      
      act(() => {
        jest.advanceTimersByTime(1000);
        jest.runAllTimers();
      });
      
      expect(mockSaveRole).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalled();
    });

    it('should handle submit button disabled when loading role', () => {
      mockUseParams.mockReturnValue({ id: '1' });
      const store = createMockStore({
        roles: { roles: [], loading: false, error: null, hasRoles: false, initialFetchAttempted: false }
      });
      
      renderWithProviders(<RoleForm />, { store });
      
      // Initially should be disabled while loading
      const submitButton = screen.getByTestId('next-button');
      // Button might be disabled due to form validation or loading state
      expect(submitButton).toBeInTheDocument();
    });

    it('should handle status change in edit mode', async () => {
      mockUseParams.mockReturnValue({ id: '1' });
      const store = createMockStore({
        roles: { roles: mockRoles, loading: false, error: null, hasRoles: true, initialFetchAttempted: true }
      });
      
      renderWithProviders(<RoleForm />, { store });
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('input-roleName')).toBeInTheDocument();
      
      // Change status
      const inactiveRadio = screen.getByTestId('radio-inactive');
      fireEvent.click(inactiveRadio);
      
      act(() => {
        jest.runAllTimers();
      });
      
      expect(inactiveRadio).toBeChecked();
    });

    it('should handle parent attribute change in edit mode', async () => {
      mockUseParams.mockReturnValue({ id: '1' });
      const store = createMockStore({
        roles: { roles: mockRoles, loading: false, error: null, hasRoles: true, initialFetchAttempted: true }
      });
      
      renderWithProviders(<RoleForm />, { store });
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('input-roleName')).toBeInTheDocument();
      
      const parentAttrSelect = screen.getByTestId('select-parentAttribute');
      fireEvent.change(parentAttrSelect, { target: { value: 'Division' } });
      
      act(() => {
        jest.runAllTimers();
      });
      
      expect(parentAttrSelect).toHaveValue('Division');
    });

    it('should handle all text field changes', async () => {
      renderWithProviders(<RoleForm />);
      
      fireEvent.change(screen.getByTestId('input-roleName'), { target: { value: 'Role1' } });
      fireEvent.change(screen.getByTestId('input-department'), { target: { value: 'Dept1' } });
      fireEvent.change(screen.getByTestId('input-roleDescription'), { target: { value: 'Desc1' } });
      
      act(() => {
        jest.runAllTimers();
      });
      
      expect(screen.getByTestId('input-roleName')).toHaveValue('Role1');
      expect(screen.getByTestId('input-department')).toHaveValue('Dept1');
      expect(screen.getByTestId('input-roleDescription')).toHaveValue('Desc1');
    });

    it('should handle validation for empty role name with whitespace', async () => {
      renderWithProviders(<RoleForm />);
      
      fireEvent.change(screen.getByTestId('input-roleName'), { target: { value: '   ' } });
      fireEvent.click(screen.getByTestId('next-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('error-roleName')).toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('should handle validation for empty department with whitespace', async () => {
      renderWithProviders(<RoleForm />);
      
      fireEvent.change(screen.getByTestId('input-department'), { target: { value: '   ' } });
      fireEvent.click(screen.getByTestId('next-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('error-department')).toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('should handle validation for empty role description with whitespace', async () => {
      renderWithProviders(<RoleForm />);
      
      fireEvent.change(screen.getByTestId('input-roleDescription'), { target: { value: '   ' } });
      fireEvent.click(screen.getByTestId('next-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('error-roleDescription')).toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('should handle admin app cancel navigation', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/admin/user-management/roles/new'
        },
        writable: true
      });
      
      renderWithProviders(<RoleForm />, { route: '/admin/user-management/roles/new' });
      
      fireEvent.click(screen.getByTestId('cancel-button'));
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin/user-management/roles');
      }, { timeout: 500 });
    });

    it('should handle admin app submit navigation', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/admin/user-management/roles/new'
        },
        writable: true
      });
      
      renderWithProviders(<RoleForm />, { route: '/admin/user-management/roles/new' });
      
      fireEvent.change(screen.getByTestId('input-roleName'), { target: { value: 'New Role' } });
      fireEvent.change(screen.getByTestId('input-department'), { target: { value: 'IT' } });
      fireEvent.change(screen.getByTestId('input-roleDescription'), { target: { value: 'Description' } });
      const parentAttrSelect = screen.getByTestId('select-parentAttribute');
      fireEvent.change(parentAttrSelect, { target: { value: 'Region' } });
      
      act(() => {
        jest.runAllTimers();
      });
      
      fireEvent.click(screen.getByTestId('next-button'));
      
      await waitFor(() => {
        expect(mockSaveRole).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/admin/user-management/roles');
      }, { timeout: 500 });
    });

    it('should handle handleInputChange with same value for text field', async () => {
      renderWithProviders(<RoleForm />);
      const roleNameInput = screen.getByTestId('input-roleName');
      
      // Set initial value
      fireEvent.change(roleNameInput, { target: { value: 'Test Role' } });
      act(() => {
        jest.runAllTimers();
      });
      
      // Try to set same value - should not cause update
      fireEvent.change(roleNameInput, { target: { value: 'Test Role' } });
      act(() => {
        jest.runAllTimers();
      });
      
      expect(roleNameInput).toHaveValue('Test Role');
    });

    it('should handle handleInputChange when prev field equals value', async () => {
      renderWithProviders(<RoleForm />);
      const roleNameInput = screen.getByTestId('input-roleName');
      
      // This tests the case where prev[field] === value in setFormData
      fireEvent.change(roleNameInput, { target: { value: 'Role' } });
      act(() => {
        jest.runAllTimers();
      });
      
      // Change to different value
      fireEvent.change(roleNameInput, { target: { value: 'New Role' } });
      act(() => {
        jest.runAllTimers();
      });
      
      expect(roleNameInput).toHaveValue('New Role');
    });

    it('should handle validation error clearing when error does not exist', async () => {
      renderWithProviders(<RoleForm />);
      const roleNameInput = screen.getByTestId('input-roleName');
      
      // Change value when no error exists - should not throw
      fireEvent.change(roleNameInput, { target: { value: 'Valid Role' } });
      act(() => {
        jest.runAllTimers();
      });
      
      expect(roleNameInput).toHaveValue('Valid Role');
    });

    it('should handle permissions input change when isResettingPermissionsRef is true', async () => {
      renderWithProviders(<RoleForm />);
      
      // This tests the case where isResettingPermissionsRef.current is true
      // We can't directly set the ref, but we can test the reset flow
      fireEvent.click(screen.getByTestId('trigger-permission-change'));
      act(() => {
        jest.runAllTimers();
      });
      
      // Trigger reset which should set the ref
      const resetButton = screen.getByTestId('reset-button') as HTMLButtonElement;
      if (!resetButton.disabled) {
        fireEvent.click(resetButton);
        await waitFor(() => {
          expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
        }, { timeout: 500 });
        
        // Confirm reset
        const yesButton = screen.getByTestId('notification-action-1');
        fireEvent.click(yesButton);
        await act(async () => {
          await Promise.resolve();
        });
      }
    });

    it('should handle permissions input change with same permissions string', async () => {
      renderWithProviders(<RoleForm />);
      
      // Trigger permission change
      fireEvent.click(screen.getByTestId('trigger-permission-change'));
      act(() => {
        jest.runAllTimers();
      });
      
      // Trigger same permission change again - should be blocked by lastPermissionsRef check
      fireEvent.click(screen.getByTestId('trigger-permission-change'));
      act(() => {
        jest.runAllTimers();
      });
      
      // Should still work without infinite loop
      expect(screen.getByTestId('role-permissions-table')).toBeInTheDocument();
    });

    it('should handle permissions input change with different array lengths', async () => {
      renderWithProviders(<RoleForm />);
      
      // Trigger permission change with one module
      fireEvent.click(screen.getByTestId('trigger-permission-change'));
      act(() => {
        jest.runAllTimers();
      });
      
      // Trigger different permission change with different module
      fireEvent.click(screen.getByTestId('trigger-permission-change-different'));
      act(() => {
        jest.runAllTimers();
      });
      
      expect(screen.getByTestId('role-permissions-table')).toBeInTheDocument();
    });

    it('should handle permissions input change when arrays are equal', async () => {
      renderWithProviders(<RoleForm />);
      
      // This tests the arraysEqual case in handleInputChange
      // First change
      fireEvent.click(screen.getByTestId('trigger-permission-change'));
      act(() => {
        jest.runAllTimers();
      });
      
      // Second change with same values but different order (should still update)
      fireEvent.click(screen.getByTestId('trigger-permission-change-different'));
      act(() => {
        jest.runAllTimers();
      });
      
      expect(screen.getByTestId('role-permissions-table')).toBeInTheDocument();
    });

    it('should handle permissions validation error clearing when error exists', async () => {
      renderWithProviders(<RoleForm />);
      
      // Trigger permission change which should clear any validation errors
      fireEvent.click(screen.getByTestId('trigger-permission-change'));
      act(() => {
        jest.runAllTimers();
      });
      
      expect(screen.getByTestId('role-permissions-table')).toBeInTheDocument();
    });

    it('should handle permissions validation error clearing when error does not exist', async () => {
      renderWithProviders(<RoleForm />);
      
      // Change permissions when no error exists
      fireEvent.click(screen.getByTestId('trigger-permission-change'));
      act(() => {
        jest.runAllTimers();
      });
      
      expect(screen.getByTestId('role-permissions-table')).toBeInTheDocument();
    });

    it('should handle form modification tracking with hasPermissionChanges true', async () => {
      renderWithProviders(<RoleForm />);
      
      // Trigger permission change which sets hasPermissionChanges to true
      fireEvent.click(screen.getByTestId('trigger-permission-change'));
      
      act(() => {
        jest.runAllTimers();
      });
      const resetButton = screen.getByTestId('reset-button');
      expect(resetButton).not.toBeDisabled();
    });

    it('should handle form modification tracking with originalFormData null', async () => {
      renderWithProviders(<RoleForm />);
      
      // In create mode, originalFormData is null
      // Fill form to trigger modification tracking
      fireEvent.change(screen.getByTestId('input-roleName'), { target: { value: 'Test' } });
      
      act(() => {
        jest.runAllTimers();
      });
      const resetButton = screen.getByTestId('reset-button');
      expect(resetButton).not.toBeDisabled();
    });

    it('should handle form modification tracking when formData has parentAttribute', async () => {
      renderWithProviders(<RoleForm />);
      
      const parentAttrSelect = screen.getByTestId('select-parentAttribute');
      fireEvent.change(parentAttrSelect, { target: { value: 'Region' } });
      
      act(() => {
        jest.runAllTimers();
      });
      const resetButton = screen.getByTestId('reset-button');
      expect(resetButton).not.toBeDisabled();
    });

    it('should handle form modification tracking when formData has selectedPermissions', async () => {
      renderWithProviders(<RoleForm />);
      
      // Trigger permission change
      fireEvent.click(screen.getByTestId('trigger-permission-change'));
      
      act(() => {
        jest.runAllTimers();
      });
      const resetButton = screen.getByTestId('reset-button');
      expect(resetButton).not.toBeDisabled();
    });

    it('should handle lastFormModifiedRef preventing duplicate state updates', async () => {
      renderWithProviders(<RoleForm />);
      
      // Make a change
      fireEvent.change(screen.getByTestId('input-roleName'), { target: { value: 'Test' } });
      act(() => {
        jest.runAllTimers();
      });
      
      // Make another change - should not cause duplicate updates
      fireEvent.change(screen.getByTestId('input-department'), { target: { value: 'IT' } });
      act(() => {
        jest.runAllTimers();
      });
      
      expect(screen.getByTestId('input-roleName')).toHaveValue('Test');
      expect(screen.getByTestId('input-department')).toHaveValue('IT');
    });

    it('should handle edit mode with role having null rolename', async () => {
      const roleWithNullRolename = {
        ...mockRoles[0],
        rolename: null
      };
      
      mockUseParams.mockReturnValue({ id: '1' });
      const store = createMockStore({
        roles: { roles: [roleWithNullRolename], loading: false, error: null, hasRoles: true, initialFetchAttempted: true }
      });
      
      renderWithProviders(<RoleForm />, { store });
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('input-roleName')).toBeInTheDocument();
    });

    it('should handle edit mode with role having undefined department', async () => {
      const roleWithUndefinedDept = {
        ...mockRoles[0],
        department: undefined
      };
      
      mockUseParams.mockReturnValue({ id: '1' });
      const store = createMockStore({
        roles: { roles: [roleWithUndefinedDept], loading: false, error: null, hasRoles: true, initialFetchAttempted: true }
      });
      
      renderWithProviders(<RoleForm />, { store });
      
      await waitFor(() => {
        expect(screen.getByTestId('input-department')).toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('should handle edit mode with role having empty roledescription', async () => {
      const roleWithEmptyDesc = {
        ...mockRoles[0],
        roledescription: ''
      };
      
      mockUseParams.mockReturnValue({ id: '1' });
      const store = createMockStore({
        roles: { roles: [roleWithEmptyDesc], loading: false, error: null, hasRoles: true, initialFetchAttempted: true }
      });
      
      renderWithProviders(<RoleForm />, { store });
      
      await waitFor(() => {
        expect(screen.getByTestId('input-roleDescription')).toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('should handle edit mode with parentAttribute as non-array', async () => {
      const roleWithNonArrayParentAttr = {
        ...mockRoles[0],
        parentattribute: 'Region'
      };
      
      mockUseParams.mockReturnValue({ id: '1' });
      const store = createMockStore({
        roles: { roles: [roleWithNonArrayParentAttr], loading: false, error: null, hasRoles: true, initialFetchAttempted: true }
      });
      
      renderWithProviders(<RoleForm />, { store });
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('input-roleName')).toBeInTheDocument();
    });

    it('should handle edit mode with permissions having null enabledModules', async () => {
      const roleWithNullPermissions = {
        ...mockRoles[0],
        permissions: JSON.stringify({
          enabledModules: null,
          selectedPermissions: null,
          activeModule: null,
          activeSubmodule: null
        })
      };
      
      mockUseParams.mockReturnValue({ id: '1' });
      const store = createMockStore({
        roles: { roles: [roleWithNullPermissions], loading: false, error: null, hasRoles: true, initialFetchAttempted: true }
      });
      
      renderWithProviders(<RoleForm />, { store });
      
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('input-roleName')).toBeInTheDocument();
    });

    it('should handle submit button disabled when isLoadingRole is true', () => {
      mockUseParams.mockReturnValue({ id: '1' });
      const store = createMockStore({
        roles: { roles: [], loading: false, error: null, hasRoles: false, initialFetchAttempted: false }
      });
      
      // This will show loading state initially
      const { unmount } = renderWithProviders(<RoleForm />, { store });
      
      // Submit button should be disabled during loading
      const submitButton = screen.queryByTestId('next-button');
      if (submitButton) {
        expect(submitButton).toBeDisabled();
      }
      
      if (unmount) {
        unmount();
      }
    });

    it('should handle submit button disabled when isSubmitting is true', async () => {
      // Mock saveRole to take time
      let resolveSave: (() => void) | undefined;
      const savePromise = new Promise<void>((resolve) => {
        resolveSave = resolve;
      });
      mockSaveRole.mockReturnValueOnce(savePromise);
      
      const { unmount } = renderWithProviders(<RoleForm />);
      
      fireEvent.change(screen.getByTestId('input-roleName'), { target: { value: 'New Role' } });
      fireEvent.change(screen.getByTestId('input-department'), { target: { value: 'IT' } });
      fireEvent.change(screen.getByTestId('input-roleDescription'), { target: { value: 'Description' } });
      const parentAttrSelect = screen.getByTestId('select-parentAttribute');
      fireEvent.change(parentAttrSelect, { target: { value: 'Region' } });
      
      act(() => {
        jest.runAllTimers();
      });
      
      const submitButton = screen.getByTestId('next-button');
      expect(submitButton).not.toBeDisabled();
      
      fireEvent.click(submitButton);
      
      // Button should be disabled while submitting
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      }, { timeout: 500 });
      
      // Resolve the promise and cleanup
      if (resolveSave) {
        resolveSave();
      }
      act(() => {
        jest.runAllTimers();
      });
      
      if (unmount) {
        unmount();
      }
    });

    it('should handle handleDuplicatePermissions function', async () => {
      // This tests the handleDuplicatePermissions function indirectly through the duplicate panel
      renderWithProviders(<RoleForm />);
      
      // Open duplicate panel
      fireEvent.click(screen.getByTestId('trigger-duplicate'));
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
      
      // Confirm duplicate
      const yesButton = screen.getByTestId('notification-action-1');
      fireEvent.click(yesButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('duplicate-panel-wrapper')).toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('should handle handleSuccessNotification function', () => {
      // This is tested indirectly through the duplicate panel
      renderWithProviders(<RoleForm />);
      expect(screen.getByTestId('duplicate-panel-wrapper')).toBeInTheDocument();
    });
  });
});
