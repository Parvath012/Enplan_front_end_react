import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
// @ts-ignore - Panel is exposed from commonApp webpack container
import Panel from "commonApp/Panel";
// @ts-ignore - NotificationAlert is exposed from commonApp webpack container
import NotificationAlert from "commonApp/NotificationAlert";
import Step1DownloadTemplate from "./Step1DownloadTemplate";
import Step2UploadFile from "./Step2UploadFile";
import { downloadUserTemplate } from "../../utils/templateDownloadService";
import { parseExcelFile } from "../../utils/excelParserService";
import { saveBulkUsers } from "../../services/bulkUserSaveService";
import { fetchUsers } from "../../store/Reducers/userSlice";
import "./BulkUploadPanel.scss";

interface BulkUploadPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const BulkUploadPanel: React.FC<BulkUploadPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useDispatch();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedUsers, setParsedUsers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotification, setSuccessNotification] = useState({
    open: false,
    message: "",
  });

  const handleDownloadTemplate = () => {
    try {
      downloadUserTemplate();
      console.log("Template downloaded successfully");
    } catch (error) {
      console.error("Error downloading template:", error);
      setUploadError("Failed to download template. Please try again.");
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setUploadError(null);
    setParsedUsers([]);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Parse Excel file
      setUploadProgress(30);
      const { users, errors } = await parseExcelFile(file);

      setUploadProgress(70);

      // Store parsed users
      setParsedUsers(users);

      // If there are validation errors, check the type of error
      if (errors.length > 0) {
        // Check if it's a file format error (missing headers)
        const formatErrors = errors.filter(
          (e) => e.message.includes("doesn't match the expected format")
        );

        // Check if there are mandatory field errors (missing data in rows)
        const mandatoryFieldErrors = errors.filter(
          (e) =>
            e.message.includes("is required") || e.message.includes("required"),
        );

        // Show format error message if headers are incorrect
        if (formatErrors.length > 0) {
          setUploadError("The contents in the file doesn't match the expected format.");
          // If there are format errors, prevent file upload - reset state
          setUploadProgress(0);
          setIsUploading(false);
          setUploadedFile(null);
          setParsedUsers([]);
          return; // Exit early, don't process the file
        } else if (mandatoryFieldErrors.length > 0) {
          // Show mandatory field error message for missing data
          // Keep file visible so error shows below progress bar
          setUploadError("Some mandatory fields are missing.");
          setUploadProgress(100); // Complete progress so it shows below progress bar
          setIsUploading(false);
          // Don't clear uploadedFile - keep it so error displays below progress bar
          setParsedUsers([]);
          return; // Exit early, don't process the file
        } else {
          // If there are other errors, don't show any error message
          setUploadError(null);
        }
      } else {
        setUploadError(null);
      }

      setUploadProgress(100);
      setIsUploading(false);

      console.log(`Successfully parsed ${users.length} users from Excel file`);
      if (errors.length > 0) {
        console.warn("Validation errors found:", errors);
      }
    } catch (error: any) {
      console.error("Error parsing Excel file:", error);
      // Don't show error message for parsing errors - only show mandatory field errors
      setUploadError(null);
      setUploadProgress(0);
      setIsUploading(false);
      setUploadedFile(null);
    }
  };

  const handleUploadError = (error: string | null) => {
    setUploadError(error);
    if (error) {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setParsedUsers([]);
    setUploadProgress(0);
    setUploadError(null);
  };

  const handleSubmit = async () => {
    if (!uploadedFile || parsedUsers.length === 0) {
      // Don't show error message - validation should already be handled
      return;
    }

    if (isSubmitting) {
      return; // Prevent multiple submissions
    }

    setIsSubmitting(true);
    setUploadError(null);

    try {
      console.log(`Submitting ${parsedUsers.length} users for bulk save...`);

      // Save users to database (bulk only - no fallback)
      const result = await saveBulkUsers(parsedUsers);

      // Check if bulk save was successful
      if (result.success && result.savedCount > 0) {
        console.log(`✅ Successfully saved ${result.savedCount} users in bulk`);

        // Refresh users list in Redux store so UserList page shows updated data
        // @ts-ignore
        dispatch(fetchUsers());

        // Show success notification       ${result.savedCount} user(s)
        const message = `Bulk upload successful.All users have been added.`;

        setSuccessNotification({
          open: true,
          message: message,
        });

        // Reset and close panel after a short delay to show notification
        setTimeout(() => {
          setUploadedFile(null);
          setParsedUsers([]);
          setUploadProgress(0);
          setUploadError(null);
          onClose();
        }, 500);
      } else {
        // Bulk save failed - show generic message only for mandatory field errors
        console.error("Bulk save failed:", result.errors);

        if (result.errors.length > 0) {
          // Check if there are mandatory field errors
          const mandatoryFieldErrors = result.errors.filter(
            (e) =>
              e.error.includes("is required") || e.error.includes("required"),
          );

          // Show generic message only for mandatory field errors
          if (mandatoryFieldErrors.length > 0) {
            setUploadError("Some mandatory fields are missing.");
          } else {
            // If there are errors but no mandatory field errors, don't show any error message
            setUploadError(null);
          }
        } else {
          // No errors - don't show error message
          setUploadError(null);
        }
      }
    } catch (error: any) {
      console.error("Error saving users:", error);
      // Don't show error message for save errors - only show mandatory field errors
      setUploadError(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setUploadedFile(null);
    setParsedUsers([]);
    setUploadProgress(0);
    setUploadError(null);
    onClose();
  };

  const isSubmitEnabled =
    uploadedFile !== null &&
    uploadProgress === 100 &&
    parsedUsers.length > 0 &&
    !isUploading &&
    !isSubmitting &&
    uploadError === null;

  const panelContent = (
    <Panel
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Upload"
      resetButtonLabel="Cancel"
      submitButtonLabel="Submit"
      showResetButton={true}
      showSubmitButton={true}
      submitButtonDisabled={!isSubmitEnabled}
      onReset={handleCancel}
      onSubmit={handleSubmit}
      enableBlur={false}
      className="bulk-upload-panel"
    >
      <Step1DownloadTemplate onDownload={handleDownloadTemplate} />

      <Step2UploadFile
        onFileSelect={handleFileUpload}
        onRemoveFile={handleRemoveFile}
        onError={handleUploadError}
        uploadedFile={uploadedFile}
        uploadProgress={uploadProgress}
        uploadError={uploadError}
        isUploading={isUploading}
      />
    </Panel>
  );

  // Render panel at document body level to avoid parent blur affecting it
  return (
    <>
      {typeof document !== "undefined"
        ? createPortal(panelContent, document.body)
        : panelContent}

      {/* Success Notification */}
      <NotificationAlert
        open={successNotification.open}
        variant="success"
        message={successNotification.message}
        onClose={() => setSuccessNotification({ open: false, message: "" })}
        autoHideDuration={3000}
      />
    </>
  );
};

export default BulkUploadPanel;
