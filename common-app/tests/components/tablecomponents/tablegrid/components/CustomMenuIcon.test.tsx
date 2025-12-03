import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomMenuIcon from '../../../../../src/components/tablecomponents/tablegrid/components/CustomMenuIcon';

// Mock Carbon Icons
jest.mock('@carbon/icons-react', () => ({
    SettingsAdjust: jest.fn(({ size, style }) => (
        <div 
            data-testid="settings-adjust-icon" 
            style={style}
        >
            Settings Adjust Icon
        </div>
    ))
}));

// Mock Material-UI IconButton
jest.mock('@mui/material', () => ({
    IconButton: jest.fn(({ children, onClick, ...props }) => (
        <button 
            data-testid="custom-menu-icon-button" 
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    ))
}));

describe('CustomMenuIcon', () => {
    // Rendering Tests
    describe('Rendering', () => {
        test('renders default icon', () => {
            render(<CustomMenuIcon />);
            
            const iconButton = screen.getByTestId('custom-menu-icon-button');
            const settingsIcon = screen.getByTestId('settings-adjust-icon');
            
            expect(iconButton).toBeInTheDocument();
            expect(settingsIcon).toBeInTheDocument();
        });

        test('renders custom icon when provided', () => {
            const CustomIcon = () => <div data-testid="custom-icon">Custom Icon</div>;
            
            render(<CustomMenuIcon icon={<CustomIcon />} />);
            
            const iconButton = screen.getByTestId('custom-menu-icon-button');
            const customIcon = screen.getByTestId('custom-icon');
            
            expect(iconButton).toBeInTheDocument();
            expect(customIcon).toBeInTheDocument();
        });
    });

    // Prop Tests
    describe('Prop Handling', () => {
        test('applies custom className', () => {
            render(<CustomMenuIcon className="test-class" />);
            
            const iconButton = screen.getByTestId('custom-menu-icon-button');
            expect(iconButton).toHaveClass('test-class');
        });

        test('applies custom size to icon', () => {
            render(<CustomMenuIcon size={20} />);
            
            const settingsIcon = screen.getByTestId('settings-adjust-icon');
            expect(settingsIcon).toHaveStyle({ 
                transform: 'rotate(90deg)',
                color: '#0051AB'
            });
        });

        test('applies custom active color', () => {
            const customActiveColor = '#FF0000';
            render(<CustomMenuIcon activeColor={customActiveColor} />);
            
            const settingsIcon = screen.getByTestId('settings-adjust-icon');
            expect(settingsIcon).toHaveStyle({ 
                color: customActiveColor 
            });
        });
    });

    // Interaction Tests
    describe('Interaction', () => {
        test('is enabled by default', () => {
            render(<CustomMenuIcon />);
            const iconButton = screen.getByTestId('custom-menu-icon-button');
            expect(iconButton).toBeEnabled();
        });

        test('calls onClick handler when clicked', async () => {
            const mockOnClick = jest.fn();
            render(<CustomMenuIcon onClick={mockOnClick} />);
            const iconButton = screen.getByTestId('custom-menu-icon-button');
            await userEvent.click(iconButton);
            expect(mockOnClick).toHaveBeenCalledTimes(1);
        });
    });

    // Style Tests
    describe('Styling', () => {
        test('applies default styles', () => {
            render(<CustomMenuIcon />);
            
            const iconButton = screen.getByTestId('custom-menu-icon-button');
            expect(iconButton).toHaveStyle({
                padding: '4px',
                transition: 'transform 0.2s ease'
            });

            const settingsIcon = screen.getByTestId('settings-adjust-icon');
            expect(settingsIcon).toHaveStyle({
                transform: 'rotate(90deg)',
                transition: 'color 0.2s ease'
            });
        });

        test('applies custom styles', () => {
            render(
                <CustomMenuIcon 
                    activeColor="#00FF00" 
                    size={24}
                    className="custom-style"
                />
            );
            
            const settingsIcon = screen.getByTestId('settings-adjust-icon');
            expect(settingsIcon).toHaveStyle({
                color: '#00FF00'
            });
        });
    });

    // Conditional Rendering Tests
    describe('Conditional Rendering', () => {
        test('renders default icon when no custom icon provided', () => {
            render(<CustomMenuIcon />);
            
            const settingsIcon = screen.getByTestId('settings-adjust-icon');
            expect(settingsIcon).toBeInTheDocument();
        });

        test('renders custom icon when provided', () => {
            const CustomIcon = () => <div data-testid="custom-icon">Custom Icon</div>;
            
            render(<CustomMenuIcon icon={<CustomIcon />} />);
            
            const customIcon = screen.getByTestId('custom-icon');
            const defaultIcon = screen.queryByTestId('settings-adjust-icon');
            
            expect(customIcon).toBeInTheDocument();
            expect(defaultIcon).not.toBeInTheDocument();
        });
    });
});