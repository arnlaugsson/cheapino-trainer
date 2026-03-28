import type { KeyDef, Layer, Layout } from "../../data/layout";

/**
 * QMK keycode ranges (from vial-gui keycodes_v6.py)
 */
const QK_BASIC_MAX = 0x00ff;
const QK_MODS_MIN = 0x0100;
const QK_MODS_MAX = 0x1fff;
const QK_MOD_TAP_MIN = 0x2000;
const QK_MOD_TAP_MAX = 0x3fff;
const QK_LAYER_TAP_MIN = 0x4000;
const QK_LAYER_TAP_MAX = 0x4fff;
const QK_MOMENTARY = 0x5220;
const QK_TOGGLE_LAYER = 0x5260;

const KC_NO = 0x0000;
const KC_TRNS = 0x0001;

/** Basic keycodes → { label, KeyboardEvent.code } */
const BASIC_KEYCODES: Record<number, { label: string; code?: string }> = {
  0x04: { label: "A", code: "KeyA" },
  0x05: { label: "B", code: "KeyB" },
  0x06: { label: "C", code: "KeyC" },
  0x07: { label: "D", code: "KeyD" },
  0x08: { label: "E", code: "KeyE" },
  0x09: { label: "F", code: "KeyF" },
  0x0a: { label: "G", code: "KeyG" },
  0x0b: { label: "H", code: "KeyH" },
  0x0c: { label: "I", code: "KeyI" },
  0x0d: { label: "J", code: "KeyJ" },
  0x0e: { label: "K", code: "KeyK" },
  0x0f: { label: "L", code: "KeyL" },
  0x10: { label: "M", code: "KeyM" },
  0x11: { label: "N", code: "KeyN" },
  0x12: { label: "O", code: "KeyO" },
  0x13: { label: "P", code: "KeyP" },
  0x14: { label: "Q", code: "KeyQ" },
  0x15: { label: "R", code: "KeyR" },
  0x16: { label: "S", code: "KeyS" },
  0x17: { label: "T", code: "KeyT" },
  0x18: { label: "U", code: "KeyU" },
  0x19: { label: "V", code: "KeyV" },
  0x1a: { label: "W", code: "KeyW" },
  0x1b: { label: "X", code: "KeyX" },
  0x1c: { label: "Y", code: "KeyY" },
  0x1d: { label: "Z", code: "KeyZ" },
  0x1e: { label: "1", code: "Digit1" },
  0x1f: { label: "2", code: "Digit2" },
  0x20: { label: "3", code: "Digit3" },
  0x21: { label: "4", code: "Digit4" },
  0x22: { label: "5", code: "Digit5" },
  0x23: { label: "6", code: "Digit6" },
  0x24: { label: "7", code: "Digit7" },
  0x25: { label: "8", code: "Digit8" },
  0x26: { label: "9", code: "Digit9" },
  0x27: { label: "0", code: "Digit0" },
  0x28: { label: "Enter", code: "Enter" },
  0x29: { label: "Esc", code: "Escape" },
  0x2a: { label: "Bksp", code: "Backspace" },
  0x2b: { label: "Tab", code: "Tab" },
  0x2c: { label: "Space", code: "Space" },
  0x2d: { label: "-", code: "Minus" },
  0x2e: { label: "=", code: "Equal" },
  0x2f: { label: "[", code: "BracketLeft" },
  0x30: { label: "]", code: "BracketRight" },
  0x31: { label: "\\", code: "Backslash" },
  0x33: { label: ";", code: "Semicolon" },
  0x34: { label: "'", code: "Quote" },
  0x35: { label: "`", code: "Backquote" },
  0x36: { label: ",", code: "Comma" },
  0x37: { label: ".", code: "Period" },
  0x38: { label: "/", code: "Slash" },
  0x39: { label: "Caps", code: "CapsLock" },
  0x46: { label: "PrtSc", code: "PrintScreen" },
  0x47: { label: "ScrLk", code: "ScrollLock" },
  0x48: { label: "Pause", code: "Pause" },
  0x49: { label: "Ins", code: "Insert" },
  0x4a: { label: "Home", code: "Home" },
  0x4b: { label: "PgUp", code: "PageUp" },
  0x4c: { label: "Del", code: "Delete" },
  0x4d: { label: "End", code: "End" },
  0x4e: { label: "PgDn", code: "PageDown" },
  0x4f: { label: "Right", code: "ArrowRight" },
  0x50: { label: "Left", code: "ArrowLeft" },
  0x51: { label: "Down", code: "ArrowDown" },
  0x52: { label: "Up", code: "ArrowUp" },
};

const SHIFTED_LABELS: Record<number, string> = {
  0x1e: "!", 0x1f: "@", 0x20: "#", 0x21: "$", 0x22: "%",
  0x23: "^", 0x24: "&", 0x25: "*", 0x26: "(", 0x27: ")",
  0x2d: "_", 0x2e: "+", 0x2f: "{", 0x30: "}", 0x31: "|",
  0x33: ":", 0x34: "\"", 0x35: "~", 0x36: "<", 0x37: ">",
  0x38: "?",
};

function blank(): KeyDef {
  return { label: "", blank: true };
}

function keycodeToKeyDef(kc: number, isBaseLayer: boolean): KeyDef {
  if (kc === KC_NO || kc === KC_TRNS || kc === -1) {
    return blank();
  }

  // Basic keycodes
  if (kc <= QK_BASIC_MAX) {
    const entry = BASIC_KEYCODES[kc];
    if (entry) {
      return isBaseLayer
        ? { label: entry.label, code: entry.code }
        : { label: entry.label };
    }
    return blank();
  }

  // Mods + keycode (e.g. LSFT(KC_1) = "!")
  if (kc >= QK_MODS_MIN && kc <= QK_MODS_MAX) {
    const baseKc = kc & 0xff;
    const mods = (kc >> 8) & 0x1f;
    const isShift = (mods & 0x02) !== 0 || (mods & 0x12) !== 0;
    if (isShift && SHIFTED_LABELS[baseKc]) {
      return { label: SHIFTED_LABELS[baseKc] };
    }
    const entry = BASIC_KEYCODES[baseKc];
    if (entry) {
      const modPrefix = [];
      if (mods & 0x01) modPrefix.push("Ctrl");
      if (mods & 0x02) modPrefix.push("Shift");
      if (mods & 0x04) modPrefix.push("Alt");
      if (mods & 0x08) modPrefix.push("GUI");
      return { label: `${modPrefix.join("+")}+${entry.label}` };
    }
    return blank();
  }

  // Mod-tap (hold for mod, tap for key)
  if (kc >= QK_MOD_TAP_MIN && kc <= QK_MOD_TAP_MAX) {
    const baseKc = kc & 0xff;
    const entry = BASIC_KEYCODES[baseKc];
    if (entry) {
      return isBaseLayer
        ? { label: entry.label, code: entry.code }
        : { label: entry.label };
    }
    return blank();
  }

  // Layer-tap (hold for layer, tap for key)
  if (kc >= QK_LAYER_TAP_MIN && kc <= QK_LAYER_TAP_MAX) {
    const baseKc = kc & 0xff;
    const entry = BASIC_KEYCODES[baseKc];
    if (entry) {
      return isBaseLayer
        ? { label: entry.label, code: entry.code }
        : { label: entry.label };
    }
    return blank();
  }

  // MO(layer)
  if ((kc & 0xfff0) === QK_MOMENTARY) {
    return blank();
  }

  // TG(layer)
  if ((kc & 0xfff0) === QK_TOGGLE_LAYER) {
    return blank();
  }

  return blank();
}

type VilData = {
  layout: number[][][];
  [key: string]: unknown;
};

/**
 * Cheapino matrix layout: the .vil file has rows/cols as physical matrix positions.
 * The Cheapino has 4 rows x 10 cols in its matrix (using duplex matrix).
 * Rows 0-2 are finger keys, row 3 is thumb keys.
 * Cols 0-4 are left half, cols 5-9 are right half.
 */
const LEFT_COLS = 5;

function splitMatrixRow(matrixRow: number[]): { left: number[]; right: number[] } {
  return {
    left: matrixRow.slice(0, LEFT_COLS),
    right: matrixRow.slice(LEFT_COLS),
  };
}

function layerFromMatrix(
  matrixLayer: number[][],
  layerIndex: number,
  layerNames: string[],
): Layer {
  const isBase = layerIndex === 0;
  const left: KeyDef[][] = [];
  const right: KeyDef[][] = [];

  for (let row = 0; row < matrixLayer.length; row++) {
    const { left: leftCodes, right: rightCodes } = splitMatrixRow(matrixLayer[row]);
    left.push(leftCodes.map((kc) => keycodeToKeyDef(kc, isBase)));
    right.push(rightCodes.map((kc) => keycodeToKeyDef(kc, isBase)));
  }

  return {
    name: layerNames[layerIndex] ?? `Layer ${layerIndex}`,
    left,
    right,
  };
}

const DEFAULT_LAYER_NAMES = ["Base", "Numbers", "Symbols", "Navigation"];

export type VilImportResult =
  | { ok: true; layout: Layout }
  | { ok: false; error: string };

export function parseVilFile(jsonString: string): VilImportResult {
  let data: VilData;
  try {
    data = JSON.parse(jsonString);
  } catch {
    return { ok: false, error: "Invalid JSON — is this a .vil file from Vial?" };
  }

  if (!Array.isArray(data.layout)) {
    return { ok: false, error: "No layout data found in file." };
  }

  if (data.layout.length === 0) {
    return { ok: false, error: "Layout has no layers." };
  }

  const layers: Layer[] = data.layout.map((matrixLayer, i) =>
    layerFromMatrix(matrixLayer, i, DEFAULT_LAYER_NAMES),
  );

  return { ok: true, layout: { layers } };
}
