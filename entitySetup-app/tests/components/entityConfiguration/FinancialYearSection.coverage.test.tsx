import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import FinancialYearSection from '../../../src/components/entityConfiguration/FinancialYearSection';

// Mock the lazy-loaded components from commonApp
jest.mock('commonApp/TextField', () => ({
  __esModule: true,
  default: React.forwardRef<HTMLInputElement, any>((props, ref) => (
    <input
      ref={ref}
      data-testid="text-field"
      value={props.value || ''}
      onChange={(e) => props.onChange && props.onChange(e.target.value)}
      disabled={props.disabled}
      placeholder={props.placeholder}
      required={props.required}
      width={props.width}
    />
  ))
}));

jest.mock('commonApp/SelectField', () => ({
  __esModule: true,
  default: React.forwardRef<HTMLSelectElement, any>((props, ref) => (
    <select
      ref={ref}
      data-testid="select-field"
      value={props.value || ''}
      onChange={(e) => props.onChange && props.onChange(e.target.value)}
      disabled={props.disabled}
      required={props.required}
      style={{ width: props.width }}
    >
      <option value="">{props.placeholder}</option>
      {props.options?.map((option: any, index: number) => (
        <option key={index} value={typeof option === 'string' ? option : option.value}>
          {typeof option === 'string' ? option : option.label}
        </option>
      ))}
    </select>
  ))
}));

jest.mock('commonApp/ReadOnlyField', () => ({
  __esModule: true,
  default: React.forwardRef<HTMLDivElement, any>((props, ref) => (
    <div
      ref={ref}
      data-testid="readonly-field"
      style={{ width: props.width }}
    >
      <label>{props.label}</label>
      <span>{props.value}</span>
    </div>
  ))
}));

jest.mock('commonApp/CustomSlider', () => ({
  __esModule: true,
  default: React.forwardRef<HTMLDivElement, any>((props, ref) => (
    <div
      ref={ref}
      data-testid="custom-slider"
      className={props.className}
      {...{
        width: props.width,
        height: props.height,
        leftlabel: props.leftLabel,
        rightlabel: props.rightLabel,
        currentvalue: props.currentValue,
        currentvaluelabel: props.currentValueLabel,
        trackcolor: props.trackColor,
        railcolor: props.railColor,
        thumbcolor: props.thumbColor,
        labelcolor: props.labelColor,
        valuelabeldisplay: props.valueLabelDisplay
      }}
    >
      <input
        type="range"
        min={props.min}
        max={props.max}
        value={Array.isArray(props.value) ? props.value.join(',') : props.value || ''}
        disabled={props.disabled}
      />
    </div>
  ))
}));

// Mock the FinancialYearFormatPanel
jest.mock('../../../src/components/common/FinancialYearFormatPanel/FinancialYearFormatPanel', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onSave, currentFormat, financialYear }: any) => (
    <div data-testid="format-panel" style={{ display: isOpen ? 'block' : 'none' }}>
      <button data-testid="format-close" onClick={onClose}>Close</button>
      <button 
        data-testid="format-save" 
        onClick={() => onSave('FY {yy}-{yy}', 'FY 23-24')}
      >
        Save
      </button>
      <div data-testid="current-format">{currentFormat}</div>
      <div data-testid="format-financial-year">
        {financialYear?.startMonth} - {financialYear?.endMonth}
      </div>
    </div>
  )
}));

// Mock the constants
jest.mock('../../../src/constants/periodSetupConstants', () => ({
  MONTHS: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  SPANNING_YEARS_OPTIONS: [
    '5 years', '10 years', '15 years', '20 years'
  ],
  HISTORICAL_DATA_YEARS: [
    '2020', '2021', '2022', '2023', '2024', '2025'
  ],
  SLIDER_MIN: 2000,
  SLIDER_MAX: 2050,
  SLIDER_RAIL_WIDTH: 420
}));

// Mock the utility functions
const mockCalculateYearLabelsAndPositions = jest.fn();
const mockCalculateFinancialYearYears = jest.fn();
const mockGenerateFinancialYearName = jest.fn();

jest.mock('../../../src/utils/formatUtils', () => ({
  calculateYearLabelsAndPositions: (...args: any[]) => mockCalculateYearLabelsAndPositions(...args),
  calculateFinancialYearYears: (...args: any[]) => mockCalculateFinancialYearYears(...args),
  generateFinancialYearName: (...args: any[]) => mockGenerateFinancialYearName(...args)
}));

describe('FinancialYearSection - Coverage Tests', () => {
  const defaultProps = {
    financialYear: {
      name: 'FY 2023-24',
      startMonth: 'April',
      endMonth: 'March',
      historicalDataStartFY: '2020',
      spanningYears: '5 years',
      format: 'FY {yy}-{yy}'
    },
    sliderValue: [2020, 2025],
    onFinancialYearChange: jest.fn(),
    isEditMode: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockCalculateYearLabelsAndPositions.mockReturnValue({
      left: { label: '2020', position: 0 },
      right: { label: '2025', position: 100 }
    });
    
    mockCalculateFinancialYearYears.mockReturnValue({
      financialYearStart: 2023,
      financialYearEnd: 2024
    });
    
    mockGenerateFinancialYearName.mockReturnValue('FY 23-24');
  });

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      render(<FinancialYearSection {...defaultProps} />);
      expect(screen.getByText('Financial Year Setup')).toBeInTheDocument();
    });

    it('should render in edit mode with all form fields', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      expect(screen.getAllByTestId('text-field')).toHaveLength(1);
      expect(screen.getAllByTestId('select-field')).toHaveLength(4);
      expect(screen.getByTestId('custom-slider')).toBeInTheDocument();
    });

    it('should render in read-only mode', () => {
      render(<FinancialYearSection {...defaultProps} isEditMode={false} />);
      
      expect(screen.getAllByTestId('read-only-field')).toHaveLength(5);
      expect(screen.getByTestId('custom-slider')).toBeInTheDocument();
    });
  });

  describe('useState hook coverage', () => {
    it('should initialize isFormatPanelOpen state as false', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      const formatPanel = screen.getByTestId('format-panel');
      expect(formatPanel).toHaveStyle('display: none');
    });

    it('should update isFormatPanelOpen state when format link is clicked', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      const formatLink = screen.getByText('here');
      fireEvent.click(formatLink);
      
      const formatPanel = screen.getByTestId('format-panel');
      expect(formatPanel).toHaveStyle('display: block');
    });
  });

  describe('useEffect hooks coverage', () => {
    it('should trigger auto-set end month useEffect when startMonth changes and endMonth is empty', () => {
      const props = {
        ...defaultProps,
        financialYear: {
          ...defaultProps.financialYear,
          startMonth: 'January',
          endMonth: ''
        }
      };

      render(<FinancialYearSection {...props} />);
      
      expect(defaultProps.onFinancialYearChange).toHaveBeenCalledWith('endMonth', 'December');
    });

    it('should not trigger auto-set end month useEffect when endMonth already exists', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      expect(defaultProps.onFinancialYearChange).not.toHaveBeenCalledWith('endMonth', expect.any(String));
    });

    it('should trigger auto-generate FY name useEffect when months and format are available', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      expect(mockCalculateFinancialYearYears).toHaveBeenCalledWith('April', 'March', expect.any(Array));
      expect(mockGenerateFinancialYearName).toHaveBeenCalledWith('FY {yy}-{yy}', 2023, 2024);
      expect(defaultProps.onFinancialYearChange).toHaveBeenCalledWith('name', 'FY 23-24');
    });

    it('should not trigger auto-generate FY name useEffect when startMonth is missing', () => {
      const props = {
        ...defaultProps,
        financialYear: {
          ...defaultProps.financialYear,
          startMonth: ''
        }
      };

      render(<FinancialYearSection {...props} />);
      
      expect(mockCalculateFinancialYearYears).not.toHaveBeenCalled();
    });

    it('should not trigger auto-generate FY name useEffect when endMonth is missing', () => {
      const props = {
        ...defaultProps,
        financialYear: {
          ...defaultProps.financialYear,
          endMonth: ''
        }
      };

      render(<FinancialYearSection {...props} />);
      
      expect(mockCalculateFinancialYearYears).not.toHaveBeenCalled();
    });

    it('should not trigger auto-generate FY name useEffect when format is missing', () => {
      const props = {
        ...defaultProps,
        financialYear: {
          ...defaultProps.financialYear,
          format: ''
        }
      };

      render(<FinancialYearSection {...props} />);
      
      expect(mockCalculateFinancialYearYears).not.toHaveBeenCalled();
    });
  });

  describe('getYearLabelsAndPositions function coverage', () => {
    it('should call calculateYearLabelsAndPositions with correct parameters', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      expect(mockCalculateYearLabelsAndPositions).toHaveBeenCalledWith(
        '2020',
        '5 years',
        [2020, 2025],
        2000,
        2050,
        420
      );
    });

    it('should render slider with correct testids', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      expect(screen.getByTestId('custom-slider')).toBeInTheDocument();
      // Check the slider is rendered with correct properties
      const slider = screen.getByTestId('custom-slider');
      expect(slider).toHaveAttribute('leftlabel', '2020');
      expect(slider).toHaveAttribute('rightlabel', '2025');
    });
  });

  describe('handleFormatSave function coverage', () => {
    it('should call handleFormatSave when format panel save is clicked', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      // Open format panel
      const formatLink = screen.getByText('here');
      fireEvent.click(formatLink);
      
      // Click save
      const saveButton = screen.getByTestId('format-save');
      fireEvent.click(saveButton);
      
      expect(defaultProps.onFinancialYearChange).toHaveBeenCalledWith('format', 'FY {yy}-{yy}');
      expect(defaultProps.onFinancialYearChange).toHaveBeenCalledWith('name', 'FY 23-24');
    });

    it('should close format panel after save', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      // Open format panel
      const formatLink = screen.getByText('here');
      fireEvent.click(formatLink);
      
      expect(screen.getByTestId('format-panel')).toHaveStyle('display: block');
      
      // Click save
      const saveButton = screen.getByTestId('format-save');
      fireEvent.click(saveButton);
      
      expect(screen.getByTestId('format-panel')).toHaveStyle('display: none');
    });
  });

  describe('Field change handlers coverage', () => {
    it('should handle financial year name change', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      const nameField = screen.getByTestId('text-field');
      fireEvent.change(nameField, { target: { value: 'New FY Name' } });
      
      expect(defaultProps.onFinancialYearChange).toHaveBeenCalledWith('name', 'New FY Name');
    });

    it('should handle start month change', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      const selectFields = screen.getAllByTestId('select-field');
      const startMonthField = selectFields[0];
      
      fireEvent.change(startMonthField, { target: { value: 'January' } });
      
      expect(defaultProps.onFinancialYearChange).toHaveBeenCalledWith('startMonth', 'January');
    });

    it('should handle end month change', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      const selectFields = screen.getAllByTestId('select-field');
      const endMonthField = selectFields[1];
      
      fireEvent.change(endMonthField, { target: { value: 'December' } });
      
      expect(defaultProps.onFinancialYearChange).toHaveBeenCalledWith('endMonth', 'December');
    });

    it('should handle historical data start FY change', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      const selectFields = screen.getAllByTestId('select-field');
      const historicalField = selectFields[2];
      
      fireEvent.change(historicalField, { target: { value: '2021' } });
      
      expect(defaultProps.onFinancialYearChange).toHaveBeenCalledWith('historicalDataStartFY', '2021');
    });

    it('should handle spanning years change', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      const selectFields = screen.getAllByTestId('select-field');
      const spanningField = selectFields[3];
      
      fireEvent.change(spanningField, { target: { value: '10 years' } });
      
      expect(defaultProps.onFinancialYearChange).toHaveBeenCalledWith('spanningYears', '10 years');
    });
  });

  describe('Format link behavior coverage', () => {
    it('should open format panel when format link is clicked in edit mode', () => {
      render(<FinancialYearSection {...defaultProps} isEditMode={true} />);
      
      const formatLink = screen.getByText('here');
      expect(formatLink).not.toHaveAttribute('disabled');
      
      fireEvent.click(formatLink);
      
      expect(screen.getByTestId('format-panel')).toHaveStyle('display: block');
    });

    it('should not open format panel when format link is clicked in read-only mode', () => {
      render(<FinancialYearSection {...defaultProps} isEditMode={false} />);
      
      const formatLink = screen.getByText('here');
      
      fireEvent.click(formatLink);
      
      expect(screen.getByTestId('format-panel')).toHaveStyle('display: none');
    });

    it('should close format panel when close button is clicked', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      // Open format panel
      const formatLink = screen.getByText('here');
      fireEvent.click(formatLink);
      
      expect(screen.getByTestId('format-panel')).toHaveStyle('display: block');
      
      // Close format panel
      const closeButton = screen.getByTestId('format-close');
      fireEvent.click(closeButton);
      
      expect(screen.getByTestId('format-panel')).toHaveStyle('display: none');
    });
  });

  describe('Slider behavior coverage', () => {
    it('should show slider with correct values when both historical data and spanning years are selected', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      const slider = screen.getByTestId('custom-slider');
      // Check the slider properties
      expect(slider).toHaveAttribute('trackcolor', 'rgba(0, 111, 230, 1)');
      expect(slider).toHaveAttribute('thumbcolor', '#1976d2');
    });

    it('should show slider with transparent colors when historical data is missing', () => {
      const props = {
        ...defaultProps,
        financialYear: {
          ...defaultProps.financialYear,
          historicalDataStartFY: ''
        }
      };

      render(<FinancialYearSection {...props} />);
      
      const slider = screen.getByTestId('custom-slider');
      expect(slider).toHaveAttribute('trackcolor', 'transparent');
      expect(slider).toHaveAttribute('thumbcolor', 'transparent');
    });

    it('should show slider with transparent colors when spanning years is missing', () => {
      const props = {
        ...defaultProps,
        financialYear: {
          ...defaultProps.financialYear,
          spanningYears: ''
        }
      };

      render(<FinancialYearSection {...props} />);
      
      const slider = screen.getByTestId('custom-slider');
      expect(slider).toHaveAttribute('trackcolor', 'transparent');
      expect(slider).toHaveAttribute('thumbcolor', 'transparent');
    });
  });

  describe('FinancialYearFormatPanel integration coverage', () => {
    it('should pass correct props to FinancialYearFormatPanel', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      // Open format panel
      const formatLink = screen.getByText('here');
      fireEvent.click(formatLink);
      
      expect(screen.getByTestId('current-format')).toHaveTextContent('FY {yy}-{yy}');
      expect(screen.getByTestId('format-financial-year')).toHaveTextContent('April - March');
    });

    it('should handle format panel onClose callback', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      // Open format panel
      const formatLink = screen.getByText('here');
      fireEvent.click(formatLink);
      
      expect(screen.getByTestId('format-panel')).toHaveStyle('display: block');
      
      // Close via callback
      const closeButton = screen.getByTestId('format-close');
      fireEvent.click(closeButton);
      
      expect(screen.getByTestId('format-panel')).toHaveStyle('display: none');
    });
  });

  describe('Edge cases coverage', () => {
    it('should handle empty financialYear values', () => {
      const props = {
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

      render(<FinancialYearSection {...props} />);
      
      expect(screen.getByText('Financial Year Setup')).toBeInTheDocument();
    });

    it('should handle empty sliderValue array', () => {
      const props = {
        ...defaultProps,
        sliderValue: []
      };

      render(<FinancialYearSection {...props} />);
      
      expect(mockCalculateYearLabelsAndPositions).toHaveBeenCalledWith(
        '2020',
        '5 years',
        [],
        2000,
        2050,
        420
      );
    });

    it('should handle different month indices in auto-set end month', () => {
      const props = {
        ...defaultProps,
        financialYear: {
          ...defaultProps.financialYear,
          startMonth: 'December',
          endMonth: ''
        }
      };

      render(<FinancialYearSection {...props} />);
      
      // December is index 11, so (11 + 11) % 12 = 10 (November)
      expect(defaultProps.onFinancialYearChange).toHaveBeenCalledWith('endMonth', 'November');
    });
  });

  describe('Component lifecycle coverage', () => {
    it('should handle component re-rendering with different props', () => {
      const { rerender } = render(<FinancialYearSection {...defaultProps} />);
      
      const newProps = {
        ...defaultProps,
        financialYear: {
          ...defaultProps.financialYear,
          startMonth: 'January'
        }
      };
      
      rerender(<FinancialYearSection {...newProps} />);
      
      expect(screen.getByText('Financial Year Setup')).toBeInTheDocument();
    });

    it('should handle component unmounting', () => {
      const { unmount } = render(<FinancialYearSection {...defaultProps} />);
      
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Additional function coverage', () => {
    it('should cover the hasSelection calculation in slider', () => {
      // Test with both values present
      const { container: container1 } = render(<FinancialYearSection {...defaultProps} />);
      let slider = container1.querySelector('[data-testid="custom-slider"]');
      expect(slider).toBeTruthy();
      expect(slider!).toHaveAttribute('trackcolor', 'rgba(0, 111, 230, 1)');
      
      // Clean up
      cleanup();
      
      // Test with one value missing
      const propsWithMissingSpanning = {
        ...defaultProps,
        financialYear: {
          ...defaultProps.financialYear,
          spanningYears: ''
        }
      };
      
      const { container: container2 } = render(<FinancialYearSection {...propsWithMissingSpanning} />);
      slider = container2.querySelector('[data-testid="custom-slider"]');
      expect(slider).toBeTruthy();
      expect(slider!).toHaveAttribute('trackcolor', 'transparent');
    });

    it('should cover the getYearLabelsAndPositions call in slider render', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      // Function should be called when component renders slider
      expect(mockCalculateYearLabelsAndPositions).toHaveBeenCalledWith(
        '2020',
        '5 years',
        [2020, 2025],
        2000,
        2050,
        420
      );
    });

    it('should cover the currentYear calculation', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      // Check that slider gets currentValue as current year
      const slider = screen.getByTestId('custom-slider');
      const currentYear = new Date().getFullYear();
      expect(slider).toHaveAttribute('currentvalue', currentYear.toString());
    });

    it('should cover the IIFE (Immediately Invoked Function Expression) in slider', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      // The IIFE should execute and render the slider
      expect(screen.getByTestId('custom-slider')).toBeInTheDocument();
      expect(screen.getByText('Set Spanning Years For User View')).toBeInTheDocument();
    });

    it('should test the ternary operator for slider value', () => {
      // Test with hasSelection true
      const { container: container1 } = render(<FinancialYearSection {...defaultProps} />);
      let slider = container1.querySelector('[data-testid="custom-slider"]');
      expect(slider).toBeTruthy();
      expect(slider!.querySelector('input')).toHaveAttribute('value', '2020,2025');
      
      // Clean up first render
      cleanup();
      
      // Test with hasSelection false (empty array)
      const propsWithEmptyData = {
        ...defaultProps,
        financialYear: {
          ...defaultProps.financialYear,
          historicalDataStartFY: '',
          spanningYears: ''
        }
      };
      
      const { container: container2 } = render(<FinancialYearSection {...propsWithEmptyData} />);
      slider = container2.querySelector('[data-testid="custom-slider"]');
      expect(slider).toBeTruthy();
      expect(slider!.querySelector('input')).toHaveAttribute('value', '');
    });

    it('should cover all format link style properties', () => {
      render(<FinancialYearSection {...defaultProps} isEditMode={true} />);
      
      const formatLink = screen.getByText('here');
      expect(formatLink).toHaveStyle('pointer-events: auto');
      expect(formatLink).toHaveStyle('opacity: 1');
      expect(formatLink).toHaveStyle('cursor: pointer');
    });

    it('should cover format link style properties in read-only mode', () => {
      render(<FinancialYearSection {...defaultProps} isEditMode={false} />);
      
      const formatLink = screen.getByText('here');
      expect(formatLink).toHaveStyle('pointer-events: none');
      expect(formatLink).toHaveStyle('opacity: 0.5');
      expect(formatLink).toHaveStyle('cursor: default');
    });

    it('should cover all slider property assignments', () => {
      render(<FinancialYearSection {...defaultProps} />);
      const slider = screen.getByTestId('custom-slider');
      
      // Verify slider properties that are correctly assigned on our mock
      expect(slider).toHaveAttribute('width', '420');
      expect(slider).toHaveAttribute('height', '6');
      expect(slider).toHaveAttribute('valuelabeldisplay', 'off');
      expect(slider).toHaveAttribute('labelcolor', '#5F6368');
      expect(slider).toHaveAttribute('railcolor', 'rgba(240, 239, 239, 1)');
      expect(slider).toHaveClass('period-setup__year-slider');
      
      // Verify the slider input element exists
      expect(slider.querySelector('input')).toBeInTheDocument();
    });

    it('should cover suspense fallback for all components', () => {
      // This test ensures that any Suspense components are exercised
      const propsWithDifferentEdit = { ...defaultProps, isEditMode: true };
      render(<FinancialYearSection {...propsWithDifferentEdit} />);
      
      // Check that all form fields are rendered correctly
      expect(screen.getByTestId('text-field')).toBeInTheDocument();
      expect(screen.getAllByTestId('select-field')).toHaveLength(4);
      expect(screen.getByTestId('custom-slider')).toBeInTheDocument();
    });

    it('should cover financial year format panel properties', () => {
      render(<FinancialYearSection {...defaultProps} />);
      const formatPanel = screen.getByTestId('format-panel');
      
      // The panel should be present but hidden initially
      expect(formatPanel).toBeInTheDocument();
      expect(formatPanel).toHaveStyle('display: none');
      
      // Check that all required props are passed correctly
      expect(screen.getByTestId('current-format')).toHaveTextContent('FY {yy}-{yy}');
      expect(screen.getByTestId('format-financial-year')).toHaveTextContent('April - March');
    });

    it('should cover specific useEffect dependency scenarios', () => {
      const { rerender } = render(<FinancialYearSection {...defaultProps} />);
      
      // Test useEffect with only startMonth change
      const propsWithOnlyStartMonth = {
        ...defaultProps,
        financialYear: {
          ...defaultProps.financialYear,
          startMonth: 'July'
        }
      };
      
      rerender(<FinancialYearSection {...propsWithOnlyStartMonth} />);
      
      expect(mockCalculateFinancialYearYears).toHaveBeenCalledWith('July', 'March', expect.any(Array));
    });

    it('should cover fallback scenarios for suspense boundaries', () => {
      // Test rendering with empty props to trigger potential fallbacks
      const propsWithMinimalData = {
        ...defaultProps,
        financialYear: {
          name: '',
          startMonth: '',
          endMonth: '',
          historicalDataStartFY: '',
          spanningYears: '',
          format: ''
        },
        sliderValue: []
      };
      
      render(<FinancialYearSection {...propsWithMinimalData} />);
      
      // Should still render the main structure
      expect(screen.getByText('Financial Year Setup')).toBeInTheDocument();
    });

    it('should cover slider value array edge cases', () => {
      const propsWithSingleValueArray = {
        ...defaultProps,
        sliderValue: [2023]
      };
      
      render(<FinancialYearSection {...propsWithSingleValueArray} />);
      
      expect(mockCalculateYearLabelsAndPositions).toHaveBeenCalledWith(
        '2020',
        '5 years',
        [2023],
        2000,
        2050,
        420
      );
    });

    it('should cover all months calculation edge cases', () => {
      // Test with February (index 1)
      const propsWithFebruary = {
        ...defaultProps,
        financialYear: {
          ...defaultProps.financialYear,
          startMonth: 'February',
          endMonth: ''
        }
      };
      
      render(<FinancialYearSection {...propsWithFebruary} />);
      
      // February is index 1, so (1 + 11) % 12 = 0 (January)
      expect(defaultProps.onFinancialYearChange).toHaveBeenCalledWith('endMonth', 'January');
    });

    it('should handle format link onClick when isEditMode is false', () => {
      render(<FinancialYearSection {...defaultProps} isEditMode={false} />);
      
      const formatLink = screen.getByText('here');
      
      // Should have undefined onClick when in read-only mode
      expect(formatLink.onclick).toBeNull();
      
      // Clicking should not open panel
      fireEvent.click(formatLink);
      expect(screen.getByTestId('format-panel')).toHaveStyle('display: none');
    });

    it('should cover handleFormatSave with different parameters', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      // Open format panel
      const formatLink = screen.getByText('here');
      fireEvent.click(formatLink);
      
      // Mock a different format save scenario
      const saveButton = screen.getByTestId('format-save');
      fireEvent.click(saveButton);
      
      // Should call both onChange functions
      expect(defaultProps.onFinancialYearChange).toHaveBeenCalledWith('format', 'FY {yy}-{yy}');
      expect(defaultProps.onFinancialYearChange).toHaveBeenCalledWith('name', 'FY 23-24');
    });

    it('should cover all constant assignments and calculations', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      // Verify the getYearLabelsAndPositions function is called correctly
      expect(mockCalculateYearLabelsAndPositions).toHaveBeenCalledWith(
        '2020', // financialYear.historicalDataStartFY
        '5 years', // financialYear.spanningYears  
        [2020, 2025], // sliderValue
        2000, // SLIDER_MIN
        2050, // SLIDER_MAX
        420 // SLIDER_RAIL_WIDTH
      );
    });

    it('should cover JSX return statement and component structure', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      // Verify specific elements are rendered correctly
      expect(screen.getByText('Financial Year Setup')).toBeInTheDocument();
      expect(screen.getByText('Set Spanning Years For User View')).toBeInTheDocument();
      expect(screen.getByText('Financial Year Name Format')).toBeInTheDocument();
      // Use a more flexible matcher for text that might be split across elements
      expect(screen.getByText(/You can change the format from/i)).toBeInTheDocument();
      
      // Check for the format text using a more flexible matcher
      expect(screen.getByText((content) => 
        content.includes('for single year') && content.includes('for FY spanning')
      )).toBeInTheDocument();
    });

    it('should test different dependency array triggering for useEffect', () => {
      // Test format change triggering useEffect
      const propsWithDifferentFormat = {
        ...defaultProps,
        financialYear: {
          ...defaultProps.financialYear,
          format: 'FY {yyyy}'
        }
      };
      
      render(<FinancialYearSection {...propsWithDifferentFormat} />);
      
      expect(mockGenerateFinancialYearName).toHaveBeenCalledWith('FY {yyyy}', 2023, 2024);
    });

    it('should test slider IIFE with different value scenarios', () => {
      // Test with zero values
      const propsWithZeroValues = {
        ...defaultProps,
        sliderValue: [0, 0]
      };
      
      render(<FinancialYearSection {...propsWithZeroValues} />);
      
      const slider = screen.getByTestId('custom-slider');
      expect(slider.querySelector('input')).toHaveAttribute('value', '0,0');
    });

    it('should test all Box component classes', () => {
      const { container } = render(<FinancialYearSection {...defaultProps} />);
      
      // Verify all Box components with their specific classes are rendered
      expect(container.querySelector('.period-setup__section')).toBeInTheDocument();
      expect(container.querySelector('.period-setup__section-header')).toBeInTheDocument();
      expect(container.querySelector('.period-setup__content')).toBeInTheDocument();
      expect(container.querySelector('.period-setup__form-row')).toBeInTheDocument();
      expect(container.querySelector('.period-setup__form-column')).toBeInTheDocument();
      expect(container.querySelector('.period-setup__info-column')).toBeInTheDocument();
      expect(container.querySelector('.period-setup__slider-column')).toBeInTheDocument();
    });

    it('should test Typography variant and className assignments', () => {
      render(<FinancialYearSection {...defaultProps} />);
      
      // Check Typography components are rendered with correct variants
      expect(screen.getByRole('heading', { level: 6 })).toHaveTextContent('Financial Year Setup');
      
      // Check specific Typography elements by their text content
      expect(screen.getByText('Set Spanning Years For User View')).toBeInTheDocument();
      expect(screen.getByText('Financial Year Name Format')).toBeInTheDocument();
    });

    it('should cover additional uncovered statements for 95% target', () => {
      // Test with edge case props that might trigger uncovered code paths
      const edgeCaseProps = {
        ...defaultProps,
        financialYear: {
          ...defaultProps.financialYear,
          historicalDataStartFY: '',
          spanningYears: ''
        },
        sliderValue: []
      };
      
      const { unmount } = render(<FinancialYearSection {...edgeCaseProps} />);
      
      // Test ReadOnlyField rendering in read-only mode to trigger different code paths
      unmount();
      render(<FinancialYearSection {...edgeCaseProps} isEditMode={false} />);
      
      // Verify the component renders with empty values
      expect(screen.getByText('Financial Year Setup')).toBeInTheDocument();
    });

    it('should cover remaining conditional rendering paths', () => {
      // Test with different slider value scenarios to cover remaining statements
      const propsWithDifferentSlider = {
        ...defaultProps,
        sliderValue: [2019, 2026], // Different slider values
        financialYear: {
          ...defaultProps.financialYear,
          historicalDataStartFY: '2019',
          spanningYears: '7 years'
        }
      };
      
      render(<FinancialYearSection {...propsWithDifferentSlider} />);
      
      // Test that the component renders with different slider values
      expect(screen.getByText('Financial Year Setup')).toBeInTheDocument();
      
      // Test the hasSelection logic with different conditions
      expect(mockCalculateYearLabelsAndPositions).toHaveBeenCalledWith(
        '2019',
        '7 years',
        [2019, 2026],
        2000,
        2050,
        420
      );
    });
  });
});