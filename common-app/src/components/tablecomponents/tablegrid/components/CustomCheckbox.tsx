import React from 'react';
import Checkbox, { CheckboxProps } from '@mui/material/Checkbox';
import { Checkmark } from '@carbon/icons-react';

// Extended interface for custom checkbox props
interface CustomCheckboxProps extends CheckboxProps {
    // Optional styles for unchecked state
    uncheckedStyle?: React.CSSProperties;

    // Optional styles for checked state
    checkedStyle?: React.CSSProperties;

    // Optional styles for checked icon
    checkedIconStyle?: React.CSSProperties;

    // Optional size for checkbox (defaults to 14)
    boxSize?: number;
}

// Custom Checkbox component with enhanced styling and configuration
const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
    // Destructure custom props with default values
    uncheckedStyle,
    checkedStyle,
    checkedIconStyle,
    boxSize = 14,
    ...props
}) => {
    // Determine icon size, defaulting to 14 if not provided
    const iconSize = boxSize ?? 14;

    return (
        <Checkbox
            // Spread remaining original Checkbox props
            {...props}

            // Custom unchecked state icon
            icon={
                <span
                    className="unchecked"
                    style={{
                        width: iconSize,
                        height: iconSize,
                        ...uncheckedStyle, // Apply custom unchecked styles
                    }}
                />
            }

            // Custom checked state icon with Checkmark
            checkedIcon={
                <span
                    className="checked"
                    style={{
                        width: iconSize,
                        height: iconSize,
                        ...checkedStyle, // Apply custom checked styles
                    }}
                >
                    <Checkmark
                        className="checkedIcon"
                        style={{
                            width: iconSize,
                            height: iconSize,
                            ...checkedIconStyle, // Apply custom checked icon styles
                        }}
                    />
                </span>
            }

            // Disable ripple effect for a cleaner look
            disableRipple
        />
    );
};

// Export the custom checkbox component as default
export default CustomCheckbox;