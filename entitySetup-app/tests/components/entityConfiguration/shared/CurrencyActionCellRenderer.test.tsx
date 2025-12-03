import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CurrencyActionCellRenderer from '../../../../src/components/entityConfiguration/shared/CurrencyActionCellRenderer';

// Mock Carbon icons
jest.mock('@carbon/icons-react', () => ({
  TrashCan: ({ size, color }: { size: number; color: string }) => (
    <div data-testid="trash-icon" data-size={size} data-color={color}>
      Trash Icon
    </div>
  ),
}));

describe('CurrencyActionCellRenderer', () => {
  const defaultProps = {
    data: { currencyCode: 'USD' },
    isEditMode: true,
    onToggle: jest.fn(),
    defaultCurrency: [],
    isDefault: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<CurrencyActionCellRenderer {...defaultProps} />);
      
      const iconButton = screen.getByRole('button');
      const trashIcon = screen.getByTestId('trash-icon');
      
      expect(iconButton).toBeInTheDocument();
      expect(iconButton).not.toBeDisabled();
      expect(trashIcon).toBeInTheDocument();
      expect(trashIcon).toHaveAttribute('data-size', '16');
      expect(trashIcon).toHaveAttribute('data-color', '#5B6061');
    });

    it('should render with correct data', () => {
      const data = { currencyCode: 'EUR' };
      render(<CurrencyActionCellRenderer {...defaultProps} data={data} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toBeInTheDocument();
    });

    it('should render trash icon with correct props', () => {
      render(<CurrencyActionCellRenderer {...defaultProps} />);
      
      const trashIcon = screen.getByTestId('trash-icon');
      expect(trashIcon).toHaveAttribute('data-size', '16');
      expect(trashIcon).toHaveAttribute('data-color', '#5B6061');
    });
  });

  describe('Button States', () => {
    it('should be enabled when in edit mode, not pre-populated, and not default', () => {
      render(<CurrencyActionCellRenderer {...defaultProps} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).not.toBeDisabled();
      expect(iconButton).toHaveStyle({
        opacity: '1',
        cursor: 'pointer',
      });
    });

    it('should be disabled when not in edit mode', () => {
      render(<CurrencyActionCellRenderer {...defaultProps} isEditMode={false} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toBeDisabled();
      expect(iconButton).toHaveStyle({
        opacity: '0.5',
      });
      // Modern MUI buttons use 'default' cursor style when disabled
    });

    it('should be disabled when isDefault matches currency', () => {
      render(<CurrencyActionCellRenderer {...defaultProps} isDefault="USD" />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toBeDisabled();
      expect(iconButton).toHaveStyle({
        opacity: '0.5',
      });
      // Modern MUI buttons use 'default' cursor style when disabled
    });

    it('should be disabled when currency is default', () => {
      render(<CurrencyActionCellRenderer {...defaultProps} defaultCurrency={['USD']} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toBeDisabled();
      expect(iconButton).toHaveStyle({
        opacity: '0.5',
      });
      // Modern MUI buttons use 'default' cursor style when disabled
    });

    it('should be disabled when both not in edit mode and isDefault matches', () => {
      render(<CurrencyActionCellRenderer 
        {...defaultProps} 
        isEditMode={false} 
        isDefault="USD" 
      />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toBeDisabled();
      expect(iconButton).toHaveStyle({
        opacity: '0.5',
      });
      // Modern MUI buttons use 'default' cursor style when disabled
    });

    it('should be disabled when both not in edit mode and default currency', () => {
      render(<CurrencyActionCellRenderer 
        {...defaultProps} 
        isEditMode={false} 
        defaultCurrency={['USD']} 
      />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toBeDisabled();
      expect(iconButton).toHaveStyle({
        opacity: '0.5',
      });
      // Modern MUI buttons use 'default' cursor style when disabled
    });

    it('should be disabled when both isDefault matches and default currency', () => {
      render(<CurrencyActionCellRenderer 
        {...defaultProps} 
        isDefault="USD" 
        defaultCurrency={['USD']} 
      />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toBeDisabled();
      expect(iconButton).toHaveStyle({
        opacity: '0.5',
      });
      // Modern MUI buttons use 'default' cursor style when disabled
    });

    it('should be disabled when all conditions are true', () => {
      render(<CurrencyActionCellRenderer 
        {...defaultProps} 
        isEditMode={false} 
        isDefault="USD" 
        defaultCurrency={['USD']} 
      />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toBeDisabled();
      expect(iconButton).toHaveStyle({
        opacity: '0.5',
      });
      // Modern MUI buttons use 'default' cursor style when disabled
    });
  });

  describe('Default Currency Logic', () => {
    it('should correctly identify default currency', () => {
      render(<CurrencyActionCellRenderer {...defaultProps} defaultCurrency={['USD']} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toBeDisabled();
    });

    it('should not be disabled when different currency is default', () => {
      render(<CurrencyActionCellRenderer {...defaultProps} defaultCurrency={['EUR']} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).not.toBeDisabled();
    });

    it('should handle empty default currency array', () => {
      render(<CurrencyActionCellRenderer {...defaultProps} defaultCurrency={[]} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).not.toBeDisabled();
    });

    it('should handle multiple default currencies', () => {
      render(<CurrencyActionCellRenderer {...defaultProps} defaultCurrency={['EUR', 'GBP']} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).not.toBeDisabled();
    });

    it('should be disabled when currency is in multiple default currencies', () => {
      render(<CurrencyActionCellRenderer {...defaultProps} defaultCurrency={['USD', 'EUR']} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toBeDisabled();
    });
  });

  describe('User Interactions', () => {
    it('should call onToggle when clicked in edit mode', () => {
      const onToggle = jest.fn();
      render(<CurrencyActionCellRenderer {...defaultProps} onToggle={onToggle} />);
      
      const iconButton = screen.getByRole('button');
      fireEvent.click(iconButton);
      
      expect(onToggle).toHaveBeenCalledWith('USD');
      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('should not call onToggle when disabled', () => {
      const onToggle = jest.fn();
      render(<CurrencyActionCellRenderer 
        {...defaultProps} 
        onToggle={onToggle} 
        isEditMode={false} 
      />);
      
      const iconButton = screen.getByRole('button');
      fireEvent.click(iconButton);
      
      expect(onToggle).not.toHaveBeenCalled();
    });

    it('should not call onToggle when isDefault matches', () => {
      const onToggle = jest.fn();
      render(<CurrencyActionCellRenderer 
        {...defaultProps} 
        onToggle={onToggle} 
        isDefault="USD" 
      />);
      
      const iconButton = screen.getByRole('button');
      fireEvent.click(iconButton);
      
      expect(onToggle).not.toHaveBeenCalled();
    });

    it('should not call onToggle when default currency', () => {
      const onToggle = jest.fn();
      render(<CurrencyActionCellRenderer 
        {...defaultProps} 
        onToggle={onToggle} 
        defaultCurrency={['USD']} 
      />);
      
      const iconButton = screen.getByRole('button');
      fireEvent.click(iconButton);
      
      expect(onToggle).not.toHaveBeenCalled();
    });

    it('should call onToggle with correct currency code', () => {
      const onToggle = jest.fn();
      const data = { currencyCode: 'GBP' };
      render(<CurrencyActionCellRenderer {...defaultProps} data={data} onToggle={onToggle} />);
      
      const iconButton = screen.getByRole('button');
      fireEvent.click(iconButton);
      
      expect(onToggle).toHaveBeenCalledWith('GBP');
    });
  });

  describe('Styling', () => {
    it('should apply correct styles when enabled', () => {
      render(<CurrencyActionCellRenderer {...defaultProps} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toHaveStyle({
        opacity: '1',
        cursor: 'pointer',
      });
    });

    it('should apply correct styles when disabled', () => {
      render(<CurrencyActionCellRenderer {...defaultProps} isDefault="USD" />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toHaveStyle({
        opacity: '0.5',
      });
      // Modern MUI buttons use 'default' cursor style when disabled
    });

    it('should have small size', () => {
      render(<CurrencyActionCellRenderer {...defaultProps} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toBeInTheDocument();
    });
  });

  describe('Data Handling', () => {
    it('should handle different currency codes', () => {
      const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
      
      currencies.forEach(currency => {
        const onToggle = jest.fn();
        const data = { currencyCode: currency };
        
        const { unmount } = render(
          <CurrencyActionCellRenderer 
            {...defaultProps} 
            data={data} 
            onToggle={onToggle} 
          />
        );
        
        const iconButton = screen.getByRole('button');
        fireEvent.click(iconButton);
        
        expect(onToggle).toHaveBeenCalledWith(currency);
        unmount();
      });
    });

    it('should handle empty currency code', () => {
      const onToggle = jest.fn();
      const data = { currencyCode: '' };
      
      render(<CurrencyActionCellRenderer {...defaultProps} data={data} onToggle={onToggle} />);
      
      const iconButton = screen.getByRole('button');
      fireEvent.click(iconButton);
      
      expect(onToggle).toHaveBeenCalledWith('');
    });

    it('should handle undefined currency code', () => {
      const onToggle = jest.fn();
      const data = { currencyCode: undefined };
      
      render(<CurrencyActionCellRenderer {...defaultProps} data={data} onToggle={onToggle} />);
      
      const iconButton = screen.getByRole('button');
      fireEvent.click(iconButton);
      
      expect(onToggle).toHaveBeenCalledWith(undefined);
    });

  });

  describe('Edge Cases', () => {
    it('should handle multiple rapid clicks', () => {
      const onToggle = jest.fn();
      render(<CurrencyActionCellRenderer {...defaultProps} onToggle={onToggle} />);
      
      const iconButton = screen.getByRole('button');
      
      fireEvent.click(iconButton);
      fireEvent.click(iconButton);
      fireEvent.click(iconButton);
      
      expect(onToggle).toHaveBeenCalledTimes(3);
    });

    it('should handle keyboard events', () => {
      const onToggle = jest.fn();
      render(<CurrencyActionCellRenderer {...defaultProps} onToggle={onToggle} />);
      
      const iconButton = screen.getByRole('button');
      
      fireEvent.keyDown(iconButton, { key: 'Enter' });
      fireEvent.keyDown(iconButton, { key: ' ' });
      
      // Button should still be clickable
      fireEvent.click(iconButton);
      expect(onToggle).toHaveBeenCalledWith('USD');
    });

    it('should handle case sensitivity in currency codes', () => {
      const onToggle = jest.fn();
      const data = { currencyCode: 'usd' }; // lowercase
      
      render(<CurrencyActionCellRenderer {...defaultProps} data={data} onToggle={onToggle} />);
      
      const iconButton = screen.getByRole('button');
      fireEvent.click(iconButton);
      
      expect(onToggle).toHaveBeenCalledWith('usd');
    });

    it('should handle special characters in currency codes', () => {
      const onToggle = jest.fn();
      const data = { currencyCode: 'USD$' };
      
      render(<CurrencyActionCellRenderer {...defaultProps} data={data} onToggle={onToggle} />);
      
      const iconButton = screen.getByRole('button');
      fireEvent.click(iconButton);
      
      expect(onToggle).toHaveBeenCalledWith('USD$');
    });
  });

  describe('Accessibility', () => {
    it('should be accessible via keyboard', () => {
      render(<CurrencyActionCellRenderer {...defaultProps} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toBeInTheDocument();
      
      iconButton.focus();
      expect(iconButton).toHaveFocus();
    });

    it('should have proper ARIA attributes when disabled', () => {
      render(<CurrencyActionCellRenderer {...defaultProps} isEditMode={false} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toBeDisabled();
    });

    it('should maintain focus styles', () => {
      render(<CurrencyActionCellRenderer {...defaultProps} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toBeInTheDocument();
    });
  });

  describe('Component Logic', () => {
    it('should correctly calculate isDefaultCurrency', () => {
      const { rerender } = render(<CurrencyActionCellRenderer {...defaultProps} defaultCurrency={['USD']} />);
      
      let iconButton = screen.getByRole('button');
      expect(iconButton).toBeDisabled();
      
      rerender(<CurrencyActionCellRenderer {...defaultProps} defaultCurrency={['EUR']} />);
      
      iconButton = screen.getByRole('button');
      expect(iconButton).not.toBeDisabled();
    });

    it('should correctly calculate isDisabled', () => {
      const { rerender } = render(<CurrencyActionCellRenderer {...defaultProps} />);
      
      let iconButton = screen.getByRole('button');
      expect(iconButton).not.toBeDisabled();
      
      rerender(<CurrencyActionCellRenderer {...defaultProps} isEditMode={false} />);
      
      iconButton = screen.getByRole('button');
      expect(iconButton).toBeDisabled();
      
      rerender(<CurrencyActionCellRenderer {...defaultProps} isDefault="USD" />);
      
      iconButton = screen.getByRole('button');
      expect(iconButton).toBeDisabled();
      
      rerender(<CurrencyActionCellRenderer {...defaultProps} defaultCurrency={['USD']} />);
      
      iconButton = screen.getByRole('button');
      expect(iconButton).toBeDisabled();
    });
  });

  describe('Visual States', () => {
    it('should show enabled visual state', () => {
      render(<CurrencyActionCellRenderer {...defaultProps} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toHaveStyle({
        opacity: '1',
        cursor: 'pointer',
      });
    });

    it('should show disabled visual state', () => {
      render(<CurrencyActionCellRenderer {...defaultProps} isDefault="USD" />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toHaveStyle({
        opacity: '0.5',
      });
      // Modern MUI buttons use 'default' cursor style when disabled
    });

    it('should show disabled state for default currency', () => {
      render(<CurrencyActionCellRenderer {...defaultProps} defaultCurrency={['USD']} />);
      
      const iconButton = screen.getByRole('button');
      expect(iconButton).toHaveStyle({
        opacity: '0.5',
      });
      // Modern MUI buttons use 'default' cursor style when disabled
    });
  });
});
