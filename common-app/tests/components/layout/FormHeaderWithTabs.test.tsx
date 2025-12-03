import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import FormHeaderWithTabs from '../../../src/components/layout/FormHeaderWithTabs';
import { FormHeaderWithTabsProps } from '../../../src/types/FormHeaderTypes';

// Mock FormHeaderBase
jest.mock('../../../src/components/layout/FormHeaderBase', () => {
  return function MockFormHeaderBase({ children, ...props }: any) {
    return (
      <div data-testid="form-header-base" {...props}>
        {children}
      </div>
    );
  };
});

const theme = createTheme();

const defaultProps: FormHeaderWithTabsProps = {
  title: 'Test Title',
  tabs: [
    { label: 'Tab 1', value: 'tab1' },
    { label: 'Tab 2', value: 'tab2' },
    { label: 'Tab 3', value: 'tab3' }
  ],
  activeTab: 'tab1',
  onTabChange: jest.fn()
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('FormHeaderWithTabs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Structure', () => {
    it('renders with required props', () => {
      renderWithTheme(<FormHeaderWithTabs {...defaultProps} />);
      
      expect(screen.getByTestId('form-header-base')).toBeInTheDocument();
    });

    it('renders all tabs', () => {
      renderWithTheme(<FormHeaderWithTabs {...defaultProps} />);
      
      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
      expect(screen.getByText('Tab 3')).toBeInTheDocument();
    });

    it('renders tabs container with correct styling', () => {
      renderWithTheme(<FormHeaderWithTabs {...defaultProps} />);
      
      const tabsContainer = screen.getByText('Tab 1').closest('div');
      expect(tabsContainer).toBeInTheDocument();
      expect(tabsContainer).toHaveClass('MuiBox-root');
    });
  });

  describe('Tab Functionality', () => {
    it('calls onTabChange when tab is clicked', () => {
      const mockOnTabChange = jest.fn();
      renderWithTheme(
        <FormHeaderWithTabs 
          {...defaultProps} 
          onTabChange={mockOnTabChange}
        />
      );
      
      const tab2 = screen.getByText('Tab 2');
      fireEvent.click(tab2);
      
      expect(mockOnTabChange).toHaveBeenCalledWith(expect.any(Object), 'tab2');
    });

    it('calls onTabChange when active tab is clicked', () => {
      const mockOnTabChange = jest.fn();
      renderWithTheme(
        <FormHeaderWithTabs 
          {...defaultProps} 
          onTabChange={mockOnTabChange}
        />
      );
      
      const tab1 = screen.getByText('Tab 1');
      fireEvent.click(tab1);
      
      expect(mockOnTabChange).toHaveBeenCalledWith(expect.any(Object), 'tab1');
    });

    it('handles tab click with synthetic event', () => {
      const mockOnTabChange = jest.fn();
      renderWithTheme(
        <FormHeaderWithTabs 
          {...defaultProps} 
          onTabChange={mockOnTabChange}
        />
      );
      
      const tab3 = screen.getByText('Tab 3');
      fireEvent.click(tab3);
      
      expect(mockOnTabChange).toHaveBeenCalledTimes(1);
      const [event, value] = mockOnTabChange.mock.calls[0];
      expect(event).toBeInstanceOf(Object);
      expect(value).toBe('tab3');
    });
  });

  describe('Active Tab Styling', () => {
    it('applies active styling to active tab', () => {
      renderWithTheme(<FormHeaderWithTabs {...defaultProps} activeTab="tab2" />);
      
      const tab2 = screen.getByText('Tab 2');
      const tabElement = tab2.closest('div');
      
      expect(tabElement).toHaveStyle({
        color: 'rgb(208, 240, 255)',
        backgroundColor: '#1565c0',
        borderRadius: '4px'
      });
    });

    it('applies inactive styling to inactive tabs', () => {
      renderWithTheme(<FormHeaderWithTabs {...defaultProps} activeTab="tab1" />);
      
      const tab2 = screen.getByText('Tab 2');
      const tabElement = tab2.closest('div');
      
      expect(tabElement).toHaveStyle({
        color: '#818586',
        backgroundColor: 'transparent',
        borderRadius: '0px'
      });
    });

    it('applies correct styling to first tab when active', () => {
      renderWithTheme(<FormHeaderWithTabs {...defaultProps} activeTab="tab1" />);
      
      const tab1 = screen.getByText('Tab 1');
      const tabElement = tab1.closest('div');
      
      expect(tabElement).toHaveStyle({
        color: 'rgb(208, 240, 255)',
        backgroundColor: '#1565c0',
        borderRadius: '4px'
      });
    });

    it('applies correct styling to last tab when active', () => {
      renderWithTheme(<FormHeaderWithTabs {...defaultProps} activeTab="tab3" />);
      
      const tab3 = screen.getByText('Tab 3');
      const tabElement = tab3.closest('div');
      
      expect(tabElement).toHaveStyle({
        color: 'rgb(208, 240, 255)',
        backgroundColor: '#1565c0',
        borderRadius: '4px'
      });
    });
  });

  describe('Tab Styling Properties', () => {
    it('applies correct flex properties to tabs', () => {
      renderWithTheme(<FormHeaderWithTabs {...defaultProps} />);
      
      const tab1 = screen.getByText('Tab 1');
      const tabElement = tab1.closest('div');
      
      expect(tabElement).toHaveStyle({
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      });
    });

    it('applies correct font properties to tabs', () => {
      renderWithTheme(<FormHeaderWithTabs {...defaultProps} />);
      
      const tab1 = screen.getByText('Tab 1');
      const tabElement = tab1.closest('div');
      
      expect(tabElement).toBeInTheDocument();
      expect(tabElement).toHaveClass('MuiBox-root');
    });

    it('applies transition properties to tabs', () => {
      renderWithTheme(<FormHeaderWithTabs {...defaultProps} />);
      
      const tab1 = screen.getByText('Tab 1');
      const tabElement = tab1.closest('div');
      
      expect(tabElement).toHaveStyle({
        transition: 'all 0.2s ease'
      });
    });
  });

  describe('Hover Effects', () => {
    it('applies hover styles to inactive tabs', () => {
      renderWithTheme(<FormHeaderWithTabs {...defaultProps} activeTab="tab1" />);
      
      const tab2 = screen.getByText('Tab 2');
      const tabElement = tab2.closest('div');
      
      expect(tabElement).toBeInTheDocument();
      expect(tabElement).toHaveClass('MuiBox-root');
    });

    it('maintains active styles on hover for active tab', () => {
      renderWithTheme(<FormHeaderWithTabs {...defaultProps} activeTab="tab1" />);
      
      const tab1 = screen.getByText('Tab 1');
      const tabElement = tab1.closest('div');
      
      expect(tabElement).toBeInTheDocument();
      expect(tabElement).toHaveClass('MuiBox-root');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty tabs array', () => {
      renderWithTheme(
        <FormHeaderWithTabs 
          {...defaultProps} 
          tabs={[]}
        />
      );
      
      expect(screen.getByTestId('form-header-base')).toBeInTheDocument();
    });

    it('handles single tab', () => {
      renderWithTheme(
        <FormHeaderWithTabs 
          {...defaultProps} 
          tabs={[{ label: 'Single Tab', value: 'single' }]}
          activeTab="single"
        />
      );
      
      expect(screen.getByText('Single Tab')).toBeInTheDocument();
    });

    it('handles undefined activeTab', () => {
      renderWithTheme(
        <FormHeaderWithTabs 
          {...defaultProps} 
          activeTab={undefined as any}
        />
      );
      
      // All tabs should appear inactive
      const tab1 = screen.getByText('Tab 1');
      const tabElement = tab1.closest('div');
      
      expect(tabElement).toHaveStyle({
        color: '#818586',
        backgroundColor: 'transparent'
      });
    });

    it('handles activeTab not in tabs list', () => {
      renderWithTheme(
        <FormHeaderWithTabs 
          {...defaultProps} 
          activeTab="nonexistent"
        />
      );
      
      // All tabs should appear inactive
      const tab1 = screen.getByText('Tab 1');
      const tabElement = tab1.closest('div');
      
      expect(tabElement).toHaveStyle({
        color: '#818586',
        backgroundColor: 'transparent'
      });
    });
  });

  describe('Props Forwarding', () => {
    it('passes all props to FormHeaderBase', () => {
      const customProps = {
        ...defaultProps,
        title: 'Custom Title',
        subtitle: 'Custom Subtitle',
        showBackButton: true
      };
      
      renderWithTheme(<FormHeaderWithTabs {...customProps} />);
      
      const formHeaderBase = screen.getByTestId('form-header-base');
      expect(formHeaderBase).toBeInTheDocument();
    });

    it('renders tabs element inside FormHeaderBase', () => {
      renderWithTheme(<FormHeaderWithTabs {...defaultProps} />);
      
      const formHeaderBase = screen.getByTestId('form-header-base');
      const tabsContainer = screen.getByText('Tab 1').closest('div');
      
      expect(formHeaderBase).toContainElement(tabsContainer);
    });
  });

  describe('Accessibility', () => {
    it('renders tabs with proper structure', () => {
      renderWithTheme(<FormHeaderWithTabs {...defaultProps} />);
      
      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
      expect(screen.getByText('Tab 3')).toBeInTheDocument();
    });

    it('maintains tab order', () => {
      renderWithTheme(<FormHeaderWithTabs {...defaultProps} />);
      
      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
      expect(screen.getByText('Tab 3')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders efficiently with multiple tabs', () => {
      const manyTabs = Array.from({ length: 10 }, (_, i) => ({
        label: `Tab ${i + 1}`,
        value: `tab${i + 1}`
      }));
      
      const startTime = performance.now();
      renderWithTheme(
        <FormHeaderWithTabs 
          {...defaultProps} 
          tabs={manyTabs}
        />
      );
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('handles rapid tab changes', () => {
      const mockOnTabChange = jest.fn();
      const { rerender } = renderWithTheme(
        <FormHeaderWithTabs 
          {...defaultProps} 
          onTabChange={mockOnTabChange}
        />
      );
      
      // Simulate rapid tab changes
      rerender(
        <FormHeaderWithTabs 
          {...defaultProps} 
          activeTab="tab2"
          onTabChange={mockOnTabChange}
        />
      );
      
      rerender(
        <FormHeaderWithTabs 
          {...defaultProps} 
          activeTab="tab3"
          onTabChange={mockOnTabChange}
        />
      );
      
      expect(screen.getByText('Tab 3')).toBeInTheDocument();
    });
  });
});
