import React, { Suspense } from 'react';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/Reducers/rootReducer';
import { entitySetupStyles } from '../../styles/entitySetup.styles';

// Module Federation imports
const FormSection = React.lazy(() => import('commonApp/FormSection'));
const TextField = React.lazy(() => import('commonApp/TextField'));
const SelectField = React.lazy(() => import('commonApp/SelectField'));
const MultiSelectField = React.lazy(() => import('commonApp/MultiSelectField'));

interface EntityFormFieldsProps {
  formData: any;
  validationErrors: any;
  entityTypeOptions: string[];
  countryOptions: string[];
  stateOptions: string[];
  currentEntityId?: string; // ID of the current entity being edited (if in edit mode)
  onInputChange: (field: string, value: any) => void;
  onCountryChange: (country: string) => void;
  onEntityTypeChange: (entityType: string) => void;
}

const EntityFormFields: React.FC<EntityFormFieldsProps> = ({
  formData,
  validationErrors,
  entityTypeOptions,
  countryOptions,
  stateOptions,
  currentEntityId,
  onInputChange,
  onCountryChange,
  onEntityTypeChange,
}) => {
  const safeEntityType = entityTypeOptions.includes(formData.entityType) ? formData.entityType : '';
  const safeCountry = countryOptions.includes(formData.country) ? formData.country : '';
  const safeState = stateOptions.includes(formData.state) ? formData.state : '';
  
  // Get entities from Redux store
  const allEntities = useSelector((state: RootState) => state.entities.items);
  
  // Helper functions to reduce cognitive complexity
  const hasNoStatesForCountry = formData.country && stateOptions && stateOptions.length === 0;
  const isStateFieldDisabled = !formData.country || !stateOptions || stateOptions.length === 0;
  const shouldShowStateError = !!validationErrors.state && !hasNoStatesForCountry;
  const isStateRequired = !formData.country || (formData.country && stateOptions && stateOptions.length > 0);
  const statePlaceholder = formData.country ? 'Select State' : 'Please Select Country First';
  const legalNameChangeHandler = currentEntityId ? () => {} : (value: any) => onInputChange('legalBusinessName', value);
  
  // Filter entities for MultiSelectField options
  const filteredEntityOptions = allEntities
    .filter(e => {
      // Show Rollup Entities as options for both Planning and Rollup entities
      // This allows both entity type to have Rollup Entity parents
      const isRollupEntity = (e.entityType || '').toLowerCase().includes('rollup entity');
      const isNotDeleted = !e.softDeleted;
      const isNotCurrentEntity = e.id !== currentEntityId;
      return isRollupEntity && isNotDeleted && isNotCurrentEntity;
    })
    .map(e => e.displayName || e.legalBusinessName);
  
  console.log('🏗️ EntityFormFields render:', {
    formDataCountry: formData.country,
    formDataState: formData.state,
    stateOptions,
    safeState,
    stateIncluded: stateOptions.includes(formData.state)
  });

  // Shared styles for Country and State SelectFields to fix icon positioning in addressRow context
  // These styles prevent .form-field from being stretched and ensure proper icon positioning
  const addressRowSelectFieldStyles = {
    // FIX: Prevent .form-field Box from being stretched by addressRow's alignSelf: stretch
    // This ensures FormControl maintains proper width for icon positioning
    '& .form-field': {
      alignSelf: 'flex-start !important',
      width: '100% !important',
      maxWidth: '100% !important',
      position: 'relative !important',
      boxSizing: 'border-box !important',
    },
    // FIX: Ensure FormControl maintains proper width and positioning context
    '& .form-field .MuiFormControl-root': {
      alignSelf: 'flex-start !important',
      position: 'relative !important',
      width: '100% !important',
      maxWidth: '100% !important',
      boxSizing: 'border-box !important',
    },
    // FIX: Force dropdown icon to position correctly at right: 8px (not center)
    // Use maximum specificity to override any conflicting styles
    '& .form-field .MuiFormControl-root .form-field__dropdown-icon': {
      position: 'absolute !important',
      right: '8px !important',
      left: 'auto !important',
      top: '50% !important',
      bottom: 'auto !important',
      margin: '0 !important',
      transform: 'translateY(-50%) !important',
      zIndex: '1 !important',
      width: '16px !important',
      height: '16px !important',
    },
    '& .form-field .MuiFormControl-root .form-field__dropdown-icon[data-open="true"]': {
      transform: 'translateY(-50%) rotate(180deg) !important',
    },
    '& .form-field .MuiFormControl-root .form-field__dropdown-icon[data-open="false"]': {
      transform: 'translateY(-50%) rotate(0deg) !important',
    },
  };

  return (
    <Box sx={entitySetupStyles.entityFormContainer}>
      <Suspense fallback={<div></div>}>
        <FormSection title="Entity Details">
          <Box sx={entitySetupStyles.formRow}>
            <Box sx={entitySetupStyles.formField}>
              <Suspense fallback={<div></div>}>
                <TextField
                  label="Legal Business Name"
                  value={formData.legalBusinessName}
                  onChange={legalNameChangeHandler}
                  required={!currentEntityId}
                  error={!!validationErrors.legalBusinessName}
                  errorMessage={validationErrors.legalBusinessName}
                  placeholder="Legal Business Name"
                  readOnly={!!currentEntityId} // Make read-only in edit mode
                />
              </Suspense>
            </Box>
            <Box sx={entitySetupStyles.formField}>
              <Suspense fallback={<div></div>}>
                <TextField
                  label="Display Name"
                  required
                  value={formData.displayName}
                  onChange={(value) => onInputChange('displayName', value)}
                  error={!!validationErrors.displayName}
                  errorMessage={validationErrors.displayName}
                  helperText={!validationErrors.displayName ? "If entered, this name will be displayed across application" : undefined}
                  placeholder="Display Name"
                />
              </Suspense>
            </Box>
            <Box sx={entitySetupStyles.formField}>
              <Suspense fallback={<div></div>}>
                <SelectField
                  label="Entity Type"
                  value={safeEntityType}
                  onChange={(v) => onEntityTypeChange(v as string)}
                  options={entityTypeOptions}
                  placeholder="Select Entity Type"
                  required
                  error={!!validationErrors.entityType}
                  errorMessage={validationErrors.entityType}
                />
              </Suspense>
            </Box>
            <Box sx={entitySetupStyles.formField}>
              <Suspense fallback={<div></div>}>
                <MultiSelectField
                  label="Assigned Entity"
                  value={Array.isArray(formData.assignedEntity) ? formData.assignedEntity : []}
                  onChange={(vals) => onInputChange('assignedEntity', vals)}
                  options={filteredEntityOptions}
                  placeholder={"Please Select Entity Type First"}
                  disabled={!formData.entityType}
                  noOptionsMessage="No Rollup Entity"
                />
              </Suspense>
          </Box>
        </Box>
      </FormSection>
    </Suspense>

      {/* Address Section */}
      <Box sx={{ mb: 0}}>
        <Suspense fallback={<div></div>}>
          <FormSection title="Address">
            <Box sx={{...entitySetupStyles.addressRow, mb: 0}}>
              <Box sx={entitySetupStyles.formRow}>
                <Box sx={entitySetupStyles.formField}>
                  <Suspense fallback={<div></div>}>
                    <TextField
                      label="Address Line #1"
                      required
                      value={formData.addressLine1}
                      onChange={(value) => onInputChange('addressLine1', value)}
                      error={!!validationErrors.addressLine1}
                      errorMessage={validationErrors.addressLine1}
                      placeholder="Address Line #1"
                    />
                  </Suspense>
                </Box>
                <Box sx={entitySetupStyles.formField}>
                  <Suspense fallback={<div></div>}>
                    <TextField
                      label="Address Line #2"
                      value={formData.addressLine2}
                      onChange={(value) => onInputChange('addressLine2', value)}
                      error={!!validationErrors.addressLine2}
                      errorMessage={validationErrors.addressLine2}
                      placeholder="Address Line #2"
                    />
                  </Suspense>
                </Box>
              </Box>
              <Box sx={{...entitySetupStyles.formRow, mt: 0}}>
                <Box sx={{
                  ...entitySetupStyles.formField,
                  ...addressRowSelectFieldStyles,
                }}>
                  <Suspense fallback={<div></div>}>
                    <SelectField
                      label="Country"
                      value={safeCountry}
                      onChange={(v) => onCountryChange(v as string)}
                      options={countryOptions}
                      placeholder="Select Country"
                      required
                      error={!!validationErrors.country}
                      errorMessage={validationErrors.country}
                    />
                  </Suspense>
                </Box>
                <Box sx={{
                  ...entitySetupStyles.formField,
                  // Fix border-radius for disabled state fields (like Vatican City state field)
                  ...(hasNoStatesForCountry && {
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px !important',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderRadius: '8px !important',
                        boxShadow: 'none !important',
                        border: '1px solid #E0E0E0 !important'
                      }
                    }
                  }),
                  ...addressRowSelectFieldStyles,
                }}>
                  <Suspense fallback={<div></div>}>
                    <SelectField
                      label="State"
                      value={safeState}
                      required={isStateRequired}
                      onChange={(value) => onInputChange('state', value)}
                      options={stateOptions}
                      placeholder={statePlaceholder}
                      disabled={isStateFieldDisabled}
                      error={shouldShowStateError}
                      errorMessage={validationErrors.state}
                    />
                  </Suspense>
                </Box>
                <Box sx={entitySetupStyles.formField}>
                  <Suspense fallback={<div></div>}>
                    <TextField
                      label="City"
                      value={formData.city}
                      onChange={(value) => onInputChange('city', value)}
                      required
                      error={!!validationErrors.city}
                      errorMessage={validationErrors.city}
                      placeholder="City"
                    />
                  </Suspense>
                </Box>
                <Box sx={entitySetupStyles.formField}>
                  <Suspense fallback={<div></div>}>
                    <TextField
                      label="Pin/Zip Code"
                      value={formData.pinZipCode}
                      onChange={(value) => onInputChange('pinZipCode', value)}
                      required
                      error={!!validationErrors.pinZipCode}
                      errorMessage={validationErrors.pinZipCode}
                      placeholder="Pin/Zip Code"
                    />
                  </Suspense>
                </Box>
              </Box>
            </Box>
          </FormSection>
        </Suspense>
      </Box>
    </Box>
  );
};

export default EntityFormFields;