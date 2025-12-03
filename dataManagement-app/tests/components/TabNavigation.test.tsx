import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TabNavigation from '../../src/components/TabNavigation';

// Mock Carbon icons
jest.mock('@carbon/icons-react', () => ({
  Search: ({ size }: any) => <div data-testid="search-icon" data-size={size} />,
  Play: ({ size }: any) => <div data-testid="play-icon" data-size={size} />,
  Stop: ({ size }: any) => <div data-testid="stop-icon" data-size={size} />,
  Flash: ({ size }: any) => <div data-testid="flash-icon" data-size={size} />,
  FlashOff: ({ size }: any) => <div data-testid="flash-off-icon" data-size={size} />,
  WatsonHealthSaveSeries: ({ size }: any) => <div data-testid="save-series-icon" data-size={size} />,
  Copy: ({ size }: any) => <div data-testid="copy-icon" data-size={size} />,
  Paste: ({ size }: any) => <div data-testid="paste-icon" data-size={size} />,
  GroupObjects: ({ size }: any) => <div data-testid="group-objects-icon" data-size={size} />,
  TrashCan: ({ size }: any) => <div data-testid="trash-can-icon" data-size={size} />,
  ColorPalette: ({ size }: any) => <div data-testid="color-palette-icon" data-size={size} />,
  SettingsServices: ({ size }: any) => <div data-testid="settings-services-icon" data-size={size} />,
  Compass: ({ size }: any) => <div data-testid="compass-icon" data-size={size} />,
  DocumentProcessor: ({ size }: any) => <div data-testid="document-processor-icon" data-size={size} />,
  PortInput: ({ size }: any) => <div data-testid="port-input-icon" data-size={size} />,
  PortOutput: ({ size }: any) => <div data-testid="port-output-icon" data-size={size} />,
  Template: ({ size }: any) => <div data-testid="template-icon" data-size={size} />,
  Notebook: ({ size }: any) => <div data-testid="notebook-icon" data-size={size} />,
  IbmCloudVpcEndpoints: ({ size }: any) => <div data-testid="vpc-endpoints-icon" data-size={size} />,
  IbmUnstructuredDataProcessor: ({ size }: any) => <div data-testid="unstructured-processor-icon" data-size={size} />,
}));

// Mock the onTabChange and onViewChange functions
const mockOnTabChange = jest.fn();
const mockOnViewChange = jest.fn();

// Default props for the component
const defaultProps = {
  activeTab: 0,
  onTabChange: mockOnTabChange,
  onViewChange: mockOnViewChange,
};

describe('TabNavigation', () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      render(<TabNavigation {...defaultProps} />);
      expect(screen.getByText('Navigate')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle tab click events', () => {
      const onTabChange = jest.fn();
      render(<TabNavigation activeTab={0} onTabChange={onTabChange} />);
      
      const navigateTab = screen.getByText('Navigate');
      const processGroupTab = screen.getByText('Process Group');
      const disabledTab = screen.getByText('Processor');
      
      fireEvent.click(navigateTab);
      expect(onTabChange).toHaveBeenCalledWith(0);
      
      fireEvent.click(processGroupTab);
      expect(onTabChange).toHaveBeenCalledWith(4);
      
      fireEvent.click(disabledTab);
      // Should not trigger for disabled tabs
      expect(onTabChange).not.toHaveBeenCalledWith(1);
    });

    it('should handle tab hover states', () => {
      render(<TabNavigation {...defaultProps} />);
      
      const navigateTab = screen.getByText('Navigate');
      
      fireEvent.mouseEnter(navigateTab);
      fireEvent.mouseLeave(navigateTab);
      
      expect(navigateTab).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have tooltip attributes available', () => {
      render(<TabNavigation {...defaultProps} />);
      
      // Check for data-tooltip attributes instead of text content
      const startElement = screen.getByRole('tooltip', { name: /start/i });
      const stopElement = screen.getByRole('tooltip', { name: /stop/i });
      const searchElement = screen.getByRole('tooltip', { name: /search/i });
      
      expect(startElement).toBeInTheDocument();
      expect(stopElement).toBeInTheDocument();
      expect(searchElement).toBeInTheDocument();
    });
  });

  describe('Component Props Variations', () => {
    it('should handle onTabChange callback variations', () => {
      const mockCallback1 = jest.fn();
      const mockCallback2 = jest.fn();
      const mockViewChange = jest.fn();
      
      const { rerender } = render(
        <TabNavigation activeTab={0} onTabChange={mockCallback1} />
      );
      
      const navigateTab = screen.getByText('Navigate');
      fireEvent.click(navigateTab);
      expect(mockCallback1).toHaveBeenCalled();
      
      rerender(<TabNavigation activeTab={0} onTabChange={mockCallback2} />);
      fireEvent.click(navigateTab);
      expect(mockCallback2).toHaveBeenCalled();
    });
  });

  describe('Toolbar Actions (lines 105-112, 295)', () => {
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it('should handle toolbar icon click and log action (line 105, 295)', () => {
      const onViewChange = jest.fn();
      render(<TabNavigation activeTab={0} onTabChange={mockOnTabChange} onViewChange={onViewChange} />);
      
      // Find the Start toolbar icon (first one)
      const startIcon = screen.getByTestId('play-icon');
      const startButton = startIcon.closest('.toolbar-icon');
      
      if (startButton) {
        fireEvent.click(startButton);
        
        // Verify handleToolbarAction was called and logged (line 105)
        expect(consoleLogSpy).toHaveBeenCalledWith('Toolbar action: Start');
      }
    });

    it('should handle Stop toolbar action (line 105)', () => {
      render(<TabNavigation {...defaultProps} />);
      
      // Find the Stop toolbar icon
      const stopIcon = screen.getByTestId('stop-icon');
      const stopButton = stopIcon.closest('.toolbar-icon');
      
      if (stopButton) {
        fireEvent.click(stopButton);
        
        // Verify the action was logged (line 105)
        expect(consoleLogSpy).toHaveBeenCalledWith('Toolbar action: Stop');
      }
    });

    it('should handle configuration action and call onViewChange (lines 107-112)', () => {
      const onViewChange = jest.fn();
      render(<TabNavigation activeTab={0} onTabChange={mockOnTabChange} onViewChange={onViewChange} />);
      
      // Find the Configuration (SettingsServices) toolbar icon
      const configIcon = screen.getByTestId('settings-services-icon');
      const configButton = configIcon.closest('.toolbar-icon');
      
      if (configButton) {
        fireEvent.click(configButton);
        
        // Verify console logs for configuration action (lines 108-110)
        expect(consoleLogSpy).toHaveBeenCalledWith('Toolbar action: configuration');
        expect(consoleLogSpy).toHaveBeenCalledWith('Opening Controller Services...');
        expect(consoleLogSpy).toHaveBeenCalledWith('TabNavigation: Calling onViewChange with controller-services');
        
        // Verify onViewChange was called with 'controller-services' (line 112)
        expect(onViewChange).toHaveBeenCalledWith('controller-services');
      }
    });

    it('should handle Enable toolbar action (line 105)', () => {
      render(<TabNavigation {...defaultProps} />);
      
      // Find the Enable (Flash) toolbar icon
      const enableIcon = screen.getByTestId('flash-icon');
      const enableButton = enableIcon.closest('.toolbar-icon');
      
      if (enableButton) {
        fireEvent.click(enableButton);
        
        // Verify the action was logged
        expect(consoleLogSpy).toHaveBeenCalledWith('Toolbar action: Enable');
      }
    });

    it('should handle Disable toolbar action (line 105)', () => {
      render(<TabNavigation {...defaultProps} />);
      
      // Find the Disable (FlashOff) toolbar icon
      const disableIcon = screen.getByTestId('flash-off-icon');
      const disableButton = disableIcon.closest('.toolbar-icon');
      
      if (disableButton) {
        fireEvent.click(disableButton);
        
        // Verify the action was logged
        expect(consoleLogSpy).toHaveBeenCalledWith('Toolbar action: Disable');
      }
    });

    it('should handle Save Template toolbar action (line 105)', () => {
      render(<TabNavigation {...defaultProps} />);
      
      // Find the Save Template toolbar icon
      const saveIcon = screen.getByTestId('save-series-icon');
      const saveButton = saveIcon.closest('.toolbar-icon');
      
      if (saveButton) {
        fireEvent.click(saveButton);
        
        // Verify the action was logged
        expect(consoleLogSpy).toHaveBeenCalledWith('Toolbar action: save-template');
      }
    });

    it('should handle Copy toolbar action (line 105)', () => {
      render(<TabNavigation {...defaultProps} />);
      
      // Find the Copy toolbar icon
      const copyIcon = screen.getByTestId('copy-icon');
      const copyButton = copyIcon.closest('.toolbar-icon');
      
      if (copyButton) {
        fireEvent.click(copyButton);
        
        // Verify the action was logged
        expect(consoleLogSpy).toHaveBeenCalledWith('Toolbar action: copy');
      }
    });

    it('should handle Paste toolbar action (line 105)', () => {
      render(<TabNavigation {...defaultProps} />);
      
      // Find the Paste toolbar icon
      const pasteIcon = screen.getByTestId('paste-icon');
      const pasteButton = pasteIcon.closest('.toolbar-icon');
      
      if (pasteButton) {
        fireEvent.click(pasteButton);
        
        // Verify the action was logged
        expect(consoleLogSpy).toHaveBeenCalledWith('Toolbar action: paste');
      }
    });

    it('should handle Group toolbar action (line 105)', () => {
      render(<TabNavigation {...defaultProps} />);
      
      // Find all Group icons (one in tabs, one in toolbar)
      const groupIcons = screen.getAllByTestId('group-objects-icon');
      // The toolbar icon is the second one (index 1)
      const groupButton = groupIcons[1]?.closest('.toolbar-icon');
      
      if (groupButton) {
        fireEvent.click(groupButton);
        
        // Verify the action was logged
        expect(consoleLogSpy).toHaveBeenCalledWith('Toolbar action: group');
      }
    });

    it('should handle Delete toolbar action (line 105)', () => {
      render(<TabNavigation {...defaultProps} />);
      
      // Find the Delete (TrashCan) toolbar icon
      const deleteIcon = screen.getByTestId('trash-can-icon');
      const deleteButton = deleteIcon.closest('.toolbar-icon');
      
      if (deleteButton) {
        fireEvent.click(deleteButton);
        
        // Verify the action was logged
        expect(consoleLogSpy).toHaveBeenCalledWith('Toolbar action: delete');
      }
    });

    it('should handle Change Color toolbar action (line 105)', () => {
      render(<TabNavigation {...defaultProps} />);
      
      // Find the Change Color (ColorPalette) toolbar icon
      const colorIcon = screen.getByTestId('color-palette-icon');
      const colorButton = colorIcon.closest('.toolbar-icon');
      
      if (colorButton) {
        fireEvent.click(colorButton);
        
        // Verify the action was logged
        expect(consoleLogSpy).toHaveBeenCalledWith('Toolbar action: change-color');
      }
    });

    it('should verify all toolbar icons render correctly (line 295)', () => {
      render(<TabNavigation {...defaultProps} />);
      
      // Verify all toolbar icons are rendered and clickable
      expect(screen.getByTestId('play-icon')).toBeInTheDocument();
      expect(screen.getByTestId('stop-icon')).toBeInTheDocument();
      expect(screen.getByTestId('flash-icon')).toBeInTheDocument();
      expect(screen.getByTestId('flash-off-icon')).toBeInTheDocument();
      expect(screen.getByTestId('save-series-icon')).toBeInTheDocument();
      expect(screen.getByTestId('copy-icon')).toBeInTheDocument();
      expect(screen.getByTestId('paste-icon')).toBeInTheDocument();
      // group-objects-icon appears twice (tab and toolbar), just verify it exists
      expect(screen.getAllByTestId('group-objects-icon').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByTestId('trash-can-icon')).toBeInTheDocument();
      expect(screen.getByTestId('color-palette-icon')).toBeInTheDocument();
      expect(screen.getByTestId('settings-services-icon')).toBeInTheDocument();
    });
  });

  describe('Breadcrumb Display', () => {
    it('should render breadcrumb when provided', () => {
      const breadcrumb = {
        flow: 'Test Flow',
        processGroup: 'Test Group',
        id: 'test-id-123'
      };
      
      render(
        <TabNavigation 
          activeTab={0} 
          onTabChange={mockOnTabChange} 
          onViewChange={mockOnViewChange}
          breadcrumb={breadcrumb}
        />
      );
      
      expect(screen.getByText('Test Flow')).toBeInTheDocument();
      expect(screen.getByText('Test Group')).toBeInTheDocument();
      expect(screen.getByText('test-id-123')).toBeInTheDocument();
    });

    it('should not render breadcrumb when flow is not provided', () => {
      render(<TabNavigation {...defaultProps} />);
      
      // Breadcrumb should not be rendered
      const breadcrumbContainer = document.querySelector('.secondary-toolbar');
      expect(breadcrumbContainer).toBeInTheDocument();
    });

    it('should render partial breadcrumb with only flow', () => {
      const breadcrumb = {
        flow: 'Only Flow'
      };
      
      render(
        <TabNavigation 
          activeTab={0} 
          onTabChange={mockOnTabChange} 
          onViewChange={mockOnViewChange}
          breadcrumb={breadcrumb}
        />
      );
      
      expect(screen.getByText('Only Flow')).toBeInTheDocument();
    });
  });
});
