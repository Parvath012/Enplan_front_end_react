import React from 'react';
import { Box, Typography, Link } from '@mui/material';
const TextField = React.lazy(() => import('commonApp/TextField'));
const SelectField = React.lazy(() => import('commonApp/SelectField'));
import { MONTHS, WEEK_DAYS } from '../../constants/periodSetupConstants';

interface WeekSetup {
  name: string;
  monthForWeekOne: string;
  startingDayOfWeek: string;
  format: string;
}

interface WeekSetupSectionProps {
  weekSetup: WeekSetup;
  onWeekSetupChange: (field: keyof WeekSetup, value: string) => void;
  onFormatLinkClick: () => void;
  isEditMode: boolean;
}

const WeekSetupSection: React.FC<WeekSetupSectionProps> = ({
  weekSetup,
  onWeekSetupChange,
  onFormatLinkClick,
  isEditMode
}) => {
  return (
    <Box className="period-setup__section">
      <Box className="period-setup__section-header">
        <Typography variant="h6" className="period-setup__section-title">
          Week Setup
        </Typography>
      </Box>

      <Box className="period-setup__content">
        <Box className="period-setup__form-row">
          {/* Week Name - fully read-only, no events */}
          <Box className="period-setup__form-column">
            <TextField
              label="Week Name"
              value={weekSetup.name || 'Auto generated'}
              placeholder="Auto generated"
              width="219px"
              disabled
              required
              // prevent any accidental event binding
              onChange={() => { }}
              onClick={(e) => e.preventDefault()}
            />
          </Box>

          {/* Month For Week One */}
          <Box className="period-setup__form-column">
            <SelectField
              label="Month For Week One"
              value={weekSetup.monthForWeekOne}
              onChange={(value: string) => onWeekSetupChange('monthForWeekOne', value)}
              options={MONTHS}
              placeholder="Select"
              required
              disabled={!isEditMode}
              width="266px"
            />
          </Box>

          {/* Starting Day Of The Week */}
          <Box className="period-setup__form-column">
            <SelectField
              label="Starting Day Of The Week"
              value={weekSetup.startingDayOfWeek}
              onChange={(value: string) => onWeekSetupChange('startingDayOfWeek', value)}
              options={WEEK_DAYS}
              placeholder="Select"
              required
              disabled={!isEditMode}
              width="266px"
            />
          </Box>

          {/* Info Column */}
          <Box className="period-setup__info-column">
            <Typography variant="body2" className="period-setup__format-info">
              <strong>Week Name Format</strong><br />
              System default is 'Week-#'. You can change the format from{' '}
              <Link
                component="button"
                variant="body2"
                className="period-setup__format-link"
                onClick={isEditMode ? onFormatLinkClick : undefined}
                style={{
                  pointerEvents: isEditMode ? 'auto' : 'none',
                  opacity: isEditMode ? 1 : 0.5,
                  cursor: isEditMode ? 'pointer' : 'default'
                }}
              >
                here
              </Link>.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default WeekSetupSection;
