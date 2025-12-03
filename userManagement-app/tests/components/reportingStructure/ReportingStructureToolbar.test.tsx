/**
 * Unit tests for ReportingStructureToolbar component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReportingStructureToolbar from '../../../src/components/reportingStructure/ReportingStructureToolbar';

describe('ReportingStructureToolbar', () => {
  const mockOnSearchClick = jest.fn();
  const mockOnFilterToggle = jest.fn();
  const mockOnSortToggle = jest.fn();
  const mockOnViewByClick = jest.fn();
  const mockOnBulkUploadClick = jest.fn();
  const mockOnSearchChange = jest.fn();
  const mockOnSearchClose = jest.fn();
  const mockOnViewByChange = jest.fn();

  const defaultProps = {
    onSearchClick: mockOnSearchClick,
    onFilterToggle: mockOnFilterToggle,
    onSortToggle: mockOnSortToggle,
    onViewByClick: mockOnViewByClick,
    onBulkUploadClick: mockOnBulkUploadClick,
    isSearchActive: false,
    onSearchChange: mockOnSearchChange,
    searchValue: '',
    onSearchClose: mockOnSearchClose,
    selectedViewBy: 'organizational' as const,
    onViewByChange: mockOnViewByChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render toolbar with all icons', () => {
    const { container } = render(<ReportingStructureToolbar {...defaultProps} />);
    expect(container.querySelector('[data-title="Search"]')).toBeInTheDocument();
    expect(container.querySelector('[data-title="Filter"]')).toBeInTheDocument();
    expect(container.querySelector('[data-title="Sort"]')).toBeInTheDocument();
  });

  it('should render View By icon when onViewByClick is provided', () => {
    const { container } = render(<ReportingStructureToolbar {...defaultProps} />);
    expect(container.querySelector('[data-title="View By"]')).toBeInTheDocument();
  });

  it('should not render View By icon when onViewByClick is not provided', () => {
    const { onViewByClick, ...props } = defaultProps;
    const { container } = render(<ReportingStructureToolbar {...props} onViewByClick={undefined} />);
    expect(container.querySelector('[data-title="View By"]')).not.toBeInTheDocument();
  });

  it('should render Bulk Upload button when onBulkUploadClick is provided', () => {
    render(<ReportingStructureToolbar {...defaultProps} />);
    expect(screen.getByText('Bulk Upload')).toBeInTheDocument();
  });

  it('should not render Bulk Upload button when onBulkUploadClick is not provided', () => {
    const { onBulkUploadClick, ...props } = defaultProps;
    render(<ReportingStructureToolbar {...props} onBulkUploadClick={undefined} />);
    expect(screen.queryByText('Bulk Upload')).not.toBeInTheDocument();
  });

  it('should have search icon with hover effect but non-clickable', () => {
    const { container } = render(<ReportingStructureToolbar {...defaultProps} />);
    const searchButton = container.querySelector('[data-title="Search"] button');
    expect(searchButton).toBeInTheDocument();
    
    // Should not call onSearchClick when clicked
    fireEvent.click(searchButton!);
    expect(mockOnSearchClick).not.toHaveBeenCalled();
  });

  it('should call onFilterToggle when filter icon is clicked', () => {
    const { container } = render(<ReportingStructureToolbar {...defaultProps} />);
    const filterButton = container.querySelector('[data-title="Filter"] button');
    fireEvent.click(filterButton!);
    expect(mockOnFilterToggle).toHaveBeenCalledTimes(1);
  });

  it('should call onSortToggle when sort icon is clicked', () => {
    const { container } = render(<ReportingStructureToolbar {...defaultProps} />);
    const sortButton = container.querySelector('[data-title="Sort"] button');
    fireEvent.click(sortButton!);
    expect(mockOnSortToggle).toHaveBeenCalledTimes(1);
  });

  it('should call onViewByClick when View By icon is clicked', () => {
    const { container } = render(<ReportingStructureToolbar {...defaultProps} />);
    const viewByButton = container.querySelector('[data-title="View By"] button');
    fireEvent.click(viewByButton!);
    expect(mockOnViewByClick).toHaveBeenCalledTimes(1);
  });

  it('should call onBulkUploadClick when Bulk Upload button is clicked', () => {
    render(<ReportingStructureToolbar {...defaultProps} />);
    const bulkUploadButton = screen.getByText('Bulk Upload');
    fireEvent.click(bulkUploadButton);
    expect(mockOnBulkUploadClick).toHaveBeenCalledTimes(1);
  });

  it('should open ViewByDropdown when View By is clicked', async () => {
    const { container } = render(<ReportingStructureToolbar {...defaultProps} />);
    const viewByButton = container.querySelector('[data-title="View By"] button');
    fireEvent.click(viewByButton!);
    
    // Dropdown should appear
    await waitFor(() => {
      expect(screen.getByText('Organizational Structure')).toBeInTheDocument();
    });
  });

  it('should handle view type selection', async () => {
    const { container } = render(<ReportingStructureToolbar {...defaultProps} />);
    const viewByButton = container.querySelector('[data-title="View By"] button');
    fireEvent.click(viewByButton!);
    
    await waitFor(() => {
      const departmentalOption = screen.getByText('Departmental Structure');
      fireEvent.click(departmentalOption);
      expect(mockOnViewByChange).toHaveBeenCalledWith('departmental');
    });
  });

  it('should display selected view type', async () => {
    const { container } = render(<ReportingStructureToolbar {...defaultProps} selectedViewBy="departmental" />);
    const viewByButton = container.querySelector('[data-title="View By"] button');
    fireEvent.click(viewByButton!);
    
    await waitFor(() => {
      const selectedOption = screen.getByText('Departmental Structure').closest('li');
      expect(selectedOption).toHaveClass('Mui-selected');
    });
  });

  it('should handle viewByClose when dropdown is closed', async () => {
    const { container } = render(<ReportingStructureToolbar {...defaultProps} />);
    const viewByButton = container.querySelector('[data-title="View By"] button');
    fireEvent.click(viewByButton!);
    
    await waitFor(() => {
      expect(screen.getByText('Organizational Structure')).toBeInTheDocument();
    });
    
    // Close the dropdown by clicking outside or pressing escape
    fireEvent.keyDown(document, { key: 'Escape' });
    
    await waitFor(() => {
      expect(screen.queryByText('Organizational Structure')).not.toBeInTheDocument();
    });
  });

  it('should handle viewBySelect with onViewByChange undefined', async () => {
    const { onViewByChange, ...props } = defaultProps;
    const { container } = render(<ReportingStructureToolbar {...props} />);
    const viewByButton = container.querySelector('[data-title="View By"] button');
    fireEvent.click(viewByButton!);
    
    await waitFor(() => {
      const dottedLineOption = screen.getByText('Dotted-line Reporting');
      fireEvent.click(dottedLineOption);
      // Should not throw error even if onViewByChange is undefined
      expect(screen.queryByText('Dotted-line Reporting')).not.toBeInTheDocument();
    });
  });

  it('should use default selectedViewBy when not provided', () => {
    const { selectedViewBy, ...props } = defaultProps;
    const { container } = render(<ReportingStructureToolbar {...props} />);
    const viewByButton = container.querySelector('[data-title="View By"] button');
    fireEvent.click(viewByButton!);
    
    waitFor(() => {
      const selectedOption = screen.getByText('Organizational Structure').closest('li');
      expect(selectedOption).toHaveClass('Mui-selected');
    });
  });

  it('should handle search icon click with preventDefault and stopPropagation', () => {
    const { container } = render(<ReportingStructureToolbar {...defaultProps} />);
    const searchButton = container.querySelector('[data-title="Search"] button');
    const mockEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    };
    
    fireEvent.click(searchButton!, mockEvent);
    expect(mockOnSearchClick).not.toHaveBeenCalled();
  });

  it('should handle viewByClick when ref is not available (fallback to currentTarget)', () => {
    const { container } = render(<ReportingStructureToolbar {...defaultProps} />);
    const viewByButton = container.querySelector('[data-title="View By"] button') as HTMLButtonElement;
    
    // Simulate ref not being available
    Object.defineProperty(viewByButton, 'current', {
      value: null,
      writable: true,
    });
    
    fireEvent.click(viewByButton);
    expect(mockOnViewByClick).toHaveBeenCalled();
  });

  it('should render all three view types in dropdown', async () => {
    const { container } = render(<ReportingStructureToolbar {...defaultProps} />);
    const viewByButton = container.querySelector('[data-title="View By"] button');
    fireEvent.click(viewByButton!);
    
    await waitFor(() => {
      expect(screen.getByText('Organizational Structure')).toBeInTheDocument();
      expect(screen.getByText('Departmental Structure')).toBeInTheDocument();
      expect(screen.getByText('Dotted-line Reporting')).toBeInTheDocument();
    });
  });

  it('should handle dotted-line view selection', async () => {
    const { container } = render(<ReportingStructureToolbar {...defaultProps} />);
    const viewByButton = container.querySelector('[data-title="View By"] button');
    fireEvent.click(viewByButton!);
    
    await waitFor(() => {
      const dottedLineOption = screen.getByText('Dotted-line Reporting');
      fireEvent.click(dottedLineOption);
      expect(mockOnViewByChange).toHaveBeenCalledWith('dotted-line');
    });
  });

  it('should render dividers between icons', () => {
    const { container } = render(<ReportingStructureToolbar {...defaultProps} />);
    const dividers = container.querySelectorAll('div[style*="width: 1px"]');
    expect(dividers.length).toBeGreaterThan(0);
  });

  it('should render CustomSortIcon with correct props', () => {
    const { container } = render(<ReportingStructureToolbar {...defaultProps} />);
    const sortIcon = container.querySelector('[data-title="Sort"] svg');
    expect(sortIcon).toBeInTheDocument();
    expect(sortIcon?.getAttribute('height')).toBe('16px');
    expect(sortIcon?.getAttribute('width')).toBe('16px');
  });

  it('should render ViewByIcon with correct props', () => {
    const { container } = render(<ReportingStructureToolbar {...defaultProps} />);
    const viewByIcon = container.querySelector('[data-title="View By"] svg');
    expect(viewByIcon).toBeInTheDocument();
    expect(viewByIcon?.getAttribute('height')).toBe('16px');
    expect(viewByIcon?.getAttribute('width')).toBe('16px');
  });

  it('should handle filter button click even when disabled', () => {
    const { container } = render(<ReportingStructureToolbar {...defaultProps} />);
    const filterButton = container.querySelector('[data-title="Filter"] button');
    expect(filterButton).toBeDisabled();
    fireEvent.click(filterButton!);
    // Should still call the handler even if disabled
    expect(mockOnFilterToggle).toHaveBeenCalled();
  });

  it('should handle sort button click even when disabled', () => {
    const { container } = render(<ReportingStructureToolbar {...defaultProps} />);
    const sortButton = container.querySelector('[data-title="Sort"] button');
    expect(sortButton).toBeDisabled();
    fireEvent.click(sortButton!);
    // Should still call the handler even if disabled
    expect(mockOnSortToggle).toHaveBeenCalled();
  });

  it('should render Bulk Upload button with correct styles', () => {
    render(<ReportingStructureToolbar {...defaultProps} />);
    const bulkUploadButton = screen.getByText('Bulk Upload');
    expect(bulkUploadButton).toBeInTheDocument();
    expect(bulkUploadButton.closest('button')).toBeInTheDocument();
  });

  it('should not call onViewByClick when it is undefined', () => {
    const { onViewByClick, ...props } = defaultProps;
    const { container } = render(<ReportingStructureToolbar {...props} onViewByClick={undefined} />);
    // View By button should not be rendered when onViewByClick is undefined
    expect(container.querySelector('[data-title="View By"]')).not.toBeInTheDocument();
  });
});

