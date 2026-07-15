import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check, Archive, Search as SearchIcon, Download, Link2, ScanLine,
  Settings2, FileUp, PenLine, ShieldCheck, BadgeCheck, FolderArchive, ListChecks,
} from 'lucide-react';
import { SideSheet, Button, StatusBadge } from '@/components/ui';
import { useDemoStore } from '@/store/demoStore';
import type { OcrJob, LegislativeRecord } from '@/data/types';
import { recordAudit } from '@/mocks/mockApi';
import { PRIMARY_HIST_ID } from '@/data/ocrData';
import { officerName, fmtDateTime } from './ocrShared';
import styles from './ocrSheets.module.css';

// Build the verified historical record that enters the Repository + Search.
function verifiedRecord(job: OcrJob): LegislativeRecord {
  return {
    id: PRIMARY_HIST_ID, reference: job.reference, title: job.title,
    shortTitle: 'Order Paper — 12 June 1984 (verified scan)', workflowType: 'Order Paper', stage: 'Archived',
    priority: 'Low', confidentiality: job.restricted ? 'Restricted' : 'Internal until publication', directorate: 'Directorate of Legislative and Procedural Services',
    originatingOffice: 'Parliamentary Archives', drafterId: 'records-officer', reviewerId: 'quality-reviewer',
    currentVersion: '1.0', currentVersionLabel: 'Verified Record', dueDate: '1984-06-12', createdDate: '1984-06-12',
    lastUpdated: new Date().toISOString(), year: 1984, restricted: !!job.restricted, publicParticipation: 'Not applicable', submissionCount: 0,
    summary: 'Verified historical Order Paper for the sitting of Tuesday, 12 June 1984; digitised, OCR-verified and archived from the Parliamentary Archives.',
    citation: job.reference, recordSource: 'Historical scan', ocrStatus: 'Verified', sourceArchive: job.sourceArchive,
    formats: ['PDF', 'HTML', 'AKN XML', 'Accessible HTML', 'Scan', 'OCR Text'],
  };
}

// --------------------------------------------------------------------------
// H — Archive and Make Searchable
// --------------------------------------------------------------------------
export function ArchiveSheet({ open, onClose, job, showToast }: { open: boolean; onClose: () => void; job: OcrJob; showToast: (m: string) => void }) {
  const navigate = useNavigate();
  const addRecord = useDemoStore((s) => s.addRecord);
  const updateOcrJob = useDemoStore((s) => s.updateOcrJob);
  const isPublic = !job.restricted && job.classification === 'Public';

  const checks = [
    'Quality review approved', 'Access classification confirmed', 'Retention category confirmed',
    'Original source preserved', 'Searchable formats generated', 'Indexing permissions confirmed',
  ];

  function archive(searchable: boolean) {
    addRecord(verifiedRecord(job));
    updateOcrJob(job.id, { status: 'Verified' });
    recordAudit({ recordId: job.reference, actorId: 'records-officer', actionType: 'Publication', description: searchable ? 'Archived and made searchable as a verified historical record' : 'Archived as a verified historical record', newValue: 'OCR Verified' });
    onClose();
    showToast(searchable ? 'Archived and indexed — the verified record is now searchable.' : 'Archived to the Historical Repository.');
    if (searchable) navigate('/repository/historical-records');
  }

  return (
    <SideSheet open={open} onClose={onClose} size="lg" title="Archive and Make Searchable" subtitle={job.title}
      footer={
        <div className={styles.footerRow}>
          <Button variant="ghost" onClick={() => archive(false)}>Archive Only</Button>
          <Button variant="primary" leftIcon={<Archive width={15} height={15} />} onClick={() => archive(true)} disabled={!isPublic && false}>Archive and Make Searchable</Button>
        </div>
      }>
      <p className={styles.stepLabel}>Pre-archive checks</p>
      <ul className={styles.checkSummary}>
        {checks.map((c) => (
          <li key={c}><span className={`${styles.checkIcon} ${styles.checkOk}`}><Check width={13} height={13} /></span><span className={styles.checkLabel}>{c}</span></li>
        ))}
      </ul>
      <div className={styles.archiveNote}>
        <BadgeCheck width={16} height={16} />
        <span>The original scan is preserved unchanged. Verified searchable formats (PDF, accessible HTML, OCR text) will be generated and the record indexed for Legislative Search.</span>
      </div>
      {!isPublic && <p className={styles.archiveVis}>This record is <b>Internal</b> — it will be searchable to authorised users only.</p>}
    </SideSheet>
  );
}

// --------------------------------------------------------------------------
// I — Verification History
// --------------------------------------------------------------------------
export function VerificationHistorySheet({ open, onClose, job, showToast }: { open: boolean; onClose: () => void; job: OcrJob; showToast: (m: string) => void }) {
  const [tab, setTab] = useState<'timeline' | 'corrections'>('timeline');
  const corrections = job.corrections ?? [];

  const events = [
    { icon: <FileUp width={15} height={15} />, title: 'File uploaded', who: officerName('records-officer'), role: 'Senior Records Officer', at: '2026-07-15T10:42:00+03:00' },
    { icon: <ListChecks width={15} height={15} />, title: 'Pages detected — 12 pages', who: 'System', role: '', at: '2026-07-15T10:43:00+03:00' },
    { icon: <Settings2 width={15} height={15} />, title: 'OCR processing completed', who: 'System', role: '91% avg. confidence', at: '2026-07-15T11:07:00+03:00' },
    { icon: <PenLine width={15} height={15} />, title: `Text corrected — ${corrections.length} corrections`, who: officerName('records-officer'), role: 'Senior Records Officer', at: '2026-07-18T10:12:00+03:00' },
    { icon: <Check width={15} height={15} />, title: 'Metadata confirmed', who: officerName('records-officer'), role: 'Senior Records Officer', at: '2026-07-18T10:28:00+03:00' },
    { icon: <ShieldCheck width={15} height={15} />, title: 'Quality review approved', who: officerName('quality-reviewer'), role: 'Principal Records Reviewer', at: '2026-07-18T11:10:00+03:00' },
    { icon: <FolderArchive width={15} height={15} />, title: 'Archived — OCR Verified', who: officerName('records-officer'), role: 'Senior Records Officer', at: '2026-07-18T11:26:00+03:00' },
    { icon: <SearchIcon width={15} height={15} />, title: 'Search index updated', who: 'System', role: '', at: '2026-07-18T11:31:00+03:00' },
  ];

  return (
    <SideSheet open={open} onClose={onClose} size="wide" title="Verification History"
      subtitle="Immutable timeline of verification events"
      footer={
        <div className={styles.footerRow}>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button variant="secondary" leftIcon={<Download width={15} height={15} />} onClick={() => showToast('Preparing verification history export (PDF)…')}>Download History (PDF)</Button>
        </div>
      }>
      <div className={styles.vhTabs}>
        <button className={tab === 'timeline' ? styles.vhTabActive : styles.vhTab} onClick={() => setTab('timeline')}>Timeline</button>
        <button className={tab === 'corrections' ? styles.vhTabActive : styles.vhTab} onClick={() => setTab('corrections')}>Corrections ({corrections.length})</button>
      </div>

      {tab === 'timeline' ? (
        <ul className={styles.timeline}>
          {events.map((e, i) => (
            <li key={i} className={styles.tlEvent}>
              <span className={styles.tlIcon}>{e.icon}</span>
              <div className={styles.tlBody}>
                <div className={styles.tlTop}><span className={styles.tlTitle}>{e.title}</span><StatusBadge tone="green" size="sm">Completed</StatusBadge></div>
                <p className={styles.tlMeta}>{e.who}{e.role ? ` · ${e.role}` : ''}</p>
                <p className={styles.tlTime}>{fmtDateTime(e.at)}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className={styles.corrList}>
          {corrections.length === 0 ? <p className={styles.stepHint}>No corrections recorded.</p> : corrections.map((c) => (
            <li key={c.id} className={styles.corrItem}>
              <p className={styles.corrChange}><span className={styles.baBefore}>{c.original}</span> → <span className={styles.baAfter}>{c.corrected}</span></p>
              <p className={styles.corrMeta}>Page {c.page} · {officerName(c.officerId)} · {fmtDateTime(c.at)} · was {c.confidenceBefore}%</p>
            </li>
          ))}
        </ul>
      )}
      <p className={styles.immutable}><ShieldCheck width={13} height={13} /> This audit trail is immutable and tamper-evident.</p>
    </SideSheet>
  );
}

// --------------------------------------------------------------------------
// D — Metadata & Classification (compact)
// --------------------------------------------------------------------------
export function MetadataSheet({ open, onClose, job, showToast }: { open: boolean; onClose: () => void; job: OcrJob; showToast: (m: string) => void }) {
  return (
    <SideSheet open={open} onClose={onClose} size="lg" title="Metadata & Classification" subtitle={job.title}
      footer={<div className={styles.footerRow}><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={() => { onClose(); showToast('Metadata confirmed.'); }}>Confirm Metadata</Button></div>}>
      <p className={styles.stepHint}>Machine suggestions are marked <StatusBadge tone="gold" size="sm">Suggested</StatusBadge>; confirmed values are set by a records officer.</p>
      <ul className={styles.metaSheet}>
        {(job.metadata ?? []).map((m) => (
          <li key={m.field}><span className={styles.msField}>{m.field}</span><span className={styles.msValue}>{m.value}</span><StatusBadge tone={m.state === 'Confirmed' ? 'green' : m.state === 'Needs Review' ? 'red' : 'gold'} size="sm">{m.state}</StatusBadge></li>
        ))}
        <li><span className={styles.msField}>Classification</span><span className={styles.msValue}>{job.restricted ? 'Restricted' : 'Internal'}</span><StatusBadge tone="green" size="sm">Confirmed</StatusBadge></li>
        <li><span className={styles.msField}>Retention class</span><span className={styles.msValue}>Permanent</span><StatusBadge tone="green" size="sm">Confirmed</StatusBadge></li>
      </ul>
    </SideSheet>
  );
}

// --------------------------------------------------------------------------
// E — Link Related Record (compact)
// --------------------------------------------------------------------------
export function LinkRelatedSheet({ open, onClose, showToast }: { open: boolean; onClose: () => void; showToast: (m: string) => void }) {
  const [q, setQ] = useState('');
  const [rel, setRel] = useState('Mentioned in');
  const suggestions = [
    { title: 'Votes and Proceedings — 12 June 1984', ref: 'HIST/VP/1984/0612' },
    { title: 'Public Service (Amendment) Bill, 1984', ref: 'BILL/1984/013' },
    { title: 'Public Service (Amendment) Act, 1985', ref: 'ACT/1985/005' },
  ];
  return (
    <SideSheet open={open} onClose={onClose} size="xl" title="Link Related Record" subtitle="Connect this record to related legislative material"
      footer={<div className={styles.footerRow}><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" leftIcon={<Link2 width={15} height={15} />} onClick={() => { onClose(); showToast('Related record linked.'); }}>Link Record</Button></div>}>
      <label className={styles.field}><span className={styles.fieldLabel}>Relationship type</span>
        <select value={rel} onChange={(e) => setRel(e.target.value)}>{['Mentioned in', 'Related sitting', 'Amends', 'Amended by', 'Supporting document', 'Same source collection', 'Historical predecessor'].map((r) => <option key={r}>{r}</option>)}</select>
      </label>
      <label className={styles.field}><span className={styles.fieldLabel}>Search records</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Bills, Acts, Motions, Votes and Proceedings…" />
      </label>
      <ul className={styles.linkList}>
        {suggestions.filter((s) => !q || s.title.toLowerCase().includes(q.toLowerCase())).map((s) => (
          <li key={s.ref}><button className={styles.linkItem} onClick={() => showToast(`Selected ${s.title}.`)}><span><span className={styles.linkTitle}>{s.title}</span><span className={styles.linkRef}>{s.ref}</span></span><span className={styles.linkAdd}>Select</span></button></li>
        ))}
      </ul>
    </SideSheet>
  );
}

// --------------------------------------------------------------------------
// F — Request Better Scan (compact)
// --------------------------------------------------------------------------
export function RequestScanSheet({ open, onClose, showToast }: { open: boolean; onClose: () => void; showToast: (m: string) => void }) {
  const [pages, setPages] = useState('9');
  const [issue, setIssue] = useState('Missing page');
  const [note, setNote] = useState('');
  return (
    <SideSheet open={open} onClose={onClose} size="lg" title="Request Better Scan" subtitle="Ask the archive team for a replacement scan"
      footer={<div className={styles.footerRow}><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" leftIcon={<ScanLine width={15} height={15} />} onClick={() => { onClose(); showToast('Rescan request sent to the archive team.'); }}>Submit Request</Button></div>}>
      <label className={styles.field}><span className={styles.fieldLabel}>Affected pages</span><input value={pages} onChange={(e) => setPages(e.target.value)} placeholder="e.g. 9, 10" /></label>
      <label className={styles.field}><span className={styles.fieldLabel}>Issue</span>
        <select value={issue} onChange={(e) => setIssue(e.target.value)}>{['Missing page', 'Blurred text', 'Folded page', 'Cropped margin', 'Page captured twice', 'Wrong document included'].map((i) => <option key={i}>{i}</option>)}</select>
      </label>
      <label className={styles.field}><span className={styles.fieldLabel}>Archive location</span><input defaultValue="Box OP-1984-06 · Folder 12" /></label>
      <label className={styles.field}><span className={styles.fieldLabel}>Notes</span><textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Details for the archive officer…" /></label>
    </SideSheet>
  );
}
