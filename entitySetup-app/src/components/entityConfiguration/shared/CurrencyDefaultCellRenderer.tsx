import React, { memo } from 'react';
import { IconButton, Box } from '@mui/material';

interface CurrencyDefaultCellRendererProps {
  data: any;
  isEditMode: boolean;
  onSetDefault: (currencyCode: string) => void;
  defaultCurrency: string[];
  isDefault: string | null;
  isPrePopulated: boolean;
}

const CurrencyDefaultCellRenderer: React.FC<CurrencyDefaultCellRendererProps> = memo(({ 
  data, 
  isEditMode, 
  onSetDefault, 
  defaultCurrency,
  isDefault,
  isPrePopulated 
}) => {
  const handleClick = () => {
    console.log('🔘 Radio button clicked:', {
      currencyCode: data.currencyCode,
      currentIsDefault: isDefault,
      willSetAsDefault: data.currencyCode
    });
    onSetDefault(data.currencyCode);
  };

  return (
    <IconButton
      disabled={!isEditMode}
      onClick={handleClick}
      size="small"
      sx={{
        opacity: 1,
        cursor: 'pointer',
        padding: '0',
        transition: 'none',
        '&:hover': {
          backgroundColor: 'transparent'
        },
        '&:active': {
          backgroundColor: 'transparent'
        },
        '&:focus': {
          backgroundColor: 'transparent'
        },
        '&:focus-visible': {
          backgroundColor: 'transparent'
        }
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 18,
          height: 18,
          borderRadius: '50%',
          border: `${isDefault === data.currencyCode ? '5px solid #0051AB' : '1px solid #CBD5E1'}`,
          backgroundColor: '#FFFFFF',
          boxSizing: 'border-box',
          transition: 'none',
          '&:hover': {
            border: `${isDefault === data.currencyCode ? '5px solid #0051AB' : '1px solid #90caf9'}`,
          }
        }}
      />
    </IconButton>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.data.currencyCode === nextProps.data.currencyCode &&
    prevProps.isEditMode === nextProps.isEditMode &&
    prevProps.defaultCurrency === nextProps.defaultCurrency &&
    prevProps.isDefault === nextProps.isDefault &&
    prevProps.isPrePopulated === nextProps.isPrePopulated &&
    prevProps.onSetDefault === nextProps.onSetDefault
  );
});

export default CurrencyDefaultCellRenderer;
