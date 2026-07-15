import { GripVertical } from 'lucide-react';
import { SideSheet, Button } from '@/components/ui';
import styles from './ColumnsSheet.module.css';

const FIXED = ['Selection', 'Legislative Item', 'Actions'];
const TOGGLEABLE: { key: string; label: string }[] = [
  { key: 'type', label: 'Type' },
  { key: 'stage', label: 'Current Stage' },
  { key: 'reqaction', label: 'Required Action' },
  { key: 'role', label: 'My Role' },
  { key: 'due', label: 'Due Date' },
  { key: 'priority', label: 'Priority' },
  { key: 'activity', label: 'Last Activity' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  compact: boolean;
  onToggleCompact: () => void;
  hidden: Set<string>;
  onToggleColumn: (key: string) => void;
  onReset: () => void;
}

export function ColumnsSheet({ open, onClose, compact, onToggleCompact, hidden, onToggleColumn, onReset }: Props) {
  return (
    <SideSheet
      open={open}
      onClose={onClose}
      size="sm"
      title="Column settings"
      subtitle="Show, hide and set table density"
      footer={
        <div className={styles.footer}>
          <Button variant="tertiary" onClick={onReset}>Reset to default</Button>
          <Button variant="primary" onClick={onClose}>Apply columns</Button>
        </div>
      }
    >
      <h3 className={styles.groupTitle}>Density</h3>
      <div className={styles.density}>
        <button className={`${styles.densityBtn} ${!compact ? styles.densityActive : ''}`} onClick={() => compact && onToggleCompact()} aria-pressed={!compact}>Comfortable</button>
        <button className={`${styles.densityBtn} ${compact ? styles.densityActive : ''}`} onClick={() => !compact && onToggleCompact()} aria-pressed={compact}>Compact</button>
      </div>

      <h3 className={styles.groupTitle}>Fixed columns</h3>
      <ul className={styles.list}>
        {FIXED.map((c) => (
          <li key={c} className={styles.fixed}>
            <GripVertical width={15} height={15} className={styles.grip} />
            <span>{c}</span>
            <span className={styles.fixedTag}>Fixed</span>
          </li>
        ))}
      </ul>

      <h3 className={styles.groupTitle}>Columns</h3>
      <ul className={styles.list}>
        {TOGGLEABLE.map((c) => (
          <li key={c.key} className={styles.item}>
            <GripVertical width={15} height={15} className={styles.grip} />
            <label className={styles.itemLabel}>
              <input type="checkbox" checked={!hidden.has(c.key)} onChange={() => onToggleColumn(c.key)} />
              {c.label}
            </label>
          </li>
        ))}
      </ul>
    </SideSheet>
  );
}
