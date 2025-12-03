import React from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Search, Close } from '@carbon/icons-react';
import CustomTooltip from '../common/CustomTooltip';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  customStyle?: any;
}

const SearchField: React.FC<SearchFieldProps> = ({ value, onChange, placeholder, customStyle }) => {
  const handleClearSearch = () => {
    onChange('');
  };

  return (
    <TextField
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={customStyle || {
        height: '30px',
        paddingLeft: "12px",
        mb: 2,
        width: '226px',
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
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Search
                size={14}
                style={{
                  color: '#5F6368',
                  marginLeft: '-1px',
                }}
              />
            </InputAdornment>
          ),
          endAdornment: value && (
            <InputAdornment position="end">
              <CustomTooltip title="Clear" placement="bottom">
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  sx={{
                    padding: "2px",
                    width: "18px",
                    height: "18px",
                    "&:hover": {
                      backgroundColor: "rgba(242, 242, 240, 1)",
                      borderRadius: "4px",
                    },
                  }}
                >
                  <Close size={12} style={{ color: "#5F6368" }} />
                </IconButton>
              </CustomTooltip>
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default SearchField;
