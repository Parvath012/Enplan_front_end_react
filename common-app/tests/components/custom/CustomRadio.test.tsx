import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import CustomRadio from '../../../src/components/custom/CustomRadio';

// Create a theme for testing
const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('CustomRadio', () => {
  it('renders without crashing', () => {
    renderWithTheme(<CustomRadio />);
    const radio = screen.getByRole('radio');
    expect(radio).toBeInTheDocument();
  });

  it('applies custom className', () => {
    renderWithTheme(<CustomRadio className="custom-class" />);
    const radio = screen.getByRole('radio');
    // Material-UI applies className to the root element, not the input
    const radioContainer = radio.closest('.MuiRadio-root');
    expect(radioContainer).toHaveClass('custom-class');
  });

  it('handles checked state correctly', () => {
    renderWithTheme(<CustomRadio checked={true} />);
    const radio = screen.getByRole('radio');
    expect(radio).toBeChecked();
  });

  it('handles unchecked state correctly', () => {
    renderWithTheme(<CustomRadio checked={false} />);
    const radio = screen.getByRole('radio');
    expect(radio).not.toBeChecked();
  });

  it('handles disabled state correctly', () => {
    renderWithTheme(<CustomRadio disabled={true} />);
    const radio = screen.getByRole('radio');
    expect(radio).toBeDisabled();
  });

  it('handles enabled state correctly', () => {
    renderWithTheme(<CustomRadio disabled={false} />);
    const radio = screen.getByRole('radio');
    expect(radio).not.toBeDisabled();
  });

  it('calls onChange when clicked', () => {
    const handleChange = jest.fn();
    renderWithTheme(<CustomRadio onChange={handleChange} />);
    const radio = screen.getByRole('radio');
    
    fireEvent.click(radio);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('calls onChange with correct event', () => {
    const handleChange = jest.fn();
    renderWithTheme(<CustomRadio onChange={handleChange} />);
    const radio = screen.getByRole('radio');
    
    fireEvent.click(radio);
    expect(handleChange).toHaveBeenCalledTimes(1);
    // Check that the event has the expected properties
    const event = handleChange.mock.calls[0][0];
    expect(event).toHaveProperty('target');
    expect(event).toHaveProperty('type', 'change');
  });

  it('applies all props correctly', () => {
    const handleChange = jest.fn();
    const props = {
      checked: true,
      disabled: false,
      onChange: handleChange,
      className: 'test-class',
      'data-testid': 'custom-radio'
    };
    
    renderWithTheme(<CustomRadio {...props} />);
    const radio = screen.getByTestId('custom-radio');
    
    // Check that the radio is checked by looking for the checked class
    const radioContainer = radio.closest('.MuiRadio-root');
    expect(radioContainer).toHaveClass('custom-radio__checked');
    expect(radio).not.toBeDisabled();
    expect(radioContainer).toHaveClass('test-class');
  });

  it('renders with default props when no props provided', () => {
    renderWithTheme(<CustomRadio />);
    const radio = screen.getByRole('radio');
    
    expect(radio).not.toBeChecked();
    expect(radio).not.toBeDisabled();
  });

  it('handles multiple clicks correctly', () => {
    const handleChange = jest.fn();
    renderWithTheme(<CustomRadio onChange={handleChange} />);
    const radio = screen.getByRole('radio');
    
    // Radio buttons only trigger onChange when their state changes
    // Since it starts unchecked, first click will trigger onChange
    fireEvent.click(radio);
    expect(handleChange).toHaveBeenCalledTimes(1);
    
    // Additional clicks on the same radio don't trigger onChange
    fireEvent.click(radio);
    fireEvent.click(radio);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('maintains accessibility attributes', () => {
    renderWithTheme(<CustomRadio aria-label="Test radio" />);
    const radio = screen.getByRole('radio');
    // Check if aria-label is passed through (it might be on the root element)
    const radioContainer = radio.closest('.MuiRadio-root');
    expect(radioContainer).toHaveAttribute('aria-label', 'Test radio');
  });

  it('handles focus correctly', () => {
    renderWithTheme(<CustomRadio />);
    const radio = screen.getByRole('radio');
    
    // Focus the radio button
    act(() => {
      radio.focus();
    });
    expect(radio).toHaveFocus();
  });

  it('handles blur correctly', () => {
    renderWithTheme(<CustomRadio />);
    const radio = screen.getByRole('radio');
    
    // Focus then blur the radio button
    act(() => {
      radio.focus();
    });
    expect(radio).toHaveFocus();
    
    act(() => {
      radio.blur();
    });
    expect(radio).not.toHaveFocus();
  });
});
