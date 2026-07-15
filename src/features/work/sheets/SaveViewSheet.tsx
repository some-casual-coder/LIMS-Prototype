import { useState } from 'react';
import { SideSheet, Button } from '@/components/ui';
import { savedViews } from '@/data/myWork';
import { filterCount, type Filters } from '../logic';
import styles from './SaveViewSheet.module.css';

const VISIBILITY = [
  { id: 'me', label: 'Only me' },
  { id: 'directorate', label: 'Directorate' },
  { id: 'selected', label: 'Selected users' },
];

export function SaveViewSheet({ open, onClose, filters, status }: { open: boolean; onClose: () => void; filters: Filters; status: string }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('me');
  const [asDefault, setAsDefault] = useState(false);
  const [saved, setSaved] = useState(false);

  const included: string[] = [];
  const statusLabel = savedViews.find((v) => v.id === status)?.label;
  if (status !== 'all' && statusLabel) included.push(statusLabel);
  filters.workStates.forEach((w) => included.push(w));
  filters.types.forEach((t) => included.push(t));
  filters.priorities.forEach((p) => included.push(`${p} priority`));
  if (filters.due) included.push(`Due: ${filters.due}`);
  if (filterCount(filters) === 0 && included.length === 0) included.push('All My Work');

  function save() {
    setSaved(true);
    window.setTimeout(() => { setSaved(false); setName(''); setDescription(''); onClose(); }, 900);
  }

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      size="sm"
      title="Save current view"
      subtitle="Create a reusable view from your current filters"
      footer={
        <div className={styles.footer}>
          <Button variant="tertiary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!name.trim() || saved} onClick={save}>{saved ? 'Saved' : 'Save View'}</Button>
        </div>
      }
    >
      <label className={styles.field}>
        <span className={styles.label}>View name</span>
        <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. High Priority Bills" />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Description</span>
        <textarea className={styles.textarea} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
      </label>

      <div className={styles.field}>
        <span className={styles.label}>Visibility</span>
        <div className={styles.radios}>
          {VISIBILITY.map((v) => (
            <label key={v.id} className={styles.radio}>
              <input type="radio" name="visibility" checked={visibility === v.id} onChange={() => setVisibility(v.id)} /> {v.label}
            </label>
          ))}
        </div>
      </div>

      <label className={styles.toggle}>
        <input type="checkbox" checked={asDefault} onChange={(e) => setAsDefault(e.target.checked)} /> Set as default My Work view
      </label>

      <div className={styles.summary}>
        <span className={styles.label}>Filters included</span>
        <ul className={styles.chips}>
          {included.map((c, i) => <li key={i} className={styles.chip}>{c}</li>)}
        </ul>
      </div>
    </SideSheet>
  );
}
