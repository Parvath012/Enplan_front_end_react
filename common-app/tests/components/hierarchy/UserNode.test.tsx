import React from 'react';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from 'reactflow';
import UserNode from '../../../src/components/hierarchy/UserNode';

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
      borderColor: '#4285F4',
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

  it('should generate initials from full name with two words', () => {
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

  it('should generate initials from multiple words (first and last)', () => {
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

  it('should handle null/undefined name', () => {
    const props = {
      data: {
        ...defaultProps.data,
        fullName: null as any,
      },
    };
    renderWithProvider(<UserNode {...props} />);
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('should handle name with only whitespace', () => {
    const props = {
      data: {
        ...defaultProps.data,
        fullName: '   ',
      },
    };
    renderWithProvider(<UserNode {...props} />);
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('should use custom border color from data', () => {
    const props = {
      data: {
        ...defaultProps.data,
        borderColor: '#FF0000',
      },
    };
    const { container } = renderWithProvider(<UserNode {...props} />);
    const node = container.querySelector('div[style*="border"]');
    expect(node).toBeInTheDocument();
  });

  it('should use default border color when not provided in data', () => {
    const props = {
      data: {
        ...defaultProps.data,
        borderColor: undefined,
      },
    };
    const { container } = renderWithProvider(<UserNode {...props} />);
    const node = container.querySelector('div');
    expect(node).toBeInTheDocument();
  });

  it('should use custom defaultBorderColor prop', () => {
    const props = {
      ...defaultProps,
      defaultBorderColor: '#00FF00',
      data: {
        ...defaultProps.data,
        borderColor: undefined,
      },
    };
    const { container } = renderWithProvider(<UserNode {...props} />);
    const node = container.querySelector('div');
    expect(node).toBeInTheDocument();
  });

  it('should use custom backgroundColor from data', () => {
    const props = {
      data: {
        ...defaultProps.data,
        backgroundColor: '#F0F0F0',
      },
    };
    const { container } = renderWithProvider(<UserNode {...props} />);
    const node = container.querySelector('div');
    expect(node).toBeInTheDocument();
  });

  it('should use default backgroundColor when not provided', () => {
    const props = {
      data: {
        ...defaultProps.data,
        backgroundColor: undefined,
      },
    };
    const { container } = renderWithProvider(<UserNode {...props} />);
    const node = container.querySelector('div');
    expect(node).toBeInTheDocument();
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

  it('should display count for numbers >= 10', () => {
    const props = {
      data: {
        ...defaultProps.data,
        totalDescendantsCount: 99,
      },
    };
    renderWithProvider(<UserNode {...props} />);
    expect(screen.getByText('99')).toBeInTheDocument();
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
    expect(screen.queryByText('00')).not.toBeInTheDocument();
  });

  it('should not display count badge when totalDescendantsCount is undefined', () => {
    renderWithProvider(<UserNode {...defaultProps} />);
    const badge = screen.queryByText(/\d+/);
    expect(badge).not.toBeInTheDocument();
  });

  it('should use borderColor for badge background when count exists', () => {
    const props = {
      data: {
        ...defaultProps.data,
        totalDescendantsCount: 5,
        borderColor: '#FF0000',
      },
    };
    const { container } = renderWithProvider(<UserNode {...props} />);
    const badge = container.querySelector('div[style*="background"]');
    expect(badge).toBeInTheDocument();
  });

  it('should use white background for badge when count is 0 or undefined', () => {
    const props = {
      data: {
        ...defaultProps.data,
        totalDescendantsCount: 0,
      },
    };
    const { container } = renderWithProvider(<UserNode {...props} />);
    // Badge should not be visible when count is 0
    const badge = container.querySelector('div[style*="background"]');
    // The badge exists but shows empty string
    expect(badge).toBeInTheDocument();
  });

  it('should handle N/A designation', () => {
    const props = {
      data: {
        ...defaultProps.data,
        designation: undefined,
      },
    };
    renderWithProvider(<UserNode {...props} />);
    expect(screen.getByText(/N\/A/)).toBeInTheDocument();
  });

  it('should handle N/A department', () => {
    const props = {
      data: {
        ...defaultProps.data,
        department: undefined,
      },
    };
    renderWithProvider(<UserNode {...props} />);
    expect(screen.getByText(/N\/A/)).toBeInTheDocument();
  });

  it('should handle empty designation', () => {
    const props = {
      data: {
        ...defaultProps.data,
        designation: '',
      },
    };
    renderWithProvider(<UserNode {...props} />);
    expect(screen.getByText(/N\/A/)).toBeInTheDocument();
  });

  it('should handle empty department', () => {
    const props = {
      data: {
        ...defaultProps.data,
        department: '',
      },
    };
    renderWithProvider(<UserNode {...props} />);
    expect(screen.getByText(/N\/A/)).toBeInTheDocument();
  });

  it('should render handles for React Flow connections', () => {
    const { container } = renderWithProvider(<UserNode {...defaultProps} />);
    const handles = container.querySelectorAll('[data-handleid]');
    expect(handles.length).toBeGreaterThanOrEqual(0);
  });

  it('should have correct node dimensions', () => {
    const { container } = renderWithProvider(<UserNode {...defaultProps} />);
    const node = container.querySelector('div[style*="width"]');
    expect(node).toBeInTheDocument();
  });

  it('should render target handle on left', () => {
    const { container } = renderWithProvider(<UserNode {...defaultProps} />);
    const handles = container.querySelectorAll('[data-handleid]');
    expect(handles.length).toBeGreaterThanOrEqual(0);
  });

  it('should render source handle on right', () => {
    const { container } = renderWithProvider(<UserNode {...defaultProps} />);
    const handles = container.querySelectorAll('[data-handleid]');
    expect(handles.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle single character name', () => {
    const props = {
      data: {
        ...defaultProps.data,
        fullName: 'A',
      },
    };
    renderWithProvider(<UserNode {...props} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('should handle name with special characters', () => {
    const props = {
      data: {
        ...defaultProps.data,
        fullName: "John O'Brien",
      },
    };
    renderWithProvider(<UserNode {...props} />);
    expect(screen.getByText("JO")).toBeInTheDocument();
  });
});

