import { useSelector } from 'react-redux';
import { useParams, useLocation } from 'react-router-dom';
import type { RootState } from '../../../store/configureStore';
import { getEntityConfigurationState } from '../../../utils/entityConfigurationStateUtils';

// Custom hook to manage entity data
export const useEntityData = () => {
  // Extract entity ID from URL parameters or pathname
  const params = useParams<{ entityId: string }>();
  const location = useLocation();
  
  const paramEntityId = params?.entityId;
  // Only use pathname as fallback when params.entityId is undefined
  const pathnameEntityId = location?.pathname?.split('/')?.pop() ?? '';
  const entityId = paramEntityId ?? pathnameEntityId;

  // Get entity configuration state with fallback
  const entityConfiguration = useSelector((state: RootState) => {
    return getEntityConfigurationState(state, entityId || null);
  });

  // Get period setup with fallback to empty object
  const periodSetup = useSelector((state: RootState) => state?.periodSetup ?? {});

  // Extract entity data with safe handling of undefined values
  const { entity, entitiesCount, isLoading } = useSelector((state: RootState) => {
    // Safely handle cases where state.entities or state.entities.items is undefined
    const items = state?.entities?.items || [];
    const foundEntity = items.find(item => item?.id === entityId);
    
    return {
      entity: foundEntity,
      entitiesCount: items.length,
      isLoading: state?.entities?.loading || false,
    };
  });

  // Safely determine if it's a rollup entity
  const isRollupEntity = entity?.entityType?.toLowerCase?.()?.includes('rollup') || false;

  return {
    entityId,
    entityConfiguration,
    periodSetup,
    entity,
    entitiesCount,
    isLoading,
    isRollupEntity,
  };
};
