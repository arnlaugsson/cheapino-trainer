import { describe, it, expect } from "vitest";
import { stages, getStagesForLayout } from "./stages";
import type { Stage, ExerciseType } from "./stages";
import { LAYOUT_PRESETS } from "./layouts";

describe("stages", () => {
  it("has 8 stages (0-7)", () => {
    expect(stages).toHaveLength(8);
    expect(stages[0].id).toBe(0);
    expect(stages[7].id).toBe(7);
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
    const validLayers = ["Base", "Numbers", "Symbols", "Navigation", "Function"];
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
  const original = LAYOUT_PRESETS.find((p) => p.id === "original")!;
  const peterxjang = LAYOUT_PRESETS.find((p) => p.id === "peterxjang")!;

  it("preserves stages 0-6 for the Original layout and filters out the Function stage", () => {
    const result = getStagesForLayout(original);
    expect(result).toHaveLength(7);
    expect(result).toEqual(stages.slice(0, 7));
    expect(result.some((s) => s.role === "function")).toBe(false);
  });

  it("includes the Function stage for Peter Xjang", () => {
    const result = getStagesForLayout(peterxjang);
    expect(result).toHaveLength(8);
    expect(result[7].name).toBe("Function Keys");
    expect(result[7].layers).toEqual(["Base", "Function"]);
    expect(result[7].description.startsWith("Hold Bksp to activate the Function layer.")).toBe(
      true,
    );
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

  it("rewrites stage 3 (Numbers) layers and activator to point at Peter Xjang's Symbols layer", () => {
    const result = getStagesForLayout(peterxjang);
    expect(result[3].layers).toEqual(["Base", "Symbols"]);
    expect(result[3].description).toBe(
      "Hold Space to activate the Symbols layer. Practice typing digits, dates, and addresses.",
    );
  });

  it("rewrites stage 4 (Symbols) activator from 'hold Tab' to 'hold Space' on Peter Xjang", () => {
    const result = getStagesForLayout(peterxjang);
    expect(result[4].layers).toEqual(["Base", "Symbols"]);
    expect(result[4].description.startsWith("Hold Space to activate the Symbols layer.")).toBe(true);
    expect(result[4].description).not.toContain("Hold Tab");
  });

  it("rewrites stage 5 (Navigation) to use Peter Xjang's Symbols layer", () => {
    const result = getStagesForLayout(peterxjang);
    expect(result[5].layers).toEqual(["Base", "Symbols"]);
    expect(result[5].description.startsWith("Hold Space to activate the Symbols layer.")).toBe(true);
    expect(result[5].description).not.toContain("Hold Enter");
  });

  it("dedupes stage 6 layers from the layout's role mapping", () => {
    const peterResult = getStagesForLayout(peterxjang);
    expect(peterResult[6].layers).toEqual(["Base", "Symbols", "Function"]);

    const originalResult = getStagesForLayout(original);
    expect(originalResult[6].layers).toEqual([
      "Base",
      "Numbers",
      "Symbols",
      "Navigation",
    ]);
  });

  it("leaves stages without a role unchanged", () => {
    const result = getStagesForLayout(peterxjang);
    expect(result[1]).toEqual(stages[1]);
    expect(result[2]).toEqual(stages[2]);
  });
});
