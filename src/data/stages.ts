import type { Layout } from "./layout";

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
    description: "Home row keys only — A S D F G and H J K L ;. Get comfortable with the split layout and find your resting finger position.",
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
    description: "Full QWERTY alphabet on the base layer. Practice common words until the split column-stagger feels natural.",
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
    description: "Introduce Shift via home-row mods. Practice capital letters and CamelCase patterns.",
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
    description: "Hold Space to activate the number layer. Practice typing digits, dates, and addresses.",
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
    description: "Hold Tab to activate the symbol layer. Practice code-like snippets with brackets, operators, and special characters.",
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
    description: "Hold Enter to activate the navigation layer. Practice moving through text with arrow keys, Home, End, Page Up, and Page Down.",
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
    description: "Mixed exercises combining all layers — prose, code, and terminal commands. Graduation stage.",
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

function getRightPinkyHomeKey(layout: Layout): string {
  const homeRow = layout.layers[0]?.right?.[1];
  return homeRow?.[4]?.label ?? ";";
}

export function getStagesForLayout(layout: Layout): Stage[] {
  const pinky = getRightPinkyHomeKey(layout);
  if (pinky === ";") return stages;

  const stage0 = stages[0];
  const singleKeys = stage0.exercises?.["single-keys"]?.map((s) =>
    s.replaceAll(";", pinky),
  );

  const updatedStage0: Stage = {
    ...stage0,
    description: stage0.description.replaceAll(";", pinky),
    exercises: {
      ...stage0.exercises,
      ...(singleKeys ? { "single-keys": singleKeys } : {}),
    },
  };

  return [updatedStage0, ...stages.slice(1)];
}
