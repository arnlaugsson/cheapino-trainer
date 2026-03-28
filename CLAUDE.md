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
