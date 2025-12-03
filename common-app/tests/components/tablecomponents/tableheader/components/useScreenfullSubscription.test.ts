const mockOn = jest.fn();
const mockOff = jest.fn();
let isEnabled = true;
let isFullscreen = false;

jest.mock("screenfull", () => ({
  __esModule: true,
  default: {
    get isEnabled() { return isEnabled; },
    set isEnabled(val) { isEnabled = val; },
    get isFullscreen() { return isFullscreen; },
    set isFullscreen(val) { isFullscreen = val; },
    on: (...args) => mockOn(...args),
    off: (...args) => mockOff(...args),
  },
}));

import { renderHook, act } from "@testing-library/react";
import { useScreenfullSubscription } from "../../../../../src/components/tablecomponents/tableheader/components/useScreenfullSubscription";

describe("useScreenfullSubscription", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isEnabled = true;
    isFullscreen = false;
  });

  it("subscribes and unsubscribes when enabled", () => {
    const setIsFullscreen = jest.fn();
    const { unmount } = renderHook(() => useScreenfullSubscription(setIsFullscreen));
    expect(mockOn).toHaveBeenCalledWith("change", expect.any(Function));
    unmount();
    expect(mockOff).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("does not subscribe when not enabled", () => {
    isEnabled = false;
    const setIsFullscreen = jest.fn();
    const { unmount } = renderHook(() => useScreenfullSubscription(setIsFullscreen));
    expect(mockOn).not.toHaveBeenCalled();
    unmount();
    expect(mockOff).not.toHaveBeenCalled();
  });

  it("calls setIsFullscreen on change event", () => {
    const setIsFullscreen = jest.fn();
    renderHook(() => useScreenfullSubscription(setIsFullscreen));
    // Find the handler passed to on
    const handler = mockOn.mock.calls[0][1];
    isFullscreen = true;
    act(() => {
      handler();
    });
    expect(setIsFullscreen).toHaveBeenCalledWith(true);
  });
});
