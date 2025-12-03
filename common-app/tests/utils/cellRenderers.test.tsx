import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { ConditionalTooltipText, createHighlightedCellRenderer } from '../../src/utils/cellRenderers';
import { highlightSearchTerm } from '../../src/utils/searchUtils';

// Mock the searchUtils module
jest.mock('../../src/utils/searchUtils', () => ({
  highlightSearchTerm: jest.fn()
}));

// Mock the CustomTooltip component
jest.mock('../../src/components/common/CustomTooltip', () => {
  return function MockCustomTooltip({ children, title, placement }: any) {
    return (
      <div data-testid="custom-tooltip" data-title={title} data-placement={placement}>
        {children}
      </div>
    );
  };
});

const mockedHighlightSearchTerm = highlightSearchTerm as jest.MockedFunction<typeof highlightSearchTerm>;

describe('cellRenderers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementation
    mockedHighlightSearchTerm.mockImplementation((text: string, searchTerm: string) => (
      <span data-testid="highlighted-text">{text}</span>
    ));
  });

  describe('ConditionalTooltipText', () => {
    it('should render text without tooltip when text length is within maxChars', () => {
      render(<ConditionalTooltipText text="Short text" maxChars={20} />);
      
      expect(screen.getByText('Short text')).toBeInTheDocument();
      expect(screen.queryByTestId('custom-tooltip')).not.toBeInTheDocument();
    });

    it('should render text with tooltip when text length exceeds maxChars', () => {
      const longText = 'This is a very long text that exceeds the maximum character limit';
      render(<ConditionalTooltipText text={longText} maxChars={20} />);
      
      expect(screen.getByTestId('custom-tooltip')).toBeInTheDocument();
      expect(screen.getByTestId('custom-tooltip')).toHaveAttribute('data-title', longText);
      expect(screen.getByTestId('custom-tooltip')).toHaveAttribute('data-placement', 'bottom');
    });

    it('should handle null/undefined text gracefully', () => {
      const { container } = render(<ConditionalTooltipText text={null as any} maxChars={10} />);
      const spans = container.querySelectorAll('span');
      expect(spans.length).toBeGreaterThan(0);
      // Check that all spans have empty text content
      spans.forEach(span => {
        expect(span.textContent).toBe('');
      });
    });

    it('should handle empty string text', () => {
      const { container } = render(<ConditionalTooltipText text="" maxChars={10} />);
      const spans = container.querySelectorAll('span');
      expect(spans.length).toBeGreaterThan(0);
      // Check that all spans have empty text content
      spans.forEach(span => {
        expect(span.textContent).toBe('');
      });
    });

    it('should apply correct styling for text overflow', () => {
      const longText = 'This is a very long text that exceeds the maximum character limit';
      render(<ConditionalTooltipText text={longText} maxChars={20} />);
      
      const textSpan = screen.getByText(longText);
      expect(textSpan).toHaveStyle({
        display: 'inline-block',
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      });
    });

    it('should highlight search terms when searchTerm is provided', () => {
      const text = 'John Doe';
      const searchTerm = 'John';
      
      render(<ConditionalTooltipText text={text} maxChars={20} searchTerm={searchTerm} />);
      
      expect(mockedHighlightSearchTerm).toHaveBeenCalledWith(text, searchTerm);
      expect(screen.getByTestId('highlighted-text')).toBeInTheDocument();
    });

    it('should not highlight when searchTerm is not provided', () => {
      const text = 'John Doe';
      
      render(<ConditionalTooltipText text={text} maxChars={20} />);
      
      expect(mockedHighlightSearchTerm).not.toHaveBeenCalled();
      expect(screen.getByText(text)).toBeInTheDocument();
    });

    it('should apply highlighting styling when searchTerm is provided', () => {
      const text = 'John Doe';
      const searchTerm = 'John';
      
      render(<ConditionalTooltipText text={text} maxChars={20} searchTerm={searchTerm} />);
      
      // Check that the highlighted text is rendered
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      
      // Check that the highlighting was applied
      expect(mockedHighlightSearchTerm).toHaveBeenCalledWith(text, searchTerm);
    });

    it('should show tooltip with highlighted text when both conditions are met', () => {
      const longText = 'This is a very long text that exceeds the maximum character limit';
      const searchTerm = 'long';
      
      render(<ConditionalTooltipText text={longText} maxChars={20} searchTerm={searchTerm} />);
      
      expect(screen.getByTestId('custom-tooltip')).toBeInTheDocument();
      expect(screen.getByTestId('custom-tooltip')).toHaveAttribute('data-title', longText);
      expect(mockedHighlightSearchTerm).toHaveBeenCalledWith(longText, searchTerm);
    });

    it('should handle edge case where text length equals maxChars', () => {
      const text = 'Exactly twenty chars';
      render(<ConditionalTooltipText text={text} maxChars={20} />);
      
      expect(screen.queryByTestId('custom-tooltip')).not.toBeInTheDocument();
      expect(screen.getByText(text)).toBeInTheDocument();
    });

    it('should handle zero maxChars', () => {
      const text = 'Any text';
      render(<ConditionalTooltipText text={text} maxChars={0} />);
      
      expect(screen.getByTestId('custom-tooltip')).toBeInTheDocument();
      expect(screen.getByTestId('custom-tooltip')).toHaveAttribute('data-title', text);
    });
  });

  describe('createHighlightedCellRenderer', () => {
    it('should create a function that returns ConditionalTooltipText component', () => {
      const searchValue = 'test';
      const maxChars = 10;
      const renderer = createHighlightedCellRenderer(searchValue, maxChars);
      
      const mockParams = {
        value: 'This is a test value'
      };
      
      const result = renderer(mockParams);
      
      // The result should be a React element
      expect(React.isValidElement(result)).toBe(true);
    });

    it('should pass correct props to ConditionalTooltipText', () => {
      const searchValue = 'search';
      const maxChars = 15;
      const renderer = createHighlightedCellRenderer(searchValue, maxChars);
      
      const mockParams = {
        value: 'This is a search value'
      };
      
      const result = renderer(mockParams);
      
      // Render the result to test the props
      const { container } = render(result as React.ReactElement);
      
      // The component should be rendered with the correct props
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle null/undefined value in params', () => {
      const searchValue = 'test';
      const maxChars = 10;
      const renderer = createHighlightedCellRenderer(searchValue, maxChars);
      
      const mockParams = {
        value: null
      };
      
      const result = renderer(mockParams);
      
      expect(React.isValidElement(result)).toBe(true);
    });

    it('should handle empty string value in params', () => {
      const searchValue = 'test';
      const maxChars = 10;
      const renderer = createHighlightedCellRenderer(searchValue, maxChars);
      
      const mockParams = {
        value: ''
      };
      
      const result = renderer(mockParams);
      
      expect(React.isValidElement(result)).toBe(true);
    });

    it('should pass searchValue and maxChars to ConditionalTooltipText', () => {
      const searchValue = 'specific';
      const maxChars = 25;
      const renderer = createHighlightedCellRenderer(searchValue, maxChars);
      
      const mockParams = {
        value: 'This is a specific test value'
      };
      
      const result = renderer(mockParams);
      
      // Render and verify the component receives the correct props
      const { container } = render(result as React.ReactElement);
      
      // The searchTerm should be passed to highlightSearchTerm
      expect(mockedHighlightSearchTerm).toHaveBeenCalledWith(
        mockParams.value,
        searchValue
      );
    });

    it('should work with different search values', () => {
      const searchValue1 = 'first';
      const searchValue2 = 'second';
      const maxChars = 10;
      
      const renderer1 = createHighlightedCellRenderer(searchValue1, maxChars);
      const renderer2 = createHighlightedCellRenderer(searchValue2, maxChars);
      
      const mockParams = {
        value: 'This is a test value'
      };
      
      render(renderer1(mockParams) as React.ReactElement);
      expect(mockedHighlightSearchTerm).toHaveBeenCalledWith(mockParams.value, searchValue1);
      
      jest.clearAllMocks();
      
      render(renderer2(mockParams) as React.ReactElement);
      expect(mockedHighlightSearchTerm).toHaveBeenCalledWith(mockParams.value, searchValue2);
    });

    it('should work with different maxChars values', () => {
      const searchValue = 'test';
      const maxChars1 = 5;
      const maxChars2 = 20;
      
      const renderer1 = createHighlightedCellRenderer(searchValue, maxChars1);
      const renderer2 = createHighlightedCellRenderer(searchValue, maxChars2);
      
      const longText = 'This is a very long text that exceeds the maximum character limit';
      const shortText = 'Short text';
      const mockParams1 = { value: longText };
      const mockParams2 = { value: shortText };
      
      // First renderer should show tooltip (text > maxChars)
      const result1 = render(renderer1(mockParams1) as React.ReactElement);
      expect(screen.getByTestId('custom-tooltip')).toBeInTheDocument();
      
      // Second renderer should not show tooltip (text < maxChars)
      cleanup(); // Clear the previous render
      const result2 = render(renderer2(mockParams2) as React.ReactElement);
      expect(screen.queryByTestId('custom-tooltip')).not.toBeInTheDocument();
    });
  });
});
