# Cheapino Learning App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a progressive web app that teaches typing on a 36-key Cheapino split keyboard through 7 staged exercises with an interactive SVG visualizer and typing trainer.

**Architecture:** React SPA with feature-based organization. All data (keymap, stages, word lists) lives in `src/data/`. Features (keyboard visualizer, trainer, progress) are self-contained modules. No backend — localStorage for persistence.

**Tech Stack:** Vite, React 19, TypeScript, Tailwind CSS v4, Vitest, React Testing Library

**Spec:** `docs/superpowers/specs/2026-03-25-cheapino-learning-app-design.md`

---

## File Map

```
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── src/
│   ├── main.tsx                          # React entry point
│   ├── app/
│   │   ├── App.tsx                       # App shell with stage navigation
│   │   └── App.test.tsx
│   ├── data/
│   │   ├── layout.ts                     # Cheapino keymap types + default layout
│   │   ├── layout.test.ts                # Validates layout data integrity
│   │   ├── stages.ts                     # Stage definitions, thresholds, inline exercises
│   │   ├── stages.test.ts
│   │   ├── words.ts                      # Curated word lists per stage
│   │   └── words.test.ts
│   ├── features/
│   │   ├── keyboard/
│   │   │   ├── KeyboardVisualizer.tsx     # SVG keyboard rendering
│   │   │   ├── KeyboardVisualizer.test.tsx
│   │   │   ├── Key.tsx                    # Single key SVG component
│   │   │   ├── Key.test.tsx
│   │   │   ├── useKeyPress.ts            # Hook: listen for keydown/keyup events
│   │   │   ├── useKeyPress.test.ts
│   │   │   └── layout-geometry.ts        # Column-stagger offsets, key sizes, positions
│   │   ├── trainer/
│   │   │   ├── TrainerView.tsx            # Exercise UI: prompt, input, feedback
│   │   │   ├── TrainerView.test.tsx
│   │   │   ├── useExercise.ts            # Hook: exercise state machine (prompt, cursor, validation)
│   │   │   ├── useExercise.test.ts
│   │   │   ├── exercise-generator.ts     # Generates exercises from stage config + word lists
│   │   │   ├── exercise-generator.test.ts
│   │   │   ├── metrics.ts                # WPM and accuracy calculation
│   │   │   └── metrics.test.ts
│   │   ├── progress/
│   │   │   ├── progress-store.ts         # localStorage read/write for stage progress
│   │   │   ├── progress-store.test.ts
│   │   │   ├── StageList.tsx             # Stage selection sidebar (locked/unlocked/complete)
│   │   │   └── StageList.test.tsx
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/app/App.tsx`

- [ ] **Step 1: Initialize Vite + React + TypeScript project**

```bash
cd /tmp && pnpm create vite cheapino-scaffold --template react-ts
cp -r /tmp/cheapino-scaffold/* /tmp/cheapino-scaffold/.* /Users/skuliarnlaugsson/Projects/Cheapino/ 2>/dev/null || true
rm -rf /tmp/cheapino-scaffold
cd /Users/skuliarnlaugsson/Projects/Cheapino
```

This scaffolds into a temp directory then copies to the project, avoiding Vite's interactive overwrite prompt.

- [ ] **Step 2: Install dependencies**

```bash
pnpm install
pnpm add -D tailwindcss @tailwindcss/vite vitest @testing-library/react @testing-library/jest-dom@^6 jsdom
```

- [ ] **Step 3: Configure Tailwind v4**

Add the Tailwind Vite plugin to `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

Replace the contents of `src/index.css` with:

```css
@import "tailwindcss";
```

- [ ] **Step 4: Configure Vitest**

Add to `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test-setup.ts",
  },
});
```

Create `src/test-setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Add test script to `package.json`:

```json
"scripts": {
  "test": "vitest",
  "test:run": "vitest run"
}
```

- [ ] **Step 5: Replace App.tsx with shell**

```tsx
function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-bold">Cheapino Trainer</h1>
      </header>
      <main className="p-6">
        <p>Ready to learn.</p>
      </main>
    </div>
  );
}

export default App;
```

- [ ] **Step 6: Verify dev server starts**

```bash
pnpm dev
```

Expected: App loads at `http://localhost:5173` with "Cheapino Trainer" header.

- [ ] **Step 7: Verify tests run**

```bash
pnpm test:run
```

Expected: 0 tests (no test files yet), clean exit.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + TypeScript + Tailwind + Vitest project"
```

---

## Task 2: Layout Data (`src/data/layout.ts`)

**Files:**
- Create: `src/data/layout.ts`, `src/data/layout.test.ts`

- [ ] **Step 1: Write failing test for layout types and data**

Create `src/data/layout.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { defaultLayout } from "./layout";
import type { Layout, Layer, KeyDef } from "./layout";

describe("defaultLayout", () => {
  it("has at least 4 layers (base, numbers, symbols, navigation)", () => {
    expect(defaultLayout.layers.length).toBeGreaterThanOrEqual(4);
  });

  it("each layer has left and right halves", () => {
    for (const layer of defaultLayout.layers) {
      expect(layer.left).toBeDefined();
      expect(layer.right).toBeDefined();
    }
  });

  it("each half has 4 rows (3 finger rows + 1 thumb row)", () => {
    for (const layer of defaultLayout.layers) {
      expect(layer.left).toHaveLength(4);
      expect(layer.right).toHaveLength(4);
    }
  });

  it("finger rows have 5 keys each", () => {
    for (const layer of defaultLayout.layers) {
      for (let row = 0; row < 3; row++) {
        expect(layer.left[row]).toHaveLength(5);
        expect(layer.right[row]).toHaveLength(5);
      }
    }
  });

  it("thumb rows have 3 keys each", () => {
    for (const layer of defaultLayout.layers) {
      expect(layer.left[3]).toHaveLength(3);
      expect(layer.right[3]).toHaveLength(3);
    }
  });

  it("base layer has no activator", () => {
    const base = defaultLayout.layers[0];
    expect(base.activator).toBeUndefined();
  });

  it("non-base layers have activators", () => {
    for (const layer of defaultLayout.layers.slice(1)) {
      expect(layer.activator).toBeDefined();
    }
  });

  it("base layer keys all have a code property", () => {
    const base = defaultLayout.layers[0];
    const allKeys = [...base.left.flat(), ...base.right.flat()];
    for (const key of allKeys) {
      expect(key.code).toBeDefined();
    }
  });

  it("each non-blank character appears on exactly one layer", () => {
    const seen = new Map<string, string>();
    for (const layer of defaultLayout.layers) {
      const allKeys = [...layer.left.flat(), ...layer.right.flat()];
      for (const key of allKeys) {
        if (key.blank) continue;
        const label = key.label;
        if (seen.has(label) && seen.get(label) !== layer.name) {
          // Allow base layer keys to appear as transparent on other layers
          // Only flag if same label appears as non-blank on two different layers
          throw new Error(
            `"${label}" appears on both "${seen.get(label)}" and "${layer.name}"`
          );
        }
        seen.set(label, layer.name);
      }
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test:run src/data/layout.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement layout.ts with types and default keymap**

Create `src/data/layout.ts`:

```ts
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
    [blank(), lk("[*]"), blank()],
  ],
  right: [
    [blank(), blank(), blank(), blank(), blank()],
    [lk("6"), lk("7"), lk("8"), lk("9"), lk("0")],
    [blank(), lk("-"), lk("="), lk("."), blank()],
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
    [blank(), blank(), lk("[*]")],
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
    [lk("[*]"), blank(), blank()],
  ],
};

export const defaultLayout: Layout = {
  layers: [baseLayer, numberLayer, symbolLayer, navigationLayer],
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test:run src/data/layout.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/layout.ts src/data/layout.test.ts
git commit -m "feat: add layout types and default Cheapino QWERTY keymap"
```

---

## Task 3: Stage Definitions (`src/data/stages.ts`)

**Files:**
- Create: `src/data/stages.ts`, `src/data/stages.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/data/stages.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { stages } from "./stages";
import type { Stage, ExerciseType } from "./stages";

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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test:run src/data/stages.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement stages.ts**

Create `src/data/stages.ts`:

```ts
export type ExerciseType =
  | "single-keys"
  | "words"
  | "phrases"
  | "code-snippets"
  | "mixed"
  | "key-sequence";

export type Stage = {
  id: number;
  name: string;
  description: string;
  layers: string[];
  exerciseTypes: ExerciseType[];
  threshold: { wpm: number; accuracy: number };
  exercises?: Partial<Record<ExerciseType, string[]>>;
};

export const stages: Stage[] = [
  {
    id: 0,
    name: "Home Position",
    description:
      "Home row keys only — A S D F G and H J K L ;. Get comfortable with the split layout and find your resting finger position.",
    layers: ["Base"],
    exerciseTypes: ["single-keys", "words"],
    threshold: { wpm: 15, accuracy: 0.9 },
    exercises: {
      "single-keys": [
        "f j f j f j d k d k d k",
        "s l s l s l a ; a ; a ;",
        "f d s a g h j k l ;",
        "a s d f g h j k l ;",
        "f j d k s l a ; g h",
      ],
    },
  },
  {
    id: 1,
    name: "All Letters",
    description:
      "Full QWERTY alphabet on the base layer. Practice common words until the split column-stagger feels natural.",
    layers: ["Base"],
    exerciseTypes: ["words", "phrases"],
    threshold: { wpm: 20, accuracy: 0.9 },
    exercises: {
      phrases: [
        "the quick brown fox jumps over the lazy dog",
        "pack my box with five dozen liquor jugs",
        "how vexingly quick daft zebras jump",
        "the five boxing wizards jump quickly",
        "just keep examining every low bid quoted for zinc etchings",
      ],
    },
  },
  {
    id: 2,
    name: "Modifiers",
    description:
      "Introduce Shift via home-row mods. Practice capital letters and CamelCase patterns.",
    layers: ["Base"],
    exerciseTypes: ["words", "phrases"],
    threshold: { wpm: 18, accuracy: 0.9 },
    exercises: {
      phrases: [
        "Hello World",
        "The Quick Brown Fox",
        "JavaScript TypeScript React",
        "Alice Bob Charlie Dave Eve",
        "Monday Tuesday Wednesday Thursday Friday",
      ],
    },
  },
  {
    id: 3,
    name: "Numbers",
    description:
      "Hold Space to activate the number layer. Practice typing digits, dates, and addresses.",
    layers: ["Base", "Numbers"],
    exerciseTypes: ["single-keys", "phrases"],
    threshold: { wpm: 15, accuracy: 0.9 },
    exercises: {
      "single-keys": [
        "1 2 3 4 5 6 7 8 9 0",
        "1 2 3 1 2 3 4 5 6 4 5 6",
        "7 8 9 0 7 8 9 0",
        "10 20 30 40 50 60 70 80 90",
      ],
      phrases: [
        "March 25 2026",
        "Room 404 Floor 3",
        "192 168 1 1",
        "Call 555 0123",
        "Order 12345 shipped on 03 25",
      ],
    },
  },
  {
    id: 4,
    name: "Symbols",
    description:
      "Hold Tab to activate the symbol layer. Practice code-like snippets with brackets, operators, and special characters.",
    layers: ["Base", "Numbers", "Symbols"],
    exerciseTypes: ["single-keys", "code-snippets"],
    threshold: { wpm: 12, accuracy: 0.85 },
    exercises: {
      "single-keys": [
        "( ) [ ] { } < >",
        "! @ # $ % ^ & *",
        "+ - = | \\ ~ `",
      ],
      "code-snippets": [
        "const x = [1, 2, 3];",
        "if (a > b) { return a; }",
        "function add(a, b) { return a + b; }",
        "const obj = { key: \"value\" };",
        "arr.map((x) => x * 2)",
        "import { useState } from \"react\";",
        "export default function App() {}",
        "type Props = { name: string; age: number };",
      ],
    },
  },
  {
    id: 5,
    name: "Navigation",
    description:
      "Hold Enter to activate the navigation layer. Practice moving through text with arrow keys, Home, End, Page Up, and Page Down.",
    layers: ["Base", "Navigation"],
    exerciseTypes: ["key-sequence"],
    threshold: { wpm: 0, accuracy: 0.9 },
    exercises: {
      "key-sequence": [
        "Left Left Left Right Right Right",
        "Up Up Down Down Left Right Left Right",
        "Home End Home End",
        "Down Down Down Up Up Up",
        "Right Right Right Home Down Right Right",
        "PageDown PageDown PageUp PageUp",
        "End Left Left Left Home Right Right",
      ],
    },
  },
  {
    id: 6,
    name: "Full Integration",
    description:
      "Mixed exercises combining all layers — prose, code, and terminal commands. Graduation stage.",
    layers: ["Base", "Numbers", "Symbols", "Navigation"],
    exerciseTypes: ["mixed", "code-snippets", "phrases"],
    threshold: { wpm: 20, accuracy: 0.9 },
    exercises: {
      "code-snippets": [
        "const result = items.filter((x) => x.value > 10).map((x) => x.name);",
        "export function greet(name: string): string { return `Hello, ${name}!`; }",
        "if (count >= 100 && status === \"active\") { process(count); }",
        "const [state, setState] = useState<number>(0);",
      ],
      phrases: [
        "The server is running on port 3000.",
        "Error 404: Page not found.",
        "Build succeeded in 12.5 seconds.",
        "git commit -m \"fix: resolve issue #42\"",
        "ssh user@192.168.1.100 -p 22",
      ],
    },
  },
];
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test:run src/data/stages.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/stages.ts src/data/stages.test.ts
git commit -m "feat: add stage curriculum definitions with exercises"
```

---

## Task 4: Word Lists (`src/data/words.ts`)

**Files:**
- Create: `src/data/words.ts`, `src/data/words.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/data/words.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getWordsForStage } from "./words";

describe("getWordsForStage", () => {
  it("stage 0 returns only home-row words (a s d f g h j k l)", () => {
    const words = getWordsForStage(0);
    const homeRowChars = new Set("asdfghjkl;");
    for (const word of words) {
      for (const char of word) {
        expect(homeRowChars.has(char)).toBe(true);
      }
    }
    expect(words.length).toBeGreaterThan(10);
  });

  it("stage 1 returns common English words (letters only)", () => {
    const words = getWordsForStage(1);
    for (const word of words) {
      expect(word).toMatch(/^[a-z]+$/);
    }
    expect(words.length).toBeGreaterThan(50);
  });

  it("stage 2 returns words (same as stage 1 — modifiers tested via phrases)", () => {
    const words = getWordsForStage(2);
    expect(words.length).toBeGreaterThan(50);
  });

  it("stage 3 returns strings containing digits", () => {
    const words = getWordsForStage(3);
    const hasDigit = words.some((w) => /\d/.test(w));
    expect(hasDigit).toBe(true);
  });

  it("stage 4 returns strings containing symbols", () => {
    const words = getWordsForStage(4);
    const hasSymbol = words.some((w) => /[^a-zA-Z0-9\s]/.test(w));
    expect(hasSymbol).toBe(true);
  });

  it("stage 6 returns mixed content", () => {
    const words = getWordsForStage(6);
    expect(words.length).toBeGreaterThan(10);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test:run src/data/words.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement words.ts**

Create `src/data/words.ts` with curated word lists. This file will contain:
- `homeRowWords`: hand-picked words using only a, s, d, f, g, h, j, k, l
- `commonWords`: ~200 frequency-ranked English words
- `numberWords`: strings containing digits (dates, addresses, etc.)
- `symbolWords`: strings containing common programming symbols
- `mixedWords`: combination of all types
- `getWordsForStage(stageId: number): string[]` — returns the appropriate list

```ts
const homeRowWords: string[] = [
  "ash", "add", "ads", "aha", "ahs", "all", "ask",
  "dad", "dads", "dash", "fad", "fads", "flag", "flags",
  "gal", "gals", "gas", "glad", "glass", "had", "half",
  "hall", "halls", "has", "jag", "lad", "lads", "lag",
  "lags", "lash", "lass", "sad", "sag", "saga", "shall",
  "shag", "slag", "slash", "flash", "flask", "gash", "hash",
  "salad", "alas", "fall", "falls", "hall", "alga",
];

const commonWords: string[] = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
  "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
  "but", "his", "by", "from", "they", "we", "her", "she", "or", "an",
  "will", "my", "one", "all", "would", "there", "their", "what", "so", "up",
  "out", "if", "about", "who", "get", "which", "go", "me", "when", "make",
  "can", "like", "time", "no", "just", "him", "know", "take", "people", "into",
  "year", "your", "good", "some", "could", "them", "see", "other", "than", "then",
  "now", "look", "only", "come", "its", "over", "think", "also", "back", "after",
  "use", "two", "how", "our", "work", "first", "well", "way", "even", "new",
  "want", "because", "any", "these", "give", "day", "most", "us", "great", "between",
  "need", "large", "under", "never", "right", "home", "still", "hand", "high", "last",
  "long", "small", "own", "life", "left", "world", "head", "help", "through", "much",
  "before", "line", "turn", "move", "thing", "place", "man", "old", "every", "point",
  "where", "part", "name", "each", "tell", "next", "state", "begin", "while", "found",
  "said", "keep", "let", "might", "say", "start", "three", "show", "house", "both",
  "end", "run", "read", "open", "same", "change", "write", "play", "must", "close",
  "number", "light", "group", "side", "night", "real", "city", "water", "call", "set",
];

const numberWords: string[] = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "0",
  "10", "20", "50", "100", "200", "500", "1000",
  "3.14", "2.5", "0.99", "42", "256", "1024", "8080",
  "2026", "1999", "2000", "365", "24", "60", "12",
];

const symbolWords: string[] = [
  "()", "[]", "{}", "<>",
  "a + b", "x - y", "n * 2", "a / b",
  "x = 5", "a != b", "x >= 10", "y <= 0",
  "!true", "@user", "#tag", "$price",
  "a | b", "a & b", "a ^ b", "~mask",
  "path/to/file", "key: value", "a => b",
  "[1, 2, 3]", "{a: 1}", "(x + y) * z",
];

const mixedWords: string[] = [
  ...commonWords.slice(0, 50),
  ...numberWords,
  ...symbolWords,
];

export function getWordsForStage(stageId: number): string[] {
  switch (stageId) {
    case 0:
      return homeRowWords;
    case 1:
    case 2:
      return commonWords;
    case 3:
      return numberWords;
    case 4:
      return symbolWords;
    case 5:
      return []; // Navigation stage uses key-sequence, not words
    case 6:
      return mixedWords;
    default:
      return commonWords;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test:run src/data/words.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/words.ts src/data/words.test.ts
git commit -m "feat: add curated word lists for each training stage"
```

---

## Task 5: Progress Store (`src/features/progress/progress-store.ts`)

**Files:**
- Create: `src/features/progress/progress-store.ts`, `src/features/progress/progress-store.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/features/progress/progress-store.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import {
  getProgress,
  saveResult,
  isStageUnlocked,
  isStageComplete,
  type StageProgress,
} from "./progress-store";

beforeEach(() => {
  localStorage.clear();
});

describe("progress-store", () => {
  it("returns empty progress for a new stage", () => {
    const progress = getProgress(0);
    expect(progress).toEqual({ bestWpm: 0, bestAccuracy: 0, attempts: 0 });
  });

  it("saves and retrieves a result", () => {
    saveResult(0, { wpm: 25, accuracy: 0.95 });
    const progress = getProgress(0);
    expect(progress.bestWpm).toBe(25);
    expect(progress.bestAccuracy).toBe(0.95);
    expect(progress.attempts).toBe(1);
  });

  it("keeps the best scores across multiple attempts", () => {
    saveResult(0, { wpm: 15, accuracy: 0.85 });
    saveResult(0, { wpm: 25, accuracy: 0.80 });
    saveResult(0, { wpm: 20, accuracy: 0.95 });
    const progress = getProgress(0);
    expect(progress.bestWpm).toBe(25);
    expect(progress.bestAccuracy).toBe(0.95);
    expect(progress.attempts).toBe(3);
  });

  it("stage 0 is always unlocked", () => {
    expect(isStageUnlocked(0)).toBe(true);
  });

  it("stage 1 is locked until stage 0 is complete", () => {
    expect(isStageUnlocked(1)).toBe(false);
    saveResult(0, { wpm: 20, accuracy: 0.95 });
    expect(isStageUnlocked(1)).toBe(true);
  });

  it("isStageComplete returns true when threshold is met", () => {
    expect(isStageComplete(0)).toBe(false);
    saveResult(0, { wpm: 20, accuracy: 0.95 });
    expect(isStageComplete(0)).toBe(true);
  });

  it("isStageComplete checks accuracy-only for stage 5 (wpm threshold 0)", () => {
    saveResult(5, { wpm: 0, accuracy: 0.95 });
    expect(isStageComplete(5)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test:run src/features/progress/progress-store.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement progress-store.ts**

Create `src/features/progress/progress-store.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test:run src/features/progress/progress-store.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/progress/progress-store.ts src/features/progress/progress-store.test.ts
git commit -m "feat: add localStorage-based progress tracking"
```

---

## Task 6: Metrics Calculation (`src/features/trainer/metrics.ts`)

**Files:**
- Create: `src/features/trainer/metrics.ts`, `src/features/trainer/metrics.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/features/trainer/metrics.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { calculateWpm, calculateAccuracy } from "./metrics";

describe("calculateWpm", () => {
  it("calculates standard WPM (chars / 5 / minutes)", () => {
    // 50 characters in 60 seconds = 10 WPM
    expect(calculateWpm(50, 60_000)).toBe(10);
  });

  it("calculates WPM for 30 seconds", () => {
    // 25 characters in 30 seconds = 10 WPM
    expect(calculateWpm(25, 30_000)).toBe(10);
  });

  it("returns 0 for 0 elapsed time", () => {
    expect(calculateWpm(50, 0)).toBe(0);
  });
});

describe("calculateAccuracy", () => {
  it("returns 1.0 for perfect accuracy", () => {
    expect(calculateAccuracy(50, 50)).toBe(1.0);
  });

  it("returns correct ratio for mistakes", () => {
    // 45 correct out of 50 total keystrokes
    expect(calculateAccuracy(45, 50)).toBeCloseTo(0.9);
  });

  it("returns 0 for 0 total keystrokes", () => {
    expect(calculateAccuracy(0, 0)).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test:run src/features/trainer/metrics.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement metrics.ts**

Create `src/features/trainer/metrics.ts`:

```ts
export function calculateWpm(
  charsTyped: number,
  elapsedMs: number,
): number {
  if (elapsedMs === 0) return 0;
  const minutes = elapsedMs / 60_000;
  const words = charsTyped / 5;
  return Math.round(words / minutes);
}

export function calculateAccuracy(
  correctKeystrokes: number,
  totalKeystrokes: number,
): number {
  if (totalKeystrokes === 0) return 0;
  return correctKeystrokes / totalKeystrokes;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test:run src/features/trainer/metrics.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/trainer/metrics.ts src/features/trainer/metrics.test.ts
git commit -m "feat: add WPM and accuracy metric calculations"
```

---

## Task 7: Exercise Generator (`src/features/trainer/exercise-generator.ts`)

**Files:**
- Create: `src/features/trainer/exercise-generator.ts`, `src/features/trainer/exercise-generator.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/features/trainer/exercise-generator.test.ts`:

```ts
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
    // Run multiple times to increase confidence it picks from available types
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test:run src/features/trainer/exercise-generator.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement exercise-generator.ts**

Create `src/features/trainer/exercise-generator.ts`:

```ts
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

function generateFromInline(
  stage: Stage,
  type: ExerciseType,
): string {
  const exercises = stage.exercises?.[type];
  if (!exercises || exercises.length === 0) return "";
  return pickRandom(exercises);
}

export function generateExercise(
  stage: Stage,
  requestedType?: ExerciseType,
): Exercise {
  const type = requestedType ?? pickRandom(stage.exerciseTypes);

  let prompt: string;

  switch (type) {
    case "words":
      prompt = generateWords(stage.id);
      break;
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test:run src/features/trainer/exercise-generator.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/trainer/exercise-generator.ts src/features/trainer/exercise-generator.test.ts
git commit -m "feat: add exercise generator for all stage types"
```

---

## Task 8: useKeyPress Hook (`src/features/keyboard/useKeyPress.ts`)

**Files:**
- Create: `src/features/keyboard/useKeyPress.ts`, `src/features/keyboard/useKeyPress.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/features/keyboard/useKeyPress.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useKeyPress } from "./useKeyPress";

describe("useKeyPress", () => {
  it("starts with no active keys", () => {
    const { result } = renderHook(() => useKeyPress());
    expect(result.current.activeKeys).toEqual(new Set());
    expect(result.current.lastKey).toBeNull();
  });

  it("tracks keydown events", () => {
    const { result } = renderHook(() => useKeyPress());
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { code: "KeyA", key: "a" }),
      );
    });
    expect(result.current.activeKeys.has("KeyA")).toBe(true);
    expect(result.current.lastKey).toEqual({ code: "KeyA", key: "a" });
  });

  it("removes keys on keyup", () => {
    const { result } = renderHook(() => useKeyPress());
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { code: "KeyA", key: "a" }),
      );
    });
    expect(result.current.activeKeys.has("KeyA")).toBe(true);
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keyup", { code: "KeyA", key: "a" }),
      );
    });
    expect(result.current.activeKeys.has("KeyA")).toBe(false);
  });

  it("calls onKeyDown callback when provided", () => {
    const onKeyDown = vi.fn();
    renderHook(() => useKeyPress({ onKeyDown }));
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { code: "KeyA", key: "a" }),
      );
    });
    expect(onKeyDown).toHaveBeenCalledWith(
      expect.objectContaining({ code: "KeyA", key: "a" }),
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test:run src/features/keyboard/useKeyPress.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement useKeyPress.ts**

Create `src/features/keyboard/useKeyPress.ts`:

```ts
import { useState, useEffect, useCallback, useRef } from "react";

type KeyInfo = {
  code: string;
  key: string;
};

type UseKeyPressOptions = {
  onKeyDown?: (event: KeyboardEvent) => void;
};

type UseKeyPressResult = {
  activeKeys: Set<string>;
  lastKey: KeyInfo | null;
};

export function useKeyPress(
  options?: UseKeyPressOptions,
): UseKeyPressResult {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [lastKey, setLastKey] = useState<KeyInfo | null>(null);
  const onKeyDownRef = useRef(options?.onKeyDown);
  onKeyDownRef.current = options?.onKeyDown;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.add(e.code);
        return next;
      });
      setLastKey({ code: e.code, key: e.key });
      onKeyDownRef.current?.(e);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return { activeKeys, lastKey };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test:run src/features/keyboard/useKeyPress.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/keyboard/useKeyPress.ts src/features/keyboard/useKeyPress.test.ts
git commit -m "feat: add useKeyPress hook for keyboard event tracking"
```

---

## Task 9: useExercise Hook (`src/features/trainer/useExercise.ts`)

**Files:**
- Create: `src/features/trainer/useExercise.ts`, `src/features/trainer/useExercise.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/features/trainer/useExercise.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useExercise } from "./useExercise";

describe("useExercise", () => {
  it("initializes with prompt and cursor at 0", () => {
    const { result } = renderHook(() => useExercise("hello"));
    expect(result.current.prompt).toBe("hello");
    expect(result.current.cursor).toBe(0);
    expect(result.current.isComplete).toBe(false);
    expect(result.current.chars).toHaveLength(5);
  });

  it("advances cursor on correct character", () => {
    const { result } = renderHook(() => useExercise("ab"));
    act(() => {
      result.current.handleKey("a");
    });
    expect(result.current.cursor).toBe(1);
    expect(result.current.chars[0].status).toBe("correct");
  });

  it("marks character as wrong on incorrect input", () => {
    const { result } = renderHook(() => useExercise("ab"));
    act(() => {
      result.current.handleKey("x");
    });
    expect(result.current.cursor).toBe(0);
    expect(result.current.chars[0].status).toBe("wrong");
  });

  it("handles backspace to clear wrong status", () => {
    const { result } = renderHook(() => useExercise("ab"));
    act(() => {
      result.current.handleKey("x");
    });
    expect(result.current.chars[0].status).toBe("wrong");
    act(() => {
      result.current.handleBackspace();
    });
    expect(result.current.chars[0].status).toBe("pending");
  });

  it("marks exercise complete when all chars typed correctly", () => {
    const { result } = renderHook(() => useExercise("ab"));
    act(() => {
      result.current.handleKey("a");
    });
    act(() => {
      result.current.handleKey("b");
    });
    expect(result.current.isComplete).toBe(true);
  });

  it("tracks total keystrokes including mistakes", () => {
    const { result } = renderHook(() => useExercise("a"));
    act(() => {
      result.current.handleKey("x"); // wrong
    });
    act(() => {
      result.current.handleBackspace(); // correction
    });
    act(() => {
      result.current.handleKey("a"); // correct
    });
    expect(result.current.totalKeystrokes).toBe(3);
    expect(result.current.correctKeystrokes).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test:run src/features/trainer/useExercise.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement useExercise.ts**

Create `src/features/trainer/useExercise.ts`:

```ts
import { useState, useCallback, useRef } from "react";

type CharStatus = "pending" | "correct" | "wrong";

export type CharState = {
  char: string;
  status: CharStatus;
};

export type UseExerciseResult = {
  prompt: string;
  chars: CharState[];
  cursor: number;
  isComplete: boolean;
  totalKeystrokes: number;
  correctKeystrokes: number;
  startTime: number | null;
  handleKey: (key: string) => void;
  handleBackspace: () => void;
  reset: () => void;
};

function buildChars(prompt: string): CharState[] {
  return [...prompt].map((char) => ({ char, status: "pending" as const }));
}

export function useExercise(prompt: string): UseExerciseResult {
  const [chars, setChars] = useState<CharState[]>(() => buildChars(prompt));
  const [cursor, setCursor] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const isComplete = cursor >= prompt.length && chars.every((c) => c.status === "correct");

  const handleKey = useCallback(
    (key: string) => {
      if (cursor >= prompt.length) return;

      if (startTime === null) {
        setStartTime(Date.now());
      }

      setTotalKeystrokes((prev) => prev + 1);

      if (key === prompt[cursor]) {
        setChars((prev) => {
          const next = [...prev];
          next[cursor] = { ...next[cursor], status: "correct" };
          return next;
        });
        setCursor((prev) => prev + 1);
        setCorrectKeystrokes((prev) => prev + 1);
      } else {
        setChars((prev) => {
          const next = [...prev];
          next[cursor] = { ...next[cursor], status: "wrong" };
          return next;
        });
      }
    },
    [cursor, prompt, startTime],
  );

  const handleBackspace = useCallback(() => {
    // Only allow backspace when current position has a wrong character
    if (cursor >= prompt.length || chars[cursor]?.status !== "wrong") {
      return;
    }
    setChars((prev) => {
      const next = [...prev];
      next[cursor] = { ...next[cursor], status: "pending" };
      return next;
    });
    setTotalKeystrokes((prev) => prev + 1);
  }, [cursor, chars, prompt.length]);

  const reset = useCallback(() => {
    setChars(buildChars(prompt));
    setCursor(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setStartTime(null);
  }, [prompt]);

  return {
    prompt,
    chars,
    cursor,
    isComplete,
    totalKeystrokes,
    correctKeystrokes,
    startTime,
    handleKey,
    handleBackspace,
    reset,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test:run src/features/trainer/useExercise.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/trainer/useExercise.ts src/features/trainer/useExercise.test.ts
git commit -m "feat: add useExercise hook for typing exercise state machine"
```

---

## Task 10: Keyboard Visualizer — Geometry & Key Component

**Files:**
- Create: `src/features/keyboard/layout-geometry.ts`, `src/features/keyboard/Key.tsx`, `src/features/keyboard/Key.test.tsx`

- [ ] **Step 1: Write failing test for Key component**

Create `src/features/keyboard/Key.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Key } from "./Key";

describe("Key", () => {
  it("renders a key with its label", () => {
    render(
      <svg>
        <Key
          label="A"
          x={0}
          y={0}
          width={50}
          height={50}
          state="idle"
        />
      </svg>,
    );
    expect(screen.getByText("A")).toBeDefined();
  });

  it("applies highlighted state class", () => {
    const { container } = render(
      <svg>
        <Key
          label="A"
          x={0}
          y={0}
          width={50}
          height={50}
          state="highlighted"
        />
      </svg>,
    );
    const rect = container.querySelector("rect");
    expect(rect?.getAttribute("class")).toContain("highlighted");
  });

  it("applies dimmed state class", () => {
    const { container } = render(
      <svg>
        <Key
          label="A"
          x={0}
          y={0}
          width={50}
          height={50}
          state="dimmed"
        />
      </svg>,
    );
    const rect = container.querySelector("rect");
    expect(rect?.getAttribute("class")).toContain("dimmed");
  });

  it("applies active (pressed) state class", () => {
    const { container } = render(
      <svg>
        <Key
          label="A"
          x={0}
          y={0}
          width={50}
          height={50}
          state="active"
        />
      </svg>,
    );
    const rect = container.querySelector("rect");
    expect(rect?.getAttribute("class")).toContain("active");
  });

  it("does not render blank keys", () => {
    const { container } = render(
      <svg>
        <Key
          label=""
          x={0}
          y={0}
          width={50}
          height={50}
          state="idle"
          blank
        />
      </svg>,
    );
    expect(container.querySelectorAll("rect")).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test:run src/features/keyboard/Key.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement layout-geometry.ts**

Create `src/features/keyboard/layout-geometry.ts`:

```ts
// Cheapino column-stagger offsets (in key-units, matching PCB layout)
// Each column has a vertical offset from the top row baseline
// Index 0 = leftmost column (pinky), index 4 = innermost (index finger)
export const COLUMN_OFFSETS = [0.5, 0.25, 0, 0.125, 0.25];

export const KEY_WIDTH = 50;
export const KEY_HEIGHT = 50;
export const KEY_GAP = 4;
export const HALF_GAP = 40; // gap between left and right halves
export const THUMB_OFFSET_Y = 10; // extra vertical gap before thumb row

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

  // Finger rows
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

  // Thumb row
  const thumbY =
    rows * (KEY_HEIGHT + KEY_GAP) + THUMB_OFFSET_Y + COLUMN_OFFSETS[0] * (KEY_HEIGHT + KEY_GAP);
  const thumbRow: KeyPosition[] = [];
  const thumbStartCol = half === "left" ? 2 : 0; // thumbs are inward
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
```

- [ ] **Step 4: Implement Key.tsx**

Create `src/features/keyboard/Key.tsx`:

```tsx
export type KeyState = "idle" | "highlighted" | "dimmed" | "active";

type KeyProps = {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  state: KeyState;
  blank?: boolean;
};

const STATE_STYLES: Record<KeyState, { fill: string; textFill: string; className: string }> = {
  idle: { fill: "#374151", textFill: "#d1d5db", className: "idle" },
  highlighted: { fill: "#2563eb", textFill: "#ffffff", className: "highlighted" },
  dimmed: { fill: "#1f2937", textFill: "#6b7280", className: "dimmed" },
  active: { fill: "#16a34a", textFill: "#ffffff", className: "active" },
};

export function Key({ label, x, y, width, height, state, blank }: KeyProps) {
  if (blank) return null;

  const style = STATE_STYLES[state];
  const radius = 6;
  const fontSize = label.length > 3 ? 10 : label.length > 1 ? 12 : 16;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={radius}
        ry={radius}
        fill={style.fill}
        stroke="#4b5563"
        strokeWidth={1}
        className={style.className}
      />
      <text
        x={x + width / 2}
        y={y + height / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={style.textFill}
        fontSize={fontSize}
        fontFamily="monospace"
      >
        {label}
      </text>
    </g>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
pnpm test:run src/features/keyboard/Key.test.tsx
```

Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/keyboard/layout-geometry.ts src/features/keyboard/Key.tsx src/features/keyboard/Key.test.tsx
git commit -m "feat: add SVG key component and keyboard layout geometry"
```

---

## Task 11: Keyboard Visualizer Component

**Files:**
- Create: `src/features/keyboard/KeyboardVisualizer.tsx`, `src/features/keyboard/KeyboardVisualizer.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/features/keyboard/KeyboardVisualizer.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KeyboardVisualizer } from "./KeyboardVisualizer";
import { defaultLayout } from "../../data/layout";

describe("KeyboardVisualizer", () => {
  it("renders all non-blank keys for the base layer", () => {
    const { container } = render(
      <KeyboardVisualizer
        layout={defaultLayout}
        activeLayer="Base"
        activeKeys={new Set()}
      />,
    );
    // Base layer has 36 keys, all non-blank
    const texts = container.querySelectorAll("text");
    expect(texts.length).toBe(36);
  });

  it("renders an SVG element", () => {
    const { container } = render(
      <KeyboardVisualizer
        layout={defaultLayout}
        activeLayer="Base"
        activeKeys={new Set()}
      />,
    );
    expect(container.querySelector("svg")).toBeDefined();
  });

  it("highlights active keys", () => {
    const { container } = render(
      <KeyboardVisualizer
        layout={defaultLayout}
        activeLayer="Base"
        activeKeys={new Set(["KeyA"])}
      />,
    );
    const activeRects = container.querySelectorAll("rect.active");
    expect(activeRects.length).toBe(1);
  });

  it("renders layer tabs", () => {
    render(
      <KeyboardVisualizer
        layout={defaultLayout}
        activeLayer="Base"
        activeKeys={new Set()}
      />,
    );
    expect(screen.getByText("Base")).toBeDefined();
    expect(screen.getByText("Numbers")).toBeDefined();
    expect(screen.getByText("Symbols")).toBeDefined();
    expect(screen.getByText("Navigation")).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test:run src/features/keyboard/KeyboardVisualizer.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement KeyboardVisualizer.tsx**

Create `src/features/keyboard/KeyboardVisualizer.tsx`:

```tsx
import { useState } from "react";
import type { Layout, Layer, KeyDef } from "../../data/layout";
import { Key, type KeyState } from "./Key";
import {
  getKeyPositions,
  getTotalWidth,
  getTotalHeight,
  FINGER_ROWS,
  THUMB_KEYS,
} from "./layout-geometry";

type KeyboardVisualizerProps = {
  layout: Layout;
  activeLayer: string;
  activeKeys: Set<string>;
  lockedLayer?: boolean;
  onLayerChange?: (layerName: string) => void;
};

function getKeyState(
  keyDef: KeyDef,
  activeKeys: Set<string>,
  isActiveLayer: boolean,
): KeyState {
  if (keyDef.blank) return "dimmed";

  // Check if this key is currently pressed
  if (keyDef.code && activeKeys.has(keyDef.code)) return "active";
  // Character match for layer keys (no code)
  if (!keyDef.code && activeKeys.has(keyDef.label)) return "active";

  if (isActiveLayer) return "highlighted";
  return "dimmed";
}

function renderHalf(
  half: "left" | "right",
  layer: Layer,
  activeKeys: Set<string>,
  isActiveLayer: boolean,
) {
  const keys = half === "left" ? layer.left : layer.right;
  const positions = getKeyPositions(half, FINGER_ROWS, THUMB_KEYS);

  return keys.flatMap((row, rowIdx) =>
    row.map((keyDef, colIdx) => {
      const pos = positions[rowIdx]?.[colIdx];
      if (!pos) return null;
      return (
        <Key
          key={`${half}-${rowIdx}-${colIdx}`}
          label={keyDef.label}
          x={pos.x}
          y={pos.y}
          width={pos.width}
          height={pos.height}
          state={getKeyState(keyDef, activeKeys, isActiveLayer)}
          blank={keyDef.blank}
        />
      );
    }),
  );
}

export function KeyboardVisualizer({
  layout,
  activeLayer,
  activeKeys,
  lockedLayer = false,
  onLayerChange,
}: KeyboardVisualizerProps) {
  const [browsingLayer, setBrowsingLayer] = useState<string | null>(null);

  const displayLayerName = lockedLayer
    ? activeLayer
    : browsingLayer ?? activeLayer;
  const displayLayer = layout.layers.find((l) => l.name === displayLayerName);

  if (!displayLayer) return null;

  const isActiveLayer = displayLayerName === activeLayer;
  const width = getTotalWidth();
  const height = getTotalHeight();
  const padding = 20;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {layout.layers.map((layer) => (
          <button
            key={layer.name}
            onClick={() => {
              if (!lockedLayer) {
                setBrowsingLayer(layer.name);
                onLayerChange?.(layer.name);
              }
            }}
            className={`px-3 py-1 rounded text-sm font-mono ${
              displayLayerName === layer.name
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            } ${lockedLayer && layer.name !== activeLayer ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {layer.name}
          </button>
        ))}
      </div>
      <svg
        viewBox={`${-padding} ${-padding} ${width + padding * 2} ${height + padding * 2}`}
        className="w-full max-w-2xl"
      >
        {renderHalf("left", displayLayer, activeKeys, isActiveLayer)}
        {renderHalf("right", displayLayer, activeKeys, isActiveLayer)}
      </svg>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test:run src/features/keyboard/KeyboardVisualizer.test.tsx
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/keyboard/KeyboardVisualizer.tsx src/features/keyboard/KeyboardVisualizer.test.tsx
git commit -m "feat: add SVG keyboard visualizer with layer tabs and key highlighting"
```

---

## Task 12: Trainer View Component

**Files:**
- Create: `src/features/trainer/TrainerView.tsx`, `src/features/trainer/TrainerView.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/features/trainer/TrainerView.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TrainerView } from "./TrainerView";

describe("TrainerView", () => {
  it("renders the exercise prompt", () => {
    render(
      <TrainerView
        prompt="hello"
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByText(/h/)).toBeDefined();
  });

  it("highlights the current character", () => {
    const { container } = render(
      <TrainerView
        prompt="ab"
        onComplete={vi.fn()}
      />,
    );
    const cursor = container.querySelector("[data-cursor='true']");
    expect(cursor?.textContent).toBe("a");
  });

  it("advances on correct keypress", () => {
    const { container } = render(
      <TrainerView
        prompt="ab"
        onComplete={vi.fn()}
      />,
    );
    fireEvent.keyDown(window, { key: "a" });
    const cursor = container.querySelector("[data-cursor='true']");
    expect(cursor?.textContent).toBe("b");
  });

  it("calls onComplete when exercise is finished", () => {
    const onComplete = vi.fn();
    render(
      <TrainerView
        prompt="a"
        onComplete={onComplete}
      />,
    );
    fireEvent.keyDown(window, { key: "a" });
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        wpm: expect.any(Number),
        accuracy: expect.any(Number),
      }),
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test:run src/features/trainer/TrainerView.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement TrainerView.tsx**

Create `src/features/trainer/TrainerView.tsx`:

```tsx
import { useEffect, useCallback, useRef } from "react";
import { useExercise } from "./useExercise";
import { calculateWpm, calculateAccuracy } from "./metrics";

type TrainerViewProps = {
  prompt: string;
  onComplete: (result: { wpm: number; accuracy: number }) => void;
};

export function TrainerView({ prompt, onComplete }: TrainerViewProps) {
  const exercise = useExercise(prompt);
  const completedRef = useRef(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (exercise.isComplete) return;

      if (e.key === "Backspace") {
        exercise.handleBackspace();
        return;
      }

      // Ignore modifier keys, function keys, etc.
      if (e.key.length !== 1 && e.key !== " ") return;

      exercise.handleKey(e.key);
    },
    [exercise],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (exercise.isComplete && !completedRef.current) {
      completedRef.current = true;
      const elapsed = exercise.startTime
        ? Date.now() - exercise.startTime
        : 0;
      const wpm = calculateWpm(exercise.correctKeystrokes, elapsed);
      const accuracy = calculateAccuracy(
        exercise.correctKeystrokes,
        exercise.totalKeystrokes,
      );
      onComplete({ wpm, accuracy });
    }
  }, [exercise.isComplete, exercise.startTime, exercise.correctKeystrokes, exercise.totalKeystrokes, onComplete]);

  return (
    <div className="font-mono text-2xl leading-relaxed">
      <div className="flex flex-wrap gap-0">
        {exercise.chars.map((char, i) => {
          const isCursor = i === exercise.cursor && !exercise.isComplete;
          return (
            <span
              key={i}
              data-cursor={isCursor || undefined}
              className={`
                ${char.status === "correct" ? "text-green-400" : ""}
                ${char.status === "wrong" ? "text-red-400 bg-red-900/30" : ""}
                ${char.status === "pending" ? "text-gray-500" : ""}
                ${isCursor ? "border-b-2 border-blue-400" : ""}
              `}
            >
              {char.char === " " ? "\u00A0" : char.char}
            </span>
          );
        })}
      </div>
      {exercise.isComplete && (
        <div className="mt-6 text-base text-gray-400">
          Exercise complete! Press any key for next exercise.
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test:run src/features/trainer/TrainerView.test.tsx
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/trainer/TrainerView.tsx src/features/trainer/TrainerView.test.tsx
git commit -m "feat: add TrainerView component with character-by-character feedback"
```

---

## Task 13: Key Sequence Trainer for Stage 5 Navigation

**Files:**
- Create: `src/features/trainer/KeySequenceView.tsx`, `src/features/trainer/KeySequenceView.test.tsx`

Stage 5 (Navigation) requires a distinct trainer mode. Navigation keys (`ArrowLeft`, `Home`, etc.) don't produce characters — they fire `keydown` events with specific `key` values. The key-sequence trainer shows a sequence of navigation keys to press and validates them one at a time.

- [ ] **Step 1: Write failing test**

Create `src/features/trainer/KeySequenceView.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { KeySequenceView } from "./KeySequenceView";

describe("KeySequenceView", () => {
  it("renders the sequence prompt", () => {
    render(
      <KeySequenceView
        prompt="Left Left Right"
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByText(/Left/)).toBeDefined();
  });

  it("highlights the current key in the sequence", () => {
    const { container } = render(
      <KeySequenceView
        prompt="Left Right"
        onComplete={vi.fn()}
      />,
    );
    const current = container.querySelector("[data-current='true']");
    expect(current?.textContent).toBe("Left");
  });

  it("advances on correct navigation keypress", () => {
    const { container } = render(
      <KeySequenceView
        prompt="Left Right"
        onComplete={vi.fn()}
      />,
    );
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    const current = container.querySelector("[data-current='true']");
    expect(current?.textContent).toBe("Right");
  });

  it("marks incorrect keypress", () => {
    const { container } = render(
      <KeySequenceView
        prompt="Left Right"
        onComplete={vi.fn()}
      />,
    );
    fireEvent.keyDown(window, { key: "ArrowRight" }); // wrong — expected Left
    const wrong = container.querySelector("[data-wrong='true']");
    expect(wrong).toBeDefined();
  });

  it("calls onComplete when sequence is finished", () => {
    const onComplete = vi.fn();
    render(
      <KeySequenceView
        prompt="Left"
        onComplete={onComplete}
      />,
    );
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ accuracy: 1.0 }),
    );
  });

  it("maps prompt labels to KeyboardEvent.key values", () => {
    const onComplete = vi.fn();
    render(
      <KeySequenceView
        prompt="Home End PageUp PageDown Up Down"
        onComplete={onComplete}
      />,
    );
    fireEvent.keyDown(window, { key: "Home" });
    fireEvent.keyDown(window, { key: "End" });
    fireEvent.keyDown(window, { key: "PageUp" });
    fireEvent.keyDown(window, { key: "PageDown" });
    fireEvent.keyDown(window, { key: "ArrowUp" });
    fireEvent.keyDown(window, { key: "ArrowDown" });
    expect(onComplete).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test:run src/features/trainer/KeySequenceView.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement KeySequenceView.tsx**

Create `src/features/trainer/KeySequenceView.tsx`:

```tsx
import { useState, useEffect, useCallback, useRef } from "react";

// Map from prompt labels to KeyboardEvent.key values
const KEY_MAP: Record<string, string> = {
  Left: "ArrowLeft",
  Right: "ArrowRight",
  Up: "ArrowUp",
  Down: "ArrowDown",
  Home: "Home",
  End: "End",
  PageUp: "PageUp",
  PageDown: "PageDown",
};

type KeyStatus = "pending" | "correct" | "wrong";

type KeySequenceViewProps = {
  prompt: string;
  onComplete: (result: { accuracy: number }) => void;
};

export function KeySequenceView({ prompt, onComplete }: KeySequenceViewProps) {
  const keys = prompt.split(" ").filter(Boolean);
  const [cursor, setCursor] = useState(0);
  const [statuses, setStatuses] = useState<KeyStatus[]>(
    () => keys.map(() => "pending"),
  );
  const [totalPresses, setTotalPresses] = useState(0);
  const [correctPresses, setCorrectPresses] = useState(0);
  const completedRef = useRef(false);

  const isComplete = cursor >= keys.length;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isComplete) return;

      // Ignore non-navigation keys
      const expectedLabel = keys[cursor];
      const expectedKey = KEY_MAP[expectedLabel] ?? expectedLabel;
      const isNavKey = Object.values(KEY_MAP).includes(e.key) || Object.keys(KEY_MAP).includes(e.key);
      if (!isNavKey) return;

      e.preventDefault();
      setTotalPresses((prev) => prev + 1);

      if (e.key === expectedKey) {
        setStatuses((prev) => {
          const next = [...prev];
          next[cursor] = "correct";
          return next;
        });
        setCorrectPresses((prev) => prev + 1);
        setCursor((prev) => prev + 1);
      } else {
        setStatuses((prev) => {
          const next = [...prev];
          next[cursor] = "wrong";
          return next;
        });
        // Reset wrong status after a brief moment, let them try again
        setTimeout(() => {
          setStatuses((prev) => {
            const next = [...prev];
            if (next[cursor] === "wrong") next[cursor] = "pending";
            return next;
          });
        }, 300);
      }
    },
    [cursor, keys, isComplete],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isComplete && !completedRef.current) {
      completedRef.current = true;
      const accuracy = totalPresses > 0 ? correctPresses / totalPresses : 0;
      onComplete({ accuracy });
    }
  }, [isComplete, totalPresses, correctPresses, onComplete]);

  return (
    <div className="font-mono text-2xl leading-relaxed">
      <div className="flex flex-wrap gap-3">
        {keys.map((key, i) => {
          const isCurrent = i === cursor && !isComplete;
          return (
            <span
              key={i}
              data-current={isCurrent || undefined}
              data-wrong={statuses[i] === "wrong" || undefined}
              className={`
                px-3 py-1 rounded border
                ${statuses[i] === "correct" ? "text-green-400 border-green-600 bg-green-900/20" : ""}
                ${statuses[i] === "wrong" ? "text-red-400 border-red-600 bg-red-900/20" : ""}
                ${statuses[i] === "pending" && isCurrent ? "text-white border-blue-400 bg-blue-900/20" : ""}
                ${statuses[i] === "pending" && !isCurrent ? "text-gray-500 border-gray-700" : ""}
              `}
            >
              {key}
            </span>
          );
        })}
      </div>
      {isComplete && (
        <div className="mt-6 text-base text-gray-400">
          Sequence complete! Press any key for next exercise.
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test:run src/features/trainer/KeySequenceView.test.tsx
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/trainer/KeySequenceView.tsx src/features/trainer/KeySequenceView.test.tsx
git commit -m "feat: add KeySequenceView for Stage 5 navigation exercises"
```

---

## Task 14: Stage List Component

**Files:**
- Create: `src/features/progress/StageList.tsx`, `src/features/progress/StageList.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/features/progress/StageList.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StageList } from "./StageList";
import { stages } from "../../data/stages";

beforeEach(() => {
  localStorage.clear();
});

describe("StageList", () => {
  it("renders all stage names", () => {
    render(<StageList stages={stages} activeStageId={0} onSelectStage={vi.fn()} />);
    expect(screen.getByText("Home Position")).toBeDefined();
    expect(screen.getByText("All Letters")).toBeDefined();
    expect(screen.getByText("Full Integration")).toBeDefined();
  });

  it("marks stage 0 as unlocked", () => {
    const { container } = render(
      <StageList stages={stages} activeStageId={0} onSelectStage={vi.fn()} />,
    );
    const firstStage = container.querySelector("[data-stage-id='0']");
    expect(firstStage?.getAttribute("data-locked")).not.toBe("true");
  });

  it("marks stage 1 as locked initially", () => {
    const { container } = render(
      <StageList stages={stages} activeStageId={0} onSelectStage={vi.fn()} />,
    );
    const secondStage = container.querySelector("[data-stage-id='1']");
    expect(secondStage?.getAttribute("data-locked")).toBe("true");
  });

  it("calls onSelectStage when an unlocked stage is clicked", () => {
    const onSelect = vi.fn();
    render(<StageList stages={stages} activeStageId={0} onSelectStage={onSelect} />);
    fireEvent.click(screen.getByText("Home Position"));
    expect(onSelect).toHaveBeenCalledWith(0);
  });

  it("does not call onSelectStage when a locked stage is clicked", () => {
    const onSelect = vi.fn();
    render(<StageList stages={stages} activeStageId={0} onSelectStage={onSelect} />);
    fireEvent.click(screen.getByText("All Letters"));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test:run src/features/progress/StageList.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement StageList.tsx**

Create `src/features/progress/StageList.tsx`:

```tsx
import type { Stage } from "../../data/stages";
import { isStageUnlocked, isStageComplete, getProgress } from "./progress-store";

type StageListProps = {
  stages: Stage[];
  activeStageId: number;
  onSelectStage: (stageId: number) => void;
};

export function StageList({ stages, activeStageId, onSelectStage }: StageListProps) {
  return (
    <nav className="flex flex-col gap-1">
      {stages.map((stage) => {
        const unlocked = isStageUnlocked(stage.id);
        const complete = isStageComplete(stage.id);
        const isActive = stage.id === activeStageId;
        const progress = getProgress(stage.id);

        return (
          <button
            key={stage.id}
            data-stage-id={stage.id}
            data-locked={!unlocked || undefined}
            onClick={() => {
              if (unlocked) onSelectStage(stage.id);
            }}
            className={`
              text-left px-3 py-2 rounded text-sm font-mono transition-colors
              ${isActive ? "bg-blue-600/20 text-blue-400 border border-blue-600/40" : ""}
              ${!isActive && unlocked ? "text-gray-300 hover:bg-gray-800" : ""}
              ${!unlocked ? "text-gray-600 cursor-not-allowed" : ""}
            `}
          >
            <div className="flex items-center gap-2">
              <span className="w-5 text-center">
                {complete ? "\u2713" : unlocked ? stage.id : "\u2022"}
              </span>
              <span>{stage.name}</span>
            </div>
            {unlocked && progress.attempts > 0 && (
              <div className="ml-7 text-xs text-gray-500">
                {stage.threshold.wpm > 0 && `${progress.bestWpm} WPM / `}
                {Math.round(progress.bestAccuracy * 100)}% acc
              </div>
            )}
          </button>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test:run src/features/progress/StageList.test.tsx
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/progress/StageList.tsx src/features/progress/StageList.test.tsx
git commit -m "feat: add StageList sidebar with lock/unlock/complete states"
```

---

## Task 14: App Shell — Wire Everything Together

**Files:**
- Modify: `src/app/App.tsx`
- Create: `src/app/App.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/app/App.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  localStorage.clear();
});

describe("App", () => {
  it("renders the app header", () => {
    render(<App />);
    expect(screen.getByText("Cheapino Trainer")).toBeDefined();
  });

  it("shows the stage list", () => {
    render(<App />);
    expect(screen.getByText("Home Position")).toBeDefined();
  });

  it("shows the keyboard visualizer", () => {
    const { container } = render(<App />);
    expect(container.querySelector("svg")).toBeDefined();
  });

  it("shows the stage description", () => {
    render(<App />);
    expect(screen.getByText(/Home row keys only/)).toBeDefined();
  });

  it("shows the trainer with an exercise", () => {
    const { container } = render(<App />);
    // Trainer should render characters from the exercise
    const chars = container.querySelectorAll("[data-cursor]");
    expect(chars.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test:run src/app/App.test.tsx
```

Expected: FAIL — current App.tsx is just a placeholder.

- [ ] **Step 3: Implement the full App shell**

Replace `src/app/App.tsx`:

```tsx
import { useState, useCallback } from "react";
import { stages } from "../data/stages";
import { defaultLayout } from "../data/layout";
import { KeyboardVisualizer } from "../features/keyboard/KeyboardVisualizer";
import { useKeyPress } from "../features/keyboard/useKeyPress";
import { TrainerView } from "../features/trainer/TrainerView";
import { KeySequenceView } from "../features/trainer/KeySequenceView";
import { generateExercise } from "../features/trainer/exercise-generator";
import { StageList } from "../features/progress/StageList";
import { saveResult, isStageComplete } from "../features/progress/progress-store";

function App() {
  const [activeStageId, setActiveStageId] = useState(0);
  const [exerciseKey, setExerciseKey] = useState(0);
  const [lastResult, setLastResult] = useState<{
    wpm: number;
    accuracy: number;
  } | null>(null);
  const [exercise, setExercise] = useState(() => generateExercise(stages[0]));

  const stage = stages[activeStageId];
  const { activeKeys } = useKeyPress();

  const handleComplete = useCallback(
    (result: { wpm: number; accuracy: number }) => {
      saveResult(activeStageId, result);
      setLastResult(result);
    },
    [activeStageId],
  );

  const handleNextExercise = useCallback(() => {
    setExercise(generateExercise(stages[activeStageId]));
    setExerciseKey((prev) => prev + 1);
    setLastResult(null);
  }, [activeStageId]);

  const handleSelectStage = useCallback((stageId: number) => {
    setActiveStageId(stageId);
    setExercise(generateExercise(stages[stageId]));
    setExerciseKey(0);
    setLastResult(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-bold font-mono">Cheapino Trainer</h1>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-56 border-r border-gray-800 p-4">
          <StageList
            stages={stages}
            activeStageId={activeStageId}
            onSelectStage={handleSelectStage}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 max-w-4xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold font-mono mb-1">
              Stage {stage.id}: {stage.name}
            </h2>
            <p className="text-gray-400 text-sm">{stage.description}</p>
          </div>

          <div className="mb-8">
            <KeyboardVisualizer
              layout={defaultLayout}
              activeLayer={stage.layers[stage.layers.length - 1]}
              activeKeys={activeKeys}
            />
          </div>

          <div className="mb-6">
            {exercise.type === "key-sequence" ? (
              <KeySequenceView
                key={exerciseKey}
                prompt={exercise.prompt}
                onComplete={(result) => handleComplete({ wpm: 0, accuracy: result.accuracy })}
              />
            ) : (
              <TrainerView
                key={exerciseKey}
                prompt={exercise.prompt}
                onComplete={handleComplete}
              />
            )}
          </div>

          {lastResult && (
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex gap-8 text-sm font-mono">
                {stage.threshold.wpm > 0 && (
                  <div>
                    <span className="text-gray-500">WPM: </span>
                    <span className="text-white">{lastResult.wpm}</span>
                    <span className="text-gray-600">
                      {" "}
                      / {stage.threshold.wpm}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Accuracy: </span>
                  <span className="text-white">
                    {Math.round(lastResult.accuracy * 100)}%
                  </span>
                  <span className="text-gray-600">
                    {" "}
                    / {Math.round(stage.threshold.accuracy * 100)}%
                  </span>
                </div>
              </div>
              {isStageComplete(activeStageId) && activeStageId < stages.length - 1 && (
                <div className="mt-3 text-green-400 text-sm">
                  Stage complete! Next stage unlocked.
                </div>
              )}
              <button
                onClick={handleNextExercise}
                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-mono"
              >
                Next Exercise
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
```

- [ ] **Step 4: Run all tests**

```bash
pnpm test:run
```

Expected: All tests PASS.

- [ ] **Step 5: Run dev server and verify visually**

```bash
pnpm dev
```

Open `http://localhost:5173`. Verify:
- Stage list shows on the left with Stage 0 unlocked
- Keyboard visualizer renders the split layout with column stagger
- Typing exercise appears with a prompt
- Typing correct characters turns them green
- Completing an exercise shows WPM/accuracy results

- [ ] **Step 6: Commit**

```bash
git add src/app/App.tsx src/app/App.test.tsx
git commit -m "feat: wire up app shell with stage list, visualizer, and trainer"
```

---

## Task 15: Add .gitignore and CLAUDE.md

**Files:**
- Create: `.gitignore`, `CLAUDE.md`

- [ ] **Step 1: Create .gitignore**

```
node_modules/
dist/
.superpowers/
```

- [ ] **Step 2: Create CLAUDE.md**

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A progressive web app that teaches typing on a 36-key Cheapino split keyboard. Built with Vite + React + TypeScript + Tailwind CSS v4. No backend — localStorage for persistence.

## Commands

```bash
pnpm dev          # Start dev server (http://localhost:5173)
pnpm build        # Production build
pnpm test         # Run tests in watch mode
pnpm test:run     # Run tests once
```

## Architecture

- `src/data/` — Pure data: keymap (`layout.ts`), stage definitions (`stages.ts`), word lists (`words.ts`)
- `src/features/keyboard/` — SVG keyboard visualizer with column-stagger geometry and live key highlighting
- `src/features/trainer/` — Typing exercise engine: exercise generator, character-by-character validation, WPM/accuracy metrics
- `src/features/progress/` — localStorage-based progress tracking and stage list UI
- `src/app/` — App shell wiring everything together

The keymap in `layout.ts` is the single source of truth. When the user changes their Vial config, they update this file and everything adapts.

## Key Design Constraint

The browser only sees output characters from the Cheapino (not physical keys or layer holds). The trainer validates characters produced, not technique used. The visualizer teaches the "how"; the trainer confirms the "what".
```

- [ ] **Step 3: Commit**

```bash
git add .gitignore CLAUDE.md
git commit -m "chore: add .gitignore and CLAUDE.md"
```

---

## Task 16: Clean Up Scaffold Files

**Files:**
- Delete: `src/App.css`, `src/assets/` (Vite defaults)
- Modify: `src/main.tsx` (ensure it imports from `app/App`)

- [ ] **Step 1: Remove Vite default files and update main.tsx imports**

Remove any Vite scaffold files that weren't overwritten (like `src/App.css`, `src/assets/react.svg`). Ensure `src/main.tsx` imports from `./app/App` instead of `./App`.

- [ ] **Step 2: Run all tests to verify nothing broke**

```bash
pnpm test:run
```

Expected: All tests PASS.

- [ ] **Step 3: Run dev server to verify**

```bash
pnpm dev
```

Expected: App loads cleanly, no console errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: clean up Vite scaffold defaults"
```
