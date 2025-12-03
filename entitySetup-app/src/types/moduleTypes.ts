// Module types and interfaces for the Modules component

export interface Module {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  isConfigured: boolean;
  entityId?: string;
}

export interface ModuleState {
  modules: Module[];
  loading: boolean;
  error: string | null;
  selectedModules: string[];
  hasUnsavedChanges: boolean;
}

export interface ModuleCardProps {
  module: Module;
  isEditMode: boolean;
  onToggle: (moduleId: string, isEnabled: boolean) => void;
  onConfigure: (moduleId: string) => void;
}

export interface ModulesProps {
  isEditMode: boolean;
  entityId?: string;
  onProgressUpdate?: (progress: number) => void;
  onModuleSave?: (modules: Module[]) => void;
}

export interface ModuleValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Module configuration actions
export interface ModuleAction {
  type: 'TOGGLE_MODULE' | 'CONFIGURE_MODULE' | 'SAVE_MODULES' | 'RESET_MODULES' | 'LOAD_MODULES';
  payload?: any;
}

// Progress calculation types
export interface ProgressCalculation {
  currentStep: number;
  totalSteps: number;
  progressPercentage: number;
}

// Module save result
export interface ModuleSaveResult {
  success: boolean;
  message: string;
  updatedModules: Module[];
  errors?: string[];
}
