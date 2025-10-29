import type { ReactNode } from 'react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { ChessBoard } from './components/ChessBoard';
import { ControlPanel } from './components/ControlPanel';
import { FeatureHighlights } from './components/FeatureHighlights';
import { GameInsights } from './components/GameInsights';
import { MoveHistory } from './components/MoveHistory';
import { PromotionDialog } from './components/PromotionDialog';
import { useChessStore } from './state/chessStore';

export default function App() {
  const status = useChessStore((state) => state.status);
  const friendlyStatus =
    {
      ongoing: 'Game in progress',
      checkmate: 'Checkmate',
      stalemate: 'Stalemate',
      'fifty-move': 'Draw · 50-move rule',
      threefold: 'Draw · repetition'
    }[status] ?? status;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-24 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.22),_transparent_60%)]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-48 bg-[radial-gradient(80%_50%_at_50%_0%,rgba(59,130,246,0.15),transparent)]" />
      <header className="px-6 pt-10 pb-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">
              Aurora Chess
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Analyse smarter. Play sharper.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
              Explore complex middlegames, drill openings, or challenge the built-in engine with a tactile drag-and-drop
              board, advanced move insights, and streamlined PGN/FEN tooling all in one place.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
              <Badge>Live evaluation</Badge>
              <Badge>Perft tested engine</Badge>
              <Badge>PGN / FEN tools</Badge>
            </div>
          </div>
          <a
            href="https://github.com/mslwood/chess-game"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 self-start rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-white"
          >
            View source
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </a>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[minmax(0,1fr)_360px]">
        <section className="relative flex justify-center">
          <div className="relative">
            <ChessBoard />
            <PromotionDialog />
            <div className="pointer-events-none absolute -left-10 top-8 hidden h-24 w-24 rounded-full bg-emerald-500/10 blur-3xl md:block" />
          </div>
        </section>
        <aside className="space-y-6">
          <ControlPanel />
          <GameInsights />
          <MoveHistory />
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-300">
            {friendlyStatus}:{' '}
            <span className="font-semibold text-emerald-300 uppercase">{status}</span>. Undo/redo, SAN list, and AI analysis
            stay in sync even when importing PGN or custom FEN positions.
          </div>
        </aside>
      </main>
      <FeatureHighlights />
    </div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] text-emerald-200">
      {children}
    </span>
  );
}
