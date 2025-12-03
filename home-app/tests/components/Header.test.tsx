import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../../src/components/Header';

describe('Header component', () => {
  test('renders header text', () => {
    render(<Header />);

    const headerText = screen.getByText(/Home App Remote Application/i);
    expect(headerText).toBeInTheDocument();
    expect(headerText).toHaveClass('header');
  });
});
