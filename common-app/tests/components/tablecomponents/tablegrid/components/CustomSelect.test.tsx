import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import CustomSelect from '../../../../../src/components/tablecomponents/tablegrid/components/CustomSelect';

describe('CustomSelect Component', () => {
    // Mock options and onChange handler
    const mockOptions = ['Option 1', 'Option 2', 'Option 3'];
    const mockOnChange = jest.fn();

    // Reset mock before each test
    beforeEach(() => {
        mockOnChange.mockClear();
    });

    // Basic Rendering Tests
    describe('Rendering', () => {
        it('renders the select component', () => {
            render(
                <CustomSelect
                    value="Option 1"
                    options={mockOptions}
                    onChange={mockOnChange}
                />
            );

            // Check if select is rendered
            const selectElement = screen.getByRole('combobox');
            expect(selectElement).toBeInTheDocument();
        });

        it('displays correct initial value', () => {
            render(
                <CustomSelect
                    value="Option 2"
                    options={mockOptions}
                    onChange={mockOnChange}
                />
            );

            // Check if initial value is displayed
            const selectElement = screen.getByRole('combobox');
            expect(selectElement).toHaveTextContent('Option 2');
        });

        it('renders all options', () => {
            // Render the component
            render(
                <CustomSelect
                    value="Option 1"
                    options={mockOptions}
                    onChange={mockOnChange}
                />
            );

            // Open select dropdown
            const selectElement = screen.getByRole('combobox');
            fireEvent.mouseDown(selectElement);

            // Find the listbox
            const listbox = screen.getByRole('listbox');

            // Get all option elements within the listbox
            const optionElements = within(listbox).getAllByRole('option');

            // Check that the number of option elements matches the number of mock options
            expect(optionElements).toHaveLength(mockOptions.length);

            // Verify each option is in the document
            mockOptions.forEach(option => {
                const optionElement = within(listbox).getByText(option);
                expect(optionElement).toBeInTheDocument();
                expect(optionElement).toHaveAttribute('role', 'option');
            });
        });
    });

    // Selection and Interaction Tests
    describe('Selection and Interaction', () => {
        it('calls onChange when a new option is selected', () => {
            render(
                <CustomSelect
                    value="Option 1"
                    options={mockOptions}
                    onChange={mockOnChange}
                />
            );

            // Open select dropdown
            fireEvent.mouseDown(screen.getByRole('combobox'));

            // Select a different option
            const newOption = screen.getByText('Option 3');
            fireEvent.click(newOption);

            // Verify onChange was called with correct parameters
            expect(mockOnChange).toHaveBeenCalledWith('Option 3', expect.any(Object));
        });

        it('handles selection with keyboard', () => {
            render(
                <CustomSelect
                    value="Option 1"
                    options={mockOptions}
                    onChange={mockOnChange}
                />
            );

            const selectElement = screen.getByRole('combobox');

            // Open dropdown with keyboard
            fireEvent.keyDown(selectElement, { key: 'ArrowDown', code: 'ArrowDown' });

            // Select an option
            const newOption = screen.getByText('Option 2');
            fireEvent.click(newOption);

            // Verify onChange was called
            expect(mockOnChange).toHaveBeenCalledWith('Option 2', expect.any(Object));
        });
    });

    // Styling and Attributes Tests
    describe('Styling and Attributes', () => {
        it('has correct size attribute', () => {
            render(
                <CustomSelect
                    value="Option 1"
                    options={mockOptions}
                    onChange={mockOnChange}
                />
            );

            const selectElement = screen.getByRole('combobox');

            // Check for small size class
            expect(selectElement).toHaveClass('MuiSelect-select MuiSelect-outlined MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputSizeSmall css-si86to-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input');
        });

        it('is fully width', () => {
            render(
                <CustomSelect
                    value="Option 1"
                    options={mockOptions}
                    onChange={mockOnChange}
                />
            );

            const selectElement = screen.getByRole('combobox');

            // Check for full width styling
            const parentDiv = selectElement.closest('div');
            expect(parentDiv).toHaveStyle({ width: '100%' });
        });
    });

    // Edge Cases
    describe('Edge Cases', () => {
        it('handles empty options array', () => {
            const { container } = render(
                <CustomSelect
                    value=""
                    options={[]}
                    onChange={mockOnChange}
                />
            );

            // Verify component renders without errors
            expect(container).toBeInTheDocument();
        });

        it('handles empty value', () => {
            const { container } = render(
                <CustomSelect
                    value=""
                    options={mockOptions}
                    onChange={mockOnChange}
                />
            );

            // Verify component renders without errors
            expect(container).toBeInTheDocument();
        });
    });

    // Prop Validation
    describe('Prop Validation', () => {
        it('calls onChange with correct event object', () => {
            render(
                <CustomSelect
                    value="Option 1"
                    options={mockOptions}
                    onChange={mockOnChange}
                />
            );

            // Open select dropdown
            fireEvent.mouseDown(screen.getByRole('combobox'));

            // Select a new option
            const newOption = screen.getByText('Option 2');
            fireEvent.click(newOption);

            // Verify onChange was called with value and event
            expect(mockOnChange).toHaveBeenCalledWith(
                'Option 2',
                expect.objectContaining({
                    target: expect.any(Object)
                })
            );
        });
    });
});