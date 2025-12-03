import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import TruncatedTextWithTooltip from '../../../src/components/common/TruncatedTextWithTooltip';

// Mock CustomTooltip
jest.mock('commonApp/CustomTooltip', () => ({
  __esModule: true,
  default: ({ children, title }: any) => (
    <div data-testid="custom-tooltip" title={title}>
      {children}
    </div>
  )
}));

describe('TruncatedTextWithTooltip', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render text without tooltip when not truncated', async () => {
      const { container } = render(
        <TruncatedTextWithTooltip text="Short text">
          <div>Short text</div>
        </TruncatedTextWithTooltip>
      );

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('custom-tooltip')).not.toBeInTheDocument();
      });
    });

    it('should render with custom className', () => {
      const { container } = render(
        <TruncatedTextWithTooltip text="Test" className="custom-class">
          <div>Test</div>
        </TruncatedTextWithTooltip>
      );

      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('custom-class');
    });

    it('should render with custom style', () => {
      const customStyle = { color: 'red', fontSize: '14px' };
      const { container } = render(
        <TruncatedTextWithTooltip text="Test" style={customStyle}>
          <div>Test</div>
        </TruncatedTextWithTooltip>
      );

      const element = container.firstChild as HTMLElement;
      expect(element).toHaveStyle(customStyle);
    });

    it('should render children correctly', () => {
      render(
        <TruncatedTextWithTooltip text="Test">
          <div data-testid="child">Child content</div>
        </TruncatedTextWithTooltip>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });

  describe('Truncation Detection', () => {
    it('should show tooltip when text is truncated', async () => {
      // Mock scrollWidth > clientWidth
      const mockElement = {
        scrollWidth: 200,
        clientWidth: 100
      };

      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        configurable: true,
        get: function() {
          return mockElement.scrollWidth;
        }
      });

      Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        configurable: true,
        get: function() {
          return mockElement.clientWidth;
        }
      });

      render(
        <TruncatedTextWithTooltip text="Very long text that should be truncated">
          <div>Very long text that should be truncated</div>
        </TruncatedTextWithTooltip>
      );

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByTestId('custom-tooltip')).toBeInTheDocument();
      });
    });

    it('should check truncation multiple times with delays', async () => {
      const { container } = render(
        <TruncatedTextWithTooltip text="Test">
          <div>Test</div>
        </TruncatedTextWithTooltip>
      );

      act(() => {
        jest.advanceTimersByTime(50);
      });

      act(() => {
        jest.advanceTimersByTime(50);
      });

      act(() => {
        jest.advanceTimersByTime(50);
      });

      act(() => {
        jest.advanceTimersByTime(50);
      });

      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should set tabIndex to 0 when truncated', async () => {
      const mockElement = {
        scrollWidth: 200,
        clientWidth: 100
      };

      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        configurable: true,
        get: function() {
          return mockElement.scrollWidth;
        }
      });

      Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        configurable: true,
        get: function() {
          return mockElement.clientWidth;
        }
      });

      const { container } = render(
        <TruncatedTextWithTooltip text="Long text">
          <div>Long text</div>
        </TruncatedTextWithTooltip>
      );

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        const element = container.querySelector('div[tabindex="0"]');
        expect(element).toBeInTheDocument();
      });
    });

    it('should set tabIndex to -1 when not truncated', async () => {
      const { container } = render(
        <TruncatedTextWithTooltip text="Short">
          <div>Short</div>
        </TruncatedTextWithTooltip>
      );

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        const element = container.querySelector('div[tabindex="-1"]');
        expect(element).toBeInTheDocument();
      });
    });

    it('should set role to button when truncated', async () => {
      const mockElement = {
        scrollWidth: 200,
        clientWidth: 100
      };

      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        configurable: true,
        get: function() {
          return mockElement.scrollWidth;
        }
      });

      Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        configurable: true,
        get: function() {
          return mockElement.clientWidth;
        }
      });

      const { container } = render(
        <TruncatedTextWithTooltip text="Long text">
          <div>Long text</div>
        </TruncatedTextWithTooltip>
      );

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        const element = container.querySelector('div[role="button"]');
        expect(element).toBeInTheDocument();
      });
    });

    it('should set aria-label when truncated', async () => {
      const mockElement = {
        scrollWidth: 200,
        clientWidth: 100
      };

      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        configurable: true,
        get: function() {
          return mockElement.scrollWidth;
        }
      });

      Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        configurable: true,
        get: function() {
          return mockElement.clientWidth;
        }
      });

      const text = 'Long text that should be truncated';
      const { container } = render(
        <TruncatedTextWithTooltip text={text}>
          <div>{text}</div>
        </TruncatedTextWithTooltip>
      );

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        const element = container.querySelector(`div[aria-label="${text}"]`);
        expect(element).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty text', () => {
      const { container } = render(
        <TruncatedTextWithTooltip text="">
          <div></div>
        </TruncatedTextWithTooltip>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle very long text', () => {
      const longText = 'A'.repeat(10000);
      const { container } = render(
        <TruncatedTextWithTooltip text={longText}>
          <div>{longText}</div>
        </TruncatedTextWithTooltip>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle special characters in text', () => {
      const specialText = 'Test & <>"\'';
      const { container } = render(
        <TruncatedTextWithTooltip text={specialText}>
          <div>{specialText}</div>
        </TruncatedTextWithTooltip>
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });
});

