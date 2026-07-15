import { useEffect, useRef, useState } from 'react';
import { MessageSquarePlus, Sparkles, Link2, MoreHorizontal, Check, X } from 'lucide-react';
import { clause14Draft, clauseTitle, type DraftPara, type Run } from '@/data/draftContent';
import { primaryBillContent } from '@/data/billContent';
import styles from './DocumentSurface.module.css';

export type EditorMode = 'edit' | 'review' | 'preview';
export type ChangeStatus = Record<string, 'pending' | 'accepted' | 'rejected'>;

// Sentinel targets used by the structure navigator.
export const LONG_TITLE = -1;
export const PREAMBLE = -2;
export const SCHEDULES = -3;

interface Props {
  mode: EditorMode;
  activeClause: number;
  changeStatus: ChangeStatus;
  onAccept?: (changeId: string) => void;
  onReject?: (changeId: string) => void;
  onComment?: () => void;
  onSuggest?: () => void;
  onCrossRef?: () => void;
  zoom?: number;
}

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

export function DocumentSurface({ mode, activeClause, changeStatus, onAccept, onReject, onComment, onSuggest, onCrossRef, zoom = 100 }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }); setSelected(null); }, [activeClause]);

  const paraChangeIds = (p: DraftPara) => [...new Set(p.runs.map((r) => r.changeId).filter(Boolean))] as string[];

  const clean = primaryBillContent.clauses.find((c) => c.number === activeClause);

  return (
    <div className={styles.workspace} style={{ fontSize: `${zoom}%` }} ref={scrollRef}>
      <article className={styles.page} id={`clause-${activeClause}`}>
        {activeClause === LONG_TITLE && (<><h2 className={styles.clauseHeading}>Long Title</h2><p className={styles.plainPara}>{primaryBillContent.longTitle}</p></>)}
        {activeClause === PREAMBLE && (<><h2 className={styles.clauseHeading}>Preamble</h2><p className={styles.plainPara}>{primaryBillContent.preamble}</p></>)}
        {activeClause === SCHEDULES && (<><h2 className={styles.clauseHeading}>Schedules</h2><p className={styles.plainPara}>No schedules are currently attached to this Bill.</p></>)}

        {activeClause === 14 && (
          <>
            <h2 className={styles.clauseHeading}>Clause 14 — {clauseTitle(14)}</h2>
            {clause14Draft.map((p) => {
              const changeIds = paraChangeIds(p);
              const pending = changeIds.filter((id) => (changeStatus[id] ?? 'pending') === 'pending');
              const showReview = mode === 'review' && changeIds.length > 0;
              return (
                <div key={p.id} className={`${styles.paraRow} ${p.indent ? styles.indent : ''}`}>
                  {mode === 'review' && p.marker && <span className={`${styles.marker} ${styles['m_' + p.marker]}`} aria-hidden>{p.marker}</span>}
                  <div className={styles.paraMain}>
                    <p className={`${styles.para} ${selected === p.id && mode === 'edit' ? styles.paraSelected : ''}`} onClick={() => mode === 'edit' && setSelected((s) => (s === p.id ? null : p.id))}>
                      {p.label && <span className={styles.label}>{p.label}</span>}
                      {p.runs.map((r, i) => renderRun(r, mode, changeStatus, i))}
                    </p>
                    {mode === 'edit' && selected === p.id && (
                      <div className={styles.floating} role="toolbar" aria-label="Selection actions">
                        <button onClick={onComment}><MessageSquarePlus width={14} height={14} /> Comment</button>
                        <button onClick={onSuggest}><Sparkles width={14} height={14} /> Suggest wording</button>
                        <button onClick={onCrossRef}><Link2 width={14} height={14} /> Create cross-reference</button>
                        <button className={styles.floatMore} aria-label="More"><MoreHorizontal width={14} height={14} /></button>
                      </div>
                    )}
                  </div>
                  {showReview && (
                    <div className={styles.reviewActions}>
                      {pending.length > 0 ? (
                        <>
                          <button className={styles.accept} onClick={() => pending.forEach((cid) => onAccept?.(cid))}><Check width={14} height={14} /> Accept</button>
                          <button className={styles.reject} onClick={() => pending.forEach((cid) => onReject?.(cid))}><X width={14} height={14} /> Reject</button>
                        </>
                      ) : (<span className={styles.resolved}>{changeStatus[changeIds[0]] === 'accepted' ? 'Accepted' : 'Rejected'}</span>)}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {activeClause > 0 && activeClause !== 14 && clean && (
          <>
            <h2 className={styles.clauseHeading}>Clause {clean.number} — {clean.heading}</h2>
            {clean.paragraphs.map((para, i) => <p key={i} className={styles.plainPara}>{para}</p>)}
            {mode === 'edit' && <p className={styles.cleanNote}>This clause has no tracked changes in the current version.</p>}
          </>
        )}
      </article>
    </div>
  );
}
