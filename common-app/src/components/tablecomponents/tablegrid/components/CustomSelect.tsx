import React from 'react';
import { Select, MenuItem } from '@mui/material';
import '../styles.scss';

// Interface defining props for the custom select component
interface CustomSelectProps {
    // Current selected value
    value: string;
    // Array of options to be displayed in the select
    options: string[];
    // Change handler function with selected value and event
    onChange: (value: string, event: React.ChangeEvent<any>) => void;
}

// Custom Select component with configurable options and styling
const CustomSelect: React.FC<CustomSelectProps> = ({ value, options, onChange }) => {
    return (
        // MUI Select component with custom configuration
        <Select
            // Current selected value
            value={value}
            // Change event handler
            onChange={(event: any) => onChange(event.target.value, event)}
            // Occupy full width of parent container
            fullWidth
            // Automatically focus on render
            autoFocus
            // Compact size
            size="small"
            // Custom styling using sx prop
            sx={{
                // Full height of container
                height: '100%',
                // Flexbox display
                display: 'flex',
                // Small font size
                fontSize: '10px',
                // Ensure proper box sizing
                boxSizing: 'border-box',
                // Remove default padding
                padding: 0,
                // Default text color
                color: '#818586',
                // Remove border outline
                '& .MuiOutlinedInput-notchedOutline': {
                    borderRadius: 0,
                    border: 'none',
                },
                // Remove focus border
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                },
                // Remove border radius
                '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                },
            }}
        >
            {/* Map through options to create menu items */}
            {options.map((option) => (
                // Individual menu item with custom styling
                <MenuItem 
                    // Small font size
                    sx={{ fontSize: '10px', color: '#818586' }} 
                    // Unique key for each option
                    key={option} 
                    // Value of the menu item
                    value={option}
                >
                    {/* Display option text */}
                    {option}
                </MenuItem>
            ))}
        </Select>
    );
};

// Export the custom select component as default
export default CustomSelect;