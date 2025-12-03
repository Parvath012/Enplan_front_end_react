/**
 * API Error Handler Utilities
 * Shared utility functions for handling API errors consistently
 */

/**
 * Check if an error indicates the API is unavailable
 */
export function isApiUnavailableError(error: any): boolean {
  return error?.code === 'ECONNABORTED' || 
         error?.code === 'ECONNREFUSED' || 
         error?.message?.includes('Request aborted');
}

/**
 * Handle API error - log and optionally return empty array for unavailable APIs
 */
export function handleApiError(error: any, apiName: string, returnEmptyOnUnavailable: boolean = true): any[] | never {
  console.error(`${apiName}: API call failed:`, error);
  
  if (returnEmptyOnUnavailable && isApiUnavailableError(error)) {
    console.warn(`${apiName}: API not available, returning empty array`);
    return [];
  }
  
  throw error;
}

