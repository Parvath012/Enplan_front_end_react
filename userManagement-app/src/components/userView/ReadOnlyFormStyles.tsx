import { SxProps, Theme } from '@mui/material';

/**
 * Shared styles for read-only form fields in view mode
 * Removes red stripe from required fields and applies consistent styling
 */
export const getReadOnlyFormStyles = (includeCheckbox: boolean = false, includeSwitch: boolean = false): SxProps<Theme> => {
  const baseStyles: SxProps<Theme> = {
    // Remove red stripe from all required fields in view mode
    '& .form-field--required': {
      '& .form-field__input .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
        boxShadow: 'none !important',
      },
      '& .form-field__input--readonly.form-field--required .MuiOutlinedInput-root::before': {
        display: 'none !important',
      },
      '& .form-field__select .MuiOutlinedInput-notchedOutline': {
        boxShadow: 'none !important',
        borderLeft: '1px solid #e0e0e0 !important',
      },
      '& .form-field__multiselect .MuiOutlinedInput-notchedOutline': {
        boxShadow: 'none !important',
        borderLeft: '1px solid #e0e0e0 !important',
      },
    },
    '& .MuiInputBase-root': {
      backgroundColor: '#f5f5f5 !important',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#e0e0e0 !important',
        borderLeft: '1px solid #e0e0e0 !important',
        boxShadow: 'none !important', // Remove red stripe
      },
      '& .MuiInputBase-input': {
        color: '#9E9E9E !important', // Standard grey for disabled/read-only fields (rgb(158, 158, 158))
        cursor: 'default !important'
      }
    },
    '& .MuiSelect-select': {
      color: '#9E9E9E !important', // Standard grey for disabled/read-only fields (rgb(158, 158, 158))
      cursor: 'default !important'
    },
    '& .MuiFormControlLabel-root': {
      cursor: 'default !important'
    },
    '& .MuiFormControlLabel-label': {
      cursor: 'default !important'
    },
    '& button': {
      display: 'none !important'
    }
  };

  if (includeCheckbox) {
    return {
      ...baseStyles,
      '& .MuiCheckbox-root': {
        '&.Mui-checked': {
          color: '#4caf50 !important'
        },
        cursor: 'default !important',
        '&:hover': {
          backgroundColor: 'transparent !important'
        },
        '&:hover .custom-checkbox-icon.unchecked': {
          border: '1px solid #6c757d !important'
        },
        '&:hover .custom-checkbox-icon.checked': {
          border: '1px solid #0051ab !important',
          backgroundColor: '#0051ab !important'
        }
      }
    };
  }

  if (includeSwitch) {
    return {
      ...baseStyles,
      '& .MuiSwitch-root': {
        '& .MuiSwitch-switchBase': {
          '&.Mui-checked': {
            color: '#4caf50 !important',
            '& + .MuiSwitch-track': {
              backgroundColor: '#4caf50 !important'
            }
          }
        },
        cursor: 'default !important',
        '&:hover': {
          backgroundColor: 'transparent !important'
        }
      }
    };
  }

  return baseStyles;
};

