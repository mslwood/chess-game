import { Chess, START_FEN } from './chess';

export interface PerftFixture {
  name: string;
  fen: string;
  depth: number;
  nodes: number;
}

export const PERFT_FIXTURES: PerftFixture[] = [
  {
    name: 'Initial position depth 1',
    fen: START_FEN,
    depth: 1,
    nodes: 20
  },
  {
    name: 'Initial position depth 2',
    fen: START_FEN,
    depth: 2,
    nodes: 400
  },
  {
    name: 'Initial position depth 3',
    fen: START_FEN,
    depth: 3,
    nodes: 8902
  },
  {
    name: 'Kiwi Pete depth 2',
    fen: 'rnbq1bnr/ppppkppp/8/4p3/3P4/5N2/PPP1PPPP/RNBQKB1R w KQ - 2 4',
    depth: 2,
    nodes: 743
  }
];

export function runPerftSuite(): { fixture: PerftFixture; actual: number }[] {
  const results: { fixture: PerftFixture; actual: number }[] = [];
  for (const fixture of PERFT_FIXTURES) {
    const chess = new Chess(fixture.fen);
    const nodes = chess.perft(fixture.depth);
    results.push({ fixture, actual: nodes });
  }
  return results;
}
