import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TransferResponsibilitiesPanel from '../../../src/components/userManagement/TransferResponsibilitiesPanel';
import '@testing-library/jest-dom';

// Mock commonApp components
jest.mock('commonApp/Panel', () => {
  return function MockPanel({ isOpen, children, onClose, onSubmit, onReset, title, submitButtonDisabled }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="panel">
        <div data-testid="panel-title">{title}</div>
        <button data-testid="panel-close" onClick={onClose}>Close</button>
        <button data-testid="panel-submit" onClick={onSubmit} disabled={submitButtonDisabled}>Submit</button>
        <button data-testid="panel-reset" onClick={onReset}>Reset</button>
        {children}
      </div>
    );
  };
});

jest.mock('commonApp/SelectField', () => {
  return function MockSelectField({ label, value, onChange, options, disabled, error, errorMessage }: any) {
    return (
      <div data-testid={`select-${label.toLowerCase().replace(/\s+/g, '-')}`}>
        <label>{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          data-error={error}
        >
          <option value="">Select...</option>
          {options.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {error && <div data-testid="error-message">{errorMessage}</div>}
      </div>
    );
  };
});

describe('TransferResponsibilitiesPanel', () => {
  const mockUsers = [
    {
      id: 1,
      firstname: 'John',
      lastname: 'Doe',
      emailid: 'john@example.com',
      isenabled: true,
      status: 'Active',
    },
    {
      id: 2,
      firstname: 'Jane',
      lastname: 'Smith',
      emailid: 'jane@example.com',
      isenabled: true,
      status: 'Active',
    },
    {
      id: 3,
      firstname: 'Bob',
      lastname: 'Johnson',
      emailid: 'bob@example.com',
      isenabled: false,
      status: 'Inactive',
    },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSubmit: jest.fn().mockResolvedValue(undefined),
    onReset: jest.fn(),
    sourceUserName: 'John Doe',
    sourceUserId: 1,
    users: mockUsers,
    onSuccessNotification: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<TransferResponsibilitiesPanel {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('panel')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(<TransferResponsibilitiesPanel {...defaultProps} />);
      expect(screen.getByTestId('panel')).toBeInTheDocument();
      expect(screen.getByTestId('panel-title')).toHaveTextContent('Transfer Responsibilities');
    });

    it('should render source user select field', () => {
      render(<TransferResponsibilitiesPanel {...defaultProps} />);
      expect(screen.getByTestId('select-transfer-responsibilities-from')).toBeInTheDocument();
    });

    it('should render target user select field', () => {
      render(<TransferResponsibilitiesPanel {...defaultProps} />);
      expect(screen.getByTestId('select-transfer-responsibilities-to')).toBeInTheDocument();
    });
  });

  describe('Source User Display', () => {
    it('should display source user name from userId', () => {
      render(<TransferResponsibilitiesPanel {...defaultProps} />);
      const sourceSelect = screen.getByTestId('select-transfer-responsibilities-from');
      const select = sourceSelect.querySelector('select');
      expect(select).toHaveValue('John Doe');
    });

    it('should display source user name from sourceUserName when userId not found', () => {
      render(
        <TransferResponsibilitiesPanel
          {...defaultProps}
          sourceUserId={999}
          sourceUserName="Jane Smith"
        />
      );
      const sourceSelect = screen.getByTestId('select-transfer-responsibilities-from');
      const select = sourceSelect.querySelector('select');
      expect(select).toHaveValue('Jane Smith');
    });

    it('should format name from firstname and lastname', () => {
      render(<TransferResponsibilitiesPanel {...defaultProps} sourceUserId={2} />);
      const sourceSelect = screen.getByTestId('select-transfer-responsibilities-from');
      const select = sourceSelect.querySelector('select');
      expect(select).toHaveValue('Jane Smith');
    });

    it('should fallback to emailid when name is empty', () => {
      const usersWithOnlyEmail = [
        {
          id: 4,
          firstname: '',
          lastname: '',
          emailid: 'emailonly@example.com',
          isenabled: true,
          status: 'Active',
        },
      ];
      render(
        <TransferResponsibilitiesPanel
          {...defaultProps}
          sourceUserId={4}
          users={usersWithOnlyEmail}
        />
      );
      const sourceSelect = screen.getByTestId('select-transfer-responsibilities-from');
      const select = sourceSelect.querySelector('select');
      expect(select).toHaveValue('emailonly@example.com');
    });

    it('should exclude Unknown User and User from display', () => {
      render(
        <TransferResponsibilitiesPanel
          {...defaultProps}
          sourceUserId={null}
          sourceUserName="Unknown User"
        />
      );
      const sourceSelect = screen.getByTestId('select-transfer-responsibilities-from');
      const select = sourceSelect.querySelector('select');
      expect(select).toHaveValue('');
    });
  });

  describe('Target User Options', () => {
    it('should only include active users in target options', () => {
      render(<TransferResponsibilitiesPanel {...defaultProps} />);
      const targetSelect = screen.getByTestId('select-transfer-responsibilities-to');
      const select = targetSelect.querySelector('select');
      const options = Array.from(select?.querySelectorAll('option') || []);
      const optionValues = options.map(opt => opt.value).filter(v => v);
      
      expect(optionValues).toContain('Jane Smith');
      expect(optionValues).not.toContain('John Doe'); // Source user excluded
      expect(optionValues).not.toContain('Bob Johnson'); // Inactive user excluded
    });

    it('should exclude source user from target options', () => {
      render(<TransferResponsibilitiesPanel {...defaultProps} />);
      const targetSelect = screen.getByTestId('select-transfer-responsibilities-to');
      const select = targetSelect.querySelector('select');
      const options = Array.from(select?.querySelectorAll('option') || []);
      const optionValues = options.map(opt => opt.value);
      
      expect(optionValues).not.toContain('John Doe');
    });

    it('should exclude inactive users from target options', () => {
      render(<TransferResponsibilitiesPanel {...defaultProps} />);
      const targetSelect = screen.getByTestId('select-transfer-responsibilities-to');
      const select = targetSelect.querySelector('select');
      const options = Array.from(select?.querySelectorAll('option') || []);
      const optionValues = options.map(opt => opt.value);
      
      expect(optionValues).not.toContain('Bob Johnson');
    });
  });

  describe('Form Validation', () => {
    it('should show error when target user is not selected', async () => {
      render(<TransferResponsibilitiesPanel {...defaultProps} />);
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.queryByTestId('error-message');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveTextContent('Target user is required');
      });
    });

    it('should show error when target user is same as source user', async () => {
      render(<TransferResponsibilitiesPanel {...defaultProps} />);
      const targetSelect = screen.getByTestId('select-transfer-responsibilities-to');
      const select = targetSelect.querySelector('select');
      
      // Try to select source user (should not be in options, but test the validation)
      fireEvent.change(select!, { target: { value: 'John Doe' } });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.queryByTestId('error-message');
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('should clear error when valid target user is selected', async () => {
      render(<TransferResponsibilitiesPanel {...defaultProps} />);
      const targetSelect = screen.getByTestId('select-transfer-responsibilities-to');
      const select = targetSelect.querySelector('select');
      
      // First trigger validation error
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).toBeInTheDocument();
      });

      // Then select valid user
      fireEvent.change(select!, { target: { value: 'Jane Smith' } });

      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with target user when form is valid', async () => {
      render(<TransferResponsibilitiesPanel {...defaultProps} />);
      const targetSelect = screen.getByTestId('select-transfer-responsibilities-to');
      const select = targetSelect.querySelector('select');
      
      fireEvent.change(select!, { target: { value: 'Jane Smith' } });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(defaultProps.onSubmit).toHaveBeenCalledWith('Jane Smith');
      });
    });

    it('should call onSuccessNotification on successful submit', async () => {
      render(<TransferResponsibilitiesPanel {...defaultProps} />);
      const targetSelect = screen.getByTestId('select-transfer-responsibilities-to');
      const select = targetSelect.querySelector('select');
      
      fireEvent.change(select!, { target: { value: 'Jane Smith' } });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(defaultProps.onSuccessNotification).toHaveBeenCalledWith(
          'Responsibilities have been Successfully transferred to the selected user'
        );
      });
    });

    it('should close panel after successful submit', async () => {
      render(<TransferResponsibilitiesPanel {...defaultProps} />);
      const targetSelect = screen.getByTestId('select-transfer-responsibilities-to');
      const select = targetSelect.querySelector('select');
      
      fireEvent.change(select!, { target: { value: 'Jane Smith' } });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled();
      }, { timeout: 1000 });
    });

    it('should not close panel on submit error', async () => {
      const mockOnSubmit = jest.fn().mockRejectedValue(new Error('Submit error'));
      render(
        <TransferResponsibilitiesPanel
          {...defaultProps}
          onSubmit={mockOnSubmit}
        />
      );
      const targetSelect = screen.getByTestId('select-transfer-responsibilities-to');
      const select = targetSelect.querySelector('select');
      
      fireEvent.change(select!, { target: { value: 'Jane Smith' } });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      // Panel should still be open
      expect(screen.getByTestId('panel')).toBeInTheDocument();
    });

    it('should disable submit button when target user is not selected', () => {
      render(<TransferResponsibilitiesPanel {...defaultProps} />);
      const submitButton = screen.getByTestId('panel-submit');
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when valid target user is selected', () => {
      render(<TransferResponsibilitiesPanel {...defaultProps} />);
      const targetSelect = screen.getByTestId('select-transfer-responsibilities-to');
      const select = targetSelect.querySelector('select');
      
      fireEvent.change(select!, { target: { value: 'Jane Smith' } });
      
      const submitButton = screen.getByTestId('panel-submit');
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Form Reset', () => {
    it('should reset form when reset button is clicked', () => {
      render(<TransferResponsibilitiesPanel {...defaultProps} />);
      const targetSelect = screen.getByTestId('select-transfer-responsibilities-to');
      const select = targetSelect.querySelector('select');
      
      fireEvent.change(select!, { target: { value: 'Jane Smith' } });
      expect(select).toHaveValue('Jane Smith');
      
      const resetButton = screen.getByTestId('panel-reset');
      fireEvent.click(resetButton);
      
      expect(select).toHaveValue('');
    });

    it('should clear validation errors on reset', async () => {
      render(<TransferResponsibilitiesPanel {...defaultProps} />);
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).toBeInTheDocument();
      });

      const resetButton = screen.getByTestId('panel-reset');
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      });
    });
  });

  describe('Panel Close', () => {
    it('should call onClose when close button is clicked', () => {
      render(<TransferResponsibilitiesPanel {...defaultProps} />);
      const closeButton = screen.getByTestId('panel-close');
      fireEvent.click(closeButton);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should reset form when panel opens', () => {
      const { rerender } = render(
        <TransferResponsibilitiesPanel {...defaultProps} isOpen={false} />
      );
      
      rerender(<TransferResponsibilitiesPanel {...defaultProps} isOpen={true} />);
      
      const targetSelect = screen.getByTestId('select-transfer-responsibilities-to');
      const select = targetSelect.querySelector('select');
      expect(select).toHaveValue('');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null sourceUserId', () => {
      render(
        <TransferResponsibilitiesPanel
          {...defaultProps}
          sourceUserId={null}
          sourceUserName="Test User"
        />
      );
      expect(screen.getByTestId('panel')).toBeInTheDocument();
    });

    it('should handle empty users array', () => {
      render(<TransferResponsibilitiesPanel {...defaultProps} users={[]} />);
      expect(screen.getByTestId('panel')).toBeInTheDocument();
    });

    it('should handle user with only firstname', () => {
      const usersWithOnlyFirstname = [
        {
          id: 5,
          firstname: 'FirstOnly',
          lastname: '',
          emailid: 'first@example.com',
          isenabled: true,
          status: 'Active',
        },
      ];
      render(
        <TransferResponsibilitiesPanel
          {...defaultProps}
          sourceUserId={5}
          users={usersWithOnlyFirstname}
        />
      );
      const sourceSelect = screen.getByTestId('select-transfer-responsibilities-from');
      const select = sourceSelect.querySelector('select');
      expect(select).toHaveValue('FirstOnly');
    });

    it('should handle user with only lastname', () => {
      const usersWithOnlyLastname = [
        {
          id: 6,
          firstname: '',
          lastname: 'LastOnly',
          emailid: 'last@example.com',
          isenabled: true,
          status: 'Active',
        },
      ];
      render(
        <TransferResponsibilitiesPanel
          {...defaultProps}
          sourceUserId={6}
          users={usersWithOnlyLastname}
        />
      );
      const sourceSelect = screen.getByTestId('select-transfer-responsibilities-from');
      const select = sourceSelect.querySelector('select');
      expect(select).toHaveValue('LastOnly');
    });

    it('should handle user with whitespace in name', () => {
      const usersWithWhitespace = [
        {
          id: 7,
          firstname: '  First  ',
          lastname: '  Last  ',
          emailid: 'whitespace@example.com',
          isenabled: true,
          status: 'Active',
        },
      ];
      render(
        <TransferResponsibilitiesPanel
          {...defaultProps}
          sourceUserId={7}
          users={usersWithWhitespace}
        />
      );
      const sourceSelect = screen.getByTestId('select-transfer-responsibilities-from');
      const select = sourceSelect.querySelector('select');
      expect(select).toHaveValue('First Last');
    });
  });
});

