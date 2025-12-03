import {
  validateRequiredFields,
  validateArrayFields,
  validateEmail,
  validatePhoneNumber,
  validateFormats,
  type ValidationError,
  type RequiredField,
  type ArrayField
} from '../../src/utils/formValidationUtils';

describe('formValidationUtils', () => {
  describe('validateRequiredFields', () => {
    it('should add error for empty string fields', () => {
      const data = { name: '', email: 'test@example.com' };
      const requiredFields: RequiredField[] = [
        { field: 'name', message: 'Name is required' },
        { field: 'email', message: 'Email is required' }
      ];
      const errors: ValidationError = {};

      validateRequiredFields(data, requiredFields, errors);

      expect(errors.name).toBe('Name is required');
      expect(errors.email).toBeUndefined();
    });

    it('should add error for whitespace-only string fields', () => {
      const data = { name: '   ', email: 'test@example.com' };
      const requiredFields: RequiredField[] = [
        { field: 'name', message: 'Name is required' }
      ];
      const errors: ValidationError = {};

      validateRequiredFields(data, requiredFields, errors);

      expect(errors.name).toBe('Name is required');
    });

    it('should not add error for valid string fields', () => {
      const data = { name: 'John Doe', email: 'test@example.com' };
      const requiredFields: RequiredField[] = [
        { field: 'name', message: 'Name is required' },
        { field: 'email', message: 'Email is required' }
      ];
      const errors: ValidationError = {};

      validateRequiredFields(data, requiredFields, errors);

      expect(errors.name).toBeUndefined();
      expect(errors.email).toBeUndefined();
    });

    it('should add error for null fields', () => {
      const data = { name: null, email: 'test@example.com' };
      const requiredFields: RequiredField[] = [
        { field: 'name', message: 'Name is required' }
      ];
      const errors: ValidationError = {};

      validateRequiredFields(data, requiredFields, errors);

      expect(errors.name).toBe('Name is required');
    });

    it('should add error for undefined fields', () => {
      const data = { name: undefined, email: 'test@example.com' };
      const requiredFields: RequiredField[] = [
        { field: 'name', message: 'Name is required' }
      ];
      const errors: ValidationError = {};

      validateRequiredFields(data, requiredFields, errors);

      expect(errors.name).toBe('Name is required');
    });

    it('should add error for zero values', () => {
      const data = { count: 0, name: 'John' };
      const requiredFields: RequiredField[] = [
        { field: 'count', message: 'Count is required' }
      ];
      const errors: ValidationError = {};

      validateRequiredFields(data, requiredFields, errors);

      expect(errors.count).toBe('Count is required');
    });

    it('should add error for false boolean values', () => {
      const data = { isActive: false, name: 'John' };
      const requiredFields: RequiredField[] = [
        { field: 'isActive', message: 'Active status is required' }
      ];
      const errors: ValidationError = {};

      validateRequiredFields(data, requiredFields, errors);

      expect(errors.isActive).toBe('Active status is required');
    });

    it('should handle empty required fields array', () => {
      const data = { name: '', email: '' };
      const requiredFields: RequiredField[] = [];
      const errors: ValidationError = {};

      validateRequiredFields(data, requiredFields, errors);

      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should handle multiple fields with mixed validity', () => {
      const data = { 
        name: 'John', 
        email: '', 
        phone: '1234567890', 
        address: '   ' 
      };
      const requiredFields: RequiredField[] = [
        { field: 'name', message: 'Name is required' },
        { field: 'email', message: 'Email is required' },
        { field: 'phone', message: 'Phone is required' },
        { field: 'address', message: 'Address is required' }
      ];
      const errors: ValidationError = {};

      validateRequiredFields(data, requiredFields, errors);

      expect(errors.name).toBeUndefined();
      expect(errors.email).toBe('Email is required');
      expect(errors.phone).toBeUndefined();
      expect(errors.address).toBe('Address is required');
    });
  });

  describe('validateArrayFields', () => {
    it('should add error for empty arrays', () => {
      const data = { tags: [], categories: ['cat1'] };
      const arrayFields: ArrayField[] = [
        { field: 'tags', message: 'Tags are required' },
        { field: 'categories', message: 'Categories are required' }
      ];
      const errors: ValidationError = {};

      validateArrayFields(data, arrayFields, errors);

      expect(errors.tags).toBe('Tags are required');
      expect(errors.categories).toBeUndefined();
    });

    it('should add error for null arrays', () => {
      const data = { tags: null, categories: ['cat1'] };
      const arrayFields: ArrayField[] = [
        { field: 'tags', message: 'Tags are required' }
      ];
      const errors: ValidationError = {};

      validateArrayFields(data, arrayFields, errors);

      expect(errors.tags).toBe('Tags are required');
    });

    it('should add error for undefined arrays', () => {
      const data = { tags: undefined, categories: ['cat1'] };
      const arrayFields: ArrayField[] = [
        { field: 'tags', message: 'Tags are required' }
      ];
      const errors: ValidationError = {};

      validateArrayFields(data, arrayFields, errors);

      expect(errors.tags).toBe('Tags are required');
    });

    it('should not add error for valid arrays', () => {
      const data = { tags: ['tag1', 'tag2'], categories: ['cat1'] };
      const arrayFields: ArrayField[] = [
        { field: 'tags', message: 'Tags are required' },
        { field: 'categories', message: 'Categories are required' }
      ];
      const errors: ValidationError = {};

      validateArrayFields(data, arrayFields, errors);

      expect(errors.tags).toBeUndefined();
      expect(errors.categories).toBeUndefined();
    });

    it('should handle empty array fields array', () => {
      const data = { tags: [], categories: [] };
      const arrayFields: ArrayField[] = [];
      const errors: ValidationError = {};

      validateArrayFields(data, arrayFields, errors);

      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should handle multiple array fields with mixed validity', () => {
      const data = { 
        tags: ['tag1'], 
        categories: [], 
        items: ['item1', 'item2'], 
        groups: null 
      };
      const arrayFields: ArrayField[] = [
        { field: 'tags', message: 'Tags are required' },
        { field: 'categories', message: 'Categories are required' },
        { field: 'items', message: 'Items are required' },
        { field: 'groups', message: 'Groups are required' }
      ];
      const errors: ValidationError = {};

      validateArrayFields(data, arrayFields, errors);

      expect(errors.tags).toBeUndefined();
      expect(errors.categories).toBe('Categories are required');
      expect(errors.items).toBeUndefined();
      expect(errors.groups).toBe('Groups are required');
    });
  });

  describe('validateEmail', () => {
    it('should return true for valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
        'user@sub.domain.com'
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should return false for invalid email addresses', () => {
      const invalidEmails = [
        '',
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        'user@domain.',
        'user name@example.com',
        'user@example.com.',
        'user@@example.com',
        'user@example@com',
        'a@b.c'  // This is invalid - needs at least 2 chars for domain extension
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      expect(validateEmail(' ')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@test.com')).toBe(false);
      expect(validateEmail('test@test')).toBe(false);
    });
  });

  describe('validatePhoneNumber', () => {
    it('should return true for valid phone numbers', () => {
      const validPhones = [
        '1234567890',
        '123456789',
        '12345678901',
        '0',
        '999999999999999'
      ];

      validPhones.forEach(phone => {
        expect(validatePhoneNumber(phone)).toBe(true);
      });
    });

    it('should return false for invalid phone numbers', () => {
      const invalidPhones = [
        '',
        'abc123',
        '123-456-7890',
        '123 456 7890',
        '(123) 456-7890',
        '+1234567890',
        '123.456.7890',
        '123-456-7890 ext 123',
        '123abc456',
        'abc',
        '123-',
        '-123'
      ];

      invalidPhones.forEach(phone => {
        expect(validatePhoneNumber(phone)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      expect(validatePhoneNumber(' ')).toBe(false);
      expect(validatePhoneNumber('0')).toBe(true);
      expect(validatePhoneNumber('000000000000000')).toBe(true);
    });
  });

  describe('validateFormats', () => {
    it('should add error for invalid format fields', () => {
      const data = { 
        email: 'invalid-email', 
        phone: '123-456-7890',
        validEmail: 'test@example.com',
        validPhone: '1234567890'
      };
      const formatValidations = [
        {
          field: 'email',
          validator: validateEmail,
          message: 'Please enter a valid email address'
        },
        {
          field: 'phone',
          validator: validatePhoneNumber,
          message: 'Phone number must contain only numbers'
        },
        {
          field: 'validEmail',
          validator: validateEmail,
          message: 'Please enter a valid email address'
        },
        {
          field: 'validPhone',
          validator: validatePhoneNumber,
          message: 'Phone number must contain only numbers'
        }
      ];
      const errors: ValidationError = {};

      validateFormats(data, formatValidations, errors);

      expect(errors.email).toBe('Please enter a valid email address');
      expect(errors.phone).toBe('Phone number must contain only numbers');
      expect(errors.validEmail).toBeUndefined();
      expect(errors.validPhone).toBeUndefined();
    });

    it('should not add error for empty fields', () => {
      const data = { email: '', phone: '' };
      const formatValidations = [
        {
          field: 'email',
          validator: validateEmail,
          message: 'Please enter a valid email address'
        },
        {
          field: 'phone',
          validator: validatePhoneNumber,
          message: 'Phone number must contain only numbers'
        }
      ];
      const errors: ValidationError = {};

      validateFormats(data, formatValidations, errors);

      expect(errors.email).toBeUndefined();
      expect(errors.phone).toBeUndefined();
    });

    it('should not add error for null fields', () => {
      const data = { email: null, phone: null };
      const formatValidations = [
        {
          field: 'email',
          validator: validateEmail,
          message: 'Please enter a valid email address'
        },
        {
          field: 'phone',
          validator: validatePhoneNumber,
          message: 'Phone number must contain only numbers'
        }
      ];
      const errors: ValidationError = {};

      validateFormats(data, formatValidations, errors);

      expect(errors.email).toBeUndefined();
      expect(errors.phone).toBeUndefined();
    });

    it('should not add error for undefined fields', () => {
      const data = { email: undefined, phone: undefined };
      const formatValidations = [
        {
          field: 'email',
          validator: validateEmail,
          message: 'Please enter a valid email address'
        },
        {
          field: 'phone',
          validator: validatePhoneNumber,
          message: 'Phone number must contain only numbers'
        }
      ];
      const errors: ValidationError = {};

      validateFormats(data, formatValidations, errors);

      expect(errors.email).toBeUndefined();
      expect(errors.phone).toBeUndefined();
    });

    it('should handle empty format validations array', () => {
      const data = { email: 'invalid-email', phone: '123-456-7890' };
      const formatValidations: Array<{
        field: string;
        validator: (value: string) => boolean;
        message: string;
      }> = [];
      const errors: ValidationError = {};

      validateFormats(data, formatValidations, errors);

      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should handle multiple format validations with mixed validity', () => {
      const data = { 
        email1: 'valid@example.com',
        email2: 'invalid-email',
        phone1: '1234567890',
        phone2: '123-456-7890',
        email3: '',
        phone3: null
      };
      const formatValidations = [
        {
          field: 'email1',
          validator: validateEmail,
          message: 'Please enter a valid email address'
        },
        {
          field: 'email2',
          validator: validateEmail,
          message: 'Please enter a valid email address'
        },
        {
          field: 'phone1',
          validator: validatePhoneNumber,
          message: 'Phone number must contain only numbers'
        },
        {
          field: 'phone2',
          validator: validatePhoneNumber,
          message: 'Phone number must contain only numbers'
        },
        {
          field: 'email3',
          validator: validateEmail,
          message: 'Please enter a valid email address'
        },
        {
          field: 'phone3',
          validator: validatePhoneNumber,
          message: 'Phone number must contain only numbers'
        }
      ];
      const errors: ValidationError = {};

      validateFormats(data, formatValidations, errors);

      expect(errors.email1).toBeUndefined();
      expect(errors.email2).toBe('Please enter a valid email address');
      expect(errors.phone1).toBeUndefined();
      expect(errors.phone2).toBe('Phone number must contain only numbers');
      expect(errors.email3).toBeUndefined();
      expect(errors.phone3).toBeUndefined();
    });

    it('should handle custom validators', () => {
      const data = { 
        customField: 'invalid',
        validField: 'valid'
      };
      const customValidator = (value: string) => value === 'valid';
      const formatValidations = [
        {
          field: 'customField',
          validator: customValidator,
          message: 'Custom validation failed'
        },
        {
          field: 'validField',
          validator: customValidator,
          message: 'Custom validation failed'
        }
      ];
      const errors: ValidationError = {};

      validateFormats(data, formatValidations, errors);

      expect(errors.customField).toBe('Custom validation failed');
      expect(errors.validField).toBeUndefined();
    });
  });

  describe('Integration tests', () => {
    it('should work together with multiple validation functions', () => {
      const data = {
        name: '',
        email: 'invalid-email',
        phone: '123-456-7890',
        tags: [],
        categories: ['cat1']
      };
      const errors: ValidationError = {};

      // Validate required fields
      const requiredFields: RequiredField[] = [
        { field: 'name', message: 'Name is required' }
      ];
      validateRequiredFields(data, requiredFields, errors);

      // Validate array fields
      const arrayFields: ArrayField[] = [
        { field: 'tags', message: 'Tags are required' }
      ];
      validateArrayFields(data, arrayFields, errors);

      // Validate formats
      const formatValidations = [
        {
          field: 'email',
          validator: validateEmail,
          message: 'Please enter a valid email address'
        },
        {
          field: 'phone',
          validator: validatePhoneNumber,
          message: 'Phone number must contain only numbers'
        }
      ];
      validateFormats(data, formatValidations, errors);

      expect(errors.name).toBe('Name is required');
      expect(errors.email).toBe('Please enter a valid email address');
      expect(errors.phone).toBe('Phone number must contain only numbers');
      expect(errors.tags).toBe('Tags are required');
      expect(errors.categories).toBeUndefined();
    });
  });
});
