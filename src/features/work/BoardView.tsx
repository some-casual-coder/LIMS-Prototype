import { useState, type CSSProperties } from 'react';
import { Lock, MessageSquare, Paperclip, Flag, ListChecks } from 'lucide-react';
import { StatusBadge } from '@/components/ui';
import { priorityTone, toneVars } from '@/components/ui/tone';
import type { WorkItem, WorkState } from '@/data/myWork';
import { boardColumns } from './logic';
import type { PendingTransition } from './sheets/TransitionSheet';
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
      {columns.map(({ meta, items: colItems }, colIndex) => {
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
              {colItems.map((item, cardIndex) => (
                <BoardCard
                  key={item.recordId}
                  item={item}
                  index={cardIndex}
                  columnIndex={colIndex}
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

function BoardCard({ item, index, columnIndex, draggable, dragging, onDragStart, onDragEnd, onOpen }: {
  item: WorkItem; index: number; columnIndex: number; draggable: boolean; dragging: boolean;
  onDragStart: () => void; onDragEnd: () => void; onOpen: () => void;
}) {
  const { done, total } = item.progress;
  const people = item.assignedPeople;
  return (
    <article
      className={`${styles.card} ${dragging ? styles.cardDragging : ''} item-in`}
      style={{ '--item-delay': `${columnIndex * 0.16 + index * 0.05}s` } as CSSProperties}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(); }}
    >
      <div className={styles.cardTop}>
        <span className={`${styles.cardDue} ${item.dueUrgent ? styles.cardDueUrgent : ''}`}>Due: {item.due}</span>
        <span className={styles.cardTopRight}>
          {item.confidentiality !== 'Public' && (
            <span title={`${item.confidentiality} record`} aria-label={`${item.confidentiality} record`}>
              <Lock width={13} height={13} className={styles.cardLock} aria-hidden />
            </span>
          )}
        </span>
      </div>
      <h4 className={styles.cardTitle}>{item.title}</h4>
      <p className={styles.cardAction}>{item.requiredAction}</p>

      {/* Milestone: green segmented battery bar (1 segment = 1 checklist item). */}
      <div className={styles.milestoneHead}>
        <span className={styles.milestoneLabel}><ListChecks width={14} height={14} /> Milestone</span>
        <span className={styles.milestoneCount}>{done}/{total}</span>
      </div>
      <div className={styles.milestoneTrack} role="img" aria-label={`${done} of ${total} checklist items complete`}>
        {Array.from({ length: Math.max(1, total) }, (_, seg) => {
          const filled = seg < done;
          return filled ? (
            <i key={seg} className="charge-bar" style={{ '--charge-fill': 'var(--green-700)', '--charge-track': 'var(--soft-grey)', '--charge-delay': `${seg * 0.05}s` } as CSSProperties} />
          ) : <i key={seg} style={{ background: 'var(--soft-grey)' }} />;
        })}
      </div>

      <div className={styles.assignRow}>
        <span className={styles.assignLabel}>Assigned for</span>
        <span className={styles.avatars}>
          {people.slice(0, 3).map((person) => (
            <span key={person.id} className={styles.avatar} title={person.name} aria-label={person.name}>{person.initials}</span>
          ))}
          {people.length > 3 && <span className={`${styles.avatar} ${styles.avatarMore}`}>+{people.length - 3}</span>}
        </span>
      </div>

      <div className={styles.cardBottom}>
        <StatusBadge tone={priorityTone[item.priority]} size="sm" icon={<Flag width={11} height={11} />}>{item.priority}</StatusBadge>
        <span className={styles.cardMeta}>
          {item.attachmentCount > 0 && <span className={styles.metaItem}><Paperclip width={13} height={13} /> {item.attachmentCount}</span>}
          {item.commentCount > 0 && <span className={styles.metaItem}><MessageSquare width={13} height={13} /> {item.commentCount}</span>}
        </span>
      </div>
    </article>
  );
}
