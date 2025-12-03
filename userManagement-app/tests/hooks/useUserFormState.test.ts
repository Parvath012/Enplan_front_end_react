import { renderHook, act } from '@testing-library/react';
import { useUserFormState } from '../../src/hooks/useUserFormState';
import type { UserFormData } from '../../src/types/UserFormData';

describe('useUserFormState', () => {
  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useUserFormState());

      // Basic form state
      expect(result.current.activeTab).toBe(0);
      expect(result.current.isFormModified).toBe(false);
      expect(result.current.confirmOpen).toBe(false);
      expect(result.current.confirmMessage).toBe('');
      expect(result.current.confirmType).toBeNull();
      expect(result.current.notification).toBeNull();
      expect(result.current.isSaveSuccessful).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.validationErrors).toEqual({});
      expect(result.current.savedUserId).toBeNull();
      expect(result.current.currentUserIdRef.current).toBeNull();
      expect(result.current.isDataSaved).toBe(false);
      expect(result.current.originalFormData).toBeNull();
      expect(result.current.isPermissionSaved).toBe(false);
      expect(result.current.originalPermissionData).toBeNull();
      expect(result.current.showSaveConfirmation).toBe(false);
      expect(result.current.permissionResetTrigger).toBe(0);

      // Frontend-only save functionality
      expect(result.current.frontendSavedData).toBeNull();
      expect(result.current.isUserDetailsSavedToFrontend).toBe(false);
      expect(result.current.isPermissionsSavedToFrontend).toBe(false);
      expect(result.current.isSubmitLoading).toBe(false);

      // Form data state
      expect(result.current.formData).toEqual({
        id: undefined,
        firstName: '',
        lastName: '',
        phoneNumber: '',
        role: '',
        department: '',
        emailId: '',
        selfReporting: false,
        reportingManager: '',
        dottedLineManager: '',
        regions: [],
        countries: [],
        divisions: [],
        groups: [],
        departments: [],
        classes: [],
        subClasses: []
      });
    });

    it('should provide all required setter functions', () => {
      const { result } = renderHook(() => useUserFormState());

      expect(typeof result.current.setActiveTab).toBe('function');
      expect(typeof result.current.setIsFormModified).toBe('function');
      expect(typeof result.current.setConfirmOpen).toBe('function');
      expect(typeof result.current.setConfirmMessage).toBe('function');
      expect(typeof result.current.setConfirmType).toBe('function');
      expect(typeof result.current.setNotification).toBe('function');
      expect(typeof result.current.setIsSaveSuccessful).toBe('function');
      expect(typeof result.current.setIsLoading).toBe('function');
      expect(typeof result.current.setValidationErrors).toBe('function');
      expect(typeof result.current.setSavedUserId).toBe('function');
      expect(typeof result.current.setIsDataSaved).toBe('function');
      expect(typeof result.current.setOriginalFormData).toBe('function');
      expect(typeof result.current.setIsPermissionSaved).toBe('function');
      expect(typeof result.current.setOriginalPermissionData).toBe('function');
      expect(typeof result.current.setShowSaveConfirmation).toBe('function');
      expect(typeof result.current.setPermissionResetTrigger).toBe('function');
      expect(typeof result.current.setFrontendSavedData).toBe('function');
      expect(typeof result.current.setIsUserDetailsSavedToFrontend).toBe('function');
      expect(typeof result.current.setIsPermissionsSavedToFrontend).toBe('function');
      expect(typeof result.current.setIsSubmitLoading).toBe('function');
      expect(typeof result.current.setFormData).toBe('function');
    });
  });

  describe('State Updates', () => {
    it('should update activeTab', () => {
      const { result } = renderHook(() => useUserFormState());

      act(() => {
        result.current.setActiveTab(1);
      });

      expect(result.current.activeTab).toBe(1);
    });

    it('should update isFormModified', () => {
      const { result } = renderHook(() => useUserFormState());

      act(() => {
        result.current.setIsFormModified(true);
      });

      expect(result.current.isFormModified).toBe(true);
    });

    it('should update confirmOpen', () => {
      const { result } = renderHook(() => useUserFormState());

      act(() => {
        result.current.setConfirmOpen(true);
      });

      expect(result.current.confirmOpen).toBe(true);
    });

    it('should update confirmMessage', () => {
      const { result } = renderHook(() => useUserFormState());

      act(() => {
        result.current.setConfirmMessage('Test message');
      });

      expect(result.current.confirmMessage).toBe('Test message');
    });

    it('should update confirmType', () => {
      const { result } = renderHook(() => useUserFormState());

      act(() => {
        result.current.setConfirmType('reset');
      });

      expect(result.current.confirmType).toBe('reset');
    });

    it('should update notification', () => {
      const { result } = renderHook(() => useUserFormState());

      act(() => {
        result.current.setNotification({
          type: 'error',
          message: 'Test error'
        });
      });

      expect(result.current.notification).toEqual({
        type: 'error',
        message: 'Test error'
      });
    });

    it('should update isSaveSuccessful', () => {
      const { result } = renderHook(() => useUserFormState());

      act(() => {
        result.current.setIsSaveSuccessful(true);
      });

      expect(result.current.isSaveSuccessful).toBe(true);
    });

    it('should update isLoading', () => {
      const { result } = renderHook(() => useUserFormState());

      act(() => {
        result.current.setIsLoading(true);
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should update validationErrors', () => {
      const { result } = renderHook(() => useUserFormState());

      act(() => {
        result.current.setValidationErrors({
          firstName: 'Required field',
          emailId: 'Invalid email'
        });
      });

      expect(result.current.validationErrors).toEqual({
        firstName: 'Required field',
        emailId: 'Invalid email'
      });
    });

    it('should update savedUserId', () => {
      const { result } = renderHook(() => useUserFormState());

      act(() => {
        result.current.setSavedUserId('123');
      });

      expect(result.current.savedUserId).toBe('123');
    });

    it('should update currentUserIdRef', () => {
      const { result } = renderHook(() => useUserFormState());

      act(() => {
        result.current.currentUserIdRef.current = '456';
      });

      expect(result.current.currentUserIdRef.current).toBe('456');
    });

    it('should update isDataSaved', () => {
      const { result } = renderHook(() => useUserFormState());

      act(() => {
        result.current.setIsDataSaved(true);
      });

      expect(result.current.isDataSaved).toBe(true);
    });

    it('should update originalFormData', () => {
      const { result } = renderHook(() => useUserFormState());

      const mockFormData: UserFormData = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailId: 'john@example.com',
        selfReporting: false,
        reportingManager: 'Jane',
        dottedLineManager: 'Bob',
        regions: [],
        countries: [],
        divisions: [],
        groups: [],
        departments: [],
        classes: [],
        subClasses: []
      };

      act(() => {
        result.current.setOriginalFormData(mockFormData);
      });

      expect(result.current.originalFormData).toEqual(mockFormData);
    });

    it('should update isPermissionSaved', () => {
      const { result } = renderHook(() => useUserFormState());

      act(() => {
        result.current.setIsPermissionSaved(true);
      });

      expect(result.current.isPermissionSaved).toBe(true);
    });

    it('should update originalPermissionData', () => {
      const { result } = renderHook(() => useUserFormState());

      const mockFormData: UserFormData = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailId: 'john@example.com',
        selfReporting: false,
        reportingManager: 'Jane',
        dottedLineManager: 'Bob',
        regions: ['North America'],
        countries: ['USA'],
        divisions: ['Retail'],
        groups: ['Electronics'],
        departments: ['IT'],
        classes: ['Class1'],
        subClasses: ['SubClass1'],
        permissions: { enabledModules: ['module1'] }
      };

      act(() => {
        result.current.setOriginalPermissionData(mockFormData);
      });

      expect(result.current.originalPermissionData).toEqual(mockFormData);
    });

    it('should update showSaveConfirmation', () => {
      const { result } = renderHook(() => useUserFormState());

      act(() => {
        result.current.setShowSaveConfirmation(true);
      });

      expect(result.current.showSaveConfirmation).toBe(true);
    });

    it('should update permissionResetTrigger', () => {
      const { result } = renderHook(() => useUserFormState());

      act(() => {
        result.current.setPermissionResetTrigger(5);
      });

      expect(result.current.permissionResetTrigger).toBe(5);
    });

    it('should update frontendSavedData', () => {
      const { result } = renderHook(() => useUserFormState());

      const mockFormData: UserFormData = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailId: 'john@example.com',
        selfReporting: false,
        reportingManager: 'Jane',
        dottedLineManager: 'Bob',
        regions: [],
        countries: [],
        divisions: [],
        groups: [],
        departments: [],
        classes: [],
        subClasses: []
      };

      act(() => {
        result.current.setFrontendSavedData(mockFormData);
      });

      expect(result.current.frontendSavedData).toEqual(mockFormData);
    });

    it('should update isUserDetailsSavedToFrontend', () => {
      const { result } = renderHook(() => useUserFormState());

      act(() => {
        result.current.setIsUserDetailsSavedToFrontend(true);
      });

      expect(result.current.isUserDetailsSavedToFrontend).toBe(true);
    });

    it('should update isPermissionsSavedToFrontend', () => {
      const { result } = renderHook(() => useUserFormState());

      act(() => {
        result.current.setIsPermissionsSavedToFrontend(true);
      });

      expect(result.current.isPermissionsSavedToFrontend).toBe(true);
    });

    it('should update isSubmitLoading', () => {
      const { result } = renderHook(() => useUserFormState());

      act(() => {
        result.current.setIsSubmitLoading(true);
      });

      expect(result.current.isSubmitLoading).toBe(true);
    });

    it('should update formData', () => {
      const { result } = renderHook(() => useUserFormState());

      const newFormData: UserFormData = {
        firstName: 'Jane',
        lastName: 'Smith',
        phoneNumber: '0987654321',
        role: 'User',
        department: 'HR',
        emailId: 'jane@example.com',
        selfReporting: true,
        reportingManager: 'Self',
        dottedLineManager: '',
        regions: ['Europe'],
        countries: ['UK'],
        divisions: ['Finance'],
        groups: ['Marketing'],
        departments: ['HR'],
        classes: ['Class2'],
        subClasses: ['SubClass2']
      };

      act(() => {
        result.current.setFormData(newFormData);
      });

      expect(result.current.formData).toEqual(newFormData);
    });
  });

  describe('Form Data Updates', () => {
    it('should update formData with partial updates', () => {
      const { result } = renderHook(() => useUserFormState());

      act(() => {
        result.current.setFormData(prev => ({
          ...prev,
          firstName: 'John',
          lastName: 'Doe'
        }));
      });

      expect(result.current.formData.firstName).toBe('John');
      expect(result.current.formData.lastName).toBe('Doe');
      expect(result.current.formData.phoneNumber).toBe(''); // Should remain default
    });

    it('should preserve existing formData when updating specific fields', () => {
      const { result } = renderHook(() => useUserFormState());

      // First set some initial data
      act(() => {
        result.current.setFormData(prev => ({
          ...prev,
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '1234567890'
        }));
      });

      // Then update only one field
      act(() => {
        result.current.setFormData(prev => ({
          ...prev,
          firstName: 'Jane'
        }));
      });

      expect(result.current.formData.firstName).toBe('Jane');
      expect(result.current.formData.lastName).toBe('Doe');
      expect(result.current.formData.phoneNumber).toBe('1234567890');
    });
  });

  describe('Complex State Scenarios', () => {
    it('should handle multiple state updates in sequence', () => {
      const { result } = renderHook(() => useUserFormState());

      act(() => {
        result.current.setActiveTab(1);
        result.current.setIsLoading(true);
        result.current.setNotification({
          type: 'success',
          message: 'Saved successfully'
        });
      });

      expect(result.current.activeTab).toBe(1);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.notification).toEqual({
        type: 'success',
        message: 'Saved successfully'
      });
    });

    it('should handle form data with all fields populated', () => {
      const { result } = renderHook(() => useUserFormState());

      const completeFormData: UserFormData = {
        id: '123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailId: 'john.doe@example.com',
        selfReporting: true,
        reportingManager: 'Self',
        dottedLineManager: '',
        regions: ['North America', 'Europe'],
        countries: ['USA', 'Canada', 'UK'],
        divisions: ['Retail', 'Finance'],
        groups: ['Electronics', 'Clothing'],
        departments: ['IT', 'HR'],
        classes: ['Class1', 'Class2'],
        subClasses: ['SubClass1', 'SubClass2'],
        permissions: {
          enabledModules: ['module1', 'module2'],
          selectedPermissions: ['perm1', 'perm2'],
          activeModule: 'module1',
          activeSubmodule: 'submodule1'
        }
      };

      act(() => {
        result.current.setFormData(completeFormData);
      });

      expect(result.current.formData).toEqual(completeFormData);
    });

    it('should handle null and undefined values in form data', () => {
      const { result } = renderHook(() => useUserFormState());

      act(() => {
        result.current.setFormData(prev => ({
          ...prev,
          id: undefined,
          firstName: '',
          lastName: '',
          phoneNumber: '',
          role: '',
          department: '',
          emailId: '',
          selfReporting: false,
          reportingManager: '',
          dottedLineManager: '',
          regions: [],
          countries: [],
          divisions: [],
          groups: [],
          departments: [],
          classes: [],
          subClasses: []
        }));
      });

      expect(result.current.formData.id).toBeUndefined();
      expect(result.current.formData.firstName).toBe('');
      expect(result.current.formData.regions).toEqual([]);
    });
  });

  describe('State Persistence', () => {
    it('should maintain state across multiple renders', () => {
      const { result, rerender } = renderHook(() => useUserFormState());

      act(() => {
        result.current.setActiveTab(1);
        result.current.setIsLoading(true);
      });

      expect(result.current.activeTab).toBe(1);
      expect(result.current.isLoading).toBe(true);

      rerender();

      expect(result.current.activeTab).toBe(1);
      expect(result.current.isLoading).toBe(true);
    });

    it('should reset state when hook is unmounted and remounted', () => {
      const { result, unmount } = renderHook(() => useUserFormState());

      act(() => {
        result.current.setActiveTab(1);
        result.current.setIsLoading(true);
      });

      expect(result.current.activeTab).toBe(1);
      expect(result.current.isLoading).toBe(true);

      unmount();

      const { result: newResult } = renderHook(() => useUserFormState());

      expect(newResult.current.activeTab).toBe(0);
      expect(newResult.current.isLoading).toBe(false);
    });
  });

  describe('Return Value Structure', () => {
    it('should return all required properties', () => {
      const { result } = renderHook(() => useUserFormState());

      const returnedValue = result.current;

      // Basic form state
      expect(returnedValue).toHaveProperty('activeTab');
      expect(returnedValue).toHaveProperty('setActiveTab');
      expect(returnedValue).toHaveProperty('isFormModified');
      expect(returnedValue).toHaveProperty('setIsFormModified');
      expect(returnedValue).toHaveProperty('confirmOpen');
      expect(returnedValue).toHaveProperty('setConfirmOpen');
      expect(returnedValue).toHaveProperty('confirmMessage');
      expect(returnedValue).toHaveProperty('setConfirmMessage');
      expect(returnedValue).toHaveProperty('confirmType');
      expect(returnedValue).toHaveProperty('setConfirmType');
      expect(returnedValue).toHaveProperty('notification');
      expect(returnedValue).toHaveProperty('setNotification');
      expect(returnedValue).toHaveProperty('isSaveSuccessful');
      expect(returnedValue).toHaveProperty('setIsSaveSuccessful');
      expect(returnedValue).toHaveProperty('isLoading');
      expect(returnedValue).toHaveProperty('setIsLoading');
      expect(returnedValue).toHaveProperty('validationErrors');
      expect(returnedValue).toHaveProperty('setValidationErrors');
      expect(returnedValue).toHaveProperty('savedUserId');
      expect(returnedValue).toHaveProperty('setSavedUserId');
      expect(returnedValue).toHaveProperty('currentUserIdRef');
      expect(returnedValue).toHaveProperty('isDataSaved');
      expect(returnedValue).toHaveProperty('setIsDataSaved');
      expect(returnedValue).toHaveProperty('originalFormData');
      expect(returnedValue).toHaveProperty('setOriginalFormData');
      expect(returnedValue).toHaveProperty('isPermissionSaved');
      expect(returnedValue).toHaveProperty('setIsPermissionSaved');
      expect(returnedValue).toHaveProperty('originalPermissionData');
      expect(returnedValue).toHaveProperty('setOriginalPermissionData');
      expect(returnedValue).toHaveProperty('showSaveConfirmation');
      expect(returnedValue).toHaveProperty('setShowSaveConfirmation');
      expect(returnedValue).toHaveProperty('permissionResetTrigger');
      expect(returnedValue).toHaveProperty('setPermissionResetTrigger');

      // Frontend-only save functionality
      expect(returnedValue).toHaveProperty('frontendSavedData');
      expect(returnedValue).toHaveProperty('setFrontendSavedData');
      expect(returnedValue).toHaveProperty('isUserDetailsSavedToFrontend');
      expect(returnedValue).toHaveProperty('setIsUserDetailsSavedToFrontend');
      expect(returnedValue).toHaveProperty('isPermissionsSavedToFrontend');
      expect(returnedValue).toHaveProperty('setIsPermissionsSavedToFrontend');
      expect(returnedValue).toHaveProperty('isSubmitLoading');
      expect(returnedValue).toHaveProperty('setIsSubmitLoading');

      // Form data state
      expect(returnedValue).toHaveProperty('formData');
      expect(returnedValue).toHaveProperty('setFormData');
    });

    it('should return correct types for all properties', () => {
      const { result } = renderHook(() => useUserFormState());

      const returnedValue = result.current;

      // Check types
      expect(typeof returnedValue.activeTab).toBe('number');
      expect(typeof returnedValue.setActiveTab).toBe('function');
      expect(typeof returnedValue.isFormModified).toBe('boolean');
      expect(typeof returnedValue.setIsFormModified).toBe('function');
      expect(typeof returnedValue.confirmOpen).toBe('boolean');
      expect(typeof returnedValue.setConfirmOpen).toBe('function');
      expect(typeof returnedValue.confirmMessage).toBe('string');
      expect(typeof returnedValue.setConfirmMessage).toBe('function');
      expect(typeof returnedValue.confirmType).toBe('object'); // null is object type
      expect(typeof returnedValue.setConfirmType).toBe('function');
      expect(typeof returnedValue.notification).toBe('object'); // null is object type
      expect(typeof returnedValue.setNotification).toBe('function');
      expect(typeof returnedValue.isSaveSuccessful).toBe('boolean');
      expect(typeof returnedValue.setIsSaveSuccessful).toBe('function');
      expect(typeof returnedValue.isLoading).toBe('boolean');
      expect(typeof returnedValue.setIsLoading).toBe('function');
      expect(typeof returnedValue.validationErrors).toBe('object');
      expect(typeof returnedValue.setValidationErrors).toBe('function');
      expect(typeof returnedValue.savedUserId).toBe('object'); // null is object type
      expect(typeof returnedValue.setSavedUserId).toBe('function');
      expect(typeof returnedValue.currentUserIdRef).toBe('object');
      expect(typeof returnedValue.isDataSaved).toBe('boolean');
      expect(typeof returnedValue.setIsDataSaved).toBe('function');
      expect(typeof returnedValue.originalFormData).toBe('object'); // null is object type
      expect(typeof returnedValue.setOriginalFormData).toBe('function');
      expect(typeof returnedValue.isPermissionSaved).toBe('boolean');
      expect(typeof returnedValue.setIsPermissionSaved).toBe('function');
      expect(typeof returnedValue.originalPermissionData).toBe('object'); // null is object type
      expect(typeof returnedValue.setOriginalPermissionData).toBe('function');
      expect(typeof returnedValue.showSaveConfirmation).toBe('boolean');
      expect(typeof returnedValue.setShowSaveConfirmation).toBe('function');
      expect(typeof returnedValue.permissionResetTrigger).toBe('number');
      expect(typeof returnedValue.setPermissionResetTrigger).toBe('function');
      expect(typeof returnedValue.frontendSavedData).toBe('object'); // null is object type
      expect(typeof returnedValue.setFrontendSavedData).toBe('function');
      expect(typeof returnedValue.isUserDetailsSavedToFrontend).toBe('boolean');
      expect(typeof returnedValue.setIsUserDetailsSavedToFrontend).toBe('function');
      expect(typeof returnedValue.isPermissionsSavedToFrontend).toBe('boolean');
      expect(typeof returnedValue.setIsPermissionsSavedToFrontend).toBe('function');
      expect(typeof returnedValue.isSubmitLoading).toBe('boolean');
      expect(typeof returnedValue.setIsSubmitLoading).toBe('function');
      expect(typeof returnedValue.formData).toBe('object');
      expect(typeof returnedValue.setFormData).toBe('function');
    });
  });
});

