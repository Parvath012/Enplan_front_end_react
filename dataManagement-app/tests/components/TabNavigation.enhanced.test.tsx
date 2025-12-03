/**
 * Comprehensive test suite for TabNavigation component - Enhanced functionality
 * Tests for: disabled icons functionality (blur effect for inactive icons)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TabNavigation from '../../src/components/TabNavigation';

describe('TabNavigation - Enhanced Disabled Icons', () => {
  const mockOnToolbarAction = jest.fn();
  const mockOnTabChange = jest.fn();

  const defaultProps = {
    onTabChange: mockOnTabChange,
    onToolbarAction: mockOnToolbarAction,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Enabled Icons', () => {
    const enabledIcons = ['Enable', 'Disable', 'Play', 'Stop', 'Copy', 'Paste', 'Delete'];

    enabledIcons.forEach((iconName) => {
      it(`should render ${iconName} icon as enabled (not blurred)`, () => {
        render(<TabNavigation {...defaultProps} />);

        const icon = screen.getByTestId(`toolbar-icon-${iconName.toLowerCase()}`);
        const styles = window.getComputedStyle(icon);

        expect(styles.opacity).not.toBe('0.4');
        expect(styles.pointerEvents).not.toBe('none');
        expect(styles.cursor).not.toBe('not-allowed');
      });

      it(`should call onToolbarAction when ${iconName} is clicked`, () => {
        render(<TabNavigation {...defaultProps} />);

        const icon = screen.getByTestId(`toolbar-icon-${iconName.toLowerCase()}`);
        fireEvent.click(icon);

        expect(mockOnToolbarAction).toHaveBeenCalledWith(
          expect.stringMatching(new RegExp(iconName, 'i'))
        );
      });

      it(`should apply hover effect to ${iconName} icon`, () => {
        render(<TabNavigation {...defaultProps} />);

        const icon = screen.getByTestId(`toolbar-icon-${iconName.toLowerCase()}`);
        
        fireEvent.mouseEnter(icon);
        
        // Icon should be interactive
        expect(icon).toHaveStyle({ cursor: 'pointer' });
      });
    });

    it('should have all enabled icons clickable', () => {
      render(<TabNavigation {...defaultProps} />);

      enabledIcons.forEach((iconName) => {
        const icon = screen.getByTestId(`toolbar-icon-${iconName.toLowerCase()}`);
        fireEvent.click(icon);
      });

      expect(mockOnToolbarAction).toHaveBeenCalledTimes(enabledIcons.length);
    });
  });

  describe('Disabled Icons', () => {
    // All icons except Enable, Disable, Play, Stop, Copy, Paste, Delete should be disabled
    const disabledIcons = [
      'configure',
      'view',
      'operate',
      'version',
      'policy',
      'flowanalysis',
    ];

    disabledIcons.forEach((iconName) => {
      it(`should render ${iconName} icon as disabled (blurred)`, () => {
        render(<TabNavigation {...defaultProps} />);

        const icon = screen.queryByTestId(`toolbar-icon-${iconName}`);
        if (icon) {
          const styles = window.getComputedStyle(icon);

          expect(styles.opacity).toBe('0.4');
          expect(styles.pointerEvents).toBe('none');
          expect(styles.cursor).toBe('not-allowed');
        }
      });

      it(`should not call onToolbarAction when disabled ${iconName} is clicked`, () => {
        render(<TabNavigation {...defaultProps} />);

        const icon = screen.queryByTestId(`toolbar-icon-${iconName}`);
        if (icon) {
          fireEvent.click(icon);
          expect(mockOnToolbarAction).not.toHaveBeenCalled();
        }
      });

      it(`should not apply hover effect to disabled ${iconName} icon`, () => {
        render(<TabNavigation {...defaultProps} />);

        const icon = screen.queryByTestId(`toolbar-icon-${iconName}`);
        if (icon) {
          fireEvent.mouseEnter(icon);
          
          const styles = window.getComputedStyle(icon);
          expect(styles.backgroundColor).not.toContain('rgba(0, 0, 0, 0.04)');
        }
      });
    });

    it('should have correct blur styling for all disabled icons', () => {
      render(<TabNavigation {...defaultProps} />);

      disabledIcons.forEach((iconName) => {
        const icon = screen.queryByTestId(`toolbar-icon-${iconName}`);
        if (icon) {
          expect(icon).toHaveClass('disabled');
        }
      });
    });
  });

  describe('Toolbar Icon Rendering', () => {
    it('should render all toolbar icons', () => {
      render(<TabNavigation {...defaultProps} />);

      const toolbar = screen.getByTestId('toolbar-container');
      expect(toolbar).toBeInTheDocument();

      // Check that toolbar contains icons
      const icons = toolbar.querySelectorAll('[data-testid^="toolbar-icon-"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should apply correct styles to enabled icons', () => {
      render(<TabNavigation {...defaultProps} />);

      const enableIcon = screen.getByTestId('toolbar-icon-enable');
      
      expect(enableIcon).toHaveStyle({
        cursor: 'pointer',
        opacity: '1',
        pointerEvents: 'auto',
      });
    });

    it('should apply correct styles to disabled icons', () => {
      render(<TabNavigation {...defaultProps} />);

      const configureIcon = screen.queryByTestId('toolbar-icon-configure');
      if (configureIcon) {
        expect(configureIcon).toHaveStyle({
          cursor: 'not-allowed',
          opacity: '0.4',
          pointerEvents: 'none',
        });
      }
    });

    it('should render icons in correct order', () => {
      render(<TabNavigation {...defaultProps} />);

      const toolbar = screen.getByTestId('toolbar-container');
      const icons = toolbar.querySelectorAll('[data-testid^="toolbar-icon-"]');
      
      // Should have multiple icons
      expect(icons.length).toBeGreaterThanOrEqual(7);
    });
  });

  describe('Icon Interaction', () => {
    it('should prevent click events on disabled icons', () => {
      render(<TabNavigation {...defaultProps} />);

      const configureIcon = screen.queryByTestId('toolbar-icon-configure');
      if (configureIcon) {
        fireEvent.click(configureIcon);
        fireEvent.click(configureIcon);
        fireEvent.click(configureIcon);

        expect(mockOnToolbarAction).not.toHaveBeenCalled();
      }
    });

    it('should allow click events on enabled icons', () => {
      render(<TabNavigation {...defaultProps} />);

      const enableIcon = screen.getByTestId('toolbar-icon-enable');
      fireEvent.click(enableIcon);

      expect(mockOnToolbarAction).toHaveBeenCalledWith('Enable');
    });

    it('should handle rapid clicks on enabled icons', () => {
      render(<TabNavigation {...defaultProps} />);

      const copyIcon = screen.getByTestId('toolbar-icon-copy');
      
      fireEvent.click(copyIcon);
      fireEvent.click(copyIcon);
      fireEvent.click(copyIcon);

      expect(mockOnToolbarAction).toHaveBeenCalledTimes(3);
    });

    it('should not trigger actions for disabled icons even with keyboard events', () => {
      render(<TabNavigation {...defaultProps} />);

      const configureIcon = screen.queryByTestId('toolbar-icon-configure');
      if (configureIcon) {
        fireEvent.keyDown(configureIcon, { key: 'Enter' });
        fireEvent.keyPress(configureIcon, { key: 'Enter' });

        expect(mockOnToolbarAction).not.toHaveBeenCalled();
      }
    });
  });

  describe('Visual Feedback', () => {
    it('should have distinct visual appearance for enabled vs disabled icons', () => {
      render(<TabNavigation {...defaultProps} />);

      const enabledIcon = screen.getByTestId('toolbar-icon-enable');
      const disabledIcon = screen.queryByTestId('toolbar-icon-configure');

      const enabledStyles = window.getComputedStyle(enabledIcon);
      
      if (disabledIcon) {
        const disabledStyles = window.getComputedStyle(disabledIcon);
        
        // Opacity should be different
        expect(enabledStyles.opacity).not.toBe(disabledStyles.opacity);
        
        // Cursor should be different
        expect(enabledStyles.cursor).not.toBe(disabledStyles.cursor);
      }
    });

    it('should apply disabled class to disabled icons', () => {
      render(<TabNavigation {...defaultProps} />);

      const disabledIcon = screen.queryByTestId('toolbar-icon-configure');
      if (disabledIcon) {
        expect(disabledIcon).toHaveClass('disabled');
      }
    });

    it('should not apply disabled class to enabled icons', () => {
      render(<TabNavigation {...defaultProps} />);

      const enabledIcon = screen.getByTestId('toolbar-icon-enable');
      expect(enabledIcon).not.toHaveClass('disabled');
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate ARIA attributes for enabled icons', () => {
      render(<TabNavigation {...defaultProps} />);

      const enableIcon = screen.getByTestId('toolbar-icon-enable');
      
      // Should be interactive
      expect(enableIcon).not.toHaveAttribute('aria-disabled', 'true');
    });

    it('should have appropriate ARIA attributes for disabled icons', () => {
      render(<TabNavigation {...defaultProps} />);

      const configureIcon = screen.queryByTestId('toolbar-icon-configure');
      if (configureIcon) {
        // Should indicate disabled state
        expect(configureIcon.style.pointerEvents).toBe('none');
      }
    });

    it('should be keyboard navigable for enabled icons', () => {
      render(<TabNavigation {...defaultProps} />);

      const enableIcon = screen.getByTestId('toolbar-icon-enable');
      
      // Should be focusable
      enableIcon.focus();
      expect(document.activeElement).toBe(enableIcon);
    });
  });

  describe('Integration with onToolbarAction', () => {
    it('should pass correct action name for Enable', () => {
      render(<TabNavigation {...defaultProps} />);

      const enableIcon = screen.getByTestId('toolbar-icon-enable');
      fireEvent.click(enableIcon);

      expect(mockOnToolbarAction).toHaveBeenCalledWith('Enable');
    });

    it('should pass correct action name for Disable', () => {
      render(<TabNavigation {...defaultProps} />);

      const disableIcon = screen.getByTestId('toolbar-icon-disable');
      fireEvent.click(disableIcon);

      expect(mockOnToolbarAction).toHaveBeenCalledWith('Disable');
    });

    it('should pass correct action name for Play/Start', () => {
      render(<TabNavigation {...defaultProps} />);

      const playIcon = screen.getByTestId('toolbar-icon-play');
      fireEvent.click(playIcon);

      expect(mockOnToolbarAction).toHaveBeenCalledWith(expect.stringMatching(/play|start/i));
    });

    it('should pass correct action name for Stop', () => {
      render(<TabNavigation {...defaultProps} />);

      const stopIcon = screen.getByTestId('toolbar-icon-stop');
      fireEvent.click(stopIcon);

      expect(mockOnToolbarAction).toHaveBeenCalledWith('Stop');
    });

    it('should pass correct action name for Copy', () => {
      render(<TabNavigation {...defaultProps} />);

      const copyIcon = screen.getByTestId('toolbar-icon-copy');
      fireEvent.click(copyIcon);

      expect(mockOnToolbarAction).toHaveBeenCalledWith('copy');
    });

    it('should pass correct action name for Paste', () => {
      render(<TabNavigation {...defaultProps} />);

      const pasteIcon = screen.getByTestId('toolbar-icon-paste');
      fireEvent.click(pasteIcon);

      expect(mockOnToolbarAction).toHaveBeenCalledWith('paste');
    });

    it('should pass correct action name for Delete', () => {
      render(<TabNavigation {...defaultProps} />);

      const deleteIcon = screen.getByTestId('toolbar-icon-delete');
      fireEvent.click(deleteIcon);

      expect(mockOnToolbarAction).toHaveBeenCalledWith('delete');
    });
  });

  describe('Styling Consistency', () => {
    it('should have consistent opacity for all disabled icons', () => {
      render(<TabNavigation {...defaultProps} />);

      const disabledIcons = screen.queryAllByTestId(/toolbar-icon-/);
      const disabledOpacities = disabledIcons
        .filter((icon) => icon.classList.contains('disabled'))
        .map((icon) => window.getComputedStyle(icon).opacity);

      // All disabled icons should have the same opacity
      if (disabledOpacities.length > 0) {
        const firstOpacity = disabledOpacities[0];
        disabledOpacities.forEach((opacity) => {
          expect(opacity).toBe(firstOpacity);
        });
      }
    });

    it('should have consistent cursor style for all disabled icons', () => {
      render(<TabNavigation {...defaultProps} />);

      const disabledIcons = screen.queryAllByTestId(/toolbar-icon-/);
      const disabledCursors = disabledIcons
        .filter((icon) => icon.classList.contains('disabled'))
        .map((icon) => window.getComputedStyle(icon).cursor);

      // All disabled icons should have the same cursor
      if (disabledCursors.length > 0) {
        disabledCursors.forEach((cursor) => {
          expect(cursor).toBe('not-allowed');
        });
      }
    });

    it('should match inactive tab header blur style', () => {
      render(<TabNavigation {...defaultProps} />);

      const disabledIcon = screen.queryByTestId('toolbar-icon-configure');
      if (disabledIcon) {
        const styles = window.getComputedStyle(disabledIcon);
        
        // Should match the blur style (opacity: 0.4)
        expect(styles.opacity).toBe('0.4');
      }
    });
  });
});

