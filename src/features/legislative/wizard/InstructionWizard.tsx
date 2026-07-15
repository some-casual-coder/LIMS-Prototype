import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Check, X, ArrowLeft, ArrowRight, Save, Rocket, Loader2, Info, CircleCheck,
} from 'lucide-react';
import { AppShell } from '@/components/shell';
import { Button } from '@/components/ui';
import { useDemoStore } from '@/store/demoStore';
import { officers } from '@/data/personas';
import { recordAudit, notify } from '@/mocks/mockApi';
import { useToast } from '@/features/search/Toast';
import type {
  LegislativeRecord, Task, WorkflowType, Priority, Confidentiality, Directorate, RoleId,
} from '@/data/types';
import type { WorkItem } from '@/data/myWork';
import {
  WIZARD_STEPS, defaultForm, initialTaskSeed, DRAFT_KEY, fmtDate, type WizardForm,
} from './wizardData';
import { StepInstruction, StepTemplate, StepSupporting, StepAssignment } from './wizardSteps';
import { StepReview } from './wizardReview';
import { WizardSheets } from './wizardSheets';
import styles from './InstructionWizard.module.css';
import { createStructuredDraft } from '@/data/structuredDrafts';

const PROCESSING = [
  'Creating canonical record…',
  'Applying workflow…',
  'Generating tasks…',
  'Applying permissions…',
  'Workspace ready.',
];

function loadDraft(): WizardForm {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return { ...defaultForm, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaultForm;
}

// Smallest free 2026 Bill number ≥ 14 (015 already exists as the canonical Bill).
function nextRef(usedIds: string[]): { display: string; id: string; reference: string } {
  const used = new Set(usedIds.map((id) => {
    const m = id.match(/^NA-BILL-2026-(\d+)$/);
    return m ? Number(m[1]) : -1;
  }));
  let n = 14;
  while (used.has(n)) n += 1;
  const p = String(n).padStart(3, '0');
  return { display: `BILL-2026-${p}`, id: `NA-BILL-2026-${p}`, reference: `NA/BILL/2026/${p}` };
}

const priorityMap: Record<string, Priority> = { High: 'High', Normal: 'Medium', 'Urgent — Sitting Related': 'High' };
const confMap: Record<string, Confidentiality> = {
  Internal: 'Internal until publication', 'Internal — Restricted': 'Restricted',
  Confidential: 'Confidential', 'Public after creation': 'Public',
};

export function InstructionWizard() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const records = useDemoStore((s) => s.records);
  const addRecord = useDemoStore((s) => s.addRecord);
  const addTask = useDemoStore((s) => s.addTask);
  const addWorkItem = useDemoStore((s) => s.addWorkItem);
  const addStructuredDraft = useDemoStore((s) => s.addStructuredDraft);
  const currentRole = useDemoStore((s) => s.currentRole);
  const { showToast, ToastHost } = useToast();

  const [form, setForm] = useState<WizardForm>(loadDraft);
  const [sheet, setSheet] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [procStep, setProcStep] = useState(0);
  const [showErrors, setShowErrors] = useState(false);

  const stepId = params.get('step') && WIZARD_STEPS.some((s) => s.id === params.get('step')) ? params.get('step')! : 'instruction';
  const stepIndex = WIZARD_STEPS.findIndex((s) => s.id === stepId);
  const isLast = stepIndex === WIZARD_STEPS.length - 1;

  const generated = useMemo(() => nextRef(records.map((r) => r.id)), [records]);

  // Autosave draft on every change.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    setSaved(true);
    const t = window.setTimeout(() => setSaved(false), 2000);
    return () => window.clearTimeout(t);
  }, [form]);

  const set = (patch: Partial<WizardForm>) => setForm((f) => ({ ...f, ...patch }));
  const goStep = (id: string) => setParams((p) => { p.set('step', id); return p; });

  const step1Valid = form.title.trim().length > 0 && !!form.legislativeType && !!form.directorate;

  function next() {
    if (stepIndex === 0 && !step1Valid) { setShowErrors(true); return; }
    setShowErrors(false);
    if (!isLast) goStep(WIZARD_STEPS[stepIndex + 1].id);
  }
  function back() { if (stepIndex > 0) goStep(WIZARD_STEPS[stepIndex - 1].id); }

  function saveDraft() {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    setSaved(true);
    showToast('Draft saved. You can resume this instruction later.');
  }

  function close() {
    navigate('/work');
  }

  function create() {
    setProcessing(true);
    setProcStep(0);
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      if (i >= PROCESSING.length) {
        window.clearInterval(timer);
        commit();
        window.setTimeout(() => {
          localStorage.removeItem(DRAFT_KEY);
          navigate(`/legislative/${generated.id}/draft`);
        }, 500);
      } else {
        setProcStep(i);
      }
    }, 620);
  }

  function commit() {
    const now = new Date().toISOString();
    const restricted = form.confidentiality !== 'Internal' && form.confidentiality !== 'Public after creation';
    const record: LegislativeRecord = {
      id: generated.id,
      reference: generated.reference,
      title: form.title,
      shortTitle: form.title.replace(/,\s*20\d\d$/, ''),
      workflowType: (form.legislativeType as WorkflowType) || 'Bill',
      stage: 'Instruction Received',
      priority: priorityMap[form.priority] ?? 'Medium',
      confidentiality: confMap[form.confidentiality] ?? 'Restricted',
      directorate: form.directorate as Directorate,
      originatingOffice: form.originatingOffice,
      drafterId: form.drafterId,
      reviewerId: form.legalReviewerId,
      proceduralOfficerId: form.proceduralReviewerId,
      currentVersion: '0.1',
      currentVersionLabel: 'Instruction registered',
      dueDate: form.dueDate,
      createdDate: now.slice(0, 10),
      lastUpdated: now,
      year: 2026,
      restricted,
      publicParticipation: form.publicParticipation ? 'Anticipated' : 'Not applicable',
      submissionCount: 0,
      summary: form.description,
      recordSource: 'Structured',
      sponsor: form.sponsor,
    };
    addRecord(record);
    addStructuredDraft(createStructuredDraft(record, {
      language: form.language,
      supportingFiles: form.supportingFiles,
      financialDocs: form.financialDocs,
    }));

    initialTaskSeed.forEach((t, idx) => {
      const task: Task = {
        id: `task-${generated.id}-${idx}`,
        recordId: generated.id,
        title: t.title,
        assigneeId: t.assigneeId,
        dueDate: t.due,
        status: 'Open',
        stage: 'Instruction Received',
        dependency: t.title.includes('PBO') ? 'PBO assessment' : undefined,
      };
      addTask(task);
    });

    // Surface the new instruction in My Work.
    const wiConf: WorkItem['confidentiality'] =
      form.confidentiality === 'Confidential' ? 'Confidential'
        : form.confidentiality === 'Public after creation' ? 'Public'
          : form.confidentiality === 'Internal' ? 'Internal' : 'Restricted';
    const person = (id: string, roleLabel: string) => {
      const o = officers.find((x) => x.id === id);
      return { id, name: o?.name ?? '—', roleLabel, initials: o?.initials ?? '—' };
    };
    const workItem: WorkItem = {
      recordId: generated.id, title: form.title, reference: generated.reference, version: '0.1',
      type: (form.legislativeType as WorkflowType) || 'Bill',
      workState: 'in-progress', stage: 'Instruction Received', stageTone: 'grey',
      requiredAction: 'Begin drafting the Bill skeleton', myRole: 'Owner / Drafter',
      due: fmtDate(form.deadlines.drafting || form.dueDate), dueThisWeek: false,
      priority: priorityMap[form.priority] ?? 'Medium',
      lastActivity: 'Instruction registered just now', actionLabel: 'Open editor', actionTo: `/legislative/${generated.id}/draft`,
      confidentiality: wiConf, directorate: form.directorate.includes('Procedural') ? 'DLPS' : 'DLS',
      requiredActionLong: 'Draft the initial Bill skeleton and structure the clauses per the approved Standard Bill template.',
      previousStage: 'Instruction', currentStageSince: 'Just now', nextStage: 'Legal Review',
      currentTask: 'Draft initial Bill skeleton', progress: { done: 0, total: initialTaskSeed.length },
      blockingIssues: form.pboRequired ? [{ severity: 'warning', text: 'PBO assessment pending' }] : [],
      assignedPeople: [person(form.ownerId, 'Owner (You)'), person(form.legalReviewerId, 'Legal Reviewer'), person(form.proceduralReviewerId, 'Procedural Reviewer')],
      commentCount: 0, attachmentCount: form.supportingFiles.length,
    };
    addWorkItem(workItem);

    recordAudit({
      recordId: generated.id, actorId: currentRole ?? 'dls-drafter', actionType: 'Create',
      description: `Legislative instruction created: ${form.title} (${generated.reference}). Workflow instance, ${initialTaskSeed.length} initial tasks and access rules generated.`,
      newValue: generated.reference,
    });
    notify({
      category: 'Assignment', recipientId: form.drafterId as RoleId, recordId: generated.id,
      title: 'New drafting assignment',
      body: `You have been assigned as drafter for ${form.title} (${generated.reference}).`,
    });
    if (form.pboRequired) {
      recordAudit({
        recordId: generated.id, actorId: currentRole ?? 'dls-drafter', actionType: 'Workflow',
        description: 'PBO financial-impact assessment marked required (blocks Legal Review exit).',
      });
    }
  }

  return (
    <AppShell breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Legislative Instructions', to: '/work' }, { label: 'New Instruction' }]}>
      {/* Wizard header */}
      <div className={styles.wizHeader}>
        <div>
          <h1 className={styles.wizTitle}>New Legislative Instruction Wizard</h1>
          <p className={styles.wizSub}>Create a new legislative instruction and initiate its lifecycle.</p>
        </div>
        <div className={styles.wizHeaderActions}>
          {saved && <span className={styles.savedTag}><CircleCheck width={14} height={14} /> Saved</span>}
          <Button variant="secondary" leftIcon={<Save width={16} height={16} />} onClick={saveDraft}>Save as Draft</Button>
          <button className={styles.closeBtn} onClick={close} aria-label="Close wizard"><X width={20} height={20} /></button>
        </div>
      </div>

      {/* Stepper */}
      <ol className={styles.stepper} aria-label="Wizard progress">
        {WIZARD_STEPS.map((s, i) => {
          const done = i < stepIndex;
          const current = i === stepIndex;
          return (
            <li key={s.id} className={styles.stepItem}>
              <button
                className={`${styles.stepBtn} ${current ? styles.stepCurrent : ''} ${done ? styles.stepDone : ''}`}
                onClick={() => goStep(s.id)}
                aria-current={current ? 'step' : undefined}
              >
                <span className={styles.stepNum}>{done ? <Check width={14} height={14} /> : i + 1}</span>
                <span className={styles.stepLabel}>{s.label}</span>
              </button>
              {i < WIZARD_STEPS.length - 1 && <span className={styles.stepDivider} aria-hidden />}
            </li>
          );
        })}
      </ol>

      {showErrors && !step1Valid && (
        <div className={styles.errorSummary} role="alert">
          <Info width={16} height={16} /> Please provide a title, legislative type and directorate before continuing.
        </div>
      )}

      {/* Step content */}
      <div className={styles.stepBody}>
        {stepId === 'instruction' && <StepInstruction form={form} set={set} />}
        {stepId === 'template' && <StepTemplate form={form} set={set} openSheet={setSheet} />}
        {stepId === 'supporting' && <StepSupporting form={form} set={set} openSheet={setSheet} />}
        {stepId === 'assignment' && <StepAssignment form={form} set={set} openSheet={setSheet} />}
        {stepId === 'review' && <StepReview form={form} generatedRef={generated.display} openSheet={setSheet} />}
      </div>

      {/* Sticky footer */}
      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          {stepIndex > 0 && <Button variant="secondary" leftIcon={<ArrowLeft width={16} height={16} />} onClick={back}>Back</Button>}
        </div>
        <div className={styles.footerRight}>
          {isLast && <span className={styles.footerInfo}><Info width={15} height={15} /> Creating the workspace will generate the canonical record, initial tasks and access rules.</span>}
          <Button variant="ghost" leftIcon={<Save width={16} height={16} />} onClick={saveDraft}>Save Draft</Button>
          {isLast ? (
            <Button variant="primary" leftIcon={<Rocket width={16} height={16} />} onClick={create} disabled={processing}>Create Workspace</Button>
          ) : (
            <Button variant="primary" rightIcon={<ArrowRight width={16} height={16} />} onClick={next}>Save & Continue</Button>
          )}
        </div>
      </div>

      <WizardSheets open={sheet} form={form} set={set} onClose={() => setSheet(null)} onToast={showToast} />

      {processing && (
        <div className={styles.processOverlay} role="status" aria-live="polite">
          <div className={styles.processCard}>
            <Loader2 width={26} height={26} className={styles.spin} aria-hidden />
            <p className={styles.processTitle}>Creating workspace</p>
            <ul className={styles.processList}>
              {PROCESSING.map((p, i) => (
                <li key={p} className={i < procStep ? styles.pDone : i === procStep ? styles.pCurrent : ''}>
                  <span aria-hidden>{i < procStep ? <Check width={14} height={14} /> : '•'}</span> {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <ToastHost />
    </AppShell>
  );
}
