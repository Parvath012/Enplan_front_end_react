import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CreateTeamGroupButton from '../../../src/components/teamGroup/CreateTeamGroupButton';

describe('CreateTeamGroupButton', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render create button', () => {
    render(<CreateTeamGroupButton onClick={mockOnClick} />);
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    render(<CreateTeamGroupButton onClick={mockOnClick} />);
    const button = screen.getByText('Create');
    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<CreateTeamGroupButton onClick={mockOnClick} disabled={true} />);
    const button = screen.getByRole('button', { name: /create/i });
    expect(button).toBeDisabled();
  });

  it('should not call onClick when disabled', () => {
    render(<CreateTeamGroupButton onClick={mockOnClick} disabled={true} />);
    const button = screen.getByRole('button', { name: /create/i });
    fireEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled();
  });
});

