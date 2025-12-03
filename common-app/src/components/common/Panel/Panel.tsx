import React, { useEffect, useRef } from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import { Close } from '@carbon/icons-react';
import CustomTooltip from '../CustomTooltip';
import './Panel.scss';
 
export interface PanelProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Callback when panel closes */
  onClose: () => void;
  /** Header title text */
  title: string;
  /** Content to display in the middle area */
  children: React.ReactNode;
  /** Label for the reset/cancel button (default: "Reset") */
  resetButtonLabel?: string;
  /** Label for the submit/save button (default: "Submit") */
  submitButtonLabel?: string;
  /** Callback when reset button is clicked */
  onReset?: () => void;
  /** Callback when submit button is clicked */
  onSubmit?: () => void;
  /** Whether to show the reset button (default: true) */
  showResetButton?: boolean;
  /** Whether to show the submit button (default: true) */
  showSubmitButton?: boolean;
  /** Whether the submit button is disabled (default: false) */
  submitButtonDisabled?: boolean;
  /** Custom CSS class name for the panel */
  className?: string;
  /** Custom CSS class name for the backdrop blur effect (default: "panel-blur") */
  blurClass?: string;
  /** Whether to enable blur effect on sidebar/headers (default: true) */
  enableBlur?: boolean;
  /** Additional selectors to blur when panel is open */
  additionalBlurSelectors?: string[];
}
 
const Panel: React.FC<PanelProps> = ({
  isOpen,
  onClose,
  title,
  children,
  resetButtonLabel = 'Reset',
  submitButtonLabel = 'Submit',
  onReset,
  onSubmit,
  showResetButton = true,
  showSubmitButton = true,
  submitButtonDisabled = false,
  className = '',
  blurClass = 'panel-blur',
  enableBlur = true,
  additionalBlurSelectors = []
}) => {
  // Track blurred elements to prevent flickering
  const blurredElementsRef = useRef<Set<Element>>(new Set());
  const blurAppliedRef = useRef<boolean>(false);
 
  // Blur sidebar and headers when panel is open - DISABLED: Only backdrop blur is used now
  useEffect(() => {
    // Disabled blur class application - only backdrop blur is used
    // This code block is intentionally disabled - only backdrop blur is used now
    if (isOpen && enableBlur && !blurAppliedRef.current) {
      // Mark blur as applied to prevent re-running
      blurAppliedRef.current = true;
 
      const sidebarSelectors = [
        '[class*="sidebar"]',
        '[class*="nav"]',
        // Exclude MUI menu classes - use specific navigation menu selectors instead
        '[class*="navigation"]',
        '[class*="nav-menu"]',
        '[class*="drawer"]',
        '[class*="aside"]',
        '.admin-sidebar',
        '.sidebar',
        '.navigation',
        '.nav-menu',
        '.left-panel',
        '.side-panel',
        ...additionalBlurSelectors
      ];
 
      // Blur sidebar elements, but exclude MUI menus/dropdowns
      const excludedMenuClasses = ['.MuiMenu-paper', '.MuiPopover-paper', '.MuiSelect-menu', '.form-field__menu-paper'];
     
      const isElementExcluded = (el: Element, excludedSelectors: string[]): boolean => {
        return excludedSelectors.some(excludedSelector => {
          try {
            return el.matches(excludedSelector) || el.closest(excludedSelector) !== null;
          } catch {
            return false;
          }
        });
      };

      const processElement = (el: Element): void => {
        if (!isElementExcluded(el, excludedMenuClasses)) {
          el.classList.add(blurClass);
          blurredElementsRef.current.add(el);
        }
      };

      sidebarSelectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach(processElement);
      });
 
      // Blur FormHeaderWithTabs - target both create and edit form structures
      const formHeaderSelectors = [
        '[class*="user-create-form"] > div:first-child',
        '.user-create-form > div:first-child',
        '[class*="user-edit-form"] > div:first-child',
        '.user-edit-form > div:first-child',
        '[class*="FormHeaderWithTabs"]',
        '[class*="FormHeaderBase"]',
        '[class*="FormHeader"]',
        'div[class*="MuiBox-root"][style*="position: sticky"][style*="z-index: 1000"]',
        'div[class*="MuiBox-root"][style*="position: sticky"][style*="z-index: 1001"]'
      ];
 
      formHeaderSelectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el) => {
          el.classList.add(blurClass);
          blurredElementsRef.current.add(el);
        });
      });
 
      // Additional method to find and blur sticky headers by checking computed styles
      // Exclude MUI menu/dropdown elements from blur effect
      const excludedSelectors = [
        '.MuiMenu-paper',
        '.MuiPopover-paper',
        '.MuiSelect-menu',
        '.MuiAutocomplete-paper',
        '.form-field__menu-paper',
        '[class*="MuiMenu"]',
        '[class*="MuiPopover"]',
        '[class*="MuiPopper"]'
      ];
 
      // Run expensive query only once on initial open
      const allElements = document.querySelectorAll('*');
      allElements.forEach((el) => {
        // Skip if element is a MUI menu/dropdown or is inside one
        const isExcluded = excludedSelectors.some(selector => {
          try {
            return el.matches(selector) || el.closest(selector);
          } catch {
            return false;
          }
        });
 
        if (isExcluded) {
          return;
        }
 
        const computedStyle = window.getComputedStyle(el);
        const position = computedStyle.position;
        const zIndex = computedStyle.zIndex;
        const top = computedStyle.top;
        const height = computedStyle.height;
 
        if (
          position === 'sticky' &&
          (zIndex === '1001' || zIndex === '1000' || parseInt(zIndex) >= 1000) &&
          (top === '0px' || top === '0') &&
          parseInt(height) <= 50
        ) {
          el.classList.add(blurClass);
          blurredElementsRef.current.add(el);
        }
      });
    } else if (!isOpen) {
      // Only remove blur when panel closes, not on every render
      if (blurAppliedRef.current) {
        blurredElementsRef.current.forEach((el) => {
          if (el.classList.contains(blurClass)) {
            el.classList.remove(blurClass);
          }
        });
        blurredElementsRef.current.clear();
        blurAppliedRef.current = false;
      }
    }
 
    return () => {
      // Cleanup: only run on unmount or when panel closes
      if (!isOpen && blurAppliedRef.current) {
        blurredElementsRef.current.forEach((el) => {
          if (el.classList.contains(blurClass)) {
            el.classList.remove(blurClass);
          }
        });
        blurredElementsRef.current.clear();
        blurAppliedRef.current = false;
      }
    };
  }, [isOpen, enableBlur, blurClass, additionalBlurSelectors]);
 
  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };
 
  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit();
    }
  };
 
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't close panel if clicking on MUI menu/dropdown elements
    // MUI menus are rendered in portals, so we need to check the actual clicked element
    const target = e.target as HTMLElement;
   
    // Check if click target is the backdrop itself (not a child element)
    if (target !== e.currentTarget) {
      return;
    }
 
    // Double-check: ensure we're not clicking inside any menu/dropdown (including portal-rendered ones)
    const excludedSelectors = [
      '.MuiMenu-paper',
      '.MuiPopover-paper',
      '.MuiSelect-menu',
      '.MuiAutocomplete-paper',
      '.form-field__menu-paper',
      '[class*="MuiMenu"]',
      '[class*="MuiPopover"]',
      '[class*="MuiPopper"]',
      '[role="listbox"]',
      '[role="menu"]'
    ];
 
    const isInsideMenu = excludedSelectors.some(selector => {
      try {
        // Check if target or any ancestor matches the excluded selectors
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (element && (element.matches(selector) || element.closest(selector))) {
          return true;
        }
        return target.matches(selector) || target.closest(selector);
      } catch {
        return false;
      }
    });
 
    // Only close if clicking directly on backdrop and not inside a menu/dropdown
    if (!isInsideMenu) {
      onClose();
    }
  };
 
  return (
    <>
      {isOpen && <Box className="panel__backdrop" onClick={handleBackdropClick} />}
 
      <Box
        className={(() => {
          const baseClass = 'panel';
          const openClass = isOpen ? 'panel--open' : '';
          const customClass = className || '';
          const customOpenClass = (isOpen && className) ? `${className}--open` : '';
          return `${baseClass} ${openClass} ${customClass} ${customOpenClass}`.trim();
        })()}
        onClick={(e) => {
          // Prevent clicks inside panel from propagating to backdrop
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <Box className="panel__header">
          <Typography className="panel__title">{title}</Typography>
          <CustomTooltip title="Close" placement="bottom" arrow={false} followCursor={true}>
            <IconButton aria-label="Close" onClick={onClose} className="panel__close-icon">
              <Close size={22} />
            </IconButton>
          </CustomTooltip>
        </Box>
 
        {/* Content */}
        <Box className="panel__content">{children}</Box>
 
        {/* Actions */}
        {(showResetButton || showSubmitButton) && (
          <Box className="panel__actions">
            {showResetButton && (
              <Button className="panel__reset-btn" onClick={handleReset}>
                {resetButtonLabel}
              </Button>
            )}
            {showSubmitButton && (
              <Button className="panel__submit-btn" onClick={handleSubmit} disabled={submitButtonDisabled} disableRipple>
                {submitButtonLabel}
              </Button>
            )}
          </Box>
        )}
      </Box>
    </>
  );
};
 
export default Panel;