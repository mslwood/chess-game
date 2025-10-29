import type { GameStateSnapshot } from '../engine/types';
import { COLORS, PIECES, Color, Piece } from '../engine/types';
import { squareToNotation } from '../engine/bitboard';

export interface BoardPiece {
  square: number;
  color: Color;
  piece: Piece;
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

function log2(value: bigint): bigint {
  let result = 0n;
  let temp = value;
  while (temp > 1n) {
    temp >>= 1n;
    result++;
  }
  return result;
}
