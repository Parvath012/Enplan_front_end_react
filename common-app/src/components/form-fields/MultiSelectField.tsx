import React, { useState } from 'react';
import { Box, FormControl, Select, MenuItem, Chip, ListItemText } from '@mui/material';
import { Close, ChevronDown } from '@carbon/icons-react';
import CustomTooltip from '../common/CustomTooltip';
import CustomCheckbox from '../common/CustomCheckbox';
import './styles.scss';

interface MultiSelectFieldProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  width?: string | number;
  noOptionsMessage?: string;
  maxDropdownHeight?: number;
}

// CustomDeleteIcon for chips
const CustomDeleteIcon: React.FC<{ onDelete: () => void }> = ({ onDelete }) => (
  <CustomTooltip title="Cancel" placement="bottom">
    <Box
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      className="form-field__chip-delete-icon"
    >
      <Close size={14} />
    </Box>
  </CustomTooltip>
);

const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = '',
  disabled = false,
  required = false,
  fullWidth = true,
  size = 'small',
  width = '100%',
  noOptionsMessage = 'No options available',
  maxDropdownHeight = 200,
}) => {
  const [open, setOpen] = useState(false);
  const [isXHovered, setIsXHovered] = useState(false);

  const selectedValues = Array.isArray(value) ? value.filter((v) => v !== '__select_all__' && v && v.trim() !== '' && v !== '[]') : [];
  const optionCount = options?.length ?? 0;
  const ROW_HEIGHT = 42;
  const SELECT_ALL_ROWS = optionCount > 0 ? 1 : 0;
  const DIVIDER_PX = optionCount > 0 ? 1 : 0;
  const EXTRA_CHROME_PX = 11;
  const totalRows = optionCount > 0 ? (optionCount + SELECT_ALL_ROWS) : 1;
  // Set maximum height for better UX, with scrolling when needed
  const calculatedHeight = totalRows * ROW_HEIGHT + DIVIDER_PX + EXTRA_CHROME_PX;
  const menuHeightPx = Math.min(calculatedHeight, maxDropdownHeight);

  return (
    <Box sx={{ width, position: 'relative' }} className={required ? 'form-field form-field--required' : 'form-field'}>
      <label className="form-field__label">{label}</label>
      <FormControl 
        variant="outlined" 
        fullWidth={fullWidth} 
        size={size} 
        disabled={disabled}
        sx={{
          position: 'relative',
          '& .MuiSelect-icon': {
            display: 'none', // Hide default MUI dropdown icon
          },
        }}
      >
        <Select<string[]>
          multiple
          value={selectedValues}
          onChange={() => {
            // Disabled default onChange behavior - selections now handled by direct checkbox clicks
            // This prevents unintended selections when clicking on text areas of menu items
          }}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          open={open}
          displayEmpty
          className="form-field__multiselect"
          renderValue={() => (
            <span className="form-field__placeholder">{placeholder}</span>
          )}
          MenuProps={{
            PaperProps: {
              className: 'form-field__menu-paper',
              sx: {
                mt: 0.5,
                maxHeight: menuHeightPx,
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#c1c1c1',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#a8a8a8',
                },
              },
            },
            anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
            transformOrigin: { vertical: 'top', horizontal: 'left' },
          }}
        >
          {optionCount > 0 ? [
            // Select All - only show if there are options
            <MenuItem 
              key="__select_all__"
              value="__select_all__" 
              className="form-field__select-all-item"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Prevent row clicks from triggering selections
              }}
              sx={{
                backgroundColor: '#fff', // Always white by default
                '&:hover': {
                  backgroundColor: !isXHovered ? '#F2F2F0' : '#fff', // Highlight only if not hovering X
                },
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {(() => {
                const total = options?.length ?? 0;
                const allSelected = total > 0 && selectedValues.length === total;
                return (
                  <CustomCheckbox 
                    checked={allSelected} 
                    sx={{ mr: '12px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle select all logic when checkbox is directly clicked
                      const opts = options || [];
                      if (allSelected) {
                        onChange?.([]);
                      } else {
                        onChange?.([...opts]);
                      }
                    }}
                  />
                );
              })()}
              <ListItemText
                primary="Select All"
                slotProps={{
                  primary: {
                    fontFamily: `'Inter18pt-Regular', 'Inter 18pt', sans-serif`,
                    fontWeight: 400,
                    fontStyle: 'normal',
                    fontSize: '12px',
                  },
                }}
                sx={{ color: '#5F6368' }}
              />
              {/* The X icon in the Select All row now only closes the menu */}
              <CustomTooltip title="Close" placement="bottom">
                <Box
                  id="select-all-close-icon"
                  data-testid="cancel-button" // <-- changed from reset-button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    setIsXHovered(false);
                    // Do NOT call onChange?.([]) if you only want to close, not reset
                  }}
                  onMouseEnter={() => setIsXHovered(true)}
                  onMouseLeave={() => setIsXHovered(false)}
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    width: 24,
                    height: 24,
                    transition: 'background 0.2s',
                    ml: 'auto',
                    background: isXHovered ? '#F2F2F0' : 'transparent',
                  }}
                >
                  <Close size={18} />
                </Box>
              </CustomTooltip>
            </MenuItem>,
            
            // Divider below Select All
            <Box key="divider" className="form-field__divider" />,
            
            // Options
            ...(options || []).map((opt) => (
              <MenuItem 
                key={opt} 
                value={opt} 
                className="form-field__multiselect-menu-item"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Prevent row clicks from triggering selections
                }}
              >
                <CustomCheckbox 
                  checked={selectedValues.indexOf(opt) > -1} 
                  sx={{ mr: '12px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle individual option selection when checkbox is directly clicked
                    const isSelected = selectedValues.indexOf(opt) > -1;
                    if (isSelected) {
                      onChange?.(selectedValues.filter((v) => v !== opt));
                    } else {
                      onChange?.([...selectedValues, opt]);
                    }
                  }}
                />
                <ListItemText
                  primary={opt}
                  slotProps={{
                    primary: {
                      fontFamily: `'Inter18pt-Regular', 'Inter 18pt', sans-serif`,
                      fontWeight: 400,
                      fontStyle: 'normal',
                      fontSize: '12px',
                    },
                  }}
                />
              </MenuItem>
            ))
          ] : (
            /* Show custom message when there are no options */
            <MenuItem 
              key="no-options"
              value="__no_options__"
              disabled
              className="form-field__multiselect-menu-item"
            >
              <ListItemText
                primary={noOptionsMessage}
                slotProps={{
                  primary: {
                    fontFamily: `'Inter18pt-Regular', 'Inter 18pt', sans-serif`,
                    fontWeight: 400,
                    fontStyle: 'normal',
                    fontSize: '12px',
                  },
                }}
                sx={{ color: '#5F6368' }}
              />
            </MenuItem>
          )}
        </Select>
        {/* Custom dropdown icon - positioned relative to FormControl */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            right: '8px',
            transform: `translateY(-50%) ${open ? 'rotate(180deg)' : 'rotate(0deg)'}`,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            transition: 'transform 0.2s ease',
            zIndex: 1,
          }}
        >
          <ChevronDown size={16} style={{ color: '#666' }} />
        </Box>
      </FormControl>

      {/* Chips container below */}
      <Box className="form-field__chips-container">
        {selectedValues.filter(item => item && item.trim() !== '' && item !== '[]').map((item) => {
          const isTruncated = item.length > 24;
          const displayText = isTruncated ? `${item.substring(0, 24)}...` : item;
          
          return (
            <Box key={item} sx={{ display: 'flex', alignItems: 'center', maxWidth: '100%' }}>
              {isTruncated ? (
                <Chip
                  label={
                    <CustomTooltip title={item} placement="bottom">
                      <Box
                        sx={{
                          boxSizing: 'border-box',
                          width: '100%',
                          fontFamily: `'InterTight-Regular', 'Inter Tight', sans-serif`,
                          fontWeight: 400,
                          fontStyle: 'normal',
                          fontSize: '10px',
                          color: '#5F6368',
                          textAlign: 'left',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          minHeight: '5px',
                          display: 'inline-block',
                        }}
                      >
                        {displayText}
                      </Box>
                    </CustomTooltip>
                  }
                  onDelete={() => onChange?.(selectedValues.filter((v) => v !== item))}
                  deleteIcon={<CustomDeleteIcon onDelete={() => onChange?.(selectedValues.filter((v) => v !== item))} />}
                  size="small"
                  sx={{
                    position: 'relative',
                    backgroundColor: '#FFFFFF',
                    border: '1px dashed #E0E0E0',
                    borderRadius: '6px',
                    color: '#333',
                    height: '18px',
                    px: 0.5,
                    cursor: 'text',
                  }}
                />
              ) : (
                <Chip
                  label={
                    <Box
                      sx={{
                        boxSizing: 'border-box',
                        width: '100%',
                        fontFamily: `'InterTight-Regular', 'Inter Tight', sans-serif`,
                        fontWeight: 400,
                        fontStyle: 'normal',
                        fontSize: '10px',
                        color: '#5F6368',
                        textAlign: 'left',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        minHeight: '5px',
                      }}
                    >
                      {displayText}
                    </Box>
                  }
                  onDelete={() => onChange?.(selectedValues.filter((v) => v !== item))}
                  deleteIcon={<CustomDeleteIcon onDelete={() => onChange?.(selectedValues.filter((v) => v !== item))} />}
                  size="small"
                  sx={{
                    position: 'relative',
                    backgroundColor: '#FFFFFF',
                    border: '1px dashed #E0E0E0',
                    borderRadius: '6px',
                    color: '#333',
                    height: '18px',
                    px: 0.5,
                    cursor: 'text',
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default MultiSelectField;
