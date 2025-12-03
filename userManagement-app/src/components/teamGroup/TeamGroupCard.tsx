import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import Card from 'commonApp/Card';
import ToggleSwitch from 'commonApp/ToggleSwitch';
import UserInitials from '../UserInitials';
import { ConditionalTooltipText } from 'commonApp/cellRenderers';
import './TeamGroupCard.scss';

// Define types locally since they're not exported through Module Federation
interface CardAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: (data?: any) => void;
  disabled?: boolean;
  divider?: boolean;
}

interface CardSection {
  id: string;
  content: React.ReactNode;
  backgroundColor?: string;
  padding?: string;
  borderBottom?: boolean;
}

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  isOnline?: boolean;
}

export interface TeamGroup {
  id: string;
  name: string;
  description: string;
  createdDate: string;
  lastUpdatedDate: string;
  isActive: boolean;
  teamMembers: TeamMember[];
  additionalMembersCount?: number;
  ownerId?: string; // Owner user ID
}

interface TeamGroupCardProps {
  teamGroup: TeamGroup;
  searchTerm?: string;
  onToggle?: (id: string, isActive: boolean) => void;
  onMenuAction?: (action: string, teamGroup: TeamGroup) => void;
}

const TeamGroupCard: React.FC<TeamGroupCardProps> = ({
  teamGroup,
  searchTerm = '',
  onToggle,
  onMenuAction
}) => {
  const [isActive, setIsActive] = useState(teamGroup.isActive);

  // Update local state when teamGroup prop changes
  useEffect(() => {
    setIsActive(teamGroup.isActive);
  }, [teamGroup.isActive]);

  const handleToggle = () => {
    const newActiveState = !isActive;
    setIsActive(newActiveState);
    if (onToggle) {
      onToggle(teamGroup.id, newActiveState);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2); // Last 2 digits of year
    return `${day}-${month}-${year}`;
  };

  // Separate owner from other members
  const ownerId = teamGroup.ownerId;
  const ownerMember = ownerId ? teamGroup.teamMembers.find(m => m.id === ownerId) : null;
  const otherMembers = ownerId 
    ? teamGroup.teamMembers.filter(m => m.id !== ownerId)
    : teamGroup.teamMembers;
  
  // Show owner + 3 other members (total 4 visible)
  const displayedOtherMembers = otherMembers.slice(0, 3);
  const remainingCount = Math.max(0, otherMembers.length - 3);
  // Only show count if there are more than 3 other members (not including owner)
  const hasMoreMembers = remainingCount > 0;

  // Custom title with toggle switch and search highlighting
  const titleContent = (
    <Box className="team-group-card__header">
      <Typography 
        className="team-group-card__title" 
        variant="h6"
        component="div"
        sx={{
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <ConditionalTooltipText 
          text={teamGroup.name} 
          maxChars={30} 
          searchTerm={searchTerm}
        />
      </Typography>
      <Box className="team-group-card__toggle">
        <ToggleSwitch isOn={isActive} handleToggle={handleToggle} />
      </Box>
    </Box>
  );

  // Card sections for dates and description
  const sections: CardSection[] = [
    {
      id: 'dates',
      content: (
        <Box className="team-group-card__dates">
          <Typography className="team-group-card__date" variant="body2">
            Created: {formatDate(teamGroup.createdDate)}
          </Typography>
          <Box className="team-group-card__date-separator" />
          <Typography className="team-group-card__date" variant="body2">
            Last Updated: {formatDate(teamGroup.lastUpdatedDate)}
          </Typography>
        </Box>
      ),
      padding: '6px 12px',
      borderBottom: false,
      backgroundColor: 'rgba(255, 255, 255, 1)' // White background
    },
    {
      id: 'description',
      content: (
        <Box className="team-group-card__description">
          <Typography className="team-group-card__description-label" variant="body2">
            Description:
          </Typography>
          <Typography className="team-group-card__description-text" variant="body2">
            {teamGroup.description}
          </Typography>
        </Box>
      ),
      padding: '6px 12px 0px 12px',
      borderBottom: false,
      backgroundColor: 'rgba(255, 255, 255, 1)' // White background
    }
  ];

  // Render avatar with optional red mark
  const renderAvatar = (member: TeamMember, showRedMark: boolean = false, shouldOverlap: boolean = false) => (
    <Box key={member.id} className={`team-group-card__member-avatar ${shouldOverlap ? 'team-group-card__member-avatar--overlap' : ''}`}>
      {member.avatarUrl ? (
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={member.avatarUrl}
            alt={`${member.firstName} ${member.lastName}`}
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%'
            }}
          />
          {showRedMark && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#f44336',
                border: '1.5px solid white',
                zIndex: 2
              }}
            />
          )}
        </Box>
      ) : (
        <Box sx={{ position: 'relative' }}>
          <UserInitials
            firstName={member.firstName}
            lastName={member.lastName}
            size={32}
            fontSize={12}
          />
          {showRedMark && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#f44336',
                border: '1.5px solid white',
                zIndex: 2
              }}
            />
          )}
        </Box>
      )}
    </Box>
  );

  // Footer with team members
  const footerContent = (
    <Box className="team-group-card__footer">
      <Box className="team-group-card__members">
        {/* Owner with red mark - no overlap */}
        {ownerMember && renderAvatar(ownerMember, true, false)}
        
        {/* Separator - dashed vertical line */}
        {ownerMember && displayedOtherMembers.length > 0 && (
          <Box className="team-group-card__member-separator" />
        )}
        
        {/* 3 other members without red marks - with overlap */}
        {displayedOtherMembers.map((member) => renderAvatar(member, false, true))}
        
        {/* Remaining members count - with overlap */}
        {hasMoreMembers && (
          <Box className="team-group-card__more-members team-group-card__more-members--overlap">
            <Typography variant="body2">
              +{remainingCount}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  // Menu actions for Card's built-in menu
  // Disable all actions except toggle when group is inactive
  const isGroupInactive = !isActive;
  const actions: CardAction[] = [
    {
      id: 'view',
      label: 'View',
      onClick: () => onMenuAction && !isGroupInactive && onMenuAction('view', teamGroup),
      disabled: isGroupInactive
    },
    {
      id: 'edit',
      label: 'Edit',
      onClick: () => onMenuAction && !isGroupInactive && onMenuAction('edit', teamGroup),
      disabled: isGroupInactive
    },
    {
      id: 'delete',
      label: 'Delete',
      onClick: () => onMenuAction && !isGroupInactive && onMenuAction('delete', teamGroup),
      disabled: isGroupInactive
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      onClick: () => onMenuAction && !isGroupInactive && onMenuAction('duplicate', teamGroup),
      disabled: isGroupInactive
    }
  ];

  return (
    <div className={`team-group-card-wrapper ${!isActive ? 'team-group-card-wrapper--inactive' : ''}`}>
      <Card
        id={teamGroup.id}
        data={teamGroup}
        title={titleContent}
        sections={sections}
        footer={footerContent}
        actions={actions}
        showMenuButton={true}
        size="custom"
        width="100%"
        minHeight="165px"
        maxHeight="165px"
        height="165px"
        variant="default"
        className={`team-group-card ${!isActive ? 'team-group-card--inactive' : ''} ${isGroupInactive ? 'team-group-card--menu-disabled' : ''}`}
        headerBackgroundColor="rgba(255, 255, 255, 1)"
        footerBackgroundColor="rgba(255, 255, 255, 1)"
      />
    </div>
  );
};

export default TeamGroupCard;

