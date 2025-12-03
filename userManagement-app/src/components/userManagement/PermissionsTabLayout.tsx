import React, { useState, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { ArrowUp, ArrowDown, ArrowsVertical } from '@carbon/icons-react';
import MultiSelectField from 'commonApp/MultiSelectField';
import ToggleSwitch from 'commonApp/ToggleSwitch';
import CustomCheckbox from 'commonApp/CustomCheckbox';
import ModuleIcon from './ModuleIcons';
import PermissionRow from './PermissionRow';
import { useModulePermissions } from '../../hooks/useModulePermissions';
import PermissionsActionButtons from '../shared/PermissionsActionButtons';
import PermissionsSectionHeader from '../shared/PermissionsSectionHeader';
import { useRegionCountry } from '../../hooks/useRegionCountry';
import { 
  usePermissionState, 
  resetPermissionState, 
  checkPermissionChanges 
} from '../../utils/permissionUtils';
import { 
  getBaseCellStyles, 
  getBaseSpanStyles, 
  getCellContentStyles, 
  getHeaderCellStyles,
  getPlaceholderCellStyles,
  getUserFormStyles,
  COMMON_STYLES,
  getCheckboxContainerStyles,
  getCheckboxStyles,
  getModuleHeaderContainerStyles,
  getModuleIconContainerStyles
} from './PermissionTableConstants';
import type { UserFormData } from '../../types/UserFormData';

import { CustomSortIcon } from '../shared/PermissionTableComponents';
import { 
  createModuleClickHandler,
  createSubmoduleClickHandler,
  createModuleToggleHandler,
  createSelectAllPermissionsHandler,
  createPermissionToggleHandler
} from '../shared/permissionTableUtils';

// Get user form styles at module level
const userFormStyles = getUserFormStyles();

// Reusable MultiSelectField wrapper to eliminate duplication
const ReusableMultiSelectField: React.FC<{
  field: string;
  config: any;
  onInputChange: (field: keyof UserFormData, value: string[]) => void;
  formData: UserFormData;
  isReadOnly?: boolean;
}> = ({ field, config, onInputChange, formData, isReadOnly = false }) => {
  if (!config) {
    console.log(`❌ No config for field: ${field}`);
    return null;
  }
  
  console.log(`🔍 MultiSelectField for ${field}:`, {
    label: config.label,
    value: config.value,
    valueType: typeof config.value,
    isArray: Array.isArray(config.value),
    valueLength: config.value?.length,
    options: config.options,
    optionsLength: config.options?.length,
    firstFewOptions: config.options?.slice(0, 3)
  });
  
  return (
    <Box sx={userFormStyles.formField}>
      <MultiSelectField
        label={config.label}
        value={config.value}
        onChange={isReadOnly ? () => {} : (values: string[]) => {
          if (field in formData) {
            onInputChange(field as keyof UserFormData, values);
          }
        }}
        options={config.options}
        placeholder={`Select ${config.label}`}
        required={true}
        width="100%"
        height="25px"
        showSelectAll={true}
        showSelectedItems={true}
        maxSelectedItemsDisplay={2}
        disabled={isReadOnly}
      />
    </Box>
  );
};


// Helper function for permissions container styles to eliminate duplication
const getPermissionsContainerStyles = () => ({
  borderWidth: '0px',
  position: 'relative' as const,
  left: '0px',
  top: '0px',
  width: '100%',
  minHeight: '40px',
  background: 'inherit',
  backgroundColor: 'rgba(255, 255, 255, 1)',
  border: 'none',
  borderRadius: '0px',
  boxShadow: 'none',
  display: 'flex',
  flexDirection: 'column' as const,
  padding: '0px',
  boxSizing: 'border-box' as const,
  maxHeight: '250px',
  overflowY: 'auto' as const,
  fontFamily: "'InterTight-Regular_Medium', 'Inter Tight Medium', 'Inter Tight', sans-serif",
  fontWeight: 500,
  fontStyle: 'normal' as const,
  fontSize: '12px',
  color: '#5F6368',
  textAlign: 'left' as const
});



interface PermissionsTabLayoutProps {
  formData: UserFormData;
  onInputChange: (field: keyof UserFormData, value: string | boolean | string[] | UserFormData['permissions']) => void;
  resetTrigger?: number; // Increment this to trigger a reset
  isReadOnly?: boolean; // For read-only mode
  onDuplicateClick?: () => void; // Callback when duplicate button is clicked
}

const PermissionsTabLayout: React.FC<PermissionsTabLayoutProps> = ({
  formData,
  onInputChange,
  resetTrigger,
  isReadOnly = false,
  onDuplicateClick
}) => {
  console.log('🚀 PermissionsTabLayout received formData:', {
    regions: formData.regions,
    countries: formData.countries,
    divisions: formData.divisions,
    groups: formData.groups,
    departments: formData.departments,
    classes: formData.classes,
    subClasses: formData.subClasses,
    regionsLength: formData.regions?.length,
    countriesLength: formData.countries?.length,
    divisionsLength: formData.divisions?.length,
    groupsLength: formData.groups?.length
  });
  // Fetch module permissions data from API
  const { modulesData, loading, error } = useModulePermissions();
  
  // Fetch region country data for dropdowns
  const { dropdownOptions: regionCountryOptions, loading: regionCountryLoading, error: regionCountryError } = useRegionCountry();
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc' | null;
  }>({ key: '', direction: null });

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
  
  // Initialize permission state with existing user permissions when data is loaded
  React.useEffect(() => {
    if (modulesData && Object.keys(modulesData).length > 0) {
      const moduleKeys = Object.keys(modulesData);
      
      // Check if user has existing permissions
      const existingPermissions = formData.permissions;
      console.log('🔍 INITIALIZING PERMISSION STATE - Existing permissions:', existingPermissions);
      
      if (existingPermissions?.enabledModules && existingPermissions?.selectedPermissions) {
        // User has existing permissions - initialize with those
        // But don't set activeModule/activeSubmodule initially - let user click to navigate (like create mode)
        console.log('🔍 INITIALIZING WITH EXISTING PERMISSIONS:', {
          enabledModules: existingPermissions.enabledModules,
          selectedPermissions: existingPermissions.selectedPermissions,
          activeModule: null, // Start with null - user must click to navigate
          activeSubmodule: null // Start with null - user must click to navigate
        });
        
        setEnabledModules(new Set(existingPermissions.enabledModules));
        setSelectedPermissions(new Set(existingPermissions.selectedPermissions));
        // Don't initialize activeModule and activeSubmodule - start fresh like create mode
        setActiveModule(null);
        setActiveSubmodule(null);
        
        // Capture initial state with existing permissions (but without active navigation)
        if (!initialPermissionState) {
          setInitialPermissionState({
            enabledModules: new Set(existingPermissions.enabledModules),
            selectedPermissions: new Set(existingPermissions.selectedPermissions),
            activeModule: null, // Don't restore active navigation state
            activeSubmodule: null // Don't restore active navigation state
          });
        }
      } else {
        // No existing permissions - initialize with all modules enabled
        console.log('🔍 NO EXISTING PERMISSIONS - Initializing with all modules enabled');
        setEnabledModules(prev => {
          // Only update if the modules have actually changed
          const newSet = new Set(moduleKeys);
          if (prev.size !== newSet.size || !moduleKeys.every(key => prev.has(key))) {
            // Capture initial state when first loaded
            if (!initialPermissionState) {
              setInitialPermissionState({
                enabledModules: new Set(newSet),
                selectedPermissions: new Set(),
                activeModule: null,
                activeSubmodule: null
              });
            }
            return newSet;
          }
          return prev;
        });
      }
    }
  }, [modulesData, initialPermissionState]);

  // Track changes to determine if reset button should be enabled
  React.useEffect(() => {
    if (!initialPermissionState) return;

    // Helper function to compare sets
    const currentState = {
      enabledModules,
      selectedPermissions,
      activeModule,
      activeSubmodule
    };

    // Compare current state with initial state
    // Only consider actual permission changes, not navigation changes
    const hasChanges = checkPermissionChanges(currentState, initialPermissionState);

    setHasPermissionChanges(hasChanges);
  }, [enabledModules, selectedPermissions, initialPermissionState]);

  // Reset permission table state when resetTrigger changes
  React.useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > 0) {
      console.log('🔄 RESET TRIGGER ACTIVATED - Resetting permission table state');
      
      // Priority: Use initialPermissionState if available (captured on first load)
      // Otherwise fall back to formData.permissions (which should be reset to initial state by FormStateManager)
      if (initialPermissionState) {
        // Reset to initial loaded state - this ensures we go back to the state when data was first loaded
        console.log('🔄 RESETTING TO INITIAL LOADED STATE:', initialPermissionState);
        setEnabledModules(new Set(initialPermissionState.enabledModules));
        setSelectedPermissions(new Set(initialPermissionState.selectedPermissions));
        setActiveModule(initialPermissionState.activeModule);
        setActiveSubmodule(initialPermissionState.activeSubmodule);
      } else {
        // Fallback: Check if user has existing permissions to reset to
        const existingPermissions = formData.permissions;
        
        if (existingPermissions?.enabledModules && existingPermissions?.selectedPermissions) {
          // Reset to existing user permissions
          console.log('🔄 RESETTING TO EXISTING USER PERMISSIONS:', existingPermissions);
          setEnabledModules(new Set(existingPermissions.enabledModules));
          setSelectedPermissions(new Set(existingPermissions.selectedPermissions));
          setActiveModule(existingPermissions.activeModule);
          setActiveSubmodule(existingPermissions.activeSubmodule);
        } else {
          // No existing permissions - reset to default state
          console.log('🔄 NO EXISTING PERMISSIONS - Resetting to default state');
          setSelectedPermissions(new Set());
          setActiveModule(null);
          setActiveSubmodule(null);
          // Re-initialize enabled modules if data is available
          if (modulesData && Object.keys(modulesData).length > 0) {
            setEnabledModules(new Set(Object.keys(modulesData)));
          }
        }
      }
      
      // Reset the change tracking
      setHasPermissionChanges(false);
    }
  }, [resetTrigger, modulesData, initialPermissionState]);
  
  // Restore permission state from formData when navigating between tabs
  // Preserve activeModule/activeSubmodule when they're already set (user is interacting)
  React.useEffect(() => {
    if (formData.permissions && typeof formData.permissions === 'object') {
      const permissionData = formData.permissions as {
        enabledModules?: string[];
        selectedPermissions?: string[];
        activeModule?: string | null;
        activeSubmodule?: string | null;
      };
      
      // Only restore if we have valid permission data
      if (permissionData.enabledModules && permissionData.selectedPermissions) {
        // Restore permissions state from formData - this ensures tab navigation works correctly
        setEnabledModules(new Set(permissionData.enabledModules));
        setSelectedPermissions(new Set(permissionData.selectedPermissions));
        
        // Preserve activeModule and activeSubmodule if they're set in formData
        // This allows the user to continue interacting without losing their view
        // Only reset to null if formData explicitly has null (e.g., when navigating tabs)
        if (permissionData.activeModule !== undefined) {
          setActiveModule(permissionData.activeModule);
        }
        if (permissionData.activeSubmodule !== undefined) {
          setActiveSubmodule(permissionData.activeSubmodule);
        }
      }
    }
  }, [formData.permissions]);
  
  // Use API data for multi-select dropdowns
  const regionOptions = regionCountryOptions.regions;
  const countryOptions = regionCountryOptions.countries;
  const divisionOptions = regionCountryOptions.divisions;
  const groupOptions = regionCountryOptions.groups;
  const departmentOptions = regionCountryOptions.departments;
  const classOptions = regionCountryOptions.classes;
  const subClassOptions = regionCountryOptions.subClasses;

  // Handler functions for interactive features
  const handleModuleToggle = useMemo(
    () => createModuleToggleHandler<keyof UserFormData>({
      isReadOnly,
      enabledModules,
      selectedPermissions,
      activeModule,
      activeSubmodule,
      modulesData,
      setEnabledModules,
      setSelectedPermissions,
      setActiveModule,
      setActiveSubmodule,
      onInputChange,
      useAdvancedLogic: true
    }),
    [isReadOnly, enabledModules, selectedPermissions, activeModule, activeSubmodule, modulesData, onInputChange]
  );

  const handleModuleClick = useMemo(
    () => createModuleClickHandler(undefined, enabledModules, setActiveModule, setActiveSubmodule, true),
    [enabledModules]
  );

  const handleSubmoduleClick = useMemo(
    () => createSubmoduleClickHandler(undefined, enabledModules, setActiveModule, setActiveSubmodule, true),
    [enabledModules]
  );

  const handleSelectAllPermissions = useMemo(
    () => createSelectAllPermissionsHandler<keyof UserFormData>({
      isReadOnly,
      modulesData,
      enabledModules,
      activeModule,
      activeSubmodule,
      setSelectedPermissions,
      onInputChange,
      useStrictCheck: true
    }),
    [isReadOnly, modulesData, enabledModules, activeModule, activeSubmodule, onInputChange]
  );

  const handlePermissionToggle = useMemo(
    () => createPermissionToggleHandler<keyof UserFormData>(
      isReadOnly,
      enabledModules,
      activeModule,
      activeSubmodule,
      setSelectedPermissions,
      onInputChange
    ),
    [isReadOnly, enabledModules, activeModule, activeSubmodule, onInputChange]
  );

  

  // Handle loading, error, or no data state - return empty
  if (loading || error || !modulesData || Object.keys(modulesData).length === 0) {
    return null;
  }

  // Helper function to get dropdown configuration
  const getDropdownConfig = (field: string) => {
    const configs = {
      regions: { label: 'Region', options: regionOptions, value: formData.regions },
      countries: { label: 'Country', options: countryOptions, value: formData.countries },
      divisions: { label: 'Division', options: divisionOptions, value: formData.divisions },
      groups: { label: 'Group', options: groupOptions, value: formData.groups },
      departments: { label: 'Department', options: departmentOptions, value: formData.departments },
      classes: { label: 'Class', options: classOptions, value: formData.classes },
      subClasses: { label: 'Sub Class', options: subClassOptions, value: formData.subClasses }
    };
    
    const config = configs[field as keyof typeof configs] || null;
    console.log(`🔍 Dropdown config for ${field}:`, {
      label: config?.label,
      value: config?.value,
      valueType: typeof config?.value,
      isArray: Array.isArray(config?.value),
      valueLength: config?.value?.length,
      options: config?.options,
      optionsLength: config?.options?.length,
      firstFewOptions: config?.options?.slice(0, 3)
    });
    
    // Return config if available, otherwise return null
    return config;
  };

  // Sorting functions
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }
    
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowsVertical size={12} style={{ color: '#0051AB' }} />;
    }
    
    if (sortConfig.direction === 'asc') {
      return <ArrowUp size={12} style={{ color: '#0051AB' }} />;
    } else if (sortConfig.direction === 'desc') {
      return <ArrowDown size={12} style={{ color: '#0051AB' }} />;
    }
    
    return <ArrowsVertical size={12} style={{ color: '#0051AB' }} />;
  };

  return (
    <Box sx={userFormStyles.scrollableContainer}>
      
      {/* User Access Scope Section */}
      <Box sx={{ mb: 1, mt: -0.5 }}>
        <Typography sx={userFormStyles.sectionTitle}>
          User Access Scope
        </Typography>
        <Typography 
          sx={{
            fontFamily: "'InterTight-Regular', 'Inter Tight', sans-serif",
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: '11px',
            color: '#777B80',
            textAlign: 'left',
            mt: 0,
            mb: 0
          }}
        >
          Configure the data access by selecting the required fields.
        </Typography>
      </Box>
        
      {/* Dynamic Multi-select Dropdowns - First Row: 4 dropdowns */}
      {(() => {
        if (regionCountryLoading) {
          return null;
        }
        
        if (regionCountryError) {
          return (
            <Box sx={{ p: 2, pt: -1, textAlign: 'center' }}>
              <Typography color="error">Error loading dropdown data: {regionCountryError}</Typography>
            </Box>
          );
        }
        
        // Define the dropdowns for the Permission Tab
        const permissionDropdowns = ['regions', 'countries', 'divisions', 'groups', 'departments', 'classes', 'subClasses'];
        const firstRowDropdowns = permissionDropdowns.slice(0, 4); // 4 dropdowns in first row
        const secondRowDropdowns = permissionDropdowns.slice(4, 7); // 3 dropdowns in second row
        
        return (
          <>
            {/* First Row: 4 dropdowns (Regions, Countries, Divisions, Groups) */}
            <Box sx={{ ...userFormStyles.formRow, mb: 1.75}}>
              {firstRowDropdowns.map((field) => {
                const config = getDropdownConfig(field);
                return (
                  <ReusableMultiSelectField
                    key={field}
                    field={field}
                    config={config}
                    onInputChange={onInputChange}
                    formData={formData}
                    isReadOnly={isReadOnly}
                  />
                );
              })}
            </Box>
            
            {/* Second Row: 3 dropdowns (Departments, Classes, Sub Classes) */}
            <Box sx={{ ...userFormStyles.formRow, mb: 1.75 }}>
              {secondRowDropdowns.map((field) => {
                const config = getDropdownConfig(field);
                return (
                  <ReusableMultiSelectField
                    key={field}
                    field={field}
                    config={config}
                    onInputChange={onInputChange}
                    formData={formData}
                    isReadOnly={isReadOnly}
                  />
                );
              })}
              {/* Add empty space for the 4th position in second row */}
              <Box sx={userFormStyles.formField} />
            </Box>
          </>
        );
      })()}
        
      {/* Horizontal Divider */}
      <Box sx={{
        width: '100%',
        height: '1px',
        background: 'repeating-linear-gradient(to right, transparent, transparent 4px, #e0e0e0 4px, #e0e0e0 8px)',
        margin: '18px 0',
        flexShrink: 0,
        marginLeft: '-3px',
        marginRight: '0px',
        alignSelf: 'stretch'
      }} />

      {/* Permissions Section with Action Buttons */}
      <Box sx={{ mb: 2 }}>
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
            entityType="user"
            isReadOnly={isReadOnly}
          />
          
          {/* Action Buttons - Top Right */}
          <PermissionsActionButtons
            isReadOnly={isReadOnly}
            hasPermissionChanges={hasPermissionChanges}
            onReset={() => {
              resetPermissionState({
                initialPermissionState,
                setEnabledModules,
                setSelectedPermissions,
                setActiveModule,
                setActiveSubmodule,
                setHasPermissionChanges,
                onInputChange
              });
            }}
            onDuplicate={onDuplicateClick}
            showSortButton={true}
            SortIcon={CustomSortIcon}
          />
        </Box>
      </Box>
      {/* Permissions Table */}
      <Box sx={{ 
        border: '1px solid rgb(241 241 239)',
        borderRadius: '0px',
        backgroundColor: '#fff',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        flex: '0 0 auto'
      }}>
          {/* Table Header */}
          <Box sx={{
            display: 'flex',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #e0e0e0'
          }}>
             <Box 
               onClick={() => handleSort('modules')}
               sx={getHeaderCellStyles('30%')}
             >
              Modules
              {getSortIcon('modules')}
            </Box>
             <Box 
               onClick={() => handleSort('subModule')}
               sx={getHeaderCellStyles('25%')}
             >
              Sub Module
              {getSortIcon('subModule')}
            </Box>
             <Box 
               sx={getHeaderCellStyles('flex: 1', true)}
             >
              Permissions
            </Box>
          </Box>
          
           {/* Table Body with Column Wrapping */}
             <Box sx={{ 
             display: 'flex', 
             height: '250px',
             overflowX: 'hidden',
             width: '100%',
             maxWidth: '100%',
             boxSizing: 'border-box'
           }}>
             {/* Modules Column with Wrapping */}
             <Box sx={{ 
               width: '30%',
               maxHeight: '250px', 
               overflowY: 'auto',
               overflowX: 'hidden',
               borderRight: '1px solid #e0e0e0',
               position: 'relative',
               flexShrink: 0,
               boxSizing: 'border-box'
             }}>
               {modulesData && Object.keys(modulesData).map((module, index) => {
                 const isModuleEnabled = enabledModules.has(module);
                 const isActive = activeModule === module;
                 return (
                   <Box 
                     key={`module-${index}-${module}`}
                     onClick={() => handleModuleClick(module)}
                     sx={{
                       ...getBaseCellStyles('100%', isActive ? '#e3f2fd' : '#ffffff'),
                       position: 'relative',
                       cursor: 'pointer',
                       '&:hover': {
                         backgroundColor: COMMON_STYLES.activeBackgroundColor
                       },
                       ...(isActive && {
                         backgroundColor: COMMON_STYLES.activeBackgroundColor,
                         borderColor: COMMON_STYLES.activeBackgroundColor,
                         boxShadow: 'none'
                       })
                     }}
                   >
                      <Box sx={getModuleHeaderContainerStyles()}>
                        <Box sx={getModuleIconContainerStyles()}>
                          <ModuleIcon moduleName={module} />
                          <span style={getBaseSpanStyles()}>{module}</span>
                        </Box>
                        <Box sx={{ display: 'inline-block' }}>
                          <ToggleSwitch
                            isOn={isModuleEnabled}
                            handleToggle={() => handleModuleToggle(module)}
                            disabled={isReadOnly}
                            showPointerOnDisabled={true}
                          />
                        </Box>
                      </Box>
                   </Box>
                 );
               })}
             </Box>
             
             {/* Sub Module Column with Wrapping */}
             <Box sx={{ 
               width: '25%',
               maxHeight: '250px', 
               overflowY: 'auto',
               overflowX: 'hidden',
               borderRight: '1px solid #e0e0e0',
               position: 'relative',
               flexShrink: 0,
               boxSizing: 'border-box'
             }}>
               {/* Show default submodule placeholders when no module is active */}
               {!activeModule && (
                 <>
                   {Array.from({ length: 6 }, (_, index) => (
                     <Box 
                       key={`submodule-placeholder-${index}`}
                       sx={getPlaceholderCellStyles()}
                     >
                       <Box sx={getCellContentStyles()}>
                         <span style={getBaseSpanStyles()}>Sub Module {index + 1}</span>
                       </Box>
                     </Box>
                   ))}
                 </>
               )}
               
               {/* Show actual submodules when a module is active */}
               {activeModule && modulesData && Object.entries(modulesData).flatMap(([module, data]) => {
                 // Defensive programming - ensure data structure exists
                 if (!data?.submodules) {
                   console.warn(`Invalid data structure for module: ${module}`, data);
                   return [];
                 }
                 
                 // Only show submodules if the parent module is enabled and active
                 if (!enabledModules.has(module) || module !== activeModule) {
                   return [];
                 }
                 
                 return Object.keys(data.submodules).map((submodule, submoduleIndex) => {
                   const isActive = activeSubmodule === `${module}-${submodule}`;
                   
                   return (
                   <Box 
                     key={`${module}-${submodule}-${submoduleIndex}`}
                     onClick={() => handleSubmoduleClick(module, submodule)}
                     sx={{
                       position: 'relative',
                       left: '0px',
                       top: '0px',
                       width: '100%',
                       height: '40px',
                       background: 'inherit',
                       backgroundColor: isActive ? '#e8f5e8' : '#ffffff',
                       boxSizing: 'border-box',
                       borderWidth: '1px',
                       borderStyle: 'solid',
                       borderColor: 'rgba(242, 242, 240, 1)',
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
                       '&:hover': {
                         backgroundColor: 'rgba(242, 242, 240, 1)'
                       },
                       ...(isActive && {
                         backgroundColor: 'rgba(242, 242, 240, 1)',
                         borderColor: 'rgba(242, 242, 240, 1)',
                         boxShadow: 'none'
                       })
                     }}
                   >
                       <Box sx={getCellContentStyles()}>
                          <span style={getBaseSpanStyles()}>{submodule}</span>
                       </Box>
                   </Box>
                 );
                 });
               })}
             </Box>
             
             {/* Permissions Column with Vertical Layout */}
             <Box sx={{ 
               flex: 1,
               maxHeight: '250px', 
               overflowY: 'auto',
               overflowX: 'hidden',
               flexShrink: 0,
               boxSizing: 'border-box'
             }}>
               {/* Show default permission placeholders when no submodule is active */}
               {!activeSubmodule && (
                 <>
                   {Array.from({ length: 6 }, (_, index) => (
                     <Box 
                       key={`permission-placeholder-${index}`}
                       sx={getPlaceholderCellStyles()}
                     >
                       <Box sx={getCellContentStyles()}>
                         <span style={getBaseSpanStyles()}>Permission</span>
                       </Box>
                     </Box>
                   ))}
                 </>
               )}
               
               {/* Show actual permissions when a submodule is active */}
               {activeSubmodule && modulesData && (() => {
                 console.log('Rendering permissions for activeSubmodule:', activeSubmodule);
                 // Find the active submodule's data
                 const [activeModuleName, activeSubmoduleName] = activeSubmodule.split('-');
                 const moduleData = modulesData[activeModuleName];
                 
                 console.log('Module data:', { activeModuleName, activeSubmoduleName, moduleData });
                 
                 if (!moduleData?.submodules || !enabledModules.has(activeModuleName)) {
                   console.log('Module not found or not enabled:', { moduleData, enabledModules: Array.from(enabledModules) });
                   return null;
                 }
                 
                 const submoduleData = moduleData.submodules[activeSubmoduleName];
                 console.log('Submodule data:', submoduleData);
                 
                 if (!submoduleData || !Array.isArray(submoduleData)) {
                   console.warn(`Invalid permissions structure for ${activeSubmodule}:`, submoduleData);
                   return null;
                 }
                 
                 const permissions = submoduleData;
                 const key = activeSubmodule;
                 const currentPermissions = Array.from(selectedPermissions).filter(perm => 
                   perm.startsWith(`${key}-`)
                 );
                 const isAllSelected = currentPermissions.length === permissions.length && permissions.length > 0;
                 const isModuleEnabled = enabledModules.has(activeModuleName);
                 
                 return (
                   <Box 
                     key={key}
                     sx={getPermissionsContainerStyles()}
                   >
                     {/* Select All Checkbox - Show for active submodule */}
                     {isModuleEnabled && permissions.length > 0 && (
                       <Box sx={getCheckboxContainerStyles()}>
                         <CustomCheckbox
                           checked={isAllSelected}
                           onChange={() => handleSelectAllPermissions(activeModuleName, activeSubmoduleName)}
                           label="Select All"
                           disabled={isReadOnly}
                           sx={getCheckboxStyles()}
                         />
                       </Box>
                     )}
                     
                     {/* Individual Permission Checkboxes - Simple vertical list */}
                     <Box>
                       {permissions.map((permission) => (
                         <PermissionRow
                           key={permission}
                           permission={permission}
                           isChecked={selectedPermissions.has(`${key}-${permission}`)}
                           isDisabled={isReadOnly || !isModuleEnabled}
                           onToggle={() => handlePermissionToggle(activeModuleName, activeSubmoduleName, permission)}
                         />
                       ))}
                     </Box>
                   </Box>
                 );
               })()}
             </Box>
           </Box>
      </Box>
    </Box>
  );
};

export default PermissionsTabLayout;
