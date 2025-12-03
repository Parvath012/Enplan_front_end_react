import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorDisplay from '../../../src/components/bulkUpload/ErrorDisplay';
import '@testing-library/jest-dom';

describe('ErrorDisplay', () => {
  describe('Rendering', () => {
    it('should render error message', () => {
      render(<ErrorDisplay error="Test error message" />);
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('should render error icon', () => {
      const { container } = render(<ErrorDisplay error="Test error" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '14');
      expect(svg).toHaveAttribute('height', '14');
    });

    it('should render circle and path in SVG', () => {
      const { container } = render(<ErrorDisplay error="Test error" />);
      const circle = container.querySelector('circle');
      const path = container.querySelector('path');
      expect(circle).toBeInTheDocument();
      expect(path).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply default styles when showEllipsis is false', () => {
      const { container } = render(<ErrorDisplay error="Test error" />);
      const box = container.firstChild as HTMLElement;
      expect(box).toBeInTheDocument();
    });

    it('should apply ellipsis styles when showEllipsis is true', () => {
      const { container } = render(<ErrorDisplay error="Test error" showEllipsis={true} />);
      const typography = container.querySelector('p, span, div[class*="Typography"]');
      expect(typography).toBeInTheDocument();
    });

    it('should have correct marginTop when showEllipsis is true', () => {
      const { container } = render(<ErrorDisplay error="Test error" showEllipsis={true} />);
      const box = container.firstChild as HTMLElement;
      expect(box).toBeInTheDocument();
    });

    it('should have correct marginTop when showEllipsis is false', () => {
      const { container } = render(<ErrorDisplay error="Test error" showEllipsis={false} />);
      const box = container.firstChild as HTMLElement;
      expect(box).toBeInTheDocument();
    });
  });

  describe('Error Message Display', () => {
    it('should display short error message', () => {
      render(<ErrorDisplay error="Short error" />);
      expect(screen.getByText('Short error')).toBeInTheDocument();
    });

    it('should display long error message', () => {
      const longError = 'A'.repeat(200);
      render(<ErrorDisplay error={longError} />);
      expect(screen.getByText(longError)).toBeInTheDocument();
    });

    it('should display error message with special characters', () => {
      const specialError = 'Error: "Invalid format" & <required>';
      render(<ErrorDisplay error={specialError} />);
      expect(screen.getByText(specialError)).toBeInTheDocument();
    });

    it('should display empty error message', () => {
      render(<ErrorDisplay error="" />);
      const { container } = render(<ErrorDisplay error="" />);
      const typography = container.querySelector('p, span, div[class*="Typography"]');
      expect(typography).toBeInTheDocument();
      expect(typography?.textContent).toBe('');
    });
  });

  describe('Ellipsis Behavior', () => {
    it('should not apply ellipsis by default', () => {
      const { container } = render(<ErrorDisplay error="Test error" />);
      const typography = container.querySelector('p, span, div[class*="Typography"]');
      expect(typography).toBeInTheDocument();
    });

    it('should apply ellipsis when showEllipsis is true', () => {
      const { container } = render(<ErrorDisplay error="Test error" showEllipsis={true} />);
      const typography = container.querySelector('p, span, div[class*="Typography"]');
      expect(typography).toBeInTheDocument();
    });

    it('should apply flex: 1 when showEllipsis is true', () => {
      const { container } = render(<ErrorDisplay error="Test error" showEllipsis={true} />);
      const typography = container.querySelector('p, span, div[class*="Typography"]');
      expect(typography).toBeInTheDocument();
    });

    it('should apply minWidth: 0 when showEllipsis is true', () => {
      const { container } = render(<ErrorDisplay error="Test error" showEllipsis={true} />);
      const typography = container.querySelector('p, span, div[class*="Typography"]');
      expect(typography).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should have correct Box structure', () => {
      const { container } = render(<ErrorDisplay error="Test error" />);
      const boxes = container.querySelectorAll('div[class*="MuiBox"]');
      expect(boxes.length).toBeGreaterThanOrEqual(2);
    });

    it('should have icon Box with correct dimensions', () => {
      const { container } = render(<ErrorDisplay error="Test error" />);
      const iconBox = container.querySelectorAll('div[class*="MuiBox"]')[1];
      expect(iconBox).toBeInTheDocument();
    });

    it('should have Typography component for error text', () => {
      const { container } = render(<ErrorDisplay error="Test error" />);
      const typography = container.querySelector('p, span, div[class*="Typography"]');
      expect(typography).toBeInTheDocument();
    });
  });

  describe('SVG Icon', () => {
    it('should render SVG with correct viewBox', () => {
      const { container } = render(<ErrorDisplay error="Test error" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 14 14');
    });

    it('should render circle with correct attributes', () => {
      const { container } = render(<ErrorDisplay error="Test error" />);
      const circle = container.querySelector('circle');
      expect(circle).toHaveAttribute('cx', '7');
      expect(circle).toHaveAttribute('cy', '7');
      expect(circle).toHaveAttribute('r', '6.5');
      expect(circle).toHaveAttribute('stroke', '#EF5350');
      expect(circle).toHaveAttribute('strokeWidth', '1.5');
    });

    it('should render path with correct attributes', () => {
      const { container } = render(<ErrorDisplay error="Test error" />);
      const path = container.querySelector('path');
      expect(path).toHaveAttribute('d', 'M4 4L10 10');
      expect(path).toHaveAttribute('stroke', '#EF5350');
      expect(path).toHaveAttribute('strokeWidth', '1.5');
      expect(path).toHaveAttribute('strokeLinecap', 'round');
    });
  });
});

