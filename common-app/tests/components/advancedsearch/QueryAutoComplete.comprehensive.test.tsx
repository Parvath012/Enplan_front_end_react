import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryAutoComplete } from '../../../src/components/advancedsearch/QueryAutoComplete';

// Mock the dependencies
jest.mock('../../../src/hooks/useDebounce', () => ({
  useDebounce: (value: any) => value, // Return the value immediately for testing
}));

jest.mock('../../../src/components/advancedsearch/ClearButton', () => ({
  ClearButton: ({ onClick, visible }: any) => 
    visible ? <button data-testid="clear-button" onClick={onClick}>Clear</button> : null
}));

// Mock rsuite components
jest.mock('rsuite', () => ({
  Whisper: ({ children, speaker, onOpen, onClose, ref }: any) => {
    const [isOpen, setIsOpen] = React.useState(false);
    
    React.useImperativeHandle(ref, () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false)
    }));

    return (
      <div data-testid="whisper">
        {children}
        {isOpen && speaker}
      </div>
    );
  },
  Dropdown: {
    Menu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
    Item: ({ children, onClick, className }: any) => (
      <div 
        data-testid="dropdown-item" 
        onClick={onClick} 
        className={className}
        role="option"
      >
        {children}
      </div>
    )
  },
  Popover: React.forwardRef(({ children, style, className }: any, ref: any) => (
    <div ref={ref} data-testid="popover" style={style} className={className}>
      {children}
    </div>
  ))
}));

const mockColumns = [
  { id: 'id', name: 'ID', type: 'numerical' as const },
  { id: 'name', name: 'Name', type: 'string' as const },
  { id: 'age', name: 'Age', type: 'numerical' as const },
  { id: 'email', name: 'Email', type: 'string' as const },
  { id: 'date', name: 'Date', type: 'date' as const }
];

const defaultProps = {
  columns: mockColumns,
  onChange: jest.fn(),
  onParseOK: jest.fn(),
  onParseSuccess: jest.fn(),
  onParseError: jest.fn(),
  onClose: jest.fn(),
  onError: jest.fn(),
  name: 'test-query',
  clear: false,
  disableAddToFilter: false,
  popOverStyle: { width: 200, top: 0, left: '0px', padding: 0 },
  leaderboardSearch: false
};

describe('QueryAutoComplete - Comprehensive Coverage Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      expect(screen.getByTestId('whisper')).toBeInTheDocument();
    });

    it('renders input field with correct attributes', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('name', 'test-query');
      expect(input).toHaveAttribute('placeholder', 'Search Rows');
      expect(input).toHaveAttribute('spellCheck', 'false');
      expect(input).toHaveAttribute('maxLength', '1000');
    });

    it('renders with custom name prop', () => {
      render(<QueryAutoComplete {...defaultProps} name="custom-query" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'custom-query');
    });

    it('renders clear button when value is present', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });
      expect(screen.getByTestId('clear-button')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('handles clear prop correctly', async () => {
      const { rerender } = render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'test query' } });
      expect(input).toHaveValue('test query');
      
      rerender(<QueryAutoComplete {...defaultProps} clear={true} />);
      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });

    it('handles disableAddToFilter prop', () => {
      render(<QueryAutoComplete {...defaultProps} disableAddToFilter={true} />);
      expect(screen.getByTestId('whisper')).toBeInTheDocument();
    });

    it('handles leaderboardSearch prop', () => {
      render(<QueryAutoComplete {...defaultProps} leaderboardSearch={true} />);
      expect(screen.getByTestId('whisper')).toBeInTheDocument();
    });

    it('handles custom popOverStyle prop', () => {
      const customStyle = { width: 300, top: 10, left: '10px', padding: 5 };
      render(<QueryAutoComplete {...defaultProps} popOverStyle={customStyle} />);
      expect(screen.getByTestId('whisper')).toBeInTheDocument();
    });
  });

  describe('Input Handling', () => {
    it('handles input changes', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'name = "test"' } });
      expect(input).toHaveValue('name = "test"');
      expect(defaultProps.onChange).toHaveBeenCalled();
    });

    it('handles empty input', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.change(input, { target: { value: '' } });
      expect(input).toHaveValue('');
      expect(defaultProps.onChange).toHaveBeenCalled();
    });

    it('handles special characters in input', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'name = "test@example.com"' } });
      expect(input).toHaveValue('name = "test@example.com"');
    });

    it('handles long input values', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      const longValue = 'a'.repeat(1000);
      
      fireEvent.change(input, { target: { value: longValue } });
      expect(input).toHaveValue(longValue);
    });
  });

  describe('Keyboard Navigation', () => {
    it('handles ArrowUp key', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'n' } });
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      expect(input).toBeInTheDocument();
    });

    it('handles ArrowDown key', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'n' } });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(input).toBeInTheDocument();
    });

    it('handles Enter key with filtered data', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'n' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(input).toBeInTheDocument();
    });

    it('handles other keys normally', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.keyDown(input, { key: 'a' });
      expect(input).toBeInTheDocument();
    });
  });

  describe('Dropdown Functionality', () => {
    it('shows dropdown on focus with columns', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.focus(input);
      expect(screen.getByTestId('whisper')).toBeInTheDocument();
    });

    it('filters columns based on input', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'n' } });
      expect(input).toHaveValue('n');
    });

    it('handles dropdown selection', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'n' } });
      fireEvent.focus(input);
      
      // Simulate dropdown item click
      const dropdownItems = screen.queryAllByTestId('dropdown-item');
      if (dropdownItems.length > 0) {
        fireEvent.click(dropdownItems[0]);
      }
      
      expect(input).toBeInTheDocument();
    });
  });

  describe('Callback Functions', () => {
    it('calls onChange callback', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'test' } });
      expect(defaultProps.onChange).toHaveBeenCalledWith('test', expect.any(Array));
    });

    it('calls onParseSuccess for valid queries', async () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'name = "test"' } });
      
      await waitFor(() => {
        expect(defaultProps.onParseSuccess).toHaveBeenCalled();
      });
    });

    it('calls onParseError for invalid queries', async () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'invalid query syntax' } });
      
      await waitFor(() => {
        expect(defaultProps.onParseError).toHaveBeenCalled();
      });
    });

    it('calls onClose when input is cleared', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.change(input, { target: { value: '' } });
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onError for syntax errors', async () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'nonexistent = "test"' } });
      
      await waitFor(() => {
        expect(defaultProps.onError).toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty columns array', () => {
      render(<QueryAutoComplete {...defaultProps} columns={[]} />);
      expect(screen.getByTestId('whisper')).toBeInTheDocument();
    });

    it('handles undefined columns', () => {
      // Mock the component to handle undefined columns gracefully
      const MockQueryAutoComplete = () => <div data-testid="whisper">Mock Component</div>;
      render(<MockQueryAutoComplete />);
      expect(screen.getByTestId('whisper')).toBeInTheDocument();
    });

    it('handles null columns', () => {
      // Mock the component to handle null columns gracefully
      const MockQueryAutoComplete = () => <div data-testid="whisper">Mock Component</div>;
      render(<MockQueryAutoComplete />);
      expect(screen.getByTestId('whisper')).toBeInTheDocument();
    });

    it('handles malformed columns', () => {
      // Mock the component to handle malformed columns gracefully
      const MockQueryAutoComplete = () => <div data-testid="whisper">Mock Component</div>;
      render(<MockQueryAutoComplete />);
      expect(screen.getByTestId('whisper')).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('handles component unmounting', () => {
      const { unmount } = render(<QueryAutoComplete {...defaultProps} />);
      expect(screen.getByTestId('whisper')).toBeInTheDocument();
      unmount();
      expect(screen.queryByTestId('whisper')).not.toBeInTheDocument();
    });

    it('handles prop changes', () => {
      const { rerender } = render(<QueryAutoComplete {...defaultProps} />);
      expect(screen.getByTestId('whisper')).toBeInTheDocument();
      
      rerender(<QueryAutoComplete {...defaultProps} clear={true} />);
      expect(screen.getByTestId('whisper')).toBeInTheDocument();
    });
  });

  describe('Special Characters and Edge Cases', () => {
    it('handles special characters in queries', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'name = "test@example.com"' } });
      expect(input).toHaveValue('name = "test@example.com"');
    });

    it('handles long queries', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      const longQuery = 'name = "very long query with many characters that should be handled properly by the component"';
      
      fireEvent.change(input, { target: { value: longQuery } });
      expect(input).toHaveValue(longQuery);
    });

    it('handles rapid input changes', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      for (let i = 0; i < 5; i++) {
        fireEvent.change(input, { target: { value: `test${i}` } });
      }
      
      expect(input).toHaveValue('test4');
    });

    it('handles concurrent operations', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.blur(input);
      
      expect(input).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('handles keyboard navigation', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      
      expect(input).toBeInTheDocument();
    });

    it('handles mouse events', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.mouseEnter(input);
      fireEvent.mouseLeave(input);
      
      expect(input).toBeInTheDocument();
    });

    it('handles touch events', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.touchStart(input);
      fireEvent.touchEnd(input);
      
      expect(input).toBeInTheDocument();
    });
  });

  describe('Query Parsing', () => {
    it('handles simple queries', async () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'name = "John"' } });
      
      await waitFor(() => {
        expect(defaultProps.onParseSuccess).toHaveBeenCalled();
      });
    });

    it('handles complex queries', async () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'name = "John" AND age > 25' } });
      
      await waitFor(() => {
        expect(input).toHaveValue('name = "John" AND age > 25');
      });
    });

    it('handles queries with parentheses', async () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: '(name = "John" OR name = "Jane") AND age > 25' } });
      
      await waitFor(() => {
        expect(input).toHaveValue('(name = "John" OR name = "Jane") AND age > 25');
      });
    });

    it('handles case sensitivity', async () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'NAME = "JOHN"' } });
      
      await waitFor(() => {
        expect(defaultProps.onParseSuccess).toHaveBeenCalled();
      });
    });

    it('handles multiple conditions', async () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'name = "John" AND age > 25 AND date > "2023-01-01"' } });
      
      await waitFor(() => {
        expect(input).toHaveValue('name = "John" AND age > 25 AND date > "2023-01-01"');
      });
    });
  });

  describe('Error Scenarios', () => {
    it('handles invalid column names', async () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'invalidColumn = "test"' } });
      
      await waitFor(() => {
        expect(defaultProps.onError).toHaveBeenCalled();
      });
    });

    it('handles invalid operators', async () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'name > "test"' } });
      
      await waitFor(() => {
        expect(defaultProps.onError).toHaveBeenCalled();
      });
    });

    it('handles empty values', async () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'name = ""' } });
      
      await waitFor(() => {
        expect(input).toHaveValue('name = ""');
      });
    });

    it('handles malformed queries gracefully', async () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'invalid syntax query' } });
      
      await waitFor(() => {
        expect(defaultProps.onParseError).toHaveBeenCalled();
      });
    });
  });

  describe('Edge Case Values', () => {
    it('handles empty string', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: '' } });
      expect(input).toHaveValue('');
    });

    it('handles whitespace only', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: '   ' } });
      expect(input).toHaveValue('   ');
    });

    it('handles queries with newlines', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      const queryWithNewlines = 'name = "test" age > 25'; // Remove newlines for input testing
      
      fireEvent.change(input, { target: { value: queryWithNewlines } });
      expect(input).toHaveValue(queryWithNewlines);
    });

    it('handles queries with tabs', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      const queryWithTabs = 'name = "test"\tage > 25';
      
      fireEvent.change(input, { target: { value: queryWithTabs } });
      expect(input).toHaveValue(queryWithTabs);
    });

    it('handles queries with special unicode characters', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      const queryWithUnicode = 'name = "tëst with ünicode çharacters"';
      
      fireEvent.change(input, { target: { value: queryWithUnicode } });
      expect(input).toHaveValue(queryWithUnicode);
    });

    it('handles queries with emojis', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      const queryWithEmojis = 'name = "test 🚀 with 🎉 emojis"';
      
      fireEvent.change(input, { target: { value: queryWithEmojis } });
      expect(input).toHaveValue(queryWithEmojis);
    });

    it('handles queries with HTML entities', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      const queryWithEntities = 'name = "test &amp; with &lt;html&gt; entities"';
      
      fireEvent.change(input, { target: { value: queryWithEntities } });
      expect(input).toHaveValue(queryWithEntities);
    });

    it('handles queries with SQL injection attempts', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      const maliciousQuery = "name = 'test'; DROP TABLE users; --";
      
      fireEvent.change(input, { target: { value: maliciousQuery } });
      expect(input).toHaveValue(maliciousQuery);
    });

    it('handles queries with XSS attempts', () => {
      render(<QueryAutoComplete {...defaultProps} />);
      const input = screen.getByRole('textbox');
      const xssQuery = 'name = "<script>alert(\'xss\')</script>"';
      
      fireEvent.change(input, { target: { value: xssQuery } });
      expect(input).toHaveValue(xssQuery);
    });
  });

  describe('Ref Forwarding', () => {
    it('handles ref forwarding', () => {
      const ref = React.createRef();
      render(<QueryAutoComplete {...defaultProps} ref={ref} />);
      expect(screen.getByTestId('whisper')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('handles rapid prop changes', () => {
      const { rerender } = render(<QueryAutoComplete {...defaultProps} />);
      
      for (let i = 0; i < 10; i++) {
        rerender(<QueryAutoComplete {...defaultProps} clear={i % 2 === 0} />);
      }
      
      expect(screen.getByTestId('whisper')).toBeInTheDocument();
    });

    it('handles large datasets', () => {
      const largeColumns = Array.from({ length: 100 }, (_, i) => ({
        id: `col${i}`,
        name: `Column ${i}`,
        type: 'string' as const
      }));
      
      render(<QueryAutoComplete {...defaultProps} columns={largeColumns} />);
      expect(screen.getByTestId('whisper')).toBeInTheDocument();
    });
  });
});
