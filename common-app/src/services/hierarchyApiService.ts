import axios from 'axios';
import { handleApiError } from '../utils/apiErrorHandler';

/**
 * Generic hierarchy API service utility
 * Provides reusable functions for fetching hierarchy data from APIs
 */

export interface HierarchyApiConfig {
  baseUrl: string;
  apiPath: string;
  timeout?: number;
}

/**
 * Fetch hierarchy data from API
 * @param config - API configuration
 * @returns Promise with hierarchy data array
 */
export async function fetchHierarchyFromApi<T = any>(
  config: HierarchyApiConfig
): Promise<T[]> {
  const { baseUrl, apiPath, timeout = 10000 } = config;
  const API_URL = `${baseUrl}${apiPath}`;
  
  console.log(`fetchHierarchyFromApi: Making API call to ${API_URL}`);
  try {
    const response = await axios.get(API_URL, {
      timeout,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    console.log(`fetchHierarchyFromApi: API call successful:`, response.data);
    console.log(`fetchHierarchyFromApi: Response structure:`, {
      status: response.status,
      dataLength: Array.isArray(response.data) ? response.data.length : 'Not an array',
      dataType: typeof response.data,
      sampleData: Array.isArray(response.data) && response.data.length > 0 ? response.data[0] : 'No data'
    });
    
    // Additional debugging for the actual response
    console.log(`fetchHierarchyFromApi: Full response data:`, JSON.stringify(response.data, null, 2));
    console.log(`fetchHierarchyFromApi: Response length:`, response.data?.length);
    console.log(`fetchHierarchyFromApi: Is Array:`, Array.isArray(response.data));
    
    return response.data;
  } catch (error: any) {
    return handleApiError(error, 'fetchHierarchyFromApi', true);
  }
}

