import { Link } from 'react-router-dom';
import { Avatar, Button, Panel, StatusBadge } from '@/components/ui';
import type { QueueGroup } from '@/data/commandCentre';
import styles from './ImmediateActions.module.css';

export function ImmediateActions({ groups }: { groups: QueueGroup[] }) {
  const rows = groups.flatMap((group) => group.rows).slice(0, 4);

  return (
    <Panel
      title="Immediate Actions"
      className={styles.panel}
      bodyClassName={styles.body}
      actions={<Link to="/work" className={styles.openAll}>Open My Work</Link>}
    >
      {rows.length === 0 ? (
        <div className={styles.empty}>
          <p>No immediate actions in this view.</p>
          <Link to="/work">Open all work</Link>
        </div>
      ) : (
        <ul className={styles.list}>
          {rows.map((row) => (
            <li key={row.recordId} className={styles.row}>
              <div className={styles.identity}>
                <Link to={`/legislative/${row.recordId}`} className={styles.title}>{row.title}</Link>
                <span className={styles.reference}>{row.reference}</span>
              </div>
              <StatusBadge tone={row.stageTone} size="sm">{row.stage}</StatusBadge>
              <span className={styles.action}>{row.requiredAction}</span>
              <span className={styles.owner} title={row.ownerName}>
                <Avatar initials={initials(row.ownerName)} name={row.ownerName} size={28} tone="neutral" />
              </span>
              <span className={`${styles.due} ${row.dueUrgent ? styles.urgent : ''}`}>{row.due}</span>
              <Button to={row.actionTo} variant="row">{row.actionLabel}</Button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function initials(name: string): string {
  if (name === 'Office of the Clerk') return 'OC';
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}
