import { useMemo, type ReactNode } from 'react';
import { ClockIcon, ScaleIcon, SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useChessStore } from '../state/chessStore';
import { Color, Piece } from '../engine/types';
import {
  calculateMaterial,
  evaluationRatio,
  formatCastlingRights,
  formatEvaluation
} from '../utils/board';
import type { MaterialSummarySide } from '../utils/board';

const MATERIAL_ITEMS: Array<{ piece: Piece; white: string; black: string; label: string }> = [
  { piece: Piece.Queen, white: '♕', black: '♛', label: 'Queen' },
  { piece: Piece.Rook, white: '♖', black: '♜', label: 'Rook' },
  { piece: Piece.Bishop, white: '♗', black: '♝', label: 'Bishop' },
  { piece: Piece.Knight, white: '♘', black: '♞', label: 'Knight' },
  { piece: Piece.Pawn, white: '♙', black: '♟', label: 'Pawn' }
];

export function GameInsights() {
  const { snapshot, evaluation, lastSearch } = useChessStore((state) => ({
    snapshot: state.snapshot,
    evaluation: state.evaluation,
    lastSearch: state.lastSearch
  }));

  const material = useMemo(() => calculateMaterial(snapshot), [snapshot]);
  const castling = formatCastlingRights(snapshot.castling);
  const sideToMove = snapshot.sideToMove === Color.White ? 'White to move' : 'Black to move';
  const evaluationPercent = Math.round(evaluationRatio(evaluation) * 100);
  const materialBalance =
    material.balance > 0
      ? `White +${material.balance.toFixed(1)}`
      : material.balance < 0
      ? `Black +${Math.abs(material.balance).toFixed(1)}`
      : 'Material even';

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">Game insights</h2>
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
          <SparklesIcon className="h-3 w-3" />
          Live
        </span>
      </header>

      <div className="mt-4 rounded-xl border border-slate-800/60 bg-slate-900/80 p-4 shadow-inner">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
          <span>Engine evaluation</span>
          <span className="text-base font-semibold text-emerald-300">{formatEvaluation(evaluation)}</span>
        </div>
        <div className="mt-3 h-3 w-full rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-emerald-500 transition-all"
            style={{ width: `${evaluationPercent}%` }}
            aria-hidden
          />
        </div>
        <p className="mt-3 text-xs text-slate-400">Positive values favour White, negative favour Black.</p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-4 text-xs text-slate-300">
        <InfoRow
          icon={<SparklesIcon className="h-4 w-4 text-emerald-300" />}
          label="Turn"
          value={sideToMove}
        />
        <InfoRow
          icon={<ScaleIcon className="h-4 w-4 text-sky-300" />}
          label="Material"
          value={materialBalance}
        />
        <InfoRow
          icon={<ShieldCheckIcon className="h-4 w-4 text-indigo-300" />}
          label="White castling"
          value={castling.white}
        />
        <InfoRow
          icon={<ShieldCheckIcon className="h-4 w-4 text-indigo-300" />}
          label="Black castling"
          value={castling.black}
        />
        <InfoRow
          icon={<ClockIcon className="h-4 w-4 text-amber-300" />}
          label="Fullmove"
          value={`#${snapshot.fullmoveNumber}`}
        />
        <InfoRow
          icon={<ClockIcon className="h-4 w-4 text-amber-300" />}
          label="Halfmove clock"
          value={`${snapshot.halfmoveClock}`}
        />
      </dl>

      <div className="mt-6 grid gap-3 text-xs">
        <MaterialCard title="White pieces" summary={material.white} color="white" />
        <MaterialCard title="Black pieces" summary={material.black} color="black" />
      </div>

      {lastSearch && (
        <div className="mt-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs text-emerald-100">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <SparklesIcon className="h-4 w-4" />
            Latest AI suggestion
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <SearchStat label="Depth" value={`${lastSearch.depth} ply`} />
            <SearchStat label="Nodes" value={formatNumber(lastSearch.nodes)} />
            <SearchStat label="Eval" value={formatEvaluation(lastSearch.evaluation)} />
            <SearchStat label="Duration" value={`${Math.max(1, Math.round(lastSearch.durationMs))} ms`} />
          </div>
        </div>
      )}
    </section>
  );
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-800/70 bg-slate-900/70 px-3 py-2">
      <span className="rounded-lg bg-slate-800/80 p-1">{icon}</span>
      <div>
        <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
        <dd className="mt-0.5 text-sm text-slate-200">{value}</dd>
      </div>
    </div>
  );
}

function MaterialCard({
  title,
  summary,
  color
}: {
  title: string;
  summary: MaterialSummarySide;
  color: 'white' | 'black';
}) {
  const pieces = MATERIAL_ITEMS.filter((item) => summary.counts[item.piece] > 0);

  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-900/80 p-3">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        <span>{title}</span>
        <span className="text-slate-200">{summary.total.toFixed(1)} pts</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {pieces.length === 0 ? (
          <span className="text-[11px] text-slate-500">No pieces remaining</span>
        ) : (
          pieces.map((item) => (
            <span
              key={item.piece}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-800/80 px-2 py-1 text-[11px] text-slate-200"
            >
              <span>{color === 'white' ? item.white : item.black}</span>
              <span className="font-medium">×{summary.counts[item.piece]}</span>
              <span className="text-slate-400">{item.label}</span>
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function SearchStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-200">{label}</p>
      <p className="mt-1 text-sm font-semibold text-emerald-100">{value}</p>
    </div>
  );
}

function formatNumber(value: number) {
  if (value < 10_000) return `${value}`;
  if (value < 1_000_000) return `${(value / 1000).toFixed(1)}k`;
  return `${(value / 1_000_000).toFixed(1)}M`;
}
