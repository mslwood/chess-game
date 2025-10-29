import clsx from 'clsx';
import { useMemo } from 'react';
import { Color } from '../engine/types';
import { useChessStore } from '../state/chessStore';
import { squareLabel } from '../utils/board';
import { STATUS_DESCRIPTIONS, STATUS_LABELS, type GameStatus } from '../utils/status';

const STATUS_BADGE_STYLES: Record<GameStatus, string> = {
  ongoing: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  checkmate: 'border-rose-500/40 bg-rose-500/15 text-rose-200',
  stalemate: 'border-sky-500/40 bg-sky-500/15 text-sky-200',
  'fifty-move': 'border-amber-500/40 bg-amber-500/15 text-amber-200',
  threefold: 'border-indigo-500/40 bg-indigo-500/15 text-indigo-200'
};

export function GameSummary() {
  const { snapshot, status, moves } = useChessStore((state) => ({
    snapshot: state.snapshot,
    status: state.status,
    moves: state.moves
  }));

  const details = useMemo(() => {
    const lastMove = moves[moves.length - 1];
    const activeSide = snapshot.sideToMove === Color.White ? 'White' : 'Black';
    const castlingRights = [
      snapshot.castling.whiteKingSide ? 'White O-O' : null,
      snapshot.castling.whiteQueenSide ? 'White O-O-O' : null,
      snapshot.castling.blackKingSide ? 'Black O-O' : null,
      snapshot.castling.blackQueenSide ? 'Black O-O-O' : null
    ].filter(Boolean);

    return {
      activeSide,
      castling: castlingRights.length > 0 ? castlingRights.join(' · ') : 'No castling rights remaining',
      enPassant:
        snapshot.enPassantSquare === null
          ? 'None available'
          : squareLabel(snapshot.enPassantSquare),
      halfmoveClock: snapshot.halfmoveClock,
      fullmoveNumber: snapshot.fullmoveNumber,
      lastMoveLabel: lastMove
        ? `${lastMove.color === Color.White ? 'White' : 'Black'} played ${lastMove.san}`
        : 'No moves have been made yet',
      totalMoves: moves.length
    };
  }, [moves, snapshot]);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">Game overview</h2>
        <span
          className={clsx(
            'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide',
            STATUS_BADGE_STYLES[status]
          )}
        >
          {STATUS_LABELS[status]}
        </span>
      </div>
      <p className="mt-3 text-xs text-slate-400">{STATUS_DESCRIPTIONS[status]}</p>
      <dl className="mt-5 space-y-3">
        <SummaryRow label="Active player" value={`${details.activeSide} to move`} highlight={details.activeSide} />
        <SummaryRow label="Last move" value={details.lastMoveLabel} />
        <SummaryRow label="Castling rights" value={details.castling} />
        <SummaryRow label="En passant" value={details.enPassant} />
        <SummaryRow label="Halfmove clock" value={String(details.halfmoveClock)} />
        <SummaryRow label="Fullmove" value={String(details.fullmoveNumber)} />
        <SummaryRow label="Total moves" value={String(details.totalMoves)} />
      </dl>
    </section>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
  highlight?: string;
}

function SummaryRow({ label, value, highlight }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-800/40 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd
        className={clsx(
          'text-sm font-medium text-slate-100',
          highlight === 'White' && 'text-emerald-200',
          highlight === 'Black' && 'text-emerald-300'
        )}
      >
        {value}
      </dd>
    </div>
  );
}
