import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { Button, StatusBadge } from '@/components/ui';
import type { RecentItem } from '@/data/commandCentre';
import styles from './RecentlyWorkedOn.module.css';

export function RecentlyWorkedOn({ items }: { items: RecentItem[] }) {
  return (
    <section aria-label="Recently worked on">
      <h2 className={styles.heading}>Recently Worked On</h2>
      <div className={styles.grid}>
        {items.map((item) => (
          <article key={item.recordId} className={styles.card}>
            <span className={styles.icon} aria-hidden><FileText width={18} height={18} /></span>
            <div className={styles.body}>
              <Link to={`/legislative/${item.recordId}`} className={styles.title}>{item.title}</Link>
              <p className={styles.ref}>
                {item.reference}{item.version ? ` · Version ${item.version}` : ''}
              </p>
              <div className={styles.footer}>
                <StatusBadge tone={item.stageTone} size="sm">{item.stage}</StatusBadge>
                <Button to={item.to} variant="row" className={styles.action}>{item.actionLabel}</Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
