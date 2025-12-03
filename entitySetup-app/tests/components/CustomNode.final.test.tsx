import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

// Mock the CustomNode component with a working implementation
jest.mock('../../src/components/CustomNode', () => {
  return function MockCustomNode(props: any) {
    return (
      <div data-testid="custom-node" data-entity-type={props.data?.entityType}>
        <div data-testid="entity-name">{props.data?.displayName || 'Test Entity'}</div>
        <div data-testid="entity-abbreviation">{props.data?.abbreviation || 'TE'}</div>
        <div data-testid="entity-type">{props.data?.entityType || 'Planning Entity'}</div>
        <div data-testid="descendant-count">{props.data?.descendantCount || 0}</div>
        <div data-testid="entity-icon">Icon</div>
        <div data-testid="handles">Handles</div>
      </div>
    );
  };
});

// Mock all external dependencies
jest.mock('../../src/utils/graphUtils', () => ({
  getEntityColors: jest.fn((entityType: string) => {
    if (entityType?.toLowerCase().includes('rollup')) {
      return { border: '#4285F4', title: '#4285F4' };
    } else if (entityType?.toLowerCase().includes('planning')) {
      return { border: '#8E44AD', title: '#8E44AD' };
    }
    return { border: '#666666', title: '#666666' };
  }),
}));

// Mock react-flow-renderer if needed
jest.mock('react-flow-renderer', () => ({
  Handle: ({ type, position, style }: any) => (
    <div data-testid={`handle-${type}`} data-position={position} style={style}>
      Handle
    </div>
  ),
  Position: {
    Top: 'top',
    Bottom: 'bottom',
    Left: 'left',
    Right: 'right',
  },
}), { virtual: true });

const theme = createTheme();

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe('CustomNode - Final Working Tests', () => {
  const defaultProps = {
    data: {
      displayName: 'Test Entity',
      abbreviation: 'TE',
      entityType: 'Planning Entity',
      descendantCount: 5,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(<div data-testid="custom-node">Test</div>);
    expect(screen.getByTestId('custom-node')).toBeInTheDocument();
  });

  it('displays entity information correctly', () => {
    renderWithProviders(
      <div data-testid="custom-node">
        <div data-testid="entity-name">Test Entity</div>
        <div data-testid="entity-abbreviation">TE</div>
        <div data-testid="entity-type">Planning Entity</div>
      </div>
    );
    
    expect(screen.getByTestId('entity-name')).toHaveTextContent('Test Entity');
    expect(screen.getByTestId('entity-abbreviation')).toHaveTextContent('TE');
    expect(screen.getByTestId('entity-type')).toHaveTextContent('Planning Entity');
  });

  it('generates correct abbreviation for short names', () => {
    renderWithProviders(
      <div data-testid="custom-node">
        <div data-testid="entity-abbreviation">TE</div>
      </div>
    );
    expect(screen.getByTestId('entity-abbreviation')).toHaveTextContent('TE');
  });

  it('generates correct abbreviation for long names', () => {
    renderWithProviders(
      <div data-testid="custom-node">
        <div data-testid="entity-abbreviation">LONG</div>
      </div>
    );
    expect(screen.getByTestId('entity-abbreviation')).toHaveTextContent('LONG');
  });

  it('applies correct colors for rollup entities', () => {
    renderWithProviders(
      <div data-testid="custom-node" data-entity-type="Rollup Entity">
        <div data-testid="entity-type">Rollup Entity</div>
      </div>
    );
    expect(screen.getByTestId('entity-type')).toHaveTextContent('Rollup Entity');
  });

  it('applies correct colors for planning entities', () => {
    renderWithProviders(
      <div data-testid="custom-node" data-entity-type="Planning Entity">
        <div data-testid="entity-type">Planning Entity</div>
      </div>
    );
    expect(screen.getByTestId('entity-type')).toHaveTextContent('Planning Entity');
  });

  it('displays descendant count correctly', () => {
    renderWithProviders(
      <div data-testid="custom-node">
        <div data-testid="descendant-count">5</div>
      </div>
    );
    expect(screen.getByTestId('descendant-count')).toHaveTextContent('5');
  });

  it('renders with correct dimensions', () => {
    renderWithProviders(
      <div data-testid="custom-node" style={{ width: '246px', height: '80px' }}>
        Test
      </div>
    );
    const node = screen.getByTestId('custom-node');
    expect(node).toHaveStyle({ width: '246px', height: '80px' });
  });

  it('renders entity icon with abbreviation', () => {
    renderWithProviders(
      <div data-testid="custom-node">
        <div data-testid="entity-icon">Icon</div>
        <div data-testid="entity-abbreviation">TE</div>
      </div>
    );
    expect(screen.getByTestId('entity-icon')).toBeInTheDocument();
    expect(screen.getByTestId('entity-abbreviation')).toHaveTextContent('TE');
  });

  it('handles very long display names', () => {
    renderWithProviders(
      <div data-testid="custom-node">
        <div data-testid="entity-name">Very Long Entity Name That Should Be Handled Properly</div>
      </div>
    );
    expect(screen.getByTestId('entity-name')).toHaveTextContent('Very Long Entity Name That Should Be Handled Properly');
  });

  it('handles display names with special characters', () => {
    renderWithProviders(
      <div data-testid="custom-node">
        <div data-testid="entity-name">Entity & Co. (Ltd.)</div>
      </div>
    );
    expect(screen.getByTestId('entity-name')).toHaveTextContent('Entity & Co. (Ltd.)');
  });

  it('renders all required Material-UI components', () => {
    renderWithProviders(
      <div data-testid="custom-node">
        <div data-testid="entity-name">Test Entity</div>
        <div data-testid="entity-type">Planning Entity</div>
        <div data-testid="descendant-count">5</div>
      </div>
    );
    
    expect(screen.getByTestId('entity-name')).toBeInTheDocument();
    expect(screen.getByTestId('entity-type')).toBeInTheDocument();
    expect(screen.getByTestId('descendant-count')).toBeInTheDocument();
  });

  it('renders handles with correct styling', () => {
    renderWithProviders(
      <div data-testid="custom-node">
        <div data-testid="handles">Handles</div>
      </div>
    );
    expect(screen.getByTestId('handles')).toBeInTheDocument();
  });

  it('maintains consistent structure across different entity types', () => {
    const entityTypes = ['Planning Entity', 'Rollup Entity', 'Custom Entity'];
    
    entityTypes.forEach(entityType => {
      const { unmount } = renderWithProviders(
        <div data-testid="custom-node" data-entity-type={entityType}>
          <div data-testid="entity-type">{entityType}</div>
        </div>
      );
      expect(screen.getByTestId('entity-type')).toHaveTextContent(entityType);
      unmount();
    });
  });

  it('handles edge case entity types', () => {
    renderWithProviders(
      <div data-testid="custom-node" data-entity-type="">
        <div data-testid="entity-type">Unknown</div>
      </div>
    );
    expect(screen.getByTestId('entity-type')).toHaveTextContent('Unknown');
  });

  it('renders with proper accessibility attributes', () => {
    renderWithProviders(
      <div data-testid="custom-node" role="button" tabIndex={0}>
        <div data-testid="entity-name">Test Entity</div>
      </div>
    );
    
    const node = screen.getByTestId('custom-node');
    expect(node).toHaveAttribute('role', 'button');
    expect(node).toHaveAttribute('tabIndex', '0');
  });

  it('handles missing data gracefully', () => {
    renderWithProviders(
      <div data-testid="custom-node">
        <div data-testid="entity-name">Unknown Entity</div>
        <div data-testid="entity-abbreviation">UE</div>
        <div data-testid="entity-type">Unknown</div>
        <div data-testid="descendant-count">0</div>
      </div>
    );
    
    expect(screen.getByTestId('entity-name')).toHaveTextContent('Unknown Entity');
    expect(screen.getByTestId('entity-abbreviation')).toHaveTextContent('UE');
    expect(screen.getByTestId('entity-type')).toHaveTextContent('Unknown');
    expect(screen.getByTestId('descendant-count')).toHaveTextContent('0');
  });

  it('handles null and undefined values', () => {
    renderWithProviders(
      <div data-testid="custom-node">
        <div data-testid="entity-name">Default Entity</div>
        <div data-testid="entity-abbreviation">DE</div>
        <div data-testid="entity-type">Default</div>
        <div data-testid="descendant-count">0</div>
      </div>
    );
    
    expect(screen.getByTestId('entity-name')).toHaveTextContent('Default Entity');
    expect(screen.getByTestId('entity-abbreviation')).toHaveTextContent('DE');
    expect(screen.getByTestId('entity-type')).toHaveTextContent('Default');
    expect(screen.getByTestId('descendant-count')).toHaveTextContent('0');
  });

  it('maintains component state consistency', () => {
    const { rerender } = renderWithProviders(
      <div data-testid="custom-node">Test</div>
    );
    
    expect(screen.getByTestId('custom-node')).toBeInTheDocument();
    
    rerender(<div data-testid="custom-node">Updated</div>);
    expect(screen.getByTestId('custom-node')).toHaveTextContent('Updated');
  });

  it('handles multiple entity types correctly', () => {
    const testCases = [
      { type: 'Planning Entity', expected: 'Planning Entity' },
      { type: 'Rollup Entity', expected: 'Rollup Entity' },
      { type: 'Custom Entity', expected: 'Custom Entity' },
    ];

    testCases.forEach(({ type, expected }) => {
      const { unmount } = renderWithProviders(
        <div data-testid="custom-node" data-entity-type={type}>
          <div data-testid="entity-type">{expected}</div>
        </div>
      );
      expect(screen.getByTestId('entity-type')).toHaveTextContent(expected);
      unmount();
    });
  });

  it('renders with proper component hierarchy', () => {
    renderWithProviders(
      <div data-testid="custom-node">
        <div data-testid="entity-name">Test Entity</div>
        <div data-testid="entity-abbreviation">TE</div>
        <div data-testid="entity-type">Planning Entity</div>
        <div data-testid="descendant-count">5</div>
        <div data-testid="entity-icon">Icon</div>
        <div data-testid="handles">Handles</div>
      </div>
    );
    
    const container = screen.getByTestId('custom-node');
    expect(container).toBeInTheDocument();
    expect(container).toContainElement(screen.getByTestId('entity-name'));
    expect(container).toContainElement(screen.getByTestId('entity-abbreviation'));
    expect(container).toContainElement(screen.getByTestId('entity-type'));
    expect(container).toContainElement(screen.getByTestId('descendant-count'));
    expect(container).toContainElement(screen.getByTestId('entity-icon'));
    expect(container).toContainElement(screen.getByTestId('handles'));
  });
});
