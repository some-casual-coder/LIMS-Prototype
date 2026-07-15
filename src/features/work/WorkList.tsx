import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, MoreVertical, MoreHorizontal } from 'lucide-react';
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
      <table className={styles.table}>
        <thead>
          <tr>
            {COLS.map((c, i) => (
              <th key={i} scope="col" className={i === 9 ? styles.thActions : ''}>
                <span className={c ? '' : 'sr-only'}>{c || 'Select'}</span>
              </th>
            ))}
          </tr>
        </thead>
        {groups.map((group) => {
          const isCollapsed = collapsed[group.key] ?? group.defaultCollapsed ?? false;
          const tv = toneVars[group.tone];
          const groupIds = group.items.map((i) => i.recordId);
          const allSelected = groupIds.length > 0 && groupIds.every((id) => selected.has(id));
          return (
            <tbody key={group.key}>
              <tr>
                <th colSpan={10} className={styles.groupHeader} style={{ background: tv.bg }} scope="colgroup">
                  <button className={styles.groupToggle} onClick={() => onToggleGroup(group.key)} aria-expanded={!isCollapsed}>
                    {isCollapsed ? <ChevronRight width={16} height={16} /> : <ChevronDown width={16} height={16} />}
                    <span className={styles.groupTitle} style={{ color: tv.fg }}>{group.title}</span>
                    <span className={styles.groupCount} style={{ color: tv.fg }}>{group.items.length}</span>
                  </button>
                  <button className={styles.groupMenu} aria-label={`${group.title} options`} title="Group options">
                    <MoreHorizontal width={16} height={16} />
                  </button>
                </th>
              </tr>
              {!isCollapsed && group.items.length > 0 && (
                <tr className={styles.selectAllRow}>
                  <td className={styles.cellCheck}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => onToggleSelectGroup(groupIds, e.target.checked)}
                      aria-label={`Select all in ${group.title}`}
                    />
                  </td>
                  <td colSpan={9} className={styles.selectAllHint}>
                    {allSelected ? `All ${groupIds.length} selected` : ''}
                  </td>
                </tr>
              )}
              {!isCollapsed && group.items.map((item) => (
                <Row
                  key={item.recordId}
                  item={item}
                  selected={selected.has(item.recordId)}
                  onToggleSelect={onToggleSelect}
                  onOpen={onOpenItem}
                />
              ))}
            </tbody>
          );
        })}
      </table>
    </div>
  );
}

function Row({ item, selected, onToggleSelect, onOpen }: {
  item: WorkItem; selected: boolean; onToggleSelect: (id: string) => void; onOpen: (id: string) => void;
}) {
  return (
    <tr className={`${styles.row} ${selected ? styles.rowSelected : ''}`} onClick={() => onOpen(item.recordId)}>
      <td className={styles.cellCheck} onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" checked={selected} onChange={() => onToggleSelect(item.recordId)} aria-label={`Select ${item.title}`} />
      </td>
      <td className={styles.cellItem}>
        <button className={styles.itemTitle} onClick={(e) => { e.stopPropagation(); onOpen(item.recordId); }}>{item.title}</button>
        <span className={styles.itemRef}>{item.reference}{item.version ? ` · v${item.version}` : ''}</span>
      </td>
      <td className={styles.cellType}>{item.type}</td>
      <td className={styles.cellStage}><StatusBadge tone={item.stageTone} size="sm">{item.stage}</StatusBadge></td>
      <td className={styles.cellAction}>{item.requiredAction}</td>
      <td className={styles.cellRole}>{item.myRole}</td>
      <td className={`${styles.cellDue} ${item.dueUrgent || item.overdue ? styles.dueUrgent : ''}`}>{item.due}</td>
      <td className={styles.cellPriority}><StatusBadge tone={priorityTone[item.priority]} size="sm">{item.priority}</StatusBadge></td>
      <td className={styles.cellActivity}>{item.lastActivity}</td>
      <td className={styles.cellRowAction} onClick={(e) => e.stopPropagation()}>
        <span className={styles.actionGroup}>
          <Link to={item.actionTo} className={styles.rowActionBtn}>{item.actionLabel}</Link>
          <button className={styles.rowOverflow} aria-label="More actions" title="More actions"><MoreVertical width={15} height={15} /></button>
        </span>
      </td>
    </tr>
  );
}
