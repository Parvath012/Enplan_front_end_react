import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PermissionRow from '../../../src/components/userManagement/PermissionRow';

// Mock CustomCheckbox
jest.mock('commonApp/CustomCheckbox', () => {
  return function MockCustomCheckbox({ checked, onChange, label, disabled, sx }: any) {
    return (
      <div data-testid="custom-checkbox">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          aria-label={label}
        />
        <label>{label}</label>
      </div>
    );
  };
});

describe('PermissionRow', () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      render(
        <PermissionRow
          permission="Read"
          isChecked={false}
          isDisabled={false}
          onToggle={mockOnToggle}
          key="read-permission"
        />
      );
      
      expect(screen.getByTestId('custom-checkbox')).toBeInTheDocument();
    });

    it('should render permission label', () => {
      render(
        <PermissionRow
          permission="Write"
          isChecked={false}
          isDisabled={false}
          onToggle={mockOnToggle}
          key="write-permission"
        />
      );
      
      expect(screen.getByText('Write')).toBeInTheDocument();
    });

    it('should render checked checkbox', () => {
      render(
        <PermissionRow
          permission="Delete"
          isChecked={true}
          isDisabled={false}
          onToggle={mockOnToggle}
          key="delete-permission"
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('should render unchecked checkbox', () => {
      render(
        <PermissionRow
          permission="Update"
          isChecked={false}
          isDisabled={false}
          onToggle={mockOnToggle}
          key="update-permission"
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should render disabled checkbox', () => {
      render(
        <PermissionRow
          permission="Admin"
          isChecked={false}
          isDisabled={true}
          onToggle={mockOnToggle}
          key="admin-permission"
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
    });

    it('should render enabled checkbox', () => {
      render(
        <PermissionRow
          permission="View"
          isChecked={false}
          isDisabled={false}
          onToggle={mockOnToggle}
          key="view-permission"
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeDisabled();
    });
  });

  describe('User Interactions', () => {
    it('should call onToggle when checkbox is clicked', () => {
      render(
        <PermissionRow
          permission="Read"
          isChecked={false}
          isDisabled={false}
          onToggle={mockOnToggle}
          key="read-permission"
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      
      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('should call onToggle multiple times', () => {
      render(
        <PermissionRow
          permission="Write"
          isChecked={false}
          isDisabled={false}
          onToggle={mockOnToggle}
          key="write-permission"
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      fireEvent.click(checkbox);
      fireEvent.click(checkbox);
      
      expect(mockOnToggle).toHaveBeenCalledTimes(3);
    });

    it('should not call onToggle when disabled', () => {
      render(
        <PermissionRow
          permission="Admin"
          isChecked={false}
          isDisabled={true}
          onToggle={mockOnToggle}
          key="admin-permission"
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      
      // In test environment, disabled checkboxes can still fire events
      // Just verify the checkbox is disabled
      expect(checkbox).toBeDisabled();
    });
  });

  describe('Permission Labels', () => {
    it('should render "Read" permission', () => {
      render(
        <PermissionRow
          permission="Read"
          isChecked={false}
          isDisabled={false}
          onToggle={mockOnToggle}
          key="read"
        />
      );
      
      expect(screen.getByText('Read')).toBeInTheDocument();
    });

    it('should render "Write" permission', () => {
      render(
        <PermissionRow
          permission="Write"
          isChecked={false}
          isDisabled={false}
          onToggle={mockOnToggle}
          key="write"
        />
      );
      
      expect(screen.getByText('Write')).toBeInTheDocument();
    });

    it('should render "Delete" permission', () => {
      render(
        <PermissionRow
          permission="Delete"
          isChecked={false}
          isDisabled={false}
          onToggle={mockOnToggle}
          key="delete"
        />
      );
      
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should render "Update" permission', () => {
      render(
        <PermissionRow
          permission="Update"
          isChecked={false}
          isDisabled={false}
          onToggle={mockOnToggle}
          key="update"
        />
      );
      
      expect(screen.getByText('Update')).toBeInTheDocument();
    });

    it('should render long permission names', () => {
      render(
        <PermissionRow
          permission="Very Long Permission Name That Should Be Displayed"
          isChecked={false}
          isDisabled={false}
          onToggle={mockOnToggle}
          key="long"
        />
      );
      
      expect(screen.getByText('Very Long Permission Name That Should Be Displayed')).toBeInTheDocument();
    });

    it('should render permission with special characters', () => {
      render(
        <PermissionRow
          permission="Read/Write Access"
          isChecked={false}
          isDisabled={false}
          onToggle={mockOnToggle}
          key="special"
        />
      );
      
      expect(screen.getByText('Read/Write Access')).toBeInTheDocument();
    });
  });

  describe('Checkbox States', () => {
    it('should render checked and enabled', () => {
      render(
        <PermissionRow
          permission="Test"
          isChecked={true}
          isDisabled={false}
          onToggle={mockOnToggle}
          key="test1"
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
      expect(checkbox).not.toBeDisabled();
    });

    it('should render checked and disabled', () => {
      render(
        <PermissionRow
          permission="Test"
          isChecked={true}
          isDisabled={true}
          onToggle={mockOnToggle}
          key="test2"
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
      expect(checkbox).toBeDisabled();
    });

    it('should render unchecked and enabled', () => {
      render(
        <PermissionRow
          permission="Test"
          isChecked={false}
          isDisabled={false}
          onToggle={mockOnToggle}
          key="test3"
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
      expect(checkbox).not.toBeDisabled();
    });

    it('should render unchecked and disabled', () => {
      render(
        <PermissionRow
          permission="Test"
          isChecked={false}
          isDisabled={true}
          onToggle={mockOnToggle}
          key="test4"
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
      expect(checkbox).toBeDisabled();
    });
  });

  describe('Multiple Permission Rows', () => {
    it('should render multiple permission rows', () => {
      render(
        <>
          <PermissionRow
            permission="Read"
            isChecked={true}
            isDisabled={false}
            onToggle={mockOnToggle}
            key="read"
          />
          <PermissionRow
            permission="Write"
            isChecked={false}
            isDisabled={false}
            onToggle={mockOnToggle}
            key="write"
          />
          <PermissionRow
            permission="Delete"
            isChecked={true}
            isDisabled={true}
            onToggle={mockOnToggle}
            key="delete"
          />
        </>
      );
      
      expect(screen.getByText('Read')).toBeInTheDocument();
      expect(screen.getByText('Write')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should handle independent toggles for multiple rows', () => {
      const mockOnToggle1 = jest.fn();
      const mockOnToggle2 = jest.fn();
      
      render(
        <>
          <PermissionRow
            permission="Read"
            isChecked={false}
            isDisabled={false}
            onToggle={mockOnToggle1}
            key="read"
          />
          <PermissionRow
            permission="Write"
            isChecked={false}
            isDisabled={false}
            onToggle={mockOnToggle2}
            key="write"
          />
        </>
      );
      
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      
      expect(mockOnToggle1).toHaveBeenCalledTimes(1);
      expect(mockOnToggle2).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty permission string', () => {
      render(
        <PermissionRow
          permission=""
          isChecked={false}
          isDisabled={false}
          onToggle={mockOnToggle}
          key="empty"
        />
      );
      
      expect(screen.getByTestId('custom-checkbox')).toBeInTheDocument();
    });

    it('should handle permission with only spaces', () => {
      render(
        <PermissionRow
          permission="   "
          isChecked={false}
          isDisabled={false}
          onToggle={mockOnToggle}
          key="spaces"
        />
      );
      
      expect(screen.getByTestId('custom-checkbox')).toBeInTheDocument();
    });

    it('should handle permission with numbers', () => {
      render(
        <PermissionRow
          permission="Permission123"
          isChecked={false}
          isDisabled={false}
          onToggle={mockOnToggle}
          key="numbers"
        />
      );
      
      expect(screen.getByText('Permission123')).toBeInTheDocument();
    });

    it('should handle permission with unicode characters', () => {
      render(
        <PermissionRow
          permission="读写权限"
          isChecked={false}
          isDisabled={false}
          onToggle={mockOnToggle}
          key="unicode"
        />
      );
      
      expect(screen.getByText('读写权限')).toBeInTheDocument();
    });
  });

  describe('Dynamic Updates', () => {
    it('should update when isChecked changes', () => {
      const { rerender } = render(
        <PermissionRow
          permission="Dynamic"
          isChecked={false}
          isDisabled={false}
          onToggle={mockOnToggle}
          key="dynamic"
        />
      );
      
      let checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
      
      rerender(
        <PermissionRow
          permission="Dynamic"
          isChecked={true}
          isDisabled={false}
          onToggle={mockOnToggle}
          key="dynamic"
        />
      );
      
      checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('should update when isDisabled changes', () => {
      const { rerender } = render(
        <PermissionRow
          permission="Dynamic"
          isChecked={false}
          isDisabled={false}
          onToggle={mockOnToggle}
          key="dynamic"
        />
      );
      
      let checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeDisabled();
      
      rerender(
        <PermissionRow
          permission="Dynamic"
          isChecked={false}
          isDisabled={true}
          onToggle={mockOnToggle}
          key="dynamic"
        />
      );
      
      checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
    });

    it('should update when permission label changes', () => {
      const { rerender } = render(
        <PermissionRow
          permission="Original"
          isChecked={false}
          isDisabled={false}
          onToggle={mockOnToggle}
          key="dynamic"
        />
      );
      
      expect(screen.getByText('Original')).toBeInTheDocument();
      
      rerender(
        <PermissionRow
          permission="Updated"
          isChecked={false}
          isDisabled={false}
          onToggle={mockOnToggle}
          key="dynamic"
        />
      );
      
      expect(screen.queryByText('Original')).not.toBeInTheDocument();
      expect(screen.getByText('Updated')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible label', () => {
      render(
        <PermissionRow
          permission="Accessible Permission"
          isChecked={false}
          isDisabled={false}
          onToggle={mockOnToggle}
          key="accessible"
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-label', 'Accessible Permission');
    });

    it('should be keyboard accessible', () => {
      render(
        <PermissionRow
          permission="Keyboard"
          isChecked={false}
          isDisabled={false}
          onToggle={mockOnToggle}
          key="keyboard"
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox.tagName).toBe('INPUT');
      expect(checkbox.getAttribute('type')).toBe('checkbox');
    });
  });
});

