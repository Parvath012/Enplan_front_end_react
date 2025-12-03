import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Container, Box, Typography, IconButton } from '@mui/material';
import { Close } from '@carbon/icons-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/configureStore';
import { toggleGroupStatus, toggleMemberStatus, softDeleteMember, softDeleteGroup, mapGroupMembersForView } from '../../store/Reducers/groupSlice';
import { fetchGroupById } from '../../services/groupFetchService';
import { parseActiveMemberUserIds } from '../../services/serviceUtils';
import { fetchUsers, fetchUserHierarchy } from '../../store/Reducers/userSlice';
import { AgGridReact } from 'ag-grid-react';
import GridStyles from '../../components/grid/GridStyles';

// Direct imports from common-app
import HeaderBar from 'commonApp/HeaderBar';
import AgGridShell from 'commonApp/AgGridShell';
import Footer from 'commonApp/Footer';
import NotificationAlert from 'commonApp/NotificationAlert';
import NoResultsFound from 'commonApp/NoResultsFound';
import CustomTooltip from 'commonApp/CustomTooltip';

// Import Reporting Structure components
import { ReportingStructurePanel } from '../../components/reportingStructure';
import { ViewByType, DEFAULT_VIEW_TYPE, VIEW_BY_TITLES } from '../../constants/reportingStructureConstants';

// Import UserViewPanel
import UserViewPanel from '../../components/userView/UserViewPanel';
// Import TransferResponsibilitiesPanel
import TransferResponsibilitiesPanel from '../../components/userManagement/TransferResponsibilitiesPanel';
// Import RolesList
import RolesList from './RolesList';
// Import TeamGroupManagement
import TeamGroupManagement from '../../components/teamGroup/TeamGroupManagement';
import CreateTeamGroupButton from '../../components/teamGroup/CreateTeamGroupButton';
import TeamMembersView from '../../components/teamGroup/TeamMembersView';
import type { TeamGroup } from '../../components/teamGroup/TeamGroupCard';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Import refactored components
import { createNameCellRenderer, createActionRenderer, TabPanel, UserListRightAction } from '../../components/userList';
import ListToolbar from 'commonApp/ListToolbar';

// Import refactored utilities
import { createUserColumnDefs } from '../../utils/userListColumns';
import { createGridIcons, userListStyles, userTabs, headerBarStyles } from '../../constants/userListConstants';
import { 
  createTabStyles, 
  createGridOptions, 
  createDefaultColDef,
  createRowStyle 
} from '../../utils/gridUtils';

// Import refactored hooks
import { useUserToggle, useUserSearch, useRoleSearch } from '../../hooks';

// Register AG Grid Modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Helper function to determine active tab from URL pathname
const getActiveTabFromPath = (pathname: string, searchParams: URLSearchParams): number => {
  // Check for specific paths first
  if (pathname.includes('/structure')) {
    return 3;
  }
  if (pathname.includes('/roles') && !pathname.includes('/roles/create') && !pathname.includes('/roles/edit')) {
    return 1;
  }
  // Check for groups path
  if (pathname.includes('/groups') && !pathname.includes('/groups/create') && !pathname.includes('/groups/edit')) {
    return 2;
  }
  // Check query parameter for tab (this handles tab=2 for teams/groups)
  const tabParam = searchParams.get('tab');
  if (tabParam) {
    const tabIndex = parseInt(tabParam, 10);
    if (!isNaN(tabIndex) && tabIndex >= 0) {
      return tabIndex;
    }
  }
  // Default to tab 0 (Users) if pathname matches base paths
  if (pathname === '/user-management' || pathname === '/user-management/' || 
      pathname === '/admin/user-management' || pathname === '/admin/user-management/') {
    return 0;
  }
  // Fallback to 0
  return 0;
};

// Helper function to get header title based on active tab
const getHeaderTitle = (activeTab: number, selectedViewBy?: ViewByType): string => {
  if (activeTab === 1) return "Roles and Permission Directory";
  if (activeTab === 2) return "Groups & Teams Overview";
  if (activeTab === 3 && selectedViewBy) return VIEW_BY_TITLES[selectedViewBy];
  return "User Directory";
};

const UserList: React.FC = () => {
  const dispatch = useDispatch();
  const gridRef = useRef<AgGridReact<any>>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => getActiveTabFromPath(location.pathname, searchParams));
  const [isPermissionsPanelOpen, setIsPermissionsPanelOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Use ref to store drawer state so handlers can always access latest value
  const isDrawerOpenRef = useRef(false);
  
  // Fetch hierarchy on component mount (similar to entity setup)
  useEffect(() => {
    // @ts-ignore
    dispatch(fetchUserHierarchy({ viewType: DEFAULT_VIEW_TYPE }));
  }, []); // Empty dependency array - run only once on mount

  // Update ref whenever drawer state changes
  React.useEffect(() => {
    isDrawerOpenRef.current = isPermissionsPanelOpen;
  }, [isPermissionsPanelOpen]);

  // Update activeTab when URL changes
  useEffect(() => {
    const newTab = getActiveTabFromPath(location.pathname, searchParams);
    setActiveTab(newTab);
  }, [searchParams, location.pathname]);

  // Reset team members view when switching to Team/Group tab to ensure cards are always visible
  useEffect(() => {
    if (activeTab === 2) {
      // When switching to Team/Group tab, reset team members view to show cards
      closeTeamMembersView();
    }
  }, [activeTab]);

  // Handle tab click - navigate to appropriate URL
  const handleTabClick = (index: number) => {
    const isAdminApp = location.pathname.includes('/admin');
    const basePath = isAdminApp ? '/admin/user-management' : '/user-management';
    
    if (index === 0) {
      // Users tab - navigate to base path, but if roles exist and no users, navigate to create user page
      if (hasRoles && !hasUsers) {
        navigate(`${basePath}/create`, { replace: true });
      } else {
        navigate(basePath, { replace: true });
      }
    } else if (index === 1) {
      // Roles tab - navigate to /roles
      navigate(`${basePath}/roles`, { replace: true });
    } else if (index === 2) {
      // Teams/Groups tab - navigate to /groups
      navigate(`${basePath}/groups`, { replace: true });
    } else if (index === 3) {
      // Reporting Structure tab - navigate to /structure
      navigate(`${basePath}/structure`, { replace: true });
    } else {
      // Other tabs - use query parameter (for backward compatibility)
      navigate(`${basePath}?tab=${index}`, { replace: true });
    }
  };
  const [successNotification, setSuccessNotification] = useState<{ open: boolean; message: string }>({
    open: false,
    message: ''
  });
  
  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; teamGroup: TeamGroup | null }>({
    open: false,
    teamGroup: null
  });
  
  // Team members view state
  const [teamMembersView, setTeamMembersView] = useState<{ open: boolean; teamGroup: TeamGroup | null }>({
    open: false,
    teamGroup: null
  });
  
  // Team members data state - stores the actual member data from database
  const [teamMembersData, setTeamMembersData] = useState<Array<{
    id: string;
    firstName: string;
    lastName: string;
    emailId?: string;
    role?: string;
    joinedDate?: string;
    isActive: boolean;
    status: 'Active' | 'Inactive';
    isDeleted?: boolean;
  }>>([]);
  
  // Separate search state for team members
  const [teamMembersSearchTerm, setTeamMembersSearchTerm] = useState('');
  const [isTeamMembersSearchActive, setIsTeamMembersSearchActive] = useState(false);
  
  // Separate search state for groups
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [isGroupSearchActive, setIsGroupSearchActive] = useState(false);
  
  const { users, loading: usersLoading, hasUsers } = useSelector((state: RootState) => state.users);
  const { roles, hasRoles } = useSelector((state: RootState) => state.roles);
  const { groups } = useSelector((state: RootState) => state.groups);

  // Helper function to show success notification with auto-close
  const showSuccessNotification = (message: string) => {
    setSuccessNotification({ open: true, message });
    setTimeout(() => {
      setSuccessNotification({ open: false, message: '' });
    }, 5000);
  };

  // Helper function to close team members view
  const closeTeamMembersView = () => {
    setTeamMembersView({ open: false, teamGroup: null });
    setTeamMembersData([]);
  };
  
  // Helper function to fetch group and update team members data
  const updateTeamMembersFromGroup = async (groupId: string) => {
    try {
      const groupModel = await fetchGroupById(groupId);
      if (groupModel) {
        const updatedMembers = mapGroupMembersForView(groupModel, users);
        setTeamMembersData(updatedMembers);
        return groupModel;
      }
    } catch (error) {
      console.error('Failed to fetch group data:', error);
    }
    return null;
  };

  // Helper function to refresh team members data
  const refreshTeamMembersData = async () => {
    if (!teamMembersView.open || !teamMembersView.teamGroup) {
      return;
    }
    await updateTeamMembersFromGroup(teamMembersView.teamGroup.id);
  };

  // Refresh team members data when groups are updated (e.g., after toggle)
  useEffect(() => {
    refreshTeamMembersData();
  }, [groups, teamMembersView.open, teamMembersView.teamGroup?.id, users]);
  
  // Calculate group statistics for footer
  const totalGroups = groups.length;
  const activeGroups = groups.filter(g => g.isActive).length;
  const inactiveGroups = groups.filter(g => !g.isActive).length;
  
  // Use custom hooks for users
  const {
    searchTerm: userSearchTerm,
    isSearchActive: isUserSearchActive,
    filteredUsers: searchFilteredUsers,
    handleSearchClick: originalHandleSearchClick,
    handleSearchChange: originalHandleSearchChange,
    handleSearchClose: originalHandleSearchClose
  } = useUserSearch(users, false);

  // Use custom hooks for roles
  const {
    searchTerm: roleSearchTerm,
    isSearchActive: isRoleSearchActive,
    handleSearchClick: originalRoleSearchClick,
    handleSearchChange: originalRoleSearchChange,
    handleSearchClose: originalRoleSearchClose
  } = useRoleSearch(roles, false);

  // Determine which search to use based on active tab
  const searchTerm = activeTab === 1 ? roleSearchTerm : userSearchTerm;
  const isSearchActive = activeTab === 1 ? isRoleSearchActive : isUserSearchActive;

  // Helper function to check if search should be disabled
  const isSearchDisabled = (): boolean => {
    return activeTab !== 1 && isPermissionsPanelOpen;
  };

  // Helper function to handle role search actions
  const handleRoleSearchAction = (action: () => void) => {
    if (activeTab === 1) {
      action();
      return true;
    }
    return false;
  };

  // Helper function to handle user search actions
  const handleUserSearchAction = (action: () => void) => {
    if (isSearchDisabled()) {
      return false;
    }
    action();
    return true;
  };

  // Wrap search handlers to disable when drawer is open (for users tab)
  const handleSearchClick = () => {
    if (handleRoleSearchAction(originalRoleSearchClick)) return;
    handleUserSearchAction(originalHandleSearchClick);
  };

  const handleSearchChange = (value: string) => {
    if (handleRoleSearchAction(() => originalRoleSearchChange(value))) return;
    handleUserSearchAction(() => originalHandleSearchChange(value));
  };

  const handleSearchClose = () => {
    if (handleRoleSearchAction(originalRoleSearchClose)) return;
    handleUserSearchAction(originalHandleSearchClose);
  };

  // Show only selected user when permissions panel is open to prevent scrolling
  const filteredUsers = useMemo(() => {
    if (!isPermissionsPanelOpen || !selectedUser) return searchFilteredUsers;
    
    const userIndex = searchFilteredUsers.findIndex(user => user.id === selectedUser.id);
    if (userIndex === -1) return searchFilteredUsers;
    
    const selectedUserData = searchFilteredUsers[userIndex];
    
    // When drawer is open, show ONLY the selected user to prevent scrolling
    return [selectedUserData];
  }, [searchFilteredUsers, isPermissionsPanelOpen, selectedUser]);


  const {
    togglingUsers,
    confirmDialog,
    transferPanel,
    handleToggleStatus: originalHandleToggleStatus,
    handleConfirmYes,
    handleConfirmNo,
    handleTransferSubmit,
    handleTransferReset
  } = useUserToggle(gridRef as React.RefObject<AgGridReact<any>>);

  // Helper function to get navigation path based on admin app
  const getNavigationPath = (path: string): string => {
    const isAdminApp = window.location.pathname.includes('/admin/user-management');
    return isAdminApp ? `/admin/user-management${path}` : `/user-management${path}`;
  };

  // Handler functions (defined before useMemo to avoid initialization errors)
  const handleAddUser = () => {
    navigate(getNavigationPath('/create'));
  };

  const handleSortToggle = () => {
    console.log('Sort clicked - handled by AG Grid');
  };

  const handleAddRole = () => {
    navigate(getNavigationPath('/roles/create'));
  };

  const [selectedViewBy, setSelectedViewBy] = useState<ViewByType>(DEFAULT_VIEW_TYPE);

  const handleViewByClick = () => {
    // View By functionality is handled by the ReportingStructureToolbar component
    console.log('View By clicked');
  };

  const handleBulkUploadClick = () => {
    // Bulk Upload functionality will be implemented in a future release
    console.log('Bulk Upload clicked for Reporting Structure');
  };

  // Helper function to render roles toolbar
  const renderRolesToolbar = (): React.ReactNode => {
    return (
      <ListToolbar
        onSearchClick={handleSearchClick}
        onAddClick={handleAddRole}
        onSortToggle={handleSortToggle}
        onFilterToggle={() => {}}
        isSearchActive={isSearchActive}
        onSearchChange={handleSearchChange}
        searchValue={searchTerm}
        onSearchClose={handleSearchClose}
        showFilter={true}
      />
    );
  };

  // Helper function to render groups toolbar
  const renderGroupsToolbar = (): React.ReactNode => {
    const handleGroupSearchClose = () => {
      setIsGroupSearchActive(false);
      setGroupSearchTerm('');
    };

    const handleCreateGroup = () => {
      navigate(getNavigationPath('/groups/create'));
    };

    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        width: '100%',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ flex: 1 }}>
          <ListToolbar
            onSearchClick={() => setIsGroupSearchActive(true)}
            onAddClick={() => {}}
            onSortToggle={() => {}}
            onFilterToggle={() => {}}
            isSearchActive={isGroupSearchActive}
            onSearchChange={(value: string) => setGroupSearchTerm(value)}
            searchValue={groupSearchTerm}
            onSearchClose={handleGroupSearchClose}
            showAdd={false}
          />
        </Box>
        <Box
          sx={{
            width: '1px',
            height: '24px',
            backgroundColor: '#E0E0E0',
            marginLeft: '1px',
            marginRight: '1px',
            flexShrink: 0
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
          <CreateTeamGroupButton onClick={handleCreateGroup} />
        </Box>
      </Box>
    );
  };

  // Helper function to render users toolbar
  const renderUsersToolbar = (): React.ReactNode => {
    return (
      <ListToolbar
        onSearchClick={handleSearchClick}
        onAddClick={handleAddUser}
        onSortToggle={handleSortToggle}
        onFilterToggle={() => {}}
        isSearchActive={isSearchActive}
        onSearchChange={handleSearchChange}
        searchValue={searchTerm}
        onSearchClose={handleSearchClose}
        showFilter={true}
      />
    );
  };

  // Memoize the right action for reporting structure tab to prevent unnecessary re-renders
  // Only recreate when dependencies actually change
  const reportingStructureRightAction = useMemo(() => (
    <UserListRightAction
      activeTab={activeTab}
      selectedViewBy={selectedViewBy}
      onViewByChange={setSelectedViewBy}
      onSearchClick={handleSearchClick}
      onAddUser={handleAddUser}
      onAddRole={handleAddRole}
      onSortToggle={handleSortToggle}
      onViewByClick={handleViewByClick}
      onBulkUploadClick={handleBulkUploadClick}
      isSearchActive={isSearchActive}
      onSearchChange={handleSearchChange}
      searchValue={searchTerm}
      onSearchClose={handleSearchClose}
      isPermissionsPanelOpen={isPermissionsPanelOpen}
    />
  ), [activeTab, selectedViewBy, isSearchActive, searchTerm, isPermissionsPanelOpen]);

  // Helper function to get right action based on active tab
  const getRightAction = (tab: number): React.ReactNode => {
    if (tab === 1) return renderRolesToolbar();
    if (tab === 2) return renderGroupsToolbar();
    if (tab === 3) {
      return reportingStructureRightAction;
    }
    return renderUsersToolbar();
  };

  // Helper function to check if drawer is open
  const isDrawerOpen = (): boolean => {
    return isDrawerOpenRef.current;
  };

  // Wrap edit handler to check drawer state using ref
  const handleEditUser = (userId: number) => {
    if (isDrawerOpen()) {
      return;
    }
    navigate(getNavigationPath(`/edit/${userId}`));
  };

  // Wrap toggle handler to check drawer state using ref
  const handleToggleStatus = (userId: number, currentStatus: boolean) => {
    if (isDrawerOpen()) {
      return;
    }
    originalHandleToggleStatus(userId, currentStatus);
  };

  // Helper function to open permissions panel
  const openPermissionsPanel = (user: any) => {
    if (isSearchActive) {
      originalHandleSearchClose();
    }
    setSelectedUser(user);
    setIsPermissionsPanelOpen(true);
  };

  const handleViewPermissions = (userId: number) => {
    if (isDrawerOpen()) {
      return;
    }
    const user = users.find(u => Number(u.id) === userId);
    if (user) {
      openPermissionsPanel(user);
    }
  };

  const handleClosePermissionsPanel = () => {
    setIsPermissionsPanelOpen(false);
    setSelectedUser(null);
  };

  // Function to check if drawer is open (used by action renderer)
  const getIsDrawerOpen = () => isDrawerOpenRef.current;

  // Helper function to refresh grid cells
  const refreshGridCells = (columns?: string[]) => {
    if (!gridRef.current?.api) return;
    
    const refreshOptions = columns 
      ? { force: true, columns }
      : { force: true };
    
    setTimeout(() => {
      gridRef.current?.api.refreshCells(refreshOptions);
    }, columns ? 200 : 0);
  };

  // Force grid to refresh cells when drawer state changes so buttons update
  React.useEffect(() => {
    refreshGridCells();
  }, [isPermissionsPanelOpen]);

  // Refresh users when navigating to user list tab to ensure latest data
  useEffect(() => {
    if (activeTab === 0) {
      console.log('🔄 User list tab active - refreshing users...');
      // @ts-ignore
      dispatch(fetchUsers()).then((result: any) => {
        if (result?.payload) {
          console.log(`✅ Fetched ${result.payload.length} users`);
        }
      });
    }
    // dispatch is stable from useDispatch, so we can safely omit it from dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Also refresh when component mounts or location changes (only for user tab)
  useEffect(() => {
    if (activeTab === 0) {
      console.log('🔄 UserList component mounted/updated - refreshing users...');
      // @ts-ignore
      dispatch(fetchUsers());
    }
    // dispatch is stable from useDispatch, so we can safely omit it from dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Create a hash of role data to detect when roles change
  const roleDataHash = useMemo(() => {
    if (!users || users.length === 0) return '0';
    // Create a simple hash from user roles
    const roleHash = users
      .map(u => `${u.id}:${u.role || ''}`)
      .sort((a, b) => a.localeCompare(b))
      .join('|');
    // Create a simple hash (just use the string length and first few chars as a simple hash)
    return `${users.length}-${roleHash.substring(0, 50)}`;
  }, [users]);

  // Refresh grid when users data changes to ensure icons and role names update correctly
  React.useEffect(() => {
    if (gridRef.current?.api && filteredUsers.length > 0) {
      // Small delay to ensure Redux state has fully updated
      setTimeout(() => {
        // Force refresh the role column specifically
        gridRef.current?.api.refreshCells({ 
          force: true,
          columns: ['role']
        });
        // Then refresh all cells to ensure everything is updated
        setTimeout(() => {
          gridRef.current?.api.refreshCells({ 
            force: true
          });
        }, 50);
      }, 500);
    }
  }, [filteredUsers, roleDataHash]);

  // Create cell renderers with memoization
  const nameCellRenderer = useMemo(() => createNameCellRenderer(searchTerm), [searchTerm]);
  
  const actionRenderer = useMemo(() => 
    createActionRenderer(
      handleEditUser,
      handleViewPermissions,
      handleToggleStatus,
      togglingUsers,
      getIsDrawerOpen
    ), 
    [togglingUsers]
  );

  // AG Grid column definitions - memoized
  const columnDefs = useMemo(() => createUserColumnDefs(searchTerm, nameCellRenderer), [searchTerm, nameCellRenderer]);
  const defaultColDef = useMemo(() => createDefaultColDef(), []);

  // Custom components
  const components = useMemo(() => ({
    actionRenderer: actionRenderer,
  }), [actionRenderer]);

  // Grid options with icons
  const gridIcons = useMemo(() => createGridIcons(), []);
  const gridOptions = useMemo(() => createGridOptions(actionRenderer, gridIcons), [actionRenderer, gridIcons]);

  // Define custom row styles using utility
  const getRowStyle = (params: any) => {
    const baseStyle = createRowStyle(params);
    
    // Highlight the selected user row
    if (isPermissionsPanelOpen && selectedUser && params.data?.id === selectedUser.id) {
      return {
        ...baseStyle,
        backgroundColor: '#f0f8ff !important',
        borderBottom: '2px solid #006FE6 !important',
        fontWeight: '500 !important'
      };
    }
    
    return baseStyle;
  };

  // Helper function to calculate user statistics
  const calculateUserStats = () => {
    const total = filteredUsers.length;
    const active = filteredUsers.filter(user => user.isenabled && user.status !== 'Inactive').length;
    const inactive = filteredUsers.filter(user => !user.isenabled || user.status === 'Inactive').length;
    return { total, active, inactive };
  };

  // Helper function to handle team member toggle
  const handleTeamMemberToggle = async (memberId: string, newStatus: boolean) => {
    if (!teamMembersView.teamGroup) return;
    
    try {
      await dispatch(toggleMemberStatus({ 
        groupId: teamMembersView.teamGroup.id, 
        memberUserId: memberId, 
        isActive: newStatus 
      }) as any);
      await updateTeamMembersFromGroup(teamMembersView.teamGroup.id);
    } catch (error) {
      console.error('Failed to toggle member status:', error);
    }
  };

  // Helper function to handle team member removal
  const handleTeamMemberRemove = async (memberId: string) => {
    if (!teamMembersView.teamGroup) return;
    
    try {
      await dispatch(softDeleteMember({ 
        groupId: teamMembersView.teamGroup.id, 
        memberUserId: memberId
      }) as any);
      await updateTeamMembersFromGroup(teamMembersView.teamGroup.id);
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  // Helper function to handle view group action
  const handleViewGroup = async (teamGroup: TeamGroup): Promise<void> => {
    try {
      const groupModel = await updateTeamMembersFromGroup(teamGroup.id);
      if (groupModel) {
        setTeamMembersView({ open: true, teamGroup });
      }
    } catch (error) {
      console.error('Failed to fetch group members:', error);
    }
  };

  // Helper function to handle edit group action
  const handleEditGroup = (teamGroup: TeamGroup): void => {
    navigate(getNavigationPath(`/groups/edit/${teamGroup.id}`));
  };

  // Helper function to handle duplicate group action
  const handleDuplicateGroup = async (teamGroup: TeamGroup): Promise<void> => {
    try {
      // Fetch full group data to get all details
      const groupModel = await fetchGroupById(teamGroup.id);
      if (groupModel) {
        const memberUserIds = parseActiveMemberUserIds(groupModel.members);
        
        // Navigate to create form with duplicate data in location state
        // Group name will be empty, all other fields will be prefilled
        navigate(getNavigationPath('/groups/create'), {
          state: {
            duplicateData: {
              description: groupModel.description ?? '',
              groupOwner: groupModel.owner_user_id ?? '',
              members: memberUserIds,
              isactive: groupModel.isactive ?? true
            }
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch group data for duplication:', error);
    }
  };

  // Helper function to handle group menu actions
  const handleGroupMenuAction = async (action: string, teamGroup: TeamGroup) => {
    if (action === 'delete') {
      setDeleteDialog({ open: true, teamGroup });
      return;
    }
    
    if (action === 'view') {
      await handleViewGroup(teamGroup);
      return;
    }
    
    if (action === 'edit') {
      handleEditGroup(teamGroup);
      return;
    }
    
    if (action === 'duplicate') {
      await handleDuplicateGroup(teamGroup);
      return;
    }
    
    console.log('Menu action:', action, teamGroup);
  };

  // Helper function to render header bar
  const renderHeaderBar = (): React.ReactNode => {
    if (activeTab !== 2 || !teamMembersView.open || !teamMembersView.teamGroup) {
      return (
        <Box sx={{ position: 'relative' }}>
          <HeaderBar
            title={getHeaderTitle(activeTab)}
            RightAction={getRightAction(activeTab)}
          />
        </Box>
      );
    }

    return (
      <Box sx={headerBarStyles.container}>
        <Typography 
          component="h1" 
          sx={headerBarStyles.title}>
          {teamMembersView.teamGroup.name || 'Team Members'}
        </Typography>
        <Box sx={headerBarStyles.actionsContainer}>
          <ListToolbar
            onSearchClick={() => setIsTeamMembersSearchActive(true)}
            onAddClick={() => {}}
            onSortToggle={handleSortToggle}
            isSearchActive={isTeamMembersSearchActive}
            onSearchChange={(value: string) => setTeamMembersSearchTerm(value)}
            searchValue={teamMembersSearchTerm}
            onSearchClose={() => {
              setIsTeamMembersSearchActive(false);
              setTeamMembersSearchTerm('');
            }}
            showAdd={false}
          />
          <CustomTooltip title="Close" placement="bottom" arrow={false} followCursor={true}>
            <IconButton
              onClick={closeTeamMembersView}
              sx={{
                width: 30,
                height: 30,
                borderRadius: '8px',
                color: '#6c757d',
                backgroundColor: 'transparent',
                '&:hover': { color: '#495057', backgroundColor: '#f0f0f0' },
                p: 0,
                ml: 1
              }}
              aria-label="Close"
            >
              <Close size={18} />
            </IconButton>
          </CustomTooltip>
        </Box>
      </Box>
    );
  };

  // Helper function to render appropriate header based on active tab and view state
  const renderAppropriateHeader = (): React.ReactNode => {
    const shouldShowCustomHeader = activeTab === 2 && teamMembersView.open && teamMembersView.teamGroup;
    if (shouldShowCustomHeader) {
      return renderHeaderBar();
    }
    return (
      <HeaderBar
        title={getHeaderTitle(activeTab, selectedViewBy)}
        RightAction={getRightAction(activeTab)}
      />
    );
  };

  // Calculate user statistics for footer (moved before renderFooter to ensure variables are available)
  const { total: totalUsers, active: activeUsers, inactive: inactiveUsers } = calculateUserStats();

  // Helper function to render footer
  const renderFooter = (): React.ReactNode | null => {
    const shouldShowFooter = (activeTab === 0 && !isPermissionsPanelOpen) || activeTab === 2;
    if (!shouldShowFooter) {
      return null;
    }

    // If team members view is open, show member counts instead of group counts
    if (teamMembersView.open && teamMembersData.length > 0) {
      // Filter out deleted members and apply search filter
      const filteredMembers = teamMembersData.filter(member => {
        if ((member as any).isDeleted) return false;
        if (!teamMembersSearchTerm.trim()) return true;
        const searchLower = teamMembersSearchTerm.toLowerCase();
        const fullName = `${member.firstName ?? ''} ${member.lastName ?? ''}`.toLowerCase();
        const email = (member.emailId ?? '').toLowerCase();
        const role = (member.role ?? '').toLowerCase();
        return fullName.includes(searchLower) || email.includes(searchLower) || role.includes(searchLower);
      });
      
      const totalMembers = filteredMembers.length;
      const activeMembers = filteredMembers.filter(member => member.isActive && member.status === 'Active').length;
      const inactiveMembers = filteredMembers.filter(member => !member.isActive || member.status === 'Inactive').length;
      
      return (
        <Footer 
          totalMembers={totalMembers}
          activeMembers={activeMembers}
          inactiveMembers={inactiveMembers}
        />
      );
    }

    const isGroupsTab = activeTab === 2;
    return (
      <Footer 
        totalUsers={isGroupsTab ? undefined : totalUsers}
        activeUsers={isGroupsTab ? undefined : activeUsers}
        inactiveUsers={isGroupsTab ? undefined : inactiveUsers}
        totalGroups={isGroupsTab ? totalGroups : undefined}
        activeGroups={isGroupsTab ? activeGroups : undefined}
        inactiveGroups={isGroupsTab ? inactiveGroups : undefined}
      />
    );
  };


  // Helper function to render users tab
  const renderUsersTab = (): React.ReactNode => {
    // Only show "No Results Found" if not loading and there are no filtered users
    // During loading, show nothing (or grid if data exists) to avoid flashing "No Results Found"
    const shouldShowNoResults = !usersLoading && filteredUsers.length === 0;
    const shouldShowGrid = filteredUsers.length > 0;
    
    // Helper function to render grid content based on conditions
    const renderGridContent = (): React.ReactNode => {
      if (shouldShowGrid) {
        return (
          <div style={{
            ...userListStyles.gridWrapper,
            height: isPermissionsPanelOpen ? '64px' : '100%',
            maxHeight: isPermissionsPanelOpen ? '64px' : '100%',
            overflow: 'hidden',
            flex: isPermissionsPanelOpen ? '0 0 64px' : '1 1 auto',
            minHeight: 0
          }}>
            <AgGridShell
              key="user-management-grid"
              gridRef={gridRef}
              rowData={filteredUsers}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              components={components}
              onSortChanged={onSortChanged}
              onGridReady={onGridReady}
              rowHeight={30}
              headerHeight={34}
              getRowStyle={getRowStyle}
              gridOptions={gridOptions}
              isDraggable={false}
            />
          </div>
        );
      }
      if (shouldShowNoResults) {
        return (
          <NoResultsFound
            message="No Results Found"
            height="300px"
          />
        );
      }
      return null;
    };
    
    return (
      <Box sx={{
        ...userListStyles.gridContainer,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0
      }}>
        {renderGridContent()}
        
        {isPermissionsPanelOpen && selectedUser && (
          <Box sx={{
            flex: 1,
            backgroundColor: '#fff',
            border: '1px solid #e0e0e0',
            borderTop: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideUp 0.3s ease-out',
            '@keyframes slideUp': {
              from: {
                transform: 'translateY(100%)',
                opacity: 0
              },
              to: {
                transform: 'translateY(0)',
                opacity: 1
              }
            }
          }}>
            <UserViewPanel
              open={isPermissionsPanelOpen}
              onClose={handleClosePermissionsPanel}
              selectedUser={selectedUser}
            />
          </Box>
        )}
      </Box>
    );
  };

  // Helper function to render groups tab
  const renderGroupsTab = (): React.ReactNode => {
    if (teamMembersView.open && teamMembersView.teamGroup) {
      return (
        <TeamMembersView
          teamGroupName={teamMembersView.teamGroup.name || 'Team Members'}
          searchTerm={teamMembersSearchTerm}
          members={teamMembersData}
          onClose={closeTeamMembersView}
          onToggleStatus={handleTeamMemberToggle}
          onRemoveMember={handleTeamMemberRemove}
        />
      );
    }

    return (
      <TeamGroupManagement 
        searchTerm={groupSearchTerm}
        onToggle={(id, isActive) => {
          dispatch(toggleGroupStatus({ id, isEnabled: isActive }) as any);
        }}
        onMenuAction={handleGroupMenuAction}
      />
    );
  };

  // Grid ready handler
  const onGridReady = () => {
    // Grid is ready - no custom sorting needed, backend handles ordering
  };

  // Handle grid-based sorting
  const onSortChanged = () => {
    // Let AG Grid handle sorting internally
  };

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        ...userListStyles.container,
        position: 'relative'
      }}
    >
      <GridStyles />

      <Box sx={userListStyles.contentBox}>
        {/* Custom Navigation Bar (Tabs) */}
        <Box sx={userListStyles.navigationBar}>
          <Box sx={userListStyles.navigationLeft}>
            <Box sx={userListStyles.tabContainer}>
              {userTabs.map(({ label, index, marginLeft }) => (
                <Box
                  key={index}
                  sx={createTabStyles(activeTab === index, marginLeft)}
                  onClick={() => handleTabClick(index)}
                >
                  {label}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* HeaderBar - Show for Users (tab 0), Roles (tab 1), Teams/Groups (tab 2), and Reporting Structure (tab 3) */}
        {(activeTab === 0 || activeTab === 1 || activeTab === 2 || activeTab === 3) && renderAppropriateHeader()}

        {/* Main Content Area */}
        <Box sx={userListStyles.tabContent}>
          <TabPanel value={activeTab} index={0}>
            {renderUsersTab()}
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <RolesList searchTerm={searchTerm} />
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Box sx={userListStyles.tabContent}>
              {renderGroupsTab()}
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            {/* Only render ReportingStructurePanel when tab is active to prevent React Flow errors */}
            {activeTab === 3 && (
              <ReportingStructurePanel viewType={selectedViewBy} />
            )}
          </TabPanel>
        </Box>

        {/* Footer */}
        {renderFooter()}
      </Box>


      {/* Confirmation Dialog */}
      <NotificationAlert
        open={confirmDialog.open}
        variant="warning"
        title="Warning – Action Required"
        message={`Do you want to transfer all responsibilities to another user?`}
        onClose={handleConfirmNo}
        actions={[
          { label: 'No', onClick: handleConfirmNo, emphasis: 'secondary' },
          { label: 'Yes', onClick: handleConfirmYes, emphasis: 'primary' },
        ]}
      />

      {/* Transfer Responsibilities Panel */}
      <TransferResponsibilitiesPanel
        isOpen={transferPanel.open}
        onClose={() => handleTransferReset()}
        onSubmit={async (targetUserName: string) => {
          const success = await handleTransferSubmit(targetUserName);
          if (!success) {
            throw new Error('Failed to transfer responsibilities');
          }
        }}
        onReset={handleTransferReset}
        sourceUserName={transferPanel.userName}
        sourceUserId={transferPanel.userId}
        users={users}
        onSuccessNotification={showSuccessNotification}
      />

      {/* Success Notification */}
      {successNotification.open && (
        <NotificationAlert
          open={successNotification.open}
          variant="success"
          message={successNotification.message}
          onClose={() => setSuccessNotification({ open: false, message: '' })}
          autoHideDuration={5000}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <NotificationAlert
        open={deleteDialog.open}
        variant="warning"
        title="Warning"
        message="Are you sure you want to delete this group? Note: This action cannot be undone."
        onClose={() => setDeleteDialog({ open: false, teamGroup: null })}
        actions={[
          { 
            label: 'Cancel', 
            onClick: () => setDeleteDialog({ open: false, teamGroup: null }), 
            emphasis: 'secondary' 
          },
          { 
            label: 'Accept', 
            onClick: async () => {
              if (!deleteDialog.teamGroup) {
                setDeleteDialog({ open: false, teamGroup: null });
                return;
              }
              
              const groupToDelete = deleteDialog.teamGroup;
              setDeleteDialog({ open: false, teamGroup: null });
              
              try {
                await dispatch(softDeleteGroup(groupToDelete.id) as any);
                showSuccessNotification(`Group "${groupToDelete.name}" has been deleted successfully.`);
              } catch (error: any) {
                console.error('Failed to delete group:', error);
                showSuccessNotification(`Failed to delete group "${groupToDelete.name}". Please try again.`);
              }
            }, 
            emphasis: 'primary' 
          },
        ]}
      />
    </Container>
  );
};

export default UserList;

