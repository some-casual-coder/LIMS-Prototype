import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ChevronRight, ChevronDown, CircleCheck, Scale, RotateCcw,
  Undo2, Redo2, Plus, GitCompare, Eye, Sparkles, Search, MoreHorizontal, ShieldCheck, MessageSquare, Send, PenLine,
} from 'lucide-react';
import { EditorShell } from './EditorShell';
import { StructureNav } from './StructureNav';
import { DocumentSurface, type EditorMode, type ChangeStatus } from './DocumentSurface';
import { ContextPanel, type PanelTab } from './ContextPanel';
import { CompareSheet } from './CompareSheet';
import { SubmitSheet } from './SubmitSheet';
import { AddCommentSheet } from './AddCommentSheet';
import { Button, Popover } from '@/components/ui';
import { changeSummary, clause14Changes } from '@/data/draftContent';
import { useDemoStore } from '@/store/demoStore';
import { recordAudit } from '@/mocks/mockApi';
import styles from './DraftingWorkspace.module.css';

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
  const currentRole = useDemoStore((s) => s.currentRole);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? '' : t)), 2600);
  }
  function resolveComment(cid: string) {
    setResolvedComments((s) => new Set(s).add(cid));
    showToast(`Comment ${cid} resolved.`);
  }
  function openClause(n: number) { setActiveClause(n); showToast(`Jumped to Clause ${n}.`); }

  const effectiveMode: EditorMode = mode === 'edit' && !trackChanges ? 'preview' : mode;
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

  return (
    <EditorShell>
      {/* Compact editor header */}
      <header className={styles.topbar}>
        <div className={styles.tbLeft}>
          <Link to={`/legislative/${id}`} className={styles.back}><ArrowLeft width={16} height={16} /> Back to Bill Workspace</Link>
          <nav className={styles.crumb} aria-label="Breadcrumb">
            <span>Bills</span><ChevronRight width={12} height={12} /><span>{id.replace(/-/g, '/').replace('NA/BILL', 'NA/BILL')}</span><ChevronRight width={12} height={12} /><span className={styles.crumbCurrent}>{mode === 'review' ? 'Review' : 'Structured Drafting'}</span>
          </nav>
          <div className={styles.titleRow}>
            <h1 className={styles.docTitle}>Digital Public Services Bill, 2026</h1>
            <Popover label="Select version" align="left" trigger={({ toggle, ref }) => (
              <button ref={ref} className={styles.versionSel} onClick={toggle}>NA/BILL/2026/015 · Version {mode === 'review' ? '4.1' : '4.0'} <ChevronDown width={14} height={14} /></button>
            )}>
              {(close) => (
                <div className={styles.menu} onClick={close}>
                  <button className={styles.menuItem} onClick={() => showToast('Viewing Version 4.0 — current working version.')}>Version 4.0 · Current working</button>
                  <button className={styles.menuItem} onClick={() => showToast('Version 3.1 is superseded.')}>Version 3.1 · Superseded</button>
                  <button className={styles.menuItem} onClick={() => showToast('Version 3.0 is the latest approved version.')}>Version 3.0 · Latest approved</button>
                  <Link to={`/legislative/${id}/versions`} className={styles.menuItem}>View all versions →</Link>
                </div>
              )}
            </Popover>
          </div>
        </div>

        <div className={styles.tbCenter}>
          {mode === 'review' ? (
            <div className={styles.statusCard}><Scale width={18} height={18} className={styles.statusIcon} /><div><p className={styles.statusTitle}>Under Legal Review</p><p className={styles.statusSub}>Saved · Today, 10:42 AM by Legal Counsel</p></div></div>
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
          ) : (
            <>
              <Button variant="secondary" leftIcon={<ShieldCheck width={16} height={16} />} onClick={() => { setPanelTab('Validation'); showToast('Validation complete — 14 passed, 1 warning, 0 errors.'); }}>Validate</Button>
              <Button variant="secondary" leftIcon={<Eye width={16} height={16} />} onClick={() => { setTrackChanges(false); showToast('Preview — clean document with tracked changes hidden.'); }}>Preview</Button>
              <Button variant="primary" leftIcon={<Send width={15} height={15} />} onClick={() => setSheet('submit')}>Submit Revision</Button>
            </>
          )}
        </div>
      </header>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolGroup}>
          <button className={styles.tool} aria-label="Undo" onClick={() => showToast('Nothing to undo.')}><Undo2 width={16} height={16} /></button>
          <button className={styles.tool} aria-label="Redo" disabled><Redo2 width={16} height={16} /></button>
        </div>
        <span className={styles.toolSep} />
        {mode !== 'review' && (
          <Popover label="Insert" trigger={({ toggle, ref }) => (
            <button ref={ref} className={styles.toolText} onClick={toggle}><Plus width={15} height={15} /> Insert <ChevronDown width={13} height={13} /></button>
          )}>
            {(close) => (<div className={styles.menu} onClick={close}>{INSERT_ITEMS.map((it) => <button key={it} className={styles.menuItem} onClick={() => showToast(`Inserted a new ${it.toLowerCase()} in Clause ${activeClause}.`)}>{it}</button>)}</div>)}
          </Popover>
        )}
        <button className={`${styles.toolText} ${trackChanges ? styles.toolActive : ''}`} onClick={() => { setTrackChanges((t) => !t); showToast(trackChanges ? 'Tracked changes hidden.' : 'Tracked changes shown.'); }} aria-pressed={trackChanges}><PenLine width={15} height={15} /> Track Changes</button>
        <button className={styles.toolText} onClick={() => setPanelTab('Comments')}><MessageSquare width={15} height={15} /> Comments</button>
        <button className={styles.toolText} onClick={() => setSheet('compare')}><GitCompare width={15} height={15} /> Compare</button>
        <button className={styles.toolText} onClick={() => { setPanelTab('Validation'); showToast('Validation complete — 14 passed, 1 warning, 0 errors.'); }}><ShieldCheck width={15} height={15} /> Validate</button>
        {mode !== 'review' && (
          <Popover label="AI Assist" trigger={({ toggle, ref }) => (
            <button ref={ref} className={styles.toolText} onClick={() => { setPanelTab('AI Assistant'); toggle(); }}><Sparkles width={15} height={15} /> AI Assist <ChevronDown width={13} height={13} /></button>
          )}>
            {(close) => (<div className={styles.menu} onClick={close}>{['Suggest clearer wording', 'Check consistency', 'Identify ambiguity', 'Compare related provisions', 'Summarise selected clause', 'Draft explanatory note'].map((it) => <button key={it} className={styles.menuItem} onClick={() => setPanelTab('AI Assistant')}>{it}</button>)}</div>)}
          </Popover>
        )}
        <Popover label="Find" trigger={({ toggle, ref }) => (
          <button ref={ref} className={styles.toolText} onClick={toggle}><Search width={15} height={15} /> Find</button>
        )}>
          {(close) => (
            <form className={styles.findBar} onSubmit={(e) => { e.preventDefault(); const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value.trim(); close(); showToast(q ? `${q.length % 3 + 1} matches for “${q}” in Clause ${activeClause}.` : 'Enter a term to find.'); }}>
              <input name="q" className={styles.findInput} placeholder="Find in document…" aria-label="Find in document" autoFocus />
              <button type="submit" className={styles.findGo}>Find</button>
            </form>
          )}
        </Popover>
        <Popover label="More" align="right" trigger={({ toggle, ref }) => (
          <button ref={ref} className={styles.tool} style={{ marginLeft: 'auto' }} onClick={toggle} aria-label="More"><MoreHorizontal width={16} height={16} /></button>
        )}>
          {(close) => (
            <div className={styles.menu} onClick={close}>
              <button className={styles.menuItem} onClick={() => setPanelTab('Metadata')}>Document metadata</button>
              <button className={styles.menuItem} onClick={() => showToast('Numbering settings updated.')}>Numbering settings</button>
              <button className={styles.menuItem} onClick={() => showToast('Keyboard: ⌘S Save · ⌘F Find · ⌘⇧C Comment.')}>Keyboard shortcuts</button>
              <button className={styles.menuItem} onClick={() => { setPanelTab('References'); showToast('Accessibility outline: heading structure valid.'); }}>View accessibility outline</button>
              <button className={styles.menuItem} onClick={() => showToast('Exporting a working copy…')}>Export working copy</button>
            </div>
          )}
        </Popover>
      </div>

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
      <div className={styles.columns}>
        <StructureNav active={activeClause} onSelect={(n) => { setActiveClause(n); }} />
        <DocumentSurface
          mode={effectiveMode}
          activeClause={activeClause}
          changeStatus={changeStatus}
          onAccept={(cid) => setChange(cid, 'accepted')}
          onReject={(cid) => setChange(cid, 'rejected')}
          onComment={() => setSheet('comment')}
          onSuggest={() => { setActiveClause(14); setPanelTab('AI Assistant'); }}
          onCrossRef={() => showToast('Cross-reference created for the selected passage.')}
        />
        <ContextPanel
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
        />
      </div>

      {/* Status bar */}
      <div className={styles.statusbar}>
        <span>{mode === 'review' ? `Reviewing Version 4.1 · Clause ${activeClause}` : `1 of 1 change · Clause ${activeClause}`}</span>
        <span className={styles.legend}><span className={styles.legIns} /> Insertions <span className={styles.legDel} /> Deletions</span>
        <span className={styles.zoom}>Ln 24, Col 37 · 100%</span>
      </div>

      <CompareSheet open={sheet === 'compare'} onClose={() => setSheet('')} />
      <SubmitSheet open={sheet === 'submit'} onClose={() => setSheet('')} recordId={id} />
      <AddCommentSheet open={sheet === 'comment'} onClose={() => setSheet('')} onAdded={() => showToast('Comment added to Clause 14.')} />

      {toast && <div className={styles.toast} role="status" aria-live="polite">{toast}</div>}
    </EditorShell>
  );
}
