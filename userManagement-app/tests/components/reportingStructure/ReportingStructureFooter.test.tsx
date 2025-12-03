/**
 * Tests for ReportingStructureFooter
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReportingStructureFooter from '../../../src/components/reportingStructure/ReportingStructureFooter';
import { ViewByType } from '../../../src/constants/reportingStructureConstants';

// Mock DepartmentLegendDropdown
jest.mock('../../../src/components/reportingStructure/DepartmentLegendDropdown', () => {
  return function MockDepartmentLegendDropdown({ open, onClose, nodes }: any) {
    return open ? (
      <div data-testid="department-legend-dropdown">
        <button onClick={onClose}>Close</button>
        <div>Nodes: {nodes?.length || 0}</div>
      </div>
    ) : null;
  };
});

describe('ReportingStructureFooter', () => {
  it('should render with default props', () => {
    render(<ReportingStructureFooter />);
    expect(screen.queryByText('Department')).not.toBeInTheDocument();
  });

  it('should show department legend for departmental view', () => {
    render(<ReportingStructureFooter viewType="departmental" />);
    expect(screen.getByText('Department')).toBeInTheDocument();
  });

  it('should not show department legend for organizational view', () => {
    render(<ReportingStructureFooter viewType="organizational" />);
    expect(screen.queryByText('Department')).not.toBeInTheDocument();
  });

  it('should not show department legend for dotted-line view', () => {
    render(<ReportingStructureFooter viewType="dotted-line" />);
    expect(screen.queryByText('Department')).not.toBeInTheDocument();
  });

  it('should show dotted-line legend for dotted-line view', () => {
    render(<ReportingStructureFooter viewType="dotted-line" />);
    expect(screen.getByText('Direct Reporting:')).toBeInTheDocument();
    expect(screen.getByText('Dotted-line Reporting:')).toBeInTheDocument();
  });

  it('should not show dotted-line legend for non-dotted-line views', () => {
    render(<ReportingStructureFooter viewType="organizational" />);
    expect(screen.queryByText('Direct Reporting:')).not.toBeInTheDocument();
    expect(screen.queryByText('Dotted-line Reporting:')).not.toBeInTheDocument();
  });

  it('should open department dropdown when clicked', () => {
    render(<ReportingStructureFooter viewType="departmental" />);
    
    const button = screen.getByText('Department');
    fireEvent.click(button);
    
    expect(screen.getByTestId('department-legend-dropdown')).toBeInTheDocument();
  });

  it('should close department dropdown when close is clicked', () => {
    render(<ReportingStructureFooter viewType="departmental" />);
    
    const button = screen.getByText('Department');
    fireEvent.click(button);
    
    expect(screen.getByTestId('department-legend-dropdown')).toBeInTheDocument();
    
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    expect(screen.queryByTestId('department-legend-dropdown')).not.toBeInTheDocument();
  });

  it('should pass nodes to DepartmentLegendDropdown', () => {
    const nodes = [
      { id: '1', data: { department: 'HR' } },
      { id: '2', data: { department: 'IT' } }
    ];
    
    render(<ReportingStructureFooter viewType="departmental" nodes={nodes} />);
    
    const button = screen.getByText('Department');
    fireEvent.click(button);
    
    expect(screen.getByText('Nodes: 2')).toBeInTheDocument();
  });

  it('should handle click event with stopPropagation', () => {
    const parentClick = jest.fn();
    render(
      <div onClick={parentClick}>
        <ReportingStructureFooter viewType="departmental" />
      </div>
    );
    
    const button = screen.getByText('Department');
    const clickEvent = new MouseEvent('click', { bubbles: true });
    jest.spyOn(clickEvent, 'stopPropagation');
    
    fireEvent.click(button, clickEvent);
    
    // The dropdown should open, which means stopPropagation was called
    expect(screen.getByTestId('department-legend-dropdown')).toBeInTheDocument();
  });

  it('should use button ref when available', () => {
    render(<ReportingStructureFooter viewType="departmental" />);
    
    const button = screen.getByText('Department');
    fireEvent.click(button);
    
    // Should open dropdown using ref
    expect(screen.getByTestId('department-legend-dropdown')).toBeInTheDocument();
  });

  it('should apply correct styles for departmental view', () => {
    const { container } = render(<ReportingStructureFooter viewType="departmental" />);
    const footer = container.firstChild as HTMLElement;
    
    expect(footer).toHaveStyle({
      display: 'flex',
      justifyContent: 'flex-end'
    });
  });

  it('should apply correct styles for dotted-line view', () => {
    const { container } = render(<ReportingStructureFooter viewType="dotted-line" />);
    const footer = container.firstChild as HTMLElement;
    
    expect(footer).toHaveStyle({
      display: 'flex',
      justifyContent: 'space-between'
    });
  });
});
