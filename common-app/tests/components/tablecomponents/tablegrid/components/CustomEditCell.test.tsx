import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { GridApiContext } from '@mui/x-data-grid';
import CustomEditCell from '../../../../../src/components/tablecomponents/tablegrid/components/CustomEditCell';
import { CustomEditCellFields } from '../../../../../src/constants/gridFields';

const mockCustomSelect = jest.fn();
const mockTextField = jest.fn();

jest.mock('../../../../../src/components/tablecomponents/tablegrid/components/CustomSelect', () => {
    return (props: any) => {
        mockCustomSelect(props);
        return (
            <div data-testid="custom-select">
                <select
                    data-testid="select-input"
                    value={props.value}
                    onChange={(e) => props.onChange(e.target.value, e)}
                >
                    {props.options.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            </div>
        );
    };
});

jest.mock('@mui/material', () => ({
    ...jest.requireActual('@mui/material'),
    TextField: jest.fn((props) => {
        mockTextField(props);
        const testId =
            props.value === null || props.value === undefined || props.value === ''
                ? 'text-input-empty'
                : `text-input-${props.value}`;
        return <input data-testid={testId} {...props} />;
    }),
}));

describe('CustomEditCell - Full Coverage Test Suite', () => {
    const mockApiRef = {
        current: {
            setEditCellValue: jest.fn()
        }
    };

    const Wrapper: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
        <GridApiContext.Provider value={mockApiRef}>
            {children}
        </GridApiContext.Provider>
    );

    const renderComponent = (props = {}) => {
        const defaultProps = {
            id: 1,
            field: 'testField',
            value: 'initial value',
            type: CustomEditCellFields.TypeText,
            options: [],
            isWrapped: false,
        };
        return render(
            <Wrapper>
                <CustomEditCell
                    api={undefined}
                    row={undefined}
                    rowNode={undefined}
                    colDef={undefined}
                    cellMode={'view'}
                    hasFocus={false}
                    tabIndex={0}
                    {...defaultProps}
                    {...props}
                />
            </Wrapper>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Text Input Rendering', () => {
        test('renders text input with default props', () => {
            const { getByTestId } = renderComponent();
            const input = getByTestId('text-input-initial value');
            expect(input).toBeInTheDocument();
            expect(input).toHaveValue('initial value');
        });

        test('handles text input change', () => {
            const { getByTestId } = renderComponent();
            const input = getByTestId('text-input-initial value');
            fireEvent.change(input, { target: { value: 'new value' } });
            expect(mockApiRef.current.setEditCellValue).toHaveBeenCalledWith(
                { id: 1, field: 'testField', value: 'new value' },
                expect.any(Object)
            );
        });

        test('renders empty string for null/undefined', () => {
            const { getAllByTestId } = renderComponent({ value: null });
            const inputs = getAllByTestId('text-input-empty');
            inputs.forEach(input => expect(input).toHaveValue(''));
        });

        test('applies correct styling when isWrapped is false', () => {
            renderComponent({ isWrapped: false });
            const props = mockTextField.mock.calls[0][0];
            expect(props.multiline).toBe(false);
            expect(props.slotProps.input.style.whiteSpace).toBe('nowrap');
        });

        test('applies correct styling when isWrapped is true', () => {
            renderComponent({ isWrapped: true });
            const props = mockTextField.mock.calls[0][0];
            expect(props.multiline).toBe(true);
            expect(props.slotProps.input.style.whiteSpace).toBe('normal');
        });
    });

    describe('Select Input Rendering', () => {
        const selectProps = {
            type: CustomEditCellFields.TypeSelect,
            options: ['Option1', 'Option2'],
            value: 'Option1'
        };

        test('renders custom select component with props', () => {
            const { getByTestId } = renderComponent(selectProps);
            expect(getByTestId('custom-select')).toBeInTheDocument();
            expect(mockCustomSelect).toHaveBeenCalledWith(
                expect.objectContaining({
                    value: 'Option1',
                    options: ['Option1', 'Option2'],
                    onChange: expect.any(Function)
                })
            );
        });

        test('handles select value change', () => {
            const { getByTestId } = renderComponent(selectProps);
            fireEvent.change(getByTestId('select-input'), { target: { value: 'Option2' } });
            expect(mockApiRef.current.setEditCellValue).toHaveBeenCalledWith(
                { id: 1, field: 'testField', value: 'Option2' },
                expect.any(Object)
            );
        });

        test('handles select change with undefined value', () => {
            const { getByTestId } = renderComponent({
                type: CustomEditCellFields.TypeSelect,
                value: undefined,
                options: ['X', 'Y']
            });
            fireEvent.change(getByTestId('select-input'), { target: { value: 'Y' } });
            expect(mockApiRef.current.setEditCellValue).toHaveBeenCalledWith(
                { id: 1, field: 'testField', value: 'Y' },
                expect.any(Object)
            );
        });

        test('handles empty options gracefully', () => {
            const { getByTestId } = renderComponent({
                type: CustomEditCellFields.TypeSelect,
                value: '',
                options: []
            });
            const select = getByTestId('select-input');
            expect(select.children.length).toBe(0);
        });
    });

    describe('Edge Cases and Validation', () => {
        test('handles complex string options', () => {
            const options = ['A B', 'C-D', 'E_F'];
            renderComponent({ type: CustomEditCellFields.TypeSelect, options, value: 'C-D' });
            const props = mockCustomSelect.mock.calls[0][0];
            expect(props.options).toEqual(options);
        });

        test('handles large option list', () => {
            const options = Array.from({ length: 100 }, (_, i) => `Item ${i}`);
            renderComponent({ type: CustomEditCellFields.TypeSelect, options, value: 'Item 50' });
            const props = mockCustomSelect.mock.calls[0][0];
            expect(props.value).toBe('Item 50');
        });

        test('renders minimal props', () => {
            const { getAllByTestId } = renderComponent({ id: undefined, field: undefined, value: undefined });
            const inputs = getAllByTestId('text-input-empty');
            inputs.forEach(input => expect(input).toHaveValue(''));
        });
    });

    describe('Performance and Re-renders', () => {
        test('does not call setEditCellValue on re-render with same props', () => {
            const { rerender } = renderComponent();
            const callsBefore = mockApiRef.current.setEditCellValue.mock.calls.length;
            rerender(
                <Wrapper>
                    <CustomEditCell
                        id={1}
                        field="testField"
                        value="initial value"
                        type={CustomEditCellFields.TypeText}
                        api={undefined}
                        row={undefined}
                        rowNode={undefined}
                        colDef={undefined}
                        cellMode={'view'}
                        hasFocus={false}
                        tabIndex={0}
                    />
                </Wrapper>
            );
            const callsAfter = mockApiRef.current.setEditCellValue.mock.calls.length;
            expect(callsAfter).toBe(callsBefore);
        });
    });

    describe('Formatting and Color Props', () => {
        test('applies bold formatting', () => {
            renderComponent({ formatting: { bold: true } });
            const props = mockTextField.mock.calls[0][0];
            expect(props.slotProps.input.style.fontWeight).toBe('bold');
        });
        test('applies italic formatting', () => {
            renderComponent({ formatting: { italic: true } });
            const props = mockTextField.mock.calls[0][0];
            expect(props.slotProps.input.style.fontStyle).toBe('italic');
        });
        test('applies underline formatting', () => {
            renderComponent({ formatting: { underline: true } });
            const props = mockTextField.mock.calls[0][0];
            expect(props.slotProps.input.style.textDecoration).toContain('underline');
        });
        test('applies strikethrough formatting', () => {
            renderComponent({ formatting: { strikethrough: true } });
            const props = mockTextField.mock.calls[0][0];
            expect(props.slotProps.input.style.textDecoration).toContain('line-through');
        });
        test('applies textColor from formatting', () => {
            renderComponent({ formatting: { textColor: '#123456' } });
            const props = mockTextField.mock.calls[0][0];
            expect(props.slotProps.input.style.color).toBe('#123456');
        });
        test('applies textColor from prop if not in formatting', () => {
            renderComponent({ textColor: '#654321' });
            const props = mockTextField.mock.calls[0][0];
            expect(props.slotProps.input.style.color).toBe('#654321');
        });
        test('applies fillColor to background', () => {
            renderComponent({ fillColor: '#abcdef' });
            const props = mockTextField.mock.calls[0][0];
            expect(props.sx.backgroundColor).toBe('#abcdef');
        });
    });
});
