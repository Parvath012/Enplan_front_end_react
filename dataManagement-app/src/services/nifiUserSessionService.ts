import { authenticate } from '../api/auth/authService';
import { nifiApiService } from '../api/nifi/nifiApiService';
import { userProcessGroupMappingService, UserCredentials } from './userProcessGroupMapping';

/**
 * NiFi User Session Service
 * Manages user-specific NiFi resources and IDs dynamically based on logged-in user
 */

export interface NiFiUserSession {
  userId: string;
  username: string;
  password: string;
  token: string;
  rootProcessGroupId: string;
  processGroupIds: string[];
  controllerServiceIds: string[];
  processorIds: string[];
  connectionIds: string[];
  lastUpdated: Date;
  isActive: boolean;
  permissions: {
    canRead: boolean;
    canWrite: boolean;
    canDelete: boolean;
  };
}

export interface ProcessGroupInfo {
  id: string;
  name: string;
  parentId: string;
  position: { x: number; y: number };
  status: 'running' | 'stopped' | 'invalid' | 'disabled';
  version: number;
}

export interface ControllerServiceInfo {
  id: string;
  name: string;
  type: string;
  state: 'enabled' | 'disabled' | 'invalid';
  scope: string;
  bundle: {
    group: string;
    artifact: string;
    version: string;
  };
}

export interface ProcessorInfo {
  id: string;
  name: string;
  type: string;
  state: 'running' | 'stopped' | 'invalid' | 'disabled';
  processGroupId: string;
  position: { x: number; y: number };
}

export interface ConnectionInfo {
  id: string;
  name: string;
  sourceId: string;
  destinationId: string;
  processGroupId: string;
  status: 'active' | 'inactive' | 'invalid';
}

class NiFiUserSessionService {
  private currentSession: NiFiUserSession | null = null;
  private readonly sessionCache: Map<string, NiFiUserSession> = new Map();
  private refreshInterval: NodeJS.Timeout | null = null;
  private readonly REFRESH_INTERVAL_MS = 30000; // 30 seconds

  /**
   * Initialize user session with NiFi authentication
   */
  async initializeUserSession(userId: string, username: string, password: string): Promise<NiFiUserSession> {
    try {
      // Authenticate with NiFi
      const token = await authenticate();
      
      // Get user mapping to determine process group ID
      const userMapping = await userProcessGroupMappingService.getUserMapping({ username, password });
      if (!userMapping) {
        throw new Error(`Invalid credentials for user: ${username}`);
      }

      // Create new session
      const session: NiFiUserSession = {
        userId,
        username,
        password,
        token,
        rootProcessGroupId: userMapping.processGroupId,
        processGroupIds: [],
        controllerServiceIds: [],
        processorIds: [],
        connectionIds: [],
        lastUpdated: new Date(),
        isActive: true,
        permissions: userMapping.permissions
      };

      // Load all NiFi resources for this user
      await this.loadAllNiFiResources(session);

      // Cache the session
      this.sessionCache.set(userId, session);
      this.currentSession = session;

      // Start auto-refresh
      this.startAutoRefresh();

      console.log(`NiFi session initialized for user: ${username} (${userId}) -> Process Group: ${userMapping.processGroupName}`);
      return session;
    } catch (error) {
      console.error('Failed to initialize NiFi user session:', error);
      throw new Error(`Failed to initialize NiFi session for user ${username}: ${error}`);
    }
  }

  /**
   * Load all NiFi resources for a user session
   */
  private async loadAllNiFiResources(session: NiFiUserSession): Promise<void> {
    try {
      const credentials: UserCredentials = {
        username: session.username,
        password: session.password
      };

      // Load process groups using user's process group ID
      const processGroups = await nifiApiService.getFlowProcessGroups(session.rootProcessGroupId, true, credentials);
      session.processGroupIds = processGroups.processGroupFlow?.flow?.processGroups?.map((pg: any) => pg.id) || [];

      // Load controller services using user's process group ID
      const controllerServices = await nifiApiService.getControllerServices(credentials, session.rootProcessGroupId);
      session.controllerServiceIds = controllerServices.controllerServices?.map((cs: any) => cs.id) || [];

      // Extract processor and connection IDs from process groups
      session.processorIds = [];
      session.connectionIds = [];

      const processGroupFlow = processGroups.processGroupFlow?.flow;
      if (processGroupFlow) {
        if (processGroupFlow.processors) {
          session.processorIds.push(...processGroupFlow.processors.map((p: any) => p.id));
        }
        if (processGroupFlow.connections) {
          session.connectionIds.push(...processGroupFlow.connections.map((c: any) => c.id));
        }
      }

      session.lastUpdated = new Date();
      console.log(`Loaded NiFi resources for user ${session.username}:`, {
        processGroups: session.processGroupIds.length,
        controllerServices: session.controllerServiceIds.length,
        processors: session.processorIds.length,
        connections: session.connectionIds.length,
        rootProcessGroup: session.rootProcessGroupId
      });
    } catch (error) {
      console.error('Failed to load NiFi resources:', error);
      throw error;
    }
  }

  /**
   * Get current user session
   */
  getCurrentSession(): NiFiUserSession | null {
    return this.currentSession;
  }

  /**
   * Get session for specific user
   */
  getUserSession(userId: string): NiFiUserSession | null {
    return this.sessionCache.get(userId) || null;
  }

  /**
   * Get all process group IDs for current user
   */
  getProcessGroupIds(): string[] {
    return this.currentSession?.processGroupIds || [];
  }

  /**
   * Get all controller service IDs for current user
   */
  getControllerServiceIds(): string[] {
    return this.currentSession?.controllerServiceIds || [];
  }

  /**
   * Get all processor IDs for current user
   */
  getProcessorIds(): string[] {
    return this.currentSession?.processorIds || [];
  }

  /**
   * Get all connection IDs for current user
   */
  getConnectionIds(): string[] {
    return this.currentSession?.connectionIds || [];
  }

  /**
   * Get root process group ID for current user
   */
  getRootProcessGroupId(): string {
    return this.currentSession?.rootProcessGroupId ?? '';
  }

  /**
   * Get user token for API calls
   */
  getUserToken(): string {
    return this.currentSession?.token ?? '';
  }

  /**
   * Check if user has access to specific resource
   */
  hasAccessToResource(resourceId: string, resourceType: 'processGroup' | 'controllerService' | 'processor' | 'connection'): boolean {
    if (!this.currentSession) return false;

    switch (resourceType) {
      case 'processGroup':
        return this.currentSession.processGroupIds.includes(resourceId);
      case 'controllerService':
        return this.currentSession.controllerServiceIds.includes(resourceId);
      case 'processor':
        return this.currentSession.processorIds.includes(resourceId);
      case 'connection':
        return this.currentSession.connectionIds.includes(resourceId);
      default:
        return false;
    }
  }

  /**
   * Refresh user session data
   */
  async refreshUserSession(): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active session to refresh');
    }

    try {
      await this.loadAllNiFiResources(this.currentSession);
      this.sessionCache.set(this.currentSession.userId, this.currentSession);
      console.log(`Session refreshed for user: ${this.currentSession.userId}`);
    } catch (error) {
      console.error('Failed to refresh user session:', error);
      throw error;
    }
  }

  /**
   * Start auto-refresh of session data
   */
  private startAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(async () => {
      if (this.currentSession?.isActive) {
        try {
          await this.refreshUserSession();
        } catch (error) {
          console.error('Auto-refresh failed:', error);
        }
      }
    }, this.REFRESH_INTERVAL_MS);
  }

  /**
   * Stop auto-refresh
   */
  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Switch to different user session
   */
  async switchUser(userId: string, username: string, password: string): Promise<NiFiUserSession> {
    // Check if session exists in cache
    let session = this.sessionCache.get(userId);
    
    if (!session?.isActive) {
      // Initialize new session
      session = await this.initializeUserSession(userId, username, password);
    } else {
      // Use existing session
      this.currentSession = session;
    }

    return session;
  }

  /**
   * Logout current user
   */
  logout(): void {
    if (this.currentSession) {
      this.currentSession.isActive = false;
      this.currentSession = null;
    }
    this.stopAutoRefresh();
  }

  /**
   * Clear all sessions
   */
  clearAllSessions(): void {
    this.sessionCache.clear();
    this.currentSession = null;
    this.stopAutoRefresh();
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    activeSessions: number;
    totalResources: number;
    currentUser: string | null;
  } {
    const activeSessions = Array.from(this.sessionCache.values()).filter(s => s.isActive).length;
    const totalResources = this.currentSession ? 
      this.currentSession.processGroupIds.length +
      this.currentSession.controllerServiceIds.length +
      this.currentSession.processorIds.length +
      this.currentSession.connectionIds.length : 0;

    return {
      activeSessions,
      totalResources,
      currentUser: this.currentSession?.userId ?? null
    };
  }

  /**
   * Validate session token
   */
  async validateSession(): Promise<boolean> {
    if (!this.currentSession) return false;

    try {
      // Try to make a simple API call to validate token
      await nifiApiService.getFlowStatus();
      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  }

  /**
   * Get detailed resource information
   */
  async getResourceDetails(resourceId: string, resourceType: 'processGroup' | 'controllerService' | 'processor' | 'connection'): Promise<any> {
    if (!this.hasAccessToResource(resourceId, resourceType)) {
      throw new Error(`Access denied to ${resourceType} ${resourceId}`);
    }

    // This would be implemented based on specific API endpoints
    // For now, return basic info
    return {
      id: resourceId,
      type: resourceType,
      userId: this.currentSession?.userId,
      lastAccessed: new Date()
    };
  }
}

// Export singleton instance
export const nifiUserSessionService = new NiFiUserSessionService();
