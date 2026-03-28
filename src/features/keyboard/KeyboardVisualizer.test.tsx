import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KeyboardVisualizer } from "./KeyboardVisualizer";
import { defaultLayout } from "../../data/layout";

describe("KeyboardVisualizer", () => {
  it("renders all non-blank keys for the base layer", () => {
    const { container } = render(
      <KeyboardVisualizer
        layout={defaultLayout}
        activeLayer="Base"
        activeKeys={new Set()}
      />,
    );
    const texts = container.querySelectorAll("text");
    expect(texts.length).toBe(36);
  });

  it("renders an SVG element", () => {
    const { container } = render(
      <KeyboardVisualizer
        layout={defaultLayout}
        activeLayer="Base"
        activeKeys={new Set()}
      />,
    );
    expect(container.querySelector("svg")).toBeDefined();
  });

  it("highlights active keys", () => {
    const { container } = render(
      <KeyboardVisualizer
        layout={defaultLayout}
        activeLayer="Base"
        activeKeys={new Set(["KeyA"])}
      />,
    );
    const activeRects = container.querySelectorAll("rect.active");
    expect(activeRects.length).toBe(1);
  });

  it("renders layer tabs", () => {
    render(
      <KeyboardVisualizer
        layout={defaultLayout}
        activeLayer="Base"
        activeKeys={new Set()}
      />,
    );
    expect(screen.getByText("Base")).toBeDefined();
    expect(screen.getByText("Numbers")).toBeDefined();
    expect(screen.getByText("Symbols")).toBeDefined();
    expect(screen.getByText("Navigation")).toBeDefined();
  });
});
