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

  return (
    <div className="h-72 overflow-auto rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-200">Moves</h2>
      <table className="w-full text-left text-sm text-slate-100">
        <tbody>
          {rows.map((row) => (
            <tr key={row.turn} className="odd:bg-slate-800/40">
              <td className="w-12 py-1 pr-3 text-xs font-semibold text-slate-400">{row.turn}.</td>
              <td className="py-1 pr-4">{row.white}</td>
              <td className="py-1">{row.black}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
