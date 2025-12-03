import React, { useRef, useMemo } from 'react';
import { Box, IconButton } from '@mui/material';
import { PersonRemoveOutlined } from '@mui/icons-material';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Direct imports from common-app
import AgGridShell from 'commonApp/AgGridShell';
import NoResultsFound from 'commonApp/NoResultsFound';
import ToggleSwitch from 'commonApp/ToggleSwitch';
import CustomTooltip from 'commonApp/CustomTooltip';
import { createHighlightedCellRenderer, ConditionalTooltipText } from 'commonApp/cellRenderers';

// Import utilities
import { createBaseColumnProps, createCellStyles, createDefaultColDef, createGridOptions } from '../../utils/gridUtils';
import { userListStyles, createGridIcons } from '../../constants/userListConstants';
import UserInitials from '../UserInitials';

// Register AG Grid Modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  emailId?: string;
  role?: string;
  joinedDate?: string;
  isActive: boolean;
  status: 'Active' | 'Inactive';
  isDeleted?: boolean;
  leftAt?: string;
}

interface TeamMembersViewProps {
  teamGroupName: string;
  members: TeamMember[];
  searchTerm?: string;
  onClose: () => void;
  onToggleStatus?: (memberId: string, isActive: boolean) => void;
  onRemoveMember?: (memberId: string) => void;
}

/**
 * Team Members Name Cell Renderer
 */
const TeamMemberNameCellRenderer: React.FC<{ params: any; searchTerm: string }> = ({ params, searchTerm }) => {
  const member = params.data;
  const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'N/A';
  
  return (
    <div style={{ 
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      width: '100%',
      fontFamily: "'InterTight-Regular', 'Inter Tight', sans-serif"
    }}>
      {/* UserInitials - 24px width */}
      <div style={{
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginRight: '8px'
      }}>
        <UserInitials 
          firstName={member.firstName || ''} 
          lastName={member.lastName || ''} 
          size={24}
          fontSize={10}
        />
      </div>
      
      {/* Name text */}
      <div style={{
        flex: 1,
        minWidth: 0,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        <ConditionalTooltipText
          text={fullName}
          maxChars={15}
          searchTerm={searchTerm}
        />
      </div>
    </div>
  );
};

/**
 * Team Members Action Cell Renderer
 */
const TeamMemberActionRenderer: React.FC<{ 
  params: any; 
  onToggleStatus?: (memberId: string, isActive: boolean) => void;
  onRemoveMember?: (memberId: string) => void;
}> = ({ params, onToggleStatus, onRemoveMember }) => {
  const member = params.data;
  const isInactive = !member.isActive || member.status === 'Inactive';
  
  const handleUserDashClick = () => {
    if (onRemoveMember && !isInactive) {
      onRemoveMember(member.id);
    }
  };
  
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6.5px',
      padding: '0',
      width: '100%',
      height: '100%'
    }}>
      {/* PersonRemove Icon with Tooltip */}
      <CustomTooltip title={isInactive ? "Cannot remove inactive member" : "Remove User"} placement="bottom" arrow={false}>
        <span>
          <IconButton
            size="small"
            disabled={isInactive}
            onClick={handleUserDashClick}
            sx={{
              width: '28px',
              height: '20px',
              padding: 0,
              backgroundColor: 'rgba(255,255,255,0)',
              border: 'none',
              borderRadius: '4px',
              color: isInactive ? '#9E9E9E' : '#5B6061',
              cursor: isInactive ? 'not-allowed' : 'pointer',
              pointerEvents: isInactive ? 'none' : 'auto',
              opacity: isInactive ? 0.5 : 1,
              marginRight: '-6px', // Move icon a little to the left
              '&:hover:not(.Mui-disabled)': {
                backgroundColor: 'rgba(0, 0, 0, 0.04) !important',
              },
              '&:focus:not(.Mui-disabled)': {
                backgroundColor: 'rgba(0, 0, 0, 0.04) !important',
              },
              '&.Mui-disabled:hover': {
                backgroundColor: 'transparent !important',
              },
            }}
          >
            <PersonRemoveOutlined 
              sx={{ 
                fontSize: 16, 
                color: isInactive ? '#9E9E9E' : '#5B6061'
              }} 
            />
          </IconButton>
        </span>
      </CustomTooltip>
      
      {/* Vertical divider between UserDash and Toggle */}
      <Box sx={{
        width: '1px',
        height: '16px',
        backgroundColor: '#e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center'
      }} />
      
      {/* Toggle Switch - Always clickable, even for inactive users */}
      <Box sx={{
        marginLeft: '8px' // Move toggle to the right
      }}>
        <ToggleSwitch
          isOn={member.isActive}
          disabled={false}
          handleToggle={() => {
            if (onToggleStatus) {
              console.log('ToggleSwitch clicked for member:', member.id, 'Current status:', member.isActive);
              onToggleStatus(member.id, !member.isActive); // Pass the NEW status (toggled)
            }
          }}
        />
      </Box>
    </Box>
  );
};

/**
 * Create column definitions for team members table
 */
const createTeamMemberColumnDefs = (searchValue: string, nameCellRenderer: any, actionRenderer: any) => [
  {
    field: 'name',
    headerName: 'Name',
    ...createBaseColumnProps(28, searchValue, 34),
    suppressHeaderClickSorting: true,
    valueGetter: (params: any) => {
      const member = params.data;
      return `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'N/A';
    },
    cellRenderer: nameCellRenderer,
    cellStyle: {
      ...createCellStyles(true),
      padding: '0 12px',
      paddingTop: '0',
      paddingLeft: '12px',
      paddingRight: '12px',
      paddingBottom: '0',
      overflow: 'visible'
    },
  },
  {
    field: 'emailId',
    headerName: 'User Id',
    ...createBaseColumnProps(28, searchValue, 24),
    cellRenderer: createHighlightedCellRenderer(searchValue, 24),
    cellStyle: createCellStyles(true),
  },
  {
    field: 'role',
    headerName: 'Roles',
    ...createBaseColumnProps(20, searchValue, 20),
    cellRenderer: createHighlightedCellRenderer(searchValue, 20),
    cellStyle: createCellStyles(),
  },
  {
    field: 'joinedDate',
    headerName: 'Joined Date',
    ...createBaseColumnProps(18, searchValue, 20),
    cellRenderer: createHighlightedCellRenderer(searchValue, 20),
    cellStyle: createCellStyles(),
  },
  {
    headerName: 'Action',
    width: 130,
    resizable: true,
    suppressMovableColumns: false,
    headerClass: 'ag-header-cell-custom',
    cellClass: 'ag-cell-custom action-cell-no-border',
    cellRenderer: actionRenderer,
    sortable: false,
    filter: false,
    cellStyle: {
      borderRight: 'none !important',
      padding: '0 !important'
    }
  },
  {
    field: 'status',
    headerName: 'Status',
    ...createBaseColumnProps(18, searchValue, 20),
    cellRenderer: createHighlightedCellRenderer(searchValue, 20),
    cellStyle: createCellStyles(),
  }
];

const TeamMembersView: React.FC<TeamMembersViewProps> = ({
  teamGroupName: _teamGroupName,
  members,
  searchTerm = '',
  onClose: _onClose,
  onToggleStatus,
  onRemoveMember
}) => {
  const gridRef = useRef<AgGridReact<any>>(null);

  // Filter members based on search term
  // Also filter out soft-deleted members (those with left_at set) from the display
  const filteredMembers = useMemo(() => {
    // First filter out soft-deleted members (removed members)
    const activeMembers = members.filter(member => !member.isDeleted);
    
    if (!searchTerm.trim()) return activeMembers;
    
    const searchLower = searchTerm.toLowerCase();
    return activeMembers.filter(member => {
      const fullName = `${member.firstName ?? ''} ${member.lastName ?? ''}`.toLowerCase();
      const email = (member.emailId ?? '').toLowerCase();
      const role = (member.role ?? '').toLowerCase();
      return fullName.includes(searchLower) || email.includes(searchLower) || role.includes(searchLower);
    });
  }, [members, searchTerm]);

  // Create cell renderers
  const nameCellRenderer = useMemo(() => {
    return (params: any) => <TeamMemberNameCellRenderer params={params} searchTerm={searchTerm} />;
  }, [searchTerm]);

  const actionRenderer = useMemo(() => {
    return (params: any) => (
      <TeamMemberActionRenderer 
        params={params} 
        onToggleStatus={onToggleStatus}
        onRemoveMember={onRemoveMember}
      />
    );
  }, [onToggleStatus, onRemoveMember]);

  // Column definitions
  const columnDefs = useMemo(() => 
    createTeamMemberColumnDefs(searchTerm, nameCellRenderer, actionRenderer), 
    [searchTerm, nameCellRenderer, actionRenderer]
  );

  const defaultColDef = useMemo(() => createDefaultColDef(), []);
  const gridIcons = useMemo(() => createGridIcons(), []);
  const gridOptions = useMemo(() => createGridOptions(actionRenderer, gridIcons), [actionRenderer, gridIcons]);

  // Components
  const components = useMemo(() => ({
    actionRenderer: actionRenderer,
  }), [actionRenderer]);

  // Row style - customize for team members
  const getRowStyle = (params: any) => {
    const member = params.data;
    const isInactive = member.status === 'Inactive' || !member.isActive;
    const isDeleted = member.isDeleted;
    
    let opacity = 1;
    let filter = 'none';
    
    if (isDeleted) {
      opacity = 0.5;
      filter = 'grayscale(0.8)';
    } else if (isInactive) {
      opacity = 0.7;
      filter = 'grayscale(0.3)';
    }
    
    return {
      backgroundColor: 'rgba(255, 255, 255, 0)',
      borderBottom: '1px solid rgba(247, 247, 246, 1)',
      opacity,
      filter,
      transition: 'opacity 0.3s ease, filter 0.3s ease',
    };
  };

  // Grid handlers
  const onGridReady = () => {
    // Grid is ready
  };

  const onSortChanged = () => {
    // Let AG Grid handle sorting internally
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      backgroundColor: '#fff',
      flex: 1
    }}>

      {/* Grid Container */}
      <Box sx={{
        ...userListStyles.gridContainer,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0
      }}>
        {filteredMembers.length > 0 ? (
          <div style={{
            ...userListStyles.gridWrapper,
            height: '100%',
            maxHeight: '100%',
            overflow: 'hidden',
            flex: '1 1 auto',
            minHeight: 0
          }}>
            <AgGridShell
              key="team-members-grid"
              gridRef={gridRef}
              rowData={filteredMembers}
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
        ) : (
          <NoResultsFound
            message="No Results Found"
            height="300px"
          />
        )}
      </Box>

    </Box>
  );
};

export default TeamMembersView;

