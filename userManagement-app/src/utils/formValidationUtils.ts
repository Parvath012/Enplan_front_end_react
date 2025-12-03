// Common form validation utilities to eliminate duplication

export interface ValidationError {
  [key: string]: string;
}

export interface RequiredField {
  field: string;
  message: string;
}

export interface ArrayField {
  field: string;
  message: string;
}

// Common validation patterns
export const validateRequiredFields = (
  data: Record<string, any>,
  requiredFields: RequiredField[],
  errors: ValidationError
): void => {
  requiredFields.forEach(({ field, message }) => {
    const value = data[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors[field] = message;
    }
  });
};

export const validateArrayFields = (
  data: Record<string, any>,
  arrayFields: ArrayField[],
  errors: ValidationError
): void => {
  arrayFields.forEach(({ field, message }) => {
    const value = data[field] as any[];
    if (!value || value.length === 0) {
      errors[field] = message;
    }
  });
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\d+$/;
  return phoneRegex.test(phone);
};

export const validateFormats = (
  data: Record<string, any>,
  formatValidations: Array<{
    field: string;
    validator: (value: string) => boolean;
    message: string;
  }>,
  errors: ValidationError
): void => {
  formatValidations.forEach(({ field, validator, message }) => {
    const value = data[field];
    if (value && !validator(value)) {
      errors[field] = message;
    }
  });
};
