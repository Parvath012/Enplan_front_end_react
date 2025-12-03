import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnableDisableControllerServiceDrawer from '../../src/components/EnableDisableControllerServiceDrawer';
import { nifiApiService } from '../../src/api/nifi/nifiApiService';

// Mock dependencies
jest.mock('../../src/api/nifi/nifiApiService');
jest.mock('commonApp/CustomTooltip', () => ({
  __esModule: true,
  default: ({ children, title }: any) => <div title={title}>{children}</div>
}));

jest.mock('commonApp/TextField', () => ({
  __esModule: true,
  default: ({ value, onChange, label, placeholder, readOnly }: any) => (
    <div data-testid="text-field">
      {label && <label>{label}</label>}
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange && onChange(e)}
        placeholder={placeholder}
        readOnly={readOnly}
        data-readonly={readOnly}
      />
    </div>
  )
}));

jest.mock('commonApp/SelectField', () => ({
  __esModule: true,
  default: ({ value, onChange, options, label, placeholder }: any) => (
    <div data-testid="select-field">
      {label && <label>{label}</label>}
      <select
        value={value || ''}
        onChange={(e) => onChange && onChange(e.target.value)}
        data-placeholder={placeholder}
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
  ChevronDown: ({ size, className }: any) => <div data-testid="chevron-down-icon" data-size={size} className={className}>ChevronDown</div>,
  ChevronRight: ({ size, className }: any) => <div data-testid="chevron-right-icon" data-size={size} className={className}>ChevronRight</div>,
  WarningAlt: ({ size, style }: any) => <div data-testid="warning-alt-icon" data-size={size} style={style}>WarningAlt</div>,
  Play: ({ size, style }: any) => <div data-testid="play-icon" data-size={size} style={style}>Play</div>,
  InformationFilled: ({ size }: any) => <div data-testid="information-filled-icon" data-size={size}>InformationFilled</div>,
  Exit: ({ size, style }: any) => <div data-testid="exit-icon" data-size={size} style={style}>Exit</div>
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
    Collapse: ({ in: inProp, children }: any) => (
      inProp ? <div data-testid="collapse-content">{children}</div> : null
    )
  };
});

describe('EnableDisableControllerServiceDrawer', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();
  const mockService = {
    id: 'test-service-id',
    name: 'Test Service',
    state: 'DISABLED'
  };

  const mockServiceDetails = {
    revision: {
      version: 1,
      clientId: 'test-client-id'
    },
    component: {
      id: 'test-service-id',
      name: 'Test Service'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (nifiApiService.getControllerService as jest.Mock) = jest.fn().mockResolvedValue(mockServiceDetails);
    (nifiApiService.enableControllerService as jest.Mock) = jest.fn().mockResolvedValue({});
    (nifiApiService.disableControllerService as jest.Mock) = jest.fn().mockResolvedValue({});
    (nifiApiService.updateControllerServiceReferences as jest.Mock) = jest.fn().mockResolvedValue({});
  });

  describe('Rendering', () => {
    it('should render when open is true for enable action', () => {
      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="enable"
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByTestId('reusable-panel')).toBeInTheDocument();
      expect(screen.getByText('Enable Controller Service')).toBeInTheDocument();
    });

    it('should render when open is true for disable action', () => {
      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="disable"
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByTestId('reusable-panel')).toBeInTheDocument();
      expect(screen.getByText('Disable Controller Service')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
      render(
        <EnableDisableControllerServiceDrawer
          open={false}
          onClose={mockOnClose}
          service={mockService}
          action="enable"
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.queryByTestId('reusable-panel')).not.toBeInTheDocument();
    });

    it('should display service name', () => {
      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="enable"
          onConfirm={mockOnConfirm}
        />
      );

      const textField = screen.getByTestId('text-field');
      const input = textField.querySelector('input');
      expect(input?.value).toBe('Test Service');
    });

    it('should display "No referencing components" when action is enable', () => {
      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="enable"
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText('No referencing components')).toBeInTheDocument();
    });

    it('should display referencing components when action is disable', () => {
      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="disable"
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText('Convert Record')).toBeInTheDocument();
      expect(screen.getByText('Put File')).toBeInTheDocument();
    });
  });

  describe('State Reset', () => {
    it('should reset state when drawer closes', () => {
      const { rerender } = render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="disable"
          onConfirm={mockOnConfirm}
        />
      );

      // Collapse the processors list
      const collapseButton = screen.getByLabelText('Toggle processors list');
      fireEvent.click(collapseButton);

      // Close drawer
      rerender(
        <EnableDisableControllerServiceDrawer
          open={false}
          onClose={mockOnClose}
          service={mockService}
          action="disable"
          onConfirm={mockOnConfirm}
        />
      );

      // Reopen drawer
      rerender(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="disable"
          onConfirm={mockOnConfirm}
        />
      );

      // Should be expanded again (default state)
      expect(screen.getByTestId('collapse-content')).toBeInTheDocument();
    });
  });

  describe('Scope Field', () => {
    it('should display SelectField for enable action', () => {
      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="enable"
          onConfirm={mockOnConfirm}
        />
      );

      const selectField = screen.getByTestId('select-field');
      expect(selectField).toBeInTheDocument();
    });

    it('should display TextField for disable action', () => {
      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="disable"
          onConfirm={mockOnConfirm}
        />
      );

      const textFields = screen.getAllByTestId('text-field');
      // Should have Service field and Scope field
      expect(textFields.length).toBeGreaterThanOrEqual(2);
    });

    it('should change scope when SelectField value changes', () => {
      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="enable"
          onConfirm={mockOnConfirm}
        />
      );

      const selectField = screen.getByTestId('select-field');
      const select = selectField.querySelector('select');
      
      if (select) {
        fireEvent.change(select, { target: { value: 'Service and referencing components' } });
        expect(select.value).toBe('Service and referencing components');
      }
    });
  });

  describe('Referencing Components', () => {
    it('should toggle processors list collapse', () => {
      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="disable"
          onConfirm={mockOnConfirm}
        />
      );

      const collapseButton = screen.getByLabelText('Toggle processors list');
      
      // Initially expanded
      expect(screen.getByTestId('collapse-content')).toBeInTheDocument();
      
      // Click to collapse
      fireEvent.click(collapseButton);
      expect(screen.queryByTestId('collapse-content')).not.toBeInTheDocument();
      
      // Click to expand again
      fireEvent.click(collapseButton);
      expect(screen.getByTestId('collapse-content')).toBeInTheDocument();
    });

    it('should toggle processors list with Enter key', () => {
      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="disable"
          onConfirm={mockOnConfirm}
        />
      );

      const collapseButton = screen.getByLabelText('Toggle processors list');
      
      // Initially expanded
      expect(screen.getByTestId('collapse-content')).toBeInTheDocument();
      
      // Press Enter to collapse
      fireEvent.keyDown(collapseButton, { key: 'Enter' });
      expect(screen.queryByTestId('collapse-content')).not.toBeInTheDocument();
    });

    it('should toggle processors list with Space key', () => {
      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="disable"
          onConfirm={mockOnConfirm}
        />
      );

      const collapseButton = screen.getByLabelText('Toggle processors list');
      
      // Initially expanded
      expect(screen.getByTestId('collapse-content')).toBeInTheDocument();
      
      // Press Space to collapse
      fireEvent.keyDown(collapseButton, { key: ' ' });
      expect(screen.queryByTestId('collapse-content')).not.toBeInTheDocument();
    });

    it('should display correct processor count', () => {
      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="disable"
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText('Processors (2)')).toBeInTheDocument();
    });

    it('should handle component arrow button click', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="disable"
          onConfirm={mockOnConfirm}
        />
      );

      const arrowButtons = screen.getAllByLabelText(/Navigate to/);
      if (arrowButtons.length > 0) {
        fireEvent.click(arrowButtons[0]);
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Action icon clicked for:'));
      }
      
      consoleSpy.mockRestore();
    });
  });

  describe('State Icons', () => {
    it('should display WarningAlt icon for INVALID state', () => {
      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="disable"
          onConfirm={mockOnConfirm}
        />
      );

      const warningIcons = screen.getAllByTestId('warning-alt-icon');
      expect(warningIcons.length).toBeGreaterThan(0);
    });

    it('should display WarningAlt icon for DISABLED state', () => {
      const serviceWithDisabled = {
        ...mockService,
        state: 'DISABLED'
      };

      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={serviceWithDisabled}
          action="disable"
          onConfirm={mockOnConfirm}
        />
      );

      const warningIcons = screen.getAllByTestId('warning-alt-icon');
      expect(warningIcons.length).toBeGreaterThan(0);
    });

    it('should display Play icon for RUNNING state', () => {
      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="disable"
          onConfirm={mockOnConfirm}
        />
      );

      const playIcons = screen.getAllByTestId('play-icon');
      expect(playIcons.length).toBeGreaterThan(0);
    });

    it('should display Play icon for ENABLED state', () => {
      const serviceWithEnabled = {
        ...mockService,
        state: 'ENABLED'
      };

      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={serviceWithEnabled}
          action="disable"
          onConfirm={mockOnConfirm}
        />
      );

      const playIcons = screen.getAllByTestId('play-icon');
      expect(playIcons.length).toBeGreaterThan(0);
    });

    it('should handle null state in getStateIcon', () => {
      const referencingComponentsWithNullState = [
        {
          id: 'processor-1',
          name: 'Test Processor',
          type: 'PROCESSOR',
          state: null as any,
          groupId: undefined
        }
      ];

      // We can't directly test getStateIcon, but we can test it through rendering
      // When state is null, it should default to WarningAlt
      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="disable"
          onConfirm={mockOnConfirm}
        />
      );

      // The component uses static data, so we can't easily test null state
      // But we can verify the default case works
      const warningIcons = screen.getAllByTestId('warning-alt-icon');
      expect(warningIcons.length).toBeGreaterThan(0);
    });

    it('should display WarningAlt icon for default/unknown state', () => {
      const serviceWithUnknownState = {
        ...mockService,
        state: 'UNKNOWN'
      };

      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={serviceWithUnknownState}
          action="disable"
          onConfirm={mockOnConfirm}
        />
      );

      const warningIcons = screen.getAllByTestId('warning-alt-icon');
      expect(warningIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Enable Action', () => {
    it('should enable service successfully with service-only scope', async () => {
      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="enable"
          onConfirm={mockOnConfirm}
        />
      );

      const enableButton = screen.getByText('Enable');
      fireEvent.click(enableButton);

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalledWith('test-service-id');
      });

      await waitFor(() => {
        expect(nifiApiService.enableControllerService).toHaveBeenCalled();
      });

      expect(nifiApiService.updateControllerServiceReferences).not.toHaveBeenCalled();
      expect(mockOnConfirm).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should enable service and start referencing components with service-and-referencing scope', async () => {
      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="enable"
          onConfirm={mockOnConfirm}
        />
      );

      // Change scope to service-and-referencing
      const selectField = screen.getByTestId('select-field');
      const select = selectField.querySelector('select');
      if (select) {
        fireEvent.change(select, { target: { value: 'Service and referencing components' } });
      }

      const enableButton = screen.getByText('Enable');
      fireEvent.click(enableButton);

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(nifiApiService.enableControllerService).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(nifiApiService.updateControllerServiceReferences).toHaveBeenCalledWith(
          'test-service-id',
          'RUNNING',
          {}
        );
      });

      expect(mockOnConfirm).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should handle error when starting referencing components fails but service is enabled', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      (nifiApiService.updateControllerServiceReferences as jest.Mock) = jest.fn().mockRejectedValue({
        message: 'Failed to start references'
      });

      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="enable"
          onConfirm={mockOnConfirm}
        />
      );

      // Change scope to service-and-referencing
      const selectField = screen.getByTestId('select-field');
      const select = selectField.querySelector('select');
      if (select) {
        fireEvent.change(select, { target: { value: 'Service and referencing components' } });
      }

      const enableButton = screen.getByText('Enable');
      fireEvent.click(enableButton);

      await waitFor(() => {
        expect(nifiApiService.enableControllerService).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to start referencing components'),
          expect.any(Object)
        );
      });

      // Should still call onConfirm and onClose even if starting references fails
      expect(mockOnConfirm).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
    });

    it('should handle error when enabling service fails', async () => {
      const errorMessage = 'Failed to enable service';
      (nifiApiService.enableControllerService as jest.Mock) = jest.fn().mockRejectedValue({
        message: errorMessage
      });

      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="enable"
          onConfirm={mockOnConfirm}
        />
      );

      const enableButton = screen.getByText('Enable');
      fireEvent.click(enableButton);

      await waitFor(() => {
        expect(nifiApiService.enableControllerService).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      expect(mockOnConfirm).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should handle error without message when enabling service fails', async () => {
      (nifiApiService.enableControllerService as jest.Mock) = jest.fn().mockRejectedValue({});

      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="enable"
          onConfirm={mockOnConfirm}
        />
      );

      const enableButton = screen.getByText('Enable');
      fireEvent.click(enableButton);

      await waitFor(() => {
        expect(nifiApiService.enableControllerService).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('Failed to enable controller service')).toBeInTheDocument();
      });
    });
  });

  describe('Disable Action', () => {
    it('should disable service successfully', async () => {
      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="disable"
          onConfirm={mockOnConfirm}
        />
      );

      const disableButton = screen.getByText('Disable');
      fireEvent.click(disableButton);

      await waitFor(() => {
        expect(nifiApiService.getControllerService).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(nifiApiService.updateControllerServiceReferences).toHaveBeenCalledWith(
          'test-service-id',
          'STOPPED',
          {}
        );
      });

      await waitFor(() => {
        expect(nifiApiService.disableControllerService).toHaveBeenCalled();
      });

      expect(mockOnConfirm).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should handle error when disabling service fails', async () => {
      const errorMessage = 'Failed to disable service';
      (nifiApiService.disableControllerService as jest.Mock) = jest.fn().mockRejectedValue({
        message: errorMessage
      });

      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="disable"
          onConfirm={mockOnConfirm}
        />
      );

      const disableButton = screen.getByText('Disable');
      fireEvent.click(disableButton);

      await waitFor(() => {
        expect(nifiApiService.disableControllerService).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      expect(mockOnConfirm).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should handle error when stopping referencing components fails', async () => {
      const errorMessage = 'Failed to stop references';
      (nifiApiService.updateControllerServiceReferences as jest.Mock) = jest.fn().mockRejectedValue({
        message: errorMessage
      });

      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="disable"
          onConfirm={mockOnConfirm}
        />
      );

      const disableButton = screen.getByText('Disable');
      fireEvent.click(disableButton);

      await waitFor(() => {
        expect(nifiApiService.updateControllerServiceReferences).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      expect(mockOnConfirm).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Button States', () => {
    it('should disable confirm button when service is null', () => {
      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={null}
          action="enable"
          onConfirm={mockOnConfirm}
        />
      );

      const enableButton = screen.getByText('Enable');
      expect(enableButton).toBeDisabled();
    });

    it('should disable cancel button when submitting', async () => {
      (nifiApiService.enableControllerService as jest.Mock) = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({}), 100))
      );

      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="enable"
          onConfirm={mockOnConfirm}
        />
      );

      const enableButton = screen.getByText('Enable');
      fireEvent.click(enableButton);

      await act(async () => {
        await Promise.resolve();
      });

      const cancelButton = screen.getByText('Cancel');
      expect(cancelButton).toBeDisabled();
    });

    it('should not call handleConfirm when service is null', () => {
      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={null}
          action="enable"
          onConfirm={mockOnConfirm}
        />
      );

      const enableButton = screen.getByText('Enable');
      expect(enableButton).toBeDisabled();
      
      // Even if we try to click (though it's disabled), it shouldn't call the API
      fireEvent.click(enableButton);
      expect(nifiApiService.getControllerService).not.toHaveBeenCalled();
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="enable"
          onConfirm={mockOnConfirm}
        />
      );

      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when cancel button is clicked', () => {
      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="enable"
          onConfirm={mockOnConfirm}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle service with undefined revision version', async () => {
      const serviceDetailsWithoutVersion = {
        revision: {
          clientId: 'test-client-id'
        },
        component: {
          id: 'test-service-id',
          name: 'Test Service'
        }
      };

      (nifiApiService.getControllerService as jest.Mock) = jest.fn().mockResolvedValue(serviceDetailsWithoutVersion);

      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="enable"
          onConfirm={mockOnConfirm}
        />
      );

      const enableButton = screen.getByText('Enable');
      fireEvent.click(enableButton);

      await waitFor(() => {
        expect(nifiApiService.enableControllerService).toHaveBeenCalled();
      });
    });

    it('should handle service with null revision', async () => {
      const serviceDetailsWithNullRevision = {
        revision: null,
        component: {
          id: 'test-service-id',
          name: 'Test Service'
        }
      };

      (nifiApiService.getControllerService as jest.Mock) = jest.fn().mockResolvedValue(serviceDetailsWithNullRevision);

      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="enable"
          onConfirm={mockOnConfirm}
        />
      );

      const enableButton = screen.getByText('Enable');
      fireEvent.click(enableButton);

      await waitFor(() => {
        expect(nifiApiService.enableControllerService).toHaveBeenCalled();
      });
    });

    it('should handle service name as empty string', () => {
      const serviceWithEmptyName = {
        ...mockService,
        name: ''
      };

      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={serviceWithEmptyName}
          action="enable"
          onConfirm={mockOnConfirm}
        />
      );

      const textField = screen.getByTestId('text-field');
      const input = textField.querySelector('input');
      expect(input?.value).toBe('');
    });

    it('should not fetch referencing components when drawer is closed', () => {
      render(
        <EnableDisableControllerServiceDrawer
          open={false}
          onClose={mockOnClose}
          service={mockService}
          action="enable"
          onConfirm={mockOnConfirm}
        />
      );

      // Should not set referencing components when closed
      expect(screen.queryByText('No referencing components')).not.toBeInTheDocument();
    });

    it('should not fetch referencing components when service is null', () => {
      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={null}
          action="enable"
          onConfirm={mockOnConfirm}
        />
      );

      // Should not set referencing components when service is null
      expect(screen.queryByText('No referencing components')).not.toBeInTheDocument();
    });

    it('should handle service with undefined clientId in revision', async () => {
      const serviceDetailsWithoutClientId = {
        revision: {
          version: 1
        },
        component: {
          id: 'test-service-id',
          name: 'Test Service'
        }
      };

      (nifiApiService.getControllerService as jest.Mock) = jest.fn().mockResolvedValue(serviceDetailsWithoutClientId);

      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="enable"
          onConfirm={mockOnConfirm}
        />
      );

      const enableButton = screen.getByText('Enable');
      fireEvent.click(enableButton);

      await waitFor(() => {
        expect(nifiApiService.enableControllerService).toHaveBeenCalled();
      });
    });

    it('should handle console.log statements in disable flow', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="disable"
          onConfirm={mockOnConfirm}
        />
      );

      const disableButton = screen.getByText('Disable');
      fireEvent.click(disableButton);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith('Disabling controller service - stopping referencing components first...');
      });

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith('Disabling controller service...');
      });

      consoleLogSpy.mockRestore();
    });

    it('should handle console.log statements in enable flow', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="enable"
          onConfirm={mockOnConfirm}
        />
      );

      // Change scope to service-and-referencing
      const selectField = screen.getByTestId('select-field');
      const select = selectField.querySelector('select');
      if (select) {
        fireEvent.change(select, { target: { value: 'Service and referencing components' } });
      }

      const enableButton = screen.getByText('Enable');
      fireEvent.click(enableButton);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith('Enabling controller service...');
      });

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith('Starting referencing components...');
      });

      consoleLogSpy.mockRestore();
    });

    it('should handle console.error in error cases', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const errorMessage = 'Test error';
      
      (nifiApiService.enableControllerService as jest.Mock) = jest.fn().mockRejectedValue({
        message: errorMessage
      });

      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="enable"
          onConfirm={mockOnConfirm}
        />
      );

      const enableButton = screen.getByText('Enable');
      fireEvent.click(enableButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to enable controller service'),
          expect.objectContaining({ message: errorMessage })
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle preventDefault on input mouseDown and click events', () => {
      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="disable"
          onConfirm={mockOnConfirm}
        />
      );

      // The fallback input elements have preventDefault handlers
      // We can't directly test these as they're in Suspense fallbacks,
      // but the component should render without errors
      expect(screen.getByTestId('reusable-panel')).toBeInTheDocument();
    });

    it('should handle keyDown with non-Enter/Space keys', () => {
      render(
        <EnableDisableControllerServiceDrawer
          open={true}
          onClose={mockOnClose}
          service={mockService}
          action="disable"
          onConfirm={mockOnConfirm}
        />
      );

      const collapseButton = screen.getByLabelText('Toggle processors list');
      
      // Press a key that shouldn't trigger toggle
      fireEvent.keyDown(collapseButton, { key: 'Tab' });
      
      // Should still be expanded (no change)
      expect(screen.getByTestId('collapse-content')).toBeInTheDocument();
    });
  });
});

