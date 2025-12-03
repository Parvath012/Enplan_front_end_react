import React from "react";

interface TransferButtonProps {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
  title: string;
}

export const TransferButton: React.FC<TransferButtonProps> = ({ 
  onClick, 
  disabled, 
  children, 
  title 
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={{
      background: "transparent",
      border: "1px solid #e5e5ea",
      borderRadius: "4px",
      padding: "8px",
      cursor: disabled ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s ease",
      width: "40px",
      height: "40px",
      opacity: disabled ? 0.5 : 1,
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.currentTarget.style.background = "#e8f6e8";
        e.currentTarget.style.borderColor = "#a5d6a7";
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "transparent";
      e.currentTarget.style.borderColor = "#e5e5ea";
    }}
  >
    <span style={{ fontSize: "16px", color: "#666" }}>{children}</span>
  </button>
);
