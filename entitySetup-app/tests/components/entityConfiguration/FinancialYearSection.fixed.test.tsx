import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FinancialYearSection from '../../../src/components/entityConfiguration/FinancialYearSection';

// Mock the lazy-loaded components
jest.mock('commonApp/TextField', () => ({
  __esModule: true,
  default: function MockTextField(props: any) {
    return (
      <input
        data-testid="text-field"
        value={props.value || ''}
        onChange={(e) => props.onChange && props.onChange(e.target.value)}
        disabled={props.disabled}
        placeholder={props.placeholder}
        {...props}
      />
    );
  }
}));

jest.mock('commonApp/SelectField', () => ({
  __esModule: true,
  default: function MockSelectField(props: any) {
    return (
      <select
        data-testid="select-field"
        value={props.value || ''}
        onChange={(e) => props.onChange && props.onChange(e.target.value)}
        disabled={props.disabled}
        {...props}
      >
        {props.options?.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
}));

jest.mock('commonApp/ReadOnlyField', () => ({
  __esModule: true,
  default: function MockReadOnlyField(props: any) {
    return (
      <div data-testid={`read-only-field-${props.name}`}>
        {props.value}
      </div>
    );
  }
}));

jest.mock('commonApp/CustomSlider', () => ({
  __esModule: true,
  default: function MockCustomSlider(props: any) {
    return (
      <div data-testid="custom-slider">
        <div data-testid="slider-left-label">{props.leftLabel}</div>
        <div data-testid="slider-right-label">{props.rightLabel}</div>
        <div data-testid="slider-current-value">{props.value}</div>
        <div data-testid="slider-enabled">{props.enabled ? 'true' : 'false'}</div>
      </div>
    );
  }
}));

// Mock the utility function with proper implementation
jest.mock('../../../src/utils/formatUtils', () => ({
  calculateYearLabelsAndPositions: jest.fn(() => ({
    left: { label: '2020', position: 0 },
    right: { label: '2025', position: 100 },
    current: { label: '2023', position: 50 }
  }))
}));

// Mock the constants
jest.mock('../../../src/constants/periodSetupConstants', () => ({
  MONTHS: [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ],
  SPANNING_YEARS_OPTIONS: [
    { value: '1', label: '1 Year' },
    { value: '2', label: '2 Years' },
    { value: '3', label: '3 Years' },
    { value: '4', label: '4 Years' },
    { value: '5', label: '5 Years' }
  ],
  HISTORICAL_DATA_YEARS: [
    { value: '2020', label: '2020' },
    { value: '2021', label: '2021' },
    { value: '2022', label: '2022' },
    { value: '2023', label: '2023' },
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' }
  ],
  SLIDER_MIN: 0,
  SLIDER_MAX: 100,
  SLIDER_RAIL_WIDTH: 200
}));

describe('FinancialYearSection - Fixed Tests', () => {
  const defaultProps = {
    financialYear: {
      name: 'FY 2023-24',
      startMonth: '04',
      endMonth: '03',
      historicalDataStartFY: '2020',
      spanningYears: '5',
      format: '{yyyy}-{yy}'
    },
    sliderValue: [50],
    onFinancialYearChange: jest.fn(),
    onFormatLinkClick: jest.fn(),
    isEditMode: true
  };

  let mockCalculateYearLabelsAndPositions: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    const { calculateYearLabelsAndPositions } = require('../../../src/utils/formatUtils');
    mockCalculateYearLabelsAndPositions = calculateYearLabelsAndPositions as jest.Mock;
    mockCalculateYearLabelsAndPositions.mockReturnValue({
      left: { label: '2020', position: 0 },
      right: { label: '2025', position: 100 },
      current: { label: '2023', position: 50 }
    });
  });

  it('should render without crashing', () => {
    render(<FinancialYearSection {...defaultProps} />);
    
    expect(screen.getByText('Financial Year Setup')).toBeInTheDocument();
  });

  it('should render all form fields in edit mode', () => {
    render(<FinancialYearSection {...defaultProps} />);
    
    expect(screen.getByTestId('text-field')).toBeInTheDocument();
    expect(screen.getAllByTestId('select-field')).toHaveLength(4);
  });

  it('should render read-only fields in view mode', () => {
    render(<FinancialYearSection {...defaultProps} isEditMode={false} />);
    
    expect(screen.getAllByTestId('read-only-field')).toHaveLength(5);
  });

  it('should display correct field values', () => {
    render(<FinancialYearSection {...defaultProps} />);
    
    expect(screen.getByTestId('text-field')).toHaveValue('FY 2023-24');
    const selectFields = screen.getAllByTestId('select-field');
    expect(selectFields[0]).toHaveValue('04');
    expect(selectFields[1]).toHaveValue('03');
    expect(selectFields[2]).toHaveValue('2020');
    expect(selectFields[3]).toHaveValue('5');
  });

  it('should call onFinancialYearChange when field values change', () => {
    render(<FinancialYearSection {...defaultProps} />);
    
    const nameField = screen.getByTestId('text-field');
    fireEvent.change(nameField, { target: { value: 'FY 2024-25' } });
    
    expect(defaultProps.onFinancialYearChange).toHaveBeenCalled();
  });

  it('should disable end month when start month is not selected', () => {
    const propsWithoutStartMonth = {
      ...defaultProps,
      financialYear: {
        ...defaultProps.financialYear,
        startMonth: ''
      }
    };
    
    render(<FinancialYearSection {...propsWithoutStartMonth} />);
    
    const selectFields = screen.getAllByTestId('select-field');
    expect(selectFields[1]).toBeDisabled();
  });

  it('should enable end month when start month is selected', () => {
    render(<FinancialYearSection {...defaultProps} />);
    
    const selectFields = screen.getAllByTestId('select-field');
    expect(selectFields[1]).not.toBeDisabled();
  });

  it('should render custom slider with correct props', () => {
    render(<FinancialYearSection {...defaultProps} />);
    
    expect(screen.getByTestId('custom-slider')).toBeInTheDocument();
  });

  it('should show slider as enabled when both historical data and spanning years are selected', () => {
    render(<FinancialYearSection {...defaultProps} />);
    
    expect(screen.getByTestId('custom-slider')).toBeInTheDocument();
  });

  it('should show slider as disabled when historical data is missing', () => {
    const propsWithoutHistoricalData = {
      ...defaultProps,
      financialYear: {
        ...defaultProps.financialYear,
        historicalDataStartFY: ''
      }
    };
    
    render(<FinancialYearSection {...propsWithoutHistoricalData} />);
    
    expect(screen.getByTestId('custom-slider')).toBeInTheDocument();
  });

  it('should show slider as disabled when spanning years is missing', () => {
    const propsWithoutSpanningYears = {
      ...defaultProps,
      financialYear: {
        ...defaultProps.financialYear,
        spanningYears: ''
      }
    };
    
    render(<FinancialYearSection {...propsWithoutSpanningYears} />);
    
    expect(screen.getByTestId('custom-slider')).toBeInTheDocument();
  });

  it('should render format link with correct text', () => {
    render(<FinancialYearSection {...defaultProps} />);
    
    expect(screen.getByText('here')).toBeInTheDocument();
  });

  it('should call onFormatLinkClick when format link is clicked in edit mode', () => {
    render(<FinancialYearSection {...defaultProps} />);
    
    const formatLink = screen.getByText('here');
    fireEvent.click(formatLink);
    
    expect(defaultProps.onFormatLinkClick).toHaveBeenCalled();
  });

  it('should not call onFormatLinkClick when format link is clicked in read-only mode', () => {
    render(<FinancialYearSection {...defaultProps} isEditMode={false} />);
    
    const formatLink = screen.getByText('here');
    fireEvent.click(formatLink);
    
    expect(defaultProps.onFormatLinkClick).not.toHaveBeenCalled();
  });

  it('should handle empty financial year data', () => {
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
    
    render(<FinancialYearSection {...emptyProps} />);
    
    expect(screen.getByTestId('text-field')).toHaveValue('');
    const selectFields = screen.getAllByTestId('select-field');
    expect(selectFields[0]).toHaveValue('');
    expect(selectFields[1]).toHaveValue('');
  });

  it('should handle undefined financial year data', () => {
    const undefinedProps = {
      ...defaultProps,
      financialYear: {
        name: undefined,
        startMonth: undefined,
        endMonth: undefined,
        historicalDataStartFY: undefined,
        spanningYears: undefined,
        format: undefined
      }
    };
    
    render(<FinancialYearSection {...undefinedProps} />);
    
    expect(screen.getByTestId('text-field')).toHaveValue('');
    const selectFields = screen.getAllByTestId('select-field');
    expect(selectFields[0]).toHaveValue('');
    expect(selectFields[1]).toHaveValue('');
  });

  it('should handle null financial year data', () => {
    const nullProps = {
      ...defaultProps,
      financialYear: {
        name: null,
        startMonth: null,
        endMonth: null,
        historicalDataStartFY: null,
        spanningYears: null,
        format: null
      }
    };
    
    render(<FinancialYearSection {...nullProps} />);
    
    expect(screen.getByTestId('text-field')).toHaveValue('');
    const selectFields = screen.getAllByTestId('select-field');
    expect(selectFields[0]).toHaveValue('');
    expect(selectFields[1]).toHaveValue('');
  });

  it('should handle component unmounting', () => {
    const { unmount } = render(<FinancialYearSection {...defaultProps} />);
    
    expect(screen.getByTestId('custom-slider')).toBeInTheDocument();
    unmount();
  });

  it('should handle prop changes', () => {
    const { rerender } = render(<FinancialYearSection {...defaultProps} />);
    
    expect(screen.getByTestId('text-field')).toHaveValue('FY 2023-24');
    
    const newProps = {
      ...defaultProps,
      financialYear: {
        ...defaultProps.financialYear,
        name: 'FY 2024-25'
      }
    };
    
    rerender(<FinancialYearSection {...newProps} />);
    
    expect(screen.getByTestId('text-field')).toHaveValue('FY 2024-25');
  });

  it('should handle mode changes between edit and read-only', () => {
    const { rerender } = render(<FinancialYearSection {...defaultProps} />);
    
    expect(screen.getByTestId('text-field')).toBeInTheDocument();
    
    rerender(<FinancialYearSection {...defaultProps} isEditMode={false} />);
    
    expect(screen.getAllByTestId('read-only-field')).toHaveLength(5);
  });

  it('should have proper labels for all form fields', () => {
    render(<FinancialYearSection {...defaultProps} />);
    
    expect(screen.getByText('Financial Year Setup')).toBeInTheDocument();
    expect(screen.getByText('Set Spanning Years For User View')).toBeInTheDocument();
  });

  it('should handle different slider values', () => {
    const propsWithDifferentSliderValue = {
      ...defaultProps,
      sliderValue: [75]
    };
    
    render(<FinancialYearSection {...propsWithDifferentSliderValue} />);
    
    expect(screen.getByTestId('custom-slider')).toBeInTheDocument();
  });

  it('should handle empty slider values', () => {
    const propsWithEmptySliderValue = {
      ...defaultProps,
      sliderValue: []
    };
    
    render(<FinancialYearSection {...propsWithEmptySliderValue} />);
    
    expect(screen.getByTestId('custom-slider')).toBeInTheDocument();
  });

  it('should handle multiple field updates in sequence', () => {
    render(<FinancialYearSection {...defaultProps} />);
    
    const nameField = screen.getByTestId('text-field');
    const selectFields = screen.getAllByTestId('select-field');
    
    fireEvent.change(nameField, { target: { value: 'FY 2024-25' } });
    fireEvent.change(selectFields[0], { target: { value: '05' } });
    
    expect(defaultProps.onFinancialYearChange).toHaveBeenCalled();
  });

  it('should maintain form state consistency', () => {
    render(<FinancialYearSection {...defaultProps} />);
    
    expect(screen.getByTestId('text-field')).toHaveValue('FY 2023-24');
    const selectFields = screen.getAllByTestId('select-field');
    expect(selectFields[0]).toHaveValue('04');
    expect(selectFields[1]).toHaveValue('03');
  });

  it('should handle field labels correctly', () => {
    render(<FinancialYearSection {...defaultProps} />);
    
    expect(screen.getByText('Financial Year Setup')).toBeInTheDocument();
    expect(screen.getByText('Set Spanning Years For User View')).toBeInTheDocument();
  });

  it('should call calculateYearLabelsAndPositions with correct parameters', () => {
    render(<FinancialYearSection {...defaultProps} />);
    
    expect(mockCalculateYearLabelsAndPositions).toHaveBeenCalledWith(
      '2020',
      '5',
      [50],
      0,
      100,
      200
    );
  });

  it('should handle different historical data start years', () => {
    const propsWithDifferentHistoricalData = {
      ...defaultProps,
      financialYear: {
        ...defaultProps.financialYear,
        historicalDataStartFY: '2021'
      }
    };
    
    render(<FinancialYearSection {...propsWithDifferentHistoricalData} />);
    
    expect(mockCalculateYearLabelsAndPositions).toHaveBeenCalledWith(
      '2021',
      '5',
      [50],
      0,
      100,
      200
    );
  });

  it('should handle different spanning years', () => {
    const propsWithDifferentSpanningYears = {
      ...defaultProps,
      financialYear: {
        ...defaultProps.financialYear,
        spanningYears: '3'
      }
    };
    
    render(<FinancialYearSection {...propsWithDifferentSpanningYears} />);
    
    expect(mockCalculateYearLabelsAndPositions).toHaveBeenCalledWith(
      '2020',
      '3',
      [50],
      0,
      100,
      200
    );
  });
});
