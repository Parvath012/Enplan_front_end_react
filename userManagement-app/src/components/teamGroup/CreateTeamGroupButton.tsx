import React from 'react';
import { Button, Box } from '@mui/material';
import { Events } from '@carbon/icons-react';

interface CreateTeamGroupButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

const CreateTeamGroupButton: React.FC<CreateTeamGroupButtonProps> = ({ onClick, disabled = false }) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <Button
      variant="contained"
      onClick={handleClick}
      disabled={disabled}
      sx={{
        borderWidth: '0px',
        width: '75px',
        height: '25px',
        background: 'inherit',
        backgroundColor: 'rgba(0, 111, 230, 1)',
        border: 'none',
        borderRadius: '4px',
        MozBoxShadow: '0px 1px 2px rgba(16, 24, 40, 0.0509803921568627)',
        WebkitBoxShadow: '0px 1px 2px rgba(16, 24, 40, 0.0509803921568627)',
        boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.0509803921568627)',
        minWidth: 'auto',
        padding: '4px 12px',
        fontFamily: "'Inter Tight', sans-serif",
        fontWeight: 500,
        fontSize: '12px',
        color: '#D0F0FF',
        textTransform: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        '&:hover': {
          backgroundColor: 'rgba(0, 95, 200, 1)',
          boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.0509803921568627)',
        },
        '&:active': {
          backgroundColor: 'rgba(0, 85, 180, 1)',
          boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.0509803921568627)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Events size={16} style={{ color: '#D0F0FF' }} />
      </Box>
      <Box component="span" sx={{ lineHeight: 1 }}>
        Create
      </Box>
    </Button>
  );
};

export default CreateTeamGroupButton;

