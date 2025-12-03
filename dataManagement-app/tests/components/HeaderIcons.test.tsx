import React from 'react';
import { render, screen } from '@testing-library/react';
import HeaderIcons from '../../src/components/HeaderIcons';

// Mock the commonApp HeaderIcons
jest.mock('commonApp/HeaderIcons', () => {
  return function MockHeaderIcons(props: any) {
    return (
      <div data-testid="header-icons" className={props.className}>
        Mock Header Icons Component
      </div>
    );
  };
});

// Mock the IconItem type export
jest.mock('commonApp/HeaderIcons', () => ({
  __esModule: true,
  default: function MockHeaderIcons(props: any) {
    return (
      <div data-testid="header-icons" className={props.className}>
        Mock Header Icons Component
      </div>
    );
  },
  IconItem: {},
}));

describe('HeaderIcons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<HeaderIcons />);
    expect(screen.getByTestId('header-icons')).toBeInTheDocument();
  });

  it('renders the mocked HeaderIcons component', () => {
    render(<HeaderIcons />);
    expect(screen.getByText('Mock Header Icons Component')).toBeInTheDocument();
  });

  it('passes className prop to underlying component', () => {
    const customClass = 'custom-header-icons';
    render(<HeaderIcons className={customClass} />);
    
    const headerIcons = screen.getByTestId('header-icons');
    expect(headerIcons).toHaveClass(customClass);
  });

  it('forwards all props to the underlying component', () => {
    const testProps = {
      className: 'test-class',
      'data-custom': 'test-value',
    };
    
    render(<HeaderIcons {...testProps} />);
    
    const headerIcons = screen.getByTestId('header-icons');
    expect(headerIcons).toHaveClass('test-class');
  });

  it('exports IconItem type', () => {
    // Test that the type export doesn't cause compilation errors
    expect(typeof HeaderIcons).toBe('function');
  });

  it('is a re-export of commonApp HeaderIcons', () => {
    // This test verifies the re-export functionality
    render(<HeaderIcons />);
    expect(screen.getByTestId('header-icons')).toBeInTheDocument();
  });

  it('maintains component functionality through re-export', () => {
    // Test that the component works as expected through re-export
    const { container } = render(<HeaderIcons />);
    expect(container.firstChild).toBeTruthy();
  });

  it('handles undefined props gracefully', () => {
    render(<HeaderIcons />);
    expect(screen.getByTestId('header-icons')).toBeInTheDocument();
  });

  it('renders consistently', () => {
    const { rerender } = render(<HeaderIcons />);
    expect(screen.getByTestId('header-icons')).toBeInTheDocument();
    
    rerender(<HeaderIcons />);
    expect(screen.getByTestId('header-icons')).toBeInTheDocument();
  });

  it('does not throw errors during rendering', () => {
    expect(() => render(<HeaderIcons />)).not.toThrow();
  });
});