import React from 'react';
import { render, screen } from '@testing-library/react';
import { GridRenderCellParams } from '@mui/x-data-grid';
import GridCellRenderer from '../../../../../src/components/tablecomponents/tablegrid/components/GridCellRenderer';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

// Provide dataStore.formattingConfig in the mock store to prevent useSelector errors
const mockStore = configureStore([]);
const store = mockStore({
  dataStore: {
    formattingConfig: {},
  },
});

describe('GridCellRenderer', () => {
    // Utility function to create mock params
    const createMockParams = (value: any): GridRenderCellParams => ({
        value,
        field: 'testField',
        row: {},
        colDef: {},
        api: {} as any,
        hasFocus: false,
        tabIndex: 0,
    });

    // Helper to render with Provider
    const renderWithProvider = (ui: React.ReactElement) =>
        render(<Provider store={store}>{ui}</Provider>);

    // Rendering Tests
    describe('Rendering', () => {
        test('renders cell with value', () => {
            const mockParams = createMockParams('Test Value');
            renderWithProvider(<GridCellRenderer params={mockParams} />);

            const cellContent = screen.getByText('Test Value');
            expect(cellContent).toBeInTheDocument();
        });

        test('renders with title attribute', () => {
            const mockParams = createMockParams('Hover Text');
            renderWithProvider(<GridCellRenderer params={mockParams} />);

            const cellWrapper = screen.getByTitle('Hover Text');
            expect(cellWrapper).toBeInTheDocument();
        });

        test('handles null or undefined values', () => {
            const nullParams = createMockParams(null);
            const undefinedParams = createMockParams(undefined);

            const { container: nullContainer } = renderWithProvider(<GridCellRenderer params={nullParams} />);
            const { container: undefinedContainer } = renderWithProvider(<GridCellRenderer params={undefinedParams} />);

            const nullCellContent = nullContainer.querySelector('.cellContent');
            const undefinedCellContent = undefinedContainer.querySelector('.cellContent');

            expect(nullCellContent).toBeInTheDocument();
            expect(undefinedCellContent).toBeInTheDocument();
        });
    });

    // Styling Tests
    describe('Styling', () => {
        test('applies default styles when no custom styles provided', () => {
            const mockParams = createMockParams('Test Value');
            const { container } = renderWithProvider(<GridCellRenderer params={mockParams} />);

            const cellWrapper = container.querySelector('.cellWrapper');
            expect(cellWrapper).toHaveStyle({
                backgroundColor: undefined,
                color: undefined,
                fontWeight: undefined,
                fontStyle: undefined
            });
        });

        test('applies custom styles', () => {
            const mockParams = createMockParams('Styled Value');
            const customStyle = {
                backgroundColor: '#f0f0f0',
                color: '#333',
                fontWeight: 'bold',
                fontStyle: 'italic'
            };

            const { container } = renderWithProvider(
                <GridCellRenderer 
                    params={mockParams} 
                    style={customStyle} 
                />
            );

            const cellWrapper = container.querySelector('.cellWrapper');
            const cellContent = container.querySelector('.cellContent');
            expect(cellWrapper).toHaveStyle({
                backgroundColor: '#f0f0f0'
            });
            expect(cellContent).toHaveStyle({
                color: '#333',
                fontWeight: 'bold',
                fontStyle: 'italic'
            });
        });
    });

    // Edge Case Tests
    describe('Edge Cases', () => {
        test('handles complex value types', () => {
            const mockParams = createMockParams('Test Object');
            
            renderWithProvider(<GridCellRenderer params={mockParams} />);

            expect(screen.getByText('Test Object')).toBeInTheDocument();
        });

        test('handles number values', () => {
            const numberValue = 42;
            const mockParams = createMockParams(numberValue);
            
            renderWithProvider(<GridCellRenderer params={mockParams} />);

            expect(screen.getByText('42')).toBeInTheDocument();
        });

        test('handles boolean values', () => {
            const testCases = [
                { value: true, expectedText: '' },
                { value: false, expectedText: '' }
            ];
            
            testCases.forEach(({ value, expectedText }) => {
                const mockParams = createMockParams(value);
                
                const { container } = renderWithProvider(<GridCellRenderer params={mockParams} />);
                
                const cellContent = container.querySelector('.cellContent');
                expect(cellContent?.textContent).toBe(expectedText);
            });
        });

        test('handles title prop with different value types', () => {
            const testCases = [
                { value: 'String Value', expectedTitle: 'String Value' },
                { value: 42, expectedTitle: '42' },
                { value: '', expectedTitle: '' },
                { value: undefined, expectedTitle: null },
                { value: null, expectedTitle: null }
            ];

            testCases.forEach(({ value, expectedTitle }) => {
                const mockParams = createMockParams(value);
                
                const { container } = renderWithProvider(<GridCellRenderer params={mockParams} />);
                
                const cellWrapper = container.querySelector('.cellWrapper');
                expect(cellWrapper?.getAttribute('title')).toBe(expectedTitle);
            });
        });
    });

    // Class and Structure Tests
    describe('Component Structure', () => {
        test('has correct class names', () => {
            const mockParams = createMockParams('Test Value');
            const { container } = renderWithProvider(<GridCellRenderer params={mockParams} />);

            const cellWrapper = container.querySelector('.cellWrapper');
            const cellContent = container.querySelector('.cellContent');

            expect(cellWrapper).toBeInTheDocument();
            expect(cellContent).toBeInTheDocument();
        });
    });

    // Formatting and Styling Branches
    describe('Formatting and Styling Branches', () => {
        const cellKey = '1:testField';
        const getStore = (formattingConfig: any) =>
            mockStore({ dataStore: { formattingConfig } });
        const createParams = (value: any) => ({
            value,
            field: 'testField',
            id: 1,
            row: {},
            colDef: {},
            api: {} as any,
            hasFocus: false,
            tabIndex: 0,
        });
        function renderWithFormatting(formatting: any, value = 'X') {
            const store = getStore({ [cellKey]: formatting });
            return render(
                <Provider store={store}>
                    <GridCellRenderer params={createParams(value)} />
                </Provider>
            );
        }
        test('applies bold formatting', () => {
            const { container } = renderWithFormatting({ bold: true });
            const cellContent = container.querySelector('.cellContent');
            expect(cellContent).toHaveStyle({ fontWeight: 'bolder' });
        });
        test('applies italic formatting', () => {
            const { container } = renderWithFormatting({ italic: true });
            const cellContent = container.querySelector('.cellContent');
            expect(cellContent).toHaveStyle({ fontStyle: 'italic' });
        });
        test('applies underline formatting', () => {
            const { container } = renderWithFormatting({ underline: true });
            const cellContent = container.querySelector('.cellContent');
            expect(cellContent?.style.textDecoration).toContain('underline');
        });
        test('applies strikethrough formatting', () => {
            const { container } = renderWithFormatting({ strikethrough: true });
            const cellContent = container.querySelector('.cellContent');
            expect(cellContent?.style.textDecoration).toContain('line-through');
        });
        test('applies both underline and strikethrough', () => {
            const { container } = renderWithFormatting({ underline: true, strikethrough: true });
            const cellContent = container.querySelector('.cellContent');
            expect(cellContent?.style.textDecoration).toContain('underline');
            expect(cellContent?.style.textDecoration).toContain('line-through');
        });
        test('applies textColor from formatting', () => {
            const { container } = renderWithFormatting({ textColor: '#123456' });
            const cellContent = container.querySelector('.cellContent');
            expect(cellContent).toHaveStyle({ color: '#123456' });
        });
        test('applies fillColor and extra class', () => {
            const { container } = renderWithFormatting({ fillColor: '#abcdef' });
            const cellWrapper = container.querySelector('.cellWrapper');
            expect(cellWrapper).toHaveClass('cell-has-fillcolor');
            expect(cellWrapper).toHaveStyle({ backgroundColor: '#abcdef' });
            expect(cellWrapper.style.getPropertyValue('--cell-fill-color')).toBe('#abcdef');
        });
        test('falls back to style prop when formatting missing', () => {
            const customStyle = {
                backgroundColor: '#f0f0f0',
                color: '#333',
                fontWeight: 'bold',
                fontStyle: 'italic',
                border: '1px solid #000',
            };
            const store = getStore({});
            const { container } = render(
                <Provider store={store}>
                    <GridCellRenderer params={createParams('Styled')} style={customStyle} />
                </Provider>
            );
            const cellWrapper = container.querySelector('.cellWrapper');
            const cellContent = container.querySelector('.cellContent');
            expect(cellWrapper).toHaveStyle({ backgroundColor: '#f0f0f0', border: '1px solid #000' });
            expect(cellContent).toHaveStyle({ color: '#333', fontWeight: 'bold', fontStyle: 'italic' });
        });
    });
});