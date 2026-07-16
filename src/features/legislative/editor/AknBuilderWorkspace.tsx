import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Check, ChevronDown, ChevronRight, ChevronUp, CircleCheck, CircleDot,
  Eye, FileCode2, FilePlus2, GripVertical, ListTree, Plus, Redo2,
  Save, Search, ShieldCheck, Trash2, Undo2, MessageSquare, Sparkles,
  GitCompare, PenLine, MoreHorizontal, Landmark, Info, WandSparkles, X,
} from 'lucide-react';
import { Button, Popover } from '@/components/ui';
import type {
  AkomaBlockType, AkomaSectionTag, LegislativeRecord, StructuredBillDraft,
  StructuredDraftBlock,
} from '@/data/types';
import {
  akomaBlockOptions, akomaSectionOptions, createStructuredDraft,
  makeDraftBlock, makeDraftSection,
} from '@/data/structuredDrafts';
import { useDemoStore } from '@/store/demoStore';
import { recordAudit } from '@/mocks/mockApi';
import { EditorShell } from './EditorShell';
import type { EditorMode } from './DocumentSurface';
import { AknCompareSheet } from './AknCompareSheet';
import { diffSections } from './draftDiff';
import styles from './AknBuilderWorkspace.module.css';

interface Props {
  record: LegislativeRecord;
  mode: EditorMode;
}

function sectionStatus(draft: StructuredBillDraft, sectionId: string) {
  const section = draft.sections.find((item) => item.id === sectionId);
  if (!section) return 'empty';
  if (section.tag === 'meta') return draft.title.trim() && draft.reference.trim() ? 'complete' : 'empty';
  return section.blocks.some((block) => block.text.trim()) ? 'complete' : 'empty';
}

function blockLabel(block: StructuredDraftBlock) {
  if (block.type === 'clause' || block.type === 'subclause') return `${block.label} ${block.number ?? ''}`.trim();
  return block.label;
}

function sectionGuidance(tag?: AkomaSectionTag) {
  if (!tag || tag === 'meta') return 'Primary metadata required for every Akoma Ntoso document.';
  if (['body', 'amendmentBody', 'collectionBody', 'debateBody', 'judgmentBody', 'mainBody'].includes(tag)) {
    return 'The main document body contains the ordered legislative hierarchy and provisions.';
  }
  return akomaSectionOptions.find((option) => option.tag === tag)?.description ?? 'Structured document section.';
}

export function AknBuilderWorkspace({ record, mode }: Props) {
  const [searchParams] = useSearchParams();
  const storedDraft = useDemoStore((state) => state.structuredDrafts[record.id]);
  const addDraft = useDemoStore((state) => state.addStructuredDraft);
  const replaceDraft = useDemoStore((state) => state.replaceStructuredDraft);
  const updateMeta = useDemoStore((state) => state.updateStructuredDraftMeta);
  const setActiveSection = useDemoStore((state) => state.setStructuredDraftActiveSection);
  const addSection = useDemoStore((state) => state.addStructuredDraftSection);
  const addBlock = useDemoStore((state) => state.addStructuredDraftBlock);
  const updateBlock = useDemoStore((state) => state.updateStructuredDraftBlock);
  const moveBlock = useDemoStore((state) => state.moveStructuredDraftBlock);
  const removeBlock = useDemoStore((state) => state.removeStructuredDraftBlock);
  const saveRevision = useDemoStore((state) => state.saveStructuredDraftRevision);
  const currentRole = useDemoStore((state) => state.currentRole);
  const [toast, setToast] = useState('');
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [trackChanges, setTrackChanges] = useState(true);
  const [compareOpen, setCompareOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<'Comments' | 'AI Assistant' | 'Validation' | 'Metadata' | 'References'>('Comments');
  const [aiDrafted, setAiDrafted] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [findCursor, setFindCursor] = useState(-1);
  const undoStack = useRef<StructuredBillDraft[]>([]);
  const redoStack = useRef<StructuredBillDraft[]>([]);
  const editCheckpoint = useRef<string | null>(null);
  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!storedDraft) addDraft(createStructuredDraft(record));
  }, [addDraft, record, storedDraft]);

  const draft = storedDraft ?? createStructuredDraft(record);
  const activeSection = draft.sections.find((section) => section.id === draft.activeSectionId) ?? draft.sections[0];
  const bodySection = draft.sections.find((section) => ['body', 'amendmentBody', 'collectionBody', 'debateBody', 'judgmentBody', 'mainBody'].includes(section.tag));
  const validation = useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];
    if (!draft.title.trim()) errors.push('Document title is required in <meta>.');
    if (!draft.reference.trim()) errors.push('Canonical reference is required in <meta>.');
    if (!bodySection) errors.push('A document body is required.');
    else if (!bodySection.blocks.some((block) => block.text.trim())) errors.push('Add at least one provision to the document body.');
    if (!draft.sections.some((section) => section.tag === 'preamble')) warnings.push('No <preamble> or enacting formula is present.');
    if (!draft.sections.some((section) => section.tag === 'conclusions')) warnings.push('Concluding matter has not been added.');
    return { errors, warnings };
  }, [bodySection, draft.reference, draft.sections, draft.title]);

  // Track Changes: mark blocks changed since the last saved version.
  const lastRevision = draft.revisions[draft.revisions.length - 1];
  const trackMarks = useMemo(
    () => (trackChanges && lastRevision ? diffSections(lastRevision.sections, draft.sections).byBlock : {}),
    [trackChanges, lastRevision, draft.sections],
  );

  // Find in document: count occurrences per block + per section so the toolbar
  // can cycle through hits and the structure sidebar can badge match counts.
  const find = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { term: '', hits: [] as { sectionId: string; blockId: string; count: number }[], perBlock: {} as Record<string, number>, perSection: {} as Record<string, number>, total: 0 };
    const perBlock: Record<string, number> = {};
    const perSection: Record<string, number> = {};
    const hits: { sectionId: string; blockId: string; count: number }[] = [];
    let total = 0;
    draft.sections.forEach((section) => {
      let secCount = section.title.toLowerCase().split(q).length - 1;
      section.blocks.forEach((block) => {
        const count = `${block.label} ${block.text} ${block.number ?? ''}`.toLowerCase().split(q).length - 1;
        if (count > 0) {
          perBlock[block.id] = count;
          hits.push({ sectionId: section.id, blockId: block.id, count });
          secCount += count;
          total += count;
        }
      });
      if (secCount > 0) perSection[section.id] = secCount;
    });
    return { term: q, hits, perBlock, perSection, total };
  }, [query, draft.sections]);

  const currentHit = findCursor >= 0 ? find.hits[findCursor] : undefined;

  // A new query resets the cursor; typing highlights live but does not scroll.
  useEffect(() => { setFindCursor(-1); }, [query]);

  function stepFind(direction: 1 | -1) {
    if (!find.hits.length) return;
    const next = findCursor < 0 ? (direction === 1 ? 0 : find.hits.length - 1) : (findCursor + direction + find.hits.length) % find.hits.length;
    setFindCursor(next);
    const hit = find.hits[next];
    if (hit.sectionId !== draft.activeSectionId) setActiveSection(record.id, hit.sectionId);
    setActiveBlockId(hit.blockId);
  }

  useEffect(() => {
    const requestedTab = searchParams.get('tab')?.toLowerCase();
    if (requestedTab === 'metadata') {
      setPanelTab('Metadata');
      const metadata = draft.sections.find((section) => section.tag === 'meta');
      if (metadata && metadata.id !== draft.activeSectionId) setActiveSection(record.id, metadata.id);
    } else if (requestedTab === 'references') {
      setPanelTab('References');
    }
  }, [draft.activeSectionId, draft.sections, record.id, searchParams, setActiveSection]);

  // Scroll the active block into view (after navigating from the structure tree
  // or inserting a block) and hold a gold accent on it so the drafter can see
  // exactly where they are within the section.
  useEffect(() => {
    if (!activeBlockId) return;
    const node = blockRefs.current[activeBlockId];
    if (!node) return;
    // Only scroll when the block isn't already comfortably in view, so simply
    // clicking a visible block to target it doesn't jump the canvas.
    const r = node.getBoundingClientRect();
    const inView = r.top >= 80 && r.bottom <= window.innerHeight - 40;
    if (!inView) node.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeBlockId, draft.activeSectionId]);

  function goToBlock(sectionId: string, blockId: string) {
    if (sectionId !== draft.activeSectionId) setActiveSection(record.id, sectionId);
    setActiveBlockId(blockId);
  }

  function announce(message: string) {
    setToast(message);
    window.setTimeout(() => setToast((current) => current === message ? '' : current), 2600);
  }

  function checkpoint() {
    undoStack.current.push(structuredClone(draft));
    if (undoStack.current.length > 30) undoStack.current.shift();
    redoStack.current = [];
  }

  function undo() {
    const previous = undoStack.current.pop();
    if (!previous) return;
    redoStack.current.push(structuredClone(draft));
    replaceDraft(previous);
    announce('Last drafting change undone.');
  }

  function redo() {
    const next = redoStack.current.pop();
    if (!next) return;
    undoStack.current.push(structuredClone(draft));
    replaceDraft(next);
    announce('Drafting change restored.');
  }

  function insertSection(tag: AkomaSectionTag) {
    if (draft.sections.some((section) => section.tag === tag)) {
      announce(`<${tag}> already exists in this document.`);
      return;
    }
    checkpoint();
    const section = makeDraftSection(tag);
    addSection(record.id, section);
    setActiveSection(record.id, section.id); // jump to it so the change is visible
    announce(`<${tag}> added to the document structure.`);
  }

  function insertBlock(type: AkomaBlockType, initialText?: string) {
    let target = activeSection as typeof activeSection | undefined;
    if (!target || target.tag === 'meta') target = bodySection;
    if (!target) {
      announce('Add a document body before inserting content.');
      return;
    }
    checkpoint();
    const ordinal = target.blocks.filter((block) => block.type === type).length + 1;
    const block = makeDraftBlock(type, ordinal);
    // Place the new block right after the currently selected block (so a
    // provision lands inside the section at the right spot); otherwise append.
    const afterId = activeBlockId && target.blocks.some((b) => b.id === activeBlockId) ? activeBlockId : undefined;
    addBlock(record.id, target.id, initialText ? { ...block, text: initialText } : block, afterId);
    // Make sure the section receiving the block is the one on screen, then
    // scroll to + accent the new block so the insert is visibly confirmed.
    if (target.id !== draft.activeSectionId) setActiveSection(record.id, target.id);
    setActiveBlockId(block.id);
    announce(`${akomaBlockOptions.find((item) => item.type === type)?.label ?? 'Content block'} inserted in <${target.tag}>.`);
  }

  function deleteBlock(block: StructuredDraftBlock) {
    if (!window.confirm(`Remove ${blockLabel(block)} from this draft?`)) return;
    checkpoint();
    removeBlock(record.id, block.id);
    announce(`${blockLabel(block)} removed.`);
  }

  function moveBlockBy(block: StructuredDraftBlock, direction: 'up' | 'down') {
    checkpoint();
    moveBlock(record.id, block.id, direction);
    setActiveBlockId(block.id); // keep the moved block accented + in view
    announce(`${blockLabel(block)} moved ${direction}.`);
  }

  function beginBlockEdit(blockId: string) {
    if (editCheckpoint.current === blockId) return;
    checkpoint();
    editCheckpoint.current = blockId;
  }

  function finishBlockEdit() {
    editCheckpoint.current = null;
  }

  function saveVersion() {
    if (validation.errors.length) {
      announce(`Resolve ${validation.errors.length} validation ${validation.errors.length === 1 ? 'error' : 'errors'} before saving a version.`);
      return;
    }
    saveRevision(record.id, currentRole ?? 'dls-drafter', 'Structured drafting checkpoint');
    recordAudit({
      recordId: record.id,
      actorId: currentRole ?? 'dls-drafter',
      actionType: 'Edit',
      description: `Saved a new structured drafting version for ${record.reference}.`,
    });
    announce('New structured version saved to the canonical record.');
  }

  function exportWorkingCopy() {
    const lines = [draft.title, `${draft.reference} · Version ${draft.currentVersion}`, ''];
    draft.sections.forEach((section) => {
      lines.push(`<${section.tag}> ${section.title}`);
      section.blocks.forEach((block) => {
        lines.push(`  [${block.type}${block.number ? ` ${block.number}` : ''}] ${block.text}`);
      });
      lines.push('');
    });
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${draft.reference.replace(/\//g, '-')}-working-copy.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    announce('Working copy downloaded from the browser-persisted draft.');
  }

  function addComment() {
    const text = window.prompt(`Add a comment to <${activeSection?.tag ?? 'body'}>:`)?.trim();
    if (!text) return;
    updateMeta(record.id, {
      comments: [...draft.comments, {
        id: `akn-comment-${Date.now()}`,
        authorId: currentRole ?? 'dls-drafter',
        text,
        sectionId: activeSection?.id ?? draft.activeSectionId,
        createdAt: new Date().toISOString(),
        resolved: false,
      }],
    });
    setPanelTab('Comments');
    announce(`Comment added to <${activeSection?.tag ?? 'body'}>.`);
  }

  function resolveComment(commentId: string) {
    updateMeta(record.id, { comments: draft.comments.map((comment) => comment.id === commentId ? { ...comment, resolved: true } : comment) });
    announce('Drafting comment resolved.');
  }

  const missingSections = akomaSectionOptions.filter((option) => !draft.sections.some((section) => section.tag === option.tag));
  const preview = mode === 'preview';
  const panelTabs = ['Comments', 'AI Assistant', 'Validation', 'Metadata', 'References'] as const;

  return (
    <EditorShell>
      <header className={styles.topbar}>
        <div className={styles.identity}>
          <Link to={`/legislative/${record.id}`} className={styles.back}><ArrowLeft width={16} height={16} /> Back to Bill Workspace</Link>
          <nav className={styles.crumb} aria-label="Breadcrumb">
            <span>Bills</span><ChevronRight width={12} height={12} /><span>{record.reference}</span><ChevronRight width={12} height={12} /><b>{preview ? 'Document Preview' : 'Structured Drafting'}</b>
          </nav>
          <div className={styles.titleRow}>
            <h1>{record.title}</h1>
            <span className={styles.version}>{record.reference} · Version {draft.currentVersion}</span>
          </div>
        </div>
        <div className={styles.saveState} role="status">
          {preview ? <Eye width={18} height={18} /> : <CircleCheck width={18} height={18} />}
          <span><b>{preview ? 'Clean document preview' : 'Saved in this browser'}</b><small>{preview ? 'Editing controls are hidden' : `Updated ${new Date(draft.updatedAt).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}`}</small></span>
        </div>
        <div className={styles.headerActions}>
          {preview ? (
            <Button variant="primary" to={`/legislative/${record.id}/draft`}>Return to Editing</Button>
          ) : (
            <>
              <Button variant="secondary" leftIcon={<ShieldCheck width={16} height={16} />} onClick={() => announce(validation.errors.length ? `${validation.errors.length} errors and ${validation.warnings.length} warnings found.` : `AKN structure valid with ${validation.warnings.length} warnings.`)}>Validate</Button>
              <Button variant="secondary" leftIcon={<Eye width={16} height={16} />} to={`/legislative/${record.id}/draft?mode=preview`}>Preview</Button>
              <Button variant="primary" leftIcon={<Save width={16} height={16} />} onClick={saveVersion}>Save Version</Button>
            </>
          )}
        </div>
      </header>

      {!preview && (
        <div className={styles.toolbar} role="toolbar" aria-label="Structured drafting tools">
          <button className={styles.iconTool} aria-label="Undo" title="Undo" disabled={!undoStack.current.length} onClick={undo}><Undo2 width={17} height={17} /></button>
          <button className={styles.iconTool} aria-label="Redo" title="Redo" disabled={!redoStack.current.length} onClick={redo}><Redo2 width={17} height={17} /></button>
          <span className={styles.divider} />
          <InsertMenu missingSections={missingSections} onBlock={insertBlock} onSection={insertSection} />
          <button className={`${styles.textTool} ${trackChanges ? styles.toolActive : ''}`} aria-pressed={trackChanges} onClick={() => { setTrackChanges((value) => !value); announce(trackChanges ? 'Tracked changes hidden.' : 'Tracked changes shown.'); }}><PenLine width={16} height={16} /> Track Changes</button>
          <button className={styles.textTool} onClick={() => setPanelTab('Comments')}><MessageSquare width={16} height={16} /> Comments</button>
          <button className={styles.textTool} disabled={!draft.revisions.length} title={draft.revisions.length ? 'Compare the working copy with a saved version' : 'Save a version before comparing'} onClick={() => setCompareOpen(true)}><GitCompare width={16} height={16} /> Compare</button>
          <button className={styles.textTool} onClick={() => { setPanelTab('Validation'); announce(validation.errors.length ? `${validation.errors.length} validation errors found.` : `AKN structure valid with ${validation.warnings.length} warnings.`); }}><ShieldCheck width={16} height={16} /> Validate</button>
          <Popover label="AI Assist" align="left" trigger={({ toggle, ref }) => (
            <button ref={ref} className={styles.textTool} onClick={() => { setPanelTab('AI Assistant'); toggle(); }}><Sparkles width={16} height={16} /> AI Assist <ChevronDown width={13} height={13} /></button>
          )}>
            {(close) => <div className={styles.actionMenu}>{['Suggest clearer wording', 'Check consistency', 'Identify ambiguity', 'Draft explanatory note'].map((action) => <button key={action} onClick={() => { setPanelTab('AI Assistant'); setAiDrafted(true); announce(`${action} prepared for human review.`); close(); }}>{action}</button>)}</div>}
          </Popover>
          <button className={styles.textTool} onClick={() => setCollapsed((value) => !value)}><ListTree width={16} height={16} /> {collapsed ? 'Show structure' : 'Hide structure'}</button>
          <form className={`${styles.search} ${query.trim() ? styles.searchActive : ''}`} onSubmit={(event) => { event.preventDefault(); stepFind(1); }}>
            <Search width={15} height={15} />
            <input name="draft-search" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Find in document" placeholder="Find in document" />
            {query.trim() && (
              <div className={styles.findControls}>
                <span className={styles.findCount} title={`${find.total} match${find.total === 1 ? '' : 'es'} in ${find.hits.length} block${find.hits.length === 1 ? '' : 's'}`}>
                  {find.hits.length ? `${findCursor >= 0 ? findCursor + 1 : 1}/${find.hits.length}` : '0/0'}
                </span>
                <button type="button" className={styles.findNav} aria-label="Previous match" disabled={!find.hits.length} onClick={() => stepFind(-1)}><ChevronUp width={15} height={15} /></button>
                <button type="button" className={styles.findNav} aria-label="Next match" disabled={!find.hits.length} onClick={() => stepFind(1)}><ChevronDown width={15} height={15} /></button>
                <button type="button" className={styles.findNav} aria-label="Clear search" onClick={() => { setQuery(''); setFindCursor(-1); }}><X width={14} height={14} /></button>
              </div>
            )}
          </form>
          <Popover label="More editor actions" align="right" trigger={({ toggle, ref }) => (
            <button ref={ref} className={styles.iconTool} aria-label="More editor actions" title="More editor actions" onClick={toggle}><MoreHorizontal width={17} height={17} /></button>
          )}>
            {(close) => <div className={styles.actionMenu}>
              <button onClick={() => { setPanelTab('Metadata'); close(); }}>Document metadata</button>
              <button onClick={() => { exportWorkingCopy(); close(); }}>Export working copy</button>
            </div>}
          </Popover>
        </div>
      )}

      <div className={`${styles.editor} ${preview ? styles.previewEditor : ''} ${collapsed ? styles.navCollapsed : ''}`}>
        {!collapsed && !preview && (
          <aside className={styles.structure} aria-label="Akoma Ntoso document structure">
            <div className={styles.sideHead}><span>Document structure</span><FileCode2 width={16} height={16} /></div>
            <ol className={styles.sectionList}>
              {draft.sections.map((section) => {
                const active = section.id === activeSection?.id;
                const status = sectionStatus(draft, section.id);
                return (
                  <li key={section.id}>
                    <button className={`${styles.sectionButton} ${active ? styles.sectionActive : ''}`} onClick={() => { setActiveSection(record.id, section.id); setActiveBlockId(null); }} aria-current={active ? 'true' : undefined}>
                      <span className={styles.tag}>&lt;{section.tag}&gt;</span>
                      <span className={styles.sectionName}>{section.title}</span>
                      {find.perSection[section.id] ? (
                        <span className={styles.matchBadge} title={`${find.perSection[section.id]} match${find.perSection[section.id] === 1 ? '' : 'es'}`}>{find.perSection[section.id]}</span>
                      ) : status === 'complete' ? <Check width={14} height={14} className={styles.complete} /> : <CircleDot width={14} height={14} className={styles.empty} />}
                    </button>
                    {section.blocks.length > 0 && (
                      <ol className={styles.blockTree} aria-label={`${section.title} contents`}>
                        {section.blocks.map((block) => (
                          <li key={block.id}>
                            <button className={activeBlockId === block.id ? styles.blockTreeActive : ''} onClick={() => goToBlock(section.id, block.id)}>
                              <FileCode2 width={12} height={12} /><span>{blockLabel(block)}</span>
                              {find.perBlock[block.id] ? <span className={styles.matchBadgeSm} title={`${find.perBlock[block.id]} match${find.perBlock[block.id] === 1 ? '' : 'es'}`}>{find.perBlock[block.id]}</span> : null}
                            </button>
                          </li>
                        ))}
                      </ol>
                    )}
                  </li>
                );
              })}
            </ol>
            {missingSections.length > 0 && (
              <Popover label="Add document section" align="left" trigger={({ toggle, ref }) => (
                <button ref={ref} className={styles.addSection} onClick={toggle}><Plus width={15} height={15} /> Add document section</button>
              )}>
                {(close) => <SectionMenu items={missingSections} onSelect={(tag) => { insertSection(tag); close(); }} />}
              </Popover>
            )}
            <div className={styles.attachmentSummary}>
              <b>{draft.attachments.length} source files</b>
              <span>Captured with the instruction and retained as document metadata.</span>
            </div>
          </aside>
        )}

        <main className={styles.canvas}>
          <article className={styles.page} aria-label={`${record.title} structured document`}>
            {preview ? (
              <DocumentPreview draft={draft} />
            ) : activeSection?.tag === 'meta' ? (
              <MetadataEditor draft={draft} onCheckpoint={checkpoint} onChange={(patch) => updateMeta(record.id, patch)} />
            ) : activeSection ? (
              <>
                <div className={styles.documentHead}>
                  <span className={styles.documentTag}>&lt;{activeSection.tag}&gt;</span>
                  <h2>{activeSection.title}</h2>
                  <p>{activeSection.required ? 'Required document structure' : 'Optional document structure'}</p>
                </div>
                <div className={styles.blocks}>
                  {activeSection.blocks.map((block, blockIndex) => {
                    const mark = trackMarks[block.id];
                    const matchCount = find.perBlock[block.id] ?? 0;
                    const isCurrentHit = currentHit?.blockId === block.id;
                    const findClass = isCurrentHit ? styles.blockFindCurrent : matchCount ? styles.blockFindMatch : '';
                    return (
                    <div key={block.id} ref={(el) => { blockRefs.current[block.id] = el; }} onFocusCapture={() => setActiveBlockId(block.id)} className={`${styles.block} ${mark ? styles.blockChanged : ''} ${activeBlockId === block.id ? styles.blockActive : ''} ${findClass}`} data-change={mark ?? undefined}>
                      <div className={styles.blockGutter}>
                        <button type="button" className={styles.moveBtn} disabled={blockIndex === 0} aria-label={`Move ${blockLabel(block)} up`} title="Move up" onClick={() => moveBlockBy(block, 'up')}><ChevronUp width={15} height={15} /></button>
                        <GripVertical width={15} height={15} className={styles.grip} aria-hidden />
                        <button type="button" className={styles.moveBtn} disabled={blockIndex === activeSection.blocks.length - 1} aria-label={`Move ${blockLabel(block)} down`} title="Move down" onClick={() => moveBlockBy(block, 'down')}><ChevronDown width={15} height={15} /></button>
                      </div>
                      <div className={styles.blockContent}>
                        <div className={styles.blockMeta}>
                          <span>&lt;{block.type}&gt;</span>
                          {mark && <span className={`${styles.changeChip} ${mark === 'added' ? styles.chipAdd : styles.chipMod}`}>{mark === 'added' ? 'New' : 'Edited'}</span>}
                          {matchCount > 0 && <span className={`${styles.changeChip} ${styles.chipFind}`}>{matchCount} match{matchCount === 1 ? '' : 'es'}</span>}
                          {(block.type === 'clause' || block.type === 'subclause') && (
                            <label>Number <input name={`${block.id}-number`} value={block.number ?? ''} onFocus={() => beginBlockEdit(block.id)} onBlur={finishBlockEdit} onChange={(event) => updateBlock(record.id, block.id, { number: event.target.value })} /></label>
                          )}
                        </div>
                        {block.type === 'heading' || block.type === 'part' || block.type === 'schedule' ? (
                          <input name={`${block.id}-text`} className={styles.headingInput} value={block.text} onFocus={() => beginBlockEdit(block.id)} onBlur={finishBlockEdit} onChange={(event) => updateBlock(record.id, block.id, { text: event.target.value })} aria-label={`${block.label} text`} />
                        ) : (
                          <textarea name={`${block.id}-text`} className={styles.blockInput} value={block.text} onFocus={() => beginBlockEdit(block.id)} onBlur={finishBlockEdit} onChange={(event) => updateBlock(record.id, block.id, { text: event.target.value })} aria-label={`${block.label} text`} rows={block.type === 'table' ? 4 : 3} />
                        )}
                      </div>
                      <button className={styles.deleteBlock} onClick={() => deleteBlock(block)} aria-label={`Remove ${blockLabel(block)}`} title={`Remove ${blockLabel(block)}`}><Trash2 width={16} height={16} /></button>
                    </div>
                    );
                  })}
                  {!activeSection.blocks.length && (
                    <div className={styles.emptyState}>
                      <FilePlus2 width={28} height={28} />
                      <h3>No content in &lt;{activeSection.tag}&gt;</h3>
                      <p>Insert the first structured block. The AKN tag is retained when the draft is saved.</p>
                      <button onClick={() => insertBlock(activeSection.tag === 'preamble' ? 'formula' : 'paragraph')}><Plus width={15} height={15} /> Insert first block</button>
                    </div>
                  )}
                </div>
                <Popover label="Add content block" align="left" trigger={({ toggle, ref }) => (
                  <button ref={ref} className={styles.addBlock} onClick={toggle}><Plus width={16} height={16} /> Add content block</button>
                )}>
                  {(close) => <BlockMenu onSelect={(type) => { insertBlock(type); close(); }} />}
                </Popover>
              </>
            ) : null}
          </article>
        </main>

        {!preview && (
          <aside className={styles.inspector} aria-label="Document validation and Akoma Ntoso guidance">
            <div className={styles.panelTabs} role="tablist" aria-label="Drafting context">
              {panelTabs.map((tab) => <button key={tab} role="tab" aria-selected={panelTab === tab} className={panelTab === tab ? styles.panelTabActive : ''} onClick={() => setPanelTab(tab)}>{tab}</button>)}
            </div>
            {panelTab === 'Comments' && <ContextComments comments={draft.comments} onAdd={addComment} onResolve={resolveComment} />}
            {panelTab === 'AI Assistant' && <ContextAi drafted={aiDrafted} onDraft={() => setAiDrafted(true)} onInsert={() => {
              insertBlock('paragraph', 'The responsible authority shall publish implementation standards in the prescribed form.');
              setAiDrafted(false);
              announce('AI-assisted paragraph inserted for human editing.');
            }} />}
            {panelTab === 'Validation' && <ContextValidation validation={validation} />}
            {panelTab === 'Metadata' && <ContextMetadata draft={draft} />}
            {panelTab === 'References' && <ContextReferences count={draft.attachments.length} />}
          </aside>
        )}
      </div>

      <footer className={styles.statusbar}>
        <span>{draft.sections.length} AKN sections · {draft.sections.reduce((sum, section) => sum + section.blocks.length, 0)} content blocks</span>
        <span>{validation.errors.length} errors · {validation.warnings.length} warnings</span>
        <span>Browser-persisted · Version {draft.currentVersion}</span>
      </footer>
      {toast && <div className={styles.toast} role="status" aria-live="polite">{toast}</div>}
      <AknCompareSheet open={compareOpen} onClose={() => setCompareOpen(false)} draft={draft} onToast={announce} />
    </EditorShell>
  );
}

function InsertMenu({ missingSections, onBlock, onSection }: {
  missingSections: typeof akomaSectionOptions;
  onBlock: (type: AkomaBlockType) => void;
  onSection: (tag: AkomaSectionTag) => void;
}) {
  return (
    <Popover label="Insert AKN content" align="left" trigger={({ toggle, ref }) => (
      <button ref={ref} className={styles.insertButton} onClick={toggle}><Plus width={16} height={16} /> Insert <ChevronDown width={14} height={14} /></button>
    )}>
      {(close) => (
        <div className={styles.insertMenu}>
          <span className={styles.menuLabel}>Content blocks</span>
          {akomaBlockOptions.map((item) => <button key={item.type} onClick={() => { onBlock(item.type); close(); }}><b>{item.label}</b><small>{item.description}</small></button>)}
          {missingSections.length > 0 && <span className={styles.menuLabel}>Document sections</span>}
          {missingSections.map((item) => <button key={item.tag} onClick={() => { onSection(item.tag); close(); }}><b>&lt;{item.tag}&gt;</b><small>{item.description}</small></button>)}
        </div>
      )}
    </Popover>
  );
}

function BlockMenu({ onSelect }: { onSelect: (type: AkomaBlockType) => void }) {
  return <div className={styles.insertMenu}>{akomaBlockOptions.map((item) => <button key={item.type} onClick={() => onSelect(item.type)}><b>{item.label}</b><small>{item.description}</small></button>)}</div>;
}

function SectionMenu({ items, onSelect }: { items: typeof akomaSectionOptions; onSelect: (tag: AkomaSectionTag) => void }) {
  return <div className={styles.sectionMenu}>{items.map((item) => <button key={item.tag} onClick={() => onSelect(item.tag)}><b>&lt;{item.tag}&gt;</b><small>{item.description}</small></button>)}</div>;
}

function MetadataEditor({ draft, onCheckpoint, onChange }: {
  draft: StructuredBillDraft;
  onCheckpoint: () => void;
  onChange: (patch: Partial<StructuredBillDraft>) => void;
}) {
  return (
    <>
      <div className={styles.documentHead}>
        <span className={styles.documentTag}>&lt;meta&gt;</span>
        <h2>Document metadata</h2>
        <p>Primary metadata is required for every Akoma Ntoso document.</p>
      </div>
      <div className={styles.metaForm}>
        <label className={styles.wide}>Document title<input name="document-title" value={draft.title} onFocus={onCheckpoint} onChange={(event) => onChange({ title: event.target.value })} /></label>
        <label>Canonical reference<input name="canonical-reference" value={draft.reference} onFocus={onCheckpoint} onChange={(event) => onChange({ reference: event.target.value })} /></label>
        <label>Language<select name="document-language" value={draft.language} onFocus={onCheckpoint} onChange={(event) => onChange({ language: event.target.value })}><option>English</option><option>Kiswahili</option><option>Bilingual</option></select></label>
        <label className={styles.wide}>Sponsor<input name="document-sponsor" value={draft.sponsor} onFocus={onCheckpoint} onChange={(event) => onChange({ sponsor: event.target.value })} /></label>
        <label className={styles.wide}>Authoring body<input name="authoring-body" value={draft.authoringBody} onFocus={onCheckpoint} onChange={(event) => onChange({ authoringBody: event.target.value })} /></label>
      </div>
      <div className={styles.metaNote}><FileCode2 width={17} height={17} /><span><b>Canonical metadata</b>These values are retained with the structured draft and used when rendering PDF, HTML and AKN XML manifestations.</span></div>
    </>
  );
}

function ContextComments({ comments, onAdd, onResolve }: {
  comments: StructuredBillDraft['comments'];
  onAdd: () => void;
  onResolve: (commentId: string) => void;
}) {
  const openComments = comments.filter((comment) => !comment.resolved);
  return (
    <div className={styles.contextBody}>
      <div className={styles.contextHeading}><div><h2>Comments</h2><p>{openComments.length} open · {comments.length - openComments.length} resolved</p></div><button className={styles.contextAddIcon} onClick={onAdd} aria-label="Add comment" title="Add comment"><Plus width={17} height={17} /></button></div>
      {!openComments.length ? <div className={styles.contextEmpty}>
        <MessageSquare width={24} height={24} /><h3>No open review comments</h3><p>Comments added to a provision will appear here with its AKN reference.</p><button onClick={onAdd}><Plus width={14} height={14} /> Add comment</button>
      </div> : <ul className={styles.commentList}>{openComments.map((comment) => <li key={comment.id}><span className={styles.contextEyebrow}>Drafting · selected AKN section</span><p>{comment.text}</p><button onClick={() => onResolve(comment.id)}><Check width={13} height={13} /> Resolve</button></li>)}</ul>}
      <section className={styles.contextCard}><h3>Required before submission</h3><p><CircleCheck width={14} height={14} /> Resolve blocking comments <b>{openComments.length ? `${openComments.length} open` : 'Complete'}</b></p><p><Info width={14} height={14} /> Add revision note <b>Not added</b></p></section>
    </div>
  );
}

function ContextAi({ drafted, onDraft, onInsert }: { drafted: boolean; onDraft: () => void; onInsert: () => void }) {
  return (
    <div className={styles.contextBody}>
      <div className={styles.contextHeading}><div><h2>AI Assistant</h2><p>Human confirmation required</p></div><WandSparkles width={17} height={17} /></div>
      <section className={styles.contextCard}>
        <span className={styles.contextEyebrow}>Selected structure</span>
        <h3>&lt;body&gt; drafting support</h3>
        <p>{drafted ? 'Suggested provision: “The responsible authority shall publish implementation standards in the prescribed form.”' : 'Generate a drafting suggestion grounded in the current AKN section.'}</p>
        <div className={styles.contextActions}>{drafted ? <><button className={styles.contextPrimary} onClick={onInsert}>Insert suggestion</button><button onClick={onDraft}>Regenerate</button></> : <button className={styles.contextPrimary} onClick={onDraft}>Suggest wording</button>}</div>
      </section>
      <p className={styles.contextNotice}>Illustrative assistance. Legislative text remains subject to drafter review and National Assembly procedures.</p>
    </div>
  );
}

function ContextValidation({ validation }: { validation: { errors: string[]; warnings: string[] } }) {
  return (
    <div className={styles.contextBody}>
      <div className={styles.contextHeading}><div><h2>Validation</h2><p>{validation.errors.length} errors · {validation.warnings.length} warnings</p></div><ShieldCheck width={17} height={17} /></div>
      <section className={styles.contextCard}>
        <h3>Akoma Ntoso structure</h3>
        {!validation.errors.length && <p className={styles.valid}><CircleCheck width={15} height={15} /> Required AKN structure is present.</p>}
        <ul className={styles.validationList}>{validation.errors.map((item) => <li key={item} className={styles.error}>{item}</li>)}{validation.warnings.map((item) => <li key={item} className={styles.warning}>{item}</li>)}</ul>
      </section>
      <section className={styles.contextCard}><h3>Submission readiness</h3><p><CircleCheck width={14} height={14} /> Metadata present <b>Passed</b></p><p><CircleCheck width={14} height={14} /> Body model present <b>Passed</b></p></section>
    </div>
  );
}

function ContextMetadata({ draft }: { draft: StructuredBillDraft }) {
  return (
    <div className={styles.contextBody}>
      <div className={styles.contextHeading}><div><h2>Metadata</h2><p>Canonical record values</p></div><FileCode2 width={17} height={17} /></div>
      <dl className={styles.contextMeta}>
        <div><dt>Document type</dt><dd>&lt;{draft.documentType.toLowerCase().replaceAll(' ', '')}&gt;</dd></div>
        <div><dt>Body model</dt><dd>&lt;{draft.bodyType}&gt;</dd></div>
        <div><dt>Language</dt><dd>{draft.language}</dd></div>
        <div><dt>Reference</dt><dd>{draft.reference}</dd></div>
        <div><dt>Sections</dt><dd>{draft.sections.length}</dd></div>
        <div><dt>Saved versions</dt><dd>{draft.revisions.length}</dd></div>
      </dl>
      <section className={styles.contextCard}><h3>Selected node</h3><p className={styles.nodeTag}>&lt;{draft.sections.find((section) => section.id === draft.activeSectionId)?.tag ?? 'meta'}&gt;</p><p>{sectionGuidance(draft.sections.find((section) => section.id === draft.activeSectionId)?.tag)}</p></section>
    </div>
  );
}

function ContextReferences({ count }: { count: number }) {
  const navigate = useNavigate();
  const references = ['Public Service Delivery Act, 2019', 'Data Protection Act, 2019', 'Related instruction source files'];
  return (
    <div className={styles.contextBody}>
      <div className={styles.contextHeading}><div><h2>References</h2><p>{count} source files retained</p></div><Landmark width={17} height={17} /></div>
      <ul className={styles.referenceList}>{references.map((reference) => <li key={reference}><button onClick={() => navigate(`/search?q=${encodeURIComponent(reference)}`)}><Landmark width={15} height={15} /><span><b>{reference}</b><small>Search linked legislative information</small></span></button></li>)}</ul>
    </div>
  );
}

// Clean, reader-facing rendering. Per Akoma Ntoso, content/structure is
// separated from presentation, so the machine element names (<meta>, <preface>,
// <preamble>, <body>) are NOT shown here — only the published legislative form:
// title, long title, enacting formula, then Parts/Clauses with legislative
// numbering. <meta> and internal annotations are omitted from the document.
function previewBlock(block: StructuredDraftBlock) {
  switch (block.type) {
    case 'annotation':
      return null; // internal drafting note — not part of the published Bill
    case 'part':
      return <h2 className={styles.pvPart}>{block.text}</h2>;
    case 'heading':
      return <h3 className={styles.pvHeading}>{block.text}</h3>;
    case 'schedule':
      return <h3 className={styles.pvSchedule}>{block.text}</h3>;
    case 'formula':
    case 'recital':
    case 'longTitle':
      return <p className={styles.pvLead}>{block.text}</p>;
    case 'clause':
      return <p className={styles.pvClause}><b className={styles.pvNum}>{block.number ?? ''}.</b> {block.text}</p>;
    case 'subclause':
      return <p className={styles.pvSub}><b className={styles.pvNum}>({block.number ?? ''})</b> {block.text}</p>;
    case 'table':
      return <pre className={styles.pvTable}>{block.text}</pre>;
    default:
      return <p className={styles.pvPara}>{block.text}</p>;
  }
}

function DocumentPreview({ draft }: { draft: StructuredBillDraft }) {
  const sections = draft.sections.filter((section) => section.tag !== 'meta');
  return (
    <div className={styles.previewDocument}>
      <p className={styles.previewRef}>{draft.reference}</p>
      <h1>{draft.title}</h1>
      {draft.sponsor && <p className={styles.previewSponsor}>Sponsored by {draft.sponsor}</p>}
      {sections.map((section) => (
        <section key={section.id} className={styles.pvSection}>
          {section.blocks.map((block) => <div key={block.id}>{previewBlock(block)}</div>)}
        </section>
      ))}
    </div>
  );
}
