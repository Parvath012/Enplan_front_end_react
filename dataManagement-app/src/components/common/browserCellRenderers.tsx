import React from 'react';
import { ManageProtection } from '@carbon/icons-react';
import TruncatedTextWithTooltip from './TruncatedTextWithTooltip';
import { createHighlightedText, getCommonCellStyle, createIconWithTooltip, ListIcon } from './browserUtils';

// Import CustomTooltip from common-app with fallback
const CustomTooltip = React.lazy(() => import('commonApp/CustomTooltip').catch(err => {
  console.error('Failed to load CustomTooltip from common-app:', err);
  return { 
    default: ({ children, title }: any) => <div title={title}>{children}</div>
  };
}));

/**
 * Version column cell renderer factory
 */
export const createVersionCellRenderer = (searchTerm: string) => {
  return (params: any) => {
    const version = params.value ?? 'Unknown';
    
    const IconWithTooltip = createIconWithTooltip(
      React.createElement(ListIcon),
      `Version: ${version}`
    );
    
    const highlightedVersion = createHighlightedText(version, searchTerm);
    
    // Prevent selection when clicking on Version column
    const handleVersionClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      // Do nothing - prevent selection
    };
    
    return React.createElement('div', {
      onClick: handleVersionClick,
      style: getCommonCellStyle({
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
        height: '100%',
        cursor: 'default'
      })
    }, [
      React.createElement('span', { 
        key: 'version',
        style: {
          fontSize: '10px',
          fontFamily: 'InterTight-Regular, Inter Tight, sans-serif',
          color: '#5B6061'
        }
      }, highlightedVersion),
      IconWithTooltip
    ]);
  };
};

/**
 * Tags column cell renderer factory
 */
export const createTagsCellRenderer = (searchTerm: string) => {
  return (params: any) => {
    const tags = params.value ?? [];
    const tagsText = tags.join(', ');
    const highlightedTagsText = createHighlightedText(tagsText, searchTerm);
    
    // Prevent selection when clicking on Tags column
    const handleTagsClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      // Do nothing - prevent selection
    };
    
    return React.createElement('div', {
      onClick: handleTagsClick,
      style: getCommonCellStyle({
        lineHeight: '20px',
        wordWrap: 'break-word',
        wordBreak: 'break-word',
        whiteSpace: 'normal',
        overflow: 'hidden',
        width: '100%',
        boxSizing: 'border-box',
        minHeight: '100%',
        cursor: 'default'
      })
    }, highlightedTagsText);
  };
};

/**
 * Type column cell renderer factory
 * @param searchTerm - Search term for highlighting
 * @param handleServiceSelect - Handler function for service selection
 * @param iconClassName - CSS class name for restricted icon (e.g., 'restricted-processor-icon' or 'restricted-service-icon')
 * @param rowSelectedClass - CSS class name for selected row (e.g., 'processor-row-selected' or 'controller-service-row-selected')
 */
export const createTypeCellRenderer = (
  searchTerm: string, 
  handleServiceSelect: (service: any) => void,
  iconClassName: string = 'restricted-service-icon',
  rowSelectedClass: string = 'service-row-selected'
) => {
  return (params: any) => {
    const typeText = params.value ?? '';
    const highlightedText = createHighlightedText(typeText, searchTerm);
    const service = params.data;
    
    const handleTypeClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (service?.id) {
        handleServiceSelect(service);
      }
    };
    
    // Function to handle row hover
    const handleRowHover = (e: MouseEvent | React.MouseEvent, isEntering: boolean) => {
      const target = e.currentTarget || e.target as HTMLElement;
      // Find the AG Grid cell element (not just our inner div)
      let cellElement: HTMLElement | null = target as HTMLElement;
      
      // Traverse up to find the .ag-cell element
      while (cellElement && cellElement !== document.body) {
        if (cellElement.classList.contains('ag-cell')) {
          break;
        }
        cellElement = cellElement.parentElement;
      }
      
      if (!cellElement) return;
      
      // Find the parent row element
      let rowElement: HTMLElement | null = cellElement.closest('.ag-row') as HTMLElement;
      
      if (!rowElement) return;
      
      // Don't apply hover if row is selected
      const isRowSelected = rowElement.classList.contains(rowSelectedClass) || 
                           rowElement.getAttribute('aria-selected') === 'true';
      
      if (isEntering && !isRowSelected) {
        // Get AG Grid's hover color from CSS variable (same as cell hover)
        const gridContainer = rowElement.closest('.ag-theme-alpine') || rowElement.closest('.ag-root-wrapper') || document.querySelector('.ag-theme-alpine');
        let hoverColor = '#f5f5f5'; // AG Grid's default hover color for ag-theme-alpine
        
        if (gridContainer) {
          const computedStyle = window.getComputedStyle(gridContainer as HTMLElement);
          const cssVarColor = computedStyle.getPropertyValue('--ag-row-hover-color').trim();
          if (cssVarColor && cssVarColor !== 'transparent') {
            hoverColor = cssVarColor;
          }
        }
        
        // Add hover class (AG Grid will handle styling via CSS)
        rowElement.classList.add('ag-row-hover');
        
        // Apply hover style to all cells in the row using AG Grid's hover color
        const cells = rowElement.querySelectorAll('.ag-cell');
        const applyHoverToChild = (child: Element) => {
          (child as HTMLElement).style.setProperty('background-color', hoverColor, 'important');
        };
        const applyHoverToCell = (cell: Element) => {
          const cellElement = cell as HTMLElement;
          // Apply to the cell itself
          cellElement.style.setProperty('background-color', hoverColor, 'important');
          
          // Also apply to all child elements (text content, divs, etc.)
          const childElements = cellElement.querySelectorAll('*');
          childElements.forEach(applyHoverToChild);
        };
        cells.forEach(applyHoverToCell);
        
        // Also set row background to match
        rowElement.style.setProperty('background-color', hoverColor, 'important');
      } else if (!isEntering) {
        // Helper functions to remove hover styles (extracted to reduce nesting)
        const removeHoverFromChild = (child: Element) => {
          (child as HTMLElement).style.removeProperty('background-color');
        };
        const removeHoverFromCell = (cell: Element) => {
          const cellElement = cell as HTMLElement;
          cellElement.style.removeProperty('background-color');
          
          // Also remove from all child elements
          const childElements = cellElement.querySelectorAll('*');
          childElements.forEach(removeHoverFromChild);
        };
        const removeHoverFromRow = (row: HTMLElement) => {
          // Don't remove hover styles if row is selected
          const isRowSelected = row.classList.contains(rowSelectedClass) || 
                               row.getAttribute('aria-selected') === 'true';
          
          if (!isRowSelected) {
            // No cell is hovered, remove hover class
            row.classList.remove('ag-row-hover');
            row.style.removeProperty('background-color');
            
            // Remove hover style from all cells and their child elements
            const cells = row.querySelectorAll('.ag-cell');
            cells.forEach(removeHoverFromCell);
          }
        };
        
        // Use a small delay to check if mouse moved to another cell in the row
        setTimeout(() => {
          if (rowElement) {
            // Don't remove hover if row is selected
            const isRowSelected = rowElement.classList.contains(rowSelectedClass) || 
                                 rowElement.getAttribute('aria-selected') === 'true';
            
            if (!isRowSelected) {
              // Check if any cell in the row is still being hovered
              const hoveredCell = rowElement.querySelector('.ag-cell:hover');
              if (!hoveredCell) {
                removeHoverFromRow(rowElement);
              }
            }
          }
        }, 50);
      }
    };
    
    const setupCellEventListeners = (cellElement: HTMLElement) => {
      // Remove existing listeners if any (to prevent duplicates)
      const existingEnter = (cellElement as any).__typeCellMouseEnter;
      const existingLeave = (cellElement as any).__typeCellMouseLeave;
      if (existingEnter) {
        cellElement.removeEventListener('mouseenter', existingEnter);
      }
      if (existingLeave) {
        cellElement.removeEventListener('mouseleave', existingLeave);
      }
      
      // Attach event listeners to the AG Grid cell element (not just our inner div)
      // This ensures hovering anywhere in the cell triggers the row highlight
      const mouseEnterHandler = (e: MouseEvent) => handleRowHover(e, true);
      const mouseLeaveHandler = (e: MouseEvent) => handleRowHover(e, false);
      
      cellElement.addEventListener('mouseenter', mouseEnterHandler, { passive: true });
      cellElement.addEventListener('mouseleave', mouseLeaveHandler, { passive: true });
      
      // Store handlers for cleanup
      (cellElement as any).__typeCellMouseEnter = mouseEnterHandler;
      (cellElement as any).__typeCellMouseLeave = mouseLeaveHandler;
    };

    const findAndSetupCellElement = (node: HTMLDivElement) => {
      // Find the parent AG Grid cell element
      let cellElement: HTMLElement | null = node.parentElement;
      while (cellElement && !cellElement.classList.contains('ag-cell')) {
        cellElement = cellElement.parentElement;
      }
      
      if (cellElement) {
        setupCellEventListeners(cellElement);
      }
    };

    return React.createElement('div', {
      ref: (node: HTMLDivElement | null) => {
        if (node) {
          // Use setTimeout to ensure the element is fully mounted
          setTimeout(() => findAndSetupCellElement(node), 0);
        }
      },
      style: getCommonCellStyle({
        overflow: 'hidden',
        cursor: 'pointer',
        width: '100%',
        height: '100%',
        minHeight: '100%',
        gap: 0, // Gap handled by marginLeft on icon
        minWidth: 0,
        padding: '0',
        margin: '0',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'transparent'
      }),
      onClick: handleTypeClick
    }, [
      // Text container with truncation and tooltip - must be flexible to allow truncation
      React.createElement('div', {
        key: 'text-wrapper',
        style: {
          flex: '1 1 0%', // Take available space, can shrink
          minWidth: 0, // Critical for truncation to work
          maxWidth: service?.restricted ? 'calc(100% - 24px)' : '100%', // Reserve space for icon if present
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          position: 'relative'
        }
      }, React.createElement(TruncatedTextWithTooltip, {
        key: 'text-container',
        text: typeText, // Full original text for tooltip
        className: 'type-column-text',
        style: {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
          minWidth: 0,
          maxWidth: '100%',
          display: 'block',
          flexShrink: 1, // Allow shrinking
          flexGrow: 0, // Don't grow
          flexBasis: 'auto'
        }
      }, highlightedText)), // Highlighted text as children for display
      // Icon - always visible, never truncated, never shrinks
      service?.restricted && React.createElement('div', {
        key: 'icon-wrapper',
        style: {
          flexShrink: 0, // Never shrink
          flexGrow: 0, // Never grow
          flexBasis: '16px', // Fixed width
          width: '16px',
          height: '16px',
          minWidth: '16px', // Ensure minimum width
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: '8px'
        }
      }, React.createElement(ManageProtection, { 
        size: 16,
        className: iconClassName,
        style: { 
          color: '#e06666',
          fill: '#e06666',
          width: '16px',
          height: '16px',
          display: 'block',
          flexShrink: 0
        }
      }))
    ].filter(Boolean));
  };
};

