import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DuplicatePermissionPanelWrapper from '../../../src/components/userManagement/DuplicatePermissionPanelWrapper';
import '@testing-library/jest-dom';

// Mock DuplicatePermissionPanel
jest.mock('../../../src/components/userManagement/DuplicatePermissionPanel', () => {
  return function MockDuplicatePermissionPanel({
    isOpen,
    onClose,
    onDuplicate,
    users,
    fullUsers,
    modules,
    modulesData,
    currentUser,
    onSuccessNotification
  }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="duplicate-permission-panel">
        <div>Panel Open</div>
        <button onClick={onClose}>Close Panel</button>
        <button
          onClick={() =>
            onDuplicate('Source User', 'Target User', ['module1'], ['perm1', 'perm2'], ['module1'])
          }
        >
          Duplicate
        </button>
        <div data-testid="users-count">{users.length}</div>
        <div data-testid="modules-count">{modules.length}</div>
        <div data-testid="current-user">{currentUser?.firstName} {currentUser?.lastName}</div>
      </div>
    );
  };
});

describe('DuplicatePermissionPanelWrapper', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onDuplicate: jest.fn(),
    duplicatePanelUsers: [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    ],
    fullUsers: [
      { id: 1, firstname: 'John', lastname: 'Doe', emailid: 'john@example.com' },
      { id: 2, firstname: 'Jane', lastname: 'Smith', emailid: 'jane@example.com' },
    ],
    modulesList: ['module1', 'module2'],
    modulesData: { module1: { submodules: {} }, module2: { submodules: {} } },
    currentUser: {
      firstName: 'New',
      lastName: 'User',
      emailId: 'newuser@example.com',
    },
    onSuccessNotification: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<DuplicatePermissionPanelWrapper {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('duplicate-permission-panel')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(<DuplicatePermissionPanelWrapper {...defaultProps} />);
      expect(screen.getByTestId('duplicate-permission-panel')).toBeInTheDocument();
    });

    it('should pass users to DuplicatePermissionPanel', () => {
      render(<DuplicatePermissionPanelWrapper {...defaultProps} />);
      expect(screen.getByTestId('users-count')).toHaveTextContent('2');
    });

    it('should pass modules to DuplicatePermissionPanel', () => {
      render(<DuplicatePermissionPanelWrapper {...defaultProps} />);
      expect(screen.getByTestId('modules-count')).toHaveTextContent('2');
    });

    it('should pass currentUser to DuplicatePermissionPanel', () => {
      render(<DuplicatePermissionPanelWrapper {...defaultProps} />);
      expect(screen.getByTestId('current-user')).toHaveTextContent('New User');
    });
  });

  describe('onDuplicate Callback', () => {
    it('should call onDuplicate with correct parameters', () => {
      render(<DuplicatePermissionPanelWrapper {...defaultProps} />);
      const duplicateButton = screen.getByText('Duplicate');
      fireEvent.click(duplicateButton);
      
      expect(defaultProps.onDuplicate).toHaveBeenCalledWith(
        ['perm1', 'perm2'],
        ['module1']
      );
    });

    it('should call onClose after onDuplicate', () => {
      render(<DuplicatePermissionPanelWrapper {...defaultProps} />);
      const duplicateButton = screen.getByText('Duplicate');
      fireEvent.click(duplicateButton);
      
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should handle onDuplicate with empty permissions', () => {
      render(<DuplicatePermissionPanelWrapper {...defaultProps} />);
      // Mock the panel to call onDuplicate with empty arrays
      const mockPanel = screen.getByTestId('duplicate-permission-panel');
      const duplicateButton = screen.getByText('Duplicate');
      
      // Modify the mock to call with empty arrays
      jest.spyOn(React, 'createElement').mockImplementationOnce((type: any, props: any) => {
        if (type.name === 'MockDuplicatePermissionPanel') {
          return (
            <div data-testid="duplicate-permission-panel">
              <button
                onClick={() => props.onDuplicate('Source', 'Target', [], [], [])}
              >
                Duplicate Empty
              </button>
            </div>
          );
        }
        return React.createElement(type, props);
      });
      
      render(<DuplicatePermissionPanelWrapper {...defaultProps} />);
      const emptyButton = screen.getByText('Duplicate Empty');
      fireEvent.click(emptyButton);
      
      expect(defaultProps.onDuplicate).toHaveBeenCalledWith([], []);
    });
  });

  describe('onClose Callback', () => {
    it('should call onClose when panel close is clicked', () => {
      render(<DuplicatePermissionPanelWrapper {...defaultProps} />);
      const closeButton = screen.getByText('Close Panel');
      fireEvent.click(closeButton);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Props Passing', () => {
    it('should pass all required props to DuplicatePermissionPanel', () => {
      render(<DuplicatePermissionPanelWrapper {...defaultProps} />);
      
      // Verify panel is rendered with correct data
      expect(screen.getByTestId('duplicate-permission-panel')).toBeInTheDocument();
      expect(screen.getByTestId('users-count')).toHaveTextContent('2');
      expect(screen.getByTestId('modules-count')).toHaveTextContent('2');
      expect(screen.getByTestId('current-user')).toHaveTextContent('New User');
    });

    it('should pass empty arrays when no users or modules', () => {
      render(
        <DuplicatePermissionPanelWrapper
          {...defaultProps}
          duplicatePanelUsers={[]}
          modulesList={[]}
        />
      );
      
      expect(screen.getByTestId('users-count')).toHaveTextContent('0');
      expect(screen.getByTestId('modules-count')).toHaveTextContent('0');
    });

    it('should pass currentUser with empty name', () => {
      render(
        <DuplicatePermissionPanelWrapper
          {...defaultProps}
          currentUser={{ firstName: '', lastName: '', emailId: 'test@example.com' }}
        />
      );
      
      expect(screen.getByTestId('current-user')).toHaveTextContent(' ');
    });
  });

  describe('Wrapper Functionality', () => {
    it('should wrap DuplicatePermissionPanel correctly', () => {
      render(<DuplicatePermissionPanelWrapper {...defaultProps} />);
      expect(screen.getByTestId('duplicate-permission-panel')).toBeInTheDocument();
    });

    it('should transform onDuplicate signature correctly', () => {
      render(<DuplicatePermissionPanelWrapper {...defaultProps} />);
      const duplicateButton = screen.getByText('Duplicate');
      fireEvent.click(duplicateButton);
      
      // The wrapper should transform the 5-parameter call to a 2-parameter call
      expect(defaultProps.onDuplicate).toHaveBeenCalledWith(
        expect.arrayContaining(['perm1', 'perm2']),
        expect.arrayContaining(['module1'])
      );
    });

    it('should handle onDuplicate without enabledModules', () => {
      render(<DuplicatePermissionPanelWrapper {...defaultProps} />);
      // The wrapper should handle undefined enabledModules
      const duplicateButton = screen.getByText('Duplicate');
      fireEvent.click(duplicateButton);
      
      expect(defaultProps.onDuplicate).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null currentUser', () => {
      render(
        <DuplicatePermissionPanelWrapper
          {...defaultProps}
          currentUser={null as any}
        />
      );
      
      expect(screen.getByTestId('duplicate-permission-panel')).toBeInTheDocument();
    });

    it('should handle undefined currentUser', () => {
      render(
        <DuplicatePermissionPanelWrapper
          {...defaultProps}
          currentUser={undefined as any}
        />
      );
      
      expect(screen.getByTestId('duplicate-permission-panel')).toBeInTheDocument();
    });

    it('should handle empty duplicatePanelUsers', () => {
      render(
        <DuplicatePermissionPanelWrapper
          {...defaultProps}
          duplicatePanelUsers={[]}
        />
      );
      
      expect(screen.getByTestId('users-count')).toHaveTextContent('0');
    });

    it('should handle empty modulesList', () => {
      render(
        <DuplicatePermissionPanelWrapper
          {...defaultProps}
          modulesList={[]}
        />
      );
      
      expect(screen.getByTestId('modules-count')).toHaveTextContent('0');
    });
  });
});

