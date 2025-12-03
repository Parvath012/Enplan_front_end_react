import React, { useState, useEffect, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import './App.css';
import { Add, ArrowsVertical, Column, SettingsAdjust, Subtract, ChevronUp } from "@carbon/icons-react";
import { renderToStaticMarkup } from 'react-dom/server';
import getMainMenuItems from "./menuItems";
import ActionsCellRenderer from "./ActionsCellRenderer";
import { ActionItem } from "./Actions";

/**
 * AgGrid Component Configuration:
 * 
 * Environment Variables Required (with fallbacks):
 * - REACT_APP_API_BASE_URL: Base URL for API server (default: http://172.16.20.116:50005)
 * - REACT_APP_API_ENDPOINT: API endpoint for data queries (default: /api/v1/data/Data/ExecuteSqlQueries)
 * - REACT_APP_HEALTH_ENDPOINT: Health check endpoint (default: /api/v1/health)
 * 
 * Create a .env file in the common-app root directory with these variables.
 */

interface SalesData {
    _id: number;
    Country: string;
    Division: string;
    Department: string;
    Section: string;
    Class: string;
    Brand: string;
    PricePoint: string;
    ClassPricePoint: string;
    Sales: number;
    MgnValue: number;
    LYsales: number;
    Year: number;
    Month: string;
    Date: string;
    Half: string;
    Quarter: string;
    WeekNo: string;
    DayoftheWeek: string;
    MonthName: string;
}

interface ApiResponse {
    executeInParallel: boolean;
    sqlQueries: Array<{
        name: string;
        query: {
            databaseId: string;
            columns: Array<{
                dboName: string;
                columnName: string;
                dataType: string;
                aliasName: string;
                output: boolean;
            }>;
            tables: string[];
            searchFilter: {
                conditionOperator: number;
                filters: any[];
            };
            page: number;
            pageSize: number;
            caseStatements: any[];
        };
        includeRecordsCount: boolean;
    }>;
}

// Constants
const NUMERIC_FIELDS = ['Sales', 'MgnValue', 'LYsales', 'Year', '_id'];
const DEFAULT_RECORD: Omit<SalesData, '_id'> = {
    Country: 'Unknown',
    Division: 'Unknown',
    Department: 'Unknown',
    Section: 'Unknown',
    Class: 'Unknown',
    Brand: 'Unknown',
    PricePoint: 'Unknown',
    ClassPricePoint: 'Unknown',
    Sales: 0,
    MgnValue: 0,
    LYsales: 0,
    Year: new Date().getFullYear(),
    Month: '01',
    Date: new Date().toISOString().split('T')[0],
    Half: 'H1',
    Quarter: 'Q1',
    WeekNo: '1',
    DayoftheWeek: 'Monday',
    MonthName: 'January'
};

const SAMPLE_RECORD: Omit<SalesData, '_id'> = {
    Country: 'Sample Country',
    Division: 'Sample Division',
    Department: 'Sample Department',
    Section: 'Sample Section',
    Class: 'Sample Class',
    Brand: 'Sample Brand',
    PricePoint: 'Standard',
    ClassPricePoint: 'Standard',
    Sales: 1000,
    MgnValue: 500,
    LYsales: 900,
    Year: 2023,
    Month: '01',
    Date: '2023-01-01',
    Half: 'H1',
    Quarter: 'Q1',
    WeekNo: '1',
    DayoftheWeek: 'Monday',
    MonthName: 'January'
};

// API Configuration
const API_CONFIG = {
    DATABASE_ID: "09d8e037-0005-4887-abde-112a529de2b8",
    TABLE_NAME: "sales_data_sonam",
    QUERY_NAME: "sales_data_sonam"
} as const;

// Column definitions for API payload
const API_COLUMNS = [
    { columnName: "_id", dataType: "integer" },
    { columnName: "Country", dataType: "string" },
    { columnName: "Division", dataType: "string" },
    { columnName: "Department", dataType: "string" },
    { columnName: "Section", dataType: "string" },
    { columnName: "Class", dataType: "string" },
    { columnName: "Brand", dataType: "string" },
    { columnName: "PricePoint", dataType: "string" },
    { columnName: "ClassPricePoint", dataType: "string" },
    { columnName: "Sales", dataType: "numeric" },
    { columnName: "MgnValue", dataType: "numeric" },
    { columnName: "LYsales", dataType: "numeric" },
    { columnName: "Year", dataType: "integer" },
    { columnName: "Month", dataType: "string" },
    { columnName: "Date", dataType: "string" },
    { columnName: "Half", dataType: "string" },
    { columnName: "Quarter", dataType: "string" },
    { columnName: "WeekNo", dataType: "string" },
    { columnName: "DayoftheWeek", dataType: "string" },
    { columnName: "MonthName", dataType: "string" }
] as const;

const IconHeader: React.FC = () => {
    return <Column size={16} height={18} style={{ color: '#818586', left: '5px' }} />;
};

const RowNumberHeader: React.FC = () => {
    return <ChevronUp size={16} height={18} style={{ color: '#818586' }} />;
};

const RowNumberCellRenderer: React.FC<any> = (params) => {
    const rowNumber = (params.rowIndex ?? 0) + 2;
    return <span style={{ color: '#ffffff', fontSize: '10px' }}>{rowNumber}</span>;
};

// Helper functions
const createValueFormatter = () => (params: any) => {
    if (params.value === null || params.value === undefined) return '0.00';
    if (typeof params.value === 'number') {
        return params.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return params.value;
};


const createNumericColumn = (field: keyof SalesData, headerName: string) => ({
    field,
    editable: true,
    cellEditor: 'agTextCellEditor',
    headerName,
    enablePivot: true,
    enableRowGroup: true,
    enableValue: true,
    valueFormatter: createValueFormatter(),
    allowedAggFuncs: ["avg", "count", "sum", "max", "min", "first", "last"],
    cellEditorParams: {
        maxLength: 20
    }
});

const createNonEditableColumn = (field: keyof SalesData, headerName: string) => ({
    field,
    editable: false,
    headerName,
    enablePivot: true,
    enableRowGroup: true,
    enableValue: false
});

const createSimpleColumn = (field: keyof SalesData, headerName: string) => ({
    field,
    editable: false,
    headerName,
    enableValue: false
});

const createIconMarkup = (IconComponent: any, props: any = {}) =>
    renderToStaticMarkup(<IconComponent {...props} />);

// Helper function to create API payload
const createApiPayload = (page: number, pageSize: number): ApiResponse => {
    const columns = API_COLUMNS.map(col => ({
        dboName: API_CONFIG.TABLE_NAME,
        columnName: col.columnName,
        dataType: col.dataType,
        aliasName: col.columnName,
        output: true
    }));

    return {
        executeInParallel: true,
        sqlQueries: [
            {
                name: API_CONFIG.QUERY_NAME,
                query: {
                    databaseId: API_CONFIG.DATABASE_ID,
                    columns,
                    tables: [API_CONFIG.TABLE_NAME],
                    searchFilter: { conditionOperator: 0, filters: [] },
                    page,
                    pageSize,
                    caseStatements: []
                },
                includeRecordsCount: true
            }
        ]
    };
};

// Create mock data for testing
const createMockData = (): SalesData[] => {
    const mockData: SalesData[] = [];
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'];

    for (let i = 1; i <= 10; i++) {
        mockData.push({
            _id: i,
            Country: `Country ${i % 3 + 1}`,
            Division: `Division ${i % 2 + 1}`,
            Department: `Department ${i % 4 + 1}`,
            Section: `Section ${i % 3 + 1}`,
            Class: `Class ${i % 5 + 1}`,
            Brand: `Brand ${i % 4 + 1}`,
            PricePoint: i % 2 === 0 ? 'Premium' : 'Standard',
            ClassPricePoint: i % 2 === 0 ? 'Premium' : 'Standard',
            Sales: 1000 * i,
            MgnValue: 500 * i,
            LYsales: 900 * i,
            Year: 2023,
            Month: (i % 12 + 1).toString().padStart(2, '0'),
            Date: `2023-${(i % 12 + 1).toString().padStart(2, '0')}-01`,
            Half: i <= 6 ? 'H1' : 'H2',
            Quarter: `Q${Math.ceil((i % 12) / 3)}`,
            WeekNo: i.toString(),
            DayoftheWeek: daysOfWeek[i % 5],
            MonthName: months[i % 12]
        });
    }
    return mockData;
};

const AgGrid = () => {
    const actions: ActionItem[] = [
        { label: 'Edit', action: 'edit' },
        { label: 'Delete', action: 'delete' },
    ];

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pageSize] = useState(10000);
    const [allData, setAllData] = useState<SalesData[]>([]);
    const [isGridReady, setIsGridReady] = useState(false);
    const gridRef = useRef<any>(null);

    const handleActionClick = (actionType: string, rowData: any) => {
        console.log('Action:', actionType, 'Row:', rowData);
    };

        // Function to auto-size all columns
    const autoSizeColumns = useCallback(() => {
        if (gridRef.current) {
            // Use autoSizeAllColumns instead of sizeColumnsToContent
            gridRef.current.autoSizeAllColumns();
            
            setTimeout(() => {
                if (gridRef.current) {
                    gridRef.current.sizeColumnsToFit();
                }
            }, 100);
            
            setTimeout(() => {
                if (gridRef.current) {
                    gridRef.current.refreshCells();
                }
            }, 200);
        }
    }, []);

    // Function to expand column groups
    const expandColumnGroups = useCallback((api: any) => {
        try {
            // Method 1: Use Enterprise API if available
            const columnApi = api.columnApi;
            if (columnApi && typeof columnApi.expandAll === 'function') {
                columnApi.expandAll();
                console.log('Column groups expanded using Enterprise API');
            }
            
            // Method 2: Force column group expansion by triggering events
            setTimeout(() => {
                // Trigger a column group expansion event
                const event = new CustomEvent('ag-grid-column-group-expand', {
                    detail: { expandAll: true }
                });
                window.dispatchEvent(event);
                
                // Force refresh again
                api.refreshCells();
                console.log('Column group expansion event triggered');
            }, 200);
            
            // Method 3: Try to access column groups directly
            setTimeout(() => {
                const gridElement = document.querySelector('.ag-theme-alpine');
                if (gridElement) {
                    // Find column group headers and click them to expand
                    const columnGroupHeaders = gridElement.querySelectorAll('.ag-header-group-cell');
                    columnGroupHeaders.forEach((header: any) => {
                        const expandButton = header.querySelector('.ag-header-expand-icon');
                        if (expandButton) {
                            expandButton.click();
                        }
                    });
                    console.log('Column group headers clicked programmatically');
                }
            }, 300);
            
        } catch (error) {
            console.log('Column expansion error:', error);
        }
    }, []);

    // Function to expand all row groups
    const expandAllRowGroups = useCallback((api: any) => {
        try {
            if (api && typeof api.expandAll === 'function') {
                api.expandAll();
                console.log('All row groups expanded');
            }
        } catch (error) {
            console.log('Row group expansion error:', error);
        }
    }, []);

    // Handle cell click events
    const onCellClicked = (params: any) => {
        console.log('Cell clicked:', {
            field: params.colDef.field,
            value: params.value,
            rowData: params.data,
            rowIndex: params.rowIndex,
            column: params.column
        });

        // Only apply visual selection if the cell is not editable
        if (!params.colDef.editable) {
            if (gridRef.current) {
                gridRef.current.clearFocusedCell();
                gridRef.current.ensureIndexVisible(params.rowIndex);
                gridRef.current.setFocusedCell(params.rowIndex, params.column);

                const cellElement = document.querySelector(`[row-id="${params.rowIndex}"][col-id="${params.column.getColId()}"]`);
                if (cellElement) {
                    cellElement.classList.add('ag-cell-selected');
                    setTimeout(() => {
                        cellElement.classList.remove('ag-cell-selected');
                    }, 100);
                }
            }
        }
    };

    // Handle cell double click for editing
    const onCellDoubleClicked = (params: any) => {
        console.log('Cell double clicked:', {
            field: params.colDef.field,
            value: params.value,
            rowData: params.data,
            rowIndex: params.rowIndex,
            column: params.column
        });

        // Allow default editing behavior for editable cells
        if (params.colDef.editable) {
            console.log('Starting cell editing for:', params.colDef.field);
        }
    };

    // Handle column group changes
    const onColumnGroupOpened = useCallback((params: any) => {
        console.log('Column group opened:', params);
    }, []);

    // Handle row group changes
    const onRowGroupOpened = useCallback((params: any) => {
        console.log('Row group opened:', params);
    }, []);

    // Handle when columns are grouped
    const onColumnRowGroupChanged = useCallback((params: any) => {
        console.log('Column row group changed:', params);
        // Auto-expand all groups when new groups are added
        setTimeout(() => {
            if (gridRef.current) {
                expandAllRowGroups(gridRef.current);
                expandColumnGroups(gridRef.current);
            }
        }, 100);
    }, [expandAllRowGroups, expandColumnGroups]);

    // Handle when columns are pivoted
    const onColumnPivotChanged = useCallback((params: any) => {
        console.log('Column pivot changed:', params);
        // Auto-expand all groups when new pivot groups are added
        setTimeout(() => {
            if (gridRef.current) {
                expandAllRowGroups(gridRef.current);
                expandColumnGroups(gridRef.current);
            }
        }, 100);
    }, [expandAllRowGroups, expandColumnGroups]);

    // Grid ready handler
    const onGridReady = useCallback((params: any) => {
        gridRef.current = params.api;
        console.log('Grid is ready, setting up initial data...');

        if (!isGridReady) {
            setIsGridReady(true);
            fetchSalesData(0, true);
        }

        setTimeout(() => {
            if (gridRef.current && allData.length > 0) {
                autoSizeColumns();
            }
        }, 100);

        setTimeout(() => {
            if (gridRef.current) {
                autoSizeColumns();
            }
        }, 500);

                // 🔑 Auto expand column groups and row groups
        setTimeout(() => {
            if (params.api) {
                // Expand all row groups first
                params.api.expandAll();
                
                // Force a refresh to ensure column groups are properly displayed
                params.api.refreshCells();
                
                // Use the dedicated function to expand column groups
                expandColumnGroups(params.api);
            }
        }, 500);
    }, [isGridReady, allData.length, autoSizeColumns, expandColumnGroups]);

    // Helper function to perform API request
    const performApiRequest = async (apiPayload: ApiResponse) => {
        console.log('⏳ Sending API request...');

        const baseUrl = process.env.REACT_APP_API_BASE_URL;
        console.log('Base URL:', baseUrl);
        const apiEndpoint = process.env.REACT_APP_API_ENDPOINT ?? '/api/v1/data/Data/ExecuteSqlQueries';
        const healthEndpoint = process.env.REACT_APP_HEALTH_ENDPOINT ?? '/api/v1/health';

        const apiUrl = `${baseUrl}${apiEndpoint}`;
        console.log('API Endpoint:', apiUrl);

        try {
            const healthUrl = `${baseUrl}${healthEndpoint}`;
            console.log('Health check URL:', healthUrl);
            const serverCheck = await fetch(healthUrl, {
                method: 'GET',
                signal: AbortSignal.timeout(2000)
            });
            console.log('Server health check:', serverCheck.ok ? 'OK' : 'Failed');
        } catch (healthCheckError) {
            console.warn('Server health check failed:', healthCheckError);
            console.log('Will try to make the main request anyway...');
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiPayload),
            signal: AbortSignal.timeout(15000)
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }

        console.log('✅ Response received, parsing JSON...');
        const data = await response.json();
        console.log('✅ JSON parsed successfully');
        console.log('Full API Response:', data);

        return data;
    };

    // Helper function to log data structure details
    const logDataStructureDetails = (data: any) => {
        const firstItem = data?.data?.[0];
        if (!firstItem?.value) return;

        console.log('First item in data array:', firstItem);
        console.log('Value property type:', typeof firstItem.value);

        if (typeof firstItem.value === 'object') {
            console.log('Value property keys:', Object.keys(firstItem.value));

            if (firstItem.value.data?.[0]) {
                console.log('First item in value.data:', firstItem.value.data[0]);
            } else if (firstItem.value.records?.[0]) {
                console.log('First item in value.records:', firstItem.value.records[0]);
            }
        }
    };

    const fetchSalesData = useCallback(async (page: number = 0, isInitialLoad: boolean = true) => {
        try {
            if (isInitialLoad) {
                setLoading(true);
                setError(null);
            }

            console.log(`🔄 Starting data fetch for page ${page}...`);

            const apiPayload = createApiPayload(page, pageSize);
            const data = await performApiRequest(apiPayload);
            logDataStructureDetails(data);
            processApiResponse(data, page);

        } catch (err) {
            console.error('❌ API fetch failed:', err);
            console.log('🔄 Using mock data instead...');

            const mockData = createMockData();
            setAllData(mockData);
            setLoading(false);
        }
    }, [pageSize]);

    // Helper function to create a data record from source data
    const createDataRecord = (sourceData: any, id: number): SalesData => {
        const record: SalesData = { _id: id, ...DEFAULT_RECORD };

        if (sourceData && typeof sourceData === 'object') {
            console.log('Source data keys:', Object.keys(sourceData));

            Object.keys(record).forEach(key => {
                if (sourceData[key] !== undefined) {
                    const value = sourceData[key];

                    if (NUMERIC_FIELDS.includes(key)) {
                        if (typeof value === 'number') {
                            (record as any)[key] = value;
                        } else if (typeof value === 'string') {
                            const num = parseFloat(value);
                            (record as any)[key] = !isNaN(num) ? num : 0;
                        } else {
                            (record as any)[key] = 0;
                        }
                    } else {
                        (record as any)[key] = value?.toString() || '';
                    }
                }
            });
        }

        return record;
    };

    // Helper function to process CSV data
    const processCsvData = (csvArray: string[], page: number): SalesData[] => {
        const salesData: SalesData[] = [];
        if (csvArray.length > 0 && typeof csvArray[0] === 'string') {
            const headers = csvArray[0].split('|');
            console.log('Headers:', headers);

            for (let i = 1; i < csvArray.length; i++) {
                const row = csvArray[i];
                const values = row.split('|');
                const obj: any = { _id: i + (page * pageSize) };

                headers.forEach((header: string, colIndex: number) => {
                    let value = values[colIndex];
                    if (value?.startsWith("'") && value.endsWith("'")) {
                        value = value.slice(1, -1);
                    }
                    if (NUMERIC_FIELDS.includes(header)) {
                        obj[header] = parseFloat(value) || 0;
                    } else {
                        obj[header] = value;
                    }
                });

                salesData.push(obj as SalesData);
            }

            console.log('✅ Converted CSV data, sample:', salesData.slice(0, 2));
        }
        return salesData;
    };

    // Helper function to process array data
    const processArrayData = (arrayData: any[], page: number): SalesData[] => {
        return arrayData.map((record: any, recordIndex: number) =>
            createDataRecord(record, recordIndex + 1 + (page * pageSize))
        );
    };

    // Helper function to process item value
    const processItemValue = (item: any, index: number, page: number): SalesData[] => {
        if (Array.isArray(item.value)) {
            console.log('Value is an array, length:', item.value.length);
            return processArrayData(item.value, 0);
        } else if (item.value && typeof item.value === 'object') {
            if (item.value.csvData?.length) {
                console.log('🔄 Found csvData array, converting CSV to objects...');
                console.log('CSV data length:', item.value.csvData.length);
                return processCsvData(item.value.csvData, page);
            } else if (item.value.data?.length) {
                console.log('Found data array in value.data, length:', item.value.data.length);
                return processArrayData(item.value.data, page);
            } else if (item.value.records?.length) {
                console.log('Found records array in value.records, length:', item.value.records.length);
                return processArrayData(item.value.records, page);
            } else {
                console.log('Using the value object directly');
                return [createDataRecord(item.value, index + 1 + (page * pageSize))];
            }
        } else {
            console.log('Value has unrecognized structure, creating sample entry');
            return [{ _id: index + 1 + (page * pageSize), ...SAMPLE_RECORD }];
        }
    };

    // Process API response and extract data
    const processApiResponse = (data: any, page: number = 0) => {
        try {
            if (data?.status !== "Ok" || !Array.isArray(data?.data)) {
                console.log('Unexpected data structure, using mock data');
                if (page === 0) {
                    const mockData = createMockData();
                    setAllData(mockData);
                }
                return;
            }

            console.log('Found data in data.data array, length:', data.data.length);

            const salesData: SalesData[] = [];

            data.data.forEach((item: any, index: number) => {
                if (item?.key === 'sales_data_sonam' && item.value) {
                    console.log('Processing sales_data_sonam entry');
                    console.log('Examining value property structure:', typeof item.value);

                    const itemData = processItemValue(item, index, page);
                    salesData.push(...itemData);
                }
            });

            if (salesData.length > 0) {
                setAllData(salesData);

                setTimeout(() => {
                    if (gridRef.current) {
                        autoSizeColumns();
                    }
                }, 50);
            } else if (page === 0) {
                console.log('No valid data found, using mock data');
                const mockData = createMockData();
                setAllData(mockData);
            }
        } catch (error) {
            console.error('Error processing API response:', error);
            if (page === 0) {
                const mockData = createMockData();
                setAllData(mockData);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial data load will be handled by onGridReady
    }, []);

    useEffect(() => {
        if (allData.length > 0 && gridRef.current) {
            setTimeout(() => {
                autoSizeColumns();
            }, 100);
        }
    }, [allData.length, autoSizeColumns]);

    useEffect(() => {
        const handleResize = () => {
            if (gridRef.current && allData.length > 0) {
                setTimeout(() => {
                    autoSizeColumns();
                }, 100);
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [allData.length, autoSizeColumns]);

    const [columnDefs] = useState<import("ag-grid-community").ColDef<SalesData>[]>([
        {
            headerComponent: RowNumberHeader,
            width: 20,
            flex: 0,
            suppressSizeToFit: true,
            pinned: 'left',
            editable: false,
            sortable: false,
            suppressHeaderMenuButton: true,
            filter: false,
            cellRenderer: RowNumberCellRenderer,
            cellClass: 'row-number-cell',
            headerClass: 'row-number-header'
        },
        createNonEditableColumn('Country', 'Country'),
        createNonEditableColumn('Division', 'Division'),
        createNonEditableColumn('Department', 'Department'),
        createNonEditableColumn('Section', 'Section'),
        createNonEditableColumn('Class', 'Class'),
        createNonEditableColumn('Brand', 'Brand'),
        createNonEditableColumn('PricePoint', 'Price Point'),
        createNonEditableColumn('ClassPricePoint', 'Class Price Point'),
        createNumericColumn('Sales', 'Sales'),
        createNumericColumn('MgnValue', 'Margin Value'),
        createNumericColumn('LYsales', 'LY Sales'),
        createSimpleColumn('Year', 'Year'),
        createSimpleColumn('Month', 'Month'),
        createSimpleColumn('Date', 'Date'),
        createSimpleColumn('Half', 'Half'),
        createSimpleColumn('Quarter', 'Quarter'),
        createSimpleColumn('WeekNo', 'Week No'),
        createSimpleColumn('DayoftheWeek', 'Day of the Week'),
        createSimpleColumn('MonthName', 'Month Name'),
        {
            headerComponent: IconHeader,
            width: 80,
            pinned: 'right',
            editable: false,
            sortable: false,
            suppressHeaderMenuButton: true,
            filter: false,
            cellRenderer: ActionsCellRenderer,
            cellRendererParams: {
                actions: actions,
                onActionClick: handleActionClick,
            }
        },
    ]);

    if (loading) {
        return (
            <div className="ag-theme-alpine reusable-excel-grid" style={{ height: 600, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div>Loading sales data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="ag-theme-alpine reusable-excel-grid" style={{ height: 600, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <div style={{ color: 'red', marginBottom: '10px' }}>Error: {error}</div>
                <button onClick={() => fetchSalesData(0, true)} style={{ padding: '8px 16px', cursor: 'pointer' }}>Retry</button>
            </div>
        );
    }

    return (
        <div className="ag-theme-alpine reusable-excel-grid" style={{ height: 600, width: '100%' }}>
            <div style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
                {/* Auto-size columns button commented out */}
            </div>
            <AgGridReact<SalesData>
                ref={gridRef}
                rowData={allData}
                columnDefs={columnDefs}
                headerHeight={34}
                rowHeight={24}
                onGridReady={onGridReady}
                onCellClicked={onCellClicked}
                onCellDoubleClicked={onCellDoubleClicked}
                onColumnGroupOpened={onColumnGroupOpened}
                onRowGroupOpened={onRowGroupOpened}
                onColumnRowGroupChanged={onColumnRowGroupChanged}
                onColumnPivotChanged={onColumnPivotChanged}
                onCellValueChanged={(params) => {
                    console.log('Cell value changed:', {
                        field: params.colDef.field,
                        oldValue: params.oldValue,
                        newValue: params.newValue,
                        rowData: params.data
                    });
                }}
                onCellEditingStarted={(params) => {
                    console.log('Cell editing started:', {
                        field: params.colDef.field,
                        value: params.value,
                        rowData: params.data
                    });
                }}
                defaultColDef={{
                    flex: 1,
                    resizable: true,
                    sortable: true,
                    filter: true,
                    enablePivot: true,
                    enableRowGroup: true,
                    enableValue: true,
                    editable: true,
                    suppressSizeToFit: false,
                    minWidth: 100,
                    maxWidth: 300,
                    allowedAggFuncs: ["avg", "count", "sum", "max", "min", "first", "last"],
                    cellRendererParams: {
                        suppressCount: true, // 🚀 this removes the (count)
                      },
                    cellClassRules: {
                        'editable-cell': (params) => {
                            if (!params.colDef.field || params.node?.group) {
                                return false;
                            }

                            return typeof params.colDef.editable === 'function'
                                ? params.colDef.editable(params)
                                : params.colDef.editable === true;
                        }
                    },
                }}
                rowClassRules={{
                    'group-row-expanded': (params) => {
                        return !!(params.node.group && params.node.expanded);
                    },
                    'group-row-collapsed': (params) => {
                        return !!(params.node.group && !params.node.expanded);
                    },
                }}
                pivotMode={true}
                pivotColumnGroupTotals="after"
                grandTotalRow="bottom"
                pivotRowTotals="after"
                sideBar={true}
                animateRows={true}
                cellSelection={true}
                copyHeadersToClipboard={true}
                rowGroupPanelShow="always"
                pivotPanelShow="always"
                suppressCellFocus={false}
                allowDragFromColumnsToolPanel={true}
                suppressDragLeaveHidesColumns={false}
                suppressMoveWhenRowDragging={false}
                suppressColumnMoveAnimation={false}
                suppressRowDrag={false}
                suppressColumnVirtualisation={false}
                suppressRowVirtualisation={false}
                // 🔑 Ensure pivot columns are always visible
                pivotSuppressAutoColumn={false}
                // 🔑 Set group display type for better column group handling
                groupDisplayType="multipleColumns"
                // 🔑 Set default group expansion level - expand all groups by default
                statusBar={{
                    statusPanels: [
                        { statusPanel: 'agLoadingOverlayComponent', align: 'center' },
                    ],
                }}
                icons={{
                    filter: createIconMarkup(ArrowsVertical, { style: { width: 12, height: 12, color: '#0051AB' } }),
                    menuAlt: createIconMarkup(SettingsAdjust, { style: { width: 12, height: 12, color: '#0051AB', transform: 'rotate(90deg)' } }),
                    columnGroupOpened: createIconMarkup(Subtract, { style: { width: 12, height: 12 } }),
                    columnGroupClosed: createIconMarkup(Add, { style: { width: 12, height: 12 } }),
                    groupExpanded: createIconMarkup(Subtract, { style: { width: 12, height: 12 } }),
                    groupContracted: createIconMarkup(Add, { style: { width: 12, height: 12 } }),
                }}
                masterDetail={true}
                detailCellRendererParams={{
                    detailGridOptions: {
                        columnDefs: [{ field: 'extraDetail' }],
                        rowData: [{ extraDetail: 'More info...' }],
                    },
                }}
                getMainMenuItems={getMainMenuItems}
            />
        </div>
    );
};

export default AgGrid;