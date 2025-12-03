import React from 'react';

// Import CustomTooltip from common-app with fallback
const CustomTooltip = React.lazy(() => import('commonApp/CustomTooltip').catch(err => {
  console.error('Failed to load CustomTooltip from common-app:', err);
  return { 
    default: ({ children, title }: any) => React.createElement('div', { title }, children)
  };
}));

// Shared utility functions for browser components (AddProcessorBrowser, AddControllerServiceBrowser)

/**
 * Helper to extract description from service type
 */
export const extractDescription = (serviceType: any): string => {
  if (serviceType.description && typeof serviceType.description === 'string') {
    return serviceType.description.trim();
  }
  if (serviceType.descriptionDetail && typeof serviceType.descriptionDetail === 'string') {
    return serviceType.descriptionDetail.trim();
  }
  if (serviceType.documentation && typeof serviceType.documentation === 'string') {
    return serviceType.documentation.trim();
  }
  if (serviceType.documentationDetail && typeof serviceType.documentationDetail === 'string') {
    return serviceType.documentationDetail.trim();
  }
  if (serviceType.description && typeof serviceType.description === 'object' && serviceType.description.text) {
    return serviceType.description.text.trim();
  }
  return '';
};

/**
 * Helper function to create highlighted text elements
 */
export const createHighlightedText = (text: string, searchTerm: string): any => {
  if (!searchTerm?.trim() || !text) {
    return text;
  }
  
  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    if (part.toLowerCase() === searchTerm.toLowerCase()) {
      return React.createElement('span', {
        key: `highlight-${part}-${index}`,
        style: {
          backgroundColor: 'rgba(255, 255, 0, 0.3)',
          fontWeight: 'bold',
          borderRadius: '2px',
          padding: '0 1px'
        }
      }, part);
    }
    return part;
  });
};

/**
 * Helper to create line element for ListIcon
 */
export const createListIconLine = (y: number, key: string) => React.createElement('line', {
  key,
  x1: '2',
  y1: String(y),
  x2: '14',
  y2: String(y),
  stroke: 'currentColor',
  strokeWidth: '1.5',
  strokeLinecap: 'round'
});

/**
 * List icon component for version column
 */
export const ListIcon = React.memo(() => React.createElement('svg', {
  width: '16',
  height: '16',
  viewBox: '0 0 16 16',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  style: {
    color: '#6c757d',
    flexShrink: 0
  }
}, [4, 6, 8, 10].map((y, index) => createListIconLine(y, `line${index + 1}`))));

ListIcon.displayName = 'ListIcon';

/**
 * Common cell style properties for vertical centering
 */
export const getCommonCellStyle = (additionalStyles: Record<string, any> = {}) => ({
  display: 'flex',
  alignItems: 'center',
  ...additionalStyles
});

/**
 * Common column definition properties
 */
export const getCommonColumnDef = (field: string, headerName: string, flex: number, additionalProps: Record<string, any> = {}) => ({
  field,
  headerName,
  sortable: true,
  suppressHeaderMenuButton: true,
  filter: false,
  flex,
  resizable: true,
  suppressMovable: false,
  headerClass: 'ag-header-cell-custom',
  cellClass: 'ag-cell-custom',
  ...additionalProps
});

/**
 * Helper to create icon wrapper with tooltip
 */
export const createIconWithTooltip = (icon: React.ReactElement, tooltipTitle: string, tooltipProps: Record<string, any> = {}) => {
  const iconWrapperStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer'
  };
  
  return React.createElement(React.Suspense, {
    key: 'tooltip-suspense',
    fallback: React.createElement('div', { style: iconWrapperStyle }, icon)
  }, React.createElement(CustomTooltip, {
    title: tooltipTitle,
    placement: 'bottom',
    arrow: false,
    followCursor: true,
    ...tooltipProps
  }, React.createElement('div', { style: iconWrapperStyle }, icon)));
};

/**
 * Helper to generate tags from service type
 */
export const generateTags = (serviceType: any, typeName: string, bundle: any): string[] => {
  if (serviceType.tags && Array.isArray(serviceType.tags) && serviceType.tags.length > 0) {
    return serviceType.tags;
  }
  
  const typeKeywords = typeName
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((word: string) => word.length > 2);
  
  const tags = [...typeKeywords];
  if (bundle.artifact) {
    tags.push(bundle.artifact.replace(/nifi-|nar/g, '').replace(/-/g, ' '));
  }
  
  return Array.from(new Set(tags)).slice(0, 10);
};

/**
 * Default column definition for AG Grid
 */
export const getDefaultColDef = () => ({
  suppressHeaderClickSorting: false,
  sortable: true,
  filter: true,
  resizable: true,
  headerClass: 'ag-header-cell-custom',
  unSortIcon: true,
  sortingOrder: ['asc', 'desc', null] as any,
});

/**
 * Get row height based on tags
 */
export const getRowHeight = (params: any): number => {
  const tags = params.data?.tags ?? [];
  const tagsText = tags.join(', ');
  
  const estimatedCharsPerLine = 50;
  const lines = Math.max(1, Math.ceil(tagsText.length / estimatedCharsPerLine));
  
  const baseHeight = 32;
  const lineHeight = 20;
  const padding = 12;
  
  return Math.max(baseHeight, (lines * lineHeight) + padding);
};

/**
 * Check if service has a valid description
 */
export const hasValidDescription = <T extends { description?: any }>(service: T | null): boolean => {
  if (!service) return false;
  return !!(service.description && 
         typeof service.description === 'string' && 
         service.description.trim().length > 0);
};

/**
 * Normalize ID for comparison
 */
export const normalizeId = (id: string | number | null | undefined): string => {
  if (id == null || id === '') return '';
  const normalized = String(id).trim().toLowerCase();
  return normalized;
};

