import { renderHook } from '@testing-library/react';
import { useDuplicatePermissionPanel } from '../../src/hooks/useDuplicatePermissionPanel';
import type { UserFormData } from '../../src/types/UserFormData';

describe('useDuplicatePermissionPanel', () => {
  const mockFormData: UserFormData = {
    firstName: 'John',
    lastName: 'Doe',
    emailId: 'john.doe@example.com',
    phoneNumber: '1234567890',
    role: 'Admin',
    department: 'IT',
    status: 'Active',
    isenabled: true,
    permissions: {
      enabledModules: ['Module1'],
      selectedPermissions: ['Permission1'],
      activeModule: 'Module1',
      activeSubmodule: null,
    },
  };

  const mockUsers = [
    {
      id: 1,
      firstname: 'Jane',
      lastname: 'Smith',
      emailid: 'jane.smith@example.com',
    },
    {
      id: 2,
      firstname: 'Bob',
      lastname: 'Johnson',
      emailid: 'bob.johnson@example.com',
    },
  ];

  const mockModulesData = {
    Module1: { submodules: ['Sub1'] },
    Module2: { submodules: ['Sub2'] },
  };

  const defaultProps = {
    formData: mockFormData,
    users: mockUsers,
    modulesData: mockModulesData,
    isDuplicatePanelOpen: false,
    setIsDuplicatePanelOpen: jest.fn(),
    handleDuplicatePermissions: jest.fn(),
    setNotification: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Return Values', () => {
    it('should return correct structure', () => {
      const { result } = renderHook(() => useDuplicatePermissionPanel(defaultProps));

      expect(result.current).toHaveProperty('isOpen');
      expect(result.current).toHaveProperty('onClose');
      expect(result.current).toHaveProperty('onDuplicate');
      expect(result.current).toHaveProperty('duplicatePanelUsers');
      expect(result.current).toHaveProperty('fullUsers');
      expect(result.current).toHaveProperty('modulesList');
      expect(result.current).toHaveProperty('modulesData');
      expect(result.current).toHaveProperty('currentUser');
      expect(result.current).toHaveProperty('onSuccessNotification');
    });

    it('should return isOpen from isDuplicatePanelOpen', () => {
      const { result } = renderHook(() =>
        useDuplicatePermissionPanel({ ...defaultProps, isDuplicatePanelOpen: true })
      );

      expect(result.current.isOpen).toBe(true);
    });

    it('should return fullUsers as provided', () => {
      const { result } = renderHook(() => useDuplicatePermissionPanel(defaultProps));

      expect(result.current.fullUsers).toEqual(mockUsers);
    });

    it('should return modulesData as provided', () => {
      const { result } = renderHook(() => useDuplicatePermissionPanel(defaultProps));

      expect(result.current.modulesData).toEqual(mockModulesData);
    });
  });

  describe('duplicatePanelUsers', () => {
    it('should map users correctly with id, name, and email', () => {
      const { result } = renderHook(() => useDuplicatePermissionPanel(defaultProps));

      expect(result.current.duplicatePanelUsers).toHaveLength(2);
      expect(result.current.duplicatePanelUsers[0]).toEqual({
        id: '1',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
      });
      expect(result.current.duplicatePanelUsers[1]).toEqual({
        id: '2',
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
      });
    });

    it('should handle users with missing firstname and lastname', () => {
      const usersWithMissingNames = [
        {
          id: 1,
          emailid: 'user@example.com',
        },
      ];

      const { result } = renderHook(() =>
        useDuplicatePermissionPanel({ ...defaultProps, users: usersWithMissingNames })
      );

      expect(result.current.duplicatePanelUsers[0]).toEqual({
        id: '1',
        name: 'user@example.com',
        email: 'user@example.com',
      });
    });

    it('should handle users with missing emailid', () => {
      const usersWithMissingEmail = [
        {
          id: 1,
          firstname: 'Test',
          lastname: 'User',
        },
      ];

      const { result } = renderHook(() =>
        useDuplicatePermissionPanel({ ...defaultProps, users: usersWithMissingEmail })
      );

      expect(result.current.duplicatePanelUsers[0]).toEqual({
        id: '1',
        name: 'Test User',
        email: '',
      });
    });

    it('should handle users with null id', () => {
      const usersWithNullId = [
        {
          id: null,
          firstname: 'Test',
          lastname: 'User',
          emailid: 'test@example.com',
        },
      ];

      const { result } = renderHook(() =>
        useDuplicatePermissionPanel({ ...defaultProps, users: usersWithNullId })
      );

      expect(result.current.duplicatePanelUsers[0].id).toBe('0');
    });

    it('should handle users with undefined id', () => {
      const usersWithUndefinedId = [
        {
          firstname: 'Test',
          lastname: 'User',
          emailid: 'test@example.com',
        },
      ];

      const { result } = renderHook(() =>
        useDuplicatePermissionPanel({ ...defaultProps, users: usersWithUndefinedId })
      );

      expect(result.current.duplicatePanelUsers[0].id).toBe('0');
    });

    it('should handle empty users array', () => {
      const { result } = renderHook(() =>
        useDuplicatePermissionPanel({ ...defaultProps, users: [] })
      );

      expect(result.current.duplicatePanelUsers).toEqual([]);
    });

    it('should handle users with only firstname', () => {
      const usersWithOnlyFirstname = [
        {
          id: 1,
          firstname: 'John',
          emailid: 'john@example.com',
        },
      ];

      const { result } = renderHook(() =>
        useDuplicatePermissionPanel({ ...defaultProps, users: usersWithOnlyFirstname })
      );

      expect(result.current.duplicatePanelUsers[0].name).toBe('John');
    });

    it('should handle users with only lastname', () => {
      const usersWithOnlyLastname = [
        {
          id: 1,
          lastname: 'Doe',
          emailid: 'doe@example.com',
        },
      ];

      const { result } = renderHook(() =>
        useDuplicatePermissionPanel({ ...defaultProps, users: usersWithOnlyLastname })
      );

      expect(result.current.duplicatePanelUsers[0].name).toBe('Doe');
    });

    it('should handle users with empty strings for names', () => {
      const usersWithEmptyNames = [
        {
          id: 1,
          firstname: '',
          lastname: '',
          emailid: 'test@example.com',
        },
      ];

      const { result } = renderHook(() =>
        useDuplicatePermissionPanel({ ...defaultProps, users: usersWithEmptyNames })
      );

      expect(result.current.duplicatePanelUsers[0].name).toBe('test@example.com');
    });

    it('should handle users with all missing fields', () => {
      const usersWithAllMissing = [
        {
          id: 1,
        },
      ];

      const { result } = renderHook(() =>
        useDuplicatePermissionPanel({ ...defaultProps, users: usersWithAllMissing })
      );

      expect(result.current.duplicatePanelUsers[0]).toEqual({
        id: '1',
        name: 'Unknown User',
        email: '',
      });
    });
  });

  describe('modulesList', () => {
    it('should extract module keys from modulesData', () => {
      const { result } = renderHook(() => useDuplicatePermissionPanel(defaultProps));

      expect(result.current.modulesList).toEqual(['Module1', 'Module2']);
    });

    it('should handle null modulesData', () => {
      const { result } = renderHook(() =>
        useDuplicatePermissionPanel({ ...defaultProps, modulesData: null })
      );

      expect(result.current.modulesList).toEqual([]);
    });

    it('should handle undefined modulesData', () => {
      const { result } = renderHook(() =>
        useDuplicatePermissionPanel({ ...defaultProps, modulesData: undefined })
      );

      expect(result.current.modulesList).toEqual([]);
    });

    it('should handle empty modulesData', () => {
      const { result } = renderHook(() =>
        useDuplicatePermissionPanel({ ...defaultProps, modulesData: {} })
      );

      expect(result.current.modulesList).toEqual([]);
    });
  });

  describe('currentUser', () => {
    it('should extract current user from formData', () => {
      const { result } = renderHook(() => useDuplicatePermissionPanel(defaultProps));

      expect(result.current.currentUser).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        emailId: 'john.doe@example.com',
      });
    });

    it('should handle missing firstName', () => {
      const formDataWithoutFirstName = {
        ...mockFormData,
        firstName: undefined,
      };

      const { result } = renderHook(() =>
        useDuplicatePermissionPanel({ ...defaultProps, formData: formDataWithoutFirstName })
      );

      expect(result.current.currentUser.firstName).toBe('');
    });

    it('should handle missing lastName', () => {
      const formDataWithoutLastName = {
        ...mockFormData,
        lastName: undefined,
      };

      const { result } = renderHook(() =>
        useDuplicatePermissionPanel({ ...defaultProps, formData: formDataWithoutLastName })
      );

      expect(result.current.currentUser.lastName).toBe('');
    });

    it('should handle missing emailId', () => {
      const formDataWithoutEmail = {
        ...mockFormData,
        emailId: undefined,
      };

      const { result } = renderHook(() =>
        useDuplicatePermissionPanel({ ...defaultProps, formData: formDataWithoutEmail })
      );

      expect(result.current.currentUser.emailId).toBe('');
    });

    it('should handle empty strings', () => {
      const formDataWithEmptyStrings = {
        ...mockFormData,
        firstName: '',
        lastName: '',
        emailId: '',
      };

      const { result } = renderHook(() =>
        useDuplicatePermissionPanel({ ...defaultProps, formData: formDataWithEmptyStrings })
      );

      expect(result.current.currentUser).toEqual({
        firstName: '',
        lastName: '',
        emailId: '',
      });
    });
  });

  describe('onClose', () => {
    it('should call setIsDuplicatePanelOpen with false', () => {
      const mockSetIsDuplicatePanelOpen = jest.fn();
      const { result } = renderHook(() =>
        useDuplicatePermissionPanel({
          ...defaultProps,
          setIsDuplicatePanelOpen: mockSetIsDuplicatePanelOpen,
        })
      );

      result.current.onClose();

      expect(mockSetIsDuplicatePanelOpen).toHaveBeenCalledTimes(1);
      expect(mockSetIsDuplicatePanelOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('onDuplicate', () => {
    it('should call handleDuplicatePermissions with provided function', () => {
      const mockHandleDuplicatePermissions = jest.fn();
      const { result } = renderHook(() =>
        useDuplicatePermissionPanel({
          ...defaultProps,
          handleDuplicatePermissions: mockHandleDuplicatePermissions,
        })
      );

      const permissions = ['Permission1', 'Permission2'];
      const enabledModules = ['Module1'];

      result.current.onDuplicate(permissions, enabledModules);

      expect(mockHandleDuplicatePermissions).toHaveBeenCalledTimes(1);
      expect(mockHandleDuplicatePermissions).toHaveBeenCalledWith(permissions, enabledModules);
    });

    it('should handle onDuplicate without enabledModules', () => {
      const mockHandleDuplicatePermissions = jest.fn();
      const { result } = renderHook(() =>
        useDuplicatePermissionPanel({
          ...defaultProps,
          handleDuplicatePermissions: mockHandleDuplicatePermissions,
        })
      );

      const permissions = ['Permission1'];

      result.current.onDuplicate(permissions);

      // onDuplicate passes the function directly, so it will be called with whatever arguments are passed
      expect(mockHandleDuplicatePermissions).toHaveBeenCalledWith(permissions);
    });
  });

  describe('onSuccessNotification', () => {
    it('should call setNotification with success type and message', () => {
      const mockSetNotification = jest.fn();
      const { result } = renderHook(() =>
        useDuplicatePermissionPanel({
          ...defaultProps,
          setNotification: mockSetNotification,
        })
      );

      const message = 'Permissions duplicated successfully';

      result.current.onSuccessNotification(message);

      expect(mockSetNotification).toHaveBeenCalledTimes(1);
      expect(mockSetNotification).toHaveBeenCalledWith({
        type: 'success',
        message,
      });
    });

    it('should handle different success messages', () => {
      const mockSetNotification = jest.fn();
      const { result } = renderHook(() =>
        useDuplicatePermissionPanel({
          ...defaultProps,
          setNotification: mockSetNotification,
        })
      );

      result.current.onSuccessNotification('Another message');

      expect(mockSetNotification).toHaveBeenCalledWith({
        type: 'success',
        message: 'Another message',
      });
    });
  });

  describe('Memoization', () => {
    it('should memoize duplicatePanelUsers based on users', () => {
      const { result, rerender } = renderHook(() => useDuplicatePermissionPanel(defaultProps));

      const firstResult = result.current.duplicatePanelUsers;

      rerender();

      expect(result.current.duplicatePanelUsers).toBe(firstResult);
    });

    it('should update duplicatePanelUsers when users change', () => {
      const { result, rerender } = renderHook(
        (props) => useDuplicatePermissionPanel(props),
        { initialProps: defaultProps }
      );

      const firstResult = result.current.duplicatePanelUsers;

      rerender({
        ...defaultProps,
        users: [
          ...mockUsers,
          {
            id: 3,
            firstname: 'New',
            lastname: 'User',
            emailid: 'new@example.com',
          },
        ],
      });

      expect(result.current.duplicatePanelUsers).not.toBe(firstResult);
      expect(result.current.duplicatePanelUsers).toHaveLength(3);
    });

    it('should memoize modulesList based on modulesData', () => {
      const { result, rerender } = renderHook(() => useDuplicatePermissionPanel(defaultProps));

      const firstResult = result.current.modulesList;

      rerender();

      expect(result.current.modulesList).toBe(firstResult);
    });

    it('should update modulesList when modulesData changes', () => {
      const { result, rerender } = renderHook(
        (props) => useDuplicatePermissionPanel(props),
        { initialProps: defaultProps }
      );

      rerender({
        ...defaultProps,
        modulesData: {
          ...mockModulesData,
          Module3: { submodules: ['Sub3'] },
        },
      });

      expect(result.current.modulesList).toContain('Module3');
    });

    it('should memoize currentUser based on formData fields', () => {
      const { result, rerender } = renderHook(() => useDuplicatePermissionPanel(defaultProps));

      const firstResult = result.current.currentUser;

      rerender();

      expect(result.current.currentUser).toBe(firstResult);
    });

    it('should update currentUser when formData fields change', () => {
      const { result, rerender } = renderHook(
        (props) => useDuplicatePermissionPanel(props),
        { initialProps: defaultProps }
      );

      rerender({
        ...defaultProps,
        formData: {
          ...mockFormData,
          firstName: 'Jane',
        },
      });

      expect(result.current.currentUser.firstName).toBe('Jane');
    });
  });
});

