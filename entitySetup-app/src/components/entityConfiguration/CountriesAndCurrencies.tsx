import React, { useEffect, useMemo, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Typography } from "@mui/material";
import type { RootState } from "../../store/configureStore";

import { fetchCountryStateMap } from "../../services/countryStateService";
import { setSelectedCountries, setSelectedCurrencies, setDefaultCurrency, setIsDefaultCurrency } from "../../store/Actions/entityConfigurationActions";
import { fetchEntities } from "../../store/Reducers/entitySlice";
import { stripQuotes, parseMaybeJson } from "../../utils/jsonParsingUtils";
import CountriesList from "./countries/CountriesList";
import SelectedCountriesGrid from "./countries/SelectedCountriesGrid";
import CurrenciesList from "./currencies/CurrenciesList";
import SelectedCurrenciesGrid from "./currencies/SelectedCurrenciesGrid";
import { useCountriesAndCurrencies } from "./hooks/useCountriesAndCurrencies";
// Module Federation imports
import { entityConfigurationStyles } from "./styles";

interface CountriesAndCurrenciesProps {
  isEditMode: boolean;
  entityId?: string;
  onDataChange?: (hasChanges: boolean) => void;
  onDataLoaded?: (hasData: boolean) => void;
}

const CountriesAndCurrencies: React.FC<CountriesAndCurrenciesProps> = ({
  isEditMode,
  entityId,
  onDataChange,
  onDataLoaded,
}) => {

  const dispatch = useDispatch();

  
  // Local state for currencies from country-state service
  const [currencies, setCurrencies] = useState<Array<{id: string, currencyName: string}>>([]);

  // Loading states for selected grids
  const [isLoadingSelectedCountries, setIsLoadingSelectedCountries] = useState<boolean>(false);
  const [isLoadingSelectedCurrencies, setIsLoadingSelectedCurrencies] = useState<boolean>(false);

  // Ref to track if we've already auto-selected currencies to prevent loops
  const hasAutoSelectedRef = useRef(false);

  // Reset auto-selection flag when entityId changes
  useEffect(() => {
    hasAutoSelectedRef.current = false;
  }, [entityId]);

  // Ensure entities are loaded after refresh so entity sync can work
  const { entitiesLoaded } = useSelector((state: RootState) => ({
    entitiesLoaded: state.entities.items.length > 0
  }));

  useEffect(() => {
    if (!entitiesLoaded && entityId) {
      console.log('🔄 Loading entities because they are not available after refresh');
      dispatch(fetchEntities());
    }
  }, [entitiesLoaded, entityId, dispatch]);

  const {
    selectedCountries,
    selectedCurrencies,
    defaultCurrency,
    isDefault,
    isDataModified
  } = useSelector((state: RootState) => {
    const entityId = window.location.pathname.split('/').pop();
    if (!entityId) {
      return {
        selectedCountries: [],
        selectedCurrencies: [],
        defaultCurrency: null,
        isDefault: null,
        isDataModified: false
      };
    }
    return state.entityConfiguration[entityId] || {
      selectedCountries: [],
      selectedCurrencies: [],
      defaultCurrency: null,
      isDefault: null,
      isDataModified: false
    };
  });

  // Get entity data to extract pre-populated country
  const { entity } = useSelector((state: RootState) => {
    const entityId = window.location.pathname.split('/').pop();
    console.log('Entity selector - entityId:', entityId);
    console.log('Entity selector - state.entities.items:', state.entities.items);
    console.log('Entity selector - state.entities.items.length:', state.entities.items?.length);

    if (!entityId) {
      console.log('Entity selector - no entityId found');
      return { entity: null };
    }

    const foundEntity = state.entities.items.find(item => item.id === entityId);
    console.log('Entity selector - foundEntity:', foundEntity);
    console.log('Entity selector - foundEntity.currencies:', foundEntity?.currencies);

    return {
      entity: foundEntity || null
    };
  });

  // Pre-populated data from entity setup
  const prePopulatedCountries: string[] = entity?.country ? [entity.country] : [];

  console.log('About to calculate prePopulatedCurrencies, entity:', entity);


  // Parse pre-populated currencies from entity setup
  const prePopulatedCurrencies: string[] = useMemo(() => {
    console.log('=== Pre-populated currencies calculation ===');
    console.log('entity:', entity);
    console.log('entity?.currencies:', entity?.currencies);
    console.log('entity?.id:', entity?.id);

    if (!entity?.currencies) {
      console.log('❌ No entity currencies found');
      return [];
    }

    try {
      console.log('Original entity.currencies:', entity.currencies);

      // Handle both string and object cases for entity.currencies
      let currenciesData: any;

      if (typeof entity.currencies === 'object' && entity.currencies !== null) {
        // Already an object, use it directly
        currenciesData = entity.currencies;
        console.log('Entity currencies is already an object:', currenciesData);
      } else {
        // It's a string, strip quotes and parse JSON
        const strippedCurrencies = stripQuotes(entity.currencies as string);
        console.log('Stripped currencies:', strippedCurrencies);
        currenciesData = parseMaybeJson(strippedCurrencies);
        console.log('Parsed currencies data:', currenciesData);
      }

      console.log('Final currencies data:', currenciesData);
      console.log('Final currencies data keys:', Object.keys(currenciesData));
      console.log('Final currencies data.initialCurrency:', currenciesData.initialCurrency);
      console.log('Final currencies data["initialCurrency"]:', currenciesData["initialCurrency"]);
      console.log('initialCurrency value:', currenciesData.initialCurrency, 'type:', typeof currenciesData.initialCurrency);

      // For the new data structure:
      // - defaultCurrency: Array of currencies that cannot be deleted/unchecked
      // - selectedCurrencies: Array of currencies that can be edited by users
      // - isDefault: Single currency that can be selected from either list

      // We don't need prePopulatedCurrencies anymore since we handle this differently
      // defaultCurrency and selectedCurrencies are handled directly in the UI components
      const prePopulated: string[] = [];

      console.log('✅ New data structure - defaultCurrency:', currenciesData.defaultCurrency, 'selectedCurrencies:', currenciesData.selectedCurrencies);

      console.log('✅ Final pre-populated currencies (only selectedCurrencies):', prePopulated);
      return prePopulated;
    } catch (error) {
      console.error('❌ Error parsing currencies data:', error);
      return [];
    }
  }, [entity?.currencies, entity?.id]);

  // Both arrays come from Redux state and are already properly formatted
  const allSelectedCurrencies = useMemo(() => {
    const defaultCurrencies = defaultCurrency ?? [];
    const userSelectedCurrencies = selectedCurrencies.filter(currency =>
      !defaultCurrencies.includes(currency)
    );
    const combined = [
      ...defaultCurrencies,
      ...userSelectedCurrencies,
    ];


    if (isDefault && !combined.includes(isDefault)) {
      combined.push(isDefault);
    }

    console.log('Combined currencies for display:', {
      selectedCurrencies,
      defaultCurrency,
      isDefault,
      combined,
      selectedCurrenciesLength: selectedCurrencies.length,
      defaultCurrencyLength: defaultCurrencies.length,

      combinedLength: combined.length
    });
    return combined;
  }, [selectedCurrencies, defaultCurrency, isDefault]);
  // Use custom hook for countries and currencies logic

  const {
    countrySearch,
    setCountrySearch,
    currencySearch,
    setCurrencySearch,
    allCountries,
    setAllCountries,
    isLoadingCountries,
    setIsLoadingCountries,
    hasFetchedData,
    isLoadingData,
    setIsLoadingData,
    currenciesFetchedRef,
    fetchSavedData,
    handleCountryToggle,
    handleCurrencyToggle,
    handleSetDefaultCurrency
  } = useCountriesAndCurrencies(entityId);

  // Manage loading state for selected countries when data is changing
  useEffect(() => {
    if (selectedCountries.length > 0) {
      setIsLoadingSelectedCountries(true);
      const timer = setTimeout(() => {
        setIsLoadingSelectedCountries(false);
      }, 300); // Short delay to show loading state when delete icons are being processed
      return () => clearTimeout(timer);
    } else {
      setIsLoadingSelectedCountries(false);
    }
  }, [selectedCountries]);

  // Manage loading state for selected currencies when data is changing
  useEffect(() => {
    if (selectedCurrencies.length > 0 || (defaultCurrency && defaultCurrency.length > 0)) {
      setIsLoadingSelectedCurrencies(true);
      const timer = setTimeout(() => {
        setIsLoadingSelectedCurrencies(false);
      }, 300); // Short delay to show loading state when delete icons are being processed
      return () => clearTimeout(timer);
    } else {
      setIsLoadingSelectedCurrencies(false);
    }
  }, [selectedCurrencies, defaultCurrency]);

  // --- FIX: Targeted sync that only adds entity country if completely missing ---
  useEffect(() => {
    if (entity?.country && entityId && hasFetchedData && !isLoadingData && Array.isArray(selectedCountries)) {
      const currentEntityCountry = entity.country;
      
      console.log('🔍 Targeted country sync check:', {
        entityId,
        currentEntityCountry,
        selectedCountries,
        isLoadingData,
        hasFetchedData
      });
      
      // Only ensure entity country is included if it's completely missing AND we have fetched data
      const entityCountryMissing = !(selectedCountries as string[]).includes(currentEntityCountry);
      
      if (entityCountryMissing) {
        console.log('🔄 Adding missing entity country (targeted sync):', {
          entityId,
          currentEntityCountry,
          currentSelectedCountries: selectedCountries,
          action: 'add_entity_country_targeted'
        });
        
        // Add the entity country at the beginning
        const updatedCountries = [currentEntityCountry, ...(selectedCountries as string[])];
        dispatch(setSelectedCountries({ entityId, countries: updatedCountries }));
      }
    }
  }, [entity?.country, entityId, hasFetchedData, dispatch, isLoadingData]);
  
  // --- Removed aggressive cleanup that was interfering with manual selections ---
  // The cleanup logic was too aggressive and was removing manually selected countries
  // Instead, we rely on the fetchSavedData function to load the correct data from the API

  // Notify parent component of data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange(isDataModified);
    }
  }, [isDataModified, onDataChange]);

  // Notify parent component when data is loaded
  useEffect(() => {
    if (onDataLoaded && hasFetchedData) {
      const hasData = selectedCountries.length > 0 || selectedCurrencies.length > 0;
      onDataLoaded(hasData);
    }
  }, [hasFetchedData, selectedCountries.length, selectedCurrencies.length, onDataLoaded]);

  // Helper function to extract currencies from country data
  const extractCurrenciesFromCountryData = (countryStateMap: Record<string, { states: string[]; currencies: string[] }>): string[] => {
    const allCurrenciesSet = new Set<string>();
    Object.values(countryStateMap).forEach(countryData => {
      countryData.currencies.forEach(currency => allCurrenciesSet.add(currency));
    });
    return Array.from(allCurrenciesSet);
  };

  // Helper function to process currencies into the required format
  const processCurrencies = (currencies: string[]) => {
    // Sort currencies first, then map to required format
    const sortedCurrencies = currencies.toSorted((a, b) => a.localeCompare(b));
    return sortedCurrencies.map((currencyName) => ({
      id: currencyName, // Use currency name directly as id
      currencyName: currencyName // Use currency name directly
    }));
  };

  // Fetch countries and currencies from the service
  useEffect(() => {
    const loadCountriesAndCurrencies = async () => {
      try {
        setIsLoadingCountries(true);
        const countryStateMap = await fetchCountryStateMap();
        const countries = Object.keys(countryStateMap).sort((a, b) => a.localeCompare(b));
        setAllCountries(countries);

        // Extract and process currencies
        const allCurrencies = extractCurrenciesFromCountryData(countryStateMap);
        const uniqueCurrencies = processCurrencies(allCurrencies);

        console.log('Loaded currencies from country-state service:', uniqueCurrencies);
        setCurrencies(uniqueCurrencies);
      } catch (error) {
        console.error('Error loading countries and currencies:', error);
        setAllCountries([]);
        setCurrencies([]);
      } finally {
        setIsLoadingCountries(false);
      }
    };

    loadCountriesAndCurrencies();
  }, []); // Empty dependency array to run only once on mount

  // Mark currencies as fetched since we're loading them from country-state service
  useEffect(() => {
    if (currencies.length > 0) {
      currenciesFetchedRef.current = true;
    }
  }, [currencies.length]);

  // Initialize currencies from entity data if available - DISABLED to prevent conflicts with auto-selection
  // useEffect(() => {
  //   console.log('Currency initialization effect:', {
  //     entityId,
  //     prePopulatedCurrenciesLength: prePopulatedCurrencies.length,
  //     selectedCurrenciesLength: selectedCurrencies.length,
  //     hasEntityCurrencies: !!entity?.currencies,
  //     currenciesLength: currencies.length
  //   });
  //   
  //   if (entityId && prePopulatedCurrencies.length > 0 && selectedCurrencies.length === 0 && currencies.length > 0) {
  //     // Parse the entity currencies to get default currency
  //     if (entity?.currencies) {
  //       try {
  //         const currenciesData = typeof entity.currencies === 'string' 
  //           ? JSON.parse(entity.currencies) 
  //           : entity.currencies;
  //         
  //         console.log('Initializing currencies from entity:', currenciesData);
  //         
  //         if (currenciesData.initialCurrency && currenciesData.selectedCurrencies) {
  //           console.log('Dispatching currencies to Redux:', currenciesData.selectedCurrencies);
  //           console.log('Available currencies for matching:', currencies.map(c => ({ id: c.id, name: c.currencyName })));
  //           
  //           // Use currency names directly since we're using currency names as IDs
  //           const validCurrencies = currenciesData.selectedCurrencies
  //             .filter((currencyName: string) => {
  //               const exists = currencies.some(c => c.currencyName === currencyName);
  //               console.log(`Currency initialization - checking "${currencyName}":`, exists);
  //               if (!exists) {
  //                 console.log('Available currencies for initialization:', currencies.map(c => c.currencyName));
  //               }
  //               return exists;
  //             });
  //           
  //           console.log('Valid currencies found:', validCurrencies);
  //           
  //           if (validCurrencies.length > 0) {
  //             dispatch(setSelectedCurrencies({ entityId, currencies: validCurrencies }));
  //             
  //             // Set default currency using currency name
  //             if (currenciesData.defaultCurrency) {
  //               const defaultExists = currencies.some(c => c.currencyName === currenciesData.defaultCurrency);
  //               if (defaultExists) {
  //                 dispatch(setDefaultCurrency({ entityId, defaultCurrency: currenciesData.defaultCurrency }));
  //               }
  //             }
  //           } else {
  //             console.warn('No valid currencies found for names:', currenciesData.selectedCurrencies);
  //           }
  //         }
  //       } catch (error) {
  //         console.error('Error parsing entity currencies:', error);
  //       }
  //     }
  //   }
  // }, [entityId, prePopulatedCurrencies.length, selectedCurrencies.length, entity?.currencies, dispatch, currencies.length]);

  // Initialize currencies from entity data with new structure
  useEffect(() => {
    // Only run if we haven't initialized yet and have entity data
    if (!hasAutoSelectedRef.current && entity?.currencies && currencies.length > 0) {
      try {

        const currenciesData = typeof entity.currencies === 'object'
          ? entity.currencies
          : parseMaybeJson(stripQuotes(entity.currencies as string));

        console.log('🔄 Initializing currencies from entity data:', currenciesData);

        // Initialize with the new data structure
        const defaultCurrencies = currenciesData.defaultCurrency ?? [];
        const selectedCurrencies = currenciesData.selectedCurrencies ?? [];
        const isDefault = currenciesData.isDefault ?? null;

        // Dispatch to Redux
        dispatch(setDefaultCurrency({ entityId: entityId ?? '', defaultCurrency: defaultCurrencies }));
        dispatch(setSelectedCurrencies({ entityId: entityId ?? '', currencies: selectedCurrencies }));
        if (isDefault) {
          dispatch(setIsDefaultCurrency({ entityId: entityId ?? '', isDefault: isDefault }));
        }

        // Mark as initialized
        hasAutoSelectedRef.current = true;

        console.log('✅ Currency initialization completed:', {
          defaultCurrency: defaultCurrencies,
          selectedCurrencies: selectedCurrencies,
          isDefault: isDefault
        });
      } catch (error) {
        console.error('❌ Error initializing currencies from entity data:', error);
      }
    }
  }, [entity?.currencies, currencies.length, entityId, dispatch]);

  // Fetch saved countries and currencies on component mount - trigger when no data is loaded for this entity
  useEffect(() => {
    console.log('🔄 useEffect for fetchSavedData triggered:', {
      entityId,
      selectedCountriesLength: selectedCountries.length,
      selectedCurrenciesLength: selectedCurrencies.length,
      defaultCurrencyLength: (defaultCurrency ?? []).length,
      hasAutoSelectedRef: hasAutoSelectedRef.current,
      hasFetchedData,
      entitiesLoaded,
      willCallFetchSavedData: entityId && entitiesLoaded && !hasFetchedData
    });

    // Call fetchSavedData if:
    // 1. We have an entityId
    // 2. Entities are loaded (so the sync mechanism can work)
    // 3. We haven't fetched data yet for this specific entity
    if (entityId && entitiesLoaded && !hasFetchedData) {
      console.log('✅ Calling fetchSavedData for navigation to Countries & Currencies');
      fetchSavedData();
    } else {
      console.log('❌ Not calling fetchSavedData - conditions not met');
    }
  }, [entityId, entitiesLoaded, hasFetchedData, fetchSavedData]);

  // Handle loading state when no entity ID or data is already available
  useEffect(() => {
    if (!entityId || hasFetchedData || (selectedCountries.length > 0 || selectedCurrencies.length > 0)) {
      setIsLoadingData(false);
    }
  }, [entityId, hasFetchedData, selectedCountries.length, selectedCurrencies.length]);

  // Show loader while data is being loaded
  if (isLoadingData) {
    return null;
  }

  return (
    <Box sx={entityConfigurationStyles.countriesCurrenciesContainer}>
      {/* Informational Message */}
      <Typography sx={entityConfigurationStyles.infoMessage}>
        Please select all the countries where the company has operation. Please note that the country(ies) of Company and Subsidiary are pre-populated and can't be edited in here.
      </Typography>

      <Box sx={entityConfigurationStyles.gridLayout}>
        {/* Countries List */}
        <CountriesList
          allCountries={allCountries}
          isLoadingCountries={isLoadingCountries}
          countrySearch={countrySearch}
          setCountrySearch={setCountrySearch}
          selectedCountries={selectedCountries}
          handleCountryToggle={handleCountryToggle}
          isEditMode={isEditMode}
          prePopulatedCountries={prePopulatedCountries}
        />

        {/* Selected Countries */}
        <SelectedCountriesGrid
          selectedCountries={selectedCountries}
          isEditMode={isEditMode}
          handleCountryToggle={handleCountryToggle}
          prePopulatedCountries={prePopulatedCountries}
          isLoadingSelectedCountries={isLoadingSelectedCountries}
        />


        {/* Currencies List */}
        <CurrenciesList
          currencies={currencies}
          currenciesLoading={isLoadingCountries}
          currencySearch={currencySearch}
          setCurrencySearch={setCurrencySearch}
          selectedCurrencies={allSelectedCurrencies}
          handleCurrencyToggle={handleCurrencyToggle}
          isEditMode={isEditMode}
          prePopulatedCurrencies={prePopulatedCurrencies}
          defaultCurrency={defaultCurrency || []}
          isDefault={isDefault}
        />


        {/* Selected Currencies */}
        <SelectedCurrenciesGrid
          selectedCurrencies={allSelectedCurrencies}
          currencies={currencies}
          isEditMode={isEditMode}
          handleCurrencyToggle={handleCurrencyToggle}
          handleSetDefaultCurrency={handleSetDefaultCurrency}
          defaultCurrency={defaultCurrency || []}
          isDefault={isDefault}
          prePopulatedCurrencies={prePopulatedCurrencies}
          isLoadingSelectedCurrencies={isLoadingSelectedCurrencies}
        />
      </Box>
    </Box>
  );
};

export default CountriesAndCurrencies;