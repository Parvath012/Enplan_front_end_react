// Shared UserFormData interface to eliminate duplication
export interface UserFormData {
  id?: string; // User ID for updates (following entity setup pattern)
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  department: string; // Single department selection for basic details
  emailId: string;
  selfReporting: boolean;
  reportingManager: string;
  dottedLineManager: string;
  // Multi-select fields for Permissions tab
  regions: string[];
  countries: string[];
  divisions: string[];
  groups: string[];
  departments: string[]; // Array of departments for permissions (different from single department above)
  classes: string[];
  subClasses: string[];
  // Permissions data
  permissions?: {
    enabledModules: string[];
    selectedPermissions: string[];
    activeModule: string | null;
    activeSubmodule: string | null;
  };
}
