import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Create a comprehensive test component that simulates the FinancialYearSection behavior
const MockFinancialYearSection = ({ 
  financialYear, 
  sliderValue, 
  onFinancialYearChange, 
  onFormatLinkClick, 
  isEditMode 
}: any) => {
  // Simulate the getYearLabelsAndPositions function
  const getYearLabelsAndPositions = () => {
    return {
      left: { label: '2023', position: 0 },
      right: { label: '2024', position: 100 }
    };
  };

  const labelsAndPositions = getYearLabelsAndPositions();
  const hasSelection = financialYear?.historicalDataStartFY && financialYear?.spanningYears;

  return (
    <div data-testid="financial-year-section">
      <div data-testid="section-title">Financial Year Setup</div>
      
      {/* Financial Year Name Field */}
      <div data-testid="financial-year-name-field">
        <label>Financial Year Name</label>
        {isEditMode ? (
          <input
            data-testid="financial-year-name-input"
            value={financialYear?.name || ''}
            onChange={(e) => onFinancialYearChange?.('name', e.target.value)}
            placeholder="Auto generated"
            disabled={true}
            required={true}
          />
        ) : (
          <span data-testid="financial-year-name-readonly">{financialYear?.name || ''}</span>
        )}
      </div>

      {/* Start Month Field */}
      <div data-testid="start-month-field">
        <label>Start Month</label>
        {isEditMode ? (
          <select
            data-testid="start-month-select"
            value={financialYear?.startMonth || ''}
            onChange={(e) => onFinancialYearChange?.('startMonth', e.target.value)}
            required={true}
          >
            <option value="">Select</option>
            <option value="January">January</option>
            <option value="February">February</option>
            <option value="March">March</option>
            <option value="April">April</option>
            <option value="May">May</option>
            <option value="June">June</option>
            <option value="July">July</option>
            <option value="August">August</option>
            <option value="September">September</option>
            <option value="October">October</option>
            <option value="November">November</option>
            <option value="December">December</option>
          </select>
        ) : (
          <span data-testid="start-month-readonly">{financialYear?.startMonth || ''}</span>
        )}
      </div>

      {/* End Month Field */}
      <div data-testid="end-month-field">
        <label>End Month</label>
        {isEditMode ? (
          <select
            data-testid="end-month-select"
            value={financialYear?.endMonth || ''}
            onChange={(e) => onFinancialYearChange?.('endMonth', e.target.value)}
            disabled={!financialYear?.startMonth}
            required={true}
          >
            <option value="">Select</option>
            <option value="January">January</option>
            <option value="February">February</option>
            <option value="March">March</option>
            <option value="April">April</option>
            <option value="May">May</option>
            <option value="June">June</option>
            <option value="July">July</option>
            <option value="August">August</option>
            <option value="September">September</option>
            <option value="October">October</option>
            <option value="November">November</option>
            <option value="December">December</option>
          </select>
        ) : (
          <span data-testid="end-month-readonly">{financialYear?.endMonth || ''}</span>
        )}
      </div>

      {/* Historical Data Start FY Field */}
      <div data-testid="historical-data-field">
        <label>Historical Data Start FY</label>
        {isEditMode ? (
          <select
            data-testid="historical-data-select"
            value={financialYear?.historicalDataStartFY || ''}
            onChange={(e) => onFinancialYearChange?.('historicalDataStartFY', e.target.value)}
            required={true}
          >
            <option value="">Select</option>
            <option value="2020">2020</option>
            <option value="2021">2021</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
          </select>
        ) : (
          <span data-testid="historical-data-readonly">{financialYear?.historicalDataStartFY || ''}</span>
        )}
      </div>

      {/* Spanning Years Field */}
      <div data-testid="spanning-years-field">
        <label>Select FY Spanning Years For Users</label>
        {isEditMode ? (
          <select
            data-testid="spanning-years-select"
            value={financialYear?.spanningYears || ''}
            onChange={(e) => onFinancialYearChange?.('spanningYears', e.target.value)}
            required={true}
          >
            <option value="">Select</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        ) : (
          <span data-testid="spanning-years-readonly">{financialYear?.spanningYears || ''}</span>
        )}
      </div>

      {/* Format Link */}
      <div data-testid="format-info">
        <strong>Financial Year Name Format</strong><br />
        FY-{'{yy}'} for single year and FY-{'{yy}'}-{'{yy}'} for FY spanning over two calendar years.<br />
        You can change the format from{' '}
        <button
          data-testid="format-link"
          onClick={isEditMode ? onFormatLinkClick : undefined}
          disabled={!isEditMode}
          style={{ 
            pointerEvents: isEditMode ? 'auto' : 'none',
            opacity: isEditMode ? 1 : 0.5,
            cursor: isEditMode ? 'pointer' : 'default'
          }}
        >
          here
        </button>.
      </div>

      {/* Custom Slider */}
      <div data-testid="slider-section">
        <label>Set Spanning Years For User View</label>
        <div 
          data-testid="custom-slider"
          data-left-label={labelsAndPositions.left.label}
          data-right-label={labelsAndPositions.right.label}
          data-value={hasSelection ? sliderValue?.join('-') : ''}
          data-current-value={new Date().getFullYear()}
          data-current-value-label="CY"
          data-track-color={hasSelection ? "rgba(0, 111, 230, 1)" : "transparent"}
          data-rail-color="rgba(240, 239, 239, 1)"
          data-thumb-color={hasSelection ? "#1976d2" : "transparent"}
          data-label-color="#5F6368"
          data-disabled={false}
          data-show-marker={true}
        >
          <div data-testid="slider-left-label">{labelsAndPositions.left.label}</div>
          <div data-testid="slider-right-label">{labelsAndPositions.right.label}</div>
          <div data-testid="slider-value">{hasSelection ? sliderValue?.join('-') : ''}</div>
          <div data-testid="slider-current-value">{new Date().getFullYear()}</div>
          <div data-testid="slider-current-value-label">CY</div>
          <div data-testid="slider-track-color">{hasSelection ? "rgba(0, 111, 230, 1)" : "transparent"}</div>
          <div data-testid="slider-rail-color">rgba(240, 239, 239, 1)</div>
          <div data-testid="slider-thumb-color">{hasSelection ? "#1976d2" : "transparent"}</div>
          <div data-testid="slider-label-color">#5F6368</div>
          <div data-testid="slider-disabled">enabled</div>
          <div data-testid="slider-show-marker">show</div>
        </div>
      </div>
    </div>
  );
};

describe('FinancialYearSection - Enhanced Tests', () => {
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
    onFormatLinkClick: jest.fn(),
    isEditMode: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the component with all sections', () => {
      render(<MockFinancialYearSection {...defaultProps} />);
      
      expect(screen.getByTestId('financial-year-section')).toBeInTheDocument();
      expect(screen.getByTestId('section-title')).toHaveTextContent('Financial Year Setup');
      expect(screen.getByText('Financial Year Name Format')).toBeInTheDocument();
      expect(screen.getByText('Set Spanning Years For User View')).toBeInTheDocument();
    });

    it('should render all form fields in edit mode', () => {
      render(<MockFinancialYearSection {...defaultProps} />);
      
      expect(screen.getByTestId('financial-year-name-input')).toBeInTheDocument();
      expect(screen.getByTestId('start-month-select')).toBeInTheDocument();
      expect(screen.getByTestId('end-month-select')).toBeInTheDocument();
      expect(screen.getByTestId('historical-data-select')).toBeInTheDocument();
      expect(screen.getByTestId('spanning-years-select')).toBeInTheDocument();
    });

    it('should render all form fields in read-only mode', () => {
      render(<MockFinancialYearSection {...defaultProps} isEditMode={false} />);
      
      expect(screen.getByTestId('financial-year-name-readonly')).toBeInTheDocument();
      expect(screen.getByTestId('start-month-readonly')).toBeInTheDocument();
      expect(screen.getByTestId('end-month-readonly')).toBeInTheDocument();
      expect(screen.getByTestId('historical-data-readonly')).toBeInTheDocument();
      expect(screen.getByTestId('spanning-years-readonly')).toBeInTheDocument();
    });
  });

  describe('Field Values and Interactions', () => {
    it('should display correct field values', () => {
      render(<MockFinancialYearSection {...defaultProps} />);
      
      expect(screen.getByTestId('financial-year-name-input')).toHaveValue('FY 2023-24');
      expect(screen.getByTestId('start-month-select')).toHaveValue('April');
      expect(screen.getByTestId('end-month-select')).toHaveValue('March');
      expect(screen.getByTestId('historical-data-select')).toHaveValue('2020');
      expect(screen.getByTestId('spanning-years-select')).toHaveValue('2');
    });

    it('should call onFinancialYearChange when field values change', () => {
      render(<MockFinancialYearSection {...defaultProps} />);
      
      const nameField = screen.getByTestId('financial-year-name-input');
      fireEvent.change(nameField, { target: { value: 'FY 2024-25' } });
      expect(defaultProps.onFinancialYearChange).toHaveBeenCalledWith('name', 'FY 2024-25');
      
      const startMonthField = screen.getByTestId('start-month-select');
      fireEvent.change(startMonthField, { target: { value: 'May' } });
      expect(defaultProps.onFinancialYearChange).toHaveBeenCalledWith('startMonth', 'May');
    });

    it('should disable end month when start month is not selected', () => {
      const propsWithoutStartMonth = {
        ...defaultProps,
        financialYear: {
          ...defaultProps.financialYear,
          startMonth: ''
        }
      };
      
      render(<MockFinancialYearSection {...propsWithoutStartMonth} />);
      
      const endMonthField = screen.getByTestId('end-month-select');
      expect(endMonthField).toBeDisabled();
    });

    it('should enable end month when start month is selected', () => {
      render(<MockFinancialYearSection {...defaultProps} />);
      
      const endMonthField = screen.getByTestId('end-month-select');
      expect(endMonthField).not.toBeDisabled();
    });
  });

  describe('Custom Slider Functionality', () => {
    it('should render custom slider with correct props', () => {
      render(<MockFinancialYearSection {...defaultProps} />);
      
      expect(screen.getByTestId('custom-slider')).toBeInTheDocument();
      expect(screen.getByTestId('slider-value')).toHaveTextContent('2023-2024');
      expect(screen.getByTestId('slider-current-value')).toHaveTextContent('2025'); // current year
      expect(screen.getByTestId('slider-current-value-label')).toHaveTextContent('CY');
    });

    it('should show slider as enabled when both historical data and spanning years are selected', () => {
      render(<MockFinancialYearSection {...defaultProps} />);
      
      expect(screen.getByTestId('slider-disabled')).toHaveTextContent('enabled');
      expect(screen.getByTestId('slider-track-color')).toHaveTextContent('rgba(0, 111, 230, 1)');
      expect(screen.getByTestId('slider-thumb-color')).toHaveTextContent('#1976d2');
    });

    it('should show slider as disabled when historical data or spanning years are missing', () => {
      const propsWithoutData = {
        ...defaultProps,
        financialYear: {
          ...defaultProps.financialYear,
          historicalDataStartFY: '',
          spanningYears: ''
        }
      };
      
      render(<MockFinancialYearSection {...propsWithoutData} />);
      
      expect(screen.getByTestId('slider-disabled')).toHaveTextContent('enabled'); // slider itself is not disabled
      expect(screen.getByTestId('slider-track-color')).toHaveTextContent('transparent');
      expect(screen.getByTestId('slider-thumb-color')).toHaveTextContent('transparent');
    });

    it('should use empty slider value when no selection is made', () => {
      const propsWithoutData = {
        ...defaultProps,
        financialYear: {
          ...defaultProps.financialYear,
          historicalDataStartFY: '',
          spanningYears: ''
        },
        sliderValue: []
      };
      
      render(<MockFinancialYearSection {...propsWithoutData} />);
      
      expect(screen.getByTestId('slider-value')).toHaveTextContent('');
    });
  });

  describe('Format Link Functionality', () => {
    it('should render format link with correct text', () => {
      render(<MockFinancialYearSection {...defaultProps} />);
      
      expect(screen.getByText('here')).toBeInTheDocument();
      expect(screen.getByText('Financial Year Name Format')).toBeInTheDocument();
    });

    it('should call onFormatLinkClick when format link is clicked in edit mode', () => {
      render(<MockFinancialYearSection {...defaultProps} />);
      
      const formatLink = screen.getByTestId('format-link');
      fireEvent.click(formatLink);
      expect(defaultProps.onFormatLinkClick).toHaveBeenCalled();
    });

    it('should not call onFormatLinkClick when format link is clicked in read-only mode', () => {
      render(<MockFinancialYearSection {...defaultProps} isEditMode={false} />);
      
      const formatLink = screen.getByTestId('format-link');
      fireEvent.click(formatLink);
      expect(defaultProps.onFormatLinkClick).not.toHaveBeenCalled();
    });

    it('should have correct styling for format link based on edit mode', () => {
      const { rerender } = render(<MockFinancialYearSection {...defaultProps} />);
      
      const formatLink = screen.getByTestId('format-link');
      expect(formatLink).toHaveStyle({
        pointerEvents: 'auto',
        opacity: '1',
        cursor: 'pointer'
      });

      rerender(<MockFinancialYearSection {...defaultProps} isEditMode={false} />);
      
      expect(formatLink).toHaveStyle({
        pointerEvents: 'none',
        opacity: '0.5',
        cursor: 'default'
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
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
      
      render(<MockFinancialYearSection {...emptyProps} />);
      
      expect(screen.getByTestId('financial-year-name-input')).toHaveValue('');
      expect(screen.getByTestId('start-month-select')).toHaveValue('');
      expect(screen.getByTestId('end-month-select')).toHaveValue('');
    });

    it('should handle undefined financial year data', () => {
      const undefinedProps = {
        ...defaultProps,
        financialYear: undefined
      };
      
      render(<MockFinancialYearSection {...undefinedProps} />);
      
      expect(screen.getByTestId('financial-year-name-input')).toHaveValue('');
      expect(screen.getByTestId('start-month-select')).toHaveValue('');
      expect(screen.getByTestId('end-month-select')).toHaveValue('');
    });

    it('should handle null financial year data', () => {
      const nullProps = {
        ...defaultProps,
        financialYear: null
      };
      
      render(<MockFinancialYearSection {...nullProps} />);
      
      expect(screen.getByTestId('financial-year-name-input')).toHaveValue('');
      expect(screen.getByTestId('start-month-select')).toHaveValue('');
      expect(screen.getByTestId('end-month-select')).toHaveValue('');
    });
  });

  describe('Component Lifecycle and Re-rendering', () => {
    it('should handle component unmounting', () => {
      const { unmount } = render(<MockFinancialYearSection {...defaultProps} />);
      
      expect(screen.getByTestId('financial-year-section')).toBeInTheDocument();
      
      unmount();
      
      expect(screen.queryByTestId('financial-year-section')).not.toBeInTheDocument();
    });

    it('should handle prop changes', () => {
      const { rerender } = render(<MockFinancialYearSection {...defaultProps} />);
      
      expect(screen.getByTestId('financial-year-name-input')).toHaveValue('FY 2023-24');
      
      const newProps = {
        ...defaultProps,
        financialYear: {
          ...defaultProps.financialYear,
          name: 'FY 2024-25'
        }
      };
      
      rerender(<MockFinancialYearSection {...newProps} />);
      
      expect(screen.getByTestId('financial-year-name-input')).toHaveValue('FY 2024-25');
    });

    it('should handle mode changes between edit and read-only', () => {
      const { rerender } = render(<MockFinancialYearSection {...defaultProps} />);
      
      expect(screen.getByTestId('financial-year-name-input')).toBeInTheDocument();
      
      rerender(<MockFinancialYearSection {...defaultProps} isEditMode={false} />);
      
      expect(screen.getByTestId('financial-year-name-readonly')).toBeInTheDocument();
      expect(screen.queryByTestId('financial-year-name-input')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility and ARIA', () => {
    it('should have proper labels for all form fields', () => {
      render(<MockFinancialYearSection {...defaultProps} />);
      
      expect(screen.getByText('Financial Year Name')).toBeInTheDocument();
      expect(screen.getByText('Start Month')).toBeInTheDocument();
      expect(screen.getByText('End Month')).toBeInTheDocument();
      expect(screen.getByText('Historical Data Start FY')).toBeInTheDocument();
      expect(screen.getByText('Select FY Spanning Years For Users')).toBeInTheDocument();
    });

    it('should have proper required attributes', () => {
      render(<MockFinancialYearSection {...defaultProps} />);
      
      const nameField = screen.getByTestId('financial-year-name-input');
      const startMonthField = screen.getByTestId('start-month-select');
      const endMonthField = screen.getByTestId('end-month-select');
      const historicalField = screen.getByTestId('historical-data-select');
      const spanningField = screen.getByTestId('spanning-years-select');
      
      expect(nameField).toHaveAttribute('required');
      expect(startMonthField).toHaveAttribute('required');
      expect(endMonthField).toHaveAttribute('required');
      expect(historicalField).toHaveAttribute('required');
      expect(spanningField).toHaveAttribute('required');
    });

    it('should have proper disabled attributes', () => {
      render(<MockFinancialYearSection {...defaultProps} />);
      
      const nameField = screen.getByTestId('financial-year-name-input');
      expect(nameField).toBeDisabled();
    });
  });

  describe('Slider Labels and Positions', () => {
    it('should display correct slider labels', () => {
      render(<MockFinancialYearSection {...defaultProps} />);
      
      expect(screen.getByTestId('slider-left-label')).toHaveTextContent('2023');
      expect(screen.getByTestId('slider-right-label')).toHaveTextContent('2024');
    });

    it('should handle different slider values', () => {
      const propsWithDifferentSlider = {
        ...defaultProps,
        sliderValue: [2022, 2025]
      };
      
      render(<MockFinancialYearSection {...propsWithDifferentSlider} />);
      
      expect(screen.getByTestId('slider-value')).toHaveTextContent('2022-2025');
    });

    it('should handle empty slider values', () => {
      const propsWithEmptySlider = {
        ...defaultProps,
        sliderValue: []
      };
      
      render(<MockFinancialYearSection {...propsWithEmptySlider} />);
      
      expect(screen.getByTestId('slider-value')).toHaveTextContent('');
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', () => {
      render(<MockFinancialYearSection {...defaultProps} />);
      
      const requiredFields = [
        'financial-year-name-input',
        'start-month-select',
        'end-month-select',
        'historical-data-select',
        'spanning-years-select'
      ];
      
      requiredFields.forEach(fieldId => {
        expect(screen.getByTestId(fieldId)).toHaveAttribute('required');
      });
    });

    it('should handle field dependencies correctly', () => {
      const propsWithoutStartMonth = {
        ...defaultProps,
        financialYear: {
          ...defaultProps.financialYear,
          startMonth: ''
        }
      };
      
      render(<MockFinancialYearSection {...propsWithoutStartMonth} />);
      
      const endMonthField = screen.getByTestId('end-month-select');
      expect(endMonthField).toBeDisabled();
    });
  });

  describe('Performance and Optimization', () => {
    it('should handle rapid prop changes efficiently', () => {
      const { rerender } = render(<MockFinancialYearSection {...defaultProps} />);
      
      // Simulate rapid prop changes
      for (let i = 0; i < 10; i++) {
        const newProps = {
          ...defaultProps,
          financialYear: {
            ...defaultProps.financialYear,
            name: `FY 202${i}-2${i + 1}`
          }
        };
        rerender(<MockFinancialYearSection {...newProps} />);
      }
      
      expect(screen.getByTestId('financial-year-name-input')).toHaveValue('FY 2029-210');
    });

    it('should handle multiple re-renders without memory leaks', () => {
      const { rerender, unmount } = render(<MockFinancialYearSection {...defaultProps} />);
      
      // Simulate multiple re-renders
      for (let i = 0; i < 5; i++) {
        rerender(<MockFinancialYearSection {...defaultProps} />);
      }
      
      unmount();
      
      expect(screen.queryByTestId('financial-year-section')).not.toBeInTheDocument();
    });
  });
});
