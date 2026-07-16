import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { StatusBadge } from '@/components/ui';
import { priorityTone, toneVars } from '@/components/ui/tone';
import type { WorkItem } from '@/data/myWork';
import type { Group } from './logic';
import styles from './WorkList.module.css';

interface Props {
  groups: Group[];
  collapsed: Record<string, boolean>;
  onToggleGroup: (key: string) => void;
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectGroup: (ids: string[], select: boolean) => void;
  onOpenItem: (id: string) => void;
  compact: boolean;
  hidden?: Set<string>;
}

const COLS = ['', 'Legislative Item', 'Type', 'Current Stage', 'Required Action', 'My Role', 'Due', 'Priority', 'Last Activity', 'Actions'];
const HIDE_CLASS: Record<string, string> = {
  type: 'hideType', stage: 'hideStage', reqaction: 'hideReqAction', role: 'hideRole',
  due: 'hideDue', priority: 'hidePriority', activity: 'hideActivity',
};

export function WorkList({ groups, collapsed, onToggleGroup, selected, onToggleSelect, onToggleSelectGroup, onOpenItem, compact, hidden }: Props) {
  const hideClasses = [...(hidden ?? [])].map((k) => styles[HIDE_CLASS[k]]).filter(Boolean).join(' ');
  return (
    <div className={`${styles.wrap} ${compact ? styles.compact : ''} ${hideClasses}`}>
      {groups.map((group) => {
        const isCollapsed = collapsed[group.key] ?? group.defaultCollapsed ?? false;
        const tv = toneVars[group.tone];
        const groupIds = group.items.map((item) => item.recordId);
        const allSelected = groupIds.length > 0 && groupIds.every((id) => selected.has(id));
        return (
          <section key={group.key} className={styles.groupSection} aria-label={group.title}>
            <div className={styles.groupBar} style={{ background: tv.bg }}>
              {group.items.length > 0 && (
                <input
                  className={styles.groupCheck}
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => onToggleSelectGroup(groupIds, event.target.checked)}
                  aria-label={`Select all in ${group.title}`}
                />
              )}
              <button className={styles.groupToggle} onClick={() => onToggleGroup(group.key)} aria-expanded={!isCollapsed}>
                {isCollapsed ? <ChevronRight width={16} height={16} /> : <ChevronDown width={16} height={16} />}
                <span className={styles.groupTitle} style={{ color: tv.fg }}>{group.title}</span>
                <span className={styles.groupCount} style={{ color: tv.fg }}>{group.items.length}</span>
              </button>
            </div>
            {!isCollapsed && (
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      {COLS.map((column, index) => (
                        <th key={index} scope="col" className={index === 9 ? styles.thActions : ''}>
                          <span className={column ? '' : 'sr-only'}>{column || 'Select'}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item, index) => (
                      <Row
                        key={item.recordId}
                        item={item}
                        index={index}
                        selected={selected.has(item.recordId)}
                        onToggleSelect={onToggleSelect}
                        onOpen={onOpenItem}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function Row({ item, index, selected, onToggleSelect, onOpen }: {
  item: WorkItem; index: number; selected: boolean; onToggleSelect: (id: string) => void; onOpen: (id: string) => void;
}) {
  return (
    <tr className={`${styles.row} ${selected ? styles.rowSelected : ''} item-in`} style={{ '--item-delay': `${index * 0.03}s` } as CSSProperties}>
      <td className={styles.cellCheck} onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" checked={selected} onChange={() => onToggleSelect(item.recordId)} aria-label={`Select ${item.title}`} />
      </td>
      <td className={styles.cellItem}>
        <button className={styles.itemTitle} onClick={(e) => { e.stopPropagation(); onOpen(item.recordId); }}>{item.title}</button>
        <span className={styles.itemRef}>{item.reference}{item.version ? ` · v${item.version}` : ''}</span>
      </td>
      <td className={styles.cellType}>{item.type}</td>
      <td className={styles.cellStage}><StatusBadge tone={item.stageTone} size="sm" pulse={item.stageTone === 'red'}>{item.stage}</StatusBadge></td>
      <td className={styles.cellAction}>{item.requiredAction}</td>
      <td className={styles.cellRole}>{item.myRole}</td>
      <td className={`${styles.cellDue} ${item.dueUrgent || item.overdue ? styles.dueUrgent : ''}`}>{item.due}</td>
      <td className={styles.cellPriority}><StatusBadge tone={priorityTone[item.priority]} size="sm">{item.priority}</StatusBadge></td>
      <td className={styles.cellActivity}>{item.lastActivity}</td>
      <td className={styles.cellRowAction} onClick={(e) => e.stopPropagation()}>
        <Link to={item.actionTo} className={styles.rowActionBtn}>{item.actionLabel}</Link>
      </td>
    </tr>
  );
}
