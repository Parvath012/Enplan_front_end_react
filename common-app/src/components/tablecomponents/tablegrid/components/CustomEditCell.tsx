import React from 'react';
import { TextField, SxProps, Theme } from '@mui/material';
import { GridRenderEditCellParams, useGridApiContext } from '@mui/x-data-grid';
import CustomSelect from './CustomSelect';
import { CustomEditCellFields } from '../../../../constants/gridFields';
/**
 * Extended props for the CustomEditCell component
 * Adds optional type and options for select inputs
 */
interface CustomEditCellProps extends GridRenderEditCellParams {
    type?: CustomEditCellFields.TypeText | CustomEditCellFields.TypeSelect;
    options?: string[];
    isWrapped?: boolean;
    formatting?: {
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
      strikethrough?: boolean;
      textColor?: string;
      fillColor?: string;
    };
}

/**
 * Custom Edit Cell component for DataGrid
 * Supports both text and select input types
 */
const CustomEditCell: React.FC<CustomEditCellProps> = ({
    id,
    field,
    value,
    type = CustomEditCellFields.TypeText,
    options = [],
    isWrapped = false,
    formatting,
    textColor,
    fillColor,
}) => {
    const apiRef = useGridApiContext();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        apiRef.current.setEditCellValue(
            {
                id,
                field,
                value: event.target.value,
            },
            event
        );
    };

    const handleSelectChange = (selectedValue: string, event: React.ChangeEvent<any>) => {
        apiRef.current.setEditCellValue(
            {
                id,
                field,
                value: selectedValue,
            },
            event
        );
    };

    if (type === CustomEditCellFields.TypeSelect) {
        return (
            <CustomSelect
                value={value ?? ''}
                options={options}
                onChange={handleSelectChange}
            />
        );
    }

    // Build style for text formatting
    const textFormattingStyle: React.CSSProperties = {
      fontWeight: formatting?.bold ? 'bold' : undefined,
      fontStyle: formatting?.italic ? 'italic' : undefined,
      textDecoration: [
        formatting?.underline ? 'underline' : '',
        formatting?.strikethrough ? 'line-through' : ''
      ].filter(Boolean).join(' ') || undefined,
      color: formatting?.textColor ?? textColor ?? undefined,
    };

    const sxStyles: SxProps<Theme> = {
        backgroundColor: formatting?.fillColor ?? fillColor ?? 'transparent',
        width: '100%',
        '& .MuiInputBase-root': {
            '&:before': { borderBottom: 'none' },
            '&:after': { borderBottom: 'none' },
            '&:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
        },
    };

    return (
        <TextField
            autoFocus
            fullWidth
            variant="standard"
            multiline={isWrapped}
            value={value ?? ''}
            onChange={handleChange}
            sx={sxStyles}
            slotProps={{
                input: {
                    style: {
                        fontSize: '10px',
                        padding: '2px 4px',
                        lineHeight: 1.4,
                        whiteSpace: isWrapped ? 'normal' : 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        ...textFormattingStyle,
                    },
                },
            }}
        />
    );
};

export default CustomEditCell;