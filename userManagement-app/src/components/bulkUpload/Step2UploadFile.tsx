import React, { useRef, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  IconButton,
} from "@mui/material";
import { Document, TrashCan } from "@carbon/icons-react";
import ErrorDisplay from "./ErrorDisplay";

interface Step2UploadFileProps {
  onFileSelect: (file: File) => void;
  onRemoveFile: () => void;
  onError: (error: string | null) => void;
  uploadedFile: File | null;
  uploadProgress: number;
  uploadError: string | null;
  isUploading: boolean;
}

const Step2UploadFile: React.FC<Step2UploadFileProps> = ({
  onFileSelect,
  onRemoveFile,
  onError,
  uploadedFile,
  uploadProgress,
  uploadError,
  isUploading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB in bytes

  const validateFile = (
    file: File,
  ): { isValid: boolean; error: string | null } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: "The file exceeds the maximum allowed size of 4 MB.",
      };
    }

    // File format validation removed - only file size validation is shown
    // Other errors will be handled silently
    return { isValid: true, error: null };
  };

  const handleFileSelection = useCallback(
    (file: File) => {
      const validation = validateFile(file);
      if (validation.isValid) {
        onError(null); // Clear any previous errors
        onFileSelect(file);
      } else {
        // Set error in parent component
        onError(validation.error ?? "Unknown error occurred");
      }
    },
    [onFileSelect, onError],
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleSelectFileClick = () => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + "KB";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + "KB";
    return (bytes / (1024 * 1024)).toFixed(0) + "MB";
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <Box>
        <Typography
          sx={{
            fontFamily:
              "'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontWeight: 500,
            fontSize: "14px",
            color: "#4A4E52",
            marginBottom: "4px",
          }}
        >
          Step 2: Upload File
        </Typography>
        <Typography
          sx={{
            fontFamily:
              "'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontWeight: 400,
            fontSize: "12px",
            color: "#5F6368",
            lineHeight: "18px",
          }}
        >
          Drag and drop the filled file here or click to select file (4 MB max).
        </Typography>
      </Box>

      {!uploadedFile && (
        <Box
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleSelectFileClick}
          sx={{
            width: "100%",
            minHeight: "200px",
            border: `2px dashed ${isDragging ? "rgba(0, 111, 230, 1)" : "rgba(242, 242, 240, 1)"}`,
            borderRadius: "4px",
            backgroundColor: isDragging
              ? "rgba(0, 111, 230, 0.05)"
              : "transparent",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            padding: "24px",
            cursor: isUploading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            position: "relative",
          }}
        >
          <Box
            sx={{
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#B4B7BA",
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4V16M12 4L8 8M12 4L16 8M4 20H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Box>
          <Typography
            sx={{
              fontFamily:
                "'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontWeight: 400,
              fontSize: "12px",
              color: "#5F6368",
              textAlign: "center",
            }}
          >
            Drag and drop the filled file here
          </Typography>
          <Typography
            sx={{
              fontFamily:
                "'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontWeight: 400,
              fontSize: "12px",
              color: "#5F6368",
              textAlign: "center",
            }}
          >
            Or click to select file (4 MB max)
          </Typography>
          <Button
            disabled={isUploading}
            onClick={(e) => {
              e.stopPropagation();
              handleSelectFileClick();
            }}
            sx={{
              marginTop: "4px",
              width: "auto",
              minWidth: "120px",
              height: "32px",
              backgroundColor: "#282828",
              color: "#FFFFFF",
              fontFamily:
                "'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontWeight: 500,
              fontSize: "12px",
              textTransform: "none",
              borderRadius: "8px",
              border: "none",
              "&:hover": {
                backgroundColor: "#1F1F1F",
              },
              "&:disabled": {
                backgroundColor: "#B4B7BA",
                cursor: "not-allowed",
              },
            }}
          >
            Select File
          </Button>
        </Box>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileInputChange}
        style={{ display: "none" }}
      />

      {/* Error Display for validation errors (when no file is uploaded) */}
      {/* Only show file size and format errors here, not mandatory field errors */}
      {!uploadedFile && uploadError && !uploadError.includes("Some mandatory fields are missing") && (
        <Box sx={{ width: "100%", maxWidth: "420px" }}>
          <ErrorDisplay error={uploadError} />
        </Box>
      )}

      {uploadedFile && (
        <Box
          sx={{
            width: "100%",
            maxWidth: "420px",
            border: "1px solid #e0e0e0",
            borderRadius: "6px",
            padding: "8px 12px",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "row",
            gap: "8px",
            alignItems: "flex-start",
          }}
        >
          {/* Large File Icon */}
          <Box
            sx={{
              flexShrink: 0,
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Document size={48} color="#5F6368" />
          </Box>

          {/* Right Side: File Name/Size, Progress Bar, Percentage/Error */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              minWidth: 0,
            }}
          >
            {/* Top Row: File Name, Divider, File Size, Delete Button */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                flexWrap: "wrap",
              }}
            >
              {/* File Name */}
              <Typography
                sx={{
                  fontSize: "10px",
                  fontWeight: 400,
                  color: "#212121",
                  fontFamily:
                    "'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  marginRight: "12px",
                }}
              >
                {uploadedFile.name.replace(/\.[^/.]+$/, "").replace(/_/g, "_")}
              </Typography>

              {/* Vertical Divider */}
              <Box
                sx={{
                  width: "1px",
                  height: "16px",
                  backgroundColor: "#e0e0e0",
                  flexShrink: 0,
                  marginRight: "12px",
                }}
              />

              {/* File Size */}
              <Typography
                sx={{
                  fontSize: "10px",
                  fontWeight: 400,
                  color: "#757575",
                  fontFamily:
                    "'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  flexShrink: 0,
                }}
              >
                {formatFileSize(uploadedFile.size)}
              </Typography>

              {/* Delete Button - Push to right */}
              <Box sx={{ flex: 1, minWidth: "40px" }} />
              <IconButton
                onClick={onRemoveFile}
                disabled={isUploading}
                sx={{
                  padding: "2px",
                  color: "#757575",
                  flexShrink: 0,
                  marginLeft: "auto",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                  "&:disabled": {
                    color: "#B4B7BA",
                    cursor: "not-allowed",
                  },
                }}
              >
                <TrashCan size={16} />
              </IconButton>
            </Box>

            {/* Progress Bar Container - Below file name, aligned with it */}
            <Box
              sx={{
                width: "100%",
                marginTop: "2px",
                position: "relative",
              }}
            >
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                sx={{
                  height: "4px",
                  borderRadius: "2px",
                  backgroundColor: "#e0e0e0",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "#1976d2",
                    borderRadius: "2px",
                  },
                }}
              />
              {/* Progress Percentage - Positioned at right end of progress bar */}
              <Typography
                sx={{
                  position: "absolute",
                  right: 0,
                  top: "6px",
                  fontSize: "10px",
                  fontWeight: 400,
                  color: "#757575",
                  fontFamily:
                    "'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  flexShrink: 0,
                }}
              >
                {uploadProgress}%
              </Typography>
            </Box>

            {/* Error Message - Below progress bar, left aligned */}
            {uploadError && (
              <ErrorDisplay error={uploadError} showEllipsis={true} />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Step2UploadFile;
