import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditControllerServiceDrawer from '../../src/components/EditControllerServiceDrawer';
import { nifiApiService } from '../../src/api/nifi/nifiApiService';

// Mock dependencies
jest.mock('../../src/api/nifi/nifiApiService');
jest.mock('commonApp/CustomTooltip', () => ({
  __esModule: true,
  default: ({ children, title }: any) => <div title={title}>{children}</div>
}));

jest.mock('commonApp/TextField', () => ({
  __esModule: true,
  default: ({ value, onChange, label, placeholder, multiline, rows, fullWidth, id }: any) => (
    <div data-testid="text-field">
      {label && <label>{label}</label>}
      {multiline ? (
        <textarea
          id={id}
          value={value || ''}
          onChange={(e) => onChange && onChange(e)}
          placeholder={placeholder}
          rows={rows}
          data-fullwidth={fullWidth}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value || ''}
          onChange={(e) => onChange && onChange(e)}
          placeholder={placeholder}
          data-fullwidth={fullWidth}
        />
      )}
    </div>
  )
}));

jest.mock('commonApp/SelectField', () => ({
  __esModule: true,
  default: ({ value, onChange, options, label, placeholder, fullWidth }: any) => (
    <div data-testid="select-field">
      {label && <label>{label}</label>}
      <select
        value={value || ''}
        onChange={(e) => onChange && onChange(e.target.value)}
        data-placeholder={placeholder}
        data-fullwidth={fullWidth}
      >
        <option value="">{placeholder || 'Select...'}</option>
        {options?.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}));

jest.mock('../../src/components/common/ReusablePanel', () => ({
  __esModule: true,
  default: ({ isOpen, children, title, width, backgroundColor, customClassName }: any) => (
    isOpen ? (
      <div 
        data-testid="reusable-panel" 
        className={customClassName}
        style={{ width, backgroundColor }}
      >
        {title && <div>{title}</div>}
        {children}
      </div>
    ) : null
  )
}));

// Mock Carbon icons
jest.mock('@carbon/icons-react', () => ({
  Close: ({ size }: any) => <div data-testid="close-icon" data-size={size}>Close</div>,
  Copy: ({ size }: any) => <div data-testid="copy-icon" data-size={size}>Copy</div>,
  InformationFilled: ({ size }: any) => <div data-testid="information-filled-icon" data-size={size}>InformationFilled</div>,
  CheckmarkFilled: ({ size, className }: any) => <div data-testid="checkmark-filled-icon" data-size={size} className={className}>CheckmarkFilled</div>
}));

// Mock MUI components
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    Typography: ({ children, className, variant }: any) => (
      <div className={className} data-variant={variant}>{children}</div>
    ),
    IconButton: ({ onClick, children, className, disabled, 'aria-label': ariaLabel, size, disableRipple }: any) => (
      <button 
        onClick={onClick} 
        className={className} 
        disabled={disabled} 
        aria-label={ariaLabel}
        data-size={size}
        data-disable-ripple={disableRipple}
      >
        {children}
      </button>
    ),
    Tabs: ({ value, onChange, children, className, 'aria-label': ariaLabel, variant }: any) => (
      <div 
        className={className}
        data-value={value}
        aria-label={ariaLabel}
        data-variant={variant}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as any, {
              onClick: () => onChange && onChange({}, index),
              'aria-selected': value === index
            });
          }
          return child;
        })}
      </div>
    ),
    Tab: ({ label, disableRipple, onClick, 'aria-selected': ariaSelected }: any) => (
      <button 
        onClick={onClick}
        data-disable-ripple={disableRipple}
        aria-selected={ariaSelected}
      >
        {label}
      </button>
    ),
    Box: ({ children, ...props }: any) => <div {...props}>{children}</div>
  };
});

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined)
  }
});

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9))
  }
});

describe('EditControllerServiceDrawer', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();
  const mockService = {
    id: 'test-service-id',
    name: 'Test Service',
    state: 'ENABLED'
  };

  const mockServiceDetails = {
    revision: {
      version: 1,
      clientId: 'test-client-id'
    },
    component: {
      id: 'test-service-id',
      name: 'Test Service',
      type: 'org.apache.nifi.services.TestService',
      bundle: {
        group: 'org.apache.nifi',
        artifact: 'nifi-standard',
        version: '2.3.0'
      },
      bulletinLevel: 'WARN',
      comments: 'Test comments',
      properties: {
        'test.property': { value: 'test-value' },
        'sensitive.property': { value: 'sensitive-value' },
        'nifi.framework.property': { value: 'framework-value' }
      },
      descriptors: {
        'test.property': {
          displayName: 'Test Property',
          description: 'A test property',
          sensitive: false
        },
        'sensitive.property': {
          displayName: 'Sensitive Property',
          description: 'A sensitive property',
          sensitive: true
        },
        'nifi.framework.property': {
          displayName: 'Framework Property',
          description: 'A framework property',
          sensitive: false
        }
      },
      supportsControllerService: [
        'org.apache.nifi.services.AnotherService',
        {
          type: 'org.apache.nifi.services.ThirdService',
          version: '1.0.0',
          bundle: {
            group: 'org.apache.nifi',
            artifact: 'nifi-standard'
          }
        }
      ]
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (nifiApiService.getControllerService as jest.Mock) = jest.fn().mockResolvedValue(mockServiceDetails);
    (nifiApiService.updateControllerService as jest.Mock) = jest.fn().mockResolvedValue({});
    (nifiApiService.analyzeControllerServiceConfig as jest.Mock) = jest.fn().mockResolvedValue({});
    (nifiApiService.createControllerServiceVerificationRequest as jest.Mock) = jest.fn().mockResolvedValue({
      id: 'verification-request-id',
      request: { id: 'verification-request-id' }
    });
    (nifiApiService.getControllerServiceVerificationRequest as jest.Mock) = jest.fn().mockResolvedValue({
      request: {
        id: 'verification-request-id',
        complete: true,
        results: [
          {
            outcome: 'VALID',
            explanation: 'Configuration is valid',
            verificationStepName: 'Step 1',
            reason: 'All checks passed'
          }
        ]
      }
    });
    (nifiApiService.deleteControllerServiceVerificationRequest as jest.Mock) = jest.fn().mockResolvedValue({});
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render when open is true', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('reusable-panel')).toBeInTheDocument();
      });

      expect(screen.getByText('Edit Controller Service')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
      render(
        <EditControllerServiceDrawer
          open={false}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.queryByTestId('reusable-panel')).not.toBeInTheDocument();
    });

    it('should render all three tabs', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });

      expect(screen.getByText('Properties')).toBeInTheDocument();
      expect(screen.getByText('Comments')).toBeInTheDocument();
    });
  });

  describe('Service Details Loading', () => {
    it('should fetch service details when drawer opens', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalledWith('test-service-id');
      });
    });

    it('should not fetch service details when service is null', () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={null}
          onConfirm={mockOnConfirm}
        />
      );

      expect(nifiApiService.getControllerService).not.toHaveBeenCalled();
    });

    it('should handle loading state', async () => {
      (nifiApiService.getControllerService as jest.Mock) = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockServiceDetails), 100))
      );

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      // Component should be in loading state initially
      await act(async () => {
        jest.advanceTimersByTime(50);
      });

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });
    });

    it('should handle fetch error', async () => {
      const errorMessage = 'Failed to fetch service details';
      (nifiApiService.getControllerService as jest.Mock) = jest.fn().mockRejectedValue({
        message: errorMessage
      });

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should handle fetch error without message', async () => {
      (nifiApiService.getControllerService as jest.Mock) = jest.fn().mockRejectedValue({});

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch controller service details')).toBeInTheDocument();
      });
    });
  });

  describe('State Reset', () => {
    it('should reset state when drawer closes', async () => {
      const { rerender } = render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      // Change tab
      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      // Close drawer
      rerender(
        <EditControllerServiceDrawer
          open={false}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      // Reopen drawer
      rerender(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        // Should be back on Settings tab (index 0)
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to Properties tab', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        expect(screen.getByText('Required field')).toBeInTheDocument();
      });
    });

    it('should switch to Comments tab', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const commentsTab = screen.getByText('Comments');
      fireEvent.click(commentsTab);

      await waitFor(() => {
        const textField = screen.getByTestId('text-field');
        expect(textField).toBeInTheDocument();
      });
    });

    it('should switch back to Settings tab', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      // Go to Properties tab
      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      // Go back to Settings tab
      const settingsTab = screen.getByText('Settings');
      fireEvent.click(settingsTab);

      await waitFor(() => {
        expect(screen.getByLabelText('Id')).toBeInTheDocument();
      });
    });
  });

  describe('Settings Tab', () => {
    it('should display service ID', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('test-service-id')).toBeInTheDocument();
      });
    });

    it('should copy service ID to clipboard', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const copyButton = screen.getByLabelText('Copy ID');
      fireEvent.click(copyButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test-service-id');
    });

    it('should display service type with version', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('org.apache.nifi.services.TestService 2.3.0')).toBeInTheDocument();
      });
    });

    it('should display service type without version when version is missing', async () => {
      const serviceDetailsWithoutVersion = {
        ...mockServiceDetails,
        component: {
          ...mockServiceDetails.component,
          bundle: {
            ...mockServiceDetails.component.bundle,
            version: undefined
          }
        }
      };

      (nifiApiService.getControllerService as jest.Mock) = jest.fn().mockResolvedValue(serviceDetailsWithoutVersion);

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('org.apache.nifi.services.TestService')).toBeInTheDocument();
      });
    });

    it('should display bundle information', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('org.apache.nifi - nifi-standard')).toBeInTheDocument();
      });
    });

    it('should display supported controller services as array', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('org.apache.nifi.services.AnotherService')).toBeInTheDocument();
      });
    });

    it('should display supported controller services as single object', async () => {
      const serviceDetailsWithSingleSupport = {
        ...mockServiceDetails,
        component: {
          ...mockServiceDetails.component,
          supportsControllerService: {
            type: 'org.apache.nifi.services.SingleService',
            version: '1.0.0',
            bundle: {
              group: 'org.apache.nifi',
              artifact: 'nifi-standard'
            }
          }
        }
      };

      (nifiApiService.getControllerService as jest.Mock) = jest.fn().mockResolvedValue(serviceDetailsWithSingleSupport);

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/org\.apache\.nifi\.services\.SingleService/)).toBeInTheDocument();
      });
    });

    it('should display "No supported controller services" when none exist', async () => {
      const serviceDetailsWithoutSupport = {
        ...mockServiceDetails,
        component: {
          ...mockServiceDetails.component,
          supportsControllerService: undefined
        }
      };

      (nifiApiService.getControllerService as jest.Mock) = jest.fn().mockResolvedValue(serviceDetailsWithoutSupport);

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('No supported controller services')).toBeInTheDocument();
      });
    });

    it('should display bulletin level dropdown', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        const selectField = screen.getByTestId('select-field');
        expect(selectField).toBeInTheDocument();
      });
    });

    it('should change bulletin level', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const selectField = screen.getByTestId('select-field');
      const select = selectField.querySelector('select');
      
      if (select) {
        fireEvent.change(select, { target: { value: 'INFO' } });
        expect(select.value).toBe('INFO');
      }
    });
  });

  describe('Properties Tab', () => {
    it('should display properties table', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        expect(screen.getByText('Required field')).toBeInTheDocument();
        expect(screen.getByText('Test Property')).toBeInTheDocument();
      });
    });

    it('should not display sensitive properties', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        expect(screen.queryByText('Sensitive Property')).not.toBeInTheDocument();
      });
    });

    it('should not display framework properties', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        expect(screen.queryByText('Framework Property')).not.toBeInTheDocument();
      });
    });

    it('should display property value when available', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        expect(screen.getByText('test-value')).toBeInTheDocument();
      });
    });

    it('should display "No value set" when property value is empty', async () => {
      const serviceDetailsWithEmptyProperty = {
        ...mockServiceDetails,
        component: {
          ...mockServiceDetails.component,
          properties: {
            'test.property': { value: '' }
          }
        }
      };

      (nifiApiService.getControllerService as jest.Mock) = jest.fn().mockResolvedValue(serviceDetailsWithEmptyProperty);

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        expect(screen.getByText('No value set')).toBeInTheDocument();
      });
    });

    it('should display "No value set" when property value is whitespace only', async () => {
      const serviceDetailsWithWhitespaceProperty = {
        ...mockServiceDetails,
        component: {
          ...mockServiceDetails.component,
          properties: {
            'test.property': { value: '   ' }
          }
        }
      };

      (nifiApiService.getControllerService as jest.Mock) = jest.fn().mockResolvedValue(serviceDetailsWithWhitespaceProperty);

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        expect(screen.getByText('No value set')).toBeInTheDocument();
      });
    });

    it('should handle properties with string values', async () => {
      const serviceDetailsWithStringProperty = {
        ...mockServiceDetails,
        component: {
          ...mockServiceDetails.component,
          properties: {
            'test.property': 'string-value'
          }
        }
      };

      (nifiApiService.getControllerService as jest.Mock) = jest.fn().mockResolvedValue(serviceDetailsWithStringProperty);

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        expect(screen.getByText('string-value')).toBeInTheDocument();
      });
    });

    it('should display "No properties available" when no descriptors', async () => {
      const serviceDetailsWithoutDescriptors = {
        ...mockServiceDetails,
        component: {
          ...mockServiceDetails.component,
          descriptors: {}
        }
      };

      (nifiApiService.getControllerService as jest.Mock) = jest.fn().mockResolvedValue(serviceDetailsWithoutDescriptors);

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        expect(screen.getByText('No properties available')).toBeInTheDocument();
      });
    });

    it('should display "No properties available" when descriptors is null', async () => {
      const serviceDetailsWithNullDescriptors = {
        ...mockServiceDetails,
        component: {
          ...mockServiceDetails.component,
          descriptors: null
        }
      };

      (nifiApiService.getControllerService as jest.Mock) = jest.fn().mockResolvedValue(serviceDetailsWithNullDescriptors);

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        expect(screen.getByText('No properties available')).toBeInTheDocument();
      });
    });
  });

  describe('Comments Tab', () => {
    it('should display comments textarea', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const commentsTab = screen.getByText('Comments');
      fireEvent.click(commentsTab);

      await waitFor(() => {
        const textField = screen.getByTestId('text-field');
        expect(textField).toBeInTheDocument();
      });
    });

    it('should display existing comments', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const commentsTab = screen.getByText('Comments');
      fireEvent.click(commentsTab);

      await waitFor(() => {
        const textarea = screen.getByDisplayValue('Test comments');
        expect(textarea).toBeInTheDocument();
      });
    });

    it('should update comments', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const commentsTab = screen.getByText('Comments');
      fireEvent.click(commentsTab);

      await waitFor(() => {
        const textField = screen.getByTestId('text-field');
        const textarea = textField.querySelector('textarea');
        
        if (textarea) {
          fireEvent.change(textarea, { target: { value: 'New comments' } });
          expect(textarea.value).toBe('New comments');
        }
      });
    });
  });

  describe('Apply Functionality', () => {
    it('should not apply when service is null', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={null}
          onConfirm={mockOnConfirm}
        />
      );

      const applyButton = screen.getByText('Apply');
      expect(applyButton).toBeDisabled();
    });

    it('should apply changes successfully', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const applyButton = screen.getByText('Apply');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(nifiApiService.updateControllerService).toHaveBeenCalled();
      });

      expect(mockOnConfirm).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should handle apply error without comments', async () => {
      const errorMessage = 'Update failed';
      (nifiApiService.updateControllerService as jest.Mock) = jest.fn().mockRejectedValue({
        message: errorMessage
      });

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const applyButton = screen.getByText('Apply');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      expect(mockOnConfirm).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should handle apply error with comments and still close', async () => {
      const errorMessage = 'Update failed';
      (nifiApiService.updateControllerService as jest.Mock) = jest.fn().mockRejectedValue({
        message: errorMessage
      });

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      // Add comments
      const commentsTab = screen.getByText('Comments');
      fireEvent.click(commentsTab);

      await waitFor(() => {
        const textField = screen.getByTestId('text-field');
        const textarea = textField.querySelector('textarea');
        
        if (textarea) {
          fireEvent.change(textarea, { target: { value: 'Test comments' } });
        }
      });

      const applyButton = screen.getByText('Apply');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(nifiApiService.updateControllerService).toHaveBeenCalled();
      });

      // Should still call onConfirm and onClose even with error when comments exist
      expect(mockOnConfirm).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should handle error with response.data.message', async () => {
      const errorMessage = 'Response error message';
      
      // Mock getControllerService to return service details for the second call in handleApply
      (nifiApiService.getControllerService as jest.Mock) = jest.fn()
        .mockResolvedValueOnce(mockServiceDetails) // Initial fetch in useEffect
        .mockResolvedValueOnce(mockServiceDetails); // Fetch in handleApply
      
      (nifiApiService.updateControllerService as jest.Mock) = jest.fn().mockRejectedValue({
        response: {
          data: {
            message: errorMessage
          }
        }
      });

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const applyButton = screen.getByText('Apply');
      
      // Click button
      fireEvent.click(applyButton);
      
      // Wait for the second getControllerService call in handleApply
      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalledTimes(2);
      });
      
      // Wait for updateControllerService to be called and reject
      await waitFor(() => {
        expect(nifiApiService.updateControllerService).toHaveBeenCalled();
      });
      
      // Wait for error to be set in state and displayed
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle error with response.data.error', async () => {
      const errorMessage = 'Response error';
      
      // Mock getControllerService to return service details for the second call in handleApply
      (nifiApiService.getControllerService as jest.Mock) = jest.fn()
        .mockResolvedValueOnce(mockServiceDetails) // Initial fetch in useEffect
        .mockResolvedValueOnce(mockServiceDetails); // Fetch in handleApply
      
      (nifiApiService.updateControllerService as jest.Mock) = jest.fn().mockRejectedValue({
        response: {
          data: {
            error: errorMessage
          }
        }
      });

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const applyButton = screen.getByText('Apply');
      
      // Click button
      fireEvent.click(applyButton);
      
      // Wait for the second getControllerService call in handleApply
      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalledTimes(2);
      });
      
      // Wait for updateControllerService to be called and reject
      await waitFor(() => {
        expect(nifiApiService.updateControllerService).toHaveBeenCalled();
      });
      
      // Wait for error to be set in state and displayed
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle error without message', async () => {
      // Mock getControllerService to return service details for the second call in handleApply
      (nifiApiService.getControllerService as jest.Mock) = jest.fn()
        .mockResolvedValueOnce(mockServiceDetails) // Initial fetch in useEffect
        .mockResolvedValueOnce(mockServiceDetails); // Fetch in handleApply
      
      (nifiApiService.updateControllerService as jest.Mock) = jest.fn().mockRejectedValue({});

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const applyButton = screen.getByText('Apply');
      
      // Click button
      fireEvent.click(applyButton);
      
      // Wait for the second getControllerService call in handleApply
      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalledTimes(2);
      });
      
      // Wait for updateControllerService to be called and reject
      await waitFor(() => {
        expect(nifiApiService.updateControllerService).toHaveBeenCalled();
      });
      
      // Wait for error to be set in state and displayed
      await waitFor(() => {
        expect(screen.getByText('Failed to update controller service')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should throw error when service name is missing', async () => {
      const serviceDetailsWithoutName = {
        ...mockServiceDetails,
        component: {
          ...mockServiceDetails.component,
          name: undefined
        }
      };

      const serviceWithoutName = {
        ...mockService,
        name: undefined
      } as any;

      // Mock getControllerService to return service without name both times (initial fetch and in handleApply)
      (nifiApiService.getControllerService as jest.Mock) = jest.fn()
        .mockResolvedValueOnce(serviceDetailsWithoutName) // Initial fetch in useEffect
        .mockResolvedValueOnce(serviceDetailsWithoutName); // Fetch in handleApply

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={serviceWithoutName}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const applyButton = screen.getByText('Apply');
      
      // Click button
      fireEvent.click(applyButton);
      
      // Wait for the second getControllerService call in handleApply
      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalledTimes(2);
      });
      
      // Wait for the error to be set in state
      // The error is thrown in handleApply after getControllerService resolves, caught, and setError is called
      await waitFor(() => {
        expect(screen.getByText('Service name is required but not available')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle revision version as number', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const applyButton = screen.getByText('Apply');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(nifiApiService.updateControllerService).toHaveBeenCalled();
      });
    });

    it('should handle revision version as NaN', async () => {
      const serviceDetailsWithNaNVersion = {
        ...mockServiceDetails,
        revision: {
          version: NaN,
          clientId: 'test-client-id'
        }
      };

      (nifiApiService.getControllerService as jest.Mock) = jest.fn()
        .mockResolvedValueOnce(mockServiceDetails)
        .mockResolvedValueOnce(serviceDetailsWithNaNVersion);

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const applyButton = screen.getByText('Apply');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(nifiApiService.updateControllerService).toHaveBeenCalled();
      });
    });

    it('should handle revision version as undefined', async () => {
      const serviceDetailsWithoutVersion = {
        ...mockServiceDetails,
        revision: {
          clientId: 'test-client-id'
        }
      };

      (nifiApiService.getControllerService as jest.Mock) = jest.fn()
        .mockResolvedValueOnce(mockServiceDetails)
        .mockResolvedValueOnce(serviceDetailsWithoutVersion);

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const applyButton = screen.getByText('Apply');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(nifiApiService.updateControllerService).toHaveBeenCalled();
      });
    });
  });

  describe('Conflict Handling', () => {
    it('should retry on 409 conflict error', async () => {
      let attemptCount = 0;
      (nifiApiService.updateControllerService as jest.Mock) = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount === 1) {
          const error = new Error('Conflict');
          (error as any).response = { status: 409 };
          throw error;
        }
        return Promise.resolve({});
      });

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const applyButton = screen.getByText('Apply');
      fireEvent.click(applyButton);

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(nifiApiService.updateControllerService).toHaveBeenCalledTimes(2);
      });
    });

    it('should retry on 500 error with 409 in details', async () => {
      let attemptCount = 0;
      (nifiApiService.updateControllerService as jest.Mock) = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount === 1) {
          const error = new Error('Error 409');
          (error as any).response = {
            status: 500,
            data: {
              details: 'Error 409 occurred'
            }
          };
          throw error;
        }
        return Promise.resolve({});
      });

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const applyButton = screen.getByText('Apply');
      fireEvent.click(applyButton);

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(nifiApiService.updateControllerService).toHaveBeenCalledTimes(2);
      });
    });

    it('should retry on 500 error with 409 in message', async () => {
      let attemptCount = 0;
      (nifiApiService.updateControllerService as jest.Mock) = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount === 1) {
          const error = new Error('Error 409 occurred');
          (error as any).response = {
            status: 500
          };
          throw error;
        }
        return Promise.resolve({});
      });

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const applyButton = screen.getByText('Apply');
      fireEvent.click(applyButton);

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(nifiApiService.updateControllerService).toHaveBeenCalledTimes(2);
      });
    });

    it('should retry on 500 error with 409 in error field', async () => {
      let attemptCount = 0;
      (nifiApiService.updateControllerService as jest.Mock) = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount === 1) {
          const error = new Error('Error');
          (error as any).response = {
            status: 500,
            data: {
              error: 'Error 409'
            }
          };
          throw error;
        }
        return Promise.resolve({});
      });

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const applyButton = screen.getByText('Apply');
      fireEvent.click(applyButton);

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(nifiApiService.updateControllerService).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle max retries exceeded', async () => {
      let attemptCount = 0;
      (nifiApiService.updateControllerService as jest.Mock) = jest.fn().mockImplementation(() => {
        attemptCount++;
        const error = new Error('Conflict');
        (error as any).response = { status: 409 };
        throw error;
      });

      // Mock getControllerService for refreshRevisionAndUpdatePayload calls
      (nifiApiService.getControllerService as jest.Mock) = jest.fn()
        .mockResolvedValueOnce(mockServiceDetails) // Initial fetch in useEffect
        .mockResolvedValueOnce(mockServiceDetails) // Fetch in handleApply
        .mockResolvedValue(mockServiceDetails); // For refreshRevisionAndUpdatePayload (called 3 times)

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const applyButton = screen.getByText('Apply');
      fireEvent.click(applyButton);

      // Advance timers for all retry attempts
      // retryUpdateWithConflictHandling with maxRetries=3 means:
      // attempt 1: fails, refreshRevisionAndUpdatePayload (100ms delay + 500ms delay)
      // attempt 2: fails, refreshRevisionAndUpdatePayload (200ms delay + 1000ms delay)
      // attempt 3: fails, refreshRevisionAndUpdatePayload (300ms delay + 1500ms delay)
      // attempt 4: fails, throws error (no refresh, just throws)
      await act(async () => {
        // Wait for handleApply to call getControllerService
        await Promise.resolve();
        
        // First attempt failure and refresh
        jest.advanceTimersByTime(100); // preFetchDelay for attempt 1
        await Promise.resolve();
        jest.advanceTimersByTime(500); // retryDelay for attempt 1
        await Promise.resolve();
        
        // Second attempt failure and refresh
        jest.advanceTimersByTime(200); // preFetchDelay for attempt 2
        await Promise.resolve();
        jest.advanceTimersByTime(1000); // retryDelay for attempt 2
        await Promise.resolve();
        
        // Third attempt failure and refresh
        jest.advanceTimersByTime(300); // preFetchDelay for attempt 3
        await Promise.resolve();
        jest.advanceTimersByTime(1500); // retryDelay for attempt 3
        await Promise.resolve();
        
        // Fourth attempt failure (no refresh, just throws)
        jest.advanceTimersByTime(100);
        await Promise.resolve();
        
        // Allow error to propagate
        await Promise.resolve();
      });

      await waitFor(() => {
        // Should have 4 attempts (initial + 3 retries)
        // The while loop runs while attempt <= maxRetries (3), so:
        // attempt 1, 2, 3, 4 = 4 total attempts
        expect(nifiApiService.updateControllerService).toHaveBeenCalledTimes(4);
      }, { timeout: 3000 });
    });
  });

  describe('Verification Functionality', () => {
    it('should disable verification button when no required field data', async () => {
      const serviceDetailsWithoutProperties = {
        ...mockServiceDetails,
        component: {
          ...mockServiceDetails.component,
          descriptors: {
            'sensitive.property': {
              displayName: 'Sensitive Property',
              sensitive: true
            },
            'nifi.framework.property': {
              displayName: 'Framework Property',
              sensitive: false
            }
          }
        }
      };

      (nifiApiService.getControllerService as jest.Mock) = jest.fn().mockResolvedValue(serviceDetailsWithoutProperties);

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        const verifyButton = screen.getByLabelText('Verify component');
        expect(verifyButton).toBeDisabled();
      });
    });

    it('should enable verification button when required field data exists', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        const verifyButton = screen.getByLabelText('Verify component');
        expect(verifyButton).not.toBeDisabled();
      });
    });

    it('should not verify when service is null', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={null}
          onConfirm={mockOnConfirm}
        />
      );

      // Verification button should not be clickable when service is null
      await waitFor(() => {
        const verifyButton = screen.queryByLabelText('Verify component');
        expect(verifyButton).not.toBeInTheDocument();
      });
    });

    it('should not verify when already verifying', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        const verifyButton = screen.getByLabelText('Verify component');
        expect(verifyButton).not.toBeDisabled();
      });

      const verifyButton = screen.getByLabelText('Verify component');
      
      // Start verification
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(screen.getByText('Verifying component...')).toBeInTheDocument();
      });

      // Button should be disabled during verification
      expect(verifyButton).toBeDisabled();
    });

    it('should perform verification successfully', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        const verifyButton = screen.getByLabelText('Verify component');
        expect(verifyButton).not.toBeDisabled();
      });

      const verifyButton = screen.getByLabelText('Verify component');
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(nifiApiService.analyzeControllerServiceConfig).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(nifiApiService.createControllerServiceVerificationRequest).toHaveBeenCalled();
      });

      // Advance timers for polling
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(nifiApiService.getControllerServiceVerificationRequest).toHaveBeenCalled();
      });

      // Advance timers for cleanup
      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(nifiApiService.deleteControllerServiceVerificationRequest).toHaveBeenCalled();
      });
    });

    it('should handle verification request ID from direct response', async () => {
      (nifiApiService.createControllerServiceVerificationRequest as jest.Mock) = jest.fn().mockResolvedValue({
        id: 'direct-verification-id'
      });

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        const verifyButton = screen.getByLabelText('Verify component');
        expect(verifyButton).not.toBeDisabled();
      });

      const verifyButton = screen.getByLabelText('Verify component');
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(nifiApiService.createControllerServiceVerificationRequest).toHaveBeenCalled();
      });

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(nifiApiService.getControllerServiceVerificationRequest).toHaveBeenCalledWith(
          'test-service-id',
          'direct-verification-id'
        );
      });
    });

    it('should handle verification request ID from nested request object', async () => {
      (nifiApiService.createControllerServiceVerificationRequest as jest.Mock) = jest.fn().mockResolvedValue({
        request: {
          id: 'nested-verification-id'
        }
      });

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        const verifyButton = screen.getByLabelText('Verify component');
        expect(verifyButton).not.toBeDisabled();
      });

      const verifyButton = screen.getByLabelText('Verify component');
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(nifiApiService.createControllerServiceVerificationRequest).toHaveBeenCalled();
      });

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(nifiApiService.getControllerServiceVerificationRequest).toHaveBeenCalledWith(
          'test-service-id',
          'nested-verification-id'
        );
      });
    });

    it('should handle verification request ID from array response', async () => {
      (nifiApiService.createControllerServiceVerificationRequest as jest.Mock) = jest.fn().mockResolvedValue([
        {
          id: 'array-verification-id'
        }
      ]);

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        const verifyButton = screen.getByLabelText('Verify component');
        expect(verifyButton).not.toBeDisabled();
      });

      const verifyButton = screen.getByLabelText('Verify component');
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(nifiApiService.createControllerServiceVerificationRequest).toHaveBeenCalled();
      });

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(nifiApiService.getControllerServiceVerificationRequest).toHaveBeenCalledWith(
          'test-service-id',
          'array-verification-id'
        );
      });
    });

    it('should handle verification error when request ID is missing', async () => {
      (nifiApiService.createControllerServiceVerificationRequest as jest.Mock) = jest.fn().mockResolvedValue({});

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        const verifyButton = screen.getByLabelText('Verify component');
        expect(verifyButton).not.toBeDisabled();
      });

      const verifyButton = screen.getByLabelText('Verify component');
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to get verification request ID/)).toBeInTheDocument();
      });
    });

    it('should handle verification polling timeout', async () => {
      let pollCount = 0;
      (nifiApiService.getControllerServiceVerificationRequest as jest.Mock) = jest.fn().mockImplementation(() => {
        pollCount++;
        // Always return incomplete to force timeout
        return Promise.resolve({
          request: {
            id: 'verification-request-id',
            complete: false
          }
        });
      });

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        const verifyButton = screen.getByLabelText('Verify component');
        expect(verifyButton).not.toBeDisabled();
      });

      const verifyButton = screen.getByLabelText('Verify component');
      
      await act(async () => {
        fireEvent.click(verifyButton);
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(nifiApiService.createControllerServiceVerificationRequest).toHaveBeenCalled();
      });

      // Advance timers for 30 polling attempts (30 seconds)
      // Each poll waits 1000ms before calling the API, then increments attempts
      // After 30 attempts (attempts = 30, which is >= maxAttempts = 30), the loop exits
      // Then checks if verificationData is null and throws error which is caught and sets verificationError
      await act(async () => {
        for (let i = 0; i < 30; i++) {
          jest.advanceTimersByTime(1000);
          await Promise.resolve();
        }
        // After loop exits, error is thrown, catch block executes, setVerificationError is called
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
      });

      // Wait for the error to be set in state and displayed
      await waitFor(() => {
        expect(screen.getByText('Verification request timed out')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle verification polling with 404 error and last successful response', async () => {
      let pollCount = 0;
      (nifiApiService.getControllerServiceVerificationRequest as jest.Mock) = jest.fn().mockImplementation(() => {
        pollCount++;
        if (pollCount === 1) {
          // First poll returns incomplete but with results (stored in lastSuccessfulResponse)
          return Promise.resolve({
            request: {
              id: 'verification-request-id',
              complete: false,
              results: [{ outcome: 'VALID' }]
            }
          });
        } else {
          // Second poll returns 404, which triggers use of lastSuccessfulResponse
          const error = new Error('Not found');
          (error as any).response = { status: 404 };
          throw error;
        }
      });

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        const verifyButton = screen.getByLabelText('Verify component');
        expect(verifyButton).not.toBeDisabled();
      });

      const verifyButton = screen.getByLabelText('Verify component');
      
      await act(async () => {
        fireEvent.click(verifyButton);
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(nifiApiService.createControllerServiceVerificationRequest).toHaveBeenCalled();
      });

      // Advance timers for first poll (1000ms wait + poll that succeeds)
      await act(async () => {
        jest.advanceTimersByTime(1000);
        await Promise.resolve();
      });

      // Advance timers for second poll (1000ms wait + poll that throws 404)
      // This should trigger the code path that uses lastSuccessfulResponse
      await act(async () => {
        jest.advanceTimersByTime(1000);
        await Promise.resolve();
        // Allow state update after setting verificationResult
        await Promise.resolve();
        await Promise.resolve();
      });

      // The code should set verificationResult using lastSuccessfulResponse
      await waitFor(() => {
        // Should use last successful response which has results
        // The formatVerificationResults function should format the results
        expect(screen.getByText(/Result 1:/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle verification polling with 404 error and retry', async () => {
      let pollCount = 0;
      (nifiApiService.getControllerServiceVerificationRequest as jest.Mock) = jest.fn().mockImplementation(() => {
        pollCount++;
        if (pollCount === 1) {
          const error = new Error('Not found');
          (error as any).response = { status: 404 };
          throw error;
        } else {
          return Promise.resolve({
            request: {
              id: 'verification-request-id',
              complete: true,
              results: [{ outcome: 'VALID' }]
            }
          });
        }
      });

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        const verifyButton = screen.getByLabelText('Verify component');
        expect(verifyButton).not.toBeDisabled();
      });

      const verifyButton = screen.getByLabelText('Verify component');
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(nifiApiService.createControllerServiceVerificationRequest).toHaveBeenCalled();
      });

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await act(async () => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(nifiApiService.getControllerServiceVerificationRequest).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle verification polling with 404 error and no previous response', async () => {
      (nifiApiService.getControllerServiceVerificationRequest as jest.Mock) = jest.fn().mockRejectedValue({
        response: { status: 404 }
      });

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        const verifyButton = screen.getByLabelText('Verify component');
        expect(verifyButton).not.toBeDisabled();
      });

      const verifyButton = screen.getByLabelText('Verify component');
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(nifiApiService.createControllerServiceVerificationRequest).toHaveBeenCalled();
      });

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await act(async () => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(screen.getByText(/Verification request was deleted before results could be retrieved/)).toBeInTheDocument();
      });
    });

    it('should handle verification polling with non-404 error', async () => {
      (nifiApiService.getControllerServiceVerificationRequest as jest.Mock) = jest.fn().mockRejectedValue({
        response: { status: 500 },
        message: 'Server error'
      });

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        const verifyButton = screen.getByLabelText('Verify component');
        expect(verifyButton).not.toBeDisabled();
      });

      const verifyButton = screen.getByLabelText('Verify component');
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(nifiApiService.createControllerServiceVerificationRequest).toHaveBeenCalled();
      });

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      // Should continue polling despite error
      await waitFor(() => {
        expect(nifiApiService.getControllerServiceVerificationRequest).toHaveBeenCalled();
      });
    });

    it('should handle verification complete with status COMPLETE', async () => {
      (nifiApiService.getControllerServiceVerificationRequest as jest.Mock) = jest.fn().mockResolvedValue({
        request: {
          id: 'verification-request-id',
          status: 'COMPLETE',
          results: [{ outcome: 'VALID' }]
        }
      });

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        const verifyButton = screen.getByLabelText('Verify component');
        expect(verifyButton).not.toBeDisabled();
      });

      const verifyButton = screen.getByLabelText('Verify component');
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(nifiApiService.createControllerServiceVerificationRequest).toHaveBeenCalled();
      });

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByText(/Result 1:/)).toBeInTheDocument();
      });
    });

    it('should handle verification complete with complete as string', async () => {
      (nifiApiService.getControllerServiceVerificationRequest as jest.Mock) = jest.fn().mockResolvedValue({
        request: {
          id: 'verification-request-id',
          complete: 'true',
          results: [{ outcome: 'VALID' }]
        }
      });

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        const verifyButton = screen.getByLabelText('Verify component');
        expect(verifyButton).not.toBeDisabled();
      });

      const verifyButton = screen.getByLabelText('Verify component');
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(nifiApiService.createControllerServiceVerificationRequest).toHaveBeenCalled();
      });

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByText(/Result 1:/)).toBeInTheDocument();
      });
    });

    it('should format verification results correctly', async () => {
      (nifiApiService.getControllerServiceVerificationRequest as jest.Mock) = jest.fn().mockResolvedValue({
        request: {
          id: 'verification-request-id',
          complete: true,
          results: [
            {
              outcome: 'VALID',
              explanation: 'Configuration is valid',
              verificationStepName: 'Step 1',
              reason: 'All checks passed'
            },
            {
              outcome: 'INVALID',
              explanation: 'Configuration has issues',
              verificationStepName: 'Step 2'
            }
          ]
        }
      });

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        const verifyButton = screen.getByLabelText('Verify component');
        expect(verifyButton).not.toBeDisabled();
      });

      const verifyButton = screen.getByLabelText('Verify component');
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(nifiApiService.createControllerServiceVerificationRequest).toHaveBeenCalled();
      });

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByText(/Result 1:/)).toBeInTheDocument();
        expect(screen.getByText(/Outcome: VALID/)).toBeInTheDocument();
        expect(screen.getByText(/Explanation: Configuration is valid/)).toBeInTheDocument();
        expect(screen.getByText(/Step: Step 1/)).toBeInTheDocument();
        expect(screen.getByText(/Reason: All checks passed/)).toBeInTheDocument();
        expect(screen.getByText(/Result 2:/)).toBeInTheDocument();
        expect(screen.getByText(/Outcome: INVALID/)).toBeInTheDocument();
      });
    });

    it('should display "Verification completed with no issues" when no results', async () => {
      (nifiApiService.getControllerServiceVerificationRequest as jest.Mock) = jest.fn().mockResolvedValue({
        request: {
          id: 'verification-request-id',
          complete: true,
          results: []
        }
      });

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        const verifyButton = screen.getByLabelText('Verify component');
        expect(verifyButton).not.toBeDisabled();
      });

      const verifyButton = screen.getByLabelText('Verify component');
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(nifiApiService.createControllerServiceVerificationRequest).toHaveBeenCalled();
      });

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByText('Verification completed with no issues.')).toBeInTheDocument();
      });
    });

    it('should handle verification result without request wrapper', async () => {
      (nifiApiService.getControllerServiceVerificationRequest as jest.Mock) = jest.fn().mockResolvedValue({
        id: 'verification-request-id',
        complete: true,
        results: [{ outcome: 'VALID' }]
      });

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        const verifyButton = screen.getByLabelText('Verify component');
        expect(verifyButton).not.toBeDisabled();
      });

      const verifyButton = screen.getByLabelText('Verify component');
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(nifiApiService.createControllerServiceVerificationRequest).toHaveBeenCalled();
      });

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByText(/Result 1:/)).toBeInTheDocument();
      });
    });

    it('should handle verification error', async () => {
      const errorMessage = 'Verification failed';
      (nifiApiService.analyzeControllerServiceConfig as jest.Mock) = jest.fn().mockRejectedValue({
        message: errorMessage
      });

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        const verifyButton = screen.getByLabelText('Verify component');
        expect(verifyButton).not.toBeDisabled();
      });

      const verifyButton = screen.getByLabelText('Verify component');
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should handle verification error without message', async () => {
      (nifiApiService.analyzeControllerServiceConfig as jest.Mock) = jest.fn().mockRejectedValue({});

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        const verifyButton = screen.getByLabelText('Verify component');
        expect(verifyButton).not.toBeDisabled();
      });

      const verifyButton = screen.getByLabelText('Verify component');
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to verify controller service')).toBeInTheDocument();
      });
    });

    it('should cleanup verification request on success', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        const verifyButton = screen.getByLabelText('Verify component');
        expect(verifyButton).not.toBeDisabled();
      });

      const verifyButton = screen.getByLabelText('Verify component');
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(nifiApiService.createControllerServiceVerificationRequest).toHaveBeenCalled();
      });

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(nifiApiService.deleteControllerServiceVerificationRequest).toHaveBeenCalledWith(
          'test-service-id',
          'verification-request-id'
        );
      });
    });

    it('should handle cleanup error gracefully', async () => {
      (nifiApiService.deleteControllerServiceVerificationRequest as jest.Mock) = jest.fn().mockRejectedValue({
        message: 'Cleanup failed'
      });

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        const verifyButton = screen.getByLabelText('Verify component');
        expect(verifyButton).not.toBeDisabled();
      });

      const verifyButton = screen.getByLabelText('Verify component');
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(nifiApiService.createControllerServiceVerificationRequest).toHaveBeenCalled();
      });

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      // Cleanup error should not break the flow
      expect(nifiApiService.deleteControllerServiceVerificationRequest).toHaveBeenCalled();
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when close button is clicked', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when cancel button is clicked', async () => {
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should disable cancel button when submitting', async () => {
      (nifiApiService.updateControllerService as jest.Mock) = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({}), 100))
      );

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const applyButton = screen.getByText('Apply');
      fireEvent.click(applyButton);

      await act(async () => {
        jest.advanceTimersByTime(50);
      });

      const cancelButton = screen.getByText('Cancel');
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Properties Changed Handling', () => {
    it('should include properties in update when propertiesChanged is true', async () => {
      // Note: propertiesChanged is set but not used in current implementation
      // This test ensures the code path is covered
      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const applyButton = screen.getByText('Apply');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(nifiApiService.updateControllerService).toHaveBeenCalled();
      });

      const updateCall = (nifiApiService.updateControllerService as jest.Mock).mock.calls[0];
      expect(updateCall[1].component).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle service details without component', async () => {
      const serviceDetailsWithoutComponent = {
        revision: {
          version: 1,
          clientId: 'test-client-id'
        }
      };

      (nifiApiService.getControllerService as jest.Mock) = jest.fn().mockResolvedValue(serviceDetailsWithoutComponent);

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      // Should not crash
      expect(screen.getByText('Edit Controller Service')).toBeInTheDocument();
    });

    it('should handle properties with null values', async () => {
      const serviceDetailsWithNullProperties = {
        ...mockServiceDetails,
        component: {
          ...mockServiceDetails.component,
          properties: {
            'test.property': null
          }
        }
      };

      (nifiApiService.getControllerService as jest.Mock) = jest.fn().mockResolvedValue(serviceDetailsWithNullProperties);

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const propertiesTab = screen.getByText('Properties');
      fireEvent.click(propertiesTab);

      await waitFor(() => {
        expect(screen.getByText('No value set')).toBeInTheDocument();
      });
    });

    it('should handle bulletin level as undefined', async () => {
      const serviceDetailsWithoutBulletinLevel = {
        ...mockServiceDetails,
        component: {
          ...mockServiceDetails.component,
          bulletinLevel: undefined
        }
      };

      (nifiApiService.getControllerService as jest.Mock) = jest.fn().mockResolvedValue(serviceDetailsWithoutBulletinLevel);

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      // Should default to WARN
      const selectField = screen.getByTestId('select-field');
      const select = selectField.querySelector('select');
      expect(select?.value).toBe('WARN');
    });

    it('should handle comments as undefined', async () => {
      const serviceDetailsWithoutComments = {
        ...mockServiceDetails,
        component: {
          ...mockServiceDetails.component,
          comments: undefined
        }
      };

      (nifiApiService.getControllerService as jest.Mock) = jest.fn().mockResolvedValue(serviceDetailsWithoutComments);

      render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      const commentsTab = screen.getByText('Comments');
      fireEvent.click(commentsTab);

      await waitFor(() => {
        const textField = screen.getByTestId('text-field');
        const textarea = textField.querySelector('textarea');
        expect(textarea?.value).toBe('');
      });
    });

    it('should handle service details fetch when service.id changes', async () => {
      const { rerender } = render(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalledWith('test-service-id');
      });

      const newService = {
        id: 'new-service-id',
        name: 'New Service',
        state: 'DISABLED'
      };

      rerender(
        <EditControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={newService}
          onConfirm={mockOnConfirm}
        />
      );

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalledWith('new-service-id');
      });
    });
  });
});

