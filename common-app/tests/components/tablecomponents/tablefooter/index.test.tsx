import React from "react";
import { render } from "@testing-library/react";
import TableFooter from "../../../../src/components/tablecomponents/tablefooter";

// Mock the TableFooterComponent to verify props
const mockTableFooterComponent = jest.fn(() => null);
jest.mock("../../../../src/components/tablecomponents/tablefooter/components", () => {
    return jest.fn((props) => {
        mockTableFooterComponent(props);
        return null;
    });
});

describe("TableFooter", () => {
    const mockData = [1, 2, 3, 4, 5];
    const mockSelectedCells = [
        { value: '1' },
        { value: '2' },
        { value: '3' },
        { value: '' },
        { value: '5' }
    ];
    const mockOnZoomChange = jest.fn();
    const mockOnRefresh = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Stats Calculation', () => {
        test('calculates stats correctly with provided data', () => {
            render(
                <TableFooter 
                    data={mockData} 
                    selectedCells={mockSelectedCells}
                    numOfSelectedRows={5}
                    zoom={100}
                    onZoomChange={mockOnZoomChange}
                    onRefresh={mockOnRefresh}
                />
            );
            // Verify TableFooterComponent was called with correct stats
            expect(mockTableFooterComponent).toHaveBeenCalledWith(
                expect.objectContaining({
                    statsData: {
                        totalRows: 5,
                        Count: 4, // Filtered out empty cells
                        sum: 15,
                        avg: "3.00",
                        min: 1,
                        max: 5
                    },
                    zoomPercentage: 100,
                    onRefresh: mockOnRefresh,
                    onZoomChange: mockOnZoomChange
                })
            );
        });

        test('handles empty data array', () => {
            render(
                <TableFooter 
                    data={[]} 
                    selectedCells={[]}
                />
            );
            // Verify TableFooterComponent was called with zero stats
            expect(mockTableFooterComponent).toHaveBeenCalledWith(
                expect.objectContaining({
                    statsData: {
                        totalRows: undefined,
                        Count: 0,
                        sum: 0,
                        avg: 0,
                        min: 0,
                        max: 0
                    }
                })
            );
        });
    });

    describe('Prop Handling', () => {
        test('passes zoom and zoom change handler', () => {
            const zoomChangeHandler = jest.fn();
            render(
                <TableFooter 
                    data={mockData} 
                    selectedCells={mockSelectedCells}
                    zoom={75} 
                    onZoomChange={zoomChangeHandler} 
                />
            );
            // Verify zoom percentage and handler are passed correctly
            expect(mockTableFooterComponent).toHaveBeenCalledWith(
                expect.objectContaining({
                    zoomPercentage: 75,
                    onZoomChange: zoomChangeHandler
                })
            );
        });

        test('passes refresh handler', () => {
            const refreshHandler = jest.fn();
            render(
                <TableFooter 
                    data={mockData} 
                    selectedCells={mockSelectedCells}
                    onRefresh={refreshHandler} 
                />
            );
            // Verify refresh handler is passed correctly
            expect(mockTableFooterComponent).toHaveBeenCalledWith(
                expect.objectContaining({
                    onRefresh: refreshHandler
                })
            );
        });
    });

    describe('Edge Cases', () => {
        test('handles empty selectedCells', () => {
            render(
                <TableFooter 
                    data={mockData} 
                    selectedCells={[]}
                />
            );
            // Verify TableFooterComponent handles empty selectedCells
            expect(mockTableFooterComponent).toHaveBeenCalledWith(
                expect.objectContaining({
                    statsData: {
                        totalRows: undefined,
                        Count: 0,
                        sum: 15,
                        avg: "3.00",
                        min: 1,
                        max: 5
                    }
                })
            );
        });

        test('handles large data set', () => {
            const largeData = Array.from({length: 1000}, (_, i) => i + 1);
            const largeCells = largeData.map(value => ({ value: value.toString() }));
            
            render(
                <TableFooter 
                    data={largeData} 
                    selectedCells={largeCells}
                />
            );
            // Verify stats calculation for large dataset
            expect(mockTableFooterComponent).toHaveBeenCalledWith(
                expect.objectContaining({
                    statsData: {
                        totalRows: undefined,
                        Count: 1000,
                        sum: 500500,
                        avg: "500.50",
                        min: 1,
                        max: 1000
                    }
                })
            );
        });
    });

    describe('Input Variations', () => {
        test('handles negative numbers', () => {
            const negativeData = [-1, -2, -3, -4, -5];
            const negativeCells = negativeData.map(value => ({ value: value.toString() }));
            
            render(
                <TableFooter 
                    data={negativeData} 
                    selectedCells={negativeCells}
                />
            );
            
            expect(mockTableFooterComponent).toHaveBeenCalledWith(
                expect.objectContaining({
                    statsData: {
                        totalRows: undefined,
                        Count: 5,
                        sum: -15,
                        avg: "-3.00",
                        min: -5,
                        max: -1
                    }
                })
            );
        });

        test('handles mixed numbers', () => {
            const mixedData = [-1, 0, 1, 2, 3];
            const mixedCells = mixedData.map(value => ({ value: value.toString() }));
            
            render(
                <TableFooter 
                    data={mixedData} 
                    selectedCells={mixedCells}
                />
            );
            
            expect(mockTableFooterComponent).toHaveBeenCalledWith(
                expect.objectContaining({
                    statsData: {
                        totalRows: undefined,
                        Count: 5,
                        sum: 5,
                        avg: "1.00",
                        min: -1,
                        max: 3
                    }
                })
            );
        });
    });

    describe('selectedCells Filtering', () => {
        test('filters out empty cells correctly', () => {
            const dataWithEmptyCells = [1, 2, 3, 4, 5];
            const selectedCellsWithEmpty = [
                { value: '1' },
                { value: '' },
                { value: '3' },
                { value: '' },
                { value: '5' }
            ];

            render(
                <TableFooter 
                    data={dataWithEmptyCells} 
                    selectedCells={selectedCellsWithEmpty}
                />
            );

            expect(mockTableFooterComponent).toHaveBeenCalledWith(
                expect.objectContaining({
                    statsData: {
                        totalRows: undefined,
                        Count: 3, // Only non-empty cells
                        sum: 15,
                        avg: "3.00",
                        min: 1,
                        max: 5
                    }
                })
            );
        });
    });
});