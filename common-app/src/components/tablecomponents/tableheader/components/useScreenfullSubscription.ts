import { useEffect } from "react";
import screenfull from "screenfull";

/**
 * Custom hook to handle screenfull event subscription.
 * Extracted from ImportExportSelector for easier testing and coverage.
 */
export function useScreenfullSubscription(setIsFullscreen: (val: boolean) => void) {
  useEffect(() => {
    if (!screenfull.isEnabled) return;
    function onChange() {
      setIsFullscreen(screenfull.isFullscreen);
    }
    screenfull.on("change", onChange);
    return () => {
      screenfull.off("change", onChange);
    };
  }, [setIsFullscreen]);
}
