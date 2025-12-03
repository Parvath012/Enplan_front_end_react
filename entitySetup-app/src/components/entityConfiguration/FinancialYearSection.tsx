import React, { useEffect, useState } from 'react';
import { Box, Typography, Link } from '@mui/material';
const TextField = React.lazy(() => import('commonApp/TextField'));
const SelectField = React.lazy(() => import('commonApp/SelectField'));
const CustomSlider = React.lazy(() => import('commonApp/CustomSlider'));
import FinancialYearFormatPanel from '../common/FinancialYearFormatPanel/FinancialYearFormatPanel';
import {
  MONTHS,
  SPANNING_YEARS_OPTIONS,
  HISTORICAL_DATA_YEARS,
  SLIDER_MIN,
  SLIDER_MAX,
  SLIDER_RAIL_WIDTH
} from '../../constants/periodSetupConstants';
import {
  calculateYearLabelsAndPositions,
  calculateFinancialYearYears,
  generateFinancialYearName
} from 'commonApp/formatUtils';

interface FinancialYearData {
  name: string;
  startMonth: string;
  endMonth: string;
  historicalDataStartFY: string;
  spanningYears: string;
  format: string;
}

interface FinancialYearSectionProps {
  financialYear: FinancialYearData;
  sliderValue: number[];
  onFinancialYearChange: (field: keyof FinancialYearData, value: string) => void;
  isEditMode: boolean;
}

const FinancialYearSection: React.FC<FinancialYearSectionProps> = ({
  financialYear,
  sliderValue,
  onFinancialYearChange,
  isEditMode
}) => {
  const [isFormatPanelOpen, setIsFormatPanelOpen] = useState(false);
  const [isEndMonthManuallyChanged, setIsEndMonthManuallyChanged] = useState(false);

  // Auto-set End Month if not manually changed
  useEffect(() => {
    if (financialYear.startMonth && !isEndMonthManuallyChanged) {
      const startIndex = MONTHS.findIndex((m) => m === financialYear.startMonth);
      if (startIndex >= 0) {
        const endIndex = (startIndex + 11) % 12;
        const endMonth = MONTHS[endIndex];
        onFinancialYearChange('endMonth', endMonth);
      }
    }
  }, [financialYear.startMonth]);

  // Auto-generate FY name only when start, end, and format exist
  useEffect(() => {
    if (financialYear.startMonth && financialYear.endMonth && financialYear.format) {
      const { financialYearStart, financialYearEnd } = calculateFinancialYearYears(
        financialYear.startMonth,
        financialYear.endMonth,
        MONTHS
      );
      const name = generateFinancialYearName(financialYear.format, financialYearStart, financialYearEnd);
      onFinancialYearChange('name', name);
    }
  }, [financialYear.startMonth, financialYear.endMonth, financialYear.format]);

  // Handle saving of new format from format panel
  const handleFormatSave = (format: string) => {
    setIsFormatPanelOpen(false);
    onFinancialYearChange('format', format);

    // If start & end months are already chosen, apply immediately
    if (financialYear.startMonth && financialYear.endMonth) {
      const { financialYearStart, financialYearEnd } = calculateFinancialYearYears(
        financialYear.startMonth,
        financialYear.endMonth,
        MONTHS
      );
      const name = generateFinancialYearName(format, financialYearStart, financialYearEnd);
      onFinancialYearChange('name', name);
    }
  };

  const handleEndMonthChange = (value: string) => {
    setIsEndMonthManuallyChanged(true);
    onFinancialYearChange('endMonth', value);
  };

  const getYearLabelsAndPositions = () => {
    return calculateYearLabelsAndPositions(
      financialYear.historicalDataStartFY,
      financialYear.spanningYears,
      sliderValue,
      SLIDER_MIN,
      SLIDER_MAX,
      SLIDER_RAIL_WIDTH
    );
  };

  // Compute visible name text
  const displayName =
    financialYear.startMonth && financialYear.endMonth && financialYear.format
      ? financialYear.name
      : 'Auto generated';

  return (
    <Box className="period-setup__section">
      <Box className="period-setup__section-header">
        <Typography variant="h6" className="period-setup__section-title">
          Financial Year Setup
        </Typography>
      </Box>

      <Box className="period-setup__content">
        <Box className="period-setup__form-row">
          {/* Financial Year Name - always read-only, grayed out */}
          <Box className="period-setup__form-column">
            <TextField
              label="Financial Year Name"
              value={displayName}
              placeholder="Auto generated"
              width="219px"
              disabled
              required
              onChange={() => { }}
              onClick={(e: React.MouseEvent) => e.preventDefault()}
            />
          </Box>

          {/* Start Month */}
          <Box className="period-setup__form-column">
            <SelectField
              label="Start Month"
              value={financialYear.startMonth}
              onChange={(value: string) => {
                setIsEndMonthManuallyChanged(false);
                onFinancialYearChange('startMonth', value);
              }}
              options={MONTHS}
              placeholder="Select"
              required
              disabled={!isEditMode}
              width="219px"
            />
          </Box>

          {/* End Month - editable dropdown */}
          <Box className="period-setup__form-column">
            <SelectField
              label="End Month"
              value={financialYear.endMonth}
              onChange={handleEndMonthChange}
              options={MONTHS}
              placeholder="Select"
              required
              disabled={!isEditMode}
              width="219px"
            />
          </Box>

          {/* Format info + link */}
          <Box className="period-setup__info-column">
            <Typography variant="body2" className="period-setup__format-info">
              <strong>Financial Year Name Format</strong><br />
              FY-{'{yy}'} for single year and FY-{'{yy}'}-{'{yy}'} for FY spanning two calendar years.<br />
              You can change the format from{' '}
              <Link
                component="button"
                variant="body2"
                className="period-setup__format-link"
                onClick={isEditMode ? () => setIsFormatPanelOpen(true) : undefined}
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

        {/* Historical & Slider Section */}
        <Box className="period-setup__form-row">
          <Box className="period-setup__form-column">
            <SelectField
              label="Historical Data Start FY"
              value={financialYear.historicalDataStartFY}
              onChange={(value: string) => onFinancialYearChange('historicalDataStartFY', value)}
              options={HISTORICAL_DATA_YEARS}
              placeholder="Select"
              required
              disabled={!isEditMode}
              width="343px"
            />

          </Box>

          <Box className="period-setup__form-column">
            <SelectField
              label="Select FY Spanning Years For Users"
              value={financialYear.spanningYears}
              onChange={(value: string) => onFinancialYearChange('spanningYears', value)}
              options={SPANNING_YEARS_OPTIONS}
              placeholder="Select"
              required
              disabled={!isEditMode}
              width="343px"
            />
          </Box>

          {/* Slider */}
          <Box className="period-setup__slider-column">
            <Typography variant="body2" className="period-setup__slider-label">
              Set Spanning Years For User View
            </Typography>
            {(() => {
              const { left, right } = getYearLabelsAndPositions();
              const hasSelection = financialYear.historicalDataStartFY && financialYear.spanningYears;
              return (
                <CustomSlider
                  value={hasSelection ? sliderValue : []}
                  min={SLIDER_MIN}
                  max={SLIDER_MAX}
                  currentValue={new Date().getFullYear()}
                  leftLabel={left.label}
                  rightLabel={right.label}
                  disabled={false}
                  width={SLIDER_RAIL_WIDTH}
                  height={6}
                  showCurrentValueMarker
                  currentValueLabel="CY"
                  trackColor={hasSelection ? 'rgba(0,111,230,1)' : 'transparent'}
                  railColor="rgba(240,239,239,1)"
                  thumbColor={hasSelection ? '#1976d2' : 'transparent'}
                  labelColor="#5F6368"
                  valueLabelDisplay="off"
                />
              );
            })()}
          </Box>
        </Box>
      </Box>

      {/* Format Panel */}
      <FinancialYearFormatPanel
        isOpen={isFormatPanelOpen}
        onClose={() => setIsFormatPanelOpen(false)}
        onSave={handleFormatSave}
        currentFormat={financialYear.format}
        financialYear={{
          startMonth: financialYear.startMonth,
          endMonth: financialYear.endMonth
        }}
      />
    </Box>
  );
};

export default FinancialYearSection;
