import * as XLSX from 'xlsx';
import { UserFormData } from '../services/userSaveService';

/**
 * Interface for parsed Excel row data
 */
export interface ParsedUserRow {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  department: string;
  emailId: string;
  selfReporting: boolean;
  reportingManager: string;
  dottedLineManager: string;
  regions: string[];
  countries: string[];
  divisions: string[];
  groups: string[];
  permissionDepartments: string[];
  classes: string[];
  subClasses: string[];
}

/**
 * Validation error interface
 */
export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

/**
 * Parse comma-separated string to array
 */
const parseCommaSeparated = (value: string | undefined | null): string[] => {
  if (!value || typeof value !== 'string') {
    return [];
  }
  return value
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
};

/**
 * Parse boolean value (Yes/No, True/False, 1/0, etc.)
 */
const parseBoolean = (value: string | undefined | null): boolean => {
  if (!value) return false;
  const str = String(value).trim().toLowerCase();
  return str === 'yes' || str === 'true' || str === '1' || str === 'y';
};

/**
 * Normalize field names from Excel headers
 */
const normalizeFieldName = (header: string): string => {
  let normalized = header.trim().toLowerCase();
  // Normalize multiple spaces to single space
  normalized = normalized.replace(/\s+/g, ' ');
  // Special handling for "Permissions Departments" - normalize variations
  normalized = normalized.replace(/permissions\s+departments?/i, 'permissions departments');
  return normalized;
};

/**
 * Validate required headers exist in the file
 */
const validateRequiredHeaders = (headerMap: { [key: string]: number }): string[] => {
  const requiredHeaders = [
    'First Name',
    'Last Name',
    'Email ID',
    'Phone Number',
    'Role',
    'Department',
    'Regions',
    'Countries',
    'Divisions',
    'Groups',
    'Permissions Departments',
    'Classes',
    'SubClasses'
  ];

  const missingHeaders: string[] = [];
  requiredHeaders.forEach((headerName) => {
    const normalizedName = normalizeFieldName(headerName);
    if (headerName === 'Email ID') {
      const emailIdNormalized = normalizeFieldName('Email ID');
      const emailIdAltNormalized = normalizeFieldName('Email Id');
      const hasEmailId = (emailIdNormalized in headerMap) || (emailIdAltNormalized in headerMap);
      if (!hasEmailId) {
        missingHeaders.push(headerName);
      }
    } else {
      const hasHeader = normalizedName in headerMap;
      if (!hasHeader) {
        missingHeaders.push(headerName);
      }
    }
  });

  return missingHeaders;
};

/**
 * Validate a single row and collect errors
 */
const validateRow = (rowData: {
  firstName: string;
  lastName: string;
  emailId: string;
  phoneNumber: string;
  role: string;
  department: string;
  regions: string[];
  countries: string[];
  divisions: string[];
  groups: string[];
  permissionDepartments: string[];
  classes: string[];
  subClasses: string[];
}, rowNumber: number): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!rowData.firstName) {
    errors.push({ row: rowNumber, field: 'First Name', message: 'First Name is required' });
  }
  if (!rowData.lastName) {
    errors.push({ row: rowNumber, field: 'Last Name', message: 'Last Name is required' });
  }
  if (!rowData.emailId) {
    errors.push({ row: rowNumber, field: 'Email ID', message: 'Email ID is required' });
  }
  if (!rowData.phoneNumber) {
    errors.push({ row: rowNumber, field: 'Phone Number', message: 'Phone Number is required' });
  }
  if (!rowData.role) {
    errors.push({ row: rowNumber, field: 'Role', message: 'Role is required' });
  }
  if (!rowData.department) {
    errors.push({ row: rowNumber, field: 'Department', message: 'Department is required' });
  }
  if (rowData.regions.length === 0) {
    errors.push({ row: rowNumber, field: 'Regions', message: 'Regions is required' });
  }
  if (rowData.countries.length === 0) {
    errors.push({ row: rowNumber, field: 'Countries', message: 'Countries is required' });
  }
  if (rowData.divisions.length === 0) {
    errors.push({ row: rowNumber, field: 'Divisions', message: 'Divisions is required' });
  }
  if (rowData.groups.length === 0) {
    errors.push({ row: rowNumber, field: 'Groups', message: 'Groups is required' });
  }
  if (rowData.permissionDepartments.length === 0) {
    errors.push({ row: rowNumber, field: 'Permissions Departments', message: 'Permissions Departments is required' });
  }
  if (rowData.classes.length === 0) {
    errors.push({ row: rowNumber, field: 'Classes', message: 'Classes is required' });
  }
  if (rowData.subClasses.length === 0) {
    errors.push({ row: rowNumber, field: 'SubClasses', message: 'SubClasses is required' });
  }

  return errors;
};

/**
 * Parse Excel file and extract user data
 */
export const parseExcelFile = async (file: File): Promise<{
  users: ParsedUserRow[];
  errors: ValidationError[];
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first sheet (User Template sheet)
        const sheetName = workbook.SheetNames.find(name => 
          name.toLowerCase().includes('user') || name.toLowerCase().includes('template')
        ) ?? workbook.SheetNames[0];
        
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with header row
        const jsonData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1, // Use array of arrays format
          defval: '', // Default value for empty cells
          raw: false, // Convert dates and numbers to strings
        });

        if (jsonData.length < 2) {
          reject(new Error('Excel file must contain at least a header row and one data row'));
          return;
        }

        // First row is headers
        const headers = jsonData[0].map((h: unknown) => String(h ?? '').trim());
        
        // Create a map of header to index for faster lookup
        const headerMap: { [key: string]: number } = {};
        headers.forEach((header, index) => {
          if (header && String(header).trim()) {
            const normalized = normalizeFieldName(String(header));
            headerMap[normalized] = index;
          }
        });

        // Validate that all required column headers exist
        const missingHeaders = validateRequiredHeaders(headerMap);
        if (missingHeaders.length > 0) {
          const errors: ValidationError[] = [{
            row: 1, // Header row
            field: 'File Format',
            message: 'The contents in the file doesn\'t match the expected format.',
          }];
          resolve({ users: [], errors });
          return;
        }

        const users: ParsedUserRow[] = [];
        const errors: ValidationError[] = [];

        // Process data rows (starting from index 1)
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          const rowNumber = i + 1; // Excel row number (1-based)
          
          // Skip empty rows
          if (row.every((cell: unknown) => !cell || String(cell).trim() === '')) {
            continue;
          }

          const getValue = (fieldName: string): string => {
            const normalizedName = normalizeFieldName(fieldName);
            let index = headerMap[normalizedName];
            if (index === undefined && fieldName === 'Email ID') {
              index = headerMap[normalizeFieldName('Email Id')];
            }
            if (index === undefined || index >= row.length) {
              return '';
            }
            const value = row[index];
            return value ? String(value).trim() : '';
          };

          // Extract all fields
          const firstName = getValue('First Name');
          const lastName = getValue('Last Name');
          const emailId = getValue('Email ID') || getValue('Email Id');
          const role = getValue('Role');
          const phoneNumber = getValue('Phone Number');
          const department = getValue('Department');
          const regions = parseCommaSeparated(getValue('Regions'));
          const countries = parseCommaSeparated(getValue('Countries'));
          const divisions = parseCommaSeparated(getValue('Divisions'));
          const groups = parseCommaSeparated(getValue('Groups'));
          const permissionDepartments = parseCommaSeparated(getValue('Permissions Departments'));
          const classes = parseCommaSeparated(getValue('Classes'));
          const subClasses = parseCommaSeparated(getValue('SubClasses'));

          // Validate row
          const rowErrors = validateRow({
            firstName,
            lastName,
            emailId,
            phoneNumber,
            role,
            department,
            regions,
            countries,
            divisions,
            groups,
            permissionDepartments,
            classes,
            subClasses
          }, rowNumber);

          if (rowErrors.length > 0) {
            errors.push(...rowErrors);
            continue;
          }

          // Parse the row
          const parsedUser: ParsedUserRow = {
            firstName,
            lastName,
            phoneNumber,
            role,
            department,
            emailId,
            selfReporting: parseBoolean(getValue('Self Reporting')), // Optional
            reportingManager: getValue('Reporting Manager'), // Optional
            dottedLineManager: getValue('Dotted Line Manager'), // Optional
            regions,
            countries,
            divisions,
            groups,
            permissionDepartments,
            classes,
            subClasses,
          };

          users.push(parsedUser);
        }

        // If there are validation errors, resolve with errors instead of rejecting
        if (errors.length > 0) {
          resolve({ users, errors });
          return;
        }

        // If no users and no errors, it means the file was empty or had no valid rows
        if (users.length === 0) {
          reject(new Error('No valid user data found in Excel file'));
          return;
        }

        resolve({ users, errors });
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Convert parsed user row to UserFormData format for API
 */
export const convertToUserFormData = (parsedUser: ParsedUserRow): UserFormData => {
  return {
    firstname: parsedUser.firstName,
    lastname: parsedUser.lastName,
    phonenumber: parsedUser.phoneNumber || undefined,
    role: parsedUser.role,
    department: parsedUser.department || undefined,
    emailid: parsedUser.emailId,
    reportingmanager: parsedUser.reportingManager || (parsedUser.selfReporting ? 'Self' : undefined),
    dottedorprojectmanager: parsedUser.dottedLineManager || undefined,
    selfreporting: parsedUser.selfReporting,
    regions: parsedUser.regions.length > 0 ? parsedUser.regions : undefined,
    countries: parsedUser.countries.length > 0 ? parsedUser.countries : undefined,
    divisions: parsedUser.divisions.length > 0 ? parsedUser.divisions : undefined,
    groups: parsedUser.groups.length > 0 ? parsedUser.groups : undefined,
    departments: parsedUser.permissionDepartments.length > 0 ? parsedUser.permissionDepartments : undefined,
    class: parsedUser.classes.length > 0 ? parsedUser.classes : undefined,
    subClass: parsedUser.subClasses.length > 0 ? parsedUser.subClasses : undefined,
    permissions: undefined, // Permissions would need to be handled separately if needed
    status: 'Active',
    isenabled: true,
    createdby: 'Admin', // You can change this to actual user or leave as Admin
  };
};

