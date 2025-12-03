import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FinancialYearSection from '../../../src/components/entityConfiguration/FinancialYearSection';

// Mock the lazy-loaded components
jest.mock('commonApp/TextField', () => {
  return jest.fn(({ label, value, onChange, disabled, onClick, ...props }) => (
    <div data-testid={`textfield-${label?.toLowerCase().replace(/\s/g, '-')}`}>
      <label>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        onClick={onClick}
        {...props}
      />
    </div>
  ));
});

jest.mock('commonApp/SelectField', () => {
  return jest.fn(({ label, value, onChange, options, disabled, ...props }) => (
    <div data-testid={`selectfield-${label?.toLowerCase().replace(/\s/g, '-')}`}>
      <label>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        {...props}
      >
        {options?.map((option: string) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  ));
});

jest.mock('commonApp/CustomSlider', () => {
  return jest.fn(({ value, leftLabel, rightLabel, ...props }) => (
    <div data-testid="custom-slider" {...props}>
      <div data-testid="slider-left-label">{leftLabel}</div>
      <div data-testid="slider-right-label">{rightLabel}</div>
      <div data-testid="slider-value">{value?.join('-') || ''}</div>
    </div>
  ));
});

jest.mock('../../../src/components/common/FinancialYearFormatPanel/FinancialYearFormatPanel', () => {
  return jest.fn(({ isOpen, onClose, onSave, currentFormat }) => (
    isOpen ? (
      <div data-testid="format-panel">
        <div>Format Panel</div>
        <div>Current Format: {currentFormat}</div>
        <button onClick={() => onSave('FY-{yy}-{yy}')}>Save Format</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
  ));
});

// Mock the format utils
jest.mock('commonApp/formatUtils', () => ({
  calculateYearLabelsAndPositions: jest.fn(() => ({
    left: { label: '2023', position: 0 },
    right: { label: '2024', position: 100 }
  })),
  calculateFinancialYearYears: jest.fn(() => ({
    financialYearStart: 2023,
    financialYearEnd: 2024
  })),
  generateFinancialYearName: jest.fn((format, start, end) => `FY ${start}-${end}`)
}));

// Mock constants
jest.mock('../../../src/constants/periodSetupConstants', () => ({
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SPANNING_YEARS_OPTIONS: ['1', '2', '3', '4', '5'],
  HISTORICAL_DATA_YEARS: ['2020', '2021', '2022', '2023', '2024'],
  SLIDER_MIN: 2020,
  SLIDER_MAX: 2030,
  SLIDER_RAIL_WIDTH: 400
}));

describe('FinancialYearSection', () => {
  const defaultProps = {
    financialYear: {
      name: 'FY 2023-24',
      startMonth: 'April',
      endMonth: 'March',
      historicalDataStartFY: '2020',
      spanningYears: '2',
      format: 'FY-{yy}-{yy}'
    },
    sliderValue: [2023, 2024],
    onFinancialYearChange: jest.fn(),
    isEditMode: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the component with all sections', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      expect(screen.getByText('Financial Year Setup')).toBeInTheDocument();
      expect(screen.getByText('Financial Year Name Format')).toBeInTheDocument();
      expect(screen.getByText('Set Spanning Years For User View')).toBeInTheDocument();
    });

    it('should render all form fields', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      expect(screen.getByTestId('textfield-financial-year-name')).toBeInTheDocument();
      expect(screen.getByTestId('selectfield-start-month')).toBeInTheDocument();
      expect(screen.getByTestId('selectfield-end-month')).toBeInTheDocument();
      expect(screen.getByTestId('selectfield-historical-data-start-fy')).toBeInTheDocument();
      expect(screen.getByTestId('selectfield-select-fy-spanning-years-for-users')).toBeInTheDocument();
    });

    it('should render custom slider', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      expect(screen.getByTestId('custom-slider')).toBeInTheDocument();
      expect(screen.getByTestId('slider-left-label')).toHaveTextContent('2023');
      expect(screen.getByTestId('slider-right-label')).toHaveTextContent('2024');
    });
  });

  describe('Field Values and Interactions', () => {
    it('should display correct field values', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      const nameField = screen.getByTestId('textfield-financial-year-name').querySelector('input');
      const startMonthField = screen.getByTestId('selectfield-start-month').querySelector('select');
      const endMonthField = screen.getByTestId('selectfield-end-month').querySelector('select');
      
      expect(nameField).toHaveValue('FY 2023-24');
      expect(startMonthField).toHaveValue('April');
      expect(endMonthField).toHaveValue('March');
    });

    it('should call onFinancialYearChange when start month changes', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      const startMonthField = screen.getByTestId('selectfield-start-month').querySelector('select');
      fireEvent.change(startMonthField!, { target: { value: 'May' } });
      
      expect(defaultProps.onFinancialYearChange).toHaveBeenCalledWith('startMonth', 'May');
    });

    it('should call onFinancialYearChange when end month changes', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      const endMonthField = screen.getByTestId('selectfield-end-month').querySelector('select');
      fireEvent.change(endMonthField!, { target: { value: 'June' } });
      
      expect(defaultProps.onFinancialYearChange).toHaveBeenCalledWith('endMonth', 'June');
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
      
      const endMonthField = screen.getByTestId('selectfield-end-month').querySelector('select');
      expect(endMonthField).toBeDisabled();
    });

    it('should enable end month when start month is selected', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      const endMonthField = screen.getByTestId('selectfield-end-month').querySelector('select');
      expect(endMonthField).not.toBeDisabled();
    });

    it('should disable fields when not in edit mode', () => {
      render(<FinancialYearSection {...defaultProps} isEditMode={false} />);
      
      const startMonthField = screen.getByTestId('selectfield-start-month').querySelector('select');
      const endMonthField = screen.getByTestId('selectfield-end-month').querySelector('select');
      const historicalField = screen.getByTestId('selectfield-historical-data-start-fy').querySelector('select');
      const spanningField = screen.getByTestId('selectfield-select-fy-spanning-years-for-users').querySelector('select');
      
      expect(startMonthField).toBeDisabled();
      expect(endMonthField).toBeDisabled();
      expect(historicalField).toBeDisabled();
      expect(spanningField).toBeDisabled();
    });
  });

  describe('Auto-generation Logic', () => {
    it('should auto-set end month when start month changes', async () => {
      const { rerender } = render(<FinancialYearSection {...defaultProps} />);
      
      // Change start month to January
      const startMonthField = screen.getByTestId('selectfield-start-month').querySelector('select');
      fireEvent.change(startMonthField!, { target: { value: 'January' } });
      
      await waitFor(() => {
        expect(defaultProps.onFinancialYearChange).toHaveBeenCalledWith('endMonth', 'December');
      });
    });

    it('should auto-generate financial year name when all required fields are set', async () => {
      const { rerender } = render(<FinancialYearSection {...defaultProps} />);
      
      // Change format to trigger name generation
      const newProps = {
        ...defaultProps,
        financialYear: {
          ...defaultProps.financialYear,
          format: 'FY-{yy}'
        }
      };
      
      rerender(<FinancialYearSection {...newProps} />);
      
      await waitFor(() => {
        expect(defaultProps.onFinancialYearChange).toHaveBeenCalledWith('name', expect.any(String));
      });
    });
  });

  describe('Format Panel', () => {
    it('should open format panel when format link is clicked in edit mode', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      const formatLink = screen.getByText('here');
      fireEvent.click(formatLink);
      
      expect(screen.getByTestId('format-panel')).toBeInTheDocument();
    });

    it('should not open format panel when format link is clicked in read-only mode', () => {
      render(<FinancialYearSection {...defaultProps} isEditMode={false} />);
      
      const formatLink = screen.getByText('here');
      fireEvent.click(formatLink);
      
      expect(screen.queryByTestId('format-panel')).not.toBeInTheDocument();
    });

    it('should close format panel when close button is clicked', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      const formatLink = screen.getByText('here');
      fireEvent.click(formatLink);
      
      expect(screen.getByTestId('format-panel')).toBeInTheDocument();
      
      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);
      
      expect(screen.queryByTestId('format-panel')).not.toBeInTheDocument();
    });

    it('should save format when save button is clicked', async () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      const formatLink = screen.getByText('here');
      fireEvent.click(formatLink);
      
      const saveButton = screen.getByText('Save Format');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(defaultProps.onFinancialYearChange).toHaveBeenCalledWith('format', 'FY-{yy}-{yy}');
      });
    });
  });

  describe('Slider Functionality', () => {
    it('should render slider with correct props when data is available', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      expect(screen.getByTestId('custom-slider')).toBeInTheDocument();
      expect(screen.getByTestId('slider-value')).toHaveTextContent('2023-2024');
    });

    it('should render slider with empty value when data is not available', () => {
      const propsWithoutData = {
        ...defaultProps,
        financialYear: {
          ...defaultProps.financialYear,
          historicalDataStartFY: '',
          spanningYears: ''
        },
        sliderValue: []
      };
      
      render(<FinancialYearSection {...propsWithoutData} />);
      
      expect(screen.getByTestId('slider-value')).toHaveTextContent('');
    });
  });

  describe('Edge Cases', () => {
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
      
      const nameField = screen.getByTestId('textfield-financial-year-name').querySelector('input');
      expect(nameField).toHaveValue('Auto generated');
    });

    it('should handle missing financial year data', () => {
      const propsWithMissingData = {
        ...defaultProps,
        financialYear: {
          ...defaultProps.financialYear,
          startMonth: undefined,
          endMonth: undefined
        }
      };
      
      render(<FinancialYearSection {...propsWithMissingData} />);
      
      const endMonthField = screen.getByTestId('selectfield-end-month').querySelector('select');
      expect(endMonthField).toBeDisabled();
    });

    it('should prevent default on financial year name field click', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      const nameField = screen.getByTestId('textfield-financial-year-name').querySelector('input');
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');
      
      fireEvent.click(nameField!, clickEvent);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle component unmounting', () => {
      const { unmount } = render(<FinancialYearSection {...defaultProps} />);
      
      expect(screen.getByText('Financial Year Setup')).toBeInTheDocument();
      
      unmount();
      
      expect(screen.queryByText('Financial Year Setup')).not.toBeInTheDocument();
    });

    it('should handle prop changes', () => {
      const { rerender } = render(<FinancialYearSection {...defaultProps} />);
      
      const nameField = screen.getByTestId('textfield-financial-year-name').querySelector('input');
      expect(nameField).toHaveValue('FY 2023-24');
      
      const newProps = {
        ...defaultProps,
        financialYear: {
          ...defaultProps.financialYear,
          name: 'FY 2024-25'
        }
      };
      
      rerender(<FinancialYearSection {...newProps} />);
      
      expect(nameField).toHaveValue('FY 2024-25');
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all form fields', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      expect(screen.getByText('Financial Year Name')).toBeInTheDocument();
      expect(screen.getByText('Start Month')).toBeInTheDocument();
      expect(screen.getByText('End Month')).toBeInTheDocument();
      expect(screen.getByText('Historical Data Start FY')).toBeInTheDocument();
      expect(screen.getByText('Select FY Spanning Years For Users')).toBeInTheDocument();
    });

    it('should have proper required attributes', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      const startMonthField = screen.getByTestId('selectfield-start-month').querySelector('select');
      const endMonthField = screen.getByTestId('selectfield-end-month').querySelector('select');
      const historicalField = screen.getByTestId('selectfield-historical-data-start-fy').querySelector('select');
      const spanningField = screen.getByTestId('selectfield-select-fy-spanning-years-for-users').querySelector('select');
      
      expect(startMonthField).toHaveAttribute('required');
      expect(endMonthField).toHaveAttribute('required');
      expect(historicalField).toHaveAttribute('required');
      expect(spanningField).toHaveAttribute('required');
    });

    it('should have proper disabled attributes', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      const nameField = screen.getByTestId('textfield-financial-year-name').querySelector('input');
      expect(nameField).toBeDisabled();
    });
  });
});
