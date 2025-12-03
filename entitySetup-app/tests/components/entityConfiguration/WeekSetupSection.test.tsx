import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import WeekSetupSection from '../../../src/components/entityConfiguration/WeekSetupSection';
import { MONTHS, WEEK_DAYS } from '../../../src/constants/periodSetupConstants';

// Mock React.lazy to return the component directly
jest.mock('react', () => {
  const actualReact = jest.requireActual('react');
  return {
    ...actualReact,
    lazy: (fn: () => Promise<any>) => {
      // Return a component that immediately resolves
      const LazyComponent = (props: any) => {
        const [Component, setComponent] = React.useState<any>(null);
        React.useEffect(() => {
          fn().then((module: any) => {
            setComponent(() => module.default || module);
          });
        }, []);
        if (!Component) return null;
        return React.createElement(Component, props);
      };
      return LazyComponent;
    },
  };
});

// Mock the constants
jest.mock('../../../src/constants/periodSetupConstants', () => ({
  MONTHS: [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
  ],
  WEEK_DAYS: [
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
  ],
}));

// Mock commonApp components - export as default for lazy loading
jest.mock('commonApp/TextField', () => {
  const MockTextField = function (props: any) {
    const handleClick = (e: React.MouseEvent) => {
      if (props.onClick) {
        props.onClick(e);
      }
    };
    return (
      <input
        data-testid="mock-text-field"
        value={props.value || ''}
        onChange={(e) => props.onChange?.(e.target.value)}
        onClick={handleClick}
        placeholder={props.placeholder || props.label}
        disabled={props.disabled}
        required={props.required}
        style={{ width: props.width }}
      />
    );
  };
  return { default: MockTextField };
});

jest.mock('commonApp/SelectField', () => {
  const MockSelectField = function (props: any) {
    return (
      <select
        data-testid="mock-select-field"
        value={props.value || ''}
        onChange={(e) => props.onChange(e.target.value)}
        disabled={props.disabled}
        required={props.required}
        style={{ width: props.width }}
      >
        <option value="">{props.placeholder}</option>
        {props.options && props.options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  };
  return { default: MockSelectField };
});

jest.mock('commonApp/ReadOnlyField', () => {
  return jest.fn((props) => (
    <div
      data-testid="mock-read-only-field"
      style={{ width: props.width }}
    >
      <label>{props.label}</label>
      <span>{props.value}</span>
    </div>
  ));
});

const theme = createTheme();

const defaultProps = {
  weekSetup: {
    name: 'Week-1',
    monthForWeekOne: '1',
    startingDayOfWeek: '1',
    format: 'Week-#',
  },
  onWeekSetupChange: jest.fn(),
  onFormatLinkClick: jest.fn(),
  isEditMode: false,
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('WeekSetupSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} />);
      expect(screen.getByText('Week Setup')).toBeInTheDocument();
    });

    it('displays week setup data correctly', () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} />);
      const textField = screen.getByTestId('mock-text-field');
      expect(textField).toHaveValue('Week-1');
      const selectFields = screen.getAllByTestId('mock-select-field');
      expect(selectFields[0]).toHaveValue('1');
      expect(selectFields[1]).toHaveValue('1');
    });

    it('shows format information', () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} />);
      expect(screen.getByText('Week Name Format')).toBeInTheDocument();
      expect(screen.getByText(/System default is 'Week-#'/)).toBeInTheDocument();
      expect(screen.getByText('here')).toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    it('renders form fields in edit mode', () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} isEditMode={true} />);
      expect(screen.getByTestId('mock-text-field')).toBeInTheDocument();
      expect(screen.getAllByTestId('mock-select-field')).toHaveLength(2);
    });

    it('handles text field changes in edit mode', () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} isEditMode={true} />);
      const textField = screen.getByTestId('mock-text-field');
      fireEvent.change(textField, { target: { value: 'New Week Name' } });
      // TextField onChange is a no-op, so onWeekSetupChange won't be called
      expect(defaultProps.onWeekSetupChange).not.toHaveBeenCalled();
    });

    it('handles month selection changes in edit mode', () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} isEditMode={true} />);
      const selectFields = screen.getAllByTestId('mock-select-field');
      fireEvent.change(selectFields[0], { target: { value: '2' } });
      expect(defaultProps.onWeekSetupChange).toHaveBeenCalledWith('monthForWeekOne', '2');
    });

    it('handles starting day selection changes in edit mode', () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} isEditMode={true} />);
      const selectFields = screen.getAllByTestId('mock-select-field');
      fireEvent.change(selectFields[1], { target: { value: '2' } });
      expect(defaultProps.onWeekSetupChange).toHaveBeenCalledWith('startingDayOfWeek', '2');
    });

    it('has disabled text field in edit mode', () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} isEditMode={true} />);
      const textField = screen.getByTestId('mock-text-field');
      expect(textField).toHaveAttribute('disabled');
    });

    it('has enabled select fields in edit mode', () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} isEditMode={true} />);
      const selectFields = screen.getAllByTestId('mock-select-field');
      selectFields.forEach(field => {
        expect(field).not.toHaveAttribute('disabled');
      });
    });

    it('calls onFormatLinkClick when format link is clicked in edit mode', () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} isEditMode={true} />);
      const formatLink = screen.getByText('here');
      fireEvent.click(formatLink);
      expect(defaultProps.onFormatLinkClick).toHaveBeenCalledTimes(1);
    });

    it('has clickable format link in edit mode', () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} isEditMode={true} />);
      const formatLink = screen.getByText('here');
      expect(formatLink).toHaveStyle('cursor: pointer');
    });
  });

  describe('Read-Only Mode', () => {
    it('renders disabled fields in read-only mode', () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} isEditMode={false} />);
      const textField = screen.getByTestId('mock-text-field');
      const selectFields = screen.getAllByTestId('mock-select-field');
      expect(textField).toHaveAttribute('disabled');
      selectFields.forEach(field => {
        expect(field).toHaveAttribute('disabled');
      });
    });

    it('does not call onFormatLinkClick when format link is clicked in read-only mode', () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} isEditMode={false} />);
      const formatLink = screen.getByText('here');
      fireEvent.click(formatLink);
      expect(defaultProps.onFormatLinkClick).not.toHaveBeenCalled();
    });

    it('has disabled format link in read-only mode', () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} isEditMode={false} />);
      const formatLink = screen.getByText('here');
      expect(formatLink).toHaveStyle('cursor: default');
    });
  });

  describe('Component Structure', () => {
    it('has proper section structure', () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} />);
      expect(screen.getByText('Week Setup')).toBeInTheDocument();
      expect(screen.getByText('Week Name Format')).toBeInTheDocument();
    });

    it('displays all required fields', () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} />);
      const textField = screen.getByTestId('mock-text-field');
      const selectFields = screen.getAllByTestId('mock-select-field');
      expect(textField).toBeInTheDocument();
      expect(selectFields).toHaveLength(2);
    });

    it('has proper form layout', () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} />);
      const section = screen.getByText('Week Setup').closest('.period-setup__section');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('displays week setup name correctly', () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} />);
      const textField = screen.getByTestId('mock-text-field');
      expect(textField).toHaveValue('Week-1');
    });

    it('displays month for week one correctly', () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} />);
      const selectFields = screen.getAllByTestId('mock-select-field');
      expect(selectFields[0]).toHaveValue('1');
    });

    it('displays starting day of week correctly', () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} />);
      const selectFields = screen.getAllByTestId('mock-select-field');
      expect(selectFields[1]).toHaveValue('1');
    });

    it('handles empty week setup data', () => {
      const emptyProps = {
        ...defaultProps,
        weekSetup: {
          name: '',
          monthForWeekOne: '',
          startingDayOfWeek: '',
          format: '',
        },
      };
      renderWithProviders(<WeekSetupSection {...emptyProps} />);
      expect(screen.getByText('Week Setup')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('handles multiple field changes', () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} isEditMode={true} />);
      const textField = screen.getByTestId('mock-text-field');
      const selectFields = screen.getAllByTestId('mock-select-field');
      
      fireEvent.change(textField, { target: { value: 'New Name' } });
      fireEvent.change(selectFields[0], { target: { value: '2' } });
      fireEvent.change(selectFields[1], { target: { value: '3' } });
      
      // TextField onChange is a no-op, so it won't call onWeekSetupChange
      expect(defaultProps.onWeekSetupChange).toHaveBeenCalledWith('monthForWeekOne', '2');
      expect(defaultProps.onWeekSetupChange).toHaveBeenCalledWith('startingDayOfWeek', '3');
    });

    it('handles TextField onClick to prevent default', async () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} isEditMode={true} />);
      await waitFor(() => {
        const textField = screen.getByTestId('mock-text-field');
        expect(textField).toBeInTheDocument();
      });
      const textField = screen.getByTestId('mock-text-field');
      const mockPreventDefault = jest.fn();
      const mockEvent = { 
        preventDefault: mockPreventDefault,
        stopPropagation: jest.fn(),
        currentTarget: textField,
        target: textField
      } as any;
      fireEvent.click(textField, mockEvent);
      // The onClick handler should call preventDefault
      expect(mockPreventDefault).toHaveBeenCalled();
    });

    it('handles format link click in edit mode', () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} isEditMode={true} />);
      const formatLink = screen.getByText('here');
      fireEvent.click(formatLink);
      expect(defaultProps.onFormatLinkClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper labels for all fields', () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} />);
      const textField = screen.getByTestId('mock-text-field');
      const selectFields = screen.getAllByTestId('mock-select-field');
      expect(textField).toHaveAttribute('placeholder', 'Auto generated');
      expect(selectFields).toHaveLength(2);
    });

    it('has proper section heading', () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} />);
      expect(screen.getByRole('heading', { level: 6, name: 'Week Setup' })).toBeInTheDocument();
    });

    it('has proper link for format information', () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} />);
      const formatLink = screen.getByText('here');
      expect(formatLink).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined week setup data', () => {
      const propsWithUndefined = {
        ...defaultProps,
        weekSetup: {
          name: undefined as any,
          monthForWeekOne: undefined as any,
          startingDayOfWeek: undefined as any,
          format: undefined as any,
        },
      };
      renderWithProviders(<WeekSetupSection {...propsWithUndefined} />);
      expect(screen.getByText('Week Setup')).toBeInTheDocument();
    });

    it('handles null week setup data', () => {
      const propsWithNull = {
        ...defaultProps,
        weekSetup: {
          name: null as any,
          monthForWeekOne: null as any,
          startingDayOfWeek: null as any,
          format: null as any,
        },
      };
      renderWithProviders(<WeekSetupSection {...propsWithNull} />);
      expect(screen.getByText('Week Setup')).toBeInTheDocument();
    });

    it('handles missing callback functions', () => {
      const propsWithoutCallbacks = {
        weekSetup: defaultProps.weekSetup,
        isEditMode: true,
      };
      renderWithProviders(<WeekSetupSection {...propsWithoutCallbacks} />);
      expect(screen.getByText('Week Setup')).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('re-renders when props change', () => {
      const { rerender } = renderWithProviders(<WeekSetupSection {...defaultProps} />);
      const textField = screen.getByTestId('mock-text-field');
      expect(textField).toHaveValue('Week-1');

      const newProps = {
        ...defaultProps,
        weekSetup: {
          ...defaultProps.weekSetup,
          name: 'Week-2',
        },
      };
      rerender(<WeekSetupSection {...newProps} />);
      const updatedTextField = screen.getByTestId('mock-text-field');
      expect(updatedTextField).toHaveValue('Week-2');
    });

    it('re-renders when edit mode changes', () => {
      const { rerender } = renderWithProviders(<WeekSetupSection {...defaultProps} isEditMode={false} />);
      const textField = screen.getByTestId('mock-text-field');
      expect(textField).toHaveAttribute('disabled');

      rerender(<WeekSetupSection {...defaultProps} isEditMode={true} />);
      expect(screen.getByTestId('mock-text-field')).toBeInTheDocument();
      expect(screen.getAllByTestId('mock-select-field')).toHaveLength(2);
    });
  });

  describe('Constants Integration', () => {
    it('uses MONTHS constant for month options', () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} isEditMode={true} />);
      const selectFields = screen.getAllByTestId('select-field');
      const monthSelect = selectFields[0];
      expect(monthSelect).toBeInTheDocument();
    });

    it('uses WEEK_DAYS constant for day options', () => {
      renderWithProviders(<WeekSetupSection {...defaultProps} isEditMode={true} />);
      const selectFields = screen.getAllByTestId('select-field');
      const daySelect = selectFields[1];
      expect(daySelect).toBeInTheDocument();
    });
  });
});
