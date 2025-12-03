import { useState, useEffect, useCallback } from 'react';
import { fetchRegionCountryFromApi, transformRegionCountryToDropdownOptions, RegionCountryModel } from '../services/regionCountryService';

interface UseRegionCountryState {
  dropdownOptions: {
    regions: string[];
    countries: string[];
    divisions: string[];
    groups: string[];
    departments: string[];
    classes: string[];
    subClasses: string[];
  };
  loading: boolean;
  error: string | null;
  rawData: RegionCountryModel[];
}

export const useRegionCountry = () => {
  const [state, setState] = useState<UseRegionCountryState>({
    dropdownOptions: {
      regions: [],
      countries: [],
      divisions: [],
      groups: [],
      departments: [],
      classes: [],
      subClasses: [],
    },
    loading: false,
    error: null,
    rawData: [],
  });

  // Load region country data from API
  const loadRegionCountry = useCallback(async () => {
    console.log('useRegionCountry: Starting to load region country data...');
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const rawData = await fetchRegionCountryFromApi();
      console.log('useRegionCountry: Raw data received:', rawData);
      
      // Check if we have valid raw data
      if (!Array.isArray(rawData) || rawData.length === 0) {
        console.warn('useRegionCountry: No data received from API');
        setState(prev => ({
          ...prev,
          dropdownOptions: {
            regions: [],
            countries: [],
            divisions: [],
            groups: [],
            departments: [],
            classes: [],
            subClasses: [],
          },
          rawData: [],
          loading: false,
          error: 'No data available from API',
        }));
        return;
      }
      
      const dropdownOptions = transformRegionCountryToDropdownOptions(rawData);
      console.log('useRegionCountry: Transformed dropdown options:', dropdownOptions);
      
      // Check if we have valid dropdown options
      const hasOptions = Object.values(dropdownOptions).some(options => Array.isArray(options) && options.length > 0);
      
      if (!hasOptions) {
        console.warn('useRegionCountry: No valid dropdown options generated');
        setState(prev => ({
          ...prev,
          dropdownOptions: {
            regions: [],
            countries: [],
            divisions: [],
            groups: [],
            departments: [],
            classes: [],
            subClasses: [],
          },
          rawData: [],
          loading: false,
          error: 'No valid options available',
        }));
        return;
      }
      
      setState(prev => ({
        ...prev,
        dropdownOptions,
        rawData,
        loading: false,
        error: null,
      }));
      console.log('useRegionCountry: Successfully loaded data');
    } catch (error: any) {
      console.error('useRegionCountry: Error fetching region country data:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: `Failed to load data: ${error.message}`,
        dropdownOptions: {
          regions: [],
          countries: [],
          divisions: [],
          groups: [],
          departments: [],
          classes: [],
          subClasses: [],
        },
        rawData: [],
      }));
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadRegionCountry();
  }, [loadRegionCountry]);

  return {
    ...state,
    loadRegionCountry,
  };
};
