import axios from 'axios';

export interface CurrencyDto {
  id: string;
  currencyName: string;
}

export interface CurrencyModel {
  id: string;
  currencyName: string;
}

const API_PATH = '/api/v1/data/Data/ExecuteSqlQueries';
const API_URL = `${process.env.REACT_APP_DATA_API_URL ?? ''}${API_PATH}`;

const currencyPayload = {
  executeInParallel: true,
  sqlQueries: [
    {
      name: 'currencies',
      query: {
        databaseId: '09d8e037-0005-4887-abde-112a529de2b8',
        columns: [
          {
            dboName: 'currencies',
            columnName: 'id',
            aliasName: 'id',
            dataType: 'UUID',
            columnSize: 0,
            isPrimaryKey: true,
            isNullable: false,
            createIndex: false,
            isSequenceColumn: true,
            columnOrderIndex: 1
          },
          {
            dboName: 'currencies',
            columnName: 'currencyName',
            aliasName: 'currencyName',
            dataType: 'VARCHAR',
            columnSize: 255,
            isPrimaryKey: false,
            isNullable: false,
            createIndex: false,
            isSequenceColumn: false,
            columnOrderIndex: 2
          }
        ],
        tables: ['currencies'],
        searchFilter: {
          conditionOperator: 0,
          filters: []
        },
        page: 0,
        pageSize: 200,
        caseStatements: []
      },
      includeRecordsCount: true
    }
  ]
};

function mapDtoToModel(dto: CurrencyDto): CurrencyModel {
  return {
    id: dto.id,
    currencyName: dto.currencyName,
  };
}

export async function fetchCurrenciesFromApi(): Promise<CurrencyModel[]> {
  try {
    console.log('fetchCurrenciesFromApi: Making API call to', API_URL);
    console.log('fetchCurrenciesFromApi: Request payload:', JSON.stringify(currencyPayload, null, 2));
    const response = await axios.post(API_URL, currencyPayload);
    const root: any = response.data;

    console.log('fetchCurrenciesFromApi: API call successful:', response.data);
    console.log('fetchCurrenciesFromApi: Response structure:', {
      status: response.status,
      dataLength: Array.isArray(root?.data) ? root.data.length : 'Not an array',
      dataType: typeof root?.data,
      sampleData: Array.isArray(root?.data) && root.data.length > 0 ? root.data[0] : 'No data'
    });

    // New API shape: { status: 'Ok', data: [{ key: 'currencies', value: { csvData: [ ... ] } }] }
    const csvData: string[] | undefined = root?.data?.[0]?.value?.csvData;

    if (Array.isArray(csvData) && csvData.length > 1) {
      const dtos = parseCsvToDtos(csvData);
      return dtos.map(mapDtoToModel);
    }

    // Fallback to older shapes if ever returned
    const records: CurrencyDto[] =
      root?.sqlResults?.[0]?.records ||
      root?.results?.[0]?.records ||
      root?.records ||
      [];

    return records.map(mapDtoToModel);
  } catch (error: any) {
    console.error('fetchCurrenciesFromApi: API call failed:', error);
    
    // Log more details about the error response
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    throw error;
  }
}

function parseCsvToDtos(csvData: string[]): CurrencyDto[] {
  const [headerLine, ...rows] = csvData;
  const headers = headerLine.split('|').map((h: string) => stripQuotes(h));

  const headerIndex = (name: string) => headers.findIndex((h) => h === name);

  const idx = {
    id: headerIndex('id'),
    currencyName: headerIndex('currencyName'),
  } as const;

  return rows
    .map((line) => line.split('|').map((v) => stripQuotes(v)))
    .map((cols) => {
      const get = (i: number) => (i >= 0 && i < cols.length ? cols[i] : undefined);

      const dto: CurrencyDto = {
        id: String(get(idx.id) ?? ''),
        currencyName: String(get(idx.currencyName) ?? ''),
      };

      return dto;
    });
}

function stripQuotes(value: string): string {
  if (value == null) return value as unknown as string;
  let v = value.trim();
  if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
    v = v.substring(1, v.length - 1);
  }
  return v;
}
