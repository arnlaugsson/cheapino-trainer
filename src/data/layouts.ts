import type { KeyDef, Layer, Layout } from "./layout";

function k(label: string, code: string): KeyDef {
  return { label, code };
}

function blank(): KeyDef {
  return { label: "", blank: true };
}

function lk(label: string): KeyDef {
  return { label };
}

// ─── Original Cheapino Layout ───────────────────────────────────────────────

const origBase: Layer = {
  name: "Base",
  left: [
    [k("Q", "KeyQ"), k("W", "KeyW"), k("E", "KeyE"), k("R", "KeyR"), k("T", "KeyT")],
    [k("A", "KeyA"), k("S", "KeyS"), k("D", "KeyD"), k("F", "KeyF"), k("G", "KeyG")],
    [k("Z", "KeyZ"), k("X", "KeyX"), k("C", "KeyC"), k("V", "KeyV"), k("B", "KeyB")],
    [k("Esc", "Escape"), k("Space", "Space"), k("Tab", "Tab")],
  ],
  right: [
    [k("Y", "KeyY"), k("U", "KeyU"), k("I", "KeyI"), k("O", "KeyO"), k("P", "KeyP")],
    [k("H", "KeyH"), k("J", "KeyJ"), k("K", "KeyK"), k("L", "KeyL"), k(";", "Semicolon")],
    [k("N", "KeyN"), k("M", "KeyM"), k(",", "Comma"), k(".", "Period"), k("/", "Slash")],
    [k("Enter", "Enter"), k("Bksp", "Backspace"), k("Del", "Delete")],
  ],
};

const origNumbers: Layer = {
  name: "Numbers",
  activator: "hold Space",
  left: [
    [blank(), blank(), blank(), blank(), blank()],
    [lk("1"), lk("2"), lk("3"), lk("4"), lk("5")],
    [blank(), blank(), blank(), blank(), blank()],
    [blank(), blank(), blank()],
  ],
  right: [
    [blank(), blank(), blank(), blank(), blank()],
    [lk("6"), lk("7"), lk("8"), lk("9"), lk("0")],
    [blank(), lk("-"), lk("="), blank(), blank()],
    [blank(), blank(), blank()],
  ],
};

const origSymbols: Layer = {
  name: "Symbols",
  activator: "hold Tab",
  left: [
    [lk("!"), lk("@"), lk("#"), lk("$"), lk("%")],
    [lk("`"), lk("~"), lk("{"), lk("}"), lk("|")],
    [blank(), blank(), blank(), blank(), blank()],
    [blank(), blank(), blank()],
  ],
  right: [
    [lk("^"), lk("&"), lk("*"), lk("("), lk(")")],
    [lk("\\"), lk("["), lk("]"), lk("+"), lk("_")],
    [blank(), lk("<"), lk(">"), blank(), blank()],
    [blank(), blank(), blank()],
  ],
};

const origNavigation: Layer = {
  name: "Navigation",
  activator: "hold Enter",
  left: [
    [blank(), blank(), blank(), blank(), blank()],
    [blank(), blank(), blank(), blank(), blank()],
    [blank(), blank(), blank(), blank(), blank()],
    [blank(), blank(), blank()],
  ],
  right: [
    [lk("PgUp"), lk("Home"), lk("Up"), lk("End"), blank()],
    [lk("PgDn"), lk("Left"), lk("Down"), lk("Right"), blank()],
    [blank(), blank(), blank(), blank(), blank()],
    [blank(), blank(), blank()],
  ],
};

// ─── Peter Xjang Layout ─────────────────────────────────────────────────────
// https://peterxjang.com/blog/designing-a-36-key-custom-keyboard-layout.html

const pxBase: Layer = {
  name: "Base",
  left: [
    [k("Q", "KeyQ"), k("W", "KeyW"), k("E", "KeyE"), k("R", "KeyR"), k("T", "KeyT")],
    [k("A", "KeyA"), k("S", "KeyS"), k("D", "KeyD"), k("F", "KeyF"), k("G", "KeyG")],
    [k("Z", "KeyZ"), k("X", "KeyX"), k("C", "KeyC"), k("V", "KeyV"), k("B", "KeyB")],
    [k("Esc", "Escape"), k("Cmd", "MetaLeft"), k("Tab", "Tab")],
  ],
  right: [
    [k("Y", "KeyY"), k("U", "KeyU"), k("I", "KeyI"), k("O", "KeyO"), k("P", "KeyP")],
    [k("H", "KeyH"), k("J", "KeyJ"), k("K", "KeyK"), k("L", "KeyL"), k("'", "Quote")],
    [k("N", "KeyN"), k("M", "KeyM"), k(",", "Comma"), k(".", "Period"), k("/", "Slash")],
    [k("Enter", "Enter"), k("Space", "Space"), k("Bksp", "Backspace")],
  ],
};

const pxSymbols: Layer = {
  name: "Symbols",
  activator: "hold Space",
  left: [
    [lk("1"), lk("2"), lk("3"), lk("4"), lk("5")],
    [lk("`"), lk("Home"), lk("PgUp"), lk("PgDn"), lk("End")],
    [blank(), blank(), blank(), blank(), blank()],
    [blank(), blank(), blank()],
  ],
  right: [
    [lk("6"), lk("7"), lk("8"), lk("9"), lk("0")],
    [lk("Left"), lk("Down"), lk("Up"), lk("Right"), lk(";")],
    [lk("-"), lk("="), lk("["), lk("]"), lk("\\")],
    [blank(), blank(), blank()],
  ],
};

const pxFunction: Layer = {
  name: "Function",
  activator: "hold Bksp",
  left: [
    [lk("F1"), lk("F2"), lk("F3"), lk("F4"), lk("F5")],
    [lk("F11"), lk("F12"), lk("Prev"), lk("Play"), lk("Next")],
    [blank(), blank(), blank(), blank(), blank()],
    [blank(), blank(), blank()],
  ],
  right: [
    [lk("F6"), lk("F7"), lk("F8"), lk("F9"), lk("F10")],
    [lk("Mute"), lk("Vol-"), lk("Vol+"), lk("Br-"), lk("Br+")],
    [blank(), blank(), blank(), blank(), blank()],
    [blank(), blank(), blank()],
  ],
};

// ─── Exported Presets ────────────────────────────────────────────────────────

export type LayoutPreset = {
  id: string;
  name: string;
  description: string;
  layout: Layout;
};

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: "peterxjang",
    name: "Peter Xjang",
    description: "Layer-tap thumbs, nav on symbol layer, function layer for media/brightness",
    layout: { layers: [pxBase, pxSymbols, pxFunction] },
  },
  {
    id: "original",
    name: "Original",
    description: "Home-row mods, separate number/symbol/navigation layers",
    layout: { layers: [origBase, origNumbers, origSymbols, origNavigation] },
  },
];

export function getPresetById(id: string): LayoutPreset | undefined {
  return LAYOUT_PRESETS.find((p) => p.id === id);
}
