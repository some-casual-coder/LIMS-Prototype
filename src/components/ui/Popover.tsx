import { useState, useRef, useEffect, type ReactNode } from 'react';
import styles from './Popover.module.css';

interface Props {
  trigger: (props: { open: boolean; toggle: () => void; ref: React.Ref<HTMLButtonElement> }) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: 'left' | 'right';
  /** Open the panel upward (for triggers pinned near the bottom of the viewport). */
  up?: boolean;
  label: string;
}

// Lightweight click-outside popover used for filters and menus.
export function Popover({ trigger, children, align = 'right', up = false, label }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus(); }
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={styles.wrap} ref={wrapRef}>
      {trigger({ open, toggle: () => setOpen((o) => !o), ref: btnRef })}
      {open && (
        <div className={`${styles.panel} ${align === 'left' ? styles.left : styles.right} ${up ? styles.up : ''}`} role="dialog" aria-label={label}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
