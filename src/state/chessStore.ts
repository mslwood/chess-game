import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Chess, START_FEN } from '../engine/chess';
import type { GameStateSnapshot, MoveWithNotation } from '../engine/types';
import { PIECES } from '../engine/types';

export interface PromotionRequest {
  from: number;
  to: number;
  options: MoveWithNotation[];
}

export interface ChessStoreState {
  chess: Chess;
  snapshot: GameStateSnapshot;
  legalMoves: MoveWithNotation[];
  moves: MoveWithNotation[];
  selectedSquare: number | null;
  highlightSquares: number[];
  status: 'ongoing' | 'checkmate' | 'stalemate' | 'fifty-move' | 'threefold';
  aiThinking: boolean;
  pendingPromotion: PromotionRequest | null;
  evaluation: number;
  lastSearch: SearchSummary | null;
  selectSquare: (square: number) => void;
  playMove: (move: MoveWithNotation) => void;
  choosePromotion: (promotion: MoveWithNotation) => void;
  reset: (fen?: string) => void;
  undo: () => void;
  redo: () => void;
  loadPGN: (pgn: string) => void;
  loadFEN: (fen: string) => void;
  runAI: (depth?: number, timeLimitMs?: number) => Promise<void>;
}

export interface SearchSummary {
  depth: number;
  evaluation: number;
  nodes: number;
  durationMs: number;
}

const engine = new Chess(START_FEN);
const initial = snapshot(engine);

function snapshot(chess: Chess) {
  const state = chess.getState();
  return {
    snapshot: state,
    legalMoves: chess.generateLegalMoves(state),
    moves: chess.getMoveHistory(),
    status: chess.getGameStatus(),
    evaluation: chess.evaluate(state)
  };
}

function isOwnPiece(state: GameStateSnapshot, square: number): boolean {
  const { bitboards, sideToMove } = state;
  for (const piece of PIECES) {
    const bitboard = bitboards[sideToMove][piece];
    if ((bitboard & (1n << BigInt(square))) !== 0n) {
      return true;
    }
  }
  return false;
}

export const useChessStore = create<ChessStoreState>()(
  immer((set, get) => ({
    chess: engine,
    snapshot: initial.snapshot,
    legalMoves: initial.legalMoves,
    moves: initial.moves,
    selectedSquare: null,
    highlightSquares: [],
    status: initial.status,
    aiThinking: false,
    pendingPromotion: null,
    evaluation: initial.evaluation,
    lastSearch: null,
    selectSquare: (square) => {
      const { selectedSquare, snapshot: state, legalMoves } = get();
      if (selectedSquare === null) {
        if (isOwnPiece(state, square)) {
          set((draft) => {
            draft.selectedSquare = square;
            draft.highlightSquares = legalMoves
              .filter((move) => move.from === square)
              .map((move) => move.to);
          });
        }
        return;
      }

      if (selectedSquare === square) {
        set((draft) => {
          draft.selectedSquare = null;
          draft.highlightSquares = [];
        });
        return;
      }

      const candidates = legalMoves.filter((move) => move.from === selectedSquare && move.to === square);
      if (candidates.length === 0) {
        if (isOwnPiece(state, square)) {
          set((draft) => {
            draft.selectedSquare = square;
            draft.highlightSquares = legalMoves
              .filter((move) => move.from === square)
              .map((move) => move.to);
          });
        }
        return;
      }

      if (candidates.length > 1 && candidates.some((move) => move.promotion)) {
        set((draft) => {
          draft.pendingPromotion = {
            from: selectedSquare,
            to: square,
            options: candidates
          };
        });
        return;
      }

      get().playMove(candidates[0]);
    },
    playMove: (move) => {
      const { chess } = get();
      chess.makeMove(move);
      set((draft) => {
        draft.selectedSquare = null;
        draft.highlightSquares = [];
        draft.pendingPromotion = null;
        const next = snapshot(chess);
        draft.snapshot = next.snapshot;
        draft.legalMoves = next.legalMoves;
        draft.moves = next.moves;
        draft.status = next.status;
        draft.evaluation = next.evaluation;
        draft.lastSearch = null;
      });
    },
    choosePromotion: (promotion) => {
      get().playMove(promotion);
    },
    reset: (fen) => {
      const { chess } = get();
      chess.reset(fen ?? START_FEN);
      set((draft) => {
        draft.selectedSquare = null;
        draft.highlightSquares = [];
        draft.pendingPromotion = null;
        const next = snapshot(chess);
        draft.snapshot = next.snapshot;
        draft.legalMoves = next.legalMoves;
        draft.moves = next.moves;
        draft.status = next.status;
        draft.evaluation = next.evaluation;
        draft.lastSearch = null;
      });
    },
    undo: () => {
      const { chess } = get();
      chess.undo();
      set((draft) => {
        draft.selectedSquare = null;
        draft.highlightSquares = [];
        draft.pendingPromotion = null;
        const next = snapshot(chess);
        draft.snapshot = next.snapshot;
        draft.legalMoves = next.legalMoves;
        draft.moves = next.moves;
        draft.status = next.status;
        draft.evaluation = next.evaluation;
        draft.lastSearch = null;
      });
    },
    redo: () => {
      const { chess } = get();
      chess.redo();
      set((draft) => {
        draft.selectedSquare = null;
        draft.highlightSquares = [];
        draft.pendingPromotion = null;
        const next = snapshot(chess);
        draft.snapshot = next.snapshot;
        draft.legalMoves = next.legalMoves;
        draft.moves = next.moves;
        draft.status = next.status;
        draft.evaluation = next.evaluation;
        draft.lastSearch = null;
      });
    },
    loadPGN: (pgn: string) => {
      const { chess } = get();
      chess.importPGN(pgn);
      set((draft) => {
        draft.selectedSquare = null;
        draft.highlightSquares = [];
        draft.pendingPromotion = null;
        const next = snapshot(chess);
        draft.snapshot = next.snapshot;
        draft.legalMoves = next.legalMoves;
        draft.moves = next.moves;
        draft.status = next.status;
        draft.evaluation = next.evaluation;
        draft.lastSearch = null;
      });
    },
    loadFEN: (fen: string) => {
      const { chess } = get();
      chess.loadFEN(fen);
      set((draft) => {
        draft.selectedSquare = null;
        draft.highlightSquares = [];
        draft.pendingPromotion = null;
        const next = snapshot(chess);
        draft.snapshot = next.snapshot;
        draft.legalMoves = next.legalMoves;
        draft.moves = next.moves;
        draft.status = next.status;
        draft.evaluation = next.evaluation;
        draft.lastSearch = null;
      });
    },
    runAI: async (depth = 4, timeLimitMs = 2500) => {
      const { chess } = get();
      set((draft) => {
        draft.aiThinking = true;
      });
      try {
        const startedAt = Date.now();
        const result = chess.search(depth, timeLimitMs);
        if (result.bestMove) {
          chess.makeMove(result.bestMove);
        }
        set((draft) => {
          const next = snapshot(chess);
          draft.snapshot = next.snapshot;
          draft.legalMoves = next.legalMoves;
          draft.moves = next.moves;
          draft.status = next.status;
          draft.selectedSquare = null;
          draft.highlightSquares = [];
          draft.pendingPromotion = null;
          draft.evaluation = next.evaluation;
          draft.lastSearch = {
            depth: result.depth,
            evaluation: result.evaluation,
            nodes: result.nodes,
            durationMs: Date.now() - startedAt
          };
        });
      } finally {
        set((draft) => {
          draft.aiThinking = false;
        });
      }
    }
  }))
);
