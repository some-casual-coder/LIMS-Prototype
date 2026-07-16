import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, MoreHorizontal, CalendarClock, CheckCircle2, CircleDot, Circle, TriangleAlert, Flag, Lock } from 'lucide-react';
import { SideSheet, Button, StatusBadge, Avatar, Popover } from '@/components/ui';
import { priorityTone } from '@/components/ui/tone';
import { useDemoStore } from '@/store/demoStore';
import type { WorkItem } from '@/data/myWork';
import styles from './QuickViewSheet.module.css';
import { WorkProgress } from '../WorkProgress';

export function QuickViewSheet({ item, open, onClose }: { item: WorkItem | null; open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const pinned = useDemoStore((s) => s.pinned);
  const togglePin = useDemoStore((s) => s.togglePin);
  const markRecentlyOpened = useDemoStore((s) => s.markRecentlyOpened);

  useEffect(() => {
    if (open && item) markRecentlyOpened(item.recordId);
  }, [open, item, markRecentlyOpened]);

  if (!item) return null;
  const isPinned = pinned.includes(item.recordId);

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      size="xl"
      title={item.title}
      subtitle={`${item.reference} · Version ${item.version ?? '1.0'}`}
      headerMeta={
        <>
          <button className={styles.headBtn} aria-pressed={isPinned} onClick={() => togglePin(item.recordId)} aria-label={isPinned ? 'Unpin' : 'Pin item'} title={isPinned ? 'Unpin' : 'Pin item'}>
            <Bookmark width={17} height={17} fill={isPinned ? 'currentColor' : 'none'} />
          </button>
          <Popover label="More" align="right" trigger={({ toggle, ref }) => (
            <button ref={ref} className={styles.headBtn} onClick={toggle} aria-label="More options"><MoreHorizontal width={18} height={18} /></button>
          )}>
            {(close) => (
              <div className={styles.menu} onClick={close}>
                <button className={styles.menuItem} onClick={() => togglePin(item.recordId)}>{isPinned ? 'Unpin item' : 'Pin item'}</button>
                <button className={styles.menuItem} onClick={() => navigator.clipboard?.writeText(item.reference)}>Copy reference</button>
              </div>
            )}
          </Popover>
        </>
      }
      footer={
        <>
          <Button variant="primary" block to={item.actionTo} onClick={onClose}>{item.actionLabel}</Button>
          <Button variant="secondary" block onClick={() => { markRecentlyOpened(item.recordId); navigate(`/legislative/${item.recordId}`); }}>Open Full Workspace</Button>
        </>
      }
    >
      <div className={styles.pills}>
        <StatusBadge tone={item.stageTone} size="sm" pulse={item.stageTone === 'red'}>{item.stage}</StatusBadge>
        <StatusBadge tone={priorityTone[item.priority]} size="sm" icon={<Flag width={12} height={12} />}>{item.priority}</StatusBadge>
        <span className={styles.classPill}><Lock width={12} height={12} /> {item.confidentiality}</span>
      </div>
      <p className={`${styles.due} ${item.dueUrgent ? styles.dueUrgent : ''}`}><CalendarClock width={15} height={15} /> Due {item.due}</p>

      <Section title="Required Action">
        <p className={styles.reqAction}>{item.requiredActionLong}</p>
      </Section>

      <Section title="Workflow Summary">
        <ol className={styles.workflow}>
          <li className={styles.wfDone}><CheckCircle2 width={16} height={16} /><div><span className={styles.wfLabel}>Previous Stage</span><span className={styles.wfValue}>{item.previousStage ?? '—'}</span></div></li>
          <li className={styles.wfCurrent}><CircleDot width={16} height={16} /><div><span className={styles.wfLabel}>Current Stage</span><span className={styles.wfValue}>{item.stage}</span>{item.currentStageSince && <span className={styles.wfSub}>{item.currentStageSince}</span>}</div></li>
          <li className={styles.wfNext}><Circle width={16} height={16} /><div><span className={styles.wfLabel}>Next Stage</span><span className={styles.wfValue}>{item.nextStage ?? '—'}</span></div></li>
        </ol>
      </Section>

      <Section title="My Responsibilities">
        <dl className={styles.respList}>
          <div><dt>Role</dt><dd>{item.myRole}</dd></div>
          <div><dt>Current Task</dt><dd>{item.currentTask}</dd></div>
          <div><dt>Due Date</dt><dd>{item.due}</dd></div>
        </dl>
        <div className={styles.progressRow}>
          <span className={styles.progressLabel}>Progress</span>
          <WorkProgress done={item.progress.done} total={item.progress.total} />
        </div>
        <p className={styles.progressText}>{item.progress.done} of {item.progress.total} completed</p>
      </Section>

      {item.blockingIssues.length > 0 && (
        <Section title="Blocking Issues">
          <ul className={styles.issues}>
            {item.blockingIssues.map((b, i) => (
              <li key={i} className={b.severity === 'error' ? styles.issueError : styles.issueWarn}>
                <TriangleAlert width={15} height={15} /> {b.text}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Assigned People">
        <ul className={styles.people}>
          {item.assignedPeople.map((p) => (
            <li key={p.id} className={styles.person}>
              <Avatar initials={p.initials} name={p.name} size={34} tone="neutral" />
              <span><span className={styles.personName}>{p.name}</span><span className={styles.personRole}>{p.roleLabel}</span></span>
            </li>
          ))}
        </ul>
      </Section>
    </SideSheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      {children}
    </section>
  );
}
