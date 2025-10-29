import { useChessStore } from '../state/chessStore';
import { PieceSvg } from './PieceSvg';

export function PromotionDialog() {
  const { pendingPromotion, choosePromotion, selectSquare } = useChessStore((state) => ({
    pendingPromotion: state.pendingPromotion,
    choosePromotion: state.choosePromotion,
    selectSquare: state.selectSquare
  }));

  if (!pendingPromotion) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80">
      <div className="rounded-2xl border border-emerald-500/40 bg-slate-900/90 p-6 shadow-xl">
        <h2 className="mb-4 text-center text-lg font-semibold text-emerald-300">Choose promotion</h2>
        <div className="grid grid-cols-4 gap-4">
          {pendingPromotion.options.map((move) => (
            <button
              key={move.san}
              type="button"
              className="flex h-20 w-20 flex-col items-center justify-center rounded-xl border border-emerald-400/40 bg-slate-800/70 transition hover:border-emerald-300 hover:bg-slate-700"
              onClick={() => choosePromotion(move)}
            >
              <div className="h-14 w-14">
                <PieceSvg piece={move.promotion ?? move.piece} color={move.color} />
              </div>
              <span className="text-xs text-slate-200">{move.san}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="mt-6 w-full rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
          onClick={() => selectSquare(pendingPromotion.from)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
