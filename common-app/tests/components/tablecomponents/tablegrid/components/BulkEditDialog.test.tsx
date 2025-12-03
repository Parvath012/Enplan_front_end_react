import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import BulkEditDialog from '../../../../../src/components/tablecomponents/tablegrid/components/BulkEditDialog';
import * as gridActions from '../../../../../src/store/Actions/gridActions';
import { BulkEditDataType } from '../../../../../src/services/BulkEditService';

// Mock the createPortal method
jest.mock('react-dom', () => {
  const original = jest.requireActual('react-dom');
  return {
    ...original,
    createPortal: (node: React.ReactNode) => node,
  };
});

// Create mock store for testing
const mockStore = configureStore();

// Mock BulkEditService
jest.mock('../../../../../src/services/BulkEditService', () => {
  const original = jest.requireActual('../../../../../src/services/BulkEditService');
  return {
    ...original,
    BulkEditService: {
      detectDataType: jest.fn(),
      validateValue: jest.fn().mockReturnValue({ isValid: true }),
      formatValue: jest.fn(val => val),
    }
  };
});

// Mock gridActions
jest.spyOn(gridActions, 'applyBulkEdit').mockImplementation((...args) => {
  // Store args for testing
  (gridActions.applyBulkEdit as any).mockArgs = args;
  // Return a plain action instead of a thunk to avoid middleware issues
  return { type: 'MOCK_APPLY_BULK_EDIT', args };
});
jest.spyOn(gridActions, 'cancelBulkEdit').mockImplementation(() => ({ type: 'MOCK_CANCEL_BULK_EDIT' }));

// Helper function to get an input element safely regardless of ARIA support
const getInputElement = (labelTextOrType) => {
  // Create an array of query functions to try in sequence
  const strategies = [
    // 1. Try finding by label text (most reliable)
    () => {
      try { return screen.getByLabelText(labelTextOrType); }
      catch { return null; }
    },
    
    // 2. Try finding by test ID
    () => {
      const testId = `${labelTextOrType.toLowerCase()}-input`;
      try { return screen.getByTestId(testId); }
      catch { return null; }
    },
    
    // 3. Try finding by type attribute
    () => document.querySelector(`input[type="${labelTextOrType.toLowerCase()}"]`),
    
    // 4. Try finding by placeholder text
    () => document.querySelector(`input[placeholder*="${labelTextOrType}"]`),
    
    // 5. Last resort - any input element
    () => document.querySelector('input')
  ];
  
  // Try each strategy in sequence
  for (const strategy of strategies) {
    const result = strategy();
    if (result) return result;
  }
  
  // If we still can't find anything, throw a helpful error
  throw new Error(`Could not find input element for "${labelTextOrType}"`);
};

describe('BulkEditDialog Component', () => {
  // Common props
  const props = {
    open: true,
    onClose: jest.fn()
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test cases for dialog render states
  describe('Dialog Rendering', () => {
    it('should not render when not open', () => {
      const store = mockStore({
        gridStore: {
          selectedCells: [
            { rowId: '1', field: 'name', value: 'John' },
            { rowId: '2', field: 'name', value: 'Jane' }
          ]
        }
      });
      
      // Mock BulkEditService.detectDataType to return a proper config
      require('../../../../../src/services/BulkEditService').BulkEditService.detectDataType
        .mockReturnValue({ dataType: BulkEditDataType.Text });

      render(
        <Provider store={store}>
          <BulkEditDialog open={false} onClose={props.onClose} />
        </Provider>
      );

      // Dialog should not be in the document
      expect(screen.queryByText('Bulk Edit')).not.toBeInTheDocument();
    });

    it('should render with correct title and cells count', () => {
      const selectedCells = [
        { rowId: '1', field: 'name', value: 'John' },
        { rowId: '2', field: 'name', value: 'Jane' }
      ];
      
      const store = mockStore({
        gridStore: {
          selectedCells
        }
      });

      require('../../../../../src/services/BulkEditService').BulkEditService.detectDataType
        .mockReturnValueOnce({ dataType: BulkEditDataType.Text });

      render(
        <Provider store={store}>
          <BulkEditDialog {...props} />
        </Provider>
      );

      // Dialog should be in the document with correct title
      expect(screen.getByText(/Bulk Edit 2 Cells/)).toBeInTheDocument();
      
      // Should show column name
      expect(screen.getByText(/All selected cells are from column: name/)).toBeInTheDocument();
      
      // Should show data type
      expect(screen.getByText(/Data type: text/)).toBeInTheDocument();
    });
  });

  // Test cases for different data types
  describe('Data Type Detection', () => {
    it('should render text input for text data type', () => {
      const store = mockStore({
        gridStore: {
          selectedCells: [
            { rowId: '1', field: 'name', value: 'John' },
            { rowId: '2', field: 'name', value: 'Jane' }
          ]
        }
      });

      require('../../../../../src/services/BulkEditService').BulkEditService.detectDataType
        .mockReturnValueOnce({ dataType: BulkEditDataType.Text });

      render(
        <Provider store={store}>
          <BulkEditDialog {...props} />
        </Provider>
      );

      // Should render text input field - use byLabelText or querySelector instead of role
      const input = screen.getByLabelText('Text') || document.querySelector('input[type="text"]');
      expect(input).toBeInTheDocument();
    });

    it('should render select input for select data type', () => {
      const store = mockStore({
        gridStore: {
          selectedCells: [
            { rowId: '1', field: 'Status', value: 'Open' },
            { rowId: '2', field: 'Status', value: 'In Progress' }
          ]
        }
      });

      require('../../../../../src/services/BulkEditService').BulkEditService.detectDataType
        .mockReturnValueOnce({ 
          dataType: BulkEditDataType.Select,
          options: ['Open', 'In Progress', 'Closed']
        });

      render(
        <Provider store={store}>
          <BulkEditDialog {...props} />
        </Provider>
      );

      // Should render select input - look for the label instead of button role
      expect(screen.getByText('Value')).toBeInTheDocument();
    });

    it('should render date input for date data type', () => {
      const store = mockStore({
        gridStore: {
          selectedCells: [
            { rowId: '1', field: 'BillDate', value: '2025-07-15' },
            { rowId: '2', field: 'BillDate', value: '2025-07-16' }
          ]
        }
      });

      require('../../../../../src/services/BulkEditService').BulkEditService.detectDataType
        .mockReturnValueOnce({ 
          dataType: BulkEditDataType.Date,
          dateFormat: 'YYYY-MM-DD'
        });

      render(
        <Provider store={store}>
          <BulkEditDialog {...props} />
        </Provider>
      );

      // Should render date input - check for the date input using querySelector
      const dateInput = document.querySelector('input[type="date"]');
      expect(dateInput).toBeInTheDocument();
    });

    it('should render number input for number data type', () => {
      const store = mockStore({
        gridStore: {
          selectedCells: [
            { rowId: '1', field: 'Age', value: 25 },
            { rowId: '2', field: 'Age', value: 30 }
          ]
        }
      });

      require('../../../../../src/services/BulkEditService').BulkEditService.detectDataType
        .mockReturnValueOnce({ dataType: BulkEditDataType.Number });

      render(
        <Provider store={store}>
          <BulkEditDialog {...props} />
        </Provider>
      );

      // Should render number input (actually a text input that handles number formatting)
      // Use getByLabelText instead of role
      expect(screen.getByLabelText('Number')).toBeInTheDocument();
    });

    it('should render currency input for currency data type', () => {
      const store = mockStore({
        gridStore: {
          selectedCells: [
            { rowId: '1', field: 'Amount', value: '$100.00', currency: '$' },
            { rowId: '2', field: 'Amount', value: '$200.00', currency: '$' }
          ]
        }
      });

      require('../../../../../src/services/BulkEditService').BulkEditService.detectDataType
        .mockReturnValueOnce({ 
          dataType: BulkEditDataType.Currency,
          currencyFormat: '$'
        });

      render(
        <Provider store={store}>
          <BulkEditDialog {...props} />
        </Provider>
      );

      // Should render currency input
      expect(screen.getByLabelText('Currency Value')).toBeInTheDocument();
      // There are multiple elements with text "Currency Value", so we don't need to test this separately
    });
  });

  // Test cases for interaction
  describe('User Interactions', () => {
    it('should update value when input changes', () => {
      const store = mockStore({
        gridStore: {
          selectedCells: [
            { rowId: '1', field: 'name', value: 'John' },
            { rowId: '2', field: 'name', value: 'Jane' }
          ]
        }
      });

      require('../../../../../src/services/BulkEditService').BulkEditService.detectDataType
        .mockReturnValueOnce({ dataType: BulkEditDataType.Text });

      render(
        <Provider store={store}>
          <BulkEditDialog {...props} />
        </Provider>
      );

      // Get input and change its value - use getByLabelText or querySelector
      const input = screen.getByLabelText('Text') || document.querySelector('input[type="text"]');
      fireEvent.change(input, { target: { value: 'New Name' } });

      // Check that the value has been updated
      expect(input).toHaveValue('New Name');
    });

    it('should handle cancel button click', () => {
      const store = mockStore({
        gridStore: {
          selectedCells: [
            { rowId: '1', field: 'name', value: 'John' },
            { rowId: '2', field: 'name', value: 'Jane' }
          ]
        }
      });

      require('../../../../../src/services/BulkEditService').BulkEditService.detectDataType
        .mockReturnValueOnce({ dataType: BulkEditDataType.Text });

      render(
        <Provider store={store}>
          <BulkEditDialog {...props} />
        </Provider>
      );

      // Click cancel button
      fireEvent.click(screen.getByText('Cancel'));

      // Check that cancelBulkEdit was dispatched
      expect(store.getActions()).toContainEqual({ type: 'MOCK_CANCEL_BULK_EDIT' });
      
      // Check that onClose was called
      expect(props.onClose).toHaveBeenCalledTimes(1);
    });

    it('should handle apply button click with valid input', async () => {
      const selectedCells = [
        { rowId: '1', field: 'name', value: 'John' },
        { rowId: '2', field: 'name', value: 'Jane' }
      ];
      
      const store = mockStore({
        gridStore: {
          selectedCells
        }
      });

      require('../../../../../src/services/BulkEditService').BulkEditService.detectDataType
        .mockReturnValueOnce({ dataType: BulkEditDataType.Text });
      require('../../../../../src/services/BulkEditService').BulkEditService.validateValue
        .mockReturnValueOnce({ isValid: true });

      render(
        <Provider store={store}>
          <BulkEditDialog {...props} />
        </Provider>
      );

      // Enter a new value - use our helper function
      const input = getInputElement('Text');
      fireEvent.change(input, { target: { value: 'New Name' } });

      // Click apply button
      fireEvent.click(screen.getByText(/Apply to 2 Cells/));

      // Check that applyBulkEdit was called with the right parameters
      expect(gridActions.applyBulkEdit).toHaveBeenCalledWith(
        selectedCells,
        'New Name',
        expect.objectContaining({
          dataType: BulkEditDataType.Text
        })
      );
      
      // Check that onClose was called
      expect(props.onClose).toHaveBeenCalledTimes(1);
    });

    it('should show error message for invalid input', () => {
      const store = mockStore({
        gridStore: {
          selectedCells: [
            { rowId: '1', field: 'Age', value: 25 },
            { rowId: '2', field: 'Age', value: 30 }
          ]
        }
      });

      require('../../../../../src/services/BulkEditService').BulkEditService.detectDataType
        .mockReturnValueOnce({ dataType: BulkEditDataType.Number });
      
      // First validation passes, second fails
      require('../../../../../src/services/BulkEditService').BulkEditService.validateValue
        .mockReturnValueOnce({ isValid: false, errorMessage: 'Please enter a valid number' });

      render(
        <Provider store={store}>
          <BulkEditDialog {...props} />
        </Provider>
      );

      // Enter an invalid value - use our helper function
      const input = getInputElement('Number');
      fireEvent.change(input, { target: { value: 'not-a-number' } });

      // Click apply button
      fireEvent.click(screen.getByText(/Apply to 2 Cells/));

      // Error message should be displayed
      expect(screen.getByText('Please enter a valid number')).toBeInTheDocument();
      
      // onClose should not be called
      expect(props.onClose).not.toHaveBeenCalled();
    });

    it('should handle Enter key press to apply changes', () => {
      const selectedCells = [
        { rowId: '1', field: 'name', value: 'John' },
        { rowId: '2', field: 'name', value: 'Jane' }
      ];
      
      const store = mockStore({
        gridStore: {
          selectedCells
        }
      });

      require('../../../../../src/services/BulkEditService').BulkEditService.detectDataType
        .mockReturnValueOnce({ dataType: BulkEditDataType.Text });
      require('../../../../../src/services/BulkEditService').BulkEditService.validateValue
        .mockReturnValueOnce({ isValid: true });

      render(
        <Provider store={store}>
          <BulkEditDialog {...props} />
        </Provider>
      );

      // Enter a new value - use our helper function
      const input = getInputElement('Text');
      fireEvent.change(input, { target: { value: 'New Name' } });

      // Press Enter key
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      // Check that applyBulkEdit was called
      expect(gridActions.applyBulkEdit).toHaveBeenCalledWith(
        selectedCells,
        'New Name',
        expect.objectContaining({
          dataType: BulkEditDataType.Text
        })
      );
      
      // Check that onClose was called
      expect(props.onClose).toHaveBeenCalledTimes(1);
    });
  });
});
