import { useState } from 'react';
import { SideSheet, Button } from '@/components/ui';
import styles from './editorSheets.module.css';

const TYPES = ['Legal issue', 'Drafting clarification', 'Procedural issue', 'Reference issue', 'General comment'];

export function AddCommentSheet({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded?: () => void }) {
  const [text, setText] = useState('');
  const [type, setType] = useState('Drafting clarification');
  const [blocking, setBlocking] = useState(false);
  const [saved, setSaved] = useState(false);

  function add() {
    setSaved(true);
    window.setTimeout(() => { setSaved(false); setText(''); onClose(); onAdded?.(); }, 800);
  }

  return (
    <SideSheet open={open} onClose={onClose} size="md" title="Add comment" subtitle="Clause 14 — Protection of vulnerable users"
      footer={<div className={styles.footer}><Button variant="tertiary" onClick={onClose}>Cancel</Button><Button variant="primary" disabled={!text.trim() || saved} onClick={add}>{saved ? 'Added' : 'Add Comment'}</Button></div>}>
      <div className={styles.quote}>“provide reasonable accommodations and assistive support, including through human assistance, where identity verification…”</div>
      <label className={styles.field}><span className={styles.label}>Comment</span>
        <textarea className={styles.textarea} rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your comment…" autoFocus />
      </label>
      <label className={styles.field}><span className={styles.label}>Comment type</span>
        <select className={styles.input} value={type} onChange={(e) => setType(e.target.value)}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
      </label>
      <label className={styles.toggle}><input type="checkbox" checked={blocking} onChange={(e) => setBlocking(e.target.checked)} /> Mark as blocking comment</label>
      <p className={styles.hint}>Blocking comments must be resolved before the version can progress.</p>
    </SideSheet>
  );
}
