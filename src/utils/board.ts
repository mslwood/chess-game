import type { CastlingRights, GameStateSnapshot } from '../engine/types';
import { COLORS, PIECES, Color, Piece } from '../engine/types';
import { squareToNotation } from '../engine/bitboard';

export interface BoardPiece {
  square: number;
  color: Color;
  piece: Piece;
}

const MATERIAL_VALUES: Record<Piece, number> = {
  [Piece.Pawn]: 1,
  [Piece.Knight]: 3.2,
  [Piece.Bishop]: 3.3,
  [Piece.Rook]: 5,
  [Piece.Queen]: 9,
  [Piece.King]: 0
};

export interface MaterialSummarySide {
  total: number;
  counts: Record<Piece, number>;
}

export interface MaterialSummary {
  white: MaterialSummarySide;
  black: MaterialSummarySide;
  balance: number;
}

export function extractPieces(state: GameStateSnapshot): BoardPiece[] {
  const pieces: BoardPiece[] = [];
  for (const color of COLORS) {
    for (const piece of PIECES) {
      let board = state.bitboards[color][piece];
      while (board) {
        const lsb = board & -board;
        const square = Number(log2(lsb));
        pieces.push({ square, color, piece });
        board ^= lsb;
      }
    }
  }
  return pieces;
}

export function squareLabel(square: number): string {
  return squareToNotation(square);
}

export function isLightSquare(square: number): boolean {
  const rank = Math.floor(square / 8);
  const file = square % 8;
  return (rank + file) % 2 === 0;
}

export function calculateMaterial(snapshot: GameStateSnapshot): MaterialSummary {
  const counts: Record<Color, Record<Piece, number>> = {
    [Color.White]: {
      [Piece.Pawn]: 0,
      [Piece.Knight]: 0,
      [Piece.Bishop]: 0,
      [Piece.Rook]: 0,
      [Piece.Queen]: 0,
      [Piece.King]: 0
    },
    [Color.Black]: {
      [Piece.Pawn]: 0,
      [Piece.Knight]: 0,
      [Piece.Bishop]: 0,
      [Piece.Rook]: 0,
      [Piece.Queen]: 0,
      [Piece.King]: 0
    }
  };

  for (const color of COLORS) {
    for (const piece of PIECES) {
      let board = snapshot.bitboards[color][piece];
      while (board) {
        const lsb = board & -board;
        counts[color][piece] += 1;
        board ^= lsb;
      }
    }
  }

  const whiteTotal = totalMaterial(counts[Color.White]);
  const blackTotal = totalMaterial(counts[Color.Black]);

  return {
    white: { total: whiteTotal, counts: counts[Color.White] },
    black: { total: blackTotal, counts: counts[Color.Black] },
    balance: whiteTotal - blackTotal
  };
}

function totalMaterial(counts: Record<Piece, number>): number {
  return (
    counts[Piece.Pawn] * MATERIAL_VALUES[Piece.Pawn] +
    counts[Piece.Knight] * MATERIAL_VALUES[Piece.Knight] +
    counts[Piece.Bishop] * MATERIAL_VALUES[Piece.Bishop] +
    counts[Piece.Rook] * MATERIAL_VALUES[Piece.Rook] +
    counts[Piece.Queen] * MATERIAL_VALUES[Piece.Queen]
  );
}

export function formatCastlingRights(castling: CastlingRights) {
  const white: string[] = [];
  const black: string[] = [];

  if (castling.whiteKingSide) white.push('O-O');
  if (castling.whiteQueenSide) white.push('O-O-O');
  if (castling.blackKingSide) black.push('O-O');
  if (castling.blackQueenSide) black.push('O-O-O');

  return {
    white: white.length ? white.join(' · ') : '—',
    black: black.length ? black.join(' · ') : '—'
  };
}

export function formatEvaluation(evaluation: number): string {
  if (!Number.isFinite(evaluation)) {
    return evaluation > 0 ? '+M' : '-M';
  }
  const pawns = evaluation / 100;
  const precision = Math.abs(pawns) >= 10 ? 1 : 2;
  const value = pawns.toFixed(precision);
  return pawns >= 0 ? `+${value}` : value;
}

export function evaluationRatio(evaluation: number, clampPawns = 5): number {
  if (!Number.isFinite(evaluation)) {
    return evaluation > 0 ? 1 : 0;
  }
  const pawns = evaluation / 100;
  const clamped = Math.max(-clampPawns, Math.min(clampPawns, pawns));
  return (clamped + clampPawns) / (clampPawns * 2);
}

function log2(value: bigint): bigint {
  let result = 0n;
  let temp = value;
  while (temp > 1n) {
    temp >>= 1n;
    result++;
  }
  return result;
}
