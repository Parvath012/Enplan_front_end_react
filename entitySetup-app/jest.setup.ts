import '@testing-library/jest-dom';
import React from 'react';

// Add TextEncoder
global.TextEncoder = require('util').TextEncoder;

// Mock import.meta for Jest environment
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      url: 'file:///mock/url'
    }
  },
  writable: true
});

// Mock MessageChannel for server-side rendering tests
class MessageChannelMock {
  port1: any;
  port2: any;

  constructor() {
    this.port1 = {
      postMessage: jest.fn(),
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
    this.port2 = {
      postMessage: jest.fn(),
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
  }
}

global.MessageChannel = MessageChannelMock;

// Mock React.lazy() for test environment to bypass dynamic imports
const originalLazy = React.lazy;
React.lazy = jest.fn((importFn) => {
  // Always return a valid component to prevent "Element type is invalid" errors
  const mockComponent = React.forwardRef<HTMLDivElement>((props: any, ref) => {
    return React.createElement('div', {
      ref,
      'data-testid': 'mocked-lazy-component',
      ...props
    }, 'Mocked Component');
  });
  
  // Return the mock component immediately for all lazy imports
  return mockComponent;
});

// Alternative approach: Mock the specific components that are causing issues
jest.mock('commonApp/TextField', () => {
  return React.forwardRef<HTMLInputElement>((props: any, ref) => {
    const { label, value, onChange, disabled, ...restProps } = props;
    return React.createElement('input', {
      ref,
      'data-testid': 'text-field',
      value: value || '',
      onChange: onChange,
      disabled: disabled,
      placeholder: label,
      ...restProps
    });
  });
});

jest.mock('commonApp/SelectField', () => {
  return React.forwardRef<HTMLSelectElement>((props: any, ref) => {
    const { label, value, onChange, options = [], disabled, ...restProps } = props;
    return React.createElement('select', {
      ref,
      'data-testid': 'select-field',
      value: value || '',
      onChange: onChange,
      disabled: disabled,
      ...restProps
    },
      React.createElement('option', { value: '' }, label || 'Select...'),
      options.map((option: any) => 
        React.createElement('option', { key: option.value, value: option.value }, option.label)
      )
    );
  });
});

jest.mock('commonApp/ReadOnlyField', () => {
  return React.forwardRef<HTMLDivElement>((props: any, ref) => {
    const { label, value, ...restProps } = props;
    return React.createElement('div', {
      ref,
      'data-testid': 'read-only-field',
      ...restProps
    },
      React.createElement('label', {}, label),
      React.createElement('span', {}, value)
    );
  });
});

jest.mock('commonApp/CustomSlider', () => {
  return React.forwardRef<HTMLDivElement>((props: any, ref) => {
    const { value, onChange, min, max, disabled, ...restProps } = props;
    return React.createElement('div', {
      ref,
      'data-testid': 'custom-slider',
      ...restProps
    },
      React.createElement('input', {
        type: 'range',
        min: min || 0,
        max: max || 100,
        value: value || 0,
        onChange: onChange,
        disabled: disabled
      })
    );
  });
});

jest.mock('commonApp/CustomTooltip', () => {
  return React.forwardRef<HTMLDivElement>((props: any, ref) => {
    const { title, children, ...restProps } = props;
    return React.createElement('div', {
      ref,
      'data-testid': 'custom-tooltip',
      title: title,
      onClick: props.onClick,
      ...restProps
    }, children);
  });
});

// Reset the lazy mock to use the original approach
React.lazy = jest.fn((importFn) => {
  // Check if this is the ListItem component
  if (importFn.toString().includes('ListItem')) {
    return React.forwardRef<HTMLDivElement>((props: any, ref) => {
      const { item, idField, displayField, selectedItems, isEditMode, isPrePopulated, defaultCurrency, isDefault, onToggle, ...restProps } = props;
      return React.createElement('div', { 
        ref, 
        'data-testid': 'list-item',
        'data-id': item?.[idField],
        'data-index': props.index,
        'data-total': props.totalItems,
        'data-selected': selectedItems?.includes(item?.[idField]),
        'data-edit-mode': isEditMode,
        'data-pre-populated': isPrePopulated,
        'data-default-currency': defaultCurrency?.includes(item?.[idField]) || false,
        'data-is-default': isDefault === item?.[idField],
        onClick: () => onToggle?.(item?.[idField]),
        ...restProps 
      }, item?.[displayField]);
    });
  }
  
  // Check if this is the SearchField component
  if (importFn.toString().includes('SearchField')) {
    return React.forwardRef<HTMLInputElement>((props: any, ref) => {
      const { value, onChange, placeholder, disabled, customStyle, ...restProps } = props;
      return React.createElement('input', {
        ref,
        'data-testid': 'search-field',
        value: value || '',
        onChange: (e: any) => onChange?.(e.target.value),
        placeholder: placeholder,
        disabled: disabled,
        style: customStyle,
        ...restProps
      });
    });
  }
  
  // Check if this is the TextField component
  if (importFn.toString().includes('TextField')) {
    return React.forwardRef<HTMLInputElement>((props: any, ref) => {
      const { label, value, onChange, disabled, ...restProps } = props;
      return React.createElement('input', {
        ref,
        'data-testid': 'text-field',
        value: value || '',
        onChange: onChange,
        disabled: disabled,
        placeholder: label,
        ...restProps
      });
    });
  }
  
  // Check if this is the SelectField component
  if (importFn.toString().includes('SelectField')) {
    return React.forwardRef<HTMLSelectElement>((props: any, ref) => {
      const { label, value, onChange, options = [], disabled, ...restProps } = props;
      return React.createElement('select', {
        ref,
        'data-testid': 'select-field',
        value: value || '',
        onChange: onChange,
        disabled: disabled,
        ...restProps
      },
        React.createElement('option', { value: '' }, label || 'Select...'),
        options.map((option: any) => 
          React.createElement('option', { key: option.value, value: option.value }, option.label)
        )
      );
    });
  }
  
  // Check if this is the ReadOnlyField component
  if (importFn.toString().includes('ReadOnlyField')) {
    return React.forwardRef<HTMLDivElement>((props: any, ref) => {
      const { label, value, ...restProps } = props;
      return React.createElement('div', {
        ref,
        'data-testid': 'read-only-field',
        ...restProps
      },
        React.createElement('label', {}, label),
        React.createElement('span', {}, value)
      );
    });
  }
  
  // Check if this is the CustomSlider component
  if (importFn.toString().includes('CustomSlider')) {
    return React.forwardRef<HTMLDivElement>((props: any, ref) => {
      const { value, onChange, min, max, disabled, ...restProps } = props;
      return React.createElement('div', {
        ref,
        'data-testid': 'custom-slider',
        ...restProps
      },
        React.createElement('input', {
          type: 'range',
          min: min || 0,
          max: max || 100,
          value: value || 0,
          onChange: onChange,
          disabled: disabled
        })
      );
    });
  }
  
  // Check if this is the CustomTooltip component
  if (importFn.toString().includes('CustomTooltip')) {
    return React.forwardRef<HTMLDivElement>((props: any, ref) => {
      const { title, children, ...restProps } = props;
      return React.createElement('div', {
        ref,
        'data-testid': 'custom-tooltip',
        title: title,
        onClick: props.onClick,
        ...restProps
      }, children);
    });
  }
  
  // Check if this is the AgGridShell component
  if (importFn.toString().includes('AgGridShell')) {
    return React.forwardRef<HTMLDivElement>((props: any, ref) => {
      const { rowData, columnDefs, defaultColDef, rowHeight, headerHeight, gridOptions, onSortChanged, getRowStyle, isDraggable, ...restProps } = props;
      return React.createElement('div', { 
        ref, 
        'data-testid': 'ag-grid-shell',
        'data-row-data': JSON.stringify(rowData),
        'data-column-defs': JSON.stringify(columnDefs),
        'data-default-col-def': JSON.stringify(defaultColDef),
        'data-row-height': rowHeight,
        'data-header-height': headerHeight,
        'data-grid-options': JSON.stringify(gridOptions),
        'data-is-draggable': isDraggable,
        ...restProps 
      }, 
        React.createElement('div', { 'data-testid': 'grid-content' },
          rowData?.map((row: any, index: number) => 
            React.createElement('div', { 
              key: index, 
              'data-testid': 'grid-row', 
              'data-row-index': index 
            },
              React.createElement('span', { 'data-testid': 'currency-name' }, row.currencyName),
              React.createElement('span', { 'data-testid': 'currency-code' }, row.currencyCode),
              React.createElement('span', { 'data-testid': 'currency-display' }, row.currency),
              React.createElement('span', { 'data-testid': 'is-pre-populated' }, row.isPrePopulated ? 'true' : 'false')
            )
          )
        )
      );
    });
  }
  
  // Check if this is the CountryActionCellRenderer component
  if (importFn.toString().includes('CountryActionCellRenderer')) {
    return React.forwardRef<HTMLButtonElement>((props: any, ref) => {
      const { data, onToggle, isEditMode = true } = props;
      const handleClick = () => {
        if (onToggle && data) {
          onToggle(data);
        }
      };
      const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      };
      return React.createElement('button', { 
        ref, 
        'data-testid': 'country-action-button',
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        disabled: !isEditMode,
        title: 'Toggle country',
        'aria-label': 'Toggle country',
        ...props 
      }, data || 'Toggle');
    });
  }
  
  // Check if this is the StatusMessage component
        if (importFn.toString().includes('StatusMessage')) {
          return React.forwardRef<HTMLDivElement>((props: any, ref) => {
            const { message, type } = props;
            return React.createElement('div', {
              ref,
              className: 'MuiBox-root',
              'data-testid': 'status-message',
              ...props
            },
              React.createElement('p', {
                className: 'MuiTypography-root',
                'data-testid': 'status-message-content'
              }, message)
            );
          });
        }
  
  // Check if this is the FormHeader component
  if (importFn.toString().includes('FormHeader')) {
    return React.forwardRef<HTMLDivElement>((props: any, ref) => {
      const { 
        title, 
        children, 
        isEditMode,
        isNextEnabled,
        isSaving,
        tabValue,
        isDataSaved,
        isDataModified,
        isRollupEntity,
        onBack,
        onSave,
        onReset,
        onEdit,
        onNext,
        onFinish,
        nextButtonText,
        showBackButton,
        showSaveButton,
        showResetButton,
        showEditButton,
        showNextButton,
        showCancelButton,
        isNextDisabled,
        isFormModified,
        isSaveDisabled,
        isSaveLoading,
        ...restProps 
      } = props;
      
      return React.createElement('div', {
        ref,
        'data-testid': 'form-header',
        ...restProps
      },
        title && React.createElement('h2', {}, title),
        
        // Back Button
        showBackButton && onBack && React.createElement('button', {
          'data-testid': 'back-button',
          onClick: onBack
        }, 'Back'),
        
        // Save Button
        showSaveButton && onSave && React.createElement('button', {
          'data-testid': 'save-button',
          onClick: onSave,
          disabled: isSaveDisabled || isSaveLoading
        }, isSaveLoading ? 'Loading' : 'Save'),
        
        // Reset Button
        showResetButton && onReset && React.createElement('button', {
          'data-testid': 'reset-button',
          onClick: onReset
        }, 'Reset'),
        
        // Edit Button
        showEditButton && onEdit && React.createElement('button', {
          'data-testid': 'edit-button',
          onClick: onEdit
        }, 'Edit'),
        
        // Next/Finish Button
        showNextButton && onNext && React.createElement('button', {
          'data-testid': 'next-button',
          onClick: onNext,
          disabled: isNextDisabled
        }, nextButtonText || 'Next'),
        
        children
      );
    });
  }
  
  // Return a component that matches the expected role for ToggleSwitch
  return React.forwardRef<HTMLDivElement>((props, ref) => 
    React.createElement('div', { 
      ref, 
      'data-testid': 'test-lazy-component',
      role: 'switch',
      'aria-checked': 'false',
      tabIndex: 0,
      ...props 
    }, 'Test Lazy Component')
  );
});

// Mock React.Suspense to render children immediately in tests
const originalSuspense = React.Suspense;
React.Suspense = ({ children, fallback }) => {
  // In test environment, render children directly without Suspense
  return React.createElement(React.Fragment, {}, children);
};

// Mock globalHistory for React Router
Object.defineProperty(window, 'history', {
  value: {
    replaceState: jest.fn(),
    pushState: jest.fn(),
    go: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  },
  writable: true,
});

// Mock globalHistory for React Router
global.history = {
  replaceState: jest.fn(),
  pushState: jest.fn(),
  go: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
};

// Mock globalHistory for React Router (the one that's actually used)
global.globalHistory = {
  replaceState: jest.fn(),
  pushState: jest.fn(),
  go: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
};