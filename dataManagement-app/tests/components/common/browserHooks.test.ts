import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useDrawerState,
  useBrowserData,
  useSearchState
} from '../../../src/components/common/browserHooks';

describe('browserHooks', () => {
  describe('useDrawerState', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should return false initially when open is false', () => {
      const { result } = renderHook(() => useDrawerState(false));
      expect(result.current).toBe(false);
    });

    it('should set isDrawerReady to true after 300ms when open becomes true', async () => {
      const { result, rerender } = renderHook(({ open }) => useDrawerState(open), {
        initialProps: { open: false }
      });

      expect(result.current).toBe(false);

      rerender({ open: true });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should set isDrawerReady to false immediately when open becomes false', () => {
      const { result, rerender } = renderHook(({ open }) => useDrawerState(open), {
        initialProps: { open: true }
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe(true);

      rerender({ open: false });

      expect(result.current).toBe(false);
    });

    it('should handle rapid open/close transitions', () => {
      const { result, rerender } = renderHook(({ open }) => useDrawerState(open), {
        initialProps: { open: false }
      });

      rerender({ open: true });
      act(() => {
        jest.advanceTimersByTime(150);
      });
      rerender({ open: false });
      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(result.current).toBe(false);
    });
  });

  describe('useBrowserData', () => {
    const mockFetchFunction = jest.fn();
    const mockTransformFunction = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
      mockTransformFunction.mockReturnValue([]);
    });

    it('should return empty data when open is false', () => {
      const { result } = renderHook(() =>
        useBrowserData(false, mockFetchFunction, mockTransformFunction, 'test data')
      );

      expect(result.current.data).toEqual([]);
      expect(result.current.loadingError).toBeNull();
      expect(result.current.selectedItem).toBeNull();
      expect(mockFetchFunction).not.toHaveBeenCalled();
    });

    it('should fetch data when open becomes true', async () => {
      const mockResponse = { data: 'test' };
      const mockTransformedData = [{ id: '1', type: 'test' }];
      mockFetchFunction.mockResolvedValue(mockResponse);
      mockTransformFunction.mockReturnValue(mockTransformedData);

      const { result, rerender } = renderHook(
        ({ open }) => useBrowserData(open, mockFetchFunction, mockTransformFunction, 'test data'),
        { initialProps: { open: false } }
      );

      rerender({ open: true });

      await waitFor(() => {
        expect(mockFetchFunction).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockTransformedData);
      });
    });

    it('should handle fetch errors', async () => {
      const errorMessage = 'Failed to fetch';
      mockFetchFunction.mockRejectedValue(new Error(errorMessage));

      const { result, rerender } = renderHook(
        ({ open }) => useBrowserData(open, mockFetchFunction, mockTransformFunction, 'test data'),
        { initialProps: { open: false } }
      );

      rerender({ open: true });

      await waitFor(() => {
        expect(result.current.loadingError).toBe(errorMessage);
      });

      expect(result.current.data).toEqual([]);
    });

    it('should reset state when open becomes false', async () => {
      const mockResponse = { data: 'test' };
      const mockTransformedData = [{ id: '1', type: 'test' }];
      mockFetchFunction.mockResolvedValue(mockResponse);
      mockTransformFunction.mockReturnValue(mockTransformedData);

      const { result, rerender } = renderHook(
        ({ open }) => useBrowserData(open, mockFetchFunction, mockTransformFunction, 'test data'),
        { initialProps: { open: true } }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(mockTransformedData);
      });

      rerender({ open: false });

      await waitFor(() => {
        expect(result.current.data).toEqual([]);
        expect(result.current.loadingError).toBeNull();
        expect(result.current.selectedItem).toBeNull();
      });
    });

    it('should update selectedItem when setSelectedItem is called', () => {
      const { result } = renderHook(() =>
        useBrowserData(false, mockFetchFunction, mockTransformFunction, 'test data')
      );

      const testItem = { id: '1', type: 'test' };
      act(() => {
        result.current.setSelectedItem(testItem);
      });

      expect(result.current.selectedItem).toEqual(testItem);
    });

    it('should handle error message prefix in error', async () => {
      const errorMessage = 'Network error';
      mockFetchFunction.mockRejectedValue(new Error(errorMessage));

      const { result, rerender } = renderHook(
        ({ open }) => useBrowserData(open, mockFetchFunction, mockTransformFunction, 'test data'),
        { initialProps: { open: false } }
      );

      rerender({ open: true });

      await waitFor(() => {
        expect(result.current.loadingError).toBe(errorMessage);
      });
    });

    it('should handle error without message', async () => {
      mockFetchFunction.mockRejectedValue(new Error());

      const { result, rerender } = renderHook(
        ({ open }) =>
          useBrowserData(open, mockFetchFunction, mockTransformFunction, 'test data'),
        { initialProps: { open: false } }
      );

      rerender({ open: true });

      await waitFor(() => {
        expect(result.current.loadingError).toBe('Failed to load test data');
      });
    });

    it('should update fetch and transform functions when they change', async () => {
      const mockResponse1 = { data: 'test1' };
      const mockResponse2 = { data: 'test2' };
      const mockTransformedData1 = [{ id: '1', type: 'test1' }];
      const mockTransformedData2 = [{ id: '2', type: 'test2' }];

      const fetchFn1 = jest.fn().mockResolvedValue(mockResponse1);
      const fetchFn2 = jest.fn().mockResolvedValue(mockResponse2);
      const transformFn1 = jest.fn().mockReturnValue(mockTransformedData1);
      const transformFn2 = jest.fn().mockReturnValue(mockTransformedData2);

      const { result, rerender } = renderHook(
        ({ open, fetchFn, transformFn }) =>
          useBrowserData(open, fetchFn, transformFn, 'test data'),
        {
          initialProps: { open: true, fetchFn: fetchFn1, transformFn: transformFn1 }
        }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(mockTransformedData1);
      });

      rerender({ open: true, fetchFn: fetchFn2, transformFn: transformFn2 });

      await waitFor(() => {
        expect(fetchFn2).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockTransformedData2);
      });
    });
  });

  describe('useSearchState', () => {
    it('should initialize with empty search term and inactive state', () => {
      const { result } = renderHook(() => useSearchState());

      expect(result.current.searchTerm).toBe('');
      expect(result.current.isSearchActive).toBe(false);
    });

    it('should activate search when handleSearchClick is called', () => {
      const { result } = renderHook(() => useSearchState());

      act(() => {
        result.current.handleSearchClick();
      });

      expect(result.current.isSearchActive).toBe(true);
      expect(result.current.searchTerm).toBe('');
    });

    it('should update search term when handleSearchChange is called', () => {
      const { result } = renderHook(() => useSearchState());

      act(() => {
        result.current.handleSearchChange('test search');
      });

      expect(result.current.searchTerm).toBe('test search');
      expect(result.current.isSearchActive).toBe(false);
    });

    it('should deactivate search and clear term when handleSearchClose is called', () => {
      const { result } = renderHook(() => useSearchState());

      act(() => {
        result.current.handleSearchClick();
        result.current.handleSearchChange('test search');
      });

      expect(result.current.isSearchActive).toBe(true);
      expect(result.current.searchTerm).toBe('test search');

      act(() => {
        result.current.handleSearchClose();
      });

      expect(result.current.isSearchActive).toBe(false);
      expect(result.current.searchTerm).toBe('');
    });

    it('should handle multiple search term changes', () => {
      const { result } = renderHook(() => useSearchState());

      act(() => {
        result.current.handleSearchChange('first');
      });
      expect(result.current.searchTerm).toBe('first');

      act(() => {
        result.current.handleSearchChange('second');
      });
      expect(result.current.searchTerm).toBe('second');

      act(() => {
        result.current.handleSearchChange('third');
      });
      expect(result.current.searchTerm).toBe('third');
    });

    it('should handle empty search term', () => {
      const { result } = renderHook(() => useSearchState());

      act(() => {
        result.current.handleSearchChange('');
      });

      expect(result.current.searchTerm).toBe('');
    });

    it('should handle special characters in search term', () => {
      const { result } = renderHook(() => useSearchState());

      act(() => {
        result.current.handleSearchChange('test & search <>"\'');
      });

      expect(result.current.searchTerm).toBe('test & search <>"\'');
    });
  });
});

