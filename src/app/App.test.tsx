import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  localStorage.clear();
});

describe("App", () => {
  it("renders the app header", () => {
    render(<App />);
    expect(screen.getByText("Cheapino Trainer")).toBeDefined();
  });

  it("shows the stage list", () => {
    render(<App />);
    expect(screen.getByText("Home Position")).toBeDefined();
  });

  it("shows the keyboard visualizer", () => {
    const { container } = render(<App />);
    expect(container.querySelector("svg")).toBeDefined();
  });

  it("shows the stage description", () => {
    render(<App />);
    expect(screen.getByText(/Home row keys only/)).toBeDefined();
  });

  it("shows the trainer with an exercise", () => {
    const { container } = render(<App />);
    const chars = container.querySelectorAll("[data-cursor]");
    expect(chars.length).toBeGreaterThan(0);
  });
});
