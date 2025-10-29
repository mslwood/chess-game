import { useEffect, useMemo, useState } from 'react';
import { STATUS_LABEL } from '../constants/status';
import { useChessStore } from '../state/chessStore';

export function ControlPanel() {
  const { chess, snapshot, status, undo, redo, reset, runAI, loadPGN, loadFEN, aiThinking } = useChessStore((state) => ({
    chess: state.chess,
    snapshot: state.snapshot,
    status: state.status,
    undo: state.undo,
    redo: state.redo,
    reset: state.reset,
    runAI: state.runAI,
    loadPGN: state.loadPGN,
    loadFEN: state.loadFEN,
    aiThinking: state.aiThinking
  }));

  const fen = useMemo(() => chess.toFEN(snapshot), [chess, snapshot]);
  const [fenInput, setFenInput] = useState(fen);
  const [pgnInput, setPgnInput] = useState('');

  useEffect(() => {
    setFenInput(fen);
  }, [fen]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-3xl border border-slate-800/80 bg-slate-950/40 p-5 backdrop-blur">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Status</h2>
          <p className="text-base font-semibold text-slate-100">{STATUS_LABEL[status] ?? status}</p>
        </div>
        <button
          type="button"
          className="rounded-2xl border border-emerald-500/50 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/25"
          onClick={() => runAI(5, 3000)}
          disabled={aiThinking}
        >
          {aiThinking ? 'Thinking…' : 'Let AI move'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="rounded-2xl border border-slate-800/80 bg-slate-900/50 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-600 hover:bg-slate-800"
          onClick={undo}
        >
          Undo
        </button>
        <button
          type="button"
          className="rounded-2xl border border-slate-800/80 bg-slate-900/50 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-600 hover:bg-slate-800"
          onClick={redo}
        >
          Redo
        </button>
        <button
          type="button"
          className="col-span-2 rounded-2xl border border-rose-500/50 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20"
          onClick={() => reset()}
        >
          Reset game
        </button>
      </div>

      <section className="rounded-3xl border border-slate-800/80 bg-slate-950/40 p-5 backdrop-blur">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">FEN</h2>
        <textarea
          value={fenInput}
          onChange={(event) => setFenInput(event.target.value)}
          rows={3}
          className="w-full rounded-2xl border border-slate-800/70 bg-slate-900/60 p-3 text-sm text-slate-100 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200 transition hover:bg-emerald-500/20"
            onClick={() => loadFEN(fenInput)}
          >
            Load position
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800/80 bg-slate-950/40 p-5 backdrop-blur">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">PGN</h2>
        <textarea
          value={pgnInput}
          onChange={(event) => setPgnInput(event.target.value)}
          rows={6}
          placeholder="Paste PGN here"
          className="w-full rounded-2xl border border-slate-800/70 bg-slate-900/60 p-3 text-sm text-slate-100 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
        />
        <div className="mt-3 flex justify-between">
          <button
            type="button"
            className="rounded-xl border border-slate-700/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
            onClick={() => setPgnInput(chess.exportPGN())}
          >
            Export current PGN
          </button>
          <button
            type="button"
            className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200 transition hover:bg-emerald-500/20"
            onClick={() => loadPGN(pgnInput)}
          >
            Import PGN
          </button>
        </div>
      </section>
    </div>
  );
}
