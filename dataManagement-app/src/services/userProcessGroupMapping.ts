/**
 * User Process Group Mapping Service
 * Maps users to their specific NiFi process group IDs based on authentication
 */

import { NIFI_CONFIG } from '../config/nifiConfig';
import { nifiApiService } from '../api/nifi/nifiApiService';

export interface UserProcessGroupMapping {
  username: string;
  password: string;
  processGroupId: string;
  processGroupName: string;
  permissions: {
    canRead: boolean;
    canWrite: boolean;
    canDelete: boolean;
  };
  createdAt: Date;
  lastAccessed: Date;
}

export interface UserCredentials {
  username: string;
  password: string;
}

class UserProcessGroupMappingService {
  private readonly userMappings: Map<string, UserProcessGroupMapping> = new Map();
  private cachedRootProcessGroupId: string | null = null; // Cache for root process group ID
  private initializationPromise: Promise<void> | null = null;

  /**
   * Ensure mappings are initialized (lazy initialization)
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    if (this.userMappings.size > 0) {
      return Promise.resolve();
    }

    this.initializationPromise = this.initializeDefaultMappings().catch(error => {
      console.error('Failed to initialize default mappings:', error);
      this.initializationPromise = null; // Reset on error to allow retry
      throw error;
    });

    return this.initializationPromise;
  }

  /**
   * Initialize default mappings - fetches and caches root process group ID
   * Users must be added explicitly via addUserMapping() or createUserWithDefaultPermissions()
   */
  private async initializeDefaultMappings(): Promise<void> {
    // Fetch and cache root process group ID (used by all users)
    try {
      const rootProcessGroupId = await nifiApiService.getRootProcessGroupId();
      this.cachedRootProcessGroupId = rootProcessGroupId;
      console.log(`Root process group ID cached: ${rootProcessGroupId}`);
    } catch (error) {
      console.error('Failed to fetch root process group ID:', error);
      throw new Error('Unable to fetch root process group ID. Please ensure NiFi is accessible.');
    }
  }

  /**
   * Authenticate user and return their process group mapping
   */
  async authenticateUser(credentials: UserCredentials): Promise<UserProcessGroupMapping | null> {
    await this.ensureInitialized();
    
    const { username, password } = credentials;
    
    const mapping = this.userMappings.get(username);
    
    if (!mapping) {
      console.warn(`User not found: ${username}`);
      return null;
    }

    if (mapping.password !== password) {
      console.warn(`Invalid password for user: ${username}`);
      return null;
    }

    // Update last accessed time
    mapping.lastAccessed = new Date();
    this.userMappings.set(username, mapping);

    console.log(`User authenticated: ${username} -> Process Group: ${mapping.processGroupName}`);
    return mapping;
  }

  /**
   * Get process group ID for authenticated user
   */
  async getProcessGroupIdForUser(credentials: UserCredentials): Promise<string | null> {
    const mapping = await this.authenticateUser(credentials);
    return mapping?.processGroupId ?? null;
  }

  /**
   * Get full user mapping for authenticated user
   */
  async getUserMapping(credentials: UserCredentials): Promise<UserProcessGroupMapping | null> {
    return await this.authenticateUser(credentials);
  }

  /**
   * Add new user mapping (for admin purposes)
   */
  addUserMapping(mapping: Omit<UserProcessGroupMapping, 'createdAt' | 'lastAccessed'>): void {
    const fullMapping: UserProcessGroupMapping = {
      ...mapping,
      createdAt: new Date(),
      lastAccessed: new Date()
    };

    this.userMappings.set(mapping.username, fullMapping);
    console.log(`Added user mapping: ${mapping.username} -> ${mapping.processGroupName}`);
  }

  /**
   * Remove user mapping
   */
  removeUserMapping(username: string): boolean {
    const removed = this.userMappings.delete(username);
    if (removed) {
      console.log(`Removed user mapping: ${username}`);
    }
    return removed;
  }

  /**
   * Update user mapping
   */
  updateUserMapping(username: string, updates: Partial<UserProcessGroupMapping>): boolean {
    const existing = this.userMappings.get(username);
    if (!existing) {
      return false;
    }

    const updated: UserProcessGroupMapping = {
      ...existing,
      ...updates,
      lastAccessed: new Date()
    };

    this.userMappings.set(username, updated);
    console.log(`Updated user mapping: ${username}`);
    return true;
  }

  /**
   * Get all user mappings (for admin purposes)
   */
  getAllUserMappings(): UserProcessGroupMapping[] {
    return Array.from(this.userMappings.values());
  }

  /**
   * Check if user exists
   */
  userExists(username: string): boolean {
    return this.userMappings.has(username);
  }

  /**
   * Get user count
   */
  getUserCount(): number {
    return this.userMappings.size;
  }

  /**
   * Validate user permissions for specific action
   */
  async validateUserPermissions(
    credentials: UserCredentials, 
    action: 'read' | 'write' | 'delete'
  ): Promise<boolean> {
    const mapping = await this.authenticateUser(credentials);
    if (!mapping) {
      return false;
    }

    switch (action) {
      case 'read':
        return mapping.permissions.canRead;
      case 'write':
        return mapping.permissions.canWrite;
      case 'delete':
        return mapping.permissions.canDelete;
      default:
        return false;
    }
  }

  /**
   * Get default process group ID (fetched dynamically from NiFi API)
   * This replaces the static ROOT_PROCESS_GROUP_ID with dynamic fetching
   */
  async getDefaultProcessGroupId(): Promise<string> {
    try {
      // Fetch root process group ID dynamically from NiFi API
      return await nifiApiService.getRootProcessGroupId();
    } catch (error) {
      console.error('Failed to fetch root process group ID dynamically:', error);
      throw new Error(
        'Unable to fetch root process group ID. Please ensure NiFi is accessible and authentication is successful.'
      );
    }
  }

  /**
   * Search users by process group ID
   */
  getUsersByProcessGroupId(processGroupId: string): UserProcessGroupMapping[] {
    return Array.from(this.userMappings.values())
      .filter(mapping => mapping.processGroupId === processGroupId);
  }

  /**
   * Get process group statistics
   */
  getProcessGroupStats(): {
    totalUsers: number;
    processGroups: { [processGroupId: string]: number };
    permissions: {
      canRead: number;
      canWrite: number;
      canDelete: number;
    };
  } {
    const mappings = Array.from(this.userMappings.values());
    const processGroups: { [processGroupId: string]: number } = {};
    const permissions = {
      canRead: 0,
      canWrite: 0,
      canDelete: 0
    };

    mappings.forEach(mapping => {
      // Count users per process group
      processGroups[mapping.processGroupId] = (processGroups[mapping.processGroupId] || 0) + 1;

      // Count permissions
      if (mapping.permissions.canRead) permissions.canRead++;
      if (mapping.permissions.canWrite) permissions.canWrite++;
      if (mapping.permissions.canDelete) permissions.canDelete++;
    });

    return {
      totalUsers: mappings.length,
      processGroups,
      permissions
    };
  }

  /**
   * Create user mapping with default permissions based on user type
   */
  createUserWithDefaultPermissions(
    username: string,
    password: string,
    processGroupId: string,
    processGroupName: string,
    userType: 'ADMIN' | 'USER' | 'READONLY' = 'USER'
  ): void {
    const permissions = NIFI_CONFIG.USER_MAPPINGS.DEFAULT_PERMISSIONS[userType];
    
    this.addUserMapping({
      username,
      password,
      processGroupId,
      processGroupName,
      permissions
    });
  }

  /**
   * Get root process group ID (fetched dynamically from NiFi API)
   * All users use the same root process group
   */
  async getRootProcessGroupId(): Promise<string> {
    // Check cache first
    if (this.cachedRootProcessGroupId) {
      return this.cachedRootProcessGroupId;
    }

    try {
      const rootId = await nifiApiService.getRootProcessGroupId();
      this.cachedRootProcessGroupId = rootId;
      return rootId;
    } catch (error) {
      console.error('Failed to fetch root process group ID:', error);
      throw new Error('Unable to fetch root process group ID. Please ensure NiFi is accessible.');
    }
  }

  /**
   * Get configuration-based permissions for user type
   */
  getPermissionsForUserType(userType: 'ADMIN' | 'USER' | 'READONLY'): {
    canRead: boolean;
    canWrite: boolean;
    canDelete: boolean;
  } {
    return NIFI_CONFIG.USER_MAPPINGS.DEFAULT_PERMISSIONS[userType];
  }

  /**
   * Validate if process group ID is the root process group
   */
  isKnownProcessGroupId(processGroupId: string): boolean {
    // Check if this ID matches the cached root process group ID
    return this.cachedRootProcessGroupId === processGroupId;
  }

  /**
   * Get process group name for a process group ID
   */
  getProcessGroupNameFromConfig(processGroupId: string): string {
    // Check if it's the root process group
    if (this.cachedRootProcessGroupId === processGroupId) {
      return 'Root Process Group';
    }
    
    // Also check user mappings
    for (const mapping of this.userMappings.values()) {
      if (mapping.processGroupId === processGroupId) {
        return mapping.processGroupName;
      }
    }
    
    return 'Unknown Process Group';
  }

  /**
   * Refresh root process group ID cache by fetching from NiFi API
   */
  async refreshRootProcessGroupId(): Promise<void> {
    console.log('Refreshing root process group ID cache...');
    try {
      const rootId = await nifiApiService.getRootProcessGroupId();
      this.cachedRootProcessGroupId = rootId;
      console.log(`Root process group ID refreshed: ${rootId}`);
      
      // Update all user mappings to use the new root ID
      for (const [username, mapping] of this.userMappings.entries()) {
        mapping.processGroupId = rootId;
        this.userMappings.set(username, mapping);
      }
      console.log(`Updated ${this.userMappings.size} user mappings with new root process group ID`);
    } catch (error) {
      console.error('Failed to refresh root process group ID:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const userProcessGroupMappingService = new UserProcessGroupMappingService();

export default userProcessGroupMappingService;
