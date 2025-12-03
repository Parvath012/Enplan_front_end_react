import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Container, Box } from '@mui/material';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Edit, Flash, TrashCan, Document, FlashOff, Renew, ArrowLeft } from '@carbon/icons-react';
import './ControllerServices.scss';

// Import AgGridShell from common-app with fallback
const AgGridShell = React.lazy(() => import('commonApp/AgGridShell').catch(err => {
  console.error('Failed to load AgGridShell from common-app:', err);
  return { 
    default: () => (
      <div className="controller-services__loading-fallback">
        <CircularLoader 
          variant="content"
          backgroundColor="transparent"
          activeColor="#0f62fe"
          speed={1}
          size={20}
        />
      </div>
    )
  };
}));

const HeaderBar = React.lazy(() => import('commonApp/HeaderBar').catch(err => {
  console.error('Failed to load HeaderBar:', err);
  return { default: () => <div>HeaderBar failed to load</div> };
}));

const CustomTooltip = React.lazy(() => import('commonApp/CustomTooltip').catch(err => {
  console.error('Failed to load CustomTooltip:', err);
  return { default: ({ children }: any) => children };
}));

const CircularLoader = React.lazy(() => import('commonApp/CircularLoader').catch(err => {
  console.error('Failed to load CircularLoader:', err);
  return { default: () => <div>Loading...</div> };
}));

import { nifiApiService } from '../api/nifi/nifiApiService';
import { createControllerServicesColumnDefs, createControllerServicesDefaultColDef, createControllerServicesGridOptions } from '../utils/controllerServicesColumns';
import { COMMON_CONTAINER_STYLES } from '../constants/layoutStyles';
import AddControllerServiceBrowser from '../components/AddControllerServiceBrowser';
import EnableDisableControllerServiceDrawer from '../components/EnableDisableControllerServiceDrawer';
import EditControllerServiceDrawer from '../components/EditControllerServiceDrawer';

const ErrorBoundary = React.lazy(() => import('commonApp/ErrorBoundary').catch(err => {
  console.error('Failed to load ErrorBoundary:', err);
  return { default: ({ children }: any) => children };
}));

// Controller Services interface based on NiFi API
interface ControllerService {
  id: string;
  name: string;
  type: string;
  bundle: {
    group: string;
    artifact: string;
    version: string;
  };
  state: string;
  scope: string;
  properties?: Record<string, any>;
  descriptors?: Record<string, any>;
}

// Use shared styles from constants
const CONTROLLER_SERVICES_STYLES = COMMON_CONTAINER_STYLES;


interface ControllerServicesProps {
  onBack?: () => void;
}

const ControllerServices: React.FC<ControllerServicesProps> = ({ onBack }) => {
  const gridRef = useRef<AgGridReact>(null);
  const [controllerServices, setControllerServices] = useState<ControllerService[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state for initial data fetch
  const [isAddServiceDrawerOpen, setIsAddServiceDrawerOpen] = useState(false);
  const [isEnableDisableDrawerOpen, setIsEnableDisableDrawerOpen] = useState(false);
  const [selectedServiceForAction, setSelectedServiceForAction] = useState<ControllerService | null>(null);
  const [enableDisableAction, setEnableDisableAction] = useState<'enable' | 'disable'>('disable');
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [selectedServiceForEdit, setSelectedServiceForEdit] = useState<ControllerService | null>(null);

  // Simple test data first
  const testData = [
    {
      id: "test-1",
      name: "Test Service 1",
      type: "Test Type",
      bundle: { group: "test", artifact: "test", version: "1.0" },
      state: "ENABLED",
      scope: "Test"
    },
    {
      id: "test-2", 
      name: "Test Service 2",
      type: "Another Type",
      bundle: { group: "test", artifact: "test", version: "1.0" },
      state: "DISABLED",
      scope: "Test"
    }
  ];

  // Fetch controller services function (extracted for reuse)
  const fetchControllerServices = React.useCallback(async (showLoading = false) => {
    if (showLoading) {
      setIsLoading(true);
    }
    try {
      console.log('=== Fetching controller services ===');
      const data = await nifiApiService.getControllerServices();
      console.log('Raw API response:', data);
      
      // Transform the data to match our interface
      const transformedData = data.controllerServices?.map((service: any) => {
        const transformed = {
          id: service.component?.id || service.id,
          name: service.component?.name || service.name || 'Unknown',
          type: service.component?.type || service.type || 'Unknown',
          bundle: service.component?.bundle || { group: 'Unknown', artifact: 'Unknown', version: 'Unknown' },
          state: service.component?.state || service.status?.runStatus || 'Unknown',
          scope: service.component?.scope || 'Flow'
        };
        console.log('Transformed service:', transformed.id, transformed.name);
        return transformed;
      }) || [];
      
      console.log('✅ Transformed controller services data:', transformedData);
      console.log('Service IDs:', transformedData.map((s: ControllerService) => s.id));
      setControllerServices(transformedData);
      
      // Close drawer if open (service list has changed)
      if (isEnableDisableDrawerOpen) {
        console.log('Service list refreshed, closing drawer');
        setIsEnableDisableDrawerOpen(false);
        setSelectedServiceForAction(null);
      }
    } catch (err: any) {
      console.error('❌ Failed to fetch controller services:', err);
      
      // Fall back to test data if API fails
      console.log('Using test data as fallback');
      setControllerServices(testData);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [isEnableDisableDrawerOpen]);

  // Fetch controller services on mount
  useEffect(() => {
    fetchControllerServices(true); // Show loading state on initial fetch
  }, []); // Only run on mount

  // Monitor drawer state changes for debugging
  useEffect(() => {
    console.log('=== Drawer State Changed ===');
    console.log('isEnableDisableDrawerOpen:', isEnableDisableDrawerOpen);
    console.log('selectedServiceForAction:', selectedServiceForAction ? {
      id: selectedServiceForAction.id,
      name: selectedServiceForAction.name,
      state: selectedServiceForAction.state
    } : null);
    console.log('enableDisableAction:', enableDisableAction);
    console.log('controllerServices count:', controllerServices.length);
  }, [isEnableDisableDrawerOpen, selectedServiceForAction, enableDisableAction, controllerServices.length]);

  // Column definitions - full structure
  const columnDefs = useMemo(() => createControllerServicesColumnDefs(), []);
  const defaultColDef = useMemo(() => createControllerServicesDefaultColDef(), []);

  // Helper function to handle enable/disable actions
  const handleEnableDisable = React.useCallback(async (id: string, action: 'enable' | 'disable', event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log(`=== handle${action === 'enable' ? 'Start' : 'Stop'} called ===`);
    console.log('Service ID:', id);
    
    // If services list is empty, try to fetch it
    if (!controllerServices || controllerServices.length === 0) {
      console.warn('Controller services list is empty. Attempting to fetch...');
      await fetchControllerServices();
      
      // Wait a moment and try again
      setTimeout(() => {
        const service = controllerServices.find(s => s.id === id);
        if (service) {
          setSelectedServiceForAction(service);
          setEnableDisableAction(action);
          setIsEnableDisableDrawerOpen(true);
        }
      }, 1000);
      return;
    }
    
    // Find the service by ID
    const service = controllerServices.find(s => {
      const matches = s.id === id;
      if (!matches) {
        console.log(`Service ID mismatch: looking for "${id}", found "${s.id}"`);
      }
      return matches;
    });
    
    console.log('Service lookup result:', service);
    console.log('Available service IDs:', controllerServices.map(s => s.id));
    
    if (service) {
      const actionText = action === 'enable' ? 'enable' : 'disable';
      console.log(`✅ Service found, opening drawer for ${actionText}`);
      console.log('Service details:', {
        id: service.id,
        name: service.name,
        state: service.state,
        type: service.type
      });
      setSelectedServiceForAction(service);
      setEnableDisableAction(action);
      setIsEnableDisableDrawerOpen(true);
      console.log('Drawer state updated: isEnableDisableDrawerOpen = true');
    } else {
      const errorMsg = `Service not found (ID: ${id}). Available IDs: ${controllerServices.map(s => s.id).join(', ')}`;
      console.error('❌', errorMsg);
    }
  }, [controllerServices, fetchControllerServices]);

  // Action handlers - wrapped in useCallback to ensure stable references
  const handleStart = React.useCallback(async (id: string, event?: React.MouseEvent) => {
    return handleEnableDisable(id, 'enable', event);
  }, [handleEnableDisable]);

  const handleStop = React.useCallback(async (id: string, event?: React.MouseEvent) => {
    return handleEnableDisable(id, 'disable', event);
  }, [handleEnableDisable]);

  const handleConfigure = (id: string) => {
    console.log('Configure controller service:', id);
    
    // Find the service by ID
    const service = controllerServices.find(s => s.id === id);
    
    if (service) {
      console.log('✅ Service found, opening edit drawer');
      console.log('Service details:', {
        id: service.id,
        name: service.name,
        state: service.state,
        type: service.type
      });
      setSelectedServiceForEdit(service);
      setIsEditDrawerOpen(true);
    } else {
      console.error('❌ Service not found (ID:', id, ')');
    }
  };

  const handleDelete = (id: string) => {
    console.log('Delete controller service:', id);
    // Placeholder for delete functionality
  };

  // Add Controller Service handlers
  const handleOpenAddServiceDrawer = () => {
    setIsAddServiceDrawerOpen(true);
  };

  const handleCloseAddServiceDrawer = () => {
    setIsAddServiceDrawerOpen(false);
  };

  const handleSelectService = (service: any) => {
    console.log('Selected service:', service);
    // Service creation is handled by AddControllerServiceBrowser component
    // This callback is called after successful creation to refresh the list
    setIsAddServiceDrawerOpen(false);
    // Refresh the controller services list
    fetchControllerServices();
  };

  const handleCloseEnableDisableDrawer = () => {
    console.log('Closing enable/disable drawer');
    setIsEnableDisableDrawerOpen(false);
    setSelectedServiceForAction(null);
    setEnableDisableAction('disable'); // Reset to default
    console.log('Drawer state reset');
  };

  const handleEnableDisableConfirm = async () => {
    // Refresh the controller services list after enable/disable
      await fetchControllerServices(); // Refresh controller services
  };

  const handleCloseEditDrawer = () => {
    console.log('Closing edit drawer');
    setIsEditDrawerOpen(false);
    setSelectedServiceForEdit(null);
  };

  const handleEditConfirm = async () => {
    // Refresh the controller services list after edit
      await fetchControllerServices(); // Refresh controller services
  };

  // Action renderer - wrapped in useCallback to ensure stable references
  const actionRenderer = React.useCallback((params: any) => {
    const service = params.data;
    if (!service?.id) {
      console.warn('Action renderer: No service data provided');
      return React.createElement('div', { className: 'controller-service-actions' });
    }
    
    console.log('Action renderer: Rendering actions for service:', {
      id: service.id,
      name: service.name,
      state: service.state
    });
    
    // Check if service is enabled/running (case-insensitive, handles all enabled states)
    // If enabled, show disable icon (FlashOff); if disabled, show enable icon (Flash)
    const stateUpper = String(service.state ?? '').toUpperCase();
    const isRunning = stateUpper === 'ENABLED' || 
                      stateUpper === 'RUNNING' || 
                      stateUpper === 'ENABLING';
    
    // Check if delete should be enabled (only for INVALID state)
    const isInvalid = stateUpper === 'INVALID';
    const isDeleteEnabled = isInvalid;
    
    const handleEnableDisableClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('=== Enable/Disable button clicked ===');
      console.log('Service ID from grid:', service.id);
      console.log('Service state:', service.state);
      console.log('Is running:', isRunning);
      console.log('Controller services available:', controllerServices.length);
      
      // Validate service ID exists
      if (!service.id) {
        console.error('Service ID is missing!');
        return;
      }
      
      // Double-check service exists in the list
      const serviceExists = controllerServices.some(s => s?.id === service?.id);
      console.log('Service exists in list:', serviceExists);
      console.log('Service state:', service.state, 'isRunning:', isRunning);
      
      // If service is running/enabled, disable it; otherwise enable it
      if (isRunning) {
        console.log('Service is enabled - calling handleStop to disable:', service.id);
        handleStop(service.id, e);
      } else {
        console.log('Service is disabled - calling handleStart to enable:', service.id);
        handleStart(service.id, e);
      }
    };
    
    // Stop propagation on container click to prevent AG Grid from handling it
    const handleContainerClick = (e: React.MouseEvent) => {
      e.stopPropagation();
    };
    
    return React.createElement('div', {
      className: 'controller-service-actions',
      onClick: handleContainerClick,
      onMouseDown: handleContainerClick,
    }, [
      // Edit icon
      React.createElement(CustomTooltip, {
        key: 'edit-tooltip',
        title: 'Edit',
        placement: 'bottom',
        followCursor: false,
        arrow: false,
        enterDelay: 500
      }, React.createElement('button', {
        key: 'edit-button',
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          handleConfigure(service.id);
        },
        className: 'controller-service-actions__button',
        type: 'button',
        'aria-label': 'Edit controller service'
      }, React.createElement(Edit, {
        key: 'edit-icon',
        size: 16,
        style: { color: '#6c757d' }
      }))),
      
      // Flash/FlashOff toggle icon based on state
      React.createElement(CustomTooltip, {
        key: 'toggle-tooltip',
        title: isRunning ? 'Disable' : 'Enable',
        placement: 'bottom',
        followCursor: false,
        arrow: false,
        enterDelay: 500
      }, React.createElement('button', {
        key: 'toggle-button',
        onClick: handleEnableDisableClick,
        className: 'controller-service-actions__button',
        type: 'button',
        'aria-label': isRunning ? 'Disable controller service' : 'Enable controller service'
      }, React.createElement(isRunning ? FlashOff : Flash, {
        key: 'toggle-icon',
        size: 16,
        style: { color: '#6c757d' }
      }))),
      
      // Delete icon - only enabled when state is INVALID
      React.createElement(CustomTooltip, {
        key: 'delete-tooltip',
        title: isDeleteEnabled ? 'Delete' : 'Delete (only available for invalid services)',
        placement: 'bottom',
        followCursor: false,
        arrow: false,
        enterDelay: 500
      }, React.createElement('button', {
        key: 'delete-button',
        onClick: (e: React.MouseEvent) => {
          if (!isDeleteEnabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          handleDelete(service.id);
        },
        className: 'controller-service-actions__button',
        type: 'button',
        disabled: !isDeleteEnabled,
        'aria-label': 'Delete controller service',
        style: {
          opacity: isDeleteEnabled ? 1 : 0.5,
          cursor: isDeleteEnabled ? 'pointer' : 'not-allowed'
        }
      }, React.createElement(TrashCan, {
        key: 'delete-icon',
        size: 16,
        style: { color: isDeleteEnabled ? '#6c757d' : '#9e9e9e' }
      }))),
      
      // View Documentation icon - always disabled
      React.createElement(CustomTooltip, {
        key: 'view-tooltip',
        title: 'View Documentation (disabled)',
        placement: 'bottom',
        followCursor: false,
        arrow: false,
        enterDelay: 500
      }, React.createElement('button', {
        key: 'view-button',
        className: 'controller-service-actions__button',
        type: 'button',
        disabled: true,
        'aria-label': 'View documentation',
        style: {
          opacity: 0.5,
          cursor: 'not-allowed'
        }
      }, React.createElement(Document, {
        key: 'view-icon',
        size: 16,
        style: { color: '#9e9e9e' }
      })))
    ]);
  }, [handleStart, handleStop, handleConfigure, controllerServices]);

  // Custom components with action renderer
  const components = useMemo(() => ({
    actionRenderer: actionRenderer,
  }), [actionRenderer]);

  // Grid options with action renderer - add suppressRowClickSelection to prevent row clicks from interfering
  const gridOptions = useMemo(() => {
    const options = createControllerServicesGridOptions(actionRenderer);
    return {
      ...options,
      suppressRowClickSelection: true,
      suppressCellFocus: true,
      onCellClicked: (params: any) => {
        // Only handle cell clicks if it's not in the Actions column
        if (params.column?.getColId() !== 'actions' && params.column?.headerName !== 'Actions') {
          // Handle cell click if needed
        }
      },
    };
  }, [actionRenderer]);

  // Row styles
  const getRowStyle = (params: any) => {
    const service = params.data as ControllerService;
    const isDisabled = service.state === 'DISABLED' || service.state === 'STOPPED';
    return {
      className: isDisabled ? 'controller-service-row controller-service-row--disabled' : 'controller-service-row controller-service-row--enabled'
    };
  };

  // Handle grid sorting
  const onSortChanged = () => {
    // Let AG Grid handle sorting internally
  };



  // Add error handling
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('ControllerServices Error:', error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Show error if any (non-blocking for grid)
  // Show loading state
  if (isLoading && controllerServices.length === 0) {
    return (
      <Container maxWidth={false} disableGutters sx={CONTROLLER_SERVICES_STYLES.container}>
        <Box sx={CONTROLLER_SERVICES_STYLES.contentBox}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <React.Suspense fallback={<></>}>
              <CircularLoader
                variant="content"
                backgroundColor="transparent"
                activeColor="#0f62fe"
                speed={1}
                size={34}
              />
            </React.Suspense>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={CONTROLLER_SERVICES_STYLES.container}
      className="controller-services-wrapper"
    >
      <Box sx={CONTROLLER_SERVICES_STYLES.contentBox}>
        {/* Header Section with Title and Plus Button */}
        <ErrorBoundary fallback={<div>HeaderBar Error</div>}>
          <React.Suspense fallback={<div></div>}>
            <Box sx={{ 
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              {onBack && (
                <Box sx={{
                  position: 'absolute',
                  left: 0,
                  zIndex: 6,
                  display: 'flex',
                  alignItems: 'center',
                  height: '40px',
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  paddingLeft: '12px',
                  paddingRight: '18px', // Extended to cover border area
                  boxSizing: 'border-box',
                  borderTop: '1px solid rgba(242, 242, 240, 1)',
                  borderBottom: '1px solid rgba(242, 242, 240, 1)',
                  borderLeft: '1px solid rgba(242, 242, 240, 1)',
                  borderRight: 'none',
                  width: '54px' // Fixed width to match padding calculation
                }}>
                  <CustomTooltip 
                    title="Back"
                    placement="bottom"
                    followCursor={false}
                    arrow={false}
                    enterDelay={500}
                  >
                    <button
                      onClick={onBack}
                      className="controller-services__back-button"
                      style={{
                        width: '40px',
                        height: '24px',
                        borderRadius: '3px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: '#6c757d',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        transition: 'background-color 0.1s ease',
                        marginRight: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e0e0e0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <ArrowLeft size={18} />
                    </button>
                  </CustomTooltip>
                </Box>
              )}
              <Box sx={{ 
                flex: 1,
                paddingLeft: onBack ? '54px' : 0, // Add padding to account for back button (30px button + 6px margin + 12px left padding + 6px spacing)
                '& > div': onBack ? {
                  borderLeft: 'none !important',
                  marginLeft: '0px',
                  paddingLeft: '0px !important'
                } : {}
              }}>
                <HeaderBar 
                  title="Controller Services"
                  RightAction={
                    <CustomTooltip 
                      title="Add Controller Service"
                      placement="bottom"
                      followCursor={true}
                      arrow={false}
                      enterDelay={1000}
                    >
                      <button
                        onClick={handleOpenAddServiceDrawer}
                        className="controller-services__add-button"
                      >
                        <svg 
                          width="16" 
                          height="16" 
                          viewBox="0 0 16 16" 
                          fill="none"
                        >
                          <path 
                            d="M8 2V14M2 8H14" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </CustomTooltip>
                  }
                />
              </Box>
            </Box>
          </React.Suspense>
        </ErrorBoundary>


        {/* Controller Services Grid */}
        <Box sx={CONTROLLER_SERVICES_STYLES.gridContainer}>
          <div className="controller-services__grid-wrapper" style={CONTROLLER_SERVICES_STYLES.gridWrapper}>
            <ErrorBoundary fallback={<div className="controller-services__error-boundary">AgGridShell Error Boundary Triggered</div>}>
              <React.Suspense fallback={<div></div>}>
                {/* Only render grid if we have data or not loading */}
                {(!isLoading || controllerServices.length > 0) && (
                  <AgGridShell
                  gridRef={gridRef}
                  rowData={controllerServices || []}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  components={components}
                  onSortChanged={onSortChanged}
                  rowHeight={30}
                  headerHeight={34}
                  getRowStyle={getRowStyle}
                  gridOptions={gridOptions}
                  isDraggable={false}
                />
                )}
              </React.Suspense>
            </ErrorBoundary>
          </div>
        </Box>

        {/* Footer - overlaps main footer using fixed positioning */}
        <div className="controller-services__footer">
          <div className="controller-services__footer-content">
            <div className="controller-services__footer-count">
              Count: {controllerServices.length}
            </div>
            <div className="controller-services__footer-updated">
              <Renew size={16} className="renew-icon" />
              <span>Last updated: 00:00:00 IST</span>
            </div>
          </div>
        </div>
      </Box>

      {/* Add Controller Service Drawer */}
      <AddControllerServiceBrowser
        open={isAddServiceDrawerOpen}
        onClose={handleCloseAddServiceDrawer}
        onSelectService={handleSelectService}
      />

      {/* Enable/Disable Controller Service Drawer */}
      <EnableDisableControllerServiceDrawer
        open={isEnableDisableDrawerOpen && selectedServiceForAction !== null}
        onClose={handleCloseEnableDisableDrawer}
        service={selectedServiceForAction ? {
          id: selectedServiceForAction.id,
          name: selectedServiceForAction.name,
          state: selectedServiceForAction.state
        } : null}
        action={enableDisableAction}
        onConfirm={handleEnableDisableConfirm}
      />

      {/* Edit Controller Service Drawer */}
      <EditControllerServiceDrawer
        open={isEditDrawerOpen && selectedServiceForEdit !== null}
        onClose={handleCloseEditDrawer}
        service={selectedServiceForEdit ? {
          id: selectedServiceForEdit.id,
          name: selectedServiceForEdit.name,
          state: selectedServiceForEdit.state
        } : null}
        onConfirm={handleEditConfirm}
      />
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ display: 'none' }}>
          Debug: isEnableDisableDrawerOpen={isEnableDisableDrawerOpen ? 'true' : 'false'}, 
          selectedService={selectedServiceForAction ? selectedServiceForAction.id : 'null'}, 
          action={enableDisableAction},
          servicesCount={controllerServices.length}
        </div>
      )}
    </Container>
  );
};

export default ControllerServices;