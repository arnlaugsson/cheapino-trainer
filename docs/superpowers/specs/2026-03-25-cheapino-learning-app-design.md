# Cheapino Learning App — Design Spec

A progressive web app that teaches you to use a 36-key Cheapino split keyboard through staged exercises, an interactive layout visualizer, and a built-in typing trainer.

## Problem

The Cheapino is a 36-key split ergonomic keyboard with no number row, no F-keys, and no dedicated arrows. Everything beyond letters lives on layers activated by thumb keys. For someone coming from a standard keyboard, this is a steep learning curve: split layout, column-stagger, layers, thumb keys, and home-row mods — all at once. Existing tools (monkeytype, keybr) don't understand layers or teach you progressively.

## Solution

A local-only web app that breaks the learning curve into 7 stages. Each stage introduces one concept, provides targeted typing exercises, and unlocks the next stage when you hit a speed/accuracy threshold. An interactive keyboard visualizer shows your exact layout so you can build the mental map between finger movement and key position.

## Key Design Constraint: Character-Level Validation Only

The browser's Keyboard API only sees the **output characters** from the Cheapino, not which physical keys were pressed or whether a layer key was held. The QMK/Vial firmware handles all layer switching and home-row mod logic on the keyboard itself — the browser just receives the final character (e.g., `1`, `(`, `A`).

This means the trainer **validates what you typed, not how you typed it.** The visualizer shows the correct technique (which layer to activate, which key to press), and the trainer confirms you produced the right character. This is sufficient for learning because:
- If you produce the right character, you used the right layer (there's only one way to type `1` on a 36-key board)
- The visualizer teaches the "how"; the trainer confirms the "what"
- Home-row mods produce standard modifier events (`Shift`, `Ctrl`) that the browser can detect via `KeyboardEvent.shiftKey`, `.ctrlKey`, etc.

For live key feedback on the visualizer: since the Cheapino maps to standard USB keycodes, we use `KeyboardEvent.code` (physical key position) for the base layer and `KeyboardEvent.key` (produced character) for layer keys. This gives a best-effort highlight — accurate for the base layer, character-matched for other layers.

## Tech Stack

- **Vite + React + TypeScript** — fast dev, type safety
- **Tailwind CSS v4** — rapid styling
- **localStorage** — progress persistence, no backend

No accounts, no server, no database. Run `pnpm dev` and open the browser.

## Project Structure

```
src/
  app/              # App shell, routing, layout
  features/
    keyboard/       # Keyboard visualizer component (SVG-based)
    trainer/        # Typing exercise engine + exercise UI
    progress/       # Progress tracking (localStorage read/write)
  data/
    layout.ts       # Cheapino keymap (layers, keys, positions)
    stages.ts       # Stage curriculum: metadata, exercise sets, thresholds
    words.ts        # Curated word lists per stage
```

### Single Source of Truth

The keymap is defined as data in `src/data/layout.ts`. The visualizer, trainer, and stages all read from this one file. When the user changes their Vial config, they update this file to match. Everything else adapts automatically.

```ts
type KeyDef = {
  label: string        // display label ("Q", "1", "Ctrl", etc.)
  code?: string        // KeyboardEvent.code for base layer keys ("KeyQ")
  blank?: boolean      // true if position is intentionally empty on this layer
}

type Layer = {
  name: string
  activator?: string   // how to activate ("hold Space", "hold Tab", etc.)
  left: KeyDef[][]     // left half: 3 rows of 5 keys + 1 row of 3 thumb keys
  right: KeyDef[][]    // right half: same structure
}

type Layout = {
  layers: Layer[]
}
```

The Cheapino has 18 keys per half: 3 rows of 5 columns + 3 thumb keys. Each half is represented as 4 rows (3 finger rows + 1 thumb row). Empty positions on non-base layers are marked with `blank: true`.

## Stage Curriculum

Each stage introduces one new concept. A stage is "complete" when the user hits the threshold (default: 20 WPM at 90% accuracy — defined as constants in code, not user-configurable in v1). Completing a stage unlocks the next. Users can always revisit earlier stages.

### Stage 0 — Home Position
Home row keys only (A S D F G / H J K L ;). Get comfortable with the split layout and find the resting finger position. Short stage — mostly about physical comfort. Uses a curated list of short words typeable with home-row keys only (e.g., "ash", "lad", "flash", "glass", "shall").

### Stage 1 — All Letters
Full QWERTY alphabet on the base layer. Practice common words. This is the longest stage — building comfort with the split column-stagger. Uses a standard English word frequency list.

### Stage 2 — Thumb Keys & Modifiers
Introduce Shift via home-row mods and thumb key modifiers. Practice capital letters and basic shortcuts. The trainer validates modifier usage by checking `KeyboardEvent.shiftKey` (for capitals) and the produced character. Exercises focus on capitalized words and CamelCase patterns.

### Stage 3 — Number Layer
Hold Space to access 0-9. Practice typing numbers, dates, addresses. The trainer validates the output character — if the user types `5`, they used the number layer correctly.

### Stage 4 — Symbol Layer
Hold Tab to access `(){}[]<>=+-_!@#$%^&*`. Practice code-like snippets. Critical for developers.

### Stage 5 — Navigation Layer
Hold Enter to access arrow keys, Home/End, Page Up/Down. Navigation keys don't produce typeable characters, but they do fire `KeyboardEvent` with detectable `key` values like `"ArrowLeft"`, `"Home"`, etc.

Exercises show a sequence of navigation keys to press (e.g., "Press: Down Down Right Right Home"). The trainer listens for `keydown` events and matches the `key` value against the expected sequence. Correct keys advance the sequence; wrong keys are flagged. WPM is not tracked for this stage — completion is based on accuracy only (90% across a set of exercises). The visualizer highlights the expected key on the navigation layer.

### Stage 6 — Full Integration
Mixed exercises combining all layers. Real-world typing: prose, code, terminal commands. Graduation stage.

Note: Function/media keys (F1-F12, volume, etc.) are viewable in the visualizer's layer browser but don't get a dedicated stage — they're rarely needed and hard to create meaningful exercises for.

### Per-Stage Data Structure

Each stage is defined in `stages.ts`:

```ts
type ExerciseType =
  | "single-keys"    // repeated key drills: "f j f j d k"
  | "words"          // words from the curated word list for this stage
  | "phrases"        // short sentences for flow
  | "code-snippets"  // code-like text: "const x = [1, 2];"
  | "mixed"          // real-world text combining all layers
  | "key-sequence"   // navigation key sequences (Stage 5 only)

type Stage = {
  id: number
  name: string
  description: string         // brief explanation of the new concept
  layers: string[]            // which layers are active ("Base", "Numbers", etc.)
  exerciseTypes: ExerciseType[]
  threshold: { wpm: number, accuracy: number }  // accuracy-only stages set wpm to 0
}
```

**Content sources:**
- `words.ts` provides curated word lists: a hand-picked home-row list for Stage 0, frequency-ranked English words for Stage 1+, and per-stage filtered subsets for Stages 3-4 (words containing numbers/symbols)
- `stages.ts` contains inline exercise strings for `code-snippets`, `phrases`, `key-sequence`, and `single-keys` types
- `words` and `mixed` types pull from `words.ts` at runtime

## Keyboard Visualizer

An **SVG-based** interactive diagram of the Cheapino, rendered on every stage. SVG is chosen over HTML because it allows precise positioning of keys with the physical column-stagger offsets and makes per-key styling (highlight, dim, animate) straightforward.

### Features
- **Physical column-stagger** — columns offset vertically to match real key positions, not a flat grid
- **Split rendering** — two halves with a gap, matching the physical keyboard
- **Active layer highlighting** — current stage's layer keys are prominent; other keys are dimmed
- **Best-effort live key feedback** — during exercises, keys highlight based on `KeyboardEvent.code` (base layer) or character matching (other layers)
- **Layer tabs** — a separate reference mode to browse all layers outside of exercises; during exercises, the visualizer locks to the stage's active layer

## Typing Trainer Engine

### Exercise Flow
1. A prompt line of text appears at the top
2. User types it on their Cheapino
3. Correct characters turn green, mistakes turn red
4. **On a mistake:** the cursor stays in place — user must press Backspace to correct before continuing (reinforces correct technique over rushing)
5. After the exercise: show WPM and accuracy

**Metrics:**
- **WPM** = (characters typed / 5) / minutes elapsed. Standard 5-character "word" unit. For modifier stages (Stage 2), the produced character counts (e.g., `A` = 1 character regardless of Shift being held). Stage 5 (navigation) does not track WPM.
- **Accuracy** = correct keystrokes / total keystrokes including corrections

### Exercise Types (by stage)
- **Single keys** — "f j f j d k d k" (early stages, muscle memory)
- **Words** — from curated per-stage word lists in `words.ts` (for Stage 0, a hand-picked list of home-row-only words; for later stages, frequency-ranked English words filtered to available keys)
- **Phrases** — short sentences for flow
- **Code snippets** — `const x = [1, 2, 3];` (later stages with symbols/numbers)
- **Mixed** — real-world text combining all learned layers (final stage)

### Progression Logic
- Track best WPM and accuracy per stage in localStorage
- Stage complete at threshold (default: 20 WPM / 90% accuracy)
- Completing a stage unlocks the next
- No time pressure — exercises repeat until the user moves on

### Explicitly Out of Scope
- No gamification (XP, streaks, leaderboards)
- No algorithmic difficulty scaling
- No audio feedback
- No settings UI in v1 (thresholds are code constants)

## Default Keymap

Ships with a standard QWERTY layout for 36 keys. This is a starting point — users configure their actual layout in Vial, then update `layout.ts` to match.

### Base Layer
```
Q  W  E  R  T          Y  U  I  O  P
A  S  D  F  G          H  J  K  L  ;
Z  X  C  V  B          N  M  ,  .  /
         ESC SPC TAB   ENT BSPC DEL
```

### Layer Activation (thumb key hold)
- Hold Space → Number layer
- Hold Tab → Symbol layer
- Hold Enter → Navigation layer

### Home-Row Mods (hold letter for modifier)
- Left hand: A=Ctrl, S=Alt, D=GUI, F=Shift
- Right hand: J=Shift, K=GUI, L=Alt, ;=Ctrl

### Number Layer (hold Space)
```
 _   _   _   _   _           _   _   _   _   _
 1   2   3   4   5           6   7   8   9   0
 _   _   _   _   _           _   -   =   .   _
           _  [*] _           _   _   _
```
(`_` = blank/transparent, `[*]` = layer hold key)

### Symbol Layer (hold Tab)
```
 !   @   #   $   %           ^   &   *   (   )
 `   ~   {   }   |           \   [   ]   +   _
 _   _   _   _   _           _   <   >   _   _
           _   _ [*]         _   _   _
```

Each character appears on exactly one layer. This ensures the trainer's "one way to type each character" invariant holds — if the user produces the right character, they used the right layer.

### Navigation Layer (hold Enter)
```
 _   _   _   _   _          PgUp Home  Up  End  _
 _   _   _   _   _          PgDn Left Down Right _
 _   _   _   _   _           _   _    _    _    _
           _   _   _        [*]  _    _
```
Left hand positions are intentionally empty on this layer — navigation is right-hand only so the left hand stays free for modifier combos.
