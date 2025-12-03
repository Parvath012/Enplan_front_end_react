import { renderHook, act, waitFor } from '@testing-library/react';
import { useNiFiUserSession } from '../../src/hooks/useNiFiUserSession';
import { nifiUserSessionService } from '../../src/services/nifiUserSessionService';

// Mock the service
jest.mock('../../src/services/nifiUserSessionService');

describe('useNiFiUserSession', () => {
  const mockSession = {
    userId: 'user-1',
    username: 'testuser',
    password: 'testpass',
    token: 'mock-token',
    rootProcessGroupId: 'root-pg-id',
    processGroupIds: ['pg-1', 'pg-2'],
    controllerServiceIds: ['cs-1'],
    processorIds: ['proc-1'],
    connectionIds: ['conn-1'],
    lastUpdated: new Date(),
    isActive: true,
    permissions: {
      canRead: true,
      canWrite: true,
      canDelete: false
    }
  };

  const mockSessionStats = {
    activeSessions: 1,
    totalResources: 5,
    currentUser: 'user-1'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (nifiUserSessionService.initializeUserSession as jest.Mock) = jest.fn().mockResolvedValue(mockSession);
    (nifiUserSessionService.refreshUserSession as jest.Mock) = jest.fn().mockResolvedValue(undefined);
    (nifiUserSessionService.switchUser as jest.Mock) = jest.fn().mockResolvedValue(mockSession);
    (nifiUserSessionService.logout as jest.Mock) = jest.fn();
    (nifiUserSessionService.hasAccessToResource as jest.Mock) = jest.fn().mockReturnValue(true);
    (nifiUserSessionService.validateSession as jest.Mock) = jest.fn().mockResolvedValue(true);
    (nifiUserSessionService.getSessionStats as jest.Mock) = jest.fn().mockReturnValue(mockSessionStats);
    (nifiUserSessionService.getCurrentSession as jest.Mock) = jest.fn().mockReturnValue(null);
    (nifiUserSessionService.stopAutoRefresh as jest.Mock) = jest.fn();
  });

  describe('Initial State', () => {
    it('should return initial state correctly', () => {
      const { result } = renderHook(() => useNiFiUserSession());

      expect(result.current.session).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.processGroupIds).toEqual([]);
      expect(result.current.controllerServiceIds).toEqual([]);
      expect(result.current.processorIds).toEqual([]);
      expect(result.current.connectionIds).toEqual([]);
      expect(result.current.rootProcessGroupId).toBe('');
    });
  });

  describe('initializeSession', () => {
    it('should initialize session successfully', async () => {
      (nifiUserSessionService.getCurrentSession as jest.Mock) = jest.fn().mockReturnValue(mockSession);

      const { result } = renderHook(() => useNiFiUserSession());

      await act(async () => {
        await result.current.initializeSession('user-1', 'testuser', 'testpass');
      });

      await waitFor(() => {
        expect(nifiUserSessionService.initializeUserSession).toHaveBeenCalledWith(
          'user-1',
          'testuser',
          'testpass'
        );
      });

      expect(result.current.session).toBeDefined();
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle initialization errors', async () => {
      (nifiUserSessionService.initializeUserSession as jest.Mock) = jest.fn().mockRejectedValue(
        new Error('Initialization failed')
      );

      const { result } = renderHook(() => useNiFiUserSession());

      await act(async () => {
        await result.current.initializeSession('user-1', 'testuser', 'testpass');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Initialization failed');
      });
    });

    it('should set loading state during initialization', async () => {
      let resolveInit: (value: any) => void;
      const initPromise = new Promise(resolve => {
        resolveInit = resolve;
      });
      (nifiUserSessionService.initializeUserSession as jest.Mock) = jest.fn().mockReturnValue(initPromise);

      const { result } = renderHook(() => useNiFiUserSession());

      act(() => {
        result.current.initializeSession('user-1', 'testuser', 'testpass');
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveInit!(mockSession);
        (nifiUserSessionService.getCurrentSession as jest.Mock) = jest.fn().mockReturnValue(mockSession);
        await initPromise;
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('refreshSession', () => {
    it('should refresh session successfully', async () => {
      (nifiUserSessionService.getCurrentSession as jest.Mock) = jest.fn().mockReturnValue(mockSession);

      const { result } = renderHook(() => useNiFiUserSession());

      await act(async () => {
        await result.current.initializeSession('user-1', 'testuser', 'testpass');
      });

      await act(async () => {
        await result.current.refreshSession();
      });

      expect(nifiUserSessionService.refreshUserSession).toHaveBeenCalled();
    });

    it('should handle refresh errors', async () => {
      (nifiUserSessionService.getCurrentSession as jest.Mock) = jest.fn().mockReturnValue(mockSession);
      (nifiUserSessionService.refreshUserSession as jest.Mock) = jest.fn().mockRejectedValue(
        new Error('Refresh failed')
      );

      const { result } = renderHook(() => useNiFiUserSession());

      await act(async () => {
        await result.current.initializeSession('user-1', 'testuser', 'testpass');
      });

      await act(async () => {
        await result.current.refreshSession();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Refresh failed');
      });
    });

    it('should handle refresh when no session exists', async () => {
      const { result } = renderHook(() => useNiFiUserSession());

      await act(async () => {
        await result.current.refreshSession();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('No active session to refresh');
      });
    });
  });

  describe('switchUser', () => {
    it('should switch user successfully', async () => {
      (nifiUserSessionService.getCurrentSession as jest.Mock) = jest.fn().mockReturnValue(mockSession);

      const { result } = renderHook(() => useNiFiUserSession());

      await act(async () => {
        await result.current.switchUser('user-2', 'newuser', 'newpass');
      });

      expect(nifiUserSessionService.switchUser).toHaveBeenCalledWith('user-2', 'newuser', 'newpass');
    });

    it('should handle switch user errors', async () => {
      (nifiUserSessionService.switchUser as jest.Mock) = jest.fn().mockRejectedValue(
        new Error('Switch failed')
      );

      const { result } = renderHook(() => useNiFiUserSession());

      await act(async () => {
        await result.current.switchUser('user-2', 'newuser', 'newpass');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Switch failed');
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', () => {
      const { result } = renderHook(() => useNiFiUserSession());

      act(() => {
        result.current.logout();
      });

      expect(nifiUserSessionService.logout).toHaveBeenCalled();
      expect(result.current.session).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('hasAccessToResource', () => {
    it('should check resource access correctly', () => {
      const { result } = renderHook(() => useNiFiUserSession());

      const hasAccess = result.current.hasAccessToResource('resource-1', 'processGroup');

      expect(nifiUserSessionService.hasAccessToResource).toHaveBeenCalledWith('resource-1', 'processGroup');
      expect(hasAccess).toBe(true);
    });
  });

  describe('validateSession', () => {
    it('should validate session successfully', async () => {
      const { result } = renderHook(() => useNiFiUserSession());

      let isValid: boolean;
      await act(async () => {
        isValid = await result.current.validateSession();
      });

      expect(nifiUserSessionService.validateSession).toHaveBeenCalled();
      expect(isValid!).toBe(true);
    });

    it('should handle validation errors', async () => {
      (nifiUserSessionService.validateSession as jest.Mock) = jest.fn().mockRejectedValue(
        new Error('Validation failed')
      );

      const { result } = renderHook(() => useNiFiUserSession());

      let isValid: boolean;
      await act(async () => {
        isValid = await result.current.validateSession();
      });

      expect(isValid!).toBe(false);
    });
  });

  describe('sessionStats', () => {
    it('should return session statistics', () => {
      const { result } = renderHook(() => useNiFiUserSession());

      expect(result.current.sessionStats).toBeDefined();
      expect(result.current.sessionStats.activeSessions).toBe(1);
      expect(result.current.sessionStats.totalResources).toBe(5);
      expect(result.current.sessionStats.currentUser).toBe('user-1');
    });
  });

  describe('Resource IDs', () => {
    it('should return resource IDs from session', async () => {
      (nifiUserSessionService.getCurrentSession as jest.Mock) = jest.fn().mockReturnValue(mockSession);

      const { result } = renderHook(() => useNiFiUserSession());

      await act(async () => {
        await result.current.initializeSession('user-1', 'testuser', 'testpass');
      });

      expect(result.current.processGroupIds).toEqual(['pg-1', 'pg-2']);
      expect(result.current.controllerServiceIds).toEqual(['cs-1']);
      expect(result.current.processorIds).toEqual(['proc-1']);
      expect(result.current.connectionIds).toEqual(['conn-1']);
      expect(result.current.rootProcessGroupId).toBe('root-pg-id');
    });
  });

  describe('Auto-refresh', () => {
    it('should cleanup on unmount', () => {
      const { unmount } = renderHook(() => useNiFiUserSession());

      unmount();

      expect(nifiUserSessionService.stopAutoRefresh).toHaveBeenCalled();
    });
  });
});
