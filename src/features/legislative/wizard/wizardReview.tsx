import {
  FileText, GitBranch, LayoutTemplate, ShieldCheck, Scale, ExternalLink,
  User as UserIcon, CheckCircle2, Clock, Users, CalendarClock,
} from 'lucide-react';
import { useDemoStore } from '@/store/demoStore';
import { officers } from '@/data/personas';
import { Avatar, StatusBadge } from '@/components/ui';
import { StageIcon } from '@/features/workflows/workflowShared';
import { billTemplates, initialTaskSeed, PERMISSION_ROWS, fmtDate, type WizardForm } from './wizardData';
import styles from './InstructionWizard.module.css';

const officerName = (id: string) => officers.find((o) => o.id === id)?.name ?? '—';
const officerInitials = (id: string) => officers.find((o) => o.id === id)?.initials ?? '—';

const SHEET_BUTTONS = [
  { id: 'template-preview', label: 'Template Preview', icon: LayoutTemplate },
  { id: 'add-related', label: 'Add Related Record', icon: GitBranch },
  { id: 'select-staff', label: 'Select Staff', icon: Users },
  { id: 'deadlines', label: 'Configure Stage Deadlines', icon: CalendarClock },
  { id: 'pbo', label: 'PBO Requirement Details', icon: Scale },
];

export function StepReview({ form, generatedRef, openSheet }: {
  form: WizardForm; generatedRef: string; openSheet: (name: string) => void;
}) {
  const bills = useDemoStore((s) => s.workflowTemplates.find((w) => w.slug === 'bills'));
  const template = billTemplates.find((t) => t.id === form.templateId);
  const stages = bills?.stages ?? [];

  return (
    <div className={styles.reviewWrap}>
      {/* Top summary cards */}
      <div className={styles.reviewTop}>
        <div className={styles.reviewCard}>
          <div className={styles.reviewCardHead}><FileText width={17} height={17} /> Generated Reference</div>
          <div className={styles.generatedRef}>{generatedRef}</div>
          <p className={styles.reviewNote}>Reference will be assigned once the workspace is created.</p>
        </div>

        <div className={styles.reviewCard}>
          <div className={styles.reviewCardHead}><GitBranch width={17} height={17} /> Workflow Summary</div>
          <div className={styles.reviewWf}>Bills Workflow — Full Lifecycle (DLS)</div>
          <ol className={styles.reviewStages}>
            {stages.map((s) => (
              <li key={s.id} className={styles.reviewStage}>
                <span className={styles.reviewStageIcon} aria-hidden><StageIcon name={s.icon} width={14} height={14} /></span>
                <span className={styles.reviewStageLabel}>{s.name}</span>
              </li>
            ))}
          </ol>
          <p className={styles.reviewNote}>Total stages: {stages.length}</p>
        </div>

        <div className={styles.reviewCard}>
          <div className={styles.reviewCardHead}><LayoutTemplate width={17} height={17} /> Template</div>
          <div className={styles.reviewTplName}>{template?.name} <span className={styles.tplVersion}>{template?.version}</span></div>
          <dl className={styles.reviewMini}>
            <div><dt>Language</dt><dd>{form.language}</dd></div>
            <div><dt>Numbering Rules</dt><dd>{form.numberingRules}</dd></div>
          </dl>
        </div>
      </div>

      {/* Middle: tasks / permissions / PBO */}
      <div className={styles.reviewMid}>
        <div className={styles.reviewPanel}>
          <div className={styles.reviewPanelHead}>Initial Tasks</div>
          <ul className={styles.taskList}>
            {initialTaskSeed.map((t) => (
              <li key={t.title} className={styles.taskRow}>
                <span className={styles.taskName}><CheckCircle2 width={14} height={14} className={styles.muted} /> {t.title}</span>
                <span className={styles.taskRight}>
                  <span className={styles.taskAssignee}><Avatar initials={officerInitials(t.assigneeId)} name={officerName(t.assigneeId)} size={22} /> {officerName(t.assigneeId)}</span>
                  <span className={styles.taskDue}><Clock width={13} height={13} /> {t.dueLabel}</span>
                  <StatusBadge tone="gold" size="sm">Pending</StatusBadge>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.reviewPanel}>
          <div className={styles.reviewPanelHead}><ShieldCheck width={16} height={16} /> Permissions & Access</div>
          <ul className={styles.permList}>
            {PERMISSION_ROWS.map((p) => (
              <li key={p.role}><UserIcon width={14} height={14} className={styles.muted} /><span className={styles.permRole}>{p.role}</span><span className={styles.permRight}>{p.right}</span></li>
            ))}
            <li className={styles.permRestricted}>
              <ShieldCheck width={14} height={14} className={styles.muted} /><span className={styles.permRole}>Restricted access</span>
              <StatusBadge tone="grey" size="sm">{form.confidentiality}</StatusBadge>
            </li>
          </ul>
        </div>

        <div className={styles.reviewPanel}>
          <div className={styles.reviewPanelHead}><Scale width={16} height={16} /> PBO Requirement</div>
          {form.pboRequired ? (
            <div className={styles.pboCard}>
              <div className={styles.pboCardHead}><CheckCircle2 width={16} height={16} className={styles.pboCheck} /> PBO Assessment Required</div>
              <div className={styles.pboStatus}>Status <StatusBadge tone="gold" size="sm">Pending request</StatusBadge></div>
              <button className={styles.linkBtn} onClick={() => openSheet('pbo')}>View details <ExternalLink width={12} height={12} /></button>
            </div>
          ) : (
            <p className={styles.reviewNote}>No PBO assessment is required for this instruction.</p>
          )}
        </div>
      </div>

      {/* Supporting side sheets */}
      <div className={styles.reviewSheets}>
        <div className={styles.reviewSubTitle}>Supporting Side Sheets</div>
        <div className={styles.sheetButtons}>
          {SHEET_BUTTONS.map((b) => (
            <button key={b.id} className={styles.sheetButton} onClick={() => openSheet(b.id)}>
              <b.icon width={16} height={16} /> {b.label} <ExternalLink width={13} height={13} className={styles.sheetBtnExt} />
            </button>
          ))}
        </div>
      </div>

      {/* Review summary */}
      <div className={styles.reviewPanel}>
        <div className={styles.reviewPanelHead}>Review Summary</div>
        <dl className={styles.summaryGrid}>
          <div><dt>Title</dt><dd>{form.title}</dd></div>
          <div><dt>Legislative Type</dt><dd>{form.legislativeType}</dd></div>
          <div><dt>Originating Office</dt><dd>{form.originatingOffice}</dd></div>
          <div><dt>Sponsor</dt><dd>{form.sponsor}</dd></div>
          <div><dt>Directorate</dt><dd>{form.directorate}</dd></div>
          <div><dt>Priority</dt><dd>{form.priority}</dd></div>
          <div><dt>Due Date</dt><dd>{fmtDate(form.dueDate)}</dd></div>
          <div><dt>Public Participation</dt><dd>{form.publicParticipation ? 'Yes' : 'No'}</dd></div>
          <div><dt>Related Legislation</dt><dd>{form.relatedLegislation.length}</dd></div>
          <div><dt>Supporting Files</dt><dd>{form.supportingFiles.length}</dd></div>
        </dl>
      </div>
    </div>
  );
}
