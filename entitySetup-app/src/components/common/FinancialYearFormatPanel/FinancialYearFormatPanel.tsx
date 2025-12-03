import React from 'react';
import FormatPanel from '../FormatPanel/FormatPanel';
import { FINANCIAL_YEAR_FORMAT_OPTIONS, MONTHS } from '../../../constants/periodSetupConstants';
import { generateFinancialYearName, calculateFinancialYearYears } from 'commonApp/formatUtils';

interface FinancialYearFormatPanelProps {
isOpen: boolean;
onClose: () => void;
onSave: (format: string, preview: string) => void; // parent expects both format & preview
currentFormat?: string;
financialYear?: {
startMonth: string;
endMonth: string;
};
}

const FinancialYearFormatPanel: React.FC<FinancialYearFormatPanelProps> = ({
isOpen,
onClose,
onSave,
currentFormat = 'FY {yy} - {yy}',
financialYear
}) => {
const generatePreview = (format: string): string => {
if (financialYear?.startMonth && financialYear?.endMonth) {
const { financialYearStart, financialYearEnd } = calculateFinancialYearYears(
financialYear.startMonth,
financialYear.endMonth,
MONTHS
);
return generateFinancialYearName(format, financialYearStart, financialYearEnd);
}
const currentYear = new Date().getFullYear();
return generateFinancialYearName(format, currentYear, currentYear);
};

// Called by FormatPanel with the selected format string
const handlePanelSave = (selectedFormat: string, _previewFromPanel?: string) => {
// generatePreview ensures correct preview based on months and passed format
const preview = generatePreview(selectedFormat);
onSave(selectedFormat, preview);
// NOTE: FormatPanel will call onClose() after save; if not, parent will close panel via its own state
};

return ( <FormatPanel
   isOpen={isOpen}
   onClose={onClose}
   onSave={handlePanelSave}
   title="Financial Year Name Format"
   formatOptions={FINANCIAL_YEAR_FORMAT_OPTIONS}
   currentFormat={currentFormat}
   previewText={generatePreview(currentFormat)}
   generatePreview={generatePreview}
 />
);
};

export default FinancialYearFormatPanel;


