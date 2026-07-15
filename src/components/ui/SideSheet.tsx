import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import styles from './SideSheet.module.css';

type Size = 'sm' | 'md' | 'lg' | 'xl';
const WIDTHS: Record<Size, number> = { sm: 420, md: 460, lg: 480, xl: 600 };

interface Props {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  headerMeta?: ReactNode; // e.g. "24 records" or actions
  size?: Size;
  footer?: ReactNode;
  children: ReactNode;
}

// Reusable right-side sheet: soft overlay, sticky header + footer, ESC to close.
export function SideSheet({ open, onClose, title, subtitle, headerMeta, size = 'md', footer, children }: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <aside
        className={styles.sheet}
        style={{ width: WIDTHS[size] }}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Panel'}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h2 className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          <div className={styles.headerRight}>
            {headerMeta}
            <button className={styles.close} onClick={onClose} aria-label="Close panel">
              <X width={18} height={18} />
            </button>
          </div>
        </header>
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </aside>
    </div>
  );
}
