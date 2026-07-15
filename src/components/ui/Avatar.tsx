import styles from './Avatar.module.css';

interface Props {
  initials: string;
  name?: string;
  size?: number;
  tone?: 'green' | 'gold' | 'neutral';
}

// Initials avatar — deterministic, no external images, always has an accessible name.
export function Avatar({ initials, name, size = 32, tone = 'green' }: Props) {
  return (
    <span
      className={`${styles.avatar} ${styles[tone]}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      role="img"
      aria-label={name || initials}
      title={name}
    >
      {initials}
    </span>
  );
}
