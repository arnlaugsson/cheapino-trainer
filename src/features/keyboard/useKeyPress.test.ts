import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useKeyPress } from "./useKeyPress";

describe("useKeyPress", () => {
  it("starts with no active keys", () => {
    const { result } = renderHook(() => useKeyPress());
    expect(result.current.activeKeys).toEqual(new Set());
    expect(result.current.lastKey).toBeNull();
  });

  it("tracks keydown events", () => {
    const { result } = renderHook(() => useKeyPress());
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { code: "KeyA", key: "a" }),
      );
    });
    expect(result.current.activeKeys.has("KeyA")).toBe(true);
    expect(result.current.lastKey).toEqual({ code: "KeyA", key: "a" });
  });

  it("removes keys on keyup", () => {
    const { result } = renderHook(() => useKeyPress());
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { code: "KeyA", key: "a" }),
      );
    });
    expect(result.current.activeKeys.has("KeyA")).toBe(true);
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keyup", { code: "KeyA", key: "a" }),
      );
    });
    expect(result.current.activeKeys.has("KeyA")).toBe(false);
  });

  it("calls onKeyDown callback when provided", () => {
    const onKeyDown = vi.fn();
    renderHook(() => useKeyPress({ onKeyDown }));
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { code: "KeyA", key: "a" }),
      );
    });
    expect(onKeyDown).toHaveBeenCalledWith(
      expect.objectContaining({ code: "KeyA", key: "a" }),
    );
  });
});
