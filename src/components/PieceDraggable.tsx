import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { BoardPiece } from '../utils/board';
import { PieceSvg } from './PieceSvg';
import { useChessStore } from '../state/chessStore';

export function PieceDraggable({ piece }: { piece: BoardPiece }) {
  const selectSquare = useChessStore((state) => state.selectSquare);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `piece-${piece.square}`,
    data: { square: piece.square }
  });

  const row = 8 - Math.floor(piece.square / 8);
  const column = (piece.square % 8) + 1;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="pointer-events-auto flex items-center justify-center"
      onMouseDown={() => selectSquare(piece.square)}
      onTouchStart={() => selectSquare(piece.square)}
      style={{
        gridRowStart: row,
        gridColumnStart: column,
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        zIndex: isDragging ? 40 : 10,
        transition: isDragging ? undefined : 'transform 120ms ease'
      }}
    >
      <div className="h-full w-full p-2 drop-shadow-lg">
        <PieceSvg piece={piece.piece} color={piece.color} />
      </div>
    </div>
  );
}
