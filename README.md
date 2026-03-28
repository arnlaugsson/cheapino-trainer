# Cheapino Trainer

A progressive web app for learning to type on a [Cheapino](https://github.com/tompi/cheapino) 36-key split keyboard.

**Try it now:** [arnlaugsson.github.io/cheapino-trainer](https://arnlaugsson.github.io/cheapino-trainer/)

## What is this?

Switching to a split keyboard is disorienting — column stagger, thumb keys, and layers are all new concepts at once. This app breaks the learning curve into 7 progressive stages:

1. **Home Position** — Find your resting fingers on the split layout
2. **All Letters** — Full QWERTY on the base layer
3. **Modifiers** — Shift via home-row mods, capitals and CamelCase
4. **Numbers** — Hold Space to activate the number layer
5. **Symbols** — Hold Tab for brackets, operators, and special characters
6. **Navigation** — Hold Enter for arrow keys, Home, End, Page Up/Down
7. **Full Integration** — Mixed exercises combining all layers

Each stage has WPM and accuracy thresholds. Hit them and the next stage unlocks. Progress is saved in your browser's localStorage.

## Features

- Interactive SVG keyboard visualizer with column-stagger layout
- Layer tabs to browse what each layer produces
- Character-by-character typing validation with WPM and accuracy tracking
- Navigation key training with keydown sequence exercises
- No account needed — everything runs locally in your browser

## Configure your keyboard

The Cheapino uses [QMK](https://qmk.fm/) firmware and can be configured with [Vial](https://get.vial.today/) — a GUI tool that lets you remap keys, set up layers, and configure home-row mods in real time without reflashing.

1. Download Vial from [get.vial.today](https://get.vial.today/)
2. Plug in your Cheapino and open Vial
3. Customize your layout to match the default keymap used by this trainer, or edit `src/data/layout.ts` to match your own

## Development

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm test:run     # Run tests once
pnpm build        # Production build
```

Built with Vite + React + TypeScript + Tailwind CSS v4.

## License

MIT
