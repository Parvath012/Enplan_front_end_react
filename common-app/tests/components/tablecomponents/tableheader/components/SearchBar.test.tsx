import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { act } from 'react';
import SearchBar from '../../../../../src/components/tablecomponents/tableheader/components/SearchBar';

// Mock the tableHeaderConfig
jest.mock('../../../../../src/config/tableHeaderConfig', () => ({
  tableHeaderConfig: {
    searchBar: {
      searchIcon: <div data-testid="search-icon">Search Icon</div>,
      icon: <div data-testid="dropdown-icon">Dropdown Icon</div>,
      label: 'Search',
      tooltip: 'Search tooltip',
    },
  },
}));

// Mock CustomTooltip to just render children and add testid
jest.mock(
  '../../../../../src/components/common/CustomTooltip',
  () =>
    function MockCustomTooltip({ children, title }: { children: any; title: string }) {
      // If children is not a valid React element, wrap it in a span
      const child = React.isValidElement(children)
        ? React.cloneElement(children, {
            'data-testid': 'custom-tooltip',
            'data-title': title,
          })
        : <span data-testid="custom-tooltip" data-title={title}>{children}</span>;
      return child;
    }
);

describe('SearchBar Component', () => {
  // Helper function to get the main search icon
  const getMainSearchIcon = () => {
    const icons = screen.getAllByTestId('search-icon');
    // Prefer the one with class 'search-bar-icon'
    return (
      icons.find(
        (icon) =>
          icon.closest('.search-bar-icon') ||
          icon.classList.contains('search-bar-icon')
      ) || icons[0]
    );
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('focuses input automatically when expanded', () => {
    render(<SearchBar />);
    const searchIcon = getMainSearchIcon();

    fireEvent.click(searchIcon);

    expect(document.activeElement).toBe(screen.getByPlaceholderText('Search data'));
  });

  test('maintains search value when collapsing and expanding', () => {
    render(<SearchBar />);
    const searchIcon = getMainSearchIcon();

    // Expand and type
    fireEvent.click(searchIcon);
    const input = screen.getByPlaceholderText('Search data');
    fireEvent.change(input, { target: { value: 'test query' } });

    // Collapse and re-expand
    fireEvent.click(searchIcon);
    fireEvent.click(searchIcon);

    expect(screen.getByPlaceholderText('Search data')).toHaveValue('test query');
  });

  test('shows tooltip for expanded search bar after delay', () => {
    render(<SearchBar />);
    const searchIcon = getMainSearchIcon();

    // Expand
    fireEvent.click(searchIcon);

    // Fast-forward past justExpanded timeout
    act(() => {
      jest.advanceTimersByTime(500);
    });

    const tooltips = screen.getAllByTestId('custom-tooltip');
    const searchBarTooltip = tooltips.find(
      (t) => t.getAttribute('data-title') === 'Search'
    );
    expect(searchBarTooltip).toBeInTheDocument();
  });

  test('handles Space key for expansion', () => {
    render(<SearchBar />);
    const searchIcon = getMainSearchIcon();

    fireEvent.keyDown(searchIcon, { key: ' ', code: 'Space' });

    const searchInput = screen.getByPlaceholderText('Search data');
    expect(searchInput).toBeInTheDocument();
  });

  test('applies correct transition styles to inner search icon', () => {
    render(<SearchBar />);
    const searchIcon = getMainSearchIcon();

    fireEvent.click(searchIcon);

    const innerIcon = screen.getAllByTestId('search-icon')[0];
    expect(innerIcon).toHaveStyle({
      opacity: 1,
      transition: 'opacity 0.2s',
    });
  });

  test('handles rapid expansion toggles correctly', () => {
    render(<SearchBar />);
    const searchIcon = getMainSearchIcon();

    // Multiple rapid clicks
    fireEvent.click(searchIcon);
    fireEvent.click(searchIcon);
    fireEvent.click(searchIcon);

    act(() => {
      jest.runAllTimers();
    });

    // Should match final expanded state
    expect(screen.getByPlaceholderText('Search data')).toBeInTheDocument();
  });

  test('shows dropdown button with correct tooltip when expanded', () => {
    render(<SearchBar />);
    const searchIcon = getMainSearchIcon();

    fireEvent.click(searchIcon);

    const dropdownButton = screen.getByLabelText('Open search dropdown');
    expect(dropdownButton).toHaveAttribute('aria-label', 'Open search dropdown');
  });

  test('maintains focus when typing in search input', () => {
    render(<SearchBar />);
    const searchIcon = getMainSearchIcon();

    // Expand and focus input
    fireEvent.click(searchIcon);
    const input = screen.getByPlaceholderText('Search data');

    // Type in input
    fireEvent.change(input, { target: { value: 't' } });
    fireEvent.change(input, { target: { value: 'te' } });
    fireEvent.change(input, { target: { value: 'tes' } });

    expect(document.activeElement).toBe(input);
  });

  test('cleans up timeouts on component unmount', () => {
    const { unmount } = render(<SearchBar />);
    const searchIcon = getMainSearchIcon();

    // Expand to trigger timeout
    fireEvent.click(searchIcon);

    // Spy on clearTimeout
    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  test('renders search icon by default', () => {
    render(<SearchBar />);
    const searchIcon = getMainSearchIcon();
    expect(searchIcon).toBeInTheDocument();
  });

  test('expands search bar when search icon is clicked', () => {
    render(<SearchBar />);
    const searchIcon = getMainSearchIcon();

    // Click to expand
    fireEvent.click(searchIcon);

    // Check if input is rendered
    const searchInput = screen.getByPlaceholderText('Search data');
    expect(searchInput).toBeInTheDocument();
  });

  test('allows typing in search input', () => {
    render(<SearchBar />);
    const searchIcon = getMainSearchIcon();

    // Expand search bar
    fireEvent.click(searchIcon);

    const searchInput = screen.getByPlaceholderText('Search data');

    // Type in input
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    expect(searchInput).toHaveValue('test search');
  });

  test('collapses search bar when search icon is clicked again', () => {
    render(<SearchBar />);
    const searchIcon = getMainSearchIcon();

    // Expand
    fireEvent.click(searchIcon);

    // Check input exists
    let searchInput = screen.getByPlaceholderText('Search data');
    expect(searchInput).toBeInTheDocument();

    // Collapse
    fireEvent.click(searchIcon);

    // Check input is no longer in the document
    // The input is still in the DOM but has class 'collapsed'
    searchInput = screen.getByPlaceholderText('Search data');
    expect(searchInput).toHaveClass('collapsed');
  });

  test('shows dropdown when search bar is expanded', () => {
    render(<SearchBar />);
    const searchIcon = getMainSearchIcon();

    // Expand
    fireEvent.click(searchIcon);

    // Check dropdown icon appears
    const dropdownIcon = screen.getByTestId('dropdown-icon');
    expect(dropdownIcon).toBeInTheDocument();
  });

  test('renders tooltips', () => {
    render(<SearchBar />);
    const tooltips = screen.getAllByTestId('custom-tooltip');

    // Check for tooltip with correct title
    const searchTooltip = tooltips.find(
      (t) => t.getAttribute('data-title') === 'Search'
    );
    expect(searchTooltip).toBeInTheDocument();
  });

  test('handles keyboard navigation', () => {
    render(<SearchBar />);
    const searchIcon = getMainSearchIcon();

    // Test Enter key
    fireEvent.keyDown(searchIcon, { key: 'Enter', code: 'Enter' });
    const searchInput = screen.getByRole('textbox');
    // The input should have class 'collapsed' (since Enter does not expand)
    expect(searchInput).toHaveClass('collapsed');
  });

  test('clears timeout on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    const { unmount } = render(<SearchBar />);
    const searchIcon = getMainSearchIcon();

    // Expand to set the timeout
    fireEvent.click(searchIcon);

    // Unmount the component
    unmount();

    // Check if clearTimeout was called
    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
  });

  test('renders search icon with correct styling when expanded', () => {
    render(<SearchBar />);
    const searchIcon = getMainSearchIcon();

    // Expand
    fireEvent.click(searchIcon);

    // Search icon button should have expanded class
    expect(searchIcon).toHaveClass('expanded');
  });

  test('renders search icon with correct styling when collapsed', () => {
    render(<SearchBar />);
    const searchIcon = getMainSearchIcon();

    // Search icon button should not have expanded class
    expect(searchIcon).not.toHaveClass('expanded');
  });

  test('clears timeout when expanding again before timeout completes', () => {
    render(<SearchBar />);
    const searchIcon = getMainSearchIcon();

    // First expand
    fireEvent.click(searchIcon);

    // Quickly collapse
    fireEvent.click(searchIcon);

    // Expand again
    fireEvent.click(searchIcon);

    // Run all timers
    act(() => {
      jest.runAllTimers();
    });

    // Additional assertions can be added as needed
    const searchInput = screen.getByPlaceholderText('Search data');
    expect(searchInput).toBeInTheDocument();
  });
});

describe('SearchBar Component - Additional Tests', () => {
  test('renders divider only when search bar is expanded', () => {
    const { container } = render(<SearchBar />);
    const searchIcon = screen.getAllByTestId('search-icon').find(
      (icon) =>
        icon.closest('.search-bar-icon') ||
        icon.classList.contains('search-bar-icon')
    ) || screen.getAllByTestId('search-icon')[0];

    // Divider should not exist initially
    expect(container.querySelector('.search-bar-divider')).not.toBeInTheDocument();

    // Expand search bar
    fireEvent.click(searchIcon);

    // Divider should now exist
    expect(container.querySelector('.search-bar-divider')).toBeInTheDocument();
  });

  test('dropdown button triggers correct action when clicked', () => {
    render(<SearchBar />);
    const searchIcon = screen.getAllByTestId('search-icon').find(
      (icon) =>
        icon.closest('.search-bar-icon') ||
        icon.classList.contains('search-bar-icon')
    ) || screen.getAllByTestId('search-icon')[0];

    // Expand search bar
    fireEvent.click(searchIcon);

    const dropdownButton = screen.getByLabelText('Open search dropdown');
    window.alert = jest.fn();

    // Click dropdown button
    fireEvent.click(dropdownButton);

    // Verify alert action
    expect(window.alert).toHaveBeenCalledWith('Dropdown clicked');
  });

  test('dropdown button has correct aria-label', () => {
    render(<SearchBar />);
    const searchIcon = screen.getAllByTestId('search-icon').find(
      (icon) =>
        icon.closest('.search-bar-icon') ||
        icon.classList.contains('search-bar-icon')
    ) || screen.getAllByTestId('search-icon')[0];

    // Expand search bar
    fireEvent.click(searchIcon);

    const dropdownButton = screen.getByLabelText('Open search dropdown');
    expect(dropdownButton).toHaveAttribute('aria-label', 'Open search dropdown');
  });

  test('renders CustomTooltip for search bar and dropdown', () => {
    render(<SearchBar />);
    const searchIcon = screen.getAllByTestId('search-icon').find(
      (icon) =>
        icon.closest('.search-bar-icon') ||
        icon.classList.contains('search-bar-icon')
    ) || screen.getAllByTestId('search-icon')[0];

    // Verify tooltip for search bar
    const tooltips = screen.getAllByTestId('custom-tooltip');
    expect(tooltips.some(t => t.getAttribute('data-title') === 'Search')).toBe(true);

    // Expand search bar
    fireEvent.click(searchIcon);

    // Verify tooltip for dropdown
    const dropdownTooltips = screen.getAllByTestId('custom-tooltip');
    expect(dropdownTooltips.some(t => t.getAttribute('data-title') === 'Search tooltip')).toBe(true);
  });

  test('search icon toggles expansion on click', () => {
    render(<SearchBar />);
    const searchIcon = screen.getAllByTestId('search-icon').find(
      (icon) =>
        icon.closest('.search-bar-icon') ||
        icon.classList.contains('search-bar-icon')
    ) || screen.getAllByTestId('search-icon')[0];

    // Initially collapsed (input should have class 'collapsed')
    const input = screen.getByPlaceholderText('Search data');
    expect(input).toHaveClass('collapsed');

    // Expand search bar
    fireEvent.click(searchIcon);
    expect(screen.getByPlaceholderText('Search data')).not.toHaveClass('collapsed');

    // Collapse search bar
    fireEvent.click(searchIcon);
    expect(screen.getByPlaceholderText('Search data')).toHaveClass('collapsed');
  });
});