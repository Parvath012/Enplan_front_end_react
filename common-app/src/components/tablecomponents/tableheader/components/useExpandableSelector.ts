import { useCallback } from "react";

type ExpandHandler = (e?: React.KeyboardEvent | React.MouseEvent) => void;

// Custom hook to handle expand/collapse logic for selector components
export function useExpandableSelector(
  onExpand: () => void,
  onRequestExpand?: () => void
) {
  // Handles expand/collapse action
  const handleExpand: ExpandHandler = useCallback(
    (e) => {
      onExpand();
      if (e) e.stopPropagation(); // Prevent event bubbling
    },
    [onExpand]
  );

  // Handles request to expand (optional)
  const handleRequestExpand: ExpandHandler = useCallback(
    (e) => {
      onRequestExpand && onRequestExpand();
      if (e) e.stopPropagation(); // Prevent event bubbling
    },
    [onRequestExpand]
  );

  // Handles keyboard events (Enter or Space) for accessibility
  const handleKeyDown = useCallback(
    (handler: ExpandHandler) => (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        handler(e);
      }
    },
    []
  );

  return { handleExpand, handleRequestExpand, handleKeyDown };
}