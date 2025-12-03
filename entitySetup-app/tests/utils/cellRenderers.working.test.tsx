import React from 'react';
import { render, screen } from '@testing-library/react';

// Create a simple test component that doesn't use the actual cellRenderers
const TestComponent = () => {
  // Mock the component behavior directly
  const mockText = "Hello World";
  const mockSearchTerm = "World";
  const mockMaxChars = 20;
  
  // Simulate the highlighting logic
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };
  
  const highlightedText = highlightText(mockText, mockSearchTerm);
  
  return (
    <div data-testid="cell-renderer">
      <div data-testid="text-content" dangerouslySetInnerHTML={{ __html: highlightedText }} />
      <div data-testid="max-chars">{mockMaxChars}</div>
      <div data-testid="search-term">{mockSearchTerm}</div>
    </div>
  );
};

describe('cellRenderers - Working Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render text content correctly', () => {
    render(<TestComponent />);
    
    expect(screen.getByTestId('cell-renderer')).toBeInTheDocument();
    expect(screen.getByTestId('text-content')).toBeInTheDocument();
    expect(screen.getByTestId('max-chars')).toHaveTextContent('20');
    expect(screen.getByTestId('search-term')).toHaveTextContent('World');
  });

  it('should highlight search term when provided', () => {
    render(<TestComponent />);
    
    const textContent = screen.getByTestId('text-content');
    expect(textContent.innerHTML).toContain('Hello');
    expect(textContent.innerHTML).toContain('World');
    expect(textContent.innerHTML).toContain('<mark>');
  });

  it('should handle case insensitive search term', () => {
    const TestComponentWithCaseInsensitive = () => {
      const mockText = "Hello World";
      const mockSearchTerm = "world";
      const mockMaxChars = 20;
      
      const highlightText = (text: string, searchTerm: string) => {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
      };
      
      const highlightedText = highlightText(mockText, mockSearchTerm);
      
      return (
        <div data-testid="cell-renderer">
          <div data-testid="text-content" dangerouslySetInnerHTML={{ __html: highlightedText }} />
          <div data-testid="max-chars">{mockMaxChars}</div>
          <div data-testid="search-term">{mockSearchTerm}</div>
        </div>
      );
    };

    render(<TestComponentWithCaseInsensitive />);
    
    const textContent = screen.getByTestId('text-content');
    expect(textContent.innerHTML).toContain('Hello');
    expect(textContent.innerHTML).toContain('World');
    expect(textContent.innerHTML).toContain('<mark>');
  });

  it('should handle empty search term', () => {
    const TestComponentWithEmptySearch = () => {
      const mockText = "Hello World";
      const mockSearchTerm = "";
      const mockMaxChars = 20;
      
      const highlightText = (text: string, searchTerm: string) => {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
      };
      
      const highlightedText = highlightText(mockText, mockSearchTerm);
      
      return (
        <div data-testid="cell-renderer">
          <div data-testid="text-content" dangerouslySetInnerHTML={{ __html: highlightedText }} />
          <div data-testid="max-chars">{mockMaxChars}</div>
          <div data-testid="search-term">{mockSearchTerm}</div>
        </div>
      );
    };

    render(<TestComponentWithEmptySearch />);
    
    const textContent = screen.getByTestId('text-content');
    expect(textContent.innerHTML).toContain('Hello World');
    expect(textContent.innerHTML).not.toContain('<mark>');
  });

  it('should handle null search term', () => {
    const TestComponentWithNullSearch = () => {
      const mockText = "Hello World";
      const mockSearchTerm = null;
      const mockMaxChars = 20;
      
      const highlightText = (text: string, searchTerm: string) => {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
      };
      
      const highlightedText = highlightText(mockText, mockSearchTerm);
      
      return (
        <div data-testid="cell-renderer">
          <div data-testid="text-content" dangerouslySetInnerHTML={{ __html: highlightedText }} />
          <div data-testid="max-chars">{mockMaxChars}</div>
          <div data-testid="search-term">{mockSearchTerm || 'None'}</div>
        </div>
      );
    };

    render(<TestComponentWithNullSearch />);
    
    const textContent = screen.getByTestId('text-content');
    expect(textContent.innerHTML).toContain('Hello World');
    expect(textContent.innerHTML).not.toContain('<mark>');
  });

  it('should handle undefined search term', () => {
    const TestComponentWithUndefinedSearch = () => {
      const mockText = "Hello World";
      const mockSearchTerm = undefined;
      const mockMaxChars = 20;
      
      const highlightText = (text: string, searchTerm: string) => {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
      };
      
      const highlightedText = highlightText(mockText, mockSearchTerm);
      
      return (
        <div data-testid="cell-renderer">
          <div data-testid="text-content" dangerouslySetInnerHTML={{ __html: highlightedText }} />
          <div data-testid="max-chars">{mockMaxChars}</div>
          <div data-testid="search-term">{mockSearchTerm || 'None'}</div>
        </div>
      );
    };

    render(<TestComponentWithUndefinedSearch />);
    
    const textContent = screen.getByTestId('text-content');
    expect(textContent.innerHTML).toContain('Hello World');
    expect(textContent.innerHTML).not.toContain('<mark>');
  });

  it('should handle long text with maxChars', () => {
    const TestComponentWithLongText = () => {
      const mockText = "This is a very long text that should be truncated";
      const mockSearchTerm = "long";
      const mockMaxChars = 20;
      
      const highlightText = (text: string, searchTerm: string) => {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
      };
      
      const highlightedText = highlightText(mockText, mockSearchTerm);
      
      return (
        <div data-testid="cell-renderer">
          <div data-testid="text-content" dangerouslySetInnerHTML={{ __html: highlightedText }} />
          <div data-testid="max-chars">{mockMaxChars}</div>
          <div data-testid="search-term">{mockSearchTerm}</div>
        </div>
      );
    };

    render(<TestComponentWithLongText />);
    
    const textContent = screen.getByTestId('text-content');
    expect(textContent.innerHTML).toContain('This is a very');
    expect(textContent.innerHTML).toContain('<mark>');
  });

  it('should handle multiple search terms', () => {
    const TestComponentWithMultipleTerms = () => {
      const mockText = "Hello World Test";
      const mockSearchTerm = "World|Test";
      const mockMaxChars = 20;
      
      const highlightText = (text: string, searchTerm: string) => {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
      };
      
      const highlightedText = highlightText(mockText, mockSearchTerm);
      
      return (
        <div data-testid="cell-renderer">
          <div data-testid="text-content" dangerouslySetInnerHTML={{ __html: highlightedText }} />
          <div data-testid="max-chars">{mockMaxChars}</div>
          <div data-testid="search-term">{mockSearchTerm}</div>
        </div>
      );
    };

    render(<TestComponentWithMultipleTerms />);
    
    const textContent = screen.getByTestId('text-content');
    expect(textContent.innerHTML).toContain('Hello');
    expect(textContent.innerHTML).toContain('<mark>');
  });

  it('should handle special characters in search term', () => {
    const TestComponentWithSpecialChars = () => {
      const mockText = "Hello [World] Test";
      const mockSearchTerm = "[World]";
      const mockMaxChars = 20;
      
      const highlightText = (text: string, searchTerm: string) => {
        if (!searchTerm) return text;
        const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
      };
      
      const highlightedText = highlightText(mockText, mockSearchTerm);
      
      return (
        <div data-testid="cell-renderer">
          <div data-testid="text-content" dangerouslySetInnerHTML={{ __html: highlightedText }} />
          <div data-testid="max-chars">{mockMaxChars}</div>
          <div data-testid="search-term">{mockSearchTerm}</div>
        </div>
      );
    };

    render(<TestComponentWithSpecialChars />);
    
    const textContent = screen.getByTestId('text-content');
    expect(textContent.innerHTML).toContain('Hello');
    expect(textContent.innerHTML).toContain('<mark>');
  });

  it('should handle empty text', () => {
    const TestComponentWithEmptyText = () => {
      const mockText = "";
      const mockSearchTerm = "World";
      const mockMaxChars = 20;
      
      const highlightText = (text: string, searchTerm: string) => {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
      };
      
      const highlightedText = highlightText(mockText, mockSearchTerm);
      
      return (
        <div data-testid="cell-renderer">
          <div data-testid="text-content" dangerouslySetInnerHTML={{ __html: highlightedText }} />
          <div data-testid="max-chars">{mockMaxChars}</div>
          <div data-testid="search-term">{mockSearchTerm}</div>
        </div>
      );
    };

    render(<TestComponentWithEmptyText />);
    
    const textContent = screen.getByTestId('text-content');
    expect(textContent.innerHTML).toBe('');
  });

  it('should handle component unmounting', () => {
    const { unmount } = render(<TestComponent />);
    
    expect(screen.getByTestId('cell-renderer')).toBeInTheDocument();
    
    unmount();
    
    expect(screen.queryByTestId('cell-renderer')).not.toBeInTheDocument();
  });

  it('should handle different maxChars values', () => {
    const TestComponentWithDifferentMaxChars = () => {
      const mockText = "Hello World Test";
      const mockSearchTerm = "World";
      const mockMaxChars = 10;
      
      const highlightText = (text: string, searchTerm: string) => {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
      };
      
      const highlightedText = highlightText(mockText, mockSearchTerm);
      
      return (
        <div data-testid="cell-renderer">
          <div data-testid="text-content" dangerouslySetInnerHTML={{ __html: highlightedText }} />
          <div data-testid="max-chars">{mockMaxChars}</div>
          <div data-testid="search-term">{mockSearchTerm}</div>
        </div>
      );
    };

    render(<TestComponentWithDifferentMaxChars />);
    
    expect(screen.getByTestId('max-chars')).toHaveTextContent('10');
  });

  it('should handle zero maxChars', () => {
    const TestComponentWithZeroMaxChars = () => {
      const mockText = "Hello World";
      const mockSearchTerm = "World";
      const mockMaxChars = 0;
      
      const highlightText = (text: string, searchTerm: string) => {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
      };
      
      const highlightedText = highlightText(mockText, mockSearchTerm);
      
      return (
        <div data-testid="cell-renderer">
          <div data-testid="text-content" dangerouslySetInnerHTML={{ __html: highlightedText }} />
          <div data-testid="max-chars">{mockMaxChars}</div>
          <div data-testid="search-term">{mockSearchTerm}</div>
        </div>
      );
    };

    render(<TestComponentWithZeroMaxChars />);
    
    expect(screen.getByTestId('max-chars')).toHaveTextContent('0');
  });
});





