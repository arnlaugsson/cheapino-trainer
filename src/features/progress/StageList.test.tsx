import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StageList } from "./StageList";
import { stages } from "../../data/stages";

beforeEach(() => {
  localStorage.clear();
});

describe("StageList", () => {
  it("renders all stage names", () => {
    render(<StageList stages={stages} activeStageId={0} onSelectStage={vi.fn()} />);
    expect(screen.getByText("HOME_POSITION")).toBeDefined();
    expect(screen.getByText("ALL_LETTERS")).toBeDefined();
    expect(screen.getByText("FULL_INTEGRATION")).toBeDefined();
  });

  it("marks stage 0 as unlocked", () => {
    const { container } = render(
      <StageList stages={stages} activeStageId={0} onSelectStage={vi.fn()} />,
    );
    const firstStage = container.querySelector("[data-stage-id='0']");
    expect(firstStage?.getAttribute("data-locked")).not.toBe("true");
  });

  it("marks stage 1 as locked initially", () => {
    const { container } = render(
      <StageList stages={stages} activeStageId={0} onSelectStage={vi.fn()} />,
    );
    const secondStage = container.querySelector("[data-stage-id='1']");
    expect(secondStage?.getAttribute("data-locked")).toBe("true");
  });

  it("calls onSelectStage when an unlocked stage is clicked", () => {
    const onSelect = vi.fn();
    render(<StageList stages={stages} activeStageId={0} onSelectStage={onSelect} />);
    fireEvent.click(screen.getByText("HOME_POSITION"));
    expect(onSelect).toHaveBeenCalledWith(0);
  });

  it("does not call onSelectStage when a locked stage is clicked", () => {
    const onSelect = vi.fn();
    render(<StageList stages={stages} activeStageId={0} onSelectStage={onSelect} />);
    fireEvent.click(screen.getByText("ALL_LETTERS"));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
