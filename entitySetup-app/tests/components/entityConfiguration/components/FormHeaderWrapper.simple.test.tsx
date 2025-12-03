import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';

// Mock all dependencies first
jest.mock('../../../../../common-app/src/hooks/usePreventEmptySpaceSelection', () => ({
  usePreventEmptySpaceSelection: jest.fn(() => ({ current: null })),
}));

jest.mock('commonApp/FormHeader', () => {
  return React.forwardRef<HTMLDivElement, any>((props, ref) => (
    <div ref={ref} data-testid="mocked-form-header">
      <span>{props.title}</span>
      {props.showNextButton && (
        <button 
          data-testid="next-button" 
          onClick={props.onNext}
          disabled={props.isNextDisabled}
        >
          {props.nextButtonText || 'Next'}
        </button>
      )}
    </div>
  ));
});

const mockGetEditButtonVisibility = jest.fn(() => false);
const mockGetFormModifiedState = jest.fn(() => false);
const mockGetSaveDisabledState = jest.fn(() => false);

jest.mock('../../../../src/store/Actions/entityConfigurationActions', () => ({
  getEditButtonVisibility: mockGetEditButtonVisibility,
  getFormModifiedState: mockGetFormModifiedState,
  getSaveDisabledState: mockGetSaveDisabledState,
}));

import FormHeaderWrapper from '../../../../src/components/entityConfiguration/components/FormHeaderWrapper';

describe('FormHeaderWrapper Simple Coverage Test', () => {
  const theme = createTheme();
  
  const mockStore = configureStore({
    reducer: {
      entities: () => ({ items: [] }),
      entityConfiguration: () => ({}),
    },
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      isEditMode: false,
      isNextEnabled: true,
      isSaving: false,
      tabValue: 0,
      isDataSaved: true,
      selectedCountries: ['US'],
      selectedCurrencies: ['USD'],
      entityId: 'test-entity',
      periodSetup: {},
      modulesState: {},
      isDataModified: false,
      isPeriodSetupMandatoryFieldsFilled: () => true,
      isPeriodSetupModified: () => false,
      isRollupEntity: false,
      getHeaderTitle: () => 'Test Title',
      onBack: jest.fn(),
      onSave: jest.fn(),
      onReset: jest.fn(),
      onEdit: jest.fn(),
      onNext: jest.fn(),
      onFinish: jest.fn(),
      ...props,
    };

    return render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <FormHeaderWrapper {...defaultProps} />
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders and calls action functions', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByTestId('form-header')).toBeInTheDocument();
    });

    // Verify all action functions are called
    expect(mockGetEditButtonVisibility).toHaveBeenCalled();
    expect(mockGetFormModifiedState).toHaveBeenCalled();
    expect(mockGetSaveDisabledState).toHaveBeenCalled();
  });

  it('handles rollup entity finish button - case 1', async () => {
    const onFinishMock = jest.fn();
    renderComponent({
      isRollupEntity: true,
      tabValue: 1,
      onFinish: onFinishMock,
    });
    
    await waitFor(() => {
      expect(screen.getByText('Finish')).toBeInTheDocument();
    });
  });

  it('handles non-rollup entity finish button - case 2', async () => {
    const onFinishMock = jest.fn();
    renderComponent({
      isRollupEntity: false,
      tabValue: 2,
      onFinish: onFinishMock,
    });
    
    await waitFor(() => {
      expect(screen.getByText('Finish')).toBeInTheDocument();
    });
  });

  it('handles regular next button', async () => {
    const onNextMock = jest.fn();
    renderComponent({
      isRollupEntity: false,
      tabValue: 0,
      onNext: onNextMock,
    });
    
    await waitFor(() => {
      expect(screen.getByText('Next')).toBeInTheDocument();
    });
  });

  it('passes different props and generates different keys', () => {
    const { rerender } = renderComponent({ isEditMode: false, isNextEnabled: true });
    
    rerender(
      <Provider store={mockStore}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <FormHeaderWrapper
              isEditMode={true}
              isNextEnabled={false}
              isSaving={false}
              tabValue={1}
              isDataSaved={false}
              selectedCountries={[]}
              selectedCurrencies={[]}
              entityId="different-entity"
              periodSetup={{}}
              modulesState={{}}
              isDataModified={true}
              isPeriodSetupMandatoryFieldsFilled={() => false}
              isPeriodSetupModified={() => true}
              isRollupEntity={true}
              getHeaderTitle={() => 'Different Title'}
              onBack={jest.fn()}
              onSave={jest.fn()}
              onReset={jest.fn()}
              onEdit={jest.fn()}
              onNext={jest.fn()}
              onFinish={jest.fn()}
            />
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    );

    // Component should re-render with different key
    expect(mockGetEditButtonVisibility).toHaveBeenCalledTimes(2);
  });

  it('verifies action function calls with specific parameters', async () => {
    const testProps = {
      tabValue: 1,
      isEditMode: true,
      isDataSaved: false,
      selectedCountries: ['US', 'CA'],
      selectedCurrencies: ['USD', 'CAD'],
      entityId: 'param-test',
      periodSetup: { periods: 12 },
      modulesState: { budget: { enabled: true } },
      isDataModified: true,
      isPeriodSetupMandatoryFieldsFilled: jest.fn(() => true),
      isPeriodSetupModified: jest.fn(() => false),
    };

    renderComponent(testProps);
    
    await waitFor(() => {
      expect(screen.getByTestId('form-header')).toBeInTheDocument();
    });

    // Verify specific parameter passing
    expect(mockGetEditButtonVisibility).toHaveBeenCalledWith({
      tabValue: 1,
      isEditMode: true,
      isDataSaved: false,
      selectedCountries: ['US', 'CA'],
      selectedCurrencies: ['USD', 'CAD'],
      entityId: 'param-test',
      periodSetup: { periods: 12 },
      modulesState: { budget: { enabled: true } }
    });

    expect(mockGetFormModifiedState).toHaveBeenCalledWith(
      1, 
      true, 
      expect.any(Function), 
      { budget: { enabled: true } }
    );

    expect(mockGetSaveDisabledState).toHaveBeenCalledWith({
      tabValue: 1,
      selectedCountries: ['US', 'CA'],
      selectedCurrencies: ['USD', 'CAD'],
      isDataModified: true,
      isDataSaved: false,
      isPeriodSetupMandatoryFieldsFilled: expect.any(Function),
      isPeriodSetupModified: expect.any(Function),
      modulesState: { budget: { enabled: true } }
    });
  });

  it('covers usePreventEmptySpaceSelection hook usage', async () => {
    const { usePreventEmptySpaceSelection } = require('../../../../../common-app/src/hooks/usePreventEmptySpaceSelection');
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByTestId('form-header')).toBeInTheDocument();
    });

    // Verify hook is called
    expect(usePreventEmptySpaceSelection).toHaveBeenCalled();
  });

  it('tests all conditional next/finish button logic paths', async () => {
    // Test case 1: isRollupEntity && tabValue === 1
    const { rerender } = renderComponent({
      isRollupEntity: true,
      tabValue: 1,
    });
    
    await waitFor(() => {
      expect(screen.getByText('Finish')).toBeInTheDocument();
    });

    // Test case 2: !isRollupEntity && tabValue === 2
    rerender(
      <Provider store={mockStore}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <FormHeaderWrapper
              isEditMode={false}
              isNextEnabled={true}
              isSaving={false}
              tabValue={2}
              isDataSaved={true}
              selectedCountries={['US']}
              selectedCurrencies={['USD']}
              entityId="test"
              periodSetup={{}}
              modulesState={{}}
              isDataModified={false}
              isPeriodSetupMandatoryFieldsFilled={() => true}
              isPeriodSetupModified={() => false}
              isRollupEntity={false}
              getHeaderTitle={() => 'Test'}
              onBack={jest.fn()}
              onSave={jest.fn()}
              onReset={jest.fn()}
              onEdit={jest.fn()}
              onNext={jest.fn()}
              onFinish={jest.fn()}
            />
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Finish')).toBeInTheDocument();
    });

    // Test case 3: else condition (Next button)
    rerender(
      <Provider store={mockStore}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <FormHeaderWrapper
              isEditMode={false}
              isNextEnabled={true}
              isSaving={false}
              tabValue={0}
              isDataSaved={true}
              selectedCountries={['US']}
              selectedCurrencies={['USD']}
              entityId="test"
              periodSetup={{}}
              modulesState={{}}
              isDataModified={false}
              isPeriodSetupMandatoryFieldsFilled={() => true}
              isPeriodSetupModified={() => false}
              isRollupEntity={false}
              getHeaderTitle={() => 'Test'}
              onBack={jest.fn()}
              onSave={jest.fn()}
              onReset={jest.fn()}
              onEdit={jest.fn()}
              onNext={jest.fn()}
              onFinish={jest.fn()}
            />
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Next')).toBeInTheDocument();
    });
  });
});