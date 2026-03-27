export function calculateWpm(charsTyped: number, elapsedMs: number): number {
  if (elapsedMs === 0) return 0;
  const minutes = elapsedMs / 60_000;
  const words = charsTyped / 5;
  return Math.round(words / minutes);
}

export function calculateAccuracy(correctKeystrokes: number, totalKeystrokes: number): number {
  if (totalKeystrokes === 0) return 0;
  return correctKeystrokes / totalKeystrokes;
}
