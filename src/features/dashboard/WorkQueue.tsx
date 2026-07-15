import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button, StatusBadge, Avatar } from '@/components/ui';
import { priorityTone } from '@/components/ui/tone';
import type { QueueGroup } from '@/data/commandCentre';
import { toneVars } from '@/components/ui/tone';
import styles from './WorkQueue.module.css';

const COLUMNS = ['Legislative Item', 'Type', 'Current Stage', 'Required Action', 'Owner', 'Due', 'Priority', 'Activity', ''];

export function WorkQueue({ groups }: { groups: QueueGroup[] }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.filter((g) => g.collapsed).map((g) => [g.id, true])),
  );

  const toggle = (id: string) => setCollapsed((c) => ({ ...c, [id]: !c[id] }));

  return (
    <div className={styles.tableWrap} role="region" aria-label="Priority work queue">
      <table className={styles.table}>
        <thead>
          <tr>
            {COLUMNS.map((c, i) => (
              <th key={i} className={i === 8 ? styles.thAction : ''} scope="col">
                <span className={c ? '' : 'sr-only'}>{c || 'Action'}</span>
              </th>
            ))}
          </tr>
        </thead>
        {groups.map((group) => {
          const isCollapsed = collapsed[group.id];
          const tv = toneVars[group.tone];
          return (
            <tbody key={group.id} className={styles.group}>
              <tr>
                <th colSpan={9} className={styles.groupHeader} style={{ background: tv.bg }} scope="colgroup">
                  <button className={styles.groupToggle} onClick={() => toggle(group.id)} aria-expanded={!isCollapsed}>
                    {isCollapsed ? <ChevronRight width={16} height={16} /> : <ChevronDown width={16} height={16} />}
                    <span className={styles.groupTitle} style={{ color: tv.fg }}>{group.title}</span>
                    <span className={styles.groupCount} style={{ color: tv.fg, borderColor: tv.fg }}>
                      {group.rows.length + (group.overflowCount ?? 0)}
                    </span>
                  </button>
                </th>
              </tr>
              {!isCollapsed && group.rows.map((row) => (
                <tr key={row.recordId} className={styles.row}>
                  <td className={styles.cellItem}>
                    <Link to={`/legislative/${row.recordId}`} className={styles.itemTitle}>{row.title}</Link>
                    <span className={styles.itemRef}>
                      {row.reference}{row.version ? ` · Version ${row.version}` : ''}
                    </span>
                  </td>
                  <td className={styles.cellType}>{row.type}</td>
                  <td><StatusBadge tone={row.stageTone} size="sm">{row.stage}</StatusBadge></td>
                  <td className={styles.cellAction}>{row.requiredAction}</td>
                  <td>
                    <span className={styles.owner}>
                      <Avatar initials={initials(row.ownerName)} name={row.ownerName} size={24} tone="neutral" />
                      <span className={styles.ownerName}>{row.ownerName}</span>
                    </span>
                  </td>
                  <td className={`${styles.cellDue} ${row.dueUrgent ? styles.dueUrgent : ''}`}>{row.due}</td>
                  <td><StatusBadge tone={priorityTone[row.priority]} size="sm">{row.priority}</StatusBadge></td>
                  <td className={styles.cellActivity}>{row.activity}</td>
                  <td className={styles.cellRowAction}>
                    <Button to={row.actionTo} variant="row">{row.actionLabel}</Button>
                  </td>
                </tr>
              ))}
              {!isCollapsed && group.overflowCount != null && group.rows.length > 0 && (
                <tr>
                  <td colSpan={9} className={styles.overflow}>
                    <Link to="/work" className={styles.overflowLink}>View {group.overflowCount} more items</Link>
                  </td>
                </tr>
              )}
              {!isCollapsed && group.rows.length === 0 && group.overflowCount != null && (
                <tr>
                  <td colSpan={9} className={styles.overflow}>
                    <span className={styles.overflowNote}>{group.overflowCount} items completed recently.</span>
                    <Link to="/work?view=recently-completed" className={styles.overflowLink}>View all</Link>
                  </td>
                </tr>
              )}
            </tbody>
          );
        })}
      </table>
    </div>
  );
}

function initials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  if (name === 'Office of the Clerk') return 'OC';
  return parts.slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}
