import React, { useState, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ProcessorType } from '../data/processorTypes';
import { nifiApiService } from '../api/nifi/nifiApiService';
import { ReusablePanel } from './common/browserLazyImports';

import './AddProcessorBrowser.scss';
import { 
  getDefaultColDef,
  getRowHeight,
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


interface AddProcessorBrowserProps {
  open: boolean;
  onClose: () => void;
  onSelectProcessor?: (apiResponse: any, calculatedPosition?: { x: number; y: number }) => void;
  parentGroupId?: string;
  existingProcessorsCount?: number;
}

const AddProcessorBrowser: React.FC<AddProcessorBrowserProps> = ({ 
  open, 
  onClose, 
  onSelectProcessor,
  parentGroupId,
  existingProcessorsCount = 0
}) => {
  const gridRef = useRef<AgGridReact>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  
  // Use shared hooks
  const isDrawerReady = useDrawerState(open);
  const { searchTerm, isSearchActive, handleSearchClick, handleSearchClose, handleSearchChange } = useSearchState();
  
  // Transform NiFi API response to ProcessorType format
  const transformApiResponse = createTransformApiResponse<ProcessorType>('processorTypes', 'proc-');
  
  // Use shared data fetching hook
  const {
    data: services,
    loadingError,
    selectedItem: selectedProcessor,
    setSelectedItem: setSelectedProcessor,
  } = useBrowserData<ProcessorType>(
    open,
    () => nifiApiService.getProcessorTypes(),
    transformApiResponse,
    'Processor types'
  );

  // Filter services based on search term
  const filteredProcessors = useMemo(() => filterServices(services, searchTerm), [searchTerm, services]);


  // Handle service selection - always select, no toggle
  const handleProcessorSelect = React.useCallback((service: ProcessorType) => {
    if (!service?.id) {
      return;
    }
    
    // Use shared handler
    const handler = createServiceSelectHandler<ProcessorType>(setSelectedProcessor);
    handler(service);
  }, []);


  const handleAddProcessor = async () => {
    if (!selectedProcessor || isCreating) return;
    
    setIsCreating(true);
    setCreateError(null);
    
    try {
      const processGroupId = await getProcessGroupId(parentGroupId);

      if (!selectedProcessor.fullType) {
        throw new Error('Full type name missing for selected service');
      }

      if (!selectedProcessor.bundle) {
        throw new Error('Bundle information missing for selected service');
      }

      // Calculate position for the new processor (offset horizontally for side-by-side display)
      // Each processor is offset by 380px (360px width + 20px gap) to appear side by side
      // Start at a visible position (top-left area of the canvas)
      const processorWidth = 360;
      const processorGap = 20;
      const startX = 50; // Start at 50px from left for visibility
      const startY = 50; // Start at 50px from top for visibility
      const position = {
        x: startX + (existingProcessorsCount * (processorWidth + processorGap)),
        y: startY
      };

      const response = await nifiApiService.createProcessor(
        processGroupId,
        selectedProcessor.fullType,
        selectedProcessor.bundle,
        position
      );

      console.log('Processor created successfully in process group:', processGroupId, response);
      console.log('Calculated position for processor:', position);

      onClose();

      if (onSelectProcessor) {
        setTimeout(() => {
          // Pass the full API response and the calculated position to ensure side-by-side layout
          onSelectProcessor(response, position);
        }, 100);
      }
    } catch (error: any) {
      console.error('Failed to create Processor:', error);
      const errorMessage = error.message || 'Failed to create Processor';
      setCreateError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  // Column definitions
  const columnDefs = React.useMemo(() => createBrowserColumnDefs(
    searchTerm,
    handleProcessorSelect,
    'restricted-processor-icon',
    'processor-row-selected'
  ), [searchTerm, handleProcessorSelect]);

  const defaultColDef = useMemo(() => getDefaultColDef(), []);


  const getRowClass = React.useCallback(createGetRowClass(selectedProcessor, 'processor-row-selected', false), [selectedProcessor]);

  const getRowHeightCallback = React.useCallback((params: any) => getRowHeight(params), []);

  const gridOptions = React.useMemo(() => createGridOptions(
    getRowClass,
    getRowHeightCallback,
    handleProcessorSelect,
    "<div style='padding: 20px; font-family: InterTight-Regular, Inter Tight, sans-serif; color: #5B6061;'>No processors found matching your search.</div>",
    true // Allow row click selection
  ), [getRowClass, getRowHeightCallback, handleProcessorSelect]);

  const getRowStyle = React.useCallback(createGetRowStyle(selectedProcessor, false), [selectedProcessor]);

  // Use shared hook for row styling effect
  useRowStylingEffect({
    selectedItem: selectedProcessor,
    gridRef,
    gridContainerRef,
    iconClassName: 'restricted-processor-icon',
    rowSelectedClass: 'processor-row-selected',
    checkDescription: false,
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
        customClassName="processor-browser-panel"
      >
        <div className="processor-browser__container">
        {/* Header */}
        <BrowserHeader
          title="Add Processor"
          onClose={onClose}
          className="processor-browser__header"
          closeButtonClassName="processor-browser__close-button"
        />

        {/* Search and Count */}
        <BrowserSearchSection
          searchTerm={searchTerm}
          filteredCount={filteredProcessors.length}
          totalCount={services.length}
          isSearchActive={isSearchActive}
          handleSearchClick={handleSearchClick}
          handleSearchChange={handleSearchChange}
          handleSearchClose={handleSearchClose}
          allItemsText="All Processors"
          className="processor-browser"
        />

        {/* AgGrid Table */}
        <BrowserGridSection
          loadingError={loadingError}
          isDrawerReady={isDrawerReady}
          gridRef={gridRef}
          gridContainerRef={gridContainerRef}
          rowData={filteredProcessors}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          gridOptions={gridOptions}
          getRowStyle={getRowStyle}
          entityName="Processors"
          gridContainerClassName="processor-browser__grid-container"
          gridWrapperClassName="processor-browser__grid-wrapper"
        />

        {/* Selected Service Details Panel */}
        <BrowserDetailsPanel
          selectedItem={selectedProcessor}
          createError={createError}
          className="processor-browser__details"
          unknownItemName="Unknown Processor"
          noDescriptionText="No description available for this Processor."
        />

        {/* Footer Actions */}
        <BrowserFooter
          onClose={onClose}
          onAdd={handleAddProcessor}
          isAddDisabled={!selectedProcessor || isCreating}
          cancelButtonClassName="processor-browser__cancel-button"
          addButtonClassName="processor-browser__add-button"
          footerClassName="processor-browser__footer"
        />
      </div>
      </ReusablePanel>
    </React.Suspense>
  );
};

export default AddProcessorBrowser;
