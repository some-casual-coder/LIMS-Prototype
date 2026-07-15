import { useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  Check, ArrowRight, Scale, GitBranch, Clock3, Building2, CircleCheck,
  ListChecks, ShieldCheck, LogIn, LogOut, TriangleAlert, ExternalLink, ClipboardList,
} from 'lucide-react';
import { AppShell, type Crumb } from '@/components/shell';
import { Button, StatusBadge, SideSheet } from '@/components/ui';
import { useDemoStore } from '@/store/demoStore';
import { recordAudit, notify } from '@/mocks/mockApi';
import { useToast } from '@/features/search/Toast';
import { paths } from '@/routes/paths';
import { StageIcon } from '@/features/workflows/workflowShared';
import { TASKS_RECORD_ID, PBO_TASK_ID, type StageGate } from '@/data/billTasks';
import { BillControlHeader, ReqStatusPill, officerName } from './taskShared';
import { PboAssessmentSheet } from '../pbo/PboAssessmentSheet';
import styles from './BillWorkflowControl.module.css';

export function BillWorkflowControl() {
  const { id = TASKS_RECORD_ID } = useParams();
  const [params, setParams] = useSearchParams();
  const record = useDemoStore((s) => s.records.find((r) => r.id === id));
  const stageGates = useDemoStore((s) => s.stageGates);
  const currentStageId = useDemoStore((s) => s.currentStageId);
  const roleId = useDemoStore((s) => s.currentRole);
  const advanceBillStage = useDemoStore((s) => s.advanceBillStage);
  const { showToast, ToastHost } = useToast();

  const stage = stageGates.find((g) => g.id === currentStageId) ?? stageGates[2];
  const currentIndex = stageGates.findIndex((g) => g.id === currentStageId);
  const nextStage = stageGates[currentIndex + 1];
  // Advance only when nothing is blocked, no blocking dependency remains, and the
  // stage has actually progressed (at least one exit requirement met or under way).
  const canAdvance = useMemo(
    () => stage.exit.every((e) => e.status !== 'Blocked')
      && stage.blocking.length === 0
      && stage.exit.some((e) => e.status === 'Met' || e.status === 'In Progress'),
    [stage],
  );
  const sheetOpen = params.get('sheet') === 'stage-requirements';
  const pboSheetOpen = params.get('sheet') === 'pbo-assessment';
  const setParam = (k: string, v: string | null) => setParams((p) => { if (v === null) p.delete(k); else p.set(k, v); return p; });
  const openPbo = () => setParam('sheet', 'pbo-assessment');

  function advance() {
    if (!canAdvance || !nextStage) return;
    advanceBillStage();
    recordAudit({ recordId: TASKS_RECORD_ID, actorId: (roleId as string) ?? 'dls-reviewer', actionType: 'Stage Change', description: `Workflow advanced from ${stage.name} to ${nextStage.name}.`, previousValue: stage.name, newValue: nextStage.name });
    notify({ category: 'Approval', recipientId: 'dlps-officer', recordId: TASKS_RECORD_ID, title: 'Procedural review assigned', body: `${record?.title ?? 'The Bill'} has advanced to ${nextStage.name}.` });
    showToast(`Advanced to ${nextStage.name}.`);
    setParam('sheet', null);
  }

  if (!record) {
    return <AppShell breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Workflow' }]}><div className={styles.notFound}><h1>Record not found</h1><Button to={paths.dashboard} variant="primary">Back to Command Centre</Button></div></AppShell>;
  }

  const breadcrumb: Crumb[] = [
    { label: 'Home', to: '/dashboard' }, { label: 'Legislation', to: '/work' },
    { label: 'Bills', to: '/work?type=Bill' }, { label: record.reference, to: paths.record(record.id) }, { label: 'Workflow' },
  ];

  return (
    <AppShell breadcrumb={breadcrumb}>
      <BillControlHeader
        record={record} roleId={roleId} stageName={stage.name} stageOwner={stage.owner} stageDue="24 Jul 2026 (9 days)"
        moreMenu={<><Link className={styles.menuItem} to={paths.recordTasks(record.id)}><ClipboardList width={15} height={15} /> Open tasks</Link><Link className={styles.menuItem} to={paths.record(record.id)}><ExternalLink width={15} height={15} /> Bill workspace</Link></>}
      />

      {/* Stage map */}
      <section className={styles.panel}>
        <ol className={styles.stageMap}>
          {stageGates.map((g, i) => {
            const isCurrent = g.id === currentStageId;
            const done = g.state === 'Completed';
            return (
              <li key={g.id} className={styles.stageItem}>
                <div className={`${styles.stageCard} ${isCurrent ? styles.stageCurrent : ''}`}>
                  <span className={`${styles.stageBadge} ${done ? styles.stageBadgeDone : isCurrent ? styles.stageBadgeCurrent : styles.stageBadgePending}`} aria-hidden>
                    {done ? <Check width={16} height={16} /> : <StageIcon name={g.icon} width={16} height={16} />}
                  </span>
                  <span className={styles.stageName}>{g.name}</span>
                  <span className={styles.stageState}>{g.state === 'In Progress' ? 'In Progress' : g.dateLabel ?? g.state}</span>
                </div>
                {i < stageGates.length - 1 && <ArrowRight width={16} height={16} className={styles.stageArrow} aria-hidden />}
              </li>
            );
          })}
        </ol>
      </section>

      {/* Current-stage summary */}
      <div className={styles.summaryTiles}>
        <SumTile icon={<Scale width={17} height={17} />} label="Current stage" value={stage.name} />
        <SumTile icon={<GitBranch width={17} height={17} />} label="Next stage" value={nextStage?.name ?? '—'} />
        <SumTile icon={<Clock3 width={17} height={17} />} label="Time in stage" value={currentStageId === 'legal-review' ? '4 working days' : '—'} />
        <SumTile icon={<Building2 width={17} height={17} />} label="Stage owner" value={stage.owner} />
      </div>

      {/* Stage detail cards */}
      <h2 className={styles.sectionTitle}>Stage Details — {stage.name}</h2>
      <div className={styles.gateGrid}>
        <ReqCard title="Entry Requirements" icon={<LogIn width={16} height={16} />} rows={stage.entry} />
        <ReqCard title="Exit Requirements" icon={<LogOut width={16} height={16} />} rows={stage.exit} />
        <MandatoryCard mandatory={stage.mandatory} />
        <ReqCard title="Approvals" icon={<ShieldCheck width={16} height={16} />} rows={stage.approvals} />
        <ReqCard title="Validation" icon={<CircleCheck width={16} height={16} />} rows={stage.validation} />
        <BlockingCard stage={stage} recordId={record.id} onOpenPbo={openPbo} />
      </div>

      {/* Advance bar */}
      <div className={styles.advanceBar}>
        <span className={styles.advanceNote}>
          {canAdvance
            ? 'All exit requirements are met and no blocking dependencies remain. This stage can be advanced.'
            : 'Advance to the next stage when all exit requirements are met and no blocking dependencies remain.'}
        </span>
        <div className={styles.advanceActions}>
          <Button variant="secondary" onClick={() => setParam('sheet', 'stage-requirements')}>Stage requirements</Button>
          <span title={canAdvance ? undefined : 'Resolve blocking dependencies and pending exit requirements first.'}>
            <Button variant="primary" disabled={!canAdvance} onClick={advance} rightIcon={<ArrowRight width={16} height={16} />}>Advance Stage</Button>
          </span>
        </div>
      </div>

      {sheetOpen && (
        <StageRequirementsSheet
          stage={stage} nextStageName={nextStage?.name ?? '—'} canAdvance={canAdvance}
          onOpenTask={() => setParam('sheet', null)}
          onAdvance={advance} onClose={() => setParam('sheet', null)}
          onOpenPbo={openPbo}
          recordId={record.id}
        />
      )}
      {pboSheetOpen && <PboAssessmentSheet onClose={() => setParam('sheet', null)} />}
      <ToastHost />
    </AppShell>
  );
}

function SumTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className={styles.sumTile}>
      <span className={styles.sumIcon} aria-hidden>{icon}</span>
      <div><div className={styles.sumLabel}>{label}</div><div className={styles.sumValue}>{value}</div></div>
    </div>
  );
}

function ReqCard({ title, icon, rows }: { title: string; icon: React.ReactNode; rows: StageGate['entry'] }) {
  return (
    <div className={styles.gateCard}>
      <div className={styles.gateCardHead}><span className={styles.gateCardTitle}>{icon} {title}</span><span className={styles.gateCol}>Status</span></div>
      <ul className={styles.reqList}>
        {rows.map((r, i) => (
          <li key={i}><span className={styles.reqLabel}>{r.label}</span><ReqStatusPill status={r.status} /></li>
        ))}
      </ul>
    </div>
  );
}

function MandatoryCard({ mandatory }: { mandatory: StageGate['mandatory'] }) {
  return (
    <div className={styles.gateCard}>
      <div className={styles.gateCardHead}><span className={styles.gateCardTitle}><ListChecks width={16} height={16} /> Mandatory Tasks</span><span className={styles.gateCol}>Progress</span></div>
      <ul className={styles.reqList}>
        {mandatory.map((m, i) => {
          const complete = m.done >= m.total;
          return (
            <li key={i}>
              <span className={styles.reqLabel}>{m.label}</span>
              <span className={`${styles.progressPill} ${complete ? styles.progressDone : m.done === 0 ? styles.progressNone : styles.progressPartial}`}>{m.done}/{m.total}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function BlockingCard({ stage, recordId, onOpenPbo }: { stage: StageGate; recordId: string; onOpenPbo: () => void }) {
  return (
    <div className={`${styles.gateCard} ${stage.blocking.length ? styles.gateCardBlocking : ''}`}>
      <div className={styles.gateCardHead}><span className={styles.gateCardTitle}><TriangleAlert width={16} height={16} /> Blocking Dependencies</span><span className={styles.gateCol}>Status</span></div>
      {stage.blocking.length ? (
        <ul className={styles.reqList}>
          {stage.blocking.map((b, i) => (
            <li key={i} className={styles.blockRow}>
              <div>
                <div className={styles.reqLabel}>{b.label}</div>
                <div className={styles.blockMeta}>Requested on {b.requestedOn} · Assigned to {officerName(b.assigneeId)}</div>
              </div>
              <StatusBadge tone="red" size="sm">Blocking</StatusBadge>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.noBlock}><CircleCheck width={15} height={15} /> No blocking dependencies remain.</p>
      )}
      {stage.blocking.length > 0 && (
        <div className={styles.blockLinks}>
          <button className={styles.openTaskLink} onClick={onOpenPbo}>Open PBO Assessment <ExternalLink width={12} height={12} /></button>
          <Link className={styles.openTaskLink} to={`${paths.recordTasks(recordId)}?task=${PBO_TASK_ID}`}>Open blocking task <ExternalLink width={12} height={12} /></Link>
        </div>
      )}
    </div>
  );
}

// ---- Stage Requirements side sheet ----------------------------------------
function StageRequirementsSheet({ stage, nextStageName, canAdvance, onAdvance, onClose, onOpenPbo, recordId }: {
  stage: StageGate; nextStageName: string; canAdvance: boolean; onOpenTask: () => void;
  onAdvance: () => void; onClose: () => void; onOpenPbo: () => void; recordId: string;
}) {
  return (
    <SideSheet open onClose={onClose} size="md" title="Stage Requirements"
      footer={
        <div className={styles.sheetFooter}>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <span title={canAdvance ? undefined : 'Resolve blocking dependencies first.'}>
            <Button variant="primary" disabled={!canAdvance} onClick={onAdvance}>Advance Stage</Button>
          </span>
        </div>
      }>
      <dl className={styles.sheetMeta}>
        <div><dt>Advance from</dt><dd>{stage.name}</dd></div>
        <div><dt>Next stage</dt><dd>{nextStageName}</dd></div>
        <div><dt>Stage owner</dt><dd>{stage.owner}</dd></div>
      </dl>

      <h4 className={styles.sheetH4}>Exit Requirements</h4>
      <ul className={styles.sheetReqList}>
        {stage.exit.map((e, i) => (
          <li key={i}>
            {e.status === 'Met' ? <CircleCheck width={16} height={16} className={styles.metIcon} /> : e.status === 'Blocked' ? <TriangleAlert width={16} height={16} className={styles.blockIcon} /> : <span className={styles.pendDot} />}
            <span>{e.label}</span>
            <ReqStatusPill status={e.status} />
          </li>
        ))}
      </ul>

      {stage.blocking.length > 0 && (
        <div className={styles.blockingDetail}>
          <div className={styles.blockingTitle}>Blocking Dependency</div>
          {stage.blocking.map((b, i) => (
            <div key={i} className={styles.blockingBody}>
              <div className={styles.blockingName}>{b.label}</div>
              <dl className={styles.blockingDl}>
                <div><dt>Requested on</dt><dd>{b.requestedOn}</dd></div>
                <div><dt>Assigned to</dt><dd>{officerName(b.assigneeId)}</dd></div>
                <div><dt>Due</dt><dd className={styles.overdueText}>{b.due} (Overdue by {b.overdueDays} days)</dd></div>
                <div><dt>Status</dt><dd>{b.status}</dd></div>
              </dl>
              <div className={styles.blockLinks}>
                <Button size="sm" variant="primary" onClick={onOpenPbo}>Open PBO Assessment</Button>
                <Button size="sm" variant="secondary" to={`${paths.recordTasks(recordId)}?task=${PBO_TASK_ID}`}>Open Task</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h4 className={styles.sheetH4}>Rules Snapshot</h4>
      <ul className={styles.rulesList}>
        <li>Stage cannot be advanced if any blocking dependency exists.</li>
        <li>All mandatory tasks must be completed.</li>
        <li>Valid approvals are required.</li>
      </ul>
    </SideSheet>
  );
}
