import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StandardSelectField from '../../../src/components/ProcessGroupBox/StandardSelectField';

// Mock SelectField
jest.mock('commonApp/SelectField', () => {
  return ({ id, value, onChange, options, placeholder, required, fullWidth, size }: any) => (
    <select
      data-testid={`selectfield-${id}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-placeholder={placeholder}
      required={required}
      data-fullwidth={fullWidth}
      data-size={size}
    >
      {options?.map((opt: string) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
});

describe('StandardSelectField', () => {
  const defaultProps = {
    id: 'test-select',
    value: '',
    onChange: jest.fn(),
    options: ['Option 1', 'Option 2', 'Option 3'],
    placeholder: 'Select an option'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render SelectField with correct props', () => {
    render(<StandardSelectField {...defaultProps} />);
    
    const select = screen.getByTestId('selectfield-test-select');
    expect(select).toBeInTheDocument();
    expect(select).toHaveAttribute('data-placeholder', 'Select an option');
    expect(select).toHaveAttribute('required');
    expect(select).toHaveAttribute('data-fullwidth', 'true');
    expect(select).toHaveAttribute('data-size', 'small');
  });

  it('should render all options', () => {
    render(<StandardSelectField {...defaultProps} />);
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('should call onChange when value changes', () => {
    render(<StandardSelectField {...defaultProps} />);
    
    const select = screen.getByTestId('selectfield-test-select');
    fireEvent.change(select, { target: { value: 'Option 2' } });
    
    expect(defaultProps.onChange).toHaveBeenCalledWith('Option 2');
  });

  it('should display current value', () => {
    render(<StandardSelectField {...defaultProps} value="Option 2" />);
    
    const select = screen.getByTestId('selectfield-test-select');
    expect(select).toHaveValue('Option 2');
  });

  it('should set required to false when provided', () => {
    render(<StandardSelectField {...defaultProps} required={false} />);
    
    const select = screen.getByTestId('selectfield-test-select');
    expect(select).not.toHaveAttribute('required');
  });

  it('should default required to true', () => {
    render(<StandardSelectField {...defaultProps} />);
    
    const select = screen.getByTestId('selectfield-test-select');
    expect(select).toHaveAttribute('required');
  });

  it('should handle empty options array', () => {
    render(<StandardSelectField {...defaultProps} options={[]} />);
    
    const select = screen.getByTestId('selectfield-test-select');
    expect(select).toBeInTheDocument();
    expect(select.children).toHaveLength(0);
  });
});

