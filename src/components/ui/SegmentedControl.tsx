import styles from './SegmentedControl.module.css';

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}

// Accessible segmented control (radiogroup semantics) for switching views.
export function SegmentedControl({ options, value, onChange, ariaLabel }: Props) {
  return (
    <div className={styles.group} role="radiogroup" aria-label={ariaLabel}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            className={`${styles.segment} ${active ? styles.active : ''}`}
            onClick={() => onChange(o.value)}
            type="button"
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
