/**
 * Tests for UserListRightAction
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import UserListRightAction from '../../../src/components/userList/UserListRightAction';

// Mock dependencies
jest.mock('commonApp/ListToolbar', () => {
  return function MockListToolbar({ onAddClick, onSearchClick }: any) {
    return (
      <div data-testid="list-toolbar">
        <button onClick={onAddClick}>Add</button>
        <button onClick={onSearchClick}>Search</button>
      </div>
    );
  };
});

jest.mock('../../../src/components/reportingStructure', () => ({
  ReportingStructureToolbar: function MockReportingStructureToolbar({ onBulkUploadClick }: any) {
    return (
      <div data-testid="reporting-structure-toolbar">
        <button onClick={onBulkUploadClick}>Bulk Upload</button>
      </div>
    );
  }
}));

describe('UserListRightAction', () => {
  const defaultProps = {
    activeTab: 0,
    selectedViewBy: 'organizational' as const,
    onViewByChange: jest.fn(),
    onSearchClick: jest.fn(),
    onAddUser: jest.fn(),
    onAddRole: jest.fn(),
    onSortToggle: jest.fn(),
    onViewByClick: jest.fn(),
    onBulkUploadClick: jest.fn(),
    isSearchActive: false,
    onSearchChange: jest.fn(),
    searchValue: '',
    onSearchClose: jest.fn(),
    isPermissionsPanelOpen: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render ListToolbar for default tab (activeTab 0)', () => {
    render(<UserListRightAction {...defaultProps} activeTab={0} />);
    expect(screen.getByTestId('list-toolbar')).toBeInTheDocument();
  });

  it('should render ListToolbar for roles tab (activeTab 1)', () => {
    render(<UserListRightAction {...defaultProps} activeTab={1} />);
    expect(screen.getByTestId('list-toolbar')).toBeInTheDocument();
  });

  it('should render ReportingStructureToolbar for reporting structure tab (activeTab 3)', () => {
    render(<UserListRightAction {...defaultProps} activeTab={3} />);
    expect(screen.getByTestId('reporting-structure-toolbar')).toBeInTheDocument();
  });

  it('should pass correct props to ListToolbar for roles tab', () => {
    render(<UserListRightAction {...defaultProps} activeTab={1} />);
    const toolbar = screen.getByTestId('list-toolbar');
    expect(toolbar).toBeInTheDocument();
  });

  it('should handle permissions panel open state', () => {
    render(<UserListRightAction {...defaultProps} activeTab={0} isPermissionsPanelOpen={true} />);
    expect(screen.getByTestId('list-toolbar')).toBeInTheDocument();
  });
});

