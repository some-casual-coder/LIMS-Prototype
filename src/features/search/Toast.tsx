import { useCallback, useRef, useState } from 'react';
import styles from './Toast.module.css';

// Lightweight local toast used across the Search & Repository feature.
export function useToast() {
  const [msg, setMsg] = useState('');
  const timer = useRef<number | undefined>(undefined);
  const showToast = useCallback((m: string) => {
    setMsg(m);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMsg(''), 2800);
  }, []);
  const ToastHost = () =>
    msg ? (
      <div className={styles.toast} role="status" aria-live="polite">{msg}</div>
    ) : null;
  return { showToast, ToastHost };
}
