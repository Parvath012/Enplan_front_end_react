import React from 'react';
import { Box } from '@mui/material';
import SelectField from 'commonApp/SelectField';
import TextField from 'commonApp/TextField';
import MultiSelectField from 'commonApp/MultiSelectField';

interface DuplicatePermissionFormFieldsProps {
  sourceLabel: string;
  sourceValue: string;
  sourceOptions: string[];
  sourcePlaceholder: string;
  sourceError?: string;
  onSourceChange: (value: string) => void;
  onSourceErrorClear?: () => void;
  
  targetLabel: string;
  targetValue: string;
  targetPlaceholder: string;
  
  modulesLabel: string;
  modulesValue: string[];
  modulesOptions: string[];
  modulesPlaceholder: string;
  onModulesChange: (values: string[]) => void;
}

const DuplicatePermissionFormFields: React.FC<DuplicatePermissionFormFieldsProps> = ({
  sourceLabel,
  sourceValue,
  sourceOptions,
  sourcePlaceholder,
  sourceError,
  onSourceChange,
  onSourceErrorClear,
  targetLabel,
  targetValue,
  targetPlaceholder,
  modulesLabel,
  modulesValue,
  modulesOptions,
  modulesPlaceholder,
  onModulesChange
}) => {
  return (
    <>
      {/* Select Source - styled like Role dropdown */}
      <Box className="duplicate-panel__field form-field form-field--required">
        <SelectField
          label={sourceLabel}
          value={sourceValue}
          onChange={(value: string) => {
            onSourceChange(value);
            if (onSourceErrorClear) {
              onSourceErrorClear();
            }
          }}
          options={sourceOptions}
          placeholder={sourcePlaceholder}
          required={true}
          error={!!sourceError}
          errorMessage={sourceError}
          width="100%"
        />
      </Box>

      {/* Target - Prefilled and non-editable */}
      <Box className="duplicate-panel__field form-field form-field--required">
        <TextField
          label={targetLabel}
          value={targetValue}
          onChange={() => {}} // No-op for read-only
          placeholder={targetPlaceholder}
          required={true}
          disabled={true}
          readOnly={true}
          error={false}
          errorMessage=""
          width="100%"
        />
      </Box>

      {/* Select Modules - Optional Multi-select */}
      <Box className="duplicate-panel__field form-field">
        <MultiSelectField
          label={modulesLabel}
          value={modulesValue}
          onChange={(values: string[]) => onModulesChange(values)}
          options={modulesOptions}
          placeholder={modulesPlaceholder}
          required={false}
          error={false}
          errorMessage=""
          width="100%"
          height="30px"
          showSelectAll={true}
          showSelectedItems={true}
          maxSelectedItemsDisplay={3}
          maxDropdownHeight={200}
        />
      </Box>
    </>
  );
};

export default DuplicatePermissionFormFields;



