import axios from 'axios';

// Common API utilities for data fetching services

export interface ApiResponse<T> {
  status: string;
  data?: Array<{ key: string; value: { csvData: string[] } }>;
  sqlResults?: Array<{ records: T[] }>;
  results?: Array<{ records: T[] }>;
  records?: T[];
}

export interface SqlQueryConfig {
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
    searchFilter?: {
      conditionOperator: number;
      filters: Array<{
        propertyName: string;
        value: any;
      }>;
    };
    orderBy?: Array<{
      columnName: string;
      sortType: number;
    }>;
    page: number;
    pageSize: number;
    caseStatements: any[];
  };
  includeRecordsCount: boolean;
}

export interface ApiPayload {
  executeInParallel: boolean;
  sqlQueries: SqlQueryConfig[];
}

/**
 * Common function to make API calls to the data service
 */
export async function makeDataApiCall<T>(
  payload: ApiPayload,
  apiUrl?: string
): Promise<T[]> {
  const API_PATH = '/api/v1/data/Data/ExecuteSqlQueries';
  
  // Ensure API URL is provided via environment variable or parameter
  const baseUrl = apiUrl ?? process.env.REACT_APP_DATA_API_URL;
  if (!baseUrl) {
    throw new Error('REACT_APP_DATA_API_URL environment variable is required');
  }
  
  const API_URL = `${baseUrl}${API_PATH}`;
  
  console.log('makeDataApiCall: Making API call to', API_URL);
  console.log('makeDataApiCall: Payload:', JSON.stringify(payload, null, 2));
  
  try {
    const response = await axios.post(API_URL, payload);
    const root: ApiResponse<T> = response.data;

    console.log('makeDataApiCall: API response:', root);

    // New API shape: { status: 'Ok', data: [{ key: 'query_name', value: { csvData: [ ... ] } }] }
    const csvData: string[] | undefined = root?.data?.[0]?.value?.csvData;

    console.log('makeDataApiCall: csvData:', csvData);

    if (Array.isArray(csvData) && csvData.length > 1) {
      return csvData as T[]; // Return raw CSV data for parsing by specific services
    }

    // Fallback to older shapes if ever returned
    const records: T[] =
      root?.sqlResults?.[0]?.records ||
      root?.results?.[0]?.records ||
      root?.records ||
      [];

    console.log('makeDataApiCall: fallback records:', records);
    return records;
  } catch (error) {
    console.error('makeDataApiCall: API call failed:', error);
    // Return empty array on error to prevent infinite loop
    return [];
  }
}

/**
 * Common function to parse CSV data to DTOs
 */
export function parseCsvToDtos<T>(
  csvData: string[],
  headerMapping: Record<string, string>,
  dtoFactory: (rowData: Record<string, any>) => T
): T[] {
  const [headerLine, ...rows] = csvData;
  const headers = headerLine.split('|').map((h: string) => stripQuotes(h));

  const headerIndex = (name: string) => headers.findIndex((h) => h === name);

  const idx = Object.fromEntries(
    Object.entries(headerMapping).map(([dtoKey, headerName]) => [dtoKey, headerIndex(headerName)])
  ) as Record<string, number>;

  return rows
    .map((line) => line.split('|').map((v) => stripQuotes(v)))
    .map((cols) => {
      const get = (i: number) => (i >= 0 && i < cols.length ? cols[i] : undefined);
      const parseBool = (v: any): boolean => {
        if (typeof v === 'boolean') return v;
        const s = String(v ?? '').trim().toLowerCase();
        return s === 'true';
      };
      const parseMaybeJson = (v?: string): unknown => {
        if (!v) return undefined;
        const s = v.trim();
        if ((s.startsWith('{') && s.endsWith('}')) || (s.startsWith('[') && s.endsWith(']'))) {
          try { return JSON.parse(s); } catch { return s; }
        }
        return s;
      };

      const rowData: Record<string, any> = {};
      Object.entries(headerMapping).forEach(([dtoKey, headerName]) => {
        const colIndex = idx[dtoKey];
        const value = get(colIndex);
        
        // Apply appropriate parsing based on data type
        if (headerName.toLowerCase().includes('boolean') || dtoKey.toLowerCase().includes('enabled') || dtoKey.toLowerCase().includes('deleted')) {
          rowData[dtoKey] = parseBool(value);
        } else if (headerName.toLowerCase().includes('json') || dtoKey.toLowerCase().includes('json')) {
          rowData[dtoKey] = parseMaybeJson(value);
        } else {
          rowData[dtoKey] = value ?? undefined;
        }
      });

      return dtoFactory(rowData);
    });
}

/**
 * Common function to strip quotes from CSV values
 */
export function stripQuotes(value: string): string {
  if (value == null) return value as unknown as string;
  let v = value.trim();
  if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
    v = v.substring(1, v.length - 1);
  }
  return v;
}

/**
 * Common function to create SQL query configuration
 */
export function createSqlQueryConfig(
  name: string,
  tableName: string,
  columns: Array<{
    dboName: string;
    columnName: string;
    dataType: string;
    aliasName: string;
    output: boolean;
  }>,
  searchFilter?: {
    conditionOperator: number;
    filters: Array<{
      propertyName: string;
      value: any;
    }>;
  },
  orderBy?: Array<{
    columnName: string;
    sortType: number;
  }>,
  page: number = 0,
  pageSize: number = 100
): SqlQueryConfig {
  return {
    name,
    query: {
      databaseId: '09d8e037-0005-4887-abde-112a529de2b8',
      columns,
      tables: [tableName],
      searchFilter,
      orderBy,
      page,
      pageSize,
      caseStatements: []
    },
    includeRecordsCount: true
  };
}

/**
 * Common function to create API payload
 */
export function createApiPayload(queries: SqlQueryConfig[]): ApiPayload {
  return {
    executeInParallel: true,
    sqlQueries: queries
  };
}
