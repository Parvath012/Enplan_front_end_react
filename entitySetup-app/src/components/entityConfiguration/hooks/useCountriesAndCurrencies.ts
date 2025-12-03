import { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchEntitiesFromApi } from '../../../services/entitySetupService';
import { stripQuotes, parseMaybeJson } from '../../../utils/jsonParsingUtils';
import {
  setSelectedCountries,
  setSelectedCurrencies,
  setDefaultCurrency,
  setIsDefaultCurrency,
  setOriginalData,
  setDataModified,
  setDataSaved,
  toggleCountry,
  toggleCurrency,
  setDefaultCurrencyAction
} from '../../../store/Actions/entityConfigurationActions';

export const useCountriesAndCurrencies = (entityId?: string) => {
  const dispatch = useDispatch();
  const [countrySearch, setCountrySearch] = useState("");
  const [currencySearch, setCurrencySearch] = useState("");
  const [allCountries, setAllCountries] = useState<string[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [hasFetchedData, setHasFetchedData] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const currenciesFetchedRef = useRef(false);

  // Reset hasFetchedData flag when entityId changes to ensure data is loaded for each entity
  useEffect(() => {
    setHasFetchedData(false);
    setIsLoadingData(true);
  }, [entityId]);

  // Parse countries data from entity
  const parseCountriesData = useCallback((currentEntity: any): string[] => {
    let savedCountries: string[] = [];
    
    console.log('🔍 Parsing countries data:', {
      countries: currentEntity.countries,
      type: typeof currentEntity.countries
    });
    
    // Parse countries data - handle both object and string formats
    const countriesData = typeof currentEntity.countries === 'string' 
      ? parseMaybeJson(stripQuotes(currentEntity.countries as string))
      : currentEntity.countries;
    
    console.log('🔍 Parsed countries data:', countriesData);
    
    if (countriesData && typeof countriesData === 'object') {
      if (countriesData.selectedCountries && Array.isArray(countriesData.selectedCountries)) {
        savedCountries = countriesData.selectedCountries;
      }
    }
    
    // Handle entity's country from setup form with smart deduplication
    if (currentEntity.country) {
      const currentEntityCountry = currentEntity.country;
      
      // Check if we have saved countries data from manual selections
      const hasManualSelections = countriesData?.selectedCountries && Array.isArray(countriesData.selectedCountries);
      
      if (hasManualSelections && savedCountries.length > 0) {
        // We have existing selections - ensure no duplicates and current country is included
        
        // Remove any duplicate of the current entity country first
        savedCountries = savedCountries.filter(country => country !== currentEntityCountry);
        
        // Add current entity country at the beginning
        savedCountries = [currentEntityCountry, ...savedCountries];
        
       
      } else {
        // No manual selections or empty list - use only current entity country
        savedCountries = [currentEntityCountry];
        
       
      }
    }
    
    return savedCountries;
  }, []);

  // Helper function to parse currencies data from entity
  const parseCurrenciesDataFromEntity = useCallback((currenciesData: any) => {
    let savedCurrencies: string[] = [];
    let savedDefaultCurrency: string[] = [];
    let savedIsDefault: string | null = null;
    let isInitialCurrency = false;
    let isSaved = false;

    // Parse selected currencies
    if (currenciesData.selectedCurrencies !== undefined && Array.isArray(currenciesData.selectedCurrencies)) {
      savedCurrencies = currenciesData.selectedCurrencies;
      console.log('✅ Found selectedCurrencies:', savedCurrencies);
    }

    // Parse default currency
    if (currenciesData.defaultCurrency !== undefined) {
      savedDefaultCurrency = Array.isArray(currenciesData.defaultCurrency) 
        ? currenciesData.defaultCurrency 
        : [currenciesData.defaultCurrency];
      console.log('✅ Found defaultCurrency:', savedDefaultCurrency);
    }

    // Parse isDefault
    if (currenciesData.isDefault !== undefined) {
      savedIsDefault = currenciesData.isDefault;
      console.log('✅ Found isDefault:', savedIsDefault);
    }

    // Check if this is initial currency from entity setup
    isInitialCurrency = currenciesData.initialCurrency === true;
    console.log('✅ Found isInitialCurrency:', isInitialCurrency);

    
    if (currenciesData.isSaved !== undefined) {
      isSaved = currenciesData.isSaved === true;
      console.log('✅ Found isSaved:', isSaved, 'from currenciesData.isSaved:', currenciesData.isSaved);
    } else {
      const hasActualData = (savedCurrencies.length > 0) || (savedDefaultCurrency.length > 0) || (savedIsDefault !== null);
      isSaved = hasActualData;
    }

    return { savedCurrencies, savedDefaultCurrency, savedIsDefault, isInitialCurrency, isSaved };
  }, []);

  // Parse currencies data from entity
  const parseCurrenciesData = useCallback((currentEntity: any): { currencies: string[], defaultCurrency: string[], isDefault: string | null, isInitialCurrency: boolean, isSaved: boolean } => {
    console.log('🔍 parseCurrenciesData called with entity:', {
      entityId: currentEntity.id,
      currencies: currentEntity.currencies
    });
    
    if (!currentEntity.currencies) {
      return { currencies: [], defaultCurrency: [], isDefault: null, isInitialCurrency: false, isSaved: false };
    }

    try {
      // Parse currencies data using the same logic as countryStateService.ts
      const currenciesData = typeof currentEntity.currencies === 'object' 
        ? currentEntity.currencies 
        : parseMaybeJson(stripQuotes(currentEntity.currencies as string));
      
      const { savedCurrencies, savedDefaultCurrency, savedIsDefault, isInitialCurrency, isSaved } = parseCurrenciesDataFromEntity(currenciesData);
      
      console.log('🔍 parseCurrenciesData returning:', {
        currencies: savedCurrencies,
        defaultCurrency: savedDefaultCurrency,
        isDefault: savedIsDefault,
        isInitialCurrency,
        isSaved
      });
      
      return { currencies: savedCurrencies, defaultCurrency: savedDefaultCurrency, isDefault: savedIsDefault, isInitialCurrency, isSaved };
    } catch (error) {
      console.error('Error parsing currencies data:', error);
      return { currencies: [], defaultCurrency: [], isDefault: null, isInitialCurrency: false, isSaved: false };
    }
  }, [parseCurrenciesDataFromEntity]);

  // Dispatch saved data to Redux store
  const dispatchSavedData = useCallback((entityId: string, countries: string[], currencies: string[], defaultCurrency: string[], isDefault: string | null, isUserSavedData: boolean = false) => {
    console.log('🚀 dispatchSavedData called with:', {
      entityId,
      countries,
      currencies,
      defaultCurrency,
      isDefault,
      isUserSavedData
    });
    
    // Set the data directly without triggering modification state
    dispatch(setSelectedCountries({ entityId, countries }));
    dispatch(setSelectedCurrencies({ entityId, currencies }));
    dispatch(setDefaultCurrency({ entityId, defaultCurrency }));
    dispatch(setIsDefaultCurrency({ entityId, isDefault }));
    
    console.log('🚀 Dispatched Redux actions for:', {
      setSelectedCountries: countries,
      setSelectedCurrencies: currencies,
      setDefaultCurrency: defaultCurrency,
      setIsDefaultCurrency: isDefault
    });
    
    // Set the original data for reset functionality
    dispatch(setOriginalData({
      entityId,
      data: {
        countries: [...countries],
        currencies: [...currencies],
        defaultCurrency,
        isDefault,
      }
    }));
    
    // Mark as not modified since we're loading saved data
    dispatch(setDataModified({ entityId, isModified: false }));
    
    // Only mark as saved if this is actual user-saved data, not pre-populated data
    dispatch(setDataSaved({ entityId, isSaved: isUserSavedData }));
    
    // Mark that we've fetched data for this entity
    setHasFetchedData(true);
  }, [dispatch]);

  // Fetch saved countries and currencies from entity
  const fetchSavedData = useCallback(async () => {
    console.log('🚀 fetchSavedData called for entityId:', entityId);
    
    if (!entityId) {
      console.log('❌ No entityId, skipping fetchSavedData');
      setIsLoadingData(false);
      return;
    }

    try {
      setIsLoadingData(true);
      
      // Fetch all entities to find the current one
      const entities = await fetchEntitiesFromApi();
      const currentEntity = entities.find(e => e.id === entityId);
      
      console.log('🚀 Found currentEntity:', currentEntity);
      
      if (currentEntity) {
        const savedCountries = parseCountriesData(currentEntity);
        const { currencies: savedCurrencies, defaultCurrency: savedDefaultCurrency, isDefault: savedIsDefault, isSaved: currenciesIsSaved } = parseCurrenciesData(currentEntity);
        
        console.log('🚀 Parsed data:', {
          savedCountries,
          savedCurrencies,
          savedDefaultCurrency,
          savedIsDefault,
          currenciesIsSaved
        });
        
        // Use the isSaved field from currencies data to determine if data has been saved
        dispatchSavedData(entityId, savedCountries, savedCurrencies, savedDefaultCurrency, savedIsDefault, currenciesIsSaved);
      } else {
        console.log('❌ No currentEntity found for entityId:', entityId);
      }
    } catch (error) {
      console.error('Error fetching saved data:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [entityId, dispatch, parseCountriesData, parseCurrenciesData, dispatchSavedData]);

  // Handle country toggle
  const handleCountryToggle = useCallback((country: string) => {
    const entityId = window.location.pathname.split('/').pop() ?? '';
    dispatch<any>(toggleCountry(country, entityId));
  }, [dispatch]);

  // Handle currency toggle
  const handleCurrencyToggle = useCallback((currencyCode: string) => {
    const entityId = window.location.pathname.split('/').pop() ?? '';
    dispatch<any>(toggleCurrency(currencyCode, entityId));
  }, [dispatch]);

  // Handle set default currency
  const handleSetDefaultCurrency = useCallback((currencyCode: string) => {
    const entityId = window.location.pathname.split('/').pop() ?? '';
    dispatch<any>(setDefaultCurrencyAction(currencyCode, entityId));
  }, [dispatch]);

  return {
    countrySearch,
    setCountrySearch,
    currencySearch,
    setCurrencySearch,
    allCountries,
    setAllCountries,
    isLoadingCountries,
    setIsLoadingCountries,
    hasFetchedData,
    setHasFetchedData,
    isLoadingData,
    setIsLoadingData,
    currenciesFetchedRef,
    fetchSavedData,
    handleCountryToggle,
    handleCurrencyToggle,
    handleSetDefaultCurrency
  };
};
