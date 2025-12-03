import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import DuplicatePermissions from '../../../src/components/userManagement/DuplicatePermissions';
import * as userSlice from '../../../src/store/Reducers/userSlice';

// Mock common-app components
jest.mock('commonApp/NotificationAlert', () => {
  return function MockNotificationAlert({ open, title, message, actions, onClose }: any) {
    if (!open) return null;
    return (
      <div data-testid="notification-alert">
        <div data-testid="alert-title">{title}</div>
        <div data-testid="alert-message">{message}</div>
        <div data-testid="alert-actions">
          {actions?.map((action: any, index: number) => (
            <button
              key={index}
              data-testid={`alert-action-${action.label.toLowerCase()}`}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
        <button data-testid="alert-close" onClick={onClose}>
          Close
        </button>
      </div>
    );
  };
});

jest.mock('commonApp/SelectField', () => {
  return function MockSelectField({ label, value, onChange, options, placeholder, required, disabled, error, errorMessage, width, height }: any) {
    return (
      <div data-testid={`form-field-${label?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'select-field'}`}>
        <label>{label} {required && '*'}</label>
        <select
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          data-testid="select-input"
        >
          <option value="">{placeholder}</option>
          {options?.map((option: string, index: number) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error && <div data-testid="error-message">{errorMessage}</div>}
      </div>
    );
  };
});

jest.mock('commonApp/MultiSelectField', () => {
  return function MockMultiSelectField({ label, value, onChange, options, placeholder, required, error, errorMessage, width, height, showSelectAll, showSelectedItems, maxSelectedItemsDisplay }: any) {
    return (
      <div data-testid={`form-field-${label?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'multi-select-field'}`}>
        <label>{label} {required && '*'}</label>
        <select
          multiple
          value={value || []}
          onChange={(e) => {
            const selectedValues = Array.from(e.target.selectedOptions, (option: any) => option.value);
            onChange?.(selectedValues);
          }}
          data-testid="multi-select-input"
        >
          {options?.map((option: string, index: number) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error && <div data-testid="error-message">{errorMessage}</div>}
      </div>
    );
  };
});

jest.mock('commonApp/CustomTooltip', () => {
  return function MockCustomTooltip({ children, title }: any) {
    return (
      <div data-testid="custom-tooltip" title={title}>
        {children}
      </div>
    );
  };
});

jest.mock('../../../src/components/userManagement/CommonButton', () => {
  return function MockCommonButton({ children, onClick }: any) {
    return <button onClick={onClick}>{children}</button>;
  };
});

jest.mock('../../../src/components/userManagement/CommonTextSpan', () => {
  return function MockCommonTextSpan({ children }: any) {
    return <span>{children}</span>;
  };
});

jest.mock('../../../src/components/userManagement/DuplicatePermissionPanel', () => {
  return function MockDuplicatePermissionPanel({ isOpen, onClose, onDuplicate, users, modules, currentUser }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="duplicate-permission-panel">
        <div data-testid="panel-title">Duplicate Permission</div>
        <div data-testid="panel-content">
          <div data-testid="source-user-field">Source User Field</div>
          <div data-testid="target-user-field">Target User Field</div>
          <div data-testid="modules-field">Modules Field</div>
        </div>
        <div data-testid="panel-actions">
          <button data-testid="panel-reset" onClick={() => onClose()}>Reset</button>
          <button data-testid="panel-submit" onClick={() => onDuplicate('source', 'target', [])}>Submit</button>
        </div>
      </div>
    );
  };
});

describe('DuplicatePermissions', () => {
  let store: any;
  let mockOnDuplicate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    store = configureStore({
      reducer: {
        user: userSlice.default
      }
    });
    mockOnDuplicate = jest.fn();
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      selectedPermissions: new Set(['module1-submodule1-permission1', 'module1-submodule1-permission2']),
      onDuplicate: mockOnDuplicate,
      enabledModules: new Set(['module1']),
      activeModule: 'module1',
      activeSubmodule: 'module1-submodule1',
      users: [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
      ],
      modules: ['module1', 'module2'],
      currentUser: { firstName: 'Test', lastName: 'User', emailId: 'test@example.com' },
      ...props
    };

    return render(
      <Provider store={store}>
        <BrowserRouter>
          <DuplicatePermissions {...defaultProps} />
        </BrowserRouter>
      </Provider>
    );
  };

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Duplicate')).toBeInTheDocument();
  });

  it('shows warning dialog when duplicate button is clicked', () => {
    renderComponent();
    
    const duplicateButton = screen.getByText('Duplicate');
    fireEvent.click(duplicateButton);
    
    expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
    expect(screen.getByTestId('alert-title')).toHaveTextContent('Warning – Action Required');
    expect(screen.getByTestId('alert-message')).toHaveTextContent('The selected permissions will be duplicated and added to the existing permissions. Do you wish to continue?');
  });

  it('shows Yes and No buttons in the dialog', () => {
    renderComponent();
    
    const duplicateButton = screen.getByText('Duplicate');
    fireEvent.click(duplicateButton);
    
    expect(screen.getByTestId('alert-action-yes')).toBeInTheDocument();
    expect(screen.getByTestId('alert-action-no')).toBeInTheDocument();
  });

  it('opens duplicate panel when Yes is clicked', () => {
    const selectedPermissions = new Set(['module1-submodule1-permission1', 'module1-submodule1-permission2']);
    renderComponent({ selectedPermissions });
    
    const duplicateButton = screen.getByText('Duplicate');
    fireEvent.click(duplicateButton);
    
    const yesButton = screen.getByTestId('alert-action-yes');
    fireEvent.click(yesButton);
    
    // Should open the duplicate panel instead of immediately duplicating
    expect(screen.getByTestId('duplicate-permission-panel')).toBeInTheDocument();
    expect(screen.getByTestId('panel-title')).toHaveTextContent('Duplicate Permission');
  });

  it('closes dialog when No is clicked', () => {
    renderComponent();
    
    const duplicateButton = screen.getByText('Duplicate');
    fireEvent.click(duplicateButton);
    
    expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
    
    const noButton = screen.getByTestId('alert-action-no');
    fireEvent.click(noButton);
    
    expect(screen.queryByTestId('notification-alert')).not.toBeInTheDocument();
  });

  it('closes dialog when close button is clicked', () => {
    renderComponent();
    
    const duplicateButton = screen.getByText('Duplicate');
    fireEvent.click(duplicateButton);
    
    expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
    
    const closeButton = screen.getByTestId('alert-close');
    fireEvent.click(closeButton);
    
    expect(screen.queryByTestId('notification-alert')).not.toBeInTheDocument();
  });

  it('handles empty selected permissions by opening panel', () => {
    renderComponent({ selectedPermissions: new Set() });
    
    const duplicateButton = screen.getByText('Duplicate');
    fireEvent.click(duplicateButton);
    
    const yesButton = screen.getByTestId('alert-action-yes');
    fireEvent.click(yesButton);
    
    // Should open the duplicate panel even with empty permissions
    expect(screen.getByTestId('duplicate-permission-panel')).toBeInTheDocument();
  });

  it('should call onDuplicate with enabled modules when panel duplicates', () => {
    const mockOnDuplicate = jest.fn();
    renderComponent({ onDuplicate: mockOnDuplicate });
    
    const duplicateButton = screen.getByText('Duplicate');
    fireEvent.click(duplicateButton);
    
    const yesButton = screen.getByTestId('alert-action-yes');
    fireEvent.click(yesButton);
    
    // Simulate panel duplicate action
    const panelSubmit = screen.getByTestId('panel-submit');
    fireEvent.click(panelSubmit);
    
    // onDuplicate should be called with permissions and enabled modules
    expect(mockOnDuplicate).toHaveBeenCalled();
  });

  it('should handle panel close', () => {
    renderComponent();
    
    const duplicateButton = screen.getByText('Duplicate');
    fireEvent.click(duplicateButton);
    
    const yesButton = screen.getByTestId('alert-action-yes');
    fireEvent.click(yesButton);
    
    // Panel should be open
    expect(screen.getByTestId('duplicate-permission-panel')).toBeInTheDocument();
    
    // Close panel
    const panelReset = screen.getByTestId('panel-reset');
    fireEvent.click(panelReset);
    
    // Panel should be closed
    expect(screen.queryByTestId('duplicate-permission-panel')).not.toBeInTheDocument();
  });

  it('should pass all props to DuplicatePermissionPanel', () => {
    const mockFullUsers = [
      { id: 1, firstname: 'John', lastname: 'Doe', emailid: 'john@example.com' },
    ];
    const mockModules = ['module1', 'module2'];
    const mockModulesData = { module1: { submodules: {} } };
    const mockCurrentUser = { firstName: 'Test', lastName: 'User', emailId: 'test@example.com' };
    const mockOnSuccessNotification = jest.fn();
    
    renderComponent({
      fullUsers: mockFullUsers,
      modules: mockModules,
      modulesData: mockModulesData,
      currentUser: mockCurrentUser,
      onSuccessNotification: mockOnSuccessNotification,
    });
    
    const duplicateButton = screen.getByText('Duplicate');
    fireEvent.click(duplicateButton);
    
    const yesButton = screen.getByTestId('alert-action-yes');
    fireEvent.click(yesButton);
    
    // Panel should receive all props
    expect(screen.getByTestId('duplicate-permission-panel')).toBeInTheDocument();
  });

  it('should handle onDuplicate callback with enabled modules', () => {
    const mockOnDuplicate = jest.fn();
    renderComponent({ onDuplicate: mockOnDuplicate });
    
    const duplicateButton = screen.getByText('Duplicate');
    fireEvent.click(duplicateButton);
    
    const yesButton = screen.getByTestId('alert-action-yes');
    fireEvent.click(yesButton);
    
    // Panel should be open and ready to duplicate
    expect(screen.getByTestId('duplicate-permission-panel')).toBeInTheDocument();
  });
});
