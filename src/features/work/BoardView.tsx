import { useState } from 'react';
import { Lock, MessageSquare, Paperclip, Flag } from 'lucide-react';
import { StatusBadge } from '@/components/ui';
import { priorityTone, toneVars } from '@/components/ui/tone';
import type { WorkItem, WorkState } from '@/data/myWork';
import { boardColumns } from './logic';
import type { PendingTransition } from './sheets/TransitionSheet';
import { WorkProgress } from './WorkProgress';
import styles from './BoardView.module.css';

// Personal work-state moves permitted from these columns (controlled).
const DRAG_ALLOWED: WorkState[] = ['requires-action', 'in-progress'];

export function BoardView({ items, onOpenItem, onTransition }: {
  items: WorkItem[];
  onOpenItem: (id: string) => void;
  onTransition: (t: PendingTransition) => void;
}) {
  const columns = boardColumns(items);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);

  const dragItem = items.find((i) => i.recordId === dragId) || null;
  const canDropTo = (col: WorkState) =>
    !!dragItem && DRAG_ALLOWED.includes(dragItem.workState) && col !== dragItem.workState && col !== 'completed';

  function onDrop(col: WorkState, title: string) {
    if (dragItem && canDropTo(col)) {
      onTransition({ item: dragItem, targetState: col, targetTitle: title });
    }
    setDragId(null);
    setOverCol(null);
  }

  return (
    <div className={styles.board}>
      {columns.map(({ meta, items: colItems }) => {
        const tv = toneVars[meta.tone];
        const isValid = canDropTo(meta.id);
        const isOver = overCol === meta.id;
        return (
          <section
            key={meta.id}
            className={`${styles.column} ${isOver && isValid ? styles.columnValid : ''} ${dragId && !isValid && meta.id !== dragItem?.workState ? styles.columnDisabled : ''}`}
            onDragOver={(e) => { if (isValid) { e.preventDefault(); setOverCol(meta.id); } }}
            onDragLeave={() => setOverCol((c) => (c === meta.id ? null : c))}
            onDrop={() => onDrop(meta.id, meta.boardTitle)}
          >
            <header className={styles.colHeader} style={{ background: tv.bg }}>
              <span className={styles.colDot} style={{ background: tv.dot }} aria-hidden />
              <span className={styles.colTitle} style={{ color: tv.fg }}>{meta.boardTitle}</span>
              <span className={styles.colCount} style={{ color: tv.fg }}>{colItems.length}</span>
            </header>
            <div className={styles.colBody}>
              {colItems.map((item) => (
                <BoardCard
                  key={item.recordId}
                  item={item}
                  draggable={DRAG_ALLOWED.includes(item.workState)}
                  dragging={dragId === item.recordId}
                  onDragStart={() => setDragId(item.recordId)}
                  onDragEnd={() => { setDragId(null); setOverCol(null); }}
                  onOpen={() => onOpenItem(item.recordId)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function BoardCard({ item, draggable, dragging, onDragStart, onDragEnd, onOpen }: {
  item: WorkItem; draggable: boolean; dragging: boolean;
  onDragStart: () => void; onDragEnd: () => void; onOpen: () => void;
}) {
  return (
    <article
      className={`${styles.card} ${dragging ? styles.cardDragging : ''}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(); }}
    >
      <div className={styles.cardTop}>
        <span className={`${styles.cardDue} ${item.dueUrgent ? styles.cardDueUrgent : ''}`}>{item.due}</span>
        <span className={styles.cardTopRight}>
          {item.confidentiality !== 'Public' && (
            <span title={`${item.confidentiality} record`} aria-label={`${item.confidentiality} record`}>
              <Lock width={13} height={13} className={styles.cardLock} aria-hidden />
            </span>
          )}
        </span>
      </div>
      <h4 className={styles.cardTitle}>{item.title}</h4>
      <p className={styles.cardRef}>{item.reference}{item.version ? ` · v${item.version}` : ''}</p>
      <p className={styles.cardAction}>{item.requiredAction}</p>
      <StatusBadge tone={item.stageTone} size="sm">{item.stage}</StatusBadge>
      <div className={styles.cardProgress}>
        <WorkProgress done={item.progress.done} total={item.progress.total} />
        <span className={styles.progressText}>{item.progress.done} of {item.progress.total} done</span>
      </div>
      <div className={styles.cardBottom}>
        <span className={styles.cardRole}>{item.myRole}</span>
        <span className={styles.cardMeta}>
          <StatusBadge tone={priorityTone[item.priority]} size="sm" icon={<Flag width={11} height={11} />}>{item.priority}</StatusBadge>
          {item.commentCount > 0 && <span className={styles.metaItem}><MessageSquare width={13} height={13} /> {item.commentCount}</span>}
          {item.attachmentCount > 0 && <span className={styles.metaItem}><Paperclip width={13} height={13} /> {item.attachmentCount}</span>}
        </span>
      </div>
    </article>
  );
}
