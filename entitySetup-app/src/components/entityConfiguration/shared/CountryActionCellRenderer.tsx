import React, { memo, Suspense } from 'react';
import { IconButton } from '@mui/material';
import { TrashCan } from '@carbon/icons-react';
// Module Federation imports
const CustomTooltip = React.lazy(() => import('commonApp/CustomTooltip'));


interface CountryActionCellRendererProps {
data: any;
isEditMode: boolean;
onToggle: (country: string) => void;
isPrePopulated: boolean;
}


const CountryActionCellRenderer: React.FC<CountryActionCellRendererProps> = memo(({ 
data, 
isEditMode, 
onToggle, 
isPrePopulated 
}) => {
const disabled = !isEditMode || isPrePopulated;


return (
<Suspense fallback={<div></div>}>
<CustomTooltip title="Delete" placement="top">
<span style={{ display: 'inline-block' }}>
<IconButton
        disabled={disabled}
        onClick={() => !disabled && onToggle(data.country)}
        size="small"
        sx={{
opacity: disabled ? 0.5 : 1,
cursor: disabled ? 'not-allowed' : 'pointer'
}}
>
<TrashCan size={16} color="#5B6061" />
</IconButton>
</span>
</CustomTooltip>
</Suspense>
);
}, (prevProps, nextProps) => {
return (
prevProps.data.country === nextProps.data.country &&
prevProps.isEditMode === nextProps.isEditMode &&
prevProps.isPrePopulated === nextProps.isPrePopulated &&
prevProps.onToggle === nextProps.onToggle
);
});
export default CountryActionCellRenderer;