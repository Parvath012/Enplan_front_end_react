import React from 'react';
import { Box, Typography } from '@mui/material';

interface ErrorDisplayProps {
  error: string;
  showEllipsis?: boolean;
}

/**
 * Reusable error display component for file upload errors
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, showEllipsis = false }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        backgroundColor: "#FFFFFF",
        padding: "4px 8px",
        borderRadius: "4px",
        marginTop: showEllipsis ? "2px" : 0,
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "14px",
          height: "14px",
          flexShrink: 0,
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="7" cy="7" r="6.5" stroke="#EF5350" strokeWidth="1.5" fill="none" />
          <path
            d="M4 4L10 10"
            stroke="#EF5350"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </Box>
      <Typography
        sx={{
          fontFamily:
            "'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontWeight: 400,
          fontSize: "10px",
          color: "#EF5350",
          overflow: showEllipsis ? "hidden" : "visible",
          textOverflow: showEllipsis ? "ellipsis" : "clip",
          whiteSpace: showEllipsis ? "nowrap" : "normal",
          flex: showEllipsis ? 1 : "none",
          minWidth: showEllipsis ? 0 : "auto",
        }}
      >
        {error}
      </Typography>
    </Box>
  );
};

export default ErrorDisplay;

