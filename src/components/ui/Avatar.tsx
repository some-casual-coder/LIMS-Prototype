import styles from './Avatar.module.css';

interface Props {
  initials: string;
  name?: string;
  size?: number;
  tone?: 'green' | 'gold' | 'neutral';
  decorative?: boolean;
}

// Initials avatar — deterministic, no external images, always has an accessible name.
export function Avatar({ initials, name, size = 32, tone = 'green', decorative = false }: Props) {
  return (
    <span
      className={`${styles.avatar} ${styles[tone]}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : (name || initials)}
      aria-hidden={decorative || undefined}
      title={decorative ? undefined : name}
    >
      {initials}
    </span>
  );
}
