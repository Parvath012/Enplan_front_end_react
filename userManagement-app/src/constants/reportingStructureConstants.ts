/**
 * Reporting Structure Constants
 * All constants related to Reporting Structure feature
 */

export type ViewByType = 'organizational' | 'departmental' | 'dotted-line';

export const VIEW_BY_OPTIONS = [
  { value: 'organizational' as ViewByType, label: 'Organizational Structure' },
  { value: 'departmental' as ViewByType, label: 'Departmental Structure' },
  { value: 'dotted-line' as ViewByType, label: 'Dotted-line Reporting' },
] as const;

export const DEFAULT_VIEW_TYPE: ViewByType = 'organizational';

// Title mapping for each view type (used in headers)
export const VIEW_BY_TITLES: Record<ViewByType, string> = {
  'organizational': 'Organizational Hierarchy Structure',
  'departmental': 'Departmental Structure',
  'dotted-line': 'Dotted-line Reporting Structure',
};

// Predefined color palette for departments (border colors)
// Each color should be distinct and visually appealing
const DEPARTMENT_COLOR_PALETTE: string[] = [
  'rgba(93, 35, 112, 1)',    // Purple
  'rgba(168, 37, 37, 1)',    // Red
  'rgba(35, 134, 170, 1)',   // Blue
  'rgba(77, 118, 10, 1)',    // Green
  'rgba(176, 137, 68, 1)',   // Brown
  'rgba(38, 43, 44, 1)',     // Dark Gray
  'rgba(156, 39, 176, 1)',   // Deep Purple
  'rgba(233, 30, 99, 1)',    // Pink
  'rgba(63, 81, 181, 1)',    // Indigo
  'rgba(3, 169, 244, 1)',    // Light Blue
  'rgba(0, 150, 136, 1)',    // Teal
  'rgba(76, 175, 80, 1)',    // Light Green
  'rgba(205, 220, 57, 1)',   // Lime
  'rgba(255, 193, 7, 1)',    // Amber
  'rgba(255, 152, 0, 1)',    // Orange
  'rgba(255, 87, 34, 1)',    // Deep Orange
  'rgba(121, 85, 72, 1)',    // Brown
  'rgba(96, 125, 139, 1)',   // Blue Gray
  'rgba(171, 71, 188, 1)',   // Purple
  'rgba(244, 67, 54, 1)',    // Red
  'rgba(33, 150, 243, 1)',   // Blue
  'rgba(0, 188, 212, 1)',    // Cyan
  'rgba(139, 195, 74, 1)',   // Light Green
  'rgba(158, 158, 158, 1)',  // Gray
];

// Cache for generated department colors to ensure consistency
const departmentColorCache: Map<string, { border: string; background: string }> = new Map();

// Default color pair
const DEFAULT_COLOR_PAIR = { border: 'rgba(93, 35, 112, 1)', background: 'rgba(242, 234, 245, 1)' };

/**
 * Convert rgba string to RGB values
 */
function rgbaToRgb(rgba: string): { r: number; g: number; b: number } | null {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10),
  };
}

/**
 * Convert RGB values to rgba string with opacity
 */
function rgbToRgba(r: number, g: number, b: number, opacity: number): string {
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Lighten a color by mixing it with white
 */
function lightenColor(rgba: string, factor: number = 0.85): string {
  const rgb = rgbaToRgb(rgba);
  if (!rgb) return rgba;
  
  // Mix with white (255, 255, 255) based on factor
  const r = Math.round(rgb.r + (255 - rgb.r) * factor);
  const g = Math.round(rgb.g + (255 - rgb.g) * factor);
  const b = Math.round(rgb.b + (255 - rgb.b) * factor);
  
  return rgbToRgba(r, g, b, 1);
}

/**
 * Simple hash function to consistently map department names to color indices
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Get dynamic color pair for a department
 * Generates consistent colors based on department name
 */
export function getDepartmentColorPair(department?: string): { border: string; background: string } {
  if (!department || department === 'N/A' || department === 'Default') {
    return DEFAULT_COLOR_PAIR;
  }

  // Check cache first
  if (departmentColorCache.has(department)) {
    return departmentColorCache.get(department)!;
  }

  // Generate color based on department name hash
  const hash = hashString(department);
  const colorIndex = hash % DEPARTMENT_COLOR_PALETTE.length;
  const borderColor = DEPARTMENT_COLOR_PALETTE[colorIndex];
  const backgroundColor = lightenColor(borderColor, 0.85);

  const colorPair = { border: borderColor, background: backgroundColor };
  
  // Cache the result for consistency
  departmentColorCache.set(department, colorPair);
  
  return colorPair;
}

// Legacy support - keep for backward compatibility (returns border color)
export const DEPARTMENT_COLORS: { [key: string]: string } = {
  'HR': 'rgba(93, 35, 112, 1)',
  'IT': 'rgba(168, 37, 37, 1)',
  'Finance': 'rgba(35, 134, 170, 1)',
  'Operations': 'rgba(77, 118, 10, 1)',
  'Marketing': 'rgba(176, 137, 68, 1)',
  'Legal': 'rgba(38, 43, 44, 1)',
  'Sales': 'rgba(93, 35, 112, 1)',
  'Default': 'rgba(93, 35, 112, 1)',
};

// Legacy constant for backward compatibility - now uses dynamic generation
export const DEPARTMENT_COLOR_PAIRS: { [key: string]: { border: string; background: string } } = {
  'HR': { border: 'rgba(93, 35, 112, 1)', background: 'rgba(242, 234, 245, 1)' },
  'IT': { border: 'rgba(168, 37, 37, 1)', background: 'rgba(255, 237, 235, 1)' },
  'Finance': { border: 'rgba(35, 134, 170, 1)', background: 'rgba(238, 248, 253, 1)' },
  'Operations': { border: 'rgba(77, 118, 10, 1)', background: 'rgba(239, 246, 234, 1)' },
  'Marketing': { border: 'rgba(176, 137, 68, 1)', background: 'rgba(253, 248, 240, 1)' },
  'Legal': { border: 'rgba(38, 43, 44, 1)', background: 'rgba(233, 234, 234, 1)' },
  'Sales': { border: 'rgba(93, 35, 112, 1)', background: 'rgba(242, 234, 245, 1)' },
  'Default': DEFAULT_COLOR_PAIR,
};

// Default colors
export const DEFAULT_BORDER_COLOR = '#4285F4'; // Blue
export const DEFAULT_EDGE_COLOR = '#666666'; // Gray
export const DOTTED_LINE_EDGE_COLOR = '#999999'; // Lighter gray for dotted-line reporting (2-3 shades lighter than DEFAULT_EDGE_COLOR)
export const OVERLAPPING_EDGE_COLOR = '#444444'; // Darker gray for overlapping lines (when dotted and solid lines overlap)

// Node dimensions
export const NODE_WIDTH = 246;
export const NODE_HEIGHT = 80;

// Re-export shared hierarchy constants for backward compatibility
export {
  ZOOM_STEPS,
  DEFAULT_ZOOM_INDEX,
  REACT_FLOW_CONFIG,
  REACT_FLOW_CONTAINER_STYLES,
  MAIN_CONTENT_STYLES,
  CURSOR_OVERRIDE_STYLES,
  ZOOM_CONTAINER_STYLES,
  fitViewToContainer
} from 'commonApp/hierarchyConstants';

