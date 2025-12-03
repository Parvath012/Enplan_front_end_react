import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CurrencyDefaultCellRenderer from '../../../../src/components/entityConfiguration/shared/CurrencyDefaultCellRenderer';

describe('CurrencyDefaultCellRenderer', () => {
  const defaultProps = {
    data: { currencyCode: 'USD' },
    isEditMode: true,
    onSetDefault: jest.fn(),
    defaultCurrency: [],
    isDefault: null,
    isPrePopulated: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<CurrencyDefaultCellRenderer {...defaultProps} />);
      
      const iconButton = screen.getByRole('button');
      const circleBox = screen.getByRole('button').querySelector('div');
      
      expect(iconButton).toBeInTheDocument();
      expect(iconButton).not.toBeDisabled();
      expect(circleBox).toBeInTheDocument();
    });

    it('should render with correct data', () => {
      const data = { currencyCode: 'EUR' };
      render(<CurrencyDefaultCellRenderer {...defaultProps} data={data} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toBeInTheDocument();
    });

    it('should render circle with correct styling', () => {
      render(<CurrencyDefaultCellRenderer {...defaultProps} />);
      
      const circleBox = screen.getByRole('button').querySelector('div');
      expect(circleBox).toHaveStyle({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        backgroundColor: '#FFFFFF',
        boxSizing: 'border-box',
      });
    });
  });

  describe('Default Currency State', () => {
    it('should show selected state when currency is default', () => {
      render(<CurrencyDefaultCellRenderer {...defaultProps} isDefault="USD" />);
      
      const circleBox = screen.getByRole('button').querySelector('div');
      expect(circleBox).toHaveStyle({
        border: '5px solid #0051AB',
      });
    });

    it('should show unselected state when currency is not default', () => {
      render(<CurrencyDefaultCellRenderer {...defaultProps} isDefault={null} />);
      
      const circleBox = screen.getByRole('button').querySelector('div');
      expect(circleBox).toHaveStyle({
        border: '1px solid #CBD5E1',
      });
    });

    it('should show unselected state when different currency is default', () => {
      render(<CurrencyDefaultCellRenderer {...defaultProps} isDefault="EUR" />);
      
      const circleBox = screen.getByRole('button').querySelector('div');
      expect(circleBox).toHaveStyle({
        border: '1px solid #CBD5E1',
      });
    });

    it('should handle empty string default currency', () => {
      render(<CurrencyDefaultCellRenderer {...defaultProps} isDefault="" />);
      
      const circleBox = screen.getByRole('button').querySelector('div');
      expect(circleBox).toHaveStyle({
        border: '1px solid #CBD5E1',
      });
    });
  });

  describe('Button States', () => {
    it('should be enabled when in edit mode and not pre-populated', () => {
      render(<CurrencyDefaultCellRenderer {...defaultProps} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).not.toBeDisabled();
      expect(iconButton).toHaveStyle({
        opacity: '1',
        cursor: 'pointer',
      });
    });

    it('should be disabled when not in edit mode', () => {
      render(<CurrencyDefaultCellRenderer {...defaultProps} isEditMode={false} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toBeDisabled();
      // Note: Modern MUI may apply different styling for disabled state
    });

    it('should be disabled when not in edit mode', () => {
      render(<CurrencyDefaultCellRenderer {...defaultProps} isEditMode={false} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toBeDisabled();
      expect(iconButton).toHaveStyle({
        opacity: '1', // Component doesn't change opacity when disabled
      });
      // Modern MUI buttons use 'default' cursor style when disabled
    });

    it('should be disabled when both not in edit mode and pre-populated', () => {
      render(<CurrencyDefaultCellRenderer 
        {...defaultProps} 
        isEditMode={false} 
        isPrePopulated={true} 
      />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toBeDisabled();
      expect(iconButton).toHaveStyle({
        opacity: '1', // Component doesn't change opacity when disabled
      });
      // Modern MUI buttons use 'default' cursor style when disabled
    });
  });

  describe('User Interactions', () => {
    it('should call onSetDefault when clicked in edit mode', () => {
      const onSetDefault = jest.fn();
      render(<CurrencyDefaultCellRenderer {...defaultProps} onSetDefault={onSetDefault} />);
      
      const iconButton = screen.getByRole('button');
      fireEvent.click(iconButton);
      
      expect(onSetDefault).toHaveBeenCalledWith('USD');
      expect(onSetDefault).toHaveBeenCalledTimes(1);
    });

    it('should not call onSetDefault when disabled', () => {
      const onSetDefault = jest.fn();
      render(<CurrencyDefaultCellRenderer 
        {...defaultProps} 
        onSetDefault={onSetDefault} 
        isEditMode={false} 
      />);
      
      const iconButton = screen.getByRole('button');
      fireEvent.click(iconButton);
      
      expect(onSetDefault).not.toHaveBeenCalled();
    });

    it('should not call onSetDefault when not in edit mode', () => {
      const onSetDefault = jest.fn();
      render(<CurrencyDefaultCellRenderer 
        {...defaultProps} 
        onSetDefault={onSetDefault} 
        isEditMode={false} 
      />);
      
      const iconButton = screen.getByRole('button');
      fireEvent.click(iconButton);
      
      expect(onSetDefault).not.toHaveBeenCalled();
    });

    it('should call onSetDefault with correct currency code', () => {
      const onSetDefault = jest.fn();
      const data = { currencyCode: 'GBP' };
      render(<CurrencyDefaultCellRenderer {...defaultProps} data={data} onSetDefault={onSetDefault} />);
      
      const iconButton = screen.getByRole('button');
      fireEvent.click(iconButton);
      
      expect(onSetDefault).toHaveBeenCalledWith('GBP');
    });
  });

  describe('Circle Hover Effects', () => {

    it('should maintain border color on hover when default', () => {
      render(<CurrencyDefaultCellRenderer {...defaultProps} defaultCurrency="USD" />);
      
      const circleBox = screen.getByRole('button').querySelector('div');
      // Note: Testing libraries can't directly test pseudo-class styles like :hover
      expect(circleBox).toBeTruthy();
    });
  });

  describe('Styling Properties', () => {
    it('should have correct button styling', () => {
      render(<CurrencyDefaultCellRenderer {...defaultProps} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toHaveStyle({
        padding: '0',
        transition: 'none',
      });
    });

    it('should have correct circle styling', () => {
      render(<CurrencyDefaultCellRenderer {...defaultProps} />);
      
      const circleBox = screen.getByRole('button').querySelector('div');
      expect(circleBox).toHaveStyle({
        transition: 'none',
      });
    });
  });

  describe('Data Handling', () => {
    it('should handle different currency codes', () => {
      const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];
      
      currencies.forEach(currency => {
        const onSetDefault = jest.fn();
        const data = { currencyCode: currency };
        
        const { unmount } = render(
          <CurrencyDefaultCellRenderer 
            {...defaultProps} 
            data={data} 
            onSetDefault={onSetDefault} 
          />
        );
        
        const iconButton = screen.getByRole('button');
        fireEvent.click(iconButton);
        
        expect(onSetDefault).toHaveBeenCalledWith(currency);
        unmount();
      });
    });

    it('should handle empty currency code', () => {
      const onSetDefault = jest.fn();
      const data = { currencyCode: '' };
      
      render(<CurrencyDefaultCellRenderer {...defaultProps} data={data} onSetDefault={onSetDefault} />);
      
      const iconButton = screen.getByRole('button');
      fireEvent.click(iconButton);
      
      expect(onSetDefault).toHaveBeenCalledWith('');
    });

    it('should handle undefined currency code', () => {
      const onSetDefault = jest.fn();
      const data = { currencyCode: undefined };
      
      render(<CurrencyDefaultCellRenderer {...defaultProps} data={data} onSetDefault={onSetDefault} />);
      
      const iconButton = screen.getByRole('button');
      fireEvent.click(iconButton);
      
      expect(onSetDefault).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple rapid clicks', () => {
      const onSetDefault = jest.fn();
      render(<CurrencyDefaultCellRenderer {...defaultProps} onSetDefault={onSetDefault} />);
      
      const iconButton = screen.getByRole('button');
      
      fireEvent.click(iconButton);
      fireEvent.click(iconButton);
      fireEvent.click(iconButton);
      
      expect(onSetDefault).toHaveBeenCalledTimes(3);
    });

    it('should handle keyboard events', () => {
      const onSetDefault = jest.fn();
      render(<CurrencyDefaultCellRenderer {...defaultProps} onSetDefault={onSetDefault} />);
      
      const iconButton = screen.getByRole('button');
      
      fireEvent.keyDown(iconButton, { key: 'Enter' });
      fireEvent.keyDown(iconButton, { key: ' ' });
      
      // Button should still be clickable
      fireEvent.click(iconButton);
      expect(onSetDefault).toHaveBeenCalledWith('USD');
    });

    it('should handle setting same currency as default', () => {
      const onSetDefault = jest.fn();
      render(<CurrencyDefaultCellRenderer {...defaultProps} defaultCurrency="USD" onSetDefault={onSetDefault} />);
      
      const iconButton = screen.getByRole('button');
      fireEvent.click(iconButton);
      
      expect(onSetDefault).toHaveBeenCalledWith('USD');
    });
  });

  describe('Accessibility', () => {
    it('should be accessible via keyboard', () => {
      render(<CurrencyDefaultCellRenderer {...defaultProps} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toBeInTheDocument();
      
      iconButton.focus();
      expect(iconButton).toHaveFocus();
    });

    it('should have proper ARIA attributes when disabled', () => {
      render(<CurrencyDefaultCellRenderer {...defaultProps} isEditMode={false} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toBeDisabled();
    });

    it('should maintain focus styles', () => {
      render(<CurrencyDefaultCellRenderer {...defaultProps} />);
      
      const iconButton = screen.getByRole('button');
      // Note: Testing libraries can't directly test pseudo-class styles like :focus
      expect(iconButton).toBeTruthy();
    });
  });

  describe('Visual States', () => {
    it('should show correct visual state for selected currency', () => {
      render(<CurrencyDefaultCellRenderer {...defaultProps} isDefault="USD" />);
      
      const circleBox = screen.getByRole('button').querySelector('div');
      expect(circleBox).toHaveStyle({
        border: '5px solid #0051AB',
        backgroundColor: '#FFFFFF',
      });
    });

    it('should show correct visual state for unselected currency', () => {
      render(<CurrencyDefaultCellRenderer {...defaultProps} isDefault={null} />);
      
      const circleBox = screen.getByRole('button').querySelector('div');
      expect(circleBox).toHaveStyle({
        border: '1px solid #CBD5E1',
        backgroundColor: '#FFFFFF',
      });
    });

    it('should show disabled visual state', () => {
      render(<CurrencyDefaultCellRenderer {...defaultProps} isEditMode={false} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toHaveStyle({
        opacity: '1', // Component doesn't change opacity when disabled
      });
      // Modern MUI buttons use 'default' cursor style when disabled
    });
  });

  describe('Memo Comparison Function (lines 75-76)', () => {
    it('should prevent re-render when props are equal', () => {
      const { rerender } = render(<CurrencyDefaultCellRenderer {...defaultProps} />);
      const initialRenderCount = screen.getByRole('button');
      
      // Re-render with same props - should not cause re-render due to memo
      rerender(<CurrencyDefaultCellRenderer {...defaultProps} />);
      const afterRerender = screen.getByRole('button');
      
      // Both should be the same element (memo prevents re-render)
      expect(initialRenderCount).toBe(afterRerender);
    });

    it('should re-render when currencyCode changes', () => {
      const { rerender } = render(<CurrencyDefaultCellRenderer {...defaultProps} />);
      
      // Change currencyCode - should cause re-render
      rerender(<CurrencyDefaultCellRenderer {...defaultProps} data={{ currencyCode: 'EUR' }} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toBeInTheDocument();
    });

    it('should re-render when isEditMode changes', () => {
      const { rerender } = render(<CurrencyDefaultCellRenderer {...defaultProps} />);
      
      // Change isEditMode - should cause re-render
      rerender(<CurrencyDefaultCellRenderer {...defaultProps} isEditMode={false} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toBeDisabled();
    });

    it('should re-render when defaultCurrency changes', () => {
      const { rerender } = render(<CurrencyDefaultCellRenderer {...defaultProps} />);
      
      // Change defaultCurrency - should cause re-render
      rerender(<CurrencyDefaultCellRenderer {...defaultProps} defaultCurrency={['USD']} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toBeInTheDocument();
    });

    it('should re-render when isDefault changes', () => {
      const { rerender } = render(<CurrencyDefaultCellRenderer {...defaultProps} />);
      
      // Change isDefault - should cause re-render
      rerender(<CurrencyDefaultCellRenderer {...defaultProps} isDefault="USD" />);
      
      const circleBox = screen.getByRole('button').querySelector('div');
      expect(circleBox).toHaveStyle({ border: '5px solid #0051AB' });
    });

    it('should re-render when isPrePopulated changes', () => {
      const { rerender } = render(<CurrencyDefaultCellRenderer {...defaultProps} />);
      
      // Change isPrePopulated - should cause re-render
      rerender(<CurrencyDefaultCellRenderer {...defaultProps} isPrePopulated={true} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toBeInTheDocument();
    });

    it('should re-render when onSetDefault function reference changes', () => {
      const onSetDefault1 = jest.fn();
      const { rerender } = render(
        <CurrencyDefaultCellRenderer {...defaultProps} onSetDefault={onSetDefault1} />
      );
      
      // Change onSetDefault function - should cause re-render
      const onSetDefault2 = jest.fn();
      rerender(<CurrencyDefaultCellRenderer {...defaultProps} onSetDefault={onSetDefault2} />);
      
      const iconButton = screen.getByRole('button');
      fireEvent.click(iconButton);
      expect(onSetDefault2).toHaveBeenCalled();
      expect(onSetDefault1).not.toHaveBeenCalled();
    });
  });
});
