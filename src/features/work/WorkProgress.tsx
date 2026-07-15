import styles from './WorkProgress.module.css';

export function WorkProgress({ done, total, label = 'Checklist progress' }: { done: number; total: number; label?: string }) {
  const safeTotal = Math.max(1, total);
  const safeDone = Math.min(Math.max(0, done), safeTotal);

  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeTotal}
      aria-valuenow={safeDone}
      aria-valuetext={`${safeDone} of ${safeTotal} completed`}
    >
      {Array.from({ length: safeTotal }, (_, index) => {
        const complete = index < safeDone;
        const alpha = complete ? 0.38 + (0.62 * (index + 1)) / safeDone : 0;
        return (
          <span
            key={index}
            className={`${styles.segment} ${complete ? styles.complete : ''}`}
            style={complete ? { backgroundColor: `rgba(22, 32, 26, ${alpha})`, borderColor: `rgba(22, 32, 26, ${Math.min(1, alpha + 0.08)})` } : undefined}
            aria-hidden
          />
        );
      })}
    </div>
  );
}
