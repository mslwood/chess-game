import { useMemo } from 'react';
import clsx from 'clsx';
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

  const latestTurn = moves.length === 0 ? 0 : Math.ceil(moves.length / 2);
  const latestSide = moves.length % 2 === 0 ? 'black' : 'white';

  return (
    <div className="h-72 overflow-auto rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-200">Moves</h2>
      <table className="w-full text-left text-sm text-slate-100">
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={3} className="py-6 text-center text-xs text-slate-500">
                No moves yet — drag a piece to get started.
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const isLatestTurn = row.turn === latestTurn;
              const whiteHighlight = isLatestTurn && latestSide === 'white';
              const blackHighlight = isLatestTurn && latestSide === 'black';
              return (
                <tr
                  key={row.turn}
                  className={clsx('transition-colors', {
                    'bg-emerald-500/10 text-emerald-100': isLatestTurn,
                    'odd:bg-slate-800/40': !isLatestTurn
                  })}
                >
                  <td className="w-12 py-1 pr-3 text-xs font-semibold text-slate-400">{row.turn}.</td>
                  <td className={clsx('py-1 pr-4', whiteHighlight && 'font-semibold text-emerald-200')}>
                    {row.white || '…'}
                  </td>
                  <td className={clsx('py-1', blackHighlight && 'font-semibold text-emerald-200')}>
                    {row.black || '…'}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
