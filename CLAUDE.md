# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `pnpm dev` — start Vite dev server
- `pnpm build` — typecheck (`tsc -b`) then build with Vite
- `pnpm lint` — ESLint across the project
- `pnpm preview` — serve the production build locally

No test framework is configured.

## Architecture

React 19 + TypeScript SPA for studying data structures and algorithms. Vite 7, Tailwind CSS v4 (via `@tailwindcss/vite` plugin), React Router v7.

### Content-driven design

The app is content-driven: each DSA topic is a `Topic` object defined in `src/content/`. The `Topic` type (`src/content/types.ts`) defines the shape — id, category, theory markdown, key points, complexity info, visualization key, and use cases with code snippets.

Content is organized by category:
- `src/content/data-structures/` — arrays, hash maps, stacks/queues, linked lists, trees, graphs, heaps
- `src/content/algorithms/` — sorting, searching, BFS/DFS, dynamic programming
- `src/content/techniques/` — two pointers, sliding window, recursion, greedy, memoization, monotonic stack

`src/content/index.ts` is the central registry — exports `allTopics`, `topicsByCategory`, and `topicMap` (id → Topic lookup). To add a new topic: create the `.ts` file, import it in `index.ts`, and add it to the appropriate arrays.

### Routing

All routes use a shared `TopicLayout` (sidebar + main content area). Routes:
- `/` — Home grid
- `/big-o` — Big O reference page
- `/flash-cards` — Quiz/flashcard mode
- `/topic/:topicId` — Dynamic topic page, resolved via `topicMap`

### Visualizations

`src/components/visualizations/` contains per-data-structure interactive visualizations (ArrayViz, TreeViz, GraphViz, etc.). The `Visualization` component maps a topic's `visualization` string key to the correct component via `vizMap`.

### Styling conventions

Tailwind v4 with custom theme tokens in `src/index.css` using `@theme` — category colors: `ds` (blue), `algo` (green), `tech` (purple), `bigo` (amber), `quiz` (teal). Each has a `-dim` variant at 8% opacity. Code blocks use Shiki with Catppuccin Mocha theme and CSS line numbers. Big O notation uses `.bigo` class for serif italic rendering.
