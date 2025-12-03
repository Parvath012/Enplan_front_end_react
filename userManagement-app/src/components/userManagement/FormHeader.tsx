import React from 'react';
import { Box } from '@mui/material';
import FormHeaderWithTabs from 'commonApp/FormHeaderWithTabs';

interface FormHeaderProps {
  title: string;
  tabs: Array<{ label: string; value: number }>;
  activeTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  onBack: () => void;
  onReset: () => void;
  onCancel: () => void;
  onSave: () => void;
  onNext: () => void;
  isFormModified: boolean;
  isSaveDisabled: boolean;
  isNextDisabled: boolean;
  showSaveButton: boolean;
  showNextButton: boolean;
  useSubmitIcon: boolean;
  submitButtonText: string;
  statusMessage?: string;
}

const FormHeader: React.FC<FormHeaderProps> = ({
  title,
  tabs,
  activeTab,
  onTabChange,
  onBack,
  onReset,
  onCancel,
  onSave,
  onNext,
  isFormModified,
  isSaveDisabled,
  isNextDisabled,
  showSaveButton,
  showNextButton,
  useSubmitIcon,
  submitButtonText,
  statusMessage
}) => {
  return (
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
    }}>
      <FormHeaderWithTabs
        title={title}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onBack={onBack}
        onReset={onReset}
        onCancel={onCancel}
        onSave={onSave}
        onNext={onNext}
        isFormModified={isFormModified}
        isSaveDisabled={isSaveDisabled}
        isNextDisabled={isNextDisabled}
        showSaveButton={showSaveButton}
        showNextButton={showNextButton}
        useSubmitIcon={useSubmitIcon}
        submitButtonText={submitButtonText}
        statusMessage={statusMessage}
      />
    </Box>
  );
};

export default FormHeader;

