import type { Bitboard, Square } from './types';

export const EMPTY: Bitboard = 0n;
export const FULL: Bitboard = (1n << 64n) - 1n;

export const FILE_A = 0x0101010101010101n;
export const FILE_H = 0x8080808080808080n;
export const RANK_1 = 0x00000000000000ffn;
export const RANK_2 = 0x000000000000ff00n;
export const RANK_7 = 0x00ff000000000000n;
export const RANK_8 = 0xff00000000000000n;

export const KNIGHT_OFFSETS = [17, 15, 10, 6, -17, -15, -10, -6];
export const KING_OFFSETS = [8, -8, 1, -1, 9, 7, -9, -7];

const NORTH = 8;
const SOUTH = -8;
const EAST = 1;
const WEST = -1;

export const FILE_MASKS: Bitboard[] = new Array(8).fill(0n).map((_, file) => {
  let mask = 0n;
  for (let rank = 0; rank < 8; rank++) {
    mask |= 1n << BigInt(rank * 8 + file);
  }
  return mask;
});

export const RANK_MASKS: Bitboard[] = new Array(8).fill(0n).map((_, rank) => {
  let mask = 0n;
  for (let file = 0; file < 8; file++) {
    mask |= 1n << BigInt(rank * 8 + file);
  }
  return mask;
});

export const DIAGONAL_MASKS: Bitboard[] = new Array(15).fill(0n).map((_, index) => {
  let mask = 0n;
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      if (file - rank + 7 === index) {
        mask |= 1n << BigInt(rank * 8 + file);
      }
    }
  }
  return mask;
});

export const ANTIDIAGONAL_MASKS: Bitboard[] = new Array(15).fill(0n).map((_, index) => {
  let mask = 0n;
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      if (file + rank === index) {
        mask |= 1n << BigInt(rank * 8 + file);
      }
    }
  }
  return mask;
});

export const KNIGHT_MOVES: Bitboard[] = new Array(64).fill(0n);
export const KING_MOVES: Bitboard[] = new Array(64).fill(0n);

for (let square = 0; square < 64; square++) {
  const [rank, file] = squareToCoords(square);
  let knightMask = 0n;
  for (const offset of KNIGHT_OFFSETS) {
    const target = square + offset;
    if (target < 0 || target >= 64) continue;
    const [tr, tf] = squareToCoords(target);
    if (Math.abs(tr - rank) > 2 || Math.abs(tf - file) > 2) continue;
    knightMask |= 1n << BigInt(target);
  }
  KNIGHT_MOVES[square] = knightMask;

  let kingMask = 0n;
  for (const offset of KING_OFFSETS) {
    const target = square + offset;
    if (target < 0 || target >= 64) continue;
    const [tr, tf] = squareToCoords(target);
    if (Math.abs(tr - rank) > 1 || Math.abs(tf - file) > 1) continue;
    kingMask |= 1n << BigInt(target);
  }
  KING_MOVES[square] = kingMask;
}

export function squareToBit(square: Square): Bitboard {
  return 1n << BigInt(square);
}

export function bitScanForward(bitboard: Bitboard): Square {
  if (bitboard === 0n) return -1;
  return Number(BigInt.asUintN(64, bitboard & -bitboard).toString(2).length - 1);
}

export function bitScanReverse(bitboard: Bitboard): Square {
  if (bitboard === 0n) return -1;
  let index = 63;
  let mask = 1n << 63n;
  while (mask !== 0n) {
    if ((bitboard & mask) !== 0n) return index;
    mask >>= 1n;
    index--;
  }
  return -1;
}

export function popBit(bitboard: Bitboard, square: Square): Bitboard {
  return bitboard & ~(1n << BigInt(square));
}

export function popLSB(bitboard: Bitboard): [Bitboard, Square] {
  const lsb = bitboard & -bitboard;
  const square = Number(lsb ? log2(lsb) : -1n);
  return [bitboard ^ lsb, square];
}

export function log2(value: Bitboard): bigint {
  let log = 0n;
  let temp = value;
  while (temp > 1n) {
    temp >>= 1n;
    log++;
  }
  return log;
}

export function popCount(bitboard: Bitboard): number {
  let count = 0;
  let bb = bitboard;
  while (bb) {
    bb &= bb - 1n;
    count++;
  }
  return count;
}

export function shift(bitboard: Bitboard, offset: number): Bitboard {
  if (offset > 0) {
    return (bitboard << BigInt(offset)) & FULL;
  }
  return (bitboard >> BigInt(-offset)) & FULL;
}

export function squareToCoords(square: Square): [number, number] {
  const rank = Math.floor(square / 8);
  const file = square % 8;
  return [rank, file];
}

export function coordsToSquare(rank: number, file: number): Square {
  return rank * 8 + file;
}

export function notationToSquare(notation: string): Square {
  const file = notation.charCodeAt(0) - 97;
  const rank = Number(notation[1]) - 1;
  return coordsToSquare(rank, file);
}

export function squareToNotation(square: Square): string {
  const [rank, file] = squareToCoords(square);
  return String.fromCharCode(97 + file) + (rank + 1);
}

export function rayAttacks(square: Square, direction: number, occupied: Bitboard): Bitboard {
  const [rank, file] = squareToCoords(square);
  let dr = 0;
  let df = 0;
  switch (direction) {
    case 8:
      dr = 1;
      break;
    case -8:
      dr = -1;
      break;
    case 1:
      df = 1;
      break;
    case -1:
      df = -1;
      break;
    case 9:
      dr = 1;
      df = 1;
      break;
    case 7:
      dr = 1;
      df = -1;
      break;
    case -7:
      dr = -1;
      df = 1;
      break;
    case -9:
      dr = -1;
      df = -1;
      break;
    default:
      throw new Error(`Unsupported direction ${direction}`);
  }

  let attacks = 0n;
  let r = rank + dr;
  let f = file + df;
  while (r >= 0 && r < 8 && f >= 0 && f < 8) {
    const target = coordsToSquare(r, f);
    attacks |= 1n << BigInt(target);
    if ((occupied & (1n << BigInt(target))) !== 0n) break;
    r += dr;
    f += df;
  }
  return attacks;
}

export function bishopAttacks(square: Square, occupied: Bitboard): Bitboard {
  return (
    rayAttacks(square, 9, occupied) |
    rayAttacks(square, 7, occupied) |
    rayAttacks(square, -9, occupied) |
    rayAttacks(square, -7, occupied)
  );
}

export function rookAttacks(square: Square, occupied: Bitboard): Bitboard {
  return (
    rayAttacks(square, 8, occupied) |
    rayAttacks(square, -8, occupied) |
    rayAttacks(square, 1, occupied) |
    rayAttacks(square, -1, occupied)
  );
}

export function queenAttacks(square: Square, occupied: Bitboard): Bitboard {
  return bishopAttacks(square, occupied) | rookAttacks(square, occupied);
}

export function pawnAttacks(square: Square, isWhite: boolean): Bitboard {
  const [rank, file] = squareToCoords(square);
  let attacks = 0n;
  const forward = isWhite ? 1 : -1;
  const attackRanks = rank + forward;
  if (attackRanks < 0 || attackRanks > 7) return 0n;
  if (file > 0) {
    attacks |= 1n << BigInt(coordsToSquare(attackRanks, file - 1));
  }
  if (file < 7) {
    attacks |= 1n << BigInt(coordsToSquare(attackRanks, file + 1));
  }
  return attacks;
}

export function isSquareOnBoard(square: Square): boolean {
  return square >= 0 && square < 64;
}

export function directionBetween(from: Square, to: Square): number | null {
  const [fr, ff] = squareToCoords(from);
  const [tr, tf] = squareToCoords(to);
  const dr = tr - fr;
  const df = tf - ff;
  if (dr === 0) return df > 0 ? EAST : WEST;
  if (df === 0) return dr > 0 ? NORTH : SOUTH;
  if (Math.abs(dr) === Math.abs(df)) {
    const stepRank = dr > 0 ? NORTH : SOUTH;
    const stepFile = df > 0 ? EAST : WEST;
    return stepRank + stepFile;
  }
  return null;
}

export function rayBetween(from: Square, to: Square): Bitboard {
  const direction = directionBetween(from, to);
  if (direction === null) return 0n;
  let ray = 0n;
  let square = from + direction;
  while (square !== to) {
    ray |= 1n << BigInt(square);
    square += direction;
  }
  return ray;
}

export function mirrorSquare(square: Square): Square {
  const [rank, file] = squareToCoords(square);
  return coordsToSquare(7 - rank, file);
}
