import { describe, expect, it } from 'vitest';
import { Chess } from './chess';
import { Color, Piece } from './types';

describe('Chess engine', () => {
  it('generates 20 legal moves from the initial position', () => {
    const chess = new Chess();
    const moves = chess.generateLegalMoves();
    expect(moves).toHaveLength(20);
  });

  it('produces correct SAN for a simple opening', () => {
    const chess = new Chess();
    chess.makeSANMove('e4');
    chess.makeSANMove('e5');
    chess.makeSANMove('Nf3');
    const history = chess.getMoveHistory();
    expect(history.map((move) => move.san)).toEqual(['e4', 'e5', 'Nf3']);
  });

  it('supports en passant captures', () => {
    const chess = new Chess('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    chess.makeSANMove('e4');
    chess.makeSANMove('a6');
    chess.makeSANMove('e5');
    chess.makeSANMove('d5');
    const enPassantMoves = chess.generateLegalMoves().filter((move) => move.enPassant);
    expect(enPassantMoves).toHaveLength(1);
    chess.makeMove(enPassantMoves[0]);
    const state = chess.getState();
    const capturedSquare = 35;
    const pawnSquare = 43;
    expect(state.bitboards[Color.Black][Piece.Pawn] & (1n << BigInt(capturedSquare))).toBe(0n);
    expect(state.bitboards[Color.White][Piece.Pawn] & (1n << BigInt(pawnSquare))).not.toBe(0n);
  });

  it('detects checkmate', () => {
    const chess = new Chess();
    chess.makeSANMove('f3');
    chess.makeSANMove('e5');
    chess.makeSANMove('g4');
    const mateMove = chess
      .generateLegalMoves()
      .find((move) => move.piece === Piece.Queen && move.to === 31);
    expect(mateMove).toBeDefined();
    chess.makeMove(mateMove!);
    expect(chess.getGameStatus()).toBe('checkmate');
  });

  it('supports undo and redo', () => {
    const chess = new Chess();
    chess.makeSANMove('d4');
    const secondMove = chess.makeSANMove('d5');
    chess.undo();
    expect(chess.getMoveHistory()).toHaveLength(1);
    chess.redo();
    expect(chess.getMoveHistory()).toHaveLength(2);
    expect(chess.getMoveHistory()[1]?.san).toBe(secondMove.san);
  });

  it('round-trips PGN export/import', () => {
    const chess = new Chess();
    chess.makeSANMove('c4');
    chess.makeSANMove('e5');
    chess.makeSANMove('Nc3');
    const pgn = chess.exportPGN();
    const other = new Chess();
    other.importPGN(pgn);
    expect(other.exportPGN()).toBe(pgn);
  });
});
