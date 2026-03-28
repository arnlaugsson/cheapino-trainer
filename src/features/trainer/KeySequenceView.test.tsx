import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { KeySequenceView } from "./KeySequenceView";

describe("KeySequenceView", () => {
  it("renders the sequence prompt", () => {
    render(<KeySequenceView prompt="Left Left Right" onComplete={vi.fn()} />);
    expect(screen.getAllByText("Left").length).toBe(2);
    expect(screen.getByText("Right")).toBeDefined();
  });

  it("highlights the current key in the sequence", () => {
    const { container } = render(
      <KeySequenceView prompt="Left Right" onComplete={vi.fn()} />,
    );
    const current = container.querySelector("[data-current='true']");
    expect(current?.textContent).toBe("Left");
  });

  it("advances on correct navigation keypress", () => {
    const { container } = render(
      <KeySequenceView prompt="Left Right" onComplete={vi.fn()} />,
    );
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    const current = container.querySelector("[data-current='true']");
    expect(current?.textContent).toBe("Right");
  });

  it("marks incorrect keypress", () => {
    const { container } = render(
      <KeySequenceView prompt="Left Right" onComplete={vi.fn()} />,
    );
    fireEvent.keyDown(window, { key: "ArrowRight" });
    const wrong = container.querySelector("[data-wrong='true']");
    expect(wrong).toBeDefined();
  });

  it("calls onComplete when sequence is finished", () => {
    const onComplete = vi.fn();
    render(<KeySequenceView prompt="Left" onComplete={onComplete} />);
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ accuracy: 1.0 }),
    );
  });

  it("maps prompt labels to KeyboardEvent.key values", () => {
    const onComplete = vi.fn();
    render(
      <KeySequenceView
        prompt="Home End PageUp PageDown Up Down"
        onComplete={onComplete}
      />,
    );
    fireEvent.keyDown(window, { key: "Home" });
    fireEvent.keyDown(window, { key: "End" });
    fireEvent.keyDown(window, { key: "PageUp" });
    fireEvent.keyDown(window, { key: "PageDown" });
    fireEvent.keyDown(window, { key: "ArrowUp" });
    fireEvent.keyDown(window, { key: "ArrowDown" });
    expect(onComplete).toHaveBeenCalled();
  });
});
