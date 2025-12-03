import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Import components
import NavigationBar from './components/NavigationBar';
import FormHeaderWrapper from './components/FormHeaderWrapper';
import TabContent from './components/TabContent';
// Module Federation imports
import { ModulesRef } from './Modules';

// Import main hook
import { useEntityConfiguration } from './hooks/useEntityConfiguration';

// Import styles
import { entityConfigurationStyles } from './styles';

interface EntityConfigurationLayoutProps {
  isViewMode?: boolean;
}

const EntityConfigurationLayout: React.FC<EntityConfigurationLayoutProps> = ({
  isViewMode = false,
}) => {
  const navigate = useNavigate();

  // Use the main hook that combines all logic
  const {
    // Entity data
    entityId,
    entity,
    entitiesCount,
    isLoading,
    isRollupEntity,

    // Component state
    tabValue,
    isEditMode,
    progress,
    isSaving,
    modulesRef,
    modulesState,
    
    // Redux state
    isDataModified,
    isDataSaved,
            selectedCountries,
            selectedCurrencies,
    periodSetup,
    
    // Handlers
    handleDataLoaded,
    handleEdit,
    handleReset,
    handleSave,
    navigateToEntityList,
    handleNext,
    handleFinish,
    handleBack,
    handleCountriesDataChange,
    handlePeriodSetupDataChange,
    handleModulesDataChange,
    
    // Validation
    isPeriodSetupMandatoryFieldsFilled,
    isPeriodSetupModified,
    
    // UI state
    isNextEnabled,
    getHeaderTitle
  } = useEntityConfiguration(isViewMode, navigate);

  if (isLoading) {
    return null;
  }

  if (!entityId || !entity) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Entity not found</Typography>
        <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
          Entity ID: {entityId}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
          Available entities: {entitiesCount}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={entityConfigurationStyles.mainContainer}>
      {/* Navigation Bar */}
      <NavigationBar
        tabValue={tabValue}
        isRollupEntity={isRollupEntity}
        progress={progress}
        onClose={navigateToEntityList}
      />

      {/* Header */}
       {!isSaving && (
        <FormHeaderWrapper
          isEditMode={isEditMode}
          isNextEnabled={isNextEnabled}
          isSaving={isSaving}
          tabValue={tabValue}
          isDataSaved={isDataSaved}
          selectedCountries={selectedCountries}
          selectedCurrencies={selectedCurrencies}
          entityId={entityId}
          entity={entity}
          periodSetup={periodSetup}
          modulesState={modulesState}
          isDataModified={isDataModified}
          isPeriodSetupMandatoryFieldsFilled={isPeriodSetupMandatoryFieldsFilled}
          isPeriodSetupModified={isPeriodSetupModified}
          isRollupEntity={isRollupEntity}
          getHeaderTitle={getHeaderTitle}
           onBack={handleBack}
           onSave={handleSave}
           onReset={handleReset}
           onEdit={handleEdit}
          onNext={handleNext}
          onFinish={handleFinish}
         />
       )}

      {/* Tab Content */}
      <TabContent
        tabValue={tabValue}
        isRollupEntity={isRollupEntity}
        isSaving={isSaving}
        isEditMode={isEditMode}
        entityId={entityId || ''}
        modulesRef={modulesRef as React.RefObject<ModulesRef>}
        onCountriesDataChange={handleCountriesDataChange}
        onCountriesDataLoaded={handleDataLoaded}
        onPeriodSetupDataChange={handlePeriodSetupDataChange}
        onModulesDataChange={handleModulesDataChange}
      />
    </Box>
  );
};

export default EntityConfigurationLayout;