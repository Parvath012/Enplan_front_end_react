// Base styles to eliminate duplication
const baseCellStyles = {
  position: 'absolute' as const,
  left: '0px',
  top: '0px',
  height: '40px',
  background: 'inherit',
  boxSizing: 'border-box' as const,
  borderWidth: '1px',
  borderStyle: 'solid' as const,
  borderLeft: '0px',
  borderTop: '0px',
  borderRight: '0px',
  borderRadius: '0px',
  borderTopLeftRadius: '0px',
  borderTopRightRadius: '0px',
  borderBottomRightRadius: '0px',
  borderBottomLeftRadius: '0px',
  boxShadow: 'none',
  fontFamily: "'InterTight-Regular_Medium', 'Inter Tight Medium', 'Inter Tight', sans-serif",
  fontWeight: 500,
  fontStyle: 'normal',
  fontSize: '12px',
  color: '#5F6368',
  textAlign: 'left' as const,
};

// Base text styles
const baseTextStyles = {
  fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontWeight: 500,
  fontStyle: 'normal',
  fontSize: '12px',
  color: '#5F6368',
  textAlign: 'left' as const,
};

// Reusable styles for permission table components
export const permissionTableStyles = {
  // Row text styling
  rowText: baseTextStyles,

  // Cell styling for Modules and Sub-Modules columns
  cell: {
    ...baseCellStyles,
    width: '354px', // Updated to match new column width
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderColor: 'rgba(242, 242, 240, 1)',
  },

  // Highlighted cell styling
  highlightedCell: {
    ...baseCellStyles,
    width: '288px',
    backgroundColor: 'rgba(242, 242, 240, 1)',
    borderColor: 'rgba(242, 242, 240, 1)',
  },

  // Icon styling
  moduleIcon: {
    width: '14px',
    height: '13px',
    marginRight: '8px',
  },

  // Sub-module cell styling (different width)
  subModuleCell: {
    ...baseCellStyles,
    width: '300px', // Updated to match new column width
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderColor: 'rgba(242, 242, 240, 1)',
  },
};
