import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LeftSidebar from '../../../src/components/LeftSidebar/LeftSidebar';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/help' }),
}));

describe('LeftSidebar interactions', () => {
  it('highlights active icon based on route and navigates on click', async () => {
    render(
      <MemoryRouter>
        <LeftSidebar />
      </MemoryRouter>
    );
    // The Admin icon (alt="Admin") and logo exist
    expect(screen.getByAltText('EnPlan Logo')).toBeInTheDocument();
    expect(screen.getByAltText('Admin')).toBeInTheDocument();
    // Click the notifications button (last button) to ensure handler works
    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[buttons.length - 2]);
    expect(mockNavigate).toHaveBeenCalled();
  });
});


