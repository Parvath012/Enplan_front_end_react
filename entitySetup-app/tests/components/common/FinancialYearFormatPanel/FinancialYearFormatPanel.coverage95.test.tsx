import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FinancialYearFormatPanel from '../../../../src/components/common/FinancialYearFormatPanel/FinancialYearFormatPanel';

// Mock FormatPanel to expose the onSave callback that calls handlePanelSave (lines 40-41)
jest.mock('../../../../src/components/common/FormatPanel/FormatPanel', () => {
  return function MockFormatPanel({ 
    isOpen, 
    onClose, 
    onSave, 
    title, 
    currentFormat, 
    previewText, 
    generatePreview 
  }: any) {
    return (
      <div data-testid="format-panel">
        <div data-testid="format-panel-title">{title}</div>
        <div data-testid="format-panel-current-format">{currentFormat}</div>
        <div data-testid="format-panel-preview">{previewText}</div>
        <div data-testid="format-panel-is-open">{isOpen.toString()}</div>
        <button data-testid="format-panel-close" onClick={onClose}>Close</button>
        <button 
          data-testid="format-panel-save" 
          onClick={() => {
            // This will trigger handlePanelSave (lines 40-41) in the component
            onSave('FY {yyyy} - {yyyy}', 'preview-from-panel');
          }}
        >
          Save
        </button>
        <button 
          data-testid="format-panel-generate-preview" 
          onClick={() => generatePreview && generatePreview('FY {yy} - {yy}')}
        >
          Generate Preview
        </button>
      </div>
    );
  };
});

// Mock the utility functions  
jest.mock('../../../../src/utils/formatUtils', () => ({
  generateFinancialYearName: jest.fn(),
  calculateFinancialYearYears: jest.fn(),
}));

// Mock the constants
jest.mock('../../../../src/constants/periodSetupConstants', () => ({
  FINANCIAL_YEAR_FORMAT_OPTIONS: [
    { value: 'FY {yy} - {yy}', label: 'FY {yy} - {yy}' },
    { value: 'FY {yyyy} - {yyyy}', label: 'FY {yyyy} - {yyyy}' },
    { value: 'FY {yy}', label: 'FY {yy}' },
    { value: 'FY {yyyy}', label: 'FY {yyyy}' }
  ],
  MONTHS: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
}));

// Import mocked functions after mocking
const { generateFinancialYearName, calculateFinancialYearYears } = require('../../../../src/utils/formatUtils');

describe('FinancialYearFormatPanel - Coverage to 95%', () => {
  const mockGenerateFinancialYearName = generateFinancialYearName as jest.MockedFunction<typeof generateFinancialYearName>;
  const mockCalculateFinancialYearYears = calculateFinancialYearYears as jest.MockedFunction<typeof calculateFinancialYearYears>;

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
    currentFormat: 'FY {yy} - {yy}'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockGenerateFinancialYearName.mockReturnValue('FY 2024-2025');
    mockCalculateFinancialYearYears.mockReturnValue({
      financialYearStart: 2024,
      financialYearEnd: 2025
    });
  });

  it('should render without crashing', () => {
    render(<FinancialYearFormatPanel {...defaultProps} />);
    expect(screen.getByTestId('format-panel')).toBeInTheDocument();
  });

  it('should pass correct props to FormatPanel', () => {
    render(<FinancialYearFormatPanel {...defaultProps} />);
    
    expect(screen.getByTestId('format-panel-title')).toHaveTextContent('Financial Year Name Format');
    expect(screen.getByTestId('format-panel-current-format')).toHaveTextContent('FY {yy} - {yy}');
    expect(screen.getByTestId('format-panel-is-open')).toHaveTextContent('true');
  });

  it('should generate preview with current year when no financialYear prop', () => {
    render(<FinancialYearFormatPanel {...defaultProps} />);
    
    const currentYear = new Date().getFullYear();
    expect(mockGenerateFinancialYearName).toHaveBeenCalledWith('FY {yy} - {yy}', currentYear, currentYear);
  });

  it('should generate preview with financial year data when provided', () => {
    const propsWithFinancialYear = {
      ...defaultProps,
      financialYear: {
        startMonth: 'April',
        endMonth: 'March'
      }
    };
    
    render(<FinancialYearFormatPanel {...propsWithFinancialYear} />);
    
    expect(mockCalculateFinancialYearYears).toHaveBeenCalledWith('April', 'March', expect.any(Array));
    expect(mockGenerateFinancialYearName).toHaveBeenCalledWith('FY {yy} - {yy}', 2024, 2025);
  });

  it('should handle close action', () => {
    const onClose = jest.fn();
    render(<FinancialYearFormatPanel {...defaultProps} onClose={onClose} />);
    
    fireEvent.click(screen.getByTestId('format-panel-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // THIS IS THE KEY TEST: Covers lines 40-41 (handlePanelSave function)
  it('should call onSave with correct parameters when save is clicked (covers lines 40-41)', () => {
    const onSave = jest.fn();
    const propsWithFinancialYear = {
      ...defaultProps,
      onSave,
      financialYear: {
        startMonth: 'January',
        endMonth: 'December'
      }
    };
    
    // Mock the generatePreview function to return a specific value
    mockGenerateFinancialYearName.mockReturnValue('FY 2024-2025 Generated');
    
    render(<FinancialYearFormatPanel {...propsWithFinancialYear} />);
    
    // This click will trigger the handlePanelSave function (lines 40-41)
    fireEvent.click(screen.getByTestId('format-panel-save'));
    
    // Verify that onSave was called with the format and generated preview
    // Line 40: const preview = generatePreview(selectedFormat);
    // Line 41: onSave(selectedFormat, preview);
    expect(onSave).toHaveBeenCalledWith('FY {yyyy} - {yyyy}', 'FY 2024-2025 Generated');
  });

  // Additional test to cover different generatePreview scenarios
  it('should handle generatePreview function correctly', () => {
    render(<FinancialYearFormatPanel {...defaultProps} />);
    
    fireEvent.click(screen.getByTestId('format-panel-generate-preview'));
    
    expect(mockGenerateFinancialYearName).toHaveBeenCalledWith('FY {yy} - {yy}', expect.any(Number), expect.any(Number));
  });

  it('should handle missing financialYear startMonth', () => {
    const propsWithPartialFinancialYear = {
      ...defaultProps,
      financialYear: {
        startMonth: '',
        endMonth: 'March'
      }
    };
    
    render(<FinancialYearFormatPanel {...propsWithPartialFinancialYear} />);
    
    // Should fallback to current year when startMonth is empty
    const currentYear = new Date().getFullYear();
    expect(mockGenerateFinancialYearName).toHaveBeenCalledWith('FY {yy} - {yy}', currentYear, currentYear);
  });

  it('should handle missing financialYear endMonth', () => {
    const propsWithPartialFinancialYear = {
      ...defaultProps,
      financialYear: {
        startMonth: 'April',
        endMonth: ''
      }
    };
    
    render(<FinancialYearFormatPanel {...propsWithPartialFinancialYear} />);
    
    // Should fallback to current year when endMonth is empty
    const currentYear = new Date().getFullYear();
    expect(mockGenerateFinancialYearName).toHaveBeenCalledWith('FY {yy} - {yy}', currentYear, currentYear);
  });

  it('should handle different current formats', () => {
    const propsWithDifferentFormat = {
      ...defaultProps,
      currentFormat: 'FY {yyyy} - {yyyy}'
    };
    
    render(<FinancialYearFormatPanel {...propsWithDifferentFormat} />);
    
    expect(screen.getByTestId('format-panel-current-format')).toHaveTextContent('FY {yyyy} - {yyyy}');
    expect(mockGenerateFinancialYearName).toHaveBeenCalledWith('FY {yyyy} - {yyyy}', expect.any(Number), expect.any(Number));
  });

  it('should handle undefined currentFormat (default)', () => {
    const propsWithoutFormat = {
      isOpen: true,
      onClose: jest.fn(),
      onSave: jest.fn()
    };
    
    render(<FinancialYearFormatPanel {...propsWithoutFormat} />);
    
    expect(screen.getByTestId('format-panel-current-format')).toHaveTextContent('FY {yy} - {yy}');
  });

  it('should handle isOpen false', () => {
    const propsWithClosedPanel = {
      ...defaultProps,
      isOpen: false
    };
    
    render(<FinancialYearFormatPanel {...propsWithClosedPanel} />);
    
    expect(screen.getByTestId('format-panel-is-open')).toHaveTextContent('false');
  });

  // Test edge case with null financialYear
  it('should handle null financialYear', () => {
    const propsWithNullFinancialYear = {
      ...defaultProps,
      financialYear: null as any
    };
    
    render(<FinancialYearFormatPanel {...propsWithNullFinancialYear} />);
    
    const currentYear = new Date().getFullYear();
    expect(mockGenerateFinancialYearName).toHaveBeenCalledWith('FY {yy} - {yy}', currentYear, currentYear);
  });

  // Test the handlePanelSave with different format to ensure coverage
  it('should handle save with different format (additional handlePanelSave coverage)', () => {
    const onSave = jest.fn();
    const propsWithDifferentFormat = {
      ...defaultProps,
      onSave,
      currentFormat: 'FY {yy}'
    };
    
    mockGenerateFinancialYearName.mockReturnValue('FY 24');
    
    render(<FinancialYearFormatPanel {...propsWithDifferentFormat} />);
    
    fireEvent.click(screen.getByTestId('format-panel-save'));
    
    // This ensures both lines 40 and 41 are executed with different data
    expect(onSave).toHaveBeenCalledWith('FY {yyyy} - {yyyy}', 'FY 24');
  });
});