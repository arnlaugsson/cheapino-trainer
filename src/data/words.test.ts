import { describe, it, expect } from "vitest";
import { getWordsForStage } from "./words";

describe("getWordsForStage", () => {
  it("stage 0 returns only home-row words (a s d f g h j k l)", () => {
    const words = getWordsForStage(0);
    const homeRowChars = new Set("asdfghjkl;");
    for (const word of words) {
      for (const char of word) {
        expect(homeRowChars.has(char)).toBe(true);
      }
    }
    expect(words.length).toBeGreaterThan(10);
  });

  it("stage 1 returns common English words (letters only)", () => {
    const words = getWordsForStage(1);
    for (const word of words) {
      expect(word).toMatch(/^[a-z]+$/);
    }
    expect(words.length).toBeGreaterThan(50);
  });

  it("stage 2 returns words (same as stage 1 — modifiers tested via phrases)", () => {
    const words = getWordsForStage(2);
    expect(words.length).toBeGreaterThan(50);
  });

  it("stage 3 returns strings containing digits", () => {
    const words = getWordsForStage(3);
    const hasDigit = words.some((w) => /\d/.test(w));
    expect(hasDigit).toBe(true);
  });

  it("stage 4 returns strings containing symbols", () => {
    const words = getWordsForStage(4);
    const hasSymbol = words.some((w) => /[^a-zA-Z0-9\s]/.test(w));
    expect(hasSymbol).toBe(true);
  });

  it("stage 6 returns mixed content", () => {
    const words = getWordsForStage(6);
    expect(words.length).toBeGreaterThan(10);
  });
});
