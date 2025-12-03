import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StandardTextField from '../../../src/components/ProcessGroupBox/StandardTextField';

// Mock TextField
jest.mock('commonApp/TextField', () => {
  return ({ id, value, onChange, placeholder, required, fullWidth, size }: any) => (
    <input
      data-testid={`textfield-${id}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      data-fullwidth={fullWidth}
      data-size={size}
    />
  );
});

describe('StandardTextField', () => {
  const defaultProps = {
    id: 'test-field',
    value: '',
    onChange: jest.fn(),
    placeholder: 'Enter text'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render TextField with correct props', () => {
    render(<StandardTextField {...defaultProps} />);
    
    const input = screen.getByTestId('textfield-test-field');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Enter text');
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('data-fullwidth', 'true');
    expect(input).toHaveAttribute('data-size', 'small');
  });

  it('should call onChange when value changes', () => {
    render(<StandardTextField {...defaultProps} />);
    
    const input = screen.getByTestId('textfield-test-field');
    fireEvent.change(input, { target: { value: 'new value' } });
    
    expect(defaultProps.onChange).toHaveBeenCalledWith('new value');
  });

  it('should display current value', () => {
    render(<StandardTextField {...defaultProps} value="current value" />);
    
    const input = screen.getByTestId('textfield-test-field');
    expect(input).toHaveValue('current value');
  });

  it('should set required to false when provided', () => {
    render(<StandardTextField {...defaultProps} required={false} />);
    
    const input = screen.getByTestId('textfield-test-field');
    expect(input).not.toHaveAttribute('required');
  });

  it('should default required to true', () => {
    render(<StandardTextField {...defaultProps} />);
    
    const input = screen.getByTestId('textfield-test-field');
    expect(input).toHaveAttribute('required');
  });
});

