/**
 * SessionStorage helper for entity configuration tab state
 * Only used within the EntitySetup app
 */

const ENTITY_CONFIG_TAB_KEY = 'entityConfigActiveTab';

export interface TabSessionData {
  tabValue: number;
  entityId?: string;
  timestamp: number;
}

/**
 * Save the current tab value to sessionStorage
 */
export const saveEntityConfigTab = (tabValue: number, entityId?: string): void => {
  try {
    const data: TabSessionData = {
      tabValue,
      entityId,
      timestamp: Date.now()
    };
    
    sessionStorage.setItem(ENTITY_CONFIG_TAB_KEY, JSON.stringify(data));
    console.log('EntitySetup: Saved tab to sessionStorage:', data);
  } catch (error) {
    console.warn('EntitySetup: Failed to save tab to sessionStorage:', error);
  }
};

/**
 * Retrieve the tab value from sessionStorage
 */
export const getEntityConfigTab = (): TabSessionData | null => {
  try {
    const stored = sessionStorage.getItem(ENTITY_CONFIG_TAB_KEY);
    if (!stored) return null;
    
    const data: TabSessionData = JSON.parse(stored);
    
    // Check if data is not too old (2 hours for session)
    const TWO_HOURS = 2 * 60 * 60 * 1000;
    if (Date.now() - data.timestamp > TWO_HOURS) {
      clearEntityConfigTab();
      return null;
    }
    
    console.log('EntitySetup: Retrieved tab from sessionStorage:', data);
    return data;
  } catch (error) {
    console.warn('EntitySetup: Failed to retrieve tab from sessionStorage:', error);
    return null;
  }
};

/**
 * Clear the tab value from sessionStorage
 */
export const clearEntityConfigTab = (): void => {
  try {
    sessionStorage.removeItem(ENTITY_CONFIG_TAB_KEY);
    console.log('EntitySetup: Cleared tab from sessionStorage');
  } catch (error) {
    console.warn('EntitySetup: Failed to clear tab from sessionStorage:', error);
  }
};

/**
 * Check if current path is entity configuration page
 */
export const isEntityConfigurationPage = (pathname?: string): boolean => {
  const path = pathname ?? window.location.pathname;
  return path.includes('/entity-configuration') || 
         path.includes('/entityConfiguration') ||
         path.includes('/entity-setup') ||
         path.includes('/entitySetup') ||
         path.includes('/configure/') ||
         path.includes('/view/');
};

/**
 * Check if we should restore tab state for a specific entity
 */
export const shouldRestoreTabForEntity = (currentPath: string, currentEntityId?: string): boolean => {
  if (!isEntityConfigurationPage(currentPath)) {
    return false;
  }
  
  const stored = getEntityConfigTab();
  if (!stored) {
    return false;
  }
  
  // Only restore if it's the exact same entity AND we have both entity IDs
  // This prevents restoring tab state when switching between entities or when coming from a fresh navigation
  if (!currentEntityId || !stored.entityId) {
    return false;
  }
  
  // Additional check: only restore if the stored data is recent (within 5 minutes)
  // This prevents restoring old tab state from previous sessions
  const FIVE_MINUTES = 5 * 60 * 1000;
  if (Date.now() - stored.timestamp > FIVE_MINUTES) {
    clearEntityConfigTab();
    return false;
  }
  
  return stored.entityId === currentEntityId;
};