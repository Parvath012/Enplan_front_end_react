import React, { useState, useEffect } from 'react';
import { Box, Menu, MenuItem, ListItemIcon, ListItemText, Divider, Typography, Tabs, Tab, Tooltip, TextField as MuiTextField } from '@mui/material';
import { ArrowUp, Asterisk, Checkmark, FlashOff, Help, Play, Stop, WarningAlt, WarningOther, WatsonHealthCdArchive, SettingsServices, List, PortInput, Flash, CaretRight, ChartLine, CenterToFit, GroupObjects, Copy, SubtractAlt, TrashCan, Add, InformationFilled, DocumentProcessor, ArrowShiftDown } from '@carbon/icons-react';
import NotificationAlert from 'commonApp/NotificationAlert';
import Panel from 'commonApp/Panel';
import CustomCheckbox from 'commonApp/CustomCheckbox';
import { nifiApiService } from '../../api/nifi/nifiApiService';
import { TOOLTIP_CONFIG } from '../../constants/tooltipStyles';
import './ProcessGroupBox.css';
import './ProcessGroupBox.scss';
import { IconWithCount, StatRow } from './ProcessGroupBoxUtils';
import { mapExecutionEngineFromAPI, mapFlowFileConcurrencyFromAPI, loadParameterContext } from './processGroupUtils';
import { getDefaultConfigValues, createInitialValuesFromComponent, LABEL_STYLE, TEXT_FIELD_SX } from './processGroupConfigUtils';
import FormFieldLabel from './FormFieldLabel';
import FormFieldWithTooltip from './FormFieldWithTooltip';
import StandardTextField from './StandardTextField';
import StandardSelectField from './StandardSelectField';

interface ProcessGroupBoxProps {
  id: string;
  name: string;
  position: { x: number; y: number };
  runningCount: number;
  stoppedCount: number;
  invalidCount: number;
  disabledCount: number;
  activeRemotePortCount: number;
  inactiveRemotePortCount: number;
  queued: string;
  input: string;
  read: string;
  written: string;
  output: string;
  upToDateCount: number;
  locallyModifiedCount: number;
  staleCount: number;
  locallyModifiedAndStaleCount: number;
  syncFailureCount: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onClick?: (id: string, name: string) => void;
  isDragging: boolean;
  isSelected?: boolean;
  onDelete?: () => void;
  onCopy?: () => void;
  onConfigure?: () => void;
  parentGroupId?: string;
  triggerConfigure?: number;
  // Processor-specific optional props
  isProcessor?: boolean;
  processorType?: string;
  bundleGroup?: string;
  bundleArtifact?: string;
  bundleVersion?: string;
  taskTime?: string;
}


const ProcessGroupBox: React.FC<ProcessGroupBoxProps> = ({
  id,
  name,
  runningCount,
  stoppedCount,
  invalidCount,
  disabledCount,
  activeRemotePortCount,
  inactiveRemotePortCount,
  queued,
  input,
  read,
  written,
  output,
  upToDateCount,
  locallyModifiedCount,
  staleCount,
  locallyModifiedAndStaleCount,
  syncFailureCount,
  onMouseDown,
  onDoubleClick,
  onClick,
  isDragging,
  isSelected = false,
  onDelete,
  onCopy,
  onConfigure,
  parentGroupId,
  triggerConfigure,
  isProcessor = false,
  processorType = '',
  bundleGroup = '',
  bundleArtifact = '',
  bundleVersion = '',
  taskTime = '0 / 00:00:00.000',
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [versionAnchorEl, setVersionAnchorEl] = useState<null | HTMLElement>(null);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [isVersionHovered, setIsVersionHovered] = useState(false);
  const [isSubmenuHovered, setIsSubmenuHovered] = useState(false);
  const [isDownloadHovered, setIsDownloadHovered] = useState(false);
  const [isDownloadSubmenuHovered, setIsDownloadSubmenuHovered] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [isBoxDisabled, setIsBoxDisabled] = useState(false);
  const [showConfigurationSlider, setShowConfigurationSlider] = useState(false);
  const [configTabValue, setConfigTabValue] = useState(0);
  
  // Configuration form state
  const [configName, setConfigName] = useState(name);
  const [parameterContext, setParameterContext] = useState('');
  const [applyRecursively, setApplyRecursively] = useState(false);
  const [executionEngine, setExecutionEngine] = useState('Inherited');
  const [flowFileConcurrency, setFlowFileConcurrency] = useState('Single Batch Per Node');
  const [defaultFlowFileExpiration, setDefaultFlowFileExpiration] = useState('0 Sec');
  const [defaultBackPressureObjectThreshold, setDefaultBackPressureObjectThreshold] = useState('10000');
  const [comments, setComments] = useState('');
  
  // Initial values to track changes
  const [initialValues, setInitialValues] = useState<{
    configName: string;
    parameterContext: string;
    applyRecursively: boolean;
    executionEngine: string;
    flowFileConcurrency: string;
    defaultFlowFileExpiration: string;
    defaultBackPressureObjectThreshold: string;
    comments: string;
  } | null>(null);
  
  const menuOpen = Boolean(anchorEl);
  const versionMenuOpen = Boolean(versionAnchorEl);
  const downloadMenuOpen = Boolean(downloadAnchorEl);

  // Auto-close Version submenu when not hovering on either the menu item or submenu
  useEffect(() => {
    if (!isVersionHovered && !isSubmenuHovered && versionAnchorEl) {
      const timeout = setTimeout(() => {
        setVersionAnchorEl(null);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [isVersionHovered, isSubmenuHovered, versionAnchorEl]);

  // Auto-close Download submenu when not hovering on either the menu item or submenu
  useEffect(() => {
    if (!isDownloadHovered && !isDownloadSubmenuHovered && downloadAnchorEl) {
      const timeout = setTimeout(() => {
        setDownloadAnchorEl(null);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [isDownloadHovered, isDownloadSubmenuHovered, downloadAnchorEl]);

  // Reset configuration form when slider closes or process group changes
  useEffect(() => {
    if (!showConfigurationSlider) {
      setConfigTabValue(0);
      setConfigName(name);
      setParameterContext('');
      setApplyRecursively(false);
      setExecutionEngine('Inherited');
      setFlowFileConcurrency('Single Batch Per Node');
      setDefaultFlowFileExpiration('0 Sec');
      setDefaultBackPressureObjectThreshold('10000');
      setComments('');
    }
  }, [showConfigurationSlider, name]);

  // Update config name when process group name changes
  useEffect(() => {
    if (showConfigurationSlider) {
      setConfigName(name);
    }
  }, [name, showConfigurationSlider]);


  // Helper to load component data into state
  const loadComponentData = (component: any) => {
    if (component.name) {
      setConfigName(component.name);
    }
    
    setComments(component.comments ?? '');
    
    if (component.executionEngine) {
      setExecutionEngine(mapExecutionEngineFromAPI(component.executionEngine));
    }
    
    if (component.flowfileConcurrency) {
      setFlowFileConcurrency(mapFlowFileConcurrencyFromAPI(component.flowfileConcurrency));
    }
    
    if (component.defaultFlowFileExpiration) {
      setDefaultFlowFileExpiration(component.defaultFlowFileExpiration);
    }
    
    if (component.defaultBackPressureObjectThreshold !== undefined) {
      setDefaultBackPressureObjectThreshold(String(component.defaultBackPressureObjectThreshold));
    }
    
    const loadedParameterContext = loadParameterContext(component.parameterContext);
    setParameterContext(loadedParameterContext);
    
    // Store initial values after loading all data
    setInitialValues(createInitialValuesFromComponent(component, name));
  };

  // Load process group configuration when slider opens
  useEffect(() => {
    const loadProcessGroupConfig = async () => {
      if (!showConfigurationSlider) {
        setInitialValues(null);
        return;
      }
      
      try {
        console.log('Loading process group configuration for:', id);
        const processGroup = await nifiApiService.getProcessGroup(id);
        
        if (processGroup?.component) {
          loadComponentData(processGroup.component);
        }
      } catch (error) {
        console.error('Failed to load process group configuration:', error);
        // On error, keep default values and set initial values to defaults
        setInitialValues(getDefaultConfigValues(name));
      }
    };
    
    loadProcessGroupConfig();
  }, [showConfigurationSlider, id, name]);

  // Trigger configure when triggerConfigure prop changes (from toolbar)
  // Only for process groups, not processors
  useEffect(() => {
    if (!isProcessor && triggerConfigure !== undefined && triggerConfigure > 0) {
      setShowConfigurationSlider(true);
      if (onConfigure) {
        onConfigure();
      }
    }
  }, [triggerConfigure, onConfigure, isProcessor]);

  const handleMenuClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    // Select the box when clicking on the three dots menu (even if disabled, for visual feedback)
    if (onClick) {
      onClick(id, name);
    }
    // Allow menu to open even when box is disabled (so Enable can be accessed)
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setAnchorEl(null);
    // Also close any open submenus
    setVersionAnchorEl(null);
    setDownloadAnchorEl(null);
  };

  // Close any open submenus when hovering on a regular menu item
  const handleRegularMenuItemHover = () => {
    setIsVersionHovered(false);
    setIsDownloadHovered(false);
    setVersionAnchorEl(null);
    setDownloadAnchorEl(null);
  };

  const handleVersionMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    // Close download submenu when opening version
    setIsDownloadHovered(false);
    setDownloadAnchorEl(null);
    // Open version submenu
    setIsVersionHovered(true);
    setVersionAnchorEl(event.currentTarget);
  };

  const handleVersionMouseLeave = () => {
    setIsVersionHovered(false);
  };

  const handleSubmenuMouseEnter = () => {
    setIsSubmenuHovered(true);
  };

  const handleSubmenuMouseLeave = () => {
    setIsSubmenuHovered(false);
  };

  const handleDownloadMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    // Close version submenu when opening download
    setIsVersionHovered(false);
    setVersionAnchorEl(null);
    // Open download submenu
    setIsDownloadHovered(true);
    setDownloadAnchorEl(event.currentTarget);
  };

  const handleDownloadMouseLeave = () => {
    setIsDownloadHovered(false);
  };

  const handleDownloadSubmenuMouseEnter = () => {
    setIsDownloadSubmenuHovered(true);
  };

  const handleDownloadSubmenuMouseLeave = () => {
    setIsDownloadSubmenuHovered(false);
  };

  const handleCopyProcessGroup = async () => {
    console.log(`Copying process group: ${id} (${name})`);
    
    if (!parentGroupId) {
      console.error('Parent group ID is required for copy operation');
      return;
    }
    
    try {
      // Call the copy API
      await nifiApiService.copyProcessGroup(parentGroupId, [id]);
      
      console.log('Process group copied successfully');
      
      // Notify parent component to refresh the list
      if (onCopy) {
        onCopy();
      }
    } catch (error) {
      console.error('Failed to copy process group:', error);
      // You could show an error notification here
    }
  };

  const handleStartProcessGroup = async () => {
    console.log(`Starting process group: ${id} (${name})`);
    
    try {
      // Call the start API
      await nifiApiService.startProcessGroup(id);
      
      console.log('Process group started successfully');
      
      // Notify parent component to refresh the list
      if (onCopy) {
        onCopy(); // Reusing onCopy as a refresh callback
      }
    } catch (error) {
      console.error('Failed to start process group:', error);
      // You could show an error notification here
    }
  };

  const handleStopProcessGroup = async () => {
    console.log(`Stopping process group: ${id} (${name})`);
    
    try {
      // Call the stop API
      await nifiApiService.stopProcessGroup(id);
      
      console.log('Process group stopped successfully');
      
      // Notify parent component to refresh the list
      if (onCopy) {
        onCopy(); // Reusing onCopy as a refresh callback
      }
    } catch (error) {
      console.error('Failed to stop process group:', error);
      // You could show an error notification here
    }
  };

  const handleEnableProcessGroup = async () => {
    console.log(`Enabling process group: ${id} (${name})`);
    
    try {
      // Call the enable API
      await nifiApiService.enableProcessGroup(id);
      
      console.log('Process group enabled successfully');
      
      // Re-enable the box
      setIsBoxDisabled(false);
      
      // Notify parent component to refresh the list
      if (onCopy) {
        onCopy(); // Reusing onCopy as a refresh callback
      }
    } catch (error) {
      console.error('Failed to enable process group:', error);
      // You could show an error notification here
    }
  };

  const handleDisableProcessGroup = async () => {
    console.log(`Disabling process group: ${id} (${name})`);
    
    try {
      // Call the disable API
      await nifiApiService.disableProcessGroup(id);
      
      console.log('Process group disabled successfully');
      
      // Disable the box
      setIsBoxDisabled(true);
      
      // Notify parent component to refresh the list
      if (onCopy) {
        onCopy(); // Reusing onCopy as a refresh callback
      }
    } catch (error) {
      console.error('Failed to disable process group:', error);
      // You could show an error notification here
    }
  };

  const handleDeleteConfirm = async () => {
    console.log(`Deleting process group: ${id} (${name})`);
    try {
      // Call the delete API
      await nifiApiService.deleteProcessGroup(id);
      
      console.log('Process group deleted successfully');
      
      // Notify parent component to refresh the list
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Failed to delete process group:', error);
      // You could show an error notification here
    } finally {
      setShowDeleteWarning(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteWarning(false);
  };

  const handleConfigReset = () => {
    setConfigName(name);
    setParameterContext('');
    setApplyRecursively(false);
    setExecutionEngine('Inherited');
    setFlowFileConcurrency('Unbounded');
    setDefaultFlowFileExpiration('0 Sec');
    setDefaultBackPressureObjectThreshold('10000');
    setComments('');
  };

  const handleConfigApply = async () => {
    try {
      console.log('Process Group Configuration Applied:', {
        name: configName,
        parameterContext,
        applyRecursively,
        executionEngine,
        flowFileConcurrency,
        defaultFlowFileExpiration,
        defaultBackPressureObjectThreshold,
        comments,
      });

      // Call API to update process group configuration
      await nifiApiService.updateProcessGroupConfiguration(
        id,
        {
          name: configName,
          parameterContextId: parameterContext || undefined,
          applyRecursively,
          executionEngine,
          flowFileConcurrency,
          defaultFlowFileExpiration,
          defaultBackPressureObjectThreshold,
          comments: comments || '',
        }
      );

      console.log('Process group configuration updated successfully');
      
      // Close the slider first for immediate UI feedback
      setShowConfigurationSlider(false);
      
      // Notify parent component to refresh the list to show updated data immediately
      // This will fetch the latest process group data from the API
      if (onCopy) {
        onCopy(); // Reusing onCopy as a refresh callback
      }
    } catch (error) {
      console.error('Failed to update process group configuration:', error);
      // Error notification is handled by the error state in the component
    }
  };

  const handleConfigTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setConfigTabValue(newValue);
  };

  // Helper to check if values have changed from initial values
  const checkValuesChanged = (): boolean => {
    if (!initialValues) return false;
    return configName.trim() !== initialValues.configName.trim() ||
      parameterContext !== initialValues.parameterContext ||
      applyRecursively !== initialValues.applyRecursively ||
      executionEngine !== initialValues.executionEngine ||
      flowFileConcurrency !== initialValues.flowFileConcurrency ||
      defaultFlowFileExpiration.trim() !== initialValues.defaultFlowFileExpiration.trim() ||
      defaultBackPressureObjectThreshold.trim() !== initialValues.defaultBackPressureObjectThreshold.trim() ||
      comments !== initialValues.comments;
  };

  // Check if all mandatory fields are filled AND if values have changed
  // Mandatory fields: Name, Execution Engine, Process Group FlowFile Concurrency, 
  // Default FlowFile Expiration, Default Back Pressure Object Threshold
  const hasMandatoryFieldsFilled = 
    configName.trim() && 
    executionEngine?.trim() && 
    flowFileConcurrency?.trim() && 
    defaultFlowFileExpiration.trim() && 
    defaultBackPressureObjectThreshold.trim();
  
  // Check if any values have changed from initial values
  const hasValuesChanged = checkValuesChanged();
  
  // Apply button is disabled if mandatory fields are not filled OR no changes have been made
  const isApplyDisabled = !hasMandatoryFieldsFilled || !hasValuesChanged;

  // Action handler map to reduce cognitive complexity
  const actionHandlers: Record<string, () => Promise<void> | void> = {
    'delete': () => {
      setShowDeleteWarning(true);
    },
    'copy': handleCopyProcessGroup,
    'start': handleStartProcessGroup,
    'stop': handleStopProcessGroup,
    'enable': handleEnableProcessGroup,
    'disable': handleDisableProcessGroup,
    'configure': () => {
      // Only open configure slider for process groups, not processors
      if (!isProcessor) {
        setShowConfigurationSlider(true);
        if (onConfigure) {
          onConfigure();
        }
      }
    },
  };

  const handleMenuItemClick = async (action: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const handler = actionHandlers[action];
    if (handler) {
      await handler();
    } else {
      console.log(`Action: ${action} for process group: ${id}`);
    }
    
    handleMenuClose();
  };

  const isClickOnMenu = (target: HTMLElement): boolean => {
    return Boolean(target.closest('.MuiMenu-root') || target.closest('.MuiMenuItem-root'));
  };

  const handleBoxClick = (e: React.MouseEvent) => {
    if (isBoxDisabled) {
      e.stopPropagation();
      return;
    }
    
    console.log('=== CLICK EVENT FIRED ===', name);
    
    const target = e.target as HTMLElement;
    if (isClickOnMenu(target)) {
      console.log('Clicked on menu, ignoring');
      return;
    }
    
    // Stop propagation to prevent container click from deselecting
    e.stopPropagation();
    
    if (onClick) {
      console.log('Calling parent onClick for', name);
      onClick(id, name);
    }
  };

  const handleBoxMouseDown = (e: React.MouseEvent) => {
    if (isBoxDisabled) {
      e.stopPropagation();
      return;
    }
    
    console.log('MouseDown event for', name);
    if (onMouseDown) {
      onMouseDown(e);
    }
  };

  const handleBoxDoubleClick = (e: React.MouseEvent) => {
    if (isBoxDisabled) {
      e.stopPropagation();
      return;
    }
    
    const target = e.target as HTMLElement;
    
    // Only prevent double click on the menu button and menu items
    // Allow double click everywhere else on the box (text, icons, statistics, etc.)
    const isMenuButton = target.closest('[data-menu-button]') !== null ||
                         target.closest('.process-group-menu') !== null ||
                         target.closest('.MuiMenu-root') !== null ||
                         target.closest('[role="menuitem"]') !== null;
    
    if (isMenuButton) {
      // Click was on menu button or menu, don't trigger double click
      return;
    }
    
    // Stop propagation to prevent container from handling it
    e.stopPropagation();
    
    if (onDoubleClick) {
      onDoubleClick(e);
    }
  };

  const getBoxClassName = (): string => {
    const classes = ['process-group-box'];
    if (isDragging) classes.push('dragging');
    if (isSelected) classes.push('selected');
    if (isBoxDisabled) classes.push('disabled');
    return classes.join(' ');
  };

  const getBoxStyles = () => {
    const baseStyles = {
      width: '360px',
      height: '200px',
      borderRadius: '8px',
      userSelect: 'none' as const,
      fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden' as const,
      flexShrink: 0,
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, opacity 0.2s ease',
      cursor: 'pointer' as const,
    };

    const selectedStyles = isSelected ? {
      border: '1px solid #1976d2',
      boxShadow: '0 0 0 1px #1976d2, 0 2px 4px rgba(0, 0, 0, 0.15)',
    } : {
      border: '1px solid #d0d0d0',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
    };

    const disabledStyles = isBoxDisabled ? {
      backgroundColor: '#f5f5f5',
      cursor: 'not-allowed' as const,
    } : {
      backgroundColor: '#ffffff',
      cursor: 'pointer' as const,
    };

    const hoverStyles = isBoxDisabled ? {
      '&:hover': {
        border: '1px solid #d0d0d0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
      },
    } : {
      '&:hover': {
        border: '1px solid #1976d2',
        boxShadow: '0 0 0 1px #1976d2, 0 2px 4px rgba(0, 0, 0, 0.15)',
      },
    };

    return {
      ...baseStyles,
      ...selectedStyles,
      ...disabledStyles,
      ...hoverStyles,
      '& > *:not([data-menu-container]):not([data-menu-button])': {
        pointerEvents: isBoxDisabled ? 'none' as const : 'auto' as const,
        opacity: isBoxDisabled ? 0.6 : 1,
      },
    };
  };

  return (
    <Box
      className={getBoxClassName()}
      data-selected={isSelected}
      data-box-id={id}
      data-disabled={isBoxDisabled}
      onMouseDown={handleBoxMouseDown}
      onClick={handleBoxClick}
      onDoubleClick={handleBoxDoubleClick}
      sx={getBoxStyles()}
    >
      {/* Header - Different for Processors vs Process Groups */}
      {isProcessor ? (
        <Box
          sx={{
            backgroundColor: '#ffffff',
            padding: '6px 12px',
            borderBottom: '1px solid #e8e8e8',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '4px',
            position: 'relative',
          }}
        >
          {/* Left Icons - Document icon first, then warning icon side by side */}
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'flex-start', flexShrink: 0, paddingTop: '0px' }}>
            <DocumentProcessor size={20} style={{ color: '#8a8a8a', marginTop: '13px', marginLeft: '0px' }} />
            <WarningAlt size={12} style={{ color: '#8a8a8a', marginTop: '1px' }} />
          </Box>
          
          {/* Name and Details */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: '10px',
                fontWeight: '600',
                color: '#262626',
                fontFamily: 'Roboto, Arial, sans-serif',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginBottom: '2px',
                textAlign: 'left',
              }}
            >
              {name}
            </Typography>
            <Typography
              sx={{
                fontSize: '10px',
                color: '#5a5a5a',
                fontFamily: 'Roboto, Arial, sans-serif',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginBottom: '2px',
                textAlign: 'left',
              }}
            >
              {processorType ? (processorType.split('.').pop() ?? processorType) : name} {bundleVersion ?? ''}
            </Typography>
            {bundleGroup && bundleArtifact && (
              <Typography
                sx={{
                  fontSize: '10px',
                  color: '#8a8a8a',
                  fontFamily: 'Roboto, Arial, sans-serif',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textAlign: 'left',
                }}
              >
                {bundleGroup} - {bundleArtifact}
              </Typography>
            )}
          </Box>
          
          {/* Right Arrow (ArrowShiftDown rotated 90 degrees left) */}
          <ArrowShiftDown 
            size={20} 
            style={{ 
              color: '#8a8a8a', 
              borderWidth: '0px',
              flexShrink: 0,
              marginTop: '13px',
              width: '20px',
              height: '20px',
              transform: 'rotate(-90deg)'
            }} 
          />
        </Box>
      ) : (
        <>
          {/* Header with Name */}
          <Box
            sx={{
              backgroundColor: '#ffffff',
              padding: '6px 12px',
              borderBottom: '1px solid #e8e8e8',
            }}
          >
            <Typography
              sx={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#262626',
                fontFamily: 'Roboto, Arial, sans-serif',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'left',
              }}
            >
              {name}
            </Typography>
          </Box>

          {/* Status Icons Row */}
          <Box
            sx={{
              display: 'flex',
              gap: '4px',
              padding: '6px 12px',
              backgroundColor: 'rgba(250, 250, 249, 1)',
              borderBottom: '1px solid #e8e8e8',
              fontSize: '11px',
              color: '#5a5a5a',
              alignItems: 'center',
            }}
          >
            <IconWithCount 
              icon={<WatsonHealthCdArchive size={18} style={{ color: '#5a5a5a' }} />}
              count={activeRemotePortCount}
              title="Transmitting Remote Process Groups"
            />
            <IconWithCount 
              icon={<img src="icons/Name=cd--archive--disabled.svg" alt="Not Transmitting" style={{ width: '18px', height: '18px', color: '#5a5a5a' }} />}
              count={inactiveRemotePortCount}
              title="Not Transmitting Remote Process Groups"
            />
            <IconWithCount 
              icon={<Play size={18} style={{ color: '#5a5a5a' }} />}
              count={runningCount}
              title="Running"
            />
            <IconWithCount 
              icon={<Stop size={18} style={{ color: '#5a5a5a' }} />}
              count={stoppedCount}
              title="Stopped"
            />
            <IconWithCount 
              icon={<WarningAlt size={18} style={{ color: '#5a5a5a' }} />}
              count={invalidCount}
              title="Invalid"
            />
            <IconWithCount 
              icon={<FlashOff size={18} style={{ color: '#5a5a5a' }} />}
              count={disabledCount}
              title="Disabled"
              includeDivider={false}
            />
          </Box>
        </>
      )}

      {/* Statistics Section */}
      <Box
        sx={{
          padding: '6px 12px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e8e8e8',
        }}
      >
        {isProcessor ? (
          <>
            <StatRow label="In:" value={input} />
            <StatRow label="Read/Write:" value={<>{read} / {written}</>} highlighted />
            <StatRow label="Out:" value={output} />
            <StatRow label="Task/Time:" value={taskTime} isLast highlighted />
          </>
        ) : (
          <>
            <StatRow label="Queued:" value={queued} />
            <StatRow label="In:" value={<>{input} → 0</>} />
            <StatRow label="Read/Write:" value={<>{read} / {written}</>} />
            <StatRow label="Out:" value={<>0 → {output}</>} isLast />
          </>
        )}
      </Box>

      {/* Bottom Icons Row */}
      <Box
        data-menu-container
        sx={{
          display: 'flex',
          gap: '4px',
      padding: '6px 12px',
          backgroundColor: 'rgba(250, 250, 249, 1)',
          fontSize: '11px',
          color: '#5a5a5a',
          alignItems: 'center',
          pointerEvents: 'auto', // Always allow menu container to be interactive
        }}
      >
      {/* Footer Icons - Only show for process groups, not processors */}
      {!isProcessor && (
        <Box
          sx={{
            display: 'flex',
            gap: '4px',
            alignItems: 'center',
            opacity: isBoxDisabled ? 0.6 : 1,
            pointerEvents: isBoxDisabled ? 'none' : 'auto',
          }}
        >
          <IconWithCount 
            icon={<Checkmark size={18} style={{ color: '#5a5a5a' }} />}
            count={upToDateCount}
            title="Up to Date"
          />
          <IconWithCount 
            icon={<Asterisk size={18} style={{ color: '#5a5a5a' }} />}
            count={locallyModifiedCount}
            title="Locally Modified"
          />
          <IconWithCount 
            icon={<ArrowUp size={18} style={{ color: '#5a5a5a' }} />}
            count={staleCount}
            title="Stale"
          />
          <IconWithCount 
            icon={<WarningOther size={18} style={{ color: '#5a5a5a' }} />}
            count={locallyModifiedAndStaleCount}
            title="Locally Modified & Stale"
          />
          <IconWithCount 
            icon={<Help size={18} style={{ color: '#5a5a5a' }} />}
            count={syncFailureCount}
            title="Sync Failure"
            includeDivider={false}
          />
        </Box>
      )}
      
      {/* More Options Menu - Always visible and functional */}
      <Box
        data-menu-button
        onClick={handleMenuClick}
        sx={{
          marginLeft: 'auto',
          cursor: 'pointer',
          padding: '2px 4px',
          pointerEvents: 'auto !important', // Always allow menu to be clickable
          opacity: '1 !important', // Always fully visible
          visibility: 'visible !important', // Ensure visibility
          display: 'flex !important', // Ensure display
          zIndex: 10, // Ensure it's on top
          '&:hover': { backgroundColor: '#f5f5f5', borderRadius: '2px' },
        }}
      >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
            <circle cx="9" cy="4" r="1.5" fill="#5a5a5a"/>
            <circle cx="9" cy="9" r="1.5" fill="#5a5a5a"/>
            <circle cx="9" cy="14" r="1.5" fill="#5a5a5a"/>
          </svg>
      </Box>
      </Box>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={(event: any) => handleMenuClose(event)}
        onClick={(e) => e.stopPropagation()}
        className="process-group-menu"
        disableAutoFocusItem={true}
        slotProps={{
          list: {
            className: 'process-group-menu__list',
          },
          paper: {
            className: 'process-group-menu__paper',
          }
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem 
          disableRipple
          disabled={!isSelected || isProcessor}
          className="process-group-menu__item"
          onClick={(e) => handleMenuItemClick('configure', e)}
          onMouseEnter={handleRegularMenuItemHover}
        >
          <ListItemIcon className="process-group-menu__icon">
            <SettingsServices size={16} />
          </ListItemIcon>
          <ListItemText 
            primary="Configure" 
            className="process-group-menu__text"
          />
        </MenuItem>

        <MenuItem 
          disableRipple
          disabled
          className="process-group-menu__item"
          onClick={(e) => handleMenuItemClick('parameters', e)}
          onMouseEnter={handleRegularMenuItemHover}
        >
          <ListItemIcon className="process-group-menu__icon">
            <svg width="16" height="16" viewBox="0 -960 960 960" fill="currentColor">
              <path d="M212.31-140q-29.92 0-51.12-21.19Q140-182.39 140-212.31v-535.38q0-29.92 21.19-51.12Q182.39-820 212.31-820h535.38q29.92 0 51.12 21.19Q820-777.61 820-747.69v535.38q0 29.92-21.19 51.12Q777.61-140 747.69-140H212.31Zm0-60h535.38q5.39 0 8.85-3.46t3.46-8.85V-680H200v467.69q0 5.39 3.46 8.85t8.85 3.46ZM280-490v-60h400v60H280Zm0 160v-60h240v60H280Z"/>
            </svg>
          </ListItemIcon>
          <ListItemText 
            primary="Parameters" 
            className="process-group-menu__text"
          />
        </MenuItem>

        <MenuItem 
          disableRipple
          disabled
          className="process-group-menu__item"
          onClick={(e) => handleMenuItemClick('controller-services', e)}
          onMouseEnter={handleRegularMenuItemHover}
        >
          <ListItemIcon className="process-group-menu__icon">
            <List size={16} />
          </ListItemIcon>
          <ListItemText 
            primary="Controller Services" 
            className="process-group-menu__text"
          />
        </MenuItem>

        <MenuItem 
          disableRipple
          disabled
          className="process-group-menu__item process-group-menu__item--with-submenu"
          onMouseEnter={handleVersionMouseEnter}
          onMouseLeave={handleVersionMouseLeave}
          sx={{ 
            cursor: 'pointer !important',
            userSelect: 'none !important',
            backgroundColor: (isVersionHovered && !isSubmenuHovered) 
              ? 'rgba(0, 0, 0, 0.04) !important' 
              : 'transparent',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04) !important',
            },
            '& *': {
              cursor: 'pointer !important',
              userSelect: 'none !important',
            }
          }}
        >
          <ListItemIcon className="process-group-menu__icon" sx={{ cursor: 'pointer !important' }}>
            {/* Empty space to maintain alignment */}
            <Box sx={{ width: '16px', height: '16px', cursor: 'pointer !important' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Version" 
            className="process-group-menu__text"
            sx={{ cursor: 'pointer !important' }}
          />
          <CaretRight size={16} className="process-group-menu__submenu-icon" style={{ cursor: 'pointer' }} />
        </MenuItem>

        {/* Version Submenu */}
        <Menu
          anchorEl={versionAnchorEl}
          open={versionMenuOpen}
          onClose={() => {}}
          keepMounted
          className="process-group-menu process-group-submenu"
        slotProps={{
          list: {
            className: 'process-group-menu__list',
            onMouseEnter: handleSubmenuMouseEnter,
            onMouseLeave: handleSubmenuMouseLeave,
          },
          paper: {
            className: 'process-group-menu__paper',
            onMouseEnter: handleSubmenuMouseEnter,
            onMouseLeave: handleSubmenuMouseLeave,
            style: {
              marginLeft: '-2px',
              opacity: 1,
              transform: 'none',
              transition: 'none',
              animation: 'none',
              visibility: versionMenuOpen ? 'visible' : 'hidden',
              pointerEvents: versionMenuOpen ? 'auto' : 'none',
            }
          },
          transition: {
            timeout: 0,
            style: { transition: 'none' }
          }
        }}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        transitionDuration={0}
          disableAutoFocusItem
          disableEnforceFocus
          disableRestoreFocus
          hideBackdrop
          disableScrollLock
        >
          <MenuItem 
            className="process-group-menu__item"
            onClick={(e) => {
              handleMenuItemClick('start-version-control', e);
            }}
          >
            <ListItemIcon className="process-group-menu__icon">
              <SettingsServices size={16} />
            </ListItemIcon>
            <ListItemText 
              primary="Start Version Control" 
              className="process-group-menu__text"
            />
          </MenuItem>
        </Menu>

        <Divider className="process-group-menu__divider" />

        <MenuItem 
          disableRipple
          disabled
          className="process-group-menu__item"
          onClick={(e) => handleMenuItemClick('enter-group', e)}
          onMouseEnter={handleRegularMenuItemHover}
        >
          <ListItemIcon className="process-group-menu__icon">
            <PortInput size={16} />
          </ListItemIcon>
          <ListItemText 
            primary="Enter Group" 
            className="process-group-menu__text"
          />
        </MenuItem>

        <Divider className="process-group-menu__divider" />

        <MenuItem 
          disableRipple
          className="process-group-menu__item"
          onClick={(e) => handleMenuItemClick('start', e)}
          onMouseEnter={handleRegularMenuItemHover}
        >
          <ListItemIcon className="process-group-menu__icon">
            <Play size={16} />
          </ListItemIcon>
          <ListItemText 
            primary="Start" 
            className="process-group-menu__text"
          />
        </MenuItem>

        <MenuItem 
          disableRipple
          className="process-group-menu__item"
          onClick={(e) => handleMenuItemClick('stop', e)}
          onMouseEnter={handleRegularMenuItemHover}
        >
          <ListItemIcon className="process-group-menu__icon">
            <Stop size={16} />
          </ListItemIcon>
          <ListItemText 
            primary="Stop" 
            className="process-group-menu__text"
          />
        </MenuItem>

        <Divider className="process-group-menu__divider" />

        <MenuItem 
          disableRipple
          className="process-group-menu__item"
          onClick={(e) => handleMenuItemClick('enable', e)}
          onMouseEnter={handleRegularMenuItemHover}
        >
          <ListItemIcon className="process-group-menu__icon">
            <Flash size={16} />
          </ListItemIcon>
          <ListItemText 
            primary="Enable" 
            className="process-group-menu__text"
          />
        </MenuItem>

        <MenuItem 
          disableRipple
          className="process-group-menu__item"
          onClick={(e) => handleMenuItemClick('disable', e)}
          onMouseEnter={handleRegularMenuItemHover}
        >
          <ListItemIcon className="process-group-menu__icon">
            <FlashOff size={16} />
          </ListItemIcon>
          <ListItemText 
            primary="Disable" 
            className="process-group-menu__text"
          />
        </MenuItem>

        <Divider className="process-group-menu__divider" />

        <MenuItem 
          disableRipple
          disabled
          className="process-group-menu__item"
          onClick={(e) => handleMenuItemClick('enable-all-controller-services', e)}
          onMouseEnter={handleRegularMenuItemHover}
        >
          <ListItemIcon className="process-group-menu__icon">
            <Flash size={16} />
          </ListItemIcon>
          <ListItemText 
            primary="Enable All Controller Services" 
            className="process-group-menu__text"
          />
        </MenuItem>

        <MenuItem 
          disableRipple
          disabled
          className="process-group-menu__item"
          onClick={(e) => handleMenuItemClick('disable-all-controller-services', e)}
          onMouseEnter={handleRegularMenuItemHover}
        >
          <ListItemIcon className="process-group-menu__icon">
            <FlashOff size={16} />
          </ListItemIcon>
          <ListItemText 
            primary="Disable All Controller Services" 
            className="process-group-menu__text"
          />
        </MenuItem>

        <Divider className="process-group-menu__divider" />

        <MenuItem 
          disableRipple
          disabled
          className="process-group-menu__item"
          onClick={(e) => handleMenuItemClick('view-status-history', e)}
          onMouseEnter={handleRegularMenuItemHover}
        >
          <ListItemIcon className="process-group-menu__icon">
            <ChartLine size={16} />
          </ListItemIcon>
          <ListItemText 
            primary="View Status History" 
            className="process-group-menu__text"
          />
        </MenuItem>

        <Divider className="process-group-menu__divider" />

        <MenuItem 
          disableRipple
          disabled
          className="process-group-menu__item"
          onClick={(e) => handleMenuItemClick('center-in-view', e)}
          onMouseEnter={handleRegularMenuItemHover}
        >
          <ListItemIcon className="process-group-menu__icon">
            <CenterToFit size={16} />
          </ListItemIcon>
          <ListItemText 
            primary="Center In View" 
            className="process-group-menu__text"
          />
        </MenuItem>

        <MenuItem 
          disableRipple
          disabled
          className="process-group-menu__item process-group-menu__item--highlighted"
          onClick={(e) => handleMenuItemClick('group', e)}
          onMouseEnter={handleRegularMenuItemHover}
        >
          <ListItemIcon className="process-group-menu__icon">
            <GroupObjects size={16} />
          </ListItemIcon>
          <ListItemText 
            primary="Group" 
            className="process-group-menu__text"
          />
        </MenuItem>

        <Divider className="process-group-menu__divider" />

        <MenuItem 
          disableRipple
          disabled
          className="process-group-menu__item process-group-menu__item--with-submenu"
          onMouseEnter={handleDownloadMouseEnter}
          onMouseLeave={handleDownloadMouseLeave}
          sx={{ 
            cursor: 'pointer !important',
            userSelect: 'none !important',
            backgroundColor: (isDownloadHovered && !isDownloadSubmenuHovered) 
              ? 'rgba(0, 0, 0, 0.04) !important' 
              : 'transparent',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04) !important',
            },
            '& *': {
              cursor: 'pointer !important',
              userSelect: 'none !important',
            }
          }}
        >
          <ListItemIcon className="process-group-menu__icon" sx={{ cursor: 'pointer !important' }}>
            <SettingsServices size={16} />
          </ListItemIcon>
          <ListItemText 
            primary="Download Flow Definition" 
            className="process-group-menu__text"
            sx={{ cursor: 'pointer !important' }}
          />
          <CaretRight size={16} className="process-group-menu__submenu-icon" style={{ cursor: 'pointer' }} />
        </MenuItem>

        {/* Download Flow Definition Submenu */}
        <Menu
          anchorEl={downloadAnchorEl}
          open={downloadMenuOpen}
          onClose={() => {}}
          keepMounted
          className="process-group-menu process-group-submenu"
        slotProps={{
          list: {
            className: 'process-group-menu__list',
            onMouseEnter: handleDownloadSubmenuMouseEnter,
            onMouseLeave: handleDownloadSubmenuMouseLeave,
          },
          paper: {
            className: 'process-group-menu__paper',
            onMouseEnter: handleDownloadSubmenuMouseEnter,
            onMouseLeave: handleDownloadSubmenuMouseLeave,
            style: {
              marginLeft: '-2px',
              opacity: 1,
              transform: 'none',
              transition: 'none',
              animation: 'none',
              visibility: downloadMenuOpen ? 'visible' : 'hidden',
              pointerEvents: downloadMenuOpen ? 'auto' : 'none',
            }
          },
          transition: {
            timeout: 0,
            style: { transition: 'none' }
          }
        }}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        transitionDuration={0}
          disableAutoFocusItem
          disableEnforceFocus
          disableRestoreFocus
          hideBackdrop
          disableScrollLock
        >
          <MenuItem 
            className="process-group-menu__item"
            onClick={(e) => {
              handleMenuItemClick('download-without-external-services', e);
            }}
          >
            <ListItemText 
              primary="Without External Services" 
              className="process-group-menu__text"
            />
          </MenuItem>
          
          <MenuItem 
            className="process-group-menu__item"
            onClick={(e) => {
              handleMenuItemClick('download-with-external-services', e);
            }}
          >
            <ListItemText 
              primary="With External Services" 
              className="process-group-menu__text"
            />
          </MenuItem>
        </Menu>

        <Divider className="process-group-menu__divider" />

        <MenuItem 
          disableRipple
          className="process-group-menu__item"
          onClick={(e) => handleMenuItemClick('copy', e)}
          onMouseEnter={handleRegularMenuItemHover}
        >
          <ListItemIcon className="process-group-menu__icon">
            <Copy size={16} />
          </ListItemIcon>
          <ListItemText 
            primary="Copy" 
            className="process-group-menu__text"
          />
        </MenuItem>

        <Divider className="process-group-menu__divider" />

        <MenuItem 
          disableRipple
          disabled
          className="process-group-menu__item"
          onClick={(e) => handleMenuItemClick('empty-all-queues', e)}
          onMouseEnter={handleRegularMenuItemHover}
        >
          <ListItemIcon className="process-group-menu__icon">
            <SubtractAlt size={16} />
          </ListItemIcon>
          <ListItemText 
            primary="Empty All Queues" 
            className="process-group-menu__text"
          />
        </MenuItem>

        <Divider className="process-group-menu__divider" />

        <MenuItem 
          disableRipple
          className="process-group-menu__item"
          onClick={(e) => handleMenuItemClick('delete', e)}
          onMouseEnter={handleRegularMenuItemHover}
        >
          <ListItemIcon className="process-group-menu__icon">
            <TrashCan size={16} />
          </ListItemIcon>
          <ListItemText 
            primary="Delete" 
            className="process-group-menu__text"
          />
        </MenuItem>
      </Menu>

      {/* Delete Warning Notification */}
      <NotificationAlert
        open={showDeleteWarning}
        variant="warning"
        title="Warning"
        message={`Are you sure you want to delete this group "${name}"? Note: This action cannot be undone.`}
        onClose={handleDeleteCancel}
        actions={[
          {
            label: 'Cancel',
            onClick: handleDeleteCancel,
            emphasis: 'secondary',
          },
          {
            label: 'Accept',
            onClick: handleDeleteConfirm,
            emphasis: 'primary',
          },
        ]}
      />

      {/* Process Group Configuration Panel */}
      <Panel
        isOpen={showConfigurationSlider}
        onClose={() => setShowConfigurationSlider(false)}
        title="Edit Processor Group"
        resetButtonLabel="Reset"
        submitButtonLabel="Apply"
        onReset={handleConfigReset}
        onSubmit={handleConfigApply}
        showResetButton={true}
        showSubmitButton={true}
        submitButtonDisabled={isApplyDisabled}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', marginTop: '-16px', marginLeft: '-16px', marginRight: '-16px' }}>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={configTabValue}
              onChange={handleConfigTabChange}
              aria-label="Process group configuration tabs"
              sx={{
                minHeight: '40px',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '12px',
                  fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontWeight: 400,
                  minHeight: '40px',
                  padding: '8px 16px',
                  color: '#5F6368',
                  '&.Mui-selected': {
                    color: '#1976d2',
                    fontWeight: 500,
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#1976d2',
                },
              }}
            >
              <Tab label="Settings" />
              <Tab label="Comments" />
            </Tabs>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            {/* Settings Tab */}
            {configTabValue === 0 && (
              <Box>
                {/* Name Field - Mandatory */}
                <Box sx={{ marginBottom: '24px' }}>
                  <FormFieldLabel htmlFor="config-name">Name</FormFieldLabel>
                  <StandardTextField
                    id="config-name"
                    value={configName}
                    onChange={(value: string) => setConfigName(value)}
                    placeholder="Name"
                    required={true}
                  />
                </Box>

                {/* Parameter Context */}
                <Box sx={{ marginBottom: '24px' }}>
                  <FormFieldLabel htmlFor="parameter-context">Parameter Context</FormFieldLabel>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <StandardSelectField
                        id="parameter-context"
                        value={parameterContext}
                        onChange={(value: string) => setParameterContext(value)}
                        options={['Dataflow_Dev', 'ETL_Prod', 'API_Gateway_Staging']}
                        placeholder="Parameter Context"
                        required={false}
                      />
                    </Box>
                    {/* Add Icon beside dropdown */}
                    <Tooltip 
                      title="Add Parameter Context" 
                      placement="top"
                      {...TOOLTIP_CONFIG}
                      slotProps={{
                        ...TOOLTIP_CONFIG.slotProps,
                        tooltip: {
                          sx: {
                            ...TOOLTIP_CONFIG.slotProps.tooltip.sx,
                            borderRadius: '7px',
                          },
                        },
                      }}
                    >
                      <Box sx={{ 
                        width: '30px', 
                        height: '30px', 
                        backgroundColor: 'rgba(255, 255, 255, 0)', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                        marginTop: '3px',
                      }}>
                        <Add size={25} style={{ color: '#666' }} />
                      </Box>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Apply Recursively */}
                <Box sx={{ marginBottom: '24px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '1px' }}>
                    <CustomCheckbox
                      checked={applyRecursively}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApplyRecursively(e.target.checked)}
                    />
                    <span style={LABEL_STYLE}>
                      Apply Recursively
                    </span>
                        <Tooltip
                          title="Apply settings recursively to child process groups"
                          placement="top"
                          {...TOOLTIP_CONFIG}
                          slotProps={{
                            ...TOOLTIP_CONFIG.slotProps,
                            popper: {
                              modifiers: [
                                {
                                  name: 'offset',
                                  options: {
                                    offset: [0, 4],
                                  },
                                },
                              ],
                            },
                          }}
                        >
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            cursor: 'help', 
                            marginLeft: '2px',
                            justifyContent: 'center'
                          }}>
                            <InformationFilled size={14} style={{ color: '#6c757d' }} />
                          </Box>
                        </Tooltip>
                  </Box>
                </Box>

                {/* Execution Engine - Mandatory */}
                <Box sx={{ marginBottom: '24px' }}>
                  <FormFieldLabel htmlFor="execution-engine">Execution Engine</FormFieldLabel>
                  <StandardSelectField
                    id="execution-engine"
                    value={executionEngine}
                    onChange={(value: string) => setExecutionEngine(value)}
                    options={['Inherited', 'Standard', 'Stateless']}
                    placeholder="Execution Engine"
                    required={true}
                  />
                </Box>

                {/* Process Group FlowFile Concurrency - Mandatory */}
                <Box sx={{ marginBottom: '24px' }}>
                  <FormFieldLabel htmlFor="flowfile-concurrency">Process Group FlowFile Concurrency</FormFieldLabel>
                  <StandardSelectField
                    id="flowfile-concurrency"
                    value={flowFileConcurrency}
                    onChange={(value: string) => setFlowFileConcurrency(value)}
                    options={['Single FlowFile Per Node', 'Single Batch Per Node', 'Unbounded']}
                    placeholder="Process Group FlowFile Concurrency"
                    required={true}
                  />
                </Box>

                {/* Default FlowFile Expiration - Mandatory */}
                <FormFieldWithTooltip
                  htmlFor="default-flowfile-expiration"
                  label="Default FlowFile Expiration"
                  tooltipTitle="Default expiration time for FlowFiles"
                >
                  <StandardTextField
                    id="default-flowfile-expiration"
                    value={defaultFlowFileExpiration}
                    onChange={(value: string) => setDefaultFlowFileExpiration(value)}
                    placeholder="0 Sec"
                    required={true}
                  />
                </FormFieldWithTooltip>

                {/* Default Back Pressure Object Threshold - Mandatory */}
                <FormFieldWithTooltip
                  htmlFor="default-back-pressure-threshold"
                  label="Default Back Pressure Object Threshold"
                  tooltipTitle="Default back pressure threshold for objects"
                >
                  <StandardTextField
                    id="default-back-pressure-threshold"
                    value={defaultBackPressureObjectThreshold}
                    onChange={(value: string) => setDefaultBackPressureObjectThreshold(value)}
                    placeholder="10000"
                    required={true}
                  />
                </FormFieldWithTooltip>
              </Box>
            )}

            {/* Comments Tab */}
            {configTabValue === 1 && (
              <Box>
                <FormFieldLabel htmlFor="comments-textfield">Comments</FormFieldLabel>
                <MuiTextField
                  id="comments-textfield"
                  fullWidth
                  multiline
                  rows={10}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Enter comments"
                  variant="outlined"
                  size="small"
                  sx={TEXT_FIELD_SX}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Panel>
    </Box>
  );
};

export default ProcessGroupBox;
