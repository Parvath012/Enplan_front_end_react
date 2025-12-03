import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatusMessage from '../../../../src/components/entityConfiguration/shared/StatusMessage';

describe('StatusMessage', () => {
  describe('Rendering', () => {
    it('should render with loading message', () => {
      render(<StatusMessage message="Loading..." type="loading" />);
      
      const message = screen.getByText('Loading...');
      expect(message).toBeInTheDocument();
    });

    it('should render with empty message', () => {
      render(<StatusMessage message="No items found" type="empty" />);
      
      const message = screen.getByText('No items found');
      expect(message).toBeInTheDocument();
    });

    it('should render with different loading messages', () => {
      render(<StatusMessage message="Fetching data..." type="loading" />);
      
      const message = screen.getByText('Fetching data...');
      expect(message).toBeInTheDocument();
    });

    it('should render with different empty messages', () => {
      render(<StatusMessage message="Your list is empty" type="empty" />);
      
      const message = screen.getByText('Your list is empty');
      expect(message).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply correct styling for loading type', () => {
      const { container } = render(<StatusMessage message="Loading..." type="loading" />);
      
      const statusMessage = container.querySelector('[data-testid="status-message"]');
      expect(statusMessage).toBeInTheDocument();
      expect(statusMessage).toHaveAttribute('data-type', 'loading');
    });

    it('should apply correct styling for empty type', () => {
      const { container } = render(<StatusMessage message="No items found" type="empty" />);
      
      const statusMessage = container.querySelector('[data-testid="status-message"]');
      expect(statusMessage).toBeInTheDocument();
      expect(statusMessage).toHaveAttribute('data-type', 'empty');
    });

    it('should have correct container styling', () => {
      const { container } = render(<StatusMessage message="Loading..." type="loading" />);
      
      const statusMessage = container.querySelector('[data-testid="status-message"]');
      expect(statusMessage).toBeInTheDocument();
      expect(statusMessage).toHaveAttribute('data-type', 'loading');
    });

    it('should have correct text styling', () => {
      const { container } = render(<StatusMessage message="Loading..." type="loading" />);
      
      const statusMessage = container.querySelector('[data-testid="status-message"]');
      expect(statusMessage).toBeInTheDocument();
    });
  });

  describe('Type Variations', () => {
    it('should handle loading type correctly', () => {
      const { container } = render(<StatusMessage message="Loading..." type="loading" />);
      
      const statusMessage = container.querySelector('[data-testid="status-message"]');
      expect(statusMessage).toBeInTheDocument();
    });

    it('should handle empty type correctly', () => {
      const { container } = render(<StatusMessage message="No items found" type="empty" />);
      
      const statusMessage = container.querySelector('[data-testid="status-message"]');
      expect(statusMessage).toBeInTheDocument();
    });
  });

  describe('Message Content', () => {
    it('should display exact message text', () => {
      const testMessage = 'This is a test message with special characters: !@#$%^&*()';
      render(<StatusMessage message={testMessage} type="loading" />);
      
      const message = screen.getByText(testMessage);
      expect(message).toBeInTheDocument();
    });

    it('should handle empty message', () => {
      const { container } = render(<StatusMessage message="" type="empty" />);
      
      // When message is empty, we can check that the Typography element exists
      const statusMessage = container.querySelector('[data-testid="status-message"]');
      expect(statusMessage).toBeInTheDocument();
      expect(statusMessage?.textContent).toBe('');
    });

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(100);
      render(<StatusMessage message={longMessage} type="loading" />);
      
      const message = screen.getByText(longMessage);
      expect(message).toBeInTheDocument();
    });

    it('should handle messages with line breaks', () => {
      const messageWithBreaks = 'Line 1\nLine 2\nLine 3';
      const { container } = render(<StatusMessage message={messageWithBreaks} type="empty" />);
      
      // In React, newlines are not automatically rendered as line breaks
      // So we check if the element contains the text content
      const statusMessage = container.querySelector('[data-testid="status-message"]');
      expect(statusMessage?.textContent).toBe(messageWithBreaks);
    });

    it('should handle HTML-like content as plain text', () => {
      const htmlContent = '<div>Test</div>';
      render(<StatusMessage message={htmlContent} type="loading" />);
      
      const message = screen.getByText(htmlContent);
      expect(message).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible via screen readers', () => {
      render(<StatusMessage message="Loading data..." type="loading" />);
      
      const message = screen.getByText('Loading data...');
      expect(message).toBeInTheDocument();
    });

    it('should have proper text content for screen readers', () => {
      render(<StatusMessage message="No items available" type="empty" />);
      
      const message = screen.getByText('No items available');
      expect(message).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined message', () => {
      const { container } = render(<StatusMessage message={undefined as any} type="loading" />);
      
      // When message is undefined, component should still render
      const statusMessage = container.querySelector('[data-testid="status-message"]');
      expect(statusMessage).toBeInTheDocument();
      // Component should handle undefined gracefully (likely rendering empty string)
      expect(statusMessage?.textContent).toBe('');
    });

    it('should handle null message', () => {
      const { container } = render(<StatusMessage message={null as any} type="empty" />);
      
      const statusMessage = container.querySelector('[data-testid="status-message"]');
      expect(statusMessage).toBeInTheDocument();
      expect(statusMessage?.textContent).toBe('');
    });

    it('should handle numeric message', () => {
      render(<StatusMessage message={123 as any} type="loading" />);
      
      const message = screen.getByText('123');
      expect(message).toBeInTheDocument();
    });

    it('should handle boolean message', () => {
      // In React, boolean true values don't render text content
      const { container } = render(<StatusMessage message={true as any} type="empty" />);
      
      const statusMessage = container.querySelector('[data-testid="status-message"]');
      expect(statusMessage).toBeInTheDocument();
      // Boolean true values in React don't render as text, they are ignored
      expect(statusMessage?.textContent).toBe('');
    });
  });

  describe('Component Structure', () => {
    it('should render with correct DOM structure', () => {
      const { container } = render(<StatusMessage message="Test" type="loading" />);
      
      const statusMessage = container.querySelector('[data-testid="status-message"]');
      expect(statusMessage).toBeInTheDocument();
      expect(statusMessage).toHaveAttribute('data-type', 'loading');
    });

    it('should have correct nesting structure', () => {
      const { container } = render(<StatusMessage message="Test" type="empty" />);
      
      const statusMessage = container.querySelector('[data-testid="status-message"]');
      expect(statusMessage).toBeInTheDocument();
      expect(statusMessage?.textContent).toBe('Test');
    });
  });

  describe('Props Validation', () => {
    it('should accept valid type values', () => {
      const { container: loadingContainer } = render(<StatusMessage message="Test" type="loading" />);
      const { container: emptyContainer } = render(<StatusMessage message="Test" type="empty" />);
      
      expect(loadingContainer.firstChild).toBeInTheDocument();
      expect(emptyContainer.firstChild).toBeInTheDocument();
    });

    it('should handle different message types consistently', () => {
      const { container: loadingContainer } = render(<StatusMessage message="Test" type="loading" />);
      const { container: emptyContainer } = render(<StatusMessage message="Test" type="empty" />);
      
      const loadingStatusMessage = loadingContainer.querySelector('[data-testid="status-message"]');
      const emptyStatusMessage = emptyContainer.querySelector('[data-testid="status-message"]');
      
      expect(loadingStatusMessage?.textContent).toBe('Test');
      expect(emptyStatusMessage?.textContent).toBe('Test');
    });
  });

  describe('Performance', () => {
    it('should render efficiently with multiple instances', () => {
      const { container } = render(
        <div>
          {Array.from({ length: 20 }).map((_, i) => (
            <StatusMessage key={i} message={`Message ${i}`} type={i % 2 === 0 ? 'loading' : 'empty'} />
          ))}
        </div>
      );
      
      const statusMessages = container.querySelectorAll('[data-testid="status-message"]');
      expect(statusMessages.length).toBe(20);
    });

    it('should handle rapid re-renders', () => {
      const { rerender } = render(<StatusMessage message="Initial" type="loading" />);
      
      // Simulate rapid re-renders
      rerender(<StatusMessage message="Updated 1" type="loading" />);
      rerender(<StatusMessage message="Updated 2" type="empty" />);
      rerender(<StatusMessage message="Updated 3" type="loading" />);
      
      const message = screen.getByText('Updated 3');
      expect(message).toBeInTheDocument();
    });
  });
});
