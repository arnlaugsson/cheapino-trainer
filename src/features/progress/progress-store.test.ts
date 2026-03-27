import { describe, it, expect, beforeEach } from "vitest";
import {
  getProgress,
  saveResult,
  isStageUnlocked,
  isStageComplete,
  type StageProgress,
} from "./progress-store";

beforeEach(() => {
  localStorage.clear();
});

describe("progress-store", () => {
  it("returns empty progress for a new stage", () => {
    const progress = getProgress(0);
    expect(progress).toEqual({ bestWpm: 0, bestAccuracy: 0, attempts: 0 });
  });

  it("saves and retrieves a result", () => {
    saveResult(0, { wpm: 25, accuracy: 0.95 });
    const progress = getProgress(0);
    expect(progress.bestWpm).toBe(25);
    expect(progress.bestAccuracy).toBe(0.95);
    expect(progress.attempts).toBe(1);
  });

  it("keeps the best scores across multiple attempts", () => {
    saveResult(0, { wpm: 15, accuracy: 0.85 });
    saveResult(0, { wpm: 25, accuracy: 0.80 });
    saveResult(0, { wpm: 20, accuracy: 0.95 });
    const progress = getProgress(0);
    expect(progress.bestWpm).toBe(25);
    expect(progress.bestAccuracy).toBe(0.95);
    expect(progress.attempts).toBe(3);
  });

  it("stage 0 is always unlocked", () => {
    expect(isStageUnlocked(0)).toBe(true);
  });

  it("stage 1 is locked until stage 0 is complete", () => {
    expect(isStageUnlocked(1)).toBe(false);
    saveResult(0, { wpm: 20, accuracy: 0.95 });
    expect(isStageUnlocked(1)).toBe(true);
  });

  it("isStageComplete returns true when threshold is met", () => {
    expect(isStageComplete(0)).toBe(false);
    saveResult(0, { wpm: 20, accuracy: 0.95 });
    expect(isStageComplete(0)).toBe(true);
  });

  it("isStageComplete checks accuracy-only for stage 5 (wpm threshold 0)", () => {
    saveResult(5, { wpm: 0, accuracy: 0.95 });
    expect(isStageComplete(5)).toBe(true);
  });
});
