import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useExercise } from "./useExercise";

describe("useExercise", () => {
  it("initializes with prompt and cursor at 0", () => {
    const { result } = renderHook(() => useExercise("hello"));
    expect(result.current.prompt).toBe("hello");
    expect(result.current.cursor).toBe(0);
    expect(result.current.isComplete).toBe(false);
    expect(result.current.chars).toHaveLength(5);
  });

  it("advances cursor on correct character", () => {
    const { result } = renderHook(() => useExercise("ab"));
    act(() => {
      result.current.handleKey("a");
    });
    expect(result.current.cursor).toBe(1);
    expect(result.current.chars[0].status).toBe("correct");
  });

  it("marks character as wrong on incorrect input", () => {
    const { result } = renderHook(() => useExercise("ab"));
    act(() => {
      result.current.handleKey("x");
    });
    expect(result.current.cursor).toBe(0);
    expect(result.current.chars[0].status).toBe("wrong");
  });

  it("handles backspace to clear wrong status", () => {
    const { result } = renderHook(() => useExercise("ab"));
    act(() => {
      result.current.handleKey("x");
    });
    expect(result.current.chars[0].status).toBe("wrong");
    act(() => {
      result.current.handleBackspace();
    });
    expect(result.current.chars[0].status).toBe("pending");
  });

  it("marks exercise complete when all chars typed correctly", () => {
    const { result } = renderHook(() => useExercise("ab"));
    act(() => {
      result.current.handleKey("a");
    });
    act(() => {
      result.current.handleKey("b");
    });
    expect(result.current.isComplete).toBe(true);
  });

  it("tracks total keystrokes including mistakes", () => {
    const { result } = renderHook(() => useExercise("a"));
    act(() => {
      result.current.handleKey("x"); // wrong
    });
    act(() => {
      result.current.handleBackspace(); // correction
    });
    act(() => {
      result.current.handleKey("a"); // correct
    });
    expect(result.current.totalKeystrokes).toBe(3);
    expect(result.current.correctKeystrokes).toBe(1);
  });
});
