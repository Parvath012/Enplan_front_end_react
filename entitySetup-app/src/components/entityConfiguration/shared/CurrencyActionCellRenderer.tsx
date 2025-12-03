import React, { memo, Suspense } from 'react';
import { IconButton } from '@mui/material';
import { TrashCan } from '@carbon/icons-react';
// Module Federation imports
const CustomTooltip = React.lazy(() => import('commonApp/CustomTooltip'));

interface CurrencyActionCellRendererProps {
  data: any;
  isEditMode: boolean;
  onToggle: (currencyCode: string) => void;
  defaultCurrency: string[];
  isDefault: string | null;
}

const CurrencyActionCellRenderer: React.FC<CurrencyActionCellRendererProps> = memo(({ 
  data, 
  isEditMode, 
  onToggle, 
  defaultCurrency,
  isDefault
}) => {
  const isDefaultCurrency = defaultCurrency.includes(data.currencyCode);
  const isUserDefaultCurrency = isDefault === data.currencyCode;
  const isDisabled = !isEditMode || isDefaultCurrency || isUserDefaultCurrency;
  
  const handleClick = () => {
    console.log('🗑️ Trash button clicked:', {
      currencyCode: data.currencyCode,
      isDefaultCurrency,
      isUserDefaultCurrency,
      isDisabled
    });
    onToggle(data.currencyCode);
  };
  
  return (
    <Suspense fallback={<div></div>}>
      <CustomTooltip title="Delete" placement="top">
        <span>
          <IconButton
            disabled={isDisabled}
            onClick={handleClick}
            size="small"
            sx={{
              opacity: isDisabled ? 0.5 : 1,
              cursor: isDisabled ? 'not-allowed' : 'pointer'
            }}
          >
            <TrashCan size={16} color="#5B6061" />
          </IconButton>
        </span>
      </CustomTooltip>
    </Suspense>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.data.currencyCode === nextProps.data.currencyCode &&
    prevProps.isEditMode === nextProps.isEditMode &&
    prevProps.defaultCurrency === nextProps.defaultCurrency &&
    prevProps.isDefault === nextProps.isDefault &&
    prevProps.onToggle === nextProps.onToggle
  );
});

export default CurrencyActionCellRenderer;
