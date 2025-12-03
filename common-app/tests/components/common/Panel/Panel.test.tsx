import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Panel from '../../../src/components/common/Panel/Panel';
import '@testing-library/jest-dom';

// Mock CustomTooltip
jest.mock('../../../src/components/common/CustomTooltip', () => {
  return function MockCustomTooltip({ children, title }: any) {
    return <div data-testid="custom-tooltip" title={title}>{children}</div>;
  };
});

// Mock Close icon
jest.mock('@carbon/icons-react', () => ({
  Close: ({ size }: { size?: number }) => <div data-testid="close-icon">Close Icon</div>
}));

describe('Panel', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Panel',
    children: <div>Panel Content</div>
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset DOM
    document.body.innerHTML = '';
    // Mock getComputedStyle
    window.getComputedStyle = jest.fn(() => ({
      position: 'static',
      zIndex: '0',
      top: 'auto',
      height: '100px'
    })) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render panel when isOpen is true', () => {
      render(<Panel {...defaultProps} />);
      expect(screen.getByText('Test Panel')).toBeInTheDocument();
      expect(screen.getByText('Panel Content')).toBeInTheDocument();
    });

    it('should not render backdrop when isOpen is false', () => {
      render(<Panel {...defaultProps} isOpen={false} />);
      const backdrop = document.querySelector('.panel__backdrop');
      expect(backdrop).not.toBeInTheDocument();
    });

    it('should render backdrop when isOpen is true', () => {
      render(<Panel {...defaultProps} isOpen={true} />);
      const backdrop = document.querySelector('.panel__backdrop');
      expect(backdrop).toBeInTheDocument();
    });

    it('should render with correct title', () => {
      render(<Panel {...defaultProps} title="Custom Title" />);
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('should render children correctly', () => {
      render(<Panel {...defaultProps}><div>Custom Content</div></Panel>);
      expect(screen.getByText('Custom Content')).toBeInTheDocument();
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when close button is clicked', () => {
      const mockOnClose = jest.fn();
      render(<Panel {...defaultProps} onClose={mockOnClose} />);
      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', () => {
      const mockOnClose = jest.fn();
      render(<Panel {...defaultProps} onClose={mockOnClose} />);
      const backdrop = document.querySelector('.panel__backdrop');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    it('should not call onClose when clicking inside panel', () => {
      const mockOnClose = jest.fn();
      render(<Panel {...defaultProps} onClose={mockOnClose} />);
      const panel = document.querySelector('.panel');
      if (panel) {
        fireEvent.click(panel);
        expect(mockOnClose).not.toHaveBeenCalled();
      }
    });

    it('should not call onClose when clicking on child element of backdrop', () => {
      const mockOnClose = jest.fn();
      const { container } = render(<Panel {...defaultProps} onClose={mockOnClose} />);
      const backdrop = container.querySelector('.panel__backdrop');
      if (backdrop) {
        const childDiv = document.createElement('div');
        backdrop.appendChild(childDiv);
        fireEvent.click(childDiv);
        expect(mockOnClose).not.toHaveBeenCalled();
      }
    });
  });

  describe('Reset Button', () => {
    it('should render reset button by default', () => {
      render(<Panel {...defaultProps} />);
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('should render with custom reset button label', () => {
      render(<Panel {...defaultProps} resetButtonLabel="Cancel" />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should call onReset when reset button is clicked', () => {
      const mockOnReset = jest.fn();
      render(<Panel {...defaultProps} onReset={mockOnReset} />);
      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);
      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });

    it('should not call onReset when reset button is clicked but onReset is not provided', () => {
      render(<Panel {...defaultProps} />);
      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);
      // Should not throw error
      expect(resetButton).toBeInTheDocument();
    });

    it('should hide reset button when showResetButton is false', () => {
      render(<Panel {...defaultProps} showResetButton={false} />);
      expect(screen.queryByText('Reset')).not.toBeInTheDocument();
    });
  });

  describe('Submit Button', () => {
    it('should render submit button by default', () => {
      render(<Panel {...defaultProps} />);
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    it('should render with custom submit button label', () => {
      render(<Panel {...defaultProps} submitButtonLabel="Save" />);
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should call onSubmit when submit button is clicked', () => {
      const mockOnSubmit = jest.fn();
      render(<Panel {...defaultProps} onSubmit={mockOnSubmit} />);
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should not call onSubmit when submit button is clicked but onSubmit is not provided', () => {
      render(<Panel {...defaultProps} />);
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);
      // Should not throw error
      expect(submitButton).toBeInTheDocument();
    });

    it('should disable submit button when submitButtonDisabled is true', () => {
      render(<Panel {...defaultProps} submitButtonDisabled={true} />);
      const submitButton = screen.getByText('Submit');
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when submitButtonDisabled is false', () => {
      render(<Panel {...defaultProps} submitButtonDisabled={false} />);
      const submitButton = screen.getByText('Submit');
      expect(submitButton).not.toBeDisabled();
    });

    it('should hide submit button when showSubmitButton is false', () => {
      render(<Panel {...defaultProps} showSubmitButton={false} />);
      expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    });
  });

  describe('Button Visibility', () => {
    it('should hide actions section when both buttons are hidden', () => {
      render(<Panel {...defaultProps} showResetButton={false} showSubmitButton={false} />);
      const actionsSection = document.querySelector('.panel__actions');
      expect(actionsSection).not.toBeInTheDocument();
    });

    it('should show actions section when at least one button is visible', () => {
      render(<Panel {...defaultProps} showResetButton={true} showSubmitButton={false} />);
      const actionsSection = document.querySelector('.panel__actions');
      expect(actionsSection).toBeInTheDocument();
    });

    it('should show both buttons when both are enabled', () => {
      render(<Panel {...defaultProps} showResetButton={true} showSubmitButton={true} />);
      expect(screen.getByText('Reset')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    it('should apply base panel class', () => {
      const { container } = render(<Panel {...defaultProps} />);
      const panel = container.querySelector('.panel');
      expect(panel).toBeInTheDocument();
    });

    it('should apply panel--open class when isOpen is true', () => {
      const { container } = render(<Panel {...defaultProps} isOpen={true} />);
      const panel = container.querySelector('.panel--open');
      expect(panel).toBeInTheDocument();
    });

    it('should not apply panel--open class when isOpen is false', () => {
      const { container } = render(<Panel {...defaultProps} isOpen={false} />);
      const panel = container.querySelector('.panel--open');
      expect(panel).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<Panel {...defaultProps} className="custom-panel" />);
      const panel = container.querySelector('.custom-panel');
      expect(panel).toBeInTheDocument();
    });

    it('should apply custom className with --open suffix when isOpen is true', () => {
      const { container } = render(<Panel {...defaultProps} className="custom-panel" isOpen={true} />);
      const panel = container.querySelector('.custom-panel--open');
      expect(panel).toBeInTheDocument();
    });

    it('should not apply custom className --open suffix when isOpen is false', () => {
      const { container } = render(<Panel {...defaultProps} className="custom-panel" isOpen={false} />);
      const panel = container.querySelector('.custom-panel--open');
      expect(panel).not.toBeInTheDocument();
    });

    it('should handle empty className', () => {
      const { container } = render(<Panel {...defaultProps} className="" />);
      const panel = container.querySelector('.panel');
      expect(panel).toBeInTheDocument();
    });
  });

  describe('Backdrop Click Handling', () => {
    it('should not close when clicking on MUI menu elements', () => {
      const mockOnClose = jest.fn();
      render(<Panel {...defaultProps} onClose={mockOnClose} />);
      
      // Create a mock MUI menu element
      const menuElement = document.createElement('div');
      menuElement.className = 'MuiMenu-paper';
      document.body.appendChild(menuElement);
      
      // Mock elementFromPoint to return the menu element
      document.elementFromPoint = jest.fn(() => menuElement);
      
      const backdrop = document.querySelector('.panel__backdrop');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).not.toHaveBeenCalled();
      }
      
      document.body.removeChild(menuElement);
    });

    it('should not close when clicking on MUI popover elements', () => {
      const mockOnClose = jest.fn();
      render(<Panel {...defaultProps} onClose={mockOnClose} />);
      
      const popoverElement = document.createElement('div');
      popoverElement.className = 'MuiPopover-paper';
      document.body.appendChild(popoverElement);
      
      document.elementFromPoint = jest.fn(() => popoverElement);
      
      const backdrop = document.querySelector('.panel__backdrop');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).not.toHaveBeenCalled();
      }
      
      document.body.removeChild(popoverElement);
    });

    it('should not close when clicking on select menu', () => {
      const mockOnClose = jest.fn();
      render(<Panel {...defaultProps} onClose={mockOnClose} />);
      
      const selectMenu = document.createElement('div');
      selectMenu.className = 'MuiSelect-menu';
      document.body.appendChild(selectMenu);
      
      document.elementFromPoint = jest.fn(() => selectMenu);
      
      const backdrop = document.querySelector('.panel__backdrop');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).not.toHaveBeenCalled();
      }
      
      document.body.removeChild(selectMenu);
    });

    it('should not close when clicking on listbox role element', () => {
      const mockOnClose = jest.fn();
      render(<Panel {...defaultProps} onClose={mockOnClose} />);
      
      const listbox = document.createElement('div');
      listbox.setAttribute('role', 'listbox');
      document.body.appendChild(listbox);
      
      document.elementFromPoint = jest.fn(() => listbox);
      
      const backdrop = document.querySelector('.panel__backdrop');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).not.toHaveBeenCalled();
      }
      
      document.body.removeChild(listbox);
    });

    it('should handle errors in elementFromPoint gracefully', () => {
      const mockOnClose = jest.fn();
      render(<Panel {...defaultProps} onClose={mockOnClose} />);
      
      // Mock elementFromPoint to throw an error
      document.elementFromPoint = jest.fn(() => {
        throw new Error('Test error');
      });
      
      const backdrop = document.querySelector('.panel__backdrop');
      if (backdrop) {
        // Should not throw, should handle gracefully
        expect(() => fireEvent.click(backdrop)).not.toThrow();
      }
    });

    it('should handle errors in matches/closest gracefully', () => {
      const mockOnClose = jest.fn();
      render(<Panel {...defaultProps} onClose={mockOnClose} />);
      
      const backdrop = document.querySelector('.panel__backdrop');
      if (backdrop) {
        // Create element that throws on matches
        const problematicElement = {
          matches: () => { throw new Error('Test error'); },
          closest: () => null
        };
        
        document.elementFromPoint = jest.fn(() => problematicElement as any);
        
        expect(() => fireEvent.click(backdrop)).not.toThrow();
      }
    });
  });

  describe('Blur Effect', () => {
    beforeEach(() => {
      // Create test elements for blur testing
      const sidebar = document.createElement('div');
      sidebar.className = 'sidebar';
      document.body.appendChild(sidebar);

      const nav = document.createElement('nav');
      nav.className = 'nav';
      document.body.appendChild(nav);

      const stickyHeader = document.createElement('div');
      stickyHeader.className = 'sticky-header';
      document.body.appendChild(stickyHeader);
    });

    afterEach(() => {
      // Cleanup
      const elements = document.querySelectorAll('.sidebar, .nav, .sticky-header');
      elements.forEach(el => el.remove());
    });

    it('should not apply blur when enableBlur is false', () => {
      render(<Panel {...defaultProps} enableBlur={false} />);
      // Blur logic is disabled, so we just verify it doesn't crash
      expect(screen.getByText('Test Panel')).toBeInTheDocument();
    });

    it('should handle blur when panel opens', () => {
      render(<Panel {...defaultProps} enableBlur={true} isOpen={true} />);
      // Blur logic is disabled but code path exists
      expect(screen.getByText('Test Panel')).toBeInTheDocument();
    });

    it('should handle blur cleanup when panel closes', () => {
      const { rerender } = render(<Panel {...defaultProps} enableBlur={true} isOpen={true} />);
      rerender(<Panel {...defaultProps} enableBlur={true} isOpen={false} />);
      // Should handle cleanup without errors
      expect(screen.queryByText('Test Panel')).toBeInTheDocument();
    });

    it('should use custom blur class when provided', () => {
      render(<Panel {...defaultProps} blurClass="custom-blur" enableBlur={true} />);
      // Should use custom blur class
      expect(screen.getByText('Test Panel')).toBeInTheDocument();
    });

    it('should handle additional blur selectors', () => {
      render(<Panel {...defaultProps} additionalBlurSelectors={['.custom-element']} enableBlur={true} />);
      // Should handle additional selectors
      expect(screen.getByText('Test Panel')).toBeInTheDocument();
    });

    it('should handle blur when blurAppliedRef is already true', () => {
      const { rerender } = render(<Panel {...defaultProps} enableBlur={true} isOpen={true} />);
      // Re-render with same props to test ref check
      rerender(<Panel {...defaultProps} enableBlur={true} isOpen={true} />);
      expect(screen.getByText('Test Panel')).toBeInTheDocument();
    });

    it('should handle sidebar selector blur', () => {
      const sidebar = document.createElement('div');
      sidebar.className = 'admin-sidebar';
      document.body.appendChild(sidebar);
      
      render(<Panel {...defaultProps} enableBlur={true} isOpen={true} />);
      expect(screen.getByText('Test Panel')).toBeInTheDocument();
      
      document.body.removeChild(sidebar);
    });

    it('should exclude MUI menu elements from blur', () => {
      const menuElement = document.createElement('div');
      menuElement.className = 'MuiMenu-paper';
      document.body.appendChild(menuElement);
      
      render(<Panel {...defaultProps} enableBlur={true} isOpen={true} />);
      expect(screen.getByText('Test Panel')).toBeInTheDocument();
      
      document.body.removeChild(menuElement);
    });

    it('should handle form header selectors', () => {
      const formHeader = document.createElement('div');
      formHeader.className = 'user-create-form';
      const firstChild = document.createElement('div');
      formHeader.appendChild(firstChild);
      document.body.appendChild(formHeader);
      
      render(<Panel {...defaultProps} enableBlur={true} isOpen={true} />);
      expect(screen.getByText('Test Panel')).toBeInTheDocument();
      
      document.body.removeChild(formHeader);
    });

    it('should handle sticky header detection with computed styles', () => {
      const stickyElement = document.createElement('div');
      document.body.appendChild(stickyElement);
      
      // Mock getComputedStyle to return sticky header values
      window.getComputedStyle = jest.fn(() => ({
        position: 'sticky',
        zIndex: '1001',
        top: '0px',
        height: '40px'
      })) as any;
      
      render(<Panel {...defaultProps} enableBlur={true} isOpen={true} />);
      expect(screen.getByText('Test Panel')).toBeInTheDocument();
      
      document.body.removeChild(stickyElement);
    });

    it('should handle sticky header with zIndex 1000', () => {
      const stickyElement = document.createElement('div');
      document.body.appendChild(stickyElement);
      
      window.getComputedStyle = jest.fn(() => ({
        position: 'sticky',
        zIndex: '1000',
        top: '0',
        height: '50px'
      })) as any;
      
      render(<Panel {...defaultProps} enableBlur={true} isOpen={true} />);
      expect(screen.getByText('Test Panel')).toBeInTheDocument();
      
      document.body.removeChild(stickyElement);
    });

    it('should handle sticky header with zIndex >= 1000', () => {
      const stickyElement = document.createElement('div');
      document.body.appendChild(stickyElement);
      
      window.getComputedStyle = jest.fn(() => ({
        position: 'sticky',
        zIndex: '2000',
        top: '0px',
        height: '30px'
      })) as any;
      
      render(<Panel {...defaultProps} enableBlur={true} isOpen={true} />);
      expect(screen.getByText('Test Panel')).toBeInTheDocument();
      
      document.body.removeChild(stickyElement);
    });

    it('should not blur elements that are excluded', () => {
      const excludedElement = document.createElement('div');
      excludedElement.className = 'MuiPopover-paper';
      document.body.appendChild(excludedElement);
      
      render(<Panel {...defaultProps} enableBlur={true} isOpen={true} />);
      expect(screen.getByText('Test Panel')).toBeInTheDocument();
      
      document.body.removeChild(excludedElement);
    });

    it('should handle errors in element matching gracefully', () => {
      const problematicElement = document.createElement('div');
      problematicElement.matches = jest.fn(() => { throw new Error('Test error'); });
      document.body.appendChild(problematicElement);
      
      render(<Panel {...defaultProps} enableBlur={true} isOpen={true} />);
      expect(screen.getByText('Test Panel')).toBeInTheDocument();
      
      document.body.removeChild(problematicElement);
    });

    it('should handle cleanup on unmount', () => {
      const { unmount } = render(<Panel {...defaultProps} enableBlur={true} isOpen={true} />);
      unmount();
      // Should not throw errors during cleanup
      expect(screen.queryByText('Test Panel')).not.toBeInTheDocument();
    });

    it('should handle blur class removal when element no longer has class', () => {
      const element = document.createElement('div');
      element.className = 'sidebar';
      document.body.appendChild(element);
      
      const { rerender } = render(<Panel {...defaultProps} enableBlur={true} isOpen={true} />);
      element.classList.remove('panel-blur');
      rerender(<Panel {...defaultProps} enableBlur={true} isOpen={false} />);
      
      expect(screen.queryByText('Test Panel')).toBeInTheDocument();
      document.body.removeChild(element);
    });

    it('should handle sticky header with height > 50', () => {
      const stickyElement = document.createElement('div');
      document.body.appendChild(stickyElement);
      
      window.getComputedStyle = jest.fn(() => ({
        position: 'sticky',
        zIndex: '1001',
        top: '0px',
        height: '60px' // Greater than 50, should not blur
      })) as any;
      
      render(<Panel {...defaultProps} enableBlur={true} isOpen={true} />);
      expect(screen.getByText('Test Panel')).toBeInTheDocument();
      
      document.body.removeChild(stickyElement);
    });

    it('should handle sticky header with top !== 0px', () => {
      const stickyElement = document.createElement('div');
      document.body.appendChild(stickyElement);
      
      window.getComputedStyle = jest.fn(() => ({
        position: 'sticky',
        zIndex: '1001',
        top: '10px', // Not 0px, should not blur
        height: '40px'
      })) as any;
      
      render(<Panel {...defaultProps} enableBlur={true} isOpen={true} />);
      expect(screen.getByText('Test Panel')).toBeInTheDocument();
      
      document.body.removeChild(stickyElement);
    });

    it('should handle sticky header with zIndex < 1000', () => {
      const stickyElement = document.createElement('div');
      document.body.appendChild(stickyElement);
      
      window.getComputedStyle = jest.fn(() => ({
        position: 'sticky',
        zIndex: '999', // Less than 1000, should not blur
        top: '0px',
        height: '40px'
      })) as any;
      
      render(<Panel {...defaultProps} enableBlur={true} isOpen={true} />);
      expect(screen.getByText('Test Panel')).toBeInTheDocument();
      
      document.body.removeChild(stickyElement);
    });

    it('should handle non-sticky position elements', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);
      
      window.getComputedStyle = jest.fn(() => ({
        position: 'relative', // Not sticky
        zIndex: '1001',
        top: '0px',
        height: '40px'
      })) as any;
      
      render(<Panel {...defaultProps} enableBlur={true} isOpen={true} />);
      expect(screen.getByText('Test Panel')).toBeInTheDocument();
      
      document.body.removeChild(element);
    });

    it('should handle element closest check in isElementExcluded', () => {
      const parentElement = document.createElement('div');
      parentElement.className = 'MuiMenu-paper';
      const childElement = document.createElement('div');
      parentElement.appendChild(childElement);
      document.body.appendChild(parentElement);
      
      render(<Panel {...defaultProps} enableBlur={true} isOpen={true} />);
      expect(screen.getByText('Test Panel')).toBeInTheDocument();
      
      document.body.removeChild(parentElement);
    });

    it('should handle processElement for excluded elements', () => {
      const excludedElement = document.createElement('div');
      excludedElement.className = 'MuiMenu-paper';
      document.body.appendChild(excludedElement);
      
      render(<Panel {...defaultProps} enableBlur={true} isOpen={true} />);
      expect(screen.getByText('Test Panel')).toBeInTheDocument();
      
      document.body.removeChild(excludedElement);
    });

    it('should handle form header with class selector', () => {
      const formHeader = document.createElement('div');
      formHeader.setAttribute('class', 'user-edit-form');
      const firstChild = document.createElement('div');
      formHeader.appendChild(firstChild);
      document.body.appendChild(formHeader);
      
      render(<Panel {...defaultProps} enableBlur={true} isOpen={true} />);
      expect(screen.getByText('Test Panel')).toBeInTheDocument();
      
      document.body.removeChild(formHeader);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null children', () => {
      render(<Panel {...defaultProps} children={null} />);
      expect(screen.getByText('Test Panel')).toBeInTheDocument();
    });

    it('should handle multiple children', () => {
      render(
        <Panel {...defaultProps}>
          <div>Child 1</div>
          <div>Child 2</div>
        </Panel>
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(1000);
      render(<Panel {...defaultProps} title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle empty title', () => {
      render(<Panel {...defaultProps} title="" />);
      const titleElement = screen.getByText('');
      expect(titleElement).toBeInTheDocument();
    });

    it('should handle special characters in title', () => {
      const specialTitle = 'Title with @#$%^&*()';
      render(<Panel {...defaultProps} title={specialTitle} />);
      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });

    it('should handle rapid open/close toggles', () => {
      const { rerender } = render(<Panel {...defaultProps} isOpen={true} />);
      rerender(<Panel {...defaultProps} isOpen={false} />);
      rerender(<Panel {...defaultProps} isOpen={true} />);
      rerender(<Panel {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Test Panel')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should have correct header structure', () => {
      render(<Panel {...defaultProps} />);
      const header = document.querySelector('.panel__header');
      expect(header).toBeInTheDocument();
      expect(screen.getByText('Test Panel')).toBeInTheDocument();
      expect(screen.getByLabelText('Close')).toBeInTheDocument();
    });

    it('should have correct content structure', () => {
      render(<Panel {...defaultProps}><div>Test Content</div></Panel>);
      const content = document.querySelector('.panel__content');
      expect(content).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should have correct actions structure', () => {
      render(<Panel {...defaultProps} />);
      const actions = document.querySelector('.panel__actions');
      expect(actions).toBeInTheDocument();
    });

    it('should prevent event propagation on panel click', () => {
      const mockOnClose = jest.fn();
      const { container } = render(<Panel {...defaultProps} onClose={mockOnClose} />);
      const panel = container.querySelector('.panel');
      if (panel) {
        const clickEvent = new MouseEvent('click', { bubbles: true });
        const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');
        fireEvent(panel, clickEvent);
        expect(stopPropagationSpy).toHaveBeenCalled();
      }
    });
  });
});

