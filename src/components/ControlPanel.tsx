import { useEffect, useMemo, useState, type ComponentProps, type ComponentType } from 'react';
import {
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  DocumentDuplicateIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useChessStore } from '../state/chessStore';

const statusLabel: Record<string, string> = {
  ongoing: 'Game in progress',
  checkmate: 'Checkmate',
  stalemate: 'Stalemate',
  'fifty-move': 'Draw · 50-move rule',
  threefold: 'Draw · Repetition'
};

const statusAccent: Record<string, string> = {
  ongoing: 'text-emerald-300',
  checkmate: 'text-rose-300',
  stalemate: 'text-sky-300',
  'fifty-move': 'text-slate-300',
  threefold: 'text-slate-300'
};

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
  const [fenCopied, setFenCopied] = useState<'idle' | 'copied' | 'error'>('idle');
  const [pgnCopied, setPgnCopied] = useState<'idle' | 'copied' | 'error'>('idle');

  useEffect(() => {
    setFenInput(fen);
  }, [fen]);

  const handleCopyFen = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(fenInput.trim());
      setFenCopied('copied');
    } catch {
      setFenCopied('error');
    }
    setTimeout(() => setFenCopied('idle'), 2000);
  };

  const handleCopyPgn = async () => {
    const current = chess.exportPGN();
    setPgnInput(current);
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(current);
      setPgnCopied('copied');
    } catch {
      setPgnCopied('error');
    }
    setTimeout(() => setPgnCopied('idle'), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">Status</h2>
            <p className="text-base font-medium text-slate-100">{statusLabel[status] ?? status}</p>
            <p className="mt-1 text-xs text-slate-400">Halfmove clock: {snapshot.halfmoveClock} · Fullmove: {snapshot.fullmoveNumber}</p>
          </div>
          <span className={`text-xs font-semibold uppercase tracking-wide ${statusAccent[status] ?? 'text-slate-300'}`}>
            {status.toUpperCase()}
          </span>
        </div>
        <button
          type="button"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/25 disabled:opacity-60"
          onClick={() => runAI(5, 3000)}
          disabled={aiThinking}
          aria-busy={aiThinking}
        >
          <SparklesIcon className={`h-4 w-4 ${aiThinking ? 'animate-spin' : ''}`} />
          {aiThinking ? 'AI thinking…' : 'Let the engine move'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ControlButton label="Undo" icon={ArrowUturnLeftIcon} onClick={undo} />
        <ControlButton label="Redo" icon={ArrowUturnRightIcon} onClick={redo} />
        <ControlButton
          label="Reset game"
          icon={ArrowPathIcon}
          onClick={() => reset()}
          className="col-span-2 border-rose-500/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
        />
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-200">FEN</h2>
        <textarea
          value={fenInput}
          onChange={(event) => setFenInput(event.target.value)}
          rows={3}
          className="w-full rounded-xl border border-slate-700 bg-slate-800/70 p-3 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <DocumentDuplicateIcon className="h-4 w-4" />
            <span>
              {fenCopied === 'copied' && <span className="text-emerald-300">Copied!</span>}
              {fenCopied === 'error' && <span className="text-rose-300">Clipboard unavailable</span>}
              {fenCopied === 'idle' && <span>Share or reload positions via FEN</span>}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
              onClick={handleCopyFen}
            >
              Copy
            </button>
            <button
              type="button"
              className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-200 transition hover:bg-emerald-500/20"
              onClick={() => loadFEN(fenInput)}
            >
              Load position
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-200">PGN</h2>
        <textarea
          value={pgnInput}
          onChange={(event) => setPgnInput(event.target.value)}
          rows={6}
          placeholder="Paste PGN here"
          className="w-full rounded-xl border border-slate-700 bg-slate-800/70 p-3 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <DocumentDuplicateIcon className="h-4 w-4" />
            <span>
              {pgnCopied === 'copied' && <span className="text-emerald-300">Copied current PGN!</span>}
              {pgnCopied === 'error' && <span className="text-rose-300">Clipboard unavailable</span>}
              {pgnCopied === 'idle' && <span>Import annotated games or copy the live score sheet</span>}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
              onClick={handleCopyPgn}
            >
              Copy current
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
              onClick={() => setPgnInput(chess.exportPGN())}
            >
              Fill from board
            </button>
            <button
              type="button"
              className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-200 transition hover:bg-emerald-500/20"
              onClick={() => loadPGN(pgnInput)}
            >
              Import PGN
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ControlButton({
  label,
  icon: Icon,
  onClick,
  className
}: {
  label: string;
  icon: ComponentType<ComponentProps<'svg'>>;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-700 ${className ?? ''}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
