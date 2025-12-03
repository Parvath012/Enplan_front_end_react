import React, { useEffect, useState, useRef, useMemo } from 'react';

// Simple Error Boundary component
class ErrorBoundary extends React.Component<{ children: React.ReactNode; fallback: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
import { Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { deleteEntity as deleteEntityThunk, updateEntityPartial } from '../../store/Actions/entitySetupActions';
import { fetchEntities, fetchEntityHierarchy } from '../../store/Reducers/entitySlice';
import type { RootState, AppDispatch } from '../../store/configureStore';
import { AgGridReact } from 'ag-grid-react';
import GridStyles from '../../components/grid/GridStyles';

// Module Federation imports with error handling
const HeaderBar = React.lazy(() => import('commonApp/HeaderBar').catch(err => {
  console.error('Failed to load HeaderBar:', err);
  return { default: () => <div>HeaderBar failed to load</div> };
}));
// Import fallback component
import AgGridShellFallback from '../../components/grid/AgGridShellFallback';

const AgGridShell = React.lazy(() => import('commonApp/AgGridShell').catch(err => {
  console.error('Failed to load AgGridShell from common-app:', err);
  console.log('Using fallback AgGridShell component');
  // Return the fallback component instead of an error message
  return { default: AgGridShellFallback };
}));
const NotificationAlert = React.lazy(() => import('commonApp/NotificationAlert').catch(err => {
  console.error('Failed to load NotificationAlert:', err);
  return { default: () => <div>NotificationAlert failed to load</div> };
}));
import NoResultsFound from 'commonApp/NoResultsFound';
const Footer = React.lazy(() => import('commonApp/Footer').catch(err => {
  console.error('Failed to load Footer:', err);
  return { default: () => <div>Footer failed to load</div> };
}));
import ListToolbar from '../../components/toolbar/ListToolbar';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Register AG Grid Modules
ModuleRegistry.registerModules([AllCommunityModule]);

import { EntityModel } from '../../services/entitySetupService';
import EntityStructurePanel from '../../components/structure/EntityStructurePanel';
import StructureRenderer from '../../components/entitySetup/StructureRenderer';
import ActionRenderer from '../../components/entitySetup/ActionRenderer';
import { ENTITY_LIST_STYLES } from '../../constants/entityListStyles';
import { createColumnDefs, createDefaultColDef, createGridOptions } from '../../utils/entityListColumns';
import { useEntitySearch } from '../../hooks/useEntitySearch';

// Cell renderer functions moved to utils/cellRenderers.ts

const EntityList = () => {
  const gridRef = useRef<AgGridReact>(null);
  const dispatch = useDispatch<AppDispatch>();
  const entities = useSelector((state: RootState) => state.entities.items);
  const [openStructure, setOpenStructure] = useState<boolean>(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ open: boolean; entityId: string | null }>({ open: false, entityId: null });
  const [successAlert, setSuccessAlert] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const navigate = useNavigate();

  // Add error boundary for debugging
  const [error, setError] = useState<string | null>(null);

  // Use custom hook for search functionality
  const {
    filteredEntities,
    isSearchActive,
    searchValue,
    handleSearchClick,
    handleSearchChange,
    handleSearchClose
  } = useEntitySearch(entities);

  // Add error handling
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('EntityList Error:', error);
      setError(error.message);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);



  // AG Grid column definitions - moved to utils/entityListColumns.ts
  const columnDefs = useMemo(() => createColumnDefs(searchValue), [searchValue]);
  const defaultColDef = useMemo(() => createDefaultColDef(), []);

  // Custom cell renderers - moved to separate components
  const structureRenderer = (params: any) => {
    const entity = params.data;
    return (
      <StructureRenderer 
        entity={entity} 
        onViewStructure={handleViewStructure} 
      />
    );
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmation({ open: true, entityId: id });
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirmation.entityId) return;
    
    try {
      // @ts-ignore - thunk
      dispatch(deleteEntityThunk(deleteConfirmation.entityId));
      
      // Close confirmation dialog first
      setDeleteConfirmation({ open: false, entityId: null });
      
      // Show success message immediately
      setSuccessAlert({ open: true, message: 'Successfully deleted the record' });
      
      // Delay the fetchEntities call to allow the success alert to show
      setTimeout(() => {
        // @ts-ignore - thunk
        dispatch(fetchEntities());
      }, 1000); // 1 second delay
    } catch (e) {
      console.error('Error during entity deletion:', e);
      // Error snackbar handled via global state, but we still log the error
      setDeleteConfirmation({ open: false, entityId: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({ open: false, entityId: null });
  };

  const handleSuccessAlertClose = () => {
    setSuccessAlert({ open: false, message: '' });
  };



  const handleToggleEnabled = async (id: any, current: boolean) => {
    // @ts-ignore - thunk
    return dispatch(updateEntityPartial({ id: String(id), isEnabled: !current }));
  };

  const actionRenderer = (params: any) => {
    const entity = params.data;
    return (
      <ActionRenderer
        entity={entity}
        onEdit={(id) => navigate(`edit/${id}`)}
        onDelete={handleDeleteClick}
        onToggleEnabled={handleToggleEnabled}
        onConfigureOrView={handleConfigureOrView}
      />
    );
  };

  // Custom components
  const components = useMemo(() => ({
    structureRenderer: structureRenderer,
    actionRenderer: actionRenderer,
  }), []);

  // Grid options - moved to utils/entityListColumns.ts
  const gridOptions = useMemo(() => createGridOptions(structureRenderer, actionRenderer), [structureRenderer, actionRenderer]);

  // Grid options
  // Define custom row styles
  const getRowStyle = (params: any) => {
    const entity = params.data as EntityModel;
    const isDisabledRow = !!entity.isDeleted && !entity.isEnabled;
    return {
      backgroundColor: isDisabledRow ? '#f5f5f5' : 'rgba(255, 255, 255, 0)',
      borderBottom: '1px solid rgba(247, 247, 246, 1)',
      opacity: isDisabledRow ? 0.7 : 1,
    };
  };

  // AG Grid initialization - no need to fetch entities here as EntitySetup handles it
  useEffect(() => {
    console.log("AG Grid initialization - checking modules:", ModuleRegistry);
  }, []);

  // Handle grid-based sorting
  const onSortChanged = () => {
    // Let AG Grid handle sorting internally
  };

  // Old toggle/delete removed - handled by future endpoints

  // Add/edit navigation intentionally disabled in this phase

  // Navigate to entity configuration
  // Configure action opens the structure panel as per requirement

  // Navigate to entity structure view
  const handleViewStructure = (id: string | number | undefined) => {
    if (!id) return;
    
    // Fetch fresh hierarchy data before opening the structure panel
    // @ts-ignore - Redux Toolkit async action
    dispatch(fetchEntityHierarchy()).then(() => {
      setOpenStructure(true);
    }).catch((error: any) => {
      console.error('Failed to fetch hierarchy data:', error);
      // Still open the panel even if fetch fails, it will show loading state
      setOpenStructure(true);
    });
  };

  // Navigate to entity configuration or view
  const handleConfigureOrView = (entity: EntityModel) => {
    if (!entity.id) return;
    
    if (entity.progressPercentage === '100') {
      // Navigate to view mode
      navigate(`view/${entity.id}`);
    } else {
      // Navigate to configure mode
      navigate(`configure/${entity.id}`);
    }
  };

  const closeStructure = () => {
    setOpenStructure(false);
  };

  // Show error if any
  if (error) {
    return (
      <Container maxWidth={false} disableGutters sx={ENTITY_LIST_STYLES.container}>
        <Box sx={{ p: 2, color: 'error.main' }}>
          <h2>Error occurred:</h2>
          <p>{error}</p>
          <button onClick={() => setError(null)}>Retry</button>
        </Box>
      </Container>
    );
  }

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={ENTITY_LIST_STYLES.container}
    >
      <GridStyles />

      <Box sx={ENTITY_LIST_STYLES.contentBox}>
          <HeaderBar
              title="Entity Details"
              RightAction={(
                <ListToolbar
                  onSearchClick={handleSearchClick}
                  onAddClick={() => navigate('create')}
                  isSearchActive={isSearchActive}
                  onSearchChange={handleSearchChange}
                  searchValue={searchValue}
                  onSearchClose={handleSearchClose}
                />
              )}
            />

        {/* Entity List with AG Grid */}
        <Box sx={ENTITY_LIST_STYLES.gridContainer}>
          <div style={ENTITY_LIST_STYLES.gridWrapper}>
            {filteredEntities.length > 0 ? (
              <AgGridShell
                gridRef={gridRef}
                rowData={filteredEntities}
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
            ) : (
              <NoResultsFound 
                message="No Results Found"
                height="300px"
              />
            )}
          </div>
        </Box>

        {/* Footer */}
          <Footer label="Total Entity" count={filteredEntities.length} />
      </Box>

      {/* Slide-up Structure Panel */}
      <EntityStructurePanel open={openStructure} onClose={closeStructure} />

      {/* Delete Confirmation Dialog */}
      <ErrorBoundary fallback={<div>NotificationAlert Error</div>}>
        <NotificationAlert
          open={deleteConfirmation.open}
          variant="warning"
          title="Warning – Action Required"
          message="Once clicked, it will permanently delete the entity. Do you want to continue?"
          onClose={handleDeleteCancel}
          actions={[
            {
              label: 'No',
              onClick: handleDeleteCancel,
              emphasis: 'secondary'
            },
            {
              label: 'Yes',
              onClick: handleDeleteConfirm,
              emphasis: 'primary'
            }
          ]}
        />
      </ErrorBoundary>

      {/* Success Alert */}
      <ErrorBoundary fallback={<div>NotificationAlert Error</div>}>
        <NotificationAlert
          open={successAlert.open}
          variant="success"
          message={successAlert.message}
          onClose={handleSuccessAlertClose}
          autoHideDuration={3000}
        />
      </ErrorBoundary>
    </Container>
  );
};

export default EntityList;
