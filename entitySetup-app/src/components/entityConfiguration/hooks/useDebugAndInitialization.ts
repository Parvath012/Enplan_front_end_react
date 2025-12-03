import { useEffect, useMemo } from 'react';
import { getHeaderTitle } from '../../../store/Actions/entityConfigurationActions';

// Custom hook to manage debug and initialization logic
export const useDebugAndInitialization = (params: {
  entityId: string | undefined;
  entity: any;
  periodSetupState: any;
  isRollupEntity: boolean;
  tabValue: number;
  setModulesState: (value: any) => void;
}) => {
  const { entityId, entity, periodSetupState, isRollupEntity, tabValue, setModulesState } = params;

  // Debug and initialization logic
  useEffect(() => {
    if (entity?.countries) {
      try {
        if (typeof entity.countries === 'string') {
          JSON.parse(entity.countries);
        } else {
          // Countries already parsed
        }
      } catch (error) {
        // Handle parsing error silently
      }
    }
    
    if (entity?.currencies) {
      try {
        if (typeof entity.currencies === 'string') {
          JSON.parse(entity.currencies);
        } else {
          // Currencies already parsed
        }
      } catch (error) {
        // Handle parsing error silently
      }
    }
  }, [entityId, entity, periodSetupState, isRollupEntity]);

  // Initialize modules state when entity data is loaded
  useEffect(() => {
    if (tabValue === 2) {
      let savedModules: any[] = [];
      
      if (entity?.modules) {
        try {
          savedModules = typeof entity.modules === 'string' && entity.modules.trim() !== '' 
            ? JSON.parse(entity.modules) 
            : [];
        } catch (error) {
          // Handle invalid JSON gracefully
          console.error('Error parsing modules JSON:', error);
          savedModules = [];
        }
      }
      
      setModulesState((prev: any) => ({
        ...prev,
        isDataSaved: true,
        savedModules: savedModules,
        currentModules: savedModules
      }));
    }
  }, [entity?.modules, tabValue, setModulesState]);

  // Memoize the getHeaderTitle function to ensure stable reference
  const memoizedGetHeaderTitle = useMemo(() => {
    return () => getHeaderTitle(tabValue);
  }, [tabValue]);

  return { getHeaderTitle: memoizedGetHeaderTitle };
};
