// Common styles and constants for PermissionTable components
export const COMMON_STYLES = {
  activeBackgroundColor: '#e3f2fd',
  hoverBackgroundColor: 'rgba(242, 242, 240, 1)',
  defaultBackgroundColor: '#ffffff',
  borderColor: 'rgba(242, 242, 240, 1)',
  textColor: '#5F6368',
  headerTextColor: '#818586',
  fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  headerFontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: '12px',
  headerFontSize: '10px',
  fontWeight: 500,
  headerFontWeight: 650
};

// Base cell styles for table cells
export const getBaseCellStyles = (width: string, backgroundColor: string = COMMON_STYLES.defaultBackgroundColor) => ({
  position: 'relative' as const,
  left: '0px',
  top: '0px',
  width,
  height: '40px',
  background: 'inherit',
  backgroundColor,
  boxSizing: 'border-box' as const,
  borderWidth: '1px',
  borderStyle: 'solid' as const,
  borderColor: COMMON_STYLES.borderColor,
  borderLeft: '0px',
  borderTop: '0px',
  borderRight: '0px',
  borderRadius: '0px',
  boxShadow: 'none',
  fontFamily: COMMON_STYLES.fontFamily,
  fontWeight: COMMON_STYLES.fontWeight,
  fontStyle: 'normal' as const,
  fontSize: COMMON_STYLES.fontSize,
  color: COMMON_STYLES.textColor,
  textAlign: 'left' as const,
  cursor: 'pointer'
});

// Base span styles for text content
export const getBaseSpanStyles = () => ({
  fontFamily: COMMON_STYLES.fontFamily,
  fontWeight: COMMON_STYLES.fontWeight,
  fontStyle: 'normal' as const,
  fontSize: COMMON_STYLES.fontSize,
  color: COMMON_STYLES.textColor,
  textAlign: 'left' as const
});

// Flex container styles for button groups
export const getFlexContainerStyles = () => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px'
});

// Cell content styles for inner content
export const getCellContentStyles = () => ({
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '12px',
  paddingRight: '12px',
  height: '100%',
  justifyContent: 'space-between'
});

// Button styles for action buttons
export const getButtonStyles = () => ({
  width: '28px',
  height: '28px',
  padding: '4px',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    backgroundColor: COMMON_STYLES.hoverBackgroundColor
  }
});

// Divider styles for separators
export const getDividerStyles = () => ({
  width: '1px',
  height: '20px',
  backgroundColor: '#e0e0e0',
  margin: '0 4px'
});

// Header cell styles for table headers
export const getHeaderCellStyles = (width: string, isLastColumn: boolean = false) => ({
  ...(width.startsWith('flex:') ? { flex: width.split(':')[1].trim() } : { width }),
  height: '34px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingLeft: '12px',
  paddingRight: '12px',
  borderRight: isLastColumn ? 'none' : '1px solid #e0e0e0',
  fontFamily: COMMON_STYLES.headerFontFamily,
  fontWeight: COMMON_STYLES.headerFontWeight,
  fontStyle: 'normal' as const,
  fontSize: COMMON_STYLES.headerFontSize,
  color: COMMON_STYLES.headerTextColor,
  textAlign: 'left' as const,
  cursor: 'pointer',
  background: 'inherit',
  backgroundColor: 'rgba(240, 239, 239, 1)',
  boxSizing: 'border-box' as const,
  borderWidth: '1px',
  borderStyle: 'solid' as const,
  borderColor: 'rgba(180, 180, 178, 1)',
  borderRadius: '0px',
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: '#f0f0f0'
  }
});

// Placeholder cell styles for empty states
export const getPlaceholderCellStyles = () => ({
  position: 'relative' as const,
  left: '0px',
  top: '0px',
  width: '100%',
  height: '40px',
  background: 'inherit',
  backgroundColor: COMMON_STYLES.defaultBackgroundColor,
  boxSizing: 'border-box' as const,
  borderWidth: '1px',
  borderStyle: 'solid' as const,
  borderColor: COMMON_STYLES.borderColor,
  borderLeft: '0px',
  borderTop: '0px',
  borderRight: '0px',
  borderRadius: '0px',
  boxShadow: 'none',
  fontFamily: COMMON_STYLES.fontFamily,
  fontWeight: COMMON_STYLES.fontWeight,
  fontStyle: 'normal' as const,
  fontSize: COMMON_STYLES.fontSize,
  color: COMMON_STYLES.textColor,
  textAlign: 'left' as const,
  cursor: 'default',
  opacity: 0.5,
  pointerEvents: 'none' as const
});

// Loading/Error state container styles
export const getStateContainerStyles = () => ({
  paddingLeft: '0px',
  paddingTop: '0px',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '8px',
  justifyContent: 'center',
  alignItems: 'center',
  height: '400px'
});

// Form styles for user forms
export const getUserFormStyles = () => ({
  container: {
    backgroundColor: '#f5f5f5',
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    alignItems: 'stretch',
    '& .MuiContainer-root': {
      maxWidth: '100% !important',
      width: '100% !important',
      margin: '0 !important',
      padding: '12px !important',
      boxSizing: 'border-box !important',
    },
  },
  scrollableContent: {
    flex: '1 1 auto',
    overflowY: 'auto' as const,
    overflowX: 'hidden',
    height: 'calc(100% - 20px)'
  },
  formSection: {
    width: '100%',
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'stretch',
    backgroundColor: '#fff',
    borderRadius: 2,
    padding: '12px', // Fixed padding instead of theme units for precise control
    boxSizing: 'border-box' as const,
    overflow: 'hidden', // Prevent content from overflowing
    // Ensure all child elements stretch but stay within bounds
    '& > *': {
      width: '100%',
      maxWidth: '100%',
      alignSelf: 'stretch',
      boxSizing: 'border-box' as const,
    },
  },
  scrollableContainer: {
    backgroundColor: '#fff',
    borderRadius: 2,
    padding: 2,
    height: '100%',
    position: 'relative' as const,
    overflowY: 'auto' as const,
    overflowX: 'hidden',
    boxSizing: 'border-box' as const
  },
  formRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    columnGap: 3, // 24px column gap between fields
    rowGap: 1.75, // 14px row gap between rows (1.75 * 8px = 14px)
    width: '100%',
    maxWidth: '100%',
    alignItems: 'stretch',
    justifyContent: 'stretch',
    boxSizing: 'border-box' as const,
    // Responsive behavior matching EntitySetup for all screen sizes
    '@media (min-width: 1920px)': {
      columnGap: 3, // Keep consistent 24px
    },
    '@media (max-width: 1199px)': {
      columnGap: 3, // Keep consistent 24px
    },
    '@media (max-width: 767px)': {
      flexDirection: 'column' as const,
      columnGap: 0,
      rowGap: 1.75, // Keep consistent 14px
    }
  },
  formField: {
    display: 'flex',
    flexDirection: 'column' as const,
    boxSizing: 'border-box' as const,
    minWidth: '200px',
    // Responsive field sizing with precise gap calculations to fit perfectly (matching EntitySetup)
    flex: '1 1 calc(25% - 18px)', // 4 fields per row: 24px gap / 4 fields = 6px per field, minus 18px for perfect fit
    '@media (max-width: 1199px)': {
      flex: '1 1 calc(50% - 12px)', // 2 fields per row: 24px gap / 2 fields = 12px per field
    },
    '@media (max-width: 767px)': {
      flex: '1 1 100%', // 1 field per row on mobile
      minWidth: '0',
      width: '100%',
    },
    // Ensure all form controls stretch but stay within bounds
    '& .MuiFormControl-root, & .MuiTextField-root, & .MuiSelect-root': {
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box' as const,
    },
  },
  sectionTitle: {
    mb: 1.5, // 12px margin bottom for section title spacing
    fontWeight: 650,
    color: '#4A4E52',
    fontSize: '13px',
    fontFamily: "'Inter Tight, -apple-system, BlinkMacSystemFont, Segoe UI', Roboto, sans-serif"
  },
  // Address section responsive container matching EntitySetup
  addressRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 1.75, // 14px row gap consistency  
    width: '100%',
    maxWidth: '100%',
    alignItems: 'stretch',
    boxSizing: 'border-box' as const,
    // Consistent responsive behavior
    '& .MuiBox-root': {
      width: '100%',
      maxWidth: '100%',
      alignSelf: 'stretch',
      boxSizing: 'border-box' as const,
    },
  }
});

// Reusable divider styles to eliminate duplication
export const getHorizontalDividerStyles = () => ({
  width: '100%',
  height: '1px',
  background: 'repeating-linear-gradient(to right, transparent, transparent 4px, #e0e0e0 4px, #e0e0e0 8px)',
  margin: '18px 0',
  flexShrink: 0,
});

export const getVerticalDividerStyles = () => ({
  position: 'absolute' as const,
  left: 'calc(34% - 12px)',
  top: '120%',
  transform: 'translateY(-50%)',
  width: '2px',
  height: '110px',
  backgroundColor: '#e0e0e0',
  zIndex: 1,
  pointerEvents: 'none' as const,
  transition: 'all 0.2s ease-in-out'
});

export const getSmallVerticalDividerStyles = () => ({
  width: '1px',
  height: '18px',
  backgroundColor: '#e0e0e0',
  ml: 1,
  mr: -1
});

export const getSectionTitleContainerStyles = () => ({
  display: 'flex',
  alignItems: 'center'
});

// Checkbox container styles for permissions layout
export const getCheckboxContainerStyles = () => ({
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '12px',
  paddingRight: '12px',
  height: '40px',
  backgroundColor: '#ffffff',
});

// Checkbox label styles for permissions layout
export const getCheckboxStyles = () => ({
  '& .MuiFormControlLabel-label': {
    fontFamily: "'Inter Tight, -apple-system, BlinkMacSystemFont, Segoe UI', Roboto, sans-serif",
    fontWeight: 500,
    fontStyle: 'normal' as const,
    fontSize: '12px',
    color: '#5F6368',
    marginLeft: '8px'
  },
  '& .MuiCheckbox-root': {
    padding: '4px'
  }
});

// Common flex container styles to eliminate duplication
export const getFlexBetweenContainerStyles = () => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
});

// Button styles for action buttons in forms
export const getActionButtonStyles = () => ({
  position: 'relative' as const,
  width: '132px',
  height: '26px',
  background: 'inherit',
  backgroundColor: 'rgba(0, 111, 230, 1)',
  border: 'none',
  borderRadius: '5px',
  boxShadow: 'none',
  textTransform: 'none' as const,
  px: 1.5,
  transition: 'background-color 0.2s ease',
  '&:hover': { 
    backgroundColor: 'rgba(0, 81, 171, 1)', 
    boxShadow: 'none' 
  }
});

// Button content container styles
export const getButtonContentStyles = () => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%'
});

// Button text styles
export const getButtonTextStyles = () => ({
  fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 500,
  fontStyle: 'normal' as const,
  fontSize: '14px',
  color: '#D0F0FF',
  lineHeight: '20px'
});

// Module header container styles - using existing getCellContentStyles
export const getModuleHeaderContainerStyles = getCellContentStyles;

// Module icon container styles - using existing getFlexContainerStyles  
export const getModuleIconContainerStyles = getFlexContainerStyles;