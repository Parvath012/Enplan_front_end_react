import { useState, useEffect, useRef } from 'react';

/**
 * Hook to detect when a container element is available in the DOM
 * Useful for components that need to render into a specific container
 * 
 * @param selector - CSS selector for the container element
 * @param retryDelay - Delay in milliseconds before retrying to find the container
 * @returns Object with ready flag and containerRef
 */
export const useContainerDetection = (selector: string, retryDelay: number = 100) => {
  const [ready, setReady] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const findContainer = () => {
      const el = document.querySelector(selector) as HTMLDivElement;
      if (el) {
        containerRef.current = el;
        setReady(true);
        console.log(`Container found: ${selector}`, el);
        return true;
      }
      return false;
    };

    // Try to find container immediately
    if (!findContainer()) {
      console.log(`Container not found: ${selector}, will retry`);
      // Retry after a short delay
      const timer = setTimeout(() => {
        findContainer();
      }, retryDelay);
      
      return () => clearTimeout(timer);
    }
  }, [selector, retryDelay]);

  return { ready, containerRef };
};

