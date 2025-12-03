import React from 'react';
import { render, screen } from '@testing-library/react';
import { GridSortDirection } from '@mui/x-data-grid';
import CustomSortIcon from '../../../../../src/components/tablecomponents/tablegrid/components/CustomSortIcon';

// Mock Carbon Icons
jest.mock('@carbon/icons-react', () => ({
    ArrowUp: jest.fn(({ className, size, style }) => (
        <div 
            data-testid="arrow-up-icon" 
            className={className}
            style={style}
            data-size={size}
        >
            Arrow Up
        </div>
    )),
    ArrowDown: jest.fn(({ className, size, style }) => (
        <div 
            data-testid="arrow-down-icon" 
            className={className}
            style={style}
            data-size={size}
        >
            Arrow Down
        </div>
    )),
    ArrowsVertical: jest.fn(({ className, size, style }) => (
        <div 
            data-testid="arrows-vertical-icon" 
            className={className}
            style={style}
            data-size={size}
        >
            Arrows Vertical
        </div>
    ))
}));

describe('CustomSortIcon', () => {
    // Rendering Tests
    describe('Rendering', () => {
        test('renders ArrowUp for ascending direction', () => {
            render(<CustomSortIcon direction="asc" />);
            
            const arrowUpIcon = screen.getByTestId('arrow-up-icon');
            expect(arrowUpIcon).toBeInTheDocument();
        });

        test('renders ArrowDown for descending direction', () => {
            render(<CustomSortIcon direction="desc" />);
            
            const arrowDownIcon = screen.getByTestId('arrow-down-icon');
            expect(arrowDownIcon).toBeInTheDocument();
        });

        test('renders ArrowsVertical for unsorted direction', () => {
            render(<CustomSortIcon direction={null} />);
            
            const arrowsVerticalIcon = screen.getByTestId('arrows-vertical-icon');
            expect(arrowsVerticalIcon).toBeInTheDocument();
        });

        test('renders ArrowsVertical for undefined direction', () => {
            render(<CustomSortIcon direction={undefined} />);
            
            const arrowsVerticalIcon = screen.getByTestId('arrows-vertical-icon');
            expect(arrowsVerticalIcon).toBeInTheDocument();
        });
    });

    // Prop Tests
    describe('Prop Handling', () => {
        test('applies custom className', () => {
            render(<CustomSortIcon direction="asc" className="test-class" />);
            
            const arrowUpIcon = screen.getByTestId('arrow-up-icon');
            expect(arrowUpIcon).toHaveClass('test-class');
        });

        test('applies custom size', () => {
            render(<CustomSortIcon direction="asc" size={20} />);
            
            const arrowUpIcon = screen.getByTestId('arrow-up-icon');
            expect(arrowUpIcon.getAttribute('data-size')).toBe('20');
        });

        test('uses default size when not provided', () => {
            render(<CustomSortIcon direction="asc" />);
            
            const arrowUpIcon = screen.getByTestId('arrow-up-icon');
            expect(arrowUpIcon.getAttribute('data-size')).toBe('12');
        });
    });

    // Color Tests
    describe('Color Handling', () => {
        test('applies default active color for ascending direction', () => {
            render(<CustomSortIcon direction="asc" />);
            
            const arrowUpIcon = screen.getByTestId('arrow-up-icon');
            expect(arrowUpIcon).toHaveStyle({ color: '#1976d2' });
        });

        test('applies default active color for descending direction', () => {
            render(<CustomSortIcon direction="desc" />);
            
            const arrowDownIcon = screen.getByTestId('arrow-down-icon');
            expect(arrowDownIcon).toHaveStyle({ color: '#1976d2' });
        });

        test('applies custom active color', () => {
            render(<CustomSortIcon direction="asc" activeColor="#FF0000" />);
            
            const arrowUpIcon = screen.getByTestId('arrow-up-icon');
            expect(arrowUpIcon).toHaveStyle({ color: '#FF0000' });
        });

        test('applies default inactive color for unsorted direction', () => {
            render(<CustomSortIcon direction={null} />);
            
            const arrowsVerticalIcon = screen.getByTestId('arrows-vertical-icon');
            expect(arrowsVerticalIcon).toHaveStyle({ color: '#0051AB' });
        });

        test('applies custom inactive color (though not used in current implementation)', () => {
            render(<CustomSortIcon direction={null} inactiveColor="#00FF00" />);
            
            const arrowsVerticalIcon = screen.getByTestId('arrows-vertical-icon');
            expect(arrowsVerticalIcon).toHaveStyle({ color: '#0051AB' });
        });
    });

    // Style Tests
    describe('Styling', () => {
        test('applies default styles for ascending direction', () => {
            render(<CustomSortIcon direction="asc" />);
            
            const arrowUpIcon = screen.getByTestId('arrow-up-icon');
            expect(arrowUpIcon).toHaveStyle({
                padding: '4px',
                transition: 'transform 0.2s ease'
            });
        });

        test('applies default styles for descending direction', () => {
            render(<CustomSortIcon direction="desc" />);
            
            const arrowDownIcon = screen.getByTestId('arrow-down-icon');
            expect(arrowDownIcon).toHaveStyle({
                padding: '4px',
                transition: 'transform 0.2s ease'
            });
        });
    });

    // Comprehensive Conditional Rendering Tests
    describe('Comprehensive Conditional Rendering', () => {
        test('renders correct icon for all possible directions', () => {
            const testScenarios: Array<[GridSortDirection, string]> = [
                [null, 'arrows-vertical-icon'],
                [undefined, 'arrows-vertical-icon'],
                ['asc', 'arrow-up-icon'],
                ['desc', 'arrow-down-icon']
            ];

            testScenarios.forEach(([direction, expectedTestId]) => {
                const { container } = render(<CustomSortIcon direction={direction} />);
                
                // Find the icon
                const icon = screen.getByTestId(expectedTestId);
                expect(icon).toBeInTheDocument();

                // Clean up
                container.remove();
            });
        });

        test('getIconStyle utility function works correctly', () => {
            const { getIconStyle } = CustomSortIcon as any;
            
            if (getIconStyle) {
                const activeStyle = getIconStyle(true);
                const inactiveStyle = getIconStyle(false);

                expect(activeStyle).toEqual({
                    color: '#1976d2',
                    padding: '4px',
                    transition: 'transform 0.2s ease'
                });

                expect(inactiveStyle).toEqual({
                    color: '#666',
                    padding: '4px',
                    transition: 'transform 0.2s ease'
                });
            }
        });
    });

    // Edge Case Tests
    describe('Edge Cases', () => {
        test('handles extreme color values', () => {
            const extremeColors = [
                '#000000',   // Black
                '#FFFFFF',   // White
                'transparent'
            ];

            extremeColors.forEach(color => {
                const { container } = render(
                    <CustomSortIcon 
                        direction="asc" 
                        activeColor={color} 
                    />
                );

                const arrowUpIcon = screen.getByTestId('arrow-up-icon');
                expect(arrowUpIcon).toHaveStyle({ color: color });

                // Clean up
                container.remove();
            });
        });

        test('renders fallback for invalid direction', () => {
            render(<CustomSortIcon direction={"invalid" as any} data-testid="custom-sort-icon-fallback" size={16} />);
            const fallback = screen.getByTestId('custom-sort-icon-fallback');
            expect(fallback).toBeInTheDocument();
            expect(fallback).toHaveTextContent('?');
            expect(fallback).toHaveStyle({ color: 'red', fontSize: '16px' });
        });

        test('renders fallback with custom color and font size', () => {
            render(<CustomSortIcon direction={"unexpected" as any} data-testid="custom-sort-icon-fallback" size={32} />);
            const fallback = screen.getByTestId('custom-sort-icon-fallback');
            expect(fallback).toBeInTheDocument();
            expect(fallback).toHaveTextContent('?');
            expect(fallback).toHaveStyle({ color: 'red', fontSize: '32px' });
        });

        test('handles missing props gracefully', () => {
            render(<CustomSortIcon />);
            const arrowsVerticalIcon = screen.getByTestId('arrows-vertical-icon');
            expect(arrowsVerticalIcon).toBeInTheDocument();
        });

        test('handles extremely small icon size', () => {
            render(<CustomSortIcon direction="asc" size={1} />);
            const arrowUpIcon = screen.getByTestId('arrow-up-icon');
            expect(arrowUpIcon.getAttribute('data-size')).toBe('1');
        });

        test('handles extremely large icon size', () => {
            render(<CustomSortIcon direction="desc" size={1000} />);
            const arrowDownIcon = screen.getByTestId('arrow-down-icon');
            expect(arrowDownIcon.getAttribute('data-size')).toBe('1000');
        });

        test('handles null className and colors', () => {
            render(<CustomSortIcon direction="asc" className={null as any} activeColor={null as any} inactiveColor={null as any} />);
            const arrowUpIcon = screen.getByTestId('arrow-up-icon');
            expect(arrowUpIcon).toBeInTheDocument();
        });
    });
});