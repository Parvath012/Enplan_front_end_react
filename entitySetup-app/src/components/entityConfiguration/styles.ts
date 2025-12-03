// Entity Configuration Component Styles
// This file contains all the styles used in entity configuration components

export const entityConfigurationStyles = {
  // Main container styles
  mainContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#f5f5f5',
    transition: 'background-color 0.2s ease',
  },

  // Navigation bar styles
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

  navigationRight: {
    display: 'flex',
    alignItems: 'center',
  },

  // Tab styles
  tabContainer: {
    display: 'flex',
    alignItems: 'center',
  },

  // Base tab styles (shared by all tabs)
  baseTab: {
    position: 'relative',
    cursor: 'default',
    fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: 400,
    fontStyle: 'normal',
    fontSize: '12px',
    letterSpacing: 'normal',
    textAlign: 'center',
    lineHeight: 'normal',
    textTransform: 'none',
    textDecoration: 'none',
    padding: '5px 0',
    transition: 'color 0.2s ease',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: '-5px',
      left: 0,
      width: '100%',
      height: '2px',
      transition: 'background-color 0.2s ease',
    },
  },

  // Regular tab styles (extends baseTab)
  tab: {
    marginLeft: '20px',
  },

  // Tab 1 specific styles (extends baseTab)
  tab1: {
    marginLeft: '-7px',
  },

  // Active tab styles
  activeTab: {
    color: 'rgba(0, 111, 230, 1)',
    '&::after': {
      backgroundColor: 'rgba(0, 111, 230, 1)',
    },
  },

  // Inactive tab styles
  inactiveTab: {
    color: '#333333',
    '&::after': {
      backgroundColor: 'transparent',
    },
  },

  // Progress indicator styles
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    marginRight: '20px',
  },

  progressLabel: {
    fontSize: '12px',
    color: '#9e9e9e',
  },

  progressBar: {
    width: 290,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },

  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(0, 111, 230, 1)',
    borderRadius: 3,
    transition: 'width 0.3s ease',
  },

  progressPercentage: {
    fontSize: '12px',
    color: '#9e9e9e',
    minWidth: '20px',
  },

  // Close button styles
  closeButton: {
    marginRight: '-10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    color: '#6c757d',
    backgroundColor: 'transparent',
    transition: 'all 0.2s ease',
    '&:hover': {
      color: '#495057',
      backgroundColor: '#f0f0f0',
    },
  },

  // Tab content styles
  tabContent: {
    flex: 1,
    overflow: 'auto',
  },

  tabPanel: {
    padding: 3,
  },

  // Loading styles
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    backgroundColor: '#f5f5f5',
  },

  // Countries and Currencies specific styles
  countriesCurrenciesContainer: {
    padding: 3,
  },

  infoMessage: {
    fontSize: '12px',
    color: '#5F6368',
    marginBottom: '12px',
    marginTop: '-38px',
    marginLeft: '-5px',
  },

  gridLayout: {
    display: "grid",
    gridTemplateColumns: "240px 281px 254px 281px",
    gap: 4,
    justifyContent: "center",
  },

  // Loading states
  dataLoadingContainer: {
    position: 'relative',
    width: '100%',
    height: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // List component styles
  listPaper: {
    pb: 2,
  },

  listDivider: {
    borderBottom: '1px solid #e0e0e0',
    mx: -2,
  },

  listContent: {
    px: 2,
  },

  // Grid component styles
  gridPaper: {
    px: 1,
    pb: 3,
  },

  // Grid header (uses baseHeader)
  gridHeader: {
    fontWeight: 500,
    color: "#4A4E52",
    fontSize: "12px",
    mb: 2,
    pb: 1,
    borderBottom: "1px solid #e0e0e0",
  },

  // Responsive styles
  responsive: {
    '@media (max-width: 1200px)': {
      gridLayout: {
        gridTemplateColumns: "240px 281px",
        gap: 2,
      },
    },
    '@media (max-width: 768px)': {
      gridLayout: {
        gridTemplateColumns: "1fr",
        gap: 2,
      },
      navigationBar: {
        flexDirection: 'column',
        gap: 2,
        padding: '12px',
      },
      progressContainer: {
        marginRight: 0,
        marginTop: '8px',
      },
    },
  },
};

// Common styles that are shared across components
export const commonStyles = {
  // Base paper style (shared by list and grid papers)
  basePaper: {
    borderRadius: 2,
    border: '1px solid rgb(241 241 239)',
    pt: 1,
    boxShadow: 'none',
    backgroundColor: "#fff",
    overflow: "hidden",
  },

  // Base header style (shared by all headers)
  baseHeader: {
    fontWeight: 500,
    color: "#4A4E52",
    fontSize: "12px",
    mb: 2,
    pb: 1,
    borderBottom: "1px solid #e0e0e0",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: 2,
    pb: 1,
    borderBottom: "1px solid #e0e0e0"
  },
  headerTitle: {
    fontWeight: 500,
    color: "#4A4E52",
    fontSize: "12px",
    paddingLeft: "10px"
  },
  headerCount: {
    color: "#666",
    fontSize: "14px",
    fontWeight: 500,
    paddingRight: "10px"
  },
  // Base search field styles (shared by all search fields)
  baseSearchField: {
    height: '30px',
    paddingLeft: "12px",
    mb: 2,
    '& .MuiOutlinedInput-root': {
      height: '30px',
      background: 'inherit',
      backgroundColor: 'rgba(255, 255, 255, 1)',
      boxSizing: 'border-box',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'rgba(208, 213, 221, 1)',
      borderRadius: '4px',
      '& fieldset': {
        border: 'none',
      },
      '&.Mui-focused': {
        borderColor: 'rgba(0, 111, 230, 1)',
      },
      '& input': {
        padding: '0 8px',
        fontSize: '12px',
        fontFamily: "'InterTight-Regular', 'Inter Tight', sans-serif",
        color: '#5F6368',
        '&::placeholder': {
          color: 'rgb(180, 183, 186)',
          opacity: 1,
        },
      },
    },
  },

  searchField: {
    width: '226px',
  },

  currencySearchField: {
    width: '242px',
  },
  listContainer: {
    maxHeight: 330,
    overflowY: "auto",
    overflowX: "hidden",
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    px: 2,
    py: 1.5,
    height: 32,
    width: 216,
    backgroundColor: "#fff",
    paddingLeft: "10px",
  },
  listItemText: {
    fontSize: "12px",
    fontWeight: 400,
    color: "#5F6368",
    ml: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "180px"
  },
  // Base AG Grid styles (shared by all grids)
  baseGridContainer: {
    '--ag-row-hover-color': 'transparent !important',
    '--ag-selected-row-background-color': 'transparent !important',
    '& .ag-body-horizontal-scroll': {
      display: 'none !important',
    },
    '& .ag-body-horizontal-scroll-viewport': {
      display: 'none !important',
    },
    '& .ag-body-horizontal-scroll-container': {
      display: 'none !important',
    },
    '& .ag-theme-alpine .ag-row:hover, & .ag-theme-alpine .ag-row-hover, & .ag-theme-alpine .ag-row.ag-row-hover': {
      backgroundColor: 'transparent !important',
    },
    '& .ag-theme-alpine .ag-row:hover .ag-cell, & .ag-theme-alpine .ag-row-hover .ag-cell': {
      backgroundColor: 'transparent !important',
    },
    '& .ag-row:hover, & .ag-row-hover, & .ag-row.ag-row-hover': {
      backgroundColor: 'transparent !important',
    },
    '& .ag-row:hover .ag-cell, & .ag-row-hover .ag-cell': {
      backgroundColor: 'transparent !important',
    },
  },

  gridContainer: {
    height: 320,
  },
};
