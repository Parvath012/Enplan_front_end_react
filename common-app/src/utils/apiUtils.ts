// Shared utility functions for API operations

/**
 * Formats a timestamp string for database operations
 * @param ts Optional timestamp string, uses current date if not provided
 * @returns Formatted timestamp string
 */
export const formatTimestamp = (ts?: string): string => {
  const date = ts ? new Date(ts) : new Date();
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const yyyy = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `'${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}'`;
};

/**
 * Makes a direct API call to SaveData endpoint
 * @param payload The payload to send to the API
 * @returns Promise that resolves to the response data
 */
export const saveDataApiCall = async (payload: {
  tableName: string;
  csvData: string[];
  hasHeaders: boolean;
  uniqueColumn: string;
}): Promise<any> => {
  const API_PATH = '/api/v1/data/Data/SaveData';
  const SAVE_ENDPOINT = `${process.env.REACT_APP_DATA_API_URL ?? ''}${API_PATH}`;
  
  const response = await fetch(SAVE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
