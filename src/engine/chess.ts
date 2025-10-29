import {
  bishopAttacks,
  KING_MOVES,
  KNIGHT_MOVES,
  pawnAttacks,
  queenAttacks,
  rookAttacks,
  squareToBit,
  squareToCoords,
  squareToNotation
} from './bitboard';
import {
  type Bitboard,
  type CastlingRights,
  type GameHistoryEntry,
  type GameStateSnapshot,
  type Move,
  type MoveSearchResult,
  type MoveWithNotation,
  Color,
  Piece,
  PIECES,
  COLORS
} from './types';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const PIECE_FROM_SYMBOL: Record<string, { piece: Piece; color: Color }> = {
  p: { piece: Piece.Pawn, color: Color.Black },
  n: { piece: Piece.Knight, color: Color.Black },
  b: { piece: Piece.Bishop, color: Color.Black },
  r: { piece: Piece.Rook, color: Color.Black },
  q: { piece: Piece.Queen, color: Color.Black },
  k: { piece: Piece.King, color: Color.Black },
  P: { piece: Piece.Pawn, color: Color.White },
  N: { piece: Piece.Knight, color: Color.White },
  B: { piece: Piece.Bishop, color: Color.White },
  R: { piece: Piece.Rook, color: Color.White },
  Q: { piece: Piece.Queen, color: Color.White },
  K: { piece: Piece.King, color: Color.White }
};

const PIECE_TO_SYMBOL: Record<Color, Record<Piece, string>> = {
  [Color.White]: {
    [Piece.Pawn]: 'P',
    [Piece.Knight]: 'N',
    [Piece.Bishop]: 'B',
    [Piece.Rook]: 'R',
    [Piece.Queen]: 'Q',
    [Piece.King]: 'K'
  },
  [Color.Black]: {
    [Piece.Pawn]: 'p',
    [Piece.Knight]: 'n',
    [Piece.Bishop]: 'b',
    [Piece.Rook]: 'r',
    [Piece.Queen]: 'q',
    [Piece.King]: 'k'
  }
};

const PIECE_VALUES: Record<Piece, number> = {
  [Piece.Pawn]: 100,
  [Piece.Knight]: 320,
  [Piece.Bishop]: 330,
  [Piece.Rook]: 500,
  [Piece.Queen]: 900,
  [Piece.King]: 20000
};

const PROMOTION_PIECES: Piece[] = [Piece.Queen, Piece.Rook, Piece.Bishop, Piece.Knight];

const KING_START_SQUARE: Record<Color, number> = {
  [Color.White]: 4,
  [Color.Black]: 60
};

const ROOK_START_SQUARES: Record<Color, { king: number; queen: number }> = {
  [Color.White]: { king: 7, queen: 0 },
  [Color.Black]: { king: 63, queen: 56 }
};

const MAX_SEARCH_DEPTH = 6;

export class Chess {
  private state: GameStateSnapshot;
  private readonly history: GameHistoryEntry[] = [];
  private readonly future: GameHistoryEntry[] = [];
  private readonly repetitionTable = new Map<string, number>();

  constructor(fen: string = START_FEN) {
    this.state = this.parseFEN(fen);
    this.history.push({ move: null, state: this.cloneState(this.state) });
    this.addRepetitionEntry(this.state);
  }

  reset(fen: string = START_FEN) {
    this.state = this.parseFEN(fen);
    this.history.length = 0;
    this.future.length = 0;
    this.repetitionTable.clear();
    this.history.push({ move: null, state: this.cloneState(this.state) });
    this.addRepetitionEntry(this.state);
  }

  getState(): GameStateSnapshot {
    return this.cloneState(this.state);
  }

  private createEmptyBitboards(): Record<Color, Record<Piece, Bitboard>> {
    return {
      [Color.White]: {
        [Piece.Pawn]: 0n,
        [Piece.Knight]: 0n,
        [Piece.Bishop]: 0n,
        [Piece.Rook]: 0n,
        [Piece.Queen]: 0n,
        [Piece.King]: 0n
      },
      [Color.Black]: {
        [Piece.Pawn]: 0n,
        [Piece.Knight]: 0n,
        [Piece.Bishop]: 0n,
        [Piece.Rook]: 0n,
        [Piece.Queen]: 0n,
        [Piece.King]: 0n
      }
    };
  }

  private parseFEN(fen: string): GameStateSnapshot {
    const parts = fen.trim().split(/\s+/);
    if (parts.length < 6) {
      throw new Error(`Invalid FEN: ${fen}`);
    }

    const position = parts[0];
    const sideToMove = parts[1] === 'b' ? Color.Black : Color.White;
    const castlingPart = parts[2];
    const enPassantPart = parts[3];
    const halfmoveClock = Number(parts[4]);
    const fullmoveNumber = Number(parts[5]);

    const bitboards = this.createEmptyBitboards();
    const ranks = position.split('/');
    if (ranks.length !== 8) {
      throw new Error(`Invalid FEN ranks: ${fen}`);
    }

    for (let rankIndex = 7; rankIndex >= 0; rankIndex--) {
      const rank = ranks[7 - rankIndex];
      let file = 0;
      for (const char of rank) {
        if (/[1-8]/.test(char)) {
          file += Number(char);
          continue;
        }
        const pieceInfo = PIECE_FROM_SYMBOL[char];
        if (!pieceInfo) {
          throw new Error(`Invalid FEN piece: ${char}`);
        }
        const square = rankIndex * 8 + file;
        bitboards[pieceInfo.color][pieceInfo.piece] |= squareToBit(square);
        file++;
      }
      if (file !== 8) {
        throw new Error(`Invalid FEN rank length: ${rank}`);
      }
    }

    const castling: CastlingRights = {
      whiteKingSide: castlingPart.includes('K'),
      whiteQueenSide: castlingPart.includes('Q'),
      blackKingSide: castlingPart.includes('k'),
      blackQueenSide: castlingPart.includes('q')
    };

    const enPassantSquare = enPassantPart === '-' ? null : this.notationToSquare(enPassantPart);

    return {
      bitboards,
      castling,
      sideToMove,
      enPassantSquare,
      halfmoveClock,
      fullmoveNumber
    };
  }

  toFEN(state: GameStateSnapshot = this.state): string {
    const ranks: string[] = [];
    for (let rank = 7; rank >= 0; rank--) {
      let empty = 0;
      let fenRank = '';
      for (let file = 0; file < 8; file++) {
        const square = rank * 8 + file;
        const piece = this.getPieceAtSquare(state, square);
        if (!piece) {
          empty++;
          continue;
        }
        if (empty > 0) {
          fenRank += empty.toString();
          empty = 0;
        }
        fenRank += PIECE_TO_SYMBOL[piece.color][piece.piece];
      }
      if (empty > 0) {
        fenRank += empty.toString();
      }
      ranks.push(fenRank);
    }

    const castling = [
      state.castling.whiteKingSide ? 'K' : '',
      state.castling.whiteQueenSide ? 'Q' : '',
      state.castling.blackKingSide ? 'k' : '',
      state.castling.blackQueenSide ? 'q' : ''
    ].join('');
    const castlingPart = castling.length === 0 ? '-' : castling;
    const enPassant = state.enPassantSquare === null ? '-' : squareToNotation(state.enPassantSquare);

    return [
      ranks.join('/'),
      state.sideToMove === Color.White ? 'w' : 'b',
      castlingPart,
      enPassant,
      state.halfmoveClock.toString(),
      state.fullmoveNumber.toString()
    ].join(' ');
  }

  loadFEN(fen: string) {
    this.reset(fen);
  }

  private notationToSquare(notation: string): number {
    const file = notation.charCodeAt(0) - 97;
    const rank = Number(notation[1]) - 1;
    return rank * 8 + file;
  }

  private cloneState(state: GameStateSnapshot): GameStateSnapshot {
    const bitboards: Record<Color, Record<Piece, Bitboard>> = this.createEmptyBitboards();
    for (const color of COLORS) {
      for (const piece of PIECES) {
        bitboards[color][piece] = state.bitboards[color][piece];
      }
    }
    return {
      bitboards,
      castling: { ...state.castling },
      sideToMove: state.sideToMove,
      enPassantSquare: state.enPassantSquare,
      halfmoveClock: state.halfmoveClock,
      fullmoveNumber: state.fullmoveNumber
    };
  }

  private occupancy(state: GameStateSnapshot, color?: Color): Bitboard {
    if (color === undefined) {
      return COLORS.reduce((acc, clr) => acc | this.occupancy(state, clr), 0n);
    }
    let occ = 0n;
    for (const piece of PIECES) {
      occ |= state.bitboards[color][piece];
    }
    return occ;
  }

  private getPieceAtSquare(state: GameStateSnapshot, square: number): { color: Color; piece: Piece } | null {
    const mask = squareToBit(square);
    for (const color of COLORS) {
      for (const piece of PIECES) {
        if ((state.bitboards[color][piece] & mask) !== 0n) {
          return { color, piece };
        }
      }
    }
    return null;
  }

  private isSquareAttacked(state: GameStateSnapshot, square: number, byColor: Color): boolean {
    const opponent = byColor;
      const occupied = this.occupancy(state);

    // Pawns
    const pawnBoard = state.bitboards[opponent][Piece.Pawn];
    let pawns = pawnBoard;
    while (pawns) {
      const lsb = pawns & -pawns;
      const from = Number(log2(lsb));
      if ((pawnAttacks(from, opponent === Color.White) & squareToBit(square)) !== 0n) {
        return true;
      }
      pawns ^= lsb;
    }

    // Knights
    const knightBoard = state.bitboards[opponent][Piece.Knight];
    if ((this.attackMaskFromBitboard(knightBoard, KNIGHT_MOVES) & squareToBit(square)) !== 0n) {
      return true;
    }

    // Bishops and Queens
    const bishopBoard = state.bitboards[opponent][Piece.Bishop] | state.bitboards[opponent][Piece.Queen];
    if ((this.slidingAttacksFromBitboard(bishopBoard, (sq) => bishopAttacks(sq, occupied)) & squareToBit(square)) !== 0n) {
      return true;
    }

    // Rooks and Queens
    const rookBoard = state.bitboards[opponent][Piece.Rook] | state.bitboards[opponent][Piece.Queen];
    if ((this.slidingAttacksFromBitboard(rookBoard, (sq) => rookAttacks(sq, occupied)) & squareToBit(square)) !== 0n) {
      return true;
    }

    // Kings
    const kingBoard = state.bitboards[opponent][Piece.King];
    if ((this.attackMaskFromBitboard(kingBoard, KING_MOVES) & squareToBit(square)) !== 0n) {
      return true;
    }

    return false;
  }

  private attackMaskFromBitboard(bitboard: Bitboard, lookup: Bitboard[]): Bitboard {
    let mask = 0n;
    let board = bitboard;
    while (board) {
      const lsb = board & -board;
      const square = Number(log2(lsb));
      mask |= lookup[square];
      board ^= lsb;
    }
    return mask;
  }

  private slidingAttacksFromBitboard(bitboard: Bitboard, generator: (square: number) => Bitboard): Bitboard {
    let mask = 0n;
    let board = bitboard;
    while (board) {
      const lsb = board & -board;
      const square = Number(log2(lsb));
      mask |= generator(square);
      board ^= lsb;
    }
    return mask;
  }

  private inCheck(state: GameStateSnapshot, color: Color): boolean {
    const kingBoard = state.bitboards[color][Piece.King];
    if (kingBoard === 0n) return false;
    const square = Number(log2(kingBoard & -kingBoard));
    const opponent = color === Color.White ? Color.Black : Color.White;
    return this.isSquareAttacked(state, square, opponent);
  }

  generateLegalMoves(state: GameStateSnapshot = this.state): MoveWithNotation[] {
    const moves = this.generatePseudoLegalMoves(state);
    const legalMoves: MoveWithNotation[] = [];
    for (const move of moves) {
      const next = this.applyMove(state, move);
      if (!this.inCheck(next, move.color)) {
        legalMoves.push({ ...move, san: this.buildSAN(state, move, next), fen: this.toFEN(next) });
      }
    }
    return legalMoves;
  }

  private generatePseudoLegalMoves(state: GameStateSnapshot): Move[] {
    const moves: Move[] = [];
    const us = state.sideToMove;
    const them = us === Color.White ? Color.Black : Color.White;
    const occupied = this.occupancy(state);
    const ourOccupied = this.occupancy(state, us);

    // Pawns
    let pawns = state.bitboards[us][Piece.Pawn];
    while (pawns) {
      const lsb = pawns & -pawns;
      const from = Number(log2(lsb));
      const [rank, file] = squareToCoords(from);
      const forward = us === Color.White ? 8 : -8;
      const startRank = us === Color.White ? 1 : 6;
      const promotionRank = us === Color.White ? 6 : 1;

      const singleTarget = from + forward;
      if (singleTarget >= 0 && singleTarget < 64 && ((occupied & squareToBit(singleTarget)) === 0n)) {
        if (rank === promotionRank) {
          for (const promotion of PROMOTION_PIECES) {
            moves.push({ from, to: singleTarget, piece: Piece.Pawn, color: us, promotion });
          }
        } else {
          moves.push({ from, to: singleTarget, piece: Piece.Pawn, color: us });
        }

        const doubleTarget = from + forward * 2;
        if (rank === startRank && ((occupied & squareToBit(doubleTarget)) === 0n)) {
          moves.push({ from, to: doubleTarget, piece: Piece.Pawn, color: us, doublePush: true });
        }
      }

      const captureOffsets = us === Color.White ? [7, 9] : [-7, -9];
      for (const offset of captureOffsets) {
        const target = from + offset;
        if (target < 0 || target >= 64) continue;
        const [, targetFile] = squareToCoords(target);
        if (Math.abs(targetFile - file) !== 1) continue;
        const piece = this.getPieceAtSquare(state, target);
        if (piece && piece.color === them) {
          if (rank === promotionRank) {
            for (const promotion of PROMOTION_PIECES) {
              moves.push({ from, to: target, piece: Piece.Pawn, color: us, capture: piece.piece, promotion });
            }
          } else {
            moves.push({ from, to: target, piece: Piece.Pawn, color: us, capture: piece.piece });
          }
        } else if (state.enPassantSquare === target) {
          moves.push({ from, to: target, piece: Piece.Pawn, color: us, enPassant: true, capture: Piece.Pawn });
        }
      }

      pawns ^= lsb;
    }

    // Knights
    let knights = state.bitboards[us][Piece.Knight];
    while (knights) {
      const lsb = knights & -knights;
      const from = Number(log2(lsb));
      const attacks = KNIGHT_MOVES[from];
      let targets = attacks & ~ourOccupied;
      while (targets) {
        const tLsb = targets & -targets;
        const to = Number(log2(tLsb));
        const captured = this.getPieceAtSquare(state, to);
        moves.push({
          from,
          to,
          piece: Piece.Knight,
          color: us,
          capture: captured?.color === them ? captured.piece : undefined
        });
        targets ^= tLsb;
      }
      knights ^= lsb;
    }

    const slidingPieces: Array<{ board: Bitboard; piece: Piece; generator: (square: number) => Bitboard }> = [
      {
        board: state.bitboards[us][Piece.Bishop],
        piece: Piece.Bishop,
        generator: (sq) => bishopAttacks(sq, occupied)
      },
      {
        board: state.bitboards[us][Piece.Rook],
        piece: Piece.Rook,
        generator: (sq) => rookAttacks(sq, occupied)
      },
      {
        board: state.bitboards[us][Piece.Queen],
        piece: Piece.Queen,
        generator: (sq) => queenAttacks(sq, occupied)
      }
    ];

    for (const { board, piece, generator } of slidingPieces) {
      let pieces = board;
      while (pieces) {
        const lsb = pieces & -pieces;
        const from = Number(log2(lsb));
        let targets = generator(from) & ~ourOccupied;
        while (targets) {
          const tLsb = targets & -targets;
          const to = Number(log2(tLsb));
          const captured = this.getPieceAtSquare(state, to);
          moves.push({
            from,
            to,
            piece,
            color: us,
            capture: captured?.color === them ? captured.piece : undefined
          });
          targets ^= tLsb;
        }
        pieces ^= lsb;
      }
    }

    // King moves
    const kingBoard = state.bitboards[us][Piece.King];
    if (kingBoard) {
      const from = Number(log2(kingBoard));
      let targets = KING_MOVES[from] & ~ourOccupied;
      while (targets) {
        const tLsb = targets & -targets;
        const to = Number(log2(tLsb));
        const captured = this.getPieceAtSquare(state, to);
        moves.push({
          from,
          to,
          piece: Piece.King,
          color: us,
          capture: captured?.color === them ? captured.piece : undefined
        });
        targets ^= tLsb;
      }

      // Castling
      const inCheck = this.isSquareAttacked(state, from, them);
      if (!inCheck) {
        if (us === Color.White) {
          if (state.castling.whiteKingSide && this.canCastleKingSide(state, Color.White)) {
            moves.push({ from, to: 6, piece: Piece.King, color: us, castle: 'K' });
          }
          if (state.castling.whiteQueenSide && this.canCastleQueenSide(state, Color.White)) {
            moves.push({ from, to: 2, piece: Piece.King, color: us, castle: 'Q' });
          }
        } else {
          if (state.castling.blackKingSide && this.canCastleKingSide(state, Color.Black)) {
            moves.push({ from, to: 62, piece: Piece.King, color: us, castle: 'K' });
          }
          if (state.castling.blackQueenSide && this.canCastleQueenSide(state, Color.Black)) {
            moves.push({ from, to: 58, piece: Piece.King, color: us, castle: 'Q' });
          }
        }
      }
    }

    return moves;
  }

  private canCastleKingSide(state: GameStateSnapshot, color: Color): boolean {
    const rookSquare = ROOK_START_SQUARES[color].king;
    const kingSquare = KING_START_SQUARE[color];
    const intermediateSquares = color === Color.White ? [5, 6] : [61, 62];
    const them = color === Color.White ? Color.Black : Color.White;
    const rook = this.getPieceAtSquare(state, rookSquare);
    if (!rook || rook.color !== color || rook.piece !== Piece.Rook) return false;
    const occupied = this.occupancy(state);
    for (const square of intermediateSquares) {
      if ((occupied & squareToBit(square)) !== 0n) {
        return false;
      }
      if (this.isSquareAttacked(state, square, them)) {
        return false;
      }
    }
    if (this.isSquareAttacked(state, kingSquare, them)) return false;
    return true;
  }

  private canCastleQueenSide(state: GameStateSnapshot, color: Color): boolean {
    const rookSquare = ROOK_START_SQUARES[color].queen;
    const kingSquare = KING_START_SQUARE[color];
    const intermediateSquares = color === Color.White ? [3, 2, 1] : [59, 58, 57];
    const checkSquares = intermediateSquares.slice(0, 2);
    const them = color === Color.White ? Color.Black : Color.White;
    const rook = this.getPieceAtSquare(state, rookSquare);
    if (!rook || rook.color !== color || rook.piece !== Piece.Rook) return false;
    const occupied = this.occupancy(state);
    for (const square of intermediateSquares) {
      if ((occupied & squareToBit(square)) !== 0n) {
        return false;
      }
    }
    if (this.isSquareAttacked(state, kingSquare, them)) return false;
    for (const square of checkSquares) {
      if (this.isSquareAttacked(state, square, them)) return false;
    }
    return true;
  }

  private applyMove(state: GameStateSnapshot, move: Move): GameStateSnapshot {
    const next = this.cloneState(state);
    const us = move.color;
    const them = us === Color.White ? Color.Black : Color.White;
    const fromMask = squareToBit(move.from);
    const toMask = squareToBit(move.to);

    // Remove piece from origin
    next.bitboards[us][move.piece] &= ~fromMask;

    // Handle captures
    if (move.enPassant) {
      const captureSquare = move.to + (us === Color.White ? -8 : 8);
      const captureMask = squareToBit(captureSquare);
      next.bitboards[them][Piece.Pawn] &= ~captureMask;
    } else if (move.capture !== undefined) {
      for (const piece of PIECES) {
        if ((next.bitboards[them][piece] & toMask) !== 0n) {
          next.bitboards[them][piece] &= ~toMask;
        }
      }
    }

    // Move rook for castling
    if (move.castle) {
      if (move.castle === 'K') {
        const rookFrom = ROOK_START_SQUARES[us].king;
        const rookTo = move.to - 1;
        next.bitboards[us][Piece.Rook] &= ~squareToBit(rookFrom);
        next.bitboards[us][Piece.Rook] |= squareToBit(rookTo);
      } else {
        const rookFrom = ROOK_START_SQUARES[us].queen;
        const rookTo = move.to + 1;
        next.bitboards[us][Piece.Rook] &= ~squareToBit(rookFrom);
        next.bitboards[us][Piece.Rook] |= squareToBit(rookTo);
      }
    }

    // Place moving piece
    if (move.promotion) {
      next.bitboards[us][move.promotion] |= toMask;
    } else {
      next.bitboards[us][move.piece] |= toMask;
    }

    // Update castling rights
    if (move.piece === Piece.King) {
      if (us === Color.White) {
        next.castling.whiteKingSide = false;
        next.castling.whiteQueenSide = false;
      } else {
        next.castling.blackKingSide = false;
        next.castling.blackQueenSide = false;
      }
    }

    if (move.piece === Piece.Rook) {
      if (us === Color.White) {
        if (move.from === ROOK_START_SQUARES[Color.White].king) next.castling.whiteKingSide = false;
        if (move.from === ROOK_START_SQUARES[Color.White].queen) next.castling.whiteQueenSide = false;
      } else {
        if (move.from === ROOK_START_SQUARES[Color.Black].king) next.castling.blackKingSide = false;
        if (move.from === ROOK_START_SQUARES[Color.Black].queen) next.castling.blackQueenSide = false;
      }
    }

    if (move.capture !== undefined) {
      if (move.to === ROOK_START_SQUARES[them].king) {
        if (them === Color.White) {
          next.castling.whiteKingSide = false;
        } else {
          next.castling.blackKingSide = false;
        }
      }
      if (move.to === ROOK_START_SQUARES[them].queen) {
        if (them === Color.White) {
          next.castling.whiteQueenSide = false;
        } else {
          next.castling.blackQueenSide = false;
        }
      }
    }

    // Update clocks
    if (move.piece === Piece.Pawn || move.capture !== undefined) {
      next.halfmoveClock = 0;
    } else {
      next.halfmoveClock += 1;
    }

    if (us === Color.Black) {
      next.fullmoveNumber += 1;
    }

    // Update en passant
    if (move.doublePush) {
      next.enPassantSquare = move.to + (us === Color.White ? -8 : 8);
    } else {
      next.enPassantSquare = null;
    }

    // Switch side to move
    next.sideToMove = them;

    return next;
  }

  makeMove(move: Move): MoveWithNotation {
    const legalMoves = this.generateLegalMoves(this.state);
    const match = legalMoves.find(
      (candidate) =>
        candidate.from === move.from &&
        candidate.to === move.to &&
        candidate.piece === move.piece &&
        candidate.promotion === move.promotion
    );
    if (!match) {
      throw new Error('Illegal move');
    }

    this.state = this.applyMove(this.state, match);
    this.history.push({ move: match, state: this.cloneState(this.state) });
    this.future.length = 0;
    this.addRepetitionEntry(this.state);
    return match;
  }

  makeSANMove(san: string): MoveWithNotation {
    const legalMoves = this.generateLegalMoves();
    const move = legalMoves.find((candidate) => candidate.san === san);
    if (!move) {
      throw new Error(`Illegal move: ${san}`);
    }
    this.state = this.applyMove(this.state, move);
    this.history.push({ move, state: this.cloneState(this.state) });
    this.future.length = 0;
    this.addRepetitionEntry(this.state);
    return move;
  }

  undo(): MoveWithNotation | null {
    if (this.history.length <= 1) return null;
    const current = this.history.pop();
    if (!current) return null;
    this.future.unshift(current);
    const previous = this.history[this.history.length - 1];
    this.state = this.cloneState(previous.state);
    this.rebuildRepetition();
    return current.move;
  }

  redo(): MoveWithNotation | null {
    const next = this.future.shift();
    if (!next) return null;
    this.state = this.cloneState(next.state);
    this.history.push(next);
    this.addRepetitionEntry(this.state);
    return next.move;
  }

  private rebuildRepetition() {
    this.repetitionTable.clear();
    for (const entry of this.history) {
      this.addRepetitionEntry(entry.state);
    }
  }

  private addRepetitionEntry(state: GameStateSnapshot) {
    const key = this.positionKey(state);
    this.repetitionTable.set(key, (this.repetitionTable.get(key) ?? 0) + 1);
  }

  private positionKey(state: GameStateSnapshot): string {
    const bitboards: string[] = [];
    for (const color of COLORS) {
      for (const piece of PIECES) {
        bitboards.push(state.bitboards[color][piece].toString());
      }
    }
    return [
      bitboards.join(','),
      state.sideToMove,
      state.castling.whiteKingSide ? 'K' : '-',
      state.castling.whiteQueenSide ? 'Q' : '-',
      state.castling.blackKingSide ? 'k' : '-',
      state.castling.blackQueenSide ? 'q' : '-',
      state.enPassantSquare ?? '-'
    ].join('|');
  }

  private buildSAN(state: GameStateSnapshot, move: Move, next: GameStateSnapshot): string {
    const pieceSymbol = move.piece === Piece.Pawn ? '' : PIECE_TO_SYMBOL[move.color][move.piece];
    if (move.castle === 'K') return 'O-O';
    if (move.castle === 'Q') return 'O-O-O';

    const captures = move.capture !== undefined ? 'x' : '';
    let fromNotation = '';
    if (move.piece === Piece.Pawn && captures) {
      fromNotation = squareToNotation(move.from)[0];
    } else if (move.piece !== Piece.Pawn) {
      const disambiguation = this.disambiguate(state, move);
      fromNotation = disambiguation;
    }

    const toNotation = squareToNotation(move.to);
    const promotion = move.promotion ? `=${PIECE_TO_SYMBOL[move.color][move.promotion]}` : '';
    const checkSuffix = this.inCheck(next, move.color === Color.White ? Color.Black : Color.White)
      ? this.generateLegalMoves(next).length === 0
        ? '#'
        : '+'
      : '';

    return `${pieceSymbol}${fromNotation}${captures}${toNotation}${promotion}${checkSuffix}`;
  }

  private disambiguate(state: GameStateSnapshot, move: Move): string {
    const duplicates = this.generatePseudoLegalMoves(state).filter(
      (candidate) =>
        candidate.piece === move.piece &&
        candidate.color === move.color &&
        candidate.to === move.to &&
        candidate.from !== move.from
    );
    if (duplicates.length === 0) return '';
    const [rank, file] = squareToCoords(move.from);
    const needFile = duplicates.some((candidate) => squareToCoords(candidate.from)[1] === file);
    const needRank = duplicates.some((candidate) => squareToCoords(candidate.from)[0] === rank);
    if (needFile && needRank) {
      return squareToNotation(move.from);
    }
    if (needFile) {
      return (squareToNotation(move.from)[1] ?? '').toString();
    }
    return squareToNotation(move.from)[0];
  }

  getMoveHistory(): MoveWithNotation[] {
    return this.history
      .filter((entry) => entry.move)
      .map((entry) => entry.move as MoveWithNotation);
  }

  exportPGN(): string {
    const moves = this.getMoveHistory();
    const lines: string[] = [];
    let turn = 1;
    for (let i = 0; i < moves.length; i += 2) {
      const whiteMove = moves[i];
      const blackMove = moves[i + 1];
      const pair = `${turn}. ${whiteMove?.san ?? ''}${blackMove ? ' ' + blackMove.san : ''}`.trim();
      lines.push(pair);
      turn++;
    }
    return lines.join(' ');
  }

  importPGN(pgn: string) {
    const tokens = pgn
      .replace(/\{[^}]*\}/g, '')
      .replace(/\[[^\]]*\]/g, '')
      .split(/\s+/)
      .filter(Boolean)
      .filter((token) => !/^[0-9]+\./.test(token));
    this.reset();
    for (const token of tokens) {
      this.makeSANMove(token);
    }
  }

  perft(depth: number): number {
    return this.perftForState(this.state, depth);
  }

  private perftForState(state: GameStateSnapshot, depth: number): number {
    if (depth === 0) return 1;
    let nodes = 0;
    const moves = this.generateLegalMoves(state);
    for (const move of moves) {
      const next = this.applyMove(state, move);
      nodes += this.perftForState(next, depth - 1);
    }
    return nodes;
  }

  evaluate(state: GameStateSnapshot = this.state): number {
    let score = 0;
    for (const color of COLORS) {
      const sign = color === Color.White ? 1 : -1;
      for (const piece of PIECES) {
        const bitboard = state.bitboards[color][piece];
        let board = bitboard;
        while (board) {
          const lsb = board & -board;
          score += sign * PIECE_VALUES[piece];
          board ^= lsb;
        }
      }
    }
    return score;
  }

  search(maxDepth: number, timeLimitMs: number): MoveSearchResult {
    const deadline = Date.now() + timeLimitMs;
    let bestMove: MoveWithNotation | null = null;
    let bestEval = -Infinity;
    let nodes = 0;
    const side = this.state.sideToMove;

    for (let depth = 1; depth <= Math.min(maxDepth, MAX_SEARCH_DEPTH); depth++) {
      const result = this.alphaBeta(this.cloneState(this.state), depth, -Infinity, Infinity, side, deadline);
      nodes += result.nodes;
      if (Date.now() > deadline) break;
      bestEval = result.evaluation;
      bestMove = result.bestMove ?? bestMove;
    }

    return { bestMove, depth: maxDepth, evaluation: bestEval, nodes };
  }

  private alphaBeta(
    state: GameStateSnapshot,
    depth: number,
    alpha: number,
    beta: number,
    maximizingColor: Color,
    deadline: number
  ): MoveSearchResult {
    if (Date.now() > deadline) {
      return { bestMove: null, depth, evaluation: this.evaluate(state), nodes: 0 };
    }

    if (depth === 0) {
      return { bestMove: null, depth, evaluation: this.evaluate(state), nodes: 1 };
    }

    const moves = this.generateLegalMoves(state);
    if (moves.length === 0) {
      const colorToMove = state.sideToMove;
      if (this.inCheck(state, colorToMove)) {
        const mateScore = colorToMove === maximizingColor ? -Infinity : Infinity;
        return { bestMove: null, depth, evaluation: mateScore, nodes: 1 };
      }
      return { bestMove: null, depth, evaluation: 0, nodes: 1 };
    }

    let bestMove: MoveWithNotation | null = null;
    let nodes = 0;

    if (state.sideToMove === maximizingColor) {
      let value = -Infinity;
      for (const move of moves) {
        const next = this.applyMove(state, move);
        const result = this.alphaBeta(next, depth - 1, alpha, beta, maximizingColor, deadline);
        nodes += result.nodes;
        if (result.evaluation > value) {
          value = result.evaluation;
          bestMove = move;
        }
        alpha = Math.max(alpha, value);
        if (alpha >= beta) break;
      }
      return { bestMove, depth, evaluation: value, nodes };
    }

    let value = Infinity;
    for (const move of moves) {
      const next = this.applyMove(state, move);
      const result = this.alphaBeta(next, depth - 1, alpha, beta, maximizingColor, deadline);
      nodes += result.nodes;
      if (result.evaluation < value) {
        value = result.evaluation;
        bestMove = move;
      }
      beta = Math.min(beta, value);
      if (alpha >= beta) break;
    }
    return { bestMove, depth, evaluation: value, nodes };
  }

  getGameStatus(): 'ongoing' | 'checkmate' | 'stalemate' | 'fifty-move' | 'threefold' {
    if (this.state.halfmoveClock >= 100) return 'fifty-move';
    const key = this.positionKey(this.state);
    if ((this.repetitionTable.get(key) ?? 0) >= 3) {
      return 'threefold';
    }
    const moves = this.generateLegalMoves();
    if (moves.length === 0) {
      return this.inCheck(this.state, this.state.sideToMove) ? 'checkmate' : 'stalemate';
    }
    return 'ongoing';
  }
}

function log2(value: Bitboard): bigint {
  let log = 0n;
  let temp = value;
  while (temp > 1n) {
    temp >>= 1n;
    log++;
  }
  return log;
}

export { START_FEN };
