import React, { useState, useMemo, useEffect } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/configureStore';
import { createGroup, updateGroup } from '../../store/Reducers/groupSlice';
import { fetchGroupById } from '../../services/groupFetchService';
import { parseActiveMemberUserIds } from '../../services/serviceUtils';
import { getActiveUsers, getUserFullName, createUserMapByName, createUserOptions } from '../../utils/userUtils';
import FormHeaderBase from 'commonApp/FormHeaderBase';
import { ReusableTextField, ReusableSelectField, ReusableMultiSelectField, SectionTitle } from '../../components/userManagement/UserFormComponents';
import { getUserFormStyles, getHorizontalDividerStyles, getFlexBetweenContainerStyles } from '../../components/userManagement/PermissionTableConstants';
import NotificationAlert from 'commonApp/NotificationAlert';
import '../../components/teamGroup/GroupCreateForm.scss';

// Use shared user form styles
const userFormStyles = getUserFormStyles();

interface GroupFormData {
  groupName: string;
  description: string;
  groupOwner: string;
  members: string[];
}

const GroupCreateForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { id: groupId } = useParams<{ id?: string }>();
  const isEditMode = !!groupId;
  const { users } = useSelector((state: RootState) => state.users);
  const { loading: groupsLoading, error: groupsError } = useSelector((state: RootState) => state.groups);
  
  // Check if we have duplicate data from location state
  const duplicateData = location.state?.duplicateData;
  
  const [formData, setFormData] = useState<GroupFormData>({
    groupName: '', // Always empty for duplicate (and create mode)
    description: duplicateData?.description || '',
    groupOwner: duplicateData?.groupOwner || '', // Store user ID as string
    members: duplicateData?.members || []
  });
  const [originalFormData, setOriginalFormData] = useState<GroupFormData>({
    groupName: '',
    description: duplicateData?.description || '',
    groupOwner: duplicateData?.groupOwner || '',
    members: duplicateData?.members || []
  });
  const [groupIsActive, setGroupIsActive] = useState(duplicateData?.isactive ?? true); // Store group's active status
  const [isFormModified, setIsFormModified] = useState(!!duplicateData); // Mark as modified if duplicate data exists
  const [isLoadingGroup, setIsLoadingGroup] = useState(isEditMode);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmType, setConfirmType] = useState<'reset' | 'cancel'>('reset');

  // Get active users for Group Owner dropdown
  const activeUsers = useMemo(() => getActiveUsers(users), [users]);

  // Format users as options for SelectField (display name, but store user ID)
  // SelectField expects string[], so we'll use "FirstName LastName" format
  // We'll need to map the selected name back to user ID when submitting
  const groupOwnerOptions = useMemo(() => createUserOptions(activeUsers), [activeUsers]);

  // Create a map to get user ID from full name
  const userMapByName = useMemo(() => createUserMapByName(activeUsers), [activeUsers]);

  // Get current selected user's full name for display
  const selectedOwnerName = useMemo(() => {
    if (!formData.groupOwner) return '';
    const user = activeUsers.find(u => String(u.id) === formData.groupOwner);
    return user ? getUserFullName(user) : '';
  }, [formData.groupOwner, activeUsers]);

  // Helper function to get navigation path to groups tab
  const getGroupsTabPath = (): string => {
    const isAdminApp = window.location.pathname.includes('/admin');
    const basePath = isAdminApp ? '/admin/user-management' : '/user-management';
    return `${basePath}?tab=2`;
  };

  // Load group data when in edit mode
  useEffect(() => {
    const loadGroupData = async () => {
      if (!isEditMode || !groupId) {
        return;
      }
      
      setIsLoadingGroup(true);
      try {
        const groupModel = await fetchGroupById(groupId);
        if (!groupModel) {
          console.error('Group not found');
          navigate(getGroupsTabPath());
          return;
        }
        
        const memberUserIds = parseActiveMemberUserIds(groupModel.members);
        const loadedFormData = {
          groupName: groupModel.name ?? '',
          description: groupModel.description ?? '',
          groupOwner: groupModel.owner_user_id ?? '',
          members: memberUserIds
        };
        
        setFormData(loadedFormData);
        setOriginalFormData(loadedFormData);
        setGroupIsActive(groupModel.isactive ?? true);
        setIsFormModified(false);
      } catch (error) {
        console.error('Failed to load group data:', error);
        navigate(getGroupsTabPath());
      } finally {
        setIsLoadingGroup(false);
      }
    };
    
    loadGroupData();
  }, [isEditMode, groupId, navigate]);

  // Auto-add owner to members when owner is selected (only if not already in members)
  useEffect(() => {
    if (formData.groupOwner && !formData.members.includes(formData.groupOwner)) {
      setFormData(prev => ({
        ...prev,
        members: [...prev.members, prev.groupOwner]
      }));
      setIsFormModified(true);
    }
  }, [formData.groupOwner, formData.members]);

  // Get active users for Members dropdown with "(Owner)" label for the owner
  const membersOptions = useMemo(() => {
    return activeUsers.map(user => {
      const fullName = getUserFullName(user);
      // If this user is the owner, add "(Owner)" suffix
      if (formData.groupOwner && String(user.id) === formData.groupOwner) {
        return `${fullName} (Owner)`;
      }
      return fullName;
    });
  }, [activeUsers, formData.groupOwner]);

  // Create a map to get user IDs from member names (handles both with and without "(Owner)" suffix)
  const memberMapByName = useMemo(() => {
    const map = createUserMapByName(activeUsers);
    // Also map names with "(Owner)" suffix
    activeUsers.forEach(user => {
      if (user.id) {
        const fullName = getUserFullName(user);
        map.set(`${fullName} (Owner)`, user.id);
      }
    });
    return map;
  }, [activeUsers]);

  const handleBack = () => {
    if (isFormModified) {
      setConfirmType('cancel');
      setConfirmMessage('You have unsaved changes. Are you sure you want to leave?');
      setConfirmOpen(true);
    } else {
      navigate(getGroupsTabPath());
    }
  };

  const handleReset = () => {
    setConfirmType('reset');
    setConfirmMessage('Are you sure you want to reset all form fields?');
    setConfirmOpen(true);
  };

  const handleCancel = () => {
    if (isFormModified) {
      setConfirmType('cancel');
      setConfirmMessage('You have unsaved changes. Are you sure you want to cancel?');
      setConfirmOpen(true);
    } else {
      navigate(getGroupsTabPath());
    }
  };

  const handleConfirmYes = () => {
    if (confirmType === 'reset') {
      // Reset to original data (or empty if create mode)
      setFormData(isEditMode ? { ...originalFormData } : {
        groupName: '',
        description: '',
        groupOwner: '',
        members: []
      });
      setIsFormModified(false);
    } else {
      navigate(getGroupsTabPath());
    }
    setConfirmOpen(false);
  };

  const handleConfirmNo = () => {
    setConfirmOpen(false);
  };

  const handleInputChange = (field: keyof GroupFormData, value: string | string[]) => {
    // Prevent changes to groupName when in edit mode (read-only)
    if (field === 'groupName' && isEditMode) {
      return;
    }
    
    if (field === 'groupOwner') {
      // Convert selected name to user ID
      const userId = userMapByName.get(value as string);
      const newOwnerId = userId ? String(userId) : '';
      
      setFormData(prev => {
        // Remove old owner from members if they were in the list
        let updatedMembers = prev.members.filter(id => id !== prev.groupOwner);
        
        // Add new owner to members if not already present
        if (newOwnerId && !updatedMembers.includes(newOwnerId)) {
          updatedMembers = [...updatedMembers, newOwnerId];
        }
        
        return {
          ...prev,
          [field]: newOwnerId,
          members: updatedMembers
        };
      });
    } else if (field === 'members') {
      // Convert selected names to user IDs
      const memberIds = (value as string[]).map(name => {
        // Remove "(Owner)" suffix if present for mapping
        const cleanName = name.replace(' (Owner)', '');
        const userId = memberMapByName.get(cleanName) ?? memberMapByName.get(name);
        return userId ? String(userId) : '';
      }).filter(id => id !== '');
      
      setFormData(prev => {
        // Ensure owner is always in the members list
        const ownerId = prev.groupOwner;
        let finalMembers = memberIds;
        
        if (ownerId && !finalMembers.includes(ownerId)) {
          finalMembers = [...finalMembers, ownerId];
        }
        
        return {
          ...prev,
          [field]: finalMembers
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    setIsFormModified(true);
  };

  // Prepare group data for API (shared between save and submit)
  const prepareGroupFormData = (): {
    name: string;
    description: string;
    owner_user_id: string;
    members: string[];
    isactive: boolean;
    id?: string;
  } => ({
    name: formData.groupName,
    description: formData.description,
    owner_user_id: formData.groupOwner,
    members: formData.members,
    isactive: isEditMode ? groupIsActive : true,
    ...(isEditMode && groupId ? { id: groupId } : {})
  });

  // Shared logic for saving/updating group
  const saveGroupData = async (): Promise<void> => {
    const groupFormData = prepareGroupFormData();
    
    let result;
    if (isEditMode) {
      result = await dispatch(updateGroup(groupFormData) as any);
    } else {
      result = await dispatch(createGroup(groupFormData) as any);
    }
    
    // Check if the action was rejected
    if (result.type?.endsWith('/rejected')) {
      const errorMessage = result.payload || result.error?.message || 'Failed to save group';
      throw new Error(errorMessage);
    }
    
    setIsFormModified(false);
  };

  const handleSave = async () => {
    if (!isFormValid()) {
      return;
    }

    try {
      await saveGroupData();
      console.log(`Group ${isEditMode ? 'updated' : 'saved'} successfully`);
    } catch (error: any) {
      const errorMessage = error?.message || groupsError || `Failed to ${isEditMode ? 'update' : 'save'} group. Please try again.`;
      console.error(`Error ${isEditMode ? 'updating' : 'saving'} group:`, errorMessage);
      alert(errorMessage);
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      return;
    }

    try {
      await saveGroupData();
      navigate(getGroupsTabPath());
    } catch (error: any) {
      const errorMessage = error?.message || groupsError || `Failed to ${isEditMode ? 'update' : 'create'} group. Please try again.`;
      console.error(`Error ${isEditMode ? 'updating' : 'submitting'} group:`, errorMessage);
      alert(errorMessage);
    }
  };

  const isFormValid = () => {
    return formData.groupName.trim() !== '' && 
           formData.description.trim() !== '' && 
           formData.groupOwner !== '' && 
           formData.members.length > 0;
  };

  // Detect if running in admin app context
  const isAdminApp = window.location.pathname.includes('/admin');

  return (
    <Box
      className={`user-create-form ${isAdminApp ? 'admin-app-context' : ''}`}
      sx={{
        ...userFormStyles.container,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
        width: '100%',
        // Additional styles for admin app context
        ...(isAdminApp && {
          height: '100%',
          maxHeight: '100%',
          position: 'relative',
        }),
      }}
    >
      {/* Header */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1000,
          backgroundColor: '#fff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          width: '100%',
          height: '40px',
          minHeight: '40px',
          flexShrink: 0,
          borderBottom: '1px solid #e0e0e0',
          ...(isAdminApp && {
            position: 'sticky',
            top: 0,
            zIndex: 1001,
          }),
        }}
      >
        <FormHeaderBase
          title={isEditMode ? "Edit Group" : "Create Group"}
          onBack={handleBack}
          onReset={handleReset}
          onCancel={handleCancel}
          onSave={handleSave}
          onNext={handleSubmit}
          isFormModified={isFormModified}
          isSaveDisabled={true}
          isNextDisabled={!isFormValid() || groupsLoading || isLoadingGroup}
          showSaveButton={true}
          showNextButton={true}
          useSubmitIcon={true}
          submitButtonText="Submit"
          isSaveLoading={groupsLoading || isLoadingGroup}
        />
      </Box>

      {/* Scrollable Content Container */}
      <Box
        className={isAdminApp ? 'user-create-scrollable' : ''}
        sx={{
          ...userFormStyles.scrollableContent,
          flex: '1 1 auto',
          overflowY: 'auto',
          overflowX: 'hidden',
          height: 'calc(100% - 40px)',
          minHeight: 0, // Important for flex scrolling to work
          // Additional styles for admin app context
          ...(isAdminApp && {
            height: 'calc(100% - 40px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            minHeight: 0,
          }),
        }}
      >
        {isLoadingGroup ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography>Loading group data...</Typography>
          </Box>
        ) : (
        <Container 
          maxWidth={false} 
          sx={{ 
            maxWidth: '100% !important',
            width: '100% !important',
            margin: '0 !important',
            padding: '12px !important',
            boxSizing: 'border-box !important',
            mt: '12px !important', 
            alignItems: 'stretch',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Form Content */}
          <Box
            className="group-create-form"
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              padding: '0px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            {/* Single form section containing both Basic Details and Group Ownership & Members */}
            <Box sx={{ ...userFormStyles.formSection, padding: '12px !important' }}>
              {/* Basic Details Section */}
              <Box sx={{ ...getFlexBetweenContainerStyles(), mb: 1.5 }}>
                <SectionTitle>
                  Basic Details
                </SectionTitle>
              </Box>
              
              {/* Group Name and Description in same row */}
              <Box sx={{ ...userFormStyles.formRow, mb: 1.75 }}>
                <ReusableTextField
                  key={`groupName-${isEditMode ? 'edit' : 'create'}`}
                  field="groupName"
                  label="Group Name"
                  placeholder="Group Name"
                  value={formData.groupName}
                  onChange={(value) => handleInputChange('groupName', value)}
                  required={!isEditMode}
                  readOnly={isEditMode}
                  disabled={false}
                />
                <ReusableTextField
                  field="description"
                  label="Description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={(value) => handleInputChange('description', value)}
                  required={true}
                />
              </Box>

              {/* Horizontal Divider */}
              <Box sx={getHorizontalDividerStyles()} />

              {/* Group Ownership & Members Section */}
              <Box sx={{ ...getFlexBetweenContainerStyles(), mb: 1.5 }}>
                <SectionTitle>
                  Group Ownership & Members
                </SectionTitle>
              </Box>
              
              {/* Group Owner and Select Members in same row */}
              <Box sx={{ ...userFormStyles.formRow, mb: 1.75 }}>
                <ReusableSelectField
                  field="groupOwner"
                  label="Group Owner"
                  options={groupOwnerOptions}
                  placeholder="Select Group Owner"
                  value={selectedOwnerName}
                  onChange={(value) => handleInputChange('groupOwner', value)}
                  required={true}
                />
                <ReusableMultiSelectField
                  field="members"
                  label="Select Members"
                  options={membersOptions}
                  placeholder="Select Members"
                  value={formData.members.map(id => {
                    const user = activeUsers.find(u => String(u.id) === id);
                    if (!user) return '';
                    const fullName = getUserFullName(user);
                    // Show "(Owner)" suffix if this member is the owner
                    if (formData.groupOwner && String(user.id) === formData.groupOwner) {
                      return `${fullName} (Owner)`;
                    }
                    return fullName;
                  }).filter(name => name !== '')}
                  onChange={(value) => handleInputChange('members', value)}
                  required={true}
                />
              </Box>
            </Box>
          </Box>
        </Container>
        )}
      </Box>

      {/* Confirmation Dialog */}
      <NotificationAlert
        open={confirmOpen}
        variant="warning"
        title="Warning – Action Required"
        message={confirmMessage}
        onClose={handleConfirmNo}
        actions={[
          { label: 'No', onClick: handleConfirmNo, emphasis: 'secondary' },
          { label: 'Yes', onClick: handleConfirmYes, emphasis: 'primary' },
        ]}
      />
    </Box>
  );
};

export default GroupCreateForm;

