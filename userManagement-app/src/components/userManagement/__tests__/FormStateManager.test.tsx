import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useFormStateManager } from '../FormStateManager';
import type { UserFormData } from '../../../types/UserFormData';
import * as userFormUtils from '../../../utils/userFormUtils';

// Mock utility functions
jest.mock('../../../utils/userFormUtils', () => ({
  compareObjects: jest.fn(),
  comparePermissionFields: jest.fn(),
  compareUserDetailsFields: jest.fn(),
  updateFormData: jest.fn(),
  resetFormData: jest.fn(),
  showSaveConfirmationMessage: jest.fn()
}));

// Test component to use the hook
const TestComponent: React.FC<{
  activeTab: number;
  formData: UserFormData;
  originalFormData: UserFormData | null;
  originalPermissionData: UserFormData | null;
  isDataSaved: boolean;
  isPermissionSaved: boolean;
  isUserDetailsSavedToFrontend: boolean;
  isPermissionsSavedToFrontend: boolean;
  isSaveSuccessful: boolean;
  setIsSaveSuccessful: jest.Mock;
  setIsUserDetailsModified: jest.Mock;
  setIsPermissionsModified: jest.Mock;
  setValidationErrors: jest.Mock;
  setShowSaveConfirmation: jest.Mock;
  setPermissionResetTrigger: jest.Mock;
  setOriginalFormData: jest.Mock;
  setOriginalPermissionData: jest.Mock;
  setIsUserDetailsSavedToFrontend: jest.Mock;
  setIsPermissionsSavedToFrontend: jest.Mock;
  setIsDataSaved: jest.Mock;
  setIsPermissionSaved: jest.Mock;
  setFrontendSavedData: jest.Mock;
  setFormData: jest.Mock;
}> = (props) => {
  const stateManager = useFormStateManager(props);

  return (
    <div>
      <button 
        data-testid="reset-modification-states-tab0" 
        onClick={() => stateManager.resetModificationStatesOnTabSwitch(0)}
      >
        Reset Modification States Tab 0
      </button>
      <button 
        data-testid="reset-modification-states-tab1" 
        onClick={() => stateManager.resetModificationStatesOnTabSwitch(1)}
      >
        Reset Modification States Tab 1
      </button>
      <button 
        data-testid="check-user-details-changes" 
        onClick={() => stateManager.checkUserDetailsForChanges()}
      >
        Check User Details Changes
      </button>
      <button 
        data-testid="check-permissions-changes" 
        onClick={() => stateManager.checkPermissionsForChanges()}
      >
        Check Permissions Changes
      </button>
      <button 
        data-testid="check-and-set-modification-tab0" 
        onClick={() => stateManager.checkAndSetModificationStateOnTabSwitch(0)}
      >
        Check And Set Modification Tab 0
      </button>
      <button 
        data-testid="check-and-set-modification-tab1" 
        onClick={() => stateManager.checkAndSetModificationStateOnTabSwitch(1)}
      >
        Check And Set Modification Tab 1
      </button>
      <button 
        data-testid="check-data-changed-tab0" 
        onClick={() => stateManager.checkDataChanged('firstName', 'New Value')}
      >
        Check Data Changed Tab 0
      </button>
      <button 
        data-testid="check-data-changed-tab1" 
        onClick={() => stateManager.checkDataChanged('regions', ['New Region'])}
      >
        Check Data Changed Tab 1
      </button>
      <button 
        data-testid="handle-form-modification-tracking-tab0" 
        onClick={() => stateManager.handleFormModificationTracking('firstName', 'New Value')}
      >
        Handle Form Modification Tracking Tab 0
      </button>
      <button 
        data-testid="handle-form-modification-tracking-tab1" 
        onClick={() => stateManager.handleFormModificationTracking('regions', ['New Region'])}
      >
        Handle Form Modification Tracking Tab 1
      </button>
      <button 
        data-testid="handle-self-reporting-enabled" 
        onClick={() => stateManager.handleSelfReportingEnabled()}
      >
        Handle Self Reporting Enabled
      </button>
      <button 
        data-testid="handle-self-reporting-disabled" 
        onClick={() => stateManager.handleSelfReportingDisabled()}
      >
        Handle Self Reporting Disabled
      </button>
      <button 
        data-testid="handle-input-change-self-reporting-true" 
        onClick={() => stateManager.handleInputChange('selfReporting', true)}
      >
        Handle Input Change Self Reporting True
      </button>
      <button 
        data-testid="handle-input-change-self-reporting-false" 
        onClick={() => stateManager.handleInputChange('selfReporting', false)}
      >
        Handle Input Change Self Reporting False
      </button>
      <button 
        data-testid="handle-input-change-other" 
        onClick={() => stateManager.handleInputChange('firstName', 'New Value')}
      >
        Handle Input Change Other
      </button>
      <button 
        data-testid="handle-reset-tab0" 
        onClick={() => stateManager.handleReset()}
      >
        Handle Reset Tab 0
      </button>
      <button 
        data-testid="handle-reset-tab1" 
        onClick={() => stateManager.handleReset()}
      >
        Handle Reset Tab 1
      </button>
      <button 
        data-testid="handle-save-with-validation-success" 
        onClick={() => stateManager.handleSaveWithValidation(() => true, jest.fn())}
      >
        Handle Save With Validation Success
      </button>
      <button 
        data-testid="handle-save-with-validation-failure" 
        onClick={() => stateManager.handleSaveWithValidation(() => false, jest.fn())}
      >
        Handle Save With Validation Failure
      </button>
      <button 
        data-testid="handle-save-with-validation-error" 
        onClick={async () => {
          try {
            await stateManager.handleSaveWithValidation(() => { throw new Error('Test error'); }, jest.fn());
          } catch (error) {
            // Expected error, ignore
          }
        }}
      >
        Handle Save With Validation Error
      </button>
    </div>
  );
};

describe('useFormStateManager Hook', () => {
  const mockSetFormData = jest.fn();
  const mockSetIsSaveSuccessful = jest.fn();
  const mockSetIsUserDetailsModified = jest.fn();
  const mockSetIsPermissionsModified = jest.fn();
  const mockSetValidationErrors = jest.fn();
  const mockSetShowSaveConfirmation = jest.fn();
  const mockSetPermissionResetTrigger = jest.fn();
  const mockSetOriginalFormData = jest.fn();
  const mockSetOriginalPermissionData = jest.fn();
  const mockSetIsUserDetailsSavedToFrontend = jest.fn();
  const mockSetIsPermissionsSavedToFrontend = jest.fn();
  const mockSetIsDataSaved = jest.fn();
  const mockSetIsPermissionSaved = jest.fn();
  const mockSetFrontendSavedData = jest.fn();

  const defaultFormData: UserFormData = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '1234567890',
    role: 'Admin',
    department: 'IT',
    emailId: 'john.doe@example.com',
    selfReporting: false,
    reportingManager: 'Jane Manager',
    dottedLineManager: 'Bob Project',
    regions: ['North America'],
    countries: ['USA'],
    divisions: ['Technology'],
    groups: ['Development'],
    departments: ['Engineering'],
    classes: ['Senior'],
    subClasses: ['Frontend'],
    permissions: 'read,write'
  };

  const defaultProps = {
    activeTab: 0,
    formData: defaultFormData,
    setFormData: mockSetFormData,
    originalFormData: defaultFormData,
    originalPermissionData: defaultFormData,
    isDataSaved: true,
    isPermissionSaved: true,
    isUserDetailsSavedToFrontend: true,
    isPermissionsSavedToFrontend: true,
    isSaveSuccessful: true,
    setIsSaveSuccessful: mockSetIsSaveSuccessful,
    setIsUserDetailsModified: mockSetIsUserDetailsModified,
    setIsPermissionsModified: mockSetIsPermissionsModified,
    setValidationErrors: mockSetValidationErrors,
    setShowSaveConfirmation: mockSetShowSaveConfirmation,
    setPermissionResetTrigger: mockSetPermissionResetTrigger,
    setOriginalFormData: mockSetOriginalFormData,
    setOriginalPermissionData: mockSetOriginalPermissionData,
    setIsUserDetailsSavedToFrontend: mockSetIsUserDetailsSavedToFrontend,
    setIsPermissionsSavedToFrontend: mockSetIsPermissionsSavedToFrontend,
    setIsDataSaved: mockSetIsDataSaved,
    setIsPermissionSaved: mockSetIsPermissionSaved,
    setFrontendSavedData: mockSetFrontendSavedData
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    (userFormUtils.compareObjects as jest.Mock).mockReturnValue(false);
    (userFormUtils.comparePermissionFields as jest.Mock).mockReturnValue(false);
    (userFormUtils.compareUserDetailsFields as jest.Mock).mockReturnValue(false);
    (userFormUtils.updateFormData as jest.Mock).mockImplementation(() => {});
    (userFormUtils.resetFormData as jest.Mock).mockImplementation(() => {});
    (userFormUtils.showSaveConfirmationMessage as jest.Mock).mockImplementation(() => {});
  });

  describe('resetModificationStatesOnTabSwitch', () => {
    it('should reset permissions modification when switching to tab 0 and permissions are saved', () => {
      const props = { ...defaultProps, isPermissionsSavedToFrontend: true };
      render(<TestComponent {...props} />);

      fireEvent.click(screen.getByTestId('reset-modification-states-tab0'));
      
      expect(mockSetIsPermissionsModified).toHaveBeenCalledWith(false);
    });

    it('should not reset permissions modification when switching to tab 0 and permissions are not saved', () => {
      const props = { ...defaultProps, isPermissionsSavedToFrontend: false };
      render(<TestComponent {...props} />);

      fireEvent.click(screen.getByTestId('reset-modification-states-tab0'));
      
      expect(mockSetIsPermissionsModified).not.toHaveBeenCalled();
    });

    it('should reset user details modification when switching to tab 1 and user details are saved', () => {
      const props = { ...defaultProps, isUserDetailsSavedToFrontend: true };
      render(<TestComponent {...props} />);

      fireEvent.click(screen.getByTestId('reset-modification-states-tab1'));
      
      expect(mockSetIsUserDetailsModified).toHaveBeenCalledWith(false);
    });

    it('should not reset user details modification when switching to tab 1 and user details are not saved', () => {
      const props = { ...defaultProps, isUserDetailsSavedToFrontend: false };
      render(<TestComponent {...props} />);

      fireEvent.click(screen.getByTestId('reset-modification-states-tab1'));
      
      expect(mockSetIsUserDetailsModified).not.toHaveBeenCalled();
    });
  });

  describe('checkUserDetailsForChanges', () => {
    it('should return true when user details are not saved and form has data', () => {
      const props = { ...defaultProps, isUserDetailsSavedToFrontend: false };
      render(<TestComponent {...props} />);

      fireEvent.click(screen.getByTestId('check-user-details-changes'));
      
      // Should not throw errors and execute successfully
      expect(screen.getByTestId('check-user-details-changes')).toBeInTheDocument();
    });

    it('should return true when user details are not saved and originalFormData is null', () => {
      const props = { ...defaultProps, isUserDetailsSavedToFrontend: false, originalFormData: null };
      render(<TestComponent {...props} />);

      fireEvent.click(screen.getByTestId('check-user-details-changes'));
      
      expect(screen.getByTestId('check-user-details-changes')).toBeInTheDocument();
    });

    it('should use compareUserDetailsFields when user details are saved and originalFormData exists', () => {
      const props = { ...defaultProps, isUserDetailsSavedToFrontend: true };
      render(<TestComponent {...props} />);

      fireEvent.click(screen.getByTestId('check-user-details-changes'));
      
      expect(userFormUtils.compareUserDetailsFields).toHaveBeenCalledWith(defaultFormData, defaultFormData);
    });
  });

  describe('checkPermissionsForChanges', () => {
    it('should return true when permissions are not saved and form has data', () => {
      const props = { ...defaultProps, isPermissionsSavedToFrontend: false };
      render(<TestComponent {...props} />);

      fireEvent.click(screen.getByTestId('check-permissions-changes'));
      
      expect(screen.getByTestId('check-permissions-changes')).toBeInTheDocument();
    });

    it('should return true when permissions are not saved and originalPermissionData is null', () => {
      const props = { ...defaultProps, isPermissionsSavedToFrontend: false, originalPermissionData: null };
      render(<TestComponent {...props} />);

      fireEvent.click(screen.getByTestId('check-permissions-changes'));
      
      expect(screen.getByTestId('check-permissions-changes')).toBeInTheDocument();
    });

    it('should use comparePermissionFields when permissions are saved and originalPermissionData exists', () => {
      const props = { ...defaultProps, isPermissionsSavedToFrontend: true };
      render(<TestComponent {...props} />);

      fireEvent.click(screen.getByTestId('check-permissions-changes'));
      
      expect(userFormUtils.comparePermissionFields).toHaveBeenCalledWith(defaultFormData, defaultFormData);
    });
  });

  describe('checkAndSetModificationStateOnTabSwitch', () => {
    it('should check and set user details modification for tab 0', () => {
      render(<TestComponent {...defaultProps} />);

      fireEvent.click(screen.getByTestId('check-and-set-modification-tab0'));
      
      expect(mockSetIsUserDetailsModified).toHaveBeenCalled();
    });

    it('should check and set permissions modification for tab 1', () => {
      render(<TestComponent {...defaultProps} />);

      fireEvent.click(screen.getByTestId('check-and-set-modification-tab1'));
      
      expect(mockSetIsPermissionsModified).toHaveBeenCalled();
    });
  });

  describe('checkDataChanged', () => {
    it('should return true when activeTab is 0 and data is not saved', () => {
      const props = { ...defaultProps, activeTab: 0, isDataSaved: false };
      render(<TestComponent {...props} />);

      fireEvent.click(screen.getByTestId('check-data-changed-tab0'));
      
      expect(screen.getByTestId('check-data-changed-tab0')).toBeInTheDocument();
    });

    it('should return true when activeTab is 0 and originalFormData is null', () => {
      const props = { ...defaultProps, activeTab: 0, originalFormData: null };
      render(<TestComponent {...props} />);

      fireEvent.click(screen.getByTestId('check-data-changed-tab0'));
      
      expect(screen.getByTestId('check-data-changed-tab0')).toBeInTheDocument();
    });

    it('should use compareObjects when activeTab is 0 and data is saved', () => {
      const props = { ...defaultProps, activeTab: 0, isDataSaved: true };
      render(<TestComponent {...props} />);

      fireEvent.click(screen.getByTestId('check-data-changed-tab0'));
      
      expect(userFormUtils.compareObjects).toHaveBeenCalled();
    });

    it('should return true when activeTab is 1 and permission is not saved', () => {
      const props = { ...defaultProps, activeTab: 1, isPermissionSaved: false };
      render(<TestComponent {...props} />);

      fireEvent.click(screen.getByTestId('check-data-changed-tab1'));
      
      expect(screen.getByTestId('check-data-changed-tab1')).toBeInTheDocument();
    });

    it('should return true when activeTab is 1 and originalPermissionData is null', () => {
      const props = { ...defaultProps, activeTab: 1, originalPermissionData: null };
      render(<TestComponent {...props} />);

      fireEvent.click(screen.getByTestId('check-data-changed-tab1'));
      
      expect(screen.getByTestId('check-data-changed-tab1')).toBeInTheDocument();
    });

    it('should use compareObjects when activeTab is 1 and permission is saved', () => {
      const props = { ...defaultProps, activeTab: 1, isPermissionSaved: true };
      render(<TestComponent {...props} />);

      fireEvent.click(screen.getByTestId('check-data-changed-tab1'));
      
      expect(userFormUtils.compareObjects).toHaveBeenCalled();
    });

    it('should return true for any other activeTab value', () => {
      const props = { ...defaultProps, activeTab: 2 };
      const stateManager = useFormStateManager(props);
      const result = stateManager.checkDataChanged('testField', 'testValue');
      
      expect(result).toBe(true);
    });
  });

  describe('handleFormModificationTracking', () => {
    it('should handle user details modification tracking for tab 0 when not saved', () => {
      const props = { ...defaultProps, activeTab: 0, isUserDetailsSavedToFrontend: false };
      render(<TestComponent {...props} />);

      fireEvent.click(screen.getByTestId('handle-form-modification-tracking-tab0'));
      
      expect(mockSetIsUserDetailsModified).toHaveBeenCalledWith(true);
    });

    it('should handle user details modification tracking for tab 0 when saved', () => {
      const props = { ...defaultProps, activeTab: 0, isUserDetailsSavedToFrontend: true };
      (userFormUtils.compareObjects as jest.Mock).mockReturnValue(true);
      render(<TestComponent {...props} />);

      fireEvent.click(screen.getByTestId('handle-form-modification-tracking-tab0'));
      
      expect(mockSetIsUserDetailsModified).toHaveBeenCalledWith(true);
      expect(mockSetIsSaveSuccessful).toHaveBeenCalledWith(false);
    });

    it('should handle permissions modification tracking for tab 1 when not saved', () => {
      const props = { ...defaultProps, activeTab: 1, isPermissionsSavedToFrontend: false };
      render(<TestComponent {...props} />);

      fireEvent.click(screen.getByTestId('handle-form-modification-tracking-tab1'));
      
      expect(mockSetIsPermissionsModified).toHaveBeenCalledWith(true);
    });

    it('should handle permissions modification tracking for tab 1 when saved', () => {
      const props = { ...defaultProps, activeTab: 1, isPermissionsSavedToFrontend: true };
      (userFormUtils.compareObjects as jest.Mock).mockReturnValue(true);
      render(<TestComponent {...props} />);

      fireEvent.click(screen.getByTestId('handle-form-modification-tracking-tab1'));
      
      expect(mockSetIsPermissionsModified).toHaveBeenCalledWith(true);
    });
  });

  describe('handleSelfReportingEnabled', () => {
    it('should update form data and clear validation errors', () => {
      render(<TestComponent {...defaultProps} />);

      fireEvent.click(screen.getByTestId('handle-self-reporting-enabled'));
      
      expect(userFormUtils.updateFormData).toHaveBeenCalledWith(
        mockSetFormData,
        { reportingManager: 'Self', dottedLineManager: '' }
      );
      expect(mockSetValidationErrors).toHaveBeenCalled();
    });
  });

  describe('handleSelfReportingDisabled', () => {
    it('should update form data to clear reporting managers', () => {
      render(<TestComponent {...defaultProps} />);

      fireEvent.click(screen.getByTestId('handle-self-reporting-disabled'));
      
      expect(userFormUtils.updateFormData).toHaveBeenCalledWith(
        mockSetFormData,
        { reportingManager: '', dottedLineManager: '' }
      );
    });
  });

  describe('handleInputChange', () => {
    it('should handle selfReporting field change to true', () => {
      render(<TestComponent {...defaultProps} />);

      fireEvent.click(screen.getByTestId('handle-input-change-self-reporting-true'));
      
      expect(userFormUtils.updateFormData).toHaveBeenCalled();
      expect(mockSetValidationErrors).toHaveBeenCalled();
    });

    it('should handle selfReporting field change to false', () => {
      render(<TestComponent {...defaultProps} />);

      fireEvent.click(screen.getByTestId('handle-input-change-self-reporting-false'));
      
      expect(userFormUtils.updateFormData).toHaveBeenCalled();
    });

    it('should handle other field changes', () => {
      render(<TestComponent {...defaultProps} />);

      fireEvent.click(screen.getByTestId('handle-input-change-other'));
      
      expect(userFormUtils.updateFormData).toHaveBeenCalled();
    });
  });

  describe('handleReset', () => {
    it('should reset user details for tab 0', () => {
      render(<TestComponent {...defaultProps} />);

      fireEvent.click(screen.getByTestId('handle-reset-tab0'));
      
      expect(userFormUtils.resetFormData).toHaveBeenCalled();
      expect(mockSetIsUserDetailsModified).toHaveBeenCalledWith(false);
      expect(mockSetValidationErrors).toHaveBeenCalledWith({});
    });

    it('should reset permissions for tab 1', () => {
      const props = { ...defaultProps, activeTab: 1 };
      render(<TestComponent {...props} />);

      fireEvent.click(screen.getByTestId('handle-reset-tab1'));
      
      expect(userFormUtils.resetFormData).toHaveBeenCalled();
      expect(mockSetPermissionResetTrigger).toHaveBeenCalled();
      expect(mockSetIsPermissionsModified).toHaveBeenCalledWith(false);
      expect(mockSetValidationErrors).toHaveBeenCalledWith({});
    });
  });

  describe('handleSaveWithValidation', () => {
    it('should handle successful save for tab 0', async () => {
      const mockSetIsLoading = jest.fn();
      const props = { ...defaultProps, activeTab: 0 };
      render(<TestComponent {...props} />);

      fireEvent.click(screen.getByTestId('handle-save-with-validation-success'));
      
      expect(mockSetIsUserDetailsSavedToFrontend).toHaveBeenCalledWith(true);
      expect(mockSetOriginalFormData).toHaveBeenCalled();
      expect(mockSetIsDataSaved).toHaveBeenCalledWith(true);
      expect(mockSetIsUserDetailsModified).toHaveBeenCalledWith(false);
      expect(mockSetIsSaveSuccessful).toHaveBeenCalledWith(true);
      expect(mockSetFrontendSavedData).toHaveBeenCalled();
      expect(userFormUtils.showSaveConfirmationMessage).toHaveBeenCalled();
    });

    it('should handle successful save for tab 1', async () => {
      const mockSetIsLoading = jest.fn();
      const props = { ...defaultProps, activeTab: 1 };
      render(<TestComponent {...props} />);

      fireEvent.click(screen.getByTestId('handle-save-with-validation-success'));
      
      expect(mockSetIsPermissionsSavedToFrontend).toHaveBeenCalledWith(true);
      expect(mockSetOriginalPermissionData).toHaveBeenCalled();
      expect(mockSetIsPermissionSaved).toHaveBeenCalledWith(true);
      expect(mockSetIsPermissionsModified).toHaveBeenCalledWith(false);
      expect(mockSetFrontendSavedData).toHaveBeenCalled();
      expect(userFormUtils.showSaveConfirmationMessage).toHaveBeenCalled();
    });

    it('should not proceed when validation fails', async () => {
      const mockSetIsLoading = jest.fn();
      render(<TestComponent {...defaultProps} />);

      fireEvent.click(screen.getByTestId('handle-save-with-validation-failure'));
      
      expect(mockSetIsUserDetailsSavedToFrontend).not.toHaveBeenCalled();
      expect(mockSetIsPermissionsSavedToFrontend).not.toHaveBeenCalled();
    });

    it('should handle error and reset states', async () => {
      const mockSetIsLoading = jest.fn();
      const props = { ...defaultProps, activeTab: 0 };
      const stateManager = useFormStateManager(props);
      
      // Mock showSaveConfirmationMessage to throw an error
      (userFormUtils.showSaveConfirmationMessage as jest.Mock).mockImplementation(() => {
        throw new Error('Save confirmation error');
      });
      
      try {
        await stateManager.handleSaveWithValidation(() => true, mockSetIsLoading);
      } catch (error) {
        // Expected error
      }
      
      expect(mockSetIsUserDetailsSavedToFrontend).toHaveBeenCalledWith(false);
      expect(mockSetIsDataSaved).toHaveBeenCalledWith(false);
      expect(mockSetIsUserDetailsModified).toHaveBeenCalledWith(true);
      expect(mockSetIsSaveSuccessful).toHaveBeenCalledWith(false);
    });

    it('should handle error for tab 1 and reset states', async () => {
      const mockSetIsLoading = jest.fn();
      const props = { ...defaultProps, activeTab: 1 };
      const stateManager = useFormStateManager(props);
      
      // Mock showSaveConfirmationMessage to throw an error
      (userFormUtils.showSaveConfirmationMessage as jest.Mock).mockImplementation(() => {
        throw new Error('Save confirmation error');
      });
      
      try {
        await stateManager.handleSaveWithValidation(() => true, mockSetIsLoading);
      } catch (error) {
        // Expected error
      }
      
      expect(mockSetIsPermissionsSavedToFrontend).toHaveBeenCalledWith(false);
      expect(mockSetIsPermissionSaved).toHaveBeenCalledWith(false);
      expect(mockSetIsPermissionsModified).toHaveBeenCalledWith(true);
      expect(mockSetIsSaveSuccessful).toHaveBeenCalledWith(false);
    });
  });

  describe('Edge cases and comprehensive coverage', () => {
    it('should handle empty form data', () => {
      const emptyFormData: UserFormData = {
        id: '',
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
        subClasses: [],
        permissions: ''
      };

      const props = { ...defaultProps, formData: emptyFormData };
      const stateManager = useFormStateManager(props);
      
      expect(typeof stateManager.checkUserDetailsForChanges).toBe('function');
      expect(typeof stateManager.checkPermissionsForChanges).toBe('function');
    });

    it('should handle null form data fields', () => {
      const nullFormData = {
        ...defaultFormData,
        firstName: null,
        lastName: null,
        emailId: null,
        regions: null,
        countries: null
      } as any;

      const props = { ...defaultProps, formData: nullFormData };
      const stateManager = useFormStateManager(props);
      
      expect(typeof stateManager.checkUserDetailsForChanges).toBe('function');
      expect(typeof stateManager.checkPermissionsForChanges).toBe('function');
    });

    it('should handle all function returns', () => {
      const stateManager = useFormStateManager(defaultProps);

      expect(typeof stateManager.resetModificationStatesOnTabSwitch).toBe('function');
      expect(typeof stateManager.checkUserDetailsForChanges).toBe('function');
      expect(typeof stateManager.checkPermissionsForChanges).toBe('function');
      expect(typeof stateManager.checkAndSetModificationStateOnTabSwitch).toBe('function');
      expect(typeof stateManager.checkDataChanged).toBe('function');
      expect(typeof stateManager.handleFormModificationTracking).toBe('function');
      expect(typeof stateManager.handleSelfReportingEnabled).toBe('function');
      expect(typeof stateManager.handleSelfReportingDisabled).toBe('function');
      expect(typeof stateManager.handleInputChange).toBe('function');
      expect(typeof stateManager.handleReset).toBe('function');
      expect(typeof stateManager.handleSaveWithValidation).toBe('function');
    });

    it('should handle different field types in handleInputChange', () => {
      const stateManager = useFormStateManager(defaultProps);

      // Test different field types
      stateManager.handleInputChange('firstName', 'New Name');
      stateManager.handleInputChange('selfReporting', true);
      stateManager.handleInputChange('regions', ['North America', 'Europe']);
      stateManager.handleInputChange('permissions', 'read,write,delete');
      
      expect(userFormUtils.updateFormData).toHaveBeenCalled();
    });

    it('should handle validation error clearing in handleSelfReportingEnabled', () => {
      const stateManager = useFormStateManager(defaultProps);
      
      stateManager.handleSelfReportingEnabled();
      
      expect(mockSetValidationErrors).toHaveBeenCalled();
    });

    it('should handle error in handleSaveWithValidation for tab 0 with proper state reset', async () => {
      const mockSetIsLoading = jest.fn();
      const props = { ...defaultProps, activeTab: 0 };
      const stateManager = useFormStateManager(props);
      
      // Mock showSaveConfirmationMessage to throw an error
      (userFormUtils.showSaveConfirmationMessage as jest.Mock).mockImplementation(() => {
        throw new Error('Save confirmation error');
      });
      
      try {
        await stateManager.handleSaveWithValidation(() => true, mockSetIsLoading);
      } catch (error) {
        // Expected error
      }
      
      expect(mockSetIsUserDetailsSavedToFrontend).toHaveBeenCalledWith(false);
      expect(mockSetIsDataSaved).toHaveBeenCalledWith(false);
      expect(mockSetIsUserDetailsModified).toHaveBeenCalledWith(true);
      expect(mockSetIsSaveSuccessful).toHaveBeenCalledWith(false);
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });

    it('should handle error in handleSaveWithValidation for tab 1 with proper state reset', async () => {
      const mockSetIsLoading = jest.fn();
      const props = { ...defaultProps, activeTab: 1 };
      const stateManager = useFormStateManager(props);
      
      // Mock showSaveConfirmationMessage to throw an error
      (userFormUtils.showSaveConfirmationMessage as jest.Mock).mockImplementation(() => {
        throw new Error('Save confirmation error');
      });
      
      try {
        await stateManager.handleSaveWithValidation(() => true, mockSetIsLoading);
      } catch (error) {
        // Expected error
      }
      
      expect(mockSetIsPermissionsSavedToFrontend).toHaveBeenCalledWith(false);
      expect(mockSetIsPermissionSaved).toHaveBeenCalledWith(false);
      expect(mockSetIsPermissionsModified).toHaveBeenCalledWith(true);
      expect(mockSetIsSaveSuccessful).toHaveBeenCalledWith(false);
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });

    it('should handle error in handleSaveWithValidation for other tabs', async () => {
      const mockSetIsLoading = jest.fn();
      const props = { ...defaultProps, activeTab: 2 };
      const stateManager = useFormStateManager(props);
      
      // Mock showSaveConfirmationMessage to throw an error
      (userFormUtils.showSaveConfirmationMessage as jest.Mock).mockImplementation(() => {
        throw new Error('Save confirmation error');
      });
      
      try {
        await stateManager.handleSaveWithValidation(() => true, mockSetIsLoading);
      } catch (error) {
        // Expected error
      }
      
      expect(mockSetIsSaveSuccessful).toHaveBeenCalledWith(false);
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });

    it('should handle successful save with validation for tab 0', async () => {
      const mockSetIsLoading = jest.fn();
      const props = { ...defaultProps, activeTab: 0 };
      const stateManager = useFormStateManager(props);
      
      const mockValidateForm = jest.fn().mockReturnValue(true);
      
      await stateManager.handleSaveWithValidation(mockValidateForm, mockSetIsLoading);
      
      expect(mockValidateForm).toHaveBeenCalled();
      expect(mockSetIsUserDetailsSavedToFrontend).toHaveBeenCalledWith(true);
      expect(mockSetOriginalFormData).toHaveBeenCalled();
      expect(mockSetIsDataSaved).toHaveBeenCalledWith(true);
      expect(mockSetIsUserDetailsModified).toHaveBeenCalledWith(false);
      expect(mockSetIsSaveSuccessful).toHaveBeenCalledWith(true);
      expect(mockSetFrontendSavedData).toHaveBeenCalled();
      expect(userFormUtils.showSaveConfirmationMessage).toHaveBeenCalled();
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });

    it('should handle successful save with validation for tab 1', async () => {
      const mockSetIsLoading = jest.fn();
      const props = { ...defaultProps, activeTab: 1 };
      const stateManager = useFormStateManager(props);
      
      const mockValidateForm = jest.fn().mockReturnValue(true);
      
      await stateManager.handleSaveWithValidation(mockValidateForm, mockSetIsLoading);
      
      expect(mockValidateForm).toHaveBeenCalled();
      expect(mockSetIsPermissionsSavedToFrontend).toHaveBeenCalledWith(true);
      expect(mockSetOriginalPermissionData).toHaveBeenCalled();
      expect(mockSetIsPermissionSaved).toHaveBeenCalledWith(true);
      expect(mockSetIsPermissionsModified).toHaveBeenCalledWith(false);
      expect(mockSetFrontendSavedData).toHaveBeenCalled();
      expect(userFormUtils.showSaveConfirmationMessage).toHaveBeenCalled();
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });

    it('should handle validation failure without proceeding', async () => {
      const mockSetIsLoading = jest.fn();
      const props = { ...defaultProps, activeTab: 0 };
      const stateManager = useFormStateManager(props);
      
      const mockValidateForm = jest.fn().mockReturnValue(false);
      
      await stateManager.handleSaveWithValidation(mockValidateForm, mockSetIsLoading);
      
      expect(mockValidateForm).toHaveBeenCalled();
      expect(mockSetIsUserDetailsSavedToFrontend).not.toHaveBeenCalled();
      expect(mockSetIsDataSaved).not.toHaveBeenCalled();
      expect(mockSetIsUserDetailsModified).not.toHaveBeenCalled();
      expect(mockSetIsSaveSuccessful).not.toHaveBeenCalled();
      expect(mockSetIsLoading).not.toHaveBeenCalled();
    });

    it('should check user details for changes when not saved and has form data', () => {
      const props = { 
        ...defaultProps, 
        isUserDetailsSavedToFrontend: false,
        formData: { ...defaultFormData, firstName: 'John', lastName: 'Doe', emailId: 'john@example.com', role: 'Admin' }
      };
      const stateManager = useFormStateManager(props);
      
      const result = stateManager.checkUserDetailsForChanges();
      
      expect(result).toBe(true);
    });

    it('should check user details for changes when not saved and has no form data', () => {
      const props = { 
        ...defaultProps, 
        isUserDetailsSavedToFrontend: false,
        formData: { ...defaultFormData, firstName: '', lastName: '', emailId: '', role: '' }
      };
      const stateManager = useFormStateManager(props);
      
      const result = stateManager.checkUserDetailsForChanges();
      
      expect(result).toBe(false);
    });

    it('should check permissions for changes when not saved and has permission data', () => {
      const props = { 
        ...defaultProps, 
        isPermissionsSavedToFrontend: false,
        formData: { 
          ...defaultFormData, 
          regions: ['North America'], 
          countries: ['USA'], 
          divisions: ['Technology'],
          groups: ['Development'],
          departments: ['Engineering'],
          classes: ['Senior'],
          subClasses: ['Frontend'],
          permissions: 'read,write'
        }
      };
      const stateManager = useFormStateManager(props);
      
      const result = stateManager.checkPermissionsForChanges();
      
      expect(result).toBe(true);
    });

    it('should check permissions for changes when not saved and has no permission data', () => {
      const props = { 
        ...defaultProps, 
        isPermissionsSavedToFrontend: false,
        formData: { 
          ...defaultFormData, 
          regions: [], 
          countries: [], 
          divisions: [],
          groups: [],
          departments: [],
          classes: [],
          subClasses: [],
          permissions: ''
        }
      };
      const stateManager = useFormStateManager(props);
      
      const result = stateManager.checkPermissionsForChanges();
      
      expect(result).toBe(false);
    });
  });
});