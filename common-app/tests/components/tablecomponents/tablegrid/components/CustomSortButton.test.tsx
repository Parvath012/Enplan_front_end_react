import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomSortButton from '../../../../../src/components/tablecomponents/tablegrid/components/CustomSortButton';

describe('CustomSortButton', () => {
  const field = 'testField';
  const onSortAsc = jest.fn();
  const onSortDesc = jest.fn();
  const onClearSort = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders button and icon', () => {
    render(
      <CustomSortButton
        field={field}
        sortDirection={null}
        sortPriority={null}
        sortType={null}
      />
    );
    expect(screen.getByRole('button', { name: /sort column/i })).toBeInTheDocument();
    expect(screen.getByTestId('custom-sort-icon')).toBeInTheDocument();
  });

  test('shows sort priority indicator when sortPriority is set', () => {
    render(
      <CustomSortButton
        field={field}
        sortDirection={null}
        sortPriority={2}
        sortType={null}
      />
    );
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByTitle('Sort priority: 2')).toBeInTheDocument();
  });

  test('shows sort priority indicator with sortType in title', () => {
    render(
      <CustomSortButton
        field={field}
        sortDirection={null}
        sortPriority={3}
        sortType="numeric"
      />
    );
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByTitle('Sort priority: 3 (numeric)')).toBeInTheDocument();
  });

  test('calls onSortDesc when sortDirection is null (click)', () => {
    render(
      <CustomSortButton
        field={field}
        sortDirection={null}
        sortPriority={null}
        sortType={null}
        onSortDesc={onSortDesc}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onSortDesc).toHaveBeenCalledWith(field, 'alphanumeric');
  });

  test('calls onSortAsc when sortDirection is "desc" (click)', () => {
    render(
      <CustomSortButton
        field={field}
        sortDirection="desc"
        sortPriority={null}
        sortType="numeric"
        onSortAsc={onSortAsc}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onSortAsc).toHaveBeenCalledWith(field, 'numeric');
  });

  test('calls onClearSort when sortDirection is "asc" (click)', () => {
    render(
      <CustomSortButton
        field={field}
        sortDirection="asc"
        sortPriority={null}
        sortType={null}
        onClearSort={onClearSort}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClearSort).toHaveBeenCalledWith(field);
  });

  test('calls correct handler on Enter keydown', () => {
    render(
      <CustomSortButton
        field={field}
        sortDirection={null}
        sortPriority={null}
        sortType={null}
        onSortDesc={onSortDesc}
      />
    );
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(onSortDesc).toHaveBeenCalledWith(field, 'alphanumeric');
  });

  test('calls correct handler on Space keydown', () => {
    render(
      <CustomSortButton
        field={field}
        sortDirection="desc"
        sortPriority={null}
        sortType="numeric"
        onSortAsc={onSortAsc}
      />
    );
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });
    expect(onSortAsc).toHaveBeenCalledWith(field, 'numeric');
  });

  test('does not throw if onSortDesc is undefined', () => {
    render(
      <CustomSortButton
        field={field}
        sortDirection={null}
        sortPriority={null}
        sortType={null}
      />
    );
    expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
  });

  test('does not throw if onSortAsc is undefined', () => {
    render(
      <CustomSortButton
        field={field}
        sortDirection="desc"
        sortPriority={null}
        sortType={null}
      />
    );
    expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
  });

  test('does not throw if onClearSort is undefined', () => {
    render(
      <CustomSortButton
        field={field}
        sortDirection="asc"
        sortPriority={null}
        sortType={null}
      />
    );
    expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
  });

  test('ignores other keydown events', () => {
    render(
      <CustomSortButton
        field={field}
        sortDirection={null}
        sortPriority={null}
        sortType={null}
        onSortDesc={onSortDesc}
      />
    );
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Tab' });
    expect(onSortDesc).not.toHaveBeenCalled();
  });
});
