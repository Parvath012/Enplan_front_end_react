import React, { useState, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ControllerServiceType } from '../data/controllerServiceTypes';
import { nifiApiService } from '../api/nifi/nifiApiService';
import { ReusablePanel } from './common/browserLazyImports';

import './AddControllerServiceBrowser.scss';
import { 
  getDefaultColDef,
  getRowHeight,
  normalizeId,
} from './common/browserUtils';
import { createBrowserColumnDefs, filterServices } from './common/browserGridUtils';
import { createTransformApiResponse } from './common/browserTransformers';
import { useDrawerState, useSearchState, useBrowserData } from './common/browserHooks';
import { createGetRowClass, createGetRowStyle, createGridOptions } from './common/browserRowUtils';
import { useRowStylingEffect } from './common/useRowStylingEffect';
import BrowserHeader from './common/BrowserHeader';
import { getProcessGroupId, createServiceSelectHandler } from './common/browserServiceUtils';
import BrowserDetailsPanel from './common/BrowserDetailsPanel';
import BrowserFooter from './common/BrowserFooter';
import BrowserSearchSection from './common/BrowserSearchSection';
import BrowserGridSection from './common/BrowserGridSection';


interface AddControllerServiceBrowserProps {
  open: boolean;
  onClose: () => void;
  onSelectService?: (service: ControllerServiceType) => void;
}

const AddControllerServiceBrowser: React.FC<AddControllerServiceBrowserProps> = ({ 
  open, 
  onClose, 
  onSelectService 
}) => {
  const gridRef = useRef<AgGridReact>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  
  // Use shared hooks
  const isDrawerReady = useDrawerState(open);
  const { searchTerm, isSearchActive, handleSearchClick, handleSearchClose, handleSearchChange } = useSearchState();
  
  // Transform NiFi API response to ControllerServiceType format
  const transformApiResponse = createTransformApiResponse<ControllerServiceType>('controllerServiceTypes', 'cst-');
  
  // Use shared data fetching hook
  const {
    data: services,
    loadingError,
    selectedItem: selectedService,
    setSelectedItem: setSelectedService,
  } = useBrowserData<ControllerServiceType>(
    open,
    () => nifiApiService.getControllerServiceTypes(),
    transformApiResponse,
    'controller service types'
  );

  // Filter services based on search term
  const filteredServices = useMemo(() => filterServices(services, searchTerm), [searchTerm, services]);


  // Handle service selection - always select, no toggle
  const handleServiceSelect = React.useCallback((service: ControllerServiceType) => {
    if (!service?.id) {
      return;
    }
    
    // Normalize the ID to ensure consistent comparison
    const serviceId = normalizeId(service.id);
    if (!serviceId) {
      return;
    }
    
    // Use shared handler
    const handler = createServiceSelectHandler<ControllerServiceType>(setSelectedService);
    handler(service);
  }, []);

  const handleAddService = async () => {
    if (!selectedService || isCreating) return;
    
    setIsCreating(true);
    setCreateError(null);
    
    try {
      const processGroupId = await getProcessGroupId();

      if (!selectedService.fullType) {
        throw new Error('Full type name missing for selected service');
      }

      if (!selectedService.bundle) {
        throw new Error('Bundle information missing for selected service');
      }

      const response = await nifiApiService.createControllerService(
        processGroupId,
        selectedService.fullType,
        selectedService.bundle
      );

      console.log('Controller service created successfully:', response);

      onClose();

      if (onSelectService) {
        setTimeout(() => {
        onSelectService(selectedService);
        }, 100);
      }
    } catch (error: any) {
      console.error('Failed to create controller service:', error);
      const errorMessage = error.message || 'Failed to create controller service';
      setCreateError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  // Column definitions
  const columnDefs = React.useMemo(() => createBrowserColumnDefs(
    searchTerm,
    handleServiceSelect,
    'restricted-service-icon',
    'controller-service-row-selected'
  ), [searchTerm, handleServiceSelect]);

  const defaultColDef = useMemo(() => getDefaultColDef(), []);


  const getRowClass = React.useCallback(createGetRowClass(selectedService, 'controller-service-row-selected', true), [selectedService]);

  const getRowHeightCallback = React.useCallback((params: any) => getRowHeight(params), []);

  const gridOptions = React.useMemo(() => createGridOptions(
    getRowClass,
    getRowHeightCallback,
    handleServiceSelect,
    "<div style='padding: 20px; font-family: InterTight-Regular, Inter Tight, sans-serif; color: #5B6061;'>No controller services found matching your search.</div>",
    false // Only Type column triggers selection
  ), [getRowClass, getRowHeightCallback, handleServiceSelect]);

  const getRowStyle = React.useCallback(createGetRowStyle(selectedService, true), [selectedService]);

  // Use shared hook for row styling effect
  useRowStylingEffect({
    selectedItem: selectedService,
    gridRef,
    gridContainerRef,
    iconClassName: 'restricted-service-icon',
    rowSelectedClass: 'controller-service-row-selected',
    checkDescription: true,
  });

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <ReusablePanel
        isOpen={open}
        onClose={onClose}
        title="" // Empty title - we use custom header
        width="480px"
        backgroundColor="#fafafa"
        showResetButton={false}
        showSubmitButton={false}
        customClassName="controller-service-browser-panel"
      >
        <div className="controller-service-browser__container">
        {/* Header */}
        <BrowserHeader
          title="Add Controller Service"
          onClose={onClose}
          className="controller-service-browser__header"
          closeButtonClassName="controller-service-browser__close-button"
        />

        {/* Search and Count */}
        <BrowserSearchSection
          searchTerm={searchTerm}
          filteredCount={filteredServices.length}
          totalCount={services.length}
          isSearchActive={isSearchActive}
          handleSearchClick={handleSearchClick}
          handleSearchChange={handleSearchChange}
          handleSearchClose={handleSearchClose}
          allItemsText="All Controller Services"
          className="controller-service-browser"
        />

        {/* AgGrid Table */}
        <BrowserGridSection
          loadingError={loadingError}
          isDrawerReady={isDrawerReady}
          gridRef={gridRef}
          gridContainerRef={gridContainerRef}
          rowData={filteredServices}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          gridOptions={gridOptions}
          getRowStyle={getRowStyle}
          entityName="controller services"
          gridContainerClassName="controller-service-browser__grid-container"
          gridWrapperClassName="controller-service-browser__grid-wrapper"
        />

        {/* Selected Service Details Panel */}
        <BrowserDetailsPanel
          selectedItem={selectedService}
          createError={createError}
          className="controller-service-browser__details"
          unknownItemName="Unknown Service"
          noDescriptionText="No description available for this controller service."
        />

        {/* Footer Actions */}
        <BrowserFooter
          onClose={onClose}
          onAdd={handleAddService}
          isAddDisabled={!selectedService || isCreating}
          cancelButtonClassName="controller-service-browser__cancel-button"
          addButtonClassName="controller-service-browser__add-button"
          footerClassName="controller-service-browser__footer"
        />
      </div>
      </ReusablePanel>
    </React.Suspense>
  );
};

export default AddControllerServiceBrowser;