import React from 'react';
import { highlightSearchTerm, containsSearchTerm, highlightSearchTermHTML } from '../../src/utils/searchUtils';
import { render } from '@testing-library/react';

describe('Search Utils', () => {
  describe('highlightSearchTerm', () => {
    it('should return original text when no search term is provided', () => {
      const result = highlightSearchTerm('Hello World', '');
      expect(result).toEqual(['Hello World']);
    });

    it('should return original text when search term is null/undefined', () => {
      const result = highlightSearchTerm('Hello World', null as any);
      expect(result).toEqual(['Hello World']);
      const result2 = highlightSearchTerm('Hello World', undefined as any);
      expect(result2).toEqual(['Hello World']);
    });

    it('should highlight matching text case-insensitively', () => {
      const { container } = render(<div>{highlightSearchTerm('Hello World', 'hello')}</div>);
      const highlightedSpan = container.querySelector('span');
      expect(highlightedSpan).toBeInTheDocument();
      expect(highlightedSpan?.textContent).toBe('Hello');
      expect(highlightedSpan?.style.backgroundColor).toBe('yellow');
    });

    it('should highlight multiple occurrences', () => {
      const { container } = render(<div>{highlightSearchTerm('Hello Hello World', 'hello')}</div>);
      const highlightedSpans = container.querySelectorAll('span');
      expect(highlightedSpans).toHaveLength(2);
      expect(highlightedSpans[0].textContent).toBe('Hello');
      expect(highlightedSpans[1].textContent).toBe('Hello');
    });

    it('should handle special regex characters', () => {
      const { container } = render(<div>{highlightSearchTerm('Hello (World)', '(World')}</div>);
      const highlightedSpan = container.querySelector('span');
      expect(highlightedSpan).toBeInTheDocument();
      expect(highlightedSpan?.textContent).toBe('(World');
    });

    it('should handle empty text', () => {
      const result = highlightSearchTerm('', 'hello');
      expect(result).toEqual(['']);
    });

    it('should handle text with non-matching search term', () => {
      const { container } = render(<div>{highlightSearchTerm('Hello World', 'xyz')}</div>);
      const highlightedSpans = container.querySelectorAll('span');
      expect(highlightedSpans).toHaveLength(0);
    });

    it('should handle partial matches', () => {
      const { container } = render(<div>{highlightSearchTerm('Hello World', 'ell')}</div>);
      const highlightedSpan = container.querySelector('span');
      expect(highlightedSpan).toBeInTheDocument();
      expect(highlightedSpan?.textContent).toBe('ell');
    });

    it('should handle search term at the beginning', () => {
      const { container } = render(<div>{highlightSearchTerm('Hello World', 'Hello')}</div>);
      const highlightedSpan = container.querySelector('span');
      expect(highlightedSpan).toBeInTheDocument();
      expect(highlightedSpan?.textContent).toBe('Hello');
    });

    it('should handle search term at the end', () => {
      const { container } = render(<div>{highlightSearchTerm('Hello World', 'World')}</div>);
      const highlightedSpan = container.querySelector('span');
      expect(highlightedSpan).toBeInTheDocument();
      expect(highlightedSpan?.textContent).toBe('World');
    });
  });

  describe('highlightSearchTermHTML', () => {
    it('should return original text when no search term is provided', () => {
      const result = highlightSearchTermHTML('Hello World', '');
      expect(result).toBe('Hello World');
    });

    it('should return original text when search term is null/undefined', () => {
      const result = highlightSearchTermHTML('Hello World', null as any);
      expect(result).toBe('Hello World');
      const result2 = highlightSearchTermHTML('Hello World', undefined as any);
      expect(result2).toBe('Hello World');
    });

    it('should highlight matching text case-insensitively with HTML', () => {
      const result = highlightSearchTermHTML('Hello World', 'hello');
      expect(result).toContain('<mark>Hello</mark>');
      expect(result).toBe('Hello <mark>World</mark>');
    });

    it('should highlight multiple occurrences with HTML', () => {
      const result = highlightSearchTermHTML('Hello Hello World', 'hello');
      const matches = result.match(/<mark>Hello<\/mark>/gi);
      expect(matches).toHaveLength(2);
    });

    it('should handle special regex characters', () => {
      const result = highlightSearchTermHTML('Hello (World)', '(World');
      expect(result).toContain('<mark>(World</mark>');
    });

    it('should handle empty text', () => {
      const result = highlightSearchTermHTML('', 'hello');
      expect(result).toBe('');
    });

    it('should handle text with only whitespace', () => {
      const result = highlightSearchTermHTML('   ', 'hello');
      expect(result).toBe('   ');
    });

    it('should handle search term with regex special characters', () => {
      const result = highlightSearchTermHTML('Hello [World]', '[World]');
      expect(result).toContain('<mark>[World]</mark>');
    });

    it('should handle search term with dots', () => {
      const result = highlightSearchTermHTML('Hello. World.', '.');
      expect(result).toContain('<mark>.</mark>');
    });
  });

  describe('containsSearchTerm', () => {
    it('should return false when no search term is provided', () => {
      expect(containsSearchTerm('Hello World', '')).toBe(false);
    });

    it('should return false when search term is null/undefined', () => {
      expect(containsSearchTerm('Hello World', null as any)).toBe(false);
    });

    it('should return true when search term is found (case-insensitive)', () => {
      expect(containsSearchTerm('Hello World', 'hello')).toBe(true);
      expect(containsSearchTerm('Hello World', 'WORLD')).toBe(true);
    });

    it('should return false when search term is not found', () => {
      expect(containsSearchTerm('Hello World', 'xyz')).toBe(false);
    });

    it('should handle empty text', () => {
      expect(containsSearchTerm('', 'hello')).toBe(false);
    });

    it('should return true when search term is only whitespace', () => {
      expect(containsSearchTerm('Hello World', ' ')).toBe(true);
      expect(containsSearchTerm('Hello World', '  ')).toBe(true);
    });

    it('should handle search term with different cases', () => {
      expect(containsSearchTerm('Hello World', 'HELLO')).toBe(true);
      expect(containsSearchTerm('Hello World', 'world')).toBe(true);
      expect(containsSearchTerm('Hello World', 'HeLLo')).toBe(true);
    });

    it('should handle partial matches', () => {
      expect(containsSearchTerm('Hello World', 'ell')).toBe(true);
      expect(containsSearchTerm('Hello World', 'orl')).toBe(true);
    });

    it('should return false for non-matching partial strings', () => {
      expect(containsSearchTerm('Hello World', 'xyz')).toBe(false);
      expect(containsSearchTerm('Hello World', 'abc')).toBe(false);
    });
  });
});
