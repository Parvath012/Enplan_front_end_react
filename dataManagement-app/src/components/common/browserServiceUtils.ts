import { nifiApiService } from '../../api/nifi/nifiApiService';
import { userProcessGroupMappingService } from '../../services/userProcessGroupMapping';

/**
 * Get process group ID with fallback logic
 * @param parentGroupId - Optional parent group ID to use if provided
 * @returns Promise resolving to process group ID
 */
export const getProcessGroupId = async (parentGroupId?: string): Promise<string> => {
  if (parentGroupId) {
    console.log('Using provided parent process group ID:', parentGroupId);
    return parentGroupId;
  }
  
  // Fallback to root process group if no parent group is provided
  try {
    return await nifiApiService.getRootProcessGroupId();
  } catch (error) {
    try {
      return await nifiApiService.getRootProcessGroupId(true);
    } catch (retryError) {
      try {
        return await userProcessGroupMappingService.getDefaultProcessGroupId();
      } catch (fallbackError) {
        throw new Error('Unable to fetch process group ID. Please ensure NiFi is accessible.');
      }
    }
  }
};

/**
 * Create a service selection handler
 */
export const createServiceSelectHandler = <T extends { id: string; type?: string; fullType?: string; version?: string; tags?: string[]; description?: string; restricted?: boolean; bundle?: any }>(
  setSelectedItem: (item: T) => void
) => {
  return (service: T) => {
    if (!service?.id) {
      return;
    }
    
    // Use the service data directly from the row - it's already the correct data
    // Just ensure we have all the necessary fields
    const selectedServiceData: T = {
      id: service.id,
      type: service.type ?? '',
      fullType: service.fullType ?? service.type ?? '',
      version: service.version ?? '2.3.0',
      tags: service.tags ?? [],
      description: service.description ?? '',
      restricted: service.restricted ?? false,
      bundle: service.bundle
    } as T;
    
    // Always select the service (no toggle - clicking same row keeps it selected)
    setSelectedItem(selectedServiceData);
  };
};

