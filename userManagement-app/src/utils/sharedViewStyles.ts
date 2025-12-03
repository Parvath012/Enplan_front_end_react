/**
 * Shared styles for view panels (UserViewPanel, RoleViewPanel)
 * Eliminates duplication of permissions table styling
 */

export const getReadOnlyPermissionsStyles = () => ({
  '& .MuiCheckbox-root': {
    '&.Mui-checked': {
      color: 'rgba(120, 172, 244, 1) !important'
    },
    '&.Mui-checked .custom-checkbox-icon.checked': {
      border: '1px solid rgba(120, 172, 244, 1) !important',
      backgroundColor: 'rgba(120, 172, 244, 1) !important'
    }
  },
  // Fix cursor for chips in dropdowns - show default cursor (arrow) instead of pointer
  '& .MuiChip-root': {
    cursor: 'default !important',
    '& .MuiChip-label': {
      cursor: 'default !important',
    },
    '& .form-field__chip-delete-icon': {
      cursor: 'default !important',
    }
  },
  '& .form-field__chips-container': {
    '& .MuiChip-root': {
      cursor: 'default !important',
      '& .MuiChip-label': {
        cursor: 'default !important',
      },
      '& .form-field__chip-delete-icon': {
        cursor: 'default !important',
      }
    }
  },
  // Hide buttons except for the action buttons (Search, Filter, Sort, Reset, Duplicate)
  '& button': {
    display: 'none !important'
  },
  // Show all buttons and action elements within the permissions action buttons container
  '& .permissions-action-buttons': {
    '& button': {
      display: 'inline-flex !important'
    },
    '& > div > div button': {
      display: 'inline-flex !important'
    },
    '& span button': {
      display: 'inline-flex !important'
    },
    // Override Duplicate button (CommonButton) color to rgba(120, 172, 244, 1)
    // Target the CommonButton which is the last Box in the last flex container
    '& > div:last-child > div:last-child': {
      backgroundColor: 'rgba(120, 172, 244, 1) !important',
      cursor: 'default !important',
      '&:hover': {
        backgroundColor: 'rgba(120, 172, 244, 1) !important',
        cursor: 'default !important'
      }
    }
  }
});

export const getUserViewPermissionsStyles = () => ({
  ...getReadOnlyPermissionsStyles(),
  // Reduce scrollableContainer height and spacing in view mode to ensure table visibility
  // Target the scrollableContainer (first div child of PermissionsTabLayout)
  '& > div': {
    height: 'auto !important',
    maxHeight: 'calc(100vh - 280px) !important',
    padding: '8px 12px 16px 12px !important',
    marginBottom: '8px !important'
  },
  // Reduce spacing in form sections to save vertical space
  '& > div > div': {
    marginBottom: '8px !important'
  },
  // Reduce margin in User Access Scope and Permissions sections
  '& > div > div > div': {
    marginBottom: '4px !important'
  }
});

export const getRoleViewPermissionsStyles = () => ({
  ...getReadOnlyPermissionsStyles(),
  // Hide User Access Scope section completely - we only want the permissions table
  // Target PermissionsTabLayout's internal structure
  // Hide the scrollableContainer's first child (User Access Scope title)
  '& > * > div:nth-of-type(1)': {
    display: 'none !important' // User Access Scope title
  },
  // Hide the first row of dropdowns
  '& > * > div:nth-of-type(2)': {
    display: 'none !important' // First row of dropdowns
  },
  // Hide the second row of dropdowns
  '& > * > div:nth-of-type(3)': {
    display: 'none !important' // Second row of dropdowns
  },
  // Hide the horizontal divider after User Access Scope
  '& > * > div:nth-of-type(4)': {
    display: 'none !important' // Horizontal divider
  },
  // Allow PermissionsTabLayout's scrollableContainer to render naturally
  '& > *': {
    height: 'auto !important',
    maxHeight: 'none !important',
    overflow: 'visible !important', // Allow parent to handle scrolling
  },
  // Preserve permission table header height (34px) - target header cells
  // Structure: scrollableContainer > PermissionsTable > Header > HeaderCells
  '& > * > div:last-child > div:first-of-type > div': {
    // Header cells - preserve 34px height
    height: '34px !important',
    minHeight: '34px !important',
    maxHeight: '34px !important',
  },
  // Restore permission table body scrolling - allow table columns to scroll internally
  // Structure: scrollableContainer > PermissionsTable > Body > Columns
  '& > * > div:last-child > div:last-of-type': {
    // This is the table body container (Box with height: 250px)
    height: '250px !important',
    maxHeight: '250px !important',
    overflowX: 'hidden !important',
    overflowY: 'hidden !important', // Body container doesn't scroll, columns do
    // Allow individual columns inside to scroll
    '& > div': {
      // Column containers (Modules, Sub Module, Permissions columns)
      maxHeight: '250px !important',
      overflowY: 'auto !important',
      overflowX: 'hidden !important',
    }
  },
  // Reduce spacing in form sections to save vertical space
  '& > div > div': {
    marginBottom: '8px !important'
  }
});



