import { useMemo, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle2, CircleDot, CircleSlash, CircleDashed, ChevronDown, TriangleAlert,
  ExternalLink, GitBranch, FileText, Dot,
} from 'lucide-react';
import { AppShell, type Crumb } from '@/components/shell';
import { Button, StatusBadge, Avatar } from '@/components/ui';
import { useDemoStore } from '@/store/demoStore';
import { useToast } from '@/features/search/Toast';
import { paths } from '@/routes/paths';
import { TASKS_RECORD_ID, type BillTask } from '@/data/billTasks';
import { BillControlHeader, officerName, officerInitials, TaskStatusPill } from './taskShared';
import { TaskDetailSheet, AddTaskSheet } from './taskSheets';
import styles from './BillTasksControl.module.css';

const PAGE_TABS = ['Tasks', 'Stage Details', 'Documents', 'Comments', 'History'];
const GROUPS: Array<{ id: BillTask['group']; title: string }> = [
  { id: 'current', title: 'Current Stage Tasks' },
  { id: 'dependent', title: 'Dependent Tasks' },
  { id: 'completed', title: 'Completed Tasks' },
];

export function BillTasksControl() {
  const { id = TASKS_RECORD_ID } = useParams();
  const [params, setParams] = useSearchParams();
  const record = useDemoStore((s) => s.records.find((r) => r.id === id));
  const tasks = useDemoStore((s) => s.billTasks);
  const stageGates = useDemoStore((s) => s.stageGates);
  const currentStageId = useDemoStore((s) => s.currentStageId);
  const roleId = useDemoStore((s) => s.currentRole);
  const { showToast, ToastHost } = useToast();

  const [pageTab, setPageTab] = useState('Tasks');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const stage = stageGates.find((g) => g.id === currentStageId) ?? stageGates[2];
  const openTaskId = params.get('task');
  const openTask = tasks.find((t) => t.id === openTaskId) ?? null;
  const sheet = params.get('sheet');
  const setParam = (k: string, v: string | null) => setParams((p) => { if (v === null) p.delete(k); else p.set(k, v); return p; });

  const counts = useMemo(() => ({
    completed: tasks.filter((t) => t.status === 'Completed').length,
    inProgress: tasks.filter((t) => t.status === 'In Progress').length,
    blocked: tasks.filter((t) => t.status === 'Blocked').length,
    pending: tasks.filter((t) => t.status === 'Pending').length,
  }), [tasks]);

  const overdueBlocking = tasks.find((t) => t.overdue && t.blocksStage);

  if (!record) {
    return <AppShell breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Tasks' }]}><div className={styles.notFound}><h1>Record not found</h1><Button to={paths.dashboard} variant="primary">Back to Command Centre</Button></div></AppShell>;
  }

  const breadcrumb: Crumb[] = [
    { label: 'Home', to: '/dashboard' }, { label: 'Legislation', to: '/work' },
    { label: 'Bills', to: '/work?type=Bill' }, { label: record.reference, to: paths.record(record.id) }, { label: 'Tasks' },
  ];

  return (
    <AppShell breadcrumb={breadcrumb}>
      <BillControlHeader
        record={record} roleId={roleId} stageName={stage.name} stageOwner={stage.owner} stageDue="24 Jul 2026 (9 days)"
        addTask={() => setParam('sheet', 'add-task')}
        moreMenu={<><Link className={styles.menuItem} to={paths.recordWorkflow(record.id)}><GitBranch width={15} height={15} /> Open workflow</Link><Link className={styles.menuItem} to={paths.record(record.id)}><ExternalLink width={15} height={15} /> Bill workspace</Link></>}
      />

      {overdueBlocking && (
        <div className={styles.sittingAlert} role="alert">
          <TriangleAlert width={18} height={18} aria-hidden />
          <div>
            <strong>Sitting-day impact:</strong> {overdueBlocking.title} is overdue and delaying completion of Legal Review.
            <div className={styles.sittingSub}>If unresolved, the Bill may miss the procedural submission window for the next sitting day (24 Jul 2026).</div>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setParam('task', overdueBlocking.id)}>Open task</Button>
        </div>
      )}

      <div className={styles.summary}>
        <SummaryCard tone="green" icon={<CheckCircle2 width={20} height={20} />} value={counts.completed} label="Completed" sub="Done" />
        <SummaryCard tone="gold" icon={<CircleDot width={20} height={20} />} value={counts.inProgress} label="In Progress" sub="Active tasks" />
        <SummaryCard tone="red" icon={<CircleSlash width={20} height={20} />} value={counts.blocked} label="Blocked" sub="Waiting on dependency" />
        <SummaryCard tone="grey" icon={<CircleDashed width={20} height={20} />} value={counts.pending} label="Pending" sub="Not yet started" />
      </div>

      <div className={styles.tabBar} role="tablist" aria-label="Bill detail">
        {PAGE_TABS.map((t) => (
          <button key={t} role="tab" aria-selected={pageTab === t} className={`${styles.tab} ${pageTab === t ? styles.tabActive : ''}`} onClick={() => setPageTab(t)}>{t}</button>
        ))}
      </div>

      {pageTab === 'Tasks' && (
        <div className={styles.taskGroups}>
          {GROUPS.map((grp) => {
            const items = tasks.filter((t) => t.group === grp.id);
            if (!items.length) return null;
            const isCollapsed = collapsed[grp.id];
            return (
              <section key={grp.id} className={styles.group}>
                <button className={styles.groupHead} onClick={() => setCollapsed((c) => ({ ...c, [grp.id]: !c[grp.id] }))} aria-expanded={!isCollapsed}>
                  <ChevronDown width={16} height={16} className={`${styles.groupChevron} ${isCollapsed ? styles.groupChevronCollapsed : ''}`} />
                  {grp.title} <span className={styles.groupCount}>{items.length}</span>
                </button>
                {!isCollapsed && (
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead><tr><th>Task</th><th>Status</th><th>Dependency</th><th>Assignee</th><th>Due Date</th><th>Priority</th><th>Related Clause / Document</th><th>Evidence</th></tr></thead>
                      <tbody>
                        {items.map((t) => (
                          <tr key={t.id} className={styles.row} onClick={() => setParam('task', t.id)} tabIndex={0} role="button" aria-label={`Open ${t.title}`}
                            onKeyDown={(e) => { if (e.key === 'Enter') setParam('task', t.id); }}>
                            <td className={styles.taskCell}>
                              {t.status === 'Completed' ? <CheckCircle2 width={15} height={15} className={styles.doneIcon} /> : <Dot width={20} height={20} className={styles.muted} />}
                              <span className={styles.taskTitle}>{t.title}</span>
                            </td>
                            <td><TaskStatusPill status={t.overdue ? 'Overdue' : t.status} /></td>
                            <td className={styles.muted}>{t.dependencyLabel ? (t.dependencyBlocking ? <span className={styles.depBlock}>{t.dependencyLabel}</span> : t.dependencyLabel) : '—'}</td>
                            <td className={styles.assigneeCell}>{t.assigneeId === 'system' ? <span className={styles.muted}>System</span> : <><Avatar initials={officerInitials(t.assigneeId)} name={officerName(t.assigneeId)} size={22} /> <span>{officerName(t.assigneeId)}</span></>}</td>
                            <td className={t.overdue ? styles.overdueText : styles.muted}>{t.dueLabel}</td>
                            <td><StatusBadge tone={t.priority === 'High' ? 'red' : t.priority === 'Medium' ? 'amber' : 'grey'} size="sm">{t.priority}</StatusBadge></td>
                            <td className={styles.muted}>{t.relatedClause ?? '—'}</td>
                            <td className={styles.muted}>{t.evidence ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {pageTab === 'Stage Details' && (
        <div className={styles.stageDetailsTab}>
          <p className={styles.tabIntro}>Legal Review stage requirements, mandatory tasks and blocking dependencies are enforced on the workflow screen.</p>
          <div className={styles.gateMiniGrid}>
            <MiniGate title="Exit Requirements" items={stage.exit.map((e) => e.label)} />
            <MiniGate title="Mandatory Tasks" items={stage.mandatory.map((m) => `${m.label} (${m.done}/${m.total})`)} />
            <MiniGate title="Blocking Dependencies" items={stage.blocking.length ? stage.blocking.map((b) => `${b.label} — ${b.status}`) : ['None']} />
          </div>
          <Button variant="primary" to={paths.recordWorkflow(record.id)} leftIcon={<GitBranch width={16} height={16} />}>Open workflow &amp; stage gates</Button>
        </div>
      )}

      {(pageTab === 'Documents' || pageTab === 'Comments' || pageTab === 'History') && (
        <div className={styles.lightTab}>
          <FileText width={22} height={22} className={styles.muted} />
          <p>{pageTab} for this Bill are available in the Bill workspace.</p>
          <Link to={paths.record(record.id)} className={styles.linkText}>Open Bill workspace <ExternalLink width={13} height={13} /></Link>
        </div>
      )}

      {openTask && <TaskDetailSheet task={openTask} roleId={roleId} onClose={() => setParam('task', null)} onToast={showToast} />}
      {sheet === 'add-task' && <AddTaskSheet onClose={() => setParam('sheet', null)} onToast={showToast} />}
      <ToastHost />
    </AppShell>
  );
}

function SummaryCard({ tone, icon, value, label, sub }: { tone: 'green' | 'gold' | 'red' | 'grey'; icon: React.ReactNode; value: number; label: string; sub: string }) {
  const bg = { green: 'var(--soft-green)', gold: 'var(--soft-gold)', red: 'var(--soft-red)', grey: 'var(--soft-grey)' }[tone];
  const fg = { green: 'var(--on-green)', gold: 'var(--on-gold)', red: 'var(--on-red)', grey: 'var(--on-grey)' }[tone];
  return (
    <div className={styles.summaryCard}>
      <span className={styles.summaryIcon} style={{ background: bg, color: fg }} aria-hidden>{icon}</span>
      <div><div className={styles.summaryValue}>{value}</div><div className={styles.summaryLabel}>{label}</div><div className={styles.summarySub}>{sub}</div></div>
    </div>
  );
}

function MiniGate({ title, items }: { title: string; items: string[] }) {
  return (
    <div className={styles.miniGate}>
      <div className={styles.miniGateTitle}>{title}</div>
      <ul>{items.map((i, idx) => <li key={idx}>{i}</li>)}</ul>
    </div>
  );
}
