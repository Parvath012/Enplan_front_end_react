import React, { useMemo, useState, Suspense } from 'react';
import { Box } from '@mui/material';
import PermissionsTabLayout from '../userManagement/PermissionsTabLayout';
import UserDetailsForm from '../userManagement/UserDetailsForm';
import type { UserFormData } from '../../types/UserFormData';
import { convertSelfReportingToBoolean } from '../../utils/userFormUtils';
import TabButton from './TabButton';
import { getReadOnlyFormStyles } from './ReadOnlyFormStyles';
import ViewPanelHeader from '../shared/ViewPanelHeader';
import { getUserViewPermissionsStyles } from '../../utils/sharedViewStyles';

interface UserViewPanelProps {
  open: boolean;
  onClose: () => void;
  selectedUser: any;
}

const UserViewPanel: React.FC<UserViewPanelProps> = ({ open, onClose, selectedUser }) => {
  const [activeTab, setActiveTab] = useState(1); // Start with Permissions tab as default

  const closeAndReset = () => {
    setActiveTab(1); // Reset to Permissions tab when closing
    onClose();
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Convert selected user to UserFormData format for read-only display
  const userFormData: UserFormData = useMemo(() => {
    if (!selectedUser) {
      return {
        firstName: '',
        lastName: '',
        phoneNumber: '',
        role: '',
        department: '',
        emailId: '',
        reportingManager: '',
        dottedLineManager: '',
        selfReporting: false,
        regions: [],
        countries: [],
        divisions: [],
        groups: [],
        departments: [],
        classes: [],
        subClasses: [],
        permissions: {
          enabledModules: [],
          selectedPermissions: [],
          activeModule: null,
          activeSubmodule: null
        }
      };
    }

    // Parse JSON fields
    const parseJsonField = (field: unknown): string[] => {
      if (!field) return [];
      try {
        const parsed = typeof field === 'string' ? JSON.parse(field) : field;
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    // Parse permissions
    const parsePermissions = (permissions: unknown) => {
      if (!permissions) return {
        enabledModules: [],
        selectedPermissions: [],
        activeModule: null,
        activeSubmodule: null
      };
      try {
        const parsed = typeof permissions === 'string' ? JSON.parse(permissions) : permissions;
        return {
          enabledModules: parsed?.enabledModules || [],
          selectedPermissions: parsed?.selectedPermissions || [],
          activeModule: parsed?.activeModule || null,
          activeSubmodule: parsed?.activeSubmodule || null
        };
      } catch {
        return {
          enabledModules: [],
          selectedPermissions: [],
          activeModule: null,
          activeSubmodule: null
        };
      }
    };

    return {
      firstName: selectedUser.firstname || '',
      lastName: selectedUser.lastname || '',
      phoneNumber: selectedUser.phonenumber || '',
      role: selectedUser.role || '',
      department: selectedUser.department || '',
      emailId: selectedUser.emailid || '',
      reportingManager: selectedUser.reportingmanager || '',
      dottedLineManager: selectedUser.dottedorprojectmanager || '',
      selfReporting: convertSelfReportingToBoolean(selectedUser.selfreporting),
      regions: parseJsonField(selectedUser.regions),
      countries: parseJsonField(selectedUser.countries),
      divisions: parseJsonField(selectedUser.divisions),
      groups: parseJsonField(selectedUser.groups),
      departments: parseJsonField(selectedUser.departments),
      classes: parseJsonField(selectedUser.class),
      subClasses: parseJsonField(selectedUser.subClass),
      permissions: parsePermissions(selectedUser.permissions)
    };
  }, [selectedUser]);

  // Create options arrays with current values for read-only display
  // Since it's view-only mode, we only need the current values for proper display
  const rolesOptions = userFormData.role ? [userFormData.role] : [];
  const departmentsOptions = userFormData.department ? [userFormData.department] : [];
  const reportingUsersOptions = [
    ...(userFormData.reportingManager ? [userFormData.reportingManager] : []),
    ...(userFormData.dottedLineManager ? [userFormData.dottedLineManager] : [])
  ];

  // Mock functions for read-only mode
  const mockOnInputChange = () => {
    // Do nothing - read-only mode
  };

  const mockGetErrorProps = () => ({
    error: false,
    errorMessage: ''
  });

  if (!open) return null;

  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header with Details text and tabs */}
      <ViewPanelHeader
        title="Details"
        onClose={closeAndReset}
        tabs={[
          { label: 'User Details', value: 0 },
          { label: 'Permissions', value: 1 }
        ]}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        TabButtonComponent={TabButton}
      />

      {/* Main content area with scrollbars */}
      <Box sx={{
        flex: 1,
        position: 'relative',
        backgroundColor: '#fafafa',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: (() => {
          if (activeTab === 1) return '12px 24px 20px 16px';
          if (activeTab === 0) return '16px 24px 24px 16px';
          return '24px';
        })(), // Increase bottom padding for permissions tab
        minHeight: 0, // Important for flex scrolling
        display: 'flex',
        flexDirection: 'column',
      }}>
        {activeTab === 0 && (
          <Suspense fallback={null}>
            <Box sx={{ 
              marginTop: '-8px', // Small gap adjustment
              ...getReadOnlyFormStyles(true, false),
              // Match checkbox color with Permissions tab checkboxes
              '& .MuiCheckbox-root': {
                '&.Mui-checked': {
                  color: 'rgba(120, 172, 244, 1) !important'
                },
                // Override CustomCheckbox checked icon to match Permissions tab checkbox color
                '&.Mui-checked .custom-checkbox-icon.checked': {
                  border: '1px solid rgba(120, 172, 244, 1) !important',
                  backgroundColor: 'rgba(120, 172, 244, 1) !important'
                }
              }
            }}>
              <UserDetailsForm
                formData={userFormData}
                onInputChange={mockOnInputChange}
                getErrorProps={mockGetErrorProps}
                dummyRoles={rolesOptions}
                dummyDepartments={departmentsOptions}
                reportingUsersOptions={reportingUsersOptions}
                isReadOnly={true}
              />
            </Box>
          </Suspense>
        )}
        {activeTab === 1 && (
          <Suspense fallback={null}>
            <Box sx={{
              ...getReadOnlyFormStyles(false, true),
              ...getUserViewPermissionsStyles()
            }}>
              <PermissionsTabLayout
                formData={userFormData}
                onInputChange={mockOnInputChange}
                isReadOnly={true}
              />
            </Box>
          </Suspense>
        )}
      </Box>
    </Box>
  );
};

export default UserViewPanel;


