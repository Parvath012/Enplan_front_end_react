const React = require('react');

const mockUseNodesState = jest.fn(() => [[], jest.fn()]);
const mockUseEdgesState = jest.fn(() => [[], jest.fn()]);

module.exports = {
  ReactFlowProvider: ({ children }) => React.createElement('div', { 'data-testid': 'react-flow-provider' }, children),
  useNodesState: mockUseNodesState,
  useEdgesState: mockUseEdgesState,
  Background: () => React.createElement('div', { 'data-testid': 'react-flow-background' }),
  ReactFlow: ({ children, ...props }) => React.createElement('div', { 'data-testid': 'react-flow', ...props }, children),
  Handle: ({ ...props }) => React.createElement('div', { 'data-testid': 'react-flow-handle', ...props }),
  Position: {
    Top: 'top',
    Bottom: 'bottom',
    Left: 'left',
    Right: 'right'
  }
};
