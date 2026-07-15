import { useState } from 'react';
import { MessageSquarePlus, Sparkles, Link2, MoreHorizontal, Check, X } from 'lucide-react';
import { clause14Draft, clauseTitle, type DraftPara, type Run } from '@/data/draftContent';
import styles from './DocumentSurface.module.css';

export type EditorMode = 'edit' | 'review' | 'preview';
export type ChangeStatus = Record<string, 'pending' | 'accepted' | 'rejected'>;

interface Props {
  mode: EditorMode;
  changeStatus: ChangeStatus;
  onAccept?: (changeId: string) => void;
  onReject?: (changeId: string) => void;
  onComment?: () => void;
  onSuggest?: () => void;
  zoom?: number;
}

// Renders a run given the current mode and the accept/reject status of its change.
function renderRun(run: Run, mode: EditorMode, status: ChangeStatus, key: number) {
  const st = run.changeId ? status[run.changeId] ?? 'pending' : undefined;
  if (run.ref) return <a key={key} className={styles.ref} href="#" onClick={(e) => e.preventDefault()}>{run.text}</a>;

  if (run.type === 'ins') {
    if (mode === 'preview' || st === 'accepted') return <span key={key}>{run.text}</span>;
    if (st === 'rejected') return null;
    return <ins key={key} className={styles.ins}>{run.text}</ins>;
  }
  if (run.type === 'del') {
    if (mode === 'preview' || st === 'accepted') return null;
    if (st === 'rejected') return <span key={key}>{run.text}</span>;
    return <del key={key} className={styles.del}>{run.text}</del>;
  }
  return <span key={key}>{run.text}</span>;
}

export function DocumentSurface({ mode, changeStatus, onAccept, onReject, onComment, onSuggest, zoom = 100 }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  // Changes affecting a paragraph (for review accept/reject controls).
  const paraChangeIds = (p: DraftPara) => [...new Set(p.runs.map((r) => r.changeId).filter(Boolean))] as string[];

  return (
    <div className={styles.workspace} style={{ fontSize: `${zoom}%` }}>
      <article className={styles.page} id="clause-14">
        <h2 className={styles.clauseHeading}>Clause 14 — {clauseTitle(14)}</h2>

        {clause14Draft.map((p) => {
          const changeIds = paraChangeIds(p);
          const pending = changeIds.filter((id) => (changeStatus[id] ?? 'pending') === 'pending');
          const showReview = mode === 'review' && changeIds.length > 0;
          return (
            <div key={p.id} className={`${styles.paraRow} ${p.indent ? styles.indent : ''}`}>
              {mode === 'review' && p.marker && <span className={`${styles.marker} ${styles['m_' + p.marker]}`} aria-hidden>{p.marker}</span>}
              <div className={styles.paraMain}>
                <p
                  className={`${styles.para} ${selected === p.id && mode === 'edit' ? styles.paraSelected : ''}`}
                  onClick={() => mode === 'edit' && setSelected((s) => (s === p.id ? null : p.id))}
                >
                  {p.label && <span className={styles.label}>{p.label}</span>}
                  {p.runs.map((r, i) => renderRun(r, mode, changeStatus, i))}
                </p>

                {/* Floating contextual toolbar (edit mode) */}
                {mode === 'edit' && selected === p.id && (
                  <div className={styles.floating} role="toolbar" aria-label="Selection actions">
                    <button onClick={onComment}><MessageSquarePlus width={14} height={14} /> Comment</button>
                    <button onClick={onSuggest}><Sparkles width={14} height={14} /> Suggest wording</button>
                    <button><Link2 width={14} height={14} /> Create cross-reference</button>
                    <button className={styles.floatMore} aria-label="More"><MoreHorizontal width={14} height={14} /></button>
                  </div>
                )}
              </div>

              {/* Review accept/reject controls */}
              {showReview && (
                <div className={styles.reviewActions}>
                  {pending.length > 0 ? (
                    <>
                      <button className={styles.accept} onClick={() => pending.forEach((id) => onAccept?.(id))}><Check width={14} height={14} /> Accept</button>
                      <button className={styles.reject} onClick={() => pending.forEach((id) => onReject?.(id))}><X width={14} height={14} /> Reject</button>
                    </>
                  ) : (
                    <span className={styles.resolved}>{changeStatus[changeIds[0]] === 'accepted' ? 'Accepted' : 'Rejected'}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </article>
    </div>
  );
}
