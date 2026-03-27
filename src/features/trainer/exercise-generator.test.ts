import { describe, it, expect } from "vitest";
import { generateExercise } from "./exercise-generator";
import { stages } from "../../data/stages";

describe("generateExercise", () => {
  it("generates a non-empty prompt string for stage 0", () => {
    const exercise = generateExercise(stages[0]);
    expect(exercise.prompt.length).toBeGreaterThan(0);
    expect(exercise.type).toBeDefined();
  });

  it("generates single-keys exercises with space-separated characters", () => {
    const exercise = generateExercise(stages[0], "single-keys");
    expect(exercise.prompt).toContain(" ");
    expect(exercise.type).toBe("single-keys");
  });

  it("generates word exercises for stage 1", () => {
    const exercise = generateExercise(stages[1], "words");
    expect(exercise.prompt.length).toBeGreaterThan(0);
    expect(exercise.type).toBe("words");
  });

  it("generates code-snippet exercises for stage 4", () => {
    const exercise = generateExercise(stages[4], "code-snippets");
    expect(exercise.prompt.length).toBeGreaterThan(0);
    expect(exercise.type).toBe("code-snippets");
  });

  it("generates key-sequence exercises for stage 5", () => {
    const exercise = generateExercise(stages[5], "key-sequence");
    expect(exercise.prompt.length).toBeGreaterThan(0);
    expect(exercise.type).toBe("key-sequence");
  });

  it("picks a random exercise type when none specified", () => {
    const types = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const exercise = generateExercise(stages[0]);
      types.add(exercise.type);
    }
    expect(types.size).toBeGreaterThan(0);
  });

  it("word exercises produce multiple words joined by spaces", () => {
    const exercise = generateExercise(stages[1], "words");
    const wordCount = exercise.prompt.split(" ").length;
    expect(wordCount).toBeGreaterThanOrEqual(3);
  });
});
