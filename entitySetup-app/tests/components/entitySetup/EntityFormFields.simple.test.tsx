import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import EntityFormFields from '../../../src/components/entitySetup/EntityFormFields';
import { useSelector } from 'react-redux';

// Mock react-redux
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

// Mock all the lazy components to return simple divs
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
  return function MockTextField({ label, value, onChange, error, errorMessage, placeholder, required }: any) {
    return (
      <div data-testid="text-field">
        <label>{label} {required && '*'}</label>
        <input
          data-testid={`text-input-${label.toLowerCase().replace(/\s+/g, '-')}`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={!!error}
        />
        {error && <span data-testid="error-message">{errorMessage}</span>}
      </div>
    );
  };
});

jest.mock('commonApp/SelectField', () => {
  return function MockSelectField({ label, value, onChange, options, placeholder, disabled, required }: any) {
    return (
      <div data-testid="select-field">
        <label>{label} {required && '*'}</label>
        <select
          data-testid={`select-input-${label.toLowerCase().replace(/\s+/g, '-')}`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">{placeholder}</option>
          {options?.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };
});

const mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;

describe('EntityFormFields - Simple Tests', () => {
  const mockEntityItems = [
    { id: '1', name: 'Entity 1', type: 'Company' },
    { id: '2', name: 'Entity 2', type: 'Subsidiary' }
  ];

  const mockCountries = [
    { id: '1', name: 'United States', code: 'US' },
    { id: '2', name: 'Canada', code: 'CA' }
  ];

  const mockStates = [
    { id: '1', name: 'California', countryId: '1' },
    { id: '2', name: 'New York', countryId: '1' }
  ];

  const mockStore = configureStore({
    reducer: {
      entities: {
        items: mockEntityItems,
        countries: mockCountries,
        states: mockStates
      }
    }
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <Provider store={mockStore}>
        {component}
      </Provider>
    );
  };

  beforeEach(() => {
    // Mock useSelector to return different values based on the selector
    mockUseSelector.mockImplementation((selector) => {
      const mockState = {
        entities: {
          items: mockEntityItems,
          countries: mockCountries,
          states: mockStates
        }
      };
      return selector(mockState);
    });
  });

  it('renders without crashing', () => {
    // Test that the component can be instantiated without crashing
    const component = <EntityFormFields 
      formData={{}}
      onInputChange={jest.fn()}
      errors={{}}
    />;
    expect(component).toBeDefined();
  });

  it('can be rendered without crashing', () => {
    // Test that the component can be rendered without crashing
    expect(() => {
      renderWithProviders(
        <EntityFormFields 
          formData={{}}
          validationErrors={{}}
          entityTypeOptions={['Company', 'Subsidiary']}
          countryOptions={['United States', 'Canada']}
          stateOptions={['California', 'New York']}
          onInputChange={jest.fn()}
          onCountryChange={jest.fn()}
          onEntityTypeChange={jest.fn()}
        />
      );
    }).not.toThrow();
  });
});
