import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleCheck, FileText, Calendar, Loader2, Send } from 'lucide-react';
import { SideSheet, Button, Avatar } from '@/components/ui';
import { useDemoStore } from '@/store/demoStore';
import { recordAudit, notify, delay } from '@/mocks/mockApi';
import styles from './editorSheets.module.css';

const CHECKS = ['All blocking comments addressed', 'Structural validation passed', 'Cross-references verified', 'Revision note provided'];

export function SubmitSheet({ open, onClose, recordId, onSaveDraft }: { open: boolean; onClose: () => void; recordId: string; onSaveDraft?: () => void }) {
  const navigate = useNavigate();
  const addVersion = useDemoStore((s) => s.addVersion);
  const setStage = useDemoStore((s) => s.setStage);
  const currentRole = useDemoStore((s) => s.currentRole);
  const [note, setNote] = useState('Clarified assisted-access obligations in Clause 14 and corrected the Clause 6 cross-reference. Updated wording for consistency with the Data Protection Act.');
  const [notifyColl, setNotifyColl] = useState(true);
  const [cleanPdf, setCleanPdf] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    await delay(700, 1100);
    addVersion({
      id: `v-015-41-${Date.now().toString(36)}`, recordId, version: '4.1', label: 'Revision Draft', status: 'Legal Review Draft',
      createdById: (currentRole as string) ?? 'dls-drafter', createdAt: new Date().toISOString(),
      reason: note, approvalState: 'Submitted', recordIdentifier: 'REC-015-0006', outputs: cleanPdf ? ['PDF'] : [],
    });
    setStage(recordId, 'Legal Review');
    recordAudit({ recordId, actorId: currentRole ?? 'dls-drafter', actionType: 'Create', description: 'Created Version 4.1 and submitted the corrected draft for legal review.', previousValue: 'Version 4.0', newValue: 'Version 4.1', version: '4.1' });
    recordAudit({ recordId, actorId: currentRole ?? 'dls-drafter', actionType: 'Stage Change', description: 'Workflow advanced from Revision Requested to Legal Review.', previousValue: 'Revision Requested', newValue: 'Legal Review', version: '4.1' });
    if (notifyColl) notify({ category: 'Review', recipientId: 'dls-reviewer', recordId, title: 'Legal review requested', body: 'Digital Public Services Bill, 2026 — Version 4.1 submitted for legal review by Grace Wanjiku.' });
    setSubmitting(false);
    onClose();
    navigate(`/legislative/${recordId}`);
  }

  return (
    <SideSheet open={open} onClose={onClose} size="lg" title="Submit Version 4.1 for Legal Review" subtitle="Digital Public Services Bill, 2026 · NA/BILL/2026/015"
      footer={<div className={styles.footer}><Button variant="secondary" onClick={() => { onSaveDraft?.(); onClose(); }}>Save Working Draft</Button><Button variant="primary" disabled={submitting} leftIcon={submitting ? <Loader2 width={16} height={16} className={styles.spin} /> : <Send width={15} height={15} />} onClick={submit}>{submitting ? 'Submitting…' : 'Submit for Review'}</Button></div>}>
      <div className={styles.validPass}><CircleCheck width={16} height={16} /> Validation passed</div>

      <div className={styles.versionCard}>
        <span className={styles.versionThumb}><FileText width={20} height={20} /></span>
        <div className={styles.versionInfo}>
          <p className={styles.versionName}>Version 4.1</p>
          <p className={styles.versionLabel}>Revision Draft — ready to submit for legal review</p>
          <p className={styles.versionMeta}>Created from Version 4.0 · Updated today, 10:42 AM</p>
        </div>
      </div>

      <p className={styles.secLabel}>Pre-submission checks</p>
      <ul className={styles.checks}>{CHECKS.map((c) => <li key={c}><CircleCheck width={16} height={16} /> {c}</li>)}</ul>

      <label className={styles.field}><span className={styles.label}>Revision note</span>
        <textarea className={styles.textarea} rows={4} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} />
        <span className={styles.count}>{note.length} / 1000</span>
      </label>

      <p className={styles.secLabel}>Assigned reviewer</p>
      <div className={styles.reviewer}>
        <Avatar initials="DO" name="David Otieno" size={40} tone="neutral" />
        <div className={styles.reviewerInfo}><p className={styles.reviewerName}>David Otieno</p><p className={styles.reviewerRole}>Lead Legal Counsel · Directorate of Legal Services</p></div>
        <div className={styles.reviewerDue}><Calendar width={13} height={13} /> Review due: 16 July 2026, 4:00 PM</div>
      </div>

      <label className={styles.toggleRow}><span>Notify collaborators</span><input type="checkbox" checked={notifyColl} onChange={(e) => setNotifyColl(e.target.checked)} /></label>
      <label className={styles.toggleRow}><span>Include clean PDF preview</span><input type="checkbox" checked={cleanPdf} onChange={(e) => setCleanPdf(e.target.checked)} /></label>

      <div className={styles.infoBox}>Submitting will create <b>Version 4.1</b> as the current review version and notify the assigned reviewer. Version 4.0 is preserved.</div>
    </SideSheet>
  );
}
