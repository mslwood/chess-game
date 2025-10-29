import type { ComponentProps, ComponentType } from 'react';
import {
  BoltIcon,
  CodeBracketIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface FeatureItem {
  title: string;
  description: string;
  icon: ComponentType<ComponentProps<'svg'>>;
}

const FEATURES: FeatureItem[] = [
  {
    title: 'Bitboard engine',
    description: 'Move generation with castling, promotions, en passant, repetition tracking, and perft validation.',
    icon: CpuChipIcon
  },
  {
    title: 'Rich analysis tools',
    description: 'Undo/redo, PGN + FEN editors, and live engine evaluation keep study sessions organised.',
    icon: CodeBracketIcon
  },
  {
    title: 'Instant feedback',
    description: 'Visual move hints, highlighted history, and material breakdown make positions easy to parse at a glance.',
    icon: SparklesIcon
  },
  {
    title: 'Competitive ready',
    description: 'Engine search depths, AI move timing, and repetition detection support training for tournament settings.',
    icon: ShieldCheckIcon
  },
  {
    title: 'Lightning fast UI',
    description: 'Powered by Vite, React, Tailwind, and Zustand for buttery-smooth interactions across devices.',
    icon: BoltIcon
  }
];

export function FeatureHighlights() {
  return (
    <section className="mx-auto mt-16 max-w-6xl px-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl">
        <h2 className="text-lg font-semibold uppercase tracking-wide text-emerald-300">Why players love Aurora</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          Aurora Chess blends a fully featured chess engine with a modern, responsive interface so you can analyse games,
          practise tactics, or battle the AI without leaving your browser.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="flex gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 transition hover:border-emerald-400/50 hover:shadow-lg"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                <feature.icon className="h-5 w-5 text-emerald-300" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">{feature.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{feature.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
