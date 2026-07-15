import { useNavigate } from 'react-router-dom';
import { Check, CircleDot, RotateCcw, CircleAlert, CircleDashed, Calendar, UserRound, Info, ExternalLink } from 'lucide-react';
import { SideSheet, Button, StatusBadge, Avatar } from '@/components/ui';
import { workflowSheet, type ChecklistStatus, type StageState } from '@/data/billWorkspace';
import styles from './WorkflowSheet.module.css';

export function WorkflowSheet({ open, onClose, recordId }: { open: boolean; onClose: () => void; recordId: string }) {
  const navigate = useNavigate();
  const w = workflowSheet;
  return (
    <SideSheet
      open={open}
      onClose={onClose}
      size="xl"
      title="Workflow and Approvals"
      footer={
        <div className={styles.footer}>
          <Button variant="secondary" onClick={() => { onClose(); navigate(`/legislative/${recordId}/workflow`); }} leftIcon={<ExternalLink width={15} height={15} />}>View Full Workflow</Button>
          <Button variant="primary" to={`/legislative/${recordId}/draft?mode=revision`} onClick={onClose}>Continue Revision</Button>
        </div>
      }
    >
      <section className={styles.section}>
        <p className={styles.label}>Current stage</p>
        <StatusBadge tone="red" icon={<RotateCcw width={12} height={12} />}>{w.currentStage}</StatusBadge>
        <p className={styles.meta}><Calendar width={13} height={13} /> {w.entered}</p>
        <p className={styles.meta}><UserRound width={13} height={13} /> Stage owner: {w.stageOwner}</p>
      </section>

      <section className={styles.section}>
        <p className={styles.label}>Stage checklist</p>
        <ul className={styles.checklist}>
          {w.checklist.map((c) => (
            <li key={c.label} className={styles['ck_' + c.status]}>{ckIcon(c.status)} {c.label}</li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <p className={styles.label}>Stage history</p>
        <ol className={styles.history}>
          {w.stageHistory.map((h) => (
            <li key={h.label} className={styles['st_' + h.state]}>
              <span className={styles.histDot}>{histIcon(h.state)}</span>
              <span className={styles.histText}><span className={styles.histLabel}>{h.label}</span><span className={styles.histDate}>{h.date}</span></span>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section}>
        <p className={styles.label}>Approval history</p>
        {w.approvalHistory.map((a) => (
          <div key={a.at} className={styles.approval}>
            <Avatar initials="DO" name={a.by} size={34} tone="neutral" />
            <div>
              <p className={styles.apprName}>{a.by} <span className={styles.apprRole}>({a.role})</span></p>
              <p className={styles.apprDecision}><RotateCcw width={12} height={12} /> {a.decision}</p>
              <p className={styles.apprMeta}>{a.at} · Version {a.version}</p>
            </div>
          </div>
        ))}
        <button className={styles.link}>View full approval history <ExternalLink width={13} height={13} /></button>
      </section>

      <div className={styles.permission}>
        <Info width={16} height={16} /> {w.permissionMessage}
      </div>
    </SideSheet>
  );
}

const ckIcon = (s: ChecklistStatus) =>
  s === 'completed' ? <Check width={15} height={15} /> : s === 'blocked' ? <CircleAlert width={15} height={15} /> : s === 'in-progress' ? <CircleDot width={15} height={15} /> : <CircleDashed width={15} height={15} />;
const histIcon = (s: StageState) =>
  s === 'completed' ? <Check width={13} height={13} /> : s === 'returned' ? <RotateCcw width={13} height={13} /> : s === 'current' ? <CircleDot width={13} height={13} /> : <CircleDashed width={13} height={13} />;
