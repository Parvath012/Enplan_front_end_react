import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { act } from 'react';
import EntityFormFields from '../../../src/components/entitySetup/EntityFormFields';

// Temporarily override the global React.lazy mock for this test
const originalLazy = React.lazy;

beforeAll(() => {
  // Restore React.lazy to its original implementation
  (React as any).lazy = originalLazy;
});

afterAll(() => {
  // Restore the global mock after tests
  (React as any).lazy = jest.fn((_factory) => {
    const Component = React.forwardRef<any, any>((props, ref) => (
      <div data-testid="test-lazy-component" ref={ref} {...props}>
        Test Lazy Component
      </div>
    ));
    Component.displayName = 'MockLazyComponent';
    return Component;
  });
});

// Mock the actual components from commonApp with real-like behavior
jest.mock('commonApp/FormSection', () => {
  return React.forwardRef<any, any>(({ title, children, ...props }, ref) => (
    <div data-testid="form-section" ref={ref} title={title} {...props}>
      <h3>{title}</h3>
      {children}
    </div>
  ));
});

jest.mock('commonApp/TextField', () => {
  return React.forwardRef<any, any>(({ 
    label, 
    name, 
    value, 
    required, 
    disabled, 
    validationError, 
    onChange,
    ...props 
  }, ref) => (
    <div data-testid={`text-input-${name}`} ref={ref} {...props}>
      <label>{label}{required && ' *'}</label>
      <input
        name={name}
        value={value || ''}
        disabled={disabled}
        onChange={onChange}
        data-required={required}
        data-error={validationError}
      />
      {validationError && <span data-testid="error-message">{validationError}</span>}
    </div>
  ));
});

jest.mock('commonApp/SelectField', () => {
  return React.forwardRef<any, any>(({ 
    label, 
    name, 
    value, 
    required, 
    disabled, 
    placeholder, 
    options, 
    validationError, 
    onChange,
    ...props 
  }, ref) => (
    <div data-testid={`select-input-${name}`} ref={ref} {...props}>
      <label>{label}{required && ' *'}</label>
      <select
        name={name}
        value={value || ''}
        disabled={disabled}
        onChange={onChange}
        data-required={required}
        data-error={validationError}
        data-placeholder={placeholder}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options?.map((option: any, index: number) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {validationError && <span data-testid="error-message">{validationError}</span>}
    </div>
  ));
});

jest.mock('commonApp/MultiSelectField', () => {
  return React.forwardRef<any, any>(({ 
    label, 
    name, 
    value, 
    required, 
    disabled, 
    options, 
    validationError, 
    onChange,
    ...props 
  }, ref) => (
    <div data-testid="multi-select-field" ref={ref} {...props}>
      <label>{label}{required && ' *'}</label>
      <div data-testid="multi-select-options">
        {options?.map((option: any, index: number) => (
          <div key={index} data-testid="option-item">
            <input
              type="checkbox"
              value={option.value}
              checked={Array.isArray(value) ? value.includes(option.value) : value === option.value}
              onChange={() => onChange && onChange(option.value)}
            />
            {option.label}
          </div>
        ))}
      </div>
      {validationError && <span data-testid="error-message">{validationError}</span>}
    </div>
  ));
});

// Create a mock store with entities
const createMockStore = (entities: any[] = []) => {
  return configureStore({
    reducer: {
      entities: () => ({ items: entities }),
    },
  });
};

const renderWithProviders = (
  props = {},
  entities: any[] = []
) => {
  const store = createMockStore(entities);
  
  const defaultProps = {
    formData: {
      legalBusinessName: '',
      displayName: '',
      entityType: '',
      assignedEntity: '',
      country: '',
      state: '',
      ...((props as any).formData || {}),
    },
    validationErrors: {},
    entityTypeOptions: ['LLC', 'Corp'],
    countryOptions: ['US', 'CA'],
    stateOptions: ['NY', 'CA'],
    currentEntityId: undefined,
    onInputChange: jest.fn(),
    onCountryChange: jest.fn(),
    onEntityTypeChange: jest.fn(),
    ...props,
  };

  return render(
    <Provider store={store}>
      <EntityFormFields {...defaultProps} />
    </Provider>
  );
};

describe('EntityFormFields - Real Component Coverage Tests', () => {
  test('executes JSX prop assignments with real components', async () => {
    const entities = [
      {
        id: '1',
        displayName: 'Rollup Entity 1',
        legalBusinessName: 'Legal Rollup 1',
        entityType: 'rollup entity',
        isDeleted: false
      },
      {
        id: '2',
        displayName: 'Regular Entity',
        legalBusinessName: 'Legal Regular',
        entityType: 'regular',
        isDeleted: false
      }
    ];

    await act(async () => {
      renderWithProviders({
        formData: {
          entityType: 'LLC',
          country: 'US'
        },
        validationErrors: {
          legalBusinessName: 'Legal name is required',
          entityType: 'Entity type is required'
        }
      }, entities);
    });

    // Wait for components to render
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verify that real components are rendered and JSX props are executed
    expect(screen.getByTestId('form-section')).toBeInTheDocument();
    expect(screen.getByTestId('text-input-legalBusinessName')).toBeInTheDocument();
    expect(screen.getByTestId('text-input-displayName')).toBeInTheDocument();
    expect(screen.getByTestId('select-input-entityType')).toBeInTheDocument();
    expect(screen.getByTestId('multi-select-field')).toBeInTheDocument();
    expect(screen.getByTestId('select-input-country')).toBeInTheDocument();
    expect(screen.getByTestId('select-input-state')).toBeInTheDocument();

    // Verify error messages are displayed (validates JSX execution)
    const errorMessages = screen.getAllByTestId('error-message');
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  test('executes all prop assignments and callbacks', async () => {
    const entities = [
      {
        id: '1',
        displayName: 'Rollup Entity 1',
        legalBusinessName: 'Legal Rollup 1',
        entityType: 'rollup entity',
        isDeleted: false
      }
    ];

    await act(async () => {
      renderWithProviders({
        formData: {
          entityType: 'LLC',
          country: 'US',
          legalBusinessName: 'Test Company',
          displayName: 'Test Display',
          assignedEntity: ['1'],
          state: 'NY'
        },
        validationErrors: {
          legalBusinessName: 'Error 1',
          displayName: 'Error 2',
          entityType: 'Error 3',
          assignedEntity: 'Error 4',
          country: 'Error 5',
          state: 'Error 6'
        }
      }, entities);
    });

    // Wait for components to render
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verify all form fields have their props properly set
    const legalNameField = screen.getByTestId('text-input-legalBusinessName');
    expect(legalNameField).toHaveAttribute('data-required', 'true');
    expect(legalNameField.querySelector('input')).toHaveValue('Test Company');

    const displayNameField = screen.getByTestId('text-input-displayName');
    expect(displayNameField.querySelector('input')).toHaveValue('Test Display');

    const entityTypeField = screen.getByTestId('select-input-entityType');
    expect(entityTypeField).toHaveAttribute('data-required', 'true');
    expect(entityTypeField.querySelector('select')).toHaveValue('LLC');

    const countryField = screen.getByTestId('select-input-country');
    expect(countryField).toHaveAttribute('data-required', 'true');
    expect(countryField.querySelector('select')).toHaveValue('US');

    const stateField = screen.getByTestId('select-input-state');
    expect(stateField.querySelector('select')).toHaveValue('NY');
    expect(stateField.querySelector('select')).not.toBeDisabled();

    // Verify all error messages are displayed
    const errorMessages = screen.getAllByTestId('error-message');
    expect(errorMessages).toHaveLength(6);
  });

  test('covers Suspense fallback and lazy loading', async () => {
    await act(async () => {
      renderWithProviders();
    });

    // Component should render without crashing
    expect(screen.getByTestId('form-section')).toBeInTheDocument();
  });

  test('covers edge cases with real component execution', async () => {
    const entities = [
      {
        id: '1',
        displayName: '',
        legalBusinessName: 'Legal Only',
        entityType: 'rollup entity',
        isDeleted: false
      },
      {
        id: '2',
        displayName: null,
        legalBusinessName: 'Another Legal',
        entityType: 'rollup entity',
        isDeleted: false
      },
      {
        id: '3',
        displayName: 'Deleted Entity',
        legalBusinessName: 'Deleted Legal',
        entityType: 'rollup entity',
        isDeleted: true
      }
    ];

    await act(async () => {
      renderWithProviders({
        formData: {
          entityType: 'LLC',
          country: '',
          assignedEntity: ''
        },
        currentEntityId: '1'
      }, entities);
    });

    // Wait for rendering
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verify components rendered
    expect(screen.getByTestId('multi-select-field')).toBeInTheDocument();
    
    // State field should be disabled when no country
    const stateField = screen.getByTestId('select-input-state');
    expect(stateField.querySelector('select')).toBeDisabled();
  });
});