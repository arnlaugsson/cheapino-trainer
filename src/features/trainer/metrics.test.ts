import { describe, it, expect } from "vitest";
import { calculateWpm, calculateAccuracy } from "./metrics";

describe("calculateWpm", () => {
  it("calculates standard WPM (chars / 5 / minutes)", () => {
    expect(calculateWpm(50, 60_000)).toBe(10);
  });

  it("calculates WPM for 30 seconds", () => {
    expect(calculateWpm(25, 30_000)).toBe(10);
  });

  it("returns 0 for 0 elapsed time", () => {
    expect(calculateWpm(50, 0)).toBe(0);
  });
});

describe("calculateAccuracy", () => {
  it("returns 1.0 for perfect accuracy", () => {
    expect(calculateAccuracy(50, 50)).toBe(1.0);
  });

  it("returns correct ratio for mistakes", () => {
    expect(calculateAccuracy(45, 50)).toBeCloseTo(0.9);
  });

  it("returns 0 for 0 total keystrokes", () => {
    expect(calculateAccuracy(0, 0)).toBe(0);
  });
});
