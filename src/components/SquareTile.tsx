import { useDroppable } from '@dnd-kit/core';
import clsx from 'clsx';
import { memo } from 'react';

interface SquareTileProps {
  square: number;
  isLight: boolean;
  highlighted: boolean;
  selected: boolean;
  onClick: () => void;
}

export const SquareTile = memo(function SquareTile({ square, isLight, highlighted, selected, onClick }: SquareTileProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `square-${square}`,
    data: { square }
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onClick}
      className={clsx(
        'relative aspect-square focus:outline-none',
        isLight ? 'bg-board-light/95' : 'bg-board-dark/95',
        highlighted && 'after:absolute after:inset-3 after:rounded-full after:bg-emerald-400/70 after:content-[""]',
        selected && 'ring-4 ring-emerald-400/50',
        isOver && 'ring-4 ring-emerald-400/80'
      )}
    />
  );
});
