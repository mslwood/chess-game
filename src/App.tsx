import { ChessBoard } from './components/ChessBoard';
import { ControlPanel } from './components/ControlPanel';
import { GameSummary } from './components/GameSummary';
import { MoveHistory } from './components/MoveHistory';
import { PromotionDialog } from './components/PromotionDialog';
import { useChessStore } from './state/chessStore';
import { STATUS_LABELS } from './utils/status';

export default function App() {
  const status = useChessStore((state) => state.status);

  const highlights = [
    {
      title: 'Analysis ready',
      description: 'Drag and drop pieces to explore variations or set up puzzles instantly.'
    },
    {
      title: 'Engine support',
      description: 'Let the built-in AI suggest moves with a perft-tested bitboard engine.'
    },
    {
      title: 'PGN & FEN tools',
      description: 'Import or export positions for study, or share games with friends and coaches.'
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-20 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_60%)]" />
      <header className="px-6 pt-12 pb-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                {STATUS_LABELS[status]}
              </span>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Aurora Chess</h1>
                <p className="mt-3 text-base text-slate-300 sm:text-lg">
                  Enjoy a polished analysis board that feels at home on desktop or mobile. Set up studies, play against the
                  engine, and review every move in a calm, focused interface.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#board"
                  className="inline-flex items-center rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/25"
                >
                  Jump to board
                </a>
                <span className="text-xs text-slate-400">
                  Need a fresh start? Reset, import PGN, or load a FEN from the control panel.
                </span>
              </div>
            </div>
            <div className="max-w-sm rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-300 shadow-lg shadow-emerald-500/10">
              <p className="font-semibold text-slate-100">Why Aurora?</p>
              <p className="mt-2 text-xs leading-6 text-slate-400">
                Built for players and coaches who need a fast, reliable board with everyday conveniences—undo/redo, PGN
                workflows, and strong engine insights.
              </p>
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm transition hover:border-emerald-500/40 hover:shadow-emerald-500/10"
              >
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-xs text-slate-400">{item.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[minmax(0,1fr)_360px]">
        <section id="board" className="relative flex justify-center">
          <div className="relative">
            <ChessBoard />
            <PromotionDialog />
          </div>
        </section>
        <aside className="space-y-6">
          <ControlPanel />
          <GameSummary />
          <MoveHistory />
        </aside>
      </main>
      <footer className="mx-auto mt-16 max-w-6xl px-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-sm text-slate-300 shadow-lg shadow-emerald-500/5">
          <h2 className="text-lg font-semibold text-white">Quick tips for a smooth session</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            <li className="flex items-start gap-3 rounded-2xl bg-slate-950/40 p-4">
              <span className="mt-0.5 text-lg">♻️</span>
              <div>
                <p className="font-medium text-slate-100">Rewind with confidence</p>
                <p className="mt-1 text-xs text-slate-400">Use undo and redo to inspect branches without losing your main line.</p>
              </div>
            </li>
            <li className="flex items-start gap-3 rounded-2xl bg-slate-950/40 p-4">
              <span className="mt-0.5 text-lg">📥</span>
              <div>
                <p className="font-medium text-slate-100">Share studies easily</p>
                <p className="mt-1 text-xs text-slate-400">Import PGNs from lichess or export your own to send to teammates.</p>
              </div>
            </li>
            <li className="flex items-start gap-3 rounded-2xl bg-slate-950/40 p-4">
              <span className="mt-0.5 text-lg">⚡</span>
              <div>
                <p className="font-medium text-slate-100">Call on the engine</p>
                <p className="mt-1 text-xs text-slate-400">Tap “Let AI move” to see a strong suggestion when you are stuck.</p>
              </div>
            </li>
            <li className="flex items-start gap-3 rounded-2xl bg-slate-950/40 p-4">
              <span className="mt-0.5 text-lg">🎯</span>
              <div>
                <p className="font-medium text-slate-100">Set up training</p>
                <p className="mt-1 text-xs text-slate-400">Drop pieces anywhere with drag and drop or paste a FEN to jump to a puzzle.</p>
              </div>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
