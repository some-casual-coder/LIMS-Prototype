import { useState } from 'react';
import { SideSheet, Button } from '@/components/ui';
import styles from './SaveViewSheet.module.css';

const CHANNELS = [
  { id: 'in-app', label: 'In-app', enabled: true },
  { id: 'email', label: 'Email', enabled: true },
  { id: 'sms', label: 'SMS', enabled: false },
];

export function ReminderSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [date, setDate] = useState('2026-07-15');
  const [time, setTime] = useState('14:00');
  const [channel, setChannel] = useState('in-app');
  const [note, setNote] = useState('');
  const [repeat, setRepeat] = useState('none');
  const [saved, setSaved] = useState(false);

  function add() {
    setSaved(true);
    window.setTimeout(() => { setSaved(false); onClose(); }, 900);
  }

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      size="sm"
      title="Add reminder"
      subtitle="Be notified before a deadline"
      footer={
        <div className={styles.footer}>
          <Button variant="tertiary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={saved} onClick={add}>{saved ? 'Reminder added' : 'Add Reminder'}</Button>
        </div>
      }
    >
      <div className={styles.field} style={{ flexDirection: 'row', gap: 12 }}>
        <label className={styles.field} style={{ flex: 1 }}>
          <span className={styles.label}>Reminder date</span>
          <input className={styles.input} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className={styles.field} style={{ flex: 1 }}>
          <span className={styles.label}>Time</span>
          <input className={styles.input} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
      </div>
      <div className={styles.field}>
        <span className={styles.label}>Notification channel</span>
        <div className={styles.radios}>
          {CHANNELS.map((c) => (
            <label key={c.id} className={styles.radio} style={c.enabled ? undefined : { opacity: 0.5 }}>
              <input type="radio" name="channel" checked={channel === c.id} disabled={!c.enabled} onChange={() => setChannel(c.id)} />
              {c.label}{!c.enabled && ' (not configured)'}
            </label>
          ))}
        </div>
      </div>
      <label className={styles.field}>
        <span className={styles.label}>Note</span>
        <textarea className={styles.textarea} rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Remind me two hours before the Clause 14 revision deadline." />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Repeat</span>
        <select className={styles.input} value={repeat} onChange={(e) => setRepeat(e.target.value)}>
          <option value="none">Does not repeat</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </label>
    </SideSheet>
  );
}
