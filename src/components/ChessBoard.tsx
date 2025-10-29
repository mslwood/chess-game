import { DndContext, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { useCallback, useMemo } from 'react';
import { useChessStore } from '../state/chessStore';
import { extractPieces, isLightSquare } from '../utils/board';
import { SquareTile } from './SquareTile';
import { PieceDraggable } from './PieceDraggable';

export function ChessBoard() {
  const { snapshot, selectSquare, highlightSquares, selectedSquare } = useChessStore((state) => ({
    snapshot: state.snapshot,
    selectSquare: state.selectSquare,
    highlightSquares: state.highlightSquares,
    selectedSquare: state.selectedSquare
  }));

  const pieces = useMemo(() => extractPieces(snapshot), [snapshot]);
  const boardSquares = useMemo(() => Array.from({ length: 64 }, (_, index) => 63 - index), []);
  const highlighted = new Set(highlightSquares);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const from = Number(event.active.data.current?.square);
      if (!Number.isNaN(from)) {
        selectSquare(from);
      }
    },
    [selectSquare]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const from = Number(event.active.data.current?.square);
      const to = Number(event.over?.data.current?.square);
      if (Number.isNaN(from)) return;
      if (!Number.isNaN(to)) {
        selectSquare(to);
      } else {
        selectSquare(from);
      }
    },
    [selectSquare]
  );

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="relative">
        <div className="grid grid-cols-8 overflow-hidden rounded-3xl border border-slate-700 shadow-2xl">
          {boardSquares.map((square) => (
            <SquareTile
              key={square}
              square={square}
              isLight={isLightSquare(square)}
              highlighted={highlighted.has(square)}
              selected={selectedSquare === square}
              onClick={() => selectSquare(square)}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 grid grid-cols-8">
          {pieces.map((piece) => (
            <PieceDraggable key={piece.square} piece={piece} />
          ))}
        </div>
        <BoardCoordinates />
      </div>
    </DndContext>
  );
}

function BoardCoordinates() {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-between px-4 text-xs uppercase tracking-wide text-slate-200">
        {files.map((file) => (
          <span key={file}>{file}</span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-2 flex flex-col justify-between py-4 text-xs uppercase tracking-wide text-slate-200">
        {ranks.map((rank) => (
          <span key={rank}>{rank}</span>
        ))}
      </div>
    </>
  );
}
