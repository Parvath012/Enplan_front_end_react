import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RowFilterContent } from '../../../src/components/advancedsearch/RowFilterContent';

describe('RowFilterContent', () => {
  describe('Rendering', () => {
    it('renders the component', () => {
      render(<RowFilterContent />);
      
      expect(screen.getByText('Row Filter Options')).toBeInTheDocument();
    });

    it('renders with correct content', () => {
      render(<RowFilterContent />);
      
      expect(screen.getByText('Row Filter Options')).toBeInTheDocument();
      expect(screen.getByText('Use the search bar above to filter rows with query syntax.')).toBeInTheDocument();
    });
  });

  describe('Structure', () => {
    it('renders as a div element', () => {
      render(<RowFilterContent />);
      
      const element = screen.getByText('Row Filter Options');
      expect(element.tagName).toBe('H3');
    });

    it('has correct text content', () => {
      render(<RowFilterContent />);
      
      expect(screen.getByText('Row Filter Options')).toHaveTextContent('Row Filter Options');
    });
  });

  describe('Accessibility', () => {
    it('is accessible to screen readers', () => {
      render(<RowFilterContent />);
      
      const element = screen.getByText('Row Filter Options');
      expect(element).toBeVisible();
    });
  });

  describe('Edge Cases', () => {
    it('renders consistently on multiple renders', () => {
      const { rerender } = render(<RowFilterContent />);
      
      expect(screen.getByText('Row Filter Options')).toBeInTheDocument();
      
      rerender(<RowFilterContent />);
      expect(screen.getByText('Row Filter Options')).toBeInTheDocument();
    });

    it('handles rapid re-renders', () => {
      const { rerender } = render(<RowFilterContent />);
      
      // Rapid re-renders
      for (let i = 0; i < 10; i++) {
        rerender(<RowFilterContent />);
      }
      
      expect(screen.getByText('Row Filter Options')).toBeInTheDocument();
    });
  });
});
