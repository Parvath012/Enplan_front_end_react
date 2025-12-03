import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Upload } from '@carbon/icons-react';
import CustomCheckbox from './CustomCheckbox';
import NotificationAlert from './NotificationAlert';
import { validateImageFile } from '../../utils/imageUtils';

interface FileUploadProps {
  file: File | null;
  // Optional base64 image string to show when editing (when file is null)
  previewSrc?: string | null;
  onFileChange: (file: File | null) => void;
  onCheckboxChange: (checked: boolean) => void;
  checkboxChecked: boolean;
  checkboxLabel: string;
  uploadLabel: string;
  supportedExtensions: string[];
  maxFileSize: number;
  width?: number;
  height?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  file,
  previewSrc,
  onFileChange,
  onCheckboxChange,
  checkboxChecked,
  checkboxLabel,
  uploadLabel,
  supportedExtensions,
  maxFileSize,
  width = 165,
  height = 62,
}) => {
  const [errorOpen, setErrorOpen] = React.useState(false);
  const [errorText, setErrorText] = React.useState('');
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    if (selectedFile) {
      // Use utility function for validation
      const validation = validateImageFile(selectedFile, maxFileSize / (1024 * 1024), supportedExtensions);
      if (!validation.isValid) {
        setErrorText(`Upload failed: ${validation.error}`);
        setErrorOpen(true);
        return;
      }
      onFileChange(selectedFile);
    }
    
    // Reset the input value to ensure onChange fires even for the same file
    // This is necessary because browsers don't trigger onChange if the same file is selected
    event.target.value = '';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box
      sx={{
        borderRadius: 2,
        p: 1.5,
        border: '1px solid #e9ecef',
        backgroundColor: '#fff',
      }}
    >
      {/* Top Section: Title, Upload Button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '34px',
          mt: -1,
          mb: 0,
          borderBottom: '1px solid #dee2e6',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 650,
            color: '#4A4E52',
            fontSize: '14px',
            fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {uploadLabel}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Upload size={14} />}
              onClick={() => document.getElementById('file-upload')?.click()}
              sx={{
                border: 'none',
                color: '#6c757d',
                fontSize: '12px',
                textTransform: 'none',
                '&:hover': {
                  border: 'none',
                  backgroundColor: '#f5f5f5', // Darker gray background on hover
                },
              }}
            >
              Upload
            </Button>
        </Box>
      </Box>

      {/* Bottom Section: Placeholder Box, File Requirements, and Checkbox */}
      <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
        {/* Left: Placeholder Box */}
        <Box sx={{ flex: '0 0 auto', paddingTop: 1.5 }}>
          <Box
            sx={{
              width: width,
              height: height,
              border: (file || previewSrc) ? 'none' : '1px solid #6c757d',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ffffff',
              transition: 'border-color 0.2s ease',
            }}
          >
            {file || previewSrc ? (
              <Box sx={{ textAlign: 'center', width: '100%', height: '100%' }}>
                {(() => {
                  const isImageFile = file ? file.type.startsWith('image/') : true;
                  if (isImageFile) {
                    return (
                      <Box
                        component="img"
                        src={file ? URL.createObjectURL(file) : (previewSrc as string)}
                        alt={file ? file.name : 'logo-preview'}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          borderRadius: '7px'
                        }}
                        onLoad={(e) => { if (file) URL.revokeObjectURL((e.target as HTMLImageElement).src); }}
                      />
                    );
                  } else {
                    return (
                      <>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#1976d2',
                            fontWeight: 500,
                            mb: 0.25,
                            fontSize: '0.8rem',
                          }}
                        >
                          {file ? file.name : ''}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#6c757d',
                            display: 'block',
                            fontSize: '0.7rem',
                          }}
                        >
                          {file ? formatFileSize(file.size) : ''}
                        </Typography>
                      </>
                    );
                  }
                })()}
              </Box>
            ) : (
              <Typography
                variant="body2"
                sx={{
                  color: '#9E9E9E',
                  fontWeight: 500,
                }}
              >
                Entity Logo
              </Typography>
            )}
          </Box>
        </Box>

        {/* Right: File Requirements */}
        <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
          <Box sx={{ mb: 2, paddingTop: 1.5 }}>
            <Typography
              sx={{
                color: '#5F6368',
                fontSize: '12px',
                lineHeight: '16px',
                mb: 0,
              
								fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              Supported file extensions: .PNG, .jpeg/.jpg, .SVG
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mt: 0,
              }}
            >
              <Typography
                sx={{
                  color: '#5F6368',
                  fontSize: '12px',
                  lineHeight: '16px',
                  mt: 0,
                  fontFamily:
                    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                Maximum allowed file size is 10MB
              </Typography>

              {/* Checkbox */}
              <CustomCheckbox
                checked={checkboxChecked}
                onChange={(e) => onCheckboxChange(e.target.checked)}
                label={checkboxLabel}
                labelProps={{
                  sx: {
                    margin: 0,
                    position: 'relative',
                    top: '-22px',
                    '& .MuiFormControlLabel-label': {
                      fontSize: '0.875rem',
                      color: '#5F6368',
                      marginLeft: '8px', // Add spacing between checkbox and label
								      fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    },
                  }
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Hidden File Input */}
      <input
        id="file-upload"
        type="file"
        accept={supportedExtensions.join(',')}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Auto-dismissible error (top-right, no actions) */}
      <NotificationAlert
        open={errorOpen}
        variant="error"
        message={errorText}
        onClose={() => setErrorOpen(false)}
        autoHideDuration={2000}
      />
    </Box>
  );
};

export default FileUpload;