import React, { useState, useEffect } from 'react';
import { Box, Button, Tooltip } from '@mui/material';
import { Add, FetchUpload } from '@carbon/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { createProcessGroup, fetchFlowProcessGroups } from '../store/Actions/nifiActions';
import HorizontalNavBar from "../components/HorizontalNavBar";
import TabNavigation from "../components/TabNavigation";
import { NavItem } from "../components/NavDropdownMenu";
import Footer from '../components/Footer';
import GridBoard from '../components/Grid';
import CustomSlider from '../components/CustomSlider';
import TextField from 'commonApp/TextField';
import SelectField from 'commonApp/SelectField';
import NotificationAlert from 'commonApp/NotificationAlert';
import type { AppDispatch, RootState } from '../store/configureStore';
import NIFI_CONFIG from '../config/nifiConfig';
import ControllerServices from './ControllerServices';
import { nifiApiService } from '../api/nifi/nifiApiService';
import CircularLoader from 'commonApp/CircularLoader';
const AddProcessorBrowser = React.lazy(() => import('../components/AddProcessorBrowser').catch(err => {
  console.error('Failed to load AddProcessorBrowser:', err);
  return { default: () => <div>AddProcessorBrowser failed to load</div> };
}));
import { mapProcessGroupForDisplay } from '../utils/processGroupMapper';
import { mapProcessorsForDisplay, mapProcessorForDisplay } from '../utils/processorMapper';
import { TOOLTIP_CONFIG } from '../constants/tooltipStyles';
import { FLEX_COLUMN_LAYOUT, FLEX_AUTO_ITEM, FLEX_FIXED_ITEM } from '../constants/layoutStyles';
import ProcessGroupBox from '../components/ProcessGroupBox/ProcessGroupBox';

const Layout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Parent group ID - fetched dynamically from NiFi API
  const [parentGroupId, setParentGroupId] = useState<string>('');
  
  // Breadcrumb state
  const [selectedBoxName, setSelectedBoxName] = useState<string | undefined>(undefined);
  const [selectedBoxId, setSelectedBoxId] = useState<string | undefined>(undefined);
  
  // Navigation state for process group
  const [isInsideProcessGroup, setIsInsideProcessGroup] = useState(false);
  const [currentProcessGroupName, setCurrentProcessGroupName] = useState<string | undefined>(undefined);
  
  // Get process groups from Redux store
  const reduxProcessGroups = useSelector((state: RootState) => state.nifi.processGroups);

  // View state for Controller Services
  const [currentView, setCurrentView] = useState<'main' | 'controller-services'>('main');
  
  // Loading state for authentication
  const [loading, setLoading] = useState(true);

  const [submitEnabled, setSubmitEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [isProcessorSliderOpen, setIsProcessorSliderOpen] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [selectedParam, setSelectedParam] = useState('');
  
  // Delete warning state
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  
  
  // Copy/Paste state - store the copy response for paste operation
  const [copyResponse, setCopyResponse] = useState<any>(null);
  
  // Trigger configure action for selected ProcessGroupBox
  const [triggerConfigure, setTriggerConfigure] = useState(0);
  
  const [processGroups, setProcessGroups] = useState<Array<{
    id: string;
    name: string;
    parameterContext: string;
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
  }>>([]);

  // Processors state for displaying inside process groups (using ProcessGroupBox format)
  const [processors, setProcessors] = useState<Array<{
    isProcessor: boolean | undefined;
    processorType: string | undefined;
    bundleGroup: string | undefined;
    bundleArtifact: string | undefined;
    bundleVersion: string | undefined;
    taskTime: string | undefined;
    id: string;
    name: string;
    parameterContext: string;
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
  }>>([]);
  
  // Authentication and initialization on component mount
  useEffect(() => {
    const login = async () => {
      try {
        await nifiApiService.authenticate();
        await nifiApiService.getFlowStatus();
        
        // Fetch root process group ID dynamically
        try {
          const rootId = await nifiApiService.getRootProcessGroupId();
          setParentGroupId(rootId);
          console.log('Root process group ID fetched successfully:', rootId);
        } catch (error: any) {
          console.error('Failed to fetch root process group ID:', error);
          // Error is logged, but we continue to allow user to see the UI
          // Process groups will not load until root ID is available
        }
      } catch (error) {
        console.error('Login failed', error);
      } finally {
        setLoading(false);
      }
    };

    login();
  }, []);
  
  // Fetch existing process groups after authentication and parent group ID is available
  useEffect(() => {
    if (!loading && parentGroupId && !isInsideProcessGroup) {
      const loadProcessGroups = async () => {
        try {
          await dispatch(fetchFlowProcessGroups({
            parentGroupId: parentGroupId,
            uiOnly: true
          }));
        } catch (error) {
          console.error('Failed to load process groups:', error);
        }
      };
      
      loadProcessGroups();
    }
  }, [dispatch, parentGroupId, loading, isInsideProcessGroup]);

  // Fetch processors when inside a process group
  useEffect(() => {
    if (!loading && isInsideProcessGroup && parentGroupId) {
      const loadProcessors = async () => {
        try {
          const response = await dispatch(fetchFlowProcessGroups({
            parentGroupId: parentGroupId,
            uiOnly: true
          }));
          
          // Extract processors from flow response
          if (response && typeof response === 'object' && 'payload' in response) {
            const payload = response.payload as any;
            if (payload?.processGroupFlow?.flow?.processors) {
              const mappedProcessors = mapProcessorsForDisplay(payload.processGroupFlow.flow.processors);
              
              // Recalculate positions to ensure side-by-side layout
              // Sort processors by ID to maintain consistent order
              const sortedProcessors = [...mappedProcessors].sort((a, b) => a.id.localeCompare(b.id));
              const processorWidth = 360;
              const processorGap = 20;
              const startX = 50;
              const startY = 50;
              
              const repositionedProcessors = sortedProcessors.map((processor, index) => ({
                ...processor,
                position: {
                  x: startX + (index * (processorWidth + processorGap)),
                  y: startY
                }
              }));
              
              setProcessors(repositionedProcessors);
              console.log('Loaded and repositioned processors for process group:', parentGroupId, repositionedProcessors);
            } else {
              setProcessors([]);
              console.log('No processors found in process group:', parentGroupId);
            }
          } else {
            setProcessors([]);
          }
        } catch (error) {
          console.error('Failed to load processors:', error);
          setProcessors([]);
        }
      };
      
      loadProcessors();
    } else if (!isInsideProcessGroup) {
      // Clear processors when not inside a process group
      setProcessors([]);
    }
  }, [dispatch, parentGroupId, loading, isInsideProcessGroup]);
  
  // Debug: Log processor state changes
  useEffect(() => {
    console.log('=== Processor State Changed ===');
    console.log('isInsideProcessGroup:', isInsideProcessGroup);
    console.log('parentGroupId:', parentGroupId);
    console.log('processors count:', processors.length);
    console.log('processors:', processors);
  }, [processors, isInsideProcessGroup, parentGroupId]);
  
  // Sync Redux process groups to local state for display
  useEffect(() => {
    console.log('Layout - Redux Process Groups:', reduxProcessGroups);
    console.log('Layout - Redux Process Groups Length:', reduxProcessGroups?.length || 0);
    
    if (reduxProcessGroups && reduxProcessGroups.length > 0) {
      const mappedGroups = reduxProcessGroups.map(mapProcessGroupForDisplay);
      console.log('Layout - Mapped Groups:', mappedGroups);
      console.log('Layout - First group position:', mappedGroups[0]?.position);
      setProcessGroups(mappedGroups);
    }
  }, [reduxProcessGroups]);
  
  
  const paramOptions = ['Dataflow_Dev', 'ETL_Prod', 'API_Gateway_Staging'];
  const handleSliderClose = () => setIsSliderOpen(false);
  const handleReset = () => {
    setNameValue('');
    setSelectedParam('');
    setSubmitEnabled(false);
  };

  // Handle process group creation
  const calculateNewProcessGroupPosition = () => {
    return {
      x: NIFI_CONFIG.DEFAULT_POSITION.x + (processGroups.length * NIFI_CONFIG.POSITION_OFFSET.x),
      y: NIFI_CONFIG.DEFAULT_POSITION.y + (processGroups.length * NIFI_CONFIG.POSITION_OFFSET.y)
    };
  };

  const validateProcessGroupCreation = (): boolean => {
    if (!nameValue) {
      return false;
    }
    if (!parentGroupId) {
      console.error('Parent group ID not available');
      return false;
    }
    return true;
  };

  const handleProcessGroupCreationSuccess = (apiResponse: any) => {
    const newProcessGroup = {
      ...mapProcessGroupForDisplay(apiResponse),
      parameterContext: selectedParam ?? 'None',
    };
    
    setProcessGroups([...processGroups, newProcessGroup]);
    console.log('Process group created successfully:', apiResponse);
  };

  const handleCreateProcessGroup = async () => {
    if (!validateProcessGroupCreation()) {
      return;
    }
    
    try {
      const position = calculateNewProcessGroupPosition();
      const resultAction = await dispatch(createProcessGroup({
        parentGroupId: parentGroupId,
        name: nameValue,
        position: position,
      }));

      if (createProcessGroup.fulfilled.match(resultAction)) {
        handleProcessGroupCreationSuccess(resultAction.payload);
      } else {
        console.error('Failed to create process group:', resultAction);
        alert('Failed to create process group. Please check console for details.');
      }
      
      handleReset();
      setIsSliderOpen(false);
    } catch (error) {
      console.error('Error creating process group:', error);
      alert('Error creating process group. Please check console for details.');
    }
  };
  const handleTabChange = (tabIdx: number) => {
    setActiveTab(tabIdx);
    if (tabIdx === 4) {
      setIsSliderOpen(true);
    } else if (tabIdx === 1) {
      // Processor tab
      setIsProcessorSliderOpen(true);
    }
  };

  const handleBoxClick = (boxId: string, boxName: string) => {
    setSelectedBoxId(boxId);
    setSelectedBoxName(boxName);
  };

  // Handle click outside process groups to deselect
  const deselectActiveBox = () => {
    if (selectedBoxId) {
      setSelectedBoxId(undefined);
      setSelectedBoxName(undefined);
    }
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.target as HTMLElement;
    
    // Check if click is on a process group box or its children
    const isProcessGroupClick = target.closest('.process-group-box') !== null;
    
    // Check if click is on menu items or other interactive elements that shouldn't deselect
    const isMenuClick = target.closest('.MuiMenu-root') !== null || 
                       target.closest('.MuiMenuItem-root') !== null ||
                       target.closest('.MuiPopover-root') !== null ||
                       target.closest('.tab-navigation') !== null ||
                       target.closest('.horizontal-nav-bar') !== null;
    
    // Only deselect if clicking outside process groups and not on menus/navigation
    // Clicking on empty space in the grid container will deselect
    if (!isProcessGroupClick && !isMenuClick) {
      deselectActiveBox();
    }
  };

  const handleContainerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      deselectActiveBox();
    }
  };

  const handleBoxDoubleClick = (boxId: string, boxName: string) => {
    console.log('Layout: Double-clicked on process group:', boxId, boxName);
    setIsInsideProcessGroup(true);
    setCurrentProcessGroupName(boxName);
    setSelectedBoxId(boxId);
    setSelectedBoxName(boxName);
    // Set parentGroupId to the clicked process group ID so processors are created inside it
    setParentGroupId(boxId);
  };

  const handleBreadcrumbClick = async () => {
    console.log('Layout: Navigating back to main view');
    setIsInsideProcessGroup(false);
    setCurrentProcessGroupName(undefined);
    // Reset to root process group
    try {
      const rootId = await nifiApiService.getRootProcessGroupId();
      setParentGroupId(rootId);
      setProcessors([]); // Clear processors when going back
    } catch (error) {
      console.error('Failed to fetch root process group ID:', error);
    }
  };

  const handleViewChange = (view: 'main' | 'controller-services') => {
    console.log('Layout: Changing view to:', view);
    setCurrentView(view);
  };

  // Helper to check if process group is selected
  const isProcessGroupSelected = (): boolean => {
    return !!(selectedBoxId && selectedBoxName);
  };

  // Helper to get breadcrumb configuration
  const getBreadcrumbConfig = () => {
    if (isInsideProcessGroup) {
      return {
        flow: currentProcessGroupName,
        processGroup: undefined,
        id: undefined
      };
    }
    return {
      flow: selectedBoxName,
      processGroup: 'Process Group',
      id: selectedBoxId
    };
  };

  // Handle delete action
  const handleDeleteAction = () => {
    if (isProcessGroupSelected()) {
      setShowDeleteWarning(true);
    } else {
      console.log('No process group selected for deletion');
    }
  };

  // Handle copy action
  const handleCopyAction = async () => {
    if (isProcessGroupSelected()) {
      await handleCopyProcessGroup();
    } else {
      console.log('No process group selected for copying');
    }
  };

  // Handle process group action that requires selection
  const handleProcessGroupAction = async (action: () => Promise<void>, actionName: string) => {
    if (isProcessGroupSelected()) {
      await action();
    } else {
      console.log(`No process group selected for ${actionName}`);
    }
  };

  // Handle toolbar actions
  const handleToolbarAction = async (action: string) => {
    console.log(`Layout: Toolbar action: ${action}`);
    
    const actionMap: Record<string, () => void | Promise<void>> = {
      'delete': handleDeleteAction,
      'copy': handleCopyAction,
      'paste': () => handlePasteProcessGroup(),
      'Start': () => handleProcessGroupAction(handleStartProcessGroup, 'starting'),
      'Stop': () => handleProcessGroupAction(handleStopProcessGroup, 'stopping'),
      'Enable': () => handleProcessGroupAction(handleEnableProcessGroup, 'enabling'),
      'Disable': () => handleProcessGroupAction(handleDisableProcessGroup, 'disabling'),
      'configuration': () => {
        if (isProcessGroupSelected() && selectedBoxId) {
          // Trigger configure action for the selected ProcessGroupBox
          setTriggerConfigure(prev => prev + 1);
        } else {
          // Previous functionality: open controller services view when nothing is selected
          handleViewChange('controller-services');
        }
      }
    };

    const handler = actionMap[action];
    if (handler) {
      await handler();
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (selectedBoxId) {
      console.log(`Deleting process group: ${selectedBoxId} (${selectedBoxName})`);
      try {
        // Call the delete API
        await nifiApiService.deleteProcessGroup(selectedBoxId);
        
        // After successful deletion, refresh the process groups list
        if (parentGroupId) {
          await dispatch(fetchFlowProcessGroups({
            parentGroupId: parentGroupId,
            uiOnly: true
          }));
        }
        
        console.log('Process group deleted and list refreshed');
      } catch (error) {
        console.error('Failed to delete process group:', error);
        // You could show an error notification here
      } finally {
        setShowDeleteWarning(false);
        setSelectedBoxId(undefined);
        setSelectedBoxName(undefined);
      }
    }
  };

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setShowDeleteWarning(false);
  };

  // Handle copy from toolbar or dropdown menu
  const handleCopyProcessGroup = async () => {
    if (!selectedBoxId) {
      console.log('No process group selected for copying');
      return;
    }
    
    if (!parentGroupId) {
      console.error('Parent group ID not available');
      return;
    }
    
    console.log(`Copying process group: ${selectedBoxId} (${selectedBoxName})`);
    try {
      // Call the copy API and store the response for paste operation
      const response = await nifiApiService.copyProcessGroup(parentGroupId, [selectedBoxId]);
      
      // Store the copy response for paste operation
      setCopyResponse(response);
      console.log('Copy response stored for paste:', response);
      
      // After successful copy, refresh the process groups list
      await dispatch(fetchFlowProcessGroups({
        parentGroupId: parentGroupId,
        uiOnly: true
      }));
      
      console.log('Process group copied and list refreshed');
    } catch (error) {
      console.error('Failed to copy process group:', error);
    }
  };

  // Handle delete from ProcessGroupBox dropdown menu
  const handleProcessGroupDelete = async () => {
    console.log('Process group deleted, refreshing list...');
    if (!parentGroupId) {
      console.error('Parent group ID not available');
      return;
    }
    try {
      // Refresh the process groups list after deletion
      await dispatch(fetchFlowProcessGroups({
        parentGroupId: parentGroupId,
        uiOnly: true
      }));
      console.log('Process groups list refreshed');
    } catch (error) {
      console.error('Failed to refresh process groups:', error);
    }
  };

  // Handle copy from ProcessGroupBox dropdown menu
  const handleProcessGroupCopy = async () => {
    console.log('Process group copied, refreshing list...');
    if (!parentGroupId) {
      console.error('Parent group ID not available');
      return;
    }
    try {
      // Refresh the process groups list after copy
      await dispatch(fetchFlowProcessGroups({
        parentGroupId: parentGroupId,
        uiOnly: true
      }));
      console.log('Process groups list refreshed');
    } catch (error) {
      console.error('Failed to refresh process groups:', error);
    }
  };

  // Handle start from toolbar or dropdown menu
  const handleStartProcessGroup = async () => {
    if (!selectedBoxId) {
      console.log('No process group selected for starting');
      return;
    }
    
    console.log(`Starting process group: ${selectedBoxId} (${selectedBoxName})`);
    try {
      // Call the start API
      await nifiApiService.startProcessGroup(selectedBoxId);
      
      // After successful start, refresh the process groups list
      if (parentGroupId) {
        await dispatch(fetchFlowProcessGroups({
          parentGroupId: parentGroupId,
          uiOnly: true
        }));
      }
      
      console.log('Process group started and list refreshed');
    } catch (error) {
      console.error('Failed to start process group:', error);
    }
  };

  // Handle stop from toolbar or dropdown menu
  const handleStopProcessGroup = async () => {
    if (!selectedBoxId) {
      console.log('No process group selected for stopping');
      return;
    }
    
    console.log(`Stopping process group: ${selectedBoxId} (${selectedBoxName})`);
    try {
      // Call the stop API
      await nifiApiService.stopProcessGroup(selectedBoxId);
      
      // After successful stop, refresh the process groups list
      if (parentGroupId) {
        await dispatch(fetchFlowProcessGroups({
          parentGroupId: parentGroupId,
          uiOnly: true
        }));
      }
      
      console.log('Process group stopped and list refreshed');
    } catch (error) {
      console.error('Failed to stop process group:', error);
    }
  };

  // Handle enable from toolbar or dropdown menu
  const handleEnableProcessGroup = async () => {
    if (!selectedBoxId) {
      console.log('No process group selected for enabling');
      return;
    }
    
    console.log(`Enabling process group: ${selectedBoxId} (${selectedBoxName})`);
    try {
      // Call the enable API
      await nifiApiService.enableProcessGroup(selectedBoxId);
      
      // After successful enable, refresh the process groups list
      if (parentGroupId) {
        await dispatch(fetchFlowProcessGroups({
          parentGroupId: parentGroupId,
          uiOnly: true
        }));
      }
      
      console.log('Process group enabled and list refreshed');
    } catch (error) {
      console.error('Failed to enable process group:', error);
    }
  };

  // Handle disable from toolbar or dropdown menu
  const handleDisableProcessGroup = async () => {
    if (!selectedBoxId) {
      console.log('No process group selected for disabling');
      return;
    }
    
    console.log(`Disabling process group: ${selectedBoxId} (${selectedBoxName})`);
    try {
      // Call the disable API
      await nifiApiService.disableProcessGroup(selectedBoxId);
      
      // After successful disable, refresh the process groups list
      if (parentGroupId) {
        await dispatch(fetchFlowProcessGroups({
          parentGroupId: parentGroupId,
          uiOnly: true
        }));
      }
      
      console.log('Process group disabled and list refreshed');
    } catch (error) {
      console.error('Failed to disable process group:', error);
    }
  };

  // Handle paste from toolbar
  const handlePasteProcessGroup = async () => {
    if (!copyResponse) {
      console.log('No copy response available for paste operation');
      return;
    }
    
    if (!parentGroupId) {
      console.error('Parent group ID not available');
      return;
    }
    
    console.log('Pasting process group to parent:', parentGroupId);
    console.log('Copy response:', copyResponse);
    
    try {
      // Call the paste API with the stored copy response
      const pasteResponse = await nifiApiService.pasteProcessGroup(parentGroupId, copyResponse);
      console.log('Paste API response:', pasteResponse);
      
      // Wait a moment for NiFi to process the paste
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // After successful paste, refresh the process groups list
      await dispatch(fetchFlowProcessGroups({
        parentGroupId: parentGroupId,
        uiOnly: true
      }));
      
      console.log('Process group pasted and list refreshed');
      
      // Clear the copy response after successful paste
      setCopyResponse(null);
    } catch (error) {
      console.error('Failed to paste process group:', error);
      // Show error to user
      alert('Failed to paste process group. Please check console for details.');
    }
  };

  // Removed handleBackgroundClick - box name persists until another box is clicked
  // Restored navItems for navigation bar
    const navItems: NavItem[] = [
      { label: "Home", path: "/" },
      { label: "Summary", path: "/summary" },
      { label: "Counters", path: "/counters" },
      { label: "Bulletin Board", path: "/bulletin" },
      { label: "Data Provenance", path: "/provenance" },
      { label: "Controller Settings", path: "/controller" },
      { label: "Parameter Contexts", path: "/parameter-contexts" },
      { label: "Flow Configuration History", path: "/flow-configuration-history" },
      { label: "Node Status History", path: "/node-status-history" },
      { label: "Templates", path: "/templates" },
    ];
  
  // Check if we're running within the admin app
  const isInAdminApp = window.location.pathname.includes('/data-management');

  // Show loading screen during authentication
  if (loading) {
    return (
      <div style={{
        position: 'relative',
        width: '100%',
        height: isInAdminApp ? '100%' : '100vh'
      }}>
        <CircularLoader
          variant="content"
          backgroundColor="#e0f2ff"
          activeColor="#007bff"
          speed={1}
        />
      </div>
    );
  }

  // Render Controller Services view if active (full page replacement)
  if (currentView === 'controller-services') {
    return (
      <div style={{
        ...FLEX_COLUMN_LAYOUT,
        height: isInAdminApp ? '100%' : '100vh',
        maxHeight: isInAdminApp ? '100%' : '100vh',
      }}>
        {/* Navigation Bar */}
        <HorizontalNavBar navItems={navItems} visibleCount={6} />
        
        {/* Controller Services Content */}
        <div style={FLEX_AUTO_ITEM}>
          <ControllerServices onBack={() => setCurrentView('main')} />
        </div>
        
        {/* Footer */}
        <div style={FLEX_FIXED_ITEM}>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ 
        ...FLEX_COLUMN_LAYOUT,
        height: isInAdminApp ? '100%' : '100vh',
        maxHeight: isInAdminApp ? '100%' : '100vh',
      }}>
        {/* Navigation Bar */}
        <HorizontalNavBar navItems={navItems} visibleCount={6} />
        {/* Tab Navigation with Breadcrumb */}
        <TabNavigation 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onToolbarAction={handleToolbarAction}
          onBreadcrumbClick={isInsideProcessGroup ? handleBreadcrumbClick : undefined}
          breadcrumb={getBreadcrumbConfig()}
          isInsideProcessGroup={isInsideProcessGroup}
        />
        {/* Body */}
        <div style={{ 
          flex: '1 1 auto',
          overflow: 'hidden',
          minHeight: 0,
          position: 'relative'
        }}>
          <button 
            type="button"
            style={{ 
              height: '100%', 
              width: '100%',
              border: 'none',
              background: 'transparent',
              padding: 0,
              margin: 0,
              cursor: 'default',
              outline: 'none'
            }}
            onClick={handleContainerClick}
            onKeyDown={handleContainerKeyDown}
            aria-label="Process group canvas area"
          >
            {isInsideProcessGroup ? (
              <div style={{
                width: '100%',
                height: '100%',
                minHeight: 'calc(100vh - 200px)',
                backgroundColor: '#fff',
                backgroundSize: '10px 10px',
                backgroundImage: 'linear-gradient(to right, rgba(220, 220, 220, 0.2) 0.5px, transparent 0.5px), linear-gradient(to bottom, rgba(220, 220, 220, 0.2) 0.5px, transparent 0.5px)',
                position: 'relative',
                overflowY: 'auto',
                overflowX: 'auto', // Changed to 'auto' to allow horizontal scrolling if needed
                padding: '15px'
              }}>
                {/* Render processors using ProcessGroupBox component */}
                {processors.map((processor) => (
                  <Box
                    key={processor.id}
                    sx={{
                      position: 'absolute',
                      left: `${processor.position.x}px`,
                      top: `${processor.position.y}px`,
                      zIndex: 10, // Ensure boxes are above the background
                      pointerEvents: 'auto', // Ensure boxes are interactive
                    }}
                  >
                    <ProcessGroupBox
                      id={processor.id}
                      name={processor.name}
                      position={processor.position}
                      runningCount={processor.runningCount}
                      stoppedCount={processor.stoppedCount}
                      invalidCount={processor.invalidCount}
                      disabledCount={processor.disabledCount}
                      activeRemotePortCount={processor.activeRemotePortCount}
                      inactiveRemotePortCount={processor.inactiveRemotePortCount}
                      queued={processor.queued}
                      input={processor.input}
                      read={processor.read}
                      written={processor.written}
                      output={processor.output}
                      upToDateCount={processor.upToDateCount}
                      locallyModifiedCount={processor.locallyModifiedCount}
                      staleCount={processor.staleCount}
                      locallyModifiedAndStaleCount={processor.locallyModifiedAndStaleCount}
                      syncFailureCount={processor.syncFailureCount}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                      onClick={(id, name) => {
                        setSelectedBoxId(id);
                        setSelectedBoxName(name);
                      }}
                      isDragging={false}
                      isSelected={selectedBoxId === processor.id}
                      parentGroupId={parentGroupId || undefined}
                      isProcessor={processor.isProcessor}
                      processorType={processor.processorType}
                      bundleGroup={processor.bundleGroup}
                      bundleArtifact={processor.bundleArtifact}
                      bundleVersion={processor.bundleVersion}
                      taskTime={processor.taskTime}
                    />
                  </Box>
                ))}
              </div>
            ) : (
              <GridBoard 
                processGroups={processGroups} 
                onBoxClick={handleBoxClick}
                onBoxDoubleClick={handleBoxDoubleClick}
                onDelete={handleProcessGroupDelete}
                onCopy={handleProcessGroupCopy}
                onConfigure={() => {
                  // ProcessGroupBox handles its own configuration slider
                  // No need to open a separate panel here
                }}
                parentGroupId={parentGroupId ?? undefined}
                selectedBoxId={selectedBoxId}
                triggerConfigure={triggerConfigure}
              />
            )}
          </button>
        </div>
        {/* Footer */}
        <div style={FLEX_FIXED_ITEM}>
          <Footer />
        </div>
      </div>
      <CustomSlider
        open={isSliderOpen}
        onClose={handleSliderClose}
        title="Create Process Group"
        footerContent={
          <Box sx={{
            display: 'flex',
            width: '100%',
            fontcolor: '#4A4E52',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'transparent',
            fontSize: '12px',
            minWidth: 0,
            height: '46px', // Match Panel actions height
          }}>
            <Button
              variant="text"
              disableRipple
              onClick={handleReset}
              sx={{
                fontFamily: "'ArialMT', 'Arial', sans-serif",
                fontWeight: 400,
                width: 'auto',
                height: '24px',
                fontStyle: 'normal',
                fontSize: '14px',
                letterSpacing: 'normal',
                color: '#1976d2',
                verticalAlign: 'none',
                textAlign: 'center',
                lineHeight: 'normal',
                textTransform: 'none',
                padding: '0 0px',
                borderRadius: '6px',
                marginLeft: '-5px', // Move slightly left
                transition: 'background-color 0.2s, color 0.2s',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: '#1976d2',
                },
                '&:active': {
                  backgroundColor: 'transparent',
                  color: '#1976d2',
                  transition: 'none',
                },
              }}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              disableRipple
              onClick={handleCreateProcessGroup}
              disabled={!submitEnabled}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '14px',
                width: '62px',
                height: '30px',
                backgroundColor: submitEnabled ? 'rgba(0, 111, 230, 1)' : '#E0E0E0',
                color: submitEnabled ? 'white' : '#9E9E9E',
                border: 'none',
                borderRadius: '8px',
                padding: 0,
                fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontStyle: 'normal',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 0,
                boxShadow: 'none',
                '&.Mui-disabled': {
                  backgroundColor: '#E0E0E0',
                  color: '#9E9E9E',
                  border: 'none',
                  boxShadow: 'none',
                  cursor: 'not-allowed',
                },
                '&:hover:not(:disabled)': {
                  backgroundColor: '#0056B3',
                  boxShadow: 'none',
                },
              }}
            >
              Submit
            </Button>
          </Box>
        }
      >
        <Box sx={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <Box sx={{ marginBottom: '24px', position: 'relative' }}>
            <Box sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              }
            }}>
              <TextField
                label="Name"
                value={nameValue}
                onChange={(value: string) => {
                  setNameValue(value);
                  if (value) setSubmitEnabled(true);
                  else setSubmitEnabled(false);
                }}
                placeholder="Name"
                required={true}
                fullWidth={true}
                size="small"
              />
            </Box>
            <Tooltip 
              title="Browse" 
              placement="top"
              {...TOOLTIP_CONFIG}
            >
              <Box sx={{
                position: 'absolute',
                top: '72.5%', 
                transform: 'translateY(-50%)',
                right: '0.5px',
                width: '29px',
                height: '28.5px',
                backgroundColor: '#F8F8F8',
                border: '1px solid #E0E0E0',
                borderLeft: 'none',
                borderRadius: '0 8px 8px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                cursor: 'pointer'
              }}>
                <FetchUpload size={14} style={{ 
                  color: '#5F6368', 
                  backgroundColor: 'transparent',
                  display: 'block',
                  minWidth: '14px',
                  minHeight: '14px'
                }} />
              </Box>
            </Tooltip>
          </Box>
          <Box sx={{ marginBottom: '24px' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '0px' }}>
              <Box sx={{ width: '320px', flexShrink: 0 }}>
                <SelectField
                  label="Parameter Context"
                  value={selectedParam}
                  onChange={(value: string) => {
                    setSelectedParam(value);
                  }}
                  options={paramOptions}
                  placeholder="Parameter Context"
                  required={false}
                  fullWidth={true}
                  size="small"
                  width="320px"
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
                  marginTop: '24px',
                  marginLeft: '4px'
              }}>
                  <Add size={25} style={{ color: '#666' }} />
              </Box>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </CustomSlider>

      {/* Delete Warning Notification */}
      <NotificationAlert
        open={showDeleteWarning}
        variant="warning"
        title="Warning"
        message={`Are you sure you want to delete the process group "${selectedBoxName}"? Note: This action cannot be undone.`}
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

      {/* Processor Browser - Uses AddProcessorBrowser from common-app pattern */}
      <React.Suspense fallback={<div>Loading...</div>}>
        <AddProcessorBrowser
          open={isProcessorSliderOpen}
          onClose={() => setIsProcessorSliderOpen(false)}
          parentGroupId={parentGroupId || undefined}
          existingProcessorsCount={processors.length}
          onSelectProcessor={async (apiResponse, calculatedPosition) => {
            console.log('=== Processor Creation Callback ===');
            console.log('API Response:', apiResponse);
            console.log('Calculated Position:', calculatedPosition);
            console.log('isInsideProcessGroup:', isInsideProcessGroup);
            console.log('parentGroupId:', parentGroupId);
            console.log('Current processors count:', processors.length);
            
            setIsProcessorSliderOpen(false);
            
            // The API response contains the created processor with ID, position, and all data
            // Immediately add the processor to state so it appears right away
            if (apiResponse) {
              try {
                // The API response structure from NiFi is:
                // { id, revision, uri, position, permissions, component: { id, name, type, position, ... }, status: { ... } }
                // We need to pass the full response to mapProcessorForDisplay
                console.log('Processor data structure:', apiResponse);
                
                // The mapper expects the full API response with component and status
                const mappedProcessor = mapProcessorForDisplay(apiResponse);
                
                // Override position with calculated position to ensure side-by-side layout
                if (calculatedPosition) {
                  mappedProcessor.position = calculatedPosition;
                  console.log('Using calculated position for side-by-side layout:', calculatedPosition);
                }
                
                console.log('Mapped processor:', mappedProcessor);
                
                if (!mappedProcessor.id) {
                  console.error('Mapped processor missing ID:', mappedProcessor);
                  return;
                }
                
                setProcessors(prev => {
                  console.log('Previous processors:', prev);
                  // Check if processor already exists to avoid duplicates
                  const exists = prev.some(p => p.id === mappedProcessor.id);
                  if (exists) {
                    console.log('Processor already exists in state, skipping duplicate');
                    return prev;
                  }
                  const newProcessors = [...prev, mappedProcessor];
                  console.log('New processors array:', newProcessors);
                  return newProcessors;
                });
              } catch (error) {
                console.error('Failed to map processor for display:', error, apiResponse);
              }
            } else {
              console.warn('No processor data in API response:', apiResponse);
            }
            
            // Refresh the flow to get the latest data from server
            // Note: We don't need to refresh immediately since we've already added the processor to state
            // The refresh will happen automatically when the component re-renders or when the user navigates
            // This prevents overwriting the newly added processor before it's visible
            if (parentGroupId && isInsideProcessGroup) {
              // Optionally refresh after a delay to sync with server
              setTimeout(async () => {
                try {
                  console.log('Refreshing flow for process group (delayed):', parentGroupId);
                  const response = await dispatch(fetchFlowProcessGroups({
                    parentGroupId: parentGroupId,
                    uiOnly: true
                  }));
                  
                  console.log('Flow refresh response:', response);
                  
                  // Extract and update processors from the refreshed flow
                  if (response && typeof response === 'object' && 'payload' in response) {
                    const payload = response.payload as any;
                    console.log('Flow payload:', payload);
                    if (payload?.processGroupFlow?.flow?.processors) {
                      const mappedProcessors = mapProcessorsForDisplay(payload.processGroupFlow.flow.processors);
                      console.log('Refreshed processors from server:', mappedProcessors);
                      
                      // Recalculate positions to ensure side-by-side layout
                      // Sort processors by ID to maintain consistent order
                      const sortedProcessors = [...mappedProcessors].sort((a, b) => a.id.localeCompare(b.id));
                      const processorWidth = 360;
                      const processorGap = 20;
                      const startX = 50;
                      const startY = 50;
                      
                      const repositionedProcessors = sortedProcessors.map((processor, index) => ({
                        ...processor,
                        position: {
                          x: startX + (index * (processorWidth + processorGap)),
                          y: startY
                        }
                      }));
                      
                      console.log('Repositioned processors for side-by-side layout:', repositionedProcessors);
                      
                      // Only update if we have processors from server (don't clear if server hasn't synced yet)
                      if (repositionedProcessors.length > 0) {
                        setProcessors(repositionedProcessors);
                      }
                    } else {
                      console.warn('No processors found in flow response after creation. Flow structure:', payload?.processGroupFlow?.flow);
                    }
                  }
                } catch (error) {
                  console.error('Failed to refresh process groups after processor creation:', error);
                }
              }, 2000); // Wait 2 seconds before refreshing to allow server to sync
            } else {
              console.warn('Not refreshing flow - parentGroupId:', parentGroupId, 'isInsideProcessGroup:', isInsideProcessGroup);
            }
          }}
        />
      </React.Suspense>

    </>
  );
};

export default Layout;