import React, { useMemo, Suspense, useEffect } from 'react';
import { Box } from '@mui/material';
import PermissionsTabLayout from '../userManagement/PermissionsTabLayout';
import { ReusableTextField, ReusableMultiSelectField, SectionTitle } from '../userManagement/UserFormComponents';
import type { RoleFormData } from '../../types/RoleFormData';
import type { UserFormData } from '../../types/UserFormData';
import { getReadOnlyFormStyles } from '../userView/ReadOnlyFormStyles';
import { getUserFormStyles, getHorizontalDividerStyles } from '../userManagement/PermissionTableConstants';
import { parseArrayData, parsePermissionsData } from '../../utils/userFormUtils';
import ViewPanelHeader from '../shared/ViewPanelHeader';
import { getRoleViewPermissionsStyles } from '../../utils/sharedViewStyles';
import StatusRadioButtons from '../shared/StatusRadioButtons';

interface RoleViewPanelProps {
  open: boolean;
  onClose: () => void;
  selectedRole: any;
}

const RoleViewPanel: React.FC<RoleViewPanelProps> = ({ open, onClose, selectedRole }) => {
  const userFormStyles = getUserFormStyles();

  // Convert selected role to RoleFormData format for read-only display
  const roleFormData: RoleFormData = useMemo(() => {
    if (!selectedRole) {
      return {
        roleName: '',
        department: '',
        roleDescription: '',
        status: 'Active',
        parentAttribute: [],
        permissions: {
          enabledModules: [],
          selectedPermissions: [],
          activeModule: null,
          activeSubmodule: null
        }
      };
    }

    // Parse parent attribute (can be JSON string or array)
    const parentAttribute = parseArrayData(selectedRole.parentattribute);
    
    // Parse permissions (can be JSON string or object)
    const permissions = parsePermissionsData(selectedRole.permissions);

    return {
      id: selectedRole.id,
      roleName: selectedRole.rolename || '',
      department: selectedRole.department || '',
      roleDescription: selectedRole.roledescription || '',
      status: (selectedRole.status === 'Active' || selectedRole.status === 'Inactive') ? selectedRole.status : 'Active',
      parentAttribute: Array.isArray(parentAttribute) ? parentAttribute : [],
      permissions: {
        enabledModules: permissions?.enabledModules || [],
        selectedPermissions: permissions?.selectedPermissions || [],
        activeModule: permissions?.activeModule || null,
        activeSubmodule: permissions?.activeSubmodule || null
      }
    };
  }, [selectedRole]);

  // Convert RoleFormData to UserFormData format for PermissionsTabLayout
  // PermissionsTabLayout expects UserFormData but we only need permissions, so we provide empty arrays for access scope fields
  const userFormDataForPermissions: UserFormData = useMemo(() => {
    return {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      role: '',
      department: roleFormData.department || '',
      emailId: '',
      selfReporting: false,
      reportingManager: '',
      dottedLineManager: '',
      regions: [],
      countries: [],
      divisions: [],
      groups: [],
      departments: [],
      classes: [],
      subClasses: [],
      permissions: roleFormData.permissions
    };
  }, [roleFormData]);

  // Create options arrays with current values for read-only display
  const parentAttributeOptions = [
    'Region',
    'Country',
    'Division',
    'Group',
    'Department',
    'Class',
    'Sub Class'
  ];

  // Mock functions for read-only mode
  const mockOnInputChange = () => {
    // Do nothing - read-only mode
  };

  const mockGetErrorProps = () => ({
    error: false,
    errorMessage: ''
  });

  // Hide tooltips for chip delete icons in Parent Attribute field
  useEffect(() => {
    if (!open) return;

    const hideTooltips = () => {
      // Find all tooltips that contain "Cancel" text (from chip delete icons)
      const tooltips = document.querySelectorAll('.MuiTooltip-tooltip');
      tooltips.forEach((tooltip) => {
        const tooltipText = tooltip.textContent?.trim();
        if (tooltipText === 'Cancel') {
          const popper = tooltip.closest('.MuiTooltip-popper');
          if (popper) {
            (popper as HTMLElement).style.display = 'none';
            (popper as HTMLElement).style.visibility = 'hidden';
            (popper as HTMLElement).style.opacity = '0';
          }
        }
      });
    };

    // Hide tooltips immediately
    hideTooltips();

    // Use MutationObserver to watch for tooltip appearance
    const observer = new MutationObserver(hideTooltips);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    return () => {
      observer.disconnect();
    };
  }, [open]);

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
      {/* Header with Details text and close button */}
      <ViewPanelHeader
        title="Details"
        onClose={onClose}
      />

      {/* Main content area with scrollbars - FORCE SCROLLING */}
      <Box 
        component="div"
        sx={{
          flex: 1,
          position: 'absolute',
          top: '50px',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#fafafa',
          overflowY: 'auto !important',
          overflowX: 'hidden !important',
          padding: '16px 24px 24px 16px',
          WebkitOverflowScrolling: 'touch',
          // Force scrolling to work
          height: 'calc(100% - 50px) !important',
          maxHeight: 'calc(100% - 50px) !important',
          // Additional force scrolling properties
          overscrollBehavior: 'contain',
          willChange: 'scroll-position',
        }}
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          height: 'calc(100% - 50px)',
          maxHeight: 'calc(100% - 50px)',
        } as React.CSSProperties}
      >
        <Suspense fallback={null}>
          {/* White background container with all content */}
          <Box sx={{
            backgroundColor: '#ffffff',
            borderRadius: '4px',
            padding: '12px',
            width: '100%',
            boxSizing: 'border-box',
            minHeight: 'fit-content', // Allow content to determine height
            ...getReadOnlyFormStyles(true, false),
            // Fix cursor and tooltip for Parent Attribute chips
            '& .form-field__chips-container .form-field__chip-delete-icon': {
              cursor: 'default !important',
              pointerEvents: 'none !important',
              '&:hover': {
                cursor: 'default !important',
              }
            },
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
            },
            // Style selected radio button with duplicate button color (rgba(120, 172, 244, 1))
            // Target CustomRadio checked state - override the custom-radio__checked class
            // Only style the radio button itself, not the label text
            '& .custom-radio__checked': {
              color: 'rgba(120, 172, 244, 1) !important',
              border: '4px solid rgba(120, 172, 244, 1) !important',
              backgroundColor: 'rgba(255, 255, 255, 1) !important',
              '& .MuiSvgIcon-root': {
                color: 'rgba(255, 255, 255, 1) !important',
                backgroundColor: 'rgba(120, 172, 244, 1) !important',
              }
            },
            // Also target Mui-checked class for Material-UI radio
            '& .MuiRadio-root.Mui-checked': {
              color: 'rgba(120, 172, 244, 1) !important',
            },
            '& .MuiRadio-root.Mui-checked .MuiSvgIcon-root': {
              color: 'rgba(120, 172, 244, 1) !important',
            }
          }}>
              {/* Basic Details Section */}
              <Box sx={{ mb: 3 }}>
                <SectionTitle>Basic Details</SectionTitle>
                <Box sx={{ ...userFormStyles.formRow, flexWrap: 'nowrap', display: 'flex', gap: '14px' }}>
                  <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
                    <ReusableTextField
                      field="roleName"
                      label="Role Name"
                      placeholder="Role Name"
                      value={roleFormData.roleName}
                      onChange={mockOnInputChange}
                      readOnly={true}
                      {...mockGetErrorProps()}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
                    <ReusableTextField
                      field="department"
                      label="Department"
                      placeholder="Department"
                      value={roleFormData.department}
                      onChange={mockOnInputChange}
                      readOnly={true}
                      {...mockGetErrorProps()}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
                    <ReusableTextField
                      field="roleDescription"
                      label="Role Description"
                      placeholder="Role Description"
                      value={roleFormData.roleDescription}
                      onChange={mockOnInputChange}
                      readOnly={true}
                      {...mockGetErrorProps()}
                    />
                  </Box>
                </Box>
              </Box>

            {/* Additional Details Section */}
            <Box sx={{ mb: 3 }}>
              <SectionTitle>Additional Details</SectionTitle>
              <Box sx={{ ...userFormStyles.formRow, flexWrap: 'nowrap', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                {/* Status Radio Buttons */}
                <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
                  <StatusRadioButtons
                    value={roleFormData.status}
                    disabled={true}
                    labelColor="#9E9E9E"
                  />
                </Box>

                {/* Parent Attribute Dropdown - aligned with Department */}
                <Box sx={{ 
                  flex: '1 1 0', 
                  minWidth: 0,
                  // Fix cursor and tooltip for chips in Parent Attribute field
                  '& .form-field__chips-container': {
                    '& .MuiChip-root': {
                      cursor: 'default !important',
                      '& .MuiChip-label': {
                        cursor: 'default !important',
                      },
                      '& .form-field__chip-delete-icon': {
                        cursor: 'default !important',
                        pointerEvents: 'none !important',
                      }
                    }
                  },
                  // Hide tooltip for chip delete icons
                  '& .MuiTooltip-popper': {
                    display: 'none !important',
                  },
                  // Also target tooltip wrapper directly
                  '& [role="tooltip"]': {
                    display: 'none !important',
                  }
                }}>
                  <ReusableMultiSelectField
                    field="parentAttribute"
                    label="Parent Attribute"
                    options={parentAttributeOptions}
                    placeholder="Select Parent Attribute"
                    value={roleFormData.parentAttribute}
                    onChange={mockOnInputChange}
                    disabled={true}
                    {...mockGetErrorProps()}
                  />
                </Box>

                {/* Empty spacer to maintain alignment with Role Description column */}
                <Box sx={{ flex: '1 1 0', minWidth: 0 }} />
              </Box>

              {/* Horizontal Divider */}
              <Box sx={getHorizontalDividerStyles()} />
            </Box>

            {/* Permissions Table Section */}
            <Box sx={{
              ...getReadOnlyFormStyles(false, true),
              ...getRoleViewPermissionsStyles()
            }}>
              <PermissionsTabLayout
                formData={userFormDataForPermissions}
                onInputChange={mockOnInputChange}
                isReadOnly={true}
              />
            </Box>
          </Box>
        </Suspense>
      </Box>
    </Box>
  );
};

export default RoleViewPanel;

