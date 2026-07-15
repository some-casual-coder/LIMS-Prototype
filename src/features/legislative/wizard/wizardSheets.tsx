import { useState } from 'react';
import { CheckCircle2, Plus, Search, CalendarClock } from 'lucide-react';
import { SideSheet, Button, StatusBadge, Avatar } from '@/components/ui';
import { officers } from '@/data/personas';
import {
  billTemplates, RELATED_LEGISLATION_LIBRARY, RELATIONSHIP_TYPES, COLLABORATOR_OPTIONS,
  ASSIGNABLE, type WizardForm,
} from './wizardData';
import styles from './InstructionWizard.module.css';

type SetForm = (patch: Partial<WizardForm>) => void;
const officerName = (id: string) => officers.find((o) => o.id === id)?.name ?? '—';
const officerRole = (id: string) => officers.find((o) => o.id === id)?.roleTitle ?? '';
const officerDir = (id: string) => officers.find((o) => o.id === id)?.directorate ?? '';
const officerInitials = (id: string) => officers.find((o) => o.id === id)?.initials ?? '—';

export function WizardSheets({ open, form, set, onClose, onToast }: {
  open: string | null; form: WizardForm; set: SetForm; onClose: () => void; onToast: (m: string) => void;
}) {
  if (!open) return null;
  const template = billTemplates.find((t) => t.id === form.templateId);

  // ---- Template Preview ----
  if (open === 'template-preview') {
    return (
      <SideSheet open onClose={onClose} size="lg" title="Template Preview" subtitle={template?.name}
        footer={<div className={styles.sheetFooter}><Button variant="ghost" onClick={onClose}>Close</Button><Button variant="primary" onClick={() => { onClose(); onToast(`${template?.name} applied.`); }}>Use Template</Button></div>}>
        <dl className={styles.sheetMeta}>
          <div><dt>Template</dt><dd>{template?.name}</dd></div>
          <div><dt>Version</dt><dd>{template?.version}</dd></div>
          <div><dt>Effective</dt><dd>{template?.effective.replace('Effective ', '')}</dd></div>
          <div><dt>Status</dt><dd><StatusBadge tone="green" size="sm" icon={<CheckCircle2 width={12} height={12} />}>Approved</StatusBadge></dd></div>
          <div><dt>Numbering rules</dt><dd>{template?.numberingRules}</dd></div>
        </dl>
        <p className={styles.sheetPara}>{template?.description}</p>
        <h4 className={styles.sheetH4}>Required sections</h4>
        <ol className={styles.sheetSections}>
          {template?.sections.map((s, i) => <li key={s}><span className={styles.sectionNum}>{i + 1}</span> {s}</li>)}
        </ol>
        <div className={styles.tplSample}>
          <div className={styles.tplSampleTitle}>{form.title || 'Untitled Bill'}</div>
          <p className={styles.tplSampleBody}>A Bill of Parliament laid out to the approved {template?.name.replace('Bill Template — ', '')} structure. Clauses, schedules and commencement provisions are generated from this template when the workspace is created.</p>
        </div>
      </SideSheet>
    );
  }

  // ---- Add Related Record ----
  if (open === 'add-related') {
    return <AddRelatedSheet form={form} set={set} onClose={onClose} onToast={onToast} />;
  }

  // ---- Select Staff ----
  if (open === 'select-staff') {
    const options = [...new Set([...COLLABORATOR_OPTIONS, ...ASSIGNABLE])].filter((id) => !form.collaboratorIds.includes(id));
    return (
      <SideSheet open onClose={onClose} size="md" title="Select Staff" subtitle="Add a collaborator to this instruction."
        footer={<div className={styles.sheetFooter}><Button variant="ghost" onClick={onClose}>Done</Button></div>}>
        <ul className={styles.staffList}>
          {options.map((id) => (
            <li key={id} className={styles.staffRow}>
              <Avatar initials={officerInitials(id)} name={officerName(id)} size={34} />
              <div className={styles.staffText}>
                <div className={styles.staffName}>{officerName(id)}</div>
                <div className={styles.staffMeta}>{officerRole(id)} · {officerDir(id)}</div>
              </div>
              <button className={styles.staffAdd} onClick={() => { set({ collaboratorIds: [...form.collaboratorIds, id] }); onToast(`${officerName(id)} added as collaborator.`); }}>
                <Plus width={15} height={15} /> Add
              </button>
            </li>
          ))}
          {options.length === 0 && <p className={styles.emptyNote}>All available staff have been added.</p>}
        </ul>
      </SideSheet>
    );
  }

  // ---- Configure Stage Deadlines ----
  if (open === 'deadlines') {
    const stages = [
      { id: 'instruction', label: 'Instruction', dur: '2 working days', dep: 'Record created' },
      { id: 'drafting', label: 'Drafting', dur: '10 working days', dep: 'Instruction complete' },
      { id: 'legal-review', label: 'Legal Review', dur: '5 working days', dep: 'Draft submitted' },
      { id: 'procedural-review', label: 'Procedural Review', dur: '4 working days', dep: 'Legal approval' },
      { id: 'signature', label: 'Signature', dur: '2 working days', dep: 'Procedural complete' },
      { id: 'publication', label: 'Publication', dur: '1 working day', dep: 'Signed & sealed' },
    ];
    return (
      <SideSheet open onClose={onClose} size="lg" title="Configure Stage Deadlines" subtitle="Set target dates, dependencies and reminders per stage."
        footer={<div className={styles.sheetFooter}><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={() => { onClose(); onToast('Stage deadlines updated.'); }}>Save deadlines</Button></div>}>
        <table className={styles.deadlineTable}>
          <thead><tr><th>Stage</th><th>Target date</th><th>Duration</th><th>Dependency</th></tr></thead>
          <tbody>
            {stages.map((s) => (
              <tr key={s.id}>
                <td className={styles.deadlineStage}><CalendarClock width={14} height={14} /> {s.label}</td>
                <td><input type="date" className={styles.deadlineInput} value={form.deadlines[s.id] ?? ''} onChange={(e) => set({ deadlines: { ...form.deadlines, [s.id]: e.target.value } })} aria-label={`${s.label} target date`} /></td>
                <td className={styles.muted}>{s.dur}</td>
                <td className={styles.muted}>{s.dep}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SideSheet>
    );
  }

  // ---- PBO Requirement Details ----
  if (open === 'pbo') {
    const docs = ['Policy Statement', 'Draft Bill', 'Cabinet Memo', 'Financial Impact Note'];
    return (
      <SideSheet open onClose={onClose} size="md" title="PBO Requirement Details"
        footer={<div className={styles.sheetFooter}><Button variant="ghost" onClick={onClose}>Close</Button><Button variant="primary" onClick={() => { set({ pboRequired: true }); onClose(); onToast('PBO requirement confirmed.'); }}>Confirm Requirement</Button></div>}>
        <div className={styles.pboRow}><span className={styles.pboLabel}>Assessment Required</span><StatusBadge tone="green" size="sm">Yes</StatusBadge></div>
        <h4 className={styles.sheetH4}>Reason</h4>
        <p className={styles.sheetPara}>Financial and fiscal implications must be reviewed by the Parliamentary Budget Office before the Bill can advance beyond Legal Review.</p>
        <h4 className={styles.sheetH4}>Required Documents</h4>
        <ul className={styles.pboDocs}>
          {docs.map((d) => <li key={d}><CheckCircle2 width={16} height={16} className={styles.pboCheck} /> {d}</li>)}
        </ul>
        <h4 className={styles.sheetH4}>Assigned Liaison</h4>
        <div className={styles.pboLiaison}>
          <Avatar initials="SN" name="Sarah Njeri" size={32} />
          <div><div className={styles.staffName}>Sarah Njeri</div><div className={styles.staffMeta}>Parliamentary Budget Office</div></div>
        </div>
        <h4 className={styles.sheetH4}>Target Response Date</h4>
        <p className={styles.sheetPara}><CalendarClock width={14} height={14} /> 24 Jul 2026</p>
        <h4 className={styles.sheetH4}>Status</h4>
        <StatusBadge tone="gold" size="sm">Pending</StatusBadge>
      </SideSheet>
    );
  }

  return null;
}

function AddRelatedSheet({ form, set, onClose, onToast }: {
  form: WizardForm; set: SetForm; onClose: () => void; onToast: (m: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [rel, setRel] = useState(RELATIONSHIP_TYPES[0]);
  const results = RELATED_LEGISLATION_LIBRARY.filter(
    (l) => (!query || l.title.toLowerCase().includes(query.toLowerCase())) && !form.relatedLegislation.some((r) => r.id === l.id),
  );
  return (
    <SideSheet open onClose={onClose} size="md" title="Add Related Record" subtitle="Link an existing Act, Bill or instrument."
      footer={<div className={styles.sheetFooter}><Button variant="ghost" onClick={onClose}>Done</Button></div>}>
      <div className={styles.field}>
        <label className={styles.fieldLabel}>Relationship type</label>
        <div className={styles.selectWrap}>
          <select className={styles.select} value={rel} onChange={(e) => setRel(e.target.value)} name="relationship">
            {RELATIONSHIP_TYPES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <div className={styles.searchWrap} style={{ marginBottom: 12 }}>
        <Search width={15} height={15} className={styles.searchIcon} aria-hidden />
        <input className={styles.searchInput} placeholder="Search title, reference, type…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search records" />
      </div>
      <ul className={styles.staffList}>
        {results.map((l) => (
          <li key={l.id} className={styles.staffRow}>
            <div className={styles.staffText}><div className={styles.staffName}>{l.title}</div><div className={styles.staffMeta}>{l.kind} · {rel}</div></div>
            <button className={styles.staffAdd} onClick={() => { set({ relatedLegislation: [...form.relatedLegislation, l] }); onToast(`${l.title} linked.`); }}><Plus width={15} height={15} /> Link</button>
          </li>
        ))}
        {results.length === 0 && <p className={styles.emptyNote}>No matching records.</p>}
      </ul>
    </SideSheet>
  );
}
