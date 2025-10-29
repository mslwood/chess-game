import clsx from 'clsx';
import { useMemo } from 'react';
import { popCount } from '../engine/bitboard';
import { Color, Piece, PIECES } from '../engine/types';
import { STATUS_LABEL } from '../constants/status';
import { useChessStore } from '../state/chessStore';

const INITIAL_PIECE_COUNTS: Record<Color, Record<Piece, number>> = {
  [Color.White]: {
    [Piece.Pawn]: 8,
    [Piece.Knight]: 2,
    [Piece.Bishop]: 2,
    [Piece.Rook]: 2,
    [Piece.Queen]: 1,
    [Piece.King]: 1
  },
  [Color.Black]: {
    [Piece.Pawn]: 8,
    [Piece.Knight]: 2,
    [Piece.Bishop]: 2,
    [Piece.Rook]: 2,
    [Piece.Queen]: 1,
    [Piece.King]: 1
  }
};

const PIECE_GLYPHS: Record<Color, Record<Piece, string>> = {
  [Color.White]: {
    [Piece.Pawn]: '♙',
    [Piece.Knight]: '♘',
    [Piece.Bishop]: '♗',
    [Piece.Rook]: '♖',
    [Piece.Queen]: '♕',
    [Piece.King]: '♔'
  },
  [Color.Black]: {
    [Piece.Pawn]: '♟',
    [Piece.Knight]: '♞',
    [Piece.Bishop]: '♝',
    [Piece.Rook]: '♜',
    [Piece.Queen]: '♛',
    [Piece.King]: '♚'
  }
};

export function GameSummary() {
  const { snapshot, moves, status } = useChessStore((state) => ({
    snapshot: state.snapshot,
    moves: state.moves,
    status: state.status
  }));

  const info = useMemo(() => {
    const currentCounts: Record<Color, Record<Piece, number>> = {
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

    for (const color of [Color.White, Color.Black]) {
      for (const piece of PIECES) {
        currentCounts[color][piece] = popCount(snapshot.bitboards[color][piece]);
      }
    }

    const capturedByWhite: string[] = [];
    const capturedByBlack: string[] = [];

    for (const piece of PIECES) {
      const missingBlackPieces =
        INITIAL_PIECE_COUNTS[Color.Black][piece] - currentCounts[Color.Black][piece];
      const missingWhitePieces =
        INITIAL_PIECE_COUNTS[Color.White][piece] - currentCounts[Color.White][piece];

      if (missingBlackPieces > 0) {
        capturedByWhite.push(...Array.from({ length: missingBlackPieces }, () => PIECE_GLYPHS[Color.Black][piece]));
      }

      if (missingWhitePieces > 0) {
        capturedByBlack.push(...Array.from({ length: missingWhitePieces }, () => PIECE_GLYPHS[Color.White][piece]));
      }
    }

    return {
      capturedByWhite,
      capturedByBlack,
      lastMove: moves[moves.length - 1]?.san ?? '—'
    };
  }, [moves, snapshot]);

  return (
    <section className="rounded-3xl border border-slate-800/70 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/40">
      <div className="grid gap-5 sm:grid-cols-2">
        <PlayerCard
          color={Color.White}
          label="White"
          active={snapshot.sideToMove === Color.White}
          captured={info.capturedByWhite}
        />
        <PlayerCard
          color={Color.Black}
          label="Black"
          active={snapshot.sideToMove === Color.Black}
          captured={info.capturedByBlack}
        />
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-300">
        <span className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          Move {snapshot.fullmoveNumber} · Half-move clock {snapshot.halfmoveClock}
        </span>
        <span className="font-medium text-slate-100">Last move: {info.lastMove}</span>
        <span className="text-emerald-300">{STATUS_LABEL[status] ?? status}</span>
      </div>
    </section>
  );
}

interface PlayerCardProps {
  color: Color;
  label: string;
  active: boolean;
  captured: string[];
}

function PlayerCard({ color, label, active, captured }: PlayerCardProps) {
  const kingGlyph = PIECE_GLYPHS[color][Piece.King];
  const opponentColor = color === Color.White ? Color.Black : Color.White;
  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-2xl border bg-slate-950/40 p-5 transition-colors',
        active
          ? 'border-emerald-500/70 ring-2 ring-emerald-400/40'
          : 'border-slate-800/80'
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
          <p className="text-lg font-semibold text-white">{active ? 'Your turn' : 'Waiting'}</p>
        </div>
        <span className="text-4xl" aria-hidden="true">
          {kingGlyph}
        </span>
      </div>
      <div className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-500">Captured</div>
      <div className="mt-2 flex min-h-[28px] flex-wrap gap-1 text-xl text-emerald-200">
        {captured.length > 0 ? (
          captured.map((glyph, index) => <span key={`${opponentColor}-${index}`}>{glyph}</span>)
        ) : (
          <span className="text-sm text-slate-500">No captures yet</span>
        )}
      </div>
      {active && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-emerald-500/10 blur-3xl" aria-hidden="true" />
      )}
    </div>
  );
}
