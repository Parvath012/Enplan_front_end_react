import { useMemo } from 'react';
import { isPeriodSetupMandatoryFieldsFilled, isPeriodSetupModified } from '../../../store/Actions/entityConfigurationActions';

// Custom hook to manage validation logic
export const useValidationLogic = (params: {
  tabValue: number;
  entityId: string | undefined;
  periodSetup: any;
}) => {
  const { tabValue, entityId, periodSetup } = params;

  // Use useMemo to compute these values and memoize them
  const isPeriodSetupMandatoryFieldsFilledValue = useMemo(() => {
    return () => isPeriodSetupMandatoryFieldsFilled(tabValue, entityId, periodSetup);
  }, [tabValue, entityId, periodSetup]);

  const isPeriodSetupModifiedValue = useMemo(() => {
    return () => isPeriodSetupModified(tabValue, entityId, periodSetup);
  }, [tabValue, entityId, periodSetup]);

  return {
    isPeriodSetupMandatoryFieldsFilled: isPeriodSetupMandatoryFieldsFilledValue,
    isPeriodSetupModified: isPeriodSetupModifiedValue
  };
};
