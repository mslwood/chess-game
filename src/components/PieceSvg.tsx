import { Color, Piece } from '../engine/types';

const pieceLetter: Record<Piece, string> = {
  [Piece.Pawn]: 'P',
  [Piece.Knight]: 'N',
  [Piece.Bishop]: 'B',
  [Piece.Rook]: 'R',
  [Piece.Queen]: 'Q',
  [Piece.King]: 'K'
};

const gradients: Record<Color, string> = {
  [Color.White]: 'url(#white-piece)',
  [Color.Black]: 'url(#black-piece)'
};

export function PieceSvg({ piece, color }: { piece: Piece; color: Color }) {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full">
      <defs>
        <linearGradient id="white-piece" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d1d5db" />
        </linearGradient>
        <linearGradient id="black-piece" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#1f2937" />
          <stop offset="100%" stopColor="#030712" />
        </linearGradient>
      </defs>
      <rect x="4" y="8" width="56" height="48" rx="12" fill={gradients[color]} stroke="#111827" strokeWidth="4" />
      <text
        x="32"
        y="42"
        textAnchor="middle"
        fontSize="34"
        fontWeight="700"
        fill={color === 0 ? '#111827' : '#f9fafb'}
        fontFamily="'Clash Display', 'Inter', sans-serif"
      >
        {pieceLetter[piece]}
      </text>
    </svg>
  );
}
