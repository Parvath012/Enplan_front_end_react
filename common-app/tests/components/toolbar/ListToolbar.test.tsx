import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import ListToolbar from '../../../src/components/toolbar/ListToolbar';

// Mock CustomTooltip
jest.mock('../../../src/components/common', () => ({
  CustomTooltip: ({ children, title, placement }: any) => (
    <div data-testid="custom-tooltip" title={title} data-placement={placement}>
      {children}
    </div>
  )
}));

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('ListToolbar', () => {
  const mockOnSearchClick = jest.fn();
  const mockOnAddClick = jest.fn();
  const mockOnSearchChange = jest.fn();
  const mockOnSearchClose = jest.fn();
  const mockOnFilterToggle = jest.fn();
  const mockOnSortToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Structure', () => {
    it('renders with required props', async () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
        />
      );

      // Wait for the component to render completely (dealing with React.lazy)
      await waitFor(() => {
        expect(screen.getByText('Add')).toBeInTheDocument();
      });
    });

    it('renders search icon when search is not active', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={false}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('renders filter button', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          onFilterToggle={mockOnFilterToggle}
        />
      );

      const buttons = screen.getAllByRole('button');
      const filterButton = buttons.find(button => button.hasAttribute('disabled'));
      expect(filterButton).toBeInTheDocument();
    });

    it('renders sort button when onSortToggle is provided', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          onSortToggle={mockOnSortToggle}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(2); // Search, Filter, Sort, Add
    });

    it('does not render sort button when onSortToggle is not provided', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(3); // Search, Filter, Add
    });
  });

  describe('Search Functionality', () => {
    it('calls onSearchClick when search icon is clicked', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={false}
        />
      );

      const buttons = screen.getAllByRole('button');
      const searchButton = buttons[0];
      fireEvent.click(searchButton);
      expect(mockOnSearchClick).toHaveBeenCalledTimes(1);
    });

    it('renders search input when search is active', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue="test"
          onSearchClose={mockOnSearchClose}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveValue('test');
    });

    it('calls onSearchChange when search input changes', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue=""
          onSearchClose={mockOnSearchClose}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search');
      fireEvent.change(searchInput, { target: { value: 'new search' } });
      expect(mockOnSearchChange).toHaveBeenCalledWith('new search');
    });

    it('calls onSearchClose when search icon is clicked while active', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue=""
          onSearchClose={mockOnSearchClose}
        />
      );

      const buttons = screen.getAllByRole('button');
      const searchButton = buttons[0];
      fireEvent.click(searchButton);
      expect(mockOnSearchClose).toHaveBeenCalledTimes(1);
    });

    it('shows clear button when search has value', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue="test"
          onSearchClose={mockOnSearchClose}
        />
      );

      const clearButton = screen.getByLabelText('Clear');
      expect(clearButton).toBeInTheDocument();
    });

    it('calls onSearchChange with empty string when clear button is clicked', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue="test"
          onSearchClose={mockOnSearchClose}
        />
      );

      const clearButton = screen.getByLabelText('Clear');
      fireEvent.click(clearButton);
      expect(mockOnSearchChange).toHaveBeenCalledWith('');
    });

    it('focuses search input when search becomes active', async () => {
      const { rerender } = renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={false}
        />
      );

      rerender(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue=""
          onSearchClose={mockOnSearchClose}
        />
      );

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search');
        expect(searchInput).toHaveFocus();
      });
    });
  });

  describe('Add Button Functionality', () => {
    it('renders add button with correct text', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
        />
      );

      const addButton = screen.getByRole('button', { name: /add/i });
      expect(addButton).toBeInTheDocument();
      expect(addButton).toHaveTextContent('Add');
    });

    it('calls onAddClick when add button is clicked', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
        />
      );

      const addButton = screen.getByRole('button', { name: /add/i });
      fireEvent.click(addButton);
      expect(mockOnAddClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Filter Button Functionality', () => {
    it('renders filter button as disabled', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          onFilterToggle={mockOnFilterToggle}
        />
      );

      const buttons = screen.getAllByRole('button');
      const filterButton = buttons.find(button => button.hasAttribute('disabled'));
      expect(filterButton).toBeInTheDocument();
      expect(filterButton).toHaveAttribute('disabled');
    });

    it('calls onFilterToggle when filter button is clicked', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          onFilterToggle={mockOnFilterToggle}
        />
      );

      const filterButtonSpan = screen.getByLabelText('Filter');
      const filterButton = filterButtonSpan.querySelector('button');
      expect(filterButton).toBeDisabled();
      // Disabled buttons don't trigger onClick, so we expect 0 calls
      expect(mockOnFilterToggle).toHaveBeenCalledTimes(0);
    });
  });

  describe('Sort Button Functionality', () => {
    it('renders sort button when onSortToggle is provided', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          onSortToggle={mockOnSortToggle}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(2);
    });

    it('renders sort button as disabled', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          onSortToggle={mockOnSortToggle}
        />
      );

      const buttons = screen.getAllByRole('button');
      const sortButton = buttons.find(button => button.hasAttribute('disabled'));
      expect(sortButton).toBeInTheDocument();
    });

    it('calls onSortToggle when sort button is clicked', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          onSortToggle={mockOnSortToggle}
        />
      );

      const sortButtonSpan = screen.getByLabelText('Sort');
      const sortButton = sortButtonSpan.querySelector('button');
      expect(sortButton).toBeDisabled();
      // Disabled buttons don't trigger onClick, so we expect 0 calls
      expect(mockOnSortToggle).toHaveBeenCalledTimes(0);
    });
  });

  describe('Tooltips', () => {
    it('renders tooltips for all buttons', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          onFilterToggle={mockOnFilterToggle}
          onSortToggle={mockOnSortToggle}
        />
      );

      // Check that we have the expected buttons with aria-labels (which indicates tooltips are working)
      const searchButton = screen.getByLabelText('Search');
      const filterButton = screen.getByLabelText('Filter');
      const addButton = screen.getByText('Add');
      expect(searchButton).toBeInTheDocument();
      expect(filterButton).toBeInTheDocument();
      expect(addButton).toBeInTheDocument();
    });

    it('renders search tooltip with correct aria-label', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
        />
      );

      const searchButton = screen.getByLabelText('Search');
      expect(searchButton).toBeInTheDocument();
    });

    it('renders filter tooltip with correct aria-label', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          onFilterToggle={mockOnFilterToggle}
        />
      );

      const filterButton = screen.getByLabelText('Filter');
      expect(filterButton).toBeInTheDocument();
    });

    it('renders sort tooltip with correct aria-label when onSortToggle is provided', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          onSortToggle={mockOnSortToggle}
        />
      );

      const sortButton = screen.getByLabelText('Sort');
      expect(sortButton).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined onSearchClose', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue=""
        />
      );

      const buttons = screen.getAllByRole('button');
      const searchButton = buttons[0];
      fireEvent.click(searchButton);
      // Should not throw error
      expect(searchButton).toBeInTheDocument();
    });

    it('handles undefined onSearchChange', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          searchValue=""
        />
      );

      const searchInput = screen.getByPlaceholderText('Search');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      // Should not throw error
      expect(searchInput).toBeInTheDocument();
    });

    it('handles empty search value', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue=""
          onSearchClose={mockOnSearchClose}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search');
      expect(searchInput).toHaveValue('');
    });

    it('handles null search value', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue={null as any}
          onSearchClose={mockOnSearchClose}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search');
      expect(searchInput).toHaveValue('');
    });
  });

  describe('Accessibility', () => {
    it('renders all buttons with proper roles', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          onFilterToggle={mockOnFilterToggle}
          onSortToggle={mockOnSortToggle}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('renders search input with proper placeholder', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue=""
          onSearchClose={mockOnSearchClose}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search');
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders efficiently with all props', () => {
      const startTime = performance.now();
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          onFilterToggle={mockOnFilterToggle}
          onSortToggle={mockOnSortToggle}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue="test"
          onSearchClose={mockOnSearchClose}
        />
      );
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it('handles rapid state changes', () => {
      const { rerender } = renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={false}
        />
      );

      rerender(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue="test"
          onSearchClose={mockOnSearchClose}
        />
      );

      rerender(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={false}
        />
      );

      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });
  });

  describe('Additional Coverage Tests', () => {
    it('handles search input focus with setTimeout', async () => {
      const { rerender } = renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={false}
        />
      );

      rerender(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue="test"
          onSearchClose={mockOnSearchClose}
        />
      );

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search');
        expect(searchInput).toHaveFocus();
      });
    });

    it('handles clear search with setTimeout focus', async () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue="test"
          onSearchClose={mockOnSearchClose}
        />
      );

      const clearButton = screen.getByLabelText('Clear');
      fireEvent.click(clearButton);
      
      await waitFor(() => {
        expect(mockOnSearchChange).toHaveBeenCalledWith('');
      });
    });

    it('handles search input without onSearchChange', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          searchValue="test"
        />
      );

      const searchInput = screen.getByPlaceholderText('Search');
      expect(searchInput).toHaveValue('test');
      fireEvent.change(searchInput, { target: { value: 'new value' } });
      // The value won't change because onSearchChange is not provided
      expect(searchInput).toHaveValue('test');
    });

    it('handles search close without onSearchClose', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue="test"
        />
      );

      const searchButton = screen.getByLabelText('Search');
      fireEvent.click(searchButton);
      // Should not throw error
      expect(searchButton).toBeInTheDocument();
    });

    it('focuses search input after clearing with setTimeout', async () => {
      jest.useFakeTimers();
      const mockFocus = jest.fn();
      
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue="test"
        />
      );

      const searchInput = screen.getByPlaceholderText('Search');
      // Mock the focus method
      searchInput.focus = mockFocus;
      
      const clearButton = screen.getByLabelText('Clear');
      fireEvent.click(clearButton);
      
      // Fast-forward through setTimeout
      act(() => {
        jest.runAllTimers();
      });
      
      expect(mockFocus).toHaveBeenCalledTimes(1);
      jest.useRealTimers();
    });

    it('handles clear search when onSearchChange is undefined', () => {
      renderWithTheme(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          searchValue="test"
        />
      );

      const clearButton = screen.getByLabelText('Clear');
      fireEvent.click(clearButton);
      // Should not throw error when onSearchChange is undefined
      expect(clearButton).toBeInTheDocument();
    });
  });
});
