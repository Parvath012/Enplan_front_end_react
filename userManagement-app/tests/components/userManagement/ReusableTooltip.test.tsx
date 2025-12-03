import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReusableTooltip from '../../../src/components/userManagement/ReusableTooltip';

// Mock MUI Tooltip to avoid complex DOM interactions
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Tooltip: ({ children, title, placement, arrow, followCursor, enterDelay, leaveDelay, slotProps, ...props }: any) => (
    <div 
      data-testid="mui-tooltip"
      data-title={title}
      data-placement={placement}
      data-arrow={arrow}
      data-follow-cursor={followCursor}
      data-enter-delay={enterDelay}
      data-leave-delay={leaveDelay}
      data-slot-props={JSON.stringify(slotProps)}
      {...props}
    >
      {children}
    </div>
  ),
  styled: (Component: any) => (styles: any) => {
    const StyledComponent = (props: any) => <Component {...props} data-styled="true" data-styles={JSON.stringify(styles)} />;
    StyledComponent.displayName = `Styled(${Component.displayName || Component.name})`;
    return StyledComponent;
  }
}));

describe('ReusableTooltip Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders tooltip with default props', () => {
      render(
        <ReusableTooltip title="Test tooltip">
          <button>Hover me</button>
        </ReusableTooltip>
      );
      
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
      expect(screen.getByTestId('mui-tooltip')).toHaveAttribute('data-title', 'Test tooltip');
      expect(screen.getByTestId('mui-tooltip')).toHaveAttribute('data-placement', 'top');
      expect(screen.getByTestId('mui-tooltip')).toHaveAttribute('data-arrow', 'false');
      expect(screen.getByTestId('mui-tooltip')).toHaveAttribute('data-follow-cursor', 'false');
      expect(screen.getByTestId('mui-tooltip')).toHaveAttribute('data-enter-delay', '500');
      expect(screen.getByTestId('mui-tooltip')).toHaveAttribute('data-leave-delay', '0');
      expect(screen.getByText('Hover me')).toBeInTheDocument();
    });

    it('renders tooltip with custom props', () => {
      render(
        <ReusableTooltip 
          title="Custom tooltip" 
          placement="bottom" 
          arrow={true} 
          followCursor={true} 
          enterDelay={1000} 
          leaveDelay={200}
        >
          <button>Hover me</button>
        </ReusableTooltip>
      );
      
      const tooltip = screen.getByTestId('mui-tooltip');
      expect(tooltip).toHaveAttribute('data-title', 'Custom tooltip');
      expect(tooltip).toHaveAttribute('data-placement', 'bottom');
      expect(tooltip).toHaveAttribute('data-arrow', 'true');
      expect(tooltip).toHaveAttribute('data-follow-cursor', 'true');
      expect(tooltip).toHaveAttribute('data-enter-delay', '1000');
      expect(tooltip).toHaveAttribute('data-leave-delay', '200');
    });

    it('renders children when disabled', () => {
      const { container } = render(
        <ReusableTooltip title="Disabled tooltip" disabled={true}>
          <button>Click me</button>
        </ReusableTooltip>
      );
      
      expect(screen.getByText('Click me')).toBeInTheDocument();
      expect(screen.queryByTestId('mui-tooltip')).not.toBeInTheDocument();
      expect(container.firstChild).toBe(screen.getByText('Click me'));
    });

    it('renders children without tooltip wrapper when disabled', () => {
      const { container } = render(
        <ReusableTooltip title="Disabled tooltip" disabled={true}>
          <span>Simple text</span>
        </ReusableTooltip>
      );
      
      expect(screen.getByText('Simple text')).toBeInTheDocument();
      expect(container.firstChild).toBe(screen.getByText('Simple text'));
      expect(screen.queryByTestId('mui-tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('handles all placement options', () => {
      const placements = ['top', 'bottom', 'left', 'right', 'top-start', 'top-end', 'bottom-start', 'bottom-end', 'left-start', 'left-end', 'right-start', 'right-end'];
      
      placements.forEach(placement => {
        const { unmount } = render(
          <ReusableTooltip title="Test" placement={placement as any}>
            <button>Test</button>
          </ReusableTooltip>
        );
        
        expect(screen.getByTestId('mui-tooltip')).toHaveAttribute('data-placement', placement);
        unmount();
      });
    });

    it('handles boolean props correctly', () => {
      render(
        <ReusableTooltip 
          title="Test" 
          arrow={true} 
          followCursor={true}
        >
          <button>Test</button>
        </ReusableTooltip>
      );
      
      const tooltip = screen.getByTestId('mui-tooltip');
      expect(tooltip).toHaveAttribute('data-arrow', 'true');
      expect(tooltip).toHaveAttribute('data-follow-cursor', 'true');
    });

    it('handles numeric props correctly', () => {
      render(
        <ReusableTooltip 
          title="Test" 
          enterDelay={300} 
          leaveDelay={150}
        >
          <button>Test</button>
        </ReusableTooltip>
      );
      
      const tooltip = screen.getByTestId('mui-tooltip');
      expect(tooltip).toHaveAttribute('data-enter-delay', '300');
      expect(tooltip).toHaveAttribute('data-leave-delay', '150');
    });

    it('handles empty title', () => {
      render(
        <ReusableTooltip title="">
          <button>Button</button>
        </ReusableTooltip>
      );
      
      expect(screen.getByTestId('mui-tooltip')).toHaveAttribute('data-title', '');
    });

    it('handles undefined title', () => {
      render(
        <ReusableTooltip title={undefined as any}>
          <button>Button</button>
        </ReusableTooltip>
      );
      
      // MUI Tooltip doesn't set data-title for undefined, just verify the tooltip renders
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
    });

    it('handles null title', () => {
      render(
        <ReusableTooltip title={null as any}>
          <button>Button</button>
        </ReusableTooltip>
      );
      
      // MUI Tooltip doesn't set data-title for null, just verify the tooltip renders
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
    });
  });

  describe('Children Handling', () => {
    it('handles React element as children', () => {
      const TestComponent = () => <div data-testid="test-component">Test Component</div>;
      
      render(
        <ReusableTooltip title="Component tooltip">
          <TestComponent />
        </ReusableTooltip>
      );
      
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
    });

    it('handles multiple children', () => {
      render(
        <ReusableTooltip title="Multiple children">
          <div>Child 1</div>
          <div>Child 2</div>
        </ReusableTooltip>
      );
      
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
    });

    it('handles string children', () => {
      render(
        <ReusableTooltip title="String children">
          Simple text
        </ReusableTooltip>
      );
      
      expect(screen.getByText('Simple text')).toBeInTheDocument();
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
    });

    it('handles number children', () => {
      render(
        <ReusableTooltip title="Number children">
          {123}
        </ReusableTooltip>
      );
      
      expect(screen.getByText('123')).toBeInTheDocument();
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
    });

    it('handles boolean children', () => {
      render(
        <ReusableTooltip title="Boolean children">
          {true as any}
        </ReusableTooltip>
      );
      
      // React doesn't render boolean values, so just verify the tooltip structure exists
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
    });
  });

  describe('Styled Component', () => {
    it('applies styled component correctly', () => {
      render(
        <ReusableTooltip title="Styled tooltip">
          <button>Test</button>
        </ReusableTooltip>
      );
      
      const tooltip = screen.getByTestId('mui-tooltip');
      expect(tooltip).toHaveAttribute('data-styled', 'true');
    });

    it('passes slotProps to MUI Tooltip', () => {
      render(
        <ReusableTooltip title="Test">
          <button>Test</button>
        </ReusableTooltip>
      );
      
      const tooltip = screen.getByTestId('mui-tooltip');
      const slotProps = JSON.parse(tooltip.getAttribute('data-slot-props') || '{}');
      expect(slotProps).toHaveProperty('popper');
      expect(slotProps.popper).toHaveProperty('modifiers');
      expect(slotProps.popper.modifiers).toHaveLength(1);
      expect(slotProps.popper.modifiers[0]).toHaveProperty('name', 'offset');
      expect(slotProps.popper.modifiers[0].options).toEqual({ offset: [0, 8] });
    });
  });

  describe('Edge Cases', () => {
    it('handles disabled prop with all other props', () => {
      render(
        <ReusableTooltip 
          title="Disabled tooltip" 
          placement="bottom" 
          arrow={true} 
          followCursor={true} 
          enterDelay={1000} 
          leaveDelay={200}
          disabled={true}
        >
          <button>Disabled</button>
        </ReusableTooltip>
      );
      
      expect(screen.getByText('Disabled')).toBeInTheDocument();
      expect(screen.queryByTestId('mui-tooltip')).not.toBeInTheDocument();
    });

    it('handles disabled prop with false value', () => {
      render(
        <ReusableTooltip 
          title="Enabled tooltip" 
          disabled={false}
        >
          <button>Enabled</button>
        </ReusableTooltip>
      );
      
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
      expect(screen.getByText('Enabled')).toBeInTheDocument();
    });

    it('handles disabled prop with undefined value', () => {
      render(
        <ReusableTooltip 
          title="Undefined disabled" 
          disabled={undefined as any}
        >
          <button>Test</button>
        </ReusableTooltip>
      );
      
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
    });

    it('handles disabled prop with null value', () => {
      render(
        <ReusableTooltip 
          title="Null disabled" 
          disabled={null as any}
        >
          <button>Test</button>
        </ReusableTooltip>
      );
      
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
    });

    it('handles disabled prop with string value', () => {
      render(
        <ReusableTooltip 
          title="String disabled" 
          disabled={'true' as any}
        >
          <button>Test</button>
        </ReusableTooltip>
      );
      
      // String 'true' is truthy, so tooltip should be disabled and only button renders
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.queryByTestId('mui-tooltip')).not.toBeInTheDocument();
    });

    it('handles disabled prop with number value', () => {
      render(
        <ReusableTooltip 
          title="Number disabled" 
          disabled={1 as any}
        >
          <button>Test</button>
        </ReusableTooltip>
      );
      
      // Number 1 is truthy, so tooltip should be disabled and only button renders
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.queryByTestId('mui-tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('handles component unmounting', () => {
      const { unmount } = render(
        <ReusableTooltip title="Test">
          <button>Test</button>
        </ReusableTooltip>
      );
      
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
      
      unmount();
      
      expect(screen.queryByTestId('mui-tooltip')).not.toBeInTheDocument();
    });

    it('handles prop changes', () => {
      const { rerender } = render(
        <ReusableTooltip title="Original" placement="top">
          <button>Test</button>
        </ReusableTooltip>
      );
      
      expect(screen.getByTestId('mui-tooltip')).toHaveAttribute('data-title', 'Original');
      expect(screen.getByTestId('mui-tooltip')).toHaveAttribute('data-placement', 'top');
      
      rerender(
        <ReusableTooltip title="Updated" placement="bottom">
          <button>Test</button>
        </ReusableTooltip>
      );
      
      expect(screen.getByTestId('mui-tooltip')).toHaveAttribute('data-title', 'Updated');
      expect(screen.getByTestId('mui-tooltip')).toHaveAttribute('data-placement', 'bottom');
    });
  });

  describe('Accessibility', () => {
    it('maintains accessibility with proper structure', () => {
      render(
        <ReusableTooltip title="Accessible tooltip">
          <button aria-label="Test button">Test</button>
        </ReusableTooltip>
      );
      
      expect(screen.getByLabelText('Test button')).toBeInTheDocument();
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
    });

    it('preserves children accessibility attributes', () => {
      render(
        <ReusableTooltip title="Accessible tooltip">
          <button 
            aria-label="Accessible button" 
            role="button" 
            tabIndex={0}
          >
            Accessible
          </button>
        </ReusableTooltip>
      );
      
      const button = screen.getByLabelText('Accessible button');
      expect(button).toHaveAttribute('role', 'button');
      expect(button).toHaveAttribute('tabIndex', '0');
    });
  });
});
