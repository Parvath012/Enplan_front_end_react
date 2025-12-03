import React from 'react';
import { Box } from '@mui/material';
import CountriesAndCurrencies from '../CountriesAndCurrencies';
import PeriodSetup from '../PeriodSetup';
import Modules, { ModulesRef } from '../Modules';

// Module Federation import
const CircularLoader = React.lazy(() => import('commonApp/CircularLoader'));
import { entityConfigurationStyles } from '../styles';

interface TabPanelProps {
  readonly children?: React.ReactNode;
  readonly index: number;
  readonly value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`entity-config-tabpanel-${index}`}
      aria-labelledby={`entity-config-tab-${index}`}
    >
      {value === index && <Box sx={entityConfigurationStyles.tabPanel}>{children}</Box>}
    </div>
  );
}

interface TabContentProps {
  tabValue: number;
  isRollupEntity: boolean;
  isSaving: boolean;
  isEditMode: boolean;
  entityId: string;
  modulesRef: React.RefObject<ModulesRef>;
  onCountriesDataChange: (hasChanges: boolean) => void;
  onCountriesDataLoaded: (hasData: boolean) => void;
  onPeriodSetupDataChange: (hasChanges: boolean) => void;
  onModulesDataChange: (modules: string[]) => void;
}

const TabContent: React.FC<TabContentProps> = ({
  tabValue,
  isRollupEntity,
  isSaving,
  isEditMode,
  entityId,
  modulesRef,
  onCountriesDataChange,
  onCountriesDataLoaded,
  onPeriodSetupDataChange,
  onModulesDataChange
}) => {
  return (
    <Box sx={entityConfigurationStyles.tabContent}>
      {isSaving ? (
        /* Centered loader when saving */
        <Box sx={entityConfigurationStyles.loadingContainer}>
              <CircularLoader
                variant="content"
                data-testid="loading-container"
                backgroundColor="#e0f2ff"
                activeColor="#007bff"
                speed={1}
              />
        </Box>
      ) : (
        <>
          <TabPanel value={tabValue} index={0}>
            <CountriesAndCurrencies
              isEditMode={isEditMode}
              entityId={entityId}
              onDataChange={onCountriesDataChange}
              onDataLoaded={onCountriesDataLoaded}
            />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <PeriodSetup
              entityId={entityId}
              isEditMode={isEditMode}
              onDataChange={onPeriodSetupDataChange}
            />
          </TabPanel>
          {!isRollupEntity && (
            <TabPanel value={tabValue} index={2}>
              <Modules
                ref={modulesRef}
                isEditMode={isEditMode}
                entityId={entityId}
                onDataChange={onModulesDataChange}
              />
            </TabPanel>
          )}
        </>
      )}
    </Box>
  );
};

export default TabContent;
