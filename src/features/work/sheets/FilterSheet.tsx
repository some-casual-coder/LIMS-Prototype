import { useMemo, useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { SideSheet, Button } from '@/components/ui';
import { workItems, WORK_STATES } from '@/data/myWork';
import { emptyFilters, type Filters } from '../logic';
import styles from './FilterSheet.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  onChange: (f: Filters) => void;
  resultCount: number;
}

const DUE_OPTIONS = [
  { id: 'overdue', label: 'Overdue' },
  { id: '48-hours', label: 'Within 48 hours' },
  { id: 'this-week', label: 'This week' },
];

export function FilterSheet({ open, onClose, filters, onChange, resultCount }: Props) {
  const [typeQuery, setTypeQuery] = useState('');

  const opts = useMemo(() => ({
    stages: [...new Set(workItems.map((i) => i.stage))],
    types: [...new Set(workItems.map((i) => i.type))],
    roles: [...new Set(workItems.map((i) => i.myRole))],
    directorates: [...new Set(workItems.map((i) => i.directorate))],
    classifications: [...new Set(workItems.map((i) => i.confidentiality))],
  }), []);

  function toggle(key: keyof Filters, value: string) {
    const set = new Set(filters[key] as Set<string>);
    set.has(value) ? set.delete(value) : set.add(value);
    onChange({ ...filters, [key]: set });
  }
  function setDue(value: string) {
    onChange({ ...filters, due: filters.due === value ? '' : value });
  }

  const typeList = opts.types.filter((t) => t.toLowerCase().includes(typeQuery.toLowerCase()));

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      size="md"
      title="Filter My Work"
      subtitle={`${resultCount} records`}
      footer={
        <div className={styles.footer}>
          <Button variant="tertiary" onClick={() => onChange(emptyFilters())}>Clear all</Button>
          <Button variant="primary" onClick={onClose}>Show {resultCount} results</Button>
        </div>
      }
    >
      <Group title="Work state">
        {WORK_STATES.map((ws) => (
          <Check key={ws.id} label={ws.listTitle} checked={filters.workStates.has(ws.id)} onChange={() => toggle('workStates', ws.id)} />
        ))}
      </Group>

      <Group title="Legislative stage">
        {opts.stages.map((s) => (
          <Check key={s} label={s} checked={filters.stages.has(s)} onChange={() => toggle('stages', s)} />
        ))}
      </Group>

      <Group title="Workflow type">
        <label className={styles.typeSearch}>
          <SearchIcon width={14} height={14} aria-hidden />
          <input value={typeQuery} onChange={(e) => setTypeQuery(e.target.value)} placeholder="Search types" aria-label="Search workflow types" />
        </label>
        {typeList.map((t) => (
          <Check key={t} label={t} checked={filters.types.has(t)} onChange={() => toggle('types', t)} />
        ))}
      </Group>

      <Group title="My role">
        {opts.roles.map((r) => (
          <Check key={r} label={r} checked={filters.roles.has(r)} onChange={() => toggle('roles', r)} />
        ))}
      </Group>

      <Group title="Priority">
        {['High', 'Medium', 'Low'].map((p) => (
          <Check key={p} label={p} checked={filters.priorities.has(p)} onChange={() => toggle('priorities', p)} />
        ))}
      </Group>

      <Group title="Due date">
        {DUE_OPTIONS.map((d) => (
          <Check key={d.id} label={d.label} type="radio" checked={filters.due === d.id} onChange={() => setDue(d.id)} />
        ))}
      </Group>

      <Group title="Directorate">
        {opts.directorates.map((d) => (
          <Check key={d} label={d} checked={filters.directorates.has(d)} onChange={() => toggle('directorates', d)} />
        ))}
      </Group>

      <Group title="Classification">
        {opts.classifications.map((c) => (
          <Check key={c} label={c} checked={filters.classifications.has(c)} onChange={() => toggle('classifications', c)} />
        ))}
      </Group>
    </SideSheet>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={styles.group}>
      <h3 className={styles.groupTitle}>{title}</h3>
      <div className={styles.options}>{children}</div>
    </section>
  );
}

function Check({ label, checked, onChange, type = 'checkbox' }: { label: string; checked: boolean; onChange: () => void; type?: 'checkbox' | 'radio' }) {
  return (
    <label className={styles.check}>
      <input type={type} checked={checked} onChange={onChange} name={type === 'radio' ? 'due' : undefined} />
      {label}
    </label>
  );
}
