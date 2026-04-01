import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { FallingWordsGame } from "./FallingWordsGame";

// Mock requestAnimationFrame for deterministic tests
let rafCallbacks: Array<(time: number) => void> = [];
let rafId = 0;

beforeEach(() => {
  rafCallbacks = [];
  rafId = 0;
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
    rafCallbacks.push(cb);
    return ++rafId;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  vi.spyOn(performance, "now").mockReturnValue(0);
});

function flushFrame(time: number) {
  vi.spyOn(performance, "now").mockReturnValue(time);
  const cbs = [...rafCallbacks];
  rafCallbacks = [];
  cbs.forEach((cb) => cb(time));
}

describe("FallingWordsGame", () => {
  it("renders ready state with start instruction", () => {
    render(<FallingWordsGame stageId={0} onExit={vi.fn()} />);
    expect(screen.getByText("Falling Words")).toBeDefined();
    expect(screen.getByText("Press Space to start")).toBeDefined();
  });

  it("starts the game on Space press", () => {
    render(<FallingWordsGame stageId={0} onExit={vi.fn()} />);
    fireEvent.keyDown(window, { key: " " });
    // Ready screen should be gone — game field should not show "Falling Words" heading
    expect(screen.queryByText("Press Space to start")).toBeNull();
  });

  it("spawns words after spawn interval", () => {
    render(<FallingWordsGame stageId={0} onExit={vi.fn()} />);
    fireEvent.keyDown(window, { key: " " });

    // Advance past spawn interval (2000ms)
    act(() => flushFrame(2100));

    const fallingWords = screen.getAllByTestId("falling-word");
    expect(fallingWords.length).toBeGreaterThanOrEqual(1);
  });

  it("completes a word and increments score", () => {
    render(<FallingWordsGame stageId={0} onExit={vi.fn()} />);
    fireEvent.keyDown(window, { key: " " });

    // Spawn a word
    act(() => flushFrame(2100));

    const wordEl = screen.getByTestId("falling-word");
    const word = wordEl.textContent ?? "";

    // Type each character
    for (const char of word) {
      fireEvent.keyDown(window, { key: char });
    }

    // Both score and streak should show 1
    const values = screen.getAllByText("1");
    expect(values.length).toBe(2); // score=1, streak=1
  });

  it("shows game over when all lives lost", () => {
    render(<FallingWordsGame stageId={0} onExit={vi.fn()} />);
    fireEvent.keyDown(window, { key: " " });

    // Spawn 3 words and let them fall past the bottom
    for (let i = 0; i < 3; i++) {
      act(() => flushFrame(2100 + i * 2100));
    }

    // Advance enough for words to fall past container (400px at 40px/s = 10s)
    act(() => flushFrame(15000));

    expect(screen.getByText("Game Over")).toBeDefined();
  });

  it("calls onExit when exit button clicked", () => {
    const onExit = vi.fn();
    render(<FallingWordsGame stageId={0} onExit={onExit} />);
    fireEvent.click(screen.getByText("Exit"));
    expect(onExit).toHaveBeenCalled();
  });
});
