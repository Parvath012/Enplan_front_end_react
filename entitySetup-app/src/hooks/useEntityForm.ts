import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store/configureStore';
import {
  initializeEntitySetup,
  handleCountryChange as handleCountryChangeAction,
  submitEntitySetup,
  resetForm,
  updateField,
  setOriginalFormData,
  setFormModified,
  setEditMode,
  clearStatesReloadFlag,
} from '../store/Actions/entitySetupActions';
import { fetchEntities } from '../store/Reducers/entitySlice';
// Module Federation imports - TypeScript ignore for remote module
// @ts-ignore
import { convertFileToBase64, validateImageFile } from 'commonApp/imageUtils';

interface ValidationErrors {
  legalBusinessName?: string;
  displayName?: string;
  entityType?: string;
  country?: string;
  state?: string;
  city?: string;
  pinZipCode?: string;
}

export const useEntityForm = (
  supportedFileExtensions: string[] = ['.png', '.jpeg', '.jpg', '.svg'],
  maxFileSize: number = 10 * 1024 * 1024,
  onSuccess?: (data: any) => void,
  onError?: (error: string) => void,
  customSubmit?: (data: any) => Promise<void>
) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [prefilled, setPrefilled] = useState<boolean>(false);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [hasFormData, setHasFormData] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [confirmType, setConfirmType] = useState<'reset' | 'cancel' | null>(null);
  const [confirmMessage, setConfirmMessage] = useState<string>('');
  const [userChangedCountry, setUserChangedCountry] = useState<boolean>(false);
  const [isResetReload, setIsResetReload] = useState<boolean>(false);

  const {
    formData,
    countries: storeCountries,
    entityTypes: storeEntityTypes,
    states,
    loading,
    error,
    success,
    isFormModified,
    shouldReloadStatesForCountry,
  } = useSelector((state: RootState) => state.entitySetup);

  const entities = useSelector((state: RootState) => state.entities.items);
  const entitiesLoading = useSelector((state: RootState) => state.entities.loading);

  // Option lists for validation and selects
  const finalCountries = storeCountries;
  const finalEntityTypes = storeEntityTypes;
  const entityTypeOptions = Array.isArray(finalEntityTypes) ? finalEntityTypes : [];
  const countryOptions = Array.isArray(finalCountries) ? finalCountries : [];
  const stateOptions = Array.isArray(states) ? states : [];

  // Initialize form
  useEffect(() => {
    const edit = !!id;
    setIsEditMode(edit);
    dispatch(setEditMode(edit));
    
    // @ts-ignore - Redux Toolkit async action
    dispatch(initializeEntitySetup(id ? { skipReset: true } : undefined));
  }, [dispatch, id]);

  // Load entities for edit mode
  useEffect(() => {
    if (id) {
      // @ts-ignore - Redux Toolkit async action
      dispatch(fetchEntities());
    }
  }, [id, dispatch]);

  // Check if form has any data
  useEffect(() => {
    const hasData = !!(
      formData.legalBusinessName?.trim() ||
      formData.displayName?.trim() ||
      formData.entityType ||
      (Array.isArray(formData.assignedEntity) ? formData.assignedEntity.length > 0 : (!!(formData as any).assignedEntity && String((formData as any).assignedEntity).trim() !== '')) ||
      formData.addressLine1?.trim() ||
      formData.addressLine2?.trim() ||
      formData.country ||
      formData.state ||
      formData.city?.trim() ||
      formData.pinZipCode?.trim() ||
      formData.entityLogo ||
      formData.setAsDefault ||
      formData.addAnother
    );
    setHasFormData(hasData);
  }, [formData, isEditMode]);

  // Prefill form when editing
  useEffect(() => {
    if (id && !prefilled && !entitiesLoading && entities?.length > 0 && countryOptions?.length > 0) {
      const entity = entities.find((e) => String(e.id) === String(id));
      if (entity) {
        const assignedList = (() => {
          if (Array.isArray(entity.assignedEntity)) {
            // Filter out empty strings and invalid values
            return (entity.assignedEntity as string[]).filter(item => 
              item && item.trim() !== '' && item !== '[]'
            );
          }
          if (typeof entity.assignedEntity === 'string' && entity.assignedEntity.trim() !== '') {
            try {
              // Try to parse as JSON first (for saved data)
              const parsed = JSON.parse(entity.assignedEntity);
              if (Array.isArray(parsed)) {
                // Filter out empty strings and invalid values
                return parsed.filter((item: any) => 
                  item && String(item).trim() !== '' && String(item) !== '[]'
                ) as string[];
              }
              // If not an array, treat as single value (only if valid)
              const singleValue = String(parsed);
              return singleValue && singleValue.trim() !== '' && singleValue !== '[]' ? [singleValue] : [];
            } catch {
              // If JSON parsing fails, treat as single string value (only if valid)
              const singleValue = String(entity.assignedEntity);
              return singleValue && singleValue.trim() !== '' && singleValue !== '[]' ? [singleValue] : [];
            }
          }
          return [];
        })();

        const originalData = {
          id: entity.id,
          legalBusinessName: entity.legalBusinessName ?? '',
          displayName: entity.displayName ?? '',
          entityType: entity.entityType ?? '',
          assignedEntity: assignedList,
          addressLine1: entity.addressLine1 ?? '',
          addressLine2: entity.addressLine2 ?? '',
          country: entity.country ?? '',
          state: entity.state ?? '',
          city: entity.city ?? '',
          pinZipCode: entity.pinZipCode ?? '',
          entityLogo: null,
          logo: entity.logo ?? null,
          setAsDefault: !!entity.setAsDefault,
          addAnother: false,
          currencies: entity.currencies ?? undefined,
          isDeleted: entity.isDeleted ?? false,
          isConfigured: entity.isConfigured ?? false,
          isEnabled: entity.isEnabled ?? true,
          softDeleted: entity.softDeleted ?? false,
          createdAt: entity.createdAt,
          lastUpdatedAt: entity.lastUpdatedAt,
        };
        
        dispatch(setOriginalFormData(originalData));
        dispatch(updateField({ field: 'id', value: entity.id }));
        dispatch(updateField({ field: 'legalBusinessName', value: entity.legalBusinessName ?? '' }));
        dispatch(updateField({ field: 'displayName', value: entity.displayName ?? '' }));
        dispatch(updateField({ field: 'entityType', value: entity.entityType ?? '' }));
        dispatch(updateField({ field: 'assignedEntity', value: assignedList }));
        dispatch(updateField({ field: 'addressLine1', value: entity.addressLine1 ?? '' }));
        dispatch(updateField({ field: 'addressLine2', value: entity.addressLine2 ?? '' }));
        dispatch(updateField({ field: 'city', value: entity.city ?? '' }));
        dispatch(updateField({ field: 'pinZipCode', value: entity.pinZipCode ?? '' }));
        dispatch(updateField({ field: 'setAsDefault', value: !!entity.setAsDefault }));
        dispatch(updateField({ field: 'logo', value: entity.logo ?? null }));
        dispatch(updateField({ field: 'currencies', value: entity.currencies ?? undefined }));
        dispatch(updateField({ field: 'country', value: entity.country ?? '' }));
        dispatch(updateField({ field: 'isDeleted', value: entity.isDeleted ?? false }));
        dispatch(updateField({ field: 'isConfigured', value: entity.isConfigured ?? false }));
        dispatch(updateField({ field: 'isEnabled', value: entity.isEnabled ?? true }));
        dispatch(updateField({ field: 'softDeleted', value: entity.softDeleted ?? false }));
        dispatch(updateField({ field: 'createdAt', value: entity.createdAt }));
        dispatch(updateField({ field: 'lastUpdatedAt', value: entity.lastUpdatedAt }));
        
        // @ts-ignore
        dispatch(handleCountryChangeAction(entity.country ?? ''));
        dispatch(setFormModified(false));
        
        setPrefilled(true);
      }
    }
  }, [id, entities, countryOptions, entityTypeOptions, prefilled, dispatch]);

  // Handle state setting after states are loaded - ONLY during initial prefill or reset
  useEffect(() => {
    if (id && prefilled && entities?.length > 0 && formData.country && states?.length > 0) {
      const entity = entities.find((e) => String(e.id) === String(id));
      if (entity?.state) {
        // Conditions for state restoration
        const isInitialLoad = !formData.state;
        const isOriginalCountry = formData.country === entity.country;
        const hasUserChangedCountry = userChangedCountry;
        const isAfterReset = shouldReloadStatesForCountry === formData.country;
        
        console.log('🔍 State restoration check:', {
          hasUserChangedCountry,
          isInitialLoad,
          isOriginalCountry,
          isAfterReset,
          shouldReloadStatesForCountry,
          currentCountry: formData.country,
          originalCountry: entity.country,
          currentState: formData.state,
          originalState: entity.state
        });
        
        // Restore state ONLY in these scenarios:
        // 1. Initial load for original country when user hasn't changed country
        // 2. During reset reload (isResetReload flag is true)
        const shouldRestoreState = (!hasUserChangedCountry && isInitialLoad && isOriginalCountry) || 
                                   (isResetReload && isAfterReset);
        
        if (shouldRestoreState) {
          console.log('✅ Restoring original state:', entity.state);
          dispatch(updateField({ field: 'state', value: entity.state ?? '' }));
          // Clear the reset reload flag after restoration
          if (isResetReload) {
            setIsResetReload(false);
          }
        } else if (hasUserChangedCountry && formData.state && !states?.includes(formData.state)) {
          // Clear invalid state when user changed country - don't restore original
          console.log('🔄 Clearing invalid state after country change');
          dispatch(updateField({ field: 'state', value: '' }));
        }
      }
    }
  }, [id, prefilled, entities, formData.country, states, formData.state, dispatch, userChangedCountry, shouldReloadStatesForCountry]);

  // Handle states reload after reset in edit mode
  useEffect(() => {
    if (shouldReloadStatesForCountry && isEditMode) {
      console.log('🔄 Reloading states for country after reset:', shouldReloadStatesForCountry);
      // Mark this as a reset-triggered reload
      setIsResetReload(true);
      setUserChangedCountry(false);
      // @ts-ignore
      dispatch(handleCountryChangeAction(shouldReloadStatesForCountry));
      // Clear the flag after processing
      dispatch(clearStatesReloadFlag());
    }
  }, [shouldReloadStatesForCountry, isEditMode, dispatch]);

  // Success/Error handling
  useEffect(() => {
    if (success && onSuccess) {
      onSuccess(formData);
    }
  }, [success, formData, onSuccess]);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // Form handlers
  const handleInputChange = useCallback((field: string, value: any) => {
    dispatch(updateField({ field, value }));
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [dispatch, validationErrors]);

  const handleCountryChange = useCallback((country: string) => {
    // Mark that user has manually changed the country
    setUserChangedCountry(true);
    // Clear any reset reload flag since this is a manual user action
    setIsResetReload(false);
    // @ts-ignore - Redux Toolkit async action
    dispatch(handleCountryChangeAction(country));
    setValidationErrors(prev => ({ ...prev, country: undefined, state: undefined }));
  }, [dispatch]);

  const handleEntityTypeChange = useCallback((entityType: string) => {
    const previousEntityType = formData.entityType;
    const currentAssignedEntities = Array.isArray(formData.assignedEntity) ? formData.assignedEntity : [];
    
    // Update entity type first
    handleInputChange('entityType', entityType);
    
    // Preserve assigned entities when changing entity types to maintain parent-child relationships
    // This ensures that when a Planning Entity is changed to a Rollup Entity, 
    // the existing parent-child relationships are not lost
    if (previousEntityType && entityType && currentAssignedEntities.length > 0) {
      console.log('Preserving assigned entities during entity type change:', {
        from: previousEntityType,
        to: entityType,
        assignedEntities: currentAssignedEntities,
        count: currentAssignedEntities.length
      });
      
      // Verify that assigned entities are still preserved after entity type change
      setTimeout(() => {
        const updatedAssignedEntities = Array.isArray(formData.assignedEntity) ? formData.assignedEntity : [];
        if (updatedAssignedEntities.length !== currentAssignedEntities.length) {
          console.warn('Assigned entities were not preserved correctly during entity type change');
        } else {
          console.log('Assigned entities preserved successfully:', updatedAssignedEntities);
        }
      }, 0);
    }
    
    if (validationErrors.entityType) {
      setValidationErrors(prev => ({ ...prev, entityType: undefined }));
    }
  }, [handleInputChange, validationErrors, formData.entityType, formData.assignedEntity]);

  // Clear state validation errors for countries without states (e.g., Vatican City)
  useEffect(() => {
    if (formData.country && states && states.length === 0 && validationErrors.state) {
      // Country selected has no states available, clear any state validation errors
      setValidationErrors(prev => ({ ...prev, state: undefined }));
    }
  }, [formData.country, states, validationErrors.state]);

  const handleFileUpload = useCallback(async (file: File | null) => {
    if (file) {
      const validation = validateImageFile(file, maxFileSize / (1024 * 1024), supportedFileExtensions);
      if (!validation.isValid) {
        console.error('File validation failed:', validation.error);
        return;
      }

      const conversionResult = await convertFileToBase64(file);
      if (!conversionResult.success) {
        console.error('File conversion failed:', conversionResult.error);
        return;
      }

      handleInputChange('entityLogo', file);
      handleInputChange('logo', conversionResult.data);
    } else {
      handleInputChange('entityLogo', null);
      handleInputChange('logo', null);
    }
  }, [handleInputChange, supportedFileExtensions, maxFileSize]);

  // Button state helpers
  const isResetEnabled = useCallback(() => {
    if (isEditMode) {
      return isFormModified;
    } else {
      return hasFormData;
    }
  }, [isEditMode, isFormModified, hasFormData]);

  const isSaveEnabled = useCallback(() => {
    // Check required fields - state is only required if country has states
    const hasRequiredFields = !!(
      formData.legalBusinessName?.trim() &&
      formData.displayName?.trim() &&
      formData.entityType &&
      formData.addressLine1?.trim() &&
      formData.country &&
      formData.city?.trim() &&
      formData.pinZipCode?.trim()
    );
    
    // State validation: only required if country has states available
    let isStateValid = true;
    if (formData.country && states && states.length > 0) {
      // Country has states - state selection is required and must be valid
      if (!formData.state?.trim()) {
        isStateValid = false;
      } else {
        isStateValid = states.includes(formData.state);
      }
    }
    // If country has no states (like Vatican City), state validation is automatically passed
    
    // Only count real errors (not keys with undefined values)
    const realErrors = Object.values(validationErrors).filter(v => v !== undefined && v !== null && v !== '');
    const hasNoValidationErrors = realErrors.length === 0;

    const allFieldsValid = hasRequiredFields && isStateValid && hasNoValidationErrors;

    if (isEditMode) {
      // In edit mode: enabled when form is valid AND modified
      return allFieldsValid && isFormModified;
    } else {
      // In new form mode: enabled when form is valid
      return allFieldsValid;
    }
  }, [isEditMode, isFormModified, formData, states, validationErrors]);

  // Confirmation helpers
  const openConfirm = useCallback((type: 'reset' | 'cancel') => {
    if (type === 'reset') {
      setConfirmMessage('Once clicked, it will clear all entered data.\n\nDo you want to continue?');
    } else if (type === 'cancel') {
      setConfirmMessage('Once clicked, all entered data will be lost and the screen will be closed.\n\nDo you want to continue?');
    }
    setConfirmType(type);
    setConfirmOpen(true);
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmOpen(false);
    setConfirmType(null);
  }, []);

  const performReset = useCallback(() => {
    dispatch(resetForm());
    setUserChangedCountry(false); // Reset the user changed country flag during reset
    setIsResetReload(false); // Clear any reset reload flags
    setValidationErrors({});
    if (isEditMode) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [dispatch, isEditMode]);

  const performCancel = useCallback(() => {
    dispatch(resetForm());
    window.history.back();
  }, [dispatch]);

  const handleConfirmYes = useCallback(() => {
    if (confirmType === 'reset') {
      performReset();
      closeConfirm();
    } else if (confirmType === 'cancel') {
      performCancel();
      closeConfirm();
    }
  }, [confirmType, performReset, performCancel, closeConfirm]);

  const handleConfirmNo = useCallback(() => {
    closeConfirm();
  }, [closeConfirm]);

  const handleReset = useCallback(() => {
    openConfirm('reset');
  }, [openConfirm]);

  const handleCancel = useCallback(() => {
    const hasChanges = isEditMode ? isFormModified : hasFormData;
    if (!hasChanges) {
      window.history.back();
      return;
    }
    openConfirm('cancel');
  }, [isEditMode, isFormModified, hasFormData, openConfirm]);

  const handleBack = useCallback(() => {
    window.history.back();
  }, []);

  const handleSave = useCallback(async () => {
    const submissionData = { ...formData };
    
    try {
      if (customSubmit) {
        await customSubmit(submissionData);
      } else {
        // @ts-ignore - Redux Toolkit async action
        dispatch(submitEntitySetup(submissionData));
        
        // If this is an edit operation and user is not adding another, 
        // ensure the original form data is updated with the new saved values
        if (isEditMode && !submissionData.addAnother) {
          // Update the original form data to reflect the saved changes
          dispatch(setOriginalFormData({ ...submissionData }));
          // Reset form modification state since data is now saved
          dispatch(setFormModified(false));
        }
        
        if (!submissionData.addAnother) {
          const isInAdminApp = window.location?.pathname?.includes('/admin/entity-setup') ?? false;
          const redirectPath = isInAdminApp ? '/admin/entity-setup' : '/';
          navigate(redirectPath);
        }
      }
    } catch (error) {
      console.error('Failed to save entity:', error);
    }
  }, [formData, customSubmit, dispatch, navigate, isEditMode]);

  return {
    // State
    formData,
    validationErrors,
    loading,
    error,
    success,
    isFormValid,
    isEditMode,
    hasFormData,
    confirmOpen,
    confirmType,
    confirmMessage,
    
    // Options
    entityTypeOptions,
    countryOptions,
    stateOptions,
    
    // Handlers
    handleInputChange,
    handleCountryChange,
    handleEntityTypeChange,
    handleFileUpload,
    handleReset,
    handleCancel,
    handleBack,
    handleSave,
    handleConfirmYes,
    handleConfirmNo,
    
    // Helpers
    isResetEnabled,
    isSaveEnabled,
    setValidationErrors,
    setIsFormValid,
    
    // Current entity ID for edit mode
    currentEntityId: id,
  };
};
