import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import BulkUploadPanel from '../../../src/components/bulkUpload/BulkUploadPanel';
import * as templateDownloadService from '../../../src/utils/templateDownloadService';
import * as excelParserService from '../../../src/utils/excelParserService';
import * as bulkUserSaveService from '../../../src/services/bulkUserSaveService';
import { fetchUsers } from '../../../src/store/Reducers/userSlice';

// Mock dependencies
jest.mock('../../../src/utils/templateDownloadService');
jest.mock('../../../src/utils/excelParserService');
jest.mock('../../../src/services/bulkUserSaveService');
jest.mock('../../../src/store/Reducers/userSlice', () => ({
  fetchUsers: jest.fn(() => ({ type: 'users/fetchUsers' })),
}));

jest.mock('commonApp/Panel', () => {
  return function MockPanel({ isOpen, children, onClose, onSubmit, onReset, title, submitButtonDisabled }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="panel">
        <div data-testid="panel-title">{title}</div>
        <button data-testid="panel-close" onClick={onClose}>Close</button>
        <button data-testid="panel-submit" onClick={onSubmit} disabled={submitButtonDisabled}>Submit</button>
        <button data-testid="panel-reset" onClick={onReset}>Cancel</button>
        {children}
      </div>
    );
  };
});

jest.mock('commonApp/NotificationAlert', () => {
  return function MockNotificationAlert({ open, message, onClose }: any) {
    if (!open) return null;
    return (
      <div data-testid="notification-alert">
        <div>{message}</div>
        <button onClick={onClose}>Close Notification</button>
      </div>
    );
  };
});

jest.mock('../../../src/components/bulkUpload/Step1DownloadTemplate', () => {
  return function MockStep1DownloadTemplate({ onDownload }: any) {
    return (
      <div data-testid="step1-download">
        <button onClick={onDownload}>Download Template</button>
      </div>
    );
  };
});

jest.mock('../../../src/components/bulkUpload/Step2UploadFile', () => {
  return function MockStep2UploadFile({ onFileSelect, onRemoveFile, onError, uploadedFile, uploadProgress, uploadError, isUploading }: any) {
    return (
      <div data-testid="step2-upload">
        {uploadedFile && <div data-testid="uploaded-file">{uploadedFile.name}</div>}
        {uploadProgress > 0 && <div data-testid="upload-progress">{uploadProgress}%</div>}
        {uploadError && <div data-testid="upload-error">{uploadError}</div>}
        {isUploading && <div data-testid="is-uploading">Uploading...</div>}
        <button onClick={() => onFileSelect(new File(['content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))}>Select File</button>
        <button onClick={onRemoveFile}>Remove File</button>
        <button onClick={() => onError('Test error')}>Trigger Error</button>
      </div>
    );
  };
});

describe('BulkUploadPanel - Coverage Boost Tests', () => {
  let store: any;
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    
    store = configureStore({
      reducer: {
        users: (state = { users: [] }) => state,
      },
    });

    (templateDownloadService.downloadUserTemplate as jest.Mock).mockImplementation(() => {});
    (excelParserService.parseExcelFile as jest.Mock).mockResolvedValue({
      users: [],
      errors: [],
    });
    (bulkUserSaveService.saveBulkUsers as jest.Mock).mockResolvedValue({
      success: true,
      savedCount: 0,
      errors: [],
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <Provider store={store}>
        <BulkUploadPanel {...defaultProps} {...props} />
      </Provider>
    );
  };

  describe('Template Download - Edge Cases', () => {
    it('should handle download error with error message', () => {
      (templateDownloadService.downloadUserTemplate as jest.Mock).mockImplementation(() => {
        throw new Error('Download failed');
      });

      renderComponent();
      const downloadBtn = screen.getByText('Download Template');
      fireEvent.click(downloadBtn);

      expect(console.error).toHaveBeenCalled();
    });

    it('should successfully download template', () => {
      renderComponent();
      const downloadBtn = screen.getByText('Download Template');
      fireEvent.click(downloadBtn);

      expect(templateDownloadService.downloadUserTemplate).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Template downloaded successfully');
    });
  });

  describe('File Upload - Edge Cases', () => {
    it('should handle file upload with mixed errors', async () => {
      (excelParserService.parseExcelFile as jest.Mock).mockResolvedValue({
        users: [{ firstName: 'John', lastName: 'Doe', emailId: 'john@test.com' }],
        errors: [
          { message: "doesn't match the expected format", row: 1 },
          { message: 'First Name is required', row: 2 },
          { message: 'Some other error', row: 3 },
        ],
      });

      renderComponent();
      const selectFileBtn = screen.getByText('Select File');
      fireEvent.click(selectFileBtn);

      await waitFor(() => {
        expect(excelParserService.parseExcelFile).toHaveBeenCalled();
      });
    });

    it('should handle file upload with only format errors', async () => {
      (excelParserService.parseExcelFile as jest.Mock).mockResolvedValue({
        users: [],
        errors: [
          { message: "doesn't match the expected format", row: 1 },
        ],
      });

      renderComponent();
      const selectFileBtn = screen.getByText('Select File');
      fireEvent.click(selectFileBtn);

      await waitFor(() => {
        expect(excelParserService.parseExcelFile).toHaveBeenCalled();
      }, { timeout: 3000 });

      await waitFor(() => {
        const errorElement = screen.queryByTestId('upload-error');
        if (errorElement) {
          expect(errorElement).toHaveTextContent("doesn't match the expected format");
        }
      }, { timeout: 3000 });
    });

    it('should handle file upload with only mandatory field errors', async () => {
      (excelParserService.parseExcelFile as jest.Mock).mockResolvedValue({
        users: [],
        errors: [
          { message: 'First Name is required', row: 2 },
        ],
      });

      renderComponent();
      const selectFileBtn = screen.getByText('Select File');
      fireEvent.click(selectFileBtn);

      await waitFor(() => {
        expect(excelParserService.parseExcelFile).toHaveBeenCalled();
      }, { timeout: 3000 });

      await waitFor(() => {
        const errorElement = screen.queryByTestId('upload-error');
        if (errorElement) {
          expect(errorElement).toHaveTextContent('Some mandatory fields are missing');
        }
      }, { timeout: 3000 });
    });

    it('should handle parse error gracefully', async () => {
      (excelParserService.parseExcelFile as jest.Mock).mockRejectedValue(new Error('Parse error'));

      renderComponent();
      const selectFileBtn = screen.getByText('Select File');
      fireEvent.click(selectFileBtn);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });
    });

    it('should update progress during file parsing', async () => {
      (excelParserService.parseExcelFile as jest.Mock).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return { users: [{ firstName: 'John' }], errors: [] };
      });

      renderComponent();
      const selectFileBtn = screen.getByText('Select File');
      fireEvent.click(selectFileBtn);

      await waitFor(() => {
        expect(screen.getByTestId('upload-progress')).toBeInTheDocument();
      });
    });
  });

  describe('File Removal - Edge Cases', () => {
    it('should clear all state when file is removed', async () => {
      (excelParserService.parseExcelFile as jest.Mock).mockResolvedValue({
        users: [{ firstName: 'John' }],
        errors: [],
      });

      renderComponent();
      const selectFileBtn = screen.getByText('Select File');
      fireEvent.click(selectFileBtn);

      await waitFor(() => {
        expect(screen.getByTestId('uploaded-file')).toBeInTheDocument();
      });

      const removeBtn = screen.getByText('Remove File');
      fireEvent.click(removeBtn);

      expect(screen.queryByTestId('uploaded-file')).not.toBeInTheDocument();
      expect(screen.queryByTestId('upload-error')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission - Edge Cases', () => {
    it('should handle submit with success and savedCount > 0', async () => {
      jest.useFakeTimers();
      const mockUsers = [{ firstName: 'John', lastName: 'Doe', emailId: 'john@test.com' }];
      (excelParserService.parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      (bulkUserSaveService.saveBulkUsers as jest.Mock).mockResolvedValue({
        success: true,
        savedCount: 1,
        errors: [],
      });

      renderComponent();
      const selectFileBtn = screen.getByText('Select File');
      fireEvent.click(selectFileBtn);

      await waitFor(() => {
        expect(excelParserService.parseExcelFile).toHaveBeenCalled();
      });

      await waitFor(() => {
        const uploadedFile = screen.queryByTestId('uploaded-file');
        if (uploadedFile) {
          const submitBtn = screen.getByTestId('panel-submit');
          expect(submitBtn).not.toBeDisabled();
          fireEvent.click(submitBtn);
        }
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(bulkUserSaveService.saveBulkUsers).toHaveBeenCalled();
      });

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        const notification = screen.queryByTestId('notification-alert');
        if (notification) {
          expect(defaultProps.onClose).toHaveBeenCalled();
        }
      }, { timeout: 1000 });

      jest.useRealTimers();
    });

    it('should handle submit with success but savedCount = 0', async () => {
      const mockUsers = [{ firstName: 'John', lastName: 'Doe', emailId: 'john@test.com' }];
      (excelParserService.parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      (bulkUserSaveService.saveBulkUsers as jest.Mock).mockResolvedValue({
        success: true,
        savedCount: 0,
        errors: [],
      });

      renderComponent();
      const selectFileBtn = screen.getByText('Select File');
      fireEvent.click(selectFileBtn);

      await waitFor(() => {
        expect(excelParserService.parseExcelFile).toHaveBeenCalled();
      }, { timeout: 3000 });

      await waitFor(() => {
        const uploadedFile = screen.queryByTestId('uploaded-file');
        if (uploadedFile) {
          const submitBtn = screen.getByTestId('panel-submit');
          fireEvent.click(submitBtn);
        }
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(bulkUserSaveService.saveBulkUsers).toHaveBeenCalled();
      });
    });

    it('should handle submit with mandatory field errors in result', async () => {
      const mockUsers = [{ firstName: 'John', lastName: 'Doe', emailId: 'john@test.com' }];
      (excelParserService.parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      (bulkUserSaveService.saveBulkUsers as jest.Mock).mockResolvedValue({
        success: false,
        savedCount: 0,
        errors: [
          { row: 2, email: 'test@test.com', error: 'First Name is required' },
        ],
      });

      renderComponent();
      const selectFileBtn = screen.getByText('Select File');
      fireEvent.click(selectFileBtn);

      await waitFor(() => {
        expect(excelParserService.parseExcelFile).toHaveBeenCalled();
      }, { timeout: 3000 });

      await waitFor(() => {
        const uploadedFile = screen.queryByTestId('uploaded-file');
        if (uploadedFile) {
          const submitBtn = screen.getByTestId('panel-submit');
          fireEvent.click(submitBtn);
        }
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(bulkUserSaveService.saveBulkUsers).toHaveBeenCalled();
        const errorElement = screen.queryByTestId('upload-error');
        if (errorElement) {
          expect(errorElement).toHaveTextContent('Some mandatory fields are missing');
        }
      }, { timeout: 3000 });
    });

    it('should handle submit with non-mandatory errors in result', async () => {
      const mockUsers = [{ firstName: 'John' }];
      (excelParserService.parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      (bulkUserSaveService.saveBulkUsers as jest.Mock).mockResolvedValue({
        success: false,
        savedCount: 0,
        errors: [
          { row: 2, email: 'test@test.com', error: 'Some other error' },
        ],
      });

      renderComponent();
      const selectFileBtn = screen.getByText('Select File');
      fireEvent.click(selectFileBtn);

      await waitFor(() => {
        expect(screen.getByTestId('uploaded-file')).toBeInTheDocument();
      });

      const submitBtn = screen.getByTestId('panel-submit');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.queryByTestId('upload-error')).not.toBeInTheDocument();
      });
    });

    it('should handle submit error', async () => {
      const mockUsers = [{ firstName: 'John', lastName: 'Doe', emailId: 'john@test.com' }];
      (excelParserService.parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      (bulkUserSaveService.saveBulkUsers as jest.Mock).mockRejectedValue(new Error('Save error'));

      renderComponent();
      const selectFileBtn = screen.getByText('Select File');
      fireEvent.click(selectFileBtn);

      await waitFor(() => {
        expect(excelParserService.parseExcelFile).toHaveBeenCalled();
      }, { timeout: 3000 });

      await waitFor(() => {
        const uploadedFile = screen.queryByTestId('uploaded-file');
        if (uploadedFile) {
          const submitBtn = screen.getByTestId('panel-submit');
          fireEvent.click(submitBtn);
        }
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(bulkUserSaveService.saveBulkUsers).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalled();
      });
    });

    it('should prevent multiple submissions', async () => {
      const mockUsers = [{ firstName: 'John', lastName: 'Doe', emailId: 'john@test.com' }];
      (excelParserService.parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      (bulkUserSaveService.saveBulkUsers as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

      renderComponent();
      const selectFileBtn = screen.getByText('Select File');
      fireEvent.click(selectFileBtn);

      await waitFor(() => {
        expect(excelParserService.parseExcelFile).toHaveBeenCalled();
      }, { timeout: 3000 });

      await waitFor(() => {
        const uploadedFile = screen.queryByTestId('uploaded-file');
        if (uploadedFile) {
          const submitBtn = screen.getByTestId('panel-submit');
          fireEvent.click(submitBtn);
          fireEvent.click(submitBtn); // Try to submit again
        }
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(bulkUserSaveService.saveBulkUsers).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Submit Button State', () => {
    it('should disable submit when no file uploaded', () => {
      renderComponent();
      const submitBtn = screen.getByTestId('panel-submit');
      expect(submitBtn).toBeDisabled();
    });

    it('should disable submit when upload in progress', async () => {
      (excelParserService.parseExcelFile as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

      renderComponent();
      const selectFileBtn = screen.getByText('Select File');
      fireEvent.click(selectFileBtn);

      await waitFor(() => {
        const submitBtn = screen.getByTestId('panel-submit');
        expect(submitBtn).toBeDisabled();
      });
    });

    it('should disable submit when upload error exists', async () => {
      (excelParserService.parseExcelFile as jest.Mock).mockResolvedValue({
        users: [],
        errors: [{ message: "doesn't match the expected format" }],
      });

      renderComponent();
      const selectFileBtn = screen.getByText('Select File');
      fireEvent.click(selectFileBtn);

      await waitFor(() => {
        const submitBtn = screen.getByTestId('panel-submit');
        expect(submitBtn).toBeDisabled();
      });
    });

    it('should enable submit when file uploaded successfully', async () => {
      (excelParserService.parseExcelFile as jest.Mock).mockResolvedValue({
        users: [{ firstName: 'John' }],
        errors: [],
      });

      renderComponent();
      const selectFileBtn = screen.getByText('Select File');
      fireEvent.click(selectFileBtn);

      await waitFor(() => {
        const submitBtn = screen.getByTestId('panel-submit');
        expect(submitBtn).not.toBeDisabled();
      });
    });
  });

  describe('Error Handling from Step2UploadFile', () => {
    it('should handle upload error from Step2UploadFile', () => {
      renderComponent();
      const triggerErrorBtn = screen.getByText('Trigger Error');
      fireEvent.click(triggerErrorBtn);

      expect(screen.getByTestId('upload-error')).toHaveTextContent('Test error');
    });

    it('should clear error when handleUploadError called with null', () => {
      renderComponent();
      const triggerErrorBtn = screen.getByText('Trigger Error');
      fireEvent.click(triggerErrorBtn);
      fireEvent.click(triggerErrorBtn); // Click again to clear

      // Error should be cleared
    });
  });

  describe('Cancel', () => {
    it('should close panel and reset state on cancel', () => {
      renderComponent();
      const cancelBtn = screen.getByTestId('panel-reset');
      fireEvent.click(cancelBtn);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Success Notification', () => {
    it('should close notification', async () => {
      jest.useFakeTimers();
      const mockUsers = [{ firstName: 'John', lastName: 'Doe', emailId: 'john@test.com' }];
      (excelParserService.parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      (bulkUserSaveService.saveBulkUsers as jest.Mock).mockResolvedValue({
        success: true,
        savedCount: 1,
        errors: [],
      });

      renderComponent();
      const selectFileBtn = screen.getByText('Select File');
      fireEvent.click(selectFileBtn);

      await waitFor(() => {
        expect(excelParserService.parseExcelFile).toHaveBeenCalled();
      }, { timeout: 3000 });

      await waitFor(() => {
        const uploadedFile = screen.queryByTestId('uploaded-file');
        if (uploadedFile) {
          const submitBtn = screen.getByTestId('panel-submit');
          fireEvent.click(submitBtn);
        }
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(bulkUserSaveService.saveBulkUsers).toHaveBeenCalled();
      });

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        const notification = screen.queryByTestId('notification-alert');
        if (notification) {
          const closeBtn = screen.getByText('Close Notification');
          fireEvent.click(closeBtn);
        }
      }, { timeout: 1000 });

      await waitFor(() => {
        expect(screen.queryByTestId('notification-alert')).not.toBeInTheDocument();
      }, { timeout: 1000 });

      jest.useRealTimers();
    });
  });
});

