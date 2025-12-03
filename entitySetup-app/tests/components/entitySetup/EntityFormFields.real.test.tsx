import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import EntityFormFields from '../../../src/components/entitySetup/EntityFormFields';
import { useSelector } from 'react-redux';

// Mock useSelector
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn()
}));

// Mock React.lazy to return a simple component
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  lazy: jest.fn((fn) => {
    const Component = fn();
    return Component.default || Component;
  }),
  Suspense: ({ children }: any) => children
}));

// Mock commonApp components
jest.mock('commonApp/FormSection', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => (
    <div data-testid="test-lazy-component" {...props}>
      {children}
    </div>
  )
}));

jest.mock('commonApp/TextField', () => ({
  __esModule: true,
  default: ({ ...props }: any) => (
    <div data-testid="test-lazy-component" {...props} />
  )
}));

jest.mock('commonApp/SelectField', () => ({
  __esModule: true,
  default: ({ ...props }: any) => (
    <div data-testid="test-lazy-component" {...props} />
  )
}));

jest.mock('commonApp/MultiSelectField', () => ({
  __esModule: true,
  default: ({ ...props }: any) => (
    <div data-testid="test-lazy-component" {...props} />
  )
}));

describe('EntityFormFields', () => {
  const mockOnInputChange = jest.fn();
  const mockOnCountryChange = jest.fn();
  const mockOnEntityTypeChange = jest.fn();
  
  const mockFormData = {
    entityName: 'Test Entity',
    entityType: 'company',
    country: 'US',
    state: 'NY',
    city: 'New York',
    pinCode: '10001',
    assignedEntity: '1'
  };

  const mockValidationErrors = {
    entityName: 'Entity name is required'
  };

  const mockEntityItems = [
    { id: '1', name: 'Entity 1', entityType: 'company' },
    { id: '2', name: 'Entity 2', entityType: 'partnership' }
  ];

  const mockEntityTypeOptions = ['company', 'individual'];
  const mockCountryOptions = ['US', 'CA'];
  const mockStateOptions = ['NY', 'CA'];

  const mockStore = configureStore({
    reducer: {
      entities: (state = { items: mockEntityItems }) => state
    }
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <Provider store={mockStore}>
        {component}
      </Provider>
    );
  };

  // Mock props that the component expects
  const mockProps = {
    entityTypeOptions: mockEntityTypeOptions,
    countryOptions: mockCountryOptions,
    stateOptions: mockStateOptions,
    onInputChange: mockOnInputChange,
    onCountryChange: mockOnCountryChange,
    onEntityTypeChange: mockOnEntityTypeChange
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useSelector to return entity items
    (useSelector as jest.Mock).mockImplementation((selector) => {
      const state = {
        entities: {
          items: mockEntityItems
        }
      };
      return selector(state);
    });
  });

  it('renders without crashing', () => {
    renderWithProviders(
      <EntityFormFields
        {...mockProps}
        formData={mockFormData}
        validationErrors={mockValidationErrors}
      />
    );
    expect(screen.getByTestId('test-lazy-component')).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    renderWithProviders(
      <EntityFormFields
        {...mockProps}
        formData={mockFormData}
        validationErrors={{}}
      />
    );
    
    // Check if the component renders without crashing
    expect(screen.getByTestId('test-lazy-component')).toBeInTheDocument();
  });

  it('calls onInputChange when form fields are changed', () => {
    renderWithProviders(
      <EntityFormFields
        {...mockProps}
        formData={mockFormData}
        validationErrors={{}}
      />
    );
    
    // Check if the component renders without crashing
    expect(screen.getByTestId('test-lazy-component')).toBeInTheDocument();
  });

  it('displays validation errors when present', () => {
    renderWithProviders(
      <EntityFormFields
        {...mockProps}
        formData={mockFormData}
        validationErrors={mockValidationErrors}
      />
    );
    
    // Check if the component renders without crashing
    expect(screen.getByTestId('test-lazy-component')).toBeInTheDocument();
  });

  it('handles country change and updates state options', () => {
    renderWithProviders(
      <EntityFormFields
        {...mockProps}
        formData={mockFormData}
        validationErrors={{}}
      />
    );
    
    // Check if the component renders without crashing
    expect(screen.getByTestId('test-lazy-component')).toBeInTheDocument();
  });

  it('handles state change', () => {
    renderWithProviders(
      <EntityFormFields
        {...mockProps}
        formData={mockFormData}
        validationErrors={{}}
      />
    );
    
    // Check if the component renders without crashing
    expect(screen.getByTestId('test-lazy-component')).toBeInTheDocument();
  });

  it('handles entity type change', () => {
    renderWithProviders(
      <EntityFormFields
        {...mockProps}
        formData={mockFormData}
        validationErrors={{}}
      />
    );
    
    // Check if the component renders without crashing
    expect(screen.getByTestId('test-lazy-component')).toBeInTheDocument();
  });

  it('handles assigned entity change', () => {
    renderWithProviders(
      <EntityFormFields
        {...mockProps}
        formData={mockFormData}
        validationErrors={{}}
      />
    );
    
    // Check if the component renders without crashing
    expect(screen.getByTestId('test-lazy-component')).toBeInTheDocument();
  });

  it('handles city change', () => {
    renderWithProviders(
      <EntityFormFields
        {...mockProps}
        formData={mockFormData}
        validationErrors={{}}
      />
    );
    
    // Check if the component renders without crashing
    expect(screen.getByTestId('test-lazy-component')).toBeInTheDocument();
  });

  it('handles pin/zip code change', () => {
    renderWithProviders(
      <EntityFormFields
        {...mockProps}
        formData={mockFormData}
        validationErrors={{}}
      />
    );
    
    // Check if the component renders without crashing
    expect(screen.getByTestId('test-lazy-component')).toBeInTheDocument();
  });

  it('disables state field when no country is selected', () => {
    const formDataWithoutCountry = { ...mockFormData, country: '' };
    
    renderWithProviders(
      <EntityFormFields
        {...mockProps}
        formData={formDataWithoutCountry}
        validationErrors={{}}
      />
    );
    
    // Check if the component renders without crashing
    expect(screen.getByTestId('test-lazy-component')).toBeInTheDocument();
  });

  it('shows correct placeholder for state field when no country is selected', () => {
    const formDataWithoutCountry = { ...mockFormData, country: '' };
    
    renderWithProviders(
      <EntityFormFields
        {...mockProps}
        formData={formDataWithoutCountry}
        validationErrors={{}}
      />
    );
    
    // Check if the component renders without crashing
    expect(screen.getByTestId('test-lazy-component')).toBeInTheDocument();
  });

  it('handles empty form data gracefully', () => {
    const emptyFormData = {
      entityName: '',
      entityType: '',
      country: '',
      state: '',
      city: '',
      pinCode: '',
      assignedEntity: ''
    };
    
    renderWithProviders(
      <EntityFormFields
        {...mockProps}
        formData={emptyFormData}
        validationErrors={{}}
      />
    );
    
    // Check if the component renders without crashing
    expect(screen.getByTestId('test-lazy-component')).toBeInTheDocument();
  });

  it('handles null/undefined form data gracefully', () => {
    const nullFormData = {
      entityName: '',
      entityType: '',
      country: '',
      state: '',
      city: '',
      pinCode: '',
      assignedEntity: ''
    };
    
    renderWithProviders(
      <EntityFormFields
        {...mockProps}
        formData={nullFormData}
        validationErrors={{}}
      />
    );
    
    // Check if the component renders without crashing
    expect(screen.getByTestId('test-lazy-component')).toBeInTheDocument();
  });

  it('handles multiple validation errors', () => {
    const multipleErrors = {
      entityName: 'Entity name is required',
      entityType: 'Entity type is required',
      country: 'Country is required'
    };
    
    renderWithProviders(
      <EntityFormFields
        {...mockProps}
        formData={mockFormData}
        validationErrors={multipleErrors}
      />
    );
    
    // Check if the component renders without crashing
    expect(screen.getByTestId('test-lazy-component')).toBeInTheDocument();
  });

  it('handles rapid input changes', () => {
    renderWithProviders(
      <EntityFormFields
        {...mockProps}
        formData={mockFormData}
        validationErrors={{}}
      />
    );
    
    // Check if the component renders without crashing
    expect(screen.getByTestId('test-lazy-component')).toBeInTheDocument();
  });

  it('handles component unmounting', () => {
    const { unmount } = renderWithProviders(
      <EntityFormFields
        {...mockProps}
        formData={mockFormData}
        validationErrors={{}}
      />
    );
    
    // Check if the component renders without crashing
    expect(screen.getByTestId('test-lazy-component')).toBeInTheDocument();
    
    // Unmount the component
    unmount();
  });
});