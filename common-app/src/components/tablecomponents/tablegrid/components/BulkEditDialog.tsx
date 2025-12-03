import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Typography,
    SelectChangeEvent
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { cancelBulkEdit, applyBulkEdit } from '../../../../store/Actions/gridActions';
import { BulkEditService, BulkEditDataType, BulkEditConfig } from '../../../../services/BulkEditService';
import { RootState } from '../../../../store/Reducers/rootReducer';

interface BulkEditDialogProps {
    open: boolean;
    onClose: () => void;
}

// Dialog component for bulk editing multiple cells
const BulkEditDialog: React.FC<BulkEditDialogProps> = ({ open, onClose }) => {
    const dispatch = useDispatch<ThunkDispatch<RootState, unknown, Action<string>>>();

    // Get selected cells from Redux store
    const selectedCells = useSelector((state: RootState) => state.gridStore.selectedCells || []);

    // Local state
    const [value, setValue] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [config, setConfig] = useState<BulkEditConfig>({
        dataType: BulkEditDataType.Text
    });

    // Detect data type when selected cells change
    useEffect(() => {
        if (selectedCells && selectedCells.length > 0) {
            const detectedConfig = BulkEditService.detectDataType(selectedCells);
            setConfig(detectedConfig);

            // Clear previous value and error
            setValue('');
            setError(null);

            // If all cells have the same value, use that as initial value 
            const firstValue = selectedCells[0].value;
            const allSameValue = selectedCells.every(cell => cell.value === firstValue);
            if (allSameValue) {
                setValue(firstValue !== undefined && firstValue !== null ? String(firstValue) : '');
            }
        }
    }, [selectedCells]);

    // Handle value change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        setError(null); // Clear error when user types
    };

    // Handle select change
    const handleSelectChange = (event: SelectChangeEvent) => {
        setValue(event.target.value);
        setError(null); // Clear error when user selects
    };

    // Handle apply button click
    const handleApply = () => {
        // Validate input value
        const validationResult = BulkEditService.validateValue(value, config);

        if (!validationResult.isValid) {
            setError(validationResult.errorMessage ?? 'Invalid input');
            return;
        }

        // Prepare formatting based on data type
        const formatting: Record<string, string> = {};

        if (config.dataType === BulkEditDataType.Currency && config.currencyFormat) {
            formatting.currency = config.currencyFormat;
        } else if (config.dataType === BulkEditDataType.Date && config.dateFormat) {
            formatting.dateFormat = config.dateFormat;
        }

        // Dispatch bulk update
        const action = applyBulkEdit(selectedCells, value, {
            dataType: config?.dataType || 'text',
            formatValue: (val: unknown) => BulkEditService.formatValue(val, config),
            formatting
        });
        
        // Dispatch action (works for both thunk and plain actions)
        dispatch(action);

        // Close dialog
        onClose();
    };

    // Handle cancel button click
    const handleCancel = () => {
        dispatch(cancelBulkEdit());
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleApply();
        }
    };

    // Render appropriate input based on data type
    const renderInput = () => {
        // If config is undefined or there's no dataType, return empty fragment
        if (!config?.dataType) {
            return <></>;
        }
        
        switch (config.dataType) {
            case BulkEditDataType.Select:
    return (
        <FormControl fullWidth error={!!error} margin="normal">
            <InputLabel 
                sx={{ 
                    background: 'white',
                    padding: '0 4px',
                    transform: 'translate(14px, -10px) scale(0.75)',
                    '&.Mui-focused': {
                        transform: 'translate(14px, -10px) scale(0.75)',
                    }
                }}
            >
                Value
            </InputLabel>
            <Select
                value={value}
                onChange={handleSelectChange}
                fullWidth
                variant="outlined"
                size="small"
            >
                {(config.options || []).map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
            </Select>
            {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
    );

            case BulkEditDataType.Date:
                return (
                    <TextField
                        label=""
                        type="date"
                        value={value}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        error={!!error}
                        helperText={error ?? 'Enter date in format mm-dd-yyyy'}
                        margin="normal"
                        // Use proper sx prop syntax for MUI v5
                        sx={{
                            '& .MuiInputLabel-root': {
                                backgroundColor: 'white',
                                padding: '0 4px',
                            },
                            '& .MuiInputLabel-shrink': {
                                transform: 'translate(14px, -9px) scale(0.75)'
                            }
                        }}
                />
                );

            case BulkEditDataType.Number:
            case BulkEditDataType.Currency:
                return (
                    <TextField
                        label={config.dataType === BulkEditDataType.Currency ? 'Currency Value' : 'Number'}
                        type="text" // Using text to allow for currency symbols and commas
                        value={value}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        error={!!error}
                        helperText={error ?? ''}
                        margin="normal"
                    />
                );

            case BulkEditDataType.Text:
            default:
                return (
                    <TextField
                        label="Text"
                        value={value}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        error={!!error}
                        helperText={error ?? ''}
                        margin="normal"
                    />
                );
        }
    };

    return createPortal(
        <Dialog
            open={open}
            onClose={handleCancel}
            maxWidth="sm"
            fullWidth
            aria-labelledby="bulk-edit-dialog-title"
            onKeyDown={handleKeyDown}
        >
            <DialogTitle id="bulk-edit-dialog-title">
                Bulk Edit {selectedCells.length} {selectedCells.length === 1 ? 'Cell' : 'Cells'}
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    All selected cells are from column: {selectedCells.length > 0 ? selectedCells[0].field : ''}
                </Typography>
                 <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Data type: {config?.dataType || 'text'}
                </Typography>
                {renderInput()}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel} color="primary">
                    Cancel
                </Button>
                <Button
                    onClick={handleApply}
                    color="primary"
                    variant="contained"
                    disabled={!value && config?.dataType !== BulkEditDataType.Text} // Allow empty string for text
                >
                    Apply to {selectedCells.length} {selectedCells.length === 1 ? 'Cell' : 'Cells'}
                </Button>
            </DialogActions>
        </Dialog>,
        document.body               
    );
};

export default BulkEditDialog;