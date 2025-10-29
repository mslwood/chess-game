import { ChessBoard } from './components/ChessBoard';
import { ControlPanel } from './components/ControlPanel';
import { MoveHistory } from './components/MoveHistory';
import { PromotionDialog } from './components/PromotionDialog';
import { useChessStore } from './state/chessStore';

export default function App() {
  const status = useChessStore((state) => state.status);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-20 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_60%)]" />
      <header className="px-6 pt-10 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">Aurora Chess</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Enjoy a fully featured chess analysis board with AI opponent, PGN/FEN tooling, move history,
          and lightning-fast bitboard engine. Drag and drop pieces, explore lines, or let the computer
          think for you.
        </p>
      </header>
      <main className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[minmax(0,1fr)_360px]">
        <section className="relative flex justify-center">
          <div className="relative">
            <ChessBoard />
            <PromotionDialog />
          </div>
        </section>
        <aside className="space-y-6">
          <ControlPanel />
          <MoveHistory />
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
            <p>
              Status: <span className="font-semibold text-emerald-300">{status}</span>
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Aurora Chess features undo/redo, SAN move list, PGN import/export, and a perft-tested engine
              with legal move generation including castling, en passant, promotions, and repetition/50-move
              draw detection.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
