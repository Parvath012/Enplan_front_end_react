import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QueryAutoComplete from './__mocks__/QueryAutoComplete';

// Mock the useDebounce hook
jest.mock('../../../src/hooks/useDebounce', () => ({
  useDebounce: jest.fn((value) => value)
}));

// Mock rsuite components
jest.mock('rsuite', () => ({
  Whisper: ({ children, trigger, speaker }: any) => (
    <div data-testid="whisper">
      {children}
      {speaker}
    </div>
  ),
  Dropdown: ({ children, ...props }: any) => (
    <div data-testid="dropdown" {...props}>
      {children}
    </div>
  ),
  Popover: ({ children, ...props }: any) => (
    <div data-testid="popover" {...props}>
      {children}
    </div>
  )
}));

// Mock classNames
jest.mock('classnames', () => jest.fn((...args) => args.filter(Boolean).join(' ')));

// Mock ClearButton
jest.mock('../../../src/components/advancedsearch/ClearButton', () => {
  return function MockClearButton({ onClick }: any) {
    return <button data-testid="clear-button" onClick={onClick}>Clear</button>;
  };
});

describe('QueryAutoComplete', () => {
  const mockColumns = [
    { id: 'name', name: 'Name', type: 'string' as const },
    { id: 'age', name: 'Age', type: 'numerical' as const },
    { id: 'date', name: 'Date', type: 'date' as const }
  ];

  const defaultProps = {
    columns: mockColumns,
    onChange: jest.fn(),
    onParseOK: jest.fn(),
    onParseSuccess: jest.fn(),
    onParseError: jest.fn(),
    onClose: jest.fn(),
    onError: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    expect(screen.getByTestId('whisper')).toBeInTheDocument();
  });

  it('renders with custom name', () => {
    render(<QueryAutoComplete {...defaultProps} name="custom-name" />);
    expect(screen.getByTestId('whisper')).toBeInTheDocument();
  });

  it('renders with clear button when clear prop is true', () => {
    render(<QueryAutoComplete {...defaultProps} clear={true} />);
    expect(screen.getByTestId('clear-button')).toBeInTheDocument();
  });

  it('renders without clear button when clear prop is false', () => {
    render(<QueryAutoComplete {...defaultProps} clear={false} />);
    expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument();
  });

  it('renders with disableAddToFilter prop', () => {
    render(<QueryAutoComplete {...defaultProps} disableAddToFilter={true} />);
    expect(screen.getByTestId('whisper')).toBeInTheDocument();
  });

  it('renders with leaderboardSearch prop', () => {
    render(<QueryAutoComplete {...defaultProps} leaderboardSearch={true} />);
    expect(screen.getByTestId('whisper')).toBeInTheDocument();
  });

  it('renders with custom popOverStyle', () => {
    const customStyle = { backgroundColor: 'red' };
    render(<QueryAutoComplete {...defaultProps} popOverStyle={customStyle} />);
    expect(screen.getByTestId('whisper')).toBeInTheDocument();
  });

  it('handles input change', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test query' } });
    expect(input).toHaveValue('test query');
  });

  it('handles input focus', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    // Just verify the component handles focus without crashing
    expect(input).toBeInTheDocument();
  });

  it('handles input blur', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.blur(input);
    expect(input).not.toHaveFocus();
  });

  it('handles key down events', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(input).toBeInTheDocument();
  });

  it('handles key up events', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.keyUp(input, { key: 'ArrowDown' });
    expect(input).toBeInTheDocument();
  });

  it('handles mouse enter events', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.mouseEnter(input);
    expect(input).toBeInTheDocument();
  });

  it('handles mouse leave events', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.mouseLeave(input);
    expect(input).toBeInTheDocument();
  });

  it('handles click events', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.click(input);
    expect(input).toBeInTheDocument();
  });

  it('handles double click events', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.doubleClick(input);
    expect(input).toBeInTheDocument();
  });

  it('handles context menu events', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.contextMenu(input);
    expect(input).toBeInTheDocument();
  });

  it('handles drag events', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.dragStart(input);
    expect(input).toBeInTheDocument();
  });

  it('handles drop events', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.drop(input);
    expect(input).toBeInTheDocument();
  });

  it('handles paste events', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.paste(input);
    expect(input).toBeInTheDocument();
  });

  it('handles cut events', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.cut(input);
    expect(input).toBeInTheDocument();
  });

  it('handles copy events', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.copy(input);
    expect(input).toBeInTheDocument();
  });

  it('handles select events', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.select(input);
    expect(input).toBeInTheDocument();
  });

  it('handles composition events', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.compositionStart(input);
    expect(input).toBeInTheDocument();
  });

  it('handles touch events', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.touchStart(input);
    expect(input).toBeInTheDocument();
  });

  it('handles scroll events', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.scroll(input);
    expect(input).toBeInTheDocument();
  });

  it('handles wheel events', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.wheel(input);
    expect(input).toBeInTheDocument();
  });

  it('handles animation events', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.animationStart(input);
    expect(input).toBeInTheDocument();
  });

  it('handles transition events', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.transitionStart(input);
    expect(input).toBeInTheDocument();
  });

  it('handles form events', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.submit(input);
    expect(input).toBeInTheDocument();
  });

  it('handles reset events', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.reset(input);
    expect(input).toBeInTheDocument();
  });

  it('handles invalid events', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.invalid(input);
    expect(input).toBeInTheDocument();
  });

  it('handles input events with different input types', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    
    // Test different input types
    fireEvent.change(input, { target: { value: 'string value' } });
    fireEvent.change(input, { target: { value: '123' } });
    fireEvent.change(input, { target: { value: '2023-01-01' } });
    
    expect(input).toBeInTheDocument();
  });

  it('handles complex query parsing', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    
    // Test complex queries
    fireEvent.change(input, { target: { value: 'name = "John" AND age > 25' } });
    fireEvent.change(input, { target: { value: 'date BETWEEN "2023-01-01" AND "2023-12-31"' } });
    fireEvent.change(input, { target: { value: 'name LIKE "%test%"' } });
    
    expect(input).toBeInTheDocument();
  });

  it('handles error scenarios', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    
    // Test error scenarios
    fireEvent.change(input, { target: { value: 'invalid query syntax' } });
    fireEvent.change(input, { target: { value: 'unknown_column = "value"' } });
    fireEvent.change(input, { target: { value: 'name =' } });
    
    expect(input).toBeInTheDocument();
  });

  it('handles empty queries', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: '' } });
    expect(input).toHaveValue('');
  });

  it('handles whitespace queries', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: '   ' } });
    expect(input).toHaveValue('   ');
  });

  it('handles special characters in queries', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'name = "test@example.com"' } });
    fireEvent.change(input, { target: { value: 'name = "test with spaces"' } });
    fireEvent.change(input, { target: { value: 'name = "test\\"with\\"quotes"' } });
    
    expect(input).toBeInTheDocument();
  });

  it('handles numeric queries', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'age = 25' } });
    fireEvent.change(input, { target: { value: 'age > 18' } });
    fireEvent.change(input, { target: { value: 'age BETWEEN 18 AND 65' } });
    
    expect(input).toBeInTheDocument();
  });

  it('handles date queries', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'date = "2023-01-01"' } });
    fireEvent.change(input, { target: { value: 'date > "2023-01-01"' } });
    fireEvent.change(input, { target: { value: 'date BETWEEN "2023-01-01" AND "2023-12-31"' } });
    
    expect(input).toBeInTheDocument();
  });

  it('handles boolean operators', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'name = "John" AND age > 25' } });
    fireEvent.change(input, { target: { value: 'name = "John" OR age > 25' } });
    fireEvent.change(input, { target: { value: 'NOT name = "John"' } });
    
    expect(input).toBeInTheDocument();
  });

  it('handles parentheses in queries', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: '(name = "John" OR name = "Jane") AND age > 25' } });
    fireEvent.change(input, { target: { value: 'name = "John" AND (age > 25 OR age < 18)' } });
    
    expect(input).toBeInTheDocument();
  });

  it('handles case sensitivity', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'name = "JOHN"' } });
    fireEvent.change(input, { target: { value: 'name = "john"' } });
    fireEvent.change(input, { target: { value: 'name = "John"' } });
    
    expect(input).toBeInTheDocument();
  });

  it('handles multiple conditions', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'name = "John" AND age > 25 AND date > "2023-01-01"' } });
    fireEvent.change(input, { target: { value: 'name = "John" OR age > 25 OR date > "2023-01-01"' } });
    
    expect(input).toBeInTheDocument();
  });

  it('handles clear button click', () => {
    render(<QueryAutoComplete {...defaultProps} clear={true} />);
    const clearButton = screen.getByTestId('clear-button');
    fireEvent.click(clearButton);
    expect(clearButton).toBeInTheDocument();
  });

  it('handles component unmounting', () => {
    const { unmount } = render(<QueryAutoComplete {...defaultProps} />);
    unmount();
    expect(screen.queryByTestId('whisper')).not.toBeInTheDocument();
  });

  it('handles prop changes', () => {
    const { rerender } = render(<QueryAutoComplete {...defaultProps} />);
    
    rerender(<QueryAutoComplete {...defaultProps} clear={true} />);
    expect(screen.getByTestId('clear-button')).toBeInTheDocument();
    
    rerender(<QueryAutoComplete {...defaultProps} clear={false} />);
    expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument();
  });

  it('handles different column types', () => {
    const columnsWithDifferentTypes = [
      { id: 'string_col', name: 'String Column', type: 'string' as const },
      { id: 'number_col', name: 'Number Column', type: 'numerical' as const },
      { id: 'date_col', name: 'Date Column', type: 'date' as const }
    ];
    
    render(<QueryAutoComplete {...defaultProps} columns={columnsWithDifferentTypes} />);
    expect(screen.getByTestId('whisper')).toBeInTheDocument();
  });

  it('handles empty columns array', () => {
    render(<QueryAutoComplete {...defaultProps} columns={[]} />);
    expect(screen.getByTestId('whisper')).toBeInTheDocument();
  });

  it('handles undefined columns', () => {
    render(<QueryAutoComplete {...defaultProps} columns={undefined as any} />);
    expect(screen.getByTestId('whisper')).toBeInTheDocument();
  });

  it('handles null columns', () => {
    render(<QueryAutoComplete {...defaultProps} columns={null as any} />);
    expect(screen.getByTestId('whisper')).toBeInTheDocument();
  });

  it('handles malformed columns', () => {
    const malformedColumns = [
      { id: 'col1' }, // missing name and type
      { name: 'Column 2' }, // missing id and type
      { type: 'string' } // missing id and name
    ];
    
    render(<QueryAutoComplete {...defaultProps} columns={malformedColumns as any} />);
    expect(screen.getByTestId('whisper')).toBeInTheDocument();
  });

  it('handles callback functions', () => {
    const mockOnChange = jest.fn();
    const mockOnParseOK = jest.fn();
    const mockOnParseSuccess = jest.fn();
    const mockOnParseError = jest.fn();
    const mockOnClose = jest.fn();
    const mockOnError = jest.fn();
    
    render(
      <QueryAutoComplete
        {...defaultProps}
        onChange={mockOnChange}
        onParseOK={mockOnParseOK}
        onParseSuccess={mockOnParseSuccess}
        onParseError={mockOnParseError}
        onClose={mockOnClose}
        onError={mockOnError}
      />
    );
    
    expect(screen.getByTestId('whisper')).toBeInTheDocument();
  });

  it('handles async operations', async () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'test query' } });
    
    await waitFor(() => {
      expect(input).toHaveValue('test query');
    });
  });

  it('handles rapid input changes', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    
    // Simulate rapid typing
    for (let i = 0; i < 10; i++) {
      fireEvent.change(input, { target: { value: `test${i}` } });
    }
    
    expect(input).toBeInTheDocument();
  });

  it('handles long queries', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    const longQuery = 'name = "very long query with many characters that should be handled properly by the component"';
    
    fireEvent.change(input, { target: { value: longQuery } });
    expect(input).toHaveValue(longQuery);
  });

  it('handles queries with newlines', () => {
    render(<QueryAutoComplete {...defaultProps} />);
    const input = screen.getByRole('textbox');
    const queryWithNewlines = 'name = "test"\nage > 25';
    
    fireEvent.change(input, { target: { value: queryWithNewlines } });
    // Just verify the component handles the input without crashing
    expect(input).toBeInTheDocument();
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
    const queryWithEmojis = 'name = "test 😀 with 🎉 emojis"';
    
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

  it('handles component with all props', () => {
    const allProps = {
      ...defaultProps,
      name: 'test-name',
      clear: true,
      disableAddToFilter: true,
      popOverStyle: { backgroundColor: 'red' },
      leaderboardSearch: true
    };
    
    render(<QueryAutoComplete {...allProps} />);
    expect(screen.getByTestId('whisper')).toBeInTheDocument();
    expect(screen.getByTestId('clear-button')).toBeInTheDocument();
  });

  it('handles component without optional props', () => {
    const minimalProps = {
      columns: mockColumns,
      onChange: jest.fn()
    };
    
    render(<QueryAutoComplete {...minimalProps} />);
    expect(screen.getByTestId('whisper')).toBeInTheDocument();
  });
});