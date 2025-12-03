import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ListToolbar from '../../../src/components/toolbar/ListToolbar';

// Mock the lazy-loaded components
jest.mock('commonApp/CustomTooltip', () => {
  return jest.fn(({ children, title, placement }) => (
    <div data-testid={`tooltip-${title}`} data-placement={placement}>
      {children}
    </div>
  ));
});

describe('ListToolbar Component', () => {
  const mockOnSearchClick = jest.fn();
  const mockOnAddClick = jest.fn();
  const mockOnSearchChange = jest.fn();
  const mockOnSearchClose = jest.fn();
  const mockOnFilterToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the focus method for the inputRef
    Object.defineProperty(HTMLInputElement.prototype, 'focus', {
      writable: true,
      value: jest.fn(),
    });
  });

  describe('Component Rendering', () => {
    it('renders search, filter, and add buttons by default', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
        />
      );

      expect(screen.getByTestId('tooltip-Search')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-Filter')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Add/i })).toBeInTheDocument();
    });

    it('renders search input when search is active', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue="test"
        />
      );

      expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test')).toBeInTheDocument();
    });

    it('does not render search input when search is not active', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={false}
        />
      );

      expect(screen.queryByPlaceholderText('Search')).not.toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('calls onSearchClick when search icon is clicked and search is not active', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={false}
        />
      );

      const searchButton = screen.getByTestId('tooltip-Search').querySelector('button');
      fireEvent.click(searchButton!);
      expect(mockOnSearchClick).toHaveBeenCalledTimes(1);
    });

    it('calls onSearchClose when search icon is clicked and search is active', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchClose={mockOnSearchClose}
        />
      );

      const searchButton = screen.getByTestId('tooltip-Search').querySelector('button');
      fireEvent.click(searchButton!);
      expect(mockOnSearchClose).toHaveBeenCalledTimes(1);
    });

    it('calls onSearchChange when search input value changes', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue=""
        />
      );

      const searchInput = screen.getByPlaceholderText('Search');
      fireEvent.change(searchInput, { target: { value: 'new search term' } });
      expect(mockOnSearchChange).toHaveBeenCalledWith('new search term');
    });

    it('shows clear search button when searchValue is present', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue="some value"
        />
      );

      expect(screen.getByTestId('tooltip-Clear')).toBeInTheDocument();
    });

    it('calls onSearchChange with empty string when clear search button is clicked', async () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue="some value"
        />
      );

      const clearButton = screen.getByTestId('tooltip-Clear').querySelector('button');
      fireEvent.click(clearButton!);
      expect(mockOnSearchChange).toHaveBeenCalledWith('');
    });

    it('focuses search input when search becomes active', async () => {
      const { rerender } = render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={false}
        />
      );

      const searchInput = screen.queryByPlaceholderText('Search');
      expect(searchInput).not.toBeInTheDocument();

      rerender(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
        />
      );

      await waitFor(() => {
        const activeSearchInput = screen.getByPlaceholderText('Search');
        expect(activeSearchInput).toBeInTheDocument();
        expect(activeSearchInput).toHaveFocus();
      });
    });
  });

  describe('Filter Functionality', () => {
    it('renders filter button as disabled', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          onFilterToggle={mockOnFilterToggle}
        />
      );

      const filterButton = screen.getByTestId('tooltip-Filter').querySelector('button');
      expect(filterButton).toBeDisabled();
    });

    it('does not call onFilterToggle when filter button is clicked (disabled)', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          onFilterToggle={mockOnFilterToggle}
        />
      );

      const filterButton = screen.getByTestId('tooltip-Filter').querySelector('button');
      fireEvent.click(filterButton!);
      expect(mockOnFilterToggle).not.toHaveBeenCalled();
    });
  });

  describe('Add Functionality', () => {
    it('calls onAddClick when add button is clicked', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
        />
      );

      const addButton = screen.getByRole('button', { name: /Add/i });
      fireEvent.click(addButton);
      expect(mockOnAddClick).toHaveBeenCalledTimes(1);
    });

    it('renders add button with correct styling', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
        />
      );

      const addButton = screen.getByRole('button', { name: /Add/i });
      expect(addButton).toHaveStyle({
        width: '56px',
        height: '22px',
        background: 'rgba(0, 111, 230, 1)',
        color: '#D0F0FF'
      });
    });
  });

  describe('Search Input Styling and Behavior', () => {
    it('applies correct styling to search input', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue="test"
        />
      );

      const searchInput = screen.getByPlaceholderText('Search');
      expect(searchInput).toHaveStyle({
        width: '150px',
        height: '22px'
      });
    });

    it('shows search icon in input adornment', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue=""
        />
      );

      const searchInput = screen.getByPlaceholderText('Search');
      const inputContainer = searchInput.closest('.MuiOutlinedInput-root');
      expect(inputContainer).toBeInTheDocument();
    });
  });

  describe('Search Button Styling', () => {
    it('applies active styling when search is active', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
        />
      );

      const searchButton = screen.getByTestId('tooltip-Search').querySelector('button');
      expect(searchButton).toHaveStyle({
        backgroundColor: 'rgba(0, 111, 230, 1)'
      });
    });

    it('applies inactive styling when search is not active', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={false}
        />
      );

      const searchButton = screen.getByTestId('tooltip-Search').querySelector('button');
      expect(searchButton).toHaveStyle({
        backgroundColor: 'transparent'
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles missing onSearchChange gracefully', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          searchValue="test"
        />
      );

      const searchInput = screen.getByPlaceholderText('Search');
      fireEvent.change(searchInput, { target: { value: 'new value' } });
      // Should not throw an error
      expect(searchInput).toHaveValue('new value');
    });

    it('handles missing onSearchClose gracefully', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
        />
      );

      const searchButton = screen.getByTestId('tooltip-Search').querySelector('button');
      fireEvent.click(searchButton!);
      // Should not throw an error
      expect(mockOnSearchClick).not.toHaveBeenCalled();
    });

    it('handles empty search value', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue=""
        />
      );

      const searchInput = screen.getByPlaceholderText('Search');
      expect(searchInput).toHaveValue('');
      expect(screen.queryByTestId('tooltip-Clear')).not.toBeInTheDocument();
    });

    it('handles undefined search value', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search');
      expect(searchInput).toHaveValue('');
    });
  });

  describe('Component Lifecycle', () => {
    it('handles component unmounting', () => {
      const { unmount } = render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
        />
      );

      expect(screen.getByTestId('tooltip-Search')).toBeInTheDocument();
      
      unmount();
      
      expect(screen.queryByTestId('tooltip-Search')).not.toBeInTheDocument();
    });

    it('handles prop changes', () => {
      const { rerender } = render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={false}
        />
      );

      expect(screen.queryByPlaceholderText('Search')).not.toBeInTheDocument();

      rerender(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue="new value"
        />
      );

      expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
      expect(screen.getByDisplayValue('new value')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper tooltips for all buttons', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          onFilterToggle={mockOnFilterToggle}
        />
      );

      expect(screen.getByTestId('tooltip-Search')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-Filter')).toBeInTheDocument();
    });

    it('has proper button roles', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
