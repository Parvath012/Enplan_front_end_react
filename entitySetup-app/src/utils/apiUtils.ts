// API utility functions for entitySetup-app

export const formatTimestamp = (timestamp: string | Date): string => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return date.toISOString();
};

export const saveDataApiCall = async (data: any): Promise<any> => {
  // Mock implementation for testing
  return Promise.resolve({ success: true, data });
};

export const getApiBaseUrl = (): string => {
  return process.env.REACT_APP_DATA_API_URL ?? 'http://localhost:50005';
};

export const makeApiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }
  
  return response.json();
};
