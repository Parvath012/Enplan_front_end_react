// Comprehensive test to achieve 98%+ coverage for EntityFormFields
// Based on successful simple test pattern but covering all branches and conditions
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import EntityFormFields from '../../../src/components/entitySetup/EntityFormFields';
import { useSelector } from 'react-redux';

// Mock react-redux exactly like the working simple test
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

// Mock all the lazy components exactly like the working simple test
jest.mock('commonApp/FormSection', () => {
  return function MockFormSection({ children, title }: any) {
    return (
      <div data-testid="form-section">
        <h3>{title}</h3>
        {children}
      </div>
    );
  };
});

jest.mock('commonApp/TextField', () => {
  return function MockTextField({ 
    label, 
    value, 
    onChange, 
    error, 
    errorMessage, 
    placeholder, 
    required, 
    readOnly, 
    helperText 
  }: any) {
    return (
      <div data-testid="text-field">
        <label>{label} {required && '*'}</label>
        <input
          data-testid={`text-input-${label.toLowerCase().replace(/[\s\/\#]/g, '-')}`}
          value={value || ''}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={!!error}
          readOnly={readOnly}
        />
        {error && <span data-testid="error-message">{errorMessage}</span>}
        {helperText && <span data-testid="helper-text">{helperText}</span>}
      </div>
    );
  };
});

jest.mock('commonApp/SelectField', () => {
  return function MockSelectField({ 
    label, 
    value, 
    onChange, 
    options, 
    placeholder, 
    disabled, 
    required, 
    error, 
    errorMessage 
  }: any) {
    return (
      <div data-testid="select-field">
        <label>{label} {required && '*'}</label>
        <select
          data-testid={`select-input-${label.toLowerCase().replace(/\s+/g, '-')}`}
          value={value || ''}
          onChange={(e) => onChange && onChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">{placeholder}</option>
          {options?.map((option: string, index: number) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error && <span data-testid="error-message">{errorMessage}</span>}
      </div>
    );
  };
});

jest.mock('commonApp/MultiSelectField', () => {
  return function MockMultiSelectField({ 
    label, 
    value, 
    onChange, 
    options, 
    placeholder, 
    disabled, 
    noOptionsMessage 
  }: any) {
    return (
      <div data-testid="multi-select-field">
        <label>{label}</label>
        <div data-testid="multi-select">
          <div data-testid="placeholder">{placeholder}</div>
          {disabled && <span data-testid="disabled-indicator">Disabled</span>}
          {options?.length === 0 && <span data-testid="no-options-message">{noOptionsMessage}</span>}
          <div data-testid="options-list">
            {options?.map((option: string, index: number) => (
              <div key={index} data-testid="option-item" onClick={() => onChange && onChange([...value, option])}>
                {option}
              </div>
            ))}
          </div>
          <div data-testid="selected-values">
            {Array.isArray(value) && value.map((val: string, index: number) => (
              <span key={index} data-testid="selected-value">{val}</span>
            ))}
          </div>
        </div>
      </div>
    );
  };
});

const mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;

describe('EntityFormFields - Comprehensive Coverage Tests', () => {
  // Comprehensive mock entities to test all filter conditions and branches
  const mockEntityItems = [
    // Test rollup entity (should be included)
    { 
      id: '1', 
      displayName: 'Rollup Entity 1', 
      legalBusinessName: 'Legal 1',
      entityType: 'Rollup Entity', 
      softDeleted: false 
    },
    // Test lowercase rollup entity (should be included)
    { 
      id: '2', 
      displayName: 'rollup entity lower', 
      legalBusinessName: 'Legal 2',
      entityType: 'rollup entity', 
      softDeleted: false 
    },
    // Test uppercase rollup entity (should be included)
    { 
      id: '3', 
      displayName: 'ROLLUP ENTITY UPPER', 
      legalBusinessName: 'Legal 3',
      entityType: 'ROLLUP ENTITY', 
      softDeleted: false 
    },
    // Test empty displayName (fallback to legalBusinessName)
    { 
      id: '4', 
      displayName: '', 
      legalBusinessName: 'Legal 4 No Display',
      entityType: 'Rollup Entity', 
      softDeleted: false 
    },
    // Test null displayName (fallback to legalBusinessName)
    { 
      id: '5', 
      displayName: null, 
      legalBusinessName: 'Legal 5 Null Display',
      entityType: 'Rollup Entity', 
      softDeleted: false 
    },
    // Test planning entity (should be excluded)
    { 
      id: '6', 
      displayName: 'Planning Entity', 
      legalBusinessName: 'Legal 6',
      entityType: 'Planning Entity', 
      softDeleted: false 
    },
    // Test soft deleted (should be excluded)
    { 
      id: '7', 
      displayName: 'Deleted Rollup', 
      legalBusinessName: 'Legal 7',
      entityType: 'Rollup Entity', 
      softDeleted: true 
    },
    // Test undefined entityType (should be excluded)
    {
      id: '8',
      displayName: 'Undefined Type',
      legalBusinessName: 'Legal 8',
      entityType: undefined,
      softDeleted: false
    },
    // Test null entityType (should be excluded) 
    {
      id: '9',
      displayName: 'Null Type',
      legalBusinessName: 'Legal 9',
      entityType: null,
      softDeleted: false
    }
  ];

  const defaultProps = {
    formData: {
      legalBusinessName: '',
      displayName: '',
      entityType: '',
      assignedEntity: [],
      addressLine1: '',
      addressLine2: '',
      country: '',
      state: '',
      city: '',
      pinZipCode: ''
    },
    validationErrors: {},
    entityTypeOptions: ['Planning Entity', 'Rollup Entity', 'Subsidiary'],
    countryOptions: ['USA', 'Canada', 'UK'],
    stateOptions: ['California', 'New York', 'Texas'],
    onInputChange: jest.fn(),
    onCountryChange: jest.fn(),
    onEntityTypeChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSelector.mockImplementation((selector: any) => {
      return selector({ entities: { items: mockEntityItems } });
    });
  });

  const createMockStore = (entities = mockEntityItems) => {
    return configureStore({
      reducer: {
        entities: (state = { items: entities }) => state
      }
    });
  };

  const renderWithProviders = (props = {}, entities = mockEntityItems) => {
    const finalProps = { ...defaultProps, ...props };
    const store = createMockStore(entities);
    
    return render(
      <Provider store={store}>
        <EntityFormFields {...finalProps} />
      </Provider>
    );
  };

  // Test 1: Basic rendering
  it('renders without crashing', () => {
    renderWithProviders();
    expect(screen.getByTestId('form-section')).toBeInTheDocument();
  });

  // Test 2: Safe entity type - valid entityType in options
  it('handles safe entityType when value is in options', () => {
    renderWithProviders({
      formData: { ...defaultProps.formData, entityType: 'Planning Entity' }
    });
    const select = screen.getByTestId('select-input-entity-type');
    expect(select).toHaveValue('Planning Entity');
  });

  // Test 3: Safe entity type - invalid entityType not in options  
  it('handles safe entityType when value is not in options', () => {
    renderWithProviders({
      formData: { ...defaultProps.formData, entityType: 'Invalid Type' }
    });
    const select = screen.getByTestId('select-input-entity-type');
    expect(select).toHaveValue('');
  });

  // Test 4: Safe country - valid country in options
  it('handles safe country when value is in options', () => {
    renderWithProviders({
      formData: { ...defaultProps.formData, country: 'USA' }
    });
    const select = screen.getByTestId('select-input-country');
    expect(select).toHaveValue('USA');
  });

  // Test 5: Safe country - invalid country not in options
  it('handles safe country when value is not in options', () => {
    renderWithProviders({
      formData: { ...defaultProps.formData, country: 'Mars' }
    });
    const select = screen.getByTestId('select-input-country');
    expect(select).toHaveValue('');
  });

  // Test 6: Safe state - valid state in options
  it('handles safe state when value is in options', () => {
    renderWithProviders({
      formData: { ...defaultProps.formData, state: 'California' }
    });
    const select = screen.getByTestId('select-input-state');
    expect(select).toHaveValue('California');
  });

  // Test 7: Safe state - invalid state not in options
  it('handles safe state when value is not in options', () => {
    renderWithProviders({
      formData: { ...defaultProps.formData, state: 'Atlantis' }
    });
    const select = screen.getByTestId('select-input-state');
    expect(select).toHaveValue('');
  });

  // Test 8: Legal Business Name - required when creating new (!currentEntityId)
  it('makes legal business name required when creating new entity', () => {
    renderWithProviders();
    const textField = screen.getByTestId('text-field');
    expect(textField).toHaveTextContent('*'); // Required asterisk
  });

  // Test 9: Legal Business Name - not required when editing (currentEntityId exists)  
  it('makes legal business name not required when editing entity', () => {
    renderWithProviders({
      currentEntityId: 'entity-123'
    });
    const input = screen.getByTestId('text-input-legal-business-name');
    expect(input).toHaveAttribute('readOnly');
  });

  // Test 10: Legal Business Name - readonly when editing
  it('makes legal business name readonly when editing', () => {
    renderWithProviders({
      currentEntityId: 'entity-123',
      formData: { ...defaultProps.formData, legalBusinessName: 'Existing Entity' }
    });
    const input = screen.getByTestId('text-input-legal-business-name');
    expect(input).toHaveAttribute('readOnly');
    expect(input).toHaveValue('Existing Entity');
  });

  // Test 11: Display Name helper text
  it('shows display name helper text', () => {
    renderWithProviders();
    expect(screen.getByTestId('helper-text')).toHaveTextContent(
      'If entered, this name will be displayed across application'
    );
  });

  // Test 12: All validation errors displayed
  it('displays all validation errors', () => {
    const validationErrors = {
      legalBusinessName: 'Legal name is required',
      entityType: 'Entity type is required',
      country: 'Country is required',
      state: 'State is required',
      city: 'City is required',
      pinZipCode: 'Pin/Zip code is required'
    };

    renderWithProviders({ validationErrors });
    
    const errorMessages = screen.getAllByTestId('error-message');
    expect(errorMessages).toHaveLength(6);
    expect(errorMessages[0]).toHaveTextContent('Legal name is required');
  });

  // Test 13: Assigned Entity - disabled when no entityType selected
  it('disables assigned entity field when no entity type selected', () => {
    renderWithProviders({
      formData: { ...defaultProps.formData, entityType: '' }
    });
    
    expect(screen.getByTestId('disabled-indicator')).toHaveTextContent('Disabled');
  });

  // Test 14: Assigned Entity - shows correct placeholder when disabled
  it('shows correct placeholder when no entity type selected', () => {
    renderWithProviders({
      formData: { ...defaultProps.formData, entityType: '' }
    });
    
    expect(screen.getByTestId('placeholder')).toHaveTextContent('Please Select Entity Type First');
  });

  // Test 15: Assigned Entity - enabled when entityType selected
  it('enables assigned entity when entity type selected', () => {
    renderWithProviders({
      formData: { ...defaultProps.formData, entityType: 'Planning Entity' }
    });
    
    expect(screen.queryByTestId('disabled-indicator')).toBe(null);
  });

  // Test 16: Assigned Entity - filters rollup entities correctly
  it('filters assigned entity options to show only rollup entities', () => {
    renderWithProviders({
      formData: { ...defaultProps.formData, entityType: 'Planning Entity' }
    });
    
    const optionsList = screen.getByTestId('options-list');
    expect(optionsList).toHaveTextContent('Rollup Entity 1');
    expect(optionsList).toHaveTextContent('rollup entity lower');
    expect(optionsList).toHaveTextContent('ROLLUP ENTITY UPPER');
    // Should NOT contain Planning Entity
    expect(optionsList).not.toHaveTextContent('Planning Entity');
  });

  // Test 17: Assigned Entity - excludes soft deleted entities
  it('excludes soft deleted entities from options', () => {
    renderWithProviders({
      formData: { ...defaultProps.formData, entityType: 'Planning Entity' }
    });
    
    const optionsList = screen.getByTestId('options-list');
    expect(optionsList).not.toHaveTextContent('Deleted Rollup');
  });

  // Test 18: Assigned Entity - excludes current entity
  it('excludes current entity from options', () => {
    renderWithProviders({
      currentEntityId: '1', // Should exclude entity with id '1'
      formData: { ...defaultProps.formData, entityType: 'Planning Entity' }
    });
    
    const optionsList = screen.getByTestId('options-list');
    // Entity with id '1' should not appear
    expect(optionsList).not.toHaveTextContent('Rollup Entity 1');
    // But others should
    expect(optionsList).toHaveTextContent('rollup entity lower');
  });

  // Test 19: Assigned Entity - handles undefined entityType in filter
  it('handles entities with undefined entityType gracefully', () => {
    renderWithProviders({
      formData: { ...defaultProps.formData, entityType: 'Planning Entity' }
    });
    
    const optionsList = screen.getByTestId('options-list');
    // Should not contain entities with undefined entityType
    expect(optionsList).not.toHaveTextContent('Undefined Type');
    expect(optionsList).not.toHaveTextContent('Null Type');
  });

  // Test 20: Assigned Entity - displayName fallback to legalBusinessName
  it('uses legalBusinessName when displayName is empty or null', () => {
    renderWithProviders({
      formData: { ...defaultProps.formData, entityType: 'Planning Entity' }
    });
    
    const optionsList = screen.getByTestId('options-list');
    // Should show legalBusinessName for entities with empty/null displayName
    expect(optionsList).toHaveTextContent('Legal 4 No Display');
    expect(optionsList).toHaveTextContent('Legal 5 Null Display');
  });

  // Test 21: Assigned Entity - Array.isArray check for value prop
  it('handles assignedEntity as array correctly', () => {
    renderWithProviders({
      formData: { 
        ...defaultProps.formData, 
        assignedEntity: ['Entity 1', 'Entity 2'],
        entityType: 'Planning Entity' 
      }
    });
    
    const selectedValues = screen.getAllByTestId('selected-value');
    expect(selectedValues).toHaveLength(2);
    expect(selectedValues[0]).toHaveTextContent('Entity 1');
    expect(selectedValues[1]).toHaveTextContent('Entity 2');
  });

  // Test 22: Assigned Entity - Array.isArray check with non-array value
  it('handles assignedEntity as non-array by defaulting to empty array', () => {
    renderWithProviders({
      formData: { 
        ...defaultProps.formData, 
        assignedEntity: 'not-an-array' as any,
        entityType: 'Planning Entity' 
      }
    });
    
    const selectedValues = screen.queryAllByTestId('selected-value');
    expect(selectedValues).toHaveLength(0);
  });

  // Test 23: Assigned Entity - shows "No Rollup Entity" when no options available
  it('shows no options message when no rollup entities available', () => {
    const emptyEntities: any[] = [];
    renderWithProviders({
      formData: { ...defaultProps.formData, entityType: 'Planning Entity' }
    }, emptyEntities);
    
    expect(screen.getByTestId('no-options-message')).toHaveTextContent('No Rollup Entity');
  });

  // Test 24: State field - disabled when no country selected
  it('disables state field when no country is selected', () => {
    renderWithProviders({
      formData: { ...defaultProps.formData, country: '' }
    });
    
    const stateSelect = screen.getByTestId('select-input-state');
    expect(stateSelect).toBeDisabled();
  });

  // Test 25: State field - enabled when country selected
  it('enables state field when country is selected', () => {
    renderWithProviders({
      formData: { ...defaultProps.formData, country: 'USA' }
    });
    
    const stateSelect = screen.getByTestId('select-input-state');
    expect(stateSelect).not.toBeDisabled();
  });

  // Test 26: State field - correct placeholder when no country selected
  it('shows correct placeholder for state when no country selected', () => {
    renderWithProviders({
      formData: { ...defaultProps.formData, country: '' }
    });
    
    const stateSelect = screen.getByTestId('select-input-state');
    expect(stateSelect).toHaveTextContent('Please Select Country First');
  });

  // Test 27: State field - correct placeholder when country selected
  it('shows correct placeholder for state when country is selected', () => {
    renderWithProviders({
      formData: { ...defaultProps.formData, country: 'USA' }
    });
    
    const stateSelect = screen.getByTestId('select-input-state');
    expect(stateSelect).toHaveTextContent('Select State');
  });

  // Test 28: Both form sections rendered
  it('renders both Entity Details and Address sections', () => {
    renderWithProviders();
    
    const formSections = screen.getAllByTestId('form-section');
    expect(formSections).toHaveLength(2);
    expect(screen.getByText('Entity Details')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
  });

  // Test 29: All form fields rendered
  it('renders all required form fields', () => {
    renderWithProviders();
    
    // Entity Details section fields
    expect(screen.getByTestId('text-input-legal-business-name')).toBeInTheDocument();
    expect(screen.getByTestId('text-input-display-name')).toBeInTheDocument();
    expect(screen.getByTestId('select-input-entity-type')).toBeInTheDocument();
    expect(screen.getByTestId('multi-select-field')).toBeInTheDocument();
    
    // Address section fields
    expect(screen.getByTestId('text-input-address-line--1')).toBeInTheDocument();
    expect(screen.getByTestId('text-input-address-line--2')).toBeInTheDocument();
    expect(screen.getByTestId('select-input-country')).toBeInTheDocument();
    expect(screen.getByTestId('select-input-state')).toBeInTheDocument();
    expect(screen.getByTestId('text-input-city')).toBeInTheDocument();
    expect(screen.getByTestId('text-input-pin-zip-code')).toBeInTheDocument();
  });

  // Test 30: Edge case - empty options arrays
  it('handles empty option arrays gracefully', () => {
    renderWithProviders({
      entityTypeOptions: [],
      countryOptions: [],
      stateOptions: []
    });
    
    expect(screen.getByTestId('select-input-entity-type')).toBeInTheDocument();
    expect(screen.getByTestId('select-input-country')).toBeInTheDocument();
    expect(screen.getByTestId('select-input-state')).toBeInTheDocument();
  });
});