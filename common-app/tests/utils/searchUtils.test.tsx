import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  highlightSearchTerm,
  highlightSearchTermHTML,
  containsSearchTerm
} from '../../src/utils/searchUtils';

describe('searchUtils', () => {
  describe('highlightSearchTerm', () => {
    it('should return original text when searchTerm is empty', () => {
      const result = highlightSearchTerm('Hello World', '');
      expect(result).toBe('Hello World');
    });

    it('should return original text when searchTerm is null or undefined', () => {
      expect(highlightSearchTerm('Hello World', null as any)).toBe('Hello World');
      expect(highlightSearchTerm('Hello World', undefined as any)).toBe('Hello World');
    });

    it('should return original text when text is empty', () => {
      const result = highlightSearchTerm('', 'test');
      expect(result).toBe('');
    });

    it('should return original text when text is null or undefined', () => {
      expect(highlightSearchTerm(null as any, 'test')).toBe(null);
      expect(highlightSearchTerm(undefined as any, 'test')).toBe(undefined);
    });

    it('should highlight single occurrence of search term', () => {
      const result = highlightSearchTerm('Hello World', 'World');
      
      const { container } = render(<div>{result}</div>);
      expect(container.firstChild).toHaveTextContent('Hello World');
      
      const highlightedSpan = container.querySelector('span');
      expect(highlightedSpan).toBeInTheDocument();
      expect(highlightedSpan).toHaveTextContent('World');
      expect(highlightedSpan).toHaveStyle({
        backgroundColor: 'rgba(255, 255, 0, 0.3)',
        fontWeight: 'bold',
        borderRadius: '2px',
        padding: '0 1px'
      });
    });

    it('should highlight multiple occurrences of search term', () => {
      const result = highlightSearchTerm('Hello World Hello', 'Hello');
      
      const { container } = render(<div>{result}</div>);
      expect(container.firstChild).toHaveTextContent('Hello World Hello');
      
      const highlightedSpans = container.querySelectorAll('span');
      expect(highlightedSpans).toHaveLength(2);
      highlightedSpans.forEach(span => {
        expect(span).toHaveTextContent('Hello');
        expect(span).toHaveStyle({
          backgroundColor: 'rgba(255, 255, 0, 0.3)',
          fontWeight: 'bold',
          borderRadius: '2px',
          padding: '0 1px'
      });
      });
    });

    it('should be case-insensitive', () => {
      const result = highlightSearchTerm('Hello World', 'world');
      
      const { container } = render(<div>{result}</div>);
      const highlightedSpan = container.querySelector('span');
      expect(highlightedSpan).toBeInTheDocument();
      expect(highlightedSpan).toHaveTextContent('World');
    });

    it('should handle mixed case search terms', () => {
      const result = highlightSearchTerm('Hello World', 'WoRlD');
      
      const { container } = render(<div>{result}</div>);
      const highlightedSpan = container.querySelector('span');
      expect(highlightedSpan).toBeInTheDocument();
      expect(highlightedSpan).toHaveTextContent('World');
    });

    it('should escape special regex characters in search term', () => {
      const result = highlightSearchTerm('Hello [World]', '[World]');
      
      const { container } = render(<div>{result}</div>);
      const highlightedSpan = container.querySelector('span');
      expect(highlightedSpan).toBeInTheDocument();
      expect(highlightedSpan).toHaveTextContent('[World]');
    });

    it('should handle special regex characters', () => {
      const specialChars = '.*+?^${}()|[]\\';
      const result = highlightSearchTerm(`Hello ${specialChars} World`, specialChars);
      
      const { container } = render(<div>{result}</div>);
      const highlightedSpan = container.querySelector('span');
      expect(highlightedSpan).toBeInTheDocument();
      expect(highlightedSpan).toHaveTextContent(specialChars);
    });

    it('should handle search term with spaces', () => {
      const result = highlightSearchTerm('Hello Beautiful World', 'Beautiful World');
      
      const { container } = render(<div>{result}</div>);
      const highlightedSpan = container.querySelector('span');
      expect(highlightedSpan).toBeInTheDocument();
      expect(highlightedSpan).toHaveTextContent('Beautiful World');
    });

    it('should handle search term that is the entire text', () => {
      const result = highlightSearchTerm('Hello', 'Hello');
      
      const { container } = render(<div>{result}</div>);
      const highlightedSpan = container.querySelector('span');
      expect(highlightedSpan).toBeInTheDocument();
      expect(highlightedSpan).toHaveTextContent('Hello');
    });

    it('should handle search term not found in text', () => {
      const result = highlightSearchTerm('Hello World', 'NotFound');
      
      const { container } = render(<div>{result}</div>);
      expect(container.firstChild).toHaveTextContent('Hello World');
      expect(container.querySelector('span')).not.toBeInTheDocument();
    });

    it('should handle whitespace-only search term', () => {
      const result = highlightSearchTerm('Hello World', '   ');
      expect(result).toBe('Hello World');
    });

    it('should handle search term with leading/trailing whitespace', () => {
      const result = highlightSearchTerm('Hello World', ' World ');
      // The function returns an array of React elements, not a string
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('highlightSearchTermHTML', () => {
    it('should return original text when searchTerm is empty', () => {
      const result = highlightSearchTermHTML('Hello World', '');
      expect(result).toBe('Hello World');
    });

    it('should return original text when searchTerm is null or undefined', () => {
      expect(highlightSearchTermHTML('Hello World', null as any)).toBe('Hello World');
      expect(highlightSearchTermHTML('Hello World', undefined as any)).toBe('Hello World');
    });

    it('should return original text when text is empty', () => {
      const result = highlightSearchTermHTML('', 'test');
      expect(result).toBe('');
    });

    it('should return original text when text is null or undefined', () => {
      expect(highlightSearchTermHTML(null as any, 'test')).toBe(null);
      expect(highlightSearchTermHTML(undefined as any, 'test')).toBe(undefined);
    });

    it('should return HTML string with highlighted search term', () => {
      const result = highlightSearchTermHTML('Hello World', 'World');
      expect(result).toBe('Hello <span style="background-color: rgba(255, 255, 0, 0.3); font-weight: bold; border-radius: 2px; padding: 0 1px;">World</span>');
    });

    it('should highlight multiple occurrences', () => {
      const result = highlightSearchTermHTML('Hello World Hello', 'Hello');
      expect(result).toBe('<span style="background-color: rgba(255, 255, 0, 0.3); font-weight: bold; border-radius: 2px; padding: 0 1px;">Hello</span> World <span style="background-color: rgba(255, 255, 0, 0.3); font-weight: bold; border-radius: 2px; padding: 0 1px;">Hello</span>');
    });

    it('should be case-insensitive', () => {
      const result = highlightSearchTermHTML('Hello World', 'world');
      expect(result).toContain('<span');
      expect(result).toContain('World');
    });

    it('should escape special regex characters', () => {
      const result = highlightSearchTermHTML('Hello [World]', '[World]');
      expect(result).toContain('<span');
      expect(result).toContain('[World]');
    });

    it('should handle search term not found', () => {
      const result = highlightSearchTermHTML('Hello World', 'NotFound');
      expect(result).toBe('Hello World');
    });

    it('should handle whitespace-only search term', () => {
      const result = highlightSearchTermHTML('Hello World', '   ');
      expect(result).toBe('Hello World');
    });
  });

  describe('containsSearchTerm', () => {
    it('should return false when searchTerm is empty', () => {
      expect(containsSearchTerm('Hello World', '')).toBe(false);
    });

    it('should return false when searchTerm is null or undefined', () => {
      expect(containsSearchTerm('Hello World', null as any)).toBe(false);
      expect(containsSearchTerm('Hello World', undefined as any)).toBe(false);
    });

    it('should return false when text is empty', () => {
      expect(containsSearchTerm('', 'test')).toBe(false);
    });

    it('should return false when text is null or undefined', () => {
      expect(containsSearchTerm(null as any, 'test')).toBe(false);
      expect(containsSearchTerm(undefined as any, 'test')).toBe(false);
    });

    it('should return true when search term is found', () => {
      expect(containsSearchTerm('Hello World', 'World')).toBe(true);
    });

    it('should return false when search term is not found', () => {
      expect(containsSearchTerm('Hello World', 'NotFound')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(containsSearchTerm('Hello World', 'world')).toBe(true);
      expect(containsSearchTerm('Hello World', 'WORLD')).toBe(true);
      expect(containsSearchTerm('Hello World', 'WoRlD')).toBe(true);
    });

    it('should handle partial matches', () => {
      expect(containsSearchTerm('Hello World', 'ello')).toBe(true);
      expect(containsSearchTerm('Hello World', 'orld')).toBe(true);
    });

    it('should handle exact matches', () => {
      expect(containsSearchTerm('Hello', 'Hello')).toBe(true);
      expect(containsSearchTerm('Hello World', 'Hello World')).toBe(true);
    });

    it('should handle search term with spaces', () => {
      expect(containsSearchTerm('Hello Beautiful World', 'Beautiful World')).toBe(true);
      expect(containsSearchTerm('Hello Beautiful World', 'Beautiful  World')).toBe(false);
    });

    it('should handle special characters', () => {
      expect(containsSearchTerm('Hello [World]', '[World]')).toBe(true);
      expect(containsSearchTerm('Hello [World]', 'World')).toBe(true);
    });

    it('should return false for whitespace-only search term', () => {
      expect(containsSearchTerm('Hello World', '   ')).toBe(false);
    });

    it('should handle search term with leading/trailing whitespace', () => {
      expect(containsSearchTerm('Hello World', ' World ')).toBe(false);
      expect(containsSearchTerm('Hello World', ' World')).toBe(true);
      expect(containsSearchTerm('Hello World', 'World ')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(containsSearchTerm('', '')).toBe(false);
      expect(containsSearchTerm('Hello', '')).toBe(false);
      expect(containsSearchTerm('', 'Hello')).toBe(false);
    });
  });
});
