// Role Form Data interface
export interface RoleFormData {
  id?: number; // Role ID for updates
  roleName: string;
  department: string;
  roleDescription: string;
  status: 'Active' | 'Inactive';
  parentAttribute: string[]; // Changed to array for multi-select
  // Permissions data
  permissions?: {
    enabledModules: string[];
    selectedPermissions: string[];
    activeModule: string | null;
    activeSubmodule: string | null;
  };
}

