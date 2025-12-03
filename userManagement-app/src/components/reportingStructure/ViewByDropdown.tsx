import React from 'react';
import { Menu, MenuItem, Box, Typography } from '@mui/material';
import { ViewByType, VIEW_BY_OPTIONS } from '../../constants/reportingStructureConstants';

interface ViewByDropdownProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  selectedView: ViewByType;
  onSelect: (view: ViewByType) => void;
}

const ViewByDropdown: React.FC<ViewByDropdownProps> = ({
  anchorEl,
  open,
  onClose,
  selectedView,
  onSelect,
}) => {
  const handleSelect = (view: ViewByType) => {
    onSelect(view);
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      slotProps={{
        paper: {
          sx: {
            minWidth: 220,
            borderRadius: '8px',
            boxShadow: '0px 2px 6px rgba(0,0,0,0.15)',
            marginTop: '9px',
            marginLeft: '-145px',
          },
        },
      }}
      MenuListProps={{
        sx: {
          padding: 0,
        },
      }}
      disableAutoFocusItem
    >
      <Box
        sx={{
          px: 2,
          py: 1,
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Typography
          sx={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#1f1f1f',
            fontFamily: "'Inter Tight', sans-serif",
          }}
        >
          View By
        </Typography>
      </Box>
      {VIEW_BY_OPTIONS.map((item) => {
        const isSelected = selectedView === item.value;
        return (
          <MenuItem
            key={item.value}
            selected={isSelected}
            onClick={() => handleSelect(item.value)}
            sx={{
              minHeight: '42px',
              px: 2,
              py: 1,
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '12px',
              color: '#5F6368',
              fontWeight: 400,
              borderLeft: isSelected ? '3px solid #1976d2' : '3px solid transparent',
              backgroundColor: 'transparent',
              '&.Mui-selected': {
                backgroundColor: 'transparent !important',
                borderLeft: '3px solid #1976d2 !important',
              },
              '&.Mui-selected:hover': {
                backgroundColor: 'transparent !important',
                borderLeft: '3px solid #1976d2 !important',
              },
              '&:not(.Mui-selected):hover': {
                backgroundColor: '#e8e7e7',
                borderLeft: '3px solid transparent',
              },
            }}
          >
            {item.label}
          </MenuItem>
        );
      })}
    </Menu>
  );
};

export default ViewByDropdown;

