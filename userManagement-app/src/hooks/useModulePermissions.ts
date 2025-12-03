import { useState, useEffect, useCallback } from 'react';
import { fetchModulePermissionsFromApi, transformModulePermissionsToLayoutFormat, ModulePermissionsModel } from '../services/modulePermissionsService';

interface UseModulePermissionsState {
  modulesData: Record<string, { submodules: Record<string, string[]> }>;
  loading: boolean;
  error: string | null;
  rawData: ModulePermissionsModel[];
}

export const useModulePermissions = () => {
  const [state, setState] = useState<UseModulePermissionsState>({
    modulesData: {},
    loading: false,
    error: null,
    rawData: [],
  });

  // Load module permissions from API
  const loadModulePermissions = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const rawData = await fetchModulePermissionsFromApi();
      const modulesData = transformModulePermissionsToLayoutFormat(rawData);
      
      // Check if we have valid data
      if (!modulesData || Object.keys(modulesData).length === 0) {
        console.warn('useModulePermissions: No valid data received from API');
        setState(prev => ({
          ...prev,
          modulesData: {},
          rawData: [],
          loading: false,
          error: 'No module permissions data available'
        }));
        return;
      }
      
      setState(prev => ({
        ...prev,
        modulesData,
        rawData,
        loading: false,
        error: null,
      }));
    } catch (error: any) {
      console.error('useModulePermissions: Error fetching module permissions:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: `Failed to load module permissions: ${error.message}`,
        modulesData: {},
        rawData: [],
      }));
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadModulePermissions();
  }, [loadModulePermissions]);

  return {
    ...state,
    loadModulePermissions,
  };
};
