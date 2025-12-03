import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProcessGroupBox from '../../../src/components/ProcessGroupBox/ProcessGroupBox';

// Mock Material-UI components
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    Menu: ({ children, open, onClose, anchorEl, ...props }: any) => (
      <div 
        data-testid="mui-menu"
        data-open={open}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose?.(e);
          }
        }}
        {...props}
      >
        {open && children}
      </div>
    ),
    MenuItem: ({ children, onClick, disabled, ...props }: any) => (
      <div
        data-testid="mui-menu-item"
        onClick={(e) => {
          if (!disabled) {
            e.stopPropagation();
            onClick?.(e);
          }
        }}
        data-disabled={disabled}
        {...props}
      >
        {children}
      </div>
    ),
    Tabs: ({ children, value, onChange, ...props }: any) => (
      <div data-testid="mui-tabs" data-value={value} {...props}>
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              onClick: () => onChange?.(null, index),
              'data-selected': value === index,
            } as any);
          }
          return child;
        })}
      </div>
    ),
    Tab: ({ label, onClick, ...props }: any) => (
      <button data-testid={`tab-${label.toLowerCase()}`} onClick={onClick} {...props}>
        {label}
      </button>
    ),
    Tooltip: ({ children, title, ...props }: any) => (
      <div data-testid="mui-tooltip" title={title} {...props}>
        {children}
      </div>
    ),
  };
});

// Mock commonApp components
jest.mock('commonApp/Panel', () => {
  return ({ isOpen, onClose, title, children, onReset, onSubmit, submitButtonDisabled, ...props }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="configuration-panel" {...props}>
        <div data-testid="panel-title">{title}</div>
        <button data-testid="panel-close" onClick={onClose}>Close</button>
        <button data-testid="panel-reset" onClick={onReset}>Reset</button>
        <button 
          data-testid="panel-submit" 
          onClick={onSubmit}
          disabled={submitButtonDisabled}
        >
          Apply
        </button>
        <div data-testid="panel-content">{children}</div>
      </div>
    );
  };
});

jest.mock('commonApp/TextField', () => {
  return ({ label, value, onChange, required, ...props }: any) => (
    <div data-testid={`textfield-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <label>{label}{required && ' *'}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-required={required}
        {...props}
      />
    </div>
  );
});

jest.mock('commonApp/SelectField', () => {
  return ({ label, value, onChange, options, required, ...props }: any) => (
    <div data-testid={`selectfield-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <label>{label}{required && ' *'}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-required={required}
        {...props}
      >
        <option value="">Select...</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
});

jest.mock('commonApp/CustomCheckbox', () => {
  return ({ checked, onChange, ...props }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      data-testid="custom-checkbox"
      {...props}
    />
  );
});

jest.mock('commonApp/NotificationAlert', () => {
  return ({ open, ...props }: any) => (open ? <div data-testid="notification-alert" {...props} /> : null);
});

jest.mock('../../../src/api/nifi/nifiApiService', () => ({
  nifiApiService: {
    copyProcessGroup: jest.fn(),
    startProcessGroup: jest.fn(),
    stopProcessGroup: jest.fn(),
    enableProcessGroup: jest.fn(),
    disableProcessGroup: jest.fn(),
    deleteProcessGroup: jest.fn(),
  },
}));

const defaultProps = {
  id: 'test-id',
  name: 'Test Process Group',
  position: { x: 0, y: 0 },
  runningCount: 1,
  stoppedCount: 0,
  invalidCount: 0,
  disabledCount: 0,
  activeRemotePortCount: 0,
  inactiveRemotePortCount: 0,
  queued: '0',
  input: '0',
  read: '0',
  written: '0',
  output: '0',
  upToDateCount: 0,
  locallyModifiedCount: 0,
  staleCount: 0,
  locallyModifiedAndStaleCount: 0,
  syncFailureCount: 0,
  onMouseDown: jest.fn(),
  isSelected: true,
};

describe('ProcessGroupBox - Configuration Slider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Configuration Slider Opening', () => {
    it('should open configuration slider when Configure menu item is clicked', async () => {
      render(<ProcessGroupBox {...defaultProps} />);

      // Open the menu
      const menuButton = screen.getByRole('button', { hidden: true }) || 
        document.querySelector('[data-testid="process-group-menu-button"]') ||
        document.querySelector('svg[width="18"][height="18"]')?.parentElement;
      
      if (menuButton) {
        fireEvent.click(menuButton);
      }

      await waitFor(() => {
        const menu = screen.queryByTestId('mui-menu');
        expect(menu).toBeInTheDocument();
      });

      // Click Configure menu item
      const configureMenuItem = screen.getByText('Configure');
      fireEvent.click(configureMenuItem);

      await waitFor(() => {
        expect(screen.getByTestId('configuration-panel')).toBeInTheDocument();
        expect(screen.getByText('Edit Process Group')).toBeInTheDocument();
      });
    });

    it('should open configuration slider when triggerConfigure prop changes', async () => {
      const { rerender } = render(<ProcessGroupBox {...defaultProps} triggerConfigure={0} />);

      expect(screen.queryByTestId('configuration-panel')).not.toBeInTheDocument();

      // Update triggerConfigure
      rerender(<ProcessGroupBox {...defaultProps} triggerConfigure={1} />);

      await waitFor(() => {
        expect(screen.getByTestId('configuration-panel')).toBeInTheDocument();
      });
    });

    it('should not open slider if triggerConfigure is undefined', () => {
      render(<ProcessGroupBox {...defaultProps} triggerConfigure={undefined} />);

      expect(screen.queryByTestId('configuration-panel')).not.toBeInTheDocument();
    });

    it('should not open slider if triggerConfigure is 0', () => {
      render(<ProcessGroupBox {...defaultProps} triggerConfigure={0} />);

      expect(screen.queryByTestId('configuration-panel')).not.toBeInTheDocument();
    });
  });

  describe('Configuration Slider Tabs', () => {
    beforeEach(async () => {
      render(<ProcessGroupBox {...defaultProps} />);
      
      // Open the configuration slider
      const menuButton = document.querySelector('svg[width="18"][height="18"]')?.parentElement;
      if (menuButton) {
        fireEvent.click(menuButton);
        await waitFor(() => {
          const configureMenuItem = screen.getByText('Configure');
          fireEvent.click(configureMenuItem);
        });
      }
    });

    it('should display Settings tab by default', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('configuration-panel')).toBeInTheDocument();
      });

      const settingsTab = screen.getByTestId('tab-settings');
      expect(settingsTab).toHaveAttribute('data-selected', 'true');
    });

    it('should switch to Comments tab when clicked', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('configuration-panel')).toBeInTheDocument();
      });

      const commentsTab = screen.getByTestId('tab-comments');
      fireEvent.click(commentsTab);

      await waitFor(() => {
        expect(commentsTab).toHaveAttribute('data-selected', 'true');
      });
    });

    it('should display Settings tab content when Settings is selected', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('configuration-panel')).toBeInTheDocument();
      });

      expect(screen.getByTestId('textfield-name')).toBeInTheDocument();
      expect(screen.getByTestId('selectfield-execution-engine')).toBeInTheDocument();
    });

    it('should display Comments tab content when Comments is selected', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('configuration-panel')).toBeInTheDocument();
      });

      const commentsTab = screen.getByTestId('tab-comments');
      fireEvent.click(commentsTab);

      await waitFor(() => {
        const textarea = document.querySelector('textarea');
        expect(textarea).toBeInTheDocument();
      });
    });
  });

  describe('Configuration Form Fields', () => {
    beforeEach(async () => {
      render(<ProcessGroupBox {...defaultProps} />);
      
      // Open the configuration slider
      const menuButton = document.querySelector('svg[width="18"][height="18"]')?.parentElement;
      if (menuButton) {
        fireEvent.click(menuButton);
        await waitFor(() => {
          const configureMenuItem = screen.getByText('Configure');
          fireEvent.click(configureMenuItem);
        });
      }
    });

    it('should display all required form fields', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('textfield-name')).toBeInTheDocument();
        expect(screen.getByTestId('selectfield-parameter-context')).toBeInTheDocument();
        expect(screen.getByTestId('selectfield-execution-engine')).toBeInTheDocument();
        expect(screen.getByTestId('selectfield-process-group-flowfile-concurrency')).toBeInTheDocument();
        expect(screen.getByTestId('textfield-default-flowfile-expiration')).toBeInTheDocument();
        expect(screen.getByTestId('textfield-default-back-pressure-object-threshold')).toBeInTheDocument();
      });
    });

    it('should mark mandatory fields as required', async () => {
      await waitFor(() => {
        const nameField = screen.getByTestId('textfield-name');
        const nameInput = nameField.querySelector('input');
        expect(nameInput).toHaveAttribute('data-required', 'true');

        const executionEngineField = screen.getByTestId('selectfield-execution-engine');
        const executionEngineSelect = executionEngineField.querySelector('select');
        expect(executionEngineSelect).toHaveAttribute('data-required', 'true');
      });
    });

    it('should initialize form fields with default values', async () => {
      await waitFor(() => {
        const nameField = screen.getByTestId('textfield-name');
        const nameInput = nameField.querySelector('input') as HTMLInputElement;
        expect(nameInput.value).toBe('Test Process Group');

        const executionEngineField = screen.getByTestId('selectfield-execution-engine');
        const executionEngineSelect = executionEngineField.querySelector('select') as HTMLSelectElement;
        expect(executionEngineSelect.value).toBe('Inherited');
      });
    });

    it('should update name field when value changes', async () => {
      await waitFor(() => {
        const nameField = screen.getByTestId('textfield-name');
        const nameInput = nameField.querySelector('input') as HTMLInputElement;
        
        fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
        expect(nameInput.value).toBe('Updated Name');
      });
    });

    it('should update execution engine when value changes', async () => {
      await waitFor(() => {
        const executionEngineField = screen.getByTestId('selectfield-execution-engine');
        const executionEngineSelect = executionEngineField.querySelector('select') as HTMLSelectElement;
        
        fireEvent.change(executionEngineSelect, { target: { value: 'Stateless' } });
        expect(executionEngineSelect.value).toBe('Stateless');
      });
    });

    it('should display all Execution Engine options', async () => {
      await waitFor(() => {
        const executionEngineField = screen.getByTestId('selectfield-execution-engine');
        const executionEngineSelect = executionEngineField.querySelector('select') as HTMLSelectElement;
        const options = Array.from(executionEngineSelect.options).map(opt => opt.value);
        
        expect(options).toContain('Inherited');
        expect(options).toContain('Standard');
        expect(options).toContain('Stateless');
      });
    });

    it('should update Apply Recursively checkbox', async () => {
      await waitFor(() => {
        const checkbox = screen.getByTestId('custom-checkbox') as HTMLInputElement;
        expect(checkbox.checked).toBe(false);
        
        fireEvent.change(checkbox, { target: { checked: true } });
        expect(checkbox.checked).toBe(true);
      });
    });
  });

  describe('Configuration Slider Actions', () => {
    beforeEach(async () => {
      render(<ProcessGroupBox {...defaultProps} />);
      
      // Open the configuration slider
      const menuButton = document.querySelector('svg[width="18"][height="18"]')?.parentElement;
      if (menuButton) {
        fireEvent.click(menuButton);
        await waitFor(() => {
          const configureMenuItem = screen.getByText('Configure');
          fireEvent.click(configureMenuItem);
        });
      }
    });

    it('should close slider when close button is clicked', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('configuration-panel')).toBeInTheDocument();
      });

      const closeButton = screen.getByTestId('panel-close');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('configuration-panel')).not.toBeInTheDocument();
      });
    });

    it('should reset form fields when Reset button is clicked', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('configuration-panel')).toBeInTheDocument();
      });

      // Change some values
      const nameField = screen.getByTestId('textfield-name');
      const nameInput = nameField.querySelector('input') as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: 'Changed Name' } });

      // Click Reset
      const resetButton = screen.getByTestId('panel-reset');
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(nameInput.value).toBe('Test Process Group');
      });
    });

    it('should disable Apply button when mandatory fields are empty', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('configuration-panel')).toBeInTheDocument();
      });

      // Clear name field
      const nameField = screen.getByTestId('textfield-name');
      const nameInput = nameField.querySelector('input') as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: '' } });

      await waitFor(() => {
        const applyButton = screen.getByTestId('panel-submit');
        expect(applyButton).toBeDisabled();
      });
    });

    it('should enable Apply button when all mandatory fields are filled', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('configuration-panel')).toBeInTheDocument();
      });

      const applyButton = screen.getByTestId('panel-submit');
      expect(applyButton).not.toBeDisabled();
    });

    it('should call onConfigure callback when slider opens via triggerConfigure', async () => {
      const onConfigureMock = jest.fn();
      const { rerender } = render(
        <ProcessGroupBox {...defaultProps} onConfigure={onConfigureMock} triggerConfigure={0} />
      );

      rerender(
        <ProcessGroupBox {...defaultProps} onConfigure={onConfigureMock} triggerConfigure={1} />
      );

      await waitFor(() => {
        expect(onConfigureMock).toHaveBeenCalled();
      });
    });
  });

  describe('Form Field Validation', () => {
    beforeEach(async () => {
      render(<ProcessGroupBox {...defaultProps} />);
      
      // Open the configuration slider
      const menuButton = document.querySelector('svg[width="18"][height="18"]')?.parentElement;
      if (menuButton) {
        fireEvent.click(menuButton);
        await waitFor(() => {
          const configureMenuItem = screen.getByText('Configure');
          fireEvent.click(configureMenuItem);
        });
      }
    });

    it('should disable Apply when name is empty', async () => {
      await waitFor(() => {
        const nameField = screen.getByTestId('textfield-name');
        const nameInput = nameField.querySelector('input') as HTMLInputElement;
        fireEvent.change(nameInput, { target: { value: '   ' } }); // Only whitespace

        const applyButton = screen.getByTestId('panel-submit');
        expect(applyButton).toBeDisabled();
      });
    });

    it('should disable Apply when execution engine is not selected', async () => {
      await waitFor(() => {
        const executionEngineField = screen.getByTestId('selectfield-execution-engine');
        const executionEngineSelect = executionEngineField.querySelector('select') as HTMLSelectElement;
        fireEvent.change(executionEngineSelect, { target: { value: '' } });

        const applyButton = screen.getByTestId('panel-submit');
        expect(applyButton).toBeDisabled();
      });
    });

    it('should disable Apply when flow file concurrency is not selected', async () => {
      await waitFor(() => {
        const concurrencyField = screen.getByTestId('selectfield-process-group-flowfile-concurrency');
        const concurrencySelect = concurrencyField.querySelector('select') as HTMLSelectElement;
        fireEvent.change(concurrencySelect, { target: { value: '' } });

        const applyButton = screen.getByTestId('panel-submit');
        expect(applyButton).toBeDisabled();
      });
    });
  });

  describe('Configuration Slider State Management', () => {
    it('should reset form when slider closes', async () => {
      render(<ProcessGroupBox {...defaultProps} />);
      
      // Open slider and change values
      const menuButton = document.querySelector('svg[width="18"][height="18"]')?.parentElement;
      if (menuButton) {
        fireEvent.click(menuButton);
        await waitFor(() => {
          const configureMenuItem = screen.getByText('Configure');
          fireEvent.click(configureMenuItem);
        });

        await waitFor(() => {
          const nameField = screen.getByTestId('textfield-name');
          const nameInput = nameField.querySelector('input') as HTMLInputElement;
          fireEvent.change(nameInput, { target: { value: 'Changed' } });

          // Close slider
          const closeButton = screen.getByTestId('panel-close');
          fireEvent.click(closeButton);
        });

        // Reopen slider
        await waitFor(() => {
          fireEvent.click(menuButton);
          const configureMenuItem = screen.getByText('Configure');
          fireEvent.click(configureMenuItem);
        });

        await waitFor(() => {
          const nameField = screen.getByTestId('textfield-name');
          const nameInput = nameField.querySelector('input') as HTMLInputElement;
          expect(nameInput.value).toBe('Test Process Group');
        });
      }
    });

    it('should update config name when process group name prop changes', async () => {
      const { rerender } = render(<ProcessGroupBox {...defaultProps} />);
      
      // Open slider
      const menuButton = document.querySelector('svg[width="18"][height="18"]')?.parentElement;
      if (menuButton) {
        fireEvent.click(menuButton);
        await waitFor(() => {
          const configureMenuItem = screen.getByText('Configure');
          fireEvent.click(configureMenuItem);
        });

        // Update name prop
        rerender(<ProcessGroupBox {...defaultProps} name="Updated Name" />);

        await waitFor(() => {
          const nameField = screen.getByTestId('textfield-name');
          const nameInput = nameField.querySelector('input') as HTMLInputElement;
          expect(nameInput.value).toBe('Updated Name');
        });
      }
    });
  });
});

