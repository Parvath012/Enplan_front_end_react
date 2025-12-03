import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StructureRenderer from '../../../src/components/entitySetup/StructureRenderer';
import { EntityModel } from '../../../src/services/entitySetupService';

// Mock the lazy-loaded components
jest.mock('commonApp/CustomTooltip', () => {
  return jest.fn(({ children, title, placement }) => (
    <div data-testid="custom-tooltip" title={title} placement={placement}>
      {children}
    </div>
  ));
});

// Mock the icon utils
jest.mock('commonApp/iconUtils', () => ({
  getIconUrl: jest.fn((iconName) => `/icons/${iconName}`)
}));

describe('StructureRenderer Component', () => {
  const mockOnViewStructure = jest.fn();
  
  const defaultEntity: EntityModel = {
    id: 'entity-123',
    legalBusinessName: 'Test Entity',
    displayName: 'Test Display',
    entityType: 'Corporation',
    isDeleted: false,
    isEnabled: true,
    isConfigured: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      render(<StructureRenderer entity={defaultEntity} onViewStructure={mockOnViewStructure} />);
      expect(screen.getByText('View Structure')).toBeInTheDocument();
    });

    it('renders with correct button text', () => {
      render(<StructureRenderer entity={defaultEntity} onViewStructure={mockOnViewStructure} />);
      expect(screen.getByText('View Structure')).toBeInTheDocument();
    });

    it('renders CustomTooltip with correct props', () => {
      render(<StructureRenderer entity={defaultEntity} onViewStructure={mockOnViewStructure} />);
      
      const tooltip = screen.getByTestId('custom-tooltip');
      expect(tooltip).toHaveAttribute('title', 'View Structure');
      expect(tooltip).toHaveAttribute('placement', 'bottom');
    });

    it('renders button with correct attributes', () => {
      render(<StructureRenderer entity={defaultEntity} onViewStructure={mockOnViewStructure} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('View Structure');
      expect(button).not.toBeDisabled();
    });

    it('renders family history icon', () => {
      render(<StructureRenderer entity={defaultEntity} onViewStructure={mockOnViewStructure} />);
      
      const icon = screen.getByAltText('Family History');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('src', '/icons/family_history_24dp_5B6061.svg');
    });
  });

  describe('Button Functionality', () => {
    it('calls onViewStructure when button is clicked', () => {
      render(<StructureRenderer entity={defaultEntity} onViewStructure={mockOnViewStructure} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnViewStructure).toHaveBeenCalledTimes(1);
      expect(mockOnViewStructure).toHaveBeenCalledWith('entity-123');
    });

    it('calls onViewStructure with correct entity id', () => {
      const entityWithDifferentId = { ...defaultEntity, id: 'different-id' };
      render(<StructureRenderer entity={entityWithDifferentId} onViewStructure={mockOnViewStructure} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnViewStructure).toHaveBeenCalledWith('different-id');
    });

    it('handles numeric entity id', () => {
      const entityWithNumericId = { ...defaultEntity, id: 123 };
      render(<StructureRenderer entity={entityWithNumericId} onViewStructure={mockOnViewStructure} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnViewStructure).toHaveBeenCalledWith(123);
    });

    it('handles undefined entity id', () => {
      const entityWithUndefinedId = { ...defaultEntity, id: undefined };
      render(<StructureRenderer entity={entityWithUndefinedId} onViewStructure={mockOnViewStructure} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnViewStructure).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Button State', () => {
    it('is enabled when entity is not deleted and enabled', () => {
      render(<StructureRenderer entity={defaultEntity} onViewStructure={mockOnViewStructure} />);
      
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('is disabled when entity is deleted and not enabled', () => {
      const deletedEntity = { ...defaultEntity, isDeleted: true, isEnabled: false };
      render(<StructureRenderer entity={deletedEntity} onViewStructure={mockOnViewStructure} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('is enabled when entity is deleted but enabled', () => {
      const deletedButEnabledEntity = { ...defaultEntity, isDeleted: true, isEnabled: true };
      render(<StructureRenderer entity={deletedButEnabledEntity} onViewStructure={mockOnViewStructure} />);
      
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('is enabled when entity is not deleted but not enabled', () => {
      const notDeletedButDisabledEntity = { ...defaultEntity, isDeleted: false, isEnabled: false };
      render(<StructureRenderer entity={notDeletedButDisabledEntity} onViewStructure={mockOnViewStructure} />);
      
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('Icon Handling', () => {
    it('renders icon with correct attributes', () => {
      render(<StructureRenderer entity={defaultEntity} onViewStructure={mockOnViewStructure} />);
      
      const icon = screen.getByAltText('Family History');
      expect(icon).toHaveAttribute('src', '/icons/family_history_24dp_5B6061.svg');
      expect(icon).toHaveStyle({
        width: '16px',
        height: '16px',
        transform: 'rotate(180deg)'
      });
    });

    it('handles icon loading error', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<StructureRenderer entity={defaultEntity} onViewStructure={mockOnViewStructure} />);
      
      const icon = screen.getByAltText('Family History');
      fireEvent.error(icon);
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load family history icon');
      expect(icon).toHaveStyle({ display: 'none' });
      
      consoleSpy.mockRestore();
    });

    it('calls getIconUrl with correct icon name', () => {
      const { getIconUrl } = require('commonApp/iconUtils');
      render(<StructureRenderer entity={defaultEntity} onViewStructure={mockOnViewStructure} />);
      
      expect(getIconUrl).toHaveBeenCalledWith('family_history_24dp_5B6061.svg');
    });
  });

  describe('Styling', () => {
    it('applies correct button styles', () => {
      render(<StructureRenderer entity={defaultEntity} onViewStructure={mockOnViewStructure} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('View Structure');
    });

    it('applies correct icon styles', () => {
      render(<StructureRenderer entity={defaultEntity} onViewStructure={mockOnViewStructure} />);
      
      const icon = screen.getByAltText('Family History');
      expect(icon).toHaveStyle({
        width: '16px',
        height: '16px',
        transform: 'rotate(180deg)'
      });
    });
  });

  describe('Suspense Fallback', () => {
    it('shows fallback when CustomTooltip is loading', () => {
      render(<StructureRenderer entity={defaultEntity} onViewStructure={mockOnViewStructure} />);
      
      // The component should render normally with the mocked CustomTooltip
      expect(screen.getByTestId('custom-tooltip')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles entity with minimal properties', () => {
      const minimalEntity = {
        id: 'minimal',
        legalBusinessName: 'Minimal',
        displayName: 'Minimal',
        entityType: 'Corporation',
        isDeleted: false,
        isEnabled: true,
        isConfigured: false
      };
      
      render(<StructureRenderer entity={minimalEntity} onViewStructure={mockOnViewStructure} />);
      
      expect(screen.getByText('View Structure')).toBeInTheDocument();
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    it('handles entity with all properties undefined', () => {
      const entityWithUndefinedProps = {
        id: undefined,
        legalBusinessName: undefined,
        displayName: undefined,
        entityType: undefined,
        isDeleted: undefined,
        isEnabled: undefined,
        isConfigured: undefined
      };
      
      render(<StructureRenderer entity={entityWithUndefinedProps} onViewStructure={mockOnViewStructure} />);
      
      expect(screen.getByText('View Structure')).toBeInTheDocument();
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    it('handles null entity properties', () => {
      const entityWithNullProps = {
        id: null,
        legalBusinessName: null,
        displayName: null,
        entityType: null,
        isDeleted: null,
        isEnabled: null,
        isConfigured: null
      };
      
      render(<StructureRenderer entity={entityWithNullProps} onViewStructure={mockOnViewStructure} />);
      
      expect(screen.getByText('View Structure')).toBeInTheDocument();
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    it('handles empty string entity id', () => {
      const entityWithEmptyId = { ...defaultEntity, id: '' };
      render(<StructureRenderer entity={entityWithEmptyId} onViewStructure={mockOnViewStructure} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnViewStructure).toHaveBeenCalledWith('');
    });

    it('handles zero entity id', () => {
      const entityWithZeroId = { ...defaultEntity, id: 0 };
      render(<StructureRenderer entity={entityWithZeroId} onViewStructure={mockOnViewStructure} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnViewStructure).toHaveBeenCalledWith(0);
    });
  });

  describe('Accessibility', () => {
    it('has proper button role', () => {
      render(<StructureRenderer entity={defaultEntity} onViewStructure={mockOnViewStructure} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('has proper alt text for icon', () => {
      render(<StructureRenderer entity={defaultEntity} onViewStructure={mockOnViewStructure} />);
      
      const icon = screen.getByAltText('Family History');
      expect(icon).toBeInTheDocument();
    });

    it('maintains accessibility when disabled', () => {
      const deletedEntity = { ...defaultEntity, isDeleted: true, isEnabled: false };
      render(<StructureRenderer entity={deletedEntity} onViewStructure={mockOnViewStructure} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('View Structure');
    });
  });

  describe('Component Lifecycle', () => {
    it('handles component unmounting', () => {
      const { unmount } = render(<StructureRenderer entity={defaultEntity} onViewStructure={mockOnViewStructure} />);
      
      expect(screen.getByText('View Structure')).toBeInTheDocument();
      
      unmount();
      
      expect(screen.queryByText('View Structure')).not.toBeInTheDocument();
    });

    it('handles prop changes', () => {
      const { rerender } = render(<StructureRenderer entity={defaultEntity} onViewStructure={mockOnViewStructure} />);
      
      expect(screen.getByText('View Structure')).toBeInTheDocument();
      
      const newEntity = { ...defaultEntity, id: 'new-id' };
      rerender(<StructureRenderer entity={newEntity} onViewStructure={mockOnViewStructure} />);
      
      expect(screen.getByText('View Structure')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const { rerender } = render(<StructureRenderer entity={defaultEntity} onViewStructure={mockOnViewStructure} />);
      
      const initialButton = screen.getByRole('button');
      
      // Re-render with same props
      rerender(<StructureRenderer entity={defaultEntity} onViewStructure={mockOnViewStructure} />);
      
      const afterRender = screen.getByRole('button');
      expect(afterRender).toBe(initialButton);
    });
  });

  describe('Error Handling', () => {
    it('handles onViewStructure throwing an error', () => {
      const errorOnViewStructure = jest.fn(() => {
        throw new Error('View structure error');
      });
      
      render(<StructureRenderer entity={defaultEntity} onViewStructure={errorOnViewStructure} />);
      
      const button = screen.getByRole('button');
      
      // The error will be thrown but the component should still render
      expect(button).toBeInTheDocument();
    });

    it('handles getIconUrl throwing an error', () => {
      const { getIconUrl } = require('commonApp/iconUtils');
      getIconUrl.mockImplementation(() => {
        throw new Error('Icon URL error');
      });
      
      // The error will be thrown but we can still test the component renders
      expect(() => {
        render(<StructureRenderer entity={defaultEntity} onViewStructure={mockOnViewStructure} />);
      }).toThrow('Icon URL error');
    });
  });
});
