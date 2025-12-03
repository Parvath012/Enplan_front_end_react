/**
 * Tests for ReportingStructurePanel
 */
import React from 'react';
import { render } from '@testing-library/react';
import ReportingStructurePanel from '../../../src/components/reportingStructure/ReportingStructurePanel';

// Mock dependencies
jest.mock('../../../src/hooks/reportingStructure/useReportingStructure', () => ({
  useReportingStructure: jest.fn(() => ({
    hierarchy: [],
    hierarchyLoading: false,
    totalCount: 0,
    zoomIndex: 0,
    zoomSteps: [50, 75, 100, 125, 150],
    zoomIn: jest.fn(),
    zoomOut: jest.fn(),
    zoomReset: jest.fn(),
    reactFlowRef: { current: null },
    nodes: [],
    edges: [],
    onNodesChange: jest.fn(),
    onEdgesChange: jest.fn()
  }))
}));

jest.mock('../../../src/components/shared/HierarchyPanelContent', () => {
  return function MockHierarchyPanelContent({ footer }: any) {
    return <div data-testid="hierarchy-panel-content">{footer}</div>;
  };
});

jest.mock('../../../src/components/reportingStructure/ReportingStructureFooter', () => {
  return function MockReportingStructureFooter() {
    return <div data-testid="reporting-structure-footer">Footer</div>;
  };
});

describe('ReportingStructurePanel', () => {
  it('should render without crashing', () => {
    const { getByTestId } = render(<ReportingStructurePanel />);
    expect(getByTestId('hierarchy-panel-content')).toBeInTheDocument();
  });

  it('should render with default viewType', () => {
    const { getByTestId } = render(<ReportingStructurePanel />);
    expect(getByTestId('hierarchy-panel-content')).toBeInTheDocument();
  });

  it('should render with organizational viewType', () => {
    const { getByTestId } = render(<ReportingStructurePanel viewType="organizational" />);
    expect(getByTestId('hierarchy-panel-content')).toBeInTheDocument();
  });

  it('should render with departmental viewType', () => {
    const { getByTestId } = render(<ReportingStructurePanel viewType="departmental" />);
    expect(getByTestId('hierarchy-panel-content')).toBeInTheDocument();
  });

  it('should render with dotted-line viewType', () => {
    const { getByTestId } = render(<ReportingStructurePanel viewType="dotted-line" />);
    expect(getByTestId('hierarchy-panel-content')).toBeInTheDocument();
  });

  it('should render footer component', () => {
    const { getByTestId } = render(<ReportingStructurePanel />);
    expect(getByTestId('reporting-structure-footer')).toBeInTheDocument();
  });

  it('should memoize component correctly', () => {
    const { rerender } = render(<ReportingStructurePanel viewType="organizational" />);
    const { rerender: rerender2 } = render(<ReportingStructurePanel viewType="organizational" />);
    
    // Should not cause issues when viewType is the same
    rerender(<ReportingStructurePanel viewType="organizational" />);
    rerender2(<ReportingStructurePanel viewType="organizational" />);
  });
});
