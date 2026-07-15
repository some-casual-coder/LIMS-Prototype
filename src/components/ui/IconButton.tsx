import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './IconButton.module.css';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string; // required accessible name for icon-only control
  children: ReactNode;
  badge?: number;
  tone?: 'default' | 'onDark';
}

// Icon-only control. Always carries an accessible label and visible focus.
export function IconButton({ label, children, badge, tone = 'default', className = '', ...rest }: Props) {
  return (
    <button
      type="button"
      className={`${styles.btn} ${tone === 'onDark' ? styles.onDark : ''} ${className}`}
      aria-label={label}
      title={label}
      {...rest}
    >
      <span className={styles.icon} aria-hidden>{children}</span>
      {badge != null && badge > 0 && (
        <span className={styles.badge} aria-hidden>{badge > 99 ? '99+' : badge}</span>
      )}
    </button>
  );
}
