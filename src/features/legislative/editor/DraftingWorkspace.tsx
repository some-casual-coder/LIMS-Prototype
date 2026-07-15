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
  const [changeStatus, setChangeStatus] = useState<ChangeStatus>({});
  const [sheet, setSheet] = useState<'' | 'compare' | 'submit' | 'comment'>('');
  const currentRole = useDemoStore((s) => s.currentRole);

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
            <button className={styles.versionSel}>NA/BILL/2026/015 · Version {mode === 'review' ? '4.1' : '4.0'} <ChevronDown width={14} height={14} /></button>
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
              <Button variant="secondary" leftIcon={<RotateCcw width={16} height={16} />}>Return for Revision</Button>
              <Button variant="secondary" leftIcon={<GitCompare width={16} height={16} />} onClick={() => setSheet('compare')}>Compare</Button>
              <Button variant="primary" leftIcon={<ShieldCheck width={16} height={16} />}>Approve Legal Review</Button>
            </>
          ) : (
            <>
              <Button variant="secondary" leftIcon={<ShieldCheck width={16} height={16} />} onClick={() => setPanelTab('Validation')}>Validate</Button>
              <Button variant="secondary" leftIcon={<Eye width={16} height={16} />}>Preview</Button>
              <Button variant="primary" leftIcon={<Send width={15} height={15} />} onClick={() => setSheet('submit')}>Submit Revision</Button>
            </>
          )}
        </div>
      </header>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolGroup}>
          <button className={styles.tool} aria-label="Undo"><Undo2 width={16} height={16} /></button>
          <button className={styles.tool} aria-label="Redo" disabled><Redo2 width={16} height={16} /></button>
        </div>
        <span className={styles.toolSep} />
        {mode !== 'review' && (
          <Popover label="Insert" trigger={({ toggle, ref }) => (
            <button ref={ref} className={styles.toolText} onClick={toggle}><Plus width={15} height={15} /> Insert <ChevronDown width={13} height={13} /></button>
          )}>
            {(close) => (<div className={styles.menu} onClick={close}>{INSERT_ITEMS.map((it) => <button key={it} className={styles.menuItem}>{it}</button>)}</div>)}
          </Popover>
        )}
        <button className={`${styles.toolText} ${trackChanges ? styles.toolActive : ''}`} onClick={() => setTrackChanges((t) => !t)} aria-pressed={trackChanges}><PenLine width={15} height={15} /> Track Changes</button>
        <button className={styles.toolText} onClick={() => setPanelTab('Comments')}><MessageSquare width={15} height={15} /> Comments</button>
        <button className={styles.toolText} onClick={() => setSheet('compare')}><GitCompare width={15} height={15} /> Compare</button>
        <button className={styles.toolText} onClick={() => setPanelTab('Validation')}><ShieldCheck width={15} height={15} /> Validate</button>
        {mode !== 'review' && (
          <Popover label="AI Assist" trigger={({ toggle, ref }) => (
            <button ref={ref} className={styles.toolText} onClick={() => { setPanelTab('AI Assistant'); toggle(); }}><Sparkles width={15} height={15} /> AI Assist <ChevronDown width={13} height={13} /></button>
          )}>
            {(close) => (<div className={styles.menu} onClick={close}>{['Suggest clearer wording', 'Check consistency', 'Identify ambiguity', 'Compare related provisions', 'Summarise selected clause', 'Draft explanatory note'].map((it) => <button key={it} className={styles.menuItem} onClick={() => setPanelTab('AI Assistant')}>{it}</button>)}</div>)}
          </Popover>
        )}
        <button className={styles.toolText}><Search width={15} height={15} /> Find</button>
        <button className={styles.tool} style={{ marginLeft: 'auto' }} aria-label="More"><MoreHorizontal width={16} height={16} /></button>
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
        <StructureNav active={activeClause} onSelect={setActiveClause} />
        <DocumentSurface
          mode={effectiveMode}
          changeStatus={changeStatus}
          onAccept={(cid) => setChange(cid, 'accepted')}
          onReject={(cid) => setChange(cid, 'rejected')}
          onComment={() => setSheet('comment')}
          onSuggest={() => setPanelTab('AI Assistant')}
        />
        <ContextPanel tab={panelTab} onTab={setPanelTab} aiInserted={aiInserted} onInsertAi={insertAi} onGoWarning={() => { setActiveClause(14); setPanelTab('Validation'); }} />
      </div>

      {/* Status bar */}
      <div className={styles.statusbar}>
        <span>{mode === 'review' ? `Reviewing Version 4.1 · Clause ${activeClause}` : `1 of 1 change · Clause ${activeClause}`}</span>
        <span className={styles.legend}><span className={styles.legIns} /> Insertions <span className={styles.legDel} /> Deletions</span>
        <span className={styles.zoom}>Ln 24, Col 37 · 100%</span>
      </div>

      <CompareSheet open={sheet === 'compare'} onClose={() => setSheet('')} />
      <SubmitSheet open={sheet === 'submit'} onClose={() => setSheet('')} recordId={id} />
      <AddCommentSheet open={sheet === 'comment'} onClose={() => setSheet('')} />
    </EditorShell>
  );
}
