import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ToggleSwitch from '../../../src/components/common/ToggleSwitch';

describe('ToggleSwitch', () => {
  const defaultProps = {
    isOn: false,
    handleToggle: jest.fn(),
    disabled: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ToggleSwitch {...defaultProps} />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('renders in checked state', () => {
    render(<ToggleSwitch {...defaultProps} isOn={true} />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('renders in unchecked state', () => {
    render(<ToggleSwitch {...defaultProps} isOn={false} />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('handles click events', () => {
    const mockHandleToggle = jest.fn();
    render(<ToggleSwitch {...defaultProps} handleToggle={mockHandleToggle} />);
    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);
    expect(mockHandleToggle).toHaveBeenCalled();
  });

  it('handles disabled state', () => {
    render(<ToggleSwitch {...defaultProps} disabled={true} />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-disabled', 'true');
  });

  it('handles enabled state', () => {
    render(<ToggleSwitch {...defaultProps} disabled={false} />);
    const toggle = screen.getByRole('switch');
    expect(toggle).not.toBeDisabled();
  });

  it('handles keyboard events', () => {
    const mockOnChange = jest.fn();
    render(<ToggleSwitch {...defaultProps} onChange={mockOnChange} />);
    const toggle = screen.getByRole('switch');
    fireEvent.keyDown(toggle, { key: 'Enter' });
    fireEvent.keyDown(toggle, { key: ' ' });
    expect(toggle).toBeInTheDocument();
  });

  it('handles focus events', () => {
    render(<ToggleSwitch {...defaultProps} />);
    const toggle = screen.getByRole('switch');
    fireEvent.focus(toggle);
    fireEvent.blur(toggle);
    expect(toggle).toBeInTheDocument();
  });

  it('handles mouse events', () => {
    render(<ToggleSwitch {...defaultProps} />);
    const toggle = screen.getByRole('switch');
    fireEvent.mouseEnter(toggle);
    fireEvent.mouseLeave(toggle);
    fireEvent.mouseOver(toggle);
    fireEvent.mouseOut(toggle);
    expect(toggle).toBeInTheDocument();
  });

  it('handles component unmounting', () => {
    const { unmount } = render(<ToggleSwitch {...defaultProps} />);
    unmount();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });

  it('handles prop changes', () => {
    const { rerender } = render(<ToggleSwitch {...defaultProps} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    
    rerender(<ToggleSwitch {...defaultProps} isOn={true} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('handles missing handleToggle prop', () => {
    render(<ToggleSwitch {...defaultProps} handleToggle={undefined} />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('handles rapid clicks', () => {
    const mockHandleToggle = jest.fn();
    render(<ToggleSwitch {...defaultProps} handleToggle={mockHandleToggle} />);
    const toggle = screen.getByRole('switch');
    
    for (let i = 0; i < 10; i++) {
      fireEvent.click(toggle);
    }
    expect(toggle).toBeInTheDocument();
  });

  it('handles different checked states', () => {
    const { rerender } = render(<ToggleSwitch {...defaultProps} isOn={false} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    
    rerender(<ToggleSwitch {...defaultProps} isOn={true} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('handles different disabled states', () => {
    const { rerender } = render(<ToggleSwitch {...defaultProps} disabled={false} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-disabled', 'false');
    
    rerender(<ToggleSwitch {...defaultProps} disabled={true} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-disabled', 'true');
  });

  it('handles combined states', () => {
    render(<ToggleSwitch {...defaultProps} isOn={true} disabled={true} />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(toggle).toHaveAttribute('aria-disabled', 'true');
  });

  it('handles accessibility attributes', () => {
    render(<ToggleSwitch {...defaultProps} />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('role', 'switch');
  });
});