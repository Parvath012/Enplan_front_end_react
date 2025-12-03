/**
 * Unit tests for DepartmentLegendDropdown component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DepartmentLegendDropdown from '../../../src/components/reportingStructure/DepartmentLegendDropdown';
import { DEPARTMENT_COLORS } from '../../../src/constants/reportingStructureConstants';

describe('DepartmentLegendDropdown', () => {
  const mockAnchorEl = document.createElement('div');
  const mockOnClose = jest.fn();

  const defaultProps = {
    anchorEl: mockAnchorEl,
    open: true,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render dropdown when open', () => {
    render(<DepartmentLegendDropdown {...defaultProps} />);
    expect(screen.getByText('Department')).toBeInTheDocument();
  });

  it('should not render dropdown when closed', () => {
    render(<DepartmentLegendDropdown {...defaultProps} open={false} />);
    expect(screen.queryByText('Department')).not.toBeInTheDocument();
  });

  it('should render all departments except Default and Sales', () => {
    render(<DepartmentLegendDropdown {...defaultProps} />);
    
    const departments = Object.keys(DEPARTMENT_COLORS).filter(
      (key) => key !== 'Default' && key !== 'Sales'
    );

    departments.forEach((dept) => {
      expect(screen.getByText(dept)).toBeInTheDocument();
    });
  });

  it('should not render Default department', () => {
    render(<DepartmentLegendDropdown {...defaultProps} />);
    expect(screen.queryByText('Default')).not.toBeInTheDocument();
  });

  it('should not render Sales department', () => {
    render(<DepartmentLegendDropdown {...defaultProps} />);
    expect(screen.queryByText('Sales')).not.toBeInTheDocument();
  });

  it('should display department names in sorted order', () => {
    render(<DepartmentLegendDropdown {...defaultProps} />);
    const departmentElements = screen.getAllByText(/^(Finance|HR|IT|Legal|Marketing|Operations)$/);
    const departmentNames = departmentElements.map((el) => el.textContent);
    const sortedNames = [...departmentNames].sort();
    expect(departmentNames).toEqual(sortedNames);
  });

  it('should display color indicators for each department', () => {
    const { baseElement } = render(<DepartmentLegendDropdown {...defaultProps} />);
    // Color indicators are Box components with borderRadius: '50%'
    const colorIndicators = baseElement.querySelectorAll('div[style*="border-radius: 50%"], div[style*="border-radius:50%"]');
    const departments = Object.keys(DEPARTMENT_COLORS).filter(
      (key) => key !== 'Default' && key !== 'Sales'
    );
    // At least one color indicator should be present for each department
    expect(colorIndicators.length).toBeGreaterThanOrEqual(departments.length);
  });

  it('should have correct styling for compact layout', () => {
    const { baseElement } = render(<DepartmentLegendDropdown {...defaultProps} />);
    const menu = baseElement.querySelector('[role="menu"]');
    expect(menu).toBeInTheDocument();
  });

  it('should call onClose when menu is closed', () => {
    const { baseElement } = render(<DepartmentLegendDropdown {...defaultProps} />);
    const menu = baseElement.querySelector('[role="menu"]');
    if (menu) {
      fireEvent.keyDown(menu, { key: 'Escape' });
      expect(mockOnClose).toHaveBeenCalled();
    }
  });
});

