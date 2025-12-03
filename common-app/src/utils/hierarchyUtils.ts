/**
 * Hierarchy Utilities
 * Shared utility functions for hierarchy/structure visualizations
 */

import { ReactFlowInstance } from 'reactflow';

/**
 * Fit React Flow view to container
 * Utility function to fit the React Flow diagram to its container
 * 
 * @param instance - React Flow instance
 */
export const fitViewToContainer = (instance: ReactFlowInstance | null) => {
  if (instance) {
    instance.fitView({
      padding: 0.1,
      includeHiddenNodes: false,
      minZoom: 0.1,
      maxZoom: 2
    });
  }
};

