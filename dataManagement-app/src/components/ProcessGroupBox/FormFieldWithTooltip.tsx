import React from 'react';
import { Box, Tooltip } from '@mui/material';
import { InformationFilled } from '@carbon/icons-react';
import { TOOLTIP_CONFIG } from '../../constants/tooltipStyles';
import { LABEL_STYLE } from './processGroupConfigUtils';

interface FormFieldWithTooltipProps {
  htmlFor: string;
  label: string;
  tooltipTitle: string;
  children: React.ReactNode;
}

const FormFieldWithTooltip: React.FC<FormFieldWithTooltipProps> = ({
  htmlFor,
  label,
  tooltipTitle,
  children
}) => {
  return (
    <Box sx={{ marginBottom: '24px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '8px' }}>
        <label htmlFor={htmlFor} style={LABEL_STYLE}>
          {label}
        </label>
        <Tooltip
          title={tooltipTitle}
          placement="top"
          {...TOOLTIP_CONFIG}
          slotProps={{
            ...TOOLTIP_CONFIG.slotProps,
            popper: {
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, 4],
                  },
                },
              ],
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'help',
              justifyContent: 'center',
              marginLeft: '2px'
            }}
          >
            <InformationFilled size={14} style={{ color: '#6c757d' }} />
          </Box>
        </Tooltip>
      </Box>
      {children}
    </Box>
  );
};

export default FormFieldWithTooltip;

