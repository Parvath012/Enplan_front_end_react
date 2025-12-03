import { apiRequest } from '../auth/apiRequest';
import { logDetailedError } from '../../utils/errorLogger';
import { userProcessGroupMappingService, UserCredentials } from '../../services/userProcessGroupMapping';
import { generateUUID } from '../../utils/uuidUtils';

// Ensure crypto.randomUUID is available (polyfill if needed)
// Uses random UID instead of UUID format for server 11 compatibility
if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
  (crypto as any).randomUUID = () => generateUUID(32);
}

// Interface for NiFi Controller Status
export interface NifiControllerStatus {
  activeThreadCount: number;
  terminatedThreadCount: number;
  queued: string;
  flowFilesQueued: number;
  bytesQueued: number;
  runningCount: number;
  stoppedCount: number;
  invalidCount: number;
  disabledCount: number;
  activeRemotePortCount: number;
  inactiveRemotePortCount: number;
  upToDateCount: number;
  locallyModifiedCount: number;
  staleCount: number;
  locallyModifiedAndStaleCount: number;
  syncFailureCount: number;
}

// Interface for the full response
export interface NifiStatusResponse {
  controllerStatus: NifiControllerStatus;
}

// Interface for Process Group Position
export interface ProcessGroupPosition {
  x: number;
  y: number;
}

// Interface for Process Group Component
export interface ProcessGroupComponent {
  position: ProcessGroupPosition;
  name: string;
  comments?: string;
}

// Interface for Process Group Revision
export interface ProcessGroupRevision {
  clientId: string;
  version: number;
  lastModifier?: string;
}

// Type alias for HTTP methods
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// Interface for Create Process Group Request
export interface CreateProcessGroupRequest {
  revision: ProcessGroupRevision;
  disconnectedNodeAcknowledged: boolean;
  component: ProcessGroupComponent;
}

// Interface for Update Process Group Configuration Request
export interface UpdateProcessGroupConfigurationRequest {
  revision: ProcessGroupRevision;
  disconnectedNodeAcknowledged: boolean;
  processGroupUpdateStrategy: string;
  component: {
    id: string;
    name: string;
    executionEngine?: string;
    flowfileConcurrency?: string;
    flowfileOutboundPolicy?: string;
    defaultFlowFileExpiration?: string;
    defaultBackPressureObjectThreshold?: number;
    defaultBackPressureDataSizeThreshold?: string;
    logFileSuffix?: string | null;
    parameterContext?: { id: string } | null;
    comments?: string;
    maxConcurrentTasks?: number;
    statelessFlowTimeout?: string;
  };
}

// Interface for Process Group Response
export interface ProcessGroupResponse {
  revision: ProcessGroupRevision;
  id: string;
  uri: string;
  position: ProcessGroupPosition;
  permissions: {
    canRead: boolean;
    canWrite: boolean;
  };
  component: {
    id: string;
    parentGroupId: string;
    position: ProcessGroupPosition;
    name: string;
    comments: string;
    runningCount: number;
    stoppedCount: number;
    invalidCount: number;
    disabledCount: number;
    activeRemotePortCount: number;
    inactiveRemotePortCount: number;
    upToDateCount: number;
    locallyModifiedCount: number;
    staleCount: number;
    locallyModifiedAndStaleCount: number;
    syncFailureCount: number;
    inputPortCount: number;
    outputPortCount: number;
  };
  status?: {
    id: string;
    name: string;
    aggregateSnapshot: {
      id: string;
      name: string;
      flowFilesIn: number;
      bytesIn: number;
      input: string;
      flowFilesQueued: number;
      bytesQueued: number;
      queued: string;
      bytesRead: number;
      read: string;
      bytesWritten: number;
      written: string;
      flowFilesOut: number;
      bytesOut: number;
      output: string;
      [key: string]: any;
    };
  };
}

// Interface for Flow Process Groups Response
export interface FlowProcessGroupsResponse {
  processGroupFlow: {
    id: string;
    uri: string;
    parentGroupId: string | null;
    breadcrumb: {
      id: string;
      name: string;
    };
    flow: {
      processGroups: ProcessGroupResponse[];
      remoteProcessGroups: any[];
      processors: any[];
      inputPorts: any[];
      outputPorts: any[];
      connections: any[];
      labels: any[];
      funnels: any[];
    };
    lastRefreshed: string;
  };
}

// Interface for Root Process Group Response
export interface RootProcessGroupResponse {
  processGroupFlow: {
    id: string;
    uri: string;
    parentGroupId: string | null;
    breadcrumb: {
      id: string;
      name: string;
    };
  };
}

// Cache for root process group ID to avoid repeated API calls
let cachedRootProcessGroupId: string | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache TTL

/**
 * Helper function to generate a client ID if not provided
 * @param clientId - Optional client ID
 * @returns Client ID (provided or generated)
 */
function getOrGenerateClientId(clientId?: string): string {
  // Use crypto.randomUUID if available (will be polyfilled if not), otherwise use generateUUID directly
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return clientId ?? crypto.randomUUID();
  }
  return clientId ?? generateUUID();
}

/**
 * Authenticate with the NiFi API server via proxy
 * This is extracted to avoid circular dependencies
 */
async function authenticateWithNiFi(): Promise<void> {
  try {
    console.log('Authenticating with NiFi via proxy...');
    // Use apiRequest to maintain consistency with other API calls
    await apiRequest('/api/authenticate', 'GET');
    console.log('Authentication successful');
    // Clear cached root process group ID when re-authenticating
    cachedRootProcessGroupId = null;
    cacheTimestamp = 0;
  } catch (error: any) {
    logDetailedError('Failed to authenticate with NiFi', error);
    throw error;
  }
}

/**
 * Helper function to get log prefix for request logging
 * @param method - HTTP method
 * @returns Log prefix string
 */
function getRequestLogPrefix(method: HttpMethod): string {
  if (method === 'PUT') return 'Making PUT request to';
  if (method === 'POST') return 'Making POST request to';
  if (method === 'DELETE') return 'Making DELETE request to';
  return 'Making request to';
}

/**
 * Helper function to get log prefix for response logging
 * @param method - HTTP method
 * @returns Log prefix string
 */
function getResponseLogPrefix(method: HttpMethod): string {
  if (method === 'PUT') return 'Update response received';
  if (method === 'POST') return 'Response received';
  if (method === 'DELETE') return 'Delete response received';
  return 'Response received';
}

/**
 * Helper function to format request payload for logging
 * @param data - Request data
 * @param method - HTTP method
 * @returns Formatted payload string
 */
function formatRequestPayload(data: any, method: HttpMethod): any {
  if (method === 'PUT' && typeof data === 'object') {
    return JSON.stringify(data, null, 2);
  }
  return data;
}

/**
 * Helper function to log request details
 * @param url - API endpoint URL
 * @param method - HTTP method
 * @param data - Optional request body
 */
function logRequestDetails(url: string, method: HttpMethod, data?: any): void {
  const logPrefix = getRequestLogPrefix(method);
  console.log(`${logPrefix}:`, url);
  if (data && (method === 'POST' || method === 'PUT')) {
    const formattedPayload = formatRequestPayload(data, method);
    console.log('Request payload:', formattedPayload);
  }
}

/**
 * Helper function to log response details
 * @param method - HTTP method
 * @param response - API response
 */
function logResponseDetails(method: HttpMethod, response: any): void {
  const responseLogPrefix = getResponseLogPrefix(method);
  console.log(`${responseLogPrefix}:`, response);
}

/**
 * Helper function to make authenticated API requests with consistent error handling
 * @param url - API endpoint URL
 * @param method - HTTP method (GET, POST, PUT, DELETE)
 * @param data - Optional request body
 * @param errorMessage - Error message for logging
 * @param logRequest - Whether to log the request (default: true)
 * @param logResponse - Whether to log the response (default: true)
 * @returns API response
 */
async function makeAuthenticatedRequest(
  url: string,
  method: HttpMethod,
  data?: any,
  errorMessage?: string,
  logRequest: boolean = true,
  logResponse: boolean = true
): Promise<any> {
  try {
    // First ensure we're authenticated
    await authenticateWithNiFi();

    if (logRequest) {
      logRequestDetails(url, method, data);
    }

    const response = await apiRequest(url, method, data);

    if (logResponse) {
      logResponseDetails(method, response);
    }

    return response;
  } catch (error: any) {
    const finalErrorMessage = errorMessage ?? `Failed to make ${method} request to ${url}`;
    logDetailedError(finalErrorMessage, error);
    throw error;
  }
}

/**
 * Helper function to set process group flow state
 * @param processGroupId - The ID of the process group
 * @param state - The state to set (RUNNING, STOPPED, ENABLED, DISABLED)
 * @param updateRemoteGroups - Whether to also update remote process groups (default: false)
 * @param remoteState - State for remote process groups (TRANSMITTING or STOPPED, default: same as state)
 * @param getProcessGroupFn - Function to get process group (to avoid circular dependency)
 * @returns Updated process group response
 */
async function setProcessGroupFlowState(
  processGroupId: string,
  state: 'RUNNING' | 'STOPPED' | 'ENABLED' | 'DISABLED',
  updateRemoteGroups: boolean = false,
  remoteState?: 'TRANSMITTING' | 'STOPPED',
  getProcessGroupFn?: (id: string) => Promise<any>
): Promise<any> {
  // Step 1: Set process group flow state
  const flowUrl = `/nifi-api/flow/process-groups/${processGroupId}`;
  const flowData = {
    id: processGroupId,
    disconnectedNodeAcknowledged: false,
    state: state,
  };

  const getActionText = (): string => {
    if (state === 'RUNNING') return 'Starting';
    if (state === 'STOPPED') return 'Stopping';
    if (state === 'ENABLED') return 'Enabling';
    return 'Disabling';
  };
  const action = getActionText();
  console.log(`${action} process group flow:`, processGroupId);
  console.log('Request URL:', flowUrl);

  await makeAuthenticatedRequest(flowUrl, 'PUT', flowData, `Failed to ${action.toLowerCase()} process group flow`, true, false);
  console.log(`Process group flow ${state.toLowerCase()} successfully`);

  // Step 2: Update remote process groups if needed
  if (updateRemoteGroups) {
    const getFinalRemoteState = (): 'TRANSMITTING' | 'STOPPED' => {
      if (remoteState) return remoteState;
      return state === 'RUNNING' ? 'TRANSMITTING' : 'STOPPED';
    };
    const finalRemoteState = getFinalRemoteState();
    const remoteUrl = `/nifi-api/remote-process-groups/process-group/${processGroupId}/run-status`;
    const remoteData = {
      disconnectedNodeAcknowledged: false,
      state: finalRemoteState,
    };

    const getRemoteAction = (): string => {
      return finalRemoteState === 'TRANSMITTING' ? 'Starting' : 'Stopping';
    };
    const remoteAction = getRemoteAction();
    console.log(`${remoteAction} remote process groups:`, processGroupId);
    console.log('Request URL:', remoteUrl);

    await makeAuthenticatedRequest(remoteUrl, 'PUT', remoteData, `Failed to ${remoteAction.toLowerCase()} remote process groups`, true, false);
    console.log(`Remote process groups ${finalRemoteState.toLowerCase()} successfully`);
  }

  // Step 3: Get the updated process group state
  if (!getProcessGroupFn) {
    throw new Error('getProcessGroupFn is required');
  }
  const response = await getProcessGroupFn(processGroupId);
  console.log(`Process group ${state.toLowerCase()} and refreshed successfully`);

  return response;
}

/**
 * Helper function to resolve process group ID with retry logic
 * @param providedId - Optional provided process group ID
 * @param credentials - Optional user credentials for user-specific process group
 * @param getRootProcessGroupIdFn - Function to get root process group ID (to avoid circular dependency)
 * @returns Resolved process group ID
 */
async function resolveProcessGroupId(
  providedId?: string,
  credentials?: UserCredentials,
  getRootProcessGroupIdFn?: (forceRefresh?: boolean) => Promise<string>
): Promise<string> {
  if (providedId) {
    console.log(`Using provided process group ID: ${providedId}`);
    return providedId;
  }

  if (credentials) {
    const userProcessGroupId = await userProcessGroupMappingService.getProcessGroupIdForUser(credentials);
    if (!userProcessGroupId) {
      throw new Error(`No process group found for user: ${credentials.username}`);
    }
    console.log(`Using user-specific process group ID: ${userProcessGroupId} for user: ${credentials.username}`);
    return userProcessGroupId;
  }

  // Use dynamically fetched root process group ID with retry logic
  if (!getRootProcessGroupIdFn) {
    throw new Error('getRootProcessGroupIdFn is required when no providedId or credentials');
  }

  try {
    const rootId = await getRootProcessGroupIdFn();
    console.log(`Using dynamic root process group ID: ${rootId}`);
    return rootId;
  } catch (error) {
    // Retry once with force refresh if initial fetch fails
    console.warn('Failed to fetch dynamic root process group ID, retrying with force refresh:', error);
    try {
      const rootId = await getRootProcessGroupIdFn(true);
      console.log(`Successfully fetched root process group ID on retry: ${rootId}`);
      return rootId;
    } catch (retryError) {
      // If retry also fails, try to get from user mapping service (which also uses dynamic fetch)
      console.warn('Retry also failed, attempting fallback via user mapping service:', retryError);
      try {
        const fallbackId = await userProcessGroupMappingService.getDefaultProcessGroupId();
        console.log(`Using fallback default process group ID: ${fallbackId}`);
        return fallbackId;
      } catch (fallbackError) {
        throw new Error(`Unable to fetch root process group ID after all attempts: ${fallbackError}`);
      }
    }
  }
}

/**
 * NiFi API service provides methods to interact with NiFi through the proxy server
 */
export const nifiApiService = {
  /**
   * Authenticate with the NiFi API server via proxy
   */
  authenticate: authenticateWithNiFi,

  /**
   * Get the root process group ID dynamically from NiFi
   * This function fetches the root process group ID from the NiFi API
   * and caches it to avoid repeated API calls.
   * @param forceRefresh - If true, bypasses cache and fetches fresh data
   * @returns The root process group ID
   */
  getRootProcessGroupId: async (forceRefresh: boolean = false): Promise<string> => {
    try {
      // Check cache first (unless force refresh is requested)
      const now = Date.now();
      if (!forceRefresh && cachedRootProcessGroupId && (now - cacheTimestamp) < CACHE_TTL_MS) {
        console.log(`Using cached root process group ID: ${cachedRootProcessGroupId}`);
        return cachedRootProcessGroupId;
      }

      // Ensure we're authenticated before making the request
      await authenticateWithNiFi();

      // Make GET request to fetch root process group
      const url = '/nifi-api/flow/process-groups/root';
      console.log('Fetching root process group ID from:', url);

      let response: RootProcessGroupResponse | null = null;
      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount <= maxRetries) {
        try {
          response = await apiRequest(url, 'GET') as RootProcessGroupResponse;
          break;
        } catch (error: any) {
          // If unauthorized (401), try to refresh token and retry
          if (error.response?.status === 401 && retryCount < maxRetries) {
            console.log('Token expired or invalid, refreshing authentication...');
            await authenticateWithNiFi();
            retryCount++;
            continue;
          }
          throw error;
        }
      }

      // Extract root process group ID from response
      if (!response?.processGroupFlow?.id) {
        throw new Error('Root process group ID not found in API response');
      }

      const rootProcessGroupId = response.processGroupFlow.id;
      
      // Cache the result
      cachedRootProcessGroupId = rootProcessGroupId;
      cacheTimestamp = now;

      console.log(`Root process group ID fetched and cached: ${rootProcessGroupId}`);
      return rootProcessGroupId;
    } catch (error: any) {
      logDetailedError('Failed to fetch root process group ID', error);
      
      // If we have a cached value, return it as fallback
      if (cachedRootProcessGroupId) {
        console.warn('Using cached root process group ID due to fetch error');
        return cachedRootProcessGroupId;
      }

      throw new Error(
        `Failed to fetch root process group ID: ${error.message || 'Unknown error'}`
      );
    }
  },

  /**
   * Get the current flow status from NiFi
   */
  getFlowStatus: async (): Promise<NifiStatusResponse> => {
    return makeAuthenticatedRequest('/nifi-api/flow/status', 'GET', undefined, 'Failed to fetch NiFi flow status');
  },

  /**
   * Create a new process group in NiFi
   * @param parentGroupId - The ID of the parent process group (optional, will use dynamic root ID if not provided)
   * @param name - Name of the new process group
   * @param position - Position on the canvas {x, y}
   * @param clientId - Client ID for revision tracking (optional, generates UUID if not provided)
   */
  createProcessGroup: async (
    parentGroupId: string | undefined,
    name: string,
    position: ProcessGroupPosition,
    clientId?: string
  ): Promise<ProcessGroupResponse> => {
    try {
      // Determine parent group ID - use dynamic root ID if not provided
      const targetParentGroupId = await resolveProcessGroupId(parentGroupId, undefined, nifiApiService.getRootProcessGroupId);

      // Generate a client ID if not provided
      const requestClientId = getOrGenerateClientId(clientId);

      // Prepare the request payload
      const requestData: CreateProcessGroupRequest = {
        revision: {
          clientId: requestClientId,
          version: 0,
        },
        disconnectedNodeAcknowledged: false,
        component: {
          position: position,
          name: name,
        },
      };

      console.log('Creating process group:', requestData);

      // Make the POST request to create the process group
      const url = `/nifi-api/process-groups/${targetParentGroupId}/process-groups`;
      return makeAuthenticatedRequest(url, 'POST', requestData, 'Failed to create process group', false, false);
    } catch (error: any) {
      logDetailedError('Failed to create process group', error);
      throw error;
    }
  },

  /**
   * Get all process groups from a parent process group flow
   * @param parentGroupId - The ID of the parent process group (optional, will use dynamic root ID or user's process group if not provided)
   * @param uiOnly - Whether to fetch only UI-relevant data (default: true)
   * @param credentials - User credentials (optional, used to determine process group if parentGroupId not provided)
   */
  getFlowProcessGroups: async (
    parentGroupId?: string,
    uiOnly: boolean = true,
    credentials?: UserCredentials
  ): Promise<FlowProcessGroupsResponse> => {
    try {
      const targetParentGroupId = await resolveProcessGroupId(parentGroupId, credentials, nifiApiService.getRootProcessGroupId);

      // Build the URL with query parameter
      const url = `/nifi-api/flow/process-groups/${targetParentGroupId}?uiOnly=${uiOnly}`;
      
      return makeAuthenticatedRequest(url, 'GET', undefined, 'Failed to fetch flow process groups', true, true);
    } catch (error: any) {
      logDetailedError('Failed to fetch flow process groups', error);
      throw error;
    }
  },

  /**
   * Get controller services from NiFi for a specific user
   * @param credentials - User credentials (username and password)
   * @param processGroupId - Optional specific process group ID (if not provided, will use dynamic root ID or user's mapped process group)
   */
  getControllerServices: async (
    credentials?: UserCredentials,
    processGroupId?: string
  ): Promise<any> => {
    try {
      const targetProcessGroupId = await resolveProcessGroupId(processGroupId, credentials, nifiApiService.getRootProcessGroupId);
      
      // Make the request to the specific process group controller services endpoint
      const url = `/nifi-api/flow/process-groups/${targetProcessGroupId}/controller-services?uiOnly=true`;
      return makeAuthenticatedRequest(url, 'GET', undefined, 'Failed to fetch controller services');
    } catch (error: any) {
      logDetailedError('Failed to fetch controller services', error);
      throw error;
    }
  },

  /**
   * Get controller service types (available types that can be created)
   * This endpoint returns all available controller service types with their metadata
   */
  getControllerServiceTypes: async (): Promise<any> => {
    return makeAuthenticatedRequest('/nifi-api/flow/controller-service-types', 'GET', undefined, 'Failed to fetch controller service types');
  },

  /**
   * Get processor types (available types that can be created)
   * This endpoint returns all available processor types with their metadata
   */
  getProcessorTypes: async (): Promise<any> => {
    return makeAuthenticatedRequest('/nifi-api/flow/processor-types', 'GET', undefined, 'Failed to fetch processor types');
  },

  /**
   * Create a processor in a process group
   * @param processGroupId - The ID of the process group where the processor will be created
   * @param type - The full type name of the processor (e.g., "org.apache.nifi.processors.standard.GetFile")
   * @param bundle - The bundle information (group, artifact, version)
   * @param clientId - Optional client ID for the request
   */
  createProcessor: async (
    processGroupId: string | undefined,
    type: string,
    bundle: { group: string; artifact: string; version: string },
    position?: { x: number; y: number },
    clientId?: string
  ): Promise<any> => {
    try {
      // Determine process group ID - use dynamic root ID if not provided
      const targetProcessGroupId = await resolveProcessGroupId(processGroupId, undefined, nifiApiService.getRootProcessGroupId);

      // Validate required parameters (type and bundle should always be provided, but check for safety)
      if (!type || !bundle?.group || !bundle?.artifact || !bundle?.version) {
        throw new Error('Type and bundle (with group, artifact, version) are required to create a processor');
      }

      // Generate a client ID if not provided
      const requestClientId = getOrGenerateClientId(clientId);

      // Prepare the request payload
      const requestData: any = {
        revision: {
          clientId: requestClientId,
          version: 0,
        },
        disconnectedNodeAcknowledged: false,
        component: {
          bundle: {
            group: bundle.group,
            artifact: bundle.artifact,
            version: bundle.version,
          },
          type: type,
        },
      };

      // Add position if provided
      if (position) {
        requestData.component.position = position;
      }

      console.log('Creating processor:', requestData);

      // Make the POST request to create the processor
      const url = `/nifi-api/process-groups/${targetProcessGroupId}/processors`;
      return makeAuthenticatedRequest(url, 'POST', requestData, 'Failed to create processor', false, false);
    } catch (error: any) {
      logDetailedError('Failed to create processor', error);
      throw error;
    }
  },

  /**
   * Get process group ID by name dynamically
   * Fetches all process groups from root and finds the one matching the name
   * @param processGroupName - Name of the process group to find
   * @param parentGroupId - Optional parent group ID (defaults to root)
   * @returns Process group ID if found, null otherwise
   */
  getProcessGroupIdByName: async (
    processGroupName: string,
    parentGroupId?: string
  ): Promise<string | null> => {
    try {
      // Get parent group ID (use root if not provided)
      let targetParentGroupId: string;
      if (parentGroupId) {
        targetParentGroupId = parentGroupId;
      } else {
        targetParentGroupId = await nifiApiService.getRootProcessGroupId();
      }

      // Fetch all process groups from the parent
      const flowResponse = await nifiApiService.getFlowProcessGroups(targetParentGroupId, true);
      
      // Search for process group with matching name
      const processGroups = flowResponse.processGroupFlow?.flow?.processGroups || [];
      const matchingGroup = processGroups.find(
        (pg: any) => pg.component?.name === processGroupName
      );

      if (matchingGroup) {
        console.log(`Found process group "${processGroupName}" with ID: ${matchingGroup.id}`);
        return matchingGroup.id;
      }

      console.warn(`Process group "${processGroupName}" not found under parent ${targetParentGroupId}`);
      return null;
    } catch (error: any) {
      logDetailedError(`Failed to fetch process group by name: ${processGroupName}`, error);
      throw error;
    }
  },

  /**
   * Create a controller service in a process group
   * @param processGroupId - The ID of the process group where to create the service (optional, will use dynamic root ID if not provided)
   * @param type - Full class name of the controller service type (e.g., "org.apache.nifi.services.azure.storage.ADLSCredentialsControllerService")
   * @param bundle - Bundle information (group, artifact, version)
   * @param clientId - Optional client ID for revision tracking (generates UUID if not provided)
   */
  createControllerService: async (
    processGroupId: string | undefined,
    type: string,
    bundle: { group: string; artifact: string; version: string },
    clientId?: string
  ): Promise<any> => {
    try {
      // Determine process group ID - use dynamic root ID if not provided
      const targetProcessGroupId = await resolveProcessGroupId(processGroupId, undefined, nifiApiService.getRootProcessGroupId);

      // Validate required parameters (type and bundle should always be provided, but check for safety)
      if (!type || !bundle?.group || !bundle?.artifact || !bundle?.version) {
        throw new Error('Type and bundle (with group, artifact, version) are required to create a controller service');
      }

      // Generate a client ID if not provided
      const requestClientId = getOrGenerateClientId(clientId);

      // Prepare the request payload
      const requestData = {
        revision: {
          clientId: requestClientId,
          version: 0,
        },
        disconnectedNodeAcknowledged: false,
        component: {
          bundle: {
            group: bundle.group,
            artifact: bundle.artifact,
            version: bundle.version,
          },
          type: type,
        },
      };

      console.log('Creating controller service:', requestData);

      // Make the POST request to create the controller service
      const url = `/nifi-api/process-groups/${targetProcessGroupId}/controller-services`;
      return makeAuthenticatedRequest(url, 'POST', requestData, 'Failed to create controller service', false, false);
    } catch (error: any) {
      logDetailedError('Failed to create controller service', error);
      throw error;
    }
  },

  /**
   * Get referencing components for a controller service
   * This endpoint returns processors and other components that reference the controller service
   * @param controllerServiceId - The ID of the controller service
   */
  getControllerServiceReferences: async (controllerServiceId: string): Promise<any> => {
    const url = `/nifi-api/controller-services/${controllerServiceId}/references`;
    return makeAuthenticatedRequest(url, 'GET', undefined, 'Failed to fetch controller service references');
  },

  /**
   * Get a specific controller service by ID with full details
   * @param controllerServiceId - The ID of the controller service
   */
  getControllerService: async (controllerServiceId: string): Promise<any> => {
    const url = `/nifi-api/controller-services/${controllerServiceId}`;
    return makeAuthenticatedRequest(url, 'GET', undefined, 'Failed to fetch controller service');
  },

  /**
   * Set controller service run status (enable or disable)
   * @param controllerServiceId - The ID of the controller service
   * @param revision - The revision object with version and clientId
   * @param state - The desired state: 'ENABLED' or 'DISABLED'
   */
  setControllerServiceState: async (
    controllerServiceId: string,
    revision: { version: number; clientId?: string },
    state: 'ENABLED' | 'DISABLED'
  ): Promise<any> => {
    try {
      // Generate a client ID if not provided
      const requestClientId = getOrGenerateClientId(revision.clientId);

      // Prepare the request payload
      const requestData = {
        revision: {
          clientId: requestClientId,
          version: revision.version,
        },
        state: state,
        disconnectedNodeAcknowledged: false,
      };

      const action = state === 'ENABLED' ? 'Enabling' : 'Disabling';
      console.log(`${action} controller service:`, requestData);

      // Make the PUT request to set the controller service state
      const url = `/nifi-api/controller-services/${controllerServiceId}/run-status`;
      const actionLower = state === 'ENABLED' ? 'enable' : 'disable';
      return makeAuthenticatedRequest(url, 'PUT', requestData, `Failed to ${actionLower} controller service`, false, false);
    } catch (error: any) {
      const action = state === 'ENABLED' ? 'enable' : 'disable';
      logDetailedError(`Failed to ${action} controller service`, error);
      throw error;
    }
  },

  /**
   * Enable a controller service
   * @param controllerServiceId - The ID of the controller service to enable
   * @param revision - The revision object with version and clientId
   */
  enableControllerService: async (
    controllerServiceId: string,
    revision: { version: number; clientId?: string }
  ): Promise<any> => {
    return nifiApiService.setControllerServiceState(controllerServiceId, revision, 'ENABLED');
  },

  /**
   * Disable a controller service
   * @param controllerServiceId - The ID of the controller service to disable
   * @param revision - The revision object with version and clientId
   */
  disableControllerService: async (
    controllerServiceId: string,
    revision: { version: number; clientId?: string }
  ): Promise<any> => {
    return nifiApiService.setControllerServiceState(controllerServiceId, revision, 'DISABLED');
  },

  /**
   * Update controller service references (stop/start referencing components)
   * @param controllerServiceId - The ID of the controller service
   * @param state - The state to set for referencing components ('STOPPED' or 'RUNNING')
   * @param referencingComponentRevisions - Object containing revision info for referencing components
   */
  updateControllerServiceReferences: async (
    controllerServiceId: string,
    state: 'STOPPED' | 'RUNNING',
    referencingComponentRevisions: Record<string, any> = {}
  ): Promise<any> => {
    try {
      // Prepare the request payload
      const requestData = {
        id: controllerServiceId,
        state: state,
        referencingComponentRevisions: referencingComponentRevisions,
        disconnectedNodeAcknowledged: false,
        uiOnly: true,
      };

      console.log('Updating controller service references:', requestData);

      // Make the PUT request to update referencing components
      const url = `/nifi-api/controller-services/${controllerServiceId}/references`;
      return makeAuthenticatedRequest(url, 'PUT', requestData, 'Failed to update controller service references', false, false);
    } catch (error: any) {
      logDetailedError('Failed to update controller service references', error);
      throw error;
    }
  },

  /**
   * Update a controller service (properties, settings, comments)
   * @param controllerServiceId - The ID of the controller service to update
   * @param updateData - The update payload with component changes
   */
  updateControllerService: async (
    controllerServiceId: string,
    updateData: any
  ): Promise<any> => {
    try {
      const url = `/nifi-api/controller-services/${controllerServiceId}`;
      return await makeAuthenticatedRequest(url, 'PUT', updateData, 'Failed to update controller service');
    } catch (error: any) {
      // Only log non-409 errors (409 conflicts are handled by retry logic in the component)
      const isConflict = error?.response?.status === 409 || 
                        (error?.response?.status === 500 && 
                         String(error?.response?.data?.details ?? '').includes('409'));
      
      if (!isConflict) {
        logDetailedError('Failed to update controller service', error);
      }
      throw error;
    }
  },

  /**
   * Get a specific process group by ID
   * @param processGroupId - The ID of the process group
   */
  getProcessGroup: async (processGroupId: string): Promise<any> => {
    const url = `/nifi-api/process-groups/${processGroupId}`;
    return makeAuthenticatedRequest(url, 'GET', undefined, 'Failed to fetch process group');
  },

  /**
   * Delete a process group
   * @param processGroupId - The ID of the process group to delete
   * @param clientId - Client ID for the request (optional, generates UUID if not provided)
   */
  deleteProcessGroup: async (
    processGroupId: string,
    clientId?: string
  ): Promise<any> => {
    try {
      // Fetch the current process group to get its version
      console.log('Fetching current version for process group:', processGroupId);
      const processGroup = await nifiApiService.getProcessGroup(processGroupId);
      
      const version = processGroup.revision?.version ?? 0;
      console.log('Current version:', version);

      // Generate a client ID if not provided
      const requestClientId = getOrGenerateClientId(clientId);

      // Build the URL with query parameters
      const url = `/nifi-api/process-groups/${processGroupId}?clientId=${requestClientId}&version=${version}&disconnectedNodeAcknowledged=false`;
      
      console.log('Deleting process group:', processGroupId);
      console.log('Request URL:', url);

      // Make the DELETE request
      return makeAuthenticatedRequest(url, 'DELETE', undefined, 'Failed to delete process group', false, false);
    } catch (error: any) {
      logDetailedError('Failed to delete process group', error);
      throw error;
    }
  },

  /**
   * Copy a process group
   * @param parentGroupId - The ID of the parent process group where the copy will be placed
   * @param processGroupIds - Array of process group IDs to copy
   */
  copyProcessGroup: async (
    parentGroupId: string,
    processGroupIds: string[]
  ): Promise<any> => {
    try {
      // Prepare the request payload
      const requestData = {
        processGroups: processGroupIds,
      };

      // Build the URL
      const url = `/nifi-api/process-groups/${parentGroupId}/copy`;
      
      console.log('Copying process group(s):', processGroupIds);
      console.log('Request URL:', url);
      console.log('Request data:', requestData);

      // Make the POST request
      return makeAuthenticatedRequest(url, 'POST', requestData, 'Failed to copy process group', false, false);
    } catch (error: any) {
      logDetailedError('Failed to copy process group', error);
      throw error;
    }
  },

  /**
   * Paste a copied process group
   * @param parentGroupId - The ID of the parent process group where the paste will occur
   * @param copyResponse - The copy response object containing process groups and other data
   */
  pasteProcessGroup: async (
    parentGroupId: string,
    copyResponse: any
  ): Promise<any> => {
    try {
      // Get the current revision of the parent process group
      console.log('Fetching current revision for parent group:', parentGroupId);
      const parentGroup = await nifiApiService.getProcessGroup(parentGroupId);
      const currentVersion = parentGroup.revision?.version ?? 0;
      console.log('Current parent group version:', currentVersion);

      // Prepare the request payload with the copyResponse
      const requestData = {
        copyResponse: copyResponse,
        revision: {
          version: currentVersion,
          clientId: getOrGenerateClientId(parentGroup.revision?.clientId)
        },
        disconnectedNodeAcknowledged: false
      };

      // Build the URL
      const url = `/nifi-api/process-groups/${parentGroupId}/paste`;
      
      console.log('Pasting process group(s) to parent:', parentGroupId);
      console.log('Request URL:', url);
      console.log('Request data:', JSON.stringify(requestData, null, 2));

      // Make the PUT request
      return makeAuthenticatedRequest(url, 'PUT', requestData, 'Failed to paste process group', false, false);
    } catch (error: any) {
      logDetailedError('Failed to paste process group', error);
      throw error;
    }
  },

  /**
   * Start a process group (set state to RUNNING)
   * @param processGroupId - The ID of the process group to start
   */
  startProcessGroup: async (processGroupId: string): Promise<any> => {
    return setProcessGroupFlowState(processGroupId, 'RUNNING', true, 'TRANSMITTING', nifiApiService.getProcessGroup);
  },

  /**
   * Stop a process group (set state to STOPPED)
   * @param processGroupId - The ID of the process group to stop
   */
  stopProcessGroup: async (processGroupId: string): Promise<any> => {
    return setProcessGroupFlowState(processGroupId, 'STOPPED', true, 'STOPPED', nifiApiService.getProcessGroup);
  },

  enableProcessGroup: async (processGroupId: string): Promise<any> => {
    return setProcessGroupFlowState(processGroupId, 'ENABLED', false, undefined, nifiApiService.getProcessGroup);
  },

  disableProcessGroup: async (processGroupId: string): Promise<any> => {
    return setProcessGroupFlowState(processGroupId, 'DISABLED', false, undefined, nifiApiService.getProcessGroup);
  },

  /**
   * Analyze controller service configuration
   * @param controllerServiceId - The ID of the controller service
   * @param properties - Optional properties to analyze
   */
  analyzeControllerServiceConfig: async (
    controllerServiceId: string,
    properties: Record<string, any> = {}
  ): Promise<any> => {
    const url = `/nifi-api/controller-services/${controllerServiceId}/config/analysis`;
    const requestData = {
      configurationAnalysis: {
        componentId: controllerServiceId,
        properties: properties
      }
    };
    return makeAuthenticatedRequest(url, 'POST', requestData, 'Failed to analyze controller service configuration', false, false);
  },

  /**
   * Create a verification request for controller service
   * @param controllerServiceId - The ID of the controller service
   * @param properties - Optional properties to verify
   * @param attributes - Optional attributes
   */
  createControllerServiceVerificationRequest: async (
    controllerServiceId: string,
    properties: Record<string, any> = {},
    attributes: Record<string, any> = {}
  ): Promise<any> => {
    const url = `/nifi-api/controller-services/${controllerServiceId}/config/verification-requests`;
    const requestData = {
      request: {
        properties: properties,
        componentId: controllerServiceId,
        attributes: attributes
      }
    };
    const response = await makeAuthenticatedRequest(url, 'POST', requestData, 'Failed to create verification request', false, false);
    // Log response for debugging
    console.log('Create verification request response:', JSON.stringify(response, null, 2));
    return response;
  },

  /**
   * Get verification request status
   * @param controllerServiceId - The ID of the controller service
   * @param requestId - The ID of the verification request
   */
  getControllerServiceVerificationRequest: async (
    controllerServiceId: string,
    requestId: string
  ): Promise<any> => {
    const url = `/nifi-api/controller-services/${controllerServiceId}/config/verification-requests/${requestId}`;
    return makeAuthenticatedRequest(url, 'GET', undefined, 'Failed to get verification request', false, false);
  },

  /**
   * Delete verification request
   * @param controllerServiceId - The ID of the controller service
   * @param requestId - The ID of the verification request
   */
  deleteControllerServiceVerificationRequest: async (
    controllerServiceId: string,
    requestId: string
  ): Promise<any> => {
    const url = `/nifi-api/controller-services/${controllerServiceId}/config/verification-requests/${requestId}`;
    return makeAuthenticatedRequest(url, 'DELETE', undefined, 'Failed to delete verification request', false, false);
  },

  /**
   * Update process group configuration
   * @param processGroupId - The ID of the process group to update
   * @param config - Configuration data to update
   * @param clientId - Client ID for the request (optional, generates UUID if not provided)
   */
  updateProcessGroupConfiguration: async (
    processGroupId: string,
    config: {
      name: string;
      parameterContextId?: string;
      applyRecursively?: boolean;
      executionEngine: string;
      flowFileConcurrency: string;
      defaultFlowFileExpiration: string;
      defaultBackPressureObjectThreshold: string;
      comments?: string;
    },
    clientId?: string
  ): Promise<any> => {
    try {
      // Fetch the current process group to get its revision
      console.log('Fetching current process group for configuration update:', processGroupId);
      const processGroup = await nifiApiService.getProcessGroup(processGroupId);
      
      const version = processGroup.revision?.version ?? 0;
      const currentClientId = processGroup.revision?.clientId;
      console.log('Current version:', version);
      console.log('Current clientId:', currentClientId);

      // Generate a client ID if not provided
      const requestClientId = getOrGenerateClientId(clientId);

      // Map execution engine values
      const mapExecutionEngine = (value: string): string => {
        switch (value.toLowerCase()) {
          case 'inherited':
            return 'INHERITED';
          case 'standard':
            return 'STANDARD';
          case 'stateless':
            return 'STATELESS';
          default:
            return value.toUpperCase();
        }
      };

      // Map flow file concurrency values
      const mapFlowFileConcurrency = (value: string): string => {
        switch (value.toLowerCase()) {
          case 'unbounded':
            return 'UNBOUNDED';
          case 'single flowfile per node':
            return 'SINGLE_FLOWFILE_PER_NODE';
          case 'single batch per node':
            return 'SINGLE_BATCH_PER_NODE';
          default:
            return value.toUpperCase();
        }
      };

      // Build the component object
      const component: any = {
        id: processGroupId,
        name: config.name,
        executionEngine: mapExecutionEngine(config.executionEngine),
        flowfileConcurrency: mapFlowFileConcurrency(config.flowFileConcurrency),
        flowfileOutboundPolicy: 'STREAM_WHEN_AVAILABLE',
        defaultFlowFileExpiration: config.defaultFlowFileExpiration,
        defaultBackPressureObjectThreshold: parseInt(config.defaultBackPressureObjectThreshold, 10) || 10000,
        defaultBackPressureDataSizeThreshold: '1 GB',
        logFileSuffix: null,
        comments: config.comments ?? '',
      };

      // Add parameter context if provided and it's a valid UUID format
      // Parameter context ID must be a UUID, not a name
      // Check if it looks like a UUID (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
      const isValidUUID = (str: string): boolean => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
      };
      
      if (config.parameterContextId && isValidUUID(config.parameterContextId)) {
        component.parameterContext = { id: config.parameterContextId };
      } else {
        // If parameterContextId is provided but not a valid UUID (e.g., it's a name),
        // don't send it - set to null to clear the parameter context
        component.parameterContext = null;
      }

      // Build the request payload
      const requestData: UpdateProcessGroupConfigurationRequest = {
        revision: {
          clientId: requestClientId,
          version: version,
        },
        disconnectedNodeAcknowledged: false,
        processGroupUpdateStrategy: config.applyRecursively ? 'ALL_DESCENDANTS' : 'DIRECT_CHILDREN',
        component: component,
      };

      const url = `/nifi-api/process-groups/${processGroupId}`;
      
      console.log('Updating process group configuration:', processGroupId);
      console.log('Request URL:', url);
      console.log('Request payload:', JSON.stringify(requestData, null, 2));

      const response = await makeAuthenticatedRequest(
        url,
        'PUT',
        requestData,
        'Failed to update process group configuration'
      );

      console.log('Process group configuration updated successfully');
      return response;
    } catch (error: any) {
      logDetailedError('Failed to update process group configuration', error);
      throw error;
    }
  },
};

export default nifiApiService;
