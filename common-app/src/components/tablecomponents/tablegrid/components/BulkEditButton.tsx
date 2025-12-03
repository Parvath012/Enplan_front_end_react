import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material'; // Added Tooltip import
import { Edit } from '@carbon/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { startBulkEdit } from '../../../../store/Actions/gridActions';
import BulkEditDialog from './BulkEditDialog';

// Button component to trigger bulk edit functionality
interface BulkEditButtonProps {
    columnField?: string; // Optional prop to specify which column this button is for
}

const BulkEditButton: React.FC<BulkEditButtonProps> = ({ columnField }) => {
    const dispatch = useDispatch();

    // Get selected cells from Redux store
    const selectedCells = useSelector((state: any) => state.gridStore.selectedCells ?? []);
    
    // Local state to control dialog
    const [dialogOpen, setDialogOpen] = useState(false);

    // Check if all selected cells are from the same column that matches this button's column
    const relevantCells = columnField 
        ? selectedCells.filter((cell: {field: string}) => cell.field === columnField)
        : selectedCells;
    
    const allSameColumn = relevantCells.length > 0 &&
        relevantCells.every((cell: {field: string}) => cell.field === relevantCells[0].field);
    
    // Enable button only if we have multiple cells from this column
    const isEnabled = relevantCells.length > 1 && allSameColumn;

    // Handle button click
    const handleClick = () => {
        dispatch(startBulkEdit());
        setDialogOpen(true);
    };

    const handleClose = () => {
        setDialogOpen(false);
    };

    // If this is a column header button and no cells are selected, or no column is specified, don't show
    if ((columnField && relevantCells.length <= 1) || (!columnField && selectedCells.length <= 1)) {
        // For column header buttons, still show the icon but disabled
        if (columnField) {
            return (
                <Tooltip title="Select multiple cells in this column to enable bulk edit">
                    <span>
                        <IconButton 
                            disabled={true}
                            sx={{ 
                                color: 'rgba(0, 0, 0, 0.3)', 
                                '&:hover': { backgroundColor: 'transparent' }
                            }}
                        >
                            <Edit size={14} />
                        </IconButton>
                    </span>
                </Tooltip>
            );
        }
        return null;
    }

    if (columnField) {
        return (
            <>
                <Tooltip title={`Bulk edit ${relevantCells.length} cells`}>
                    <IconButton 
                        onClick={handleClick}
                        disabled={!isEnabled}
                        sx={{ 
                            color: isEnabled ? 'primary.main' : 'rgba(0, 0, 0, 0.3)', 
                            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                        }}
                    >
                        <Edit size={14} />
                    </IconButton>
                </Tooltip>
                <BulkEditDialog open={dialogOpen} onClose={handleClose} />
            </>
        );
    }

    return null;
};

export default BulkEditButton;