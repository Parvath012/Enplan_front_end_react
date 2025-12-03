import { fetchHierarchyFromApi } from 'commonApp/hierarchyApiService';

/**
 * User Hierarchy Model - matches API response structure
 */
export interface UserHierarchyModel {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  department?: string;
  reportingManager?: UserHierarchyModel[];
  dottedProjectManager?: UserHierarchyModel[];
}

/**
 * Reporting Structure Service
 * Handles all API calls related to user hierarchy and reporting structure
 */

// Fetch user hierarchy from API (for Organizational and Departmental views)
export async function fetchUserHierarchyFromApi(): Promise<UserHierarchyModel[]> {
  const API_BASE_URL = process.env.REACT_APP_USER_HIERARCHY_API_URL ?? 'http://localhost:8881';
  const API_PATH = '/api/user-hierarchy/reporting/all';
  
  return fetchHierarchyFromApi<UserHierarchyModel>({
    baseUrl: API_BASE_URL,
    apiPath: API_PATH,
    timeout: 10000,
  });
}

// Fetch all hierarchies (for Dotted-line Reporting view)
export async function fetchAllHierarchiesFromApi(): Promise<UserHierarchyModel[]> {
  const API_BASE_URL = process.env.REACT_APP_USER_HIERARCHY_API_URL ?? 'http://localhost:8881';
  const API_PATH = '/api/user-hierarchy/all-hierarchies';
  
  return fetchHierarchyFromApi<UserHierarchyModel>({
    baseUrl: API_BASE_URL,
    apiPath: API_PATH,
    timeout: 10000,
  });
}

