import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ChevronRight, ChevronDown, ChevronUp, CircleCheck, Scale, RotateCcw,
  Undo2, Redo2, Plus, GitCompare, Eye, Sparkles, Search, MoreHorizontal, ShieldCheck, MessageSquare, Send, PenLine, X,
} from 'lucide-react';
import { EditorShell } from './EditorShell';
import { StructureNav } from './StructureNav';
import { DocumentSurface, type EditorMode, type ChangeStatus, LONG_TITLE, PREAMBLE } from './DocumentSurface';
import { ContextPanel, type PanelTab } from './ContextPanel';
import { CompareSheet } from './CompareSheet';
import { SubmitSheet } from './SubmitSheet';
import { AddCommentSheet } from './AddCommentSheet';
import { Button, Popover } from '@/components/ui';
import { changeSummary, clause14Changes, clause14Draft, documentParts } from '@/data/draftContent';
import { primaryBillContent } from '@/data/billContent';
import { useDemoStore } from '@/store/demoStore';
import { recordAudit } from '@/mocks/mockApi';
import styles from './DraftingWorkspace.module.css';
import { AknBuilderWorkspace } from './AknBuilderWorkspace';

const INSERT_ITEMS = ['Clause', 'Subclause', 'Paragraph', 'Definition', 'Heading', 'Cross-reference', 'Table', 'Schedule', 'Annotation'];

export function DraftingWorkspace({ reviewRoute = false }: { reviewRoute?: boolean }) {
  const { id = 'NA-BILL-2026-015' } = useParams();
  const [params] = useSearchParams();
  const paramMode = params.get('mode');
  // Derived (not state) so it stays correct if the component instance is reused across routes.
  const mode: EditorMode = reviewRoute || paramMode === 'review' ? 'review' : paramMode === 'preview' ? 'preview' : 'edit';
  const [trackChanges, setTrackChanges] = useState(true);
  const [activeClause, setActiveClause] = useState(14);
  const [panelTab, setPanelTab] = useState<PanelTab>(params.get('tab') === 'metadata' ? 'Metadata' : mode === 'review' ? 'Comments' : 'Comments');
  const [aiInserted, setAiInserted] = useState(false);
  const [aiDismissed, setAiDismissed] = useState(false);
  const [resolvedComments, setResolvedComments] = useState<Set<string>>(new Set());
  const [changeStatus, setChangeStatus] = useState<ChangeStatus>({});
  const [sheet, setSheet] = useState<'' | 'compare' | 'submit' | 'comment'>('');
  const [toast, setToast] = useState('');
  const [inserted, setInserted] = useState<Array<{ id: string; clause: number; type: string; text: string }>>([]);
  const [find, setFind] = useState('');
  const [findCursor, setFindCursor] = useState(-1);
  const [viewVersion, setViewVersion] = useState<string | null>(null);
  const [autoNumber, setAutoNumber] = useState(true);
  const navigate = useNavigate();
  const currentRole = useDemoStore((s) => s.currentRole);
  const record = useDemoStore((s) => s.records.find((item) => item.id === id));

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? '' : t)), 2600);
  }
  function resolveComment(cid: string) {
    setResolvedComments((s) => new Set(s).add(cid));
    showToast(`Comment ${cid} resolved.`);
  }
  function openClause(n: number) { setActiveClause(n); showToast(`Jumped to Clause ${n}.`); }

  const INSERT_DEFAULTS: Record<string, string> = {
    Clause: 'Enter the legislative provision.', Subclause: 'Enter the subclause text.', Paragraph: 'Enter text.',
    Definition: '“defined term” means ', Heading: 'Enter heading', 'Cross-reference': 'Refer to section ',
    Table: 'Column 1 | Column 2', Schedule: 'Schedule title', Annotation: 'Drafting note',
  };
  function insertBlock(itemType: string) {
    const blockId = `ins-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    setInserted((list) => [...list, { id: blockId, clause: activeClause, type: itemType, text: INSERT_DEFAULTS[itemType] ?? '' }]);
    recordAudit({ recordId: id, actorId: currentRole ?? 'dls-drafter', actionType: 'Edit', description: `Inserted a new ${itemType.toLowerCase()} into Clause ${activeClause}.` });
    showToast(`Inserted a new ${itemType.toLowerCase()} in Clause ${activeClause} — edit it inline.`);
  }
  function exportWorkingCopy() {
    const lines = ['Digital Public Services Bill, 2026', `${id.replace(/-/g, '/')} · Version 4.0`, '', 'CLAUSE 14 — Protection of vulnerable users', ''];
    clause14Draft.forEach((p) => {
      const text = p.runs.filter((r) => r.type !== 'del').map((r) => r.text).join('');
      lines.push(`${p.label ?? ''} ${text}`.trim());
    });
    const ins = inserted.filter((b) => b.clause === activeClause);
    if (ins.length) { lines.push('', 'INSERTED (working):'); ins.forEach((b) => lines.push(`[${b.type}] ${b.text}`)); }
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = `${id}-working-copy.txt`; a.click();
    URL.revokeObjectURL(url);
    showToast('Working copy downloaded.');
  }
  function editInserted(bid: string, text: string) { setInserted((list) => list.map((b) => (b.id === bid ? { ...b, text } : b))); }
  function removeInserted(bid: string) { setInserted((list) => list.filter((b) => b.id !== bid)); showToast('Inserted block removed.'); }
  function undoInsert() {
    if (!inserted.length) { showToast('Nothing to undo.'); return; }
    const last = inserted[inserted.length - 1];
    setInserted((list) => list.slice(0, -1));
    showToast(`Removed inserted ${last.type.toLowerCase()}.`);
  }

  // Find in document: count occurrences across the whole Bill (Long Title,
  // Preamble, Clause 14 draft, and every other clause) so we can cycle between
  // clauses that contain the term and badge match counts in the structure nav.
  const findData = useMemo(() => {
    const q = find.trim().toLowerCase();
    if (!q) return { perTarget: {} as Record<number, number>, order: [] as number[], total: 0 };
    const count = (s: string) => (s ? s.toLowerCase().split(q).length - 1 : 0);
    const perTarget: Record<number, number> = {};
    perTarget[LONG_TITLE] = count(primaryBillContent.longTitle);
    perTarget[PREAMBLE] = count(primaryBillContent.preamble);
    perTarget[14] = count(clause14Draft.map((p) => `${p.label ?? ''} ${p.runs.map((r) => r.text).join('')}`).join(' '));
    primaryBillContent.clauses.forEach((c) => {
      if (c.number === 14) return;
      perTarget[c.number] = count(`${c.heading} ${c.paragraphs.join(' ')}`);
    });
    const order: number[] = [];
    let total = 0;
    const push = (n: number) => { const c = perTarget[n] ?? 0; if (c > 0) { order.push(n); total += c; } };
    push(LONG_TITLE); push(PREAMBLE);
    documentParts.forEach((part) => part.clauses.forEach(push));
    return { perTarget, order, total };
  }, [find]);

  // A new query resets the cursor; typing highlights live without jumping.
  useEffect(() => { setFindCursor(-1); }, [find]);

  function stepFind(direction: 1 | -1) {
    if (!findData.order.length) return;
    const next = findCursor < 0
      ? (direction === 1 ? 0 : findData.order.length - 1)
      : (findCursor + direction + findData.order.length) % findData.order.length;
    setFindCursor(next);
    setActiveClause(findData.order[next]);
  }

  const readOnlyVersion = viewVersion !== null;
  const effectiveMode: EditorMode = readOnlyVersion ? 'preview' : (mode === 'edit' && !trackChanges ? 'preview' : mode);
  const shownVersion = viewVersion ?? (mode === 'review' ? '4.1' : '4.0');
  const reviewedCount = clause14Changes.filter((c) => changeStatus[c.id] && changeStatus[c.id] !== 'pending').length;

  function insertAi(edited: boolean) {
    setAiInserted(true);
    recordAudit({
      recordId: id, actorId: currentRole ?? 'dls-drafter', actionType: 'AI Suggestion',
      description: `AI suggestion ${edited ? 'edited and ' : ''}inserted into Clause 14 after human confirmation.`,
      newValue: 'Clause 14 wording',
    });
  }
  function setChange(cid: string, status: 'accepted' | 'rejected') {
    setChangeStatus((s) => ({ ...s, [cid]: status }));
    recordAudit({ recordId: id, actorId: currentRole ?? 'dls-reviewer', actionType: 'Edit', description: `${status === 'accepted' ? 'Accepted' : 'Rejected'} tracked change in Clause 14.` });
  }

  if (record && !record.isPrimary) return <AknBuilderWorkspace record={record} mode={mode} />;

  return (
    <EditorShell>
      {/* Compact editor header */}
      <header className={styles.topbar}>
        <div className={styles.tbLeft}>
          <Link to={`/legislative/${id}`} className={styles.back}><ArrowLeft width={16} height={16} /> Back to Bill Workspace</Link>
          <nav className={styles.crumb} aria-label="Breadcrumb">
            <span>Bills</span><ChevronRight width={12} height={12} /><span>{id.replace(/-/g, '/').replace('NA/BILL', 'NA/BILL')}</span><ChevronRight width={12} height={12} /><span className={styles.crumbCurrent}>{mode === 'review' ? 'Review' : mode === 'preview' ? 'Document Preview' : 'Structured Drafting'}</span>
          </nav>
          <div className={styles.titleRow}>
            <h1 className={styles.docTitle}>Digital Public Services Bill, 2026</h1>
            <Popover label="Select version" align="left" trigger={({ toggle, ref }) => (
              <button ref={ref} className={styles.versionSel} onClick={toggle}>NA/BILL/2026/015 · Version {shownVersion} <ChevronDown width={14} height={14} /></button>
            )}>
              {(close) => (
                <div className={styles.menu} onClick={close}>
                  <button className={styles.menuItem} onClick={() => { setViewVersion(null); showToast('Showing Version 4.0 — current working version.'); }}>Version 4.0 · Current working</button>
                  <button className={styles.menuItem} onClick={() => { setViewVersion('3.1'); showToast('Viewing Version 3.1 (superseded) — read-only.'); }}>Version 3.1 · Superseded</button>
                  <button className={styles.menuItem} onClick={() => { setViewVersion('3.0'); showToast('Viewing Version 3.0 (latest approved) — read-only.'); }}>Version 3.0 · Latest approved</button>
                  <Link to={`/legislative/${id}/versions`} className={styles.menuItem}>View all versions →</Link>
                </div>
              )}
            </Popover>
          </div>
        </div>

        <div className={styles.tbCenter}>
          {mode === 'review' ? (
            <div className={styles.statusCard}><Scale width={18} height={18} className={styles.statusIcon} /><div><p className={styles.statusTitle}>Under Legal Review</p><p className={styles.statusSub}>Saved · Today, 10:42 AM by Legal Counsel</p></div></div>
          ) : mode === 'preview' ? (
            <div className={styles.statusCard}><Eye width={18} height={18} className={styles.savedIcon} /><div><p className={styles.statusTitle}>Clean document preview</p><p className={styles.statusSub}>Tracked changes and editing controls are hidden</p></div></div>
          ) : (
            <div className={styles.statusCard}><CircleCheck width={18} height={18} className={styles.savedIcon} /><div><p className={styles.statusTitle}>Saved</p><p className={styles.statusSub}>Synced to canonical record · Last saved 10:42 AM</p></div></div>
          )}
        </div>

        <div className={styles.tbRight}>
          {mode === 'review' ? (
            <>
              <Button variant="secondary" leftIcon={<RotateCcw width={16} height={16} />} onClick={() => showToast('Return for revision — opens the return workflow.')}>Return for Revision</Button>
              <Button variant="secondary" leftIcon={<GitCompare width={16} height={16} />} onClick={() => setSheet('compare')}>Compare</Button>
              <Button variant="primary" leftIcon={<ShieldCheck width={16} height={16} />} onClick={() => showToast('Legal review approved — routing to Procedural Review.')}>Approve Legal Review</Button>
            </>
          ) : mode === 'preview' ? (
            <Button variant="primary" leftIcon={<PenLine width={16} height={16} />} to={`/legislative/${id}/draft`}>Return to Editing</Button>
          ) : (
            <>
              <Button variant="secondary" leftIcon={<ShieldCheck width={16} height={16} />} onClick={() => { setPanelTab('Validation'); showToast('Validation complete — 14 passed, 1 warning, 0 errors.'); }}>Validate</Button>
              <Button variant="secondary" leftIcon={<Eye width={16} height={16} />} to={`/legislative/${id}/draft?mode=preview`}>Preview</Button>
              <Button variant="primary" leftIcon={<Send width={15} height={15} />} onClick={() => setSheet('submit')}>Submit Revision</Button>
            </>
          )}
        </div>
      </header>

      {/* Read-only historical version banner */}
      {readOnlyVersion && (
        <div className={styles.readonlyBar} role="status">
          <span>Viewing <b>Version {viewVersion}</b> — read-only historical version. Editing is disabled.</span>
          <button className={styles.readonlyReturn} onClick={() => { setViewVersion(null); showToast('Returned to Version 4.0 (working).'); }}>Return to working version</button>
        </div>
      )}

      {/* Toolbar */}
      {mode !== 'preview' && !readOnlyVersion && <div className={styles.toolbar}>
        <div className={styles.toolGroup}>
          <button className={styles.tool} aria-label="Undo" onClick={undoInsert}><Undo2 width={16} height={16} /></button>
          <button className={styles.tool} aria-label="Redo" disabled><Redo2 width={16} height={16} /></button>
        </div>
        <span className={styles.toolSep} />
        {mode !== 'review' && (
          <Popover label="Insert" align="left" trigger={({ toggle, ref }) => (
            <button ref={ref} className={styles.toolText} onClick={toggle}><Plus width={15} height={15} /> Insert <ChevronDown width={13} height={13} /></button>
          )}>
            {(close) => (<div className={styles.menu} onClick={close}>{INSERT_ITEMS.map((it) => <button key={it} className={styles.menuItem} onClick={() => insertBlock(it)}>{it}</button>)}</div>)}
          </Popover>
        )}
        <button className={`${styles.toolText} ${trackChanges ? styles.toolActive : ''}`} onClick={() => { setTrackChanges((t) => !t); showToast(trackChanges ? 'Tracked changes hidden.' : 'Tracked changes shown.'); }} aria-pressed={trackChanges}><PenLine width={15} height={15} /> Track Changes</button>
        <button className={styles.toolText} onClick={() => setPanelTab('Comments')}><MessageSquare width={15} height={15} /> Comments</button>
        <button className={styles.toolText} onClick={() => setSheet('compare')}><GitCompare width={15} height={15} /> Compare</button>
        <button className={styles.toolText} onClick={() => { setPanelTab('Validation'); showToast('Validation complete — 14 passed, 1 warning, 0 errors.'); }}><ShieldCheck width={15} height={15} /> Validate</button>
        {mode !== 'review' && (
          <Popover label="AI Assist" align="left" trigger={({ toggle, ref }) => (
            <button ref={ref} className={styles.toolText} onClick={() => { setPanelTab('AI Assistant'); toggle(); }}><Sparkles width={15} height={15} /> AI Assist <ChevronDown width={13} height={13} /></button>
          )}>
            {(close) => (<div className={styles.menu} onClick={close}>{['Suggest clearer wording', 'Check consistency', 'Identify ambiguity', 'Compare related provisions', 'Summarise selected clause', 'Draft explanatory note'].map((it) => <button key={it} className={styles.menuItem} onClick={() => setPanelTab('AI Assistant')}>{it}</button>)}</div>)}
          </Popover>
        )}
        <form className={`${styles.findField} ${find.trim() ? styles.findFieldActive : ''}`} style={{ marginLeft: 'auto' }} onSubmit={(e) => { e.preventDefault(); stepFind(1); }}>
          <Search width={15} height={15} />
          <input value={find} onChange={(e) => setFind(e.target.value)} className={styles.findInput} placeholder="Find in document…" aria-label="Find in document" />
          {find.trim() && (
            <div className={styles.findCtrls}>
              <span className={styles.findCount} title={`${findData.total} match${findData.total === 1 ? '' : 'es'} in ${findData.order.length} clause${findData.order.length === 1 ? '' : 's'}`}>{findData.order.length ? `${findCursor >= 0 ? findCursor + 1 : 1}/${findData.order.length}` : '0/0'}</span>
              <button type="button" className={styles.findNav} aria-label="Previous match" disabled={!findData.order.length} onClick={() => stepFind(-1)}><ChevronUp width={15} height={15} /></button>
              <button type="button" className={styles.findNav} aria-label="Next match" disabled={!findData.order.length} onClick={() => stepFind(1)}><ChevronDown width={15} height={15} /></button>
              <button type="button" className={styles.findNav} aria-label="Clear search" onClick={() => setFind('')}><X width={14} height={14} /></button>
            </div>
          )}
        </form>
        <Popover label="More" align="right" trigger={({ toggle, ref }) => (
          <button ref={ref} className={styles.tool} onClick={toggle} aria-label="More"><MoreHorizontal width={16} height={16} /></button>
        )}>
          {(close) => (
            <div className={styles.menu} onClick={close}>
              <button className={styles.menuItem} onClick={() => setPanelTab('Metadata')}>Document metadata</button>
              <button className={styles.menuItem} onClick={() => { setAutoNumber((v) => !v); showToast(autoNumber ? 'Automatic clause numbering turned off.' : 'Automatic clause numbering turned on.'); }}>Automatic numbering: {autoNumber ? 'On' : 'Off'}</button>
              <button className={styles.menuItem} onClick={() => showToast('Keyboard: ⌘S Save · ⌘F Find · ⌘⇧C Comment.')}>Keyboard shortcuts</button>
              <button className={styles.menuItem} onClick={() => { setPanelTab('References'); showToast('Accessibility outline: heading structure valid.'); }}>View accessibility outline</button>
              <button className={styles.menuItem} onClick={exportWorkingCopy}>Export working copy</button>
            </div>
          )}
        </Popover>
      </div>}

      {/* Change summary (review) */}
      {mode === 'review' && (
        <div className={styles.changeSummary}>
          <span className={styles.csLabel}>Change summary</span>
          <span className={styles.csStat}><b className={styles.csAdd}>{changeSummary.additions}</b> Additions</span>
          <span className={styles.csStat}><b className={styles.csDel}>{changeSummary.deletions}</b> Deletions</span>
          <span className={styles.csStat}><b className={styles.csMod}>{changeSummary.modified}</b> Modified clauses</span>
          <span className={styles.csStat}><b className={styles.csMeta}>{changeSummary.metadata}</b> Metadata changes</span>
          <span className={styles.csReviewed}>{reviewedCount} of {clause14Changes.length} reviewed</span>
        </div>
      )}

      {/* Three columns */}
      <main className={`${styles.columns} ${mode === 'preview' ? styles.previewColumns : ''}`}>
        <StructureNav active={activeClause} matchCounts={find.trim() ? findData.perTarget : undefined} onSelect={(n) => { setActiveClause(n); }} />
        <DocumentSurface
          mode={effectiveMode}
          activeClause={activeClause}
          changeStatus={changeStatus}
          inserted={inserted.filter((b) => b.clause === activeClause)}
          onEditInserted={editInserted}
          onRemoveInserted={removeInserted}
          highlight={mode === 'preview' ? '' : find}
          onRef={(t) => navigate(`/search?q=${encodeURIComponent(t)}`)}
          onAccept={(cid) => setChange(cid, 'accepted')}
          onReject={(cid) => setChange(cid, 'rejected')}
          onComment={() => setSheet('comment')}
          onSuggest={() => setPanelTab('AI Assistant')}
          onCrossRef={() => insertBlock('Cross-reference')}
          onToast={showToast}
        />
        {mode !== 'preview' && <ContextPanel
          tab={panelTab}
          onTab={setPanelTab}
          aiInserted={aiInserted}
          aiDismissed={aiDismissed}
          onInsertAi={insertAi}
          onDismissAi={() => { setAiDismissed(true); showToast('Suggestion dismissed.'); }}
          resolvedComments={resolvedComments}
          onResolveComment={resolveComment}
          onOpenClause={() => openClause(14)}
          onToast={showToast}
          onGoWarning={() => { setActiveClause(14); setPanelTab('Validation'); }}
        />}
      </main>

      {/* Status bar */}
      <div className={styles.statusbar}>
        <span>{mode === 'review' ? `Reviewing Version 4.1 · Clause ${activeClause}` : mode === 'preview' ? `Clean preview · Clause ${activeClause}` : `1 of 1 change · Clause ${activeClause}`}</span>
        {mode !== 'preview' && <span className={styles.legend}><span className={styles.legIns} /> Insertions <span className={styles.legDel} /> Deletions</span>}
        <span className={styles.zoom}>Ln 24, Col 37 · 100%</span>
      </div>

      <CompareSheet open={sheet === 'compare'} onClose={() => setSheet('')} onToast={showToast} />
      <SubmitSheet open={sheet === 'submit'} onClose={() => setSheet('')} recordId={id} onSaveDraft={() => showToast('Working draft saved.')} />
      <AddCommentSheet open={sheet === 'comment'} onClose={() => setSheet('')} onAdded={() => showToast('Comment added to Clause 14.')} />

      {toast && <div className={styles.toast} role="status" aria-live="polite">{toast}</div>}
    </EditorShell>
  );
}
