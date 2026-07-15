import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, CircleAlert, Eye, FileCheck2, FileClock, Files, Plus, Scale, Workflow } from 'lucide-react';
import { AppShell } from '@/components/shell';
import { Button, StatusBadge } from '@/components/ui';
import { useDemoStore } from '@/store/demoStore';
import { PRIMARY_RECORD_ID } from '@/data/seed';
import type { LegislativeRecord, WorkflowStage } from '@/data/types';
import { paths } from '@/routes/paths';
import styles from './BillsDashboard.module.css';

const ACTIVE_STAGES: WorkflowStage[] = [
  'Instruction Received', 'Intake and Assignment', 'Drafting', 'Legal Review',
  'Revision Requested', 'Legal Approval', 'Procedural Review', 'Awaiting Signature',
  'Signed and Sealed',
];

const STAGE_GROUPS = [
  { label: 'Drafting', short: 'DR', stages: ['Instruction Received', 'Intake and Assignment', 'Drafting', 'Revision Requested'] },
  { label: 'Legal review', short: 'LR', stages: ['Legal Review', 'Legal Approval'] },
  { label: 'Procedure', short: 'PR', stages: ['Procedural Review'] },
  { label: 'Signature', short: 'SG', stages: ['Awaiting Signature', 'Signed and Sealed'] },
  { label: 'Published', short: 'PB', stages: ['Published', 'Archived'] },
] as const;

const stageTone: Record<string, 'green' | 'amber' | 'red' | 'grey' | 'blue'> = {
  Drafting: 'blue', 'Legal Review': 'amber', 'Revision Requested': 'red',
  'Procedural Review': 'green', 'Awaiting Signature': 'amber',
  'Signed and Sealed': 'green', Published: 'green', Archived: 'grey',
};

const weeklySeries = {
  created: [2, 1, 3, 2, 4, 2, 3, 2, 4, 3, 2, 3],
  reviewed: [1, 2, 1, 3, 2, 2, 3, 2, 2, 3, 2, 3],
  completed: [0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1],
};
const WEEK_LABELS = ['28 Apr', '5 May', '12 May', '19 May', '26 May', '2 Jun', '9 Jun', '16 Jun', '23 Jun', '30 Jun', '7 Jul', '14 Jul'];
const STAGE_AGE = [
  { label: 'Drafting', days: 6.2 },
  { label: 'Legal review', days: 8.4 },
  { label: 'Procedural review', days: 3.1 },
  { label: 'Signature', days: 2.7 },
] as const;

function daysUntil(date: string) {
  const today = new Date('2026-07-15T00:00:00+03:00');
  return Math.ceil((new Date(`${date}T00:00:00+03:00`).getTime() - today.getTime()) / 86_400_000);
}

function recordAction(record: LegislativeRecord) {
  if (record.id === PRIMARY_RECORD_ID) return { label: 'Resolve review comments', to: paths.recordDraft(record.id) };
  if (record.stage === 'Awaiting Signature' || record.stage === 'Signed and Sealed') return { label: 'Open publication centre', to: paths.recordPublish(record.id) };
  if (record.stage === 'Legal Review') return { label: 'Open legal review', to: `${paths.record(record.id)}/review` };
  if (record.stage === 'Drafting') return { label: 'Continue structured draft', to: paths.recordDraft(record.id) };
  return { label: 'Open Bill workspace', to: paths.record(record.id) };
}

function points(values: number[], width = 720, height = 210) {
  const max = 5;
  return values.map((value, index) => `${36 + index * ((width - 56) / (values.length - 1))},${height - 20 - (value / max) * (height - 40)}`).join(' ');
}

export function BillsDashboard() {
  const records = useDemoStore((state) => state.records);
  const tasks = useDemoStore((state) => state.tasks);
  const bills = useMemo(
    () => records.filter((record) => record.workflowType === 'Bill').sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)),
    [records],
  );
  const active = bills.filter((bill) => ACTIVE_STAGES.includes(bill.stage));
  const awaitingReview = bills.filter((bill) => bill.stage === 'Legal Review' || bill.stage === 'Revision Requested');
  const dueSoon = active.filter((bill) => daysUntil(bill.dueDate) <= 7);
  const newInstructions = bills.filter((bill) => bill.createdDate >= '2026-06-15' && bill.createdDate <= '2026-07-15');
  const publishedThisYear = bills.filter((bill) => bill.year === 2026 && (bill.stage === 'Published' || bill.stage === 'Archived'));
  const urgent = active.filter((bill) => bill.priority === 'High' || daysUntil(bill.dueDate) <= 3).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4);
  const stageCounts = STAGE_GROUPS.map((group) => bills.filter((bill) => group.stages.some((stage) => stage === bill.stage)).length);
  const draftingEnd = (stageCounts[0] / bills.length) * 100;
  const reviewEnd = draftingEnd + (stageCounts[1] / bills.length) * 100;
  const signatureEnd = reviewEnd + (stageCounts[3] / bills.length) * 100;

  return (
    <AppShell breadcrumb={[{ label: 'Bills' }]}>
      <div className={styles.pageHeader}>
        <div><p className={styles.eyebrow}>Legislative portfolio</p><h1>Bills</h1></div>
        <Button variant="primary" size="lg" to={paths.legislativeNew} leftIcon={<Plus width={18} height={18} />}>New legislative instruction</Button>
      </div>

      <div className={styles.dashboardTop}>
        <section className={styles.metrics} aria-label="Bill portfolio summary">
          <Metric label="New Instructions" value={newInstructions.length} detail="Last 30 days" icon={<Files />} tone="green" />
          <Metric label="Legal Decisions" value={awaitingReview.length} detail="Currently pending" icon={<FileClock />} tone="gold" />
          <Metric label="Due in 7 Days" value={dueSoon.length} detail="By 22 July" icon={<CalendarClock />} tone="red" />
          <Metric label="Published" value={publishedThisYear.length} detail="During 2026" icon={<FileCheck2 />} tone="charcoal" />
        </section>

        <section className={styles.matrixPanel} aria-labelledby="matrix-heading">
          <div className={styles.sectionHead}>
            <div><p className={styles.sectionKicker}>Current portfolio</p><h2 id="matrix-heading">Bills by workflow stage</h2></div>
            <div className={styles.matrixLegend} aria-label="Colour intensity represents open workflow items per Bill, from one to five or more"><strong>Open items</strong><span>1</span><i /><i /><i /><i /><i /><span>5+</span></div>
          </div>
          <div className={styles.matrix} role="group" aria-label={`Bill workflow matrix. ${STAGE_GROUPS.map((group, index) => `${group.label}: ${stageCounts[index]}`).join(', ')}`}>
            {STAGE_GROUPS.map((group) => (
              <div key={group.label} className={styles.matrixRow}>
                <span>{group.label}</span>
                <div className={styles.matrixCells}>
                  {bills.slice(0, 12).map((bill) => {
                    const activeCell = group.stages.some((stage) => stage === bill.stage);
                    const openItems = Math.max(1, tasks.filter((task) => task.recordId === bill.id && task.status !== 'Completed').length);
                    return activeCell ? (
                      <Link
                        key={bill.id}
                        to={paths.record(bill.id)}
                        className={styles.matrixActive}
                        style={{ opacity: 0.48 + Math.min(openItems, 5) * 0.1 }}
                        data-tooltip={`${bill.reference.split('/').at(-1)} · ${openItems} open ${openItems === 1 ? 'item' : 'items'} · ${bill.stage}`}
                        aria-label={`${bill.title}: ${bill.stage}; ${openItems} open workflow ${openItems === 1 ? 'item' : 'items'}`}
                      />
                    ) : <i key={bill.id} aria-hidden />;
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.matrixAxis}>
            <span>Bill reference suffix</span>
            <div className={styles.matrixCodes} aria-hidden>{bills.slice(0, 12).map((bill) => <span key={bill.id}>{bill.reference.split('/').at(-1)}</span>)}</div>
          </div>
        </section>

        <section className={styles.actionPanel} aria-labelledby="attention-heading">
          <div className={styles.sectionHead}><div><p className={styles.sectionKicker}>Priority queue</p><h2 id="attention-heading">Awaiting action</h2></div><CircleAlert width={20} height={20} /></div>
          <div className={styles.actionList}>
            {urgent.map((bill) => {
              const action = recordAction(bill);
              return <Link key={bill.id} to={action.to} className={styles.actionItem} title={bill.title}><span className={styles.actionRule} /><span className={styles.actionCopy}><strong>{bill.shortTitle}</strong><span>{action.label}</span><small>{bill.reference} · Due {new Date(`${bill.dueDate}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</small></span></Link>;
            })}
          </div>
          <Link to="/work?type=Bill" className={styles.textLink}>Open Bill worklist</Link>
        </section>
      </div>

      <div className={styles.performanceRow}>
        <section className={styles.performancePanel} aria-labelledby="performance-heading">
          <div className={styles.sectionHead}>
            <div><p className={styles.sectionKicker}>Illustrative reporting series</p><h2 id="performance-heading">Weekly workflow throughput</h2></div>
            <div className={styles.seriesLegend}><span className={styles.createdKey}>Instructions received</span><span className={styles.reviewedKey}>Review decisions</span><span className={styles.completedKey}>Published</span></div>
          </div>
          <div className={styles.lineChart}>
            <svg viewBox="0 0 720 210" preserveAspectRatio="none" role="img" aria-label="Illustrative weekly throughput over twelve weeks: instructions received range from one to four, review decisions from one to three, and publication events from zero to one.">
              {[54, 88, 122, 156, 190].map((y, index) => <g key={y}><line x1="36" x2="700" y1={y} y2={y} className={styles.gridLine} /><text x="26" y={y + 3} className={styles.axisLabel}>{4 - index}</text></g>)}
              <polyline points={points(weeklySeries.created)} className={styles.lineCreated} />
              <polyline points={points(weeklySeries.reviewed)} className={styles.lineReviewed} />
              <polyline points={points(weeklySeries.completed)} className={styles.lineCompleted} />
              {weeklySeries.created.map((value, index) => <circle key={index} cx={36 + index * (664 / 11)} cy={190 - (value / 5) * 170} r="3" className={styles.pointCreated} />)}
            </svg>
            <div className={styles.weekLabels} aria-hidden>{WEEK_LABELS.map((label) => <span key={label}>{label}</span>)}</div>
          </div>
        </section>

        <section className={styles.statusPanel} aria-labelledby="status-heading">
          <div className={styles.sectionHead}><div><p className={styles.sectionKicker}>Portfolio</p><h2 id="status-heading">Workflow status</h2></div><Workflow width={19} height={19} /></div>
          <div className={styles.donutWrap}>
            <div
              className={styles.donut}
              style={{ background: `conic-gradient(#00834f 0 ${draftingEnd}%, #e3b92f ${draftingEnd}% ${reviewEnd}%, #344139 ${reviewEnd}% ${signatureEnd}%, #7a9b87 ${signatureEnd}% 100%)` }}
              role="img"
              aria-label={`${stageCounts[0]} drafting, ${stageCounts[1]} in legal review, ${stageCounts[3]} awaiting signature, ${stageCounts[4]} published or archived`}
            ><span><strong>{bills.length}</strong>Total Bills</span></div>
          </div>
          <ul className={styles.statusLegend}>
            <li><i className={styles.keyGreen} /> Drafting <strong>{stageCounts[0]}</strong></li>
            <li><i className={styles.keyGold} /> Legal review <strong>{stageCounts[1]}</strong></li>
            <li><i className={styles.keyCharcoal} /> Signature <strong>{stageCounts[3]}</strong></li>
            <li><i className={styles.keyMutedGreen} /> Published / archived <strong>{stageCounts[4]}</strong></li>
          </ul>
        </section>
      </div>

      <div className={styles.detailGrid}>
        <section className={styles.tablePanel} aria-labelledby="latest-bills-heading">
          <div className={styles.sectionHead}><div><p className={styles.sectionKicker}>Recently updated</p><h2 id="latest-bills-heading">Latest Bills</h2></div><Link to="/work?type=Bill" className={styles.textLink}>View all</Link></div>
          <div className={styles.tableWrap}><table><thead><tr><th>Bill</th><th>Stage</th><th>Version</th><th>Due</th><th><span className={styles.srOnly}>Open</span></th></tr></thead><tbody>
            {bills.slice(0, 6).map((bill) => { const action = recordAction(bill); return <tr key={bill.id}><td><Link to={paths.record(bill.id)} className={styles.billIdentity} title={bill.title}><span className={styles.billIcon}><Scale width={16} height={16} /></span><span><strong>{bill.shortTitle}</strong><small>{bill.reference}</small></span></Link></td><td><StatusBadge tone={stageTone[bill.stage] ?? 'grey'} size="sm">{bill.stage}</StatusBadge></td><td><strong>v{bill.currentVersion}</strong><small className={styles.cellMeta}>{bill.currentVersionLabel}</small></td><td>{new Date(`${bill.dueDate}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td><td><Link to={action.to} className={styles.rowAction} aria-label={`${action.label}: ${bill.shortTitle}`} title={action.label}><Eye width={17} height={17} /></Link></td></tr>; })}
          </tbody></table></div>
        </section>

        <section className={styles.agePanel} aria-labelledby="age-heading">
          <div className={styles.sectionHead}><div><p className={styles.sectionKicker}>Bottleneck indicator</p><h2 id="age-heading">Average days in current stage</h2></div><span className={styles.period}>7-day review threshold</span></div>
          <div className={styles.ageChart} role="img" aria-label="Illustrative average stage age: Drafting 6.2 days, Legal review 8.4 days, Procedural review 3.1 days, Signature 2.7 days.">
            {STAGE_AGE.map((stage) => <div key={stage.label} className={styles.ageRow}><span>{stage.label}</span><div><i style={{ width: `${stage.days * 10}%` }} className={stage.days > 7 ? styles.ageRisk : ''} /><b style={{ left: '70%' }} aria-hidden /></div><strong>{stage.days.toFixed(1)} d</strong></div>)}
          </div>
          <p className={styles.chartNote}>Legal review is above the illustrative seven-day threshold. Production values can be derived from stage-change audit events.</p>
        </section>
      </div>
    </AppShell>
  );
}

function Metric({ label, value, detail, icon, tone }: { label: string; value: number; detail: string; icon: ReactNode; tone: 'green' | 'gold' | 'red' | 'charcoal' }) {
  return <article className={styles.metric}><div className={styles.metricTop}><span>{label}</span><span className={`${styles.metricIcon} ${styles[tone]}`}>{icon}</span></div><div className={styles.metricValue}>{value}</div><p>{detail}</p></article>;
}
