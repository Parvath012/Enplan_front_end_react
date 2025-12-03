import React from 'react';
import { validateRequiredFields as validateRequiredFieldsUtil, validateArrayFields, validateFormats, validateEmail, validatePhoneNumber } from '../../utils/formValidationUtils';
import type { UserFormData } from '../../types/UserFormData';

interface FormValidationProps {
  activeTab: number;
  formData: UserFormData;
  validationErrors: Record<string, string>;
  setValidationErrors: (errors: Record<string, string>) => void;
}

export const useFormValidation = ({
  activeTab,
  formData,
  validationErrors,
  setValidationErrors
}: FormValidationProps) => {
  const validateCurrentTab = (errors: Record<string, string>): void => {
    if (activeTab === 0) {
      const requiredFields = [
        { field: 'firstName', message: 'First Name is required' },
        { field: 'lastName', message: 'Last Name is required' },
        { field: 'phoneNumber', message: 'Phone Number is required' },
        { field: 'role', message: 'Role is required' },
        { field: 'department', message: 'Department is required' },
        { field: 'emailId', message: 'Email Id is required' }
      ];

      validateRequiredFieldsUtil(formData, requiredFields, errors);

      if (!formData.selfReporting) {
        if (!formData.reportingManager) errors.reportingManager = 'Reporting Manager is required';
        if (!formData.dottedLineManager) errors.dottedLineManager = 'Dotted Line Manager is required';
      }

      const formatValidations = [
        { field: 'phoneNumber', validator: validatePhoneNumber, message: 'Phone Number must contain only numbers' },
        { field: 'emailId', validator: validateEmail, message: 'Please enter a valid email address' }
      ];
      validateFormats(formData, formatValidations, errors);
    } else if (activeTab === 1) {
      const requiredArrayFields = [
        { field: 'regions', message: 'Regions is required' },
        { field: 'countries', message: 'Countries is required' },
        { field: 'divisions', message: 'Divisions is required' },
        { field: 'groups', message: 'Groups is required' },
        { field: 'departments', message: 'Departments is required' },
        { field: 'classes', message: 'Classes is required' },
        { field: 'subClasses', message: 'Sub Classes is required' }
      ];
      validateArrayFields(formData, requiredArrayFields, errors);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    validateCurrentTab(errors);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isFormValid = () => {
    if (activeTab === 0) {
      return !!(formData.firstName?.trim() && formData.lastName?.trim() && formData.phoneNumber?.trim() && 
                formData.role && formData.department && formData.emailId?.trim() && 
                (formData.selfReporting ? true : (formData.reportingManager && formData.dottedLineManager)));
    } else if (activeTab === 1) {
      return !!((formData.regions && formData.regions.length > 0) && (formData.countries && formData.countries.length > 0) && 
                (formData.divisions && formData.divisions.length > 0) && (formData.groups && formData.groups.length > 0) && 
                (formData.departments && formData.departments.length > 0) && (formData.classes && formData.classes.length > 0) && 
                (formData.subClasses && formData.subClasses.length > 0));
    }
    return false;
  };

  const getErrorProps = (field: keyof UserFormData) => ({
    error: !!validationErrors[field],
    errorMessage: validationErrors[field]
  });

  return {
    validateForm,
    isFormValid,
    getErrorProps,
    validateCurrentTab
  };
};

export default useFormValidation;
