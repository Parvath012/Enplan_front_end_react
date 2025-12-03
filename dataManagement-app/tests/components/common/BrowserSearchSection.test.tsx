import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BrowserSearchSection from '../../../src/components/common/BrowserSearchSection';

// Mock ListToolbar
jest.mock('../../../src/components/common/browserLazyImports', () => ({
  ListToolbar: ({ onSearchClick, onSearchChange, onSearchClose, isSearchActive, searchValue }: any) => (
    <div data-testid="list-toolbar">
      <button onClick={onSearchClick} data-testid="search-click">Search</button>
      <input 
        value={searchValue} 
        onChange={(e) => onSearchChange(e.target.value)} 
        data-testid="search-input"
      />
      {isSearchActive && (
        <button onClick={onSearchClose} data-testid="search-close">Close</button>
      )}
    </div>
  )
}));

describe('BrowserSearchSection', () => {
  const defaultProps = {
    searchTerm: '',
    filteredCount: 10,
    totalCount: 10,
    isSearchActive: false,
    handleSearchClick: jest.fn(),
    handleSearchChange: jest.fn(),
    handleSearchClose: jest.fn(),
    allItemsText: 'All Items',
    className: 'test-browser'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all items text when search term is empty', () => {
    render(<BrowserSearchSection {...defaultProps} />);
    
    expect(screen.getByText('All Items')).toBeInTheDocument();
    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
  });

  it('should render filtered count when search term is present', () => {
    render(<BrowserSearchSection {...defaultProps} searchTerm="test" />);
    
    expect(screen.getByText('Showing 10 of 10')).toBeInTheDocument();
    expect(screen.queryByText('All Items')).not.toBeInTheDocument();
  });

  it('should render correct filtered and total counts', () => {
    render(
      <BrowserSearchSection 
        {...defaultProps} 
        searchTerm="filter" 
        filteredCount={5}
        totalCount={20}
      />
    );
    
    expect(screen.getByText('Showing 5 of 20')).toBeInTheDocument();
  });

  it('should call handleSearchClick when search button is clicked', () => {
    render(<BrowserSearchSection {...defaultProps} />);
    
    const searchButton = screen.getByTestId('search-click');
    fireEvent.click(searchButton);
    
    expect(defaultProps.handleSearchClick).toHaveBeenCalledTimes(1);
  });

  it('should call handleSearchChange when input value changes', () => {
    render(<BrowserSearchSection {...defaultProps} />);
    
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'new search' } });
    
    expect(defaultProps.handleSearchChange).toHaveBeenCalledWith('new search');
  });

  it('should call handleSearchClose when close button is clicked and search is active', () => {
    render(<BrowserSearchSection {...defaultProps} isSearchActive={true} />);
    
    const closeButton = screen.getByTestId('search-close');
    fireEvent.click(closeButton);
    
    expect(defaultProps.handleSearchClose).toHaveBeenCalledTimes(1);
  });

  it('should not show close button when search is not active', () => {
    render(<BrowserSearchSection {...defaultProps} isSearchActive={false} />);
    
    expect(screen.queryByTestId('search-close')).not.toBeInTheDocument();
  });

  it('should pass searchValue to ListToolbar', () => {
    render(<BrowserSearchSection {...defaultProps} searchTerm="test search" />);
    
    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toHaveValue('test search');
  });

  it('should apply correct class names', () => {
    const { container } = render(<BrowserSearchSection {...defaultProps} />);
    
    const searchSection = container.firstChild as HTMLElement;
    expect(searchSection).toHaveClass('test-browser__search-section');
  });

  it('should handle whitespace-only search term as empty', () => {
    render(<BrowserSearchSection {...defaultProps} searchTerm="   " />);
    
    expect(screen.getByText('All Items')).toBeInTheDocument();
    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
  });
});

