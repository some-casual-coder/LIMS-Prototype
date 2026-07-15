import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check, Eye, EyeOff, Flag, ArrowRight, ShieldCheck, AlertTriangle, Info,
} from 'lucide-react';
import { SideSheet, Button, StatusBadge } from '@/components/ui';
import { useDemoStore } from '@/store/demoStore';
import type { OcrJob, OcrIssue } from '@/data/types';
import { recordAudit } from '@/mocks/mockApi';
import { officerName } from './ocrShared';
import styles from './ocrSheets.module.css';

// --------------------------------------------------------------------------
// Low-Confidence Issue (Side Sheet C)
// --------------------------------------------------------------------------
type Decision = 'correct' | 'accept' | 'unreadable' | 'flag';

export function LowConfidenceIssueSheet({ open, onClose, job, issue, onNext, showToast }: {
  open: boolean; onClose: () => void; job: OcrJob; issue?: OcrIssue; onNext?: () => void; showToast: (m: string) => void;
}) {
  const correctOcrLine = useDemoStore((s) => s.correctOcrLine);
  const setOcrIssueStatus = useDemoStore((s) => s.setOcrIssueStatus);
  const [decision, setDecision] = useState<Decision>('correct');
  const [note, setNote] = useState('');
  const [edited, setEdited] = useState('');

  // Re-seed the editable fields whenever a different issue is opened.
  useEffect(() => {
    if (issue) { setEdited(issue.suggestion ?? issue.originalOcr ?? ''); setDecision('correct'); setNote(''); }
  }, [issue?.id]);

  if (!issue) return null;

  function apply() {
    if (!issue) return;
    if (decision === 'correct' && issue.lineId) {
      correctOcrLine(job.id, issue.page, issue.lineId, edited);
      setOcrIssueStatus(job.id, issue.id, 'resolved');
      recordAudit({ recordId: job.reference, actorId: 'records-officer', actionType: 'Edit', description: `Corrected low-confidence text on page ${issue.page}`, previousValue: issue.originalOcr, newValue: edited });
    } else if (decision === 'accept') {
      setOcrIssueStatus(job.id, issue.id, 'accepted');
    } else if (decision === 'unreadable') {
      setOcrIssueStatus(job.id, issue.id, 'unreadable');
    } else {
      setOcrIssueStatus(job.id, issue.id, 'flagged');
    }
    showToast(decision === 'correct' ? 'Correction saved to the verification history.' : decision === 'flag' ? 'Flagged for second review.' : decision === 'unreadable' ? 'Marked unreadable.' : 'OCR text accepted.');
    if (onNext) onNext(); else onClose();
  }

  const before = issue.originalOcr ?? '';
  const highlight = (text: string) => {
    const w = 'Aftrenoon';
    if (!text.includes(w)) return text;
    const [a, b] = text.split(w);
    return <>{a}<mark className={styles.mark}>{w}</mark>{b}</>;
  };

  return (
    <SideSheet open={open} onClose={onClose} size="wide" title="Low-Confidence Issue"
      subtitle={<span>Issue ID {issue.id} · Page {issue.page} of {job.pageCount}</span>}
      headerMeta={<StatusBadge tone="gold" size="sm">Needs review</StatusBadge>}
      footer={
        <div className={styles.footerRow}>
          <Button variant="ghost" onClick={onClose}>Save Decision</Button>
          <Button variant="primary" rightIcon={<ArrowRight width={15} height={15} />} onClick={apply}>Next Issue</Button>
        </div>
      }>
      <p className={styles.stepLabel}>1 · Source region <span className={styles.stepHint}>(from document)</span></p>
      <div className={styles.sourceCrop}>{highlight(before)}</div>

      <div className={styles.confRow}>
        <p className={styles.stepLabel}>2 · Original OCR text</p>
        <span className={styles.confBig}>{issue.confidence}% <span className={styles.confLow}><AlertTriangle width={12} height={12} /> Low confidence</span></span>
      </div>
      <div className={styles.ocrBox}>{highlight(before)}</div>

      {issue.suggestion && (
        <>
          <p className={styles.stepLabel}>3 · Suggested correction <span className={styles.suggestedTag}>Suggested by system</span></p>
          <textarea className={styles.suggestBox} value={edited} onChange={(e) => setEdited(e.target.value)} rows={3} />
          <p className={styles.beforeAfter}><span className={styles.baBefore}>Before: Aftrenoon</span> <ArrowRight width={13} height={13} /> <span className={styles.baAfter}>After: Afternoon</span></p>
        </>
      )}

      <p className={styles.stepLabel}>4 · Your decision</p>
      <div className={styles.decisions}>
        {([['correct', 'Correct', <Check width={15} height={15} />], ['accept', 'Accept OCR', <Eye width={15} height={15} />], ['unreadable', 'Mark Unreadable', <EyeOff width={15} height={15} />], ['flag', 'Flag for Review', <Flag width={15} height={15} />]] as const).map(([id, label, icon]) => (
          <button key={id} className={`${styles.decision} ${decision === id ? styles.decisionActive : ''}`} onClick={() => setDecision(id)}>
            <span className={styles.decisionIcon}>{icon}</span>{label}
          </button>
        ))}
      </div>

      <p className={styles.stepLabel}>5 · Reviewer note <span className={styles.stepHint}>(optional)</span></p>
      <textarea className={styles.noteBox} value={note} onChange={(e) => setNote(e.target.value.slice(0, 500))} rows={2} placeholder="Add a note about this correction…" />
      <p className={styles.noteCount}>{note.length} / 500</p>

      <p className={styles.stepLabel}>6 · Correction history</p>
      <ul className={styles.history}>
        <li><span className={styles.hDot} /> OCR extracted: Aftrenoon <span className={styles.hTime}>System · 11:08 AM</span></li>
        <li><span className={`${styles.hDot} ${styles.hDotGold}`} /> Suggested correction generated <span className={styles.hTime}>System · 11:08 AM</span></li>
        <li><span className={`${styles.hDot} ${styles.hDotInk}`} /> Reviewed by {officerName('records-officer')} <span className={styles.hPending}>Pending action</span></li>
      </ul>
    </SideSheet>
  );
}

// --------------------------------------------------------------------------
// Complete Verification (Side Sheet G)
// --------------------------------------------------------------------------
export function CompleteVerificationSheet({ open, onClose, job, showToast }: {
  open: boolean; onClose: () => void; job: OcrJob; showToast: (m: string) => void;
}) {
  const navigate = useNavigate();
  const updateOcrJob = useDemoStore((s) => s.updateOcrJob);
  const [note, setNote] = useState('');
  const [reviewer, setReviewer] = useState('quality-reviewer');
  const [notify, setNotify] = useState(true);

  const openIssues = (job.issues ?? []).filter((i) => i.status === 'open').length;
  const verified = job.pages?.filter((p) => p.state === 'verified').length ?? job.verifiedPages;
  const canSubmit = verified >= job.pageCount && openIssues === 0;

  function submit() {
    updateOcrJob(job.id, { status: 'Quality Review', reviewerId: reviewer });
    recordAudit({ recordId: job.reference, actorId: 'records-officer', actionType: 'Stage Change', description: 'Verification completed and submitted for quality review', previousValue: 'Needs Verification', newValue: 'Quality Review' });
    onClose();
    showToast('Submitted for quality review. Samuel Kariuki has been notified.');
    navigate(`/repository/historical-records/${job.reference.replace(/\//g, '-')}`);
  }

  const summary: [string, string, boolean][] = [
    ['Pages reviewed', `${verified} of ${job.pageCount}`, verified >= job.pageCount],
    ['Corrections made', String(job.corrections?.length ?? 0), true],
    ['Issues remaining', String(openIssues), openIssues === 0],
    ['Document type & date', 'Confirmed', true],
    ['Structure reviewed', 'Confirmed', true],
    ['Search visibility', 'Internal — authorised users', true],
  ];

  return (
    <SideSheet open={open} onClose={onClose} size="lg" title="Complete Verification"
      subtitle={job.title}
      footer={
        <div className={styles.footerRow}>
          <Button variant="ghost" onClick={() => { onClose(); showToast('Progress saved.'); }}>Save Progress</Button>
          <Button variant="primary" leftIcon={<ShieldCheck width={15} height={15} />} onClick={submit} disabled={!canSubmit}>Submit for Quality Review</Button>
        </div>
      }>
      {!canSubmit && (
        <div className={styles.warnBox}><Info width={15} height={15} /> Resolve all issues and verify every page before submitting for quality review.</div>
      )}
      <p className={styles.stepLabel}>Verification summary</p>
      <ul className={styles.checkSummary}>
        {summary.map(([label, value, ok]) => (
          <li key={label}><span className={`${styles.checkIcon} ${ok ? styles.checkOk : styles.checkPending}`}>{ok ? <Check width={13} height={13} /> : <AlertTriangle width={12} height={12} />}</span><span className={styles.checkLabel}>{label}</span><span className={styles.checkValue}>{value}</span></li>
        ))}
      </ul>

      <label className={styles.field}><span className={styles.fieldLabel}>Verification note</span>
        <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Summary of the verification for the quality reviewer…" />
      </label>
      <label className={styles.field}><span className={styles.fieldLabel}>Quality reviewer</span>
        <select value={reviewer} onChange={(e) => setReviewer(e.target.value)}>
          <option value="quality-reviewer">Samuel Kariuki — Principal Records Reviewer</option>
          <option value="clerk">Office of the Clerk</option>
        </select>
      </label>
      <label className={styles.check}><input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} /> <span>Notify the archive team</span></label>
    </SideSheet>
  );
}
