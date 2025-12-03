/**
 * Shared Hierarchy Panel Styles
 * Common styles for hierarchy panel containers
 */

import { SxProps, Theme } from '@mui/material';

/**
 * Standard hierarchy panel container styles
 * Used across UserHierarchyPanel, ReportingStructurePanel, etc.
 */
export const HIERARCHY_PANEL_CONTAINER_STYLES: SxProps<Theme> = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  flex: 1,
  minHeight: 0
};

