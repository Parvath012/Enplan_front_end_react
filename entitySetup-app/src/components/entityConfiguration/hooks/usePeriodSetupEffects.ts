import { useCallback } from 'react';

// Custom hook to manage period setup effects
export const usePeriodSetupEffects = (params: {
  onDataChange?: ((hasChanges: boolean) => void) | null;
  onDataLoaded?: ((hasData: boolean) => void) | null;
}) => {
  const { onDataChange, onDataLoaded } = params;

  // Handle data changes
  const handlePeriodSetupDataChange = useCallback((hasChanges: boolean) => {
    if (onDataChange) {
      onDataChange(hasChanges);
    }
  }, [onDataChange]);

  // Handle data loaded
  const handlePeriodSetupDataLoaded = useCallback((hasData: boolean) => {
    if (onDataLoaded) {
      onDataLoaded(hasData);
    }
  }, [onDataLoaded]);

  return {
    handlePeriodSetupDataChange,
    handlePeriodSetupDataLoaded
  };
};
