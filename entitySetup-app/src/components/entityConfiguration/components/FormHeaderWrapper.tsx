import React from 'react';
// Module Federation imports
const FormHeader = React.lazy(() => import('commonApp/FormHeader'));
import { 
  getEditButtonVisibility,
  getFormModifiedState,
  getSaveDisabledState
} from '../../../store/Actions/entityConfigurationActions';
import { usePreventEmptySpaceSelection } from '../../../../../common-app/src/hooks/usePreventEmptySpaceSelection';

interface FormHeaderWrapperProps {
  isEditMode: boolean;
  isNextEnabled: boolean;
  isSaving: boolean;
  tabValue: number;
  isDataSaved: boolean;
  selectedCountries: string[];
  selectedCurrencies: string[];
  entityId: string | undefined;
  entity?: any; // Entity object to check progressPercentage
  periodSetup: any;
  modulesState: any;
  isDataModified: boolean;
  isPeriodSetupMandatoryFieldsFilled: () => boolean;
  isPeriodSetupModified: () => boolean;
  isRollupEntity: boolean;
  getHeaderTitle: () => string;
  onBack: () => void;
  onSave: () => void;
  onReset: () => void;
  onEdit: () => void;
  onNext: () => void;
  onFinish: () => void;
}

const FormHeaderWrapper: React.FC<FormHeaderWrapperProps> = ({
  isEditMode,
  isNextEnabled,
  isSaving,
  tabValue,
  isDataSaved,
  selectedCountries,
  selectedCurrencies,
  entityId,
  entity,
  periodSetup,
  modulesState,
  isDataModified,
  isPeriodSetupMandatoryFieldsFilled,
  isPeriodSetupModified,
  isRollupEntity,
  getHeaderTitle,
  onBack,
  onSave,
  onReset,
  onEdit,
  onNext,
  onFinish
}) => {
  const wrapperRef = usePreventEmptySpaceSelection();

  return (
    <div ref={wrapperRef}>
      <FormHeader
        key={`form-header-${isEditMode}-${isNextEnabled}`}
        title={getHeaderTitle()}
        onBack={onBack}
        showBackButton={true}
        // Save Button: Show only in edit mode, enabled when mandatory fields filled AND data is modified
        showSaveButton={isEditMode}
        onSave={onSave}
        // Reset Button: Show only in edit mode, enabled when fields are modified (controlled by isFormModified)
        showResetButton={isEditMode}
        onReset={onReset}
        // Edit Button: Show only when NOT in edit mode AND data is saved AND has valid data
        showEditButton={getEditButtonVisibility({
          tabValue,
          isEditMode,
          isDataSaved,
          selectedCountries,
        selectedCurrencies,
        entityId,
        periodSetup,
        modulesState
      })}
      onEdit={onEdit}
      // Next Button: Always show, enabled only after successful save
      showNextButton={true}
      onNext={(isRollupEntity && tabValue === 1) || (!isRollupEntity && tabValue === 2) ? onFinish : onNext}
      nextButtonText={(isRollupEntity && tabValue === 1) || (!isRollupEntity && tabValue === 2) ? 'Finish' : 'Next'}
      showCancelButton={false}
      isNextDisabled={!isNextEnabled}
      isFormModified={getFormModifiedState(tabValue, isDataModified, isPeriodSetupModified, modulesState)}
      isSaveDisabled={getSaveDisabledState({
        tabValue,
        selectedCountries,
        selectedCurrencies,
        isDataModified,
        isDataSaved,
        isPeriodSetupMandatoryFieldsFilled,
        isPeriodSetupModified,
        modulesState,
        entity
      })}
      isSaveLoading={isSaving}
      />
    </div>
  );
};export default FormHeaderWrapper;
