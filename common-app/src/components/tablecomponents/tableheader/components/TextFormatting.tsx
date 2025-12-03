import React from "react";
import CustomTooltip from "../../../common/CustomTooltip";
import { tableHeaderConfig } from "../../../../config/tableHeaderConfig";

interface Props {
  onFormat: (action: string) => void;
  activeFormatting?: Record<string, boolean>;
}

// Get formatting config from tableHeaderConfig
const formatting = tableHeaderConfig.font.expanded.formatting;

const TextFormatting: React.FC<Props> = ({ onFormat, activeFormatting = {} }) => (
  <div className="text-formatting-root">
    <div className="text-formatting-divider" />
    {formatting.map((item) => (
      <CustomTooltip key={item.key} title={item.tooltip}>
        <button
          type="button"
          className={`text-formatting-icon${activeFormatting[item.key] ? " active" : ""}`}
          aria-label={item.tooltip}
          onClick={() => onFormat(item.key)}
        >
          {item.icon}
        </button>
      </CustomTooltip>
    ))}
  </div>
);

export default TextFormatting;
