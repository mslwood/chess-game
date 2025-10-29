export type Bitboard = bigint;
export type Square = number;

export enum Color {
  White = 0,
  Black = 1
}

export enum Piece {
  Pawn = 0,
  Knight = 1,
  Bishop = 2,
  Rook = 3,
  Queen = 4,
  King = 5
}

export const COLORS: Color[] = [Color.White, Color.Black];
export const PIECES: Piece[] = [
  Piece.Pawn,
  Piece.Knight,
  Piece.Bishop,
  Piece.Rook,
  Piece.Queen,
  Piece.King
];

export interface CastlingRights {
  whiteKingSide: boolean;
  whiteQueenSide: boolean;
  blackKingSide: boolean;
  blackQueenSide: boolean;
}

export interface Move {
  from: Square;
  to: Square;
  piece: Piece;
  color: Color;
  capture?: Piece;
  promotion?: Piece;
  enPassant?: boolean;
  castle?: 'K' | 'Q';
  doublePush?: boolean;
}

export interface MoveWithNotation extends Move {
  san: string;
  fen: string;
}

export type SquareMap<T> = T[];

export interface GameHistoryEntry {
  move: MoveWithNotation | null;
  state: GameStateSnapshot;
}

export interface GameStateSnapshot {
  bitboards: Record<Color, Record<Piece, Bitboard>>;
  castling: CastlingRights;
  sideToMove: Color;
  enPassantSquare: Square | null;
  halfmoveClock: number;
  fullmoveNumber: number;
}

export interface MoveSearchResult {
  bestMove: MoveWithNotation | null;
  depth: number;
  evaluation: number;
  nodes: number;
}
