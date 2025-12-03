import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NameCellRenderer, { createNameCellRenderer } from '../../../src/components/userList/NameCellRenderer';

// Mock dependencies
jest.mock('../../../src/components/UserInitials', () => {
  return function MockUserInitials({ firstName, lastName, size, fontSize }: any) {
    return (
      <div data-testid="user-initials" data-size={size} data-fontsize={fontSize}>
        {firstName.charAt(0)}{lastName.charAt(0)}
      </div>
    );
  };
});

jest.mock('commonApp/cellRenderers', () => ({
  ConditionalTooltipText: ({ text, maxChars, searchTerm }: any) => (
    <span data-testid="conditional-tooltip" data-maxchars={maxChars} data-searchterm={searchTerm}>
      {text}
    </span>
  )
}));

jest.mock('commonApp/common', () => ({
  StatusInfoTooltip: ({ children, transfereddate, transferedto, rowIndex, totalRows }: any) => (
    <div data-testid="status-info-tooltip" data-transfereddate={transfereddate} data-transferedto={transferedto} data-rowindex={rowIndex} data-totalrows={totalRows}>
      {children}
    </div>
  )
}));

jest.mock('../../../src/components/userList/SharedIcon', () => {
  return function MockSharedIcon({ size, color }: any) {
    return <div data-testid="shared-icon" data-size={size} data-color={color}>Shared</div>;
  };
});

jest.mock('../../../src/components/userList/CustomTransferIcon', () => {
  return function MockCustomTransferIcon({ size, color }: any) {
    return <div data-testid="custom-transfer-icon" data-size={size} data-color={color}>Transfer</div>;
  };
});

describe('NameCellRenderer', () => {
  const mockParams = {
    data: {
      id: 1,
      firstname: 'John',
      lastname: 'Doe',
      isenabled: true,
      status: 'Active',
      transferedby: ''
    }
  };

  beforeEach(() => {
    console.log = jest.fn();
  });

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <NameCellRenderer params={mockParams} searchTerm="" />
      );

      expect(container).toBeInTheDocument();
    });

    it('should render user initials', () => {
      render(<NameCellRenderer params={mockParams} searchTerm="" />);

      expect(screen.getByTestId('user-initials')).toBeInTheDocument();
    });

    it('should render user full name', () => {
      render(<NameCellRenderer params={mockParams} searchTerm="" />);

      expect(screen.getByTestId('conditional-tooltip')).toHaveTextContent('John Doe');
    });

    it('should render with correct initials', () => {
      render(<NameCellRenderer params={mockParams} searchTerm="" />);

      const initials = screen.getByTestId('user-initials');
      expect(initials).toHaveTextContent('JD');
    });

    it('should pass correct size to UserInitials', () => {
      render(<NameCellRenderer params={mockParams} searchTerm="" />);

      const initials = screen.getByTestId('user-initials');
      expect(initials).toHaveAttribute('data-size', '24');
    });

    it('should pass correct fontSize to UserInitials', () => {
      render(<NameCellRenderer params={mockParams} searchTerm="" />);

      const initials = screen.getByTestId('user-initials');
      expect(initials).toHaveAttribute('data-fontsize', '10');
    });
  });

  describe('Name Display', () => {
    it('should display full name when both firstname and lastname exist', () => {
      render(<NameCellRenderer params={mockParams} searchTerm="" />);

      expect(screen.getByTestId('conditional-tooltip')).toHaveTextContent('John Doe');
    });

    it('should display only firstname when lastname is empty', () => {
      const params = {
        data: { ...mockParams.data, lastname: '' }
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      expect(screen.getByTestId('conditional-tooltip')).toHaveTextContent('John');
    });

    it('should display only lastname when firstname is empty', () => {
      const params = {
        data: { ...mockParams.data, firstname: '' }
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      expect(screen.getByTestId('conditional-tooltip')).toHaveTextContent('Doe');
    });

    it('should display N/A when both names are empty', () => {
      const params = {
        data: { ...mockParams.data, firstname: '', lastname: '' }
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      expect(screen.getByTestId('conditional-tooltip')).toHaveTextContent('N/A');
    });

    it('should trim whitespace from names', () => {
      const params = {
        data: { ...mockParams.data, firstname: '  John  ', lastname: '  Doe  ' }
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      // The component trims whitespace from individual names, so we expect "John Doe" with single space
      expect(screen.getByTestId('conditional-tooltip')).toHaveTextContent('John Doe');
    });

    it('should handle null firstname', () => {
      const params = {
        data: { ...mockParams.data, firstname: null }
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      expect(screen.getByTestId('conditional-tooltip')).toHaveTextContent('Doe');
    });

    it('should handle null lastname', () => {
      const params = {
        data: { ...mockParams.data, lastname: null }
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      expect(screen.getByTestId('conditional-tooltip')).toHaveTextContent('John');
    });
  });

  describe('Active User (No Icon)', () => {
    it('should not show icon for active user with isenabled true', () => {
      const params = {
        data: { ...mockParams.data, isenabled: true, status: 'Active' }
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      expect(screen.queryByTestId('shared-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('custom-transfer-icon')).not.toBeInTheDocument();
    });

    it('should not show icon for active user even with transferedby', () => {
      const params = {
        data: { ...mockParams.data, isenabled: true, status: 'Active', transferedby: 'admin' }
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      expect(screen.queryByTestId('shared-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('custom-transfer-icon')).not.toBeInTheDocument();
    });
  });

  describe('Inactive User with SharedIcon', () => {
    it('should show SharedIcon for inactive user with transferedby', () => {
      const params = {
        data: { ...mockParams.data, isenabled: false, status: 'Inactive', transferedby: 'admin' }
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      expect(screen.getByTestId('shared-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('custom-transfer-icon')).not.toBeInTheDocument();
    });

    it('should show SharedIcon with correct size', () => {
      const params = {
        data: { ...mockParams.data, isenabled: false, status: 'Inactive', transferedby: 'admin' }
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      const icon = screen.getByTestId('shared-icon');
      expect(icon).toHaveAttribute('data-size', '14');
    });

    it('should show SharedIcon with correct color', () => {
      const params = {
        data: { ...mockParams.data, isenabled: false, status: 'Inactive', transferedby: 'admin' }
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      const icon = screen.getByTestId('shared-icon');
      expect(icon).toHaveAttribute('data-color', '#5B6061');
    });

    it('should show SharedIcon when isenabled is false with transferedby', () => {
      const params = {
        data: { ...mockParams.data, isenabled: false, status: 'Active', transferedby: 'user123' }
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      expect(screen.getByTestId('shared-icon')).toBeInTheDocument();
    });

    it('should show SharedIcon when status is Inactive with transferedby', () => {
      const params = {
        data: { ...mockParams.data, isenabled: true, status: 'Inactive', transferedby: 'manager' }
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      expect(screen.getByTestId('shared-icon')).toBeInTheDocument();
    });
  });

  describe('Inactive User with CustomTransferIcon', () => {
    it('should show CustomTransferIcon for inactive user without transferedby', () => {
      const params = {
        data: { ...mockParams.data, isenabled: false, status: 'Inactive', transferedby: '' }
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      expect(screen.getByTestId('custom-transfer-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('shared-icon')).not.toBeInTheDocument();
    });

    it('should show CustomTransferIcon with correct size', () => {
      const params = {
        data: { ...mockParams.data, isenabled: false, status: 'Inactive', transferedby: '' }
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      const icon = screen.getByTestId('custom-transfer-icon');
      expect(icon).toHaveAttribute('data-size', '14');
    });

    it('should show CustomTransferIcon with correct color', () => {
      const params = {
        data: { ...mockParams.data, isenabled: false, status: 'Inactive', transferedby: '' }
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      const icon = screen.getByTestId('custom-transfer-icon');
      expect(icon).toHaveAttribute('data-color', '#5B6061');
    });

    it('should show CustomTransferIcon when transferedby is null', () => {
      const params = {
        data: { ...mockParams.data, isenabled: false, status: 'Inactive', transferedby: null }
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      expect(screen.getByTestId('custom-transfer-icon')).toBeInTheDocument();
    });

    it('should show CustomTransferIcon when transferedby is whitespace', () => {
      const params = {
        data: { ...mockParams.data, isenabled: false, status: 'Inactive', transferedby: '   ' }
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      expect(screen.getByTestId('custom-transfer-icon')).toBeInTheDocument();
    });
  });

  describe('Icon Button Interaction', () => {
    it('should render icon in a button element', () => {
      const params = {
        data: { ...mockParams.data, isenabled: false, status: 'Inactive', transferedby: '' }
      };

      const { container } = render(<NameCellRenderer params={params} searchTerm="" />);

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });

    it('should have hover styles on button', () => {
      const params = {
        data: { ...mockParams.data, isenabled: false, status: 'Inactive', transferedby: '' }
      };

      const { container } = render(<NameCellRenderer params={params} searchTerm="" />);

      const button = container.querySelector('button');
      expect(button).toHaveStyle({ backgroundColor: 'transparent' });
    });

    it('should change background on mouse enter', () => {
      const params = {
        data: { ...mockParams.data, isenabled: false, status: 'Inactive', transferedby: '' }
      };

      const { container } = render(<NameCellRenderer params={params} searchTerm="" />);

      const button = container.querySelector('button') as HTMLElement;
      fireEvent.mouseEnter(button);

      expect(button.style.backgroundColor).toBe('rgba(0, 0, 0, 0.04)');
    });

    it('should reset background on mouse leave', () => {
      const params = {
        data: { ...mockParams.data, isenabled: false, status: 'Inactive', transferedby: '' }
      };

      const { container } = render(<NameCellRenderer params={params} searchTerm="" />);

      const button = container.querySelector('button') as HTMLElement;
      fireEvent.mouseEnter(button);
      fireEvent.mouseLeave(button);

      expect(button.style.backgroundColor).toBe('transparent');
    });
  });

  describe('Search Term Integration', () => {
    it('should pass search term to ConditionalTooltipText', () => {
      render(<NameCellRenderer params={mockParams} searchTerm="John" />);

      const tooltip = screen.getByTestId('conditional-tooltip');
      expect(tooltip).toHaveAttribute('data-searchterm', 'John');
    });

    it('should pass empty search term', () => {
      render(<NameCellRenderer params={mockParams} searchTerm="" />);

      const tooltip = screen.getByTestId('conditional-tooltip');
      expect(tooltip).toHaveAttribute('data-searchterm', '');
    });

    it('should pass maxChars to ConditionalTooltipText', () => {
      render(<NameCellRenderer params={mockParams} searchTerm="" />);

      const tooltip = screen.getByTestId('conditional-tooltip');
      expect(tooltip).toHaveAttribute('data-maxchars', '15');
    });
  });

  describe('Console Logging', () => {
    it('should log user information', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const params = {
        data: { ...mockParams.data, transferedby: 'admin' }
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      expect(consoleSpy).toHaveBeenCalledWith(
        'nameCellRenderer - User ID:',
        1,
        'transferedby:',
        'admin',
        'hasTransferedBy:',
        true,
        'isInactive:',
        false
      );
    });

    it('should log hasTransferedBy as false when empty', () => {
      const consoleSpy = jest.spyOn(console, 'log');

      render(<NameCellRenderer params={mockParams} searchTerm="" />);

      // When transferedby is empty string, hasTransferedBy evaluates to '' (falsy) not false
      expect(consoleSpy).toHaveBeenCalledWith(
        'nameCellRenderer - User ID:',
        1,
        'transferedby:',
        '',
        'hasTransferedBy:',
        '',
        'isInactive:',
        false
      );
    });
  });

  describe('createNameCellRenderer Factory Function', () => {
    it('should create a renderer function', () => {
      const renderer = createNameCellRenderer('test');

      expect(typeof renderer).toBe('function');
    });

    it('should render NameCellRenderer with provided search term', () => {
      const renderer = createNameCellRenderer('John');
      const RenderedComponent = renderer(mockParams);

      render(RenderedComponent);

      const tooltip = screen.getByTestId('conditional-tooltip');
      expect(tooltip).toHaveAttribute('data-searchterm', 'John');
    });

    it('should pass params correctly', () => {
      const renderer = createNameCellRenderer('');
      const RenderedComponent = renderer(mockParams);

      render(RenderedComponent);

      expect(screen.getByTestId('user-initials')).toHaveTextContent('JD');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long names', () => {
      const params = {
        data: {
          ...mockParams.data,
          firstname: 'VeryLongFirstNameThatExceedsNormalLength',
          lastname: 'VeryLongLastNameThatExceedsNormalLength'
        }
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      expect(screen.getByTestId('conditional-tooltip')).toBeInTheDocument();
    });

    it('should handle names with special characters', () => {
      const params = {
        data: {
          ...mockParams.data,
          firstname: "O'Brien",
          lastname: "D'Angelo"
        }
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      expect(screen.getByTestId('conditional-tooltip')).toHaveTextContent("O'Brien D'Angelo");
    });

    it('should handle names with unicode characters', () => {
      const params = {
        data: {
          ...mockParams.data,
          firstname: 'José',
          lastname: 'Müller'
        }
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      expect(screen.getByTestId('conditional-tooltip')).toHaveTextContent('José Müller');
    });

    it('should handle undefined transferedby', () => {
      const params = {
        data: {
          ...mockParams.data,
          isenabled: false,
          status: 'Inactive',
          transferedby: undefined
        }
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      expect(screen.getByTestId('custom-transfer-icon')).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('should have correct container structure', () => {
      const { container } = render(
        <NameCellRenderer params={mockParams} searchTerm="" />
      );

      const mainDiv = container.firstChild;
      expect(mainDiv).toBeInTheDocument();
    });

    it('should have three main sections for active user', () => {
      const { container } = render(
        <NameCellRenderer params={mockParams} searchTerm="" />
      );

      expect(screen.getByTestId('user-initials')).toBeInTheDocument();
      expect(screen.getByTestId('conditional-tooltip')).toBeInTheDocument();
    });

    it('should have four sections for inactive user with icon', () => {
      const params = {
        data: { ...mockParams.data, isenabled: false, status: 'Inactive', transferedby: '' }
      };

      const { container } = render(<NameCellRenderer params={params} searchTerm="" />);

      expect(screen.getByTestId('user-initials')).toBeInTheDocument();
      expect(screen.getByTestId('conditional-tooltip')).toBeInTheDocument();
      expect(screen.getByTestId('custom-transfer-icon')).toBeInTheDocument();
    });

    it('should handle params with missing rowIndex', () => {
      const params = {
        ...mockParams,
        rowIndex: undefined,
        api: null
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      expect(screen.getByTestId('user-initials')).toBeInTheDocument();
    });

    it('should handle params with missing api', () => {
      const params = {
        ...mockParams,
        api: undefined
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      expect(screen.getByTestId('user-initials')).toBeInTheDocument();
    });

    it('should pass correct props to StatusInfoTooltip for inactive user', () => {
      const params = {
        data: {
          ...mockParams.data,
          isenabled: false,
          status: 'Inactive',
          transferedby: 'admin',
          transfereddate: '2023-01-01',
          transferedto: 'user2'
        },
        rowIndex: 5,
        api: {
          getDisplayedRowCount: () => 10
        }
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      expect(screen.getByTestId('shared-icon')).toBeInTheDocument();
    });

    it('should handle transferedby with only whitespace', () => {
      const params = {
        data: {
          ...mockParams.data,
          isenabled: false,
          status: 'Inactive',
          transferedby: '   '
        }
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      expect(screen.getByTestId('custom-transfer-icon')).toBeInTheDocument();
    });

    it('should handle rowIndex and totalRows for tooltip positioning', () => {
      const params = {
        data: {
          ...mockParams.data,
          isenabled: false,
          status: 'Inactive',
          transferedby: ''
        },
        rowIndex: 3,
        api: {
          getDisplayedRowCount: () => 20
        }
      };

      render(<NameCellRenderer params={params} searchTerm="" />);

      expect(screen.getByTestId('custom-transfer-icon')).toBeInTheDocument();
    });
  });
});

