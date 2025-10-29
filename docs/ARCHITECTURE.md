# Architecture Overview

## Engine

The chess engine (`src/engine`) stores a game state as a collection of bitboards indexed by color and piece. Move generation relies on on-the-fly ray tracing helpers defined in `bitboard.ts`, producing pseudo-legal moves that are filtered via `applyMove`/`inCheck` to ensure legality. The engine exposes:

- `Chess` – core façade exposing FEN/PGN I/O, legal-move generation, SAN formatting, undo/redo, threefold and 50-move detection, and iterative deepening search with alpha-beta pruning.
- `perft.ts` – deterministic node-count fixtures used in the Vitest suite and the `npm run perft` script.
- `chess.test.ts` – regression coverage for SAN, en passant, castling, undo/redo, and PGN round-tripping.

## UI

The React front end combines TailwindCSS styling with `@dnd-kit/core` for drag-and-drop interactions.

- `ChessBoard` renders the 8×8 grid, overlays draggable `PieceSvg` glyphs, and handles drop events.
- `PromotionDialog` and `ControlPanel` provide gameplay controls, PGN/FEN editors, and AI invocation.
- `MoveHistory` presents SAN move pairs.

A single Zustand store (`src/state/chessStore.ts`) synchronizes the `Chess` instance with UI state (selected square, legal moves, pending promotions, history, and AI status).

## Testing & Automation

- Vitest is configured through `vite.config.ts` / `vitest.config.ts`; Jest compatibility is provided via `jest.config.ts` for consumers that still rely on Jest.
- `scripts/run-perft.ts` powers the `npm run perft` command which validates the engine against known perft counts.
- `.github/workflows/ci.yml` installs dependencies then runs linting, type-checking, unit tests, perft, and the production build.

## Build & Deployment

The Dockerfile builds the Vite bundle in a builder stage and serves it through `vite preview` in the runtime stage. TailwindCSS is configured in `tailwind.config.ts` with a board-specific color palette, while ESLint/Prettier rely on flat configs to keep linting consistent with TypeScript 5.x projects.
