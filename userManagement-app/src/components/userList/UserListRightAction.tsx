import React from 'react';
import ListToolbar from 'commonApp/ListToolbar';
import { ReportingStructureToolbar } from '../../components/reportingStructure';
import { ViewByType } from '../../constants/reportingStructureConstants';

interface UserListRightActionProps {
  activeTab: number;
  selectedViewBy: ViewByType;
  onViewByChange: (viewBy: ViewByType) => void;
  onSearchClick: () => void;
  onAddUser: () => void;
  onAddRole: () => void;
  onSortToggle: () => void;
  onViewByClick: () => void;
  onBulkUploadClick: () => void;
  isSearchActive: boolean;
  onSearchChange: (value: string) => void;
  searchValue: string;
  onSearchClose: () => void;
  isPermissionsPanelOpen: boolean;
}

const UserListRightAction: React.FC<UserListRightActionProps> = ({
  activeTab,
  selectedViewBy,
  onViewByChange,
  onSearchClick,
  onAddUser,
  onAddRole,
  onSortToggle,
  onViewByClick,
  onBulkUploadClick,
  isSearchActive,
  onSearchChange,
  searchValue,
  onSearchClose,
  isPermissionsPanelOpen
}) => {
  if (activeTab === 1) {
    return (
      <ListToolbar
        onSearchClick={onSearchClick}
        onAddClick={onAddRole}
        onSortToggle={onSortToggle}
        onFilterToggle={() => {}}
        isSearchActive={isSearchActive}
        onSearchChange={onSearchChange}
        searchValue={searchValue}
        onSearchClose={onSearchClose}
        showFilter={true}
      />
    );
  }
  
  if (activeTab === 3) {
    return (
      <ReportingStructureToolbar
        onSearchClick={onSearchClick}
        onSortToggle={onSortToggle}
        onFilterToggle={() => {}}
        onViewByClick={onViewByClick}
        onBulkUploadClick={onBulkUploadClick}
        isSearchActive={isSearchActive}
        onSearchChange={onSearchChange}
        searchValue={searchValue}
        onSearchClose={onSearchClose}
        selectedViewBy={selectedViewBy}
        onViewByChange={onViewByChange}
      />
    );
  }
  
  return (
    <ListToolbar
      onSearchClick={onSearchClick}
      onAddClick={onAddUser}
      onSortToggle={onSortToggle}
      isSearchActive={isSearchActive && !isPermissionsPanelOpen}
      onSearchChange={onSearchChange}
      searchValue={isPermissionsPanelOpen ? '' : searchValue}
      onSearchClose={onSearchClose}
    />
  );
};

export default UserListRightAction;

