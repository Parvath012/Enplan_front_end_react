import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store/configureStore';
import { AgGridReact } from 'ag-grid-react';
import { fetchRoles } from '../../store/Reducers/roleSlice';
import { roleService } from '../../services/roleService';
import { softDeleteRole } from '../../services/roleSaveService';
import NotificationAlert from 'commonApp/NotificationAlert';

// Direct imports from common-app
import AgGridShell from 'commonApp/AgGridShell';
import Footer from 'commonApp/Footer';
import NoResultsFound from 'commonApp/NoResultsFound';

// Import role components
import { createRoleNameCellRenderer, createRoleActionRenderer } from '../../components/roleList';
import RoleViewPanel from '../../components/roleView/RoleViewPanel';

// Import refactored utilities
import { createRoleColumnDefs } from '../../utils/roleListColumns';
import { createGridIcons, userListStyles } from '../../constants/userListConstants';
import { 
  createGridOptions, 
  createRowStyle 
} from '../../utils/gridUtils';

// Import refactored hooks
import { useRoleToggle, useRoleSearch } from '../../hooks';

// Register AG Grid Modules
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

ModuleRegistry.registerModules([AllCommunityModule]);

interface RolesListProps {
  searchTerm?: string;
}

const RolesList: React.FC<RolesListProps> = ({ searchTerm = '' }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const gridRef = useRef<AgGridReact<any>>(null);
  
  const { roles, loading, initialFetchAttempted } = useSelector((state: RootState) => state.roles);
  
  // State for role view panel
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [isPermissionsPanelOpen, setIsPermissionsPanelOpen] = useState(false);
  
  // State for delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    roleId: number | null;
    roleName: string;
  }>({
    open: false,
    roleId: null,
    roleName: ''
  });
  
  // State for delete operation
  const [isDeleting, setIsDeleting] = useState(false);
  
  // State for error notification
  const [errorNotification, setErrorNotification] = useState<{
    open: boolean;
    message: string;
  }>({
    open: false,
    message: ''
  });
  
  // Ensure roles are fetched when component mounts
  useEffect(() => {
    if (!initialFetchAttempted && !loading) {
      // @ts-ignore
      dispatch(fetchRoles());
    }
  }, [dispatch, initialFetchAttempted, loading]);
  
  // Note: fetchRoles now automatically syncs lock status based on current user assignments
  // UserEditForm and UserCreateForm already refresh roles after user updates
  // So roles will have correct lock status when this component loads
  
  // Refresh grid when roles data changes to ensure lock icons update
  useEffect(() => {
    if (gridRef.current?.api && roles.length > 0) {
      // Small delay to ensure Redux state has fully updated
      setTimeout(() => {
        // Refresh all cells to ensure lock icons update
        gridRef.current?.api.refreshCells({ force: true });
      }, 100);
    }
  }, [roles]);

  // Refresh grid when panel state changes to update action icons
  useEffect(() => {
    if (gridRef.current?.api) {
      // Small delay to ensure state has fully updated
      setTimeout(() => {
        // Refresh all cells to ensure action icons update when panel opens/closes
        gridRef.current?.api.refreshCells({ force: true });
      }, 50);
    }
  }, [isPermissionsPanelOpen, selectedRole]);
  
  // Use custom hooks for filtering
  const {
    filteredRoles
  } = useRoleSearch(roles, false);

  // Apply search term filter manually since search is handled in parent
  const searchFilteredRoles = useMemo(() => {
    if (!searchTerm.trim()) return filteredRoles;
    const searchLower = searchTerm.toLowerCase();
    return filteredRoles.filter(role => {
      const roleName = (role.rolename || '').toLowerCase();
      const department = (role.department || '').toLowerCase();
      const description = (role.roledescription || '').toLowerCase();
      return roleName.includes(searchLower) || 
             department.includes(searchLower) || 
             description.includes(searchLower);
    });
  }, [filteredRoles, searchTerm]);

  // Show only selected role when permissions panel is open to prevent scrolling
  const filteredRolesWithSearch = useMemo(() => {
    if (!isPermissionsPanelOpen || !selectedRole) return searchFilteredRoles;
    
    const roleIndex = searchFilteredRoles.findIndex(role => role.id === selectedRole.id);
    if (roleIndex === -1) return searchFilteredRoles;
    
    const selectedRoleData = searchFilteredRoles[roleIndex];
    
    // When drawer is open, show ONLY the selected role to prevent scrolling
    return [selectedRoleData];
  }, [searchFilteredRoles, isPermissionsPanelOpen, selectedRole]);

  const {
    togglingRoles,
    handleToggleStatus
  } = useRoleToggle(gridRef as React.RefObject<AgGridReact<any>>);

  // Handler functions
  const handleEditRole = (roleId: number) => {
    const isAdminApp = window.location.pathname.includes('/admin/user-management');
    navigate(isAdminApp ? `/admin/user-management/roles/edit/${roleId}` : `/user-management/roles/edit/${roleId}`);
  };

  // Helper function to normalize role ID for comparison
  const normalizeRoleId = (id: string | number): number => {
    return typeof id === 'string' ? parseInt(id, 10) : Number(id);
  };

  // Helper function to check if two role IDs match
  const roleIdsMatch = (roleId1: string | number, roleId2: string | number): boolean => {
    const id1 = normalizeRoleId(roleId1);
    const id2 = normalizeRoleId(roleId2);
    return id1 === id2 || String(roleId1) === String(roleId2);
  };

  // Helper function to find role in an array
  const findRoleInArray = (roleArray: any[], searchId: number): any => {
    return roleArray.find(r => {
      const rId = normalizeRoleId(r.id);
      return roleIdsMatch(rId, searchId);
    });
  };

  // Helper function to find role in grid
  const findRoleInGrid = (searchId: number): any => {
    if (!gridRef.current?.api) {
      return null;
    }
    
    let foundRole: any = null;
    gridRef.current.api.forEachNode((node) => {
      if (node.data && roleIdsMatch(node.data.id, searchId)) {
        foundRole = node.data;
      }
    });
    return foundRole;
  };

  // Helper function to convert fetched role to store format
  const convertFetchedRoleToStoreFormat = (fetchedRole: any): any => {
    return {
      id: fetchedRole.id ?? fetchedRole.Id,
      rolename: fetchedRole.rolename ?? fetchedRole.roleName ?? fetchedRole.RoleName,
      department: fetchedRole.department ?? fetchedRole.Department ?? '',
      roledescription: fetchedRole.roledescription ?? fetchedRole.roleDescription ?? fetchedRole.RoleDescription ?? '',
      status: fetchedRole.status ?? fetchedRole.Status ?? 'Active',
      parentattribute: fetchedRole.parentattribute ?? fetchedRole.parentAttribute ?? fetchedRole.ParentAttribute,
      permissions: fetchedRole.permissions ?? fetchedRole.Permissions,
      createdat: fetchedRole.createdat ?? fetchedRole.createdAt ?? fetchedRole.CreatedAt ?? '',
      lastupdatedat: fetchedRole.lastupdatedat ?? fetchedRole.lastUpdatedAt ?? fetchedRole.LastUpdatedAt ?? '',
      isenabled: fetchedRole.isenabled ?? fetchedRole.isEnabled ?? fetchedRole.IsEnabled ?? true,
      createdby: fetchedRole.createdby ?? fetchedRole.createdBy ?? fetchedRole.CreatedBy ?? '',
      updatedby: fetchedRole.updatedby ?? fetchedRole.updatedBy ?? fetchedRole.UpdatedBy ?? '',
      softdelete: fetchedRole.softdelete ?? fetchedRole.softDelete ?? fetchedRole.SoftDelete ?? false,
      islocked: fetchedRole.islocked ?? fetchedRole.isLocked ?? fetchedRole.IsLocked ?? false,
      lockedby: fetchedRole.lockedby ?? fetchedRole.lockedBy ?? fetchedRole.LockedBy ?? '',
      lockeddate: fetchedRole.lockeddate ?? fetchedRole.lockedDate ?? fetchedRole.LockedDate ?? '',
    };
  };

  const handleViewPermissions = async (roleId: number) => {
    const searchId = normalizeRoleId(roleId);
    let role: any = null;
    
    // First, try to get the role from the grid row data (most reliable source)
    role = findRoleInGrid(searchId);
    
    // If not found in grid, try multiple ways to find the role in store arrays
    if (!role) {
      role = findRoleInArray(roles, searchId);
    }
    
    if (!role) {
      role = findRoleInArray(filteredRoles, searchId);
    }
    
    if (!role) {
      role = findRoleInArray(searchFilteredRoles, searchId);
    }
    
    // If role is still not found, fetch it from API
    if (!role) {
      try {
        const fetchedRole: any = await roleService.getRoleById(roleId);
        if (fetchedRole) {
          role = convertFetchedRoleToStoreFormat(fetchedRole);
        }
      } catch (error) {
        console.error('Error fetching role from API:', error);
        console.warn('Role not found for ID:', roleId, 'Available roles count:', roles.length, 'Filtered roles count:', filteredRoles.length);
        return;
      }
    }
    
    if (role) {
      setSelectedRole(role);
      setIsPermissionsPanelOpen(true);
    } else {
      console.warn('Role not found for ID:', roleId, 'Available roles count:', roles.length, 'Filtered roles count:', filteredRoles.length);
    }
  };

  const handleClosePermissionsPanel = () => {
    setIsPermissionsPanelOpen(false);
    setSelectedRole(null);
  };

  const handleDeleteRole = (roleId: number) => {
    // Find the role to get its name
    const role = roles.find(r => {
      const rId = typeof r.id === 'string' ? parseInt(r.id, 10) : Number(r.id);
      const searchId = typeof roleId === 'string' ? parseInt(String(roleId), 10) : Number(roleId);
      return rId === searchId || String(r.id) === String(roleId);
    });
    
    const roleName = role?.rolename ?? 'this role';
    
    // Open confirmation dialog
    setDeleteDialog({
      open: true,
      roleId: roleId,
      roleName: roleName
    });
  };
  
  const handleDeleteConfirm = async () => {
    if (!deleteDialog.roleId) return;
    
    setIsDeleting(true);
    try {
      // Perform soft delete
      await softDeleteRole(deleteDialog.roleId);
      
      // Close dialog
      setDeleteDialog({
        open: false,
        roleId: null,
        roleName: ''
      });
      
      // Refresh roles list
      // @ts-ignore
      dispatch(fetchRoles());
      
      console.log('Role soft deleted successfully:', deleteDialog.roleId);
    } catch (error: any) {
      console.error('Error deleting role:', error);
      // Show error message
      setErrorNotification({
        open: true,
        message: 'Something went wrong. Could not delete the role. Please try again.'
      });
      
      // Close dialog
      setDeleteDialog({
        open: false,
        roleId: null,
        roleName: ''
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialog({
      open: false,
      roleId: null,
      roleName: ''
    });
  };

  // Create getter functions for panel state (using refs to always get latest values)
  const isPanelOpenRef = useRef(false);
  const selectedRoleIdRef = useRef<number | null>(null);
  
  // Update refs whenever panel state changes
  useEffect(() => {
    isPanelOpenRef.current = isPermissionsPanelOpen;
    const roleId = selectedRole?.id;
    let normalizedRoleId: number | null = null;
    if (roleId) {
      normalizedRoleId = typeof roleId === 'string' ? parseInt(roleId, 10) : Number(roleId);
    }
    selectedRoleIdRef.current = normalizedRoleId;
  }, [isPermissionsPanelOpen, selectedRole]);
  
  // Getter functions that return current state
  const getIsPanelOpen = () => isPanelOpenRef.current;
  const getSelectedRoleId = () => selectedRoleIdRef.current;

  // Create cell renderers with memoization
  const nameCellRenderer = useMemo(() => createRoleNameCellRenderer(searchTerm), [searchTerm]);
  
  const actionRenderer = useMemo(() => 
    createRoleActionRenderer(
      handleEditRole,
      handleViewPermissions,
      handleDeleteRole,
      handleToggleStatus,
      togglingRoles,
      getIsPanelOpen,
      getSelectedRoleId
    ), 
    [togglingRoles, handleEditRole, handleViewPermissions, handleDeleteRole, handleToggleStatus, getIsPanelOpen, getSelectedRoleId]
  );

  // AG Grid column definitions - memoized
  const columnDefs = useMemo(() => createRoleColumnDefs(searchTerm, nameCellRenderer), [searchTerm, nameCellRenderer]);
  // Default column definition that doesn't override fixed widths
  const defaultColDef = useMemo(() => ({
    suppressHeaderClickSorting: false,
    sortable: true,
    filter: false,
    headerClass: 'ag-header-cell-custom',
    unSortIcon: true,
    sortingOrder: ['asc', 'desc', null] as any,
  }), []);

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
    
    // Highlight the selected role row
    if (isPermissionsPanelOpen && selectedRole && params.data?.id === selectedRole.id) {
      return {
        ...baseStyle,
        backgroundColor: '#f0f8ff !important',
        borderBottom: '2px solid #006FE6 !important',
        fontWeight: '500 !important'
      };
    }
    
    // Grey out inactive roles
    const role = params.data;
    const isInactive = !role.isenabled || role.status === 'Inactive';
    if (isInactive) {
      return {
        ...baseStyle,
        opacity: 0.7,
        filter: 'grayscale(0.3)',
      };
    }
    
    return baseStyle;
  };

  // Calculate role statistics for footer (use searchFilteredRoles to get accurate counts)
  const totalRoles = searchFilteredRoles.length;
  const activeRoles = searchFilteredRoles.filter(role => role.isenabled && role.status !== 'Inactive').length;
  const inactiveRoles = searchFilteredRoles.filter(role => !role.isenabled || role.status === 'Inactive').length;

  // Grid ready handler
  const onGridReady = () => {
    // Grid is ready - no custom sorting needed, backend handles ordering
  };

  // Handle grid-based sorting
  const onSortChanged = () => {
    // Let AG Grid handle sorting internally
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      overflow: 'hidden'
    }}>
      {/* Role List with AG Grid */}
      <Box sx={{
        ...userListStyles.gridContainer,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0
      }}>
        {/* Show grid only if we have roles or if we're still loading/initializing */}
        {filteredRolesWithSearch.length > 0 || loading || !initialFetchAttempted ? (
          <div style={{
            ...userListStyles.gridWrapper,
            height: isPermissionsPanelOpen ? '64px' : '100%',
            maxHeight: isPermissionsPanelOpen ? '64px' : '100%',
            overflow: 'hidden',
            flex: isPermissionsPanelOpen ? '0 0 64px' : '1 1 auto',
            minHeight: 0
          }}>
              <AgGridShell
                key="role-management-grid"
                gridRef={gridRef}
                rowData={filteredRolesWithSearch}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                components={components}
                onSortChanged={onSortChanged}
                onGridReady={onGridReady}
                rowHeight={30}
                headerHeight={34}
                getRowStyle={getRowStyle}
                gridOptions={{
                  ...gridOptions,
                  suppressSizeToFit: false,
                  domLayout: 'normal',
                }}
                isDraggable={false}
              />
          </div>
        ) : (
          <NoResultsFound
            message="No Results Found"
            height="300px"
          />
        )}
        
        {/* Role View Panel - positioned immediately below the selected role record with slide-up animation */}
        {isPermissionsPanelOpen && selectedRole && (
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
            <RoleViewPanel
              open={isPermissionsPanelOpen}
              onClose={handleClosePermissionsPanel}
              selectedRole={selectedRole}
            />
          </Box>
        )}
      </Box>

      {/* Footer - Hide when panel is open */}
      {!isPermissionsPanelOpen && (
        <Footer 
          totalRoles={totalRoles}
          activeRoles={activeRoles}
          inactiveRoles={inactiveRoles}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <NotificationAlert
        open={deleteDialog.open}
        variant="warning"
        title="Warning – Action Required"
        message={
          <>
            Are you sure you want to delete this role?
            <br />
            Note: This action cannot be undone.
          </>
        }
        onClose={handleDeleteCancel}
        actions={[
          { label: 'Cancel', onClick: handleDeleteCancel, emphasis: 'secondary', disabled: isDeleting },
          { label: 'Accept', onClick: handleDeleteConfirm, emphasis: 'primary', disabled: isDeleting },
        ]}
      />
      
      {/* Error Notification */}
      {errorNotification.open && (
        <NotificationAlert
          open={errorNotification.open}
          variant="error"
          message={errorNotification.message}
          onClose={() => setErrorNotification({ open: false, message: '' })}
          autoHideDuration={5000}
        />
      )}
    </Box>
  );
};

export default RolesList;

