import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Test that all components can be imported and rendered without errors
describe('AdvancedSearch Components Integration', () => {
  it('can import and render AdvancedSearchComponent', async () => {
    const { default: AdvancedSearchComponent } = await import('../../../src/components/advancedsearch/AdvancedSearchComponent');
    
    const mockProps = {
      columns: [
        { id: 'id', name: 'ID', type: 'numerical' },
        { id: 'name', name: 'Name', type: 'string' },
      ],
      data: [
        { id: 1, name: 'Test' },
      ],
    };
    
    expect(() => {
      render(<AdvancedSearchComponent {...mockProps} />);
    }).not.toThrow();
  });

  it('can import and render QueryAutoComplete', async () => {
    const { QueryAutoComplete } = await import('../../../src/components/advancedsearch/QueryAutoComplete');
    
    const mockProps = {
      columns: [
        { id: 'id', name: 'ID', type: 'numerical' },
      ],
      onChange: jest.fn(),
    };
    
    expect(() => {
      render(<QueryAutoComplete {...mockProps} />);
    }).not.toThrow();
  });

  it('can import and render FilterOptions', async () => {
    const { FilterOptions } = await import('../../../src/components/advancedsearch/FilterOptions');
    
    const mockProps = {
      columns: [
        { id: 'id', name: 'ID', type: 'numerical' },
      ],
      selectedColumns: [],
      onColumnsChange: jest.fn(),
      onClose: jest.fn(),
      enableColumnFilter: true,
      enableRowFilter: true,
    };
    
    expect(() => {
      render(<FilterOptions {...mockProps} />);
    }).not.toThrow();
  });

  it('can import and render ClearButton', async () => {
    const { ClearButton } = await import('../../../src/components/advancedsearch/ClearButton');
    
    const mockProps = {
      onClick: jest.fn(),
      visible: true,
    };
    
    expect(() => {
      render(<ClearButton {...mockProps} />);
    }).not.toThrow();
  });

  it('can import and render ColumnFilter', async () => {
    const { ColumnFilter } = await import('../../../src/components/advancedsearch/ColumnFilter');
    
    const mockProps = {
      columns: [
        { id: 'id', name: 'ID', type: 'numerical' },
      ],
      selectedColumns: [],
      onColumnsChange: jest.fn(),
      onClose: jest.fn(),
    };
    
    expect(() => {
      render(<ColumnFilter {...mockProps} />);
    }).not.toThrow();
  });

  it('can import and render ColumnList', async () => {
    const { ColumnList } = await import('../../../src/components/advancedsearch/ColumnList');
    
    const mockProps = {
      columns: [
        { id: 'id', name: 'ID', type: 'numerical' },
      ],
      selectedFields: [],
      onSelectionChange: jest.fn(),
      onDoubleClick: jest.fn(),
      title: 'Test Columns',
    };
    
    expect(() => {
      render(<ColumnList {...mockProps} />);
    }).not.toThrow();
  });

  it('can import and render TransferButton', async () => {
    const { TransferButton } = await import('../../../src/components/advancedsearch/TransferButton');
    
    const mockProps = {
      onClick: jest.fn(),
      disabled: false,
      icon: '>',
      title: 'Move Right',
    };
    
    expect(() => {
      render(<TransferButton {...mockProps} />);
    }).not.toThrow();
  });

  it('can import and render ColumnFilterContent', async () => {
    const { ColumnFilterContent } = await import('../../../src/components/advancedsearch/ColumnFilterContent');
    
    const mockProps = {
      availableColumns: [
        { id: 'id', name: 'ID', type: 'numerical' },
      ],
      selectedColumnsTemp: [],
      selectedFieldsLeft: [],
      selectedFieldsRight: [],
      enableAddColumn: true,
      enableRemoveColumn: true,
      onAddColumn: jest.fn(),
      onRemoveColumn: jest.fn(),
      onAddAllColumns: jest.fn(),
      onRemoveAllColumns: jest.fn(),
      handleSelectionLeft: jest.fn(),
      handleSelectionRight: jest.fn(),
      onDoubleClick: jest.fn(),
    };
    
    expect(() => {
      render(<ColumnFilterContent {...mockProps} />);
    }).not.toThrow();
  });

  it('can import and render RowFilterContent', async () => {
    const { RowFilterContent } = await import('../../../src/components/advancedsearch/RowFilterContent');
    
    expect(() => {
      render(<RowFilterContent />);
    }).not.toThrow();
  });
});
