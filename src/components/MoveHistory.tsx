import clsx from 'clsx';
import { useMemo } from 'react';
import { Color } from '../engine/types';
import { useChessStore } from '../state/chessStore';

export function MoveHistory() {
  const moves = useChessStore((state) => state.moves);

  const rows = useMemo(() => {
    const grouped: Array<{ turn: number; white: string; black: string }> = [];
    for (let i = 0; i < moves.length; i += 2) {
      grouped.push({
        turn: i / 2 + 1,
        white: moves[i]?.san ?? '',
        black: moves[i + 1]?.san ?? ''
      });
    }
    return grouped;
  }, [moves]);

  const lastMove = moves[moves.length - 1];
  const lastTurn = rows.length;

  return (
    <div className="flex h-72 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
      <div className="border-b border-slate-800 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">Moves</h2>
        <p className="mt-1 text-xs text-slate-500">Follow the flow of the game with SAN notation and the latest move highlighted.</p>
      </div>
      <div className="flex-1 overflow-auto px-4 pb-4">
        {rows.length === 0 ? (
          <p className="mt-6 text-center text-xs text-slate-500">
            No moves yet—drag a piece or press “Let AI move” to begin the game.
          </p>
        ) : (
          <table className="w-full text-left text-sm text-slate-100">
            <tbody>
              {rows.map((row) => {
                const isLastRow = row.turn === lastTurn;
                const highlightColor = lastMove?.color;
                return (
                  <tr
                    key={row.turn}
                    className={clsx(
                      'rounded-xl transition-colors hover:bg-slate-800/40',
                      isLastRow && 'bg-emerald-500/5'
                    )}
                  >
                    <td className="w-12 py-2 pr-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{row.turn}.</td>
                    <td
                      className={clsx(
                        'py-2 pr-4 text-sm',
                        isLastRow && highlightColor === Color.White && 'font-semibold text-emerald-200'
                      )}
                    >
                      {row.white}
                    </td>
                    <td
                      className={clsx(
                        'py-2 text-sm',
                        isLastRow && highlightColor === Color.Black && 'font-semibold text-emerald-200'
                      )}
                    >
                      {row.black}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
