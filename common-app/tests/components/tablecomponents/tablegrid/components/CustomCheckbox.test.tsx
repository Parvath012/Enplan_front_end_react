import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomCheckbox from '../../../../../src/components/tablecomponents/tablegrid/components/CustomCheckbox';

// Mock for Checkbox component
jest.mock('@mui/material/Checkbox', () => {
    return {
        __esModule: true,
        default: jest.fn(({
            icon,
            checkedIcon,
            onChange,
            checked,
            disableRipple,
            ...props
        }) => {
            return (
                <div
                    data-testid="custom-checkbox"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={onChange}
                    {...props}
                >
                    {checked ? checkedIcon : icon}
                </div>
            );
        })
    };
});

// Mock for Carbon Icons
jest.mock('@carbon/icons-react', () => ({
    Checkmark: jest.fn(({ style, ...props }) => (
        <div data-testid="checkmark-icon" className="checkedIcon" style={style} {...props} />
    ))
}));

describe('CustomCheckbox', () => {
    // BoxSize Condition Coverage
    describe('BoxSize Handling', () => {
        test('uses default size when boxSize is undefined', () => {
            render(<CustomCheckbox />);
            const { container } = render(<CustomCheckbox />);

            // Check default size (14)
            expect(container.innerHTML).toMatch(/width:\s*14px/);
            expect(container.innerHTML).toMatch(/height:\s*14px/);
        });

        test('uses provided boxSize', () => {
            const { container } = render(<CustomCheckbox boxSize={20} />);

            // Check custom size
            expect(container.innerHTML).toMatch(/width:\s*20px/);
            expect(container.innerHTML).toMatch(/height:\s*20px/);
        });

        test('handles null boxSize', () => {
            const { container } = render(<CustomCheckbox boxSize={null as any} />);

            // Should fall back to default size
            expect(container.innerHTML).toMatch(/width:\s*14px/);
            expect(container.innerHTML).toMatch(/height:\s*14px/);
        });

        test('handles zero boxSize', () => {
            const { container } = render(<CustomCheckbox boxSize={0} />);

            // Should fall back to default size
            expect(container.innerHTML).toMatch(/width:\s*0px/);
            expect(container.innerHTML).toMatch(/height:\s*0px/);
        });
    });

    // Existing tests with additional assertions
    describe('Rendering and Styling', () => {
        test('renders with unchecked and checked styles', () => {
            const uncheckedStyle = {
                backgroundColor: 'red',
                borderRadius: '4px'
            };
            const checkedStyle = {
                backgroundColor: 'green',
                borderRadius: '4px'
            };
            const checkedIconStyle = {
                color: 'blue'
            };

            const { container } = render(
                <CustomCheckbox
                    uncheckedStyle={uncheckedStyle}
                    checkedStyle={checkedStyle}
                    checkedIconStyle={checkedIconStyle}
                />
            );

            // Check unchecked style
            expect(container.innerHTML).toMatch(/background-color:\s*red/);
            expect(container.innerHTML).toMatch(/border-radius:\s*4px/);

            // Render checked version to test checked styles
            const { container: checkedContainer } = render(
                <CustomCheckbox
                    checked
                    uncheckedStyle={uncheckedStyle}
                    checkedStyle={checkedStyle}
                    checkedIconStyle={checkedIconStyle}
                />
            );

            // Check checked style
            expect(checkedContainer.innerHTML).toMatch(/background-color:\s*green/);
            expect(checkedContainer.innerHTML).toMatch(/color:\s*blue/);
        });
    });

    // Comprehensive Prop Combination Test
    describe('Prop Combinations and Edge Cases', () => {
        test('handles all prop combinations', () => {
            const handleChange = jest.fn();
            const { container } = render(
                <CustomCheckbox
                    checked
                    disabled
                    onChange={handleChange}
                    boxSize={24}
                    uncheckedStyle={{ opacity: 0.5 }}
                    checkedStyle={{ backgroundColor: 'purple' }}
                    checkedIconStyle={{ transform: 'scale(1.2)' }}
                />
            );

            const checkbox = screen.getByTestId('custom-checkbox');

            // Verify checkbox state
            expect(checkbox).toHaveAttribute('aria-checked', 'true');
            expect(checkbox).toHaveAttribute('disabled');

            // Verify size
            expect(container.innerHTML).toMatch(/width:\s*24px/);
            expect(container.innerHTML).toMatch(/height:\s*24px/);

            // Verify styles
            expect(container.innerHTML).toMatch(/background-color:\s*purple/);
            expect(container.innerHTML).toMatch(/transform:\s*scale\(1.2\)/);
        });

        test('handles undefined styles gracefully', () => {
            const { container } = render(
                <CustomCheckbox
                    uncheckedStyle={undefined}
                    checkedStyle={undefined}
                    checkedIconStyle={undefined}
                />
            );

            // Ensure no errors and default rendering occurs
            expect(container.innerHTML).toMatch(/width:\s*14px/);
            expect(container.innerHTML).toMatch(/height:\s*14px/);
        });
    });

    // Additional Interaction and Accessibility Tests
    describe('Interaction and Accessibility', () => {
        test('supports all standard checkbox interactions', async () => {
            const handleChange = jest.fn();
            render(<CustomCheckbox onChange={handleChange} />);

            const checkbox = screen.getByTestId('custom-checkbox');
            await userEvent.click(checkbox);

            expect(handleChange).toHaveBeenCalled();
        });

        test('renders with custom aria attributes', () => {
            render(
                <CustomCheckbox
                    aria-label="Custom Checkbox"
                    aria-describedby="checkbox-description"
                />
            );

            const checkbox = screen.getByLabelText('Custom Checkbox');
            expect(checkbox).toHaveAttribute('aria-describedby', 'checkbox-description');
        });
    });
});