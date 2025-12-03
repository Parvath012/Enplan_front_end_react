import { getCommonColumnDef, getCommonCellStyle } from './browserUtils';
import { createTypeCellRenderer, createVersionCellRenderer, createTagsCellRenderer } from './browserCellRenderers';

/**
 * Create column definitions for browser grid
 * Note: This returns the column definitions array directly. Use useMemo in the component if needed.
 */
export const createBrowserColumnDefs = (
  searchTerm: string,
  handleServiceSelect: (service: any) => void,
  iconClassName: string,
  rowSelectedClass: string
) => {
  return [
    getCommonColumnDef('type', 'Type', 30, {
      cellStyle: getCommonCellStyle({
        overflow: 'hidden',
        justifyContent: 'flex-start',
        padding: '0'
      }),
      cellRenderer: createTypeCellRenderer(searchTerm, handleServiceSelect, iconClassName, rowSelectedClass),
    }),
    getCommonColumnDef('version', 'Version', 25, {
      cellStyle: getCommonCellStyle({
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        justifyContent: 'center',
        cursor: 'default'
      }),
      cellRenderer: createVersionCellRenderer(searchTerm),
    }),
    getCommonColumnDef('tags', 'Tags', 45, {
      cellStyle: getCommonCellStyle({
        cursor: 'default',
        whiteSpace: 'normal',
        wordWrap: 'break-word',
        wordBreak: 'break-word',
        overflow: 'hidden',
        justifyContent: 'flex-start',
        padding: '6px 0'
      }),
      cellRenderer: createTagsCellRenderer(searchTerm),
    })
  ];
};

/**
 * Filter services based on search term
 */
export const filterServices = <T extends { type: string; tags: string[]; version: string; description?: string }>(
  services: T[],
  searchTerm: string
): T[] => {
  if (!searchTerm.trim()) {
    return services;
  }

  const lowercaseSearch = searchTerm.toLowerCase();
  return services.filter(service => 
    service.type.toLowerCase().includes(lowercaseSearch) ||
    service.tags.some(tag => tag.toLowerCase().includes(lowercaseSearch)) ||
    service.version.toLowerCase().includes(lowercaseSearch) ||
    (service.description?.toLowerCase().includes(lowercaseSearch))
  );
};

