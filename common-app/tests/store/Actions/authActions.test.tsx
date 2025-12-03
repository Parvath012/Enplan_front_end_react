import configureStore from 'redux-mock-store';
import * as actions from '../../../src/store/Actions/authActions';
import * as authService from '../../../src/api/auth/authService';
import thunk from 'redux-thunk';

// Mock the dependencies
jest.mock('../../../src/api/auth/authService');
jest.mock('../../../src/store/configureStore', () => ({
  getState: jest.fn().mockReturnValue({
    authStore: {
      token: 'mocked-token'
    }
  })
}));

describe('Auth Actions', () => {
  // Action Creators Tests
  describe('Action Creators', () => {
    it('should create a SET_TOKEN action', () => {
      const token = 'test-token';
      const expectedAction = {
        type: actions.SET_TOKEN,
        payload: token,
      };
      expect(actions.setToken(token)).toEqual(expectedAction);
    });

    it('should create a GET_TOKEN action', () => {
      const expectedAction = {
        type: actions.GET_TOKEN,
      };
      expect(actions.getToken()).toEqual(expectedAction);
    });
  });

  // Helper Function Tests
  describe('buildColumn', () => {
    it('should create a column with default values', () => {
      const column = actions.buildColumn(
        'Date_Mapping20', 
        '_id', 
        'Select'
      );
      
      expect(column).toEqual({
        aggregateFunction: '',
        sortType: '',
        groupBy: false,
        index: 0,
        isEditable: false,
        dboName: 'Date_Mapping20',
        columnName: '_id',
        aliasName: 'Select',
        dataType: 'string',
        output: true,
      });
    });

    it('should create a column with custom values', () => {
      const column = actions.buildColumn(
        'Date_Mapping20', 
        'BillDate', 
        'Bill Date', 
        'Date', 
        false
      );
      
      expect(column).toEqual({
        aggregateFunction: '',
        sortType: '',
        groupBy: false,
        index: 0,
        isEditable: false,
        dboName: 'Date_Mapping20',
        columnName: 'BillDate',
        aliasName: 'Bill Date',
        dataType: 'Date',
        output: false,
      });
    });
  });

  // Async Action Tests
  describe('Async Actions', () => {
    const middlewares = [thunk];
    const mockStore = configureStore(middlewares);

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should call authenticate service', async () => {
      // Mock the authenticate method
      (authService.authenticate as jest.Mock).mockResolvedValue({
        success: true,
        token: 'test-token'
      });

      const result = await actions.getAuthenticate();

      expect(authService.authenticate).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });

    it('should get table data with correct payload', async () => {
      // Mock the getData method
      (authService.getData as jest.Mock).mockResolvedValue({
        success: true,
        
      });

      const result = await actions.getTableData();

      expect(authService.getData).toHaveBeenCalledWith(
        expect.objectContaining({
          executeInParallel: true,
          sqlQueries: expect.any(Array)
        }),
        'mocked-token'
      );
      expect(result).toBeTruthy();
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    it('should handle authentication errors', async () => {
      // Mock the authenticate method to throw an error
      (authService.authenticate as jest.Mock).mockRejectedValue(
        new Error('Authentication failed')
      );

      await expect(actions.getAuthenticate()).rejects.toThrow('Authentication failed');
    });

    it('should handle data fetching errors', async () => {
      // Mock the getData method to throw an error
      (authService.getData as jest.Mock).mockRejectedValue(
        new Error('Data fetch failed')
      );

      await expect(actions.getTableData()).rejects.toThrow('Data fetch failed');
    });
  });

  // Additional Edge Case Tests
  describe('Edge Cases', () => {
    it('should handle empty token in authentication', async () => {
      (authService.authenticate as jest.Mock).mockResolvedValue({
        success: true,
        token: ''
      });

      const result = await actions.getAuthenticate();
      expect(result).toBeTruthy();
    });

    it('should handle null or undefined token', async () => {
      (authService.authenticate as jest.Mock).mockResolvedValue({
        success: true,
        token: null
      });

      const result = await actions.getAuthenticate();
      expect(result).toBeTruthy();
    });
  });
});