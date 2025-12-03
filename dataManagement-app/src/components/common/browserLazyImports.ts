import React from 'react';

// Shared lazy imports for browser components
export const CustomTooltip = React.lazy(() => import('commonApp/CustomTooltip').catch(err => {
  console.error('Failed to load CustomTooltip from common-app:', err);
  return { 
    default: ({ children, title }: any) => React.createElement('div', { title }, children)
  };
}));

export const ListToolbar = React.lazy(() => import('commonApp/ListToolbar').catch(err => {
  console.error('Failed to load ListToolbar from common-app:', err);
  return { 
    default: () => React.createElement('div', null, 'ListToolbar failed to load')
  };
}));

export const AgGridShell = React.lazy(() => import('commonApp/AgGridShell').catch(err => {
  console.error('Failed to load AgGridShell from common-app:', err);
  return { 
    default: () => React.createElement('div', { style: { padding: '20px', textAlign: 'center' } }, 'AgGridShell failed to load')
  };
}));

export const ReusablePanel = React.lazy(() => import('./ReusablePanel').catch(err => {
  console.error('Failed to load ReusablePanel:', err);
  return { 
    default: () => React.createElement('div', null, 'ReusablePanel failed to load')
  };
}));

// Preload AgGridShell component
if (typeof window !== 'undefined') {
  import('commonApp/AgGridShell').catch(() => {});
}

