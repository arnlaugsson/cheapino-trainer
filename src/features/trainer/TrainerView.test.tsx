import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TrainerView } from "./TrainerView";

describe("TrainerView", () => {
  it("renders the exercise prompt", () => {
    render(<TrainerView prompt="hello" onComplete={vi.fn()} />);
    expect(screen.getByText(/h/)).toBeDefined();
  });

  it("highlights the current character", () => {
    const { container } = render(<TrainerView prompt="ab" onComplete={vi.fn()} />);
    const cursor = container.querySelector("[data-cursor='true']");
    expect(cursor?.textContent).toBe("a");
  });

  it("advances on correct keypress", () => {
    const { container } = render(<TrainerView prompt="ab" onComplete={vi.fn()} />);
    fireEvent.keyDown(window, { key: "a" });
    const cursor = container.querySelector("[data-cursor='true']");
    expect(cursor?.textContent).toBe("b");
  });

  it("calls onComplete when exercise is finished", () => {
    const onComplete = vi.fn();
    render(<TrainerView prompt="a" onComplete={onComplete} />);
    fireEvent.keyDown(window, { key: "a" });
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        wpm: expect.any(Number),
        accuracy: expect.any(Number),
      }),
    );
  });
});
