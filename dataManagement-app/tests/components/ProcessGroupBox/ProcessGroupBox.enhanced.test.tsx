/**
 * Comprehensive test suite for ProcessGroupBox component - Enhanced functionality
 * Tests for: enable, disable, start, stop operations in dropdown menu
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProcessGroupBox from '../../../src/components/ProcessGroupBox/ProcessGroupBox';
import { nifiApiService } from '../../../src/api/nifi/nifiApiService';

// Mock dependencies
jest.mock('../../../src/api/nifi/nifiApiService');
jest.mock('commonApp/NotificationAlert', () => ({
  __esModule: true,
  default: ({ open, actions }: any) =>
    open ? (
      <div data-testid="notification-alert">
        <button onClick={() => actions[0].onClick()} data-testid="cancel-btn">
          Cancel
        </button>
        <button onClick={() => actions[1].onClick()} data-testid="accept-btn">
          Accept
        </button>
      </div>
    ) : null,
}));

describe('ProcessGroupBox - Enhanced Operations', () => {
  const mockProps = {
    id: 'pg-123',
    name: 'Test Process Group',
    position: { x: 100, y: 200 },
    runningCount: 2,
    stoppedCount: 1,
    invalidCount: 0,
    disabledCount: 0,
    activeRemotePortCount: 1,
    inactiveRemotePortCount: 0,
    queued: '0 / 0 bytes',
    input: '100 MB',
    read: '50 MB',
    written: '75 MB',
    output: '80 MB',
    upToDateCount: 5,
    locallyModifiedCount: 0,
    staleCount: 0,
    locallyModifiedAndStaleCount: 0,
    syncFailureCount: 0,
    onMouseDown: jest.fn(),
    isDragging: false,
    parentGroupId: 'parent-456',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  describe('Enable Operation', () => {
    it('should call enableProcessGroup when Enable menu item is clicked', async () => {
      const onCopy = jest.fn();
      (nifiApiService.enableProcessGroup as jest.Mock).mockResolvedValue({
        id: 'pg-123',
        component: { state: 'ENABLED' },
      });

      const { container } = render(<ProcessGroupBox {...mockProps} onCopy={onCopy} />);

      // Open dropdown menu
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);

      // Click Enable
      const enableItem = screen.getByText('Enable');
      fireEvent.click(enableItem);

      await waitFor(() => {
        expect(nifiApiService.enableProcessGroup).toHaveBeenCalledWith('pg-123');
      });

      expect(console.log).toHaveBeenCalledWith('Enabling process group: pg-123 (Test Process Group)');
      expect(console.log).toHaveBeenCalledWith('Process group enabled successfully');
      expect(onCopy).toHaveBeenCalled();
    });

    it('should handle enable operation failure', async () => {
      const enableError = new Error('Enable failed');
      const onCopy = jest.fn();
      (nifiApiService.enableProcessGroup as jest.Mock).mockRejectedValue(enableError);

      const { container } = render(<ProcessGroupBox {...mockProps} onCopy={onCopy} />);

      // Open dropdown and click Enable
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);

      const enableItem = screen.getByText('Enable');
      fireEvent.click(enableItem);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to enable process group:', enableError);
      });

      expect(onCopy).not.toHaveBeenCalled();
    });

    it('should close menu after enable operation', async () => {
      const onCopy = jest.fn();
      (nifiApiService.enableProcessGroup as jest.Mock).mockResolvedValue({});

      const { container } = render(<ProcessGroupBox {...mockProps} onCopy={onCopy} />);

      // Open menu
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);

      // Click Enable
      const enableItem = screen.getByText('Enable');
      fireEvent.click(enableItem);

      await waitFor(() => {
        expect(nifiApiService.enableProcessGroup).toHaveBeenCalled();
      });

      // Menu should be closed (Enable item should not be in document after menu closes)
      await waitFor(() => {
        expect(screen.queryByText('Enable')).not.toBeVisible();
      });
    });

    it('should call onCopy callback after successful enable', async () => {
      const onCopy = jest.fn();
      (nifiApiService.enableProcessGroup as jest.Mock).mockResolvedValue({});

      const { container } = render(<ProcessGroupBox {...mockProps} onCopy={onCopy} />);

      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);

      const enableItem = screen.getByText('Enable');
      fireEvent.click(enableItem);

      await waitFor(() => {
        expect(onCopy).toHaveBeenCalled();
      });
    });
  });

  describe('Disable Operation', () => {
    it('should call disableProcessGroup when Disable menu item is clicked', async () => {
      const onCopy = jest.fn();
      (nifiApiService.disableProcessGroup as jest.Mock).mockResolvedValue({
        id: 'pg-123',
        component: { state: 'DISABLED' },
      });

      const { container } = render(<ProcessGroupBox {...mockProps} onCopy={onCopy} />);

      // Open dropdown menu
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);

      // Click Disable
      const disableItem = screen.getByText('Disable');
      fireEvent.click(disableItem);

      await waitFor(() => {
        expect(nifiApiService.disableProcessGroup).toHaveBeenCalledWith('pg-123');
      });

      expect(console.log).toHaveBeenCalledWith('Disabling process group: pg-123 (Test Process Group)');
      expect(console.log).toHaveBeenCalledWith('Process group disabled successfully');
      expect(onCopy).toHaveBeenCalled();
    });

    it('should handle disable operation failure', async () => {
      const disableError = new Error('Disable failed');
      const onCopy = jest.fn();
      (nifiApiService.disableProcessGroup as jest.Mock).mockRejectedValue(disableError);

      const { container } = render(<ProcessGroupBox {...mockProps} onCopy={onCopy} />);

      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);

      const disableItem = screen.getByText('Disable');
      fireEvent.click(disableItem);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to disable process group:', disableError);
      });

      expect(onCopy).not.toHaveBeenCalled();
    });

    it('should close menu after disable operation', async () => {
      const onCopy = jest.fn();
      (nifiApiService.disableProcessGroup as jest.Mock).mockResolvedValue({});

      const { container } = render(<ProcessGroupBox {...mockProps} onCopy={onCopy} />);

      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);

      const disableItem = screen.getByText('Disable');
      fireEvent.click(disableItem);

      await waitFor(() => {
        expect(nifiApiService.disableProcessGroup).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.queryByText('Disable')).not.toBeVisible();
      });
    });
  });

  describe('Start Operation', () => {
    it('should call startProcessGroup when Start menu item is clicked', async () => {
      const onCopy = jest.fn();
      (nifiApiService.startProcessGroup as jest.Mock).mockResolvedValue({
        id: 'pg-123',
        component: { state: 'RUNNING' },
      });

      const { container } = render(<ProcessGroupBox {...mockProps} onCopy={onCopy} />);

      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);

      const startItem = screen.getByText('Start');
      fireEvent.click(startItem);

      await waitFor(() => {
        expect(nifiApiService.startProcessGroup).toHaveBeenCalledWith('pg-123');
      });

      expect(console.log).toHaveBeenCalledWith('Starting process group: pg-123 (Test Process Group)');
      expect(console.log).toHaveBeenCalledWith('Process group started successfully');
      expect(onCopy).toHaveBeenCalled();
    });

    it('should handle start operation failure', async () => {
      const startError = new Error('Start failed');
      const onCopy = jest.fn();
      (nifiApiService.startProcessGroup as jest.Mock).mockRejectedValue(startError);

      const { container } = render(<ProcessGroupBox {...mockProps} onCopy={onCopy} />);

      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);

      const startItem = screen.getByText('Start');
      fireEvent.click(startItem);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to start process group:', startError);
      });

      expect(onCopy).not.toHaveBeenCalled();
    });

    it('should log all start operation steps', async () => {
      const onCopy = jest.fn();
      (nifiApiService.startProcessGroup as jest.Mock).mockResolvedValue({});

      const { container } = render(<ProcessGroupBox {...mockProps} onCopy={onCopy} />);

      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);

      const startItem = screen.getByText('Start');
      fireEvent.click(startItem);

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Starting process group: pg-123 (Test Process Group)');
      });

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Process group started successfully');
      });
    });
  });

  describe('Stop Operation', () => {
    it('should call stopProcessGroup when Stop menu item is clicked', async () => {
      const onCopy = jest.fn();
      (nifiApiService.stopProcessGroup as jest.Mock).mockResolvedValue({
        id: 'pg-123',
        component: { state: 'STOPPED' },
      });

      const { container } = render(<ProcessGroupBox {...mockProps} onCopy={onCopy} />);

      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);

      const stopItem = screen.getByText('Stop');
      fireEvent.click(stopItem);

      await waitFor(() => {
        expect(nifiApiService.stopProcessGroup).toHaveBeenCalledWith('pg-123');
      });

      expect(console.log).toHaveBeenCalledWith('Stopping process group: pg-123 (Test Process Group)');
      expect(console.log).toHaveBeenCalledWith('Process group stopped successfully');
      expect(onCopy).toHaveBeenCalled();
    });

    it('should handle stop operation failure', async () => {
      const stopError = new Error('Stop failed');
      const onCopy = jest.fn();
      (nifiApiService.stopProcessGroup as jest.Mock).mockRejectedValue(stopError);

      const { container } = render(<ProcessGroupBox {...mockProps} onCopy={onCopy} />);

      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);

      const stopItem = screen.getByText('Stop');
      fireEvent.click(stopItem);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to stop process group:', stopError);
      });

      expect(onCopy).not.toHaveBeenCalled();
    });

    it('should close menu after stop operation', async () => {
      const onCopy = jest.fn();
      (nifiApiService.stopProcessGroup as jest.Mock).mockResolvedValue({});

      const { container } = render(<ProcessGroupBox {...mockProps} onCopy={onCopy} />);

      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);

      const stopItem = screen.getByText('Stop');
      fireEvent.click(stopItem);

      await waitFor(() => {
        expect(nifiApiService.stopProcessGroup).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.queryByText('Stop')).not.toBeVisible();
      });
    });
  });

  describe('Menu Item Click Handler Integration', () => {
    it('should handle enable action through handleMenuItemClick', async () => {
      const onCopy = jest.fn();
      (nifiApiService.enableProcessGroup as jest.Mock).mockResolvedValue({});

      const { container } = render(<ProcessGroupBox {...mockProps} onCopy={onCopy} />);

      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);

      const enableItem = screen.getByText('Enable');
      fireEvent.click(enableItem);

      await waitFor(() => {
        expect(nifiApiService.enableProcessGroup).toHaveBeenCalled();
      });
    });

    it('should handle disable action through handleMenuItemClick', async () => {
      const onCopy = jest.fn();
      (nifiApiService.disableProcessGroup as jest.Mock).mockResolvedValue({});

      const { container } = render(<ProcessGroupBox {...mockProps} onCopy={onCopy} />);

      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);

      const disableItem = screen.getByText('Disable');
      fireEvent.click(disableItem);

      await waitFor(() => {
        expect(nifiApiService.disableProcessGroup).toHaveBeenCalled();
      });
    });

    it('should handle start action through handleMenuItemClick', async () => {
      const onCopy = jest.fn();
      (nifiApiService.startProcessGroup as jest.Mock).mockResolvedValue({});

      const { container } = render(<ProcessGroupBox {...mockProps} onCopy={onCopy} />);

      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);

      const startItem = screen.getByText('Start');
      fireEvent.click(startItem);

      await waitFor(() => {
        expect(nifiApiService.startProcessGroup).toHaveBeenCalled();
      });
    });

    it('should handle stop action through handleMenuItemClick', async () => {
      const onCopy = jest.fn();
      (nifiApiService.stopProcessGroup as jest.Mock).mockResolvedValue({});

      const { container } = render(<ProcessGroupBox {...mockProps} onCopy={onCopy} />);

      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);

      const stopItem = screen.getByText('Stop');
      fireEvent.click(stopItem);

      await waitFor(() => {
        expect(nifiApiService.stopProcessGroup).toHaveBeenCalled();
      });
    });
  });

  describe('Callback Integration', () => {
    it('should call onCopy callback after enable (used as refresh)', async () => {
      const onCopy = jest.fn();
      (nifiApiService.enableProcessGroup as jest.Mock).mockResolvedValue({});

      const { container } = render(<ProcessGroupBox {...mockProps} onCopy={onCopy} />);

      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);

      const enableItem = screen.getByText('Enable');
      fireEvent.click(enableItem);

      await waitFor(() => {
        expect(onCopy).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onCopy callback after disable (used as refresh)', async () => {
      const onCopy = jest.fn();
      (nifiApiService.disableProcessGroup as jest.Mock).mockResolvedValue({});

      const { container } = render(<ProcessGroupBox {...mockProps} onCopy={onCopy} />);

      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);

      const disableItem = screen.getByText('Disable');
      fireEvent.click(disableItem);

      await waitFor(() => {
        expect(onCopy).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onCopy callback after start (used as refresh)', async () => {
      const onCopy = jest.fn();
      (nifiApiService.startProcessGroup as jest.Mock).mockResolvedValue({});

      const { container } = render(<ProcessGroupBox {...mockProps} onCopy={onCopy} />);

      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);

      const startItem = screen.getByText('Start');
      fireEvent.click(startItem);

      await waitFor(() => {
        expect(onCopy).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onCopy callback after stop (used as refresh)', async () => {
      const onCopy = jest.fn();
      (nifiApiService.stopProcessGroup as jest.Mock).mockResolvedValue({});

      const { container } = render(<ProcessGroupBox {...mockProps} onCopy={onCopy} />);

      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);

      const stopItem = screen.getByText('Stop');
      fireEvent.click(stopItem);

      await waitFor(() => {
        expect(onCopy).toHaveBeenCalledTimes(1);
      });
    });

    it('should not call onCopy if callback is not provided', async () => {
      (nifiApiService.enableProcessGroup as jest.Mock).mockResolvedValue({});

      const { container } = render(<ProcessGroupBox {...mockProps} />);

      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);

      const enableItem = screen.getByText('Enable');
      fireEvent.click(enableItem);

      await waitFor(() => {
        expect(nifiApiService.enableProcessGroup).toHaveBeenCalled();
      });

      // Should not crash if onCopy is undefined
      expect(screen.getByText('Test Process Group')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network Error');
      (nifiApiService.startProcessGroup as jest.Mock).mockRejectedValue(networkError);

      const { container } = render(<ProcessGroupBox {...mockProps} />);

      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);

      const startItem = screen.getByText('Start');
      fireEvent.click(startItem);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to start process group:', networkError);
      });

      // Component should still be rendered
      expect(screen.getByText('Test Process Group')).toBeInTheDocument();
    });

    it('should handle API errors with proper logging', async () => {
      const apiError = new Error('API Error: 500 Internal Server Error');
      (nifiApiService.enableProcessGroup as jest.Mock).mockRejectedValue(apiError);

      const { container } = render(<ProcessGroupBox {...mockProps} />);

      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);

      const enableItem = screen.getByText('Enable');
      fireEvent.click(enableItem);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to enable process group:', apiError);
      });
    });

    it('should handle multiple consecutive operation failures', async () => {
      (nifiApiService.startProcessGroup as jest.Mock).mockRejectedValue(new Error('Start failed'));
      (nifiApiService.stopProcessGroup as jest.Mock).mockRejectedValue(new Error('Stop failed'));

      const { container } = render(<ProcessGroupBox {...mockProps} />);

      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      
      // Try start
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Start')).toBeInTheDocument();
      });
      const startItem = screen.getByText('Start');
      fireEvent.click(startItem);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to start process group:', expect.any(Error));
      });

      // Try stop
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Stop')).toBeInTheDocument();
      });
      const stopItem = screen.getByText('Stop');
      fireEvent.click(stopItem);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to stop process group:', expect.any(Error));
      });

      // Component should remain stable
      expect(screen.getByText('Test Process Group')).toBeInTheDocument();
    });
  });

  describe('Menu Interaction', () => {
    it('should close menu after successful enable operation', async () => {
      (nifiApiService.enableProcessGroup as jest.Mock).mockResolvedValue({});

      const { container } = render(<ProcessGroupBox {...mockProps} />);

      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      
      await waitFor(() => {
        expect(screen.getByText('Enable')).toBeInTheDocument();
      });

      const enableItem = screen.getByText('Enable');
      fireEvent.click(enableItem);

      await waitFor(() => {
        expect(nifiApiService.enableProcessGroup).toHaveBeenCalled();
      });

      // Menu should close after operation
      await waitFor(() => {
        expect(screen.queryByText('Enable')).not.toBeVisible();
      });
    });

    it('should handle rapid clicks on menu items', async () => {
      (nifiApiService.startProcessGroup as jest.Mock).mockResolvedValue({});
      (nifiApiService.stopProcessGroup as jest.Mock).mockResolvedValue({});

      const { container } = render(<ProcessGroupBox {...mockProps} />);

      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      
      // Rapid clicks
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Start')).toBeInTheDocument();
      });
      const startItem = screen.getByText('Start');
      fireEvent.click(startItem);
      fireEvent.click(startItem);
      fireEvent.click(startItem);

      await waitFor(() => {
        expect(nifiApiService.startProcessGroup).toHaveBeenCalled();
      });

      // Should handle gracefully without errors
      expect(screen.getByText('Test Process Group')).toBeInTheDocument();
    });
  });
});

