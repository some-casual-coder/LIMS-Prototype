import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Save, ExternalLink, MinusCircle, FolderPlus, Lock } from 'lucide-react';
import { SideSheet, Button, StatusBadge } from '@/components/ui';
import { useDemoStore } from '@/store/demoStore';
import type { GroundedAnswer, Passage, SearchMode, LegislativeRecord } from '@/data/types';
import { passageById, relatedRecords } from '@/data/searchData';
import { Highlight, recordIcon, dirLabel } from './shared';
import { passageVersionStatus } from './searchLogic';
import styles from './sheets.module.css';

const genId = (p: string) => `${p}-${Date.now().toString(36)}`;

// --------------------------------------------------------------------------
// A — Advanced Search
// --------------------------------------------------------------------------
export function AdvancedSearchSheet({ open, onClose, mode }: { open: boolean; onClose: () => void; mode: SearchMode }) {
  const navigate = useNavigate();
  const [all, setAll] = useState('');
  const [phrase, setPhrase] = useState('');
  const [any, setAny] = useState('');
  const [exclude, setExclude] = useState('');
  const [ref, setRef] = useState('');
  const [clause, setClause] = useState('');
  const [type, setType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [versionStatus, setVersionStatus] = useState('');
  const [signedOnly, setSignedOnly] = useState(false);
  const [historicalOnly, setHistoricalOnly] = useState(false);
  const [includeRestricted, setIncludeRestricted] = useState(false);

  function run() {
    const q = [phrase, all, any].filter(Boolean).join(' ').trim() || ref.trim() || 'legislative records';
    onClose();
    navigate(`/search?q=${encodeURIComponent(q)}${mode !== 'all' ? `&mode=${mode}` : ''}`);
  }
  function clear() {
    setAll(''); setPhrase(''); setAny(''); setExclude(''); setRef(''); setClause('');
    setType(''); setFrom(''); setTo(''); setVersionStatus(''); setSignedOnly(false); setHistoricalOnly(false); setIncludeRestricted(false);
  }

  return (
    <SideSheet open={open} onClose={onClose} size="xl" title="Advanced Search" subtitle="Combine terms, references and legislative filters"
      footer={
        <div className={styles.footerBetween}>
          <button className={styles.textBtn} onClick={clear}>Clear all</button>
          <div className={styles.footerBtns}>
            <Button variant="secondary" leftIcon={<Save width={15} height={15} />} onClick={() => { onClose(); navigate('/search?sheet=save'); }}>Save Search</Button>
            <Button variant="primary" leftIcon={<Search width={15} height={15} />} onClick={run}>Run Search</Button>
          </div>
        </div>
      }>
      <p className={styles.groupHead}>Search terms</p>
      <div className={styles.grid2}>
        <Field label="All of these words"><input value={all} onChange={(e) => setAll(e.target.value)} placeholder="Enter keywords" /></Field>
        <Field label="Exact phrase"><input value={phrase} onChange={(e) => setPhrase(e.target.value)} placeholder="e.g. reasonable accommodation" /></Field>
      </div>
      <Field label="Any of these words"><input value={any} onChange={(e) => setAny(e.target.value)} placeholder="Separated by commas" /></Field>
      <Field label="Exclude these words"><input value={exclude} onChange={(e) => setExclude(e.target.value)} placeholder="Keywords to exclude" /></Field>

      <p className={styles.groupHead}>Legislative filters</p>
      <div className={styles.grid2}>
        <Field label="Reference number"><input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. NA/BILL/2026/015" /></Field>
        <Field label="Clause / Regulation"><input value={clause} onChange={(e) => setClause(e.target.value)} placeholder="e.g. Clause 14" /></Field>
      </div>
      <div className={styles.grid2}>
        <Field label="Document type">
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All document types</option>
            {['Bill', 'Motion', 'Petition', 'Question', 'Statement', 'Order Paper', 'Statutory Instrument'].map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Version status">
          <select value={versionStatus} onChange={(e) => setVersionStatus(e.target.value)}>
            <option value="">Any version</option>
            {['Current working', 'Latest approved', 'Published', 'Previous version', 'Superseded'].map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
      </div>
      <div className={styles.grid2}>
        <Field label="Published from"><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
        <Field label="Published to"><input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
      </div>

      <p className={styles.groupHead}>Additional options</p>
      <label className={styles.check}><input type="checkbox" checked={signedOnly} onChange={(e) => setSignedOnly(e.target.checked)} /> <span>Signed records only</span></label>
      <label className={styles.check}><input type="checkbox" checked={historicalOnly} onChange={(e) => setHistoricalOnly(e.target.checked)} /> <span>Historical scans only <em>(verified OCR text)</em></span></label>
      <label className={styles.check}><input type="checkbox" checked={includeRestricted} onChange={(e) => setIncludeRestricted(e.target.checked)} /> <span>Include restricted records <em>(results respect your access permissions)</em></span></label>
    </SideSheet>
  );
}

// --------------------------------------------------------------------------
// C — Save Search
// --------------------------------------------------------------------------
export function SaveSearchSheet({ open, onClose, query, mode, filterSummary, resultCount, showToast }: {
  open: boolean; onClose: () => void; query: string; mode: SearchMode; filterSummary: string; resultCount: number; showToast: (m: string) => void;
}) {
  const addSavedSearch = useDemoStore((s) => s.addSavedSearch);
  const currentRole = useDemoStore((s) => s.currentRole);
  const [name, setName] = useState(query);
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'Only me' | 'Directorate' | 'Selected users'>('Only me');
  const [notify, setNotify] = useState(false);

  function save() {
    addSavedSearch({
      id: genId('ss'), name: name.trim() || query, query, mode, filterSummary,
      resultCount, lastRun: new Date().toISOString(), visibility, notify, ownerId: currentRole ?? 'dls-drafter',
    });
    onClose();
    showToast('Search saved. You can find it under Saved Searches.');
  }

  return (
    <SideSheet open={open} onClose={onClose} size="sm" title="Save Search" subtitle={query}
      footer={<div className={styles.footerBtns}><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={save}>Save Search</Button></div>}>
      <Field label="Search name"><input value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label="Description (optional)"><textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this search is for" /></Field>
      <Field label="Visibility">
        <div className={styles.radios}>
          {(['Only me', 'Directorate', 'Selected users'] as const).map((v) => (
            <label key={v} className={styles.radio}><input type="radio" name="vis" checked={visibility === v} onChange={() => setVisibility(v)} /> <span>{v}</span></label>
          ))}
        </div>
      </Field>
      <label className={styles.check}><input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} /> <span>Notify me when new records match <em>(simulated)</em></span></label>
      <p className={styles.hint}>Matches now: {resultCount} · Filters: {filterSummary || 'none'}</p>
    </SideSheet>
  );
}

// --------------------------------------------------------------------------
// D — Search Evidence
// --------------------------------------------------------------------------
export function EvidenceSheet({ open, onClose, answer, onOpenPassage, showToast }: {
  open: boolean; onClose: () => void; answer: GroundedAnswer | undefined; onOpenPassage: (recordId: string, passageId?: string) => void; showToast: (m: string) => void;
}) {
  const records = useDemoStore((s) => s.records);
  const versions = useDemoStore((s) => s.versions);
  const billContent = useDemoStore((s) => s.billContent);
  if (!answer) return null;

  return (
    <SideSheet open={open} onClose={onClose} size="wide" title="Search Evidence"
      subtitle={`Every record used in this summary · ${answer.sourceCount} sources`}>
      <p className={styles.evidenceIntro}>Each source below contributed to the grounded summary. You can open the passage or exclude it from the current summary.</p>
      <ul className={styles.evidenceList}>
        {answer.evidence.map((ev) => {
          const p = ev.passageId ? passageById[ev.passageId] : undefined;
          const rec = records.find((r) => r.id === ev.recordId);
          if (!rec) return null;
          const vs = p ? passageVersionStatus(p, rec, versions, billContent) : undefined;
          return (
            <li key={ev.label} className={styles.evidenceItem}>
              <p className={styles.evLabel}>{ev.label}</p>
              <p className={styles.evRec}>{rec.title} · {rec.reference}</p>
              {p && <p className={styles.evText}><Highlight text={p.excerpt} terms={p.highlights} /></p>}
              <div className={styles.evMeta}>
                {vs && <StatusBadge tone={vs.tone} size="sm">{vs.label}</StatusBadge>}
                {p && <StatusBadge tone="grey" size="sm">{p.matchType}</StatusBadge>}
              </div>
              <div className={styles.evActions}>
                <button onClick={() => onOpenPassage(ev.recordId, ev.passageId)}><ExternalLink width={14} height={14} /> Open passage</button>
                <button onClick={() => showToast('Source excluded from this summary.')}><MinusCircle width={14} height={14} /> Exclude</button>
              </div>
            </li>
          );
        })}
      </ul>
    </SideSheet>
  );
}

// --------------------------------------------------------------------------
// E — Compare Search Results
// --------------------------------------------------------------------------
export function CompareResultsSheet({ open, onClose, passageIds }: { open: boolean; onClose: () => void; passageIds: string[] }) {
  const records = useDemoStore((s) => s.records);
  const cols = passageIds.map((id) => passageById[id]).filter(Boolean).slice(0, 3);

  return (
    <SideSheet open={open} onClose={onClose} size="xxl" title="Compare Search Results" subtitle="Compare assisted-access language across records">
      <div className={styles.compareGrid} style={{ gridTemplateColumns: `repeat(${cols.length || 1}, 1fr)` }}>
        {cols.map((p) => {
          const rec = records.find((r) => r.id === p.recordId);
          return (
            <div key={p.id} className={styles.compareCol}>
              <p className={styles.cmpRec}>{rec?.title}</p>
              <p className={styles.cmpRef}>{rec?.citation ?? rec?.reference}</p>
              {p.clauseRef && <p className={styles.cmpClause}>{p.clauseRef}</p>}
              <div className={styles.cmpText}><Highlight text={p.excerpt} terms={p.highlights} /></div>
              <div className={styles.cmpFoot}><StatusBadge tone="grey" size="sm">{p.matchType}</StatusBadge></div>
            </div>
          );
        })}
      </div>
    </SideSheet>
  );
}

// --------------------------------------------------------------------------
// F — Related Records
// --------------------------------------------------------------------------
export function RelatedRecordsSheet({ open, onClose, recordId, onOpen }: { open: boolean; onClose: () => void; recordId: string; onOpen: (id: string) => void }) {
  const records = useDemoStore((s) => s.records);
  const ids = relatedRecords[recordId] ?? [];
  const groups: { label: string; items: LegislativeRecord[] }[] = [
    { label: 'Referenced legislation', items: ids.map((id) => records.find((r) => r.id === id)).filter((r): r is LegislativeRecord => !!r && (r.workflowType === 'Bill' || r.workflowType === 'Statutory Instrument')) },
    { label: 'Related motions & petitions', items: ids.map((id) => records.find((r) => r.id === id)).filter((r): r is LegislativeRecord => !!r && (r.workflowType === 'Motion' || r.workflowType === 'Petition')) },
    { label: 'Historical & supporting records', items: ids.map((id) => records.find((r) => r.id === id)).filter((r): r is LegislativeRecord => !!r && r.recordSource === 'Historical scan') },
  ].filter((g) => g.items.length);

  return (
    <SideSheet open={open} onClose={onClose} size="xl" title="Related Records" subtitle="Records connected to this legislative item">
      {groups.map((g) => (
        <div key={g.label} className={styles.relGroup}>
          <p className={styles.groupHead}>{g.label}</p>
          <ul className={styles.relList}>
            {g.items.map((r) => (
              <li key={r.id}>
                <button className={styles.relItem} onClick={() => onOpen(r.id)}>
                  <span className={styles.relIcon} aria-hidden>{recordIcon(r)}</span>
                  <span>
                    <span className={styles.relTitle}>{r.title}</span>
                    <span className={styles.relRef}>{r.citation ?? r.reference} · {dirLabel(r.directorate)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </SideSheet>
  );
}

// --------------------------------------------------------------------------
// G — Request Access
// --------------------------------------------------------------------------
export function RequestAccessSheet({ open, onClose, recordId, showToast }: { open: boolean; onClose: () => void; recordId: string; showToast: (m: string) => void }) {
  const records = useDemoStore((s) => s.records);
  const requestAccess = useDemoStore((s) => s.requestAccess);
  const currentRole = useDemoStore((s) => s.currentRole);
  const requests = useDemoStore((s) => s.accessRequests);
  const rec = records.find((r) => r.id === recordId);
  const [level, setLevel] = useState('Read access');
  const [purpose, setPurpose] = useState('');
  const [duration, setDuration] = useState('30 days');
  const pending = requests.some((r) => r.recordId === recordId && r.status === 'Pending');

  function submit() {
    requestAccess({
      id: genId('acc'), recordId, requesterId: currentRole ?? 'dls-drafter', accessLevel: level,
      purpose: purpose.trim(), duration, approver: 'Owning directorate — DLS', status: 'Pending', requestedAt: new Date().toISOString(),
    });
    onClose();
    showToast('Access request submitted. You will be notified when it is reviewed.');
  }

  return (
    <SideSheet open={open} onClose={onClose} size="lg" title="Request Access" subtitle={rec?.title}
      footer={pending ? undefined : <div className={styles.footerBtns}><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" leftIcon={<Lock width={15} height={15} />} onClick={submit}>Submit Access Request</Button></div>}>
      {pending ? (
        <div className={styles.pending}>
          <p className={styles.pendingTitle}>Access request pending</p>
          <p className={styles.pendingText}>Your request for this record is awaiting review by the owning directorate. You will not be shown restricted content while the request is pending.</p>
        </div>
      ) : (
        <>
          <p className={styles.hint}>This record is restricted to {dirLabel(rec?.directorate ?? '')}. Requests are reviewed by the owning directorate.</p>
          <Field label="Requested access level">
            <select value={level} onChange={(e) => setLevel(e.target.value)}>
              {['Read access', 'Read & comment', 'Full access'].map((l) => <option key={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="Purpose"><textarea rows={3} value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Why you need access to this record" /></Field>
          <Field label="Duration">
            <select value={duration} onChange={(e) => setDuration(e.target.value)}>
              {['7 days', '30 days', '90 days', 'Until end of session'].map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Approving authority"><input value="Owning directorate — DLS" readOnly /></Field>
        </>
      )}
    </SideSheet>
  );
}

// --------------------------------------------------------------------------
// H — Add to Research Collection
// --------------------------------------------------------------------------
export function AddToCollectionSheet({ open, onClose, recordId, passage, showToast }: {
  open: boolean; onClose: () => void; recordId: string; passage?: Passage; showToast: (m: string) => void;
}) {
  const collections = useDemoStore((s) => s.researchCollections);
  const records = useDemoStore((s) => s.records);
  const versions = useDemoStore((s) => s.versions);
  const billContent = useDemoStore((s) => s.billContent);
  const currentRole = useDemoStore((s) => s.currentRole);
  const addTo = useDemoStore((s) => s.addToResearchCollection);
  const create = useDemoStore((s) => s.createResearchCollection);
  const rec = records.find((r) => r.id === recordId);
  const [target, setTarget] = useState(collections[0]?.id ?? '__new');
  const [newName, setNewName] = useState('');
  const [note, setNote] = useState('');
  const [includeExcerpt, setIncludeExcerpt] = useState(true);
  const [includeVersion, setIncludeVersion] = useState(true);

  function add() {
    if (!rec) return;
    const vs = passage ? passageVersionStatus(passage, rec, versions, billContent) : undefined;
    const item = {
      passageId: passage?.id, recordId, clauseNumber: passage?.clauseNumber, clauseRef: passage?.clauseRef,
      excerpt: includeExcerpt ? passage?.excerpt : undefined,
      versionLabel: includeVersion && vs ? `${vs.label} ${vs.version}` : undefined,
      note: note.trim() || undefined, addedAt: new Date().toISOString(),
    };
    if (target === '__new') {
      const id = genId('rc');
      create({ id, name: newName.trim() || 'New research collection', ownerId: currentRole ?? 'dls-drafter', items: [item], createdAt: new Date().toISOString() });
    } else {
      addTo(target, item);
    }
    onClose();
    showToast('Added to your research collection.');
  }

  return (
    <SideSheet open={open} onClose={onClose} size="sm" title="Add to Research Collection" subtitle={passage?.clauseRef ?? rec?.title}
      footer={<div className={styles.footerBtns}><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" leftIcon={<FolderPlus width={15} height={15} />} onClick={add}>Add</Button></div>}>
      <Field label="Collection">
        <select value={target} onChange={(e) => setTarget(e.target.value)}>
          {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          <option value="__new">+ New collection…</option>
        </select>
      </Field>
      {target === '__new' && <Field label="New collection name"><input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Digital Inclusion Research" /></Field>}
      <Field label="Note (optional)"><textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why this passage matters" /></Field>
      <label className={styles.check}><input type="checkbox" checked={includeExcerpt} onChange={(e) => setIncludeExcerpt(e.target.checked)} /> <span>Include clause excerpt</span></label>
      <label className={styles.check}><input type="checkbox" checked={includeVersion} onChange={(e) => setIncludeVersion(e.target.checked)} /> <span>Include version metadata</span></label>
    </SideSheet>
  );
}

// --------------------------------------------------------------------------
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}
