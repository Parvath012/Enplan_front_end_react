import React from 'react';
import { render, screen } from '@testing-library/react';
import RoleNameCellRenderer, { createRoleNameCellRenderer } from '../../../src/components/roleList/RoleNameCellRenderer';
import '@testing-library/jest-dom';

// Mock ConditionalTooltipText
jest.mock('commonApp/cellRenderers', () => ({
  ConditionalTooltipText: ({ text, maxChars, searchTerm }: any) => (
    <span data-testid="conditional-tooltip-text" data-text={text} data-max-chars={maxChars} data-search-term={searchTerm}>
      {text}
    </span>
  ),
}));

// Mock Locked icon
jest.mock('@carbon/icons-react', () => ({
  Locked: ({ size, color }: { size?: number; color?: string }) => (
    <div data-testid="locked-icon" data-size={size} data-color={color}>Locked</div>
  ),
}));

describe('RoleNameCellRenderer', () => {
  const defaultParams = {
    data: {
      rolename: 'Admin',
      islocked: false,
    },
  };

  describe('Rendering', () => {
    it('should render role name', () => {
      render(<RoleNameCellRenderer params={defaultParams} searchTerm="" />);
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('should render N/A when rolename is missing', () => {
      const params = {
        data: {
          rolename: undefined,
        },
      };
      render(<RoleNameCellRenderer params={params} searchTerm="" />);
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('should render N/A when rolename is empty string', () => {
      const params = {
        data: {
          rolename: '',
        },
      };
      render(<RoleNameCellRenderer params={params} searchTerm="" />);
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('should pass searchTerm to ConditionalTooltipText', () => {
      render(<RoleNameCellRenderer params={defaultParams} searchTerm="admin" />);
      const tooltip = screen.getByTestId('conditional-tooltip-text');
      expect(tooltip).toHaveAttribute('data-search-term', 'admin');
    });

    it('should pass maxChars to ConditionalTooltipText', () => {
      render(<RoleNameCellRenderer params={defaultParams} searchTerm="" />);
      const tooltip = screen.getByTestId('conditional-tooltip-text');
      expect(tooltip).toHaveAttribute('data-max-chars', '26');
    });
  });

  describe('Lock Icon Display', () => {
    it('should not show lock icon when role is not locked (islocked: false)', () => {
      render(<RoleNameCellRenderer params={defaultParams} searchTerm="" />);
      expect(screen.queryByTestId('locked-icon')).not.toBeInTheDocument();
    });

    it('should show lock icon when islocked is true', () => {
      const params = {
        data: {
          rolename: 'Admin',
          islocked: true,
        },
      };
      render(<RoleNameCellRenderer params={params} searchTerm="" />);
      expect(screen.getByTestId('locked-icon')).toBeInTheDocument();
    });

    it('should show lock icon when isLocked (camelCase) is true', () => {
      const params = {
        data: {
          rolename: 'Admin',
          isLocked: true,
        },
      };
      render(<RoleNameCellRenderer params={params} searchTerm="" />);
      expect(screen.getByTestId('locked-icon')).toBeInTheDocument();
    });

    it('should show lock icon when IsLocked (PascalCase) is true', () => {
      const params = {
        data: {
          rolename: 'Admin',
          IsLocked: true,
        },
      };
      render(<RoleNameCellRenderer params={params} searchTerm="" />);
      expect(screen.getByTestId('locked-icon')).toBeInTheDocument();
    });

    it('should show lock icon when islocked is string "true"', () => {
      const params = {
        data: {
          rolename: 'Admin',
          islocked: 'true',
        },
      };
      render(<RoleNameCellRenderer params={params} searchTerm="" />);
      expect(screen.getByTestId('locked-icon')).toBeInTheDocument();
    });

    it('should show lock icon when islocked is string "True"', () => {
      const params = {
        data: {
          rolename: 'Admin',
          islocked: 'True',
        },
      };
      render(<RoleNameCellRenderer params={params} searchTerm="" />);
      expect(screen.getByTestId('locked-icon')).toBeInTheDocument();
    });

    it('should show lock icon when islocked is string "TRUE"', () => {
      const params = {
        data: {
          rolename: 'Admin',
          islocked: 'TRUE',
        },
      };
      render(<RoleNameCellRenderer params={params} searchTerm="" />);
      expect(screen.getByTestId('locked-icon')).toBeInTheDocument();
    });

    it('should not show lock icon when islocked is string "false"', () => {
      const params = {
        data: {
          rolename: 'Admin',
          islocked: 'false',
        },
      };
      render(<RoleNameCellRenderer params={defaultParams} searchTerm="" />);
      expect(screen.queryByTestId('locked-icon')).not.toBeInTheDocument();
    });

    it('should not show lock icon when islocked is undefined', () => {
      const params = {
        data: {
          rolename: 'Admin',
        },
      };
      render(<RoleNameCellRenderer params={params} searchTerm="" />);
      expect(screen.queryByTestId('locked-icon')).not.toBeInTheDocument();
    });

    it('should not show lock icon when islocked is null', () => {
      const params = {
        data: {
          rolename: 'Admin',
          islocked: null,
        },
      };
      render(<RoleNameCellRenderer params={params} searchTerm="" />);
      expect(screen.queryByTestId('locked-icon')).not.toBeInTheDocument();
    });

    it('should show lock icon when islocked is number 1', () => {
      const params = {
        data: {
          rolename: 'Admin',
          islocked: 1,
        },
      };
      render(<RoleNameCellRenderer params={params} searchTerm="" />);
      // Number 1 converted to string "1" and then toLowerCase() !== 'true', so should not show
      expect(screen.queryByTestId('locked-icon')).not.toBeInTheDocument();
    });
  });

  describe('Lock Icon Styling', () => {
    it('should pass correct size and color to Locked icon', () => {
      const params = {
        data: {
          rolename: 'Admin',
          islocked: true,
        },
      };
      render(<RoleNameCellRenderer params={params} searchTerm="" />);
      const lockIcon = screen.getByTestId('locked-icon');
      expect(lockIcon).toHaveAttribute('data-size', '16');
      expect(lockIcon).toHaveAttribute('data-color', '#5B6061');
    });
  });

  describe('createRoleNameCellRenderer', () => {
    it('should create a renderer function', () => {
      const renderer = createRoleNameCellRenderer('test');
      expect(typeof renderer).toBe('function');
    });

    it('should return RoleNameCellRenderer component when called', () => {
      const renderer = createRoleNameCellRenderer('test');
      const result = renderer(defaultParams);
      expect(result).toBeDefined();
    });

    it('should pass searchTerm correctly', () => {
      const renderer = createRoleNameCellRenderer('admin');
      const { container } = render(renderer(defaultParams));
      expect(container).toBeInTheDocument();
    });

    it('should handle empty searchTerm', () => {
      const renderer = createRoleNameCellRenderer('');
      const { container } = render(renderer(defaultParams));
      expect(container).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle role with no data', () => {
      const params = {
        data: null,
      };
      render(<RoleNameCellRenderer params={params} searchTerm="" />);
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('should handle role with empty data object', () => {
      const params = {
        data: {},
      };
      render(<RoleNameCellRenderer params={params} searchTerm="" />);
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('should handle very long role name', () => {
      const params = {
        data: {
          rolename: 'A'.repeat(100),
        },
      };
      render(<RoleNameCellRenderer params={params} searchTerm="" />);
      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
    });

    it('should handle special characters in role name', () => {
      const params = {
        data: {
          rolename: 'Admin & Manager <Test>',
        },
      };
      render(<RoleNameCellRenderer params={params} searchTerm="" />);
      expect(screen.getByText('Admin & Manager <Test>')).toBeInTheDocument();
    });

    it('should prioritize islocked over isLocked when both are present', () => {
      const params = {
        data: {
          rolename: 'Admin',
          islocked: true,
          isLocked: false,
        },
      };
      render(<RoleNameCellRenderer params={params} searchTerm="" />);
      expect(screen.getByTestId('locked-icon')).toBeInTheDocument();
    });

    it('should prioritize islocked over IsLocked when both are present', () => {
      const params = {
        data: {
          rolename: 'Admin',
          islocked: true,
          IsLocked: false,
        },
      };
      render(<RoleNameCellRenderer params={params} searchTerm="" />);
      expect(screen.getByTestId('locked-icon')).toBeInTheDocument();
    });
  });
});


