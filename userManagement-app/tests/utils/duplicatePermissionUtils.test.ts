import { extractDuplicatePermissions } from '../../src/utils/duplicatePermissionUtils';
import { parsePermissionsData } from '../../src/utils/userFormUtils';

// Mock parsePermissionsData
jest.mock('../../src/utils/userFormUtils', () => ({
  parsePermissionsData: jest.fn(),
}));

const mockedParsePermissionsData = parsePermissionsData as jest.MockedFunction<typeof parsePermissionsData>;

describe('duplicatePermissionUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractDuplicatePermissions', () => {
    it('should return all permissions when no modules are selected', () => {
      const sourcePermissions = {
        enabledModules: ['module1', 'module2'],
        selectedPermissions: ['module1-sub1-perm1', 'module2-sub2-perm2'],
      };

      mockedParsePermissionsData.mockReturnValue({
        enabledModules: ['module1', 'module2'],
        selectedPermissions: ['module1-sub1-perm1', 'module2-sub2-perm2'],
      });

      const result = extractDuplicatePermissions(sourcePermissions, []);

      expect(result.enabledModules).toEqual(['module1', 'module2']);
      expect(result.duplicatedPermissions).toEqual(['module1-sub1-perm1', 'module2-sub2-perm2']);
      expect(parsePermissionsData).toHaveBeenCalledWith(sourcePermissions);
    });

    it('should filter permissions by selected modules', () => {
      const sourcePermissions = {
        enabledModules: ['module1', 'module2', 'module3'],
        selectedPermissions: [
          'module1-sub1-perm1',
          'module1-sub1-perm2',
          'module2-sub2-perm1',
          'module3-sub3-perm1',
        ],
      };

      mockedParsePermissionsData.mockReturnValue({
        enabledModules: ['module1', 'module2', 'module3'],
        selectedPermissions: [
          'module1-sub1-perm1',
          'module1-sub1-perm2',
          'module2-sub2-perm1',
          'module3-sub3-perm1',
        ],
      });

      const result = extractDuplicatePermissions(sourcePermissions, ['module1', 'module2']);

      expect(result.enabledModules).toEqual(['module1', 'module2']);
      expect(result.duplicatedPermissions).toEqual([
        'module1-sub1-perm1',
        'module1-sub1-perm2',
        'module2-sub2-perm1',
      ]);
    });

    it('should handle single module selection', () => {
      const sourcePermissions = {
        enabledModules: ['module1', 'module2'],
        selectedPermissions: ['module1-sub1-perm1', 'module2-sub2-perm2'],
      };

      mockedParsePermissionsData.mockReturnValue({
        enabledModules: ['module1', 'module2'],
        selectedPermissions: ['module1-sub1-perm1', 'module2-sub2-perm2'],
      });

      const result = extractDuplicatePermissions(sourcePermissions, ['module1']);

      expect(result.enabledModules).toEqual(['module1']);
      expect(result.duplicatedPermissions).toEqual(['module1-sub1-perm1']);
    });

    it('should handle empty permissions', () => {
      const sourcePermissions = {
        enabledModules: [],
        selectedPermissions: [],
      };

      mockedParsePermissionsData.mockReturnValue({
        enabledModules: [],
        selectedPermissions: [],
      });

      const result = extractDuplicatePermissions(sourcePermissions, []);

      expect(result.enabledModules).toEqual([]);
      expect(result.duplicatedPermissions).toEqual([]);
    });

    it('should handle empty permissions with selected modules', () => {
      const sourcePermissions = {
        enabledModules: [],
        selectedPermissions: [],
      };

      mockedParsePermissionsData.mockReturnValue({
        enabledModules: [],
        selectedPermissions: [],
      });

      const result = extractDuplicatePermissions(sourcePermissions, ['module1']);

      expect(result.enabledModules).toEqual(['module1']);
      expect(result.duplicatedPermissions).toEqual([]);
    });

    it('should handle permissions with complex module names containing hyphens', () => {
      const sourcePermissions = {
        enabledModules: ['module-with-dashes', 'another-module'],
        selectedPermissions: [
          'module-with-dashes-sub-perm1',
          'module-with-dashes-sub-perm2',
          'another-module-sub-perm1',
        ],
      };

      mockedParsePermissionsData.mockReturnValue({
        enabledModules: ['module-with-dashes', 'another-module'],
        selectedPermissions: [
          'module-with-dashes-sub-perm1',
          'module-with-dashes-sub-perm2',
          'another-module-sub-perm1',
        ],
      });

      const result = extractDuplicatePermissions(sourcePermissions, ['module-with-dashes']);

      expect(result.enabledModules).toEqual(['module-with-dashes']);
      expect(result.duplicatedPermissions).toEqual([
        'module-with-dashes-sub-perm1',
        'module-with-dashes-sub-perm2',
      ]);
    });

    it('should handle permissions that do not match selected modules', () => {
      const sourcePermissions = {
        enabledModules: ['module1', 'module2'],
        selectedPermissions: ['module1-sub1-perm1', 'module2-sub2-perm2'],
      };

      mockedParsePermissionsData.mockReturnValue({
        enabledModules: ['module1', 'module2'],
        selectedPermissions: ['module1-sub1-perm1', 'module2-sub2-perm2'],
      });

      const result = extractDuplicatePermissions(sourcePermissions, ['module3']);

      expect(result.enabledModules).toEqual(['module3']);
      expect(result.duplicatedPermissions).toEqual([]);
    });

    it('should handle null/undefined enabledModules', () => {
      mockedParsePermissionsData.mockReturnValue({
        enabledModules: null as any,
        selectedPermissions: ['module1-sub1-perm1'],
      });

      const result = extractDuplicatePermissions({}, []);

      expect(result.enabledModules).toEqual([]);
      expect(result.duplicatedPermissions).toEqual(['module1-sub1-perm1']);
    });

    it('should handle null/undefined selectedPermissions', () => {
      mockedParsePermissionsData.mockReturnValue({
        enabledModules: ['module1'],
        selectedPermissions: null as any,
      });

      const result = extractDuplicatePermissions({}, []);

      expect(result.enabledModules).toEqual(['module1']);
      expect(result.duplicatedPermissions).toEqual([]);
    });

    it('should handle permissions with multiple submodules per module', () => {
      const sourcePermissions = {
        enabledModules: ['module1'],
        selectedPermissions: [
          'module1-sub1-perm1',
          'module1-sub1-perm2',
          'module1-sub2-perm1',
          'module1-sub2-perm2',
        ],
      };

      mockedParsePermissionsData.mockReturnValue({
        enabledModules: ['module1'],
        selectedPermissions: [
          'module1-sub1-perm1',
          'module1-sub1-perm2',
          'module1-sub2-perm1',
          'module1-sub2-perm2',
        ],
      });

      const result = extractDuplicatePermissions(sourcePermissions, ['module1']);

      expect(result.enabledModules).toEqual(['module1']);
      expect(result.duplicatedPermissions).toEqual([
        'module1-sub1-perm1',
        'module1-sub1-perm2',
        'module1-sub2-perm1',
        'module1-sub2-perm2',
      ]);
    });

    it('should handle partial module name matches correctly', () => {
      const sourcePermissions = {
        enabledModules: ['module1', 'module10'],
        selectedPermissions: [
          'module1-sub1-perm1',
          'module10-sub1-perm1',
        ],
      };

      mockedParsePermissionsData.mockReturnValue({
        enabledModules: ['module1', 'module10'],
        selectedPermissions: [
          'module1-sub1-perm1',
          'module10-sub1-perm1',
        ],
      });

      const result = extractDuplicatePermissions(sourcePermissions, ['module1']);

      expect(result.enabledModules).toEqual(['module1']);
      expect(result.duplicatedPermissions).toEqual(['module1-sub1-perm1']);
    });

    it('should create new arrays (not reference the original)', () => {
      const sourcePermissions = {
        enabledModules: ['module1'],
        selectedPermissions: ['module1-sub1-perm1'],
      };

      mockedParsePermissionsData.mockReturnValue({
        enabledModules: ['module1'],
        selectedPermissions: ['module1-sub1-perm1'],
      });

      const result = extractDuplicatePermissions(sourcePermissions, []);

      // Modify the result arrays
      result.enabledModules.push('module2');
      result.duplicatedPermissions.push('module2-sub1-perm1');

      // Original should not be affected
      expect(result.enabledModules).toContain('module2');
      expect(result.duplicatedPermissions).toContain('module2-sub1-perm1');
    });
  });
});


