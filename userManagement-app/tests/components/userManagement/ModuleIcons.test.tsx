import React from 'react';
import { render, screen } from '@testing-library/react';
import ModuleIcon from '../../../src/components/userManagement/ModuleIcons';

// Mock the carbon icons
jest.mock('@carbon/icons-react', () => ({
  DataCollection: ({ ...props }: any) => <div data-testid="data-collection-icon" {...props} />,
  MacCommand: ({ ...props }: any) => <div data-testid="mac-command-icon" {...props} />,
  Currency: ({ ...props }: any) => <div data-testid="currency-icon" {...props} />,
  InventoryManagement: ({ ...props }: any) => <div data-testid="inventory-management-icon" {...props} />,
  Categories: ({ ...props }: any) => <div data-testid="categories-icon" {...props} />,
  Connect: ({ ...props }: any) => <div data-testid="connect-icon" {...props} />,
  Money: ({ ...props }: any) => <div data-testid="money-icon" {...props} />,
}));

describe('ModuleIcon', () => {
  it('renders DataCollection icon for Data Management module', () => {
    render(<ModuleIcon moduleName="Data Management" />);
    expect(screen.getByTestId('data-collection-icon')).toBeInTheDocument();
  });

  it('renders MacCommand icon for Master module', () => {
    render(<ModuleIcon moduleName="Master" />);
    expect(screen.getByTestId('mac-command-icon')).toBeInTheDocument();
  });

  it('renders Currency icon for Budgeting module', () => {
    render(<ModuleIcon moduleName="Budgeting" />);
    expect(screen.getByTestId('currency-icon')).toBeInTheDocument();
  });

  it('renders InventoryManagement icon for Inventory / OTB module', () => {
    render(<ModuleIcon moduleName="Inventory / OTB" />);
    expect(screen.getByTestId('inventory-management-icon')).toBeInTheDocument();
  });

  it('renders Categories icon for Assortment module', () => {
    render(<ModuleIcon moduleName="Assortment" />);
    expect(screen.getByTestId('categories-icon')).toBeInTheDocument();
  });

  it('renders Connect icon for Allocation & Replenishment module', () => {
    render(<ModuleIcon moduleName="Allocation & Replenishment" />);
    expect(screen.getByTestId('connect-icon')).toBeInTheDocument();
  });

  it('renders Money icon for FP & A module', () => {
    render(<ModuleIcon moduleName="FP & A" />);
    expect(screen.getByTestId('money-icon')).toBeInTheDocument();
  });

  it('renders Admin image for Admin module', () => {
    render(<ModuleIcon moduleName="Admin" />);
    const adminImage = screen.getByAltText('Admin');
    expect(adminImage).toBeInTheDocument();
    expect(adminImage).toHaveAttribute('src', '/icons/manage_accounts_24dp_666666.svg');
  });

  it('returns null for unknown module', () => {
    const { container } = render(<ModuleIcon moduleName="Unknown Module" />);
    expect(container.firstChild).toBeNull();
  });

  it('applies custom size and className', () => {
    render(<ModuleIcon moduleName="Data Management" size={24} className="custom-class" />);
    const icon = screen.getByTestId('data-collection-icon');
    expect(icon).toHaveAttribute('width', '24px');
    expect(icon).toHaveAttribute('height', '23px');
    expect(icon).toHaveClass('custom-class');
  });

  it('uses default size when not provided', () => {
    render(<ModuleIcon moduleName="Data Management" />);
    const icon = screen.getByTestId('data-collection-icon');
    expect(icon).toHaveAttribute('width', '20px');
    expect(icon).toHaveAttribute('height', '19px');
  });

  it('handles empty className', () => {
    render(<ModuleIcon moduleName="Data Management" className="" />);
    const icon = screen.getByTestId('data-collection-icon');
    expect(icon).toHaveAttribute('width', '20px');
    expect(icon).toHaveAttribute('height', '19px');
  });
});
