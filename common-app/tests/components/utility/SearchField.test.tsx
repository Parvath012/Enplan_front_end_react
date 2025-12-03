import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchField from '../../../src/components/utility/SearchField';

// Mock Carbon icons
jest.mock('@carbon/icons-react', () => ({
  Search: () => <div data-testid="search-icon">Search Icon</div>,
  Close: () => <div data-testid="close-icon">Close Icon</div>,
}));

// Mock CustomTooltip
jest.mock('../../../src/components/common/CustomTooltip', () => {
  return function MockCustomTooltip({ children, title }: any) {
    return <div data-testid="custom-tooltip" title={title}>{children}</div>;
  };
});

describe('SearchField', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
    placeholder: 'Search...',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<SearchField {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      const searchIcon = screen.getByTestId('search-icon');
      
      expect(searchInput).toBeInTheDocument();
      expect(searchIcon).toBeInTheDocument();
    });

    it('should render with custom placeholder', () => {
      render(<SearchField {...defaultProps} placeholder="Find items..." />);
      
      const searchInput = screen.getByPlaceholderText('Find items...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should render with initial value', () => {
      render(<SearchField {...defaultProps} value="initial search" />);
      
      const searchInput = screen.getByDisplayValue('initial search');
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should call onChange when input changes', () => {
      render(<SearchField {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'new search' } });
      
      expect(defaultProps.onChange).toHaveBeenCalledWith('new search');
    });

    it('should handle multiple changes', () => {
      render(<SearchField {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'first search' } });
      fireEvent.change(searchInput, { target: { value: 'second search' } });
      
      expect(defaultProps.onChange).toHaveBeenCalledTimes(2);
      expect(defaultProps.onChange).toHaveBeenLastCalledWith('second search');
    });

    it('should handle empty input', () => {
      render(<SearchField {...defaultProps} value="initial" />);
      
      const searchInput = screen.getByDisplayValue('initial');
      fireEvent.change(searchInput, { target: { value: '' } });
      
      expect(defaultProps.onChange).toHaveBeenCalledWith('');
    });
  });

  describe('Styling', () => {
    it('should apply default styles', () => {
      render(<SearchField {...defaultProps} />);
      
      const searchField = screen.getByPlaceholderText('Search...').closest('div');
      expect(searchField?.parentElement).toHaveStyle('height: 30px');
    });

    it('should apply custom styles when provided', () => {
      const customStyle = {
        width: '300px',
        marginTop: '10px',
      };
      
      render(<SearchField {...defaultProps} customStyle={customStyle} />);
      
      const searchField = screen.getByPlaceholderText('Search...').closest('div');
      expect(searchField?.parentElement).toHaveStyle('width: 300px');
      expect(searchField?.parentElement).toHaveStyle('margin-top: 10px');
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in input', () => {
      render(<SearchField {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'test@#$%^&*()' } });
      
      expect(defaultProps.onChange).toHaveBeenCalledWith('test@#$%^&*()');
    });

    it('should handle very long input text', () => {
      const longText = 'a'.repeat(100);
      render(<SearchField {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: longText } });
      
      expect(defaultProps.onChange).toHaveBeenCalledWith(longText);
    });
  });
});
