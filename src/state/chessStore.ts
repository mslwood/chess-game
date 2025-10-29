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

const engine = new Chess(START_FEN);

function snapshot(chess: Chess) {
  return {
    snapshot: chess.getState(),
    legalMoves: chess.generateLegalMoves(),
    moves: chess.getMoveHistory(),
    status: chess.getGameStatus()
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
    snapshot: engine.getState(),
    legalMoves: engine.generateLegalMoves(),
    moves: engine.getMoveHistory(),
    selectedSquare: null,
    highlightSquares: [],
    status: engine.getGameStatus(),
    aiThinking: false,
    pendingPromotion: null,
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
      });
    },
    runAI: async (depth = 4, timeLimitMs = 2500) => {
      const { chess } = get();
      set((draft) => {
        draft.aiThinking = true;
      });
      try {
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
        });
      } finally {
        set((draft) => {
          draft.aiThinking = false;
        });
      }
    }
  }))
);
