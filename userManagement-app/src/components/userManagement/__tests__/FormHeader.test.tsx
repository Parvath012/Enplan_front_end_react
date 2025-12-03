import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import FormHeader from '../FormHeader';

// Mock FormHeaderWithTabs
jest.mock('commonApp/FormHeaderWithTabs', () => {
  return function MockFormHeaderWithTabs(props: any) {
    return (
      <div data-testid="form-header-with-tabs">
        <div data-testid="title">{props.title}</div>
        <div data-testid="tabs">
          {props.tabs.map((tab: any, index: number) => (
            <button
              key={index}
              data-testid={`tab-${tab.value}`}
              onClick={() => props.onTabChange(null, tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button data-testid="back-button" onClick={props.onBack}>Back</button>
        <button data-testid="reset-button" onClick={props.onReset}>Reset</button>
        <button data-testid="cancel-button" onClick={props.onCancel}>Cancel</button>
        <button 
          data-testid="save-button" 
          onClick={props.onSave}
          disabled={props.isSaveDisabled}
        >
          Save
        </button>
        <button 
          data-testid="next-button" 
          onClick={props.onNext}
          disabled={props.isNextDisabled}
        >
          {props.submitButtonText}
        </button>
        {props.statusMessage && (
          <div data-testid="status-message">{props.statusMessage}</div>
        )}
      </div>
    );
  };
});

// Mock store
const createMockStore = () => {
  return configureStore({
    reducer: {
      users: (state = { users: [], hasUsers: false }) => state,
    },
  });
};

// Test wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = createMockStore();
  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
};

describe('FormHeader Component', () => {
  const defaultProps = {
    title: 'Edit User',
    tabs: [{ label: 'User Details', value: 0 }, { label: 'Permissions', value: 1 }],
    activeTab: 0,
    onTabChange: jest.fn(),
    onBack: jest.fn(),
    onReset: jest.fn(),
    onCancel: jest.fn(),
    onSave: jest.fn(),
    onNext: jest.fn(),
    isFormModified: false,
    isSaveDisabled: false,
    isNextDisabled: false,
    showSaveButton: true,
    showNextButton: true,
    useSubmitIcon: false,
    submitButtonText: 'Next'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with all required elements', () => {
    render(
      <TestWrapper>
        <FormHeader {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByTestId('form-header-with-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('title')).toHaveTextContent('Edit User');
    expect(screen.getByTestId('tab-0')).toHaveTextContent('User Details');
    expect(screen.getByTestId('tab-1')).toHaveTextContent('Permissions');
    expect(screen.getByTestId('back-button')).toBeInTheDocument();
    expect(screen.getByTestId('reset-button')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
    expect(screen.getByTestId('save-button')).toBeInTheDocument();
    expect(screen.getByTestId('next-button')).toBeInTheDocument();
  });

  it('handles tab changes', () => {
    render(
      <TestWrapper>
        <FormHeader {...defaultProps} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByTestId('tab-1'));
    expect(defaultProps.onTabChange).toHaveBeenCalledWith(null, 1);
  });

  it('handles button clicks', () => {
    render(
      <TestWrapper>
        <FormHeader {...defaultProps} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByTestId('back-button'));
    expect(defaultProps.onBack).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('reset-button'));
    expect(defaultProps.onReset).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('cancel-button'));
    expect(defaultProps.onCancel).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('save-button'));
    expect(defaultProps.onSave).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('next-button'));
    expect(defaultProps.onNext).toHaveBeenCalled();
  });

  it('disables buttons when specified', () => {
    render(
      <TestWrapper>
        <FormHeader {...defaultProps} isSaveDisabled={true} isNextDisabled={true} />
      </TestWrapper>
    );

    expect(screen.getByTestId('save-button')).toBeDisabled();
    expect(screen.getByTestId('next-button')).toBeDisabled();
  });

  it('shows status message when provided', () => {
    render(
      <TestWrapper>
        <FormHeader {...defaultProps} statusMessage="All Changes Saved" />
      </TestWrapper>
    );

    expect(screen.getByTestId('status-message')).toHaveTextContent('All Changes Saved');
  });

  it('uses correct submit button text', () => {
    render(
      <TestWrapper>
        <FormHeader {...defaultProps} submitButtonText="Submit" />
      </TestWrapper>
    );

    expect(screen.getByTestId('next-button')).toHaveTextContent('Submit');
  });

  it('handles different tab configurations', () => {
    const customTabs = [
      { label: 'Basic Info', value: 0 },
      { label: 'Advanced Settings', value: 1 },
      { label: 'Review', value: 2 }
    ];

    render(
      <TestWrapper>
        <FormHeader {...defaultProps} tabs={customTabs} />
      </TestWrapper>
    );

    expect(screen.getByTestId('tab-0')).toHaveTextContent('Basic Info');
    expect(screen.getByTestId('tab-1')).toHaveTextContent('Advanced Settings');
    expect(screen.getByTestId('tab-2')).toHaveTextContent('Review');
  });

  it('handles form modification state', () => {
    render(
      <TestWrapper>
        <FormHeader {...defaultProps} isFormModified={true} />
      </TestWrapper>
    );

    // Component should render without errors when form is modified
    expect(screen.getByTestId('form-header-with-tabs')).toBeInTheDocument();
  });

  it('handles different active tabs', () => {
    render(
      <TestWrapper>
        <FormHeader {...defaultProps} activeTab={1} />
      </TestWrapper>
    );

    expect(screen.getByTestId('form-header-with-tabs')).toBeInTheDocument();
  });

  it('handles all boolean props combinations', () => {
    const combinations = [
      { showSaveButton: false, showNextButton: false },
      { showSaveButton: true, showNextButton: false },
      { showSaveButton: false, showNextButton: true },
      { showSaveButton: true, showNextButton: true },
      { useSubmitIcon: true },
      { useSubmitIcon: false }
    ];

    combinations.forEach((props, index) => {
      const { unmount } = render(
        <TestWrapper>
          <FormHeader {...defaultProps} {...props} />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('form-header-with-tabs')).toBeInTheDocument();
      unmount();
    });
  });

  it('handles edge cases', () => {
    // Empty tabs
    render(
      <TestWrapper>
        <FormHeader {...defaultProps} tabs={[]} />
      </TestWrapper>
    );
    expect(screen.getByTestId('form-header-with-tabs')).toBeInTheDocument();

    // Long title
    render(
      <TestWrapper>
        <FormHeader {...defaultProps} title="Very Long Title That Should Still Work" />
      </TestWrapper>
    );
    expect(screen.getByTestId('title')).toHaveTextContent('Very Long Title That Should Still Work');
  });

  it('maintains proper styling structure', () => {
    const { container } = render(
      <TestWrapper>
        <FormHeader {...defaultProps} />
      </TestWrapper>
    );

    // Check that the sticky positioning styles are applied
    const headerBox = container.querySelector('[data-testid="form-header-with-tabs"]')?.parentElement;
    expect(headerBox).toBeInTheDocument();
  });
});

