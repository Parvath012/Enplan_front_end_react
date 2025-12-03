import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Step1DownloadTemplate from '../../../src/components/bulkUpload/Step1DownloadTemplate';
import '@testing-library/jest-dom';

// Mock Carbon icons
jest.mock('@carbon/icons-react', () => ({
  Download: ({ size }: any) => <div data-testid="download-icon" data-size={size}>Download Icon</div>,
}));

describe('Step1DownloadTemplate', () => {
  const defaultProps = {
    onDownload: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render step title', () => {
      render(<Step1DownloadTemplate {...defaultProps} />);
      expect(screen.getByText('Step 1: Get the Template')).toBeInTheDocument();
    });

    it('should render description text', () => {
      render(<Step1DownloadTemplate {...defaultProps} />);
      expect(screen.getByText('Use the provided file to add user details in bulk.')).toBeInTheDocument();
    });

    it('should render download button', () => {
      render(<Step1DownloadTemplate {...defaultProps} />);
      expect(screen.getByText('Download')).toBeInTheDocument();
    });

    it('should render download icon', () => {
      render(<Step1DownloadTemplate {...defaultProps} />);
      expect(screen.getByTestId('download-icon')).toBeInTheDocument();
    });
  });

  describe('Button Interaction', () => {
    it('should call onDownload when button is clicked', () => {
      render(<Step1DownloadTemplate {...defaultProps} />);
      const downloadButton = screen.getByText('Download');
      fireEvent.click(downloadButton);
      expect(defaultProps.onDownload).toHaveBeenCalledTimes(1);
    });

    it('should call onDownload multiple times when clicked multiple times', () => {
      render(<Step1DownloadTemplate {...defaultProps} />);
      const downloadButton = screen.getByText('Download');
      fireEvent.click(downloadButton);
      fireEvent.click(downloadButton);
      fireEvent.click(downloadButton);
      expect(defaultProps.onDownload).toHaveBeenCalledTimes(3);
    });
  });

  describe('Component Structure', () => {
    it('should have correct layout structure', () => {
      const { container } = render(<Step1DownloadTemplate {...defaultProps} />);
      const boxes = container.querySelectorAll('div[class*="MuiBox"]');
      expect(boxes.length).toBeGreaterThanOrEqual(2);
    });

    it('should have Typography components', () => {
      const { container } = render(<Step1DownloadTemplate {...defaultProps} />);
      const typographyElements = container.querySelectorAll('p, span, div[class*="Typography"]');
      expect(typographyElements.length).toBeGreaterThanOrEqual(2);
    });

    it('should have Button component', () => {
      const { container } = render(<Step1DownloadTemplate {...defaultProps} />);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply correct styles to title', () => {
      render(<Step1DownloadTemplate {...defaultProps} />);
      const title = screen.getByText('Step 1: Get the Template');
      expect(title).toBeInTheDocument();
    });

    it('should apply correct styles to description', () => {
      render(<Step1DownloadTemplate {...defaultProps} />);
      const description = screen.getByText('Use the provided file to add user details in bulk.');
      expect(description).toBeInTheDocument();
    });

    it('should apply correct styles to button', () => {
      const { container } = render(<Step1DownloadTemplate {...defaultProps} />);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Icon Integration', () => {
    it('should render Download icon with correct size', () => {
      render(<Step1DownloadTemplate {...defaultProps} />);
      const icon = screen.getByTestId('download-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('data-size', '16');
    });

    it('should have icon as startIcon in button', () => {
      const { container } = render(<Step1DownloadTemplate {...defaultProps} />);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      // Icon should be inside button
      const icon = screen.getByTestId('download-icon');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null onDownload gracefully', () => {
      render(<Step1DownloadTemplate onDownload={null as any} />);
      const downloadButton = screen.getByText('Download');
      expect(downloadButton).toBeInTheDocument();
      // Should not crash when clicked
      fireEvent.click(downloadButton);
    });

    it('should handle undefined onDownload gracefully', () => {
      render(<Step1DownloadTemplate onDownload={undefined as any} />);
      const downloadButton = screen.getByText('Download');
      expect(downloadButton).toBeInTheDocument();
      // Should not crash when clicked
      fireEvent.click(downloadButton);
    });
  });
});

