import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DataRefreshButton from '../../../../../src/components/tablecomponents/tablefooter/components/DataRefresh';

describe('DataRefreshButton', () => {
  it('renders the button with correct text and icon', () => {
    render(<DataRefreshButton onRefresh={jest.fn()} />);
    const button = screen.getByRole('button', { name: /refresh data/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/data refresh/i);
    expect(button.querySelector('.refresh-icon')).toBeInTheDocument();
  });

  it('calls onRefresh when clicked', () => {
    const onRefresh = jest.fn();
    render(<DataRefreshButton onRefresh={onRefresh} />);
    const button = screen.getByRole('button', { name: /refresh data/i });
    fireEvent.click(button);
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('is disabled when onRefresh is not provided', () => {
    render(<DataRefreshButton />);
    const button = screen.getByRole('button', { name: /refresh data/i });
    expect(button).toBeDisabled();
  });

  it('is enabled when onRefresh is provided', () => {
    render(<DataRefreshButton onRefresh={jest.fn()} />);
    const button = screen.getByRole('button', { name: /refresh data/i });
    expect(button).not.toBeDisabled();
  });

  it('has the correct className', () => {
    render(<DataRefreshButton onRefresh={jest.fn()} />);
    const button = screen.getByRole('button', { name: /refresh data/i });
    expect(button).toHaveClass('data-refresh');
  });
});