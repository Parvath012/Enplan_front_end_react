import { nifiUserSessionService, NiFiUserSession } from '../../src/services/nifiUserSessionService';
import { authenticate } from '../../src/api/auth/authService';
import { nifiApiService } from '../../src/api/nifi/nifiApiService';
import { userProcessGroupMappingService } from '../../src/services/userProcessGroupMapping';

// Mock dependencies
jest.mock('../../src/api/auth/authService');
jest.mock('../../src/api/nifi/nifiApiService');
jest.mock('../../src/services/userProcessGroupMapping');

describe('NiFiUserSessionService', () => {
  const mockToken = 'mock-token-123';
  const mockUserId = 'user-1';
  const mockUsername = 'testuser';
  const mockPassword = 'testpass';
  const mockRootProcessGroupId = 'root-pg-id';
  const mockProcessGroupId = 'pg-id-1';

  const mockUserMapping = {
    username: mockUsername,
    password: mockPassword,
    processGroupId: mockRootProcessGroupId,
    processGroupName: 'Root Process Group',
    permissions: {
      canRead: true,
      canWrite: true,
      canDelete: false
    },
    createdAt: new Date(),
    lastAccessed: new Date()
  };

  const mockFlowProcessGroups = {
    processGroupFlow: {
      flow: {
        processGroups: [
          { id: mockProcessGroupId, component: { name: 'Test Group' } }
        ],
        processors: [
          { id: 'proc-1', component: { name: 'Processor 1' } }
        ],
        connections: [
          { id: 'conn-1', component: { name: 'Connection 1' } }
        ]
      }
    }
  };

  const mockControllerServices = {
    controllerServices: [
      { id: 'cs-1', component: { name: 'Controller Service 1' } }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (authenticate as jest.Mock) = jest.fn().mockResolvedValue(mockToken);
    (userProcessGroupMappingService.getUserMapping as jest.Mock) = jest.fn().mockResolvedValue(mockUserMapping);
    (nifiApiService.getFlowProcessGroups as jest.Mock) = jest.fn().mockResolvedValue(mockFlowProcessGroups);
    (nifiApiService.getControllerServices as jest.Mock) = jest.fn().mockResolvedValue(mockControllerServices);
    (nifiApiService.getFlowStatus as jest.Mock) = jest.fn().mockResolvedValue({});
    
    // Clear all sessions before each test
    nifiUserSessionService.clearAllSessions();
  });

  describe('initializeUserSession', () => {
    it('should initialize user session successfully', async () => {
      const session = await nifiUserSessionService.initializeUserSession(
        mockUserId,
        mockUsername,
        mockPassword
      );

      expect(session).toBeDefined();
      expect(session.userId).toBe(mockUserId);
      expect(session.username).toBe(mockUsername);
      expect(session.token).toBe(mockToken);
      expect(session.rootProcessGroupId).toBe(mockRootProcessGroupId);
      expect(session.isActive).toBe(true);
    });

    it('should load all NiFi resources', async () => {
      const session = await nifiUserSessionService.initializeUserSession(
        mockUserId,
        mockUsername,
        mockPassword
      );

      expect(session.processGroupIds).toContain(mockProcessGroupId);
      expect(session.processorIds.length).toBeGreaterThan(0);
      expect(session.connectionIds.length).toBeGreaterThan(0);
      expect(session.controllerServiceIds.length).toBeGreaterThan(0);
    });

    it('should handle authentication errors', async () => {
      (authenticate as jest.Mock) = jest.fn().mockRejectedValue(new Error('Auth failed'));

      await expect(
        nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword)
      ).rejects.toThrow();
    });

    it('should handle invalid credentials', async () => {
      (userProcessGroupMappingService.getUserMapping as jest.Mock) = jest.fn().mockResolvedValue(null);

      await expect(
        nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword)
      ).rejects.toThrow();
    });
  });

  describe('getCurrentSession', () => {
    it('should return current session after initialization', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      const session = nifiUserSessionService.getCurrentSession();
      expect(session).toBeDefined();
      expect(session?.userId).toBe(mockUserId);
    });

    it('should return null when no session is active', () => {
      const session = nifiUserSessionService.getCurrentSession();
      expect(session).toBeNull();
    });
  });

  describe('getUserSession', () => {
    it('should return session for specific user', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      const session = nifiUserSessionService.getUserSession(mockUserId);
      expect(session).toBeDefined();
      expect(session?.userId).toBe(mockUserId);
    });

    it('should return null for non-existent user', () => {
      const session = nifiUserSessionService.getUserSession('non-existent');
      expect(session).toBeNull();
    });
  });

  describe('Resource ID Getters', () => {
    it('should return process group IDs', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      const ids = nifiUserSessionService.getProcessGroupIds();
      expect(Array.isArray(ids)).toBe(true);
      expect(ids.length).toBeGreaterThan(0);
    });

    it('should return controller service IDs', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      const ids = nifiUserSessionService.getControllerServiceIds();
      expect(Array.isArray(ids)).toBe(true);
    });

    it('should return processor IDs', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      const ids = nifiUserSessionService.getProcessorIds();
      expect(Array.isArray(ids)).toBe(true);
    });

    it('should return connection IDs', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      const ids = nifiUserSessionService.getConnectionIds();
      expect(Array.isArray(ids)).toBe(true);
    });

    it('should return root process group ID', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      const rootId = nifiUserSessionService.getRootProcessGroupId();
      expect(rootId).toBe(mockRootProcessGroupId);
    });

    it('should return user token', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      const token = nifiUserSessionService.getUserToken();
      expect(token).toBe(mockToken);
    });
  });

  describe('hasAccessToResource', () => {
    it('should return true for accessible resource', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      const hasAccess = nifiUserSessionService.hasAccessToResource(mockProcessGroupId, 'processGroup');
      expect(hasAccess).toBe(true);
    });

    it('should return false for inaccessible resource', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      const hasAccess = nifiUserSessionService.hasAccessToResource('non-existent-id', 'processGroup');
      expect(hasAccess).toBe(false);
    });

    it('should return false when no session is active', () => {
      const hasAccess = nifiUserSessionService.hasAccessToResource('any-id', 'processGroup');
      expect(hasAccess).toBe(false);
    });
  });

  describe('refreshUserSession', () => {
    it('should refresh session data', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      await nifiUserSessionService.refreshUserSession();

      expect(nifiApiService.getFlowProcessGroups).toHaveBeenCalled();
      expect(nifiApiService.getControllerServices).toHaveBeenCalled();
    });

    it('should throw error when no session is active', async () => {
      await expect(nifiUserSessionService.refreshUserSession()).rejects.toThrow();
    });
  });

  describe('switchUser', () => {
    it('should switch to existing cached session', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      const session = await nifiUserSessionService.switchUser(mockUserId, mockUsername, mockPassword);
      expect(session).toBeDefined();
      expect(session.userId).toBe(mockUserId);
    });

    it('should initialize new session for new user', async () => {
      const newUserId = 'user-2';
      const session = await nifiUserSessionService.switchUser(newUserId, 'newuser', 'newpass');
      expect(session).toBeDefined();
      expect(session.userId).toBe(newUserId);
    });
  });

  describe('logout', () => {
    it('should logout current user', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      nifiUserSessionService.logout();

      const session = nifiUserSessionService.getCurrentSession();
      expect(session).toBeNull();
    });
  });

  describe('clearAllSessions', () => {
    it('should clear all sessions', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      nifiUserSessionService.clearAllSessions();

      const session = nifiUserSessionService.getCurrentSession();
      expect(session).toBeNull();
    });
  });

  describe('getSessionStats', () => {
    it('should return session statistics', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      const stats = nifiUserSessionService.getSessionStats();
      expect(stats).toBeDefined();
      expect(stats.activeSessions).toBeGreaterThanOrEqual(0);
      expect(stats.totalResources).toBeGreaterThanOrEqual(0);
      expect(stats.currentUser).toBe(mockUserId);
    });
  });

  describe('validateSession', () => {
    it('should return true for valid session', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      const isValid = await nifiUserSessionService.validateSession();
      expect(isValid).toBe(true);
    });

    it('should return false when no session is active', async () => {
      const isValid = await nifiUserSessionService.validateSession();
      expect(isValid).toBe(false);
    });

    it('should return false when validation fails', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);
      (nifiApiService.getFlowStatus as jest.Mock) = jest.fn().mockRejectedValue(new Error('Validation failed'));

      const isValid = await nifiUserSessionService.validateSession();
      expect(isValid).toBe(false);
    });
  });

  describe('getResourceDetails', () => {
    it('should return resource details for accessible resource', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      const details = await nifiUserSessionService.getResourceDetails(mockProcessGroupId, 'processGroup');
      expect(details).toBeDefined();
      expect(details.id).toBe(mockProcessGroupId);
      expect(details.type).toBe('processGroup');
    });

    it('should throw error for inaccessible resource', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      await expect(
        nifiUserSessionService.getResourceDetails('non-existent-id', 'processGroup')
      ).rejects.toThrow('Access denied');
    });

    it('should return resource details for controller service', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      const details = await nifiUserSessionService.getResourceDetails('cs-1', 'controllerService');
      expect(details).toBeDefined();
      expect(details.id).toBe('cs-1');
      expect(details.type).toBe('controllerService');
    });

    it('should return resource details for processor', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      const details = await nifiUserSessionService.getResourceDetails('proc-1', 'processor');
      expect(details).toBeDefined();
      expect(details.id).toBe('proc-1');
      expect(details.type).toBe('processor');
    });

    it('should return resource details for connection', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      const details = await nifiUserSessionService.getResourceDetails('conn-1', 'connection');
      expect(details).toBeDefined();
      expect(details.id).toBe('conn-1');
      expect(details.type).toBe('connection');
    });

    it('should include userId and lastAccessed in details', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      const details = await nifiUserSessionService.getResourceDetails('cs-1', 'controllerService');
      expect(details.userId).toBe(mockUserId);
      expect(details.lastAccessed).toBeInstanceOf(Date);
    });

    it('should throw error when no session exists', async () => {
      nifiUserSessionService.clearAllSessions();

      await expect(
        nifiUserSessionService.getResourceDetails('any-id', 'processGroup')
      ).rejects.toThrow('Access denied');
    });
  });

  describe('hasAccessToResource', () => {
    it('should check access for controller service', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      const hasAccess = nifiUserSessionService.hasAccessToResource('cs-1', 'controllerService');
      expect(hasAccess).toBe(true);
    });

    it('should check access for processor', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      const hasAccess = nifiUserSessionService.hasAccessToResource('proc-1', 'processor');
      expect(hasAccess).toBe(true);
    });

    it('should check access for connection', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      const hasAccess = nifiUserSessionService.hasAccessToResource('conn-1', 'connection');
      expect(hasAccess).toBe(true);
    });

    it('should return false for unknown resource type', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      const hasAccess = nifiUserSessionService.hasAccessToResource('any-id', 'unknown' as any);
      expect(hasAccess).toBe(false);
    });
  });

  describe('loadAllNiFiResources', () => {
    it('should handle empty flow response', async () => {
      const emptyFlowResponse = {
        processGroupFlow: {
          flow: {}
        }
      };

      (nifiApiService.getFlowProcessGroups as jest.Mock) = jest.fn().mockResolvedValue(emptyFlowResponse);
      (nifiApiService.getControllerServices as jest.Mock) = jest.fn().mockResolvedValue({ controllerServices: [] });

      const session = await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      expect(session.processGroupIds).toEqual([]);
      expect(session.processorIds).toEqual([]);
      expect(session.connectionIds).toEqual([]);
    });

    it('should handle missing flow in response', async () => {
      const responseWithoutFlow = {
        processGroupFlow: {}
      };

      (nifiApiService.getFlowProcessGroups as jest.Mock) = jest.fn().mockResolvedValue(responseWithoutFlow);
      (nifiApiService.getControllerServices as jest.Mock) = jest.fn().mockResolvedValue({ controllerServices: [] });

      const session = await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      expect(session.processGroupIds).toEqual([]);
      expect(session.processorIds).toEqual([]);
      expect(session.connectionIds).toEqual([]);
    });

    it('should handle errors when loading resources', async () => {
      (nifiApiService.getFlowProcessGroups as jest.Mock) = jest.fn().mockRejectedValue(
        new Error('Failed to load resources')
      );

      await expect(
        nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword)
      ).rejects.toThrow();
    });

    it('should handle errors when loading controller services', async () => {
      (nifiApiService.getControllerServices as jest.Mock) = jest.fn().mockRejectedValue(
        new Error('Failed to load controller services')
      );

      await expect(
        nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword)
      ).rejects.toThrow();
    });
  });

  describe('Auto Refresh', () => {
    it('should start auto-refresh after initialization', async () => {
      jest.useFakeTimers();
      
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      // Fast-forward time to trigger auto-refresh
      jest.advanceTimersByTime(30000);

      // Auto-refresh should have been called
      expect(nifiApiService.getFlowProcessGroups).toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('should stop auto-refresh on logout', async () => {
      jest.useFakeTimers();

      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);
      
      const callCountBefore = (nifiApiService.getFlowProcessGroups as jest.Mock).mock.calls.length;
      
      nifiUserSessionService.logout();

      // Fast-forward time - auto-refresh should not be called
      jest.advanceTimersByTime(30000);

      const callCountAfter = (nifiApiService.getFlowProcessGroups as jest.Mock).mock.calls.length;

      // Should not have increased (no auto-refresh after logout)
      expect(callCountAfter).toBe(callCountBefore);

      jest.useRealTimers();
    });

    it('should stop auto-refresh on clearAllSessions', async () => {
      jest.useFakeTimers();

      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);
      
      nifiUserSessionService.clearAllSessions();

      const callCountBefore = (nifiApiService.getFlowProcessGroups as jest.Mock).mock.calls.length;

      // Fast-forward time - auto-refresh should not be called
      jest.advanceTimersByTime(30000);

      const callCountAfter = (nifiApiService.getFlowProcessGroups as jest.Mock).mock.calls.length;

      expect(callCountAfter).toBe(callCountBefore);

      jest.useRealTimers();
    });

    it('should not auto-refresh when session is inactive', async () => {
      jest.useFakeTimers();

      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);
      
      // Make session inactive
      const session = nifiUserSessionService.getCurrentSession();
      if (session) {
        session.isActive = false;
      }

      const callCountBefore = (nifiApiService.getFlowProcessGroups as jest.Mock).mock.calls.length;

      // Fast-forward time - auto-refresh should not be called for inactive session
      jest.advanceTimersByTime(30000);

      const callCountAfter = (nifiApiService.getFlowProcessGroups as jest.Mock).mock.calls.length;

      expect(callCountAfter).toBe(callCountBefore);

      jest.useRealTimers();
    });

    it('should handle auto-refresh errors gracefully', async () => {
      jest.useFakeTimers();

      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      // Make refresh fail
      (nifiApiService.getFlowProcessGroups as jest.Mock).mockRejectedValueOnce(
        new Error('Refresh failed')
      );

      // Fast-forward time - should not throw error
      expect(() => {
        jest.advanceTimersByTime(30000);
      }).not.toThrow();

      jest.useRealTimers();
    });

    it('should replace existing refresh interval when starting new one', async () => {
      jest.useFakeTimers();

      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      const firstInterval = (nifiApiService.getFlowProcessGroups as jest.Mock).mock.calls.length;

      // Initialize another session (should replace interval)
      await nifiUserSessionService.initializeUserSession('user-2', 'user2', 'pass2');

      // Fast-forward time
      jest.advanceTimersByTime(30000);

      // Should have called refresh (new interval is active)
      expect(nifiApiService.getFlowProcessGroups).toHaveBeenCalled();

      jest.useRealTimers();
    });
  });

  describe('switchUser', () => {
    it('should handle inactive cached session', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);
      
      // Make session inactive
      const session = nifiUserSessionService.getCurrentSession();
      if (session) {
        session.isActive = false;
      }

      const newSession = await nifiUserSessionService.switchUser(mockUserId, mockUsername, mockPassword);

      expect(newSession).toBeDefined();
      expect(newSession.isActive).toBe(true);
    });

    it('should handle switch to different user', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      const newUserId = 'user-2';
      const newSession = await nifiUserSessionService.switchUser(newUserId, 'user2', 'pass2');

      expect(newSession).toBeDefined();
      expect(newSession.userId).toBe(newUserId);
    });

    it('should reuse existing active session when switching to same user', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      const firstSession = nifiUserSessionService.getCurrentSession();
      const secondSession = await nifiUserSessionService.switchUser(mockUserId, mockUsername, mockPassword);

      expect(secondSession).toBe(firstSession);
    });
  });

  describe('getSessionStats', () => {
    it('should return null currentUser when no session', () => {
      const stats = nifiUserSessionService.getSessionStats();
      expect(stats.currentUser).toBeNull();
    });

    it('should calculate total resources correctly', async () => {
      await nifiUserSessionService.initializeUserSession(mockUserId, mockUsername, mockPassword);

      const stats = nifiUserSessionService.getSessionStats();
      expect(stats.totalResources).toBeGreaterThan(0);
    });
  });

  describe('Resource ID Getters Edge Cases', () => {
    it('should return empty array when no session for processGroupIds', () => {
      const ids = nifiUserSessionService.getProcessGroupIds();
      expect(ids).toEqual([]);
    });

    it('should return empty array when no session for controllerServiceIds', () => {
      const ids = nifiUserSessionService.getControllerServiceIds();
      expect(ids).toEqual([]);
    });

    it('should return empty array when no session for processorIds', () => {
      const ids = nifiUserSessionService.getProcessorIds();
      expect(ids).toEqual([]);
    });

    it('should return empty array when no session for connectionIds', () => {
      const ids = nifiUserSessionService.getConnectionIds();
      expect(ids).toEqual([]);
    });

    it('should return empty string when no session for rootProcessGroupId', () => {
      const rootId = nifiUserSessionService.getRootProcessGroupId();
      expect(rootId).toBe('');
    });

    it('should return empty string when no session for getUserToken', () => {
      const token = nifiUserSessionService.getUserToken();
      expect(token).toBe('');
    });
  });
});
