import type { Tone } from '@/data/commandCentre';

// Maps a semantic tone to its pastel background + accessible foreground, plus a
// solid indicator colour. Every status is conveyed by text + a shaped badge +
// colour together — never colour alone.
export const toneVars: Record<Tone, { bg: string; fg: string; dot: string }> = {
  green: { bg: 'var(--soft-green)', fg: 'var(--on-green)', dot: 'var(--status-success)' },
  gold: { bg: 'var(--soft-gold)', fg: 'var(--on-gold)', dot: 'var(--gold-strong)' },
  amber: { bg: 'var(--soft-amber)', fg: 'var(--on-amber)', dot: 'var(--status-warning)' },
  red: { bg: 'var(--soft-red)', fg: 'var(--on-red)', dot: 'var(--status-danger)' },
  grey: { bg: 'var(--soft-grey)', fg: 'var(--on-grey)', dot: 'var(--on-grey)' },
  blue: { bg: 'var(--soft-blue)', fg: 'var(--on-blue)', dot: 'var(--status-info)' },
};

export type { Tone };

// Canonical priority → tone so priority reads consistently across every screen.
export const priorityTone: Record<string, Tone> = {
  High: 'red',
  Medium: 'amber',
  Low: 'grey',
};

// Canonical workflow stage → tone, used wherever a stage badge appears.
export const stageTone: Record<string, Tone> = {
  'Instruction Received': 'grey',
  'Intake and Assignment': 'gold',
  'Intake Verification': 'gold',
  Drafting: 'blue',
  'Legal Review': 'green',
  'Revision Requested': 'red',
  'Legal Approval': 'green',
  'Procedural Review': 'green',
  'Awaiting Supporting Information': 'amber',
  'Awaiting Signature': 'amber',
  Approval: 'gold',
  'Signed and Sealed': 'gold',
  Published: 'green',
  Archived: 'grey',
};
