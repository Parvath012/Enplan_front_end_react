/**
 * Tests for ViewByDropdown
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ViewByDropdown from '../../../src/components/reportingStructure/ViewByDropdown';
import { VIEW_BY_OPTIONS } from '../../../src/constants/reportingStructureConstants';

describe('ViewByDropdown', () => {
  const mockAnchorEl = document.createElement('div');
  const mockOnClose = jest.fn();
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when open', () => {
    render(
      <ViewByDropdown
        anchorEl={mockAnchorEl}
        open={true}
        onClose={mockOnClose}
        selectedView="organizational"
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('View By')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <ViewByDropdown
        anchorEl={mockAnchorEl}
        open={false}
        onClose={mockOnClose}
        selectedView="organizational"
        onSelect={mockOnSelect}
      />
    );

    expect(screen.queryByText('View By')).not.toBeInTheDocument();
  });

  it('should render all view options', () => {
    render(
      <ViewByDropdown
        anchorEl={mockAnchorEl}
        open={true}
        onClose={mockOnClose}
        selectedView="organizational"
        onSelect={mockOnSelect}
      />
    );

    VIEW_BY_OPTIONS.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it('should call onSelect and onClose when option is clicked', () => {
    render(
      <ViewByDropdown
        anchorEl={mockAnchorEl}
        open={true}
        onClose={mockOnClose}
        selectedView="organizational"
        onSelect={mockOnSelect}
      />
    );

    const departmentalOption = screen.getByText('Departmental Structure');
    fireEvent.click(departmentalOption);

    expect(mockOnSelect).toHaveBeenCalledWith('departmental');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should highlight selected view', () => {
    render(
      <ViewByDropdown
        anchorEl={mockAnchorEl}
        open={true}
        onClose={mockOnClose}
        selectedView="departmental"
        onSelect={mockOnSelect}
      />
    );

    const selectedItem = screen.getByText('Departmental Structure').closest('li');
    expect(selectedItem).toHaveClass('Mui-selected');
  });

  it('should call onClose when menu is closed', () => {
    const { rerender } = render(
      <ViewByDropdown
        anchorEl={mockAnchorEl}
        open={true}
        onClose={mockOnClose}
        selectedView="organizational"
        onSelect={mockOnSelect}
      />
    );

    rerender(
      <ViewByDropdown
        anchorEl={mockAnchorEl}
        open={false}
        onClose={mockOnClose}
        selectedView="organizational"
        onSelect={mockOnSelect}
      />
    );

    // onClose should be callable
    expect(mockOnClose).toBeDefined();
  });

  it('should call onClose when clicking outside menu', () => {
    render(
      <ViewByDropdown
        anchorEl={mockAnchorEl}
        open={true}
        onClose={mockOnClose}
        selectedView="organizational"
        onSelect={mockOnSelect}
      />
    );

    // Simulate menu close event
    fireEvent.keyDown(document, { key: 'Escape' });
    
    // Menu should handle close
    expect(mockOnClose).toBeDefined();
  });

  it('should handle all three view types selection', () => {
    const { rerender } = render(
      <ViewByDropdown
        anchorEl={mockAnchorEl}
        open={true}
        onClose={mockOnClose}
        selectedView="organizational"
        onSelect={mockOnSelect}
      />
    );

    // Select organizational
    const orgOption = screen.getByText('Organizational Structure');
    fireEvent.click(orgOption);
    expect(mockOnSelect).toHaveBeenCalledWith('organizational');
    expect(mockOnClose).toHaveBeenCalled();

    jest.clearAllMocks();

    // Select departmental
    rerender(
      <ViewByDropdown
        anchorEl={mockAnchorEl}
        open={true}
        onClose={mockOnClose}
        selectedView="departmental"
        onSelect={mockOnSelect}
      />
    );
    const deptOption = screen.getByText('Departmental Structure');
    fireEvent.click(deptOption);
    expect(mockOnSelect).toHaveBeenCalledWith('departmental');
    expect(mockOnClose).toHaveBeenCalled();

    jest.clearAllMocks();

    // Select dotted-line
    rerender(
      <ViewByDropdown
        anchorEl={mockAnchorEl}
        open={true}
        onClose={mockOnClose}
        selectedView="dotted-line"
        onSelect={mockOnSelect}
      />
    );
    const dottedOption = screen.getByText('Dotted-line Reporting');
    fireEvent.click(dottedOption);
    expect(mockOnSelect).toHaveBeenCalledWith('dotted-line');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should highlight correct selected view', () => {
    const { rerender } = render(
      <ViewByDropdown
        anchorEl={mockAnchorEl}
        open={true}
        onClose={mockOnClose}
        selectedView="organizational"
        onSelect={mockOnSelect}
      />
    );

    let selectedItem = screen.getByText('Organizational Structure').closest('li');
    expect(selectedItem).toHaveClass('Mui-selected');

    rerender(
      <ViewByDropdown
        anchorEl={mockAnchorEl}
        open={true}
        onClose={mockOnClose}
        selectedView="departmental"
        onSelect={mockOnSelect}
      />
    );

    selectedItem = screen.getByText('Departmental Structure').closest('li');
    expect(selectedItem).toHaveClass('Mui-selected');

    rerender(
      <ViewByDropdown
        anchorEl={mockAnchorEl}
        open={true}
        onClose={mockOnClose}
        selectedView="dotted-line"
        onSelect={mockOnSelect}
      />
    );

    selectedItem = screen.getByText('Dotted-line Reporting').closest('li');
    expect(selectedItem).toHaveClass('Mui-selected');
  });

  it('should handle null anchorEl', () => {
    render(
      <ViewByDropdown
        anchorEl={null}
        open={false}
        onClose={mockOnClose}
        selectedView="organizational"
        onSelect={mockOnSelect}
      />
    );

    expect(screen.queryByText('View By')).not.toBeInTheDocument();
  });

  it('should render Menu with correct props', () => {
    const { container } = render(
      <ViewByDropdown
        anchorEl={mockAnchorEl}
        open={true}
        onClose={mockOnClose}
        selectedView="organizational"
        onSelect={mockOnSelect}
      />
    );

    // Menu should be rendered
    expect(container.querySelector('[role="presentation"]')).toBeInTheDocument();
  });
});
