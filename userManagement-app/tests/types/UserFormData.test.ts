import { UserFormData } from '../../src/types/UserFormData';

describe('UserFormData', () => {
  it('should be a valid TypeScript interface', () => {
    // This test ensures the interface is properly exported and can be used
    const mockUserFormData: UserFormData = {
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      role: 'admin',
      department: 'IT',
      emailId: 'john.doe@example.com',
      selfReporting: false,
      reportingManager: 'Jane Smith',
      dottedLineManager: 'Bob Johnson',
      regions: ['North America', 'Europe'],
      countries: ['USA', 'Canada'],
      divisions: ['Engineering', 'Sales'],
      groups: ['Developers', 'Managers'],
      departments: ['IT', 'HR'],
      classes: ['Class A', 'Class B'],
      subClasses: ['SubClass 1', 'SubClass 2'],
      permissions: {
        enabledModules: ['module1', 'module2'],
        selectedPermissions: ['permission1', 'permission2'],
        activeModule: 'module1',
        activeSubmodule: 'submodule1'
      }
    };

    expect(mockUserFormData).toBeDefined();
    expect(mockUserFormData.id).toBe('123');
    expect(mockUserFormData.firstName).toBe('John');
    expect(mockUserFormData.lastName).toBe('Doe');
    expect(mockUserFormData.phoneNumber).toBe('1234567890');
    expect(mockUserFormData.role).toBe('admin');
    expect(mockUserFormData.department).toBe('IT');
    expect(mockUserFormData.emailId).toBe('john.doe@example.com');
    expect(mockUserFormData.selfReporting).toBe(false);
    expect(mockUserFormData.reportingManager).toBe('Jane Smith');
    expect(mockUserFormData.dottedLineManager).toBe('Bob Johnson');
    expect(mockUserFormData.regions).toEqual(['North America', 'Europe']);
    expect(mockUserFormData.countries).toEqual(['USA', 'Canada']);
    expect(mockUserFormData.divisions).toEqual(['Engineering', 'Sales']);
    expect(mockUserFormData.groups).toEqual(['Developers', 'Managers']);
    expect(mockUserFormData.departments).toEqual(['IT', 'HR']);
    expect(mockUserFormData.classes).toEqual(['Class A', 'Class B']);
    expect(mockUserFormData.subClasses).toEqual(['SubClass 1', 'SubClass 2']);
    expect(mockUserFormData.permissions).toEqual({
      enabledModules: ['module1', 'module2'],
      selectedPermissions: ['permission1', 'permission2'],
      activeModule: 'module1',
      activeSubmodule: 'submodule1'
    });
  });

  it('should allow optional id field', () => {
    const userFormDataWithoutId: UserFormData = {
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '0987654321',
      role: 'user',
      department: 'HR',
      emailId: 'jane.smith@example.com',
      selfReporting: true,
      reportingManager: '',
      dottedLineManager: '',
      regions: [],
      countries: [],
      divisions: [],
      groups: [],
      departments: [],
      classes: [],
      subClasses: []
    };

    expect(userFormDataWithoutId).toBeDefined();
    expect(userFormDataWithoutId.id).toBeUndefined();
    expect(userFormDataWithoutId.firstName).toBe('Jane');
  });

  it('should allow optional permissions field', () => {
    const userFormDataWithoutPermissions: UserFormData = {
      firstName: 'Bob',
      lastName: 'Johnson',
      phoneNumber: '5555555555',
      role: 'manager',
      department: 'Finance',
      emailId: 'bob.johnson@example.com',
      selfReporting: false,
      reportingManager: 'Alice Brown',
      dottedLineManager: 'Charlie Wilson',
      regions: ['Asia'],
      countries: ['Japan'],
      divisions: ['Marketing'],
      groups: ['Team A'],
      departments: ['Finance'],
      classes: ['Class C'],
      subClasses: ['SubClass 3']
    };

    expect(userFormDataWithoutPermissions).toBeDefined();
    expect(userFormDataWithoutPermissions.permissions).toBeUndefined();
    expect(userFormDataWithoutPermissions.firstName).toBe('Bob');
  });

  it('should handle empty arrays for multi-select fields', () => {
    const userFormDataWithEmptyArrays: UserFormData = {
      firstName: 'Empty',
      lastName: 'Arrays',
      phoneNumber: '1111111111',
      role: 'viewer',
      department: 'Support',
      emailId: 'empty.arrays@example.com',
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
    };

    expect(userFormDataWithEmptyArrays.regions).toEqual([]);
    expect(userFormDataWithEmptyArrays.countries).toEqual([]);
    expect(userFormDataWithEmptyArrays.divisions).toEqual([]);
    expect(userFormDataWithEmptyArrays.groups).toEqual([]);
    expect(userFormDataWithEmptyArrays.departments).toEqual([]);
    expect(userFormDataWithEmptyArrays.classes).toEqual([]);
    expect(userFormDataWithEmptyArrays.subClasses).toEqual([]);
  });

  it('should handle boolean values correctly', () => {
    const userFormDataWithBooleanTrue: UserFormData = {
      firstName: 'True',
      lastName: 'Boolean',
      phoneNumber: '2222222222',
      role: 'admin',
      department: 'IT',
      emailId: 'true.boolean@example.com',
      selfReporting: true,
      reportingManager: '',
      dottedLineManager: '',
      regions: [],
      countries: [],
      divisions: [],
      groups: [],
      departments: [],
      classes: [],
      subClasses: []
    };

    expect(userFormDataWithBooleanTrue.selfReporting).toBe(true);

    const userFormDataWithBooleanFalse: UserFormData = {
      firstName: 'False',
      lastName: 'Boolean',
      phoneNumber: '3333333333',
      role: 'user',
      department: 'HR',
      emailId: 'false.boolean@example.com',
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
    };

    expect(userFormDataWithBooleanFalse.selfReporting).toBe(false);
  });

  it('should handle complex permissions object', () => {
    const complexPermissions: UserFormData['permissions'] = {
      enabledModules: ['module1', 'module2', 'module3'],
      selectedPermissions: ['read', 'write', 'delete', 'admin'],
      activeModule: 'module2',
      activeSubmodule: 'submodule2'
    };

    const userFormDataWithComplexPermissions: UserFormData = {
      firstName: 'Complex',
      lastName: 'Permissions',
      phoneNumber: '4444444444',
      role: 'admin',
      department: 'IT',
      emailId: 'complex.permissions@example.com',
      selfReporting: false,
      reportingManager: 'Manager',
      dottedLineManager: 'Dotted Manager',
      regions: ['Global'],
      countries: ['All'],
      divisions: ['All Divisions'],
      groups: ['All Groups'],
      departments: ['All Departments'],
      classes: ['All Classes'],
      subClasses: ['All SubClasses'],
      permissions: complexPermissions
    };

    expect(userFormDataWithComplexPermissions.permissions).toEqual(complexPermissions);
    expect(userFormDataWithComplexPermissions.permissions?.enabledModules).toHaveLength(3);
    expect(userFormDataWithComplexPermissions.permissions?.selectedPermissions).toHaveLength(4);
    expect(userFormDataWithComplexPermissions.permissions?.activeModule).toBe('module2');
    expect(userFormDataWithComplexPermissions.permissions?.activeSubmodule).toBe('submodule2');
  });
});
