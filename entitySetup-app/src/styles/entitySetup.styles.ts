

export const entitySetupStyles = {
  container: {
    backgroundColor: '#f5f5f5',
    width: '100%',
    height: '100%', // Changed from 100vh to work within admin layout
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    alignItems: 'stretch', // Ensure containers stretch
    '& .MuiContainer-root': {
      maxWidth: '100% !important',
      width: '100% !important',
      margin: '0 !important',
      padding: '12px !important', // Consistent padding with white container
      boxSizing: 'border-box !important',
    },
  },
  paper: {
    p: 4,
    borderRadius: 2,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    height: 40,
    minHeight: 40,
    maxHeight: 40,
    borderWidth: '0 0 1px 0',
    borderStyle: 'solid',
    borderColor: '#e0e0e0',
    width: '100%',
    padding: '0 16px',
    zIndex: 1000,
    margin: 0,
    flexShrink: 0,
  },

  scrollableContent: {
    flex: '1 1 auto',
    overflowY: 'auto',
    overflowX: 'hidden', 
    height: 'calc(100% - 40px)', // Updated to work within admin layout
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  headerRight: {
    display: 'flex',
    gap: 2,
    paddingRight: '5px',
  },
  backButton: {
    color: 'text.secondary',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,0.04)',
    },
  },
  title: {
    fontWeight: 600,
    color: 'text.primary',
  },
  secondaryButton: {
    borderColor: '#d0d0d0',
    color: '#666',
    textTransform: 'none',
    '&:hover': {
      borderColor: '#999',
      color: '#333',
      backgroundColor: 'rgba(0,0,0,0.04)',
    },
  },
  formSection: {
    gap: 2,
  },
  sectionTitle: {
    mb: 1.5,
    fontWeight: 650,
    color: '#4A4E52',
    fontSize: '13px',
  },
  formRow: {
    display: 'flex',
    flexWrap: 'wrap',
    columnGap: 3, // 24px column gap between fields
    rowGap: 1.75, // 12px row gap between rows
    width: '100%',
    maxWidth: '100%',
    alignItems: 'stretch',
    justifyContent: 'stretch',
    boxSizing: 'border-box',
    // Responsive behavior for all screen sizes
    '@media (min-width: 1920px)': {
      columnGap: 3, // Keep consistent 24px
    },
    '@media (max-width: 1199px)': {
      columnGap: 3, // Keep consistent 24px
    },
    '@media (max-width: 767px)': {
      flexDirection: 'column',
      columnGap: 0,
      rowGap: 1.75, // Keep consistent 12px
    },
  },
  formField: {
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    minWidth: '200px',
    // Responsive field sizing with precise gap calculations to fit perfectly
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
      boxSizing: 'border-box',
    },
  },
  fullWidthField: {
    width: '100%',
  },
  addressRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1.75, // 12px row gap consistency
    width: '100%',
    maxWidth: '100%',
    alignItems: 'stretch',
    boxSizing: 'border-box',
    // Consistent responsive behavior
    '& .MuiBox-root': {
      width: '100%',
      maxWidth: '100%',
      alignSelf: 'stretch',
      boxSizing: 'border-box',
    },
    // CRITICAL FIX: Exclude SelectField's .form-field Box from stretch behavior
    // The .form-field Box is a .MuiBox-root, so it gets stretched by the rule above
    // When stretched, FormControl width calculation is affected, causing dropdown icon (right: 8px) to be misplaced
    // Solution: Exclude .form-field from stretch to prevent icon misalignment
    '& .form-field': {
      alignSelf: 'flex-start !important',
      width: '100% !important',
      maxWidth: '100% !important',
      position: 'relative !important',
    },
    // Ensure FormControl maintains proper positioning context for icon
    '& .form-field .MuiFormControl-root': {
      position: 'relative !important',
      width: '100% !important',
      maxWidth: '100% !important',
    },
    // Force dropdown icon positioning with maximum specificity
    '& .form-field .MuiFormControl-root .form-field__dropdown-icon': {
      position: 'absolute !important',
      right: '8px !important',
      left: 'auto !important',
      top: '50% !important',
      bottom: 'auto !important',
      margin: '0 !important',
      transform: 'translateY(-50%) !important',
      zIndex: '1 !important',
    },
  },
  logoSection: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 3,
    alignItems: 'flex-start',
    width: '100%',
    // Responsive logo section layout
    '@media (max-width: 1279px)': {
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
    },
    '@media (min-width: 1280px)': {
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
  },
  logoContainer: {
    flex: '0 0 200px',
  },
  logoInfo: {
    flex: '1 1 300px',
    minWidth: '300px',
  },
  logoPlaceholder: {
    width: 200,
    height: 200,
    border: '2px dashed #ccc',
    borderRadius: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: '#1976d2',
      backgroundColor: '#f0f8ff',
    },
  },
  logoText: {
    textAlign: 'center',
    color: '#666',
  },
  logoTextPrimary: {
    color: '#1976d2',
    fontWeight: 500,
  },
  logoTextSecondary: {
    color: '#999',
    fontSize: '0.75rem',
  },
  uploadButton: {
    borderColor: '#d0d0d0',
    color: '#666',
    textTransform: 'none',
    mb: 2,
    '&:hover': {
      borderColor: '#999',
      color: '#333',
    },
  },
  helperText: {
    color: '#666',
    fontSize: '0.875rem',
    lineHeight: 1.4,
    mb: 1,
  },
  checkbox: {
    '& .MuiFormControlLabel-label': {
      fontSize: '0.875rem',
      color: '#333',
    },
  },
  checkboxCustom: {
    '& .MuiCheckbox-root': {
      '& .MuiSvgIcon-root': {
        border: '1px solid #d0d0d0',
        borderRadius: '3px',
        transition: 'border-color 0.2s',
        color: 'transparent',
        width: '18px',
        height: '18px',
      },
      '&:hover .MuiSvgIcon-root': {
        border: '1px solid #42a5f5',
        borderRadius: '3px',
      },
      '&.Mui-checked .MuiSvgIcon-root': {
        border: '1px solid #1976d2',
        color: '#1976d2',
      },
      '&.Mui-checked:hover .MuiSvgIcon-root': {
        border: '1px solid #64b5f6',
      }
    }
  },
  footer: {
    display: 'flex',
    width: '298px',
    height: '72px',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid #e0e0e0',
    mt: 4,
  },
  saveButton: {
    px: 3,
    py: 1,
    width: 56,
    height: 24,
    borderRadius: '3px',
    textTransform: 'none',
    fontSize: '12px',
    fontWeight: 500,
    backgroundColor: '#333333',
    color: '#BCBCBC',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: '#333333',
      boxShadow: 'none',
    },
  },
  inputField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      '& fieldset': {
        borderColor: '#d0d0d0',
      },
      '&:hover fieldset': {
        borderColor: '#999',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1976d2',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#666',
      '&.Mui-focused': {
        color: '#1976d2',
      },
    },
    '& .MuiFormHelperText-root': {
      color: '#666',
      fontSize: '0.75rem',
    },
  },
  selectField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      '& fieldset': {
        borderColor: '#d0d0d0',
      },
      '&:hover fieldset': {
        borderColor: '#999',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1976d2',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#666',
      '&.Mui-focused': {
        color: '#1976d2',
      },
    },
  },
  
  // New responsive container styles
  entityFormContainer: {
    width: '100%',
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    rowGap: '18px',
    alignItems: 'stretch',
    backgroundColor: '#fff',
    borderRadius: 2,
    padding: '12px', // Fixed padding instead of 1.5 for precise control
    boxSizing: 'border-box',
    overflow: 'hidden', // Prevent content from overflowing
    // Ensure all child elements stretch but stay within bounds
    '& > *': {
      width: '100%',
      maxWidth: '100%',
      alignSelf: 'stretch',
      boxSizing: 'border-box',
    },
  },
  
  // Grid layout fixes for logo and footer sections
  gridContainer: {
    display: 'grid',
    width: '100%',
    maxWidth: '100%',
    alignItems: 'stretch',
    gap: '24px', // Consistent 24px column gap
    mt: '18px', // 18px section gap from previous section
    boxSizing: 'border-box',
    // Responsive grid columns - keep grid layout for 1024x768 and larger
    gridTemplateColumns: 'repeat(12, 1fr)',
    '@media (max-width: 767px)': {
      display: 'flex !important',
      flexDirection: 'column !important',
      gap: '18px !important', // Use section gap for mobile stacking
    },
    '@media (min-width: 768px)': {
      gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
      gap: '24px', // Consistent 24px column gap
    },
    '@media (min-width: 1600px)': {
      gap: '24px', // Keep consistent 24px
    },
    '@media (min-width: 1920px)': {
      gap: '24px', // Keep consistent 24px
    },
  },
  
  // Grid items
  gridItemLogo: {
    gridColumn: 'span 8', // Reduced from 9 to give more space for footer
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    alignSelf: 'stretch',
    boxSizing: 'border-box',
    '@media (max-width: 767px)': {
      width: '100% !important',
      maxWidth: '100% !important',
    },
    '& > div': {
      width: '100%',
      maxWidth: '100%',
      minWidth: '100%',
      boxSizing: 'border-box',
    },
  },
  
  gridItemFooter: {
    gridColumn: 'span 4', // Increased from 3 to 4 for better alignment
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    boxSizing: 'border-box',
    '@media (max-width: 767px)': {
      width: '100% !important',
      maxWidth: '100% !important',
      justifyContent: 'center',
    },
    // Ensure FormFooter stays within boundaries
    '& > div': {
      width: '100%',
      maxWidth: '100%',
      minWidth: 0,
      boxSizing: 'border-box',
    },
  },
  
} as const;
