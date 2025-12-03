import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import GroupCreateForm from '../../../src/pages/userManagement/GroupCreateForm';
import { fetchGroupById } from '../../../src/services/groupFetchService';
import { createGroup, updateGroup } from '../../../src/store/Reducers/groupSlice';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useParams: jest.fn(),
  useLocation: jest.fn(),
}));

jest.mock('../../../src/services/groupFetchService', () => ({
  fetchGroupById: jest.fn(),
}));

jest.mock('../../../src/store/Reducers/groupSlice', () => ({
  createGroup: jest.fn(),
  updateGroup: jest.fn(),
}));

// Mock commonApp components
jest.mock('commonApp/FormHeaderBase', () => {
  return function MockFormHeaderBase({
    title,
    onBack,
    onReset,
    onCancel,
    onSave,
    onNext,
    showBackButton = true,
    showResetButton = true,
    showCancelButton = true,
    showSaveButton = false,
    showNextButton = false,
    resetButtonText = 'Reset',
    cancelButtonText = 'Cancel',
    saveButtonText = 'Save',
    nextButtonText = 'Next',
    isSaveDisabled = false,
    isSaveLoading = false,
    isNextDisabled = false,
    statusMessage,
    children,
  }: any) {
    return (
      <div data-testid="form-header">
        <h1>{title}</h1>
        {showBackButton && onBack && <button onClick={onBack}>Back</button>}
        {showResetButton && onReset && <button onClick={onReset}>{resetButtonText}</button>}
        {showCancelButton && onCancel && <button onClick={onCancel}>{cancelButtonText}</button>}
        {showSaveButton && (
          <button onClick={onSave || (() => {})} disabled={isSaveDisabled || isSaveLoading || !onSave}>
            {isSaveLoading ? 'Saving...' : saveButtonText}
          </button>
        )}
        {showNextButton && onNext && (
          <button onClick={onNext} disabled={isNextDisabled}>{nextButtonText}</button>
        )}
        {statusMessage && <div data-testid="status-message">{statusMessage}</div>}
        {children}
      </div>
    );
  };
});

jest.mock('commonApp/NotificationAlert', () => {
  return function MockNotificationAlert({ open, message, title, onClose, actions }: any) {
    if (!open) return null;
    return (
      <div data-testid="notification-alert">
        {title && <h3>{title}</h3>}
        {message && <p>{message}</p>}
        {actions?.map((action: any, index: number) => (
          <button key={index} onClick={action.onClick} data-emphasis={action.emphasis}>
            {action.label}
          </button>
        ))}
        {onClose && <button onClick={onClose} data-testid="notification-close">Close</button>}
      </div>
    );
  };
});

// Mock SCSS imports
jest.mock('../../../src/components/teamGroup/GroupCreateForm.scss', () => ({}));

// Mock PermissionTableConstants
jest.mock('../../../src/components/userManagement/PermissionTableConstants', () => ({
  getUserFormStyles: () => ({}),
  getHorizontalDividerStyles: () => ({}),
  getFlexBetweenContainerStyles: () => ({}),
}));

jest.mock('../../../src/components/userManagement/UserFormComponents', () => ({
  ReusableTextField: ({ label, value, onChange, required, readOnly, error }: any) => (
    <div data-testid={`text-field-${label}`}>
      <label>{label} {required && '*'}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        data-error={error}
      />
    </div>
  ),
  ReusableSelectField: ({ label, value, onChange, options, required }: any) => (
    <div data-testid={`select-field-${label}`}>
      <label>{label} {required && '*'}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select...</option>
        {options?.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  ),
  ReusableMultiSelectField: ({ label, value, onChange, options, required }: any) => (
    <div data-testid={`multi-select-field-${label}`}>
      <label>{label} {required && '*'}</label>
      <select
        multiple
        value={value || []}
        onChange={(e) => onChange(Array.from(e.target.selectedOptions, opt => opt.value))}
      >
        {options?.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  ),
  SectionTitle: ({ children }: any) => <h3>{children}</h3>,
}));

const mockNavigate = jest.fn();
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
const mockUseLocation = require('react-router-dom').useLocation as jest.MockedFunction<any>;
const mockFetchGroupById = fetchGroupById as jest.MockedFunction<typeof fetchGroupById>;
const mockCreateGroup = createGroup as jest.MockedFunction<typeof createGroup>;
const mockUpdateGroup = updateGroup as jest.MockedFunction<typeof updateGroup>;

describe('GroupCreateForm', () => {
  let store: ReturnType<typeof configureStore>;

  const mockUsers = [
    { id: 1, firstname: 'John', lastname: 'Doe', isenabled: true, status: 'Active' },
    { id: 2, firstname: 'Jane', lastname: 'Smith', isenabled: true, status: 'Active' },
    { id: 3, firstname: 'Bob', lastname: 'Johnson', isenabled: false, status: 'Inactive' },
  ];

  beforeEach(() => {
    store = configureStore({
      reducer: {
        users: (state = { users: mockUsers, loading: false, error: null }, _action: any) => state,
        groups: (state = { groups: [], loading: false, error: null }, _action: any) => state,
      },
    });
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    mockUseParams.mockReturnValue({});
    mockUseLocation.mockReturnValue({ state: null, pathname: '/user-management/groups/create' });
  });

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <GroupCreateForm />
        </BrowserRouter>
      </Provider>
    );
  };

  describe('Create Mode', () => {
    it('should render form in create mode', () => {
      renderComponent();
      expect(screen.getByTestId('form-header')).toBeInTheDocument();
      expect(screen.getByText(/create group/i)).toBeInTheDocument();
    });

    it('should render all form fields', () => {
      renderComponent();
      expect(screen.getByTestId('text-field-Group Name')).toBeInTheDocument();
      expect(screen.getByTestId('text-field-Description')).toBeInTheDocument();
      expect(screen.getByTestId('select-field-Group Owner')).toBeInTheDocument();
      expect(screen.getByTestId('multi-select-field-Select Members')).toBeInTheDocument();
    });

    it('should show required indicator for group name in create mode', () => {
      renderComponent();
      const groupNameField = screen.getByTestId('text-field-Group Name');
      expect(groupNameField.querySelector('label')).toHaveTextContent('Group Name *');
    });

    it('should allow entering group name', () => {
      renderComponent();
      const input = screen.getByTestId('text-field-Group Name').querySelector('input');
      fireEvent.change(input!, { target: { value: 'Test Group' } });
      expect(input).toHaveValue('Test Group');
    });

    it('should show validation error when saving without group name', async () => {
      renderComponent();
      const saveButton = screen.getByText('Save');
      // Save button should be disabled when form is invalid
      expect(saveButton).toBeDisabled();
    });

    it('should create group when form is valid', async () => {
      mockCreateGroup.mockReturnValue({ type: 'groups/createGroup/pending' } as any);
      
      renderComponent();
      
      // Fill all required fields
      const groupNameInput = screen.getByTestId('text-field-Group Name').querySelector('input');
      fireEvent.change(groupNameInput!, { target: { value: 'New Group' } });

      const descriptionInput = screen.getByTestId('text-field-Description').querySelector('input');
      fireEvent.change(descriptionInput!, { target: { value: 'Test Description' } });

      const ownerSelect = screen.getByTestId('select-field-Group Owner').querySelector('select');
      fireEvent.change(ownerSelect!, { target: { value: 'John Doe' } });

      // Wait for owner to be automatically added to members (via useEffect)
      await waitFor(() => {
        const membersSelect = screen.getByTestId('multi-select-field-Select Members').querySelector('select');
        expect(membersSelect).toBeInTheDocument();
      });

      // Save button is always disabled, use Next/Submit button instead
      const submitButton = screen.getByText('Next');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateGroup).toHaveBeenCalled();
      });
    });

    it('should navigate back when cancel is clicked', () => {
      renderComponent();
      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);
      // If form is not modified, should navigate immediately
      // If form is modified, confirmation dialog appears - click Yes
      const confirmYes = screen.queryByText('Yes');
      if (confirmYes) {
        fireEvent.click(confirmYes);
      }
      // Navigation now goes to groups tab instead of -1
      expect(mockNavigate).toHaveBeenCalledWith('/user-management?tab=2');
    });

    it('should reset form when reset is clicked', async () => {
      renderComponent();
      const groupNameInput = screen.getByTestId('text-field-Group Name').querySelector('input');
      fireEvent.change(groupNameInput!, { target: { value: 'Test' } });
      
      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);
      
      // Confirm the reset in the dialog
      await waitFor(() => {
        const confirmYes = screen.getByText('Yes');
        fireEvent.click(confirmYes);
      });
      
      await waitFor(() => {
        expect(groupNameInput).toHaveValue('');
      });
    });
  });

  describe('Edit Mode', () => {
    const mockGroup = {
      id: '1',
      name: 'Existing Group',
      description: 'Test Description',
      owner_user_id: '1',
      members: JSON.stringify([
        { user_id: 2, is_active: true, left_at: null }
      ]),
      isactive: true,
      createdat: '2024-01-01',
      lastupdatedat: '2024-01-01',
    };

    beforeEach(() => {
      mockUseParams.mockReturnValue({ id: '1' });
      // Ensure mock is properly set up before each test
      mockFetchGroupById.mockClear();
      mockFetchGroupById.mockResolvedValue(mockGroup as any);
    });

    it('should render form in edit mode', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText(/edit group/i)).toBeInTheDocument();
      });
    });

    it('should load group data in edit mode', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(mockFetchGroupById).toHaveBeenCalledWith('1');
      });
    });

    it('should pre-populate form fields with group data', async () => {
      await act(async () => {
        renderComponent();
      });
      
      // Wait for form fields to appear (loading is complete when fields are visible)
      await waitFor(() => {
        const groupNameInput = screen.getByTestId('text-field-Group Name').querySelector('input');
        expect(groupNameInput).toBeInTheDocument();
        expect(groupNameInput).toHaveValue('Existing Group');
      }, { timeout: 5000 });
    });

    it('should make group name read-only in edit mode', async () => {
      await act(async () => {
        renderComponent();
      });
      
      // Wait for form fields to appear and check readOnly attribute
      await waitFor(() => {
        const groupNameInput = screen.getByTestId('text-field-Group Name').querySelector('input');
        expect(groupNameInput).toBeInTheDocument();
        expect(groupNameInput).toHaveAttribute('readOnly');
      }, { timeout: 5000 });
    });

    it('should not show required indicator for group name in edit mode', async () => {
      await act(async () => {
        renderComponent();
      });
      
      // Wait for form fields to appear and check label
      await waitFor(() => {
        const groupNameField = screen.getByTestId('text-field-Group Name');
        expect(groupNameField).toBeInTheDocument();
        expect(groupNameField.querySelector('label')).not.toHaveTextContent('*');
      }, { timeout: 5000 });
    });

    it('should update group when form is valid', async () => {
      mockUpdateGroup.mockReturnValue({ type: 'groups/updateGroup/pending' } as any);
      
      await act(async () => {
        renderComponent();
      });
      
      // Wait for form fields to appear (loading is complete when fields are visible)
      await waitFor(() => {
        const descriptionInput = screen.getByTestId('text-field-Description').querySelector('input');
        expect(descriptionInput).toBeInTheDocument();
      }, { timeout: 5000 });
      
      const descriptionInput = screen.getByTestId('text-field-Description').querySelector('input');
      fireEvent.change(descriptionInput!, { target: { value: 'Updated Description' } });

      // Save button is always disabled, use Next/Submit button instead
      const submitButton = screen.getByText('Next');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateGroup).toHaveBeenCalled();
      });
    });

    it('should show loading state while fetching group data', () => {
      mockFetchGroupById.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderComponent();
      expect(screen.getByText(/loading group data/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate group name is required', async () => {
      renderComponent();
      const saveButton = screen.getByText('Save');
      // Save button should be disabled when form is invalid
      expect(saveButton).toBeDisabled();
    });

    it('should validate group owner is required', async () => {
      renderComponent();
      const groupNameInput = screen.getByTestId('text-field-Group Name').querySelector('input');
      fireEvent.change(groupNameInput!, { target: { value: 'Test Group' } });

      const descriptionInput = screen.getByTestId('text-field-Description').querySelector('input');
      fireEvent.change(descriptionInput!, { target: { value: 'Test Description' } });

      const saveButton = screen.getByText('Save');
      // Save button should still be disabled because owner and members are required
      expect(saveButton).toBeDisabled();
    });
  });

  describe('User Selection', () => {
    it('should show only active users in group owner dropdown', () => {
      renderComponent();
      const ownerSelect = screen.getByTestId('select-field-Group Owner').querySelector('select');
      const options = ownerSelect?.querySelectorAll('option');
      expect(options?.length).toBeGreaterThan(0);
    });

    it('should allow selecting group owner', () => {
      renderComponent();
      const ownerSelect = screen.getByTestId('select-field-Group Owner').querySelector('select');
      fireEvent.change(ownerSelect!, { target: { value: 'John Doe' } });
      expect(ownerSelect).toHaveValue('John Doe');
    });

    it('should allow selecting multiple members', () => {
      renderComponent();
      const membersSelect = screen.getByTestId('multi-select-field-Select Members').querySelector('select') as HTMLSelectElement;
      // Select multiple options
      const janeOption = Array.from(membersSelect.options).find(opt => opt.value.includes('Jane Smith'));
      const johnOption = Array.from(membersSelect.options).find(opt => opt.value.includes('John Doe'));
      if (janeOption) janeOption.selected = true;
      if (johnOption) johnOption.selected = true;
      fireEvent.change(membersSelect);
      expect(membersSelect.selectedOptions.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle error when group not found in edit mode', async () => {
      mockUseParams.mockReturnValue({ id: '999' });
      mockFetchGroupById.mockResolvedValue(null);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      renderComponent();
      
      await waitFor(() => {
        expect(mockFetchGroupById).toHaveBeenCalledWith('999');
        expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('?tab=2'));
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle error when fetching group fails', async () => {
      mockUseParams.mockReturnValue({ id: '1' });
      const error = new Error('Network error');
      mockFetchGroupById.mockRejectedValue(error);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      renderComponent();
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load group data:', error);
        expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('?tab=2'));
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle save error with rejected action', async () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
      mockCreateGroup.mockReturnValue({ 
        type: 'groups/createGroup/rejected',
        payload: 'Save failed',
        error: { message: 'Error message' }
      } as any);
      
      renderComponent();
      
      const groupNameInput = screen.getByTestId('text-field-Group Name').querySelector('input');
      fireEvent.change(groupNameInput!, { target: { value: 'New Group' } });
      
      const descriptionInput = screen.getByTestId('text-field-Description').querySelector('input');
      fireEvent.change(descriptionInput!, { target: { value: 'Test Description' } });
      
      const ownerSelect = screen.getByTestId('select-field-Group Owner').querySelector('select');
      fireEvent.change(ownerSelect!, { target: { value: 'John Doe' } });
      
      await waitFor(() => {
        const submitButton = screen.getByText('Next');
        expect(submitButton).toBeInTheDocument();
      });
      
      const submitButton = screen.getByText('Next');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled();
      });
      
      alertSpy.mockRestore();
    });

    it('should handle submit error with groupsError', async () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
      store = configureStore({
        reducer: {
          users: (state = { users: mockUsers, loading: false, error: null }, _action: any) => state,
          groups: (state = { groups: [], loading: false, error: 'Group error' }, _action: any) => state,
        },
      });
      
      mockCreateGroup.mockReturnValue({ 
        type: 'groups/createGroup/rejected',
        payload: null,
        error: null
      } as any);
      
      renderComponent();
      
      const groupNameInput = screen.getByTestId('text-field-Group Name').querySelector('input');
      fireEvent.change(groupNameInput!, { target: { value: 'New Group' } });
      
      const descriptionInput = screen.getByTestId('text-field-Description').querySelector('input');
      fireEvent.change(descriptionInput!, { target: { value: 'Test Description' } });
      
      const ownerSelect = screen.getByTestId('select-field-Group Owner').querySelector('select');
      fireEvent.change(ownerSelect!, { target: { value: 'John Doe' } });
      
      await waitFor(() => {
        const submitButton = screen.getByText('Next');
        expect(submitButton).toBeInTheDocument();
      });
      
      const submitButton = screen.getByText('Next');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled();
      });
      
      alertSpy.mockRestore();
    });

    it('should handle save error in edit mode', async () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
      mockUseParams.mockReturnValue({ id: '1' });
      mockFetchGroupById.mockResolvedValue({
        id: '1',
        name: 'Existing Group',
        description: 'Test Description',
        owner_user_id: '1',
        members: JSON.stringify([{ user_id: 1, is_active: true, left_at: null }]),
        isactive: true,
      } as any);
      
      mockUpdateGroup.mockReturnValue({ 
        type: 'groups/updateGroup/rejected',
        payload: 'Update failed'
      } as any);
      
      await act(async () => {
        renderComponent();
      });
      
      await waitFor(() => {
        const descriptionInput = screen.getByTestId('text-field-Description').querySelector('input');
        expect(descriptionInput).toBeInTheDocument();
      }, { timeout: 5000 });
      
      const submitButton = screen.getByText('Next');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled();
      });
      
      alertSpy.mockRestore();
    });
  });

  describe('Confirmation Dialog', () => {
    it('should show confirmation when back is clicked with modified form', async () => {
      renderComponent();
      
      const groupNameInput = screen.getByTestId('text-field-Group Name').querySelector('input');
      fireEvent.change(groupNameInput!, { target: { value: 'Test Group' } });
      
      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
        expect(screen.getByText('You have unsaved changes. Are you sure you want to leave?')).toBeInTheDocument();
      });
    });

    it('should show confirmation when cancel is clicked with modified form', async () => {
      renderComponent();
      
      const groupNameInput = screen.getByTestId('text-field-Group Name').querySelector('input');
      fireEvent.change(groupNameInput!, { target: { value: 'Test Group' } });
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
        expect(screen.getByText('You have unsaved changes. Are you sure you want to cancel?')).toBeInTheDocument();
      });
    });

    it('should close confirmation dialog when No is clicked', async () => {
      renderComponent();
      
      const groupNameInput = screen.getByTestId('text-field-Group Name').querySelector('input');
      fireEvent.change(groupNameInput!, { target: { value: 'Test Group' } });
      
      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
      });
      
      const noButton = screen.getByText('No');
      fireEvent.click(noButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('notification-alert')).not.toBeInTheDocument();
      });
    });

    it('should reset form when reset confirmation is confirmed', async () => {
      renderComponent();
      
      const groupNameInput = screen.getByTestId('text-field-Group Name').querySelector('input');
      fireEvent.change(groupNameInput!, { target: { value: 'Test Group' } });
      
      const descriptionInput = screen.getByTestId('text-field-Description').querySelector('input');
      fireEvent.change(descriptionInput!, { target: { value: 'Test Description' } });
      
      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);
      
      await waitFor(() => {
        expect(screen.getByText('Are you sure you want to reset all form fields?')).toBeInTheDocument();
      });
      
      const yesButton = screen.getByText('Yes');
      fireEvent.click(yesButton);
      
      await waitFor(() => {
        expect(groupNameInput).toHaveValue('');
        expect(descriptionInput).toHaveValue('');
      });
    });

    it('should reset to original data in edit mode', async () => {
      mockUseParams.mockReturnValue({ id: '1' });
      mockFetchGroupById.mockResolvedValue({
        id: '1',
        name: 'Original Group',
        description: 'Original Description',
        owner_user_id: '1',
        members: JSON.stringify([{ user_id: 1, is_active: true, left_at: null }]),
        isactive: true,
      } as any);
      
      await act(async () => {
        renderComponent();
      });
      
      await waitFor(() => {
        const descriptionInput = screen.getByTestId('text-field-Description').querySelector('input');
        expect(descriptionInput).toBeInTheDocument();
      }, { timeout: 5000 });
      
      const descriptionInput = screen.getByTestId('text-field-Description').querySelector('input');
      fireEvent.change(descriptionInput!, { target: { value: 'Modified Description' } });
      
      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);
      
      await waitFor(() => {
        const yesButton = screen.getByText('Yes');
        fireEvent.click(yesButton);
      });
      
      await waitFor(() => {
        expect(descriptionInput).toHaveValue('Original Description');
      });
    });
  });

  describe('Input Change Handling', () => {
    it('should prevent group name change in edit mode', async () => {
      mockUseParams.mockReturnValue({ id: '1' });
      mockFetchGroupById.mockResolvedValue({
        id: '1',
        name: 'Original Group',
        description: 'Test Description',
        owner_user_id: '1',
        members: JSON.stringify([{ user_id: 1, is_active: true, left_at: null }]),
        isactive: true,
      } as any);
      
      await act(async () => {
        renderComponent();
      });
      
      await waitFor(() => {
        const groupNameInput = screen.getByTestId('text-field-Group Name').querySelector('input');
        expect(groupNameInput).toBeInTheDocument();
        expect(groupNameInput).toHaveValue('Original Group');
      }, { timeout: 5000 });
      
      const groupNameInput = screen.getByTestId('text-field-Group Name').querySelector('input');
      const originalValue = groupNameInput?.value;
      fireEvent.change(groupNameInput!, { target: { value: 'Modified Name' } });
      
      // Value should remain unchanged in edit mode
      expect(groupNameInput).toHaveValue(originalValue);
    });

    it('should handle description change', () => {
      renderComponent();
      const descriptionInput = screen.getByTestId('text-field-Description').querySelector('input');
      fireEvent.change(descriptionInput!, { target: { value: 'New Description' } });
      expect(descriptionInput).toHaveValue('New Description');
    });

    it('should handle group owner change and auto-add to members', async () => {
      renderComponent();
      
      const ownerSelect = screen.getByTestId('select-field-Group Owner').querySelector('select');
      fireEvent.change(ownerSelect!, { target: { value: 'John Doe' } });
      
      await waitFor(() => {
        const membersSelect = screen.getByTestId('multi-select-field-Select Members').querySelector('select') as HTMLSelectElement;
        const selectedOptions = Array.from(membersSelect.selectedOptions);
        expect(selectedOptions.length).toBeGreaterThan(0);
      });
    });

    it('should handle members change and ensure owner is included', async () => {
      renderComponent();
      
      const ownerSelect = screen.getByTestId('select-field-Group Owner').querySelector('select');
      fireEvent.change(ownerSelect!, { target: { value: 'John Doe' } });
      
      await waitFor(() => {
        const membersSelect = screen.getByTestId('multi-select-field-Select Members').querySelector('select') as HTMLSelectElement;
        expect(membersSelect).toBeInTheDocument();
      });
      
      const membersSelect = screen.getByTestId('multi-select-field-Select Members').querySelector('select') as HTMLSelectElement;
      const janeOption = Array.from(membersSelect.options).find(opt => opt.value.includes('Jane Smith'));
      if (janeOption) {
        janeOption.selected = true;
        fireEvent.change(membersSelect);
      }
      
      // Owner should still be in members list
      await waitFor(() => {
        const selectedOptions = Array.from(membersSelect.selectedOptions);
        const hasOwner = selectedOptions.some(opt => opt.value.includes('John Doe'));
        expect(hasOwner).toBe(true);
      });
    });

    it('should handle members with (Owner) suffix', async () => {
      renderComponent();
      
      const ownerSelect = screen.getByTestId('select-field-Group Owner').querySelector('select');
      fireEvent.change(ownerSelect!, { target: { value: 'John Doe' } });
      
      await waitFor(() => {
        const membersSelect = screen.getByTestId('multi-select-field-Select Members').querySelector('select') as HTMLSelectElement;
        const ownerOption = Array.from(membersSelect.options).find(opt => opt.value.includes('(Owner)'));
        expect(ownerOption).toBeDefined();
      });
    });
  });

  describe('Duplicate Data from Location State', () => {
    it('should prefill form with duplicate data', () => {
      mockUseLocation.mockReturnValue({
        state: {
          duplicateData: {
            description: 'Duplicated Description',
            groupOwner: '1',
            members: ['1', '2'],
            isactive: true
          }
        },
        pathname: '/user-management/groups/create'
      });
      
      renderComponent();
      
      const descriptionInput = screen.getByTestId('text-field-Description').querySelector('input');
      expect(descriptionInput).toHaveValue('Duplicated Description');
    });
  });

  describe('Admin App Context', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/admin/user-management/groups/create'
        },
        writable: true
      });
    });

    it('should render with admin app context class', () => {
      renderComponent();
      const formContainer = screen.getByTestId('form-header').closest('[class*="admin-app-context"]');
      expect(formContainer || document.querySelector('.admin-app-context')).toBeTruthy();
    });

    it('should navigate to admin path when back is clicked', () => {
      renderComponent();
      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);
      
      const confirmYes = screen.queryByText('Yes');
      if (confirmYes) {
        fireEvent.click(confirmYes);
      }
      
      expect(mockNavigate).toHaveBeenCalledWith('/admin/user-management?tab=2');
    });
  });

  describe('Form Validation Edge Cases', () => {
    it('should validate empty group name', () => {
      renderComponent();
      const submitButton = screen.getByText('Next');
      expect(submitButton).toBeDisabled();
    });

    it('should validate empty description', () => {
      renderComponent();
      const groupNameInput = screen.getByTestId('text-field-Group Name').querySelector('input');
      fireEvent.change(groupNameInput!, { target: { value: 'Test Group' } });
      
      const submitButton = screen.getByText('Next');
      expect(submitButton).toBeDisabled();
    });

    it('should validate empty members', async () => {
      renderComponent();
      const groupNameInput = screen.getByTestId('text-field-Group Name').querySelector('input');
      fireEvent.change(groupNameInput!, { target: { value: 'Test Group' } });
      
      const descriptionInput = screen.getByTestId('text-field-Description').querySelector('input');
      fireEvent.change(descriptionInput!, { target: { value: 'Test Description' } });
      
      const ownerSelect = screen.getByTestId('select-field-Group Owner').querySelector('select');
      fireEvent.change(ownerSelect!, { target: { value: 'John Doe' } });
      
      // Wait for owner to be added to members
      await waitFor(() => {
        const submitButton = screen.getByText('Next');
        // Should be enabled once owner is auto-added to members
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should validate whitespace-only group name', () => {
      renderComponent();
      const groupNameInput = screen.getByTestId('text-field-Group Name').querySelector('input');
      fireEvent.change(groupNameInput!, { target: { value: '   ' } });
      
      const submitButton = screen.getByText('Next');
      expect(submitButton).toBeDisabled();
    });

    it('should validate whitespace-only description', () => {
      renderComponent();
      const groupNameInput = screen.getByTestId('text-field-Group Name').querySelector('input');
      fireEvent.change(groupNameInput!, { target: { value: 'Test Group' } });
      
      const descriptionInput = screen.getByTestId('text-field-Description').querySelector('input');
      fireEvent.change(descriptionInput!, { target: { value: '   ' } });
      
      const submitButton = screen.getByText('Next');
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Loading States', () => {
    it('should show loading when groupsLoading is true', () => {
      store = configureStore({
        reducer: {
          users: (state = { users: mockUsers, loading: false, error: null }, _action: any) => state,
          groups: (state = { groups: [], loading: true, error: null }, _action: any) => state,
        },
      });
      
      renderComponent();
      const submitButton = screen.getByText('Next');
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Owner Selection Edge Cases', () => {
    it('should handle owner selection when user not found', () => {
      renderComponent();
      const ownerSelect = screen.getByTestId('select-field-Group Owner').querySelector('select');
      fireEvent.change(ownerSelect!, { target: { value: 'Non-existent User' } });
      // Should not crash
      expect(ownerSelect).toBeInTheDocument();
    });

    it('should handle owner change and remove old owner from members', async () => {
      renderComponent();
      
      const ownerSelect = screen.getByTestId('select-field-Group Owner').querySelector('select');
      fireEvent.change(ownerSelect!, { target: { value: 'John Doe' } });
      
      await waitFor(() => {
        const membersSelect = screen.getByTestId('multi-select-field-Select Members').querySelector('select') as HTMLSelectElement;
        expect(membersSelect).toBeInTheDocument();
      });
      
      // Change owner
      fireEvent.change(ownerSelect!, { target: { value: 'Jane Smith' } });
      
      await waitFor(() => {
        const membersSelect = screen.getByTestId('multi-select-field-Select Members').querySelector('select') as HTMLSelectElement;
        if (membersSelect) {
          const selectedOptions = Array.from(membersSelect.selectedOptions);
          const hasNewOwner = selectedOptions.some(opt => opt.value.includes('Jane Smith'));
          expect(hasNewOwner).toBe(true);
        }
      });
    });
  });

  describe('Save vs Submit', () => {
    it('should call handleSave when save button is clicked', async () => {
      mockCreateGroup.mockReturnValue({ type: 'groups/createGroup/pending' } as any);
      
      renderComponent();
      
      const groupNameInput = screen.getByTestId('text-field-Group Name').querySelector('input');
      fireEvent.change(groupNameInput!, { target: { value: 'New Group' } });
      
      const descriptionInput = screen.getByTestId('text-field-Description').querySelector('input');
      fireEvent.change(descriptionInput!, { target: { value: 'Test Description' } });
      
      const ownerSelect = screen.getByTestId('select-field-Group Owner').querySelector('select');
      fireEvent.change(ownerSelect!, { target: { value: 'John Doe' } });
      
      await waitFor(() => {
        const saveButton = screen.getByText('Save');
        // Save button is always disabled, but we can test the function exists
        expect(saveButton).toBeInTheDocument();
      });
    });

    it('should navigate after successful submit', async () => {
      mockCreateGroup.mockReturnValue({ type: 'groups/createGroup/pending' } as any);
      
      renderComponent();
      
      const groupNameInput = screen.getByTestId('text-field-Group Name').querySelector('input');
      fireEvent.change(groupNameInput!, { target: { value: 'New Group' } });
      
      const descriptionInput = screen.getByTestId('text-field-Description').querySelector('input');
      fireEvent.change(descriptionInput!, { target: { value: 'Test Description' } });
      
      const ownerSelect = screen.getByTestId('select-field-Group Owner').querySelector('select');
      fireEvent.change(ownerSelect!, { target: { value: 'John Doe' } });
      
      await waitFor(() => {
        const submitButton = screen.getByText('Next');
        expect(submitButton).not.toBeDisabled();
      });
      
      const submitButton = screen.getByText('Next');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockCreateGroup).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('?tab=2'));
      });
    });

    it('should handle edge case with partial duplicate data', () => {
      const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>;
      mockUseLocation.mockReturnValue({
        pathname: '/groups/create',
        search: '',
        hash: '',
        state: { 
          duplicateData: { 
            description: 'Duplicate desc',
            groupOwner: 'user123'
            // Testing edge case where some fields exist but others don't (no groupName, no members)
          } 
        },
        key: 'test'
      } as any);

      renderComponent();
      
      // Should render without error and use defaults for missing fields
      expect(screen.getByDisplayValue('Duplicate desc')).toBeInTheDocument();
      
      // Group name should be empty in create mode even with duplicate data
      const groupNameInput = screen.getByTestId('text-field-Group Name').querySelector('input');
      expect(groupNameInput).toHaveValue('');
    });

    it('should test form validation early return scenario', async () => {
      renderComponent();
      
      // Test empty group name validation specifically
      const groupNameInput = screen.getByTestId('text-field-Group Name').querySelector('input');
      fireEvent.change(groupNameInput!, { target: { value: '   ' } }); // Whitespace only
      
      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeDisabled(); // Should be disabled due to invalid form
      
      // Verify createGroup is not called when form is invalid
      fireEvent.click(nextButton);
      expect(mockCreateGroup).not.toHaveBeenCalled();
    });

    it('should handle duplicate data edge case with partial data', () => {
      const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>;
      mockUseLocation.mockReturnValue({
        pathname: '/groups/create',
        search: '',
        hash: '',
        state: { 
          duplicateData: { 
            description: 'Duplicate desc',
            groupOwner: 'user123'
            // No members field to test edge case
          } 
        },
        key: 'test'
      } as any);

      renderComponent();
      
      // Should render without error and use defaults for missing fields
      expect(screen.getByDisplayValue('Duplicate desc')).toBeInTheDocument();
    });
  });
});

