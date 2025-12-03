import { useEffect } from 'react';

// Custom hook to manage progress calculation effects
export const useProgressCalculationEffects = (params: {
  calculateProgressPercentage: () => number;
  setProgress: (progress: number) => void;
}) => {
  const {
    calculateProgressPercentage,
    setProgress
  } = params;

  // Update progress whenever entity data changes or progress calculation function changes
  // This ensures progress updates when Redux state (selectedCountries, selectedCurrencies) changes
  useEffect(() => {
    const newProgress = calculateProgressPercentage();
    setProgress(newProgress);
  }, [calculateProgressPercentage, setProgress]);
};
