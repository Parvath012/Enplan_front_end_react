import React from 'react';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/configureStore';
import TeamGroupCard, { TeamGroup } from './TeamGroupCard';
import NoResultsFound from 'commonApp/NoResultsFound';

interface TeamGroupManagementProps {
  searchTerm?: string;
  onToggle?: (id: string, isActive: boolean) => void;
  onMenuAction?: (action: string, teamGroup: TeamGroup) => void;
}

const TeamGroupManagement: React.FC<TeamGroupManagementProps> = ({
  searchTerm = '',
  onToggle,
  onMenuAction
}) => {
  // Get groups from Redux store
  const { groups, loading } = useSelector((state: RootState) => state.groups);
  
  // Filter groups based on search term (by group name)
  const filteredGroups = React.useMemo(() => {
    if (!searchTerm.trim()) return groups;
    
    const searchLower = searchTerm.toLowerCase();
    return groups.filter(group => 
      group.name.toLowerCase().includes(searchLower)
    );
  }, [groups, searchTerm]);

  // Calculate stats for footer (use filtered groups for display, but all groups for stats)
  const totalTeams = groups.length;
  const activeTeams = groups.filter(tg => tg.isActive).length;
  const inactiveTeams = groups.filter(tg => !tg.isActive).length;

  // Show loading state if needed
  if (loading && groups.length === 0) {
    return (
      <Box sx={{ padding: 2, textAlign: 'center' }}>
        Loading groups...
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        minHeight: 0,
        position: 'relative',
        visibility: 'visible' // Ensure always visible when tab is active
      }}
    >
      <Box 
        sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: 0,
          width: '100%',
          visibility: 'visible', // Ensure scrollable area is always visible
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {filteredGroups.length === 0 ? (
          <NoResultsFound
            message="No Results Found"
            height="300px"
          />
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)', // 2 cards per row on small screens
                sm: 'repeat(2, 1fr)', // 2 cards per row on small-medium screens
                md: 'repeat(3, 1fr)', // 3 cards per row on medium screens
                lg: 'repeat(4, 1fr)', // 4 cards per row on large screens
                xl: 'repeat(4, 1fr)'  // 4 cards per row on extra large screens
              },
              gap: '16px',
              padding: '16px',
              width: '100%',
              boxSizing: 'border-box',
              // Allow horizontal scrolling on very small screens if needed
              overflowX: { xs: 'auto', sm: 'visible' },
              // Wrap to next row if container is too narrow
              gridAutoFlow: 'row',
              // Ensure minimum width for cards
              minWidth: 0,
              visibility: 'visible', // Ensure cards grid is always visible
              opacity: 1 // Ensure full opacity
            }}
          >
            {filteredGroups.map((teamGroup) => (
              <Box
                key={teamGroup.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  minWidth: 0, // Allow shrinking if needed
                  maxWidth: '100%'
                }}
              >
                <TeamGroupCard
                  teamGroup={teamGroup}
                  searchTerm={searchTerm}
                  onToggle={onToggle}
                  onMenuAction={onMenuAction}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>
      {/* Store stats in data attribute for parent to access */}
      <Box 
        data-total-teams={totalTeams}
        data-active-teams={activeTeams}
        data-inactive-teams={inactiveTeams}
        sx={{ display: 'none' }}
      />
    </Box>
  );
};

export default TeamGroupManagement;

