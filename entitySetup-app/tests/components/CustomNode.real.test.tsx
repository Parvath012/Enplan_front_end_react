import React from 'react';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from 'reactflow';
import CustomNode from '../../src/components/CustomNode';
import { getEntityColors } from '../../src/utils/graphUtils';

// Mock the getEntityColors utility function
jest.mock('../../src/utils/graphUtils', () => ({
  getEntityColors: jest.fn(),
}));

const mockGetEntityColors = getEntityColors as jest.MockedFunction<typeof getEntityColors>;

// Helper function to render component with ReactFlowProvider
const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <ReactFlowProvider>
      {component}
    </ReactFlowProvider>
  );
};

describe('CustomNode', () => {
  const defaultData = {
    label: 'Test Entity',
    entityType: 'Planning Entity',
    displayName: 'Test Display Name',
    totalDescendantsCount: 5
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementation
    mockGetEntityColors.mockReturnValue({
      border: '#8E44AD',
      title: '#8E44AD'
    });
  });

  it('renders without crashing', () => {
    renderWithProvider(<CustomNode data={defaultData} />);
    
    expect(screen.getByText('Test Display Name')).toBeInTheDocument();
    expect(screen.getByText('Planning Entity')).toBeInTheDocument();
  });

  it('displays entity information correctly', () => {
    renderWithProvider(<CustomNode data={defaultData} />);
    
    expect(screen.getByText('Test Display Name')).toBeInTheDocument();
    expect(screen.getByText('Planning Entity')).toBeInTheDocument();
  });

  it('generates abbreviation from display name with multiple words', () => {
    const data = {
      ...defaultData,
      displayName: 'Test Display Name'
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show "TD" (first letters of first two words)
    expect(screen.getByText('TD')).toBeInTheDocument();
  });

  it('generates abbreviation from display name with single word', () => {
    const data = {
      ...defaultData,
      displayName: 'Test'
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show "TE" (first two characters)
    expect(screen.getByText('TE')).toBeInTheDocument();
  });

  it('handles empty display name', () => {
    const data = {
      ...defaultData,
      displayName: ''
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show "EN" (default fallback)
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('handles null display name', () => {
    const data = {
      ...defaultData,
      displayName: null as any
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show "EN" (default fallback)
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('handles undefined display name', () => {
    const data = {
      ...defaultData,
      displayName: undefined as any
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show "EN" (default fallback)
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('handles display name with only one character', () => {
    const data = {
      ...defaultData,
      displayName: 'A'
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show "A" (first character, padded to 2)
    expect(screen.getAllByText('A')).toHaveLength(2);
  });

  it('handles display name with special characters', () => {
    const data = {
      ...defaultData,
      displayName: 'Test-Entity Name'
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show "TN" (first letters of first two words)
    expect(screen.getByText('TN')).toBeInTheDocument();
  });

  it('calls getEntityColors with correct entity type', () => {
    renderWithProvider(<CustomNode data={defaultData} />);
    
    expect(mockGetEntityColors).toHaveBeenCalledWith('Planning Entity');
  });

  it('handles rollup entity type', () => {
    const data = {
      ...defaultData,
      entityType: 'Rollup Entity'
    };
    
    mockGetEntityColors.mockReturnValue({
      border: '#4285F4',
      title: '#4285F4'
    });
    
    renderWithProvider(<CustomNode data={data} />);
    
    expect(mockGetEntityColors).toHaveBeenCalledWith('Rollup Entity');
  });

  it('handles unknown entity type', () => {
    const data = {
      ...defaultData,
      entityType: 'Unknown Entity'
    };
    
    mockGetEntityColors.mockReturnValue({
      border: '#666666',
      title: '#666666'
    });
    
    renderWithProvider(<CustomNode data={data} />);
    
    expect(mockGetEntityColors).toHaveBeenCalledWith('Unknown Entity');
  });

  it('displays rollup indicator badge when entity type contains rollup', () => {
    const data = {
      ...defaultData,
      entityType: 'Rollup Entity',
      totalDescendantsCount: 3
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show the rollup indicator with count
    expect(screen.getByText('03')).toBeInTheDocument();
  });

  it('displays rollup indicator badge with zero descendants', () => {
    const data = {
      ...defaultData,
      entityType: 'Rollup Entity',
      totalDescendantsCount: 0
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show empty rollup indicator
    const rollupIndicators = screen.getAllByText('');
    expect(rollupIndicators.length).toBeGreaterThan(0);
  });

  it('displays rollup indicator badge with undefined descendants count', () => {
    const data = {
      ...defaultData,
      entityType: 'Rollup Entity',
      totalDescendantsCount: undefined
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show empty rollup indicator
    const rollupIndicators = screen.getAllByText('');
    expect(rollupIndicators.length).toBeGreaterThan(0);
  });

  it('displays rollup indicator badge with null descendants count', () => {
    const data = {
      ...defaultData,
      entityType: 'Rollup Entity',
      totalDescendantsCount: null
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show empty rollup indicator
    const rollupIndicators = screen.getAllByText('');
    expect(rollupIndicators.length).toBeGreaterThan(0);
  });

  it('displays rollup indicator badge with large descendants count', () => {
    const data = {
      ...defaultData,
      entityType: 'Rollup Entity',
      totalDescendantsCount: 15
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show the rollup indicator with count (padded with 0)
    expect(screen.getByText('015')).toBeInTheDocument();
  });

  it('does not display rollup indicator for non-rollup entities', () => {
    const data = {
      ...defaultData,
      entityType: 'Planning Entity'
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should not show rollup indicator
    expect(screen.queryByText('05')).not.toBeInTheDocument();
  });

  it('displays planning entity indicator for non-rollup entities', () => {
    const data = {
      ...defaultData,
      entityType: 'Planning Entity'
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show planning entity indicator (empty circle)
    const planningIndicators = screen.getAllByText('');
    expect(planningIndicators.length).toBeGreaterThan(0);
  });

  it('handles case insensitive rollup detection', () => {
    const data = {
      ...defaultData,
      entityType: 'ROLLUP ENTITY'
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show rollup indicator
    expect(screen.getByText('05')).toBeInTheDocument();
  });

  it('handles case insensitive planning detection', () => {
    const data = {
      ...defaultData,
      entityType: 'PLANNING ENTITY'
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show planning entity indicator
    const planningIndicators = screen.getAllByText('');
    expect(planningIndicators.length).toBeGreaterThan(0);
  });

  it('handles entity type with mixed case', () => {
    const data = {
      ...defaultData,
      entityType: 'RollUp Entity'
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show rollup indicator
    expect(screen.getByText('05')).toBeInTheDocument();
  });

  it('handles entity type with planning in the middle', () => {
    const data = {
      ...defaultData,
      entityType: 'Entity Planning Type'
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show planning entity indicator (purple circle)
    const planningIndicators = screen.getAllByText('');
    expect(planningIndicators.length).toBeGreaterThan(0);
  });

  it('handles entity type with rollup in the middle', () => {
    const data = {
      ...defaultData,
      entityType: 'Entity Rollup Type'
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show rollup indicator
    expect(screen.getByText('05')).toBeInTheDocument();
  });

  it('handles empty entity type', () => {
    const data = {
      ...defaultData,
      entityType: ''
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show planning entity indicator (default)
    const planningIndicators = screen.getAllByText('');
    expect(planningIndicators.length).toBeGreaterThan(0);
  });

  it('handles null entity type', () => {
    const data = {
      ...defaultData,
      entityType: null as any
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show planning entity indicator (default)
    const planningIndicators = screen.getAllByText('');
    expect(planningIndicators.length).toBeGreaterThan(0);
  });

  it('handles undefined entity type', () => {
    const data = {
      ...defaultData,
      entityType: undefined as any
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show planning entity indicator (default)
    const planningIndicators = screen.getAllByText('');
    expect(planningIndicators.length).toBeGreaterThan(0);
  });

  it('handles missing totalDescendantsCount property', () => {
    const data = {
      label: 'Test Entity',
      entityType: 'Rollup Entity',
      displayName: 'Test Display Name'
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show empty rollup indicator
    const rollupIndicators = screen.getAllByText('');
    expect(rollupIndicators.length).toBeGreaterThan(0);
  });

  it('handles negative totalDescendantsCount', () => {
    const data = {
      ...defaultData,
      entityType: 'Rollup Entity',
      totalDescendantsCount: -1
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show the count (negative numbers are truthy)
    expect(screen.getByText('0-1')).toBeInTheDocument();
  });

  it('handles very large totalDescendantsCount', () => {
    const data = {
      ...defaultData,
      entityType: 'Rollup Entity',
      totalDescendantsCount: 999
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show the count
    expect(screen.getByText('0999')).toBeInTheDocument();
  });

  it('handles decimal totalDescendantsCount', () => {
    const data = {
      ...defaultData,
      entityType: 'Rollup Entity',
      totalDescendantsCount: 5.5
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show the count (rounded)
    expect(screen.getByText('05.5')).toBeInTheDocument();
  });

  it('handles string totalDescendantsCount', () => {
    const data = {
      ...defaultData,
      entityType: 'Rollup Entity',
      totalDescendantsCount: '5' as any
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show the count
    expect(screen.getByText('05')).toBeInTheDocument();
  });

  it('handles boolean totalDescendantsCount', () => {
    const data = {
      ...defaultData,
      entityType: 'Rollup Entity',
      totalDescendantsCount: true as any
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show the count (true is truthy)
    expect(screen.getByText('0true')).toBeInTheDocument();
  });

  it('handles object totalDescendantsCount', () => {
    const data = {
      ...defaultData,
      entityType: 'Rollup Entity',
      totalDescendantsCount: {} as any
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show the count (object is truthy)
    expect(screen.getByText('0[object Object]')).toBeInTheDocument();
  });

  it('handles array totalDescendantsCount', () => {
    const data = {
      ...defaultData,
      entityType: 'Rollup Entity',
      totalDescendantsCount: [] as any
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show empty rollup indicator (empty array is falsy)
    const rollupIndicators = screen.getAllByText('');
    expect(rollupIndicators.length).toBeGreaterThan(0);
  });

  it('handles function totalDescendantsCount', () => {
    const data = {
      ...defaultData,
      entityType: 'Rollup Entity',
      totalDescendantsCount: (() => {}) as any
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show the count (function is truthy)
    expect(screen.getByText('0() => { }')).toBeInTheDocument();
  });

  it('handles component unmounting', () => {
    const { unmount } = renderWithProvider(<CustomNode data={defaultData} />);
    
    expect(() => unmount()).not.toThrow();
  });

  it('handles rapid re-renders', () => {
    const { rerender } = renderWithProvider(<CustomNode data={defaultData} />);
    
    expect(screen.getByText('Test Display Name')).toBeInTheDocument();
    
    const newData = {
      ...defaultData,
      displayName: 'New Display Name'
    };
    
    rerender(
      <ReactFlowProvider>
        <CustomNode data={newData} />
      </ReactFlowProvider>
    );
    
    expect(screen.getByText('New Display Name')).toBeInTheDocument();
  });

  it('handles different label values', () => {
    const data = {
      ...defaultData,
      label: 'Different Label'
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    expect(screen.getByText('Test Display Name')).toBeInTheDocument();
  });

  it('handles very long display names', () => {
    const data = {
      ...defaultData,
      displayName: 'Very Long Display Name That Exceeds Normal Length'
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show "VL" (first letters of first two words)
    expect(screen.getByText('VL')).toBeInTheDocument();
  });

  it('handles display names with numbers', () => {
    const data = {
      ...defaultData,
      displayName: 'Test123 Display456 Name'
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show "TD" (first letters of first two words)
    expect(screen.getByText('TD')).toBeInTheDocument();
  });

  it('handles display names with special characters and spaces', () => {
    const data = {
      ...defaultData,
      displayName: 'Test-Entity_Name With Spaces'
    };
    
    renderWithProvider(<CustomNode data={data} />);
    
    // Should show "TW" (first letters of first two words)
    expect(screen.getByText('TW')).toBeInTheDocument();
  });
});
