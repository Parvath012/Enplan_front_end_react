import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../../../src/components/layout/Footer';

describe('Footer Component', () => {
  describe('Component Structure', () => {
    it('renders with default props', () => {
      render(<Footer label="Footer" count={19} />);
      
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
      expect(screen.getByText('19')).toBeInTheDocument();
    });

    it('renders with custom label', () => {
      render(<Footer label="Custom Label" count={19} />);
      
      expect(screen.getByText('Custom Label')).toBeInTheDocument();
      expect(screen.getByText('19')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<Footer label="Test" count={10} className="custom-footer" />);
      
      const footerElement = screen.getByTestId('footer');
      expect(footerElement).toHaveClass('footer', 'custom-footer');
    });

    it('renders with minimal required props', () => {
      render(<Footer label="Footer" count={0} />);
      
      expect(screen.getByText('Footer')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('displays count correctly', () => {
      render(<Footer label="Footer" count={42} />);
      
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('displays label and count correctly', () => {
      render(<Footer label="Total Items" count={100} />);
      
      expect(screen.getByText('Total Items')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('handles zero count', () => {
      render(<Footer label="Footer" count={0} />);
      
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles large count', () => {
      render(<Footer label="Footer" count={1000000} />);
      
      expect(screen.getByText('1000000')).toBeInTheDocument();
    });

    it('handles negative count', () => {
      render(<Footer label="Footer" count={-5} />);
      
      expect(screen.getByText('-5')).toBeInTheDocument();
    });

    it('handles decimal count', () => {
      render(<Footer label="Footer" count={3.14} />);
      
      expect(screen.getByText('3.14')).toBeInTheDocument();
    });

    it('handles empty label', () => {
      render(<Footer label="" count={42} />);
      
      expect(screen.getByText('42')).toBeInTheDocument();
      const footerElement = screen.getByTestId('footer');
      expect(footerElement).toBeInTheDocument();
    });

    it('handles label with special characters', () => {
      render(<Footer label="Items & Records (Total)" count={10} />);
      
      expect(screen.getByText('Items & Records (Total)')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('applies default styling correctly', () => {
      render(<Footer label="Footer" count={5} />);
      
      const footerElement = screen.getByTestId('footer');
      expect(footerElement).toBeInTheDocument();
      expect(footerElement).toHaveClass('footer');
    });

    it('applies custom className', () => {
      render(<Footer label="Footer" count={5} className="custom-class" />);
      
      const footerElement = screen.getByTestId('footer');
      expect(footerElement).toHaveClass('footer', 'custom-class');
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined label', () => {
      render(<Footer label={undefined as any} count={42} />);
      
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('handles null label', () => {
      render(<Footer label={null as any} count={42} />);
      
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('handles very large numbers', () => {
      render(<Footer label="Footer" count={999999999} />);
      
      expect(screen.getByText('999999999')).toBeInTheDocument();
    });

    it('handles very small numbers', () => {
      render(<Footer label="Footer" count={-999999999} />);
      
      expect(screen.getByText('-999999999')).toBeInTheDocument();
    });

    it('handles zero with custom label', () => {
      render(<Footer label="Total Records" count={0} />);
      
      expect(screen.getByText('Total Records')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles large count with custom label', () => {
      render(<Footer label="Total Records" count={999999} />);
      
      expect(screen.getByText('Total Records')).toBeInTheDocument();
      expect(screen.getByText('999999')).toBeInTheDocument();
    });

    it('handles negative count with custom label', () => {
      render(<Footer label="Total Records" count={-5} />);
      
      expect(screen.getByText('Total Records')).toBeInTheDocument();
      expect(screen.getByText('-5')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('works with different count types', () => {
      const { rerender } = render(<Footer label="Footer" count={42} />);
      expect(screen.getByText('42')).toBeInTheDocument();
      
      rerender(<Footer label="Footer" count={0} />);
      expect(screen.getByText('0')).toBeInTheDocument();
      
      rerender(<Footer label="Footer" count={-10} />);
      expect(screen.getByText('-10')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('renders text content properly', () => {
      render(<Footer label="Total Items" count={42} />);
      
      expect(screen.getByText('Total Items')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('maintains proper text structure', () => {
      render(<Footer label="Records" count={100} />);
      
      expect(screen.getByText('Records')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  describe('Performance and Behavior', () => {
    it('renders efficiently with default props', () => {
      const startTime = performance.now();
      render(<Footer label="Footer" count={5} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should render quickly
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('handles rapid re-renders', () => {
      const { rerender } = render(<Footer label="Footer" count={1} />);
      expect(screen.getByText('1')).toBeInTheDocument();
      
      rerender(<Footer label="Footer" count={2} />);
      expect(screen.getByText('2')).toBeInTheDocument();
      
      rerender(<Footer label="Footer" count={3} />);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('handles className changes', () => {
      const { rerender } = render(<Footer label="Footer" count={5} />);
      expect(screen.getByText('5')).toBeInTheDocument();
      
      rerender(<Footer label="Footer" count={5} className="new-class" />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });
});
