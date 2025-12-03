/**
 * NiFi Configuration
 * 
 * This file contains configuration settings for NiFi integration
 */

export const NIFI_CONFIG = {
  // Root Process Group ID - This is now fetched dynamically from NiFi API
  // Use nifiApiService.getRootProcessGroupId() to get the current root process group ID
  // This value is kept as a fallback only (not used in production)
  ROOT_PROCESS_GROUP_ID: null as string | null,
  
  // Default position for new process groups
  DEFAULT_POSITION: {
    x: 3264.911834716797,
    y: 92.27570343017578
  },
  
  // Offset for cascading new process groups
  POSITION_OFFSET: {
    x: 50,
    y: 50
  },

  // User Process Group Mappings Configuration
  USER_MAPPINGS: {
    // All users use the root process group (fetched dynamically from NiFi API)
    // Process group ID is fetched using nifiApiService.getRootProcessGroupId()
    
    // Default permissions for different user types
    DEFAULT_PERMISSIONS: {
      ADMIN: { canRead: true, canWrite: true, canDelete: true },
      USER: { canRead: true, canWrite: true, canDelete: false },
      READONLY: { canRead: true, canWrite: false, canDelete: false }
    }
  }
};

export default NIFI_CONFIG;

