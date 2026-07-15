import type { ReactNode } from 'react';
import styles from './Panel.module.css';

interface Props {
  title?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  padded?: boolean;
}

// A crisp white panel: 1px border, minimal shadow — structured, not floating.
export function Panel({ title, icon, actions, children, className = '', bodyClassName = '', padded = true }: Props) {
  return (
    <section className={`${styles.panel} ${className}`}>
      {(title || actions) && (
        <header className={styles.header}>
          <div className={styles.titleWrap}>
            {icon && <span className={styles.icon} aria-hidden>{icon}</span>}
            {title && <h2 className={styles.title}>{title}</h2>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </header>
      )}
      <div className={`${padded ? styles.body : ''} ${bodyClassName}`}>{children}</div>
    </section>
  );
}
