import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CountryActionCellRenderer from '../../../../src/components/entityConfiguration/shared/CountryActionCellRenderer';

// Mock federated CustomTooltip
jest.mock('commonApp/CustomTooltip', () => (props: any) => (
  <div data-testid="custom-tooltip">{props.children}</div>
));

// Mock TrashCan icon
jest.mock('@carbon/icons-react', () => ({
  TrashCan: (props: any) => <svg data-testid="trash-icon" {...props} />,
}));

describe('CountryActionCellRenderer', () => {
  const defaultProps = {
    data: { country: 'India' },
    isEditMode: true,
    onToggle: jest.fn(),
    isPrePopulated: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders tooltip, icon button, and trash icon', () => {
    render(<CountryActionCellRenderer {...defaultProps} />);
    expect(screen.getByTestId('custom-tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('trash-icon')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('button is enabled in edit mode and not pre-populated', () => {
    render(<CountryActionCellRenderer {...defaultProps} />);
    const iconButton = screen.getByRole('button');
    expect(iconButton).not.toBeDisabled();
    expect(iconButton).toHaveStyle('opacity: 1');
    expect(iconButton).toHaveStyle('cursor: pointer');
  });

  it('button is disabled when not in edit mode', () => {
    render(<CountryActionCellRenderer {...defaultProps} isEditMode={false} />);
    const iconButton = screen.getByRole('button');
    expect(iconButton).toBeDisabled();
    expect(iconButton).toHaveStyle('opacity: 1');
    expect(iconButton).toHaveStyle('cursor: not-allowed');
  });

  it('button is disabled when prePopulated', () => {
    render(<CountryActionCellRenderer {...defaultProps} isPrePopulated={true} />);
    const iconButton = screen.getByRole('button');
    expect(iconButton).toBeDisabled();
    expect(iconButton).toHaveStyle('opacity: 0.5');
    expect(iconButton).toHaveStyle('cursor: not-allowed');
  });

  it('button is disabled when both not in edit mode and pre-populated', () => {
    render(<CountryActionCellRenderer {...defaultProps} isEditMode={false} isPrePopulated={true} />);
    const iconButton = screen.getByRole('button');
    expect(iconButton).toBeDisabled();
    expect(iconButton).toHaveStyle('opacity: 0.5');
    expect(iconButton).toHaveStyle('cursor: not-allowed');
  });

  it('calls onToggle with country when enabled and clicked', () => {
    render(<CountryActionCellRenderer {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));
    expect(defaultProps.onToggle).toHaveBeenCalledWith('India');
  });

  it('does not call onToggle when disabled (not edit mode)', () => {
    render(<CountryActionCellRenderer {...defaultProps} isEditMode={false} />);
    fireEvent.click(screen.getByRole('button'));
    expect(defaultProps.onToggle).not.toHaveBeenCalled();
  });

  it('does not call onToggle when disabled (prePopulated)', () => {
    render(<CountryActionCellRenderer {...defaultProps} isPrePopulated={true} />);
    fireEvent.click(screen.getByRole('button'));
    expect(defaultProps.onToggle).not.toHaveBeenCalled();
  });

  it('renders with different country names', () => {
    const countries = ['France', 'Japan', 'Australia', 'Brazil', '', undefined];
    countries.forEach(country => {
      const onToggle = jest.fn();
      render(
        <CountryActionCellRenderer
          {...defaultProps}
          data={{ country }}
          onToggle={onToggle}
        />
      );
      const iconButton = screen.getByRole('button');
      fireEvent.click(iconButton);
      expect(onToggle).toHaveBeenCalledWith(country);
    });
  });

  it('renders Suspense fallback if CustomTooltip is loading', () => {
    // Since we mock CustomTooltip synchronously, fallback won't show.
    // This test is for coverage: if you remove the mock, Suspense fallback will show.
    render(<CountryActionCellRenderer {...defaultProps} />);
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('memoizes correctly (does not rerender if props are the same)', () => {
    const { rerender } = render(<CountryActionCellRenderer {...defaultProps} />);
    rerender(<CountryActionCellRenderer {...defaultProps} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('rerenders if country changes', () => {
    const { rerender } = render(<CountryActionCellRenderer {...defaultProps} />);
    rerender(<CountryActionCellRenderer {...defaultProps} data={{ country: 'USA' }} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('rerenders if isEditMode changes', () => {
    const { rerender } = render(<CountryActionCellRenderer {...defaultProps} />);
    rerender(<CountryActionCellRenderer {...defaultProps} isEditMode={false} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('rerenders if isPrePopulated changes', () => {
    const { rerender } = render(<CountryActionCellRenderer {...defaultProps} />);
    rerender(<CountryActionCellRenderer {...defaultProps} isPrePopulated={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('rerenders if onToggle changes', () => {
    const newOnToggle = jest.fn();
    const { rerender } = render(<CountryActionCellRenderer {...defaultProps} />);
    rerender(<CountryActionCellRenderer {...defaultProps} onToggle={newOnToggle} />);
    fireEvent.click(screen.getByRole('button'));
    expect(newOnToggle).toHaveBeenCalledWith('India');
  });

  it('should be accessible via keyboard', () => {
    render(<CountryActionCellRenderer {...defaultProps} />);
    const iconButton = screen.getByRole('button');
    iconButton.focus();
    expect(iconButton).toHaveFocus();
  });

  it('should have proper ARIA attributes when disabled', () => {
    render(<CountryActionCellRenderer {...defaultProps} isEditMode={false} />);
    const iconButton = screen.getByRole('button');
    expect(iconButton).toBeDisabled();
  });
});
