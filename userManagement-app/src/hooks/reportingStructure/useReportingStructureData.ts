/**
 * Reporting Structure Data Hook
 * Handles data fetching and state management
 */

import { useSelector } from 'react-redux';
import type { RootState } from '../../store/configureStore';

export const useReportingStructureData = () => {
  const hierarchy = useSelector((state: RootState) => state.users.hierarchy);
  const hierarchyLoading = useSelector((state: RootState) => state.users.hierarchyLoading);
  const hierarchyError = useSelector((state: RootState) => state.users.hierarchyError);

  return {
    hierarchy,
    hierarchyLoading,
    hierarchyError,
  };
};

