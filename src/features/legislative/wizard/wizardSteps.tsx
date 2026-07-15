import { useRef, useState, type DragEvent } from 'react';
import {
  Flag, Lock, Search, UploadCloud, X, Plus, CheckCircle2,
  User as UserIcon, PenLine, Scale, ClipboardCheck, Users, FileSpreadsheet,
} from 'lucide-react';
import { useDemoStore } from '@/store/demoStore';
import { officers } from '@/data/personas';
import { StageIcon } from '@/features/workflows/workflowShared';
import { publishMeta } from '@/features/workflows/workflowShared';
import { Field, TextInput, TextArea, Select, DateField, Toggle } from './wizardControls';
import {
  billTemplates, LEGISLATIVE_TYPES, PRIORITIES, CONFIDENTIALITIES, ORIGINATING_OFFICES,
  SPONSORS, DIRECTORATES, LANGUAGES, NUMBERING_RULES, REQUIRED_APPROVALS, ASSIGNABLE,
  REMINDER_FREQUENCIES, ESCALATE_BY, ESCALATE_TO, RELATED_LEGISLATION_LIBRARY,
  type WizardForm, type WizardFile,
} from './wizardData';
import styles from './InstructionWizard.module.css';

type SetForm = (patch: Partial<WizardForm>) => void;
type OpenSheet = (name: string) => void;

const officerName = (id: string) => officers.find((o) => o.id === id)?.name ?? '—';
const officerRole = (id: string) => officers.find((o) => o.id === id)?.roleTitle ?? '';
const officerLabel = (id: string) => `${officerName(id)} (${officerRole(id)})`;

function StepHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className={styles.stepHeader}>
      <h2 className={styles.stepTitle}>{title}</h2>
      <p className={styles.stepSub}>{sub}</p>
    </div>
  );
}

// ---- Step 1 — Instruction Details -----------------------------------------
export function StepInstruction({ form, set }: { form: WizardForm; set: SetForm }) {
  return (
    <section className={styles.panel}>
      <StepHeader title="Instruction Details" sub="Provide the basic details of the new legislative instruction." />
      <div className={styles.grid2}>
        <Field label="Title of Instruction" required>
          <TextInput name="title" value={form.title} onChange={(v) => set({ title: v })} />
        </Field>
        <Field label="Priority" required>
          <Select name="priority" value={form.priority} onChange={(v) => set({ priority: v })} options={PRIORITIES} leftIcon={<Flag width={15} height={15} />} />
        </Field>
        <Field label="Legislative Type" required>
          <Select name="legislativeType" value={form.legislativeType} onChange={(v) => set({ legislativeType: v })} options={LEGISLATIVE_TYPES} />
        </Field>
        <Field label="Confidentiality Level" required>
          <Select name="confidentiality" value={form.confidentiality} onChange={(v) => set({ confidentiality: v })} options={CONFIDENTIALITIES} leftIcon={<Lock width={15} height={15} />} />
        </Field>
        <Field label="Originating Office" required>
          <Select name="originatingOffice" value={form.originatingOffice} onChange={(v) => set({ originatingOffice: v })} options={ORIGINATING_OFFICES} />
        </Field>
        <Field label="Due Date" required hint="The system warns if this is earlier than the minimum workflow duration.">
          <DateField name="dueDate" value={form.dueDate} onChange={(v) => set({ dueDate: v })} />
        </Field>
        <Field label="Sponsor / Introducer" required>
          <Select name="sponsor" value={form.sponsor} onChange={(v) => set({ sponsor: v })} options={SPONSORS} />
        </Field>
        <Field label="Directorate" required>
          <Select name="directorate" value={form.directorate} onChange={(v) => set({ directorate: v })} options={DIRECTORATES} />
        </Field>
        <Field label="Supporting Description" full>
          <TextArea name="description" value={form.description} onChange={(v) => set({ description: v })} rows={3} />
        </Field>
      </div>
    </section>
  );
}

// ---- Step 2 — Template & Workflow -----------------------------------------
export function StepTemplate({ form, set, openSheet }: { form: WizardForm; set: SetForm; openSheet: OpenSheet }) {
  const [query, setQuery] = useState('');
  const bills = useDemoStore((s) => s.workflowTemplates.find((w) => w.slug === 'bills'));
  const filtered = billTemplates.filter((t) => t.name.toLowerCase().includes(query.trim().toLowerCase()));
  const pm = bills ? publishMeta(bills.publishState) : null;

  return (
    <div className={styles.grid2col}>
      <section className={styles.panel}>
        <StepHeader title="Approved Templates" sub="Select an approved template to structure the document." />
        <div className={styles.searchWrap}>
          <Search width={15} height={15} className={styles.searchIcon} aria-hidden />
          <input className={styles.searchInput} placeholder="Search templates…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search templates" />
        </div>
        <div className={styles.templateList}>
          {filtered.map((t) => {
            const active = t.id === form.templateId;
            return (
              <button key={t.id} className={`${styles.templateCard} ${active ? styles.templateActive : ''}`} onClick={() => set({ templateId: t.id, numberingRules: t.numberingRules })} aria-pressed={active}>
                <div className={styles.templateMain}>
                  <div className={styles.templateName}>{t.name}</div>
                  <div className={styles.templateMeta}>{t.version} · {t.effective}</div>
                </div>
                <span className={styles.templateApproved}><CheckCircle2 width={13} height={13} /> {t.status}</span>
                {active && <span className={styles.templateTick} aria-hidden><CheckCircle2 width={18} height={18} /></span>}
              </button>
            );
          })}
          {filtered.length === 0 && <p className={styles.emptyNote}>No templates match your search.</p>}
        </div>
        <button className={styles.linkBtn} onClick={() => openSheet('template-preview')}>View Template Preview</button>
      </section>

      <section className={styles.panel}>
        <StepHeader title="Workflow Template" sub="Select the workflow to govern this instruction." />
        <div className={styles.workflowSelectRow}>
          <div className={styles.workflowSelect}>
            <span>Bills Workflow — Full Lifecycle (DLS)</span>
            {bills && pm && (
              <span className={styles.wfVersionPill}>{bills.version} · {bills.publishState}</span>
            )}
          </div>
        </div>

        <div className={styles.workflowOverview}>
          <div className={styles.woHead}>
            <span className={styles.woTitle}>Workflow Overview</span>
            <span className={styles.woSub}>This workflow contains {bills?.stages.length ?? 6} stages.</span>
          </div>
          <ol className={styles.woStages}>
            {(bills?.stages ?? []).map((s) => (
              <li key={s.id} className={styles.woStage}>
                <span className={styles.woStageIcon} aria-hidden><StageIcon name={s.icon} width={15} height={15} /></span>
                <span className={styles.woStageLabel}>{s.name}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.grid2}>
          <Field label="Language" required>
            <Select name="language" value={form.language} onChange={(v) => set({ language: v })} options={LANGUAGES} />
          </Field>
          <div className={styles.expectedStages}>
            <span className={styles.expectedLabel}>Expected Stages</span>
            <span className={styles.expectedNum}>{bills?.stages.length ?? 6}</span>
            <span className={styles.expectedSub}>Total Stages</span>
          </div>
          <Field label="Numbering Rules" required>
            <Select name="numberingRules" value={form.numberingRules} onChange={(v) => set({ numberingRules: v })} options={NUMBERING_RULES} />
          </Field>
          <Field label="Required Approvals" required>
            <Select name="requiredApprovals" value={form.requiredApprovals} onChange={(v) => set({ requiredApprovals: v })} options={REQUIRED_APPROVALS} />
          </Field>
        </div>
      </section>
    </div>
  );
}

// ---- Step 3 — Supporting Information ---------------------------------------
export function StepSupporting({ form, set, openSheet }: { form: WizardForm; set: SetForm; openSheet: OpenSheet }) {
  const [legQuery, setLegQuery] = useState('');
  const supportingInput = useRef<HTMLInputElement>(null);
  const financialInput = useRef<HTMLInputElement>(null);
  const legSuggestions = RELATED_LEGISLATION_LIBRARY.filter(
    (l) => legQuery.trim() && l.title.toLowerCase().includes(legQuery.toLowerCase()) && !form.relatedLegislation.some((r) => r.id === l.id),
  );

  function fileSize(bytes: number) {
    return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  function addFiles(list: 'supportingFiles' | 'financialDocs', selected: FileList | File[]) {
    const existing = new Set(form[list].map((file) => file.name.toLowerCase()));
    const files: WizardFile[] = Array.from(selected)
      .filter((file) => !existing.has(file.name.toLowerCase()))
      .map((file) => ({
        name: file.name,
        type: file.name.includes('.') ? file.name.split('.').pop()!.toUpperCase() : 'FILE',
        size: fileSize(file.size),
        uploaded: '15 Jul 2026',
      }));
    if (files.length > 0) set({ [list]: [...form[list], ...files] } as Partial<WizardForm>);
  }
  function removeFile(list: 'supportingFiles' | 'financialDocs', i: number) {
    set({ [list]: form[list].filter((_, idx) => idx !== i) } as Partial<WizardForm>);
  }

  return (
    <div className={styles.grid2col}>
      <section className={styles.panel}>
        <StepHeader title="Supporting Files" sub="Upload any supporting documents relevant to this instruction." />
        <input
          ref={supportingInput}
          className={styles.fileInput}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.odt,.txt,.xml,.xlsx,.xls,.csv,.png,.jpg,.jpeg"
          onChange={(event) => {
            if (event.target.files) addFiles('supportingFiles', event.target.files);
            event.target.value = '';
          }}
        />
        <button
          type="button"
          className={styles.dropzone}
          onClick={() => supportingInput.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event: DragEvent<HTMLButtonElement>) => {
            event.preventDefault();
            addFiles('supportingFiles', event.dataTransfer.files);
          }}
        >
          <UploadCloud width={26} height={26} className={styles.dropIcon} aria-hidden />
          <span className={styles.dropText}>Drag & drop files here<br />or</span>
          <span className={styles.browseBtn}>Browse Files</span>
        </button>
        {form.supportingFiles.length > 0 && (
          <table className={styles.fileTable}>
            <thead><tr><th>File Name</th><th>Type</th><th>Size</th><th>Uploaded</th><th></th></tr></thead>
            <tbody>
              {form.supportingFiles.map((f, i) => (
                <tr key={`${f.name}-${f.uploaded}`}>
                  <td className={styles.fileName}>{f.name}</td>
                  <td>{f.type}</td>
                  <td>{f.size}</td>
                  <td className={styles.muted}>{f.uploaded}</td>
                  <td><button className={styles.fileMenu} onClick={() => removeFile('supportingFiles', i)} aria-label={`Remove ${f.name}`} title={`Remove ${f.name}`}><X width={15} height={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className={styles.subHead}>
          <h3 className={styles.subTitle}>Related Legislation</h3>
          <p className={styles.subSub}>Link existing Acts, Bills or Instruments.</p>
        </div>
        <div className={styles.searchWrap}>
          <Search width={15} height={15} className={styles.searchIcon} aria-hidden />
          <input className={styles.searchInput} placeholder="Search legislation…" value={legQuery} onChange={(e) => setLegQuery(e.target.value)} aria-label="Search legislation" />
          {legSuggestions.length > 0 && (
            <ul className={styles.suggestList}>
              {legSuggestions.map((l) => (
                <li key={l.id}>
                  <button onClick={() => { set({ relatedLegislation: [...form.relatedLegislation, l] }); setLegQuery(''); }}>
                    {l.title} <span className={styles.suggestKind}>{l.kind}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <ul className={styles.relatedList}>
          {form.relatedLegislation.map((l) => (
            <li key={l.id} className={styles.relatedRow}>
              <span className={styles.relatedTitle}>{l.title}</span>
              <span className={styles.relatedKind}>{l.kind}</span>
              <button className={styles.relatedRemove} onClick={() => set({ relatedLegislation: form.relatedLegislation.filter((r) => r.id !== l.id) })} aria-label={`Remove ${l.title}`}><X width={14} height={14} /></button>
            </li>
          ))}
        </ul>
        <button className={styles.linkBtn} onClick={() => openSheet('add-related')}><Plus width={13} height={13} /> Add Another</button>
      </section>

      <section className={styles.panel}>
        <StepHeader title="PBO / Financial Impact" sub="Financial impact assessment required from the Parliamentary Budget Office." />
        <Toggle label="PBO Assessment Required" hint="Blocks exit from Legal Review until the assessment is satisfied." on={form.pboRequired} onToggle={() => set({ pboRequired: !form.pboRequired })} />
        {form.pboRequired && (
          <>
            <div className={styles.subHead}><h3 className={styles.subTitle}>Financial Impact Documents <span className={styles.muted}>(if available)</span></h3></div>
            <ul className={styles.relatedList}>
              {form.financialDocs.map((f, i) => (
                <li key={i} className={styles.relatedRow}>
                  <FileSpreadsheet width={15} height={15} className={styles.muted} aria-hidden />
                  <span className={styles.relatedTitle}>{f.name}</span>
                  <span className={styles.relatedKind}>{f.type} · {f.size}</span>
                  <button className={styles.relatedRemove} onClick={() => removeFile('financialDocs', i)} aria-label={`Remove ${f.name}`}><X width={14} height={14} /></button>
                </li>
              ))}
            </ul>
            <input
              ref={financialInput}
              className={styles.fileInput}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xlsx,.xls,.csv"
              onChange={(event) => {
                if (event.target.files) addFiles('financialDocs', event.target.files);
                event.target.value = '';
              }}
            />
            <button className={styles.linkBtn} onClick={() => financialInput.current?.click()}><Plus width={13} height={13} /> Add Document</button>
            <button className={styles.linkBtn} onClick={() => openSheet('pbo')} style={{ marginLeft: 16 }}>PBO Requirement Details</button>
          </>
        )}

        <div className={styles.subHead}>
          <h3 className={styles.subTitle}>Public Participation Requirement</h3>
          <p className={styles.subSub}>Public participation or consultation required.</p>
        </div>
        <Toggle label="Public Participation Required" hint="Sets up a future participation workflow; does not expose the draft publicly." on={form.publicParticipation} onToggle={() => set({ publicParticipation: !form.publicParticipation })} />
      </section>
    </div>
  );
}

// ---- Step 4 — Assignment & Deadlines --------------------------------------
const STAGE_LABELS: Array<{ id: string; label: string; icon: string }> = [
  { id: 'instruction', label: 'Instruction', icon: 'ClipboardList' },
  { id: 'drafting', label: 'Drafting', icon: 'PenLine' },
  { id: 'legal-review', label: 'Legal Review', icon: 'Scale' },
  { id: 'procedural-review', label: 'Procedural Review', icon: 'ClipboardCheck' },
  { id: 'signature', label: 'Signature', icon: 'Signature' },
  { id: 'publication', label: 'Publication', icon: 'Globe' },
];

export function StepAssignment({ form, set, openSheet }: { form: WizardForm; set: SetForm; openSheet: OpenSheet }) {
  function assigneeSelect(key: 'ownerId' | 'drafterId' | 'legalReviewerId' | 'proceduralReviewerId', icon: React.ReactNode) {
    return (
      <div className={styles.selectWrap + ' ' + styles.selectHasIcon}>
        <span className={styles.selectIcon} aria-hidden>{icon}</span>
        <select name={key} className={styles.select} value={form[key]} onChange={(e) => set({ [key]: e.target.value } as Partial<WizardForm>)}>
          {ASSIGNABLE.map((id) => <option key={id} value={id}>{officerLabel(id)}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div className={styles.grid2col}>
      <section className={styles.panel}>
        <StepHeader title="Assign Key Officers" sub="Assign responsible officers for this instruction." />
        <Field label="Owner" required>{assigneeSelect('ownerId', <UserIcon width={15} height={15} />)}</Field>
        <Field label="Drafter" required>{assigneeSelect('drafterId', <PenLine width={15} height={15} />)}</Field>
        <Field label="Legal Reviewer" required>{assigneeSelect('legalReviewerId', <Scale width={15} height={15} />)}</Field>
        <Field label="Procedural Reviewer" required>{assigneeSelect('proceduralReviewerId', <ClipboardCheck width={15} height={15} />)}</Field>
        <Field label="Collaborators">
          <div className={styles.collabChips}>
            {form.collaboratorIds.map((id) => (
              <span key={id} className={styles.collabChip}>
                {officerName(id)} <span className={styles.muted}>({officerRole(id)})</span>
                <button className={styles.relatedRemove} onClick={() => set({ collaboratorIds: form.collaboratorIds.filter((c) => c !== id) })} aria-label={`Remove ${officerName(id)}`}><X width={12} height={12} /></button>
              </span>
            ))}
          </div>
          <button className={styles.linkBtn} onClick={() => openSheet('select-staff')}><Plus width={13} height={13} /> Add Collaborator</button>
        </Field>
      </section>

      <section className={styles.panel}>
        <StepHeader title="Stage Deadlines (Target Dates)" sub="Set expected completion dates for key workflow stages." />
        <div className={styles.deadlineRows}>
          {STAGE_LABELS.map((s) => (
            <div key={s.id} className={styles.deadlineRow}>
              <span className={styles.deadlineStage}><StageIcon name={s.icon} width={15} height={15} /> {s.label}</span>
              <input type="date" name={`deadline-${s.id}`} className={styles.deadlineInput}
                value={form.deadlines[s.id] ?? ''} onChange={(e) => set({ deadlines: { ...form.deadlines, [s.id]: e.target.value } })} aria-label={`${s.label} target date`} />
            </div>
          ))}
        </div>
        <button className={styles.linkBtn} onClick={() => openSheet('deadlines')}>Configure Stage Deadlines</button>

        <div className={styles.subHead}>
          <h3 className={styles.subTitle}>Reminder Rules</h3>
          <p className={styles.subSub}>Configure reminders for tasks and stage deadlines.</p>
        </div>
        <div className={styles.grid2}>
          <Field label="Reminder Frequency"><Select name="reminderFrequency" value={form.reminderFrequency} onChange={(v) => set({ reminderFrequency: v })} options={REMINDER_FREQUENCIES} /></Field>
          <Field label="Escalate If Overdue By"><Select name="escalateBy" value={form.escalateBy} onChange={(v) => set({ escalateBy: v })} options={ESCALATE_BY} /></Field>
          <Field label="Escalate To" full><Select name="escalateTo" value={form.escalateTo} onChange={(v) => set({ escalateTo: v })} options={ESCALATE_TO} leftIcon={<Users width={15} height={15} />} /></Field>
        </div>
      </section>
    </div>
  );
}
