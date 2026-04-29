import { describe, it, expect } from "vitest";
import { stages, getStagesForLayout } from "./stages";
import type { Stage, ExerciseType } from "./stages";
import { LAYOUT_PRESETS } from "./layouts";

describe("stages", () => {
  it("has 7 stages (0-6)", () => {
    expect(stages).toHaveLength(7);
    expect(stages[0].id).toBe(0);
    expect(stages[6].id).toBe(6);
  });

  it("each stage has required fields", () => {
    for (const stage of stages) {
      expect(stage.name).toBeTruthy();
      expect(stage.description).toBeTruthy();
      expect(stage.layers.length).toBeGreaterThan(0);
      expect(stage.exerciseTypes.length).toBeGreaterThan(0);
      expect(stage.threshold.accuracy).toBeGreaterThan(0);
    }
  });

  it("stage 5 (navigation) has wpm threshold of 0", () => {
    expect(stages[5].threshold.wpm).toBe(0);
  });

  it("stage 5 uses key-sequence exercise type", () => {
    expect(stages[5].exerciseTypes).toContain("key-sequence");
  });

  it("each stage references valid layer names", () => {
    const validLayers = ["Base", "Numbers", "Symbols", "Navigation"];
    for (const stage of stages) {
      for (const layer of stage.layers) {
        expect(validLayers).toContain(layer);
      }
    }
  });

  it("stages have inline exercises for types that need them", () => {
    for (const stage of stages) {
      const needsInline: ExerciseType[] = ["single-keys", "code-snippets", "phrases", "key-sequence"];
      for (const type of stage.exerciseTypes) {
        if (needsInline.includes(type)) {
          expect(stage.exercises?.[type]?.length).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe("getStagesForLayout", () => {
  const original = LAYOUT_PRESETS.find((p) => p.id === "original")!.layout;
  const peterxjang = LAYOUT_PRESETS.find((p) => p.id === "peterxjang")!.layout;

  it("returns the static stages unchanged for layouts with ; on the home row", () => {
    const result = getStagesForLayout(original);
    expect(result).toBe(stages);
  });

  it("rewrites stage 0 description for layouts with a different right-pinky home key", () => {
    const result = getStagesForLayout(peterxjang);
    expect(result[0].description).toContain("H J K L '");
    expect(result[0].description).not.toContain(";");
  });

  it("rewrites stage 0 single-keys exercises to use the active layout's home-row pinky key", () => {
    const result = getStagesForLayout(peterxjang);
    const singleKeys = result[0].exercises?.["single-keys"] ?? [];
    expect(singleKeys.length).toBeGreaterThan(0);
    for (const exercise of singleKeys) {
      expect(exercise).not.toContain(";");
    }
    expect(singleKeys.some((s) => s.includes("'"))).toBe(true);
  });

  it("leaves stages 1-6 untouched", () => {
    const result = getStagesForLayout(peterxjang);
    for (let i = 1; i < stages.length; i++) {
      expect(result[i]).toBe(stages[i]);
    }
  });
});
