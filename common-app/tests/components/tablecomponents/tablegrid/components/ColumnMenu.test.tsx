import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ColumnMenu from '../../../../../src/components/tablecomponents/tablegrid/components/ColumnMenu';

// Mock CustomMenuIcon to simplify rendering
jest.mock('../../../../../src/components/tablecomponents/tablegrid/components/CustomMenuIcon', () => ({
  __esModule: true,
  default: ({ onClick }: any) => <button data-testid="menu-icon" onClick={onClick}>Menu</button>,
}));

// Mock useGridSortMenu hook
const handleMenuOpen = jest.fn();
const handleMenuClose = jest.fn();
const onSortAsc = jest.fn();
const onSortDesc = jest.fn();

import * as GridSortMenuContextModule from '../../../../../src/components/tablecomponents/tablegrid/components/GridSortMenuContext';

function renderWithContext(contextValue: any, props: any) {
  jest.spyOn(GridSortMenuContextModule, 'useGridSortMenu').mockImplementation(() => contextValue);
  return render(<ColumnMenu {...props} />);
}

describe('ColumnMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders menu icon and opens menu', () => {
    renderWithContext({
      anchorEl: document.createElement('div'),
      menuField: 'testField',
      handleMenuOpen,
      handleMenuClose,
      onSortAsc,
      onSortDesc,
    }, { field: 'testField', menuIcon: <span>icon</span> });
    const icon = screen.getByTestId('menu-icon');
    expect(icon).toBeInTheDocument();
    fireEvent.click(icon);
    expect(handleMenuOpen).toHaveBeenCalledWith(expect.any(Object), 'testField');
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  const menuItems = [
    { label: 'Alphanumeric (A-Z, 1-9)', fn: onSortAsc, args: ['testField', 'alphanumeric'] },
    { label: 'Alphanumeric (Z-A, 9-1)', fn: onSortDesc, args: ['testField', 'alphanumeric'] },
    { label: 'Numerical (Smallest-to-Largest)', fn: onSortAsc, args: ['testField', 'numeric'] },
    { label: 'Numerical (Largest-to-Smallest)', fn: onSortDesc, args: ['testField', 'numeric'] },
    { label: 'Date (Earliest-to-Latest)', fn: onSortAsc, args: ['testField', 'date'] },
    { label: 'Date (Latest-to-Earliest)', fn: onSortDesc, args: ['testField', 'date'] },
    { label: 'Fill Color (Asc)', fn: onSortAsc, args: ['testField', 'fillColor'] },
    { label: 'Fill Color (Desc)', fn: onSortDesc, args: ['testField', 'fillColor'] },
    { label: 'Font Color (Asc)', fn: onSortAsc, args: ['testField', 'fontColor'] },
    { label: 'Font Color (Desc)', fn: onSortDesc, args: ['testField', 'fontColor'] },
  ];

  test.each(menuItems)('clicking "%s" calls correct handler and closes menu', ({ label, fn, args }) => {
    renderWithContext({
      anchorEl: document.createElement('div'),
      menuField: 'testField',
      handleMenuOpen,
      handleMenuClose,
      onSortAsc,
      onSortDesc,
    }, { field: 'testField', menuIcon: <span>icon</span> });
    const item = screen.getByText(label);
    fireEvent.click(item);
    expect(fn).toHaveBeenCalledWith(...args);
    expect(handleMenuClose).toHaveBeenCalled();
  });

  test('menu does not open for other fields', () => {
    renderWithContext({
      anchorEl: document.createElement('div'),
      menuField: 'otherField',
      handleMenuOpen,
      handleMenuClose,
      onSortAsc,
      onSortDesc,
    }, { field: 'testField', menuIcon: <span>icon</span> });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  test('does not throw if handleMenuOpen is undefined', () => {
    renderWithContext({
      anchorEl: document.createElement('div'),
      menuField: 'testField',
      handleMenuOpen: undefined,
      handleMenuClose,
      onSortAsc,
      onSortDesc,
    }, { field: 'testField', menuIcon: <span>icon</span> });
    const icon = screen.getByTestId('menu-icon');
    expect(() => fireEvent.click(icon)).not.toThrow();
  });

  test('does not throw if handleMenuClose is undefined', () => {
    renderWithContext({
      anchorEl: document.createElement('div'),
      menuField: 'testField',
      handleMenuOpen,
      handleMenuClose: undefined,
      onSortAsc,
      onSortDesc,
    }, { field: 'testField', menuIcon: <span>icon</span> });
    const item = screen.getByText('Alphanumeric (A-Z, 1-9)');
    expect(() => fireEvent.click(item)).not.toThrow();
  });

  test('does not throw if onSortAsc is undefined', () => {
    renderWithContext({
      anchorEl: document.createElement('div'),
      menuField: 'testField',
      handleMenuOpen,
      handleMenuClose,
      onSortAsc: undefined,
      onSortDesc,
    }, { field: 'testField', menuIcon: <span>icon</span> });
    const item = screen.getByText('Alphanumeric (A-Z, 1-9)');
    expect(() => fireEvent.click(item)).not.toThrow();
  });

  test('does not throw if onSortDesc is undefined', () => {
    renderWithContext({
      anchorEl: document.createElement('div'),
      menuField: 'testField',
      handleMenuOpen,
      handleMenuClose,
      onSortAsc,
      onSortDesc: undefined,
    }, { field: 'testField', menuIcon: <span>icon</span> });
    const item = screen.getByText('Alphanumeric (Z-A, 9-1)');
    expect(() => fireEvent.click(item)).not.toThrow();
  });
});
