import React, { useEffect, useMemo, useRef } from 'react';
import { Box } from '@mui/material';
import { AgGridReact } from 'ag-grid-react';
import AgGridShell from 'commonApp/AgGridShell';
import ToggleSwitch from 'commonApp/ToggleSwitch';
import CustomCheckbox from 'commonApp/CustomCheckbox';
import ModuleIcon from '../userManagement/ModuleIcons';
import { useModulePermissions } from '../../hooks/useModulePermissions';
import PermissionsActionButtons from '../shared/PermissionsActionButtons';
import PermissionsSectionHeader from '../shared/PermissionsSectionHeader';
import { 
  usePermissionState, 
  resetPermissionState, 
  checkPermissionChanges 
} from '../../utils/permissionUtils';
import {
  getBaseCellStyles,
  getBaseSpanStyles,
  getCellContentStyles,
  getPlaceholderCellStyles,
  getCheckboxStyles,
  getModuleHeaderContainerStyles,
  getModuleIconContainerStyles
} from '../userManagement/PermissionTableConstants';
import { createGridIcons } from '../../constants/userListConstants';
import type { RoleFormData } from '../../types/RoleFormData';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

ModuleRegistry.registerModules([AllCommunityModule]);


interface RolePermissionsTableProps {
  formData: RoleFormData;
  onInputChange: (field: keyof RoleFormData, value: any) => void;
  resetTrigger?: number;
  isReadOnly?: boolean;
  onDuplicateClick?: () => void;
  onResetReady?: (resetFn: () => void) => void; // Callback to expose reset function to parent
  onPermissionChangesChange?: (hasChanges: boolean) => void; // Callback to notify parent of permission changes
}

// Factory function to create module cell renderer
const createModuleCellRenderer = (
  activeModule: string | null,
  handleModuleClick: (module: string) => void,
  handleModuleToggle: (module: string) => void,
  isReadOnly: boolean
) => {
  return (params: any) => {
    const moduleName = params.data.module;
    const isModuleEnabled = params.data.isModuleEnabled;
    const isExtraRow = params.data.isExtraRow;
    
    if (isExtraRow || !moduleName) {
      return (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#ffffff'
        }} />
      );
    }
    
    const isActive = activeModule === moduleName;

    return (
      <Box
        onClick={() => handleModuleClick(moduleName)}
        sx={{
          ...getBaseCellStyles('100%', isActive ? '#e3f2fd' : '#ffffff'),
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: isActive ? '#e3f2fd' : '#ffffff',
          color: '#5F6368',
          opacity: 1,
          filter: 'none',
          ...(isActive && {
            borderColor: '#e3f2fd',
            boxShadow: 'none',
            color: '#5F6368',
            '& span': {
              color: '#5F6368'
            }
          }),
          '&:hover': {
            backgroundColor: '#e3f2fd',
            borderColor: '#e3f2fd',
            opacity: 1,
            filter: 'none',
            color: '#5F6368',
            '& span': {
              color: '#5F6368'
            }
          },
          '& span': {
            color: '#5F6368'
          }
        }}
      >
        <Box sx={{
          ...getModuleHeaderContainerStyles(),
          justifyContent: 'space-between',
          width: '100%',
          paddingLeft: '12px',
          paddingRight: '12px'
        }}>
          <Box sx={getModuleIconContainerStyles()}>
            <ModuleIcon moduleName={moduleName} />
            <span style={getBaseSpanStyles()}>{moduleName}</span>
          </Box>
          <Box 
            sx={{ display: 'inline-block', flexShrink: 0 }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            <ToggleSwitch
              isOn={isModuleEnabled}
              handleToggle={() => {
                handleModuleToggle(moduleName);
              }}
              disabled={isReadOnly}
              showPointerOnDisabled={true}
            />
          </Box>
        </Box>
      </Box>
    );
  };
};

// Factory function to create submodule cell renderer
const createSubmoduleCellRenderer = (
  activeModule: string | null,
  activeSubmodule: string | null,
  enabledModules: Set<string>,
  modulesData: any,
  handleSubmoduleClick: (module: string, submodule: string) => void
) => {
  return (params: any) => {
    const rowIndex = params.node.rowIndex;
    const isExtraRow = params.data.isExtraRow;
    
    if (isExtraRow) {
      return (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#ffffff'
        }} />
      );
    }
    
    if (!activeModule) {
      return (
        <Box sx={{
          ...getPlaceholderCellStyles(),
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Box sx={getCellContentStyles()}>
            <span style={getBaseSpanStyles()}>Sub Module</span>
          </Box>
        </Box>
      );
    }

    const activeModuleData = modulesData?.[activeModule];
    const isModuleEnabled = enabledModules.has(activeModule);

    if (!isModuleEnabled || !activeModuleData?.submodules || Object.keys(activeModuleData.submodules).length === 0) {
      return (
        <Box sx={{
          ...getPlaceholderCellStyles(),
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Box sx={getCellContentStyles()}>
            <span style={getBaseSpanStyles()}>Sub Module</span>
          </Box>
        </Box>
      );
    }

    const submodules = Object.keys(activeModuleData.submodules);
    
    if (rowIndex >= submodules.length) {
      return (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#ffffff'
        }} />
      );
    }

    const subModuleName = submodules[rowIndex];
    const isActive = activeSubmodule === `${activeModule}-${subModuleName}`;

    return (
      <Box
        onClick={() => handleSubmoduleClick(activeModule, subModuleName)}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          background: 'inherit',
          backgroundColor: isActive ? '#e8f5e8' : '#ffffff',
          boxSizing: 'border-box',
          borderWidth: '0px',
          borderStyle: 'none',
          borderColor: 'transparent',
          borderLeft: '0px',
          borderTop: '0px',
          borderRight: '0px',
          borderRadius: '0px',
          boxShadow: 'none',
          fontFamily: "'InterTight-Regular_Medium', 'Inter Tight Medium', 'Inter Tight', sans-serif",
          fontWeight: 500,
          fontStyle: 'normal',
          fontSize: '12px',
          color: '#5F6368',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          '&:hover': {
            backgroundColor: 'rgba(242, 242, 240, 1)',
            color: '#5F6368',
            '& span': {
              color: '#5F6368'
            }
          },
          ...(isActive && {
            backgroundColor: 'rgba(242, 242, 240, 1)',
            borderColor: 'transparent',
            boxShadow: 'none',
            color: '#5F6368',
            '& span': {
              color: '#5F6368'
            }
          })
        }}
      >
        <Box sx={getCellContentStyles()}>
          <span style={{
            ...getBaseSpanStyles(),
            fontFamily: "'InterTight-Regular_Medium', 'Inter Tight Medium', 'Inter Tight', sans-serif",
            fontWeight: 500,
            fontStyle: 'normal',
            fontSize: '12px',
            color: '#5F6368',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale'
          }}>{subModuleName}</span>
        </Box>
      </Box>
    );
  };
};

// Options interface for permissions cell renderer
interface PermissionsCellRendererOptions {
  activeSubmodule: string | null;
  enabledModules: Set<string>;
  selectedPermissions: Set<string>;
  modulesData: any;
  getPermissionsWithExtra: (module: string, submodule: string) => string[];
  handleSelectAllPermissions: (module: string, submodule: string) => void;
  handlePermissionToggle: (module: string, submodule: string, permission: string) => void;
  isReadOnly: boolean;
}

// Factory function to create permissions cell renderer
const createPermissionsCellRenderer = (options: PermissionsCellRendererOptions) => {
  const {
    activeSubmodule,
    enabledModules,
    selectedPermissions,
    modulesData,
    getPermissionsWithExtra,
    handleSelectAllPermissions,
    handlePermissionToggle,
    isReadOnly
  } = options;
  return (params: any) => {
    const rowIndex = params.node.rowIndex;
    
    if (!activeSubmodule) {
      return (
        <Box sx={{
          ...getPlaceholderCellStyles(),
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Box sx={getCellContentStyles()}>
            <span style={getBaseSpanStyles()}>Permission</span>
          </Box>
        </Box>
      );
    }

    const [activeModuleName, activeSubmoduleName] = activeSubmodule.split('-');
    const activeModuleData = modulesData?.[activeModuleName];
    const isModuleEnabled = enabledModules.has(activeModuleName);

    if (!activeModuleData?.submodules?.[activeSubmoduleName] || !isModuleEnabled) {
      return (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#ffffff'
        }} />
      );
    }

    const permissions = getPermissionsWithExtra(activeModuleName, activeSubmoduleName);
    if (!Array.isArray(permissions) || permissions.length === 0) {
      return (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#ffffff'
        }} />
      );
    }

    const key = activeSubmodule;
    const currentPermissions = Array.from(selectedPermissions).filter(perm =>
      perm.startsWith(`${key}-`)
    );
    const isAllSelected = currentPermissions.length === permissions.length && permissions.length > 0;

    if (rowIndex === 0 && isModuleEnabled) {
      return (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          paddingLeft: '12px',
          paddingRight: '12px'
        }}>
          <CustomCheckbox
            checked={isAllSelected}
            onChange={() => handleSelectAllPermissions(activeModuleName, activeSubmoduleName)}
            label="Select All"
            disabled={isReadOnly}
            sx={{
              ...getCheckboxStyles(),
              '& .MuiFormControlLabel-label': {
                color: '#5F6368',
                '&:hover': {
                  color: '#5F6368'
                }
              },
              '& .MuiCheckbox-root': {
                padding: '4px',
                '& .custom-checkbox-icon': {
                  display: 'inline-block !important',
                  visibility: 'visible !important',
                  opacity: '1 !important'
                },
                '& .custom-checkbox-icon.unchecked': {
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  border: '1px solid #6c757d',
                  backgroundColor: '#fff',
                  boxSizing: 'border-box'
                }
              }
            }}
          />
        </Box>
      );
    }

    const permissionIndex = rowIndex - 1;
    
    if (permissionIndex < 0 || permissionIndex >= permissions.length) {
      return (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#ffffff'
        }} />
      );
    }

    const permission = permissions[permissionIndex];
    const isChecked = selectedPermissions.has(`${key}-${permission}`);

    return (
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingLeft: '12px',
        paddingRight: '12px'
      }}>
        <CustomCheckbox
          checked={isChecked}
          onChange={() => handlePermissionToggle(activeModuleName, activeSubmoduleName, permission)}
          label={permission}
          disabled={isReadOnly || !isModuleEnabled}
          sx={{
            '& .MuiFormControlLabel-label': {
              fontFamily: "'InterTight-Regular_Medium', 'Inter Tight Medium', 'Inter Tight', sans-serif",
              fontWeight: 500,
              fontStyle: 'normal',
              fontSize: '12px',
              color: '#5F6368',
              marginLeft: '8px',
              wordBreak: 'break-word',
              '&:hover': {
                color: '#5F6368'
              }
            },
            '& .MuiCheckbox-root': {
              padding: '4px',
              '& .custom-checkbox-icon': {
                display: 'inline-block !important',
                visibility: 'visible !important',
                opacity: '1 !important'
              },
              '& .custom-checkbox-icon.unchecked': {
                width: '18px',
                height: '18px',
                borderRadius: '4px',
                border: '1px solid #6c757d',
                backgroundColor: '#fff',
                boxSizing: 'border-box'
              }
            }
          }}
        />
      </Box>
    );
  };
};


const RolePermissionsTable: React.FC<RolePermissionsTableProps> = ({
  formData,
  onInputChange,
  resetTrigger,
  isReadOnly = false,
  onDuplicateClick,
  onResetReady,
  onPermissionChangesChange
}) => {
  const { modulesData, loading, error } = useModulePermissions();
  const gridRef = useRef<AgGridReact<any>>(null);
  const columnScrollPositionsRef = useRef<{ [key: number]: number }>({ 0: 0, 1: 0, 2: 0 });
  const previousModuleCountRef = useRef<number>(0);
  const isTogglingRef = useRef<boolean>(false);
  const isUpdatingRef = useRef<boolean>(false); // Track if an update is in progress
  const pendingUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Track pending onInputChange calls
  const isClickingSubmoduleRef = useRef<boolean>(false); // Track when clicking submodule to preserve module scroll
  const isClickingModuleRef = useRef<boolean>(false); // Track when clicking module to preserve module scroll
  const previousFormDataPermissionsRef = useRef<string>(''); // Track previous formData.permissions to detect external changes
  const moduleScrollLockedRef = useRef<boolean>(false); // Track if module scroll should be locked

  // Create grid icons for sorting (blue icons matching RolesList)
  const gridIcons = useMemo(() => createGridIcons(), []);

  // Interactive state for modules, submodules, and permissions
  const {
    enabledModules,
    setEnabledModules,
    selectedPermissions,
    setSelectedPermissions,
    activeModule,
    setActiveModule,
    activeSubmodule,
    setActiveSubmodule,
    initialPermissionState,
    setInitialPermissionState,
    hasPermissionChanges,
    setHasPermissionChanges
  } = usePermissionState();

  // Initialize permission state when modules data is loaded (only once)
  useEffect(() => {
    if (modulesData && Object.keys(modulesData).length > 0 && !initialPermissionState) {
      const moduleKeys = Object.keys(modulesData);
      const existingPermissions = formData.permissions;

      // Check if we're in edit mode by checking if formData has an id
      // If id exists, it's edit mode - use existing permissions (even if empty arrays means all modules OFF)
      // If id doesn't exist, it's create mode - enable all modules by default
      const isEditMode = formData.id !== undefined && formData.id !== null;

      if (isEditMode) {
        // Edit mode - use existing permissions (even if empty arrays means all modules OFF)
        const initEnabled = new Set(existingPermissions?.enabledModules || []);
        const initSelected = new Set(existingPermissions?.selectedPermissions || []);
        
        setEnabledModules(initEnabled);
        setSelectedPermissions(initSelected);
        setActiveModule(existingPermissions?.activeModule ?? null);
        setActiveSubmodule(existingPermissions?.activeSubmodule ?? null);

        setInitialPermissionState({
          enabledModules: new Set(initEnabled),
          selectedPermissions: new Set(initSelected),
          activeModule: existingPermissions?.activeModule ?? null,
          activeSubmodule: existingPermissions?.activeSubmodule ?? null
        });
      } else {
        // New form - enable all modules by default
        const allModulesSet = new Set(moduleKeys);
        const emptySelected = new Set<string>();
        const enabledModulesArray = Array.from(allModulesSet);
        const selectedPermissionsArray = Array.from(emptySelected);
        
        setEnabledModules(allModulesSet);
        setSelectedPermissions(emptySelected);
        setActiveModule(null);
        setActiveSubmodule(null);

        setInitialPermissionState({
          enabledModules: new Set(allModulesSet),
          selectedPermissions: new Set(emptySelected),
          activeModule: null,
          activeSubmodule: null
        });

        // Sync initial state to formData so permissions are saved even if user doesn't make changes
        // Only sync if formData doesn't already have these permissions to avoid unnecessary updates
        const currentEnabled = existingPermissions?.enabledModules || [];
        const currentSelected = existingPermissions?.selectedPermissions || [];
        const needsSync = 
          currentEnabled.length !== enabledModulesArray.length ||
          !enabledModulesArray.every(module => currentEnabled.includes(module)) ||
          currentSelected.length !== selectedPermissionsArray.length;
        
        if (needsSync && onInputChange) {
          onInputChange('permissions', {
            enabledModules: enabledModulesArray,
            selectedPermissions: selectedPermissionsArray,
            activeModule: null,
            activeSubmodule: null
          });
        }
      }
    }
  }, [modulesData, initialPermissionState, formData.permissions, formData.id]);

  // Sync permission state from formData when permissions are updated (e.g., from duplicate)
  // This ensures the table reflects changes made outside the table component
  // NOTE: We do NOT update initialPermissionState here - that should only be set during initialization
  // This allows Reset to restore to the original state before duplication
  // Helper function to create stable string representation of permissions
  const createPermissionsString = (enabled: string[], selected: string[]): string => {
    return JSON.stringify({
      enabledModules: enabled.slice().sort((a, b) => a.localeCompare(b)),
      selectedPermissions: selected.slice().sort((a, b) => a.localeCompare(b))
    });
  };

  // Helper function to sync enabled modules
  const syncEnabledModules = (newEnabledModules: string[]) => {
    setEnabledModules(prevEnabled => {
      const currentEnabledArray = Array.from(prevEnabled);
      currentEnabledArray.sort((a, b) => a.localeCompare(b));
      const newEnabledArray = [...newEnabledModules];
      newEnabledArray.sort((a, b) => a.localeCompare(b));
      const enabledChanged = JSON.stringify(currentEnabledArray) !== JSON.stringify(newEnabledArray);
      
      return enabledChanged ? new Set(newEnabledModules) : prevEnabled;
    });
  };

  // Helper function to sync selected permissions
  const syncSelectedPermissions = (newSelectedPermissions: string[]) => {
    setSelectedPermissions(prevSelected => {
      const currentSelectedArray = Array.from(prevSelected);
      currentSelectedArray.sort((a, b) => a.localeCompare(b));
      const newSelectedArray = [...newSelectedPermissions];
      newSelectedArray.sort((a, b) => a.localeCompare(b));
      const selectedChanged = JSON.stringify(currentSelectedArray) !== JSON.stringify(newSelectedArray);
      
      return selectedChanged ? new Set(newSelectedPermissions) : prevSelected;
    });
  };

  // Helper function to sync active module/submodule
  const syncActiveModule = (newActiveModule: string | null | undefined) => {
    if (newActiveModule === undefined) return;
    setActiveModule(prev => {
      const newValue = newActiveModule ?? null;
      return newValue !== prev ? newValue : prev;
    });
  };

  const syncActiveSubmodule = (newActiveSubmodule: string | null | undefined) => {
    if (newActiveSubmodule === undefined) return;
    setActiveSubmodule(prev => {
      const newValue = newActiveSubmodule ?? null;
      return newValue !== prev ? newValue : prev;
    });
  };

  useEffect(() => {
    if (!formData.permissions || typeof formData.permissions !== 'object' || !initialPermissionState) {
      return;
    }

    const permissionData = formData.permissions as {
      enabledModules?: string[];
      selectedPermissions?: string[];
      activeModule?: string | null;
      activeSubmodule?: string | null;
    };
    
    // Only sync if we have valid permission data (arrays exist, even if empty)
    if (!Array.isArray(permissionData.enabledModules) || !Array.isArray(permissionData.selectedPermissions)) {
      return;
    }

    // Create a stable string representation of current formData.permissions
    const currentFormDataString = createPermissionsString(
      permissionData.enabledModules,
      permissionData.selectedPermissions
    );
    
    // Only sync if formData.permissions has actually changed (external update, not from user interaction)
    if (previousFormDataPermissionsRef.current === currentFormDataString) {
      return;
    }

    syncEnabledModules(permissionData.enabledModules);
    syncSelectedPermissions(permissionData.selectedPermissions);
    syncActiveModule(permissionData.activeModule);
    syncActiveSubmodule(permissionData.activeSubmodule);
    
    // Update the ref to track this as the new baseline for formData
    previousFormDataPermissionsRef.current = currentFormDataString;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.permissions, initialPermissionState]);

  // Track changes to determine if reset button should be enabled
  useEffect(() => {
    if (!initialPermissionState) {
      // Notify parent that there are no changes if initial state is not set
      if (onPermissionChangesChange) {
        onPermissionChangesChange(false);
      }
      return;
    }

    const currentState = {
      enabledModules,
      selectedPermissions,
      activeModule,
      activeSubmodule
    };

    const hasChangesResult = checkPermissionChanges(currentState, initialPermissionState);

    setHasPermissionChanges(hasChangesResult);
    
    // Notify parent of permission changes
    if (onPermissionChangesChange) {
      onPermissionChangesChange(hasChangesResult);
    }
  }, [enabledModules, selectedPermissions, initialPermissionState, onPermissionChangesChange]);

  // Reset permission table state when resetTrigger changes
  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > 0 && initialPermissionState) {
      // Cancel any pending updates
      if (pendingUpdateTimeoutRef.current) {
        clearTimeout(pendingUpdateTimeoutRef.current);
        pendingUpdateTimeoutRef.current = null;
      }
      
      // Clear updating flag
      isUpdatingRef.current = false;
      
      setEnabledModules(new Set(initialPermissionState.enabledModules));
      setSelectedPermissions(new Set(initialPermissionState.selectedPermissions));
      setActiveModule(initialPermissionState.activeModule);
      setActiveSubmodule(initialPermissionState.activeSubmodule);
      setHasPermissionChanges(false);

      if (onInputChange) {
        onInputChange('permissions', {
          enabledModules: Array.from(initialPermissionState.enabledModules),
          selectedPermissions: Array.from(initialPermissionState.selectedPermissions),
          activeModule: initialPermissionState.activeModule,
          activeSubmodule: initialPermissionState.activeSubmodule
        });
      }
    }
  }, [resetTrigger, initialPermissionState, onInputChange]);

  // Helper function to get permissions array with extra permission for Master/Calendar Related
  const getPermissionsWithExtra = (module: string, submodule: string): string[] => {
    if (!module || !submodule || !modulesData) {
      return [];
    }
    
    // Find the module in modulesData (case-insensitive search)
    const moduleKey = Object.keys(modulesData).find(
      key => key.toLowerCase().trim() === module.toLowerCase().trim()
    );
    
    if (!moduleKey) {
      return [];
    }
    
    const moduleData = modulesData[moduleKey];
    if (!moduleData?.submodules) {
      return [];
    }
    
    // Find the submodule (case-insensitive search)
    const submoduleKey = Object.keys(moduleData.submodules).find(
      key => key.toLowerCase().trim() === submodule.toLowerCase().trim()
    );
    
    if (!submoduleKey) {
      return [];
    }
    
    const basePermissions = moduleData.submodules[submoduleKey] || [];
    if (!Array.isArray(basePermissions)) {
      return [];
    }
    
    // Add "Select attribute for setting up data permissions." after "Delete a master" 
    // for Master module's Calendar Related submodule
    const isMasterModule = moduleKey.toLowerCase().trim() === 'master';
    const isCalendarRelated = submoduleKey.toLowerCase().trim() === 'calendar related';
    
    if (isMasterModule && isCalendarRelated) {
      const permissions = [...basePermissions]; // Create a copy
      const deleteMasterIndex = permissions.findIndex(perm => 
        perm && typeof perm === 'string' && perm.toLowerCase().trim() === 'delete a master'
      );
      
      if (deleteMasterIndex !== -1) {
        const newPermission = 'Select attribute for setting up data permissions.';
        const alreadyExists = permissions.some(perm => 
          perm && typeof perm === 'string' && perm.toLowerCase().trim() === newPermission.toLowerCase().trim()
        );
        
        if (!alreadyExists) {
          permissions.splice(deleteMasterIndex + 1, 0, newPermission);
        }
      }
      
      return permissions;
    }
    
    return basePermissions;
  };

  // Prepare data for AG Grid - one row per module, plus extra rows if needed for permissions
  const gridRowData = useMemo(() => {
    if (!modulesData || Object.keys(modulesData).length === 0) {
      return [];
    }

    const rows: any[] = [];

    // First, add all actual modules
    Object.entries(modulesData).forEach(([moduleName, moduleData]) => {
      const isModuleEnabled = enabledModules.has(moduleName);

      rows.push({
        module: moduleName,
        moduleData,
        isModuleEnabled,
        id: moduleName,
        hasData: true // Mark rows with actual module data
      });
    });

    // If there's an active submodule with more permissions than modules, add extra rows
    // These extra rows allow the permissions column to show all permissions (e.g., "Select attribute for setting up data permissions.")
    // The modules and submodule columns will show empty cells for these extra rows
    if (activeSubmodule) {
      const [activeModuleName, activeSubmoduleName] = activeSubmodule.split('-');
      const permissions = getPermissionsWithExtra(activeModuleName, activeSubmoduleName);
      const permissionCount = permissions.length + 1; // +1 for "Select All"
      const moduleCount = rows.length;
      
      // If we need more rows for permissions than we have modules, add extra rows
      if (permissionCount > moduleCount) {
        const extraRowsNeeded = permissionCount - moduleCount;
        for (let i = 0; i < extraRowsNeeded; i++) {
          rows.push({
            module: null,
            moduleData: null,
            isModuleEnabled: false,
            id: `permission-extra-${i}`,
            isExtraRow: true,
            hasData: true // Mark extra rows as having data (they're needed for permissions)
          });
        }
      }
    }

    // Filter out any rows that don't have data
    return rows.filter(row => row.hasData === true);
  }, [modulesData, enabledModules, activeSubmodule]);

  // Helper function to apply transform to a single cell
  const applyCellTransform = (targetElement: HTMLElement, translateY: number, transitionValue: string, isVisible: boolean) => {
    targetElement.style.transform = `translateY(${translateY}px)`;
    targetElement.style.transition = transitionValue;
    targetElement.style.opacity = isVisible ? '1' : '0';
    targetElement.style.pointerEvents = isVisible ? 'auto' : 'none';
  };

  // Helper function to reset cell to natural position
  const resetCellPosition = (cellElement: HTMLElement) => {
    const cellBox = cellElement.querySelector('div[style*="position: absolute"]') as HTMLElement;
    const targetElement = cellBox || cellElement;
    targetElement.style.transform = 'translateY(0px)';
    targetElement.style.opacity = '1';
    targetElement.style.pointerEvents = 'auto';
  };

  // Helper function to create wheel handler for scrollable columns
  const createScrollableWheelHandler = (
    cell: HTMLElement,
    colIndex: number,
    maxScroll: number,
    columnCells: HTMLElement[],
    applyScrollTransform: (colIndex: number, columnCells: HTMLElement[]) => void
  ) => {
    return (e: WheelEvent) => {
      const row = cell.closest('.ag-row');
      if (!row) return;
      
      const cells = row.querySelectorAll('.ag-cell');
      const cellIndex = Array.from(cells).indexOf(cell);
      if (cellIndex !== colIndex) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      columnScrollPositionsRef.current[colIndex] = Math.max(
        0,
        Math.min(maxScroll, columnScrollPositionsRef.current[colIndex] + e.deltaY)
      );

      applyScrollTransform(colIndex, columnCells);
    };
  };

  // Helper function to create wheel handler for non-scrollable columns
  const createNonScrollableWheelHandler = (cell: HTMLElement, colIndex: number) => {
    return (e: WheelEvent) => {
      const row = cell.closest('.ag-row');
      if (!row) return;
      
      const cells = row.querySelectorAll('.ag-cell');
      const cellIndex = Array.from(cells).indexOf(cell);
      if (cellIndex !== colIndex) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    };
  };

  // Helper function to apply scroll immediately to prevent blink
  const applyScrollImmediately = (colIndex: number, scrollOffset: number) => {
    const gridApi = (gridRef.current as any)?.api;
    if (!gridApi) return;
    
    const gridElement = gridApi.getGridElement?.() || document.querySelector('.ag-theme-alpine');
    if (!gridElement) return;
    
    const rows = Array.from(gridElement.querySelectorAll('.ag-row'));
    if (rows.length === 0) return;
    
    const columnCells: HTMLElement[] = [];
    rows.forEach((row) => {
      const cells = (row as HTMLElement).querySelectorAll('.ag-cell');
      if (cells[colIndex]) {
        columnCells.push(cells[colIndex] as HTMLElement);
      }
    });
    
    if (columnCells.length > 0) {
      columnCells.forEach((cellElement) => {
        const translateY = -scrollOffset;
        const cellBox = cellElement.querySelector('div[style*="position: absolute"]') as HTMLElement;
        const targetElement = cellBox || cellElement;
        // Apply immediately with no transition to prevent blink
        targetElement.style.transition = 'none';
        targetElement.style.transform = `translateY(${translateY}px)`;
      });
    }
  };

  // Set up independent column scrolling
  useEffect(() => {
    if (!gridRef.current) return;

    const setupColumnScrolling = () => {
      const gridApi = (gridRef.current as any)?.api;
      if (!gridApi) return;

      const gridElement = gridApi.getGridElement?.() || 
                          document.querySelector('.ag-theme-alpine');
      if (!gridElement) return;

      // Get all rows first
      const rowElements = gridElement.querySelectorAll('.ag-row');
      const rows: Element[] = Array.from(rowElements);
      if (rows.length === 0) return;

      // Calculate actual content count for each column first
      const rowHeight = 40;
      const visibleHeight = 270; // Table height
      const headerHeight = 34;
      const visibleRowCount = Math.floor((visibleHeight - headerHeight) / rowHeight);
      
      // Column 0 (Modules): Count only actual modules (exclude extra rows added for permissions)
      // Extra rows should not affect module column scroll - only count real modules
      const moduleCount = gridRowData.filter(row => !row.isExtraRow).length;
      
      // Column 1 (Sub Module): Count depends on activeModule
      // Only count actual submodules, not placeholders
      let submoduleCount = 0;
      if (activeModule && modulesData?.[activeModule]?.submodules) {
        submoduleCount = Object.keys(modulesData[activeModule].submodules).length;
      }
      // If no activeModule, show placeholders but don't enable scrolling (submoduleCount stays 0)
      
      // Column 2 (Permissions): Count depends on activeSubmodule
      // Only count actual permissions, not placeholders
      let permissionCount = 0;
      if (activeSubmodule) {
        const [activeModuleName, activeSubmoduleName] = activeSubmodule.split('-');
        // Use helper function to get permissions with extra permission for Master/Calendar Related
        const permissions = getPermissionsWithExtra(activeModuleName, activeSubmoduleName);
        if (Array.isArray(permissions) && permissions.length > 0) {
          permissionCount = permissions.length + 1; // +1 for "Select All" row
        }
      }
      // If no activeSubmodule, show placeholders but don't enable scrolling (permissionCount stays 0)
      
      // Calculate max scroll for each column (only if content exceeds visible area)
      const getMaxScroll = (contentCount: number) => {
        if (contentCount <= visibleRowCount) {
          return 0; // No scrolling needed
        }
        return Math.max(0, (contentCount * rowHeight) - (visibleHeight - headerHeight));
      };
      
      const maxScrolls = {
        0: getMaxScroll(moduleCount),
        1: getMaxScroll(submoduleCount),
        2: getMaxScroll(permissionCount)
      };

      // Disable default AG Grid body scrolling - always prevent default scrolling
      const bodyViewport = gridElement.querySelector('.ag-body-viewport') as HTMLElement;
      if (bodyViewport) {
        bodyViewport.style.overflowY = 'hidden';
        bodyViewport.style.overflowX = 'hidden';
        // Always prevent wheel events from causing default scroll
        const bodyViewportWheelHandler = (e: WheelEvent) => {
          e.preventDefault();
          e.stopPropagation();
        };
        bodyViewport.addEventListener('wheel', bodyViewportWheelHandler, { passive: false });
        // Store for cleanup
        (bodyViewport as any)._wheelHandler = bodyViewportWheelHandler;
      }

      // Prevent default scrolling on the grid container itself - always prevent
      const gridContainer = gridElement.querySelector('.ag-body') as HTMLElement;
      if (gridContainer) {
        const gridContainerWheelHandler = (e: WheelEvent) => {
          // Always prevent default scrolling - our custom handlers will handle scrolling
          e.preventDefault();
          e.stopPropagation();
        };
        gridContainer.addEventListener('wheel', gridContainerWheelHandler, { passive: false });
        // Store for cleanup
        (gridContainer as any)._wheelHandler = gridContainerWheelHandler;
      }

      // Column indices: 0 = Modules, 1 = Sub Module, 2 = Permissions
      const columnIndices = [0, 1, 2];
      
      // Preserve scroll positions when toggling modules (only reset if module count actually changes)
      // IMPORTANT: Only count actual modules, not extra rows - extra rows shouldn't affect module scroll
      const currentModuleCount = gridRowData.filter(row => !row.isExtraRow).length;
      const moduleCountChanged = previousModuleCountRef.current !== 0 && 
                                  previousModuleCountRef.current !== currentModuleCount;
      
      // CRITICAL: Never reset scroll positions during toggle operation or when clicking modules/submodules
      // This prevents the scroll from jumping to top and then back
      // Only reset scroll positions if:
      // 1. This is the first render (previousModuleCountRef.current === 0)
      // 2. The actual module count changed (not just extra rows being added/removed)
      // 3. We're NOT in the middle of a toggle operation
      // 4. We're NOT clicking a module (which should preserve module scroll)
      // 5. We're NOT clicking a submodule (which adds/removes extra rows but doesn't change module count)
      if (isTogglingRef.current || isClickingModuleRef.current || isClickingSubmoduleRef.current) {
        // During toggle, module click, or submodule click, DO NOTHING - preserve existing scroll positions
        // They were already captured in handleModuleToggle/handleModuleClick/handleSubmoduleClick before state change
        // This prevents any scroll jump
      } else if (previousModuleCountRef.current === 0 || moduleCountChanged) {
        // Only reset if it's first render or actual module count changed (not extra rows)
        columnScrollPositionsRef.current = { 0: 0, 1: 0, 2: 0 };
      }
      // Otherwise, keep existing scroll positions (they're already correct)
      
      previousModuleCountRef.current = currentModuleCount;

      // Helper function to extract cell from a row
      const extractCellFromRow = (row: Element, colIndex: number): HTMLElement | null => {
        const cells = (row as HTMLElement).querySelectorAll('.ag-cell');
        return cells[colIndex] ? (cells[colIndex] as HTMLElement) : null;
      };

      // Helper function to get column cells
      const getColumnCells = (colIndex: number): HTMLElement[] => {
        const columnCells: HTMLElement[] = [];
        for (const row of rows) {
          const cell = extractCellFromRow(row, colIndex);
          if (cell) {
            columnCells.push(cell);
          }
        }
        return columnCells;
      };

      // Helper function to apply scroll transform to a single cell
      const applyCellScrollTransform = (cellElement: HTMLElement, rowIndex: number, scrollOffset: number, transitionValue: string) => {
        const translateY = -scrollOffset;
        const naturalPosition = rowIndex * rowHeight;
        const cellTop = naturalPosition - scrollOffset;
        const cellBottom = cellTop + rowHeight;
        const isVisible = cellBottom > 0 && cellTop < (visibleHeight - headerHeight);
        
        const cellBox = cellElement.querySelector('div[style*="position: absolute"]') as HTMLElement;
        const targetElement = cellBox || cellElement;
        applyCellTransform(targetElement, translateY, transitionValue, isVisible);
      };

      // Helper function to apply scroll transform to a column
      const applyScrollTransform = (colIndex: number, columnCells: HTMLElement[]) => {
        const scrollOffset = columnScrollPositionsRef.current[colIndex];
        const shouldDisableTransition = isTogglingRef.current || isClickingModuleRef.current || isClickingSubmoduleRef.current;
        const transitionValue = shouldDisableTransition ? 'none' : 'transform 0.1s ease-out, opacity 0.1s ease-out';
        
        for (let rowIndex = 0; rowIndex < columnCells.length; rowIndex++) {
          applyCellScrollTransform(columnCells[rowIndex], rowIndex, scrollOffset, transitionValue);
        }
      };

      // Helper function to setup wheel handler for a single cell
      const setupCellWheelHandler = (cell: HTMLElement, colIndex: number, maxScroll: number, columnCells: HTMLElement[], isScrollable: boolean) => {
        const handleWheel = isScrollable
          ? createScrollableWheelHandler(cell, colIndex, maxScroll, columnCells, applyScrollTransform)
          : createNonScrollableWheelHandler(cell, colIndex);
        cell.addEventListener('wheel', handleWheel, { passive: false, capture: true });
        (cell as any)._columnScrollHandler = handleWheel;
        (cell as any)._columnScrollHandlerCapture = true;
      };

      // Helper function to setup scrollable column
      const setupScrollableColumn = (colIndex: number, columnCells: HTMLElement[], maxScroll: number) => {
        for (const cell of columnCells) {
          setupCellWheelHandler(cell, colIndex, maxScroll, columnCells, true);
        }
        applyScrollTransform(colIndex, columnCells);
      };

      // Helper function to setup non-scrollable column
      const setupNonScrollableColumn = (colIndex: number, columnCells: HTMLElement[]) => {
        columnScrollPositionsRef.current[colIndex] = 0;
        for (const cellElement of columnCells) {
          resetCellPosition(cellElement);
        }
        for (const cell of columnCells) {
          setupCellWheelHandler(cell, colIndex, 0, columnCells, false);
        }
      };

      columnIndices.forEach((colIndex) => {
        const columnCells = getColumnCells(colIndex);
        if (columnCells.length === 0) return;

        const maxScroll = maxScrolls[colIndex as keyof typeof maxScrolls];
        const needsScrolling = maxScroll > 0;

        if (needsScrolling) {
          setupScrollableColumn(colIndex, columnCells, maxScroll);
        } else {
          setupNonScrollableColumn(colIndex, columnCells);
        }
      });
    };

    // Helper function to apply scroll transform to a single cell (after setup)
    const applyCellScrollTransformAfterSetup = (cellElement: HTMLElement, scrollOffset: number) => {
      const translateY = -scrollOffset;
      const cellBox = cellElement.querySelector('div[style*="position: absolute"]') as HTMLElement;
      const targetElement = cellBox || cellElement;
      targetElement.style.transition = 'none';
      targetElement.style.transform = `translateY(${translateY}px)`;
    };

    // Helper function to extract column cells from rows
    const extractColumnCellsFromRows = (rows: NodeListOf<Element> | Element[], colIndex: number): HTMLElement[] => {
      const columnCells: HTMLElement[] = [];
      for (const row of rows) {
        const rowElement = row as HTMLElement;
        const cells = rowElement.querySelectorAll('.ag-cell');
        if (cells[colIndex]) {
          columnCells.push(cells[colIndex] as HTMLElement);
        }
      }
      return columnCells;
    };

    // Helper function to apply scroll transforms for a column
    const applyColumnScrollTransforms = (colIndex: number, rows: NodeListOf<Element> | Element[]) => {
      const columnCells = extractColumnCellsFromRows(rows, colIndex);
      if (columnCells.length > 0) {
        const scrollOffset = columnScrollPositionsRef.current[colIndex];
        for (const cellElement of columnCells) {
          applyCellScrollTransformAfterSetup(cellElement, scrollOffset);
        }
      }
    };

    // Helper function to apply scroll transforms after setup
    const applyScrollTransformsAfterSetup = () => {
      const currentGridApi = (gridRef.current as any)?.api;
      const gridElement = currentGridApi?.getGridElement?.() || 
                          document.querySelector('.ag-theme-alpine');
      if (!gridElement) return;
      
      const rowElements = gridElement.querySelectorAll('.ag-row');
      const rows: Element[] = Array.from(rowElements);
      if (rows.length === 0) return;
      
      for (const colIndex of [0, 1, 2]) {
        applyColumnScrollTransforms(colIndex, rows);
      }
    };

    // Set up after grid is ready
    // Use requestAnimationFrame for smoother updates when toggling
    let timeoutId: NodeJS.Timeout;
    let rafId: number;
    
    // Helper function to setup column scrolling with transforms
    const setupColumnScrollingWithTransforms = () => {
      setupColumnScrolling();
      requestAnimationFrame(() => {
        applyScrollTransformsAfterSetup();
      });
    };

    // Helper function to handle immediate scroll in animation frame
    const handleImmediateScrollInFrame = (preservedScroll: number) => {
      applyScrollImmediately(0, preservedScroll);
      timeoutId = setTimeout(setupColumnScrollingWithTransforms, 0);
    };

    // Helper function to handle immediate scroll setup
    const handleImmediateScrollSetup = () => {
      const preservedScroll = columnScrollPositionsRef.current[0];
      applyScrollImmediately(0, preservedScroll);
      
      rafId = requestAnimationFrame(() => {
        applyScrollImmediately(0, preservedScroll);
        handleImmediateScrollInFrame(preservedScroll);
      });
    };

    const scheduleSetup = () => {
      if (isTogglingRef.current || isClickingModuleRef.current || isClickingSubmoduleRef.current) {
        handleImmediateScrollSetup();
      } else {
        timeoutId = setTimeout(setupColumnScrolling, 300);
      }
    };
    
    scheduleSetup();
    
    // Helper function to cleanup wheel handler for a single cell
    const cleanupCellWheelHandler = (cell: Element) => {
      const handler = (cell as any)._columnScrollHandler;
      if (handler) {
        const useCapture = (cell as any)._columnScrollHandlerCapture || false;
        cell.removeEventListener('wheel', handler, { capture: useCapture } as any);
        delete (cell as any)._columnScrollHandler;
        delete (cell as any)._columnScrollHandlerCapture;
      }
    };

    // Helper function to cleanup cell wheel handlers
    const cleanupCellWheelHandlers = (rows: Element[]) => {
      for (const row of rows) {
        const cells = (row as HTMLElement).querySelectorAll('.ag-cell');
        for (const cell of cells) {
          cleanupCellWheelHandler(cell);
        }
      }
    };

    // Helper function to cleanup viewport wheel handler
    const cleanupViewportWheelHandler = (gridElement: Element) => {
      const bodyViewport = gridElement.querySelector('.ag-body-viewport') as HTMLElement;
      if (bodyViewport && (bodyViewport as any)._wheelHandler) {
        bodyViewport.removeEventListener('wheel', (bodyViewport as any)._wheelHandler);
        delete (bodyViewport as any)._wheelHandler;
      }
    };

    // Helper function to cleanup grid container wheel handler
    const cleanupGridContainerWheelHandler = (gridElement: Element) => {
      const gridContainer = gridElement.querySelector('.ag-body') as HTMLElement;
      if (gridContainer && (gridContainer as any)._wheelHandler) {
        gridContainer.removeEventListener('wheel', (gridContainer as any)._wheelHandler);
        delete (gridContainer as any)._wheelHandler;
      }
    };

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const gridElement = (gridRef.current as any)?.api?.getGridElement?.() || 
                          document.querySelector('.ag-theme-alpine');
      if (gridElement) {
        const rowElements = gridElement.querySelectorAll('.ag-row');
        const rows: Element[] = Array.from(rowElements);
        cleanupCellWheelHandlers(rows);
        cleanupViewportWheelHandler(gridElement);
        cleanupGridContainerWheelHandler(gridElement);
      }
    };
  }, [gridRowData, activeModule, activeSubmodule, modulesData]);

  // Handler functions
  const handleModuleClick = (module: string) => {
    if (isReadOnly) return;
    
    // Preserve module column scroll position before changing module
    // Capture current scroll position to prevent it from resetting
    const preservedModuleScroll = columnScrollPositionsRef.current[0];
    
    // Mark that we're clicking a module to preserve module scroll
    isClickingModuleRef.current = true;
    moduleScrollLockedRef.current = true; // Lock module scroll
    
    // Apply scroll immediately before state change to prevent any visible jump
    applyScrollImmediately(0, preservedModuleScroll);
    
    setActiveModule(module);
    setActiveSubmodule(null);
    
    // Ensure module scroll position is preserved and applied immediately after state update
    // Use immediate synchronous application to prevent blink
    requestAnimationFrame(() => {
      // Restore the preserved module scroll position
      columnScrollPositionsRef.current[0] = preservedModuleScroll;
      // Apply immediately without transition
      applyScrollImmediately(0, preservedModuleScroll);
      
      requestAnimationFrame(() => {
        // Apply one more time to ensure it's set after any re-render
        applyScrollImmediately(0, preservedModuleScroll);
        isClickingModuleRef.current = false;
        // Keep module scroll locked - it will only unlock when user hovers over module column
      });
    });
  };

  const handleSubmoduleClick = (module: string, submodule: string) => {
    if (isReadOnly) return;
    
    // Preserve module column scroll position before changing submodule
    // Capture current scroll position to prevent it from resetting
    const preservedModuleScroll = columnScrollPositionsRef.current[0];
    
    // Mark that we're clicking a submodule to preserve module scroll
    isClickingSubmoduleRef.current = true;
    moduleScrollLockedRef.current = true; // Lock module scroll
    
    // Apply scroll immediately before state change to prevent any visible jump
    applyScrollImmediately(0, preservedModuleScroll);
    
    setActiveSubmodule(`${module}-${submodule}`);
    
    // Ensure module scroll position is preserved and applied immediately after state update
    // Use immediate synchronous application to prevent blink
    requestAnimationFrame(() => {
      // Restore the preserved module scroll position
      columnScrollPositionsRef.current[0] = preservedModuleScroll;
      // Apply immediately without transition
      applyScrollImmediately(0, preservedModuleScroll);
      
      requestAnimationFrame(() => {
        // Apply one more time to ensure it's set after any re-render
        applyScrollImmediately(0, preservedModuleScroll);
        isClickingSubmoduleRef.current = false;
        // Keep module scroll locked - it will only unlock when user hovers over module column
      });
    });
  };

  // Permission table reset function - can be called from parent
  const handlePermissionTableReset = () => {
    resetPermissionState({
      initialPermissionState,
      setEnabledModules,
      setSelectedPermissions,
      setActiveModule,
      setActiveSubmodule,
      setHasPermissionChanges,
      onInputChange: onInputChange as (field: any, value: any) => void,
      pendingUpdateTimeoutRef,
      isUpdatingRef
    });
  };

  // Expose reset function to parent when ready
  useEffect(() => {
    if (onResetReady && initialPermissionState) {
      onResetReady(handlePermissionTableReset);
    }
  }, [onResetReady, initialPermissionState]);

  // Helper function to remove permissions for a module
  const removeModulePermissions = (module: string, currentPerms: Set<string>): Set<string> => {
    const updatedPerms = new Set(currentPerms);
    if (modulesData?.[module]?.submodules) {
      Object.entries(modulesData[module].submodules).forEach(([submoduleName, perms]) => {
        if (Array.isArray(perms)) {
          perms.forEach(perm => {
            updatedPerms.delete(`${module}-${submoduleName}-${perm}`);
          });
        }
      });
    }
    return updatedPerms;
  };

  // Helper function to call onInputChange with activeModule and activeSubmodule
  const callOnInputChangeWithActiveState = () => {
    if (!onInputChange) return;
    setEnabledModules(currentEnabled => {
      setSelectedPermissions(currentSelected => {
        onInputChange('permissions', {
          enabledModules: Array.from(currentEnabled),
          selectedPermissions: Array.from(currentSelected),
          activeModule,
          activeSubmodule
        });
        isUpdatingRef.current = false;
        return currentSelected;
      });
      return currentEnabled;
    });
  };


  // Helper function to apply scroll after toggle
  const applyScrollAfterToggle = (preservedScrollPositions: { [key: number]: number }) => {
    requestAnimationFrame(() => {
      applyScrollImmediately(0, preservedScrollPositions[0]);
      requestAnimationFrame(() => {
        applyScrollImmediately(0, preservedScrollPositions[0]);
        isTogglingRef.current = false;
      });
    });
  };

  const handleModuleToggle = (module: string) => {
    if (isReadOnly || isUpdatingRef.current) return; // Prevent rapid clicks
    
    // Set updating flag to prevent concurrent updates
    isUpdatingRef.current = true;
    
    // Cancel any pending onInputChange calls
    if (pendingUpdateTimeoutRef.current) {
      clearTimeout(pendingUpdateTimeoutRef.current);
      pendingUpdateTimeoutRef.current = null;
    }
    
    // Capture current scroll positions BEFORE state change to preserve them
    const preservedScrollPositions = { ...columnScrollPositionsRef.current };
    
    // Mark that we're toggling to preserve scroll positions
    isTogglingRef.current = true;
    
    // Restore preserved scroll positions immediately to prevent any reset
    columnScrollPositionsRef.current = preservedScrollPositions;
    
    // Apply scroll immediately before state change to prevent any visible jump/blink
    applyScrollImmediately(0, preservedScrollPositions[0]);
    
    // Helper function to call onInputChange after state updates
    const scheduleOnInputChange = (
      enabledSet: Set<string>,
      selectedSet: Set<string>,
      activeMod: string | null,
      activeSubmod: string | null
    ) => {
      if (!onInputChange) return;
      pendingUpdateTimeoutRef.current = setTimeout(() => {
        onInputChange('permissions', {
          enabledModules: Array.from(enabledSet),
          selectedPermissions: Array.from(selectedSet),
          activeModule: activeMod,
          activeSubmodule: activeSubmod
        });
        isUpdatingRef.current = false;
      }, 10);
    };

    // Use functional updates to ensure we're working with the latest state
    // Update enabledModules first, then selectedPermissions, then call onInputChange with the new values
    setEnabledModules(prev => {
      // Check current state before modifying
      const wasEnabled = prev.has(module);
      
      // Create a completely new Set instance to ensure React detects the change
      const prevArray = Array.from(prev);
      const newEnabledSet = new Set(prevArray);
      
      if (wasEnabled) {
        // Disabling module - remove from enabled modules
        newEnabledSet.delete(module);
        
        // Clear active module/submodule if this module was active
        const newActiveModule = activeModule === module ? null : activeModule;
        const newActiveSubmodule = activeModule === module ? null : activeSubmodule;
        
        // Update selectedPermissions and call onInputChange with the new values directly
        setSelectedPermissions(currentPerms => {
          const currentArray = Array.from(currentPerms);
          const updatedPerms = removeModulePermissions(module, new Set(currentArray));
          
          if (newActiveModule !== activeModule) {
            setActiveModule(newActiveModule);
            setActiveSubmodule(newActiveSubmodule);
          }
          
          scheduleOnInputChange(newEnabledSet, updatedPerms, newActiveModule, newActiveSubmodule);
          
          return updatedPerms;
        });
      } else {
        // Enabling module - add to enabled modules
        newEnabledSet.add(module);
        
        // Capture current selectedPermissions before state update
        // We need to read it from the current state, not from the callback
        // Use a ref to track that we're updating so the sync useEffect doesn't interfere
        const currentSelectedPerms = selectedPermissions;
        
        scheduleOnInputChange(newEnabledSet, currentSelectedPerms, activeModule, activeSubmodule);
      }

      // Reset the toggle flag after state update completes
      applyScrollAfterToggle(preservedScrollPositions);

      return newEnabledSet;
    });
  };

  const handleSelectAllPermissions = (module: string, submodule: string) => {
    if (isReadOnly || isUpdatingRef.current) return; // Prevent rapid clicks
    
    // Set updating flag to prevent concurrent updates
    isUpdatingRef.current = true;
    
    // Cancel any pending onInputChange calls
    if (pendingUpdateTimeoutRef.current) {
      clearTimeout(pendingUpdateTimeoutRef.current);
      pendingUpdateTimeoutRef.current = null;
    }
    
      const key = `${module}-${submodule}`;
      const allPermissions = getPermissionsWithExtra(module, submodule);

    setSelectedPermissions(prev => {
      const prevArray = Array.from(prev);
      const currentPermissions = prevArray.filter(perm => perm.startsWith(`${key}-`));
      const shouldSelectAll = currentPermissions.length < allPermissions.length;

      // Create a completely new Set instance to ensure React detects the change
      const newSet = new Set(prevArray);
      allPermissions.forEach((permission: string) => {
        const permKey = `${key}-${permission}`;
        if (shouldSelectAll) {
          newSet.add(permKey);
        } else {
          newSet.delete(permKey);
        }
      });

      // Schedule onInputChange after state update completes
      pendingUpdateTimeoutRef.current = setTimeout(() => {
        callOnInputChangeWithActiveState();
      }, 0);

      return newSet;
    });
  };

  const handlePermissionToggle = (module: string, submodule: string, permission: string) => {
    if (isReadOnly || isUpdatingRef.current) return; // Prevent rapid clicks
    
    // Set updating flag to prevent concurrent updates
    isUpdatingRef.current = true;
    
    // Cancel any pending onInputChange calls
    if (pendingUpdateTimeoutRef.current) {
      clearTimeout(pendingUpdateTimeoutRef.current);
      pendingUpdateTimeoutRef.current = null;
    }
    
    const key = `${module}-${submodule}-${permission}`;
    
    setSelectedPermissions(prev => {
      // Create a completely new Set instance to ensure React detects the change
      const prevArray = Array.from(prev);
      const newSet = new Set(prevArray);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }

      // Schedule onInputChange after state update completes
      pendingUpdateTimeoutRef.current = setTimeout(() => {
        callOnInputChangeWithActiveState();
      }, 0);

      return newSet;
    });
  };

  // AG Grid column definitions
  // Using flex values to match add user permission table: 30%/25%/45% ratio (3:2.5:4.5)
  const columnDefs = useMemo(() => [
    {
      headerName: 'Modules',
      field: 'module',
      flex: 3,
      minWidth: 200,
      maxWidth: 500,
      sortable: true,
      suppressHeaderClickSorting: true,
      comparator: () => 0, // Disable sorting functionality
      cellStyle: { padding: 0, display: 'flex', alignItems: 'stretch' },
      cellRenderer: createModuleCellRenderer(activeModule, handleModuleClick, handleModuleToggle, isReadOnly)
    },
    {
      headerName: 'Sub Module',
      field: 'subModule',
      flex: 2.5,
      minWidth: 150,
      maxWidth: 400,
      sortable: true,
      suppressHeaderClickSorting: true,
      comparator: () => 0, // Disable sorting functionality
      cellStyle: { padding: 0, display: 'flex', alignItems: 'stretch' },
      cellRenderer: createSubmoduleCellRenderer(activeModule, activeSubmodule, enabledModules, modulesData, handleSubmoduleClick)
    },
    {
      headerName: 'Permissions',
      field: 'permissions',
      flex: 4.5,
      minWidth: 200,
      sortable: false,
      cellStyle: { padding: 0, display: 'flex', alignItems: 'stretch' },
      cellRenderer: createPermissionsCellRenderer({
        activeSubmodule,
        enabledModules,
        selectedPermissions,
        modulesData,
        getPermissionsWithExtra,
        handleSelectAllPermissions,
        handlePermissionToggle,
        isReadOnly
      })
    }
  ], [activeModule, activeSubmodule, enabledModules, selectedPermissions, isReadOnly, modulesData]);

  if (loading) {
    return <Box sx={{ p: 2 }}>Loading permissions...</Box>;
  }

  if (error) {
    return <Box sx={{ p: 2, color: 'error.main' }}>Error loading permissions: {error}</Box>;
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Global styles to ensure checkbox icons are visible */}
      <style>{`
        .ag-cell .custom-checkbox-icon.unchecked {
          display: inline-block !important;
          visibility: visible !important;
          opacity: 1 !important;
          width: 18px !important;
          height: 18px !important;
          border-radius: 4px !important;
          border: 1px solid #6c757d !important;
          background-color: #fff !important;
          box-sizing: border-box !important;
        }
        .ag-cell .custom-checkbox-icon.checked {
          display: inline-block !important;
          visibility: visible !important;
          opacity: 1 !important;
          width: 18px !important;
          height: 18px !important;
          border-radius: 4px !important;
          border: 1px solid #0051ab !important;
          background-color: #0051ab !important;
          box-sizing: border-box !important;
          position: relative !important;
        }
        /* Don't hide extra rows - they're needed for displaying permissions in the permissions column */
        /* Extra rows will have empty module cells, but that's intentional */
        /* Ensure all rows have consistent opacity and no filter effects */
        .ag-row {
          opacity: 1 !important;
          filter: none !important;
        }
        .ag-row:hover {
          opacity: 1 !important;
          filter: none !important;
        }
        .ag-row .ag-cell:first-child > div {
          opacity: 1 !important;
          filter: none !important;
        }
        .ag-row:hover .ag-cell:first-child > div {
          opacity: 1 !important;
          filter: none !important;
        }
        /* Isolate hover effects to specific columns only */
        /* CRITICAL: Prevent row hover from affecting any cells except the one being hovered */
        /* When hovering anywhere on row, keep submodule white unless submodule itself is hovered */
        .ag-row:hover .ag-cell[col-id="subModule"]:not(:hover),
        .ag-row:hover .ag-cell[col-id="subModule"]:not(:hover) > div,
        .ag-row:hover .ag-cell[col-id="subModule"]:not(:hover) > div > div {
          background-color: #ffffff !important;
        }
        /* When hovering anywhere on row, always keep permissions white */
        .ag-row:hover .ag-cell[col-id="permissions"],
        .ag-row:hover .ag-cell[col-id="permissions"] > div,
        .ag-row:hover .ag-cell[col-id="permissions"] > div > div,
        .ag-row:hover .ag-cell[col-id="permissions"] > div > div > div {
          background-color: #ffffff !important;
        }
        /* Permissions cells should NEVER change background on any hover state */
        .ag-cell[col-id="permissions"],
        .ag-cell[col-id="permissions"]:hover,
        .ag-cell[col-id="permissions"]:hover > div,
        .ag-cell[col-id="permissions"]:hover > div > div,
        .ag-cell[col-id="permissions"]:hover > div > div > div {
          background-color: #ffffff !important;
        }
        /* Additional protection using :has() selector for modern browsers */
        .ag-row:has(.ag-cell[col-id="module"]:hover) .ag-cell[col-id="subModule"]:not(:hover),
        .ag-row:has(.ag-cell[col-id="module"]:hover) .ag-cell[col-id="subModule"]:not(:hover) > div,
        .ag-row:has(.ag-cell[col-id="module"]:hover) .ag-cell[col-id="permissions"],
        .ag-row:has(.ag-cell[col-id="module"]:hover) .ag-cell[col-id="permissions"] > div,
        .ag-row:has(.ag-cell[col-id="subModule"]:hover) .ag-cell[col-id="permissions"],
        .ag-row:has(.ag-cell[col-id="subModule"]:hover) .ag-cell[col-id="permissions"] > div {
          background-color: #ffffff !important;
        }
        /* Disable default AG Grid scrolling for independent column scrolling */
        .ag-body-viewport {
          overflow-y: hidden !important;
          overflow-x: hidden !important;
        }
        /* Ensure cells can be transformed for scrolling */
        .ag-cell {
          overflow: visible !important;
        }
        .ag-cell > div[style*="position: absolute"] {
          will-change: transform;
        }
        /* Keep headers fixed during column scrolling */
        .ag-header {
          position: sticky !important;
          top: 0 !important;
          z-index: 10 !important;
        }
        /* Remove gaps between cells - make borders transparent/white */
        .ag-cell {
          border: none !important;
          border-right: none !important;
          border-left: none !important;
          border-top: none !important;
          border-bottom: none !important;
          padding: 0 !important;
        }
        .ag-row {
          border: none !important;
        }
        /* Remove borders from cell content boxes */
        .ag-cell > div {
          border: none !important;
        }
        /* Ensure no gaps between rows */
        .ag-row + .ag-row {
          margin-top: 0 !important;
        }
        /* Disable text selection in permission table */
        .ag-row,
        .ag-cell,
        .ag-cell > div,
        .ag-cell > div > div,
        .ag-cell > div > div > div,
        .ag-cell span,
        .ag-cell label {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
        }
      `}</style>
      {/* Permissions Section with Action Buttons */}
      <Box sx={{ mb: 2, width: '100%', maxWidth: '100%' }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          mb: 1,
          flexWrap: 'wrap',
          gap: 1,
          '@media (max-width: 768px)': {
            flexDirection: 'column',
            alignItems: 'flex-start'
          }
        }}>
          <PermissionsSectionHeader
            entityType="role"
            isReadOnly={isReadOnly}
          />

          {/* Action Buttons - Top Right */}
          <PermissionsActionButtons
            isReadOnly={isReadOnly}
            hasPermissionChanges={hasPermissionChanges}
            onReset={handlePermissionTableReset}
            onDuplicate={onDuplicateClick}
          />
        </Box>
      </Box>

      {/* AG Grid Permissions Table */}
      <Box sx={{
        border: '1px solid rgb(241 241 239)',
        borderRadius: '0px',
        backgroundColor: '#fff',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        height: '270px',
        maxHeight: '270px',
        flex: '0 0 auto',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none'
      }}>
        <AgGridShell
          gridRef={gridRef}
          rowData={gridRowData}
          columnDefs={columnDefs}
          defaultColDef={{
            suppressHeaderClickSorting: false,
            sortable: true,
            filter: false,
            headerClass: 'ag-header-cell-custom',
            unSortIcon: true,
            sortingOrder: ['asc', 'desc', null] as any,
          }}
          components={{}}
          onSortChanged={() => {}}
          rowHeight={40}
          headerHeight={34}
          getRowStyle={(params: any) => {
            // Hide rows that don't have data
            if (!params.data || params.data.hasData !== true) {
              return { display: 'none', height: 0, minHeight: 0, maxHeight: 0 };
            }
            // No opacity or filter effects - keep all rows consistent
            return {};
          }}
          gridOptions={{
            suppressSizeToFit: false,
            domLayout: 'normal',
            rowHeight: 40,
            icons: gridIcons,
            suppressRowVirtualisation: true, // Render all rows without virtualization to prevent empty rows
            rowBuffer: 0, // Don't buffer extra rows
            suppressScrollOnNewData: true, // Prevent scroll jumps
            ensureDomOrder: true, // Ensure DOM order matches data order
            // Ensure only rows with data are rendered
            doesExternalFilterPass: (node: any) => {
              return node.data && node.data.hasData === true;
            },
            isExternalFilterPresent: () => true
          }}
          isDraggable={false}
        />
      </Box>
    </Box>
  );
};

export default RolePermissionsTable;

