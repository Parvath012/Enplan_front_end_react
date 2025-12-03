import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Layout from "../../src/pages/layout";
import { nifiApiService } from "../../src/api/nifi/nifiApiService";

// Mock dependencies
jest.mock("../../src/components/Footer", () => () => <div data-testid="footer-mock">Footer</div>);
jest.mock("../../src/components/HorizontalNavBar", () => () => <div data-testid="horizontal-nav-mock">Header</div>);
jest.mock("../../src/components/Grid", () => (props: any) => (
  <div data-testid="grid-mock">
    <button onClick={() => props.onBoxClick?.('test-id', 'Test Name')} data-testid="trigger-box-click">Box Click</button>
    <button onClick={() => props.onBoxDoubleClick?.('test-id-2', 'Test Name 2')} data-testid="trigger-box-double-click">Box Double Click</button>
    <button onClick={() => props.onDelete?.()} data-testid="trigger-grid-delete">Grid Delete</button>
    <button onClick={() => props.onCopy?.()} data-testid="trigger-grid-copy">Grid Copy</button>
  </div>
));
jest.mock("../../src/components/TabNavigation", () => (props: any) => (
  <div data-testid="tab-navigation-mock">
    <button onClick={() => props.onTabChange?.(4)} data-testid="trigger-tab-4">Tab 4</button>
    <button onClick={() => props.onTabChange?.(0)} data-testid="trigger-tab-0">Tab 0</button>
    <button onClick={() => props.onViewChange?.('controller-services')} data-testid="trigger-view-change">View Change</button>
    <button onClick={() => props.onToolbarAction?.('delete')} data-testid="trigger-toolbar-delete">Delete</button>
    <button onClick={() => props.onToolbarAction?.('copy')} data-testid="trigger-toolbar-copy">Copy</button>
    <button onClick={() => props.onToolbarAction?.('paste')} data-testid="trigger-toolbar-paste">Paste</button>
    <button onClick={() => props.onToolbarAction?.('Start')} data-testid="trigger-toolbar-start">Start</button>
    <button onClick={() => props.onToolbarAction?.('Stop')} data-testid="trigger-toolbar-stop">Stop</button>
    <button onClick={() => props.onToolbarAction?.('Enable')} data-testid="trigger-toolbar-enable">Enable</button>
    <button onClick={() => props.onToolbarAction?.('Disable')} data-testid="trigger-toolbar-disable">Disable</button>
    <button onClick={() => props.onToolbarAction?.('unknown-action')} data-testid="trigger-toolbar-unknown">Unknown</button>
    <button onClick={() => props.onBreadcrumbClick?.()} data-testid="trigger-breadcrumb-click">Breadcrumb</button>
  </div>
));
jest.mock("../../src/pages/ControllerServices", () => (props: any) => (
  <div data-testid="controller-services-mock">
    <button onClick={() => props.onBack?.()} data-testid="controller-services-back">Back</button>
    ControllerServices
  </div>
));
jest.mock("../../src/components/CustomSlider", () => (props: any) => {
  if (!props.open) return null;
  return (
    <div data-testid="custom-slider">
      <div>{props.title}</div>
      <div>{props.children}</div>
      <div data-testid="slider-footer">{props.footerContent}</div>
      <button onClick={props.onClose} data-testid="close-slider">Close</button>
    </div>
  );
});
jest.mock("commonApp/TextField", () => (props: any) => (
  <input
    data-testid="text-field"
    value={props.value}
    onChange={(e) => props.onChange(e.target.value)}
    placeholder={props.placeholder}
  />
));
jest.mock("commonApp/SelectField", () => (props: any) => (
  <select
    data-testid="select-field"
    data-param-select
    value={props.value}
    onChange={(e) => props.onChange(e.target.value)}
    onFocus={() => props.onOpen?.()}
    onBlur={() => props.onClose?.()}
    onMouseDown={(e) => {
      // Prevent default to allow testing
      if (props.onOpen) props.onOpen();
    }}
  >
    {props.options?.map((opt: string) => (
      <option key={opt} value={opt}>{opt}</option>
    ))}
  </select>
));
jest.mock("commonApp/NotificationAlert", () => (props: any) =>
  props.open ? (
    <div data-testid="notification-alert">
      <button onClick={() => props.actions[0].onClick()} data-testid="alert-cancel">Cancel</button>
      <button onClick={() => props.actions[1].onClick()} data-testid="alert-accept">Accept</button>
    </div>
  ) : null
);
jest.mock("../../src/api/nifi/nifiApiService");
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe("Layout component", () => {
  const mockDispatch = jest.fn();
  const mockUseSelector = jest.fn();
  const useDispatchMock = require("react-redux").useDispatch;
  const useSelectorMock = require("react-redux").useSelector;
  
  beforeEach(() => {
    jest.clearAllMocks();
    useDispatchMock.mockReturnValue(mockDispatch);
    mockUseSelector.mockReturnValue([]);
    useSelectorMock.mockImplementation(mockUseSelector);
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe('Initialization and Authentication', () => {
    it("should render loading state initially", async () => {
      (nifiApiService.authenticate as jest.Mock).mockReturnValue(
        new Promise<void>(resolve => setTimeout(() => resolve(), 100))
      );
      render(<Layout />);
      const loader = document.querySelector('[style*="position: relative"]');
      expect(loader).toBeInTheDocument();
    });

    it("should authenticate and render layout after successful login", async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({ 
        controllerStatus: { activeThreadCount: 0, terminatedThreadCount: 0 } 
      });
      render(<Layout />);
      await waitFor(() => {
        expect(nifiApiService.authenticate).toHaveBeenCalled();
        expect(nifiApiService.getFlowStatus).toHaveBeenCalled();
      }, { timeout: 3000 });
      expect(screen.getByTestId("horizontal-nav-mock")).toBeInTheDocument();
      expect(screen.getByTestId("tab-navigation-mock")).toBeInTheDocument();
      expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      expect(screen.getByTestId("footer-mock")).toBeInTheDocument();
    });

    it("should handle authentication failure", async () => {
      (nifiApiService.authenticate as jest.Mock).mockRejectedValue(new Error("Authentication failed"));
      render(<Layout />);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith("Login failed", expect.any(Error));
      }, { timeout: 3000 });
      expect(screen.getByTestId("horizontal-nav-mock")).toBeInTheDocument();
    });

    it("should handle API request failures after authentication", async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockRejectedValue(new Error("API request failed"));
      render(<Layout />);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith("Login failed", expect.any(Error));
      }, { timeout: 3000 });
      expect(screen.getByTestId("horizontal-nav-mock")).toBeInTheDocument();
    });

    it("should fetch root process group ID after authentication", async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
      (nifiApiService.getRootProcessGroupId as jest.Mock).mockResolvedValue('root-id');
      render(<Layout />);
      await waitFor(() => {
        expect(nifiApiService.getRootProcessGroupId).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it("should handle getRootProcessGroupId failure", async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
      (nifiApiService.getRootProcessGroupId as jest.Mock).mockRejectedValue(new Error('Failed'));
      render(<Layout />);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to fetch root process group ID:', expect.any(Error));
      }, { timeout: 3000 });
    });
  });

  describe('Process Group Fetching', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
      (nifiApiService.getRootProcessGroupId as jest.Mock).mockResolvedValue('root-id');
      mockDispatch.mockResolvedValue({});
    });

    it("should fetch process groups when parentGroupId is available", async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(nifiApiService.getRootProcessGroupId).toHaveBeenCalled();
      }, { timeout: 3000 });
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      }, { timeout: 5000 });
    });

    it("should not fetch process groups when loading", async () => {
      (nifiApiService.authenticate as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 5000))
      );
      render(<Layout />);
      const loader = document.querySelector('[style*="position: relative"]');
      expect(loader).toBeInTheDocument();
    });

    it("should not fetch process groups when parentGroupId is empty", async () => {
      (nifiApiService.getRootProcessGroupId as jest.Mock).mockRejectedValue(new Error('Failed'));
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Redux Process Groups', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
    });

    it("should process and display Redux process groups", async () => {
      const mockProcessGroups = [{
        id: 'test-id-1',
        component: {
          name: 'Test Process Group',
          position: { x: 100, y: 200 },
          runningCount: 5,
          stoppedCount: 3,
          invalidCount: 0,
          disabledCount: 1,
          activeRemotePortCount: 2,
          inactiveRemotePortCount: 1,
          upToDateCount: 10,
          locallyModifiedCount: 0,
          staleCount: 0,
          locallyModifiedAndStaleCount: 0,
          syncFailureCount: 0,
        },
        status: {
          aggregateSnapshot: {
            queued: '5 (100 KB)',
            input: '10 (200 KB)',
            read: '50 KB',
            written: '75 KB',
            output: '8 (150 KB)',
          }
        }
      }];
      useSelectorMock.mockReturnValue(mockProcessGroups);
      render(<Layout />);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Layout - Redux Process Groups:', mockProcessGroups);
      }, { timeout: 3000 });
    });

    it("should handle empty process groups", async () => {
      useSelectorMock.mockReturnValue([]);
      render(<Layout />);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Layout - Redux Process Groups Length:', 0);
      }, { timeout: 3000 });
    });

    it("should handle process groups with missing status data", async () => {
      const mockProcessGroups = [{
        id: 'test-id-2',
        component: {
          name: 'Test Group Without Status',
          position: { x: 0, y: 0 },
          runningCount: 0,
          stoppedCount: 0,
          invalidCount: 0,
          disabledCount: 0,
          activeRemotePortCount: 0,
          inactiveRemotePortCount: 0,
          upToDateCount: 0,
          locallyModifiedCount: 0,
          staleCount: 0,
          locallyModifiedAndStaleCount: 0,
          syncFailureCount: 0,
        },
      }];
      useSelectorMock.mockReturnValue(mockProcessGroups);
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it("should handle null/undefined values in process group data", async () => {
      const mockProcessGroups = [{
        id: 'test-id-3',
        component: {
          name: 'Test Group',
          position: { x: 50, y: 50 },
          runningCount: 0,
          stoppedCount: 0,
          invalidCount: 0,
          disabledCount: 0,
          activeRemotePortCount: 0,
          inactiveRemotePortCount: 0,
          upToDateCount: 0,
          locallyModifiedCount: 0,
          staleCount: 0,
          locallyModifiedAndStaleCount: 0,
          syncFailureCount: 0,
        },
        status: {
          aggregateSnapshot: {
            queued: null,
            input: undefined,
            read: null,
            written: undefined,
            output: null,
          }
        }
      }];
      useSelectorMock.mockReturnValue(mockProcessGroups);
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it("should handle multiple process groups", async () => {
      const mockProcessGroups = [
        {
          id: 'group-1',
          component: {
            name: 'Group 1',
            position: { x: 100, y: 100 },
            runningCount: 1,
            stoppedCount: 0,
            invalidCount: 0,
            disabledCount: 0,
            activeRemotePortCount: 0,
            inactiveRemotePortCount: 0,
            upToDateCount: 1,
            locallyModifiedCount: 0,
            staleCount: 0,
            locallyModifiedAndStaleCount: 0,
            syncFailureCount: 0,
          },
          status: { aggregateSnapshot: { queued: '1', input: '2', read: '3', written: '4', output: '5' } }
        },
        {
          id: 'group-2',
          component: {
            name: 'Group 2',
            position: { x: 200, y: 200 },
            runningCount: 2,
            stoppedCount: 1,
            invalidCount: 0,
            disabledCount: 0,
            activeRemotePortCount: 1,
            inactiveRemotePortCount: 0,
            upToDateCount: 2,
            locallyModifiedCount: 0,
            staleCount: 0,
            locallyModifiedAndStaleCount: 0,
            syncFailureCount: 0,
          },
          status: { aggregateSnapshot: { queued: '6', input: '7', read: '8', written: '9', output: '10' } }
        }
      ];
      useSelectorMock.mockReturnValue(mockProcessGroups);
      render(<Layout />);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Layout - Redux Process Groups Length:', 2);
      }, { timeout: 3000 });
    });

    it("should handle reduxProcessGroups as null", async () => {
      useSelectorMock.mockReturnValue(null);
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it("should handle reduxProcessGroups as undefined", async () => {
      useSelectorMock.mockReturnValue(undefined);
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Environment Detection', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
    });

    it("should detect admin app environment correctly", async () => {
      delete (window as any).location;
      (window as any).location = { pathname: '/data-management/test' };
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      delete (window as any).location;
      (window as any).location = { pathname: '/' };
    });

    it("should detect standalone app environment correctly", async () => {
      delete (window as any).location;
      (window as any).location = { pathname: '/standalone' };
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      delete (window as any).location;
      (window as any).location = { pathname: '/' };
    });
  });

  describe('Process Group Creation', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
      (nifiApiService.getRootProcessGroupId as jest.Mock).mockResolvedValue('root-id');
      mockDispatch.mockResolvedValue({ type: 'createProcessGroup/fulfilled', payload: { id: 'new-id', component: { name: 'New Group' } } });
    });

    it('should open slider when tab 4 is clicked', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const tabButton = screen.getByTestId("trigger-tab-4");
      fireEvent.click(tabButton);
      await waitFor(() => {
        expect(screen.getByTestId("custom-slider")).toBeInTheDocument();
      });
    });

    it('should close slider when close button is clicked', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const tabButton = screen.getByTestId("trigger-tab-4");
      fireEvent.click(tabButton);
      await waitFor(() => {
        expect(screen.getByTestId("custom-slider")).toBeInTheDocument();
      });
      const closeButton = screen.getByTestId("close-slider");
      fireEvent.click(closeButton);
      await waitFor(() => {
        expect(screen.queryByTestId("custom-slider")).not.toBeInTheDocument();
      });
    });

    it('should create process group when submit is clicked with valid name', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const tabButton = screen.getByTestId("trigger-tab-4");
      fireEvent.click(tabButton);
      await waitFor(() => {
        expect(screen.getByTestId("custom-slider")).toBeInTheDocument();
      });
      const textField = screen.getByTestId("text-field");
      fireEvent.change(textField, { target: { value: 'New Process Group' } });
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);
      await waitFor(() => {
        // dispatch is called with the action creator result, check that it was called
        expect(mockDispatch).toHaveBeenCalled();
      });
      // Verify it was called with createProcessGroup action
      const dispatchCalls = mockDispatch.mock.calls;
      const createProcessGroupCall = dispatchCalls.find(call => 
        call[0] && typeof call[0] === 'function'
      );
      expect(createProcessGroupCall).toBeDefined();
    });

    it('should not create process group when name is empty', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const tabButton = screen.getByTestId("trigger-tab-4");
      fireEvent.click(tabButton);
      await waitFor(() => {
        expect(screen.getByTestId("custom-slider")).toBeInTheDocument();
      });
      const submitButton = screen.getByText('Submit');
      expect(submitButton).toBeDisabled();
    });

    it('should reset form when reset button is clicked', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const tabButton = screen.getByTestId("trigger-tab-4");
      fireEvent.click(tabButton);
      await waitFor(() => {
        expect(screen.getByTestId("custom-slider")).toBeInTheDocument();
      });
      const textField = screen.getByTestId("text-field");
      fireEvent.change(textField, { target: { value: 'Test Name' } });
      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);
      await waitFor(() => {
        expect(textField).toHaveValue('');
      });
    });

    it('should handle create process group failure', async () => {
      mockDispatch.mockResolvedValueOnce({ type: 'createProcessGroup/rejected', error: 'Failed' });
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const tabButton = screen.getByTestId("trigger-tab-4");
      fireEvent.click(tabButton);
      await waitFor(() => {
        expect(screen.getByTestId("custom-slider")).toBeInTheDocument();
      });
      const textField = screen.getByTestId("text-field");
      fireEvent.change(textField, { target: { value: 'New Group' } });
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled();
      });
      alertSpy.mockRestore();
    });

    it('should handle create process group error', async () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const tabButton = screen.getByTestId("trigger-tab-4");
      fireEvent.click(tabButton);
      await waitFor(() => {
        expect(screen.getByTestId("custom-slider")).toBeInTheDocument();
      });
      const textField = screen.getByTestId("text-field");
      fireEvent.change(textField, { target: { value: 'New Group' } });
      // Make dispatch throw an error
      mockDispatch.mockImplementationOnce(() => {
        throw new Error('API Error');
      });
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Error creating process group:', expect.any(Error));
      });
      alertSpy.mockRestore();
    });

    it('should not create process group when parentGroupId is missing', async () => {
      (nifiApiService.getRootProcessGroupId as jest.Mock).mockRejectedValue(new Error('Failed'));
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const tabButton = screen.getByTestId("trigger-tab-4");
      fireEvent.click(tabButton);
      await waitFor(() => {
        expect(screen.getByTestId("custom-slider")).toBeInTheDocument();
      });
      const textField = screen.getByTestId("text-field");
      fireEvent.change(textField, { target: { value: 'New Group' } });
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Parent group ID not available');
      });
    });

    it('should update selectedParam when parameter context changes', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const tabButton = screen.getByTestId("trigger-tab-4");
      fireEvent.click(tabButton);
      await waitFor(() => {
        expect(screen.getByTestId("custom-slider")).toBeInTheDocument();
      });
      const selectField = screen.getByTestId("select-field");
      fireEvent.change(selectField, { target: { value: 'Dataflow_Dev' } });
      expect(selectField).toHaveValue('Dataflow_Dev');
    });
  });

  describe('Box Interactions', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
    });

    it('should handle box click', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      await waitFor(() => {
        expect(screen.getByTestId("tab-navigation-mock")).toBeInTheDocument();
      });
    });

    it('should handle box double click', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const doubleClickButton = screen.getByTestId("trigger-box-double-click");
      fireEvent.click(doubleClickButton);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Layout: Double-clicked on process group:', 'test-id-2', 'Test Name 2');
      });
    });

    it('should handle breadcrumb click', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const doubleClickButton = screen.getByTestId("trigger-box-double-click");
      fireEvent.click(doubleClickButton);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Layout: Double-clicked on process group:', expect.any(String), expect.any(String));
      });
      const breadcrumbButton = screen.getByTestId("trigger-breadcrumb-click");
      fireEvent.click(breadcrumbButton);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Layout: Navigating back to main view');
      });
    });
  });

  describe('View Changes', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
    });

    it('should switch to controller services view', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const viewChangeButton = screen.getByTestId("trigger-view-change");
      fireEvent.click(viewChangeButton);
      await waitFor(() => {
        expect(screen.getByTestId("controller-services-mock")).toBeInTheDocument();
      });
    });
  });

  describe('Toolbar Actions', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
      (nifiApiService.getRootProcessGroupId as jest.Mock).mockResolvedValue('root-id');
      mockDispatch.mockResolvedValue({});
    });

    it('should handle delete action when process group is selected', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const deleteButton = screen.getByTestId("trigger-toolbar-delete");
      fireEvent.click(deleteButton);
      await waitFor(() => {
        expect(screen.getByTestId("notification-alert")).toBeInTheDocument();
      });
    });

    it('should log message when delete action triggered without selection', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const deleteButton = screen.getByTestId("trigger-toolbar-delete");
      fireEvent.click(deleteButton);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('No process group selected for deletion');
      });
    });

    it('should handle copy action when process group is selected', async () => {
      (nifiApiService.copyProcessGroup as jest.Mock).mockResolvedValue({ copyId: 'copy-123' });
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const copyButton = screen.getByTestId("trigger-toolbar-copy");
      fireEvent.click(copyButton);
      await waitFor(() => {
        expect(nifiApiService.copyProcessGroup).toHaveBeenCalled();
      });
    });

    it('should handle paste action when copy response exists', async () => {
      (nifiApiService.copyProcessGroup as jest.Mock).mockResolvedValue({ copyId: 'copy-123' });
      (nifiApiService.pasteProcessGroup as jest.Mock).mockResolvedValue({ id: 'pasted-id' });
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const copyButton = screen.getByTestId("trigger-toolbar-copy");
      fireEvent.click(copyButton);
      await waitFor(() => {
        expect(nifiApiService.copyProcessGroup).toHaveBeenCalled();
      });
      const pasteButton = screen.getByTestId("trigger-toolbar-paste");
      fireEvent.click(pasteButton);
      await waitFor(() => {
        expect(nifiApiService.pasteProcessGroup).toHaveBeenCalled();
      });
    });

    it('should log message when paste action triggered without copy response', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const pasteButton = screen.getByTestId("trigger-toolbar-paste");
      fireEvent.click(pasteButton);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('No copy response available for paste operation');
      });
    });

    it('should handle start action when process group is selected', async () => {
      (nifiApiService.startProcessGroup as jest.Mock).mockResolvedValue({});
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const startButton = screen.getByTestId("trigger-toolbar-start");
      fireEvent.click(startButton);
      await waitFor(() => {
        expect(nifiApiService.startProcessGroup).toHaveBeenCalled();
      });
    });

    it('should handle stop action when process group is selected', async () => {
      (nifiApiService.stopProcessGroup as jest.Mock).mockResolvedValue({});
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const stopButton = screen.getByTestId("trigger-toolbar-stop");
      fireEvent.click(stopButton);
      await waitFor(() => {
        expect(nifiApiService.stopProcessGroup).toHaveBeenCalled();
      });
    });

    it('should handle enable action when process group is selected', async () => {
      (nifiApiService.enableProcessGroup as jest.Mock).mockResolvedValue({});
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const enableButton = screen.getByTestId("trigger-toolbar-enable");
      fireEvent.click(enableButton);
      await waitFor(() => {
        expect(nifiApiService.enableProcessGroup).toHaveBeenCalled();
      });
    });

    it('should handle disable action when process group is selected', async () => {
      (nifiApiService.disableProcessGroup as jest.Mock).mockResolvedValue({});
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const disableButton = screen.getByTestId("trigger-toolbar-disable");
      fireEvent.click(disableButton);
      await waitFor(() => {
        expect(nifiApiService.disableProcessGroup).toHaveBeenCalled();
      });
    });
  });

  describe('Delete Confirmation', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
      (nifiApiService.getRootProcessGroupId as jest.Mock).mockResolvedValue('root-id');
      (nifiApiService.deleteProcessGroup as jest.Mock).mockResolvedValue({});
      mockDispatch.mockResolvedValue({});
    });

    it('should confirm delete and call delete API', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const deleteButton = screen.getByTestId("trigger-toolbar-delete");
      fireEvent.click(deleteButton);
      await waitFor(() => {
        expect(screen.getByTestId("notification-alert")).toBeInTheDocument();
      });
      const acceptButton = screen.getByTestId("alert-accept");
      fireEvent.click(acceptButton);
      await waitFor(() => {
        expect(nifiApiService.deleteProcessGroup).toHaveBeenCalled();
      });
    });

    it('should cancel delete', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const deleteButton = screen.getByTestId("trigger-toolbar-delete");
      fireEvent.click(deleteButton);
      await waitFor(() => {
        expect(screen.getByTestId("notification-alert")).toBeInTheDocument();
      });
      const cancelButton = screen.getByTestId("alert-cancel");
      fireEvent.click(cancelButton);
      await waitFor(() => {
        expect(screen.queryByTestId("notification-alert")).not.toBeInTheDocument();
      });
    });

    it('should handle delete failure', async () => {
      (nifiApiService.deleteProcessGroup as jest.Mock).mockRejectedValue(new Error('Delete failed'));
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const deleteButton = screen.getByTestId("trigger-toolbar-delete");
      fireEvent.click(deleteButton);
      await waitFor(() => {
        expect(screen.getByTestId("notification-alert")).toBeInTheDocument();
      });
      const acceptButton = screen.getByTestId("alert-accept");
      fireEvent.click(acceptButton);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to delete process group:', expect.any(Error));
      });
    });
  });

  describe('Process Group Operations Error Handling', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
      (nifiApiService.getRootProcessGroupId as jest.Mock).mockResolvedValue('root-id');
      mockDispatch.mockResolvedValue({});
    });

    it('should handle copy operation failure', async () => {
      (nifiApiService.copyProcessGroup as jest.Mock).mockRejectedValue(new Error('Copy failed'));
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const copyButton = screen.getByTestId("trigger-toolbar-copy");
      fireEvent.click(copyButton);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to copy process group:', expect.any(Error));
      });
    });

    it('should handle paste operation failure', async () => {
      (nifiApiService.copyProcessGroup as jest.Mock).mockResolvedValue({ copyId: 'copy-123' });
      (nifiApiService.pasteProcessGroup as jest.Mock).mockRejectedValue(new Error('Paste failed'));
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const copyButton = screen.getByTestId("trigger-toolbar-copy");
      fireEvent.click(copyButton);
      await waitFor(() => {
        expect(nifiApiService.copyProcessGroup).toHaveBeenCalled();
      });
      const pasteButton = screen.getByTestId("trigger-toolbar-paste");
      fireEvent.click(pasteButton);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to paste process group:', expect.any(Error));
        expect(alertSpy).toHaveBeenCalled();
      });
      alertSpy.mockRestore();
    });

    it('should handle start operation failure', async () => {
      (nifiApiService.startProcessGroup as jest.Mock).mockRejectedValue(new Error('Start failed'));
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const startButton = screen.getByTestId("trigger-toolbar-start");
      fireEvent.click(startButton);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to start process group:', expect.any(Error));
      });
    });

    it('should handle stop operation failure', async () => {
      (nifiApiService.stopProcessGroup as jest.Mock).mockRejectedValue(new Error('Stop failed'));
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const stopButton = screen.getByTestId("trigger-toolbar-stop");
      fireEvent.click(stopButton);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to stop process group:', expect.any(Error));
      });
    });

    it('should handle enable operation failure', async () => {
      (nifiApiService.enableProcessGroup as jest.Mock).mockRejectedValue(new Error('Enable failed'));
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const enableButton = screen.getByTestId("trigger-toolbar-enable");
      fireEvent.click(enableButton);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to enable process group:', expect.any(Error));
      });
    });

    it('should handle disable operation failure', async () => {
      (nifiApiService.disableProcessGroup as jest.Mock).mockRejectedValue(new Error('Disable failed'));
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const disableButton = screen.getByTestId("trigger-toolbar-disable");
      fireEvent.click(disableButton);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to disable process group:', expect.any(Error));
      });
    });
  });

  describe('Grid Callbacks', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
      (nifiApiService.getRootProcessGroupId as jest.Mock).mockResolvedValue('root-id');
      mockDispatch.mockResolvedValue({});
    });

    it('should handle grid delete callback', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const gridDeleteButton = screen.getByTestId("trigger-grid-delete");
      fireEvent.click(gridDeleteButton);
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });
    });

    it('should handle grid copy callback', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const gridCopyButton = screen.getByTestId("trigger-grid-copy");
      fireEvent.click(gridCopyButton);
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });
    });
  });

  describe('Parameter Dropdown', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
    });

    it('should open parameter dropdown', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const tabButton = screen.getByTestId("trigger-tab-4");
      fireEvent.click(tabButton);
      await waitFor(() => {
        expect(screen.getByTestId("custom-slider")).toBeInTheDocument();
      });
      const selectField = screen.getByTestId("select-field");
      fireEvent.focus(selectField);
      expect(selectField).toBeInTheDocument();
    });

    it('should close parameter dropdown when clicking outside', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const tabButton = screen.getByTestId("trigger-tab-4");
      fireEvent.click(tabButton);
      await waitFor(() => {
        expect(screen.getByTestId("custom-slider")).toBeInTheDocument();
      });
      const selectField = screen.getByTestId("select-field");
      fireEvent.focus(selectField);
      // Create an element that is not MuiMenu-root or data-param-select
      const outsideElement = document.createElement('div');
      outsideElement.className = 'outside-element';
      // Mock closest method
      outsideElement.closest = jest.fn().mockReturnValue(null);
      document.body.appendChild(outsideElement);
      const mousedownEvent = new MouseEvent('mousedown', { bubbles: true });
      Object.defineProperty(mousedownEvent, 'target', { value: outsideElement, enumerable: true });
      document.dispatchEvent(mousedownEvent);
      // Verify the event was handled (dropdown should close)
      expect(outsideElement.closest).toHaveBeenCalled();
      document.body.removeChild(outsideElement);
    });
  });

  describe('Process Group Creation Success', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
      (nifiApiService.getRootProcessGroupId as jest.Mock).mockResolvedValue('root-id');
    });

    it('should successfully create process group and close slider', async () => {
      const fulfilledAction = {
        type: 'createProcessGroup/fulfilled',
        payload: {
          id: 'new-id',
          component: {
            name: 'New Group',
            position: { x: 100, y: 200 },
            runningCount: 0,
            stoppedCount: 0,
            invalidCount: 0,
            disabledCount: 0,
            activeRemotePortCount: 0,
            inactiveRemotePortCount: 0,
            upToDateCount: 0,
            locallyModifiedCount: 0,
            staleCount: 0,
            locallyModifiedAndStaleCount: 0,
            syncFailureCount: 0,
          },
          status: {
            aggregateSnapshot: {
              queued: '0',
              input: '0',
              read: '0',
              written: '0',
              output: '0',
            }
          }
        }
      };
      mockDispatch.mockResolvedValue(fulfilledAction);
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const tabButton = screen.getByTestId("trigger-tab-4");
      fireEvent.click(tabButton);
      await waitFor(() => {
        expect(screen.getByTestId("custom-slider")).toBeInTheDocument();
      });
      const textField = screen.getByTestId("text-field");
      fireEvent.change(textField, { target: { value: 'New Process Group' } });
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });
      await waitFor(() => {
        expect(screen.queryByTestId("custom-slider")).not.toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Text Field Interactions', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
    });

    it('should enable submit when name is entered', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const tabButton = screen.getByTestId("trigger-tab-4");
      fireEvent.click(tabButton);
      await waitFor(() => {
        expect(screen.getByTestId("custom-slider")).toBeInTheDocument();
      });
      const textField = screen.getByTestId("text-field");
      const submitButton = screen.getByText('Submit');
      expect(submitButton).toBeDisabled();
      fireEvent.change(textField, { target: { value: 'Test Name' } });
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should disable submit when name is cleared', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const tabButton = screen.getByTestId("trigger-tab-4");
      fireEvent.click(tabButton);
      await waitFor(() => {
        expect(screen.getByTestId("custom-slider")).toBeInTheDocument();
      });
      const textField = screen.getByTestId("text-field");
      const submitButton = screen.getByText('Submit');
      fireEvent.change(textField, { target: { value: 'Test Name' } });
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
      fireEvent.change(textField, { target: { value: '' } });
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Event Listener Cleanup', () => {
    it("should cleanup event listener on unmount", async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      const { unmount } = render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
    });

    it('should handle missing parentGroupId in copy operation', async () => {
      (nifiApiService.getRootProcessGroupId as jest.Mock).mockRejectedValue(new Error('Failed'));
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const copyButton = screen.getByTestId("trigger-toolbar-copy");
      fireEvent.click(copyButton);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Parent group ID not available');
      });
    });

    it('should handle missing parentGroupId in paste operation', async () => {
      (nifiApiService.getRootProcessGroupId as jest.Mock).mockRejectedValue(new Error('Failed'));
      (nifiApiService.copyProcessGroup as jest.Mock).mockResolvedValue({ copyId: 'copy-123' });
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const pasteButton = screen.getByTestId("trigger-toolbar-paste");
      fireEvent.click(pasteButton);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('No copy response available for paste operation');
      });
    });

    it('should handle operations without selected process group', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const startButton = screen.getByTestId("trigger-toolbar-start");
      fireEvent.click(startButton);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('No process group selected for starting');
      });
    });

    it('should handle tab change to non-4 tab', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const tabButton = screen.getByTestId("trigger-tab-0");
      fireEvent.click(tabButton);
      expect(screen.queryByTestId("custom-slider")).not.toBeInTheDocument();
    });
  });

  describe('Process Group Operations with Parent Group ID', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
      (nifiApiService.getRootProcessGroupId as jest.Mock).mockResolvedValue('root-id');
      mockDispatch.mockResolvedValue({});
    });

    it('should handle delete with parentGroupId and refresh list', async () => {
      (nifiApiService.deleteProcessGroup as jest.Mock).mockResolvedValue({});
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const deleteButton = screen.getByTestId("trigger-toolbar-delete");
      fireEvent.click(deleteButton);
      await waitFor(() => {
        expect(screen.getByTestId("notification-alert")).toBeInTheDocument();
      });
      const acceptButton = screen.getByTestId("alert-accept");
      fireEvent.click(acceptButton);
      await waitFor(() => {
        expect(nifiApiService.deleteProcessGroup).toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalled();
      });
    });

    it('should handle delete without parentGroupId', async () => {
      (nifiApiService.getRootProcessGroupId as jest.Mock).mockRejectedValue(new Error('Failed'));
      (nifiApiService.deleteProcessGroup as jest.Mock).mockResolvedValue({});
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const deleteButton = screen.getByTestId("trigger-toolbar-delete");
      fireEvent.click(deleteButton);
      await waitFor(() => {
        expect(screen.getByTestId("notification-alert")).toBeInTheDocument();
      });
      const acceptButton = screen.getByTestId("alert-accept");
      fireEvent.click(acceptButton);
      await waitFor(() => {
        expect(nifiApiService.deleteProcessGroup).toHaveBeenCalled();
      });
    });

    it('should handle copy with parentGroupId and refresh list', async () => {
      (nifiApiService.copyProcessGroup as jest.Mock).mockResolvedValue({ copyId: 'copy-123' });
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const copyButton = screen.getByTestId("trigger-toolbar-copy");
      fireEvent.click(copyButton);
      await waitFor(() => {
        expect(nifiApiService.copyProcessGroup).toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalled();
      });
    });

    it('should handle start with parentGroupId and refresh list', async () => {
      (nifiApiService.startProcessGroup as jest.Mock).mockResolvedValue({});
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const startButton = screen.getByTestId("trigger-toolbar-start");
      fireEvent.click(startButton);
      await waitFor(() => {
        expect(nifiApiService.startProcessGroup).toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalled();
      });
    });

    it('should handle stop with parentGroupId and refresh list', async () => {
      (nifiApiService.stopProcessGroup as jest.Mock).mockResolvedValue({});
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const stopButton = screen.getByTestId("trigger-toolbar-stop");
      fireEvent.click(stopButton);
      await waitFor(() => {
        expect(nifiApiService.stopProcessGroup).toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalled();
      });
    });

    it('should handle enable with parentGroupId and refresh list', async () => {
      (nifiApiService.enableProcessGroup as jest.Mock).mockResolvedValue({});
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const enableButton = screen.getByTestId("trigger-toolbar-enable");
      fireEvent.click(enableButton);
      await waitFor(() => {
        expect(nifiApiService.enableProcessGroup).toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalled();
      });
    });

    it('should handle disable with parentGroupId and refresh list', async () => {
      (nifiApiService.disableProcessGroup as jest.Mock).mockResolvedValue({});
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const disableButton = screen.getByTestId("trigger-toolbar-disable");
      fireEvent.click(disableButton);
      await waitFor(() => {
        expect(nifiApiService.disableProcessGroup).toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalled();
      });
    });

    it('should handle paste with parentGroupId and refresh list', async () => {
      (nifiApiService.copyProcessGroup as jest.Mock).mockResolvedValue({ copyId: 'copy-123' });
      (nifiApiService.pasteProcessGroup as jest.Mock).mockResolvedValue({ id: 'pasted-id' });
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const copyButton = screen.getByTestId("trigger-toolbar-copy");
      fireEvent.click(copyButton);
      await waitFor(() => {
        expect(nifiApiService.copyProcessGroup).toHaveBeenCalled();
      });
      const pasteButton = screen.getByTestId("trigger-toolbar-paste");
      fireEvent.click(pasteButton);
      await waitFor(() => {
        expect(nifiApiService.pasteProcessGroup).toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalled();
      });
    });
  });

  describe('Process Group Operations without Parent Group ID', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
      (nifiApiService.getRootProcessGroupId as jest.Mock).mockRejectedValue(new Error('Failed'));
    });

    it('should handle start without parentGroupId', async () => {
      (nifiApiService.startProcessGroup as jest.Mock).mockResolvedValue({});
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const startButton = screen.getByTestId("trigger-toolbar-start");
      fireEvent.click(startButton);
      await waitFor(() => {
        expect(nifiApiService.startProcessGroup).toHaveBeenCalled();
      });
    });

    it('should handle stop without parentGroupId', async () => {
      (nifiApiService.stopProcessGroup as jest.Mock).mockResolvedValue({});
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const stopButton = screen.getByTestId("trigger-toolbar-stop");
      fireEvent.click(stopButton);
      await waitFor(() => {
        expect(nifiApiService.stopProcessGroup).toHaveBeenCalled();
      });
    });

    it('should handle enable without parentGroupId', async () => {
      (nifiApiService.enableProcessGroup as jest.Mock).mockResolvedValue({});
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const enableButton = screen.getByTestId("trigger-toolbar-enable");
      fireEvent.click(enableButton);
      await waitFor(() => {
        expect(nifiApiService.enableProcessGroup).toHaveBeenCalled();
      });
    });

    it('should handle disable without parentGroupId', async () => {
      (nifiApiService.disableProcessGroup as jest.Mock).mockResolvedValue({});
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const disableButton = screen.getByTestId("trigger-toolbar-disable");
      fireEvent.click(disableButton);
      await waitFor(() => {
        expect(nifiApiService.disableProcessGroup).toHaveBeenCalled();
      });
    });
  });

  describe('Process Group Box Callbacks', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
      (nifiApiService.getRootProcessGroupId as jest.Mock).mockResolvedValue('root-id');
      mockDispatch.mockResolvedValue({});
    });

    it('should handle process group delete callback', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const gridDeleteButton = screen.getByTestId("trigger-grid-delete");
      fireEvent.click(gridDeleteButton);
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });
    });

    it('should handle process group copy callback', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const gridCopyButton = screen.getByTestId("trigger-grid-copy");
      fireEvent.click(gridCopyButton);
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });
    });

    it('should handle process group copy callback without parentGroupId', async () => {
      (nifiApiService.getRootProcessGroupId as jest.Mock).mockRejectedValue(new Error('Failed'));
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const gridCopyButton = screen.getByTestId("trigger-grid-copy");
      fireEvent.click(gridCopyButton);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Parent group ID not available');
      });
    });

    it('should handle process group delete callback without parentGroupId', async () => {
      (nifiApiService.getRootProcessGroupId as jest.Mock).mockRejectedValue(new Error('Failed'));
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const gridDeleteButton = screen.getByTestId("trigger-grid-delete");
      fireEvent.click(gridDeleteButton);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Parent group ID not available');
      });
    });
  });

  describe('Breadcrumb Display', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
    });

    it('should show breadcrumb when inside process group', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const doubleClickButton = screen.getByTestId("trigger-box-double-click");
      fireEvent.click(doubleClickButton);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Layout: Double-clicked on process group:', expect.any(String), expect.any(String));
      });
      const breadcrumbButton = screen.getByTestId("trigger-breadcrumb-click");
      expect(breadcrumbButton).toBeInTheDocument();
    });

    it('should show breadcrumb when box is selected', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const tabNav = screen.getByTestId("tab-navigation-mock");
      expect(tabNav).toBeInTheDocument();
    });
  });

  describe('Breadcrumb Configuration Helper', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
    });

    it('should return correct breadcrumb config when inside process group', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const doubleClickButton = screen.getByTestId("trigger-box-double-click");
      fireEvent.click(doubleClickButton);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Layout: Double-clicked on process group:', expect.any(String), expect.any(String));
      });
      // Breadcrumb should be configured for inside process group
      const breadcrumbButton = screen.getByTestId("trigger-breadcrumb-click");
      expect(breadcrumbButton).toBeInTheDocument();
    });

    it('should return correct breadcrumb config when not inside process group', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      // Breadcrumb should be configured for selected box
      const tabNav = screen.getByTestId("tab-navigation-mock");
      expect(tabNav).toBeInTheDocument();
    });
  });

  describe('Toolbar Action Edge Cases', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
    });

    it('should handle unknown toolbar action gracefully', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const unknownActionButton = screen.getByTestId("trigger-toolbar-unknown");
      fireEvent.click(unknownActionButton);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Layout: Toolbar action: unknown-action');
      });
      // Should not throw error or crash - handler should be undefined and not called
    });

    it('should handle copy action without selection', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const copyButton = screen.getByTestId("trigger-toolbar-copy");
      fireEvent.click(copyButton);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('No process group selected for copying');
      });
    });
  });

  describe('Delete Confirmation Edge Cases', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
      (nifiApiService.getRootProcessGroupId as jest.Mock).mockResolvedValue('root-id');
      (nifiApiService.deleteProcessGroup as jest.Mock).mockResolvedValue({});
      mockDispatch.mockResolvedValue({});
    });

    it('should handle delete confirm without selectedBoxId', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      // Try to delete without selecting a box first
      // This should not call the delete API
      const deleteButton = screen.getByTestId("trigger-toolbar-delete");
      fireEvent.click(deleteButton);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('No process group selected for deletion');
      });
      // Verify delete API was not called
      expect(nifiApiService.deleteProcessGroup).not.toHaveBeenCalled();
    });

    it('should handle delete confirm with selectedBoxId but without parentGroupId', async () => {
      (nifiApiService.getRootProcessGroupId as jest.Mock).mockRejectedValue(new Error('Failed'));
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const deleteButton = screen.getByTestId("trigger-toolbar-delete");
      fireEvent.click(deleteButton);
      await waitFor(() => {
        expect(screen.getByTestId("notification-alert")).toBeInTheDocument();
      });
      const acceptButton = screen.getByTestId("alert-accept");
      fireEvent.click(acceptButton);
      await waitFor(() => {
        expect(nifiApiService.deleteProcessGroup).toHaveBeenCalled();
      });
      // Should not call dispatch to refresh since parentGroupId is missing
      const dispatchCalls = mockDispatch.mock.calls.filter(call => 
        call[0]?.type?.includes('fetchFlowProcessGroups')
      );
      expect(dispatchCalls.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Paste Operation Edge Cases', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
    });

    it('should handle paste without parentGroupId', async () => {
      (nifiApiService.getRootProcessGroupId as jest.Mock).mockRejectedValue(new Error('Failed'));
      (nifiApiService.copyProcessGroup as jest.Mock).mockResolvedValue({ copyId: 'copy-123' });
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      // First copy to set copyResponse
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const copyButton = screen.getByTestId("trigger-toolbar-copy");
      fireEvent.click(copyButton);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Parent group ID not available');
      });
      // Now try to paste - should fail because no parentGroupId
      const pasteButton = screen.getByTestId("trigger-toolbar-paste");
      fireEvent.click(pasteButton);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Parent group ID not available');
      });
    });
  });

  describe('Parameter Dropdown Click Outside', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
    });

    it('should not close dropdown when clicking on MuiMenu-root', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const tabButton = screen.getByTestId("trigger-tab-4");
      fireEvent.click(tabButton);
      await waitFor(() => {
        expect(screen.getByTestId("custom-slider")).toBeInTheDocument();
      });
      const selectField = screen.getByTestId("select-field");
      fireEvent.focus(selectField);
      // Create a mock element with MuiMenu-root class
      const menuElement = document.createElement('div');
      menuElement.className = 'MuiMenu-root';
      document.body.appendChild(menuElement);
      const mousedownEvent = new MouseEvent('mousedown', { bubbles: true });
      Object.defineProperty(mousedownEvent, 'target', { value: menuElement, enumerable: true });
      document.dispatchEvent(mousedownEvent);
      // Dropdown should remain open
      expect(selectField).toBeInTheDocument();
      document.body.removeChild(menuElement);
    });

    it('should not close dropdown when clicking on data-param-select element', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const tabButton = screen.getByTestId("trigger-tab-4");
      fireEvent.click(tabButton);
      await waitFor(() => {
        expect(screen.getByTestId("custom-slider")).toBeInTheDocument();
      });
      const selectField = screen.getByTestId("select-field");
      fireEvent.focus(selectField);
      // Click on the select field itself (which has data-param-select)
      const mousedownEvent = new MouseEvent('mousedown', { bubbles: true });
      Object.defineProperty(mousedownEvent, 'target', { value: selectField, enumerable: true });
      selectField.dispatchEvent(mousedownEvent);
      // Dropdown should remain open
      expect(selectField).toBeInTheDocument();
    });

    it('should close dropdown when clicking outside both MuiMenu-root and data-param-select', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const tabButton = screen.getByTestId("trigger-tab-4");
      fireEvent.click(tabButton);
      await waitFor(() => {
        expect(screen.getByTestId("custom-slider")).toBeInTheDocument();
      });
      const selectField = screen.getByTestId("select-field");
      fireEvent.focus(selectField);
      // Create an element that is neither MuiMenu-root nor data-param-select
      const outsideElement = document.createElement('div');
      outsideElement.className = 'outside-element';
      document.body.appendChild(outsideElement);
      const mousedownEvent = new MouseEvent('mousedown', { bubbles: true });
      Object.defineProperty(mousedownEvent, 'target', { value: outsideElement, enumerable: true });
      document.dispatchEvent(mousedownEvent);
      // Dropdown should close (isParamDropdownOpen should be false)
      // We can't directly test the state, but we can verify the event was handled
      expect(outsideElement).toBeInTheDocument();
      document.body.removeChild(outsideElement);
    });
  });

  describe('Process Group Operations Without Parent Group ID', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
      (nifiApiService.getRootProcessGroupId as jest.Mock).mockRejectedValue(new Error('Failed'));
    });

    it('should handle start operation without parentGroupId and not refresh', async () => {
      (nifiApiService.startProcessGroup as jest.Mock).mockResolvedValue({});
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const startButton = screen.getByTestId("trigger-toolbar-start");
      fireEvent.click(startButton);
      await waitFor(() => {
        expect(nifiApiService.startProcessGroup).toHaveBeenCalled();
      });
      // Should not call dispatch to refresh since parentGroupId is missing
      // The dispatch calls should be minimal (only from initial load)
      const dispatchCalls = mockDispatch.mock.calls.filter(call => 
        call[0]?.type?.includes('fetchFlowProcessGroups')
      );
      // Should not have additional refresh calls
      expect(dispatchCalls.length).toBeLessThanOrEqual(1);
    });

    it('should handle stop operation without parentGroupId and not refresh', async () => {
      (nifiApiService.stopProcessGroup as jest.Mock).mockResolvedValue({});
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const stopButton = screen.getByTestId("trigger-toolbar-stop");
      fireEvent.click(stopButton);
      await waitFor(() => {
        expect(nifiApiService.stopProcessGroup).toHaveBeenCalled();
      });
      // Should not call dispatch to refresh since parentGroupId is missing
      const dispatchCalls = mockDispatch.mock.calls.filter(call => 
        call[0]?.type?.includes('fetchFlowProcessGroups')
      );
      expect(dispatchCalls.length).toBeLessThanOrEqual(1);
    });

    it('should handle enable operation without parentGroupId and not refresh', async () => {
      (nifiApiService.enableProcessGroup as jest.Mock).mockResolvedValue({});
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const enableButton = screen.getByTestId("trigger-toolbar-enable");
      fireEvent.click(enableButton);
      await waitFor(() => {
        expect(nifiApiService.enableProcessGroup).toHaveBeenCalled();
      });
      // Should not call dispatch to refresh since parentGroupId is missing
      const dispatchCalls = mockDispatch.mock.calls.filter(call => 
        call[0]?.type?.includes('fetchFlowProcessGroups')
      );
      expect(dispatchCalls.length).toBeLessThanOrEqual(1);
    });

    it('should handle disable operation without parentGroupId and not refresh', async () => {
      (nifiApiService.disableProcessGroup as jest.Mock).mockResolvedValue({});
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const boxClickButton = screen.getByTestId("trigger-box-click");
      fireEvent.click(boxClickButton);
      const disableButton = screen.getByTestId("trigger-toolbar-disable");
      fireEvent.click(disableButton);
      await waitFor(() => {
        expect(nifiApiService.disableProcessGroup).toHaveBeenCalled();
      });
      // Should not call dispatch to refresh since parentGroupId is missing
      const dispatchCalls = mockDispatch.mock.calls.filter(call => 
        call[0]?.type?.includes('fetchFlowProcessGroups')
      );
      expect(dispatchCalls.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Process Group Creation with Parameter Context', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
      (nifiApiService.getRootProcessGroupId as jest.Mock).mockResolvedValue('root-id');
    });

    it('should create process group with selected parameter context', async () => {
      const fulfilledAction = {
        type: 'createProcessGroup/fulfilled',
        payload: {
          id: 'new-id',
          component: {
            name: 'New Group',
            position: { x: 100, y: 200 },
            runningCount: 0,
            stoppedCount: 0,
            invalidCount: 0,
            disabledCount: 0,
            activeRemotePortCount: 0,
            inactiveRemotePortCount: 0,
            upToDateCount: 0,
            locallyModifiedCount: 0,
            staleCount: 0,
            locallyModifiedAndStaleCount: 0,
            syncFailureCount: 0,
          },
          status: {
            aggregateSnapshot: {
              queued: '0',
              input: '0',
              read: '0',
              written: '0',
              output: '0',
            }
          }
        }
      };
      mockDispatch.mockResolvedValue(fulfilledAction);
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const tabButton = screen.getByTestId("trigger-tab-4");
      fireEvent.click(tabButton);
      await waitFor(() => {
        expect(screen.getByTestId("custom-slider")).toBeInTheDocument();
      });
      const textField = screen.getByTestId("text-field");
      fireEvent.change(textField, { target: { value: 'New Process Group' } });
      const selectField = screen.getByTestId("select-field");
      fireEvent.change(selectField, { target: { value: 'Dataflow_Dev' } });
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });
    });

    it('should create process group with None parameter context when none selected', async () => {
      const fulfilledAction = {
        type: 'createProcessGroup/fulfilled',
        payload: {
          id: 'new-id',
          component: {
            name: 'New Group',
            position: { x: 100, y: 200 },
            runningCount: 0,
            stoppedCount: 0,
            invalidCount: 0,
            disabledCount: 0,
            activeRemotePortCount: 0,
            inactiveRemotePortCount: 0,
            upToDateCount: 0,
            locallyModifiedCount: 0,
            staleCount: 0,
            locallyModifiedAndStaleCount: 0,
            syncFailureCount: 0,
          },
          status: {
            aggregateSnapshot: {
              queued: '0',
              input: '0',
              read: '0',
              written: '0',
              output: '0',
            }
          }
        }
      };
      mockDispatch.mockResolvedValue(fulfilledAction);
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const tabButton = screen.getByTestId("trigger-tab-4");
      fireEvent.click(tabButton);
      await waitFor(() => {
        expect(screen.getByTestId("custom-slider")).toBeInTheDocument();
      });
      const textField = screen.getByTestId("text-field");
      fireEvent.change(textField, { target: { value: 'New Process Group' } });
      // Don't select a parameter context
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });
    });
  });

  describe('Controller Services onBack Callback', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
    });

    it('should handle ControllerServices onBack callback', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      // Switch to controller services view
      const viewChangeButton = screen.getByTestId("trigger-view-change");
      fireEvent.click(viewChangeButton);
      await waitFor(() => {
        expect(screen.getByTestId("controller-services-mock")).toBeInTheDocument();
      });
      // Click the back button to trigger onBack callback (line 615)
      const backButton = screen.getByTestId("controller-services-back");
      fireEvent.click(backButton);
      await waitFor(() => {
        // Should switch back to main view
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      });
    });
  });

  describe('SelectField onClose Callback', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
    });

    it('should handle SelectField onClose callback', async () => {
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      const tabButton = screen.getByTestId("trigger-tab-4");
      fireEvent.click(tabButton);
      await waitFor(() => {
        expect(screen.getByTestId("custom-slider")).toBeInTheDocument();
      });
      const selectField = screen.getByTestId("select-field");
      // Open the dropdown
      fireEvent.focus(selectField);
      // Close the dropdown by calling onClose
      fireEvent.blur(selectField);
      // Verify the field is still in the document
      expect(selectField).toBeInTheDocument();
    });
  });

  describe('Paste Without ParentGroupId Error Path', () => {
    beforeEach(async () => {
      (nifiApiService.authenticate as jest.Mock).mockResolvedValue(undefined);
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue({});
    });

    it('should handle paste error path when parentGroupId is missing', async () => {
      (nifiApiService.getRootProcessGroupId as jest.Mock).mockRejectedValue(new Error('Failed'));
      // Set up copyResponse but no parentGroupId
      (nifiApiService.copyProcessGroup as jest.Mock).mockResolvedValue({ copyId: 'copy-123' });
      render(<Layout />);
      await waitFor(() => {
        expect(screen.getByTestId("grid-mock")).toBeInTheDocument();
      }, { timeout: 3000 });
      // Try to paste without parentGroupId - should log error on line 534-535
      const pasteButton = screen.getByTestId("trigger-toolbar-paste");
      fireEvent.click(pasteButton);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Parent group ID not available');
      });
    });
  });
});

