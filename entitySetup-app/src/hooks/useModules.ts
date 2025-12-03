import { useState, useEffect, useCallback } from 'react';
import { Module, ModuleState, ModuleValidationResult, ModuleSaveResult } from '../types/moduleTypes';
import { fetchModulesFromApi, updateModulesConfiguration } from '../services/moduleService';

interface UseModulesProps {
  entityId?: string;
  onProgressUpdate?: (progress: number) => void;
  onModuleSave?: (modules: Module[]) => void;
}

export const useModules = ({ entityId, onProgressUpdate, onModuleSave }: UseModulesProps) => {
  const [state, setState] = useState<ModuleState>({
    modules: [],
    loading: false,
    error: null,
    selectedModules: [],
    hasUnsavedChanges: false,
  });

  // Load modules from API
  const loadModules = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const modules = await fetchModulesFromApi();
      setState(prev => ({
        ...prev,
        modules: modules || [],
        loading: false,
        selectedModules: (modules || []).filter(m => m.isEnabled).map(m => m.id),
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load modules',
      }));
    }
  }, []);

  // Toggle module enabled state
  const toggleModule = useCallback((moduleId: string, isEnabled: boolean) => {
    setState(prev => {
      const moduleExists = prev.modules.some(module => module.id === moduleId);
      
      if (!moduleExists) {
        return prev; // Don't update state if module doesn't exist
      }

      const updatedModules = prev.modules.map(module =>
        module.id === moduleId ? { ...module, isEnabled } : module
      );
      
      const updatedSelectedModules = isEnabled
        ? [...prev.selectedModules, moduleId]
        : prev.selectedModules.filter(id => id !== moduleId);

      return {
        ...prev,
        modules: updatedModules,
        selectedModules: updatedSelectedModules,
        hasUnsavedChanges: true,
      };
    });
  }, []);

  // Save module configurations
  const saveModules = useCallback(async (): Promise<ModuleSaveResult> => {
    if (!state.hasUnsavedChanges) {
      return {
        success: true,
        message: 'No changes to save',
        updatedModules: state.modules,
      };
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const enabledModules = state.modules.filter(m => m.isEnabled);
      await updateModulesConfiguration(enabledModules, entityId);
      
      setState(prev => ({
        ...prev,
        loading: false,
        hasUnsavedChanges: false,
      }));

      // Update progress to 100% when modules are saved
      if (onProgressUpdate) {
        onProgressUpdate(100);
      }

      // Notify parent component
      if (onModuleSave) {
        onModuleSave(enabledModules);
      }

      return {
        success: true,
        message: 'Modules saved successfully',
        updatedModules: enabledModules,
      };
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to save modules',
      }));

      return {
        success: false,
        message: error.message || 'Failed to save modules',
        updatedModules: state.modules,
        errors: [error.message || 'Failed to save modules'],
      };
    }
  }, [state.modules, state.hasUnsavedChanges, entityId, onProgressUpdate, onModuleSave]);

  // Reset modules to original state
  const resetModules = useCallback(() => {
    setState(prev => ({
      ...prev,
      modules: prev.modules.map(module => ({
        ...module,
        isEnabled: false,
      })),
      selectedModules: [],
      hasUnsavedChanges: false,
    }));
  }, []);

  // Validate module selection
  const validateModules = useCallback((): ModuleValidationResult => {
    const enabledModules = state.modules.filter(m => m.isEnabled);
    const errors: string[] = [];
    const warnings: string[] = [];

    if (enabledModules.length === 0) {
      errors.push('At least one module must be enabled');
    }

    if (enabledModules.length > 10) {
      warnings.push('Too many modules enabled. Consider enabling only necessary modules.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, [state.modules]);

  // Load modules on mount
  useEffect(() => {
    loadModules();
  }, [loadModules]);

  return {
    ...state,
    toggleModule,
    saveModules,
    resetModules,
    validateModules,
    loadModules,
  };
};
