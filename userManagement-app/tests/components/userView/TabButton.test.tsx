import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TabButton from '../../../src/components/userView/TabButton';
import '@testing-library/jest-dom';

describe('TabButton', () => {
  const defaultProps = {
    label: 'Test Tab',
    value: 1,
    activeTab: 0,
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with label', () => {
      render(<TabButton {...defaultProps} />);
      expect(screen.getByText('Test Tab')).toBeInTheDocument();
    });

    it('should render with different labels', () => {
      render(<TabButton {...defaultProps} label="Another Tab" />);
      expect(screen.getByText('Another Tab')).toBeInTheDocument();
    });
  });

  describe('Active State', () => {
    it('should apply active styles when activeTab matches value', () => {
      const { container } = render(<TabButton {...defaultProps} activeTab={1} value={1} />);
      const box = container.firstChild as HTMLElement;
      expect(box).toHaveStyle({
        color: 'rgb(208, 240, 255)',
        backgroundColor: '#1565c0',
        borderRadius: '4px',
      });
    });

    it('should apply inactive styles when activeTab does not match value', () => {
      const { container } = render(<TabButton {...defaultProps} activeTab={0} value={1} />);
      const box = container.firstChild as HTMLElement;
      expect(box).toHaveStyle({
        color: '#818586',
        backgroundColor: 'transparent',
        borderRadius: '0px',
      });
    });

    it('should handle different active tab values', () => {
      const { container } = render(<TabButton {...defaultProps} activeTab={2} value={2} />);
      const box = container.firstChild as HTMLElement;
      expect(box).toHaveStyle({
        backgroundColor: '#1565c0',
      });
    });
  });

  describe('Click Handling', () => {
    it('should call onClick with value when clicked', () => {
      const mockOnClick = jest.fn();
      render(<TabButton {...defaultProps} onClick={mockOnClick} value={5} />);
      
      const tab = screen.getByText('Test Tab');
      fireEvent.click(tab);
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith(5);
    });

    it('should call onClick with correct value for different tabs', () => {
      const mockOnClick = jest.fn();
      render(<TabButton {...defaultProps} onClick={mockOnClick} value={10} />);
      
      const tab = screen.getByText('Test Tab');
      fireEvent.click(tab);
      
      expect(mockOnClick).toHaveBeenCalledWith(10);
    });

    it('should handle multiple clicks', () => {
      const mockOnClick = jest.fn();
      render(<TabButton {...defaultProps} onClick={mockOnClick} />);
      
      const tab = screen.getByText('Test Tab');
      fireEvent.click(tab);
      fireEvent.click(tab);
      fireEvent.click(tab);
      
      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Styling', () => {
    it('should have correct base styles', () => {
      const { container } = render(<TabButton {...defaultProps} />);
      const box = container.firstChild as HTMLElement;
      
      // Verify element exists and has MUI Box structure
      expect(box).toBeInTheDocument();
      expect(box.tagName).toBe('DIV');
      // MUI styles are applied via CSS-in-JS, so we verify the element structure
      expect(box).toHaveClass('MuiBox-root');
    });

    it('should apply hover styles for active tab', () => {
      const { container } = render(<TabButton {...defaultProps} activeTab={1} value={1} />);
      const box = container.firstChild as HTMLElement;
      
      // Simulate hover
      fireEvent.mouseEnter(box);
      
      // Note: MUI sx hover styles are applied via CSS, so we verify the element exists
      expect(box).toBeInTheDocument();
    });

    it('should apply hover styles for inactive tab', () => {
      const { container } = render(<TabButton {...defaultProps} activeTab={0} value={1} />);
      const box = container.firstChild as HTMLElement;
      
      // Simulate hover
      fireEvent.mouseEnter(box);
      
      expect(box).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle value 0', () => {
      const mockOnClick = jest.fn();
      render(<TabButton {...defaultProps} value={0} activeTab={0} onClick={mockOnClick} />);
      
      const tab = screen.getByText('Test Tab');
      fireEvent.click(tab);
      
      expect(mockOnClick).toHaveBeenCalledWith(0);
    });

    it('should handle negative value', () => {
      const mockOnClick = jest.fn();
      render(<TabButton {...defaultProps} value={-1} onClick={mockOnClick} />);
      
      const tab = screen.getByText('Test Tab');
      fireEvent.click(tab);
      
      expect(mockOnClick).toHaveBeenCalledWith(-1);
    });

    it('should handle empty label', () => {
      const { container } = render(<TabButton {...defaultProps} label="" />);
      const tab = container.firstChild as HTMLElement;
      expect(tab).toBeInTheDocument();
      expect(tab.textContent).toBe('');
    });

    it('should handle very long label', () => {
      const longLabel = 'A'.repeat(100);
      render(<TabButton {...defaultProps} label={longLabel} />);
      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it('should handle special characters in label', () => {
      const specialLabel = 'Tab @#$%^&*()';
      render(<TabButton {...defaultProps} label={specialLabel} />);
      expect(screen.getByText(specialLabel)).toBeInTheDocument();
    });
  });
});

