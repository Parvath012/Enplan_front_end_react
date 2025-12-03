import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ListHeader from '../../../../src/components/entityConfiguration/shared/ListHeader';

describe('ListHeader', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<ListHeader title="Test Title" count={5} total={10} />);
      
      const title = screen.getByText('Test Title');
      const count = screen.getByText('5/10');
      
      expect(title).toBeInTheDocument();
      expect(count).toBeInTheDocument();
    });

    it('should render with different titles', () => {
      const titles = [
        'Countries List',
        'Currencies List',
        'Items',
        'Data',
        'Results',
      ];
      
      titles.forEach(title => {
        const { unmount } = render(<ListHeader title={title} count={0} total={0} />);
        expect(screen.getByText(title)).toBeInTheDocument();
        unmount();
      });
    });

    it('should render with different count values', () => {
      const counts = [0, 1, 5, 10, 100, 1000];
      
      counts.forEach(count => {
        const { unmount } = render(<ListHeader title="Test" count={count} total={count + 5} />);
        expect(screen.getByText(`${count}/${count + 5}`)).toBeInTheDocument();
        unmount();
      });
    });

    it('should render with different total values', () => {
      const totals = [0, 1, 5, 10, 100, 1000];
      
      totals.forEach(total => {
        const { unmount } = render(<ListHeader title="Test" count={Math.min(total, 5)} total={total} />);
        expect(screen.getByText(`${Math.min(total, 5)}/${total}`)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Styling', () => {
    it('should have correct container styling', () => {
      render(<ListHeader title="Test" count={5} total={10} />);
      
      const container = screen.getByText('Test').closest('div');
      expect(container).toHaveStyle({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        paddingBottom: '8px',
        borderBottom: '1px solid #e0e0e0',
      });
    });

    it('should have correct title styling', () => {
      render(<ListHeader title="Test Title" count={5} total={10} />);
      
      const title = screen.getByText('Test Title');
      expect(title).toHaveStyle({
        fontWeight: '500',
        color: '#4A4E52',
        fontSize: '12px',
        paddingLeft: '10px',
      });
    });

    it('should have correct count styling', () => {
      render(<ListHeader title="Test" count={5} total={10} />);
      
      const count = screen.getByText('5/10');
      expect(count).toHaveStyle({
        color: '#666',
        fontSize: '14px',
        fontWeight: '500',
        paddingRight: '10px',
      });
    });
  });

  describe('Count Display', () => {
    it('should display count in correct format', () => {
      render(<ListHeader title="Test" count={3} total={7} />);
      
      const count = screen.getByText('3/7');
      expect(count).toBeInTheDocument();
    });

    it('should handle zero count', () => {
      render(<ListHeader title="Test" count={0} total={5} />);
      
      const count = screen.getByText('0/5');
      expect(count).toBeInTheDocument();
    });

    it('should handle zero total', () => {
      render(<ListHeader title="Test" count={0} total={0} />);
      
      const count = screen.getByText('0/0');
      expect(count).toBeInTheDocument();
    });

    it('should handle count equal to total', () => {
      render(<ListHeader title="Test" count={5} total={5} />);
      
      const count = screen.getByText('5/5');
      expect(count).toBeInTheDocument();
    });

    it('should handle count greater than total', () => {
      render(<ListHeader title="Test" count={10} total={5} />);
      
      const count = screen.getByText('10/5');
      expect(count).toBeInTheDocument();
    });

    it('should handle large numbers', () => {
      render(<ListHeader title="Test" count={9999} total={10000} />);
      
      const count = screen.getByText('9999/10000');
      expect(count).toBeInTheDocument();
    });
  });

  describe('Title Display', () => {
    it('should display title exactly as provided', () => {
      const title = 'Countries and Currencies List';
      render(<ListHeader title={title} count={0} total={0} />);
      
      const titleElement = screen.getByText(title);
      expect(titleElement).toBeInTheDocument();
    });

    it('should handle empty title', () => {
      render(<ListHeader title="" count={0} total={0} />);
      
      // Can't use getByText with an empty string, so we'll use the role to find the heading
      const titleElement = screen.getByRole('heading');
      expect(titleElement).toBeInTheDocument();
      expect(titleElement.textContent).toBe('');
    });

    it('should handle long titles', () => {
      const longTitle = 'A'.repeat(100);
      render(<ListHeader title={longTitle} count={0} total={0} />);
      
      const titleElement = screen.getByText(longTitle);
      expect(titleElement).toBeInTheDocument();
    });

    it('should handle titles with special characters', () => {
      const specialTitle = 'Test & Title <script>alert("xss")</script>';
      render(<ListHeader title={specialTitle} count={0} total={0} />);
      
      const titleElement = screen.getByText(specialTitle);
      expect(titleElement).toBeInTheDocument();
    });

    it('should handle titles with numbers', () => {
      const numericTitle = 'List 123';
      render(<ListHeader title={numericTitle} count={0} total={0} />);
      
      const titleElement = screen.getByText(numericTitle);
      expect(titleElement).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have correct flex layout', () => {
      render(<ListHeader title="Test" count={5} total={10} />);
      
      const container = screen.getByText('Test').closest('div');
      expect(container).toHaveStyle({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      });
    });

    it('should position title on the left', () => {
      render(<ListHeader title="Left Title" count={5} total={10} />);
      
      const title = screen.getByText('Left Title');
      const container = title.closest('div');
      
      // Title should be the first child
      expect(container?.firstChild).toBe(title);
    });

    it('should position count on the right', () => {
      render(<ListHeader title="Test" count={5} total={10} />);
      
      const count = screen.getByText('5/10');
      const container = count.closest('div');
      
      // Count should be the last child
      expect(container?.lastChild).toBe(count);
    });
  });

  describe('Typography', () => {
    it('should use correct typography variant for title', () => {
      render(<ListHeader title="Test Title" count={5} total={10} />);
      
      const title = screen.getByText('Test Title');
      expect(title.tagName).toBe('H6'); // Typography variant="h6"
    });

    it('should have correct font weights', () => {
      render(<ListHeader title="Test" count={5} total={10} />);
      
      const title = screen.getByText('Test');
      const count = screen.getByText('5/10');
      
      expect(title).toHaveStyle({ fontWeight: '500' });
      expect(count).toHaveStyle({ fontWeight: '500' });
    });

    it('should have correct font sizes', () => {
      render(<ListHeader title="Test" count={5} total={10} />);
      
      const title = screen.getByText('Test');
      const count = screen.getByText('5/10');
      
      expect(title).toHaveStyle({ fontSize: '12px' });
      expect(count).toHaveStyle({ fontSize: '14px' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined title', () => {
      render(<ListHeader title={undefined as any} count={0} total={0} />);
      
      // Can't use getByText with an empty string, so we'll use the role to find the heading
      const titleElement = screen.getByRole('heading');
      expect(titleElement).toBeInTheDocument();
      expect(titleElement.textContent).toBe('');
    });

    it('should handle null title', () => {
      render(<ListHeader title={null as any} count={0} total={0} />);
      
      // Can't use getByText with an empty string, so we'll use the role to find the heading
      const titleElement = screen.getByRole('heading');
      expect(titleElement).toBeInTheDocument();
      expect(titleElement.textContent).toBe('');
    });

    it('should handle negative numbers', () => {
      render(<ListHeader title="Test" count={-5} total={-10} />);
      
      const countElement = screen.getByText('-5/-10');
      expect(countElement).toBeInTheDocument();
    });

    it('should handle decimal numbers', () => {
      render(<ListHeader title="Test" count={5.5} total={10.7} />);
      
      const countElement = screen.getByText('5.5/10.7');
      expect(countElement).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible via screen readers', () => {
      render(<ListHeader title="Test Title" count={5} total={10} />);
      
      const title = screen.getByText('Test Title');
      const count = screen.getByText('5/10');
      
      expect(title).toBeInTheDocument();
      expect(count).toBeInTheDocument();
    });

    it('should have proper semantic structure', () => {
      render(<ListHeader title="Test Title" count={5} total={10} />);
      
      const title = screen.getByText('Test Title');
      expect(title.tagName).toBe('H6');
    });
  });

  describe('Component Structure', () => {
    it('should render with correct DOM structure', () => {
      render(<ListHeader title="Test" count={5} total={10} />);
      
      const container = screen.getByText('Test').closest('div');
      const title = screen.getByText('Test');
      const count = screen.getByText('5/10');
      
      expect(container).toBeInTheDocument();
      expect(title).toBeInTheDocument();
      expect(count).toBeInTheDocument();
      expect(container).toContainElement(title);
      expect(container).toContainElement(count);
    });

    it('should have correct nesting structure', () => {
      render(<ListHeader title="Test" count={5} total={10} />);
      
      const container = screen.getByText('Test').closest('div');
      const title = screen.getByText('Test');
      const count = screen.getByText('5/10');
      
      expect(container).toContainElement(title);
      expect(container).toContainElement(count);
      expect(title).not.toContainElement(count);
      expect(count).not.toContainElement(title);
    });
  });

  describe('Performance', () => {
    it('should render efficiently with multiple instances', () => {
      const headers = Array.from({ length: 100 }, (_, i) => ({
        title: `Header ${i}`,
        count: i,
        total: i + 10,
      }));
      
      headers.forEach(({ title, count, total }) => {
        const { unmount } = render(<ListHeader title={title} count={count} total={total} />);
        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByText(`${count}/${total}`)).toBeInTheDocument();
        unmount();
      });
    });

    it('should handle rapid re-renders', () => {
      const { rerender } = render(<ListHeader title="Initial" count={0} total={0} />);
      
      for (let i = 0; i < 10; i++) {
        rerender(<ListHeader title={`Title ${i}`} count={i} total={i + 5} />);
        expect(screen.getByText(`Title ${i}`)).toBeInTheDocument();
        expect(screen.getByText(`${i}/${i + 5}`)).toBeInTheDocument();
      }
    });
  });
});
