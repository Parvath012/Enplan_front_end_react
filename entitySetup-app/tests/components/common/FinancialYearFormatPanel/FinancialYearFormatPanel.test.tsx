import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FinancialYearFormatPanel from '../../../../src/components/common/FinancialYearFormatPanel/FinancialYearFormatPanel';

// Mock the FormatPanel component
jest.mock('../../../../src/components/common/FormatPanel/FormatPanel', () => {
  return jest.fn(({ isOpen, onClose, onSave, title, formatOptions, currentFormat, previewText, generatePreview }) => {
    if (!isOpen) return null;
    
    return (
      <div data-testid="format-panel">
        <div data-testid="panel-title">{title}</div>
        <div data-testid="panel-current-format">{currentFormat}</div>
        <div data-testid="panel-preview">{previewText}</div>
        <div data-testid="panel-format-options">
          {formatOptions?.map((option: string, index: number) => (
            <div key={index} data-testid={`format-option-${index}`}>
              {option}
            </div>
          ))}
        </div>
        <button data-testid="panel-close" onClick={onClose}>Close</button>
        <button data-testid="panel-save" onClick={() => onSave('FY {yy} - {yy}', 'FY 2023-2024')}>Save</button>
        <button data-testid="panel-test-preview" onClick={() => {
          const testPreview = generatePreview('FY {yyyy} - {yyyy}');
          return testPreview;
        }}>Test Preview</button>
      </div>
    );
  });
});

// Mock the constants
jest.mock('../../../../src/constants/periodSetupConstants', () => ({
  FINANCIAL_YEAR_FORMAT_OPTIONS: [
    'FY {yy} - {yy}',
    'FY {yyyy} - {yyyy}',
    'FY {yy}',
    'FY {yyyy}'
  ],
  MONTHS: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
}));

// Mock the format utils
jest.mock('commonApp/formatUtils', () => ({
  generateFinancialYearName: jest.fn((format: string, startYear: number, endYear: number) => {
    return format
      .replace('{yy}', startYear.toString().slice(-2))
      .replace('{yyyy}', startYear.toString())
      .replace('{yy}', endYear.toString().slice(-2))
      .replace('{yyyy}', endYear.toString());
  }),
  calculateFinancialYearYears: jest.fn((startMonth: string, endMonth: string, months: string[]) => {
    const startIndex = months.indexOf(startMonth);
    const endIndex = months.indexOf(endMonth);
    const currentYear = new Date().getFullYear();
    
    if (startIndex <= endIndex) {
      return { financialYearStart: currentYear, financialYearEnd: currentYear };
    } else {
      return { financialYearStart: currentYear, financialYearEnd: currentYear + 1 };
    }
  })
}));

describe('FinancialYearFormatPanel', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
    currentFormat: 'FY {yy} - {yy}'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      render(<FinancialYearFormatPanel {...defaultProps} />);
      expect(screen.getByTestId('format-panel')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<FinancialYearFormatPanel {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('format-panel')).not.toBeInTheDocument();
    });

    it('should display correct title', () => {
      render(<FinancialYearFormatPanel {...defaultProps} />);
      expect(screen.getByTestId('panel-title')).toHaveTextContent('Financial Year Name Format');
    });

    it('should display current format', () => {
      render(<FinancialYearFormatPanel {...defaultProps} />);
      expect(screen.getByTestId('panel-current-format')).toHaveTextContent('FY {yy} - {yy}');
    });

    it('should display format options', () => {
      render(<FinancialYearFormatPanel {...defaultProps} />);
      expect(screen.getByTestId('format-option-0')).toHaveTextContent('FY {yy} - {yy}');
      expect(screen.getByTestId('format-option-1')).toHaveTextContent('FY {yyyy} - {yyyy}');
      expect(screen.getByTestId('format-option-2')).toHaveTextContent('FY {yy}');
      expect(screen.getByTestId('format-option-3')).toHaveTextContent('FY {yyyy}');
    });
  });

  describe('Props Handling', () => {
    it('should handle default currentFormat when not provided', () => {
      const propsWithoutFormat = {
        isOpen: true,
        onClose: jest.fn(),
        onSave: jest.fn()
      };
      render(<FinancialYearFormatPanel {...propsWithoutFormat} />);
      expect(screen.getByTestId('panel-current-format')).toHaveTextContent('FY {yy} - {yy}');
    });

    it('should handle different current formats', () => {
      const propsWithDifferentFormat = {
        ...defaultProps,
        currentFormat: 'FY {yyyy} - {yyyy}'
      };
      render(<FinancialYearFormatPanel {...propsWithDifferentFormat} />);
      expect(screen.getByTestId('panel-current-format')).toHaveTextContent('FY {yyyy} - {yyyy}');
    });

    it('should handle empty current format', () => {
      const propsWithEmptyFormat = {
        ...defaultProps,
        currentFormat: ''
      };
      render(<FinancialYearFormatPanel {...propsWithEmptyFormat} />);
      expect(screen.getByTestId('panel-current-format')).toHaveTextContent('');
    });

    it('should handle financial year data', () => {
      const propsWithFinancialYear = {
        ...defaultProps,
        financialYear: {
          startMonth: 'April',
          endMonth: 'March'
        }
      };
      render(<FinancialYearFormatPanel {...propsWithFinancialYear} />);
      expect(screen.getByTestId('format-panel')).toBeInTheDocument();
    });

    it('should handle undefined financial year', () => {
      const propsWithUndefinedFinancialYear = {
        ...defaultProps,
        financialYear: undefined
      };
      render(<FinancialYearFormatPanel {...propsWithUndefinedFinancialYear} />);
      expect(screen.getByTestId('format-panel')).toBeInTheDocument();
    });
  });

  describe('Event Handling', () => {
    it('should handle close action', () => {
      render(<FinancialYearFormatPanel {...defaultProps} />);
      const closeButton = screen.getByTestId('panel-close');
      fireEvent.click(closeButton);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should handle save action with correct parameters', () => {
      render(<FinancialYearFormatPanel {...defaultProps} />);
      const saveButton = screen.getByTestId('panel-save');
      fireEvent.click(saveButton);
      expect(defaultProps.onSave).toHaveBeenCalledWith('FY {yy} - {yy}', 'FY 2023-2024');
    });

    it('should handle test preview action', () => {
      render(<FinancialYearFormatPanel {...defaultProps} />);
      const testPreviewButton = screen.getByTestId('panel-test-preview');
      fireEvent.click(testPreviewButton);
      // The test preview button calls generatePreview internally
      expect(screen.getByTestId('format-panel')).toBeInTheDocument();
    });
  });

  describe('Preview Generation', () => {
    it('should generate preview with financial year data', () => {
      const propsWithFinancialYear = {
        ...defaultProps,
        financialYear: {
          startMonth: 'April',
          endMonth: 'March'
        }
      };
      render(<FinancialYearFormatPanel {...propsWithFinancialYear} />);
      expect(screen.getByTestId('format-panel')).toBeInTheDocument();
    });

    it('should generate preview without financial year data', () => {
      render(<FinancialYearFormatPanel {...defaultProps} />);
      expect(screen.getByTestId('format-panel')).toBeInTheDocument();
    });

    it('should generate preview with different formats', () => {
      const formats = ['FY {yy} - {yy}', 'FY {yyyy} - {yyyy}', 'FY {yy}', 'FY {yyyy}'];
      formats.forEach(format => {
        const props = {
          ...defaultProps,
          currentFormat: format
        };
        const { unmount } = render(<FinancialYearFormatPanel {...props} />);
        expect(screen.getByTestId('panel-current-format')).toHaveTextContent(format);
        unmount();
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle component unmounting', () => {
      const { unmount } = render(<FinancialYearFormatPanel {...defaultProps} />);
      expect(screen.getByTestId('format-panel')).toBeInTheDocument();
      unmount();
    });

    it('should handle prop changes', () => {
      const { rerender } = render(<FinancialYearFormatPanel {...defaultProps} />);
      expect(screen.getByTestId('panel-current-format')).toHaveTextContent('FY {yy} - {yy}');

      const newProps = {
        ...defaultProps,
        currentFormat: 'FY {yyyy} - {yyyy}'
      };
      rerender(<FinancialYearFormatPanel {...newProps} />);
      expect(screen.getByTestId('panel-current-format')).toHaveTextContent('FY {yyyy} - {yyyy}');
    });

    it('should handle multiple format changes', () => {
      const { rerender } = render(<FinancialYearFormatPanel {...defaultProps} />);
      expect(screen.getByTestId('panel-current-format')).toHaveTextContent('FY {yy} - {yy}');

      const formats = ['FY {yy} - {yy}', 'FY {yyyy} - {yyyy}', 'FY {yy}', 'FY {yyyy}'];
      formats.forEach(format => {
        const newProps = {
          ...defaultProps,
          currentFormat: format
        };
        rerender(<FinancialYearFormatPanel {...newProps} />);
        expect(screen.getByTestId('panel-current-format')).toHaveTextContent(format);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimal props', () => {
      const minimalProps = {
        isOpen: true,
        onClose: jest.fn(),
        onSave: jest.fn()
      };
      render(<FinancialYearFormatPanel {...minimalProps} />);
      expect(screen.getByTestId('format-panel')).toBeInTheDocument();
      expect(screen.getByTestId('panel-current-format')).toHaveTextContent('FY {yy} - {yy}');
    });

    it('should handle all props', () => {
      const fullProps = {
        isOpen: true,
        onClose: jest.fn(),
        onSave: jest.fn(),
        currentFormat: 'FY {yyyy} - {yyyy}',
        financialYear: {
          startMonth: 'April',
          endMonth: 'March'
        }
      };
      render(<FinancialYearFormatPanel {...fullProps} />);
      expect(screen.getByTestId('format-panel')).toBeInTheDocument();
      expect(screen.getByTestId('panel-current-format')).toHaveTextContent('FY {yyyy} - {yyyy}');
    });

    it('should handle rapid prop changes', () => {
      const { rerender } = render(<FinancialYearFormatPanel {...defaultProps} />);
      expect(screen.getByTestId('panel-current-format')).toHaveTextContent('FY {yy} - {yy}');

      const newProps = {
        ...defaultProps,
        currentFormat: 'FY {yyyy} - {yyyy}'
      };
      rerender(<FinancialYearFormatPanel {...newProps} />);
      expect(screen.getByTestId('panel-current-format')).toHaveTextContent('FY {yyyy} - {yyyy}');

      const anotherProps = {
        ...defaultProps,
        currentFormat: 'FY {yy}'
      };
      rerender(<FinancialYearFormatPanel {...anotherProps} />);
      expect(screen.getByTestId('panel-current-format')).toHaveTextContent('FY {yy}');
    });

    it('should handle different financial year scenarios', () => {
      const scenarios = [
        { startMonth: 'January', endMonth: 'December' },
        { startMonth: 'June', endMonth: 'May' },
        { startMonth: 'December', endMonth: 'November' }
      ];

      scenarios.forEach((scenario, index) => {
        const props = {
          ...defaultProps,
          financialYear: scenario
        };

        const { unmount } = render(<FinancialYearFormatPanel {...props} />);
        expect(screen.getByTestId('format-panel')).toBeInTheDocument();
        unmount();
      });
    });

    it('should handle edge cases with empty values', () => {
      const edgeCaseProps = {
        isOpen: false,
        onClose: jest.fn(),
        onSave: jest.fn(),
        currentFormat: '',
        financialYear: {
          startMonth: '',
          endMonth: ''
        }
      };

      render(<FinancialYearFormatPanel {...edgeCaseProps} />);
      expect(screen.queryByTestId('format-panel')).not.toBeInTheDocument();
    });

    it('should handle null financial year', () => {
      const propsWithNullFinancialYear = {
        ...defaultProps,
        financialYear: null
      };
      render(<FinancialYearFormatPanel {...propsWithNullFinancialYear} />);
      expect(screen.getByTestId('format-panel')).toBeInTheDocument();
    });

    it('should handle financial year with missing properties', () => {
      const propsWithIncompleteFinancialYear = {
        ...defaultProps,
        financialYear: {
          startMonth: 'April'
          // endMonth is missing
        }
      };
      render(<FinancialYearFormatPanel {...propsWithIncompleteFinancialYear} />);
      expect(screen.getByTestId('format-panel')).toBeInTheDocument();
    });
  });

  describe('Callback Functions', () => {
    it('should handle all callback functions', () => {
      const mockOnClose = jest.fn();
      const mockOnSave = jest.fn();
      
      const propsWithCallbacks = {
        ...defaultProps,
        onClose: mockOnClose,
        onSave: mockOnSave
      };

      render(<FinancialYearFormatPanel {...propsWithCallbacks} />);

      fireEvent.click(screen.getByTestId('panel-close'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByTestId('panel-save'));
      expect(mockOnSave).toHaveBeenCalledWith('FY {yy} - {yy}', 'FY 2023-2024');
    });

    it('should handle callback functions with different parameters', () => {
      const mockOnSave = jest.fn();
      const propsWithSaveCallback = {
        ...defaultProps,
        onSave: mockOnSave
      };

      render(<FinancialYearFormatPanel {...propsWithSaveCallback} />);
      fireEvent.click(screen.getByTestId('panel-save'));
      expect(mockOnSave).toHaveBeenCalledWith('FY {yy} - {yy}', 'FY 2023-2024');
    });
  });

  describe('Format Panel Integration', () => {
    it('should pass correct props to FormatPanel', () => {
      const FormatPanel = require('../../../../src/components/common/FormatPanel/FormatPanel');
      render(<FinancialYearFormatPanel {...defaultProps} />);
      
      expect(FormatPanel).toHaveBeenCalledWith(
        expect.objectContaining({
          isOpen: true,
          onClose: defaultProps.onClose,
          onSave: expect.any(Function),
          title: 'Financial Year Name Format',
          formatOptions: expect.any(Array),
          currentFormat: 'FY {yy} - {yy}',
          previewText: expect.any(String),
          generatePreview: expect.any(Function)
        }),
        expect.any(Object)
      );
    });

    it('should handle FormatPanel save callback', () => {
      const FormatPanel = require('../../../../src/components/common/FormatPanel/FormatPanel');
      render(<FinancialYearFormatPanel {...defaultProps} />);
      
      const formatPanelProps = FormatPanel.mock.calls[0][0];
      formatPanelProps.onSave('FY {yyyy} - {yyyy}', 'FY 2024-2025');
      
      expect(defaultProps.onSave).toHaveBeenCalledWith('FY {yyyy} - {yyyy}', 'FY 2024-2025');
    });

    it('should handle FormatPanel preview generation', () => {
      const FormatPanel = require('../../../../src/components/common/FormatPanel/FormatPanel');
      render(<FinancialYearFormatPanel {...defaultProps} />);
      
      const formatPanelProps = FormatPanel.mock.calls[0][0];
      const preview = formatPanelProps.generatePreview('FY {yyyy} - {yyyy}');
      
      expect(preview).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing onClose callback', () => {
      const propsWithoutOnClose = {
        isOpen: true,
        onSave: jest.fn(),
        currentFormat: 'FY {yy} - {yy}'
      };
      render(<FinancialYearFormatPanel {...propsWithoutOnClose} />);
      expect(screen.getByTestId('format-panel')).toBeInTheDocument();
    });

    it('should handle missing onSave callback', () => {
      const propsWithoutOnSave = {
        isOpen: true,
        onClose: jest.fn(),
        currentFormat: 'FY {yy} - {yy}'
      };
      render(<FinancialYearFormatPanel {...propsWithoutOnSave} />);
      expect(screen.getByTestId('format-panel')).toBeInTheDocument();
    });

    it('should handle invalid financial year data', () => {
      const propsWithInvalidFinancialYear = {
        ...defaultProps,
        financialYear: {
          startMonth: 'InvalidMonth',
          endMonth: 'AnotherInvalidMonth'
        }
      };
      render(<FinancialYearFormatPanel {...propsWithInvalidFinancialYear} />);
      expect(screen.getByTestId('format-panel')).toBeInTheDocument();
    });
  });
});
