export const COLUMN_OFFSETS = [0.5, 0.25, 0, 0.125, 0.25];

export const KEY_WIDTH = 50;
export const KEY_HEIGHT = 50;
export const KEY_GAP = 4;
export const HALF_GAP = 40;
export const THUMB_OFFSET_Y = 10;

export const COLS_PER_HALF = 5;
export const FINGER_ROWS = 3;
export const THUMB_KEYS = 3;

export type KeyPosition = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function getKeyPositions(
  half: "left" | "right",
  rows: number,
  thumbKeys: number,
): KeyPosition[][] {
  const result: KeyPosition[][] = [];
  const halfOffset =
    half === "right"
      ? COLS_PER_HALF * (KEY_WIDTH + KEY_GAP) + HALF_GAP
      : 0;

  for (let row = 0; row < rows; row++) {
    const rowPositions: KeyPosition[] = [];
    for (let col = 0; col < COLS_PER_HALF; col++) {
      const colIdx = half === "right" ? COLS_PER_HALF - 1 - col : col;
      const stagger = COLUMN_OFFSETS[colIdx] * (KEY_HEIGHT + KEY_GAP);
      rowPositions.push({
        x: halfOffset + col * (KEY_WIDTH + KEY_GAP),
        y: row * (KEY_HEIGHT + KEY_GAP) + stagger,
        width: KEY_WIDTH,
        height: KEY_HEIGHT,
      });
    }
    result.push(rowPositions);
  }

  const thumbY =
    rows * (KEY_HEIGHT + KEY_GAP) + THUMB_OFFSET_Y + COLUMN_OFFSETS[0] * (KEY_HEIGHT + KEY_GAP);
  const thumbRow: KeyPosition[] = [];
  const thumbStartCol = half === "left" ? 2 : 0;
  for (let i = 0; i < thumbKeys; i++) {
    thumbRow.push({
      x: halfOffset + (thumbStartCol + i) * (KEY_WIDTH + KEY_GAP),
      y: thumbY,
      width: KEY_WIDTH,
      height: KEY_HEIGHT,
    });
  }
  result.push(thumbRow);

  return result;
}

export function getTotalWidth(): number {
  return 2 * COLS_PER_HALF * (KEY_WIDTH + KEY_GAP) + HALF_GAP - KEY_GAP;
}

export function getTotalHeight(): number {
  const maxStagger = Math.max(...COLUMN_OFFSETS) * (KEY_HEIGHT + KEY_GAP);
  return (
    (FINGER_ROWS + 1) * (KEY_HEIGHT + KEY_GAP) +
    THUMB_OFFSET_Y +
    maxStagger
  );
}
