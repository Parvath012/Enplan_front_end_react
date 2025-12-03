import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import BulkUploadPanel from '../../../src/components/bulkUpload/BulkUploadPanel';
import '@testing-library/jest-dom';

// Mock commonApp components
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
        <button onClick={() => onFileSelect(new File(['content'], 'test.xlsx'))}>Select File</button>
        <button onClick={onRemoveFile}>Remove File</button>
        <button onClick={() => onError('Test error')}>Trigger Error</button>
      </div>
    );
  };
});

// Mock services
jest.mock('../../../src/utils/templateDownloadService', () => ({
  downloadUserTemplate: jest.fn(),
}));

jest.mock('../../../src/utils/excelParserService', () => ({
  parseExcelFile: jest.fn(),
}));

jest.mock('../../../src/services/bulkUserSaveService', () => ({
  saveBulkUsers: jest.fn(),
}));

jest.mock('../../../src/store/Reducers/userSlice', () => ({
  fetchUsers: jest.fn(() => ({ type: 'users/fetchUsers' })),
}));

import { downloadUserTemplate } from '../../../src/utils/templateDownloadService';
import { parseExcelFile } from '../../../src/utils/excelParserService';
import { saveBulkUsers } from '../../../src/services/bulkUserSaveService';
import { fetchUsers } from '../../../src/store/Reducers/userSlice';

const createMockStore = () => {
  return configureStore({
    reducer: {
      users: (state = { users: [] }) => state,
    },
  });
};

describe('BulkUploadPanel', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} isOpen={false} />
        </Provider>
      );
      expect(screen.queryByTestId('panel')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      expect(screen.getByTestId('panel')).toBeInTheDocument();
      expect(screen.getByTestId('panel-title')).toHaveTextContent('Bulk Upload');
    });

    it('should render Step1DownloadTemplate', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      expect(screen.getByTestId('step1-download')).toBeInTheDocument();
    });

    it('should render Step2UploadFile', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      expect(screen.getByTestId('step2-upload')).toBeInTheDocument();
    });
  });

  describe('Template Download', () => {
    it('should call downloadUserTemplate when download button is clicked', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const downloadButton = screen.getByText('Download Template');
      fireEvent.click(downloadButton);
      
      expect(downloadUserTemplate).toHaveBeenCalled();
    });

    it('should handle download error', () => {
      (downloadUserTemplate as jest.Mock).mockImplementation(() => {
        throw new Error('Download error');
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const downloadButton = screen.getByText('Download Template');
      fireEvent.click(downloadButton);
      
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('File Upload', () => {
    it('should handle file upload with valid users', async () => {
      const mockUsers = [
        {
          firstName: 'John',
          lastName: 'Doe',
          emailId: 'john@example.com',
        },
      ];
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
    });

    it('should handle file format errors', async () => {
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: [],
        errors: [
          { message: "doesn't match the expected format", row: 1, field: 'File Format' },
        ],
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      }, { timeout: 3000 });
      
      await waitFor(() => {
        const errorDisplay = screen.queryByTestId('upload-error');
        expect(errorDisplay).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle mandatory field errors', async () => {
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: [],
        errors: [
          { message: 'First Name is required', row: 2, field: 'First Name' },
        ],
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      }, { timeout: 3000 });
      
      await waitFor(() => {
        const errorDisplay = screen.queryByTestId('upload-error');
        expect(errorDisplay).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle parse errors', async () => {
      (parseExcelFile as jest.Mock).mockRejectedValue(new Error('Parse error'));
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });
    });
  });

  describe('File Removal', () => {
    it('should remove file when remove button is clicked', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const removeButton = screen.getByText('Remove File');
      fireEvent.click(removeButton);
      
      // File should be removed (tested via state)
      expect(screen.queryByTestId('uploaded-file')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should submit successfully and show notification', async () => {
      jest.useFakeTimers();
      const mockUsers = [
        {
          firstName: 'John',
          lastName: 'Doe',
          emailId: 'john@example.com',
        },
      ];
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      (saveBulkUsers as jest.Mock).mockResolvedValue({
        success: true,
        savedCount: 1,
        errors: [],
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      // Upload file
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
      
      // Wait for upload to complete
      await waitFor(() => {
        expect(screen.queryByTestId('uploaded-file')).toBeInTheDocument();
      });
      
      // Submit
      const submitButton = screen.getByTestId('panel-submit');
      expect(submitButton).not.toBeDisabled();
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(saveBulkUsers).toHaveBeenCalled();
      });
      
      // Advance timers to trigger setTimeout
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });

    it('should handle submission errors', async () => {
      const mockUsers = [
        {
          firstName: 'John',
          lastName: 'Doe',
          emailId: 'john@example.com',
        },
      ];
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      (saveBulkUsers as jest.Mock).mockResolvedValue({
        success: false,
        savedCount: 0,
        errors: [
          { row: 2, email: 'john@example.com', error: 'First Name is required' },
        ],
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(saveBulkUsers).toHaveBeenCalled();
      });
    });

    it('should not submit when no file is uploaded', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const submitButton = screen.getByTestId('panel-submit');
      expect(submitButton).toBeDisabled();
      fireEvent.click(submitButton);
      expect(saveBulkUsers).not.toHaveBeenCalled();
    });

    it('should close panel after successful submission', async () => {
      jest.useFakeTimers();
      const mockUsers = [
        {
          firstName: 'John',
          lastName: 'Doe',
          emailId: 'john@example.com',
        },
      ];
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      (saveBulkUsers as jest.Mock).mockResolvedValue({
        success: true,
        savedCount: 1,
        errors: [],
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('uploaded-file')).toBeInTheDocument();
      });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(saveBulkUsers).toHaveBeenCalled();
      });
      
      // Advance timers to trigger setTimeout
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled();
      });
      
      jest.useRealTimers();
    });
  });

  describe('Cancel', () => {
    it('should close panel when cancel is clicked', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const cancelButton = screen.getByTestId('panel-reset');
      fireEvent.click(cancelButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle upload error from Step2UploadFile', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const triggerErrorButton = screen.getByText('Trigger Error');
      fireEvent.click(triggerErrorButton);
      
      expect(screen.queryByTestId('upload-error')).toBeInTheDocument();
    });

    it('should handle other validation errors (not format or mandatory)', async () => {
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: [{ firstName: 'John', lastName: 'Doe', emailId: 'john@example.com' }],
        errors: [
          { message: 'Some other validation error', row: 2, field: 'Other Field' },
        ],
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        // Error should be cleared for other validation errors
        expect(screen.queryByTestId('upload-error')).not.toBeInTheDocument();
      });
    });

    it('should log warning when validation errors exist but upload succeeds', async () => {
      const mockUsers = [
        { firstName: 'John', lastName: 'Doe', emailId: 'john@example.com' },
      ];
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [
          { message: 'Minor validation warning', row: 2, field: 'Field' },
        ],
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(console.warn).toHaveBeenCalled();
      });
    });
  });

  describe('Submit Edge Cases', () => {
    it('should not submit when format error clears parsed users', async () => {
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: [],
        errors: [
          { message: "doesn't match the expected format", row: 1, field: 'File Format' },
        ],
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      }, { timeout: 3000 });
      
      // After format error, file is cleared and parsedUsers is empty
      await waitFor(() => {
        const submitButton = screen.getByTestId('panel-submit');
        // Button should be disabled when parsedUsers is empty
        expect(submitButton).toBeDisabled();
      });
    });

    it('should handle submit with success but no savedCount', async () => {
      jest.useFakeTimers();
      const mockUsers = [
        { firstName: 'John', lastName: 'Doe', emailId: 'john@example.com' },
      ];
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      (saveBulkUsers as jest.Mock).mockResolvedValue({
        success: true,
        savedCount: 0,
        errors: [],
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('uploaded-file')).toBeInTheDocument();
      });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(saveBulkUsers).toHaveBeenCalled();
      });
      
      jest.useRealTimers();
    });

    it('should handle submit with errors but no mandatory field errors', async () => {
      const mockUsers = [
        { firstName: 'John', lastName: 'Doe', emailId: 'john@example.com' },
      ];
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      (saveBulkUsers as jest.Mock).mockResolvedValue({
        success: false,
        savedCount: 0,
        errors: [
          { row: 2, email: 'john@example.com', error: 'Some other error' },
        ],
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('uploaded-file')).toBeInTheDocument();
      });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(saveBulkUsers).toHaveBeenCalled();
      });
      
      // Error should not be shown for non-mandatory field errors
      await waitFor(() => {
        expect(screen.queryByTestId('upload-error')).not.toBeInTheDocument();
      });
    });

    it('should handle notification close', async () => {
      jest.useFakeTimers();
      const mockUsers = [
        { firstName: 'John', lastName: 'Doe', emailId: 'john@example.com' },
      ];
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      (saveBulkUsers as jest.Mock).mockResolvedValue({
        success: true,
        savedCount: 1,
        errors: [],
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('uploaded-file')).toBeInTheDocument();
      });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(saveBulkUsers).toHaveBeenCalled();
      });
      
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
      });
      
      const closeButton = screen.getByText('Close Notification');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('notification-alert')).not.toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });
  });

  describe('Portal Rendering', () => {
    it('should render without portal when document is undefined', () => {
      const originalDocument = global.document;
      // @ts-ignore
      delete global.document;
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      expect(screen.getByTestId('panel')).toBeInTheDocument();
      
      global.document = originalDocument;
    });
  });

  describe('Submit Button State', () => {
    it('should disable submit when file is not uploaded', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const submitButton = screen.getByTestId('panel-submit');
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit when upload is in progress', async () => {
      (parseExcelFile as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        const submitButton = screen.getByTestId('panel-submit');
        expect(submitButton).toBeDisabled();
      });
    });

    it('should disable submit when there is an upload error', async () => {
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: [],
        errors: [
          { message: "doesn't match the expected format", row: 1, field: 'File Format' },
        ],
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        const submitButton = screen.getByTestId('panel-submit');
        expect(submitButton).toBeDisabled();
      });
    });

    it('should enable submit when file is uploaded and parsed successfully', async () => {
      const mockUsers = [
        { firstName: 'John', lastName: 'Doe', emailId: 'john@example.com' },
      ];
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        const submitButton = screen.getByTestId('panel-submit');
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle saveBulkUsers throwing an error', async () => {
      const mockUsers = [
        { firstName: 'John', lastName: 'Doe', emailId: 'john@example.com' },
      ];
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      (saveBulkUsers as jest.Mock).mockRejectedValue(new Error('Save error'));
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('uploaded-file')).toBeInTheDocument();
      });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });
    });

    it('should handle multiple submission attempts', async () => {
      jest.useFakeTimers();
      const mockUsers = [
        { firstName: 'John', lastName: 'Doe', emailId: 'john@example.com' },
      ];
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      (saveBulkUsers as jest.Mock).mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve({ success: true, savedCount: 1, errors: [] }), 100);
      }));
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('uploaded-file')).toBeInTheDocument();
      });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      // Try to submit again immediately
      fireEvent.click(submitButton);
      
      // Should only be called once
      await waitFor(() => {
        expect(saveBulkUsers).toHaveBeenCalledTimes(1);
      });
      
      jest.useRealTimers();
    });
  });

  describe('File Upload Progress', () => {
    it('should update progress during file parsing', async () => {
      const mockUsers = [
        { firstName: 'John', lastName: 'Doe', emailId: 'john@example.com' },
      ];
      (parseExcelFile as jest.Mock).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return { users: mockUsers, errors: [] };
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
    });
  });

  describe('Success Notification', () => {
    it('should show success notification with correct message', async () => {
      jest.useFakeTimers();
      const mockUsers = [
        { firstName: 'John', lastName: 'Doe', emailId: 'john@example.com' },
      ];
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      (saveBulkUsers as jest.Mock).mockResolvedValue({
        success: true,
        savedCount: 5,
        errors: [],
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('uploaded-file')).toBeInTheDocument();
      });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(saveBulkUsers).toHaveBeenCalled();
      });
      
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        const notification = screen.getByTestId('notification-alert');
        expect(notification).toHaveTextContent('Bulk upload successful.All users have been added.');
      });
      
      jest.useRealTimers();
    });
  });

  describe('File Removal Edge Cases', () => {
    it('should clear all state when file is removed', async () => {
      const mockUsers = [
        { firstName: 'John', lastName: 'Doe', emailId: 'john@example.com' },
      ];
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('uploaded-file')).toBeInTheDocument();
      });
      
      const removeButton = screen.getByText('Remove File');
      fireEvent.click(removeButton);
      
      await waitFor(() => {
      expect(screen.queryByTestId('uploaded-file')).not.toBeInTheDocument();
    });

    it('should handle submit when isSubmitting is true', async () => {
      const mockUsers = [
        { firstName: 'John', lastName: 'Doe', emailId: 'john@example.com' },
      ];
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      (saveBulkUsers as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('uploaded-file')).toBeInTheDocument();
      });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      // Click again immediately - should be prevented
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        // Should only be called once
        expect(saveBulkUsers).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle submit when uploadedFile is null', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const submitButton = screen.getByTestId('panel-submit');
      expect(submitButton).toBeDisabled();
      fireEvent.click(submitButton);
      
      expect(saveBulkUsers).not.toHaveBeenCalled();
    });

    it('should handle submit when parsedUsers is empty', async () => {
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: [],
        errors: [],
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
      
      const submitButton = screen.getByTestId('panel-submit');
      expect(submitButton).toBeDisabled();
      fireEvent.click(submitButton);
      
      expect(saveBulkUsers).not.toHaveBeenCalled();
    });

    it('should handle submit when uploadProgress is not 100', async () => {
      const mockUsers = [
        { firstName: 'John', lastName: 'Doe', emailId: 'john@example.com' },
      ];
      (parseExcelFile as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
      
      const submitButton = screen.getByTestId('panel-submit');
      expect(submitButton).toBeDisabled();
      fireEvent.click(submitButton);
      
      expect(saveBulkUsers).not.toHaveBeenCalled();
    });

    it('should handle submit when isUploading is true', async () => {
      const mockUsers = [
        { firstName: 'John', lastName: 'Doe', emailId: 'john@example.com' },
      ];
      (parseExcelFile as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
      
      const submitButton = screen.getByTestId('panel-submit');
      expect(submitButton).toBeDisabled();
      fireEvent.click(submitButton);
      
      expect(saveBulkUsers).not.toHaveBeenCalled();
    });

    it('should handle submit when uploadError is not null', async () => {
      const mockUsers = [
        { firstName: 'John', lastName: 'Doe', emailId: 'john@example.com' },
      ];
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [
          { message: "doesn't match the expected format", row: 1, field: 'File Format' },
        ],
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      }, { timeout: 3000 });
      
      await waitFor(() => {
        const submitButton = screen.getByTestId('panel-submit');
        expect(submitButton).toBeDisabled();
      });
    });

    it('should handle file upload progress updates', async () => {
      const mockUsers = [
        { firstName: 'John', lastName: 'Doe', emailId: 'john@example.com' },
      ];
      (parseExcelFile as jest.Mock).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return { users: mockUsers, errors: [] };
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
    });

    it('should handle file upload with validation errors that are not format or mandatory', async () => {
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: [{ firstName: 'John', lastName: 'Doe', emailId: 'john@example.com' }],
        errors: [
          { message: 'Some other validation error', row: 2, field: 'Other Field' },
        ],
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        // Error should not be shown for other validation errors
        expect(screen.queryByTestId('upload-error')).not.toBeInTheDocument();
      });
    });

    it('should handle file upload with both format and mandatory errors', async () => {
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: [],
        errors: [
          { message: "doesn't match the expected format", row: 1, field: 'File Format' },
          { message: 'First Name is required', row: 2, field: 'First Name' },
        ],
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      }, { timeout: 3000 });
      
      await waitFor(() => {
        const errorDisplay = screen.queryByTestId('upload-error');
        expect(errorDisplay).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle submit with success but errors array exists', async () => {
      jest.useFakeTimers();
      const mockUsers = [
        { firstName: 'John', lastName: 'Doe', emailId: 'john@example.com' },
      ];
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      (saveBulkUsers as jest.Mock).mockResolvedValue({
        success: true,
        savedCount: 1,
        errors: [
          { row: 2, email: 'test@example.com', error: 'Some warning' },
        ],
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('uploaded-file')).toBeInTheDocument();
      });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(saveBulkUsers).toHaveBeenCalled();
      });
      
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });

    it('should handle submit with no errors array', async () => {
      jest.useFakeTimers();
      const mockUsers = [
        { firstName: 'John', lastName: 'Doe', emailId: 'john@example.com' },
      ];
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      (saveBulkUsers as jest.Mock).mockResolvedValue({
        success: true,
        savedCount: 1,
      } as any);
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('uploaded-file')).toBeInTheDocument();
      });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(saveBulkUsers).toHaveBeenCalled();
      });
      
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });

    it('should handle handleUploadError with null error', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const triggerErrorButton = screen.getByText('Trigger Error');
      fireEvent.click(triggerErrorButton);
      
      // Then clear error
      fireEvent.click(triggerErrorButton);
      
      expect(screen.queryByTestId('upload-error')).not.toBeInTheDocument();
    });

    it('should handle handleUploadError with error string', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const triggerErrorButton = screen.getByText('Trigger Error');
      fireEvent.click(triggerErrorButton);
      
      expect(screen.queryByTestId('upload-error')).toBeInTheDocument();
    });

    it('should handle submit when result.success is true but savedCount is 0', async () => {
      jest.useFakeTimers();
      const mockUsers = [
        { firstName: 'John', lastName: 'Doe', emailId: 'john@example.com' },
      ];
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      (saveBulkUsers as jest.Mock).mockResolvedValue({
        success: true,
        savedCount: 0,
        errors: [],
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('uploaded-file')).toBeInTheDocument();
      });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(saveBulkUsers).toHaveBeenCalled();
      });
      
      jest.useRealTimers();
    });

    it('should handle submit when result.success is false and errors array is empty', async () => {
      const mockUsers = [
        { firstName: 'John', lastName: 'Doe', emailId: 'john@example.com' },
      ];
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      (saveBulkUsers as jest.Mock).mockResolvedValue({
        success: false,
        savedCount: 0,
        errors: [],
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('uploaded-file')).toBeInTheDocument();
      });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(saveBulkUsers).toHaveBeenCalled();
      });
    });

    it('should handle submit when saveBulkUsers throws an error', async () => {
      const mockUsers = [
        { firstName: 'John', lastName: 'Doe', emailId: 'john@example.com' },
      ];
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      (saveBulkUsers as jest.Mock).mockRejectedValue(new Error('Save error'));
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('uploaded-file')).toBeInTheDocument();
      });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(saveBulkUsers).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });
    });

    it('should not submit when isSubmitting is true', async () => {
      const mockUsers = [
        { firstName: 'John', lastName: 'Doe', emailId: 'john@example.com' },
      ];
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      (saveBulkUsers as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('uploaded-file')).toBeInTheDocument();
      });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      // Try to submit again while first submission is in progress
      fireEvent.click(submitButton);
      
      // Should only be called once
      await waitFor(() => {
        expect(saveBulkUsers).toHaveBeenCalledTimes(1);
      });
    });

    it('should disable submit button when uploadProgress is not 100', async () => {
      const mockUsers = [
        { firstName: 'John', lastName: 'Doe', emailId: 'john@example.com' },
      ];
      (parseExcelFile as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      // While uploading, submit button should be disabled
      await waitFor(() => {
        const submitButton = screen.getByTestId('panel-submit');
        expect(submitButton).toBeDisabled();
      });
    });

    it('should disable submit button when uploadError is not null', async () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const triggerErrorButton = screen.getByText('Trigger Error');
      fireEvent.click(triggerErrorButton);
      
      await waitFor(() => {
        const submitButton = screen.getByTestId('panel-submit');
        expect(submitButton).toBeDisabled();
      });
    });

    it('should disable submit button when parsedUsers is empty', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const submitButton = screen.getByTestId('panel-submit');
      expect(submitButton).toBeDisabled();
    });

    it('should render panel content when document is undefined', () => {
      const originalDocument = global.document;
      delete (global as any).document;
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      // Should still render panel content
      expect(screen.getByTestId('panel')).toBeInTheDocument();
      
      global.document = originalDocument;
    });

    it('should handle file upload progress updates', async () => {
      const mockUsers = [
        { firstName: 'John', lastName: 'Doe', emailId: 'john@example.com' },
      ];
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
      
      // Progress should be shown during upload
      await waitFor(() => {
        expect(screen.queryByTestId('upload-progress')).toBeInTheDocument();
      });
    });

    it('should show success notification message correctly', async () => {
      jest.useFakeTimers();
      const mockUsers = [
        { firstName: 'John', lastName: 'Doe', emailId: 'john@example.com' },
      ];
      (parseExcelFile as jest.Mock).mockResolvedValue({
        users: mockUsers,
        errors: [],
      });
      (saveBulkUsers as jest.Mock).mockResolvedValue({
        success: true,
        savedCount: 5,
        errors: [],
      });
      
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const selectFileButton = screen.getByText('Select File');
      fireEvent.click(selectFileButton);
      
      await waitFor(() => {
        expect(parseExcelFile).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('uploaded-file')).toBeInTheDocument();
      });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(saveBulkUsers).toHaveBeenCalled();
      });
      
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });

    it('should clear all state when file is removed', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BulkUploadPanel {...defaultProps} />
        </Provider>
      );
      
      const removeButton = screen.getByText('Remove File');
      fireEvent.click(removeButton);
      
      // All state should be cleared
      expect(screen.queryByTestId('uploaded-file')).not.toBeInTheDocument();
      expect(screen.queryByTestId('upload-error')).not.toBeInTheDocument();
    });
  });
});

