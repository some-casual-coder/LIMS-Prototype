import type { ReactNode } from 'react';
import { toneVars, type Tone } from './tone';
import styles from './StatusBadge.module.css';

interface Props {
  tone: Tone;
  children: ReactNode;
  /** Optional leading icon; a shaped dot is used by default so status never relies on colour alone. */
  icon?: ReactNode;
  size?: 'sm' | 'md';
  title?: string;
  /** When true, the status dot emits an expanding beacon ring to signal urgency. */
  pulse?: boolean;
}

export function StatusBadge({ tone, children, icon, size = 'md', title, pulse }: Props) {
  const t = toneVars[tone];
  return (
    <span
      className={`${styles.badge} ${size === 'sm' ? styles.sm : ''}`}
      style={{ background: t.bg, color: t.fg }}
      title={title}
    >
      {icon ? (
        <span className={styles.icon} aria-hidden>{icon}</span>
      ) : (
        <span
          className={`${styles.dot} ${pulse ? styles.pulse : ''}`}
          style={{ background: t.dot, ['--dot' as string]: t.dot }}
          aria-hidden
        />
      )}
      <span className={styles.label}>{children}</span>
    </span>
  );
}
