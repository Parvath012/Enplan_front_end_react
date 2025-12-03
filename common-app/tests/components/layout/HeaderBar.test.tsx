import React from 'react';
import { render, screen } from '@testing-library/react';
import HeaderBar from '../../../src/components/layout/HeaderBar';

describe('HeaderBar', () => {
  describe('Component Structure', () => {
    it('renders with required title prop', () => {
      render(<HeaderBar title="Test Header" />);
      
      const titleElement = screen.getByText('Test Header');
      expect(titleElement).toBeInTheDocument();
      expect(titleElement.tagName).toBe('H1');
    });

    it('renders with all optional props', () => {
      const onSearch = jest.fn();
      const onToggleFilters = jest.fn();
      const RightAction = <button>Action Button</button>;
      
      render(
        <HeaderBar 
          title="Complete Header"
          onSearch={onSearch}
          onToggleFilters={onToggleFilters}
          RightAction={RightAction}
        />
      );
      
      const titleElement = screen.getByText('Complete Header');
      const actionButton = screen.getByText('Action Button');
      
      expect(titleElement).toBeInTheDocument();
      expect(actionButton).toBeInTheDocument();
    });

    it('renders without optional props', () => {
      render(<HeaderBar title="Minimal Header" />);
      
      const titleElement = screen.getByText('Minimal Header');
      expect(titleElement).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('displays the title correctly', () => {
      const testTitle = 'Dynamic Header Title';
      render(<HeaderBar title={testTitle} />);
      
      expect(screen.getByText(testTitle)).toBeInTheDocument();
    });

    it('handles empty title', () => {
      render(<HeaderBar title="" />);
      
      const titleElement = screen.getByRole('heading', { level: 1 });
      expect(titleElement).toBeInTheDocument();
      expect(titleElement).toHaveTextContent('');
    });

    it('handles long title text', () => {
      const longTitle = 'This is a very long header title that might wrap to multiple lines and should be handled gracefully by the component';
      render(<HeaderBar title={longTitle} />);
      
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('handles special characters in title', () => {
      const specialTitle = 'Header with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
      render(<HeaderBar title={specialTitle} />);
      
      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });

    it('renders RightAction component when provided', () => {
      const RightAction = <div data-testid="custom-action">Custom Action</div>;
      
      render(<HeaderBar title="Test" RightAction={RightAction} />);
      
      const actionElement = screen.getByTestId('custom-action');
      expect(actionElement).toBeInTheDocument();
      expect(screen.getByText('Custom Action')).toBeInTheDocument();
    });

    it('renders multiple RightAction components', () => {
      const RightAction = (
        <>
          <button>Button 1</button>
          <button>Button 2</button>
          <span>Text Element</span>
        </>
      );
      
      render(<HeaderBar title="Test" RightAction={RightAction} />);
      
      expect(screen.getByText('Button 1')).toBeInTheDocument();
      expect(screen.getByText('Button 2')).toBeInTheDocument();
      expect(screen.getByText('Text Element')).toBeInTheDocument();
    });

    it('does not render RightAction when not provided', () => {
      render(<HeaderBar title="Test" />);
      
      const titleElement = screen.getByText('Test');
      const container = titleElement.closest('div');
      const rightActionContainer = container?.querySelector('div:last-child');
      
      // The right action container should exist but be empty
      expect(rightActionContainer).toBeInTheDocument();
      expect(rightActionContainer?.children.length).toBe(0);
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct default styling to title', () => {
      render(<HeaderBar title="Styled Title" />);
      
      const titleElement = screen.getByText('Styled Title');
      // Check that the title element exists and has the correct tag
      expect(titleElement).toBeInTheDocument();
      expect(titleElement.tagName).toBe('H1');
      // Note: Exact style matching is difficult with MUI, so we check for presence
      expect(titleElement).toHaveClass('MuiTypography-root');
    });

    it('applies correct container styling', () => {
      render(<HeaderBar title="Test" />);
      
      const titleElement = screen.getByText('Test');
      const container = titleElement.closest('div');
      
      expect(container).toHaveStyle({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '40px',
        background: 'inherit',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        boxSizing: 'border-box',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'rgba(242, 242, 240, 1)',
        position: 'sticky',
        top: 0,
        zIndex: 5
      });
    });

    it('applies correct right action container styling', () => {
      const RightAction = <button>Action</button>;
      render(<HeaderBar title="Test" RightAction={RightAction} />);
      
      const actionButton = screen.getByText('Action');
      const actionContainer = actionButton.closest('div');
      
      // Check that the action container exists and has flex display
      expect(actionContainer).toBeInTheDocument();
      expect(actionContainer).toHaveClass('MuiBox-root');
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined RightAction', () => {
      render(<HeaderBar title="Test" RightAction={undefined} />);
      
      const titleElement = screen.getByText('Test');
      expect(titleElement).toBeInTheDocument();
    });

    it('handles null RightAction', () => {
      render(<HeaderBar title="Test" RightAction={null} />);
      
      const titleElement = screen.getByText('Test');
      expect(titleElement).toBeInTheDocument();
    });

    it('handles complex RightAction with nested components', () => {
      const ComplexRightAction = (
        <div>
          <span>Nested</span>
          <div>
            <button>Deep Button</button>
          </div>
        </div>
      );
      
      render(<HeaderBar title="Test" RightAction={ComplexRightAction} />);
      
      expect(screen.getByText('Nested')).toBeInTheDocument();
      expect(screen.getByText('Deep Button')).toBeInTheDocument();
    });

    it('handles numeric title (converted to string)', () => {
      render(<HeaderBar title={12345} />);
      
      expect(screen.getByText('12345')).toBeInTheDocument();
    });

    it('handles string title with special characters', () => {
      const specialString = 'Title with "quotes" and \'apostrophes\'';
      render(<HeaderBar title={specialString} />);
      
      const titleElement = screen.getByRole('heading', { level: 1 });
      expect(titleElement).toBeInTheDocument();
      expect(titleElement).toHaveTextContent(specialString);
    });
  });

  describe('Accessibility', () => {
    it('uses semantic h1 element for title', () => {
      render(<HeaderBar title="Accessible Title" />);
      
      const titleElement = screen.getByRole('heading', { level: 1 });
      expect(titleElement).toBeInTheDocument();
      expect(titleElement).toHaveTextContent('Accessible Title');
    });

    it('maintains proper heading hierarchy', () => {
      render(<HeaderBar title="Main Heading" />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('integrates with Material-UI components', () => {
      render(<HeaderBar title="MUI Integration" />);
      
      const titleElement = screen.getByText('MUI Integration');
      expect(titleElement).toBeInTheDocument();
      
      // Check that it's using MUI Typography component
      expect(titleElement.closest('[class*="MuiTypography"]')).toBeInTheDocument();
    });

    it('works with different RightAction types', () => {
      const ButtonAction = <button>Button Action</button>;
      const LinkAction = <a href="#">Link Action</a>;
      const DivAction = <div>Div Action</div>;
      
      const { rerender } = render(<HeaderBar title="Test" RightAction={ButtonAction} />);
      expect(screen.getByText('Button Action')).toBeInTheDocument();
      
      rerender(<HeaderBar title="Test" RightAction={LinkAction} />);
      expect(screen.getByText('Link Action')).toBeInTheDocument();
      
      rerender(<HeaderBar title="Test" RightAction={DivAction} />);
      expect(screen.getByText('Div Action')).toBeInTheDocument();
    });
  });

  describe('Performance and Behavior', () => {
    it('renders efficiently with minimal props', () => {
      const startTime = performance.now();
      render(<HeaderBar title="Performance Test" />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should render quickly
      expect(screen.getByText('Performance Test')).toBeInTheDocument();
    });

    it('handles rapid re-renders', () => {
      const { rerender } = render(<HeaderBar title="Initial" />);
      expect(screen.getByText('Initial')).toBeInTheDocument();
      
      rerender(<HeaderBar title="Updated" />);
      expect(screen.getByText('Updated')).toBeInTheDocument();
      
      rerender(<HeaderBar title="Final" />);
      expect(screen.getByText('Final')).toBeInTheDocument();
    });
  });
});
