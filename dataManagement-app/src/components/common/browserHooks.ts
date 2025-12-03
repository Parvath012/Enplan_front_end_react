import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Hook to manage drawer open/close state
 */
export const useDrawerState = (open: boolean) => {
  const [isDrawerReady, setIsDrawerReady] = useState(false);

  const handleDrawerOpen = useCallback(() => {
    const timer = setTimeout(() => {
      setIsDrawerReady(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setIsDrawerReady(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    return handleDrawerOpen();
  }, [open, handleDrawerOpen]);

  useEffect(() => {
    if (open) return;
    handleDrawerClose();
  }, [open, handleDrawerClose]);

  return isDrawerReady;
};

/**
 * Hook to fetch and manage browser data
 */
export const useBrowserData = <T extends { id: string }>(
  open: boolean,
  fetchFunction: () => Promise<any>,
  transformFunction: (response: any) => T[],
  errorMessagePrefix: string
) => {
  const dataRef = useRef<T[]>([]);
  const [data, setData] = useState<T[]>([]);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  
  // Store functions in refs to avoid dependency issues
  const fetchFnRef = useRef(fetchFunction);
  const transformFnRef = useRef(transformFunction);
  
  useEffect(() => {
    fetchFnRef.current = fetchFunction;
    transformFnRef.current = transformFunction;
  }, [fetchFunction, transformFunction]);

  useEffect(() => {
    if (!open) {
      dataRef.current = [];
      setData([]);
      setLoadingError(null);
      setSelectedItem(null);
      return;
    }
    
    const fetchData = async () => {
      setLoadingError(null);
      try {
        const response = await fetchFnRef.current();
        const transformedData = transformFnRef.current(response);
        dataRef.current = transformedData;
        setData(transformedData);
      } catch (error: any) {
        console.error(`Failed to fetch ${errorMessagePrefix}:`, error);
        setLoadingError(error.message || `Failed to load ${errorMessagePrefix}`);
        dataRef.current = [];
        setData([]);
      }
    };

    fetchData();
  }, [open, errorMessagePrefix]);

  return {
    data,
    loadingError,
    selectedItem,
    setSelectedItem,
  };
};

/**
 * Hook to manage search state
 */
export const useSearchState = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  const handleSearchClick = useCallback(() => {
    setIsSearchActive(true);
  }, []);

  const handleSearchClose = useCallback(() => {
    setIsSearchActive(false);
    setSearchTerm('');
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  return {
    searchTerm,
    isSearchActive,
    handleSearchClick,
    handleSearchClose,
    handleSearchChange,
  };
};

