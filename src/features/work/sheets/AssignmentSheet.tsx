import { useState } from 'react';
import { Search, Info } from 'lucide-react';
import { SideSheet, Button, Avatar } from '@/components/ui';
import { officers } from '@/data/personas';
import styles from './AssignmentSheet.module.css';

// Grace is a drafter, not a Directorate Lead → she can suggest but not reassign.
export function AssignmentSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [notify, setNotify] = useState(true);
  const [note, setNote] = useState('');
  const results = officers.filter((o) => o.id !== 'citizen' && o.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      size="lg"
      title="Assignment & collaboration"
      subtitle="Suggest a collaborator on this record"
      footer={
        <div className={styles.footer}>
          <Button variant="tertiary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onClose}>Request Reassignment</Button>
        </div>
      }
    >
      <div className={styles.permission}>
        <Info width={16} height={16} /> You can suggest a collaborator, but reassignment requires a Directorate Lead.
      </div>

      <h3 className={styles.h3}>Current owner</h3>
      <div className={styles.person}>
        <Avatar initials="GW" name="Grace Wanjiku" size={34} />
        <span><span className={styles.name}>Grace Wanjiku</span><span className={styles.role}>Drafter · DLS</span></span>
      </div>

      <h3 className={styles.h3}>Current collaborators</h3>
      <div className={styles.person}>
        <Avatar initials="DO" name="David Otieno" size={34} tone="neutral" />
        <span><span className={styles.name}>David Otieno</span><span className={styles.role}>Legal Reviewer · DLS</span></span>
      </div>

      <h3 className={styles.h3}>Add staff</h3>
      <label className={styles.search}>
        <Search width={15} height={15} aria-hidden />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search staff by name" aria-label="Search staff" />
      </label>
      {query && (
        <ul className={styles.results}>
          {results.slice(0, 4).map((o) => (
            <li key={o.id}>
              <button className={styles.resultItem} onClick={() => setQuery('')}>
                <Avatar initials={o.initials} name={o.name} size={30} tone="neutral" />
                <span><span className={styles.name}>{o.name}</span><span className={styles.role}>{o.roleTitle}</span></span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <label className={styles.field}>
        <span className={styles.label}>Assignment note</span>
        <textarea className={styles.textarea} rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for the suggested change" />
      </label>
      <label className={styles.toggle}>
        <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} /> Notify the assigned officer
      </label>
    </SideSheet>
  );
}
