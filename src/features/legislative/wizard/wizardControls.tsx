import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './InstructionWizard.module.css';

export function Field({ label, required, hint, children, full }: {
  label: string; required?: boolean; hint?: string; children: ReactNode; full?: boolean;
}) {
  return (
    <div className={`${styles.field} ${full ? styles.fieldFull : ''}`}>
      <label className={styles.fieldLabel}>{label}{required && <span className={styles.req}> *</span>}</label>
      {children}
      {hint && <p className={styles.fieldHint}>{hint}</p>}
    </div>
  );
}

export function TextInput({ value, onChange, placeholder, name, id }: {
  value: string; onChange: (v: string) => void; placeholder?: string; name?: string; id?: string;
}) {
  return (
    <input id={id} name={name} className={styles.input} value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)} />
  );
}

export function TextArea({ value, onChange, rows = 4, name }: {
  value: string; onChange: (v: string) => void; rows?: number; name?: string;
}) {
  return (
    <textarea name={name} className={styles.textarea} rows={rows} value={value}
      onChange={(e) => onChange(e.target.value)} />
  );
}

export function Select({ value, onChange, options, name, leftIcon }: {
  value: string; onChange: (v: string) => void; options: string[]; name?: string; leftIcon?: ReactNode;
}) {
  return (
    <div className={`${styles.selectWrap} ${leftIcon ? styles.selectHasIcon : ''}`}>
      {leftIcon && <span className={styles.selectIcon} aria-hidden>{leftIcon}</span>}
      <select name={name} className={styles.select} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown width={15} height={15} className={styles.selectChevron} aria-hidden />
    </div>
  );
}

export function DateField({ value, onChange, name }: {
  value: string; onChange: (v: string) => void; name?: string;
}) {
  return (
    <input type="date" name={name} className={styles.input} value={value} onChange={(e) => onChange(e.target.value)} />
  );
}

export function Toggle({ on, onToggle, label, hint }: {
  on: boolean; onToggle: () => void; label: string; hint?: string;
}) {
  return (
    <div className={styles.toggleRow}>
      <div>
        <div className={styles.toggleLabel}>{label}</div>
        {hint && <div className={styles.toggleHint}>{hint}</div>}
      </div>
      <button type="button" role="switch" aria-checked={on} aria-label={label}
        className={`${styles.switch} ${on ? styles.switchOn : ''}`} onClick={onToggle}>
        <span className={styles.switchKnob} />
      </button>
    </div>
  );
}
