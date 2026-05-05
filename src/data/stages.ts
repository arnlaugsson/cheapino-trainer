import type { Layout } from "./layout";
import type { LayoutPreset, LayerRole } from "./layouts";

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
  role?: LayerRole;
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
    description: "Hold Space to activate the Numbers layer. Practice typing digits, dates, and addresses.",
    layers: ["Base", "Numbers"],
    role: "numbers",
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
    description: "Hold Tab to activate the Symbols layer. Practice code-like snippets with brackets, operators, and special characters.",
    layers: ["Base", "Symbols"],
    role: "symbols",
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
    description: "Hold Enter to activate the Navigation layer. Practice moving through text with arrow keys, Home, End, Page Up, and Page Down.",
    layers: ["Base", "Navigation"],
    role: "navigation",
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
  {
    id: 7,
    name: "Function Keys",
    description: "Hold Bksp to activate the Function layer. Practice F1-F12. Media and brightness keys live on the home row but are usually intercepted by the OS.",
    layers: ["Base", "Function"],
    role: "function",
    exerciseTypes: ["key-sequence"],
    threshold: { wpm: 0, accuracy: 0.9 },
    exercises: {
      "key-sequence": [
        "F1 F2 F3 F4 F5",
        "F6 F7 F8 F9 F10",
        "F11 F12 F11 F12",
        "F1 F2 F3 F4 F5 F6 F7 F8 F9 F10",
        "F5 F6 F7 F8 F9",
      ],
    },
  },
];

function getRightPinkyHomeKey(layout: Layout): string {
  const homeRow = layout.layers[0]?.right?.[1];
  return homeRow?.[4]?.label ?? ";";
}

function resolveStage0(stage: Stage, layout: Layout): Stage {
  const pinky = getRightPinkyHomeKey(layout);
  if (pinky === ";") return stage;

  const singleKeys = stage.exercises?.["single-keys"]?.map((s) =>
    s.replaceAll(";", pinky),
  );

  return {
    ...stage,
    description: stage.description.replaceAll(";", pinky),
    exercises: {
      ...stage.exercises,
      ...(singleKeys ? { "single-keys": singleKeys } : {}),
    },
  };
}

const ACTIVATOR_SENTENCE = /^Hold [^.]+\. /;

function resolveRoleStage(stage: Stage, preset: LayoutPreset): Stage {
  if (!stage.role) return stage;

  const layerName = preset.roleToLayer[stage.role];
  const layer = preset.layout.layers.find((l) => l.name === layerName);
  if (!layer) return stage;

  const activator = layer.activator
    ? layer.activator.charAt(0).toUpperCase() + layer.activator.slice(1)
    : `activate ${layer.name}`;
  const newPrefix = `${activator} to activate the ${layer.name} layer. `;
  const body = stage.description.replace(ACTIVATOR_SENTENCE, "");

  return {
    ...stage,
    description: newPrefix + body,
    layers: ["Base", layer.name],
  };
}

function resolveFullIntegrationStage(stage: Stage, preset: LayoutPreset): Stage {
  if (stage.id !== 6) return stage;

  const uniqueLayers = Array.from(new Set(Object.values(preset.roleToLayer)));
  return {
    ...stage,
    layers: ["Base", ...uniqueLayers],
  };
}

export function getStagesForLayout(preset: LayoutPreset): Stage[] {
  return stages
    .filter((stage) => !stage.role || preset.roleToLayer[stage.role] !== undefined)
    .map((stage) => {
      if (stage.id === 0) return resolveStage0(stage, preset.layout);
      if (stage.id === 6) return resolveFullIntegrationStage(stage, preset);
      return resolveRoleStage(stage, preset);
    });
}
