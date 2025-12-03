import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Download } from '@carbon/icons-react';

interface Step1DownloadTemplateProps {
  onDownload: () => void;
}

const Step1DownloadTemplate: React.FC<Step1DownloadTemplateProps> = ({ onDownload }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <Box>
        <Typography
          sx={{
            fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontWeight: 500,
            fontSize: '14px',
            color: '#4A4E52',
            marginBottom: '4px',
          }}
        >
          Step 1: Get the Template
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'nowrap' }}>
          <Typography
            sx={{
              fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontWeight: 400,
              fontSize: '12px',
              color: '#5F6368',
              lineHeight: '18px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Use the provided file to add user details in bulk.
          </Typography>
          <Button
            onClick={onDownload}
            startIcon={<Download size={16} />}
            sx={{
              height: '28px',
              minWidth: 'auto',
              backgroundColor: 'rgba(0, 111, 230, 1)',
              color: '#FFFFFF',
              fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontWeight: 500,
              fontSize: '12px',
              textTransform: 'none',
              borderRadius: '8px',
              border: 'none',
              padding: '0 12px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': {
                backgroundColor: 'rgba(0, 111, 230, 0.9)',
              },
              '& .MuiButton-startIcon': {
                marginRight: '6px',
                marginLeft: 0,
                color: '#FFFFFF',
                '& svg': {
                  width: '16px',
                  height: '16px',
                },
              },
            }}
          >
            Download
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Step1DownloadTemplate;

