import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Lock, Flag, RotateCcw, ShieldCheck, ExternalLink, Info, MoreVertical, Eye, PenLine,
  Check, CircleDot, TriangleAlert, CircleAlert, FileText, Globe, Code2,
  Calendar, Clock, UserRound, CircleCheck, CircleDashed, Users, ScrollText, Vote, MessageSquareText, FileBarChart, FileBraces,
} from 'lucide-react';
import { AppShell } from '@/components/shell';
import { Panel, Button, StatusBadge, Avatar, Popover } from '@/components/ui';
import { useDemoStore } from '@/store/demoStore';
import { officers } from '@/data/personas';
import {
  lifecycle, stageChecklist, generatedOutputs, relatedRecords, participationSummary,
  accessInfo, keyDates, type StageState,
} from '@/data/billWorkspace';
import { WorkflowSheet } from './WorkflowSheet';
import { PboAssessmentSheet, PboStatusCard } from './pbo/PboAssessmentSheet';
import { TASKS_RECORD_ID } from '@/data/billTasks';
import { paths } from '@/routes/paths';
import styles from './BillWorkspace.module.css';

const TABS = ['Overview', 'Draft', 'Tasks', 'Documents', 'Versions', 'Workflow', 'Participation', 'Activity'];
const officerName = (id?: string) => officers.find((o) => o.id === id)?.name ?? '—';
const officerInitials = (id?: string) => officers.find((o) => o.id === id)?.initials ?? '—';
const billStructure = [
  ['meta', 'Metadata', 'Complete'],
  ['coverPage', 'Cover page', 'Available'],
  ['preface', 'Preface and long title', 'Complete'],
  ['preamble', 'Preamble and formula', 'Complete'],
  ['body', 'Parts, clauses and schedules', 'In progress'],
] as const;

export function BillWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const record = useDemoStore((s) => s.records.find((r) => r.id === id));
  const allVersions = useDemoStore((s) => s.versions);
  const allTasks = useDemoStore((s) => s.tasks);
  const versions = useMemo(() => allVersions.filter((v) => v.recordId === id), [allVersions, id]);
  const tasks = useMemo(() => allTasks.filter((t) => t.recordId === id), [allTasks, id]);
  const markRecentlyOpened = useDemoStore((s) => s.markRecentlyOpened);
  const pboState = useDemoStore((s) => s.pbo.state);
  const [workflowOpen, setWorkflowOpen] = useState(false);

  const tab = params.get('tab') || 'Overview';
  const setTab = (t: string) => setParams((p) => { p.set('tab', t); return p; }, { replace: true });
  const isPrimary = id === TASKS_RECORD_ID;
  const pboSheetOpen = isPrimary && params.get('sheet') === 'pbo-assessment';
  const openPbo = () => setParams((p) => { p.set('sheet', 'pbo-assessment'); return p; });
  const closePbo = () => setParams((p) => { p.delete('sheet'); return p; });

  useEffect(() => { if (id) markRecentlyOpened(id); }, [id, markRecentlyOpened]);

  if (!record) {
    return (
      <AppShell breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Legislative record' }]}>
        <Panel padded><p style={{ fontWeight: 600 }}>Record not found</p></Panel>
      </AppShell>
    );
  }

  const openTasks = tasks.filter((t) => t.status !== 'Completed').length;

  return (
    <AppShell breadcrumb={[{ label: 'Legislative Work', to: '/work' }, { label: 'Bills', to: paths.bills }, { label: record.reference }]}>
      {/* Record identity header */}
      <header className={styles.head}>
        <div className={styles.headMain}>
          <p className={styles.typeLabel}>{record.workflowType.toUpperCase()}</p>
          <h1 className={styles.title}>{record.title}</h1>
          <p className={styles.refLine}>{record.reference} · Version {record.currentVersion} · {record.currentVersionLabel}</p>
          <p className={styles.metaLine}>{record.directorate} · {record.confidentiality}</p>
          <div className={styles.pills}>
            <StatusBadge tone="red" icon={<RotateCcw width={12} height={12} />}>Revision Requested</StatusBadge>
            <StatusBadge tone="red" icon={<Flag width={12} height={12} />}>High Priority</StatusBadge>
            <span className={styles.classPill}><Lock width={12} height={12} /> Internal</span>
          </div>
        </div>
        <div className={styles.headActions}>
          <Button variant="primary" size="lg" to={`/legislative/${record.id}/draft?mode=revision`}>Continue Revision</Button>
          <Button variant="secondary" size="lg" to={`/legislative/${record.id}/draft?mode=preview`} leftIcon={<Eye width={17} height={17} />}>Preview Document</Button>
          <Popover label="More actions" trigger={({ toggle, ref }) => (
            <button ref={ref} className={styles.moreBtn} onClick={toggle} aria-label="More actions"><MoreVertical width={18} height={18} /></button>
          )}>
            {(close) => (
              <div className={styles.menu} onClick={close}>
                {['Add collaborator', 'Add reminder', 'Export summary', 'Copy reference', 'View access permissions'].map((m) => (
                  <button key={m} className={styles.menuItem} onClick={() => m === 'Copy reference' && navigator.clipboard?.writeText(record.reference)}>{m}</button>
                ))}
              </div>
            )}
          </Popover>
        </div>
      </header>

      {/* Canonical-record strip */}
      <div className={styles.canonical}>
        <ShieldCheck width={18} height={18} className={styles.canonicalIcon} aria-hidden />
        <p><b>Canonical legislative record</b> — Version 4.0 is the current working version. Version 3.0 remains the latest legally approved version.</p>
        <div className={styles.canonicalActions}>
          <Link to={`/legislative/${record.id}/versions`} className={styles.canonicalLink}>View approved version <ExternalLink width={13} height={13} /></Link>
          <span className={styles.canonicalSep} />
          <button className={styles.canonicalLink}><Info width={13} height={13} /> Learn about versions</button>
        </div>
      </div>

      {/* Lifecycle ribbon */}
      <ol className={styles.ribbon} aria-label="Legislative lifecycle">
        {lifecycle.map((stage, i) => (
          <li key={stage.id} className={styles.ribbonItem}>
            {i > 0 && <span className={`${styles.ribbonLine} ${lifecycle[i].state === 'upcoming' ? styles.lineDashed : ''}`} aria-hidden />}
            <button className={`${styles.stage} ${styles['stage_' + stage.state]}`} onClick={() => setWorkflowOpen(true)} aria-current={stage.state === 'returned' || stage.state === 'current' ? 'step' : undefined}>
              <span className={styles.stageDot}>{stageIcon(stage.state, i)}</span>
              <span className={styles.stageText}>
                <span className={styles.stageName}>{stage.label}</span>
                <span className={styles.stageDate}>{stage.date}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>

      {/* Tabs */}
      <nav className={styles.tabs} aria-label="Workspace sections">
        {TABS.map((t) => {
          const badge = t === 'Tasks' ? openTasks : t === 'Documents' ? 12 : undefined;
          return (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
              aria-current={tab === t ? 'page' : undefined}
              onClick={() => (
                t === 'Draft' ? navigate(`/legislative/${record.id}/draft`)
                  : t === 'Tasks' ? navigate(`/legislative/${record.id}/tasks`)
                  : t === 'Workflow' ? navigate(`/legislative/${record.id}/workflow`)
                  : setTab(t))}
            >
              {t}{badge != null && <span className={styles.tabBadge}>{badge}</span>}
            </button>
          );
        })}
      </nav>

      {tab === 'Overview' ? (
        <OverviewTab record={record} versions={versions} onOpenWorkflow={() => setWorkflowOpen(true)}
          pboState={isPrimary ? pboState : undefined} onOpenPbo={openPbo} />
      ) : (
        <OtherTab tab={tab} record={record} tasks={tasks} versions={versions} />
      )}

      <WorkflowSheet open={workflowOpen} onClose={() => setWorkflowOpen(false)} recordId={record.id} />
      {pboSheetOpen && <PboAssessmentSheet onClose={closePbo} />}
    </AppShell>
  );
}

function stageIcon(state: StageState, i: number) {
  if (state === 'completed') return <Check width={15} height={15} />;
  if (state === 'returned') return <RotateCcw width={15} height={15} />;
  if (state === 'current') return <CircleDot width={15} height={15} />;
  return <span className={styles.stageNum}>{i + 1}</span>;
}

function OverviewTab({ record, versions, onOpenWorkflow, pboState, onOpenPbo }: { record: any; versions: any[]; onOpenWorkflow: () => void; pboState?: import('@/data/pbo').PboState; onOpenPbo: () => void }) {
  const recentVersions = [...versions].reverse().slice(0, 3);
  const done = stageChecklist.filter((c) => c.status === 'completed').length;

  return (
    <div className={styles.overview}>
      <div className={styles.mainCol}>
        {/* A. Action required */}
        <section className={styles.actionCard}>
          <div className={styles.actionHead}><TriangleAlert width={18} height={18} /> <h2>Action required</h2></div>
          <p className={styles.actionBody}>Resolve the blocking comment on Clause 14 and submit a corrected version for legal review.</p>
          <ul className={styles.actionMeta}>
            <li className={styles.urgent}><Clock width={14} height={14} /> Due today at 4:00 PM</li>
            <li><UserRound width={14} height={14} /> Assigned to Grace Wanjiku</li>
            <li className={styles.issueRed}><CircleAlert width={14} height={14} /> 1 blocking comment</li>
            <li className={styles.issueAmber}><TriangleAlert width={14} height={14} /> 1 cross-reference warning</li>
          </ul>
          <div className={styles.actionButtons}>
            <Button variant="primary" to={`/legislative/${record.id}/draft?mode=revision`}>Continue Revision</Button>
            <Button variant="secondary" to={`/legislative/${record.id}/draft?tab=comments`} leftIcon={<MessageSquareText width={16} height={16} />}>Review Comments</Button>
          </div>
        </section>

        {/* PBO dependency card */}
        {pboState && <PboStatusCard state={pboState} onOpen={onOpenPbo} />}

        {/* B. Current document */}
        <Panel title="Current document" padded>
          <div className={styles.docMaster}>
            <span className={styles.docIcon}><FileText width={22} height={22} /></span>
            <div className={styles.docInfo}>
              <p className={styles.docTitle}>Structured legislative master</p>
              <p className={styles.docMeta}>Version {record.currentVersion} · Last saved today at 10:42 AM · Edited by Grace Wanjiku</p>
              <div className={styles.docActions}>
                <Button variant="secondary" size="sm" to={`/legislative/${record.id}/draft`} leftIcon={<PenLine width={14} height={14} />}>Open Editor</Button>
                <Button variant="tertiary" size="sm" to={`/legislative/${record.id}/draft?tab=metadata`} leftIcon={<Info width={14} height={14} />}>View Metadata</Button>
              </div>
            </div>
          </div>
          {record.isPrimary && (
            <div className={styles.aknStructure}>
              <div className={styles.aknHeading}>
                <span><FileBraces width={17} height={17} /> Akoma Ntoso Bill structure</span>
                <strong>6 of 8 sections prepared</strong>
              </div>
              <div className={styles.aknTicks} role="progressbar" aria-label="Six of eight Bill structure sections prepared" aria-valuemin={0} aria-valuemax={8} aria-valuenow={6}>
                {Array.from({ length: 8 }, (_, index) => <i key={index} className={index < 6 ? styles.aknDone : ''} />)}
              </div>
              <ul className={styles.aknParts}>
                {billStructure.map(([tag, label, status]) => <li key={tag}><code>&lt;{tag}&gt;</code><span>{label}</span><small>{status}</small></li>)}
              </ul>
            </div>
          )}
          <p className={styles.outputsLabel}>Generated outputs <span>(from Version 4.0)</span></p>
          <div className={styles.outputs}>
            {generatedOutputs.map((o) => (
              <button key={o.format} className={styles.output}>
                <span className={styles.outputIcon} data-fmt={o.format}>{o.format === 'PDF' ? <FileText width={16} height={16} /> : o.format === 'HTML' ? <Globe width={16} height={16} /> : <Code2 width={16} height={16} />}</span>
                <span className={styles.outputText}><span className={styles.outputName}>{o.label}</span><span className={styles.outputNote}>{o.generatedAt}</span></span>
              </button>
            ))}
          </div>
          <p className={styles.outputDisclaimer}>Generated previews are not an official publication.</p>
        </Panel>

        {/* C. Current-stage checklist */}
        <Panel title="Current-stage checklist" padded actions={<span className={styles.checklistCount}>{done} of {stageChecklist.length} complete</span>}>
          <div className={styles.progressTrack}><div className={styles.progressFill} style={{ width: `${(done / stageChecklist.length) * 100}%` }} /></div>
          <ul className={styles.checklist}>
            {stageChecklist.map((c) => (
              <li key={c.label} className={styles['ck_' + c.status]}>
                <span className={styles.ckIcon}>{checklistIcon(c.status)}</span>
                <span className={styles.ckLabel}>{c.label}</span>
                <span className={styles.ckStatus}>{statusLabel(c.status)}</span>
              </li>
            ))}
          </ul>
          <Link to={`/legislative/${record.id}/tasks`} className={styles.cardLink}>View full checklist</Link>
        </Panel>

        {/* D. Recent versions */}
        <Panel title="Recent versions" padded>
          <ul className={styles.versions}>
            {recentVersions.map((v) => (
              <li key={v.id} className={v.version === record.currentVersion ? styles.versionCurrent : ''}>
                <div className={styles.versionInfo}>
                  <span className={styles.versionTop}>
                    <span className={styles.versionNum}>Version {v.version}</span>
                    {v.version === record.currentVersion && <span className={styles.tagWorking}>Current working version</span>}
                    {v.approvalState === 'Approved' && <span className={styles.tagApproved}>Latest approved version</span>}
                    {v.approvalState === 'Superseded' && <span className={styles.tagSuperseded}>Superseded</span>}
                  </span>
                  <span className={styles.versionMeta}>{v.label} · {new Date(v.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · {officerName(v.createdById)}</span>
                </div>
                <Button variant="tertiary" size="sm" to={`/legislative/${record.id}/versions`}>Compare</Button>
              </li>
            ))}
          </ul>
          <Link to={`/legislative/${record.id}/versions`} className={styles.cardLink}>View all versions</Link>
        </Panel>

        {/* Related records */}
        <Panel title="Related legislative information" padded>
          <ul className={styles.related}>
            {relatedRecords.map((r) => (
              <li key={r.title}>
                <span className={styles.relIcon}>{relIcon(r.kind)}</span>
                <span className={styles.relText}><span className={styles.relTitle}>{r.title}</span><span className={styles.relRelation}>{r.relation}</span></span>
                {r.to ? <Button variant="tertiary" size="sm" to={r.to}>Open record</Button> : <button className={styles.relOpen}>Open record</button>}
              </li>
            ))}
          </ul>
        </Panel>

        {/* Public participation summary */}
        <Panel title="Public participation" padded>
          <dl className={styles.ppList}>
            <div><dt>Consultation status</dt><dd><StatusBadge tone="gold" size="sm">{participationSummary.status}</StatusBadge></dd></div>
            <div><dt>Opening date</dt><dd>{participationSummary.opening}</dd></div>
            <div><dt>Closing date</dt><dd>{participationSummary.closing}</dd></div>
            <div><dt>Submissions received</dt><dd>{participationSummary.received}</dd></div>
            <div><dt>Public page</dt><dd>{participationSummary.publicPage}</dd></div>
          </dl>
          <div className={styles.ppActions}>
            <Button variant="secondary" size="sm" to={`/public/bills/${record.id}`}>Preview Public Page</Button>
            <Button variant="tertiary" size="sm" to="/participation">Manage Participation</Button>
          </div>
        </Panel>
      </div>

      {/* Context rail */}
      <aside className={styles.rail}>
        <Panel title="Ownership and people" padded>
          <ul className={styles.people}>
            {[['Drafter', record.drafterId], ['Legal reviewer', record.reviewerId], ['Procedural reviewer', record.proceduralOfficerId]].map(([role, pid]) => pid && (
              <li key={role as string}>
                <Avatar initials={officerInitials(pid as string)} name={officerName(pid as string)} size={32} tone="neutral" />
                <span><span className={styles.personName}>{officerName(pid as string)}</span><span className={styles.personRole}>{role}</span></span>
              </li>
            ))}
            <li>
              <span className={styles.origIcon}><Users width={16} height={16} /></span>
              <span><span className={styles.personName}>{record.originatingOffice}</span><span className={styles.personRole}>Originating office</span></span>
            </li>
          </ul>
          <button className={styles.railLink}>Manage people</button>
        </Panel>

        <Panel title="Key dates" padded>
          <dl className={styles.dates}>
            {keyDates.map((d) => (
              <div key={d.label}><dt><Calendar width={13} height={13} /> {d.label}</dt><dd className={d.urgent ? styles.dateUrgent : ''}>{d.value}</dd></div>
            ))}
          </dl>
        </Panel>

        <Panel title="Blocking issues" padded>
          <ul className={styles.blocking}>
            <li className={styles.issueRed}><CircleAlert width={15} height={15} /> 1 blocking comment</li>
            <li className={styles.issueAmber}><TriangleAlert width={15} height={15} /> 1 cross-reference warning</li>
          </ul>
          <button className={styles.railLink} onClick={onOpenWorkflow}>View all issues</button>
        </Panel>

        <Panel title="Access and classification" padded>
          <dl className={styles.access}>
            <div><dt>Classification</dt><dd><span className={styles.classPill}><Lock width={11} height={11} /> {accessInfo.classification}</span></dd></div>
            <div><dt>Visible to</dt><dd>{accessInfo.visibleTo}</dd></div>
            <div><dt>Public visibility</dt><dd>{accessInfo.publicVisibility}</dd></div>
          </dl>
          <button className={styles.railLink}>View permissions</button>
        </Panel>
      </aside>
    </div>
  );
}

function OtherTab({ tab, record, tasks, versions }: { tab: string; record: any; tasks: any[]; versions: any[] }) {
  const allAudit = useDemoStore((s) => s.auditEvents);
  const auditEvents = useMemo(() => allAudit.filter((e) => e.recordId === record.id), [allAudit, record.id]);
  if (tab === 'Tasks') {
    return (
      <Panel padded>
        <ul className={styles.tabTasks}>
          {tasks.map((t) => (
            <li key={t.id}><span className={styles.tabTaskTitle}>{t.title}</span><StatusBadge tone={t.status === 'Completed' ? 'green' : t.status === 'Blocked' ? 'red' : 'gold'} size="sm">{t.status}</StatusBadge></li>
          ))}
          {tasks.length === 0 && <li className={styles.emptyLine}>No open tasks for this record.</li>}
        </ul>
      </Panel>
    );
  }
  if (tab === 'Activity') {
    return (
      <Panel padded>
        <ul className={styles.timeline}>
          {auditEvents.slice(0, 12).map((e) => (
            <li key={e.id}><span className={styles.tlDot} /><span className={styles.tlText}><b>{e.description}</b><span className={styles.tlMeta}>{new Date(e.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} · {e.actorRole}</span></span></li>
          ))}
        </ul>
      </Panel>
    );
  }
  if (tab === 'Versions') {
    return (
      <Panel padded>
        <ul className={styles.tabTasks}>
          {[...versions].reverse().map((v) => (
            <li key={v.id}><span className={styles.tabTaskTitle}>Version {v.version} — {v.label}</span><span className={styles.emptyLine}>{v.approvalState}</span></li>
          ))}
        </ul>
        <Link to={`/legislative/${record.id}/versions`} className={styles.cardLink}>Open full version history</Link>
      </Panel>
    );
  }
  // Documents / Participation fall back to concise panels
  return (
    <Panel padded>
      <p className={styles.emptyLine}>{tab === 'Documents' ? 'Canonical master and generated outputs are shown on the Overview tab.' : 'This section opens in its dedicated workspace.'}</p>
      <Link to={tab === 'Participation' ? '/participation' : `/legislative/${record.id}`} className={styles.cardLink}>{tab === 'Participation' ? 'Open participation inbox' : 'Back to Overview'}</Link>
    </Panel>
  );
}

const checklistIcon = (s: string) =>
  s === 'completed' ? <CircleCheck width={17} height={17} /> : s === 'in-progress' ? <CircleDot width={17} height={17} /> : s === 'blocked' ? <CircleAlert width={17} height={17} /> : <CircleDashed width={17} height={17} />;
const statusLabel = (s: string) => (s === 'completed' ? 'Completed' : s === 'in-progress' ? 'In progress' : s === 'blocked' ? 'Blocked' : 'Pending');
const relIcon = (k: string) => (k === 'act' ? <ScrollText width={16} height={16} /> : k === 'business' ? <Vote width={16} height={16} /> : k === 'submission' ? <MessageSquareText width={16} height={16} /> : <FileBarChart width={16} height={16} />);
