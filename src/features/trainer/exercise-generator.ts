import type { Stage, ExerciseType } from "../../data/stages";
import { getWordsForStage } from "../../data/words";

export type Exercise = {
  prompt: string;
  type: ExerciseType;
};

const WORD_COUNT = 8;

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleAndPick<T>(arr: readonly T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateWords(stageId: number): string {
  const words = getWordsForStage(stageId);
  if (words.length === 0) return "";
  return shuffleAndPick(words, WORD_COUNT).join(" ");
}

function generateFromInline(stage: Stage, type: ExerciseType): string {
  const exercises = stage.exercises?.[type];
  if (!exercises || exercises.length === 0) return "";
  return pickRandom(exercises);
}

export function generateExercise(stage: Stage, requestedType?: ExerciseType): Exercise {
  const type = requestedType ?? pickRandom(stage.exerciseTypes);

  let prompt: string;

  switch (type) {
    case "words":
    case "mixed":
      prompt = generateWords(stage.id);
      break;
    case "single-keys":
    case "phrases":
    case "code-snippets":
    case "key-sequence":
      prompt = generateFromInline(stage, type);
      break;
    default:
      prompt = generateWords(stage.id);
  }

  return { prompt, type };
}
