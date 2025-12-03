import {
  convertSelfReportingToBoolean,
  parseArrayData,
  parsePermissionsData,
  createUserFormData,
  isInAdminApp,
  getNavigationPath,
  navigateToUserManagement,
  handleError,
  setFormDataStates,
  compareObjects,
  comparePermissionFields,
  compareUserDetailsFields,
  updateFormData,
  resetFormData,
  TabPanel,
  createCompleteUserData,
  validateSubmissionPrerequisites,
  showSaveConfirmationMessage,
  hideSaveConfirmationMessage
} from '../../src/utils/userFormUtils';

// Mock console methods
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('userFormUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('convertSelfReportingToBoolean', () => {
    it('converts true values correctly', () => {
      expect(convertSelfReportingToBoolean(true)).toBe(true);
      expect(convertSelfReportingToBoolean('true')).toBe(true);
      expect(convertSelfReportingToBoolean(1)).toBe(true);
      expect(convertSelfReportingToBoolean('1')).toBe(true);
      expect(convertSelfReportingToBoolean('True')).toBe(true);
      expect(convertSelfReportingToBoolean('TRUE')).toBe(true);
    });

    it('converts false values correctly', () => {
      expect(convertSelfReportingToBoolean(false)).toBe(false);
      expect(convertSelfReportingToBoolean('false')).toBe(false);
      expect(convertSelfReportingToBoolean(0)).toBe(false);
      expect(convertSelfReportingToBoolean('0')).toBe(false);
      expect(convertSelfReportingToBoolean('False')).toBe(false);
      expect(convertSelfReportingToBoolean('FALSE')).toBe(false);
    });

    it('handles null/undefined/empty values', () => {
      expect(convertSelfReportingToBoolean(null)).toBe(false);
      expect(convertSelfReportingToBoolean(undefined)).toBe(false);
      expect(convertSelfReportingToBoolean('')).toBe(false);
      expect(convertSelfReportingToBoolean('null')).toBe(false);
      expect(convertSelfReportingToBoolean('undefined')).toBe(false);
    });

    it('handles other values as false', () => {
      expect(convertSelfReportingToBoolean('random')).toBe(false);
      expect(convertSelfReportingToBoolean(123)).toBe(false);
      expect(convertSelfReportingToBoolean({})).toBe(false);
      expect(convertSelfReportingToBoolean([])).toBe(false);
    });
  });

  describe('parseArrayData', () => {
    it('returns array as-is', () => {
      const arr = [1, 2, 3];
      expect(parseArrayData(arr)).toEqual(arr);
    });

    it('parses valid JSON string', () => {
      expect(parseArrayData('[1,2,3]')).toEqual([1, 2, 3]);
    });

    it('returns empty array for invalid JSON', () => {
      expect(parseArrayData('invalid json')).toEqual([]);
    });

    it('returns empty array for non-array JSON', () => {
      expect(parseArrayData('{"key": "value"}')).toEqual([]);
    });

    it('returns empty array for empty string', () => {
      expect(parseArrayData('')).toEqual([]);
    });

    it('returns empty array for non-string, non-array', () => {
      expect(parseArrayData(123)).toEqual([]);
      expect(parseArrayData({})).toEqual([]);
    });
  });

  describe('parsePermissionsData', () => {
    it('returns object with enabledModules and selectedPermissions', () => {
      const data = { enabledModules: [], selectedPermissions: [] };
      expect(parsePermissionsData(data)).toEqual(data);
    });

    it('parses JSON string', () => {
      const data = { enabledModules: [], selectedPermissions: [] };
      expect(parsePermissionsData(JSON.stringify(data))).toEqual(data);
    });

    it('returns empty object for invalid data', () => {
      expect(parsePermissionsData('invalid')).toEqual({
        enabledModules: [],
        selectedPermissions: [],
        activeModule: null,
        activeSubmodule: null,
      });
      expect(parsePermissionsData(null)).toEqual({
        enabledModules: [],
        selectedPermissions: [],
        activeModule: null,
        activeSubmodule: null,
      });
    });
  });

  describe('createUserFormData', () => {
    it('creates form data with default values', () => {
      const result = createUserFormData({}, {});
      expect(result).toHaveProperty('firstName');
      expect(result).toHaveProperty('lastName');
      expect(result).toHaveProperty('emailId');
      expect(result).toHaveProperty('phoneNumber');
    });

    it('creates form data with provided values', () => {
      const userData = { firstname: 'John', lastname: 'Doe' };
      const sourceData = { regions: ['US'], countries: ['USA'] };
      const result = createUserFormData(userData, sourceData);
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
    });
  });

  describe('isInAdminApp', () => {
    it('returns true for admin path', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/admin/user-management' },
        writable: true
      });
      expect(isInAdminApp()).toBe(true);
    });

    it('returns false for non-admin path', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/user-management' },
        writable: true
      });
      expect(isInAdminApp()).toBe(false);
    });
  });

  describe('getNavigationPath', () => {
    it('returns admin path when in admin app', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/admin/user-management' },
        writable: true
      });
      expect(getNavigationPath()).toContain('/admin/user-management');
    });

    it('returns regular path when not in admin app', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/user-management' },
        writable: true
      });
      expect(getNavigationPath()).toContain('/user-management');
    });
  });

  describe('navigateToUserManagement', () => {
    it('calls navigate with correct path', () => {
      const mockNavigate = jest.fn();
      Object.defineProperty(window, 'location', {
        value: { pathname: '/admin/user-management' },
        writable: true
      });
      navigateToUserManagement(mockNavigate);
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  describe('handleError', () => {
    it('logs error and calls setNotification', () => {
      const error = new Error('Test error');
      const setNotification = jest.fn();
      const navigate = jest.fn();
      
      handleError(error, setNotification, navigate);
      
      expect(mockConsoleError).toHaveBeenCalledWith('Error:', error);
      expect(setNotification).toHaveBeenCalled();
    });
  });

  describe('setFormDataStates', () => {
    it('calls all state setters', () => {
      const formDataState = {
        setFormData: jest.fn(),
        setOriginalFormData: jest.fn(),
        setOriginalPermissionData: jest.fn(),
        setIsDataSaved: jest.fn(),
        setIsPermissionSaved: jest.fn(),
        setIsUserDetailsSavedToFrontend: jest.fn(),
        setIsPermissionsSavedToFrontend: jest.fn(),
        setSavedUserId: jest.fn(),
        currentUserIdRef: { current: null }
      };
      const userFormData = { firstName: 'John' };
      
      setFormDataStates(formDataState, userFormData, 'test-id');
      
      expect(formDataState.setFormData).toHaveBeenCalledWith(userFormData);
      expect(formDataState.setOriginalFormData).toHaveBeenCalledWith(userFormData);
      expect(formDataState.setOriginalPermissionData).toHaveBeenCalledWith(userFormData);
      expect(formDataState.setIsDataSaved).toHaveBeenCalledWith(true);
    });
  });

  describe('compareObjects', () => {
    it('returns false for identical objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2 };
      expect(compareObjects(obj1, obj2)).toBe(false);
    });

    it('returns true for different objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 3 };
      expect(compareObjects(obj1, obj2)).toBe(true);
    });

    it('returns false for null objects', () => {
      expect(compareObjects(null, null)).toBe(false);
    });

    it('returns true when one object is null', () => {
      const obj1 = { a: 1 };
      expect(compareObjects(obj1, null)).toBe(true);
      expect(compareObjects(null, obj1)).toBe(true);
    });
  });

  describe('comparePermissionFields', () => {
    it('returns false for identical permission fields', () => {
      const field1 = { regions: ['US'], countries: ['USA'] } as UserFormData;
      const field2 = { regions: ['US'], countries: ['USA'] } as UserFormData;
      expect(comparePermissionFields(field1, field2)).toBe(false);
    });

    it('returns true for different permission fields', () => {
      const field1 = { regions: ['US'], countries: ['USA'] } as UserFormData;
      const field2 = { regions: ['US'], countries: ['Canada'] } as UserFormData;
      expect(comparePermissionFields(field1, field2)).toBe(true);
    });
  });

  describe('compareUserDetailsFields', () => {
    it('returns false for identical user details', () => {
      const field1 = { firstName: 'John', lastName: 'Doe' } as UserFormData;
      const field2 = { firstName: 'John', lastName: 'Doe' } as UserFormData;
      expect(compareUserDetailsFields(field1, field2)).toBe(false);
    });

    it('returns true for different user details', () => {
      const field1 = { firstName: 'John', lastName: 'Doe' } as UserFormData;
      const field2 = { firstName: 'Jane', lastName: 'Doe' } as UserFormData;
      expect(compareUserDetailsFields(field1, field2)).toBe(true);
    });
  });

  describe('updateFormData', () => {
    it('calls setFormData with function', () => {
      const setFormData = jest.fn();
      const updates = { firstName: 'Jane' };
      
      updateFormData(setFormData, updates);
      
      expect(setFormData).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('resetFormData', () => {
    it('calls setFormData with original data', () => {
      const setFormData = jest.fn();
      const originalData = { firstName: 'John' };
      const fields = ['firstName'];
      
      resetFormData(setFormData, originalData, fields);
      
      expect(setFormData).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('TabPanel', () => {
    it('returns children when tab matches', () => {
      const result = TabPanel({ 
        children: 'Test Content', 
        value: 0, 
        index: 0 
      });
      expect(result).toBeDefined();
    });

    it('returns element with hidden true when tab does not match', () => {
      const result = TabPanel({ 
        children: 'Test Content', 
        value: 0, 
        index: 1 
      });
      expect(result).toBeDefined();
      expect(result?.props.hidden).toBe(true);
    });
  });

  describe('createCompleteUserData', () => {
    it('creates complete user data', () => {
      const formData = { firstName: 'John', lastName: 'Doe' } as UserFormData;
      const result = createCompleteUserData(formData);
      expect(result).toHaveProperty('firstname', 'John');
      expect(result).toHaveProperty('lastname', 'Doe');
    });

    it('handles form data with all fields', () => {
      const formData: UserFormData = {
        firstName: 'Jane',
        lastName: 'Smith',
        emailId: 'jane@example.com',
        phoneNumber: '1234567890',
        role: 'Manager',
        department: 'HR',
        reportingManager: 'John Doe',
        dottedLineManager: 'Bob Johnson',
        selfReporting: true,
        status: 'Active',
        isEnabled: true,
        permissions: {
          enabledModules: ['User Management'],
          selectedPermissions: ['Read', 'Write'],
          activeModule: 'User Management',
          activeSubmodule: 'Users',
        },
        regions: ['North America'],
        countries: ['USA'],
        divisions: ['Retail'],
        groups: ['Electronics'],
        departments: ['Sales'],
        classes: ['Electronics'],
        subClasses: ['Phones'],
        id: '123',
        createdAt: '2023-01-01',
        lastUpdatedAt: '2023-01-02',
        createdBy: 'Admin',
        lastUpdatedBy: 'Admin',
        transferedTo: 'Someone',
        transferedBy: 'Admin',
        transferedDate: '2023-01-03',
      };
      const result = createCompleteUserData(formData);
      expect(result).toHaveProperty('firstname', 'Jane');
      expect(result).toHaveProperty('lastname', 'Smith');
      expect(result).toHaveProperty('emailid', 'jane@example.com');
      expect(result).toHaveProperty('phonenumber', '1234567890');
      expect(result).toHaveProperty('role', 'Manager');
      expect(result).toHaveProperty('department', 'HR');
      expect(result).toHaveProperty('reportingmanager', 'Self');
      expect(result).toHaveProperty('dottedorprojectmanager', '');
      expect(result).toHaveProperty('selfreporting', true);
      expect(result).toHaveProperty('status', 'Active');
      expect(result).toHaveProperty('isenabled', true);
      expect(result).toHaveProperty('permissions', JSON.stringify({
        enabledModules: ['User Management'],
        selectedPermissions: ['Read', 'Write'],
        activeModule: 'User Management',
        activeSubmodule: 'Users',
      }));
    });

    it('handles form data with minimal fields', () => {
      const formData: UserFormData = {
        firstName: 'Test',
        lastName: 'User',
        emailId: 'test@example.com',
        phoneNumber: '',
        role: '',
        department: '',
        reportingManager: '',
        dottedLineManager: '',
        selfReporting: false,
        status: 'Inactive',
        isEnabled: false,
        permissions: {
          enabledModules: [],
          selectedPermissions: [],
          activeModule: null,
          activeSubmodule: null,
        },
        regions: [],
        countries: [],
        divisions: [],
        groups: [],
        departments: [],
        classes: [],
        subClasses: [],
      };
      const result = createCompleteUserData(formData);
      expect(result).toHaveProperty('firstname', 'Test');
      expect(result).toHaveProperty('lastname', 'User');
      expect(result).toHaveProperty('emailid', 'test@example.com');
      expect(result).toHaveProperty('phonenumber', '');
      expect(result).toHaveProperty('role', '');
      expect(result).toHaveProperty('department', '');
      expect(result).toHaveProperty('reportingmanager', '');
      expect(result).toHaveProperty('dottedorprojectmanager', '');
      expect(result).toHaveProperty('selfreporting', false);
      expect(result).toHaveProperty('status', 'Active');
      expect(result).toHaveProperty('isenabled', false);
    });
  });

  describe('validateSubmissionPrerequisites', () => {
    it('returns true when all prerequisites are met', () => {
      const setNotification = jest.fn();
      const result = validateSubmissionPrerequisites(true, true, true, setNotification);
      expect(result).toBe(true);
    });

    it('returns false when prerequisites are not met', () => {
      const setNotification = jest.fn();
      const result = validateSubmissionPrerequisites(false, false, false, setNotification);
      expect(result).toBe(false);
      expect(setNotification).toHaveBeenCalled();
    });
  });

  describe('showSaveConfirmationMessage', () => {
    it('calls setNotification with true', () => {
      const setNotification = jest.fn();
      showSaveConfirmationMessage(setNotification);
      expect(setNotification).toHaveBeenCalledWith(true);
    });
  });

  describe('hideSaveConfirmationMessage', () => {
    it('calls setNotification with false', () => {
      const setNotification = jest.fn();
      hideSaveConfirmationMessage(setNotification);
      expect(setNotification).toHaveBeenCalledWith(false);
    });
  });
});