import React from "react";
import CustomTooltip from "../../../common/CustomTooltip";

// Props for SelectorIconButton component
interface SelectorIconButtonProps {
  tooltip: string; // Tooltip text for the button
  expanded: boolean; // Whether the selector is expanded
  className: string; // CSS class for styling the button
  icon: React.ReactNode; // Icon to display inside the button
  onClick: (e?: React.MouseEvent | React.KeyboardEvent) => void; // Click handler
  onKeyDown: (e: React.KeyboardEvent) => void; // Keyboard event handler
}

// Reusable icon button with tooltip for selector components
const SelectorIconButton: React.FC<SelectorIconButtonProps> = ({
  tooltip,
  expanded,
  className,
  icon,
  onClick,
  onKeyDown,
}) => (
  // Wrap button with tooltip for accessibility and UX
  <CustomTooltip title={tooltip}>
    <button
      type="button"
      aria-label={tooltip} // Accessibility: describes the button
      aria-expanded={expanded} // Accessibility: indicates expanded/collapsed state
      className={className} // Apply custom styling
      onClick={onClick} // Handle mouse click
      onKeyDown={onKeyDown} // Handle keyboard events (e.g., Enter, Space)
      tabIndex={0} // Make button focusable
      data-testid="selector-icon-btn"
    >
      {icon /* Render the provided icon */}
    </button>
  </CustomTooltip>
);

export default SelectorIconButton;
