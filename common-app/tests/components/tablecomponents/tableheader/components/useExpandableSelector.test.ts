import { renderHook, act } from "@testing-library/react";
import { useExpandableSelector } from "../../../../../src/components/tablecomponents/tableheader/components/useExpandableSelector";

describe("useExpandableSelector", () => {
  it("calls onExpand when handleExpand is invoked", () => {
    const onExpand = jest.fn();
    const { result } = renderHook(() => useExpandableSelector(onExpand));
    act(() => {
      result.current.handleExpand();
    });
    expect(onExpand).toHaveBeenCalled();
  });

  it("calls onExpand and stops propagation when handleExpand is invoked with event", () => {
    const onExpand = jest.fn();
    const stopPropagation = jest.fn();
    const event = { stopPropagation } as any;
    const { result } = renderHook(() => useExpandableSelector(onExpand));
    act(() => {
      result.current.handleExpand(event);
    });
    expect(onExpand).toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();
  });

  it("calls onRequestExpand and stops propagation when handleRequestExpand is invoked with event", () => {
    const onExpand = jest.fn();
    const onRequestExpand = jest.fn();
    const stopPropagation = jest.fn();
    const event = { stopPropagation } as any;
    const { result } = renderHook(() =>
      useExpandableSelector(onExpand, onRequestExpand)
    );
    act(() => {
      result.current.handleRequestExpand(event);
    });
    expect(onRequestExpand).toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();
  });

  it("does not throw if handleRequestExpand is called without onRequestExpand", () => {
    const onExpand = jest.fn();
    const stopPropagation = jest.fn();
    const event = { stopPropagation } as any;
    const { result } = renderHook(() => useExpandableSelector(onExpand));
    expect(() =>
      act(() => {
        result.current.handleRequestExpand(event);
      })
    ).not.toThrow();
    expect(stopPropagation).toHaveBeenCalled();
  });

  it("handleKeyDown calls handler on Enter key", () => {
    const onExpand = jest.fn();
    const handler = jest.fn();
    const { result } = renderHook(() => useExpandableSelector(onExpand));
    const event = { key: "Enter", stopPropagation: jest.fn() } as any;
    act(() => {
      result.current.handleKeyDown(handler)(event);
    });
    expect(handler).toHaveBeenCalledWith(event);
  });

  it("handleKeyDown calls handler on Space key", () => {
    const onExpand = jest.fn();
    const handler = jest.fn();
    const { result } = renderHook(() => useExpandableSelector(onExpand));
    const event = { key: " ", stopPropagation: jest.fn() } as any;
    act(() => {
      result.current.handleKeyDown(handler)(event);
    });
    expect(handler).toHaveBeenCalledWith(event);
  });

  it("handleKeyDown does not call handler on other keys", () => {
    const onExpand = jest.fn();
    const handler = jest.fn();
    const { result } = renderHook(() => useExpandableSelector(onExpand));
    const event = { key: "Tab", stopPropagation: jest.fn() } as any;
    act(() => {
      result.current.handleKeyDown(handler)(event);
    });
    expect(handler).not.toHaveBeenCalled();
  });
});