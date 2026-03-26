export type KeyDef = {
  label: string;
  code?: string;
  blank?: boolean;
};

export type Layer = {
  name: string;
  activator?: string;
  left: KeyDef[][];
  right: KeyDef[][];
};

export type Layout = {
  layers: Layer[];
};

function k(label: string, code: string): KeyDef {
  return { label, code };
}

function blank(): KeyDef {
  return { label: "", blank: true };
}

function lk(label: string): KeyDef {
  return { label };
}

const baseLayer: Layer = {
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

const numberLayer: Layer = {
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

const symbolLayer: Layer = {
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

const navigationLayer: Layer = {
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

export const defaultLayout: Layout = {
  layers: [baseLayer, numberLayer, symbolLayer, navigationLayer],
};
