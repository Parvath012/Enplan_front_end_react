import React, { useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import { entitySetupStyles } from '../../styles/entitySetup.styles';
import '../../styles/zoomUtils.css';
import { usePreventEmptySpaceSelection } from '../../../../common-app/src/hooks/usePreventEmptySpaceSelection';

// Module Federation imports
const FormHeader = React.lazy(() => import('commonApp/FormHeader'));
const FileUpload = React.lazy(() => import('commonApp/FileUpload'));
const FormFooter = React.lazy(() => import('commonApp/FormFooter'));
const FormSection = React.lazy(() => import('commonApp/FormSection'));
const NotificationAlert = React.lazy(() => import('commonApp/NotificationAlert'));
import EntityFormFields from '../../components/entitySetup/EntityFormFields';
import { useEntityForm } from '../../hooks/useEntityForm';

interface EntitySetupFormProps {
  title?: string;
  onBack?: () => void;
  onCancel?: () => void;
  showBackButton?: boolean;
  showResetButton?: boolean;
  showCancelButton?: boolean;
  customSubmit?: (data: any) => Promise<void>;
  supportedFileExtensions?: string[];
  maxFileSize?: number;
  entityTypes?: string[];
  countries?: string[];
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

const EntitySetupForm: React.FC<EntitySetupFormProps> = ({
  title = 'Entity Setup',
  onBack,
  onCancel,
  showBackButton = true,
  showResetButton = true,
  showCancelButton = true,
  customSubmit,
  supportedFileExtensions = ['.png', '.jpeg', '.jpg', '.svg'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  entityTypes,
  countries,
  onSuccess,
  onError,
}) => {
  // Detect if running in admin app context
  const isInAdminApp = window.location.pathname.includes('/admin/entity-setup');
  
  // State to control horizontal scroll - only enable when absolutely necessary
  const [enableHorizontalScroll, setEnableHorizontalScroll] = useState(false);

  // Hook to prevent empty space text selection
  const containerRef = usePreventEmptySpaceSelection();

  // Use the custom hook for form logic
  const {
    formData,
    validationErrors,
    loading,
    confirmOpen,
    confirmMessage,
    entityTypeOptions,
    countryOptions,
    stateOptions,
    currentEntityId,
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
    isResetEnabled,
    isSaveEnabled,
    setValidationErrors,

  } = useEntityForm(supportedFileExtensions, maxFileSize, onSuccess, onError, customSubmit);

  // Simple and reliable zoom detection
  useEffect(() => {
    const checkZoomLevel = () => {
      // Use a simple approach: check if content width exceeds viewport width
      const formElement = document.querySelector('.entity-setup-form');
      if (formElement) {
        const formWidth = formElement.scrollWidth;
        const viewportWidth = window.innerWidth;
        const needsHorizontalScroll = formWidth > viewportWidth;
        
        setEnableHorizontalScroll(needsHorizontalScroll);
        
        if (needsHorizontalScroll) {
          console.log('Horizontal scroll enabled - form width:', formWidth, 'viewport width:', viewportWidth);
        }
      }
    };

    // Check after component mounts and content loads
    const timer = setTimeout(checkZoomLevel, 500);
    
    // Also check on window resize
    window.addEventListener('resize', checkZoomLevel);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkZoomLevel);
    };
  }, []);

  // Validation helper functions to reduce cognitive complexity
  const validateRequiredFields = (errors: any): void => {
    if (!formData.legalBusinessName?.trim()) {
      errors.legalBusinessName = 'Legal Business Name is required';
    }
    if (!formData.displayName?.trim()) {
      errors.displayName = 'Display Name is required';
    }
    if (!formData.entityType) {
      errors.entityType = 'Entity Type is required';
    }
    if (!formData.country) {
      errors.country = 'Country is required';
    }
    // State is only required if the country has states available
    if (formData.country && stateOptions && stateOptions.length > 0 && !formData.state) {
      errors.state = 'State is required';
    }
    if (!formData.city?.trim()) {
      errors.city = 'City is required';
    }
    if (!formData.pinZipCode?.trim()) {
      errors.pinZipCode = 'Pin/Zip Code is required';
    }
  };

  const validateOptions = (errors: any): void => {
    if (formData.entityType && !entityTypeOptions.includes(formData.entityType)) {
      errors.entityType = 'Please select a valid Entity Type';
    }
    if (formData.country && !countryOptions.includes(formData.country)) {
      errors.country = 'Please select a valid Country';
    }
    if (formData.state && stateOptions.length > 0 && !stateOptions.includes(formData.state)) {
      errors.state = 'Please select a valid State';
    }
  };

  const validateFormats = (errors: any): void => {
    // Character length validations (check these first)
    if (formData.legalBusinessName && formData.legalBusinessName.length > 255) {
      errors.legalBusinessName = 'Field length exceeded — maximum allowed is 255 characters.';
    }
    if (formData.displayName && formData.displayName.length > 255) {
      errors.displayName = 'Field length exceeded — maximum allowed is 255 characters.';
    }
    if (formData.addressLine1 && formData.addressLine1.length > 255) {
      errors.addressLine1 = 'Field length exceeded — maximum allowed is 255 characters.';
    }
    if (formData.addressLine2 && formData.addressLine2.length > 255) {
      errors.addressLine2 = 'Field length exceeded — maximum allowed is 255 characters.';
    }
    
    // City character length validation
    let cityLengthExceeded = false;
    if (formData.city && formData.city.length > 100) {
      errors.city = 'Field length exceeded — maximum allowed is 100 characters.';
      cityLengthExceeded = true;
    }

    // Format validations (only if length is within limits)
    if (formData.city && !cityLengthExceeded && !/^[A-Za-z][A-Za-z .'-]*$/.test(formData.city.trim())) {
      errors.city = "City may contain only letters, spaces, periods, hyphens and apostrophes";
    }
    if (formData.pinZipCode && !/^[A-Za-z0-9 -]{3,10}$/.test(formData.pinZipCode.trim())) {
      errors.pinZipCode = 'Pin/Zip Code must be 3-10 characters and contain only letters, numbers, spaces or hyphens';
    }
  };

  // Main validation function
  const validateForm = (): boolean => {
    const errors: any = {};
    
    validateRequiredFields(errors);
    validateOptions(errors);
    validateFormats(errors);

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Enhanced save handler that validates before saving
  const handleSaveWithValidation = async () => {
    if (!validateForm()) {
      return;
    }

    await handleSave();
  };

      return (
      <Box 
        ref={containerRef}
        className={`entity-setup-form ${enableHorizontalScroll ? 'overflow-detected' : ''}`}
        sx={{
          ...entitySetupStyles.container,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: '100%',
          width: '100%',
          // Additional styles for admin app context
          ...(isInAdminApp && {
            height: '100%',
            maxHeight: '100%',
            position: 'relative',
          }),
        }}>
      {/* Sticky Header - accounts for admin app header */}
      <Box sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: '#fff',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        width: '100%',
        height: '40px',
        minHeight: '40px',
        flexShrink: 0,
        borderBottom: '1px solid #e0e0e0',
        // Ensure sticky behavior works in admin app
        ...(isInAdminApp && {
          position: 'sticky',
          top: 0,
          zIndex: 1001, // Higher than admin app header
        }),
      }}>
        <FormHeader
          title={title}
          onBack={onBack || handleBack}
          onReset={handleReset}
          onCancel={onCancel || handleCancel}
          onSave={() => { void handleSaveWithValidation(); }}
          showBackButton={showBackButton}
          showResetButton={showResetButton}
          showCancelButton={showCancelButton}
          showSaveButton={true}
          isFormModified={isResetEnabled()}
          isSaveLoading={loading}
          isSaveDisabled={loading || !isSaveEnabled()}
        />
      </Box>

      {/* Scrollable Content Container */}
      <Box
        className={isInAdminApp ? 'entity-setup-scrollable' : ''}
        sx={{
          ...entitySetupStyles.scrollableContent,
          flex: '1 1 auto',
          overflowY: 'auto',
          overflowX: 'hidden',
          height: 'calc(100% - 40px)',
          // Additional styles for admin app context
          ...(isInAdminApp && {
            height: 'calc(100% - 40px)',
            overflowY: 'auto',
            overflowX: 'hidden',
          }),
        }}
      >
        <Container maxWidth="xl" sx={{py: { xs: 1.5, sm: 1.5, md: 1.5 },
                                      px: { xs: 1.5, sm: 1.5, md: 1.5 }}}>
          {/* Entity Form Fields */}
          <EntityFormFields
            formData={formData}
            validationErrors={validationErrors}
            entityTypeOptions={entityTypeOptions}
            countryOptions={countryOptions}
            stateOptions={stateOptions}
            currentEntityId={currentEntityId}
            onInputChange={handleInputChange}
            onCountryChange={handleCountryChange}
            onEntityTypeChange={handleEntityTypeChange}
          />

        {/* Entity Logo Section and Footer in Responsive Grid */}
          <Box sx={{...entitySetupStyles.gridContainer, mt: '12px'}}>
            {/* Entity Logo Section - 9 columns */}
            <Box sx={entitySetupStyles.gridItemLogo}>
              <FormSection>
                <FileUpload
                  file={formData.entityLogo}
                  previewSrc={formData.logo as any}
                  onFileChange={handleFileUpload}
                  onCheckboxChange={(checked: boolean) => handleInputChange('setAsDefault', checked)}
                  checkboxChecked={formData.setAsDefault}
                  checkboxLabel="Set as default"
                  uploadLabel="Entity Logo"
                  supportedExtensions={supportedFileExtensions}
                  maxFileSize={maxFileSize}
                />
              </FormSection>
            </Box>

          {/* Add Another Footer - 3 columns */}
          <Box sx={entitySetupStyles.gridItemFooter}>
            <FormFooter
              leftCheckbox={{
                checked: formData.addAnother,
                onChange: (checked: boolean) => handleInputChange('addAnother', checked),
                label: 'Add Another',
              }}
            />
          </Box>
        </Box>
      </Container>
      </Box>

      {/* Top-right confirmation for Reset/Cancel */}
      <NotificationAlert
        open={confirmOpen}
        variant="warning"
        title="Warning – Action Required"
        message={confirmMessage}
        onClose={handleConfirmNo}
        actions={[
          { label: 'No', onClick: handleConfirmNo, emphasis: 'secondary' },
          { label: 'Yes', onClick: handleConfirmYes, emphasis: 'primary' },
        ]}
      />
    </Box>
  );
};

export default EntitySetupForm;