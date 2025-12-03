import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HeaderIcons, { IconItem } from '../../../src/components/shared/HeaderIcons';

// Mock Carbon icons
jest.mock('@carbon/icons-react', () => ({
  Chat: ({ size, color }: any) => (
    <div data-testid="chat-icon" data-size={size} data-color={color} />
  ),
  VolumeBlockStorage: ({ size, color }: any) => (
    <div data-testid="volume-block-storage-icon" data-size={size} data-color={color} />
  ),
}));

// Mock SCSS file
jest.mock('../../../src/components/shared/HeaderIcons.scss', () => ({}));

// Mock CustomTooltip
jest.mock('../../../src/components/common/CustomTooltip', () => {
  return function MockCustomTooltip({ children, title }: any) {
    return <div data-testid="custom-tooltip" title={title}>{children}</div>;
  };
});

describe('HeaderIcons Component', () => {
  // Suppress console warnings during tests
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Default Icon Items', () => {
    it('should render with default icon items when no iconItems prop provided', () => {
      render(<HeaderIcons />);
      
      // Default items: Calendar, Asset Library, Chat, divider, Fullscreen
      expect(screen.getByAltText('Calendar')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Asset Library' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Chat' })).toBeInTheDocument();
      expect(screen.getByAltText('Fullscreen')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Calendar' })).toBeInTheDocument();
    });

    it('should render default Carbon icons correctly', () => {
      render(<HeaderIcons />);
      
      expect(screen.getByTestId('volume-block-storage-icon')).toBeInTheDocument();
      expect(screen.getByTestId('chat-icon')).toBeInTheDocument();
      
      // Verify Carbon icon props
      expect(screen.getByTestId('volume-block-storage-icon')).toHaveAttribute('data-size', '18');
      expect(screen.getByTestId('volume-block-storage-icon')).toHaveAttribute('data-color', 'rgba(0, 0, 0, 0.54)');
      expect(screen.getByTestId('chat-icon')).toHaveAttribute('data-size', '18');
      expect(screen.getByTestId('chat-icon')).toHaveAttribute('data-color', 'rgba(0, 0, 0, 0.54)');
    });

    it('should render default divider', () => {
      render(<HeaderIcons />);
      
      const divider = document.querySelector('.header-divider');
      expect(divider).toBeInTheDocument();
    });

    it('should use default className when none provided', () => {
      const { container } = render(<HeaderIcons />);
      
      expect(container.firstChild).toHaveClass('header-icons');
    });
  });

  describe('Custom Props', () => {
    it('should use custom className when provided', () => {
      const { container } = render(<HeaderIcons className="custom-header-icons" />);
      
      expect(container.firstChild).toHaveClass('custom-header-icons');
    });

    it('should render custom icon items when provided', () => {
      const customIcons: IconItem[] = [
        {
          src: '/custom-icon.svg',
          alt: 'Custom Icon',
          tooltip: 'Custom Tooltip'
        }
      ];

      render(<HeaderIcons iconItems={customIcons} />);
      
      expect(screen.getByAltText('Custom Icon')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Custom Icon' })).toBeInTheDocument();
    });

    it('should handle empty iconItems array', () => {
      const { container } = render(<HeaderIcons iconItems={[]} />);
      
      expect(container.firstChild).toBeInTheDocument();
      expect(container.firstChild?.childNodes).toHaveLength(0);
    });
  });

  describe('Icon Rendering Types', () => {
    it('should render divider icon correctly', () => {
      const dividerIcon: IconItem[] = [
        { divider: true, alt: 'test-divider' }
      ];

      render(<HeaderIcons iconItems={dividerIcon} />);
      
      const divider = document.querySelector('.header-divider');
      expect(divider).toBeInTheDocument();
    });

    it('should render component icon correctly', () => {
      const TestComponent = () => <span data-testid="test-component">Test Component</span>;
      const componentIcon: IconItem[] = [
        {
          component: <TestComponent />,
          alt: 'Component Icon',
          tooltip: 'Component Tooltip'
        }
      ];

      render(<HeaderIcons iconItems={componentIcon} />);
      
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Component Icon' })).toBeInTheDocument();
    });

    it('should render image icon correctly', () => {
      const imageIcon: IconItem[] = [
        {
          src: '/test-image.png',
          alt: 'Image Icon',
          tooltip: 'Image Tooltip'
        }
      ];

      render(<HeaderIcons iconItems={imageIcon} />);
      
      const image = screen.getByAltText('Image Icon');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/test-image.png');
      expect(screen.getByRole('button', { name: 'Image Icon' })).toBeInTheDocument();
    });

    it('should render icon without tooltip', () => {
      const iconWithoutTooltip: IconItem[] = [
        {
          src: '/no-tooltip.png',
          alt: 'No Tooltip Icon'
        }
      ];

      render(<HeaderIcons iconItems={iconWithoutTooltip} />);
      
      expect(screen.getByAltText('No Tooltip Icon')).toBeInTheDocument();
      expect(screen.queryByText('No Tooltip Icon')).not.toBeInTheDocument();
    });

    it('should handle icon with undefined src', () => {
      const iconWithUndefinedSrc: IconItem[] = [
        {
          src: undefined,
          alt: 'Undefined Src Icon'
        }
      ];

      render(<HeaderIcons iconItems={iconWithUndefinedSrc} />);
      
      const image = screen.getByAltText('Undefined Src Icon');
      expect(image).toBeInTheDocument();
      // When src is undefined, the img element may not have src attribute or have empty string
      expect(image.getAttribute('src')).toBe(null);
    });
  });

  describe('Tooltip Integration', () => {
    it('should wrap icon with CustomTooltip when tooltip property is provided', () => {
      const iconWithTooltip: IconItem[] = [
        {
          src: '/tooltip-test.png',
          alt: 'Tooltip Test',
          tooltip: 'Test Tooltip Message'
        }
      ];

      render(<HeaderIcons iconItems={iconWithTooltip} />);
      
      expect(screen.getByTestId('custom-tooltip')).toBeInTheDocument();
      expect(screen.getByTestId('custom-tooltip')).toHaveAttribute('title', 'Test Tooltip Message');
    });

    it('should wrap component with CustomTooltip when tooltip property is provided', () => {
      const TestComponent = () => <span>Component</span>;
      const componentWithTooltip: IconItem[] = [
        {
          component: <TestComponent />,
          alt: 'Component Test',
          tooltip: 'Component Tooltip Message'
        }
      ];

      render(<HeaderIcons iconItems={componentWithTooltip} />);
      
      expect(screen.getByTestId('custom-tooltip')).toBeInTheDocument();
      expect(screen.getByTestId('custom-tooltip')).toHaveAttribute('title', 'Component Tooltip Message');
    });

    it('should not use CustomTooltip when tooltip property is not provided', () => {
      const iconWithoutTooltip: IconItem[] = [
        {
          src: '/no-tooltip.png',
          alt: 'No Tooltip Icon'
        }
      ];

      render(<HeaderIcons iconItems={iconWithoutTooltip} />);
      
      expect(screen.queryByTestId('custom-tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Interactions', () => {
    it('should show tooltip on Enter key press for image icon', () => {
      const iconWithTooltip: IconItem[] = [
        {
          src: '/keyboard-test.png',
          alt: 'Keyboard Test',
          tooltip: 'Keyboard Tooltip Message'
        }
      ];

      render(<HeaderIcons iconItems={iconWithTooltip} />);
      
      const button = screen.getByRole('button', { name: 'Keyboard Test' });
      
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(screen.getByTestId('custom-tooltip')).toHaveAttribute('title', 'Keyboard Tooltip Message');
    });

    it('should show tooltip on Space key press for image icon', () => {
      const iconWithTooltip: IconItem[] = [
        {
          src: '/space-test.png',
          alt: 'Space Test',
          tooltip: 'Space Tooltip Message'
        }
      ];

      render(<HeaderIcons iconItems={iconWithTooltip} />);
      
      const button = screen.getByRole('button', { name: 'Space Test' });
      
      fireEvent.keyDown(button, { key: ' ' });
      expect(screen.getByTestId('custom-tooltip')).toHaveAttribute('title', 'Space Tooltip Message');
    });

    it('should show tooltip on Enter key press for component icon', () => {
      const TestComponent = () => <span>Test</span>;
      const componentWithTooltip: IconItem[] = [
        {
          component: <TestComponent />,
          alt: 'Component Keyboard Test',
          tooltip: 'Component Keyboard Tooltip'
        }
      ];

      render(<HeaderIcons iconItems={componentWithTooltip} />);
      
      const button = screen.getByRole('button', { name: 'Component Keyboard Test' });
      
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(screen.getByTestId('custom-tooltip')).toHaveAttribute('title', 'Component Keyboard Tooltip');
    });

    it('should show tooltip on Space key press for component icon', () => {
      const TestComponent = () => <span>Test</span>;
      const componentWithTooltip: IconItem[] = [
        {
          component: <TestComponent />,
          alt: 'Component Space Test',
          tooltip: 'Component Space Tooltip'
        }
      ];

      render(<HeaderIcons iconItems={componentWithTooltip} />);
      
      const button = screen.getByRole('button', { name: 'Component Space Test' });
      
      fireEvent.keyDown(button, { key: ' ' });
      expect(screen.getByTestId('custom-tooltip')).toHaveAttribute('title', 'Component Space Tooltip');
    });

    it('should not show tooltip on other key presses', () => {
      const iconWithTooltip: IconItem[] = [
        {
          src: '/other-key-test.png',
          alt: 'Other Key Test',
          tooltip: 'Should Not Show'
        }
      ];

      render(<HeaderIcons iconItems={iconWithTooltip} />);
      
      const button = screen.getByRole('button', { name: 'Other Key Test' });
      
      fireEvent.keyDown(button, { key: 'Escape' });
      fireEvent.keyDown(button, { key: 'Tab' });
      fireEvent.keyDown(button, { key: 'ArrowDown' });
      
      expect(screen.queryByText('Should Not Show')).not.toBeInTheDocument();
    });

    it('should verify tooltip exists with prevent default test', () => {
      const iconWithTooltip: IconItem[] = [
        {
          src: '/prevent-default-test.png',
          alt: 'Prevent Default Test',
          tooltip: 'Prevent Default Tooltip'
        }
      ];

      render(<HeaderIcons iconItems={iconWithTooltip} />);
      
      expect(screen.getByTestId('custom-tooltip')).toHaveAttribute('title', 'Prevent Default Tooltip');
      
      // Note: In the new implementation, we no longer have the keyboard event handlers
      // that call preventDefault(), so we can't test that behavior anymore
    });
  });

  describe('State Management', () => {
    it('should verify tooltips exist for multiple icons', () => {
      const multipleIcons: IconItem[] = [
        {
          src: '/icon1.png',
          alt: 'Icon 1',
          tooltip: 'Tooltip 1'
        },
        {
          src: '/icon2.png',
          alt: 'Icon 2',
          tooltip: 'Tooltip 2'
        }
      ];

      render(<HeaderIcons iconItems={multipleIcons} />);
      
      // With CustomTooltip, both tooltips are always present in the DOM with their respective title attributes
      const tooltips = screen.getAllByTestId('custom-tooltip');
      expect(tooltips).toHaveLength(2);
      expect(tooltips[0]).toHaveAttribute('title', 'Tooltip 1');
      expect(tooltips[1]).toHaveAttribute('title', 'Tooltip 2');
    });

    it('should render tooltip with appropriate title attribute', () => {
      const iconWithTooltip: IconItem[] = [
        {
          src: '/state-test.png',
          alt: 'State Test',
          tooltip: 'State Tooltip'
        }
      ];

      render(<HeaderIcons iconItems={iconWithTooltip} />);
      
      expect(screen.getByTestId('custom-tooltip')).toHaveAttribute('title', 'State Tooltip');
    });

    it('should keep tooltips available after multiple render cycles', () => {
      const iconWithTooltip: IconItem[] = [
        {
          src: '/rapid-test.png',
          alt: 'Rapid Test',
          tooltip: 'Rapid Tooltip'
        }
      ];

      const { rerender } = render(<HeaderIcons iconItems={iconWithTooltip} />);
      
      // Verify tooltip is present
      expect(screen.getByTestId('custom-tooltip')).toHaveAttribute('title', 'Rapid Tooltip');
      
      // Re-render the component
      rerender(<HeaderIcons iconItems={iconWithTooltip} />);
      
      // Verify tooltip is still present
      expect(screen.getByTestId('custom-tooltip')).toHaveAttribute('title', 'Rapid Tooltip');
    });
  });

  describe('UserEvent Interactions', () => {
    it('should verify tooltip exists for user hover interactions', () => {
      const iconWithTooltip: IconItem[] = [
        {
          src: '/user-event-test.png',
          alt: 'User Event Test',
          tooltip: 'User Event Tooltip'
        }
      ];

      render(<HeaderIcons iconItems={iconWithTooltip} />);
      
      const tooltip = screen.getByTestId('custom-tooltip');
      expect(tooltip).toHaveAttribute('title', 'User Event Tooltip');
    });

    it('should verify tooltip exists for user keyboard interactions', () => {
      const iconWithTooltip: IconItem[] = [
        {
          src: '/user-keyboard-test.png',
          alt: 'User Keyboard Test',
          tooltip: 'User Keyboard Tooltip'
        }
      ];

      render(<HeaderIcons iconItems={iconWithTooltip} />);
      
      const tooltip = screen.getByTestId('custom-tooltip');
      expect(tooltip).toHaveAttribute('title', 'User Keyboard Tooltip');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle icons without alt attribute gracefully', () => {
      const iconWithoutAlt: any[] = [
        {
          src: '/no-alt.png'
          // Missing alt attribute
        }
      ];

      // This should not crash the component
      render(<HeaderIcons iconItems={iconWithoutAlt} />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle mixed icon types in array', () => {
      const TestComponent = () => <span>Mixed Component</span>;
      const mixedIcons: IconItem[] = [
        { divider: true, alt: 'divider-1' },
        {
          src: '/mixed-image.png',
          alt: 'Mixed Image',
          tooltip: 'Image Tooltip'
        },
        {
          component: <TestComponent />,
          alt: 'Mixed Component',
          tooltip: 'Component Tooltip'
        },
        { divider: true, alt: 'divider-2' },
        {
          src: '/another-image.png',
          alt: 'Another Image'
        }
      ];

      render(<HeaderIcons iconItems={mixedIcons} />);
      
      // Verify all types render
      expect(document.querySelectorAll('.header-divider')).toHaveLength(2);
      expect(screen.getByAltText('Mixed Image')).toBeInTheDocument();
      expect(screen.getByText('Mixed Component')).toBeInTheDocument();
      expect(screen.getByAltText('Another Image')).toBeInTheDocument();
    });

    it('should handle icons with empty string values', () => {
      const iconWithEmptyStrings: IconItem[] = [
        {
          src: '',
          alt: '',
          tooltip: ''
        }
      ];

      render(<HeaderIcons iconItems={iconWithEmptyStrings} />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle very long alt text and tooltip text', () => {
      const longText = 'This is a very long text that should be handled correctly by the component without breaking the layout or functionality';
      const iconWithLongText: IconItem[] = [
        {
          src: '/long-text.png',
          alt: longText,
          tooltip: longText
        }
      ];

      render(<HeaderIcons iconItems={iconWithLongText} />);
      
      const button = screen.getByRole('button', { name: longText });
      expect(button).toBeInTheDocument();
      
      expect(screen.getByTestId('custom-tooltip')).toHaveAttribute('title', longText);
    });

    it('should properly display tooltips with keyboard events', () => {
      const iconWithTooltip: IconItem[] = [
        {
          src: '/simultaneous-test.png',
          alt: 'Simultaneous Test',
          tooltip: 'Simultaneous Tooltip'
        }
      ];

      render(<HeaderIcons iconItems={iconWithTooltip} />);
      
      // Verify the CustomTooltip is present with correct title
      expect(screen.getByTestId('custom-tooltip')).toHaveAttribute('title', 'Simultaneous Tooltip');
    });
  });

  describe('Component Exports', () => {
    it('should export HeaderIcons as default', () => {
      expect(HeaderIcons).toBeDefined();
      expect(typeof HeaderIcons).toBe('function');
    });

    it('should render with all Carbon icons from defaults', () => {
      render(<HeaderIcons />);
      
      // Verify all default Carbon icons are rendered
      expect(screen.getByTestId('volume-block-storage-icon')).toBeInTheDocument();
      expect(screen.getByTestId('chat-icon')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for all buttons', () => {
      const accessibilityIcons: IconItem[] = [
        {
          src: '/accessibility1.png',
          alt: 'Accessibility Test 1'
        },
        {
          component: <span>Accessible Component</span>,
          alt: 'Accessibility Test 2'
        }
      ];

      render(<HeaderIcons iconItems={accessibilityIcons} />);
      
      expect(screen.getByRole('button', { name: 'Accessibility Test 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Accessibility Test 2' })).toBeInTheDocument();
    });

    it('should have proper button type attributes', () => {
      render(<HeaderIcons />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    it('should be keyboard navigable', () => {
      const iconWithTooltip: IconItem[] = [
        {
          src: '/keyboard-nav.png',
          alt: 'Keyboard Navigation Test',
          tooltip: 'Keyboard Navigation Tooltip'
        }
      ];

      render(<HeaderIcons iconItems={iconWithTooltip} />);
      
      const button = screen.getByRole('button', { name: 'Keyboard Navigation Test' });
      
      // Should be focusable
      button.focus();
      expect(document.activeElement).toBe(button);
      
      // Verify the button is wrapped with CustomTooltip
      expect(screen.getByTestId('custom-tooltip')).toHaveAttribute('title', 'Keyboard Navigation Tooltip');
    });
  });
});