// Shared interface for FormHeader components to eliminate duplication

export interface FormHeaderProps {
  title: string;
  onBack?: () => void;
  onReset?: () => void;
  onCancel?: () => void;
  onSave?: () => void;
  onNext?: () => void;
  onEdit?: () => void;
  showBackButton?: boolean;
  showResetButton?: boolean;
  showCancelButton?: boolean;
  showSaveButton?: boolean;
  showNextButton?: boolean;
  showEditButton?: boolean;
  resetButtonText?: string;
  cancelButtonText?: string;
  saveButtonText?: string;
  nextButtonText?: string;
  editButtonText?: string;
  isFormModified?: boolean;
  isSaveLoading?: boolean;
  isSaveDisabled?: boolean;
  showCancelIconOnly?: boolean;
  isNextDisabled?: boolean;
  statusMessage?: string;
  // Submit functionality
  useSubmitIcon?: boolean;
  submitButtonText?: string;
}

// Extended interface for FormHeaderWithTabs (adds tabs-specific props)
export interface FormHeaderWithTabsProps extends FormHeaderProps {
  tabs: { label: string; value: number }[];
  activeTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

// Interface for FormHeaderButtons (excludes title and children)
export interface FormHeaderButtonsProps extends Omit<FormHeaderProps, 'title'> {
  // All props from FormHeaderProps except title
}
