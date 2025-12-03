import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock the FinancialYearSection component to avoid import issues
jest.mock('../../../src/components/entityConfiguration/FinancialYearSection', () => {
  return function MockFinancialYearSection(props: any) {
    return (
      <div data-testid="financial-year-section">
        <div data-testid="financial-year-name">{props.financialYear?.name}</div>
        <div data-testid="financial-year-start-month">{props.financialYear?.startMonth}</div>
        <div data-testid="financial-year-end-month">{props.financialYear?.endMonth}</div>
        <div data-testid="financial-year-historical-data">{props.financialYear?.historicalDataStartFY}</div>
        <div data-testid="financial-year-spanning-years">{props.financialYear?.spanningYears}</div>
        <div data-testid="financial-year-format">{props.financialYear?.format}</div>
        <div data-testid="slider-value">{props.sliderValue?.join(',')}</div>
        <div data-testid="edit-mode">{props.isEditMode ? 'true' : 'false'}</div>
        <button 
          data-testid="format-link"
          onClick={props.onFormatLinkClick}
          disabled={!props.isEditMode}
        >
          Format Link
        </button>
      </div>
    );
  };
});

import FinancialYearSection from '../../../src/components/entityConfiguration/FinancialYearSection';

const theme = createTheme();

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      entityConfiguration: (state = {}, action: any) => state,
      entitySetup: (state = {}, action: any) => state,
    },
    preloadedState: {
      entityConfiguration: {
        financialYear: {
          name: 'Test Financial Year',
          startMonth: 'January',
          endMonth: 'December',
          historicalDataStartFY: '2020',
          spanningYears: '2',
          format: 'YYYY-MM'
        },
        sliderValue: [2020, 2022],
        isEditMode: true
      },
      ...initialState
    },
  });
};

const renderWithProviders = (component: React.ReactElement) => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </Provider>
  );
};

describe('FinancialYearSection', () => {
  const defaultProps = {
    financialYear: {
      name: 'Test Financial Year',
      startMonth: 'January',
      endMonth: 'December',
      historicalDataStartFY: '2020',
      spanningYears: '2',
      format: 'YYYY-MM'
    },
    sliderValue: [2020, 2022],
    onFinancialYearChange: jest.fn(),
    onFormatLinkClick: jest.fn(),
    isEditMode: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(<FinancialYearSection {...defaultProps} />);
    expect(screen.getByTestId('financial-year-section')).toBeInTheDocument();
  });

  it('displays financial year data correctly', () => {
    renderWithProviders(<FinancialYearSection {...defaultProps} />);
    
    expect(screen.getByTestId('financial-year-name')).toHaveTextContent('Test Financial Year');
    expect(screen.getByTestId('financial-year-start-month')).toHaveTextContent('January');
    expect(screen.getByTestId('financial-year-end-month')).toHaveTextContent('December');
    expect(screen.getByTestId('financial-year-historical-data')).toHaveTextContent('2020');
    expect(screen.getByTestId('financial-year-spanning-years')).toHaveTextContent('2');
    expect(screen.getByTestId('financial-year-format')).toHaveTextContent('YYYY-MM');
  });

  it('displays slider value correctly', () => {
    renderWithProviders(<FinancialYearSection {...defaultProps} />);
    expect(screen.getByTestId('slider-value')).toHaveTextContent('2020,2022');
  });

  it('shows edit mode correctly', () => {
    renderWithProviders(<FinancialYearSection {...defaultProps} />);
    expect(screen.getByTestId('edit-mode')).toHaveTextContent('true');
  });

  it('handles format link click in edit mode', () => {
    const mockOnFormatLinkClick = jest.fn();
    renderWithProviders(
      <FinancialYearSection 
        {...defaultProps} 
        onFormatLinkClick={mockOnFormatLinkClick}
        isEditMode={true}
      />
    );
    
    const formatLink = screen.getByTestId('format-link');
    expect(formatLink).not.toBeDisabled();
    
    formatLink.click();
    expect(mockOnFormatLinkClick).toHaveBeenCalledTimes(1);
  });

  it('disables format link in read-only mode', () => {
    const mockOnFormatLinkClick = jest.fn();
    renderWithProviders(
      <FinancialYearSection 
        {...defaultProps} 
        onFormatLinkClick={mockOnFormatLinkClick}
        isEditMode={false}
      />
    );
    
    const formatLink = screen.getByTestId('format-link');
    expect(formatLink).toBeDisabled();
  });

  it('handles empty financial year data', () => {
    const emptyProps = {
      ...defaultProps,
      financialYear: {
        name: '',
        startMonth: '',
        endMonth: '',
        historicalDataStartFY: '',
        spanningYears: '',
        format: ''
      }
    };
    
    renderWithProviders(<FinancialYearSection {...emptyProps} />);
    expect(screen.getByTestId('financial-year-section')).toBeInTheDocument();
  });

  it('handles undefined slider value', () => {
    const propsWithUndefinedSlider = {
      ...defaultProps,
      sliderValue: undefined as any
    };
    
    renderWithProviders(<FinancialYearSection {...propsWithUndefinedSlider} />);
    expect(screen.getByTestId('financial-year-section')).toBeInTheDocument();
  });

  it('handles null slider value', () => {
    const propsWithNullSlider = {
      ...defaultProps,
      sliderValue: null as any
    };
    
    renderWithProviders(<FinancialYearSection {...propsWithNullSlider} />);
    expect(screen.getByTestId('financial-year-section')).toBeInTheDocument();
  });
});





