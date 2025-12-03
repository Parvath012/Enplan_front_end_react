import { useEffect, RefObject } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { normalizeId, hasValidDescription } from './browserUtils';

interface UseRowStylingEffectParams<T extends { id: string }> {
  selectedItem: T | null;
  gridRef: RefObject<AgGridReact>;
  gridContainerRef: RefObject<HTMLDivElement>;
  iconClassName: string; // e.g., 'restricted-processor-icon' or 'restricted-service-icon'
  rowSelectedClass: string; // e.g., 'processor-row-selected' or 'controller-service-row-selected'
  checkDescription?: boolean; // Whether to check if item has valid description
}

/**
 * Hook to handle row styling effect with MutationObserver
 * This is a complex effect that ensures selected rows are highlighted and styles persist
 */
export const useRowStylingEffect = <T extends { id: string }>({
  selectedItem,
  gridRef,
  gridContainerRef,
  iconClassName,
  rowSelectedClass,
  checkDescription = false,
}: UseRowStylingEffectParams<T>) => {
  useEffect(() => {
    if (!gridRef.current?.api || !gridContainerRef.current) return;
    
    const selectedId = selectedItem ? normalizeId(selectedItem.id) : null;
    
    // Determine if we should highlight
    let shouldHighlight: boolean;
    if (checkDescription) {
      shouldHighlight = selectedId !== null && selectedId !== '' && hasValidDescription(selectedItem);
    } else {
      shouldHighlight = selectedId !== null && selectedId !== '';
    }
    
    // Shared helper function to check if element is a restricted icon
    const isRestrictedIconElement = (el: HTMLElement): boolean => {
      return el.classList.contains(iconClassName) ||
             el.closest(`.${iconClassName}`) !== null ||
             el.closest(`[class*="${iconClassName}"]`) !== null;
    };

    // Helper function to check if element is icon SVG
    const isIconSVGElement = (el: HTMLElement): boolean => {
      return el.tagName === 'SVG' && 
             (el.closest(`.${iconClassName}`) !== null ||
              (el.parentElement?.classList.contains(iconClassName) ?? false));
    };

    // Helper function to apply styles to nested elements
    const applyNestedElementStyles = (nestedEl: HTMLElement) => {
      const isTextElement = nestedEl.classList.contains('type-column-text') || 
                           nestedEl.classList.contains('ag-cell-value') ||
                           nestedEl.tagName === 'SPAN';
      
      const isRestrictedIcon = isRestrictedIconElement(nestedEl);
      const isIconSVG = isIconSVGElement(nestedEl);
      const isIconPath = nestedEl.tagName === 'PATH' && 
                        nestedEl.closest(`.${iconClassName}`) !== null;
      
      if (!isTextElement) {
        nestedEl.style.setProperty('background-color', '#87CEFA', 'important');
      }
      
      // NEVER change color/fill for restricted icon elements - preserve original color
      if (!isRestrictedIcon && !isIconSVG && !isIconPath) {
        nestedEl.style.setProperty('color', '#000000', 'important');
      } else {
        // Explicitly preserve icon color - remove any color overrides
        nestedEl.style.removeProperty('color');
        if (nestedEl.tagName === 'SVG' || nestedEl.tagName === 'PATH') {
          nestedEl.style.removeProperty('fill');
        }
      }
    };

    // Helper function to apply styles to all nested elements in a cell
    const applyCellNestedStyles = (cellEl: HTMLElement) => {
      const nestedElements = cellEl.querySelectorAll('*');
      nestedElements.forEach((nested: Element) => {
        applyNestedElementStyles(nested as HTMLElement);
      });
    };

    // Helper function to apply styles to all cells
    const applyCellStyles = (rowElement: HTMLElement) => {
      const cells = rowElement.querySelectorAll('.ag-cell, .ag-cell-custom, [role="gridcell"]');
      cells.forEach((cell: Element) => {
        const cellEl = cell as HTMLElement;
        cellEl.classList.remove('ag-cell-hover');
        cellEl.style.setProperty('background-color', '#87CEFA', 'important');
        cellEl.style.setProperty('color', '#000000', 'important');
        applyCellNestedStyles(cellEl);
      });
    };

    // Function to apply selection styling - called whenever needed
    const applySelectionStyles = (rowElement: HTMLElement) => {
      if (!rowElement) return;
      
      // Remove hover class to prevent conflicts
      rowElement.classList.remove('ag-row-hover');
      rowElement.classList.add(rowSelectedClass);
      rowElement.setAttribute('aria-selected', 'true');
      rowElement.setAttribute('tabIndex', '0');
      
      // Apply background color with !important - highest priority
      rowElement.style.setProperty('background-color', '#87CEFA', 'important');
      rowElement.style.setProperty('width', '100%', 'important');
      
      // Apply to all cells
      applyCellStyles(rowElement);
    };
    
    // Helper function to remove nested element styles
    const removeNestedElementStyles = (nestedEl: HTMLElement) => {
      const isRestrictedIcon = isRestrictedIconElement(nestedEl);
      const isIconSVG = nestedEl.tagName === 'SVG' && 
                       nestedEl.closest(`.${iconClassName}`) !== null;
      const isIconPath = nestedEl.tagName === 'PATH' && 
                        nestedEl.closest(`.${iconClassName}`) !== null;
      
      // Only remove styles if it's NOT the icon
      if (!isRestrictedIcon && !isIconSVG && !isIconPath) {
        nestedEl.style.removeProperty('background-color');
        nestedEl.style.removeProperty('color');
        if (nestedEl.tagName === 'SVG' || nestedEl.tagName === 'PATH') {
          nestedEl.style.removeProperty('fill');
        }
      }
    };

    // Helper function to remove styles from all nested elements in a cell
    const removeCellNestedStyles = (cellEl: HTMLElement) => {
      const nestedElements = cellEl.querySelectorAll('*');
      nestedElements.forEach((nested: Element) => {
        removeNestedElementStyles(nested as HTMLElement);
      });
    };

    // Helper function to remove styles from all cells
    const removeCellStyles = (rowElement: HTMLElement) => {
      const cells = rowElement.querySelectorAll('.ag-cell, .ag-cell-custom, [role="gridcell"]');
      cells.forEach((cell: Element) => {
        const cellEl = cell as HTMLElement;
        cellEl.style.removeProperty('background-color');
        cellEl.style.removeProperty('color');
        removeCellNestedStyles(cellEl);
      });
    };

    // Function to remove selection styling
    const removeSelectionStyles = (rowElement: HTMLElement) => {
      if (!rowElement) return;
      
      // Only remove if not hovered
      if (!rowElement.classList.contains('ag-row-hover')) {
        rowElement.classList.remove(rowSelectedClass);
        rowElement.setAttribute('aria-selected', 'false');
        rowElement.setAttribute('tabIndex', '-1');
        rowElement.style.removeProperty('background-color');
        rowElement.style.removeProperty('width');
        removeCellStyles(rowElement);
      }
    };
    
    const updateRowStyling = (rowElement: Element, rowDataId: string) => {
      const serviceId = normalizeId(rowDataId);
      // Highlight if ID matches
      const isSelected = selectedId !== null && 
                        selectedId !== '' && 
                        selectedId === serviceId &&
                        shouldHighlight;
      const rowEl = rowElement as HTMLElement;
      
      rowElement.setAttribute('role', 'row');
      
      if (isSelected) {
        applySelectionStyles(rowEl);
      } else {
        removeSelectionStyles(rowEl);
      }
    };

    const processRowElement = (rowElement: Element) => {
      let rowDataId: string | null = null;
      
      // Method 1: Try to get normalized ID from data-row-id-normalized attribute (most reliable)
      const normalizedIdAttr = (rowElement as HTMLElement).getAttribute('data-row-id-normalized');
      if (normalizedIdAttr) {
        rowDataId = normalizedIdAttr;
      }
      
      // Method 2: Try to get ID from data-row-id attribute and normalize it
      if (!rowDataId) {
        const rowIdAttr = (rowElement as HTMLElement).getAttribute('data-row-id');
        if (rowIdAttr) {
          rowDataId = normalizeId(rowIdAttr);
        }
      }
      
      // Method 3: Try to match by rowElement reference (most reliable for data)
      if (!rowDataId) {
        gridRef.current?.api?.forEachNode((node: any) => {
          if (node.rowElement === rowElement && node.data?.id) {
            rowDataId = normalizeId(node.data.id);
          }
        });
      }
      
      // Method 4: Try to get by row index as fallback
      if (!rowDataId && gridContainerRef.current) {
        const allRows = gridContainerRef.current.querySelectorAll('.ag-row');
        const rowIndex = Array.from(allRows).indexOf(rowElement);
        if (rowIndex >= 0) {
          const displayedRow = gridRef.current?.api?.getDisplayedRowAtIndex(rowIndex);
          if (displayedRow?.data?.id) {
            rowDataId = normalizeId(displayedRow.data.id);
          }
        }
      }
      
      if (rowDataId) {
        updateRowStyling(rowElement, rowDataId);
      }
    };
    
    const updateAllRows = () => {
      if (!gridRef.current?.api || !gridContainerRef.current) return;
      
      const gridEl = gridContainerRef.current;
      const allRows = gridEl.querySelectorAll('.ag-row');
      allRows.forEach((rowElement) => {
        processRowElement(rowElement);
      });
    };
    
    // Immediate update - apply highlighting right away
    updateAllRows();
    
    // Force immediate application of styles for selected row with multiple attempts
    if (shouldHighlight) {
      // Apply immediately
      const applyHighlighting = () => {
        if (gridRef.current?.api) {
          gridRef.current.api.forEachNode((node: any) => {
            if (node.data?.id && normalizeId(node.data.id) === selectedId) {
              const rowElement = node.rowElement;
              if (rowElement) {
                applySelectionStyles(rowElement as HTMLElement);
              }
            }
          });
        }
      };
      
      // Apply immediately - multiple times to ensure it sticks
      requestAnimationFrame(() => {
        applyHighlighting();
        setTimeout(applyHighlighting, 0);
        setTimeout(applyHighlighting, 50);
        setTimeout(applyHighlighting, 100);
        setTimeout(applyHighlighting, 200);
      });
    } else if (gridRef.current?.api) {
      // If no highlight, remove highlighting from all rows
      gridRef.current.api.forEachNode((node: any) => {
        if (node.rowElement) {
          removeSelectionStyles(node.rowElement as HTMLElement);
        }
      });
    }
    
    // Helper function to get normalized row ID from element
    const getNormalizedRowId = (element: HTMLElement): string | null => {
      const normalizedAttr = element.getAttribute('data-row-id-normalized');
      if (normalizedAttr) {
        return normalizedAttr;
      }
      const rowIdAttr = element.getAttribute('data-row-id');
      return rowIdAttr ? normalizeId(rowIdAttr) : null;
    };

    // Helper function to check if row needs update
    const shouldUpdateRow = (target: HTMLElement): boolean => {
      if (!target.classList.contains('ag-row')) {
        return false;
      }
      const normalizedRowId = getNormalizedRowId(target);
      const isHighlightEnabled = Boolean(shouldHighlight);
      const isMatchingRow = normalizedRowId !== null && 
                           selectedId !== null && 
                           normalizedRowId === selectedId;
      return Boolean(isMatchingRow && isHighlightEnabled);
    };

    // Use MutationObserver to watch for style changes and reapply selection
    const observer = new MutationObserver((mutations) => {
      let needsUpdate = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const target = mutation.target as HTMLElement;
          // If a selected row's style was changed, reapply selection
          if (target.classList.contains(rowSelectedClass) || 
              target.getAttribute('aria-selected') === 'true') {
            needsUpdate = true;
          }
          // Check if it's a row element
          if (shouldUpdateRow(target)) {
            needsUpdate = true;
          }
        }
        // Watch for class changes that might remove selection
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target as HTMLElement;
          if (shouldUpdateRow(target)) {
            // If selected row lost its class, reapply
            if (!target.classList.contains(rowSelectedClass)) {
              needsUpdate = true;
            }
          }
        }
      });
      
      if (needsUpdate) {
        // Use requestAnimationFrame to batch updates
        requestAnimationFrame(() => {
          updateAllRows();
        });
      }
    });
    
    // Observe the grid container for style/class changes
    if (gridContainerRef.current) {
      observer.observe(gridContainerRef.current, {
        attributes: true,
        attributeFilter: ['style', 'class'],
        subtree: true,
        childList: false
      });
    }
    
    // Periodic check to ensure selection persists (backup mechanism)
    const intervalId = setInterval(() => {
      if (shouldHighlight && gridRef.current?.api) {
        gridRef.current.api.forEachNode((node: any) => {
          if (node.data?.id && normalizeId(node.data.id) === selectedId) {
            const rowElement = node.rowElement;
            if (rowElement) {
              const rowEl = rowElement as HTMLElement;
              // Check if selection styles are still applied
              const bgColor = window.getComputedStyle(rowEl).backgroundColor;
              // Check for sky blue in various formats
              const isSkyBlue = bgColor === 'rgb(135, 206, 250)' || 
                              bgColor === 'rgba(135, 206, 250, 1)' ||
                              bgColor === '#87CEFA' ||
                              bgColor.toLowerCase() === '#87cefa';
              
              // Ensure row is highlighted with light sky blue
              if (!isSkyBlue || !rowEl.classList.contains(rowSelectedClass)) {
                applySelectionStyles(rowEl);
              }
            }
          }
        });
      } else if (!shouldHighlight && gridRef.current?.api) {
        // Remove highlighting from all rows if nothing is selected
        gridRef.current.api.forEachNode((node: any) => {
          if (node.rowElement) {
            removeSelectionStyles(node.rowElement as HTMLElement);
          }
        });
      }
    }, 150); // Check every 150ms for more responsive updates
    
    // Cleanup
    return () => {
      observer.disconnect();
      clearInterval(intervalId);
    };
  }, [selectedItem, gridRef, gridContainerRef, iconClassName, rowSelectedClass, checkDescription]);
};

