import { ChessBoard } from './components/ChessBoard';
import { ControlPanel } from './components/ControlPanel';
import { GameSummary } from './components/GameSummary';
import { MoveHistory } from './components/MoveHistory';
import { PromotionDialog } from './components/PromotionDialog';

export default function App() {

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 pb-20 text-slate-100">
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_60%)]" />
      <header className="mx-auto flex max-w-6xl flex-col gap-6 px-6 pt-12 pb-8 md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
            Enhanced UI
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Aurora Chess</h1>
            <p className="mt-3 max-w-2xl text-base text-slate-300">
              Experience a polished analysis board with live move insights, captured-piece tracking, and a
              fast bitboard engine. Challenge the built-in AI, import custom studies, or explore the PGN
              move list with ease.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <a
            href="https://github.com/mslwood/chess-game"
            className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 font-semibold text-slate-100 transition hover:border-slate-500 hover:text-white"
          >
            <span aria-hidden="true">★</span> Star on GitHub
          </a>
          <a
            href="#controls"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-4 py-2 font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
          >
            Explore tools
          </a>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[minmax(0,1fr)_360px]">
        <section className="relative flex justify-center">
          <div className="relative w-full max-w-[min(90vw,600px)] rounded-[2.5rem] border border-slate-800/60 bg-slate-900/50 p-6 shadow-[0_30px_80px_-40px_rgba(16,185,129,0.35)] backdrop-blur">
            <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_65%)]" />
            <ChessBoard />
            <PromotionDialog />
          </div>
        </section>
        <aside className="space-y-6" id="controls">
          <GameSummary />
          <ControlPanel />
          <MoveHistory />
          <div className="rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900/70 via-slate-950/60 to-slate-900/70 p-5 text-sm text-slate-300 shadow-lg shadow-emerald-900/20">
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Power tips</h3>
            <ul className="mt-3 space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-flex h-1.5 w-1.5 flex-none rounded-full bg-emerald-400" />
                <span>Drag pieces or tap squares to instantly preview every legal destination.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-flex h-1.5 w-1.5 flex-none rounded-full bg-emerald-400" />
                <span>Use undo/redo to explore alternative lines without losing your original analysis.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-flex h-1.5 w-1.5 flex-none rounded-full bg-emerald-400" />
                <span>Import PGNs or custom FEN positions, then let the AI suggest the next move.</span>
              </li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
