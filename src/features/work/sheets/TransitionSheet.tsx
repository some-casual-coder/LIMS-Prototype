import { CheckCircle2, Circle, TriangleAlert } from 'lucide-react';
import { SideSheet, Button } from '@/components/ui';
import type { WorkItem, WorkState } from '@/data/myWork';
import styles from './TransitionSheet.module.css';

export interface PendingTransition {
  item: WorkItem;
  targetState: WorkState;
  targetTitle: string;
}

// Shown after a meaningful Kanban drag. The official stage only changes on confirm.
export function TransitionSheet({ pending, onClose }: { pending: PendingTransition | null; onClose: () => void }) {
  if (!pending) return null;
  const { item, targetTitle } = pending;
  const blocked = item.blockingIssues.some((b) => b.severity === 'error');

  const checklist = [
    { label: 'Validation passed', done: !item.blockingIssues.some((b) => b.text.includes('validation')) },
    { label: 'No unresolved blocking comments', done: !blocked },
    { label: 'Version notes completed', done: item.progress.done >= item.progress.total - 1 },
    { label: 'Reviewer assigned', done: item.assignedPeople.length > 1 },
  ];

  return (
    <SideSheet
      open={!!pending}
      onClose={onClose}
      size="md"
      title={`Submit for ${targetTitle}?`}
      subtitle={`${item.reference} · Version ${item.version ?? '1.0'}`}
      footer={
        <div className={styles.footer}>
          <Button variant="tertiary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={blocked} onClick={onClose}>Submit for Review</Button>
        </div>
      }
    >
      <p className={styles.intro}>
        Moving <b>{item.title}</b> to <b>{targetTitle}</b> will submit Version {item.version ?? '1.0'} to the assigned reviewer.
      </p>

      <h3 className={styles.checklistTitle}>Pre-submission checklist</h3>
      <ul className={styles.checklist}>
        {checklist.map((c) => (
          <li key={c.label} className={c.done ? styles.done : styles.pending}>
            {c.done ? <CheckCircle2 width={16} height={16} /> : <Circle width={16} height={16} />} {c.label}
          </li>
        ))}
      </ul>

      {blocked && (
        <div className={styles.blocked}>
          <TriangleAlert width={16} height={16} /> Submission is blocked because one blocking comment remains unresolved.
        </div>
      )}
    </SideSheet>
  );
}
