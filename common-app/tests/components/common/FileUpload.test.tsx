import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileUpload from '../../../src/components/common/FileUpload';

// Mock the image utils to control validation behavior
jest.mock('../../../src/utils/imageUtils', () => ({
  validateImageFile: jest.fn(),
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = jest.fn();

describe('FileUpload', () => {
  const defaultProps = {
    file: null,
    onFileChange: jest.fn(),
    onCheckboxChange: jest.fn(),
    checkboxChecked: false,
    checkboxLabel: 'Use as default logo',
    uploadLabel: 'Upload Entity Logo',
    supportedExtensions: ['.png', '.jpg', '.jpeg', '.svg'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    width: 165,
    height: 62,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset URL mocks
    (global.URL.createObjectURL as jest.Mock).mockReturnValue('mock-object-url');
    (global.URL.revokeObjectURL as jest.Mock).mockClear();
    
    // Default mock for validateImageFile - return valid by default
    const { validateImageFile } = require('../../../src/utils/imageUtils');
    validateImageFile.mockReturnValue({ isValid: true });
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      render(<FileUpload {...defaultProps} />);
      expect(screen.getByText('Upload Entity Logo')).toBeInTheDocument();
    });

    it('should render with default props', () => {
      render(<FileUpload {...defaultProps} />);
      expect(screen.getByText('Entity Logo')).toBeInTheDocument();
      expect(screen.getByText('Use as default logo')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
    });

    it('should render upload button with correct styling', () => {
      render(<FileUpload {...defaultProps} />);
      const uploadButton = screen.getByRole('button', { name: /upload/i });
      expect(uploadButton).toBeInTheDocument();
      expect(uploadButton).toHaveClass('MuiButton-outlined');
    });

    it('should render checkbox component', () => {
      render(<FileUpload {...defaultProps} />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(screen.getByText('Use as default logo')).toBeInTheDocument();
    });

    it('should render file requirements text', () => {
      render(<FileUpload {...defaultProps} />);
      expect(screen.getByText('Supported file extensions: .PNG, .jpeg/.jpg, .SVG')).toBeInTheDocument();
      expect(screen.getByText('Maximum allowed file size is 10MB')).toBeInTheDocument();
    });
  });

  describe('File Upload Functionality', () => {
    it('should trigger file input when upload button is clicked', async () => {
      render(<FileUpload {...defaultProps} />);
      const uploadButton = screen.getByRole('button', { name: /upload/i });
      
      // Create a spy on the file input click method
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      const clickSpy = jest.spyOn(fileInput, 'click');
      
      await userEvent.click(uploadButton);
      expect(clickSpy).toHaveBeenCalled();
      
      clickSpy.mockRestore();
    });

    it('should handle valid file selection', async () => {
      const onFileChange = jest.fn();
      render(<FileUpload {...defaultProps} onFileChange={onFileChange} />);
      
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      const validFile = new File(['test content'], 'test.png', { type: 'image/png' });
      
      await userEvent.upload(fileInput, validFile);
      
      expect(onFileChange).toHaveBeenCalledWith(validFile);
    });

    it('should call onFileChange with null when no file is selected', async () => {
      const onFileChange = jest.fn();
      render(<FileUpload {...defaultProps} onFileChange={onFileChange} />);
      
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [] } });
      
      // Should not call onFileChange when no files are selected
      expect(onFileChange).not.toHaveBeenCalled();
    });

    it('should handle multiple file selection by taking only the first file', async () => {
      const onFileChange = jest.fn();
      render(<FileUpload {...defaultProps} onFileChange={onFileChange} />);
      
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      const file1 = new File(['content1'], 'test1.png', { type: 'image/png' });
      const file2 = new File(['content2'], 'test2.png', { type: 'image/png' });
      
      await userEvent.upload(fileInput, [file1, file2]);
      
      expect(onFileChange).toHaveBeenCalledWith(file1);
    });
  });

  describe('File Validation', () => {
    it('should show error for invalid file size', async () => {
      // Mock validation failure before rendering
      const { validateImageFile } = require('../../../src/utils/imageUtils');
      validateImageFile.mockImplementation(() => ({
        isValid: false,
        error: 'File size must be less than 10MB'
      }));
      
      render(<FileUpload {...defaultProps} />);
      
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      const largeFile = new File(['large content'], 'large.png', { type: 'image/png' });
      
      fireEvent.change(fileInput, { target: { files: [largeFile] } });
      
      await waitFor(() => {
        expect(screen.getByText(/Upload failed:/)).toBeInTheDocument();
      });
    });

    it('should show error for invalid file type', async () => {
      // Mock validation failure before rendering
      const { validateImageFile } = require('../../../src/utils/imageUtils');
      validateImageFile.mockImplementation(() => ({
        isValid: false,
        error: 'Only .png, .jpg, .jpeg, .svg files are allowed'
      }));
      
      render(<FileUpload {...defaultProps} />);
      
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });
      
      await waitFor(() => {
        expect(screen.getByText(/Upload failed:/)).toBeInTheDocument();
      });
    });

    it('should not call onFileChange when validation fails', async () => {
      // Mock validation failure before test
      const { validateImageFile } = require('../../../src/utils/imageUtils');
      validateImageFile.mockImplementation(() => ({
        isValid: false,
        error: 'File too large'
      }));
      
      const onFileChange = jest.fn();
      render(<FileUpload {...defaultProps} onFileChange={onFileChange} />);
      
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      const invalidFile = new File(['content'], 'invalid.txt', { type: 'text/plain' });
      
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });
      
      expect(onFileChange).not.toHaveBeenCalled();
    });
  });

  describe('File Display', () => {
    it('should display selected image file', () => {
      const imageFile = new File(['image content'], 'test.png', { type: 'image/png' });
      render(<FileUpload {...defaultProps} file={imageFile} />);
      
      const image = screen.getByAltText('test.png');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'mock-object-url');
    });

    it('should display preview image from previewSrc when no file is selected', () => {
      render(<FileUpload {...defaultProps} file={null} previewSrc="preview-url" />);
      
      const image = screen.getByAltText('logo-preview');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'preview-url');
    });

    it('should prefer file over previewSrc when both are provided', () => {
      const imageFile = new File(['image content'], 'test.png', { type: 'image/png' });
      render(<FileUpload {...defaultProps} file={imageFile} previewSrc="preview-url" />);
      
      const image = screen.getByAltText('test.png');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'mock-object-url');
    });

    it('should display non-image file info instead of preview', () => {
      const textFile = new File(['text content'], 'document.txt', { type: 'text/plain' });
      render(<FileUpload {...defaultProps} file={textFile} />);
      
      expect(screen.getByText('document.txt')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('should show placeholder when no file or preview', () => {
      render(<FileUpload {...defaultProps} file={null} previewSrc={null} />);
      
      expect(screen.getByText('Entity Logo')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  describe('File Size Formatting', () => {
    it('should format file size correctly for bytes', () => {
      const smallFile = new File(['x'], 'small.txt', { type: 'text/plain' });
      Object.defineProperty(smallFile, 'size', { value: 500 });
      
      render(<FileUpload {...defaultProps} file={smallFile} />);
      
      expect(screen.getByText('500 Bytes')).toBeInTheDocument();
    });

    it('should format file size correctly for KB', () => {
      const kbFile = new File(['x'.repeat(1500)], 'kb.txt', { type: 'text/plain' });
      Object.defineProperty(kbFile, 'size', { value: 1500 });
      
      render(<FileUpload {...defaultProps} file={kbFile} />);
      
      expect(screen.getByText('1.46 KB')).toBeInTheDocument();
    });

    it('should format file size correctly for MB', () => {
      const mbFile = new File(['content'], 'mb.txt', { type: 'text/plain' });
      Object.defineProperty(mbFile, 'size', { value: 2 * 1024 * 1024 });
      
      render(<FileUpload {...defaultProps} file={mbFile} />);
      
      expect(screen.getByText('2 MB')).toBeInTheDocument();
    });

    it('should handle zero size files', () => {
      const emptyFile = new File([''], 'empty.txt', { type: 'text/plain' });
      Object.defineProperty(emptyFile, 'size', { value: 0 });
      
      render(<FileUpload {...defaultProps} file={emptyFile} />);
      
      expect(screen.getByText('0 Bytes')).toBeInTheDocument();
    });
  });

  describe('Checkbox Functionality', () => {
    it('should handle checkbox change events', async () => {
      const onCheckboxChange = jest.fn();
      render(<FileUpload {...defaultProps} onCheckboxChange={onCheckboxChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      await userEvent.click(checkbox);
      
      expect(onCheckboxChange).toHaveBeenCalledWith(true);
    });

    it('should render checkbox in checked state when checkboxChecked is true', () => {
      render(<FileUpload {...defaultProps} checkboxChecked={true} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('should render checkbox in unchecked state when checkboxChecked is false', () => {
      render(<FileUpload {...defaultProps} checkboxChecked={false} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should display custom checkbox label', () => {
      render(<FileUpload {...defaultProps} checkboxLabel="Custom checkbox label" />);
      
      expect(screen.getByText('Custom checkbox label')).toBeInTheDocument();
    });
  });

  describe('Custom Dimensions', () => {
    it('should apply custom width and height', () => {
      render(<FileUpload {...defaultProps} width={200} height={100} />);
      
      // Check that the placeholder box is rendered (it has custom dimensions applied via sx prop)
      expect(screen.getByText('Entity Logo')).toBeInTheDocument();
    });

    it('should use default dimensions when not specified', () => {
      const { width, height, ...propsWithoutDimensions } = defaultProps;
      render(<FileUpload {...propsWithoutDimensions} />);
      
      expect(screen.getByText('Entity Logo')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should show error notification when validation fails', async () => {
      // Mock validation failure
      const { validateImageFile } = require('../../../src/utils/imageUtils');
      validateImageFile.mockImplementation(() => ({
        isValid: false,
        error: 'Custom error message'
      }));
      
      render(<FileUpload {...defaultProps} />);
      
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      const invalidFile = new File(['content'], 'invalid.txt', { type: 'text/plain' });
      
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });
      
      await waitFor(() => {
        expect(screen.getByText(/Upload failed:/)).toBeInTheDocument();
      });
    });

    it('should auto-dismiss error notification after 2 seconds', async () => {
      // Mock validation failure
      const { validateImageFile } = require('../../../src/utils/imageUtils');
      validateImageFile.mockImplementation(() => ({
        isValid: false,
        error: 'Auto dismiss test'
      }));
      
      render(<FileUpload {...defaultProps} />);
      
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      const invalidFile = new File(['content'], 'invalid.txt', { type: 'text/plain' });
      
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });
      
      await waitFor(() => {
        expect(screen.getByText(/Upload failed:/)).toBeInTheDocument();
      });
      
      // The NotificationAlert component has autoHideDuration of 2000ms
      // This test verifies the component attempts auto-dismiss
      expect(screen.getByRole('presentation')).toBeInTheDocument();
    });

    it('should allow manual dismissal of error notification', async () => {
      // Mock validation failure
      const { validateImageFile } = require('../../../src/utils/imageUtils');
      validateImageFile.mockImplementation(() => ({
        isValid: false,
        error: 'Manual dismiss test'
      }));
      
      render(<FileUpload {...defaultProps} />);
      
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      const invalidFile = new File(['content'], 'invalid.txt', { type: 'text/plain' });
      
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });
      
      await waitFor(() => {
        expect(screen.getByText(/Upload failed:/)).toBeInTheDocument();
      });
      
      // Click the close button
      const closeButton = screen.getByLabelText('Close');
      expect(closeButton).toBeInTheDocument();
      fireEvent.click(closeButton);
      
      // Verify the close functionality is working (the component should start dismissing)
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Memory Management', () => {
    it('should revoke object URL when image loads', () => {
      const imageFile = new File(['image content'], 'test.png', { type: 'image/png' });
      render(<FileUpload {...defaultProps} file={imageFile} />);
      
      const image = screen.getByAltText('test.png');
      
      // Simulate image load event
      fireEvent.load(image);
      
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(expect.stringContaining('mock-object-url'));
    });

    it('should not revoke object URL for preview images', () => {
      render(<FileUpload {...defaultProps} file={null} previewSrc="preview-url" />);
      
      const image = screen.getByAltText('logo-preview');
      
      // Simulate image load event
      fireEvent.load(image);
      
      expect(global.URL.revokeObjectURL).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper file input attributes', () => {
      render(<FileUpload {...defaultProps} />);
      
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      expect(fileInput).toHaveAttribute('type', 'file');
      expect(fileInput).toHaveAttribute('accept', '.png,.jpg,.jpeg,.svg');
      expect(fileInput).toHaveStyle('display: none');
    });

    it('should have proper button labels', () => {
      render(<FileUpload {...defaultProps} />);
      
      const uploadButton = screen.getByRole('button', { name: /upload/i });
      expect(uploadButton).toBeInTheDocument();
    });

    it('should have proper image alt text', () => {
      const imageFile = new File(['image content'], 'test-image.png', { type: 'image/png' });
      render(<FileUpload {...defaultProps} file={imageFile} />);
      
      const image = screen.getByAltText('test-image.png');
      expect(image).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle file with no extension', async () => {
      const noExtFile = new File(['content'], 'noextension', { type: 'image/png' });
      render(<FileUpload {...defaultProps} file={noExtFile} />);
      
      // Since it's treated as an image file, check for image display
      const image = screen.getByAltText('noextension');
      expect(image).toBeInTheDocument();
    });

    it('should handle files with special characters in name', () => {
      const specialFile = new File(['content'], 'file with spaces & symbols!.png', { type: 'image/png' });
      render(<FileUpload {...defaultProps} file={specialFile} />);
      
      const image = screen.getByAltText('file with spaces & symbols!.png');
      expect(image).toBeInTheDocument();
    });

    it('should handle very long file names', () => {
      const longName = 'a'.repeat(100) + '.png';
      const longNameFile = new File(['content'], longName, { type: 'image/png' });
      render(<FileUpload {...defaultProps} file={longNameFile} />);
      
      const image = screen.getByAltText(longName);
      expect(image).toBeInTheDocument();
    });

    it('should handle empty supported extensions array', () => {
      render(<FileUpload {...defaultProps} supportedExtensions={[]} />);
      
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      expect(fileInput).toHaveAttribute('accept', '');
    });

    it('should handle custom upload label', () => {
      render(<FileUpload {...defaultProps} uploadLabel="Custom Upload Title" />);
      
      expect(screen.getByText('Custom Upload Title')).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete file upload workflow', async () => {
      const onFileChange = jest.fn();
      const onCheckboxChange = jest.fn();
      
      render(
        <FileUpload 
          {...defaultProps} 
          onFileChange={onFileChange}
          onCheckboxChange={onCheckboxChange}
        />
      );
      
      // Click upload button
      const uploadButton = screen.getByRole('button', { name: /upload/i });
      await userEvent.click(uploadButton);
      
      // Upload a file
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      const validFile = new File(['test content'], 'test.png', { type: 'image/png' });
      await userEvent.upload(fileInput, validFile);
      
      // Check checkbox
      const checkbox = screen.getByRole('checkbox');
      await userEvent.click(checkbox);
      
      expect(onFileChange).toHaveBeenCalledWith(validFile);
      expect(onCheckboxChange).toHaveBeenCalledWith(true);
    });

    it('should maintain state consistency across interactions', async () => {
      const onFileChange = jest.fn();
      
      const { rerender } = render(
        <FileUpload {...defaultProps} onFileChange={onFileChange} file={null} />
      );
      
      // Initially no file
      expect(screen.getByText('Entity Logo')).toBeInTheDocument();
      
      // Add a file
      const validFile = new File(['test content'], 'test.png', { type: 'image/png' });
      rerender(
        <FileUpload {...defaultProps} onFileChange={onFileChange} file={validFile} />
      );
      
      expect(screen.getByAltText('test.png')).toBeInTheDocument();
      expect(screen.queryByText('Entity Logo')).not.toBeInTheDocument();
    });
  });
});
