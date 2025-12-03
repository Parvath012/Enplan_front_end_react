/**
 * Unit tests for UserNode component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from 'reactflow';
import UserNode from '../../../src/components/reportingStructure/UserNode';
import { DEFAULT_BORDER_COLOR } from '../../../src/constants/reportingStructureConstants';

const renderWithProvider = (component: React.ReactElement) => {
  return render(<ReactFlowProvider>{component}</ReactFlowProvider>);
};

describe('UserNode', () => {
  const defaultProps = {
    data: {
      label: 'John Doe',
      fullName: 'John Doe',
      designation: 'Developer',
      department: 'IT',
      borderColor: DEFAULT_BORDER_COLOR,
    },
  };

  it('should render user node with all information', () => {
    renderWithProvider(<UserNode {...defaultProps} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/Designation:/)).toBeInTheDocument();
    expect(screen.getByText(/Developer/)).toBeInTheDocument();
    expect(screen.getByText(/Department:/)).toBeInTheDocument();
    expect(screen.getByText(/IT/)).toBeInTheDocument();
  });

  it('should generate initials from full name', () => {
    renderWithProvider(<UserNode {...defaultProps} />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should generate initials from single word name', () => {
    const props = {
      data: {
        ...defaultProps.data,
        fullName: 'John',
      },
    };
    renderWithProvider(<UserNode {...props} />);
    expect(screen.getByText('JO')).toBeInTheDocument();
  });

  it('should generate initials from multiple words', () => {
    const props = {
      data: {
        ...defaultProps.data,
        fullName: 'John Michael Doe',
      },
    };
    renderWithProvider(<UserNode {...props} />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should handle empty name', () => {
    const props = {
      data: {
        ...defaultProps.data,
        fullName: '',
      },
    };
    renderWithProvider(<UserNode {...props} />);
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('should use custom border color', () => {
    const props = {
      data: {
        ...defaultProps.data,
        borderColor: '#FF0000',
      },
    };
    const { container } = renderWithProvider(<UserNode {...props} />);
    const node = container.querySelector('div');
    expect(node).toHaveStyle({ border: '1px solid #FF0000' });
  });

  it('should use default border color when not provided', () => {
    const props = {
      data: {
        ...defaultProps.data,
        borderColor: undefined,
      },
    };
    const { container } = renderWithProvider(<UserNode {...props} />);
    const node = container.querySelector('div');
    expect(node).toHaveStyle({ border: `1px solid ${DEFAULT_BORDER_COLOR}` });
  });

  it('should display total descendants count when greater than 0', () => {
    const props = {
      data: {
        ...defaultProps.data,
        totalDescendantsCount: 5,
      },
    };
    renderWithProvider(<UserNode {...props} />);
    expect(screen.getByText('05')).toBeInTheDocument();
  });

  it('should display total descendants count with two digits for numbers less than 10', () => {
    const props = {
      data: {
        ...defaultProps.data,
        totalDescendantsCount: 8,
      },
    };
    renderWithProvider(<UserNode {...props} />);
    expect(screen.getByText('08')).toBeInTheDocument();
  });

  it('should display total descendants count without leading zero for numbers 10 or greater', () => {
    const props = {
      data: {
        ...defaultProps.data,
        totalDescendantsCount: 15,
      },
    };
    renderWithProvider(<UserNode {...props} />);
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('should not display count badge when totalDescendantsCount is 0', () => {
    const props = {
      data: {
        ...defaultProps.data,
        totalDescendantsCount: 0,
      },
    };
    renderWithProvider(<UserNode {...props} />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should not display count badge when totalDescendantsCount is undefined', () => {
    renderWithProvider(<UserNode {...defaultProps} />);
    const badge = screen.queryByText(/\d+/);
    expect(badge).not.toBeInTheDocument();
  });

  it('should handle N/A designation', () => {
    const props = {
      data: {
        ...defaultProps.data,
        designation: 'N/A',
      },
    };
    renderWithProvider(<UserNode {...props} />);
    expect(screen.getByText(/N\/A/)).toBeInTheDocument();
  });

  it('should handle N/A department', () => {
    const props = {
      data: {
        ...defaultProps.data,
        department: 'N/A',
      },
    };
    renderWithProvider(<UserNode {...props} />);
    expect(screen.getByText(/N\/A/)).toBeInTheDocument();
  });

  it('should render handles for React Flow connections', () => {
    const { container } = render(<UserNode {...defaultProps} />);
    const handles = container.querySelectorAll('[data-handleid]');
    expect(handles.length).toBeGreaterThan(0);
  });

  it('should have correct node dimensions', () => {
    const { container } = render(<UserNode {...defaultProps} />);
    const node = container.querySelector('div');
    expect(node).toHaveStyle({ width: '246px', height: '80px' });
  });
});

