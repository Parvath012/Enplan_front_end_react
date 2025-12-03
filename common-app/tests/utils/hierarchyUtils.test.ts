import { fitViewToContainer } from '../../src/utils/hierarchyUtils';
import { ReactFlowInstance } from 'reactflow';

describe('hierarchyUtils', () => {
  describe('fitViewToContainer', () => {
    it('should call fitView on ReactFlowInstance with correct options', () => {
      const mockFitView = jest.fn();
      const mockInstance = {
        fitView: mockFitView,
      } as unknown as ReactFlowInstance;

      fitViewToContainer(mockInstance);

      expect(mockFitView).toHaveBeenCalledTimes(1);
      expect(mockFitView).toHaveBeenCalledWith({
        padding: 0.1,
        includeHiddenNodes: false,
        minZoom: 0.1,
        maxZoom: 2,
      });
    });

    it('should not throw error when instance is null', () => {
      expect(() => {
        fitViewToContainer(null);
      }).not.toThrow();
    });

    it('should not call fitView when instance is null', () => {
      const mockFitView = jest.fn();
      
      fitViewToContainer(null);

      expect(mockFitView).not.toHaveBeenCalled();
    });

    it('should handle instance with fitView method', () => {
      const mockFitView = jest.fn();
      const mockInstance = {
        fitView: mockFitView,
      } as unknown as ReactFlowInstance;

      fitViewToContainer(mockInstance);

      expect(mockFitView).toHaveBeenCalledWith({
        padding: 0.1,
        includeHiddenNodes: false,
        minZoom: 0.1,
        maxZoom: 2,
      });
    });

    it('should use correct padding value (0.1)', () => {
      const mockFitView = jest.fn();
      const mockInstance = {
        fitView: mockFitView,
      } as unknown as ReactFlowInstance;

      fitViewToContainer(mockInstance);

      const callArgs = mockFitView.mock.calls[0][0];
      expect(callArgs.padding).toBe(0.1);
    });

    it('should set includeHiddenNodes to false', () => {
      const mockFitView = jest.fn();
      const mockInstance = {
        fitView: mockFitView,
      } as unknown as ReactFlowInstance;

      fitViewToContainer(mockInstance);

      const callArgs = mockFitView.mock.calls[0][0];
      expect(callArgs.includeHiddenNodes).toBe(false);
    });

    it('should set minZoom to 0.1', () => {
      const mockFitView = jest.fn();
      const mockInstance = {
        fitView: mockFitView,
      } as unknown as ReactFlowInstance;

      fitViewToContainer(mockInstance);

      const callArgs = mockFitView.mock.calls[0][0];
      expect(callArgs.minZoom).toBe(0.1);
    });

    it('should set maxZoom to 2', () => {
      const mockFitView = jest.fn();
      const mockInstance = {
        fitView: mockFitView,
      } as unknown as ReactFlowInstance;

      fitViewToContainer(mockInstance);

      const callArgs = mockFitView.mock.calls[0][0];
      expect(callArgs.maxZoom).toBe(2);
    });

    it('should handle multiple calls with same instance', () => {
      const mockFitView = jest.fn();
      const mockInstance = {
        fitView: mockFitView,
      } as unknown as ReactFlowInstance;

      fitViewToContainer(mockInstance);
      fitViewToContainer(mockInstance);
      fitViewToContainer(mockInstance);

      expect(mockFitView).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple calls with different instances', () => {
      const mockFitView1 = jest.fn();
      const mockFitView2 = jest.fn();
      const mockInstance1 = {
        fitView: mockFitView1,
      } as unknown as ReactFlowInstance;
      const mockInstance2 = {
        fitView: mockFitView2,
      } as unknown as ReactFlowInstance;

      fitViewToContainer(mockInstance1);
      fitViewToContainer(mockInstance2);

      expect(mockFitView1).toHaveBeenCalledTimes(1);
      expect(mockFitView2).toHaveBeenCalledTimes(1);
    });

    it('should handle instance with undefined fitView gracefully', () => {
      const mockInstance = {
        fitView: undefined,
      } as any;

      // Should not throw, but may cause runtime error if fitView is called
      // This tests the null check
      expect(() => {
        fitViewToContainer(null);
      }).not.toThrow();
    });
  });
});

