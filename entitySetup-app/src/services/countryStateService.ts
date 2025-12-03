import axios from 'axios';

const API_PATH = '/api/v1/data/Data/ExecuteSqlQueries';
const API_URL = `${process.env.REACT_APP_DATA_API_URL ?? ''}${API_PATH}`;




function stripQuotes(value: string): string {
  if (value == null) return value as unknown as string;
  let v = value.trim();
  if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
    v = v.substring(1, v.length - 1);
  }
  return v;
}

function parseMaybeJson(v?: string): unknown {
  if (!v) return undefined;
  const s = v.trim();
  if ((s.startsWith('{') && s.endsWith('}')) || (s.startsWith('[') && s.endsWith(']'))) {
    try { return JSON.parse(s); } catch { return s; }
  }
  return s;
}

export async function fetchCountryStateMap(): Promise<Record<string, { states: string[]; currencies: string[] }>> {
  const body = {
    executeInParallel: true,
    sqlQueries: [
      {
        name: 'country_state',
        query: {
          databaseId: '09d8e037-0005-4887-abde-112a529de2b8',
          options: {
            isDistinct: false,
            top: {
              value: 0,
              isPercent: false
            }
          },
          columns: [
            {
              dboName: 'country_state',
              columnName: 'CountryName',
              dataType: 'string',
              aliasName: 'Country',
              output: true,
              aggregateFunction: '',
              groupBy: false
            },
            {
              dboName: 'country_state',
              columnName: 'StateName',
              dataType: 'JSON',
              aliasName: 'States',
              output: true,
              aggregateFunction: '',
              groupBy: false
            },
            {
              dboName: 'country_state',
              columnName: 'CurrencyNames',
              dataType: 'JSON',
              aliasName: 'Currency',
              output: true,
              aggregateFunction: '',
              groupBy: false
            }
          ],
          caseStatements: [],
          tables: [
            'country_state'
          ],
          searchFilter: {
            conditionOperator: 0,
            filters: []
          },
          joins: [],
          orderBy: [
            {
              columnName: 'CountryName',
              sortType: 0
            }
          ],
          page: 0,
          pageSize: 250
        },
        includeRecordsCount: true
      }
    ]
  };

  const response = await axios.post(API_URL, body);
  const root: any = response.data;
  const csvData: string[] | undefined = root?.data?.[0]?.value?.csvData;

  if (!Array.isArray(csvData) || csvData.length < 2) {
    return {};
  }

  const [headerLine, ...rows] = csvData;
  const headers = headerLine.split('|').map((h: string) => stripQuotes(h));
  const idx = {
    Country: headers.findIndex((h) => h === 'Country'),
    States: headers.findIndex((h) => h === 'States'),
    CurrencyNames: headers.findIndex((h) => h === 'Currency'),
  } as const;

  const map: Record<string, { states: string[]; currencies: string[] }> = {};

  for (const line of rows) {
    const cols = line.split('|').map((v) => stripQuotes(v));
    const country = String(cols[idx.Country] ?? '').trim();
    const statesRaw = cols[idx.States];
    const currenciesRaw = cols[idx.CurrencyNames];
    
    const statesParsed = parseMaybeJson(statesRaw);
    const currenciesParsed = parseMaybeJson(currenciesRaw);
    
    const states = Array.isArray(statesParsed) ? (statesParsed as unknown[]).map((s) => String(s)) : [];
    const currencies = Array.isArray(currenciesParsed) ? (currenciesParsed as unknown[]).map((c) => String(c)) : [];
    
    if (country) {
      map[country] = {
        states: Array.from(new Set(states)).sort((a, b) => a.localeCompare(b)),
        currencies: Array.from(new Set(currencies)).sort((a, b) => a.localeCompare(b))
      };
    }
  }

  return map;
}

// Function to get currencies for a specific country
export async function getCurrenciesForCountry(country: string): Promise<string[]> {
  try {
    const countryStateMap = await fetchCountryStateMap();
    return countryStateMap[country]?.currencies || [];
  } catch (error) {
    console.error('Error fetching currencies for country:', error);
    return [];
  }
}

// Function to get states for a specific country (backward compatibility)
export async function getStatesForCountry(country: string): Promise<string[]> {
  try {
    const countryStateMap = await fetchCountryStateMap();
    return countryStateMap[country]?.states || [];
  } catch (error) {
    console.error('Error fetching states for country:', error);
    return [];
  }
}
