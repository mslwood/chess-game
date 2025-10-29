import clsx from 'clsx';
import { useMemo } from 'react';
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

  const lastMoveIndex = moves.length - 1;
  const lastTurn = lastMoveIndex >= 0 ? Math.floor(lastMoveIndex / 2) + 1 : null;
  const lastMoveColor: 'white' | 'black' | null =
    lastMoveIndex < 0 ? null : lastMoveIndex % 2 === 0 ? 'white' : 'black';

  return (
    <div className="h-72 overflow-auto rounded-3xl border border-slate-800/80 bg-slate-950/40 p-4 shadow-inner shadow-slate-950/40 backdrop-blur">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">Moves</h2>
      <table className="w-full text-left text-sm text-slate-100">
        <tbody>
          {rows.map((row) => (
            <tr key={row.turn} className="odd:bg-slate-900/40">
              <td className="w-12 py-1 pr-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{row.turn}.</td>
              <td
                className={clsx(
                  'rounded-lg px-2 py-1 transition-colors',
                  row.turn === lastTurn && lastMoveColor === 'white'
                    ? 'bg-emerald-500/20 text-emerald-100'
                    : 'text-slate-200'
                )}
              >
                {row.white || '—'}
              </td>
              <td
                className={clsx(
                  'rounded-lg px-2 py-1 transition-colors',
                  row.turn === lastTurn && lastMoveColor === 'black'
                    ? 'bg-emerald-500/20 text-emerald-100'
                    : 'text-slate-200'
                )}
              >
                {row.black || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
