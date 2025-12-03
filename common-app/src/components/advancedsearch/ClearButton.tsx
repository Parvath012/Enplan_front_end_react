import React from "react";
import CustomTooltip from "../common/CustomTooltip";

interface ClearButtonProps {
  onClick: () => void;
  visible: boolean;
}

export const ClearButton: React.FC<ClearButtonProps> = ({ onClick, visible }) => {
  if (!visible) return null;

  return (
    <CustomTooltip title="Clear" placement="top">
      <button
        type="button"
        onClick={onClick}
        data-testid="clear-button"
        style={{
          position: "absolute",
          right: "8px",
          top: "50%",
          transform: "translateY(-50%)",
          background: "transparent",
          border: "none",
          color: "#666",
          cursor: "pointer",
          fontSize: "18px",
          padding: "0",
          width: "20px",
          height: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          transition: "background-color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#e0e0e0";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        ×
      </button>
    </CustomTooltip>
  );
};
