import { useEffect, useRef, useState } from 'react';
import { MessageSquarePlus, Sparkles, Link2, MoreHorizontal, Check, X } from 'lucide-react';
import { Popover } from '@/components/ui';
import { clause14Draft, clauseTitle, type DraftPara, type Run } from '@/data/draftContent';
import { primaryBillContent } from '@/data/billContent';
import styles from './DocumentSurface.module.css';

export type EditorMode = 'edit' | 'review' | 'preview';
export type ChangeStatus = Record<string, 'pending' | 'accepted' | 'rejected'>;

export const LONG_TITLE = -1;
export const PREAMBLE = -2;
export const SCHEDULES = -3;

interface InsertedBlock { id: string; type: string; text: string }
interface Props {
  mode: EditorMode;
  activeClause: number;
  changeStatus: ChangeStatus;
  inserted?: InsertedBlock[];
  onEditInserted?: (id: string, text: string) => void;
  onRemoveInserted?: (id: string) => void;
  onAccept?: (changeId: string) => void;
  onReject?: (changeId: string) => void;
  onComment?: () => void;
  onSuggest?: () => void;
  onCrossRef?: () => void;
  onToast?: (msg: string) => void;
  zoom?: number;
}

function renderRun(run: Run, mode: EditorMode, status: ChangeStatus, key: number, onToast?: (m: string) => void) {
  const st = run.changeId ? status[run.changeId] ?? 'pending' : undefined;
  if (run.ref) return <a key={key} className={styles.ref} href="#" onClick={(e) => { e.preventDefault(); onToast?.(`Opening “${run.text}” in a reference preview.`); }}>{run.text}</a>;
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

// Shared selection toolbar shown under any selected paragraph (edit mode).
function FloatingToolbar({ onComment, onSuggest, onCrossRef, onToast, clauseNo }: {
  onComment?: () => void; onSuggest?: () => void; onCrossRef?: () => void; onToast?: (m: string) => void; clauseNo: number;
}) {
  return (
    <div className={styles.floating} role="toolbar" aria-label="Selection actions">
      <button onClick={onComment}><MessageSquarePlus width={14} height={14} /> Comment</button>
      <button onClick={onSuggest}><Sparkles width={14} height={14} /> Suggest wording</button>
      <button onClick={onCrossRef}><Link2 width={14} height={14} /> Create cross-reference</button>
      <Popover label="More selection actions" align="left" trigger={({ toggle, ref }) => (
        <button ref={ref} className={styles.floatMore} aria-label="More actions" onClick={toggle}><MoreHorizontal width={14} height={14} /></button>
      )}>
        {(close) => (
          <div className={styles.floatMenu} onClick={close}>
            <button onClick={() => onToast?.('Define term — added to the interpretation clause.')}>Define term</button>
            <button onClick={() => { navigator.clipboard?.writeText(`${location.origin}/#/legislative/NA-BILL-2026-015/draft#clause-${clauseNo}`); onToast?.('Clause link copied to clipboard.'); }}>Copy clause link</button>
            <button onClick={() => onToast?.('Passage bookmarked.')}>Bookmark passage</button>
          </div>
        )}
      </Popover>
    </div>
  );
}

export function DocumentSurface({ mode, activeClause, changeStatus, inserted = [], onEditInserted, onRemoveInserted, onAccept, onReject, onComment, onSuggest, onCrossRef, onToast, zoom = 100 }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }); setSelected(null); }, [activeClause]);

  const paraChangeIds = (p: DraftPara) => [...new Set(p.runs.map((r) => r.changeId).filter(Boolean))] as string[];
  const clean = primaryBillContent.clauses.find((c) => c.number === activeClause);
  const toolbar = (
    <FloatingToolbar onComment={onComment} onSuggest={onSuggest} onCrossRef={onCrossRef} onToast={onToast} clauseNo={activeClause} />
  );

  return (
    <div className={styles.workspace} style={{ fontSize: `${zoom}%` }} ref={scrollRef}>
      <article className={styles.page} id={`clause-${activeClause}`}>
        {activeClause === LONG_TITLE && (<><h2 className={styles.clauseHeading}>Long Title</h2><SelectablePlain id="lt" text={primaryBillContent.longTitle} mode={mode} selected={selected} onSelect={setSelected} toolbar={toolbar} /></>)}
        {activeClause === PREAMBLE && (<><h2 className={styles.clauseHeading}>Preamble</h2><SelectablePlain id="pre" text={primaryBillContent.preamble} mode={mode} selected={selected} onSelect={setSelected} toolbar={toolbar} /></>)}
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
                      {p.runs.map((r, i) => renderRun(r, mode, changeStatus, i, onToast))}
                    </p>
                    {mode === 'edit' && selected === p.id && toolbar}
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
            {clean.paragraphs.map((para, i) => (
              <SelectablePlain key={i} id={`c${activeClause}-${i}`} text={para} mode={mode} selected={selected} onSelect={setSelected} toolbar={toolbar} />
            ))}
            {mode === 'edit' && <p className={styles.cleanNote}>This clause has no tracked changes in the current version.</p>}
          </>
        )}

        {mode !== 'preview' && inserted.length > 0 && (
          <div className={styles.insertedGroup}>
            {inserted.map((b) => (
              <div key={b.id} className={styles.insertedBlock}>
                <div className={styles.insertedMeta}>
                  <span className={styles.insertedTag}>Inserted · {b.type}</span>
                  <button className={styles.insertedRemove} onClick={() => onRemoveInserted?.(b.id)}>Remove</button>
                </div>
                {b.type === 'Heading' || b.type === 'Schedule' ? (
                  <input className={styles.insertedHeading} value={b.text} onChange={(e) => onEditInserted?.(b.id, e.target.value)} aria-label={`${b.type} text`} />
                ) : (
                  <textarea className={styles.insertedInput} value={b.text} onChange={(e) => onEditInserted?.(b.id, e.target.value)} rows={2} aria-label={`${b.type} text`} />
                )}
              </div>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}

// A plain paragraph that is selectable (edit mode) and shows the floating toolbar.
function SelectablePlain({ id, text, mode, selected, onSelect, toolbar }: {
  id: string; text: string; mode: EditorMode; selected: string | null; onSelect: (id: string | null) => void; toolbar: React.ReactNode;
}) {
  return (
    <div className={styles.paraMain}>
      <p className={`${styles.plainPara} ${styles.para} ${selected === id && mode === 'edit' ? styles.paraSelected : ''}`} onClick={() => mode === 'edit' && onSelect(selected === id ? null : id)}>
        {text}
      </p>
      {mode === 'edit' && selected === id && toolbar}
    </div>
  );
}
