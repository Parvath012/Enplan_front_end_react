/**
 * ReusablePanel - Wrapper component that uses Panel from common-app
 * but applies custom width and styling to match dataManagement-app requirements
 * 
 * This allows using Panel from common-app while maintaining existing UI/functionality
 */

import React from 'react';
import { Box } from '@mui/material';

// Import Panel from common-app
const Panel = React.lazy(() => import('commonApp/Panel').catch(err => {
  console.error('Failed to load Panel from common-app:', err);
  return { 
    default: () => <div>Panel failed to load</div>
  };
}));

import type { PanelProps } from 'commonApp/Panel';
import './ReusablePanel.scss';

export interface ReusablePanelProps extends Omit<PanelProps, 'className'> {
  /** Custom width for the panel (default: 420px) */
  width?: string;
  /** Custom className for additional styling */
  customClassName?: string;
  /** Background color (default: white) */
  backgroundColor?: string;
}

/**
 * ReusablePanel - Wraps Panel from common-app with custom width support
 * 
 * Usage:
 * <ReusablePanel
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   title="My Panel"
 *   width="480px"  // Custom width
 *   onSubmit={handleSubmit}
 * >
 *   Content here
 * </ReusablePanel>
 */
const ReusablePanel: React.FC<ReusablePanelProps> = ({
  width = '420px',
  customClassName = '',
  backgroundColor = 'rgba(255, 255, 255, 1)',
  ...panelProps
}) => {
  // Generate unique class name based on width to avoid conflicts
  const widthClass = `reusable-panel-width-${width.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const combinedClassName = `reusable-panel-wrapper ${widthClass} ${customClassName}`.trim();

  return (
    <Box
      className={combinedClassName}
      sx={{
        '--panel-width': width,
        '--panel-bg-color': backgroundColor,
      }}
    >
      <React.Suspense fallback={<div>Loading Panel...</div>}>
        <Panel
          {...panelProps}
          className={`reusable-panel-inner ${customClassName}`.trim()}
        />
      </React.Suspense>
    </Box>
  );
};

export default ReusablePanel;

