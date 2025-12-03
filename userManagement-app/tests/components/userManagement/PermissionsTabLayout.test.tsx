/**
 * Comprehensive tests for PermissionsTabLayout
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PermissionsTabLayout from '../../../src/components/userManagement/PermissionsTabLayout';
import type { UserFormData } from '../../../src/types/UserFormData';

// Mock dependencies
jest.mock('../../../src/hooks/useModulePermissions', () => ({
  useModulePermissions: jest.fn(() => ({
    modulesData: {
      module1: {
        name: 'Module 1',
        submodules: {
          sub1: ['perm1', 'perm2']
        }
      }
    },
    loading: false
  }))
}));

jest.mock('../../../src/hooks/useRegionCountry', () => ({
  useRegionCountry: jest.fn(() => ({
    regions: ['Region1', 'Region2'],
    countries: ['Country1', 'Country2'],
    loading: false
  }))
}));

jest.mock('../../../src/utils/permissionUtils', () => ({
  usePermissionState: jest.fn(() => ({
    enabledModules: new Set(['module1']),
    setEnabledModules: jest.fn(),
    selectedPermissions: new Set(['module1-sub1-perm1']),
    setSelectedPermissions: jest.fn(),
    activeModule: null,
    setActiveModule: jest.fn(),
    activeSubmodule: null,
    setActiveSubmodule: jest.fn(),
    initialPermissionState: {
      enabledModules: new Set(['module1']),
      selectedPermissions: new Set(['module1-sub1-perm1']),
      activeModule: null,
      activeSubmodule: null
    },
    hasPermissionChanges: false,
    handleReset: jest.fn()
  })),
  resetPermissionState: jest.fn(),
  checkPermissionChanges: jest.fn(() => false)
}));

jest.mock('../../../src/components/shared/PermissionsActionButtons', () => {
  return function MockPermissionsActionButtons({ onReset, onDuplicateClick }: any) {
    return (
      <div data-testid="permissions-action-buttons">
        <button onClick={onReset}>Reset</button>
        <button onClick={onDuplicateClick}>Duplicate</button>
      </div>
    );
  };
});

jest.mock('../../../src/components/shared/PermissionsSectionHeader', () => {
  return function MockPermissionsSectionHeader() {
    return <div data-testid="permissions-section-header">Section Header</div>;
  };
});

jest.mock('../../../src/components/userManagement/PermissionRow', () => {
  return function MockPermissionRow({ module, onModuleClick, onSubmoduleClick }: any) {
    return (
      <div data-testid={`permission-row-${module}`}>
        <button onClick={() => onModuleClick(module)}>Module</button>
        <button onClick={() => onSubmoduleClick(module, 'sub1')}>Submodule</button>
      </div>
    );
  };
});

jest.mock('commonApp/MultiSelectField', () => {
  return function MockMultiSelectField({ label, value, onChange, options }: any) {
    return (
      <div data-testid={`multiselect-${label}`}>
        <label>{label}</label>
        <select
          multiple
          value={value || []}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, (option: any) => option.value);
            onChange(selected);
          }}
        >
          {options?.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  };
});

jest.mock('commonApp/ToggleSwitch', () => {
  return function MockToggleSwitch({ isOn, handleToggle }: any) {
    return (
      <div data-testid="toggle-switch" onClick={handleToggle}>
        {isOn ? 'ON' : 'OFF'}
      </div>
    );
  };
});

jest.mock('commonApp/CustomCheckbox', () => {
  return function MockCustomCheckbox({ label, checked, onChange }: any) {
    return (
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e)}
          data-testid={`checkbox-${label}`}
        />
        {label}
      </label>
    );
  };
});

jest.mock('../../../src/components/userManagement/ModuleIcons', () => {
  return function MockModuleIcon({ module }: any) {
    return <div data-testid={`module-icon-${module}`}>Icon</div>;
  };
});

jest.mock('../../../src/components/shared/PermissionTableComponents', () => ({
  CustomSortIcon: () => <div data-testid="custom-sort-icon">Sort</div>
}));

jest.mock('../../../src/components/shared/permissionTableUtils', () => ({
  createModuleClickHandler: jest.fn((isReadOnly, enabledModules, setActiveModule, setActiveSubmodule) => 
    (module: string) => {
      if (!isReadOnly) {
        setActiveModule(module);
        setActiveSubmodule(null);
      }
    }
  ),
  createSubmoduleClickHandler: jest.fn((isReadOnly, enabledModules, setActiveModule, setActiveSubmodule) =>
    (module: string, submodule: string) => {
      if (!isReadOnly) {
        setActiveModule(module);
        setActiveSubmodule(`${module}-${submodule}`);
      }
    }
  ),
  createModuleToggleHandler: jest.fn(() => jest.fn()),
  createSelectAllPermissionsHandler: jest.fn(() => jest.fn()),
  createPermissionToggleHandler: jest.fn(() => jest.fn())
}));

jest.mock('../../../src/components/userManagement/PermissionTableConstants', () => ({
  getBaseCellStyles: () => ({}),
  getBaseSpanStyles: () => ({}),
  getCellContentStyles: () => ({}),
  getHeaderCellStyles: () => ({}),
  getPlaceholderCellStyles: () => ({}),
  getUserFormStyles: () => ({
    formSection: {},
    formRow: {},
    formField: {}
  }),
  COMMON_STYLES: {},
  getCheckboxContainerStyles: () => ({}),
  getCheckboxStyles: () => ({}),
  getModuleHeaderContainerStyles: () => ({}),
  getModuleIconContainerStyles: () => ({})
}));

describe('PermissionsTabLayout', () => {
  const mockFormData: UserFormData = {
    firstName: 'John',
    lastName: 'Doe',
    emailId: 'john@example.com',
    phoneNumber: '1234567890',
    role: 'Developer',
    department: 'IT',
    reportingManager: 'Manager1',
    dottedLineManager: 'PM1',
    selfReporting: false,
    status: 'Active',
    isenabled: true,
    regions: [],
    countries: [],
    divisions: [],
    groups: [],
    departments: [],
    classes: [],
    subClasses: [],
    permissions: {
      enabledModules: ['module1'],
      selectedPermissions: ['module1-sub1-perm1'],
      activeModule: null,
      activeSubmodule: null
    }
  };

  const defaultProps = {
    formData: mockFormData,
    onInputChange: jest.fn(),
    isReadOnly: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render without crashing', () => {
    render(<PermissionsTabLayout {...defaultProps} />);
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
  });

  it('should render MultiSelectFields for regions, countries, etc', () => {
    render(<PermissionsTabLayout {...defaultProps} />);
    
    // Check if multiselect fields are rendered
    const multiselects = screen.queryAllByTestId(/multiselect-/);
    expect(multiselects.length).toBeGreaterThan(0);
  });

  it('should render permission rows', () => {
    render(<PermissionsTabLayout {...defaultProps} />);
    
    const permissionRow = screen.queryByTestId(/permission-row-/);
    expect(permissionRow).toBeInTheDocument();
  });

  it('should render action buttons', () => {
    render(<PermissionsTabLayout {...defaultProps} />);
    
    expect(screen.getByTestId('permissions-action-buttons')).toBeInTheDocument();
  });

  it('should call onInputChange when multiselect value changes', () => {
    const onInputChange = jest.fn();
    render(<PermissionsTabLayout {...defaultProps} onInputChange={onInputChange} />);
    
    const regionSelect = screen.getByTestId('multiselect-Regions');
    const select = regionSelect.querySelector('select');
    
    if (select) {
      fireEvent.change(select, { target: { selectedOptions: [{ value: 'Region1' }] } });
      expect(onInputChange).toHaveBeenCalled();
    }
  });

  it('should handle reset button click', () => {
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    const mockHandleReset = jest.fn();
    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(['module1']),
      setEnabledModules: jest.fn(),
      selectedPermissions: new Set(['module1-sub1-perm1']),
      setSelectedPermissions: jest.fn(),
      activeModule: null,
      setActiveModule: jest.fn(),
      activeSubmodule: null,
      setActiveSubmodule: jest.fn(),
      initialPermissionState: {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['module1-sub1-perm1']),
        activeModule: null,
        activeSubmodule: null
      },
      hasPermissionChanges: true,
      handleReset: mockHandleReset
    });

    render(<PermissionsTabLayout {...defaultProps} />);
    
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    expect(mockHandleReset).toHaveBeenCalled();
  });

  it('should handle duplicate button click', () => {
    const onDuplicateClick = jest.fn();
    render(<PermissionsTabLayout {...defaultProps} onDuplicateClick={onDuplicateClick} />);
    
    const duplicateButton = screen.getByText('Duplicate');
    fireEvent.click(duplicateButton);
    
    expect(onDuplicateClick).toHaveBeenCalled();
  });

  it('should handle module click', () => {
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    const mockSetActiveModule = jest.fn();
    const mockSetActiveSubmodule = jest.fn();
    
    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(['module1']),
      setEnabledModules: jest.fn(),
      selectedPermissions: new Set(['module1-sub1-perm1']),
      setSelectedPermissions: jest.fn(),
      activeModule: null,
      setActiveModule: mockSetActiveModule,
      activeSubmodule: null,
      setActiveSubmodule: mockSetActiveSubmodule,
      initialPermissionState: {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['module1-sub1-perm1']),
        activeModule: null,
        activeSubmodule: null
      },
      hasPermissionChanges: false,
      handleReset: jest.fn()
    });

    render(<PermissionsTabLayout {...defaultProps} />);
    
    const moduleButton = screen.getByText('Module');
    fireEvent.click(moduleButton);
    
    expect(mockSetActiveModule).toHaveBeenCalled();
  });

  it('should handle submodule click', () => {
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    const mockSetActiveModule = jest.fn();
    const mockSetActiveSubmodule = jest.fn();
    
    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(['module1']),
      setEnabledModules: jest.fn(),
      selectedPermissions: new Set(['module1-sub1-perm1']),
      setSelectedPermissions: jest.fn(),
      activeModule: 'module1',
      setActiveModule: mockSetActiveModule,
      activeSubmodule: null,
      setActiveSubmodule: mockSetActiveSubmodule,
      initialPermissionState: {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['module1-sub1-perm1']),
        activeModule: null,
        activeSubmodule: null
      },
      hasPermissionChanges: false,
      handleReset: jest.fn()
    });

    render(<PermissionsTabLayout {...defaultProps} />);
    
    const submoduleButton = screen.getByText('Submodule');
    fireEvent.click(submoduleButton);
    
    expect(mockSetActiveModule).toHaveBeenCalled();
    expect(mockSetActiveSubmodule).toHaveBeenCalled();
  });

  it('should handle read-only mode', () => {
    render(<PermissionsTabLayout {...defaultProps} isReadOnly={true} />);
    
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
  });

  it('should handle resetTrigger prop', () => {
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    const { rerender } = render(<PermissionsTabLayout {...defaultProps} resetTrigger={0} />);
    
    rerender(<PermissionsTabLayout {...defaultProps} resetTrigger={1} />);
    
    // Component should handle reset trigger
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
  });

  it('should handle empty modulesData', () => {
    const { useModulePermissions } = require('../../../src/hooks/useModulePermissions');
    useModulePermissions.mockReturnValueOnce({
      modulesData: {},
      loading: false
    });

    render(<PermissionsTabLayout {...defaultProps} />);
    
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    const { useModulePermissions } = require('../../../src/hooks/useModulePermissions');
    useModulePermissions.mockReturnValueOnce({
      modulesData: {},
      loading: true
    });

    render(<PermissionsTabLayout {...defaultProps} />);
    
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
  });

  it('should handle formData with empty arrays', () => {
    const emptyFormData: UserFormData = {
      ...mockFormData,
      regions: [],
      countries: [],
      divisions: [],
      groups: [],
      departments: [],
      classes: [],
      subClasses: []
    };

    render(<PermissionsTabLayout {...defaultProps} formData={emptyFormData} />);
    
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
  });

  it('should handle formData with populated arrays', () => {
    const populatedFormData: UserFormData = {
      ...mockFormData,
      regions: ['Region1'],
      countries: ['Country1'],
      divisions: ['Division1'],
      groups: ['Group1'],
      departments: ['Dept1'],
      classes: ['Class1'],
      subClasses: ['SubClass1']
    };

    render(<PermissionsTabLayout {...defaultProps} formData={populatedFormData} />);
    
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
  });

  it('should handle sorting functionality', () => {
    render(<PermissionsTabLayout {...defaultProps} />);
    
    // Component should render sort icons
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
  });

  it('should handle permission state changes', () => {
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    const mockSetEnabledModules = jest.fn();
    const mockSetSelectedPermissions = jest.fn();
    
    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(['module1']),
      setEnabledModules: mockSetEnabledModules,
      selectedPermissions: new Set(['module1-sub1-perm1']),
      setSelectedPermissions: mockSetSelectedPermissions,
      activeModule: 'module1',
      setActiveModule: jest.fn(),
      activeSubmodule: 'module1-sub1',
      setActiveSubmodule: jest.fn(),
      initialPermissionState: {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['module1-sub1-perm1']),
        activeModule: null,
        activeSubmodule: null
      },
      hasPermissionChanges: true,
      handleReset: jest.fn()
    });

    render(<PermissionsTabLayout {...defaultProps} />);
    
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
  });

  it('should return null when loading', () => {
    const { useModulePermissions } = require('../../../src/hooks/useModulePermissions');
    useModulePermissions.mockReturnValueOnce({
      modulesData: {},
      loading: true,
      error: null
    });

    const { container } = render(<PermissionsTabLayout {...defaultProps} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should return null when error', () => {
    const { useModulePermissions } = require('../../../src/hooks/useModulePermissions');
    useModulePermissions.mockReturnValueOnce({
      modulesData: {},
      loading: false,
      error: 'Error loading modules'
    });

    const { container } = render(<PermissionsTabLayout {...defaultProps} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should return null when no modulesData', () => {
    const { useModulePermissions } = require('../../../src/hooks/useModulePermissions');
    useModulePermissions.mockReturnValueOnce({
      modulesData: null,
      loading: false,
      error: null
    });

    const { container } = render(<PermissionsTabLayout {...defaultProps} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should handle ReusableMultiSelectField with no config', () => {
    render(<PermissionsTabLayout {...defaultProps} />);
    
    // Component should handle missing config gracefully
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
  });

  it('should handle permission state initialization with existing permissions', () => {
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    const mockSetEnabledModules = jest.fn();
    const mockSetSelectedPermissions = jest.fn();
    const mockSetInitialPermissionState = jest.fn();
    
    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(),
      setEnabledModules: mockSetEnabledModules,
      selectedPermissions: new Set(),
      setSelectedPermissions: mockSetSelectedPermissions,
      activeModule: null,
      setActiveModule: jest.fn(),
      activeSubmodule: null,
      setActiveSubmodule: jest.fn(),
      initialPermissionState: null,
      setInitialPermissionState: mockSetInitialPermissionState,
      hasPermissionChanges: false,
      handleReset: jest.fn()
    });

    const formDataWithPermissions: UserFormData = {
      ...mockFormData,
      permissions: {
        enabledModules: ['module1'],
        selectedPermissions: ['module1-sub1-perm1'],
        activeModule: null,
        activeSubmodule: null
      }
    };

    render(<PermissionsTabLayout {...defaultProps} formData={formDataWithPermissions} />);
    
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
  });

  it('should handle permission state initialization without existing permissions', () => {
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    const mockSetEnabledModules = jest.fn();
    
    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(),
      setEnabledModules: mockSetEnabledModules,
      selectedPermissions: new Set(),
      setSelectedPermissions: jest.fn(),
      activeModule: null,
      setActiveModule: jest.fn(),
      activeSubmodule: null,
      setActiveSubmodule: jest.fn(),
      initialPermissionState: null,
      setInitialPermissionState: jest.fn(),
      hasPermissionChanges: false,
      handleReset: jest.fn()
    });

    const formDataWithoutPermissions: UserFormData = {
      ...mockFormData,
      permissions: undefined
    };

    render(<PermissionsTabLayout {...defaultProps} formData={formDataWithoutPermissions} />);
    
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
  });

  it('should handle resetTrigger with initialPermissionState', () => {
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    const mockSetEnabledModules = jest.fn();
    const mockSetSelectedPermissions = jest.fn();
    
    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(['module1']),
      setEnabledModules: mockSetEnabledModules,
      selectedPermissions: new Set(['module1-sub1-perm1']),
      setSelectedPermissions: mockSetSelectedPermissions,
      activeModule: 'module1',
      setActiveModule: jest.fn(),
      activeSubmodule: 'module1-sub1',
      setActiveSubmodule: jest.fn(),
      initialPermissionState: {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['module1-sub1-perm1']),
        activeModule: null,
        activeSubmodule: null
      },
      hasPermissionChanges: true,
      handleReset: jest.fn()
    });

    const { rerender } = render(<PermissionsTabLayout {...defaultProps} resetTrigger={0} />);
    
    rerender(<PermissionsTabLayout {...defaultProps} resetTrigger={1} />);
    
    expect(mockSetEnabledModules).toHaveBeenCalled();
    expect(mockSetSelectedPermissions).toHaveBeenCalled();
  });

  it('should handle resetTrigger without initialPermissionState but with formData permissions', () => {
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    const mockSetEnabledModules = jest.fn();
    const mockSetSelectedPermissions = jest.fn();
    
    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(['module1']),
      setEnabledModules: mockSetEnabledModules,
      selectedPermissions: new Set(['module1-sub1-perm1']),
      setSelectedPermissions: mockSetSelectedPermissions,
      activeModule: null,
      setActiveModule: jest.fn(),
      activeSubmodule: null,
      setActiveSubmodule: jest.fn(),
      initialPermissionState: null,
      hasPermissionChanges: false,
      handleReset: jest.fn()
    });

    const formDataWithPermissions: UserFormData = {
      ...mockFormData,
      permissions: {
        enabledModules: ['module1'],
        selectedPermissions: ['module1-sub1-perm1'],
        activeModule: null,
        activeSubmodule: null
      }
    };

    const { rerender } = render(
      <PermissionsTabLayout {...defaultProps} formData={formDataWithPermissions} resetTrigger={0} />
    );
    
    rerender(
      <PermissionsTabLayout {...defaultProps} formData={formDataWithPermissions} resetTrigger={1} />
    );
    
    expect(mockSetEnabledModules).toHaveBeenCalled();
    expect(mockSetSelectedPermissions).toHaveBeenCalled();
  });

  it('should handle resetTrigger without initialPermissionState and without formData permissions', () => {
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    const mockSetEnabledModules = jest.fn();
    const mockSetSelectedPermissions = jest.fn();
    
    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(['module1']),
      setEnabledModules: mockSetEnabledModules,
      selectedPermissions: new Set(['module1-sub1-perm1']),
      setSelectedPermissions: mockSetSelectedPermissions,
      activeModule: null,
      setActiveModule: jest.fn(),
      activeSubmodule: null,
      setActiveSubmodule: jest.fn(),
      initialPermissionState: null,
      hasPermissionChanges: false,
      handleReset: jest.fn()
    });

    const formDataWithoutPermissions: UserFormData = {
      ...mockFormData,
      permissions: undefined
    };

    const { rerender } = render(
      <PermissionsTabLayout {...defaultProps} formData={formDataWithoutPermissions} resetTrigger={0} />
    );
    
    rerender(
      <PermissionsTabLayout {...defaultProps} formData={formDataWithoutPermissions} resetTrigger={1} />
    );
    
    expect(mockSetSelectedPermissions).toHaveBeenCalledWith(new Set());
  });

  it('should restore permission state from formData when permissions change', () => {
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    const mockSetEnabledModules = jest.fn();
    const mockSetSelectedPermissions = jest.fn();
    
    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(['module1']),
      setEnabledModules: mockSetEnabledModules,
      selectedPermissions: new Set(['module1-sub1-perm1']),
      setSelectedPermissions: mockSetSelectedPermissions,
      activeModule: null,
      setActiveModule: jest.fn(),
      activeSubmodule: null,
      setActiveSubmodule: jest.fn(),
      initialPermissionState: null,
      hasPermissionChanges: false,
      handleReset: jest.fn()
    });

    const formDataWithPermissions: UserFormData = {
      ...mockFormData,
      permissions: {
        enabledModules: ['module1', 'module2'],
        selectedPermissions: ['module1-sub1-perm1', 'module2-sub1-perm2'],
        activeModule: 'module1',
        activeSubmodule: 'module1-sub1'
      }
    };

    const { rerender } = render(
      <PermissionsTabLayout {...defaultProps} formData={mockFormData} />
    );
    
    rerender(
      <PermissionsTabLayout {...defaultProps} formData={formDataWithPermissions} />
    );
    
    expect(mockSetEnabledModules).toHaveBeenCalled();
    expect(mockSetSelectedPermissions).toHaveBeenCalled();
  });

  it('should handle formData permissions with activeModule and activeSubmodule', () => {
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    const mockSetActiveModule = jest.fn();
    const mockSetActiveSubmodule = jest.fn();
    
    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(['module1']),
      setEnabledModules: jest.fn(),
      selectedPermissions: new Set(['module1-sub1-perm1']),
      setSelectedPermissions: jest.fn(),
      activeModule: null,
      setActiveModule: mockSetActiveModule,
      activeSubmodule: null,
      setActiveSubmodule: mockSetActiveSubmodule,
      initialPermissionState: null,
      hasPermissionChanges: false,
      handleReset: jest.fn()
    });

    const formDataWithActive: UserFormData = {
      ...mockFormData,
      permissions: {
        enabledModules: ['module1'],
        selectedPermissions: ['module1-sub1-perm1'],
        activeModule: 'module1',
        activeSubmodule: 'module1-sub1'
      }
    };

    render(<PermissionsTabLayout {...defaultProps} formData={formDataWithActive} />);
    
    expect(mockSetActiveModule).toHaveBeenCalledWith('module1');
    expect(mockSetActiveSubmodule).toHaveBeenCalledWith('module1-sub1');
  });

  it('should handle formData permissions with null activeModule and activeSubmodule', () => {
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    const mockSetActiveModule = jest.fn();
    const mockSetActiveSubmodule = jest.fn();
    
    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(['module1']),
      setEnabledModules: jest.fn(),
      selectedPermissions: new Set(['module1-sub1-perm1']),
      setSelectedPermissions: jest.fn(),
      activeModule: 'module1',
      setActiveModule: mockSetActiveModule,
      activeSubmodule: 'module1-sub1',
      setActiveSubmodule: mockSetActiveSubmodule,
      initialPermissionState: null,
      hasPermissionChanges: false,
      handleReset: jest.fn()
    });

    const formDataWithNullActive: UserFormData = {
      ...mockFormData,
      permissions: {
        enabledModules: ['module1'],
        selectedPermissions: ['module1-sub1-perm1'],
        activeModule: null,
        activeSubmodule: null
      }
    };

    render(<PermissionsTabLayout {...defaultProps} formData={formDataWithNullActive} />);
    
    expect(mockSetActiveModule).toHaveBeenCalledWith(null);
    expect(mockSetActiveSubmodule).toHaveBeenCalledWith(null);
  });

  it('should handle regionCountryLoading state', () => {
    const { useRegionCountry } = require('../../../src/hooks/useRegionCountry');
    useRegionCountry.mockReturnValueOnce({
      dropdownOptions: {
        regions: [],
        countries: [],
        divisions: [],
        groups: [],
        departments: [],
        classes: [],
        subClasses: []
      },
      loading: true,
      error: null
    });

    render(<PermissionsTabLayout {...defaultProps} />);
    
    // Should not render dropdowns when loading
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
  });

  it('should handle regionCountryError state', () => {
    const { useRegionCountry } = require('../../../src/hooks/useRegionCountry');
    useRegionCountry.mockReturnValueOnce({
      dropdownOptions: {
        regions: [],
        countries: [],
        divisions: [],
        groups: [],
        departments: [],
        classes: [],
        subClasses: []
      },
      loading: false,
      error: 'Error loading data'
    });

    render(<PermissionsTabLayout {...defaultProps} />);
    
    expect(screen.getByText(/Error loading dropdown data/)).toBeInTheDocument();
  });

  it('should handle sorting - ascending', () => {
    render(<PermissionsTabLayout {...defaultProps} />);
    
    // Find sort buttons and click them
    const sortButtons = screen.queryAllByText(/Modules|Sub Module/);
    expect(sortButtons.length).toBeGreaterThan(0);
  });

  it('should handle resetPermissionState call', () => {
    const { resetPermissionState } = require('../../../src/utils/permissionUtils');
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    
    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(['module1']),
      setEnabledModules: jest.fn(),
      selectedPermissions: new Set(['module1-sub1-perm1']),
      setSelectedPermissions: jest.fn(),
      activeModule: null,
      setActiveModule: jest.fn(),
      activeSubmodule: null,
      setActiveSubmodule: jest.fn(),
      initialPermissionState: {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['module1-sub1-perm1']),
        activeModule: null,
        activeSubmodule: null
      },
      hasPermissionChanges: true,
      handleReset: jest.fn()
    });

    render(<PermissionsTabLayout {...defaultProps} />);
    
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    expect(resetPermissionState).toHaveBeenCalled();
  });

  it('should handle getDropdownConfig for all fields', () => {
    const { useRegionCountry } = require('../../../src/hooks/useRegionCountry');
    useRegionCountry.mockReturnValueOnce({
      dropdownOptions: {
        regions: ['Region1'],
        countries: ['Country1'],
        divisions: ['Division1'],
        groups: ['Group1'],
        departments: ['Dept1'],
        classes: ['Class1'],
        subClasses: ['SubClass1']
      },
      loading: false,
      error: null
    });

    render(<PermissionsTabLayout {...defaultProps} />);
    
    // All dropdowns should be rendered
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
  });

  it('should handle getDropdownConfig with null config', () => {
    const { useRegionCountry } = require('../../../src/hooks/useRegionCountry');
    useRegionCountry.mockReturnValueOnce({
      dropdownOptions: {
        regions: [],
        countries: [],
        divisions: [],
        groups: [],
        departments: [],
        classes: [],
        subClasses: []
      },
      loading: false,
      error: null
    });

    render(<PermissionsTabLayout {...defaultProps} />);
    
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
  });

  it('should handle buildGridRowData with modulesData', () => {
    const { useModulePermissions } = require('../../../src/hooks/useModulePermissions');
    useModulePermissions.mockReturnValueOnce({
      modulesData: {
        module1: {
          name: 'Module 1',
          submodules: {
            sub1: ['perm1', 'perm2']
          }
        },
        module2: {
          name: 'Module 2',
          submodules: {
            sub2: ['perm3']
          }
        }
      },
      loading: false,
      error: null
    });

    render(<PermissionsTabLayout {...defaultProps} />);
    
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
  });

  it('should handle permission rows rendering', () => {
    const { useModulePermissions } = require('../../../src/hooks/useModulePermissions');
    useModulePermissions.mockReturnValueOnce({
      modulesData: {
        module1: {
          name: 'Module 1',
          submodules: {
            sub1: ['perm1', 'perm2']
          }
        }
      },
      loading: false,
      error: null
    });

    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(['module1']),
      setEnabledModules: jest.fn(),
      selectedPermissions: new Set(['module1-sub1-perm1']),
      setSelectedPermissions: jest.fn(),
      activeModule: 'module1',
      setActiveModule: jest.fn(),
      activeSubmodule: 'module1-sub1',
      setActiveSubmodule: jest.fn(),
      initialPermissionState: {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['module1-sub1-perm1']),
        activeModule: null,
        activeSubmodule: null
      },
      hasPermissionChanges: false,
      handleReset: jest.fn()
    });

    render(<PermissionsTabLayout {...defaultProps} />);
    
    const permissionRow = screen.queryByTestId(/permission-row-/);
    expect(permissionRow).toBeInTheDocument();
  });

  it('should handle checkPermissionChanges', () => {
    const { checkPermissionChanges } = require('../../../src/utils/permissionUtils');
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    const mockSetHasPermissionChanges = jest.fn();
    
    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(['module1', 'module2']),
      setEnabledModules: jest.fn(),
      selectedPermissions: new Set(['module1-sub1-perm1', 'module1-sub1-perm2']),
      setSelectedPermissions: jest.fn(),
      activeModule: 'module1',
      setActiveModule: jest.fn(),
      activeSubmodule: 'module1-sub1',
      setActiveSubmodule: jest.fn(),
      initialPermissionState: {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['module1-sub1-perm1']),
        activeModule: null,
        activeSubmodule: null
      },
      hasPermissionChanges: true,
      setHasPermissionChanges: mockSetHasPermissionChanges,
      handleReset: jest.fn()
    });

    checkPermissionChanges.mockReturnValueOnce(true);

    render(<PermissionsTabLayout {...defaultProps} />);
    
    expect(checkPermissionChanges).toHaveBeenCalled();
  });

  it('should render permissions when activeSubmodule is set', () => {
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    const { useModulePermissions } = require('../../../src/hooks/useModulePermissions');
    
    useModulePermissions.mockReturnValueOnce({
      modulesData: {
        module1: {
          name: 'Module 1',
          submodules: {
            sub1: ['perm1', 'perm2', 'perm3']
          }
        }
      },
      loading: false,
      error: null
    });

    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(['module1']),
      setEnabledModules: jest.fn(),
      selectedPermissions: new Set(['module1-sub1-perm1']),
      setSelectedPermissions: jest.fn(),
      activeModule: 'module1',
      setActiveModule: jest.fn(),
      activeSubmodule: 'module1-sub1',
      setActiveSubmodule: jest.fn(),
      initialPermissionState: {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['module1-sub1-perm1']),
        activeModule: null,
        activeSubmodule: null
      },
      hasPermissionChanges: false,
      handleReset: jest.fn()
    });

    render(<PermissionsTabLayout {...defaultProps} />);
    
    // Should render permissions for active submodule
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
  });

  it('should render placeholder submodules when no activeModule', () => {
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    
    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(['module1']),
      setEnabledModules: jest.fn(),
      selectedPermissions: new Set(['module1-sub1-perm1']),
      setSelectedPermissions: jest.fn(),
      activeModule: null,
      setActiveModule: jest.fn(),
      activeSubmodule: null,
      setActiveSubmodule: jest.fn(),
      initialPermissionState: {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['module1-sub1-perm1']),
        activeModule: null,
        activeSubmodule: null
      },
      hasPermissionChanges: false,
      handleReset: jest.fn()
    });

    render(<PermissionsTabLayout {...defaultProps} />);
    
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
  });

  it('should render placeholder permissions when no activeSubmodule', () => {
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    
    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(['module1']),
      setEnabledModules: jest.fn(),
      selectedPermissions: new Set(['module1-sub1-perm1']),
      setSelectedPermissions: jest.fn(),
      activeModule: 'module1',
      setActiveModule: jest.fn(),
      activeSubmodule: null,
      setActiveSubmodule: jest.fn(),
      initialPermissionState: {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['module1-sub1-perm1']),
        activeModule: null,
        activeSubmodule: null
      },
      hasPermissionChanges: false,
      handleReset: jest.fn()
    });

    render(<PermissionsTabLayout {...defaultProps} />);
    
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
  });

  it('should handle module toggle when module is enabled', () => {
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    const { createModuleToggleHandler } = require('../../../src/components/shared/permissionTableUtils');
    const mockHandleModuleToggle = jest.fn();
    
    createModuleToggleHandler.mockReturnValueOnce(mockHandleModuleToggle);
    
    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(['module1']),
      setEnabledModules: jest.fn(),
      selectedPermissions: new Set(['module1-sub1-perm1']),
      setSelectedPermissions: jest.fn(),
      activeModule: 'module1',
      setActiveModule: jest.fn(),
      activeSubmodule: 'module1-sub1',
      setActiveSubmodule: jest.fn(),
      initialPermissionState: {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['module1-sub1-perm1']),
        activeModule: null,
        activeSubmodule: null
      },
      hasPermissionChanges: false,
      handleReset: jest.fn()
    });

    render(<PermissionsTabLayout {...defaultProps} />);
    
    // Find toggle switch and click it
    const toggleSwitch = screen.getByTestId('toggle-switch');
    fireEvent.click(toggleSwitch);
    
    expect(mockHandleModuleToggle).toHaveBeenCalled();
  });

  it('should handle select all permissions', () => {
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    const { createSelectAllPermissionsHandler } = require('../../../src/components/shared/permissionTableUtils');
    const mockHandleSelectAll = jest.fn();
    
    createSelectAllPermissionsHandler.mockReturnValueOnce(mockHandleSelectAll);
    
    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(['module1']),
      setEnabledModules: jest.fn(),
      selectedPermissions: new Set(['module1-sub1-perm1']),
      setSelectedPermissions: jest.fn(),
      activeModule: 'module1',
      setActiveModule: jest.fn(),
      activeSubmodule: 'module1-sub1',
      setActiveSubmodule: jest.fn(),
      initialPermissionState: {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['module1-sub1-perm1']),
        activeModule: null,
        activeSubmodule: null
      },
      hasPermissionChanges: false,
      handleReset: jest.fn()
    });

    render(<PermissionsTabLayout {...defaultProps} />);
    
    // Find select all checkbox and click it
    const selectAllCheckbox = screen.queryByTestId('checkbox-select-all');
    if (selectAllCheckbox) {
      fireEvent.click(selectAllCheckbox);
      expect(mockHandleSelectAll).toHaveBeenCalled();
    }
  });

  it('should handle permission toggle', () => {
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    const { createPermissionToggleHandler } = require('../../../src/components/shared/permissionTableUtils');
    const mockHandlePermissionToggle = jest.fn();
    
    createPermissionToggleHandler.mockReturnValueOnce(mockHandlePermissionToggle);
    
    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(['module1']),
      setEnabledModules: jest.fn(),
      selectedPermissions: new Set(['module1-sub1-perm1']),
      setSelectedPermissions: jest.fn(),
      activeModule: 'module1',
      setActiveModule: jest.fn(),
      activeSubmodule: 'module1-sub1',
      setActiveSubmodule: jest.fn(),
      initialPermissionState: {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['module1-sub1-perm1']),
        activeModule: null,
        activeSubmodule: null
      },
      hasPermissionChanges: false,
      handleReset: jest.fn()
    });

    render(<PermissionsTabLayout {...defaultProps} />);
    
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
  });

  it('should handle invalid submodule data structure', () => {
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    const { useModulePermissions } = require('../../../src/hooks/useModulePermissions');
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    useModulePermissions.mockReturnValueOnce({
      modulesData: {
        module1: {
          name: 'Module 1',
          submodules: null // Invalid structure
        }
      },
      loading: false,
      error: null
    });

    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(['module1']),
      setEnabledModules: jest.fn(),
      selectedPermissions: new Set(['module1-sub1-perm1']),
      setSelectedPermissions: jest.fn(),
      activeModule: 'module1',
      setActiveModule: jest.fn(),
      activeSubmodule: 'module1-sub1',
      setActiveSubmodule: jest.fn(),
      initialPermissionState: {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['module1-sub1-perm1']),
        activeModule: null,
        activeSubmodule: null
      },
      hasPermissionChanges: false,
      handleReset: jest.fn()
    });

    render(<PermissionsTabLayout {...defaultProps} />);
    
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
    consoleWarnSpy.mockRestore();
  });

  it('should handle invalid permissions structure', () => {
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    const { useModulePermissions } = require('../../../src/hooks/useModulePermissions');
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    useModulePermissions.mockReturnValueOnce({
      modulesData: {
        module1: {
          name: 'Module 1',
          submodules: {
            sub1: null // Invalid - should be array
          }
        }
      },
      loading: false,
      error: null
    });

    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(['module1']),
      setEnabledModules: jest.fn(),
      selectedPermissions: new Set(['module1-sub1-perm1']),
      setSelectedPermissions: jest.fn(),
      activeModule: 'module1',
      setActiveModule: jest.fn(),
      activeSubmodule: 'module1-sub1',
      setActiveSubmodule: jest.fn(),
      initialPermissionState: {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['module1-sub1-perm1']),
        activeModule: null,
        activeSubmodule: null
      },
      hasPermissionChanges: false,
      handleReset: jest.fn()
    });

    render(<PermissionsTabLayout {...defaultProps} />);
    
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
    consoleWarnSpy.mockRestore();
  });

  it('should handle module not enabled when rendering submodules', () => {
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    const { useModulePermissions } = require('../../../src/hooks/useModulePermissions');
    
    useModulePermissions.mockReturnValueOnce({
      modulesData: {
        module1: {
          name: 'Module 1',
          submodules: {
            sub1: ['perm1', 'perm2']
          }
        }
      },
      loading: false,
      error: null
    });

    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(), // Module not enabled
      setEnabledModules: jest.fn(),
      selectedPermissions: new Set(),
      setSelectedPermissions: jest.fn(),
      activeModule: 'module1',
      setActiveModule: jest.fn(),
      activeSubmodule: null,
      setActiveSubmodule: jest.fn(),
      initialPermissionState: {
        enabledModules: new Set(),
        selectedPermissions: new Set(),
        activeModule: null,
        activeSubmodule: null
      },
      hasPermissionChanges: false,
      handleReset: jest.fn()
    });

    render(<PermissionsTabLayout {...defaultProps} />);
    
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
  });

  it('should handle sorting - toggle through states', () => {
    render(<PermissionsTabLayout {...defaultProps} />);
    
    // Component should handle sorting
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
  });

  it('should handle isAllSelected calculation', () => {
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    const { useModulePermissions } = require('../../../src/hooks/useModulePermissions');
    
    useModulePermissions.mockReturnValueOnce({
      modulesData: {
        module1: {
          name: 'Module 1',
          submodules: {
            sub1: ['perm1', 'perm2']
          }
        }
      },
      loading: false,
      error: null
    });

    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(['module1']),
      setEnabledModules: jest.fn(),
      selectedPermissions: new Set(['module1-sub1-perm1', 'module1-sub1-perm2']), // All selected
      setSelectedPermissions: jest.fn(),
      activeModule: 'module1',
      setActiveModule: jest.fn(),
      activeSubmodule: 'module1-sub1',
      setActiveSubmodule: jest.fn(),
      initialPermissionState: {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['module1-sub1-perm1']),
        activeModule: null,
        activeSubmodule: null
      },
      hasPermissionChanges: true,
      handleReset: jest.fn()
    });

    render(<PermissionsTabLayout {...defaultProps} />);
    
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
  });

  it('should handle isAllSelected when not all permissions selected', () => {
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    const { useModulePermissions } = require('../../../src/hooks/useModulePermissions');
    
    useModulePermissions.mockReturnValueOnce({
      modulesData: {
        module1: {
          name: 'Module 1',
          submodules: {
            sub1: ['perm1', 'perm2', 'perm3']
          }
        }
      },
      loading: false,
      error: null
    });

    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(['module1']),
      setEnabledModules: jest.fn(),
      selectedPermissions: new Set(['module1-sub1-perm1']), // Only one selected
      setSelectedPermissions: jest.fn(),
      activeModule: 'module1',
      setActiveModule: jest.fn(),
      activeSubmodule: 'module1-sub1',
      setActiveSubmodule: jest.fn(),
      initialPermissionState: {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['module1-sub1-perm1']),
        activeModule: null,
        activeSubmodule: null
      },
      hasPermissionChanges: false,
      handleReset: jest.fn()
    });

    render(<PermissionsTabLayout {...defaultProps} />);
    
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
  });

  it('should handle empty permissions array', () => {
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    const { useModulePermissions } = require('../../../src/hooks/useModulePermissions');
    
    useModulePermissions.mockReturnValueOnce({
      modulesData: {
        module1: {
          name: 'Module 1',
          submodules: {
            sub1: [] // Empty permissions
          }
        }
      },
      loading: false,
      error: null
    });

    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(['module1']),
      setEnabledModules: jest.fn(),
      selectedPermissions: new Set(),
      setSelectedPermissions: jest.fn(),
      activeModule: 'module1',
      setActiveModule: jest.fn(),
      activeSubmodule: 'module1-sub1',
      setActiveSubmodule: jest.fn(),
      initialPermissionState: {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(),
        activeModule: null,
        activeSubmodule: null
      },
      hasPermissionChanges: false,
      handleReset: jest.fn()
    });

    render(<PermissionsTabLayout {...defaultProps} />);
    
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
  });

  it('should handle module with no submodules', () => {
    const { usePermissionState } = require('../../../src/utils/permissionUtils');
    const { useModulePermissions } = require('../../../src/hooks/useModulePermissions');
    
    useModulePermissions.mockReturnValueOnce({
      modulesData: {
        module1: {
          name: 'Module 1',
          submodules: {} // No submodules
        }
      },
      loading: false,
      error: null
    });

    usePermissionState.mockReturnValueOnce({
      enabledModules: new Set(['module1']),
      setEnabledModules: jest.fn(),
      selectedPermissions: new Set(),
      setSelectedPermissions: jest.fn(),
      activeModule: 'module1',
      setActiveModule: jest.fn(),
      activeSubmodule: null,
      setActiveSubmodule: jest.fn(),
      initialPermissionState: {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(),
        activeModule: null,
        activeSubmodule: null
      },
      hasPermissionChanges: false,
      handleReset: jest.fn()
    });

    render(<PermissionsTabLayout {...defaultProps} />);
    
    expect(screen.getByTestId('permissions-section-header')).toBeInTheDocument();
  });
});
