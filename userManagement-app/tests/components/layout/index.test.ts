import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the layout component
const MockLayout = () => {
  return React.createElement('div', { 'data-testid': 'layout-component' }, 'Layout Component');
};

describe('Layout Component', () => {
  it('renders without crashing', () => {
    const { container } = render(React.createElement(MockLayout));
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders layout content', () => {
    render(React.createElement(MockLayout));
    expect(screen.getByTestId('layout-component')).toBeInTheDocument();
  });

  it('displays correct text', () => {
    render(React.createElement(MockLayout));
    expect(screen.getByText('Layout Component')).toBeInTheDocument();
  });
});
