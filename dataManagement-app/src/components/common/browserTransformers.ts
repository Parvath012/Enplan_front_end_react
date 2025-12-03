import { generateTags, extractDescription } from './browserUtils';

/**
 * Factory function to create a transformApiResponse function
 * @param responseKey - The key in the API response (e.g., 'processorTypes' or 'controllerServiceTypes')
 * @param idPrefix - The prefix for generated IDs (e.g., 'proc-' or 'cst-')
 */
export const createTransformApiResponse = <T extends { id: string; type: string; fullType: string; version: string; tags: string[]; description: string; restricted: boolean; bundle?: any }>(
  responseKey: string,
  idPrefix: string
) => {
  return (apiResponse: any): T[] => {
    if (!apiResponse?.[responseKey]) {
      return [];
    }

    // Use a Map to track IDs and ensure uniqueness
    const idMap = new Map<string, number>();
    
    return apiResponse[responseKey].map((serviceType: any) => {
      const bundle = serviceType.bundle ?? {};
      const fullType = serviceType.type ?? '';
      const typeName = fullType.split('.').pop() ?? fullType;
      const tags = generateTags(serviceType, typeName, bundle);
      
      // Generate stable ID based on fullType and bundle, not array index
      // This ensures IDs remain consistent even when list is filtered/sorted
      const idBase = `${fullType}-${bundle.group || ''}-${bundle.artifact || ''}-${bundle.version || ''}`;
      let idBaseNormalized = idBase.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/(^-|-$)/g, '');
      
      // Ensure uniqueness by appending index if duplicate
      if (idMap.has(idBaseNormalized)) {
        const count = idMap.get(idBaseNormalized)!;
        idMap.set(idBaseNormalized, count + 1);
        idBaseNormalized = `${idBaseNormalized}-${count}`;
      } else {
        idMap.set(idBaseNormalized, 1);
      }
      
      const id = `${idPrefix}${idBaseNormalized}`;
      const description = extractDescription(serviceType);
      
      return {
        id,
        type: typeName,
        fullType,
        version: bundle.version ?? '2.3.0',
        tags,
        description,
        restricted: serviceType.restricted ?? false,
        bundle: bundle.version ? {
          group: bundle.group ?? '',
          artifact: bundle.artifact ?? '',
          version: bundle.version
        } : undefined
      } as T;
    });
  };
};

