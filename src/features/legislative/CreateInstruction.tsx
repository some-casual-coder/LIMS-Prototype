import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, ArrowRight, Loader2, FileText } from 'lucide-react';
import { AppShell } from '@/components/shell';
import { Panel, Button } from '@/components/ui';
import styles from './CreateInstruction.module.css';

const STEPS = ['Instruction details', 'People & supporting material', 'Review & create'];

const PROCESSING = [
  'Registering legislative work',
  'Assigning permanent reference',
  'Creating document workspace',
  'Applying workflow',
  'Notifying assigned officers',
];

export function CreateInstruction() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [procStep, setProcStep] = useState(0);

  // Prefilled to mirror the sample record so the flow reads realistically.
  const [form, setForm] = useState({
    workflowType: 'Bill',
    title: 'Digital Public Services Bill, 2026',
    shortTitle: 'Digital Public Services Bill',
    instructionType: 'New Bill',
    sponsor: 'Parliamentary Legislative Proposal Unit',
    directorate: 'Directorate of Legal Services',
    priority: 'High',
    targetDate: '2026-07-24',
    confidentiality: 'Internal until publication',
    description: 'Establish principles and standards for digital public services, safeguards for assisted and non-digital access, and protections for vulnerable users.',
    drafter: 'Grace Wanjiku',
    reviewer: 'David Otieno',
    ppAnticipated: true,
    pboRequired: false,
  });

  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  function create() {
    setProcessing(true);
    setProcStep(0);
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      if (i >= PROCESSING.length) {
        window.clearInterval(timer);
        window.setTimeout(() => navigate('/legislative/NA-BILL-2026-015'), 500);
      } else {
        setProcStep(i);
      }
    }, 650);
  }

  return (
    <AppShell breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Legislative Work', to: '/work' }, { label: 'New Instruction' }]}>
      <div className={styles.head}>
        <h1 className={styles.title}>Create Legislative Instruction</h1>
        <p className={styles.subtitle}>Register a new legislative item and create its permanent workspace.</p>
      </div>

      <ol className={styles.stepper} aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} className={`${styles.step} ${i === step ? styles.stepCurrent : ''} ${i < step ? styles.stepDone : ''}`} aria-current={i === step ? 'step' : undefined}>
            <span className={styles.stepNum} aria-hidden>{i < step ? <Check width={14} height={14} /> : i + 1}</span>
            <span className={styles.stepLabel}>{s}</span>
          </li>
        ))}
      </ol>

      <Panel padded>
        {step === 0 && (
          <div className={styles.form}>
            <div className={styles.row}>
              <Field label="Workflow type">
                <select value={form.workflowType} onChange={(e) => set('workflowType', e.target.value)} className={styles.input}>
                  {['Bill', 'Motion', 'Petition', 'Statement', 'Statutory Instrument'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Instruction type">
                <select value={form.instructionType} onChange={(e) => set('instructionType', e.target.value)} className={styles.input}>
                  {['New Bill', 'Amendment Bill', 'Revision of existing draft'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Title">
              <input className={styles.input} value={form.title} onChange={(e) => set('title', e.target.value)} />
            </Field>
            <Field label="Short title">
              <input className={styles.input} value={form.shortTitle} onChange={(e) => set('shortTitle', e.target.value)} />
            </Field>
            <div className={styles.row}>
              <Field label="Sponsor / originating office">
                <input className={styles.input} value={form.sponsor} onChange={(e) => set('sponsor', e.target.value)} />
              </Field>
              <Field label="Responsible directorate">
                <select value={form.directorate} onChange={(e) => set('directorate', e.target.value)} className={styles.input}>
                  <option>Directorate of Legal Services</option>
                  <option>Directorate of Legislative and Procedural Services</option>
                </select>
              </Field>
            </div>
            <div className={styles.row}>
              <Field label="Priority">
                <select value={form.priority} onChange={(e) => set('priority', e.target.value)} className={styles.input}>
                  {['High', 'Medium', 'Low'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Target completion date">
                <input type="date" className={styles.input} value={form.targetDate} onChange={(e) => set('targetDate', e.target.value)} />
              </Field>
              <Field label="Confidentiality">
                <select value={form.confidentiality} onChange={(e) => set('confidentiality', e.target.value)} className={styles.input}>
                  <option>Internal until publication</option>
                  <option>Restricted</option>
                  <option>Public</option>
                </select>
              </Field>
            </div>
            <Field label="Drafting instructions">
              <textarea className={styles.textarea} rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className={styles.form}>
            <div className={styles.row}>
              <Field label="Assigned drafter"><input className={styles.input} value={form.drafter} onChange={(e) => set('drafter', e.target.value)} /></Field>
              <Field label="Reviewer"><input className={styles.input} value={form.reviewer} onChange={(e) => set('reviewer', e.target.value)} /></Field>
            </div>
            <Field label="Supporting documents">
              <div className={styles.upload}>
                <FileText width={18} height={18} aria-hidden />
                <span>policy-brief.pdf · impact-assessment.pdf</span>
              </div>
            </Field>
            <label className={styles.toggle}>
              <input type="checkbox" checked={form.ppAnticipated} onChange={(e) => set('ppAnticipated', e.target.checked)} />
              Public participation anticipated
            </label>
            <label className={styles.toggle}>
              <input type="checkbox" checked={form.pboRequired} onChange={(e) => set('pboRequired', e.target.checked)} />
              Parliamentary Budget Office review required
            </label>
          </div>
        )}

        {step === 2 && (
          <div className={styles.review}>
            <div className={styles.refPreview}>
              <span className={styles.refLabel}>Generated reference</span>
              <span className={styles.refValue}>NA/BILL/2026/015</span>
            </div>
            <dl className={styles.summary}>
              <div><dt>Title</dt><dd>{form.title}</dd></div>
              <div><dt>Type</dt><dd>{form.workflowType} · {form.instructionType}</dd></div>
              <div><dt>Directorate</dt><dd>{form.directorate}</dd></div>
              <div><dt>Priority</dt><dd>{form.priority}</dd></div>
              <div><dt>Target date</dt><dd>{form.targetDate}</dd></div>
              <div><dt>Confidentiality</dt><dd>{form.confidentiality}</dd></div>
              <div><dt>Drafter</dt><dd>{form.drafter}</dd></div>
              <div><dt>Reviewer</dt><dd>{form.reviewer}</dd></div>
            </dl>
            <div className={styles.initialTasks}>
              <p className={styles.initialTitle}>Initial workflow & tasks</p>
              <ul>
                <li>Workspace created and permanent reference assigned</li>
                <li>Drafting task assigned to {form.drafter}</li>
                <li>Review task prepared for {form.reviewer}</li>
              </ul>
            </div>
          </div>
        )}

        <div className={styles.actions}>
          {step > 0 && !processing && (
            <Button variant="secondary" onClick={() => setStep((s) => s - 1)} leftIcon={<ArrowLeft width={16} height={16} />}>Back</Button>
          )}
          <div className={styles.actionsRight}>
            {step < 2 && (
              <Button variant="primary" onClick={() => setStep((s) => s + 1)} rightIcon={<ArrowRight width={16} height={16} />}>Continue</Button>
            )}
            {step === 2 && (
              <Button variant="primary" onClick={create} disabled={processing} leftIcon={processing ? <Loader2 width={16} height={16} className={styles.spin} /> : <Check width={16} height={16} />}>
                {processing ? 'Creating…' : 'Create instruction'}
              </Button>
            )}
          </div>
        </div>
      </Panel>

      {processing && (
        <div className={styles.processOverlay} role="status" aria-live="polite">
          <div className={styles.processCard}>
            <Loader2 width={26} height={26} className={styles.spin} aria-hidden />
            <p className={styles.processTitle}>Creating legislative work</p>
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
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}
