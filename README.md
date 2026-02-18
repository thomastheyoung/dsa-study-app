# DSA Study Guide

A focused study companion for fullstack engineers preparing for technical interviews. Every topic is grounded in real-world product engineering scenarios — not textbook toy examples.

Built with React 19, TypeScript, and hand-crafted SVG visualizations. No heavy dependencies, no bloat.

## Why this exists

Most DSA resources teach concepts in isolation. This app connects each data structure, algorithm, and technique to the kind of problems fullstack engineers actually encounter: rate limiters, session stores, deployment ordering, leaderboard ranking, rolling error rates, search snippet extraction, and more.

The goal is to build intuition, not just memorize patterns.

## Who it's for

- Fullstack engineers preparing for coding interviews
- Developers who want to understand *when* and *why* to reach for a particular data structure or technique
- Anyone who learns best through interactive visualization and applied examples

## What's inside

### 19 topics across three categories

**Data structures** — Arrays, Hash Maps, Stacks & Queues, Linked Lists, Trees, Graphs, Heaps

**Algorithms** — Sorting, Searching, BFS/DFS, Dynamic Programming

**Techniques** — Two Pointers, Sliding Window, Recursion, Greedy, Memoization, Monotonic Stack, Prefix Sum + Hashmap, Fast & Slow Pointers

### Each topic includes

- **Theory** with structured explanations, complexity tables, and key invariants
- **Use cases** with complete, self-contained TypeScript implementations drawn from real product engineering scenarios
- **Interactive visualizations** — animated SVG diagrams that show how the data structure or algorithm actually works step by step
- **Key points** checklist for quick review

### Big O reference

A dedicated page covering all 7 complexity classes (O(1) through O(n!)) with real-world analogies, rules for determining complexity, space vs. time trade-offs, and an interactive growth curve chart where you can isolate individual curves.

### 100-question quiz

Scenario-grounded multiple-choice questions across 4 categories. Not "what is the time complexity of merge sort?" — instead, "your API endpoint filters users by iterating an array, then sorts the results — what dominates?" Includes per-category score breakdowns, keyboard navigation (1-4 to answer, Enter to advance), and Fisher-Yates shuffling.

## Visualizations

14 purpose-built animated SVG visualizations — no external charting library. Each one loops automatically and uses smooth CSS transitions:

| Visualization | What it shows |
|---|---|
| Array | Index-based access animation |
| Hash Map | Hash function → bucket mapping |
| Stack & Queue | Push/pop and enqueue/dequeue operations |
| Linked List | Node-by-node traversal |
| Tree | BST with animated DFS preorder traversal |
| Graph | BFS traversal with queue progression |
| Heap | Min/max heap structure |
| Sliding Window | Window movement with L/R pointers and running sum |
| Recursion | Call stack depth animation |
| Greedy | Greedy choice selection |
| Memoization | Cache hit/miss animation |
| Monotonic Stack | Stack maintenance during iteration |
| Fast & Slow Pointers | Tortoise and hare movement |
| Prefix Sum | Cumulative sum computation |

Plus an interactive complexity growth chart on the Big O page with hover-to-isolate and zoom controls.

## Tech stack

| | |
|---|---|
| **Framework** | React 19 |
| **Language** | TypeScript 5.9 |
| **Build** | Vite 7 |
| **Routing** | React Router v7 |
| **Styling** | Tailwind CSS v4 |
| **Syntax highlighting** | Shiki (Catppuccin Mocha theme) |
| **Icons** | Lucide React |

Zero runtime dependencies beyond React, React Router, Shiki, and Lucide. No state management library, no markdown parser, no chart library.

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

### Other commands

```bash
pnpm build      # typecheck + production build
pnpm lint       # eslint
pnpm preview    # serve the production build
```

## Adding a new topic

1. Create a new `.ts` file in the appropriate `src/content/` subdirectory
2. Export a `Topic` object following the shape in `src/content/types.ts`
3. Import it in `src/content/index.ts` and add it to the relevant arrays
4. Optionally create a visualization component in `src/components/visualizations/` and register it in `vizMap`

## License

MIT
