import { renderToStaticMarkup } from 'react-dom/server';
import { ArrowUp, ArrowDown, ArrowsVertical } from '@carbon/icons-react';
import React from 'react';

/**
 * Grid icons configuration for AG Grid
 */
export const createGridIcons = () => ({
  sortAscending: renderToStaticMarkup(React.createElement(ArrowUp, { style: { width: 12, height: 11, color: '#0051AB' } })),
  sortDescending: renderToStaticMarkup(React.createElement(ArrowDown, { style: { width: 12, height: 11, color: '#0051AB' } })),
  sortUnSort: renderToStaticMarkup(React.createElement(ArrowsVertical, { style: { width: 12, height: 12, color: '#0051AB' } })),
});

/**
 * User list styles configuration
 */
export const userListStyles = {
  // Container styles (matching EntityList exactly)
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    height: 'calc(100vh - 42px)',
    p: 0,
    width: '100%',
    position: 'relative',
    overflow: 'hidden'
  },
  // Content box styles (matching EntityList exactly)
  contentBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    flex: 1,
    width: '100%',
    px: 0,
    position: 'relative',
    height: 'auto',
  },
  navigationBar: {
    backgroundColor: '#fff',
    borderBottom: '1px solid rgba(242, 242, 240, 1)',
    height: '34px',
    px: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navigationLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  tabContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  // Tab content styles
  tabContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minHeight: 0,
  },
  tabPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'visible',
  },
  // Grid styles (matching EntityList exactly)
  gridContainer: {
    width: '100%',
    flex: 1,
    mt: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0
  },
  gridWrapper: {
    width: '100%',
    boxSizing: 'border-box' as const,
    overflow: 'hidden',
    flex: '1 1 auto',
    minHeight: 0
  },
};

/**
 * Tab configuration
 */
export const userTabs = [
  { label: 'Users', index: 0, marginLeft: '-18px' },
  { label: 'Roles and Permissions', index: 1, marginLeft: '20px' },
  { label: 'Team/Group', index: 2, marginLeft: '20px' },
  { label: 'Reporting Structure', index: 3, marginLeft: '20px' }
];

/**
 * Shared header bar styles to avoid duplication with common-app HeaderBar
 * These styles match the HeaderBar component styling
 */
export const headerBarStyles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '40px',
    background: 'inherit',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    boxSizing: 'border-box',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgba(242, 242, 240, 1)',
    px: 1.5,
    position: 'sticky' as const,
    top: 0,
    zIndex: 5
  },
  title: {
    fontFamily: "'Inter-Regular_SemiBold', 'Inter SemiBold', 'Inter', sans-serif",
    fontWeight: 650,
    fontStyle: 'normal',
    fontSize: '14px',
    color: '#3C4043',
    textAlign: 'left' as const
  },
  actionsContainer: {
    display: 'flex',
    gap: { xs: 0.5, sm: 1 },
    alignItems: 'center'
  }
};

