/**
 * Tests for UserHierarchyPanel
 */
import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import UserHierarchyPanel from '../../../src/components/userHierarchy/UserHierarchyPanel';

// Mock dependencies
jest.mock('../../../src/components/shared/HierarchyPanelContent', () => {
  return function MockHierarchyPanelContent({ footer }: any) {
    return <div data-testid="hierarchy-panel-content">{footer}</div>;
  };
});

jest.mock('../../../src/components/userHierarchy/UserHierarchyFooter', () => {
  return function MockUserHierarchyFooter() {
    return <div data-testid="user-hierarchy-footer">Footer</div>;
  };
});

jest.mock('commonApp/useHierarchyZoom', () => ({
  useHierarchyZoom: jest.fn(() => ({
    zoomIndex: 0,
    zoomSteps: [50, 75, 100, 125, 150],
    zoomIn: jest.fn(),
    zoomOut: jest.fn(),
    zoomReset: jest.fn(),
    reactFlowRef: { current: null }
  }))
}));

jest.mock('commonApp/useHierarchyDataProcessing', () => ({
  useHierarchyDataProcessing: jest.fn(() => ({
    nodes: [],
    edges: [],
    onNodesChange: jest.fn(),
    onEdgesChange: jest.fn()
  })),
  calculateHierarchyCount: jest.fn(() => 0)
}));

jest.mock('../../../src/utils/userHierarchyGraphUtils', () => ({
  processUserData: jest.fn(() => ({ nodes: [], edges: [] })),
  getLayoutedUserElements: jest.fn((nodes, edges) => ({ nodes, edges }))
}));

describe('UserHierarchyPanel', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        users: (state = {
          hierarchy: [],
          hierarchyLoading: false
        }, action) => state
      }
    });
  });

  it('should render without crashing', () => {
    render(
      <Provider store={store}>
        <UserHierarchyPanel />
      </Provider>
    );
  });

  it('should render with default viewType', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <UserHierarchyPanel />
      </Provider>
    );
    expect(getByTestId('hierarchy-panel-content')).toBeInTheDocument();
  });

  it('should render with organizational viewType', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <UserHierarchyPanel viewType="organizational" />
      </Provider>
    );
    expect(getByTestId('hierarchy-panel-content')).toBeInTheDocument();
  });

  it('should render with departmental viewType', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <UserHierarchyPanel viewType="departmental" />
      </Provider>
    );
    expect(getByTestId('hierarchy-panel-content')).toBeInTheDocument();
  });

  it('should render with dotted-line viewType', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <UserHierarchyPanel viewType="dotted-line" />
      </Provider>
    );
    expect(getByTestId('hierarchy-panel-content')).toBeInTheDocument();
  });

  it('should render footer component', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <UserHierarchyPanel />
      </Provider>
    );
    expect(getByTestId('user-hierarchy-footer')).toBeInTheDocument();
  });
});

