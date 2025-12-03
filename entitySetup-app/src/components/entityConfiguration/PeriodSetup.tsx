import React, { useState, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/configureStore';
import FinancialYearFormatPanel from '../common/FinancialYearFormatPanel/FinancialYearFormatPanel';
import WeekNameFormatPanel from '../common/WeekNameFormatPanel/WeekNameFormatPanel';
import FinancialYearSection from './FinancialYearSection';
import WeekSetupSection from './WeekSetupSection';
import { 
  MONTHS,
  DEFAULT_PERIOD_SETUP_DATA,
  DEFAULT_FINANCIAL_YEAR_FORMAT,
  DEFAULT_WEEK_NAME_FORMAT
} from '../../constants/periodSetupConstants';
import { 
  generateFinancialYearName, 
  generateWeekName, 
  calculateFinancialYearYears
} from 'commonApp/formatUtils';
import { 
  updatePeriodSetupData,
  fetchPeriodSetup
} from '../../store/Actions/periodSetupActions';
import './PeriodSetup.scss';

interface PeriodSetupProps {
  entityId: string;
  isEditMode: boolean;
  onDataChange?: (hasChanges: boolean) => void;
}

const PeriodSetup: React.FC<PeriodSetupProps> = ({ 
  entityId, 
  isEditMode, 
  onDataChange
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const periodSetupState = useSelector((state: RootState) => state.periodSetup[entityId]);
  
  // Local state for UI
  const [sliderValue, setSliderValue] = useState<number[]>([2015, 2020]);
  const [isFormatPanelOpen, setIsFormatPanelOpen] = useState<boolean>(false);
  const [isWeekFormatPanelOpen, setIsWeekFormatPanelOpen] = useState<boolean>(false);

  // Function to detect format from existing name
  const detectFormatFromName = (name: string): string => {
    if (!name) return DEFAULT_FINANCIAL_YEAR_FORMAT;
    
    // Check for FY {yyyy} - {yyyy} format (FY 2025 - 2026)
    if (/FY \d{4} - \d{4}/.exec(name)) {
      return 'FY {yyyy} - {yyyy}';
    }
    // Check for FY {yyyy} - {yy} format (FY 2019 - 20 or FY 2019 - 19)
    if (/FY \d{4} - \d{2}/.exec(name)) {
      return 'FY {yyyy} - {yy}';
    }
    // Check for FY {yy} - {yy} format (FY 25 - 26)
    if (/FY \d{2} - \d{2}/.exec(name)) {
      return 'FY {yy} - {yy}';
    }
    // Check for FY {yyyy} format (FY 2025)
    if (/FY \d{4}$/.exec(name)) {
      return 'FY {yyyy}';
    }
    // Check for FY {yy} format (FY 25)
    if (/FY \d{2}$/.exec(name)) {
      return 'FY {yy}';
    }
    
    return DEFAULT_FINANCIAL_YEAR_FORMAT;
  };

  // Function to detect week format from existing name
  const detectWeekFormatFromName = (name: string): string => {
    if (!name) return DEFAULT_WEEK_NAME_FORMAT;
    
    // Check for W{ww}-{YY} format (W01-25 or W1-25)
    if (/^W\d{1,2}-\d{2}$/.exec(name)) {
      return 'W{ww}-{YY}';
    }
    // Check for W{ww} format (W01 or W1)
    if (/^W\d{1,2}$/.exec(name)) {
      return 'W{ww}';
    }
    // Check for Week {ww}, {yyyy} format (Week 01, 2025 or Week 1, 2025)
    if (/^Week \d{1,2}, \d{4}$/.exec(name)) {
      return 'Week {ww}, {yyyy}';
    }
    // Check for {yyyy}-W{ww} format (2025-W01 or 2025-W1)
    if (/^\d{4}-W\d{1,2}$/.exec(name)) {
      return '{yyyy}-W{ww}';
    }
    
    return DEFAULT_WEEK_NAME_FORMAT;
  };

  // Get data from Redux state or use defaults
  const financialYearData = periodSetupState?.data?.financialYear || {};
  const detectedFormat = detectFormatFromName(financialYearData.name);
  
  const financialYear = {
    ...DEFAULT_PERIOD_SETUP_DATA.financialYear,
    ...financialYearData,
    format: financialYearData.format ?? detectedFormat
  };

  // Get week setup data and detect format
  const weekSetupData = periodSetupState?.data?.weekSetup || {};
  const detectedWeekFormat = detectWeekFormatFromName(weekSetupData.name);
  
  const weekSetup = {
    ...DEFAULT_PERIOD_SETUP_DATA.weekSetup,
    ...weekSetupData,
    format: weekSetupData.format ?? detectedWeekFormat
  };

  // Store detected format in Redux when component loads (only once)
  useEffect(() => {
    if (financialYearData.name && !financialYearData.format && detectedFormat !== DEFAULT_FINANCIAL_YEAR_FORMAT) {
      dispatch(updatePeriodSetupData(entityId, 'financialYear.format', detectedFormat) as any);
    }
  }, [entityId]); // Only run when entityId changes (component mount)

  // Store detected week format in Redux when component loads (only once)
  useEffect(() => {
    if (weekSetupData.name && !weekSetupData.format && detectedWeekFormat !== DEFAULT_WEEK_NAME_FORMAT) {
      dispatch(updatePeriodSetupData(entityId, 'weekSetup.format', detectedWeekFormat) as any);
    }
  }, [entityId]); // Only run when entityId changes (component mount)

  // Form validation - removed unused function

  // Check if form has changes
  const hasFormChanges = useCallback(() => {
    if (!periodSetupState?.originalData) return false;
    return JSON.stringify(periodSetupState.data) !== JSON.stringify(periodSetupState.originalData);
  }, [periodSetupState]);

  // Load data when component mounts or entityId changes
  useEffect(() => {
    if (entityId) {
      dispatch(fetchPeriodSetup(entityId) as any);
    }
  }, [entityId, dispatch]);

  // When switching to edit mode, ensure we have the latest saved data
  useEffect(() => {
    if (isEditMode && entityId) {
      // This effect ensures we have the latest saved data when entering edit mode
      // The data is already loaded by the parent component, so no action needed here
    }
  }, [isEditMode, entityId, periodSetupState, financialYear, weekSetup]);

  // Notify parent about data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange(hasFormChanges());
    }
  }, [hasFormChanges, onDataChange]);

  // Update slider based on historical data and spanning years
  useEffect(() => {
    if (financialYear.historicalDataStartFY && financialYear.spanningYears) {
      const historicalStartYear = parseInt(financialYear.historicalDataStartFY);
      const spanYears = parseInt(financialYear.spanningYears.split(' ')[0]);
      const historicalEndYear = historicalStartYear + spanYears - 1;
      
      setSliderValue([historicalStartYear, historicalEndYear]);
    }
  }, [financialYear.historicalDataStartFY, financialYear.spanningYears, isEditMode]);

  // Handle financial year changes with auto-generation
  const handleFinancialYearChange = (field: string, value: string) => {
    dispatch(updatePeriodSetupData(entityId, `financialYear.${field}`, value) as any);
    
    // Auto-fill end month when start month changes
    if (field === 'startMonth') {
      const startIndex = MONTHS.indexOf(value);
      const endIndex = (startIndex + 11) % 12;
      const endMonth = MONTHS[endIndex];
      dispatch(updatePeriodSetupData(entityId, 'financialYear.endMonth', endMonth) as any);
      
      // Always regenerate name when months change, using the current format
      const { financialYearStart, financialYearEnd } = calculateFinancialYearYears(
        value, 
        endMonth, 
        MONTHS
      );
      
      const generatedName = generateFinancialYearName(
        financialYear.format, 
        financialYearStart, 
        financialYearEnd
      );
      
      dispatch(updatePeriodSetupData(entityId, 'financialYear.name', generatedName) as any);
    } else if (field === 'endMonth') {
      // Always regenerate name when end month changes, using the current format
      if (financialYear.startMonth) {
        const { financialYearStart, financialYearEnd } = calculateFinancialYearYears(
          financialYear.startMonth, 
          value, 
          MONTHS
        );
        
        const generatedName = generateFinancialYearName(
          financialYear.format, 
          financialYearStart, 
          financialYearEnd
        );
        
        dispatch(updatePeriodSetupData(entityId, 'financialYear.name', generatedName) as any);
      }
    }
  };

  // Handle week setup changes with auto-generation
  const handleWeekSetupChange = (field: string, value: string) => {
    dispatch(updatePeriodSetupData(entityId, `weekSetup.${field}`, value) as any);
    
    // Only regenerate name if there's no existing name (new record) or if format was explicitly changed
    if ((field === 'monthForWeekOne' || field === 'startingDayOfWeek') && !weekSetup.name) {
      const monthForWeekOne = field === 'monthForWeekOne' ? value : weekSetup.monthForWeekOne;
      const startingDayOfWeek = field === 'startingDayOfWeek' ? value : weekSetup.startingDayOfWeek;
      
      if (monthForWeekOne && startingDayOfWeek) {
        const generatedName = generateWeekName(weekSetup.format);
        dispatch(updatePeriodSetupData(entityId, 'weekSetup.name', generatedName) as any);
      }
    }
  };

  // Handle format panel open/close
  const handleFinancialFormatLinkClick = () => {
    setIsFormatPanelOpen(true);
  };

  const handleWeekFormatLinkClick = () => {
    setIsWeekFormatPanelOpen(true);
  };

  // Handle format save
  const handleFormatSave = (format: string) => {
    dispatch(updatePeriodSetupData(entityId, 'financialYear.format', format) as any);
    
    // Regenerate financial year name with new format
    if (financialYear.startMonth && financialYear.endMonth) {
      const { financialYearStart, financialYearEnd } = calculateFinancialYearYears(
        financialYear.startMonth, 
        financialYear.endMonth, 
        MONTHS
      );
      
      const generatedName = generateFinancialYearName(
        format, 
        financialYearStart, 
        financialYearEnd
      );
      
      dispatch(updatePeriodSetupData(entityId, 'financialYear.name', generatedName) as any);
    }
    
    setIsFormatPanelOpen(false);
  };

  const handleWeekFormatSave = (format: string) => {
    dispatch(updatePeriodSetupData(entityId, 'weekSetup.format', format) as any);
    
    // Regenerate week name with new format
    if (weekSetup.monthForWeekOne && weekSetup.startingDayOfWeek) {
      const generatedName = generateWeekName(format);
      dispatch(updatePeriodSetupData(entityId, 'weekSetup.name', generatedName) as any);
    }
    
    setIsWeekFormatPanelOpen(false);
  };

  return (
    <Box className="period-setup">
      {/* Financial Year Setup Section */}
      <FinancialYearSection
        financialYear={financialYear}
        sliderValue={sliderValue}
        onFinancialYearChange={handleFinancialYearChange}
        onFormatLinkClick={handleFinancialFormatLinkClick}
        isEditMode={isEditMode}
      />

      {/* Divider */}
      <Box className="period-setup__divider" />

      {/* Week Setup Section */}
      <WeekSetupSection
        weekSetup={weekSetup}
        onWeekSetupChange={handleWeekSetupChange}
        onFormatLinkClick={handleWeekFormatLinkClick}
        isEditMode={isEditMode}
      />

      {/* Financial Year Format Panel */}
      <FinancialYearFormatPanel
        isOpen={isFormatPanelOpen}
        onClose={() => setIsFormatPanelOpen(false)}
        onSave={handleFormatSave}
        currentFormat={financialYear.format}
        hasAutoGeneratedContent={!!financialYear.name}
        financialYear={{
          startMonth: financialYear.startMonth,
          endMonth: financialYear.endMonth
        }}
      />

      {/* Week Name Format Panel */}
      <WeekNameFormatPanel
        isOpen={isWeekFormatPanelOpen}
        onClose={() => setIsWeekFormatPanelOpen(false)}
        onSave={handleWeekFormatSave}
        currentFormat={weekSetup.format}
        hasAutoGeneratedContent={!!weekSetup.name}
      />
    </Box>
  );
};

export default PeriodSetup;