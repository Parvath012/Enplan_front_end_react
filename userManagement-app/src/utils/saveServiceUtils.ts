/**
 * Shared utility functions for save services (userSaveService and roleSaveService)
 * This file eliminates code duplication between save services
 */

/**
 * Escapes single quotes in a string for SQL queries
 */
export function escapeSingleQuotes(value: string): string {
  return value.replace(/'/g, "''");
}

/**
 * Quotes a string value for SQL queries, handling null/undefined
 */
export function quoteString(value?: string | null): string {
  if (value === undefined || value === null) {
    return 'NULL';
  }
  return `'${escapeSingleQuotes(value)}'`;
}

/**
 * Formats current timestamp for SQL queries
 */
export function formatTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const yyyy = now.getFullYear();
  const MM = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const HH = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  return `'${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}'`;
}

/**
 * Formats a provided timestamp for SQL queries
 */
export function formatTimestampFromDate(timestamp: string): string {
  const date = new Date(timestamp);
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const yyyy = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const HH = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `'${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}'`;
}

/**
 * Quotes a JSON value for SQL queries
 */
export function quoteJSON(value?: any): string {
  if (value === undefined || value === null) {
    return 'NULL';
  }
  try {
    const jsonString = JSON.stringify(value);
    return quoteString(jsonString);
  } catch (error) {
    console.error('Error stringifying JSON:', error);
    return 'NULL';
  }
}

/**
 * Gets the save endpoint URL
 */
export function getSaveEndpoint(): string {
  const baseUrl = process.env.REACT_APP_DATA_API_URL ?? 'https://172.16.20.116:50005';
  console.log('getSaveEndpoint: Using baseUrl:', baseUrl);
  return `${baseUrl}/api/v1/data/Data/SaveData`;
}

/**
 * Gets the query endpoint URL
 */
export function getQueryEndpoint(): string {
  const baseUrl = process.env.REACT_APP_DATA_API_URL ?? 'https://172.16.20.116:50005';
  return `${baseUrl}/api/v1/data/Data/ExecuteSqlQueries`;
}

