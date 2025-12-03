import { useState, useEffect, useCallback } from 'react';
import { 
  nifiUserSessionService, 
  NiFiUserSession
} from '../services/nifiUserSessionService';

export interface UseNiFiUserSessionReturn {
  // Session state
  session: NiFiUserSession | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Resource IDs
  processGroupIds: string[];
  controllerServiceIds: string[];
  processorIds: string[];
  connectionIds: string[];
  rootProcessGroupId: string;

  // Session management
  initializeSession: (userId: string, username: string, password: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  switchUser: (userId: string, username: string, password: string) => Promise<void>;
  logout: () => void;

  // Access control
  hasAccessToResource: (resourceId: string, resourceType: 'processGroup' | 'controllerService' | 'processor' | 'connection') => boolean;

  // Statistics
  sessionStats: {
    activeSessions: number;
    totalResources: number;
    currentUser: string | null;
  };

  // Validation
  validateSession: () => Promise<boolean>;
}

/**
 * Custom hook for managing NiFi user sessions
 * Provides easy access to user-specific NiFi resources and IDs
 */
export const useNiFiUserSession = (): UseNiFiUserSessionReturn => {
  const [session, setSession] = useState<NiFiUserSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize session for a user
  const initializeSession = useCallback(async (userId: string, username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newSession = await nifiUserSessionService.initializeUserSession(userId, username, password);
      setSession(newSession);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize session';
      setError(errorMessage);
      console.error('Session initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh current session
  const refreshSession = useCallback(async () => {
    if (!session) {
      setError('No active session to refresh');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await nifiUserSessionService.refreshUserSession();
      const updatedSession = nifiUserSessionService.getCurrentSession();
      setSession(updatedSession);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh session';
      setError(errorMessage);
      console.error('Session refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Switch to different user
  const switchUser = useCallback(async (userId: string, username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const newSession = await nifiUserSessionService.switchUser(userId, username, password);
      setSession(newSession);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch user';
      setError(errorMessage);
      console.error('User switch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout current user
  const logout = useCallback(() => {
    nifiUserSessionService.logout();
    setSession(null);
    setError(null);
  }, []);

  // Check access to specific resource
  const hasAccessToResource = useCallback((
    resourceId: string, 
    resourceType: 'processGroup' | 'controllerService' | 'processor' | 'connection'
  ): boolean => {
    return nifiUserSessionService.hasAccessToResource(resourceId, resourceType);
  }, []);

  // Validate current session
  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      return await nifiUserSessionService.validateSession();
    } catch (err) {
      console.error('Session validation error:', err);
      return false;
    }
  }, []);

  // Get session statistics
  const sessionStats = nifiUserSessionService.getSessionStats();

  // Auto-refresh session data periodically
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      refreshSession().catch(err => {
        console.error('Auto-refresh failed:', err);
      });
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [session, refreshSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      nifiUserSessionService.stopAutoRefresh();
    };
  }, []);

  return {
    // Session state
    session,
    isLoading,
    error,
    isAuthenticated: !!session?.isActive,

    // Resource IDs
    processGroupIds: session?.processGroupIds || [],
    controllerServiceIds: session?.controllerServiceIds || [],
    processorIds: session?.processorIds || [],
    connectionIds: session?.connectionIds || [],
    rootProcessGroupId: session?.rootProcessGroupId ?? '',

    // Session management
    initializeSession,
    refreshSession,
    switchUser,
    logout,

    // Access control
    hasAccessToResource,

    // Statistics
    sessionStats,

    // Validation
    validateSession
  };
};

export default useNiFiUserSession;
