# Aurora Chess

Aurora Chess is a Vite + React + TypeScript playground that bundles a feature-complete chess engine with an interactive drag-and-drop board UI. The project ships with TailwindCSS styling, Zustand state management, Vitest/Jest tooling, automated perft fixtures, and GitHub Actions CI.

## Features

- **Modern toolchain** – Vite + React + TypeScript, TailwindCSS, ESLint (flat config), and Prettier.
- **Bitboard engine** – Legal move generator with castling, promotion, en passant, repetition, and 50-move detection plus PGN/FEN import/export and SAN move list.
- **Interactive UI** – Drag-and-drop chessboard, move highlighting, promotion picker, undo/redo, PGN/FEN editors, and iterative-deepening AI opponent.
- **Testing & CI** – Vitest unit tests, Jest compatibility, deterministic perft suite, and GitHub Actions workflow.
- **Container ready** – Dockerfile for `vite preview` deployments.

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to open the board.

### Useful scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check and build the production bundle. |
| `npm run preview` | Preview the built bundle locally. |
| `npm run lint` | Run ESLint using the flat config. |
| `npm run typecheck` | Run the TypeScript project references check. |
| `npm run test` | Execute Vitest in watch mode. |
| `npm run test:run` | Execute Vitest in headless mode. |
| `npm run perft` | Run perft fixtures against the engine. |

## Project structure

```
├── src
│   ├── engine              # Bitboard chess engine, search, perft fixtures, tests
│   ├── components          # React UI components (board, controls, modals)
│   ├── state               # Zustand store for engine integration
│   ├── utils               # Helpers for board rendering
│   └── index.css           # Tailwind entry point
├── scripts                 # Node scripts (perft runner)
├── public                  # Static assets
├── docs
│   └── ARCHITECTURE.md     # High level architecture notes
├── .github/workflows       # GitHub Actions CI configuration
├── Dockerfile              # Production-ready container definition
└── README.md
```

## Testing the engine

The perft fixtures live in `src/engine/perft.ts`. Run `npm run perft` to compare the engine's node counts with known-good values. Unit tests are defined in `src/engine/chess.test.ts` and executed with `npm run test:run`.

## Docker

Build and preview the production bundle in a container:

```bash
docker build -t aurora-chess .
docker run --rm -p 4173:4173 aurora-chess
```

The container exposes Vite preview on port `4173`.
