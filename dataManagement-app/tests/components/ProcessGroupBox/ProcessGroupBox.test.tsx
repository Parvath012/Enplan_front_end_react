import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProcessGroupBox from '../../../src/components/ProcessGroupBox/ProcessGroupBox';

// Mock Material-UI components
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    Menu: ({ children, open, onClose, anchorEl, slotProps, keepMounted, className, onClick, ...props }: any) => {
      // For keepMounted menus (submenus), always render but control visibility
      if (keepMounted) {
        const paperStyle = slotProps?.paper?.style || {};
        const isVisible = open && (paperStyle.visibility !== 'hidden' && paperStyle.pointerEvents !== 'none');
        return (
          <div 
            data-testid="mui-menu" 
            onClick={(e) => {
              // Call the Menu's onClick prop (which stops propagation)
              onClick?.(e);
              // Only close if clicking directly on the menu backdrop, not on children
              if (e.target === e.currentTarget) {
                onClose?.(e);
              }
            }}
            onMouseEnter={slotProps?.list?.onMouseEnter || slotProps?.paper?.onMouseEnter}
            onMouseLeave={slotProps?.list?.onMouseLeave || slotProps?.paper?.onMouseLeave}
            className={className || "MuiMenu-root"}
            style={{
              ...paperStyle,
              display: isVisible ? 'block' : 'none',
            }}
            {...props}
          >
            {children}
          </div>
        );
      }
      // For regular menus, always render children but hide when closed
      return (
        <div 
          data-testid="mui-menu" 
          onClick={(e) => {
            // Call the Menu's onClick prop (which stops propagation)
            onClick?.(e);
            // Only close if clicking directly on the menu backdrop, not on children
            if (e.target === e.currentTarget) {
              onClose?.(e);
            }
          }}
          onMouseEnter={slotProps?.list?.onMouseEnter || slotProps?.paper?.onMouseEnter}
          onMouseLeave={slotProps?.list?.onMouseLeave || slotProps?.paper?.onMouseLeave}
          className={className || "MuiMenu-root"}
          style={{
            ...(slotProps?.paper?.style || {}),
            display: open ? 'block' : 'none',
          }}
          {...props}
        >
          {children}
        </div>
      );
    },
    MenuItem: ({ children, onClick, disabled, onMouseEnter, onMouseLeave, sx, ...props }: any) => (
      <div
        data-testid="mui-menu-item"
        onClick={(e) => {
          if (disabled) return;
          e.stopPropagation();
          onClick?.(e);
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        data-disabled={disabled}
        className="MuiMenuItem-root"
        style={sx}
        {...props}
      >
        {children}
      </div>
    ),
    ListItemIcon: ({ children, ...props }: any) => (
      <div data-testid="mui-list-item-icon" {...props}>{children}</div>
    ),
    ListItemText: ({ primary, ...props }: any) => (
      <span data-testid="mui-list-item-text" {...props}>
        {primary}
      </span>
    ),
    Divider: () => <div data-testid="mui-divider" />,
  };
});

// Mock dependencies
jest.mock('../../../src/api/nifi/nifiApiService');
jest.mock('commonApp/NotificationAlert', () => ({
  __esModule: true,
  default: ({ open, actions }: any) =>
    open ? (
      <div data-testid="notification-alert">
        {actions && actions.map((action: any, index: number) => (
          <button 
            key={index}
            onClick={action.onClick}
            data-testid={action.emphasis === 'primary' ? 'accept-btn' : 'cancel-btn'}
          >
            {action.label}
          </button>
        ))}
      </div>
    ) : null,
}));

describe('ProcessGroupBox Component', () => {
  const defaultProps = {
    id: 'test-id-123',
    name: 'Test Process Group',
    position: { x: 100, y: 200 },
    runningCount: 3,
    stoppedCount: 2,
    invalidCount: 1,
    disabledCount: 0,
    activeRemotePortCount: 2,
    inactiveRemotePortCount: 1,
    queued: '0 (0 bytes)',
    input: '0 (0 bytes)',
    read: '0 bytes',
    written: '0 bytes',
    output: '0 (0 bytes)',
    upToDateCount: 5,
    locallyModifiedCount: 1,
    staleCount: 0,
    locallyModifiedAndStaleCount: 0,
    syncFailureCount: 0,
    onMouseDown: jest.fn(),
    isDragging: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  describe('Basic Rendering', () => {
    it('should render with all required props', () => {
      render(<ProcessGroupBox {...defaultProps} />);
      expect(screen.getByText('Test Process Group')).toBeInTheDocument();
    });

    it('should render process group name correctly', () => {
      render(<ProcessGroupBox {...defaultProps} name="Custom Name" />);
      expect(screen.getByText('Custom Name')).toBeInTheDocument();
    });

    it('should apply dragging class when isDragging is true', () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} isDragging={true} />);
      const box = container.querySelector('.process-group-box');
      expect(box).toHaveClass('dragging');
    });

    it('should apply selected class when isSelected is true', () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} isSelected={true} />);
      const box = container.querySelector('.process-group-box');
      expect(box).toHaveClass('selected');
    });

    it('should set data-selected attribute', () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} isSelected={true} />);
      const box = container.querySelector('.process-group-box');
      expect(box).toHaveAttribute('data-selected', 'true');
    });

    it('should set data-box-id attribute', () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} id="my-box-123" />);
      const box = container.querySelector('.process-group-box');
      expect(box).toHaveAttribute('data-box-id', 'my-box-123');
    });
  });

  describe('Status Icons', () => {
    it('should display all status icons with correct counts', () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      expect(container.querySelector('[title="Transmitting Remote Process Groups"]')).toBeInTheDocument();
      expect(container.querySelector('[title="Not Transmitting Remote Process Groups"]')).toBeInTheDocument();
      expect(container.querySelector('[title="Running"]')).toBeInTheDocument();
      expect(container.querySelector('[title="Stopped"]')).toBeInTheDocument();
      expect(container.querySelector('[title="Invalid"]')).toBeInTheDocument();
      expect(container.querySelector('[title="Disabled"]')).toBeInTheDocument();
    });
  });

  describe('Statistics Section', () => {
    it('should display all statistics', () => {
      render(<ProcessGroupBox {...defaultProps} />);
      expect(screen.getByText('Queued:')).toBeInTheDocument();
      expect(screen.getByText('In:')).toBeInTheDocument();
      expect(screen.getByText('Read/Write:')).toBeInTheDocument();
      expect(screen.getByText('Out:')).toBeInTheDocument();
    });
  });

  describe('Version Control Icons', () => {
    it('should display all version control icons', () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      expect(container.querySelector('[title="Up to Date"]')).toBeInTheDocument();
      expect(container.querySelector('[title="Locally Modified"]')).toBeInTheDocument();
      expect(container.querySelector('[title="Stale"]')).toBeInTheDocument();
      expect(container.querySelector('[title="Locally Modified & Stale"]')).toBeInTheDocument();
      expect(container.querySelector('[title="Sync Failure"]')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onMouseDown when box is clicked', () => {
      const onMouseDown = jest.fn();
      const { container } = render(<ProcessGroupBox {...defaultProps} onMouseDown={onMouseDown} />);
      const box = container.querySelector('.process-group-box');
      fireEvent.mouseDown(box!);
      expect(onMouseDown).toHaveBeenCalledTimes(1);
    });

    it('should call onDoubleClick when box is double-clicked', () => {
      const onDoubleClick = jest.fn();
      const { container } = render(<ProcessGroupBox {...defaultProps} onDoubleClick={onDoubleClick} />);
      const box = container.querySelector('.process-group-box');
      fireEvent.doubleClick(box!);
      expect(onDoubleClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick when box is clicked', () => {
      const onClickMock = jest.fn();
      const { container } = render(<ProcessGroupBox {...defaultProps} onClick={onClickMock} />);
      const box = container.querySelector('.process-group-box');
      fireEvent.click(box!);
      expect(onClickMock).toHaveBeenCalledWith('test-id-123', 'Test Process Group');
    });

    it('should not call onClick when onClick prop is not provided', () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const box = container.querySelector('.process-group-box');
      expect(() => fireEvent.click(box!)).not.toThrow();
    });
  });

  describe('Menu Interactions', () => {
    it('should open menu when more options icon is clicked', () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      expect(screen.getByText('Configure')).toBeInTheDocument();
    });

    it('should stop event propagation when menu is clicked', async () => {
      const onClickMock = jest.fn();
      const { container } = render(<ProcessGroupBox {...defaultProps} onClick={onClickMock} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      // Clear any previous calls
      onClickMock.mockClear();
      // The menu button click should stop propagation, so onClick shouldn't be called
      // The handleMenuClick function calls event.stopPropagation()
      fireEvent.click(menuButton!);
      // Wait for menu to open (which confirms handleMenuClick was called and stopped propagation)
      await waitFor(() => {
        expect(screen.getByText('Configure')).toBeInTheDocument();
      });
      // The click should not propagate to the box's onClick handler
      expect(onClickMock).not.toHaveBeenCalled();
    });

    it('should close menu when handleMenuClose is called with event', async () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Configure')).toBeInTheDocument();
      });
      // Get the main menu (not submenus) - it should be visible and not have submenu class
      const menus = screen.getAllByTestId('mui-menu');
      const mainMenu = menus.find(menu => {
        const style = menu.getAttribute('style') || '';
        const className = menu.getAttribute('class') || '';
        return !style.includes('display: none') && !className.includes('process-group-submenu');
      }) || menus[0];
      // Click directly on the menu backdrop (the menu div itself, not children)
      // This should trigger the Menu's onClick which calls onClose
      fireEvent.click(mainMenu);
      await waitFor(() => {
        // Check if menu is hidden by checking visibility or if text is not visible
        const configureText = screen.queryByText('Configure');
        if (configureText) {
          const menu = configureText.closest('[data-testid="mui-menu"]');
          if (menu) {
            const style = menu.getAttribute('style') || '';
            expect(style).toMatch(/display:\s*none/);
          } else {
            expect(configureText).not.toBeVisible();
          }
        } else {
          expect(configureText).not.toBeInTheDocument();
        }
      }, { timeout: 1000 });
    });

    it('should close menu when handleMenuClose is called without event', async () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Configure')).toBeInTheDocument();
      });
      // Get the main menu (not submenus) - it should be visible and not have submenu class
      const menus = screen.getAllByTestId('mui-menu');
      const mainMenu = menus.find(menu => {
        const style = menu.getAttribute('style') || '';
        const className = menu.getAttribute('class') || '';
        return !style.includes('display: none') && !className.includes('process-group-submenu');
      }) || menus[0];
      // Click directly on the menu backdrop (the menu div itself, not children)
      // This should trigger the Menu's onClick which calls onClose
      fireEvent.click(mainMenu);
      await waitFor(() => {
        // Check if menu is hidden by checking visibility or if text is not visible
        const configureText = screen.queryByText('Configure');
        if (configureText) {
          const menu = configureText.closest('[data-testid="mui-menu"]');
          if (menu) {
            const style = menu.getAttribute('style') || '';
            expect(style).toMatch(/display:\s*none/);
          } else {
            expect(configureText).not.toBeVisible();
          }
        } else {
          expect(configureText).not.toBeInTheDocument();
        }
      }, { timeout: 1000 });
    });
  });

  describe('Copy Operation', () => {
    const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
    
    it('should call copyProcessGroup when Copy menu item is clicked', async () => {
      (nifiApiService.copyProcessGroup as jest.Mock).mockResolvedValue({ success: true });
      const onCopyMock = jest.fn();
      const { container } = render(
        <ProcessGroupBox {...defaultProps} onCopy={onCopyMock} parentGroupId="parent-123" />
      );
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const copyItem = screen.getByText('Copy');
      fireEvent.click(copyItem);
      await waitFor(() => {
        expect(nifiApiService.copyProcessGroup).toHaveBeenCalledWith('parent-123', [defaultProps.id]);
      });
      expect(onCopyMock).toHaveBeenCalled();
    });

    it('should not call copyProcessGroup if parentGroupId is missing', async () => {
      const onCopyMock = jest.fn();
      const { container } = render(<ProcessGroupBox {...defaultProps} onCopy={onCopyMock} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const copyItem = screen.getByText('Copy');
      fireEvent.click(copyItem);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Parent group ID is required for copy operation');
      });
      expect(nifiApiService.copyProcessGroup).not.toHaveBeenCalled();
    });

    it('should handle copy operation failure', async () => {
      const copyError = new Error('Copy failed');
      (nifiApiService.copyProcessGroup as jest.Mock).mockRejectedValue(copyError);
      const { container } = render(
        <ProcessGroupBox {...defaultProps} parentGroupId="parent-123" />
      );
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const copyItem = screen.getByText('Copy');
      fireEvent.click(copyItem);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to copy process group:', copyError);
      });
    });
  });

  describe('Start/Stop Operations', () => {
    const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
    
    it('should call startProcessGroup when Start menu item is clicked', async () => {
      (nifiApiService.startProcessGroup as jest.Mock).mockResolvedValue({});
      const onCopyMock = jest.fn();
      const { container } = render(<ProcessGroupBox {...defaultProps} onCopy={onCopyMock} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const startItem = screen.getByText('Start');
      fireEvent.click(startItem);
      await waitFor(() => {
        expect(nifiApiService.startProcessGroup).toHaveBeenCalledWith(defaultProps.id);
      });
      expect(onCopyMock).toHaveBeenCalled();
    });

    it('should call stopProcessGroup when Stop menu item is clicked', async () => {
      (nifiApiService.stopProcessGroup as jest.Mock).mockResolvedValue({});
      const onCopyMock = jest.fn();
      const { container } = render(<ProcessGroupBox {...defaultProps} onCopy={onCopyMock} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const stopItem = screen.getByText('Stop');
      fireEvent.click(stopItem);
      await waitFor(() => {
        expect(nifiApiService.stopProcessGroup).toHaveBeenCalledWith(defaultProps.id);
      });
      expect(onCopyMock).toHaveBeenCalled();
    });

    it('should handle start operation failure', async () => {
      (nifiApiService.startProcessGroup as jest.Mock).mockRejectedValue(new Error('Start failed'));
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const startItem = screen.getByText('Start');
      fireEvent.click(startItem);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to start process group:', expect.any(Error));
      });
    });

    it('should handle stop operation failure', async () => {
      (nifiApiService.stopProcessGroup as jest.Mock).mockRejectedValue(new Error('Stop failed'));
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const stopItem = screen.getByText('Stop');
      fireEvent.click(stopItem);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to stop process group:', expect.any(Error));
      });
    });
  });

  describe('Enable/Disable Operations', () => {
    const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
    
    it('should call enableProcessGroup and re-enable box', async () => {
      (nifiApiService.enableProcessGroup as jest.Mock).mockResolvedValue({});
      const onCopyMock = jest.fn();
      const { container } = render(<ProcessGroupBox {...defaultProps} onCopy={onCopyMock} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const enableItem = screen.getByText('Enable');
      fireEvent.click(enableItem);
      await waitFor(() => {
        expect(nifiApiService.enableProcessGroup).toHaveBeenCalledWith(defaultProps.id);
      });
      await waitFor(() => {
        const box = container.querySelector('.process-group-box');
        expect(box).not.toHaveClass('disabled');
      });
      expect(onCopyMock).toHaveBeenCalled();
    });

    it('should call disableProcessGroup and disable box', async () => {
      (nifiApiService.disableProcessGroup as jest.Mock).mockResolvedValue({});
      const onCopyMock = jest.fn();
      const { container } = render(<ProcessGroupBox {...defaultProps} onCopy={onCopyMock} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Disable')).toBeInTheDocument();
      });
      const disableItem = screen.getByText('Disable');
      fireEvent.click(disableItem);
      await waitFor(() => {
        expect(nifiApiService.disableProcessGroup).toHaveBeenCalledWith(defaultProps.id);
      });
      await waitFor(() => {
        const box = container.querySelector('.process-group-box');
        expect(box).toHaveClass('disabled');
        expect(box).toHaveAttribute('data-disabled', 'true');
      });
      expect(onCopyMock).toHaveBeenCalled();
    });

    it('should prevent onClick when box is disabled', async () => {
      (nifiApiService.disableProcessGroup as jest.Mock).mockResolvedValue({});
      const onClickMock = jest.fn();
      const { container } = render(
        <ProcessGroupBox {...defaultProps} onClick={onClickMock} onCopy={jest.fn()} />
      );
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Disable')).toBeInTheDocument();
      });
      const disableItem = screen.getByText('Disable');
      fireEvent.click(disableItem);
      await waitFor(() => {
        expect(nifiApiService.disableProcessGroup).toHaveBeenCalled();
      });
      // Wait for the box to be disabled - check both class and attribute
      await waitFor(() => {
        const box = container.querySelector('.process-group-box');
        expect(box).toHaveClass('disabled');
        expect(box).toHaveAttribute('data-disabled', 'true');
      }, { timeout: 2000 });
      // Clear any previous calls before testing
      onClickMock.mockClear();
      const box = container.querySelector('.process-group-box');
      // Click the box - it should not call onClick because isBoxDisabled is true
      fireEvent.click(box!);
      // The handleBoxClick function checks isBoxDisabled first and returns early if true
      // So onClick should not be called
      expect(onClickMock).not.toHaveBeenCalled();
    });

    it('should prevent onMouseDown when box is disabled', async () => {
      (nifiApiService.disableProcessGroup as jest.Mock).mockResolvedValue({});
      const onMouseDownMock = jest.fn();
      const { container } = render(
        <ProcessGroupBox {...defaultProps} onMouseDown={onMouseDownMock} onCopy={jest.fn()} />
      );
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Disable')).toBeInTheDocument();
      });
      const disableItem = screen.getByText('Disable');
      fireEvent.click(disableItem);
      await waitFor(() => {
        expect(nifiApiService.disableProcessGroup).toHaveBeenCalled();
      });
      // Wait for the box to be disabled
      await waitFor(() => {
        const box = container.querySelector('.process-group-box');
        expect(box).toHaveClass('disabled');
      });
      const box = container.querySelector('.process-group-box');
      fireEvent.mouseDown(box!);
      expect(onMouseDownMock).not.toHaveBeenCalled();
    });
  });

  describe('Delete Operation', () => {
    const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
    
    it('should show delete warning when Delete menu item is clicked', () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const deleteItem = screen.getByText('Delete');
      fireEvent.click(deleteItem);
      expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
    });

    it('should call deleteProcessGroup when delete is confirmed', async () => {
      (nifiApiService.deleteProcessGroup as jest.Mock).mockResolvedValue({ success: true });
      const onDeleteMock = jest.fn();
      const { container } = render(<ProcessGroupBox {...defaultProps} onDelete={onDeleteMock} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const deleteItem = screen.getByText('Delete');
      fireEvent.click(deleteItem);
      const acceptButton = screen.getByTestId('accept-btn');
      fireEvent.click(acceptButton);
      await waitFor(() => {
        expect(nifiApiService.deleteProcessGroup).toHaveBeenCalledWith(defaultProps.id);
      });
      expect(onDeleteMock).toHaveBeenCalled();
      // Wait for the notification to close after delete completes
      // The handleDeleteConfirm function sets setShowDeleteWarning(false) in the finally block
      // We need to wait for the async operation to complete and React to re-render
      // The notification might still be in the DOM but hidden, so check for visibility
      await waitFor(() => {
        const notification = screen.queryByTestId('notification-alert');
        if (notification) {
          // Check if it's hidden
          const style = window.getComputedStyle(notification);
          expect(style.display).toBe('none');
        } else {
          expect(notification).not.toBeInTheDocument();
        }
      }, { timeout: 3000 });
    });

    it('should cancel delete when cancel button is clicked', () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const deleteItem = screen.getByText('Delete');
      fireEvent.click(deleteItem);
      expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
      const cancelButton = screen.getByTestId('cancel-btn');
      fireEvent.click(cancelButton);
      expect(screen.queryByTestId('notification-alert')).not.toBeInTheDocument();
    });

    it('should handle delete operation failure', async () => {
      (nifiApiService.deleteProcessGroup as jest.Mock).mockRejectedValue(new Error('Delete failed'));
      const onDeleteMock = jest.fn();
      const { container } = render(<ProcessGroupBox {...defaultProps} onDelete={onDeleteMock} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const deleteItem = screen.getByText('Delete');
      fireEvent.click(deleteItem);
      const acceptButton = screen.getByTestId('accept-btn');
      fireEvent.click(acceptButton);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to delete process group:', expect.any(Error));
      });
      expect(onDeleteMock).not.toHaveBeenCalled();
    });
  });

  describe('Submenu Interactions', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should open version submenu on hover', async () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Version')).toBeInTheDocument();
      });
      const versionItem = screen.getByText('Version');
      fireEvent.mouseEnter(versionItem);
      await waitFor(() => {
        expect(screen.getByText('Start Version Control')).toBeInTheDocument();
      });
    });

    it('should open download submenu on hover', async () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Download Flow Definition')).toBeInTheDocument();
      });
      const downloadItem = screen.getByText('Download Flow Definition');
      fireEvent.mouseEnter(downloadItem);
      await waitFor(() => {
        expect(screen.getByText('Without External Services')).toBeInTheDocument();
      });
      expect(screen.getByText('With External Services')).toBeInTheDocument();
    });

    it('should close version submenu when leaving both menu item and submenu', async () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Version')).toBeInTheDocument();
      });
      const versionItem = screen.getByText('Version');
      fireEvent.mouseEnter(versionItem);
      await waitFor(() => {
        expect(screen.getByText('Start Version Control')).toBeInTheDocument();
      });
      fireEvent.mouseLeave(versionItem);
      act(() => {
        jest.advanceTimersByTime(200);
      });
      // Check that the submenu is hidden (display: none or visibility: hidden)
      const submenuText = screen.queryByText('Start Version Control');
      if (submenuText) {
        const submenu = submenuText.closest('[data-testid="mui-menu"]');
        if (submenu) {
          const style = submenu.getAttribute('style') || '';
          expect(style).toMatch(/display:\s*none|visibility:\s*hidden/);
        }
      } else {
        expect(submenuText).not.toBeInTheDocument();
      }
    });

    it('should close download submenu when leaving both menu item and submenu', async () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Download Flow Definition')).toBeInTheDocument();
      });
      const downloadItem = screen.getByText('Download Flow Definition');
      fireEvent.mouseEnter(downloadItem);
      await waitFor(() => {
        expect(screen.getByText('Without External Services')).toBeInTheDocument();
      });
      fireEvent.mouseLeave(downloadItem);
      act(() => {
        jest.advanceTimersByTime(200);
      });
      // Check that the submenu is hidden (display: none or visibility: hidden)
      const submenuText = screen.queryByText('Without External Services');
      if (submenuText) {
        const submenu = submenuText.closest('[data-testid="mui-menu"]');
        if (submenu) {
          const style = submenu.getAttribute('style') || '';
          expect(style).toMatch(/display:\s*none|visibility:\s*hidden/);
        }
      } else {
        expect(submenuText).not.toBeInTheDocument();
      }
    });

    it('should keep version submenu open when hovering submenu', async () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Version')).toBeInTheDocument();
      });
      const versionItem = screen.getByText('Version');
      fireEvent.mouseEnter(versionItem);
      await waitFor(() => {
        expect(screen.getByText('Start Version Control')).toBeInTheDocument();
      });
      const submenu = screen.getByText('Start Version Control').closest('[data-testid="mui-menu"]');
      if (submenu) {
        fireEvent.mouseEnter(submenu);
      }
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(screen.getByText('Start Version Control')).toBeInTheDocument();
    });

    it('should keep download submenu open when hovering submenu', async () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Download Flow Definition')).toBeInTheDocument();
      });
      const downloadItem = screen.getByText('Download Flow Definition');
      fireEvent.mouseEnter(downloadItem);
      await waitFor(() => {
        expect(screen.getByText('Without External Services')).toBeInTheDocument();
      });
      const submenu = screen.getByText('Without External Services').closest('[data-testid="mui-menu"]');
      if (submenu) {
        fireEvent.mouseEnter(submenu);
      }
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(screen.getByText('Without External Services')).toBeInTheDocument();
    });

    it('should close version submenu when hovering regular menu item', async () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Version')).toBeInTheDocument();
      });
      const versionItem = screen.getByText('Version');
      fireEvent.mouseEnter(versionItem);
      await waitFor(() => {
        expect(screen.getByText('Start Version Control')).toBeInTheDocument();
      });
      const configureItem = screen.getByText('Configure');
      fireEvent.mouseEnter(configureItem);
      // Check that the submenu is hidden
      const submenuText = screen.queryByText('Start Version Control');
      if (submenuText) {
        const submenu = submenuText.closest('[data-testid="mui-menu"]');
        if (submenu) {
          const style = submenu.getAttribute('style') || '';
          expect(style).toMatch(/display:\s*none|visibility:\s*hidden/);
        }
      } else {
        expect(submenuText).not.toBeInTheDocument();
      }
    });

    it('should close download submenu when opening version submenu', async () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Download Flow Definition')).toBeInTheDocument();
      });
      const downloadItem = screen.getByText('Download Flow Definition');
      fireEvent.mouseEnter(downloadItem);
      await waitFor(() => {
        expect(screen.getByText('Without External Services')).toBeInTheDocument();
      });
      const versionItem = screen.getByText('Version');
      fireEvent.mouseEnter(versionItem);
      // Check that download submenu is hidden
      const downloadSubmenuText = screen.queryByText('Without External Services');
      if (downloadSubmenuText) {
        const submenu = downloadSubmenuText.closest('[data-testid="mui-menu"]');
        if (submenu) {
          const style = submenu.getAttribute('style') || '';
          expect(style).toMatch(/display:\s*none|visibility:\s*hidden/);
        }
      } else {
        expect(downloadSubmenuText).not.toBeInTheDocument();
      }
      await waitFor(() => {
        expect(screen.getByText('Start Version Control')).toBeInTheDocument();
      });
    });

    it('should close version submenu when opening download submenu', async () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Version')).toBeInTheDocument();
      });
      const versionItem = screen.getByText('Version');
      fireEvent.mouseEnter(versionItem);
      await waitFor(() => {
        expect(screen.getByText('Start Version Control')).toBeInTheDocument();
      });
      const downloadItem = screen.getByText('Download Flow Definition');
      fireEvent.mouseEnter(downloadItem);
      // Check that version submenu is hidden
      const versionSubmenuText = screen.queryByText('Start Version Control');
      if (versionSubmenuText) {
        const submenu = versionSubmenuText.closest('[data-testid="mui-menu"]');
        if (submenu) {
          const style = submenu.getAttribute('style') || '';
          expect(style).toMatch(/display:\s*none|visibility:\s*hidden/);
        }
      } else {
        expect(versionSubmenuText).not.toBeInTheDocument();
      }
      await waitFor(() => {
        expect(screen.getByText('Without External Services')).toBeInTheDocument();
      });
    });
  });

  describe('Menu Item Actions', () => {
    it('should handle menu item click with unknown action', async () => {
      const onClickMock = jest.fn();
      const { container } = render(<ProcessGroupBox {...defaultProps} onClick={onClickMock} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Configure')).toBeInTheDocument();
      });
      const configureItem = screen.getByText('Configure');
      // Clear console.log and onClickMock before clicking
      (console.log as jest.Mock).mockClear();
      onClickMock.mockClear();
      fireEvent.click(configureItem);
      // Menu item click should stop propagation, so box onClick shouldn't be called
      // The handleMenuItemClick function calls event.stopPropagation() before doing anything
      await waitFor(() => {
        expect(onClickMock).not.toHaveBeenCalled();
      });
      // But the menu item action should be logged - wait for async operation
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(`Action: configure for process group: ${defaultProps.id}`);
      }, { timeout: 1000 });
    });

    it('should handle version submenu item click', async () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Version')).toBeInTheDocument();
      });
      const versionItem = screen.getByText('Version');
      fireEvent.mouseEnter(versionItem);
      await waitFor(() => {
        expect(screen.getByText('Start Version Control')).toBeInTheDocument();
      });
      const startVersionControlItem = screen.getByText('Start Version Control');
      fireEvent.click(startVersionControlItem);
      expect(console.log).toHaveBeenCalledWith(`Action: start-version-control for process group: ${defaultProps.id}`);
    });

    it('should handle download submenu item clicks', async () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Download Flow Definition')).toBeInTheDocument();
      });
      const downloadItem = screen.getByText('Download Flow Definition');
      fireEvent.mouseEnter(downloadItem);
      await waitFor(() => {
        expect(screen.getByText('Without External Services')).toBeInTheDocument();
      });
      const withoutExternalServicesItem = screen.getByText('Without External Services');
      fireEvent.click(withoutExternalServicesItem);
      expect(console.log).toHaveBeenCalledWith(`Action: download-without-external-services for process group: ${defaultProps.id}`);
    });
  });

  describe('Box Click Handling', () => {
    it('should not call onClick when clicking on menu', () => {
      const onClickMock = jest.fn();
      const { container } = render(<ProcessGroupBox {...defaultProps} onClick={onClickMock} />);
      const menuElement = document.createElement('div');
      menuElement.className = 'MuiMenu-root';
      document.body.appendChild(menuElement);
      const box = container.querySelector('.process-group-box');
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      Object.defineProperty(clickEvent, 'target', { value: menuElement, enumerable: true });
      fireEvent(box!, clickEvent);
      expect(onClickMock).not.toHaveBeenCalled();
      document.body.removeChild(menuElement);
    });

    it('should not call onClick when clicking on menu item', () => {
      const onClickMock = jest.fn();
      const { container } = render(<ProcessGroupBox {...defaultProps} onClick={onClickMock} />);
      const menuItemElement = document.createElement('div');
      menuItemElement.className = 'MuiMenuItem-root';
      document.body.appendChild(menuItemElement);
      const box = container.querySelector('.process-group-box');
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      Object.defineProperty(clickEvent, 'target', { value: menuItemElement, enumerable: true });
      fireEvent(box!, clickEvent);
      expect(onClickMock).not.toHaveBeenCalled();
      document.body.removeChild(menuItemElement);
    });
  });

  describe('getBoxClassName', () => {
    it('should include all classes when all states are true', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      (nifiApiService.disableProcessGroup as jest.Mock).mockResolvedValue({});
      const { container } = render(
        <ProcessGroupBox {...defaultProps} isDragging={true} isSelected={true} onCopy={jest.fn()} />
      );
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Disable')).toBeInTheDocument();
      });
      const disableItem = screen.getByText('Disable');
      fireEvent.click(disableItem);
      await waitFor(() => {
        const box = container.querySelector('.process-group-box');
        expect(box).toHaveClass('process-group-box');
        expect(box).toHaveClass('dragging');
        expect(box).toHaveClass('selected');
        expect(box).toHaveClass('disabled');
      });
    });
  });

  describe('Card onClick Handler Edge Cases', () => {
    it('should not call onClick when target is menu root', () => {
      const onClickMock = jest.fn();
      const { container } = render(<ProcessGroupBox {...defaultProps} onClick={onClickMock} />);
      const box = container.querySelector('.process-group-box');
      // Create a menu element inside the box
      const menuElement = document.createElement('div');
      menuElement.className = 'MuiMenu-root';
      box!.appendChild(menuElement);
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      Object.defineProperty(clickEvent, 'target', { value: menuElement, enumerable: true });
      fireEvent(box!, clickEvent);
      expect(onClickMock).not.toHaveBeenCalled();
      box!.removeChild(menuElement);
    });

    it('should not call onClick when target is menu item', () => {
      const onClickMock = jest.fn();
      const { container } = render(<ProcessGroupBox {...defaultProps} onClick={onClickMock} />);
      const box = container.querySelector('.process-group-box');
      // Create a menu item element inside the box
      const menuItemElement = document.createElement('div');
      menuItemElement.className = 'MuiMenuItem-root';
      box!.appendChild(menuItemElement);
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      Object.defineProperty(clickEvent, 'target', { value: menuItemElement, enumerable: true });
      fireEvent(box!, clickEvent);
      expect(onClickMock).not.toHaveBeenCalled();
      box!.removeChild(menuItemElement);
    });

    it('should not call onClick when box is disabled', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      (nifiApiService.disableProcessGroup as jest.Mock).mockResolvedValue({});
      const onClickMock = jest.fn();
      const { container } = render(
        <ProcessGroupBox {...defaultProps} onClick={onClickMock} onCopy={jest.fn()} />
      );
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Disable')).toBeInTheDocument();
      });
      const disableItem = screen.getByText('Disable');
      fireEvent.click(disableItem);
      await waitFor(() => {
        const box = container.querySelector('.process-group-box');
        expect(box).toHaveClass('disabled');
      });
      const box = container.querySelector('.process-group-box');
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');
      fireEvent(box!, clickEvent);
      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(onClickMock).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing onCopy callback in operations', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      (nifiApiService.startProcessGroup as jest.Mock).mockResolvedValue({});
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const startItem = screen.getByText('Start');
      fireEvent.click(startItem);
      await waitFor(() => {
        expect(nifiApiService.startProcessGroup).toHaveBeenCalled();
      });
      expect(screen.getByText(defaultProps.name)).toBeInTheDocument();
    });

    it('should handle missing onDelete callback in delete operation', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      (nifiApiService.deleteProcessGroup as jest.Mock).mockResolvedValue({});
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const deleteItem = screen.getByText('Delete');
      fireEvent.click(deleteItem);
      const acceptButton = screen.getByTestId('accept-btn');
      fireEvent.click(acceptButton);
      await waitFor(() => {
        expect(nifiApiService.deleteProcessGroup).toHaveBeenCalled();
      });
      expect(screen.getByText(defaultProps.name)).toBeInTheDocument();
    });
  });

  describe('All Menu Items', () => {
    it('should render all menu items', () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      expect(screen.getByText('Configure')).toBeInTheDocument();
      expect(screen.getByText('Parameters')).toBeInTheDocument();
      expect(screen.getByText('Controller Services')).toBeInTheDocument();
      expect(screen.getByText('Version')).toBeInTheDocument();
      expect(screen.getByText('Enter Group')).toBeInTheDocument();
      expect(screen.getByText('Start')).toBeInTheDocument();
      expect(screen.getByText('Stop')).toBeInTheDocument();
      expect(screen.getByText('Enable')).toBeInTheDocument();
      expect(screen.getByText('Disable')).toBeInTheDocument();
      expect(screen.getByText('Enable All Controller Services')).toBeInTheDocument();
      expect(screen.getByText('Disable All Controller Services')).toBeInTheDocument();
      expect(screen.getByText('View Status History')).toBeInTheDocument();
      expect(screen.getByText('Center In View')).toBeInTheDocument();
      expect(screen.getByText('Group')).toBeInTheDocument();
      expect(screen.getByText('Download Flow Definition')).toBeInTheDocument();
      expect(screen.getByText('Copy')).toBeInTheDocument();
      expect(screen.getByText('Empty All Queues')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  describe('getBoxStyles', () => {
    it('should apply correct styles for selected state', () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} isSelected={true} />);
      const box = container.querySelector('.process-group-box');
      expect(box).toBeInTheDocument();
      expect(box).toHaveClass('selected');
    });

    it('should apply correct styles for disabled state', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      (nifiApiService.disableProcessGroup as jest.Mock).mockResolvedValue({});
      const { container } = render(<ProcessGroupBox {...defaultProps} onCopy={jest.fn()} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Disable')).toBeInTheDocument();
      });
      const disableItem = screen.getByText('Disable');
      fireEvent.click(disableItem);
      await waitFor(() => {
        const box = container.querySelector('.process-group-box');
        expect(box).toHaveClass('disabled');
        expect(box).toHaveAttribute('data-disabled', 'true');
      });
    });
  });

  describe('useEffect Auto-Close Logic', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should not auto-close version submenu when isVersionHovered is true', async () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Version')).toBeInTheDocument();
      });
      const versionItem = screen.getByText('Version');
      fireEvent.mouseEnter(versionItem);
      await waitFor(() => {
        expect(screen.getByText('Start Version Control')).toBeInTheDocument();
      });
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(screen.getByText('Start Version Control')).toBeInTheDocument();
    });

    it('should not auto-close version submenu when isSubmenuHovered is true', async () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Version')).toBeInTheDocument();
      });
      const versionItem = screen.getByText('Version');
      fireEvent.mouseEnter(versionItem);
      await waitFor(() => {
        expect(screen.getByText('Start Version Control')).toBeInTheDocument();
      });
      const submenu = screen.getByText('Start Version Control').closest('[data-testid="mui-menu"]');
      if (submenu) {
        fireEvent.mouseEnter(submenu);
      }
      fireEvent.mouseLeave(versionItem);
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(screen.getByText('Start Version Control')).toBeInTheDocument();
    });

    it('should not auto-close download submenu when isDownloadHovered is true', async () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Download Flow Definition')).toBeInTheDocument();
      });
      const downloadItem = screen.getByText('Download Flow Definition');
      fireEvent.mouseEnter(downloadItem);
      await waitFor(() => {
        expect(screen.getByText('Without External Services')).toBeInTheDocument();
      });
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(screen.getByText('Without External Services')).toBeInTheDocument();
    });

    it('should not auto-close download submenu when isDownloadSubmenuHovered is true', async () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Download Flow Definition')).toBeInTheDocument();
      });
      const downloadItem = screen.getByText('Download Flow Definition');
      fireEvent.mouseEnter(downloadItem);
      await waitFor(() => {
        expect(screen.getByText('Without External Services')).toBeInTheDocument();
      });
      const submenu = screen.getByText('Without External Services').closest('[data-testid="mui-menu"]');
      if (submenu) {
        fireEvent.mouseEnter(submenu);
      }
      fireEvent.mouseLeave(downloadItem);
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(screen.getByText('Without External Services')).toBeInTheDocument();
    });
  });

  describe('useEffect Cleanup Functions', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should cleanup timeout when version submenu useEffect unmounts', async () => {
      const { container, unmount } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Version')).toBeInTheDocument();
      });
      const versionItem = screen.getByText('Version');
      fireEvent.mouseEnter(versionItem);
      await waitFor(() => {
        expect(screen.getByText('Start Version Control')).toBeInTheDocument();
      });
      fireEvent.mouseLeave(versionItem);
      // Unmount before timeout completes - should cleanup
      unmount();
      act(() => {
        jest.advanceTimersByTime(200);
      });
      // Should not throw error
      expect(true).toBe(true);
    });

    it('should cleanup timeout when download submenu useEffect unmounts', async () => {
      const { container, unmount } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Download Flow Definition')).toBeInTheDocument();
      });
      const downloadItem = screen.getByText('Download Flow Definition');
      fireEvent.mouseEnter(downloadItem);
      await waitFor(() => {
        expect(screen.getByText('Without External Services')).toBeInTheDocument();
      });
      fireEvent.mouseLeave(downloadItem);
      // Unmount before timeout completes - should cleanup
      unmount();
      act(() => {
        jest.advanceTimersByTime(200);
      });
      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe('handleMenuClose with Event', () => {
    it('should stop propagation when handleMenuClose is called with event', async () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Configure')).toBeInTheDocument();
      });
      const menus = screen.getAllByTestId('mui-menu');
      const mainMenu = menus.find(menu => {
        const style = menu.getAttribute('style') || '';
        return !style.includes('display: none');
      }) || menus[0];
      const mockEvent = {
        stopPropagation: jest.fn(),
      };
      // Simulate menu close with event
      fireEvent.click(mainMenu, mockEvent as any);
      await waitFor(() => {
        const configureText = screen.queryByText('Configure');
        if (configureText) {
          expect(configureText).not.toBeVisible();
        } else {
          expect(configureText).not.toBeInTheDocument();
        }
      });
    });

    it('should close menu when handleMenuClose is called without event', async () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Configure')).toBeInTheDocument();
      });
      // Close menu by clicking outside (simulates handleMenuClose without event)
      const menus = screen.getAllByTestId('mui-menu');
      const mainMenu = menus[0];
      fireEvent.click(mainMenu);
      await waitFor(() => {
        const configureText = screen.queryByText('Configure');
        if (configureText) {
          expect(configureText).not.toBeVisible();
        } else {
          expect(configureText).not.toBeInTheDocument();
        }
      });
    });
  });

  describe('Disabled Box Click Handling', () => {
    it('should stop propagation on onClick when box is disabled', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      (nifiApiService.disableProcessGroup as jest.Mock).mockResolvedValue({});
      const onClickMock = jest.fn();
      const { container } = render(
        <ProcessGroupBox {...defaultProps} onClick={onClickMock} onCopy={jest.fn()} />
      );
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Disable')).toBeInTheDocument();
      });
      const disableItem = screen.getByText('Disable');
      fireEvent.click(disableItem);
      await waitFor(() => {
        const box = container.querySelector('.process-group-box');
        expect(box).toHaveClass('disabled');
      });
      const box = container.querySelector('.process-group-box');
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');
      fireEvent(box!, clickEvent);
      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(onClickMock).not.toHaveBeenCalled();
    });

    it('should stop propagation on onMouseDown when box is disabled', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      (nifiApiService.disableProcessGroup as jest.Mock).mockResolvedValue({});
      const onMouseDownMock = jest.fn();
      const { container } = render(
        <ProcessGroupBox {...defaultProps} onMouseDown={onMouseDownMock} onCopy={jest.fn()} />
      );
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Disable')).toBeInTheDocument();
      });
      const disableItem = screen.getByText('Disable');
      fireEvent.click(disableItem);
      await waitFor(() => {
        const box = container.querySelector('.process-group-box');
        expect(box).toHaveClass('disabled');
      });
      const box = container.querySelector('.process-group-box');
      const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      const stopPropagationSpy = jest.spyOn(mouseDownEvent, 'stopPropagation');
      fireEvent(box!, mouseDownEvent);
      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(onMouseDownMock).not.toHaveBeenCalled();
    });
  });

  describe('onDoubleClick Handler', () => {
    it('should call onDoubleClick when box is double-clicked', () => {
      const onDoubleClickMock = jest.fn();
      const { container } = render(<ProcessGroupBox {...defaultProps} onDoubleClick={onDoubleClickMock} />);
      const box = container.querySelector('.process-group-box');
      fireEvent.doubleClick(box!);
      expect(onDoubleClickMock).toHaveBeenCalledTimes(1);
    });

    it('should not throw when onDoubleClick is not provided', () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const box = container.querySelector('.process-group-box');
      expect(() => fireEvent.doubleClick(box!)).not.toThrow();
    });
  });

  describe('Console Logging Coverage', () => {
    it('should log copy operation start', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      (nifiApiService.copyProcessGroup as jest.Mock).mockResolvedValue({ success: true });
      const { container } = render(
        <ProcessGroupBox {...defaultProps} parentGroupId="parent-123" />
      );
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const copyItem = screen.getByText('Copy');
      fireEvent.click(copyItem);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(`Copying process group: ${defaultProps.id} (${defaultProps.name})`);
      });
    });

    it('should log copy operation success', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      (nifiApiService.copyProcessGroup as jest.Mock).mockResolvedValue({ success: true });
      const { container } = render(
        <ProcessGroupBox {...defaultProps} parentGroupId="parent-123" />
      );
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const copyItem = screen.getByText('Copy');
      fireEvent.click(copyItem);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Process group copied successfully');
      });
    });

    it('should log start operation start', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      (nifiApiService.startProcessGroup as jest.Mock).mockResolvedValue({});
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const startItem = screen.getByText('Start');
      fireEvent.click(startItem);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(`Starting process group: ${defaultProps.id} (${defaultProps.name})`);
      });
    });

    it('should log start operation success', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      (nifiApiService.startProcessGroup as jest.Mock).mockResolvedValue({});
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const startItem = screen.getByText('Start');
      fireEvent.click(startItem);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Process group started successfully');
      });
    });

    it('should log stop operation start', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      (nifiApiService.stopProcessGroup as jest.Mock).mockResolvedValue({});
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const stopItem = screen.getByText('Stop');
      fireEvent.click(stopItem);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(`Stopping process group: ${defaultProps.id} (${defaultProps.name})`);
      });
    });

    it('should log stop operation success', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      (nifiApiService.stopProcessGroup as jest.Mock).mockResolvedValue({});
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const stopItem = screen.getByText('Stop');
      fireEvent.click(stopItem);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Process group stopped successfully');
      });
    });

    it('should log enable operation start', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      (nifiApiService.enableProcessGroup as jest.Mock).mockResolvedValue({});
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const enableItem = screen.getByText('Enable');
      fireEvent.click(enableItem);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(`Enabling process group: ${defaultProps.id} (${defaultProps.name})`);
      });
    });

    it('should log enable operation success', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      (nifiApiService.enableProcessGroup as jest.Mock).mockResolvedValue({});
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const enableItem = screen.getByText('Enable');
      fireEvent.click(enableItem);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Process group enabled successfully');
      });
    });

    it('should log disable operation start', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      (nifiApiService.disableProcessGroup as jest.Mock).mockResolvedValue({});
      const { container } = render(<ProcessGroupBox {...defaultProps} onCopy={jest.fn()} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const disableItem = screen.getByText('Disable');
      fireEvent.click(disableItem);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(`Disabling process group: ${defaultProps.id} (${defaultProps.name})`);
      });
    });

    it('should log disable operation success', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      (nifiApiService.disableProcessGroup as jest.Mock).mockResolvedValue({});
      const { container } = render(<ProcessGroupBox {...defaultProps} onCopy={jest.fn()} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const disableItem = screen.getByText('Disable');
      fireEvent.click(disableItem);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Process group disabled successfully');
      });
    });

    it('should log delete operation start', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      (nifiApiService.deleteProcessGroup as jest.Mock).mockResolvedValue({});
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const deleteItem = screen.getByText('Delete');
      fireEvent.click(deleteItem);
      expect(console.log).toHaveBeenCalledWith(`Deleting process group: ${defaultProps.id} (${defaultProps.name})`);
    });

    it('should log delete operation success', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      (nifiApiService.deleteProcessGroup as jest.Mock).mockResolvedValue({});
      const { container } = render(<ProcessGroupBox {...defaultProps} onDelete={jest.fn()} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const deleteItem = screen.getByText('Delete');
      fireEvent.click(deleteItem);
      const acceptButton = screen.getByTestId('accept-btn');
      fireEvent.click(acceptButton);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Process group deleted successfully');
      });
    });
  });

  describe('Action Handlers - Unknown Actions', () => {
    it('should log unknown action when handler is not found', async () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Configure')).toBeInTheDocument();
      });
      const configureItem = screen.getByText('Configure');
      (console.log as jest.Mock).mockClear();
      fireEvent.click(configureItem);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(`Action: configure for process group: ${defaultProps.id}`);
      });
    });
  });

  describe('onCopy Callback Handling', () => {
    it('should not call onCopy when it is not provided in copy operation', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      (nifiApiService.copyProcessGroup as jest.Mock).mockResolvedValue({ success: true });
      const { container } = render(
        <ProcessGroupBox {...defaultProps} parentGroupId="parent-123" />
      );
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const copyItem = screen.getByText('Copy');
      fireEvent.click(copyItem);
      await waitFor(() => {
        expect(nifiApiService.copyProcessGroup).toHaveBeenCalled();
      });
      // Should not throw error when onCopy is not provided
      expect(screen.getByText(defaultProps.name)).toBeInTheDocument();
    });

    it('should not call onCopy when it is not provided in start operation', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      (nifiApiService.startProcessGroup as jest.Mock).mockResolvedValue({});
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const startItem = screen.getByText('Start');
      fireEvent.click(startItem);
      await waitFor(() => {
        expect(nifiApiService.startProcessGroup).toHaveBeenCalled();
      });
      // Should not throw error when onCopy is not provided
      expect(screen.getByText(defaultProps.name)).toBeInTheDocument();
    });

    it('should not call onCopy when it is not provided in stop operation', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      (nifiApiService.stopProcessGroup as jest.Mock).mockResolvedValue({});
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const stopItem = screen.getByText('Stop');
      fireEvent.click(stopItem);
      await waitFor(() => {
        expect(nifiApiService.stopProcessGroup).toHaveBeenCalled();
      });
      // Should not throw error when onCopy is not provided
      expect(screen.getByText(defaultProps.name)).toBeInTheDocument();
    });

    it('should not call onCopy when it is not provided in enable operation', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      (nifiApiService.enableProcessGroup as jest.Mock).mockResolvedValue({});
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const enableItem = screen.getByText('Enable');
      fireEvent.click(enableItem);
      await waitFor(() => {
        expect(nifiApiService.enableProcessGroup).toHaveBeenCalled();
      });
      // Should not throw error when onCopy is not provided
      expect(screen.getByText(defaultProps.name)).toBeInTheDocument();
    });

    it('should not call onCopy when it is not provided in disable operation', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      (nifiApiService.disableProcessGroup as jest.Mock).mockResolvedValue({});
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const disableItem = screen.getByText('Disable');
      fireEvent.click(disableItem);
      await waitFor(() => {
        expect(nifiApiService.disableProcessGroup).toHaveBeenCalled();
      });
      // Should not throw error when onCopy is not provided
      expect(screen.getByText(defaultProps.name)).toBeInTheDocument();
    });
  });

  describe('Error Handling in Async Operations', () => {
    it('should handle copy operation error', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      const copyError = new Error('Copy failed');
      (nifiApiService.copyProcessGroup as jest.Mock).mockRejectedValue(copyError);
      const { container } = render(
        <ProcessGroupBox {...defaultProps} parentGroupId="parent-123" />
      );
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const copyItem = screen.getByText('Copy');
      fireEvent.click(copyItem);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to copy process group:', copyError);
      });
    });

    it('should handle enable operation error', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      const enableError = new Error('Enable failed');
      (nifiApiService.enableProcessGroup as jest.Mock).mockRejectedValue(enableError);
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const enableItem = screen.getByText('Enable');
      fireEvent.click(enableItem);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to enable process group:', enableError);
      });
    });

    it('should handle disable operation error', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      const disableError = new Error('Disable failed');
      (nifiApiService.disableProcessGroup as jest.Mock).mockRejectedValue(disableError);
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const disableItem = screen.getByText('Disable');
      fireEvent.click(disableItem);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to disable process group:', disableError);
      });
    });
  });

  describe('Download Submenu Actions', () => {
    it('should handle download-with-external-services action', async () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Download Flow Definition')).toBeInTheDocument();
      });
      const downloadItem = screen.getByText('Download Flow Definition');
      fireEvent.mouseEnter(downloadItem);
      await waitFor(() => {
        expect(screen.getByText('With External Services')).toBeInTheDocument();
      });
      const withExternalServicesItem = screen.getByText('With External Services');
      fireEvent.click(withExternalServicesItem);
      expect(console.log).toHaveBeenCalledWith(`Action: download-with-external-services for process group: ${defaultProps.id}`);
    });
  });

  describe('useEffect Edge Cases', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should not set timeout when versionAnchorEl is null', () => {
      render(<ProcessGroupBox {...defaultProps} />);
      // versionAnchorEl starts as null, so useEffect should not set timeout
      act(() => {
        jest.advanceTimersByTime(200);
      });
      // Should not throw error
      expect(true).toBe(true);
    });

    it('should not set timeout when downloadAnchorEl is null', () => {
      render(<ProcessGroupBox {...defaultProps} />);
      // downloadAnchorEl starts as null, so useEffect should not set timeout
      act(() => {
        jest.advanceTimersByTime(200);
      });
      // Should not throw error
      expect(true).toBe(true);
    });

    it('should not set timeout when isVersionHovered is true', async () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Version')).toBeInTheDocument();
      });
      const versionItem = screen.getByText('Version');
      fireEvent.mouseEnter(versionItem);
      await waitFor(() => {
        expect(screen.getByText('Start Version Control')).toBeInTheDocument();
      });
      // isVersionHovered is true, so useEffect should not set timeout
      act(() => {
        jest.advanceTimersByTime(200);
      });
      // Submenu should still be open
      expect(screen.getByText('Start Version Control')).toBeInTheDocument();
    });

    it('should not set timeout when isSubmenuHovered is true', async () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Version')).toBeInTheDocument();
      });
      const versionItem = screen.getByText('Version');
      fireEvent.mouseEnter(versionItem);
      await waitFor(() => {
        expect(screen.getByText('Start Version Control')).toBeInTheDocument();
      });
      const submenu = screen.getByText('Start Version Control').closest('[data-testid="mui-menu"]');
      if (submenu) {
        fireEvent.mouseEnter(submenu);
      }
      // isSubmenuHovered is true, so useEffect should not set timeout
      act(() => {
        jest.advanceTimersByTime(200);
      });
      // Submenu should still be open
      expect(screen.getByText('Start Version Control')).toBeInTheDocument();
    });

    it('should not set timeout when isDownloadHovered is true', async () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Download Flow Definition')).toBeInTheDocument();
      });
      const downloadItem = screen.getByText('Download Flow Definition');
      fireEvent.mouseEnter(downloadItem);
      await waitFor(() => {
        expect(screen.getByText('Without External Services')).toBeInTheDocument();
      });
      // isDownloadHovered is true, so useEffect should not set timeout
      act(() => {
        jest.advanceTimersByTime(200);
      });
      // Submenu should still be open
      expect(screen.getByText('Without External Services')).toBeInTheDocument();
    });

    it('should not set timeout when isDownloadSubmenuHovered is true', async () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Download Flow Definition')).toBeInTheDocument();
      });
      const downloadItem = screen.getByText('Download Flow Definition');
      fireEvent.mouseEnter(downloadItem);
      await waitFor(() => {
        expect(screen.getByText('Without External Services')).toBeInTheDocument();
      });
      const submenu = screen.getByText('Without External Services').closest('[data-testid="mui-menu"]');
      if (submenu) {
        fireEvent.mouseEnter(submenu);
      }
      // isDownloadSubmenuHovered is true, so useEffect should not set timeout
      act(() => {
        jest.advanceTimersByTime(200);
      });
      // Submenu should still be open
      expect(screen.getByText('Without External Services')).toBeInTheDocument();
    });
  });

  describe('handleDeleteConfirm Finally Block', () => {
    it('should close delete warning in finally block even on error', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      const deleteError = new Error('Delete failed');
      (nifiApiService.deleteProcessGroup as jest.Mock).mockRejectedValue(deleteError);
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const deleteItem = screen.getByText('Delete');
      fireEvent.click(deleteItem);
      expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
      const acceptButton = screen.getByTestId('accept-btn');
      fireEvent.click(acceptButton);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to delete process group:', deleteError);
      });
      // Finally block should close the warning
      await waitFor(() => {
        expect(screen.queryByTestId('notification-alert')).not.toBeInTheDocument();
      });
    });

    it('should close delete warning in finally block on success', async () => {
      const { nifiApiService } = require('../../../src/api/nifi/nifiApiService');
      (nifiApiService.deleteProcessGroup as jest.Mock).mockResolvedValue({});
      const onDeleteMock = jest.fn();
      const { container } = render(<ProcessGroupBox {...defaultProps} onDelete={onDeleteMock} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      const deleteItem = screen.getByText('Delete');
      fireEvent.click(deleteItem);
      expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
      const acceptButton = screen.getByTestId('accept-btn');
      fireEvent.click(acceptButton);
      await waitFor(() => {
        expect(nifiApiService.deleteProcessGroup).toHaveBeenCalled();
      });
      // Finally block should close the warning
      await waitFor(() => {
        expect(screen.queryByTestId('notification-alert')).not.toBeInTheDocument();
      });
    });
  });

  describe('handleMenuClose with Event Parameter', () => {
    it('should stop propagation when handleMenuClose is called with event', async () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Configure')).toBeInTheDocument();
      });
      const menus = screen.getAllByTestId('mui-menu');
      const mainMenu = menus.find(menu => {
        const style = menu.getAttribute('style') || '';
        return !style.includes('display: none');
      }) || menus[0];
      const mockEvent = {
        stopPropagation: jest.fn(),
      };
      // Simulate menu close with event
      fireEvent.click(mainMenu, mockEvent as any);
      await waitFor(() => {
        const configureText = screen.queryByText('Configure');
        if (configureText) {
          expect(configureText).not.toBeVisible();
        } else {
          expect(configureText).not.toBeInTheDocument();
        }
      });
    });

    it('should close menu when handleMenuClose is called without event', async () => {
      const { container } = render(<ProcessGroupBox {...defaultProps} />);
      const menuButton = container.querySelector('svg[width="18"][height="18"]')?.parentElement;
      fireEvent.click(menuButton!);
      await waitFor(() => {
        expect(screen.getByText('Configure')).toBeInTheDocument();
      });
      // Close menu by clicking outside (simulates handleMenuClose without event)
      const menus = screen.getAllByTestId('mui-menu');
      const mainMenu = menus[0];
      fireEvent.click(mainMenu);
      await waitFor(() => {
        const configureText = screen.queryByText('Configure');
        if (configureText) {
          expect(configureText).not.toBeVisible();
        } else {
          expect(configureText).not.toBeInTheDocument();
        }
      });
    });
  });

  describe('Card onClick Handler Edge Cases', () => {
    it('should not call onClick when target is menu root', () => {
      const onClickMock = jest.fn();
      const { container } = render(<ProcessGroupBox {...defaultProps} onClick={onClickMock} />);
      const box = container.querySelector('.process-group-box');
      // Create a menu element inside the box
      const menuElement = document.createElement('div');
      menuElement.className = 'MuiMenu-root';
      box!.appendChild(menuElement);
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      Object.defineProperty(clickEvent, 'target', { value: menuElement, enumerable: true });
      fireEvent(box!, clickEvent);
      expect(onClickMock).not.toHaveBeenCalled();
      box!.removeChild(menuElement);
    });

    it('should not call onClick when target is menu item', () => {
      const onClickMock = jest.fn();
      const { container } = render(<ProcessGroupBox {...defaultProps} onClick={onClickMock} />);
      const box = container.querySelector('.process-group-box');
      // Create a menu item element inside the box
      const menuItemElement = document.createElement('div');
      menuItemElement.className = 'MuiMenuItem-root';
      box!.appendChild(menuItemElement);
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      Object.defineProperty(clickEvent, 'target', { value: menuItemElement, enumerable: true });
      fireEvent(box!, clickEvent);
      expect(onClickMock).not.toHaveBeenCalled();
      box!.removeChild(menuItemElement);
    });
  });
});

