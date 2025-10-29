export type GameStatus = 'ongoing' | 'checkmate' | 'stalemate' | 'fifty-move' | 'threefold';

export const STATUS_LABELS: Record<GameStatus, string> = {
  ongoing: 'Game in progress',
  checkmate: 'Checkmate',
  stalemate: 'Stalemate',
  'fifty-move': 'Draw · 50-move rule',
  threefold: 'Draw · Repetition'
};

export const STATUS_DESCRIPTIONS: Record<GameStatus, string> = {
  ongoing: 'Explore the position, make a move, or ask the engine for its best reply.',
  checkmate: 'The side to move has been checkmated. Reset the board or load a new puzzle to keep playing.',
  stalemate: 'No legal moves remain while the king is not in check. It is a stalemate draw.',
  'fifty-move': 'Fifty moves have passed with no pawn move or capture. Claim a draw or continue analysis from here.',
  threefold: 'The same position has occurred three times with the same rights available. A draw can be claimed.'
};
