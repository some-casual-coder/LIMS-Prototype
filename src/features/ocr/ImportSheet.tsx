import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, Check, ScanLine } from 'lucide-react';
import { SideSheet, Button } from '@/components/ui';
import { PRIMARY_JOB_ID } from '@/data/ocrData';
import styles from './ImportSheet.module.css';

// Import Historical Record (Side Sheet A). Pre-filled with the demonstration
// Order Paper; "Upload and Process" runs the deterministic processing job.
export function ImportSheet({ open, onClose, showToast }: { open: boolean; onClose: () => void; showToast: (m: string) => void }) {
  const navigate = useNavigate();
  const [file, setFile] = useState<{ name: string; size: string; pages: number } | null>({
    name: 'NA_Order_Paper_12_June_1984.pdf', size: '18.6 MB', pages: 12,
  });
  const [title, setTitle] = useState('National Assembly Order Paper — 12 June 1984');
  const [date, setDate] = useState('1984-06-12');
  const [recordType, setRecordType] = useState('Order Paper');
  const [archive, setArchive] = useState('Parliamentary Archives');
  const [physicalRef, setPhysicalRef] = useState('Box OP-1984-06');
  const [shelf, setShelf] = useState('Folder 12');
  const [language, setLanguage] = useState('English');
  const [classification, setClassification] = useState('Internal');
  const [notes, setNotes] = useState('Demonstration record for the OCR workflow.');
  const [enhance, setEnhance] = useState(true);
  const [structure, setStructure] = useState(true);
  const [suggestMeta, setSuggestMeta] = useState(true);
  const [makeSearchable, setMakeSearchable] = useState(true);

  function upload() {
    onClose();
    navigate(`/archive/ocr/jobs/${PRIMARY_JOB_ID}?fresh=1`);
  }

  return (
    <SideSheet open={open} onClose={onClose} size="wide" title="Import Historical Record"
      subtitle="Upload the best available scan. The original file will be preserved unchanged."
      footer={
        <div className={styles.footer}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" leftIcon={<ScanLine width={15} height={15} />} onClick={upload} disabled={!file}>Upload and Process</Button>
        </div>
      }>
      <p className={styles.groupHead}>1 · Source file</p>
      <div className={styles.dropzone}>
        <UploadCloud width={26} height={26} />
        <p className={styles.dropTitle}>Drag and drop a file here</p>
        <p className={styles.dropOr}>or</p>
        <Button variant="secondary" size="sm" onClick={() => setFile({ name: 'NA_Order_Paper_12_June_1984.pdf', size: '18.6 MB', pages: 12 })}>Choose file</Button>
        <p className={styles.dropHint}>Maximum 500 MB · PDF, TIFF, JPEG, PNG supported</p>
      </div>
      {file && (
        <div className={styles.fileChip}>
          <span className={styles.fileIcon}><FileText width={18} height={18} /></span>
          <div className={styles.fileText}>
            <p className={styles.fileName}>{file.name}</p>
            <p className={styles.fileMeta}>{file.size} · {file.pages} pages · <button className={styles.replace} onClick={() => showToast('Choose a replacement file.')}>Replace file</button></p>
          </div>
          <span className={styles.fileOk}><Check width={16} height={16} /></span>
        </div>
      )}

      <p className={styles.groupHead}>2 · Preliminary information</p>
      <Field label="Preliminary title" required><input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
      <div className={styles.grid2}>
        <Field label="Approximate date" required><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label="Record type" required>
          <select value={recordType} onChange={(e) => setRecordType(e.target.value)}>
            {['Order Paper', 'Votes and Proceedings', 'Bill', 'Motion', 'Petition', 'Committee Report', 'Gazette', 'Statutory Instrument', 'Paper Laid', 'Correspondence', 'Other archival record'].map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Source archive" required>
        <select value={archive} onChange={(e) => setArchive(e.target.value)}>
          {['Parliamentary Archives', 'National Archives', 'National Assembly Records'].map((a) => <option key={a}>{a}</option>)}
        </select>
      </Field>
      <div className={styles.grid2}>
        <Field label="Physical reference"><input value={physicalRef} onChange={(e) => setPhysicalRef(e.target.value)} /></Field>
        <Field label="Shelf / folder"><input value={shelf} onChange={(e) => setShelf(e.target.value)} /></Field>
      </div>
      <div className={styles.grid2}>
        <Field label="Language">
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>{['English', 'Kiswahili'].map((l) => <option key={l}>{l}</option>)}</select>
        </Field>
        <Field label="Classification">
          <select value={classification} onChange={(e) => setClassification(e.target.value)}>{['Internal', 'Public', 'Restricted', 'Confidential'].map((c) => <option key={c}>{c}</option>)}</select>
        </Field>
      </div>
      <Field label="Notes"><textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>

      <p className={styles.groupHead}>3 · Processing options</p>
      <label className={styles.check}><input type="checkbox" checked={enhance} onChange={(e) => setEnhance(e.target.checked)} /> <span>Enhance scan quality</span></label>
      <label className={styles.check}><input type="checkbox" checked={structure} onChange={(e) => setStructure(e.target.checked)} /> <span>Detect legislative structure <em>(headings, sections, clauses)</em></span></label>
      <label className={styles.check}><input type="checkbox" checked={suggestMeta} onChange={(e) => setSuggestMeta(e.target.checked)} /> <span>Suggest metadata</span></label>
      <label className={styles.check}><input type="checkbox" checked={makeSearchable} onChange={(e) => setMakeSearchable(e.target.checked)} /> <span>Make searchable after verification <em>(OCR Verified)</em></span></label>
      <p className={styles.note}>Extracted text is always held for human verification before it becomes a trusted, searchable record.</p>
    </SideSheet>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}{required && <span className={styles.req}> *</span>}</span>
      {children}
    </label>
  );
}
