import { stages } from "../../data/stages";

export type StageProgress = {
  bestWpm: number;
  bestAccuracy: number;
  attempts: number;
};

type ExerciseResult = {
  wpm: number;
  accuracy: number;
};

const STORAGE_KEY = "cheapino-progress";

function readAll(): Record<number, StageProgress> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeAll(data: Record<number, StageProgress>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getProgress(stageId: number): StageProgress {
  const all = readAll();
  return all[stageId] ?? { bestWpm: 0, bestAccuracy: 0, attempts: 0 };
}

export function saveResult(stageId: number, result: ExerciseResult): void {
  const all = readAll();
  const prev = all[stageId] ?? { bestWpm: 0, bestAccuracy: 0, attempts: 0 };
  const updated: StageProgress = {
    bestWpm: Math.max(prev.bestWpm, result.wpm),
    bestAccuracy: Math.max(prev.bestAccuracy, result.accuracy),
    attempts: prev.attempts + 1,
  };
  writeAll({ ...all, [stageId]: updated });
}

export function isStageComplete(stageId: number): boolean {
  const progress = getProgress(stageId);
  const stage = stages[stageId];
  if (!stage) return false;
  const { wpm, accuracy } = stage.threshold;
  const wpmMet = wpm === 0 || progress.bestWpm >= wpm;
  return wpmMet && progress.bestAccuracy >= accuracy;
}

export function isStageUnlocked(stageId: number): boolean {
  if (stageId === 0) return true;
  return isStageComplete(stageId - 1);
}
