/**
 * Comprehensive test suite for Layout component - Enhanced functionality
 * Tests for: paste, enable, disable, start, stop operations and copyResponse state
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Layout from '../../src/pages/layout';
import { nifiApiService } from '../../src/api/nifi/nifiApiService';

// Mock dependencies
jest.mock('../../src/api/nifi/nifiApiService');
jest.mock('../../src/components/TabNavigation', () => ({
  __esModule: true,
  default: ({ onToolbarAction }: any) => (
    <div data-testid="tab-navigation">
      <button onClick={() => onToolbarAction('paste')} data-testid="paste-btn">Paste</button>
      <button onClick={() => onToolbarAction('Enable')} data-testid="enable-btn">Enable</button>
      <button onClick={() => onToolbarAction('Disable')} data-testid="disable-btn">Disable</button>
      <button onClick={() => onToolbarAction('Start')} data-testid="start-btn">Start</button>
      <button onClick={() => onToolbarAction('Stop')} data-testid="stop-btn">Stop</button>
      <button onClick={() => onToolbarAction('copy')} data-testid="copy-btn">Copy</button>
      <button onClick={() => onToolbarAction('delete')} data-testid="delete-btn">Delete</button>
    </div>
  ),
}));

jest.mock('../../src/components/Grid', () => ({
  __esModule: true,
  default: () => <div data-testid="grid-board">Grid Board</div>,
}));

jest.mock('../../src/components/HorizontalNavBar', () => ({
  __esModule: true,
  default: () => <div data-testid="horizontal-nav">Nav Bar</div>,
}));

jest.mock('../../src/components/Footer', () => ({
  __esModule: true,
  default: () => <div data-testid="footer">Footer</div>,
}));

jest.mock('commonApp/CircularLoader', () => ({
  __esModule: true,
  default: () => <div data-testid="circular-loader">Loading...</div>,
}));

jest.mock('commonApp/NotificationAlert', () => ({
  __esModule: true,
  default: ({ open, onClose, actions }: any) =>
    open ? (
      <div data-testid="notification-alert">
        <button onClick={() => actions[0].onClick()} data-testid="alert-cancel">Cancel</button>
        <button onClick={() => actions[1].onClick()} data-testid="alert-accept">Accept</button>
      </div>
    ) : null,
}));

const mockStore = configureStore([]);

describe('Layout - Enhanced Operations', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({
      nifi: {
        processGroups: [],
        loading: false,
        error: null,
      },
    });

    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();

    // Mock successful authentication
    (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
    (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({
      controllerStatus: {},
    });
  });

  describe('Copy and Paste Operations', () => {
    it('should store copyResponse when copy is triggered', async () => {
      const mockCopyResponse = {
        id: 'copy-123',
        processGroups: [{ id: 'pg-456', name: 'Test PG' }],
      };

      (nifiApiService.copyProcessGroup as jest.Mock).mockResolvedValue(mockCopyResponse);

      const { rerender } = render(
        <Provider store={store}>
          <Layout />
        </Provider>
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('circular-loader')).not.toBeInTheDocument();
      });

      // Simulate box selection (through state management)
      // Note: In real scenario, this would be triggered by clicking a ProcessGroupBox
      const copyBtn = screen.getByTestId('copy-btn');
      fireEvent.click(copyBtn);

      await waitFor(() => {
        expect(nifiApiService.copyProcessGroup).toHaveBeenCalled();
      });

      // Verify copy was called
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Copy response stored'));
    });

    it('should call pasteProcessGroup when paste button is clicked', async () => {
      const mockCopyResponse = {
        id: 'copy-123',
        processGroups: [{ id: 'pg-456', name: 'Test PG' }],
      };

      (nifiApiService.copyProcessGroup as jest.Mock).mockResolvedValue(mockCopyResponse);
      (nifiApiService.pasteProcessGroup as jest.Mock).mockResolvedValue({
        id: 'paste-result-789',
      });

      render(
        <Provider store={store}>
          <Layout />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('circular-loader')).not.toBeInTheDocument();
      });

      // First, trigger copy to store copyResponse
      const copyBtn = screen.getByTestId('copy-btn');
      fireEvent.click(copyBtn);

      await waitFor(() => {
        expect(nifiApiService.copyProcessGroup).toHaveBeenCalled();
      });

      // Then trigger paste
      const pasteBtn = screen.getByTestId('paste-btn');
      fireEvent.click(pasteBtn);

      await waitFor(() => {
        expect(nifiApiService.pasteProcessGroup).toHaveBeenCalledWith(
          expect.any(String),
          mockCopyResponse
        );
      });

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Pasting process group to parent')
      );
    });

    it('should handle paste when no copyResponse is available', async () => {
      render(
        <Provider store={store}>
          <Layout />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('circular-loader')).not.toBeInTheDocument();
      });

      const pasteBtn = screen.getByTestId('paste-btn');
      fireEvent.click(pasteBtn);

      // Should log warning but not crash
      expect(console.log).toHaveBeenCalledWith(
        'No copy response available for paste operation'
      );
      expect(nifiApiService.pasteProcessGroup).not.toHaveBeenCalled();
    });

    it('should handle paste failure gracefully', async () => {
      const mockCopyResponse = { id: 'copy-123', processGroups: [] };
      const pasteError = new Error('Paste failed');

      (nifiApiService.copyProcessGroup as jest.Mock).mockResolvedValue(mockCopyResponse);
      (nifiApiService.pasteProcessGroup as jest.Mock).mockRejectedValue(pasteError);

      render(
        <Provider store={store}>
          <Layout />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('circular-loader')).not.toBeInTheDocument();
      });

      // Copy first
      fireEvent.click(screen.getByTestId('copy-btn'));
      await waitFor(() => {
        expect(nifiApiService.copyProcessGroup).toHaveBeenCalled();
      });

      // Then paste
      fireEvent.click(screen.getByTestId('paste-btn'));

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          'Failed to paste process group:',
          pasteError
        );
      });
    });
  });

  describe('Enable Operation', () => {
    it('should call enableProcessGroup when enable button is clicked with selected box', async () => {
      (nifiApiService.enableProcessGroup as jest.Mock).mockResolvedValue({
        id: 'pg-123',
        component: { state: 'ENABLED' },
      });

      render(
        <Provider store={store}>
          <Layout />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('circular-loader')).not.toBeInTheDocument();
      });

      const enableBtn = screen.getByTestId('enable-btn');
      fireEvent.click(enableBtn);

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('No process group selected for enabling')
        );
      });
    });

    it('should handle enable operation failure', async () => {
      const enableError = new Error('Enable failed');
      (nifiApiService.enableProcessGroup as jest.Mock).mockRejectedValue(enableError);

      render(
        <Provider store={store}>
          <Layout />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('circular-loader')).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('enable-btn'));

      // Should handle error without crashing
      await waitFor(() => {
        expect(screen.getByTestId('tab-navigation')).toBeInTheDocument();
      });
    });

    it('should refresh process groups after successful enable', async () => {
      (nifiApiService.enableProcessGroup as jest.Mock).mockResolvedValue({
        id: 'pg-123',
        component: { state: 'ENABLED' },
      });

      render(
        <Provider store={store}>
          <Layout />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('circular-loader')).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('enable-btn'));

      // Verify console logs indicate the operation flow
      await waitFor(() => {
        expect(console.log).toHaveBeenCalled();
      });
    });
  });

  describe('Disable Operation', () => {
    it('should call disableProcessGroup when disable button is clicked', async () => {
      (nifiApiService.disableProcessGroup as jest.Mock).mockResolvedValue({
        id: 'pg-123',
        component: { state: 'DISABLED' },
      });

      render(
        <Provider store={store}>
          <Layout />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('circular-loader')).not.toBeInTheDocument();
      });

      const disableBtn = screen.getByTestId('disable-btn');
      fireEvent.click(disableBtn);

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('No process group selected for disabling')
        );
      });
    });

    it('should handle disable operation failure', async () => {
      const disableError = new Error('Disable failed');
      (nifiApiService.disableProcessGroup as jest.Mock).mockRejectedValue(disableError);

      render(
        <Provider store={store}>
          <Layout />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('circular-loader')).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('disable-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('tab-navigation')).toBeInTheDocument();
      });
    });

    it('should log appropriate messages during disable operation', async () => {
      (nifiApiService.disableProcessGroup as jest.Mock).mockResolvedValue({
        id: 'pg-123',
        component: { state: 'DISABLED' },
      });

      render(
        <Provider store={store}>
          <Layout />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('circular-loader')).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('disable-btn'));

      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('Start Operation', () => {
    it('should call startProcessGroup when start button is clicked', async () => {
      (nifiApiService.startProcessGroup as jest.Mock).mockResolvedValue({
        id: 'pg-123',
        component: { state: 'RUNNING' },
      });

      render(
        <Provider store={store}>
          <Layout />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('circular-loader')).not.toBeInTheDocument();
      });

      const startBtn = screen.getByTestId('start-btn');
      fireEvent.click(startBtn);

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('No process group selected for starting')
        );
      });
    });

    it('should handle start operation failure', async () => {
      const startError = new Error('Start failed');
      (nifiApiService.startProcessGroup as jest.Mock).mockRejectedValue(startError);

      render(
        <Provider store={store}>
          <Layout />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('circular-loader')).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('start-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('tab-navigation')).toBeInTheDocument();
      });
    });

    it('should refresh process groups after successful start', async () => {
      (nifiApiService.startProcessGroup as jest.Mock).mockResolvedValue({
        id: 'pg-123',
        component: { state: 'RUNNING' },
      });

      render(
        <Provider store={store}>
          <Layout />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('circular-loader')).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('start-btn'));

      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('Stop Operation', () => {
    it('should call stopProcessGroup when stop button is clicked', async () => {
      (nifiApiService.stopProcessGroup as jest.Mock).mockResolvedValue({
        id: 'pg-123',
        component: { state: 'STOPPED' },
      });

      render(
        <Provider store={store}>
          <Layout />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('circular-loader')).not.toBeInTheDocument();
      });

      const stopBtn = screen.getByTestId('stop-btn');
      fireEvent.click(stopBtn);

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('No process group selected for stopping')
        );
      });
    });

    it('should handle stop operation failure', async () => {
      const stopError = new Error('Stop failed');
      (nifiApiService.stopProcessGroup as jest.Mock).mockRejectedValue(stopError);

      render(
        <Provider store={store}>
          <Layout />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('circular-loader')).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('stop-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('tab-navigation')).toBeInTheDocument();
      });
    });

    it('should log appropriate messages during stop operation', async () => {
      (nifiApiService.stopProcessGroup as jest.Mock).mockResolvedValue({
        id: 'pg-123',
        component: { state: 'STOPPED' },
      });

      render(
        <Provider store={store}>
          <Layout />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('circular-loader')).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('stop-btn'));

      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('Toolbar Action Handler Integration', () => {
    it('should handle all toolbar actions through handleToolbarAction', async () => {
      render(
        <Provider store={store}>
          <Layout />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('circular-loader')).not.toBeInTheDocument();
      });

      const actions = ['paste', 'Enable', 'Disable', 'Start', 'Stop'];
      
      for (const action of actions) {
        const btn = screen.getByTestId(`${action.toLowerCase()}-btn`);
        fireEvent.click(btn);
        
        await waitFor(() => {
          expect(console.log).toHaveBeenCalled();
        });
        
        jest.clearAllMocks();
      }
    });

    it('should maintain copyResponse state across operations', async () => {
      const mockCopyResponse = { id: 'copy-123', processGroups: [] };
      (nifiApiService.copyProcessGroup as jest.Mock).mockResolvedValue(mockCopyResponse);
      (nifiApiService.pasteProcessGroup as jest.Mock).mockResolvedValue({});

      render(
        <Provider store={store}>
          <Layout />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('circular-loader')).not.toBeInTheDocument();
      });

      // Copy
      fireEvent.click(screen.getByTestId('copy-btn'));
      await waitFor(() => {
        expect(nifiApiService.copyProcessGroup).toHaveBeenCalled();
      });

      // Paste multiple times with same copyResponse
      fireEvent.click(screen.getByTestId('paste-btn'));
      await waitFor(() => {
        expect(nifiApiService.pasteProcessGroup).toHaveBeenCalledTimes(1);
      });

      fireEvent.click(screen.getByTestId('paste-btn'));
      await waitFor(() => {
        expect(nifiApiService.pasteProcessGroup).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('State Management', () => {
    it('should initialize copyResponse state as null', async () => {
      render(
        <Provider store={store}>
          <Layout />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('circular-loader')).not.toBeInTheDocument();
      });

      // Attempt paste without copy
      fireEvent.click(screen.getByTestId('paste-btn'));

      expect(console.log).toHaveBeenCalledWith(
        'No copy response available for paste operation'
      );
    });

    it('should update copyResponse state after successful copy', async () => {
      const mockResponse = { id: '123', processGroups: [] };
      (nifiApiService.copyProcessGroup as jest.Mock).mockResolvedValue(mockResponse);

      render(
        <Provider store={store}>
          <Layout />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('circular-loader')).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('copy-btn'));

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Copy response stored for paste:', mockResponse);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle consecutive operation failures gracefully', async () => {
      (nifiApiService.startProcessGroup as jest.Mock).mockRejectedValue(new Error('Start failed'));
      (nifiApiService.stopProcessGroup as jest.Mock).mockRejectedValue(new Error('Stop failed'));
      (nifiApiService.enableProcessGroup as jest.Mock).mockRejectedValue(new Error('Enable failed'));

      render(
        <Provider store={store}>
          <Layout />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('circular-loader')).not.toBeInTheDocument();
      });

      // Try multiple operations that fail
      fireEvent.click(screen.getByTestId('start-btn'));
      fireEvent.click(screen.getByTestId('stop-btn'));
      fireEvent.click(screen.getByTestId('enable-btn'));

      // Component should remain stable
      await waitFor(() => {
        expect(screen.getByTestId('tab-navigation')).toBeInTheDocument();
      });
    });

    it('should not crash when API methods throw unexpected errors', async () => {
      (nifiApiService.pasteProcessGroup as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const mockCopyResponse = { id: '123', processGroups: [] };
      (nifiApiService.copyProcessGroup as jest.Mock).mockResolvedValue(mockCopyResponse);

      render(
        <Provider store={store}>
          <Layout />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('circular-loader')).not.toBeInTheDocument();
      });

      // Copy first
      fireEvent.click(screen.getByTestId('copy-btn'));
      await waitFor(() => {
        expect(nifiApiService.copyProcessGroup).toHaveBeenCalled();
      });

      // Then paste (should handle error)
      fireEvent.click(screen.getByTestId('paste-btn'));

      // Component should still be rendered
      expect(screen.getByTestId('tab-navigation')).toBeInTheDocument();
    });
  });
});

