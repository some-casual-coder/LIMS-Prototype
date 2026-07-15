import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ScanLine, Archive, Clock, Loader2, UserCheck, CheckCircle2, AlertTriangle, ChevronDown,
  Search as SearchIcon, SlidersHorizontal, Save, MoreVertical, FileText, Lock, Files,
  Database, Gauge, CircleAlert, History, FolderArchive,
} from 'lucide-react';
import { AppShell } from '@/components/shell';
import { Button, Popover } from '@/components/ui';
import { useDemoStore } from '@/store/demoStore';
import type { OcrJob, OcrStatus } from '@/data/types';
import { OcrStatusBadge, confidenceMeta, officerName, relTime } from './ocrShared';
import { ImportSheet } from './ImportSheet';
import { useToast } from '@/features/search/Toast';
import styles from './DigitisationQueue.module.css';

const INDICATORS: { key: OcrStatus; label: string; icon: typeof Clock; tone: string }[] = [
  { key: 'Awaiting Processing', label: 'Awaiting Processing', icon: Clock, tone: 'grey' },
  { key: 'Processing', label: 'Processing', icon: Loader2, tone: 'charcoal' },
  { key: 'Needs Verification', label: 'Needs Verification', icon: UserCheck, tone: 'gold' },
  { key: 'Ready to Archive', label: 'Ready to Archive', icon: CheckCircle2, tone: 'green' },
  { key: 'Attention Required', label: 'Attention Required', icon: AlertTriangle, tone: 'red' },
];

const TABS = [
  { id: 'all', label: 'All Records' },
  { id: 'mine', label: 'My Verification Queue' },
  { id: 'processing', label: 'Processing' },
  { id: 'attention', label: 'Attention Required' },
  { id: 'ready', label: 'Ready to Archive' },
  { id: 'completed', label: 'Recently Completed' },
];

// Display order + pastel header tone for queue groups.
const GROUP_ORDER: OcrStatus[] = ['Processing', 'Needs Verification', 'Quality Review', 'Ready to Archive', 'Attention Required', 'Verified'];
const GROUP_LABEL: Record<OcrStatus, string> = {
  Processing: 'Processing', 'Needs Verification': 'Needs Verification', 'Quality Review': 'Quality Review',
  'Ready to Archive': 'Ready to Archive', 'Attention Required': 'Attention Required', Verified: 'Recently Completed',
  'Awaiting Processing': 'Awaiting Processing',
};

export function DigitisationQueue() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const jobs = useDemoStore((s) => s.ocrJobs);
  const currentRole = useDemoStore((s) => s.currentRole);
  const { showToast, ToastHost } = useToast();

  const statusParam = params.get('status');
  const view = params.get('view') ?? (statusParam ? 'queue' : 'overview');
  const tabFromStatus = statusParam === 'processing' ? 'processing' : statusParam === 'needs-verification' ? 'mine'
    : statusParam === 'ready-to-archive' ? 'ready' : statusParam === 'failed' ? 'attention' : null;
  const [tab, setTab] = useState(tabFromStatus ?? (currentRole === 'records-officer' ? 'mine' : 'all'));
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({ Verified: true });
  const sheet = params.get('sheet') ?? '';

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const j of jobs) c[j.status] = (c[j.status] ?? 0) + 1;
    return c;
  }, [jobs]);

  const filtered = useMemo(() => {
    let list = jobs;
    if (tab === 'mine') list = list.filter((j) => j.assignedToId === currentRole && ['Needs Verification', 'Quality Review', 'Ready to Archive', 'Attention Required'].includes(j.status));
    else if (tab === 'processing') list = list.filter((j) => j.status === 'Processing');
    else if (tab === 'attention') list = list.filter((j) => j.status === 'Attention Required');
    else if (tab === 'ready') list = list.filter((j) => j.status === 'Ready to Archive');
    else if (tab === 'completed') list = list.filter((j) => j.status === 'Verified');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((j) => `${j.title} ${j.reference} ${j.dateLabel} ${j.sourceArchive}`.toLowerCase().includes(q));
    }
    return list;
  }, [jobs, tab, currentRole, search]);

  const groups = useMemo(() => {
    const byStatus = new Map<OcrStatus, OcrJob[]>();
    for (const j of filtered) {
      if (!byStatus.has(j.status)) byStatus.set(j.status, []);
      byStatus.get(j.status)!.push(j);
    }
    return GROUP_ORDER.filter((s) => byStatus.has(s)).map((s) => ({ status: s, jobs: byStatus.get(s)! }));
  }, [filtered]);

  const openSheet = (n: string) => setParams((p) => { p.set('sheet', n); return p; });
  const closeSheet = () => setParams((p) => { p.delete('sheet'); return p; }, { replace: true });
  const setView = (next: 'overview' | 'queue') => setParams((p) => { p.set('view', next); if (next === 'overview') p.delete('status'); return p; });

  return (
    <AppShell breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Search & Knowledge' }, { label: 'OCR & Historical Records' }]}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>OCR &amp; Historical Records</h1>
          <p className={styles.subtitle}>Digitise, verify and preserve parliamentary records from physical and scanned sources.</p>
          <p className={styles.context}>Parliamentary Archives · Digitisation Workspace</p>
        </div>
        <div className={styles.headActions}>
          <Button variant="secondary" leftIcon={<Archive width={16} height={16} />} to="/repository/historical-records">Browse Historical Archive</Button>
          <Button variant="primary" leftIcon={<ScanLine width={16} height={16} />} onClick={() => openSheet('import')}>Import Historical Record</Button>
        </div>
      </div>

      <div className={styles.viewTabs} role="tablist" aria-label="OCR workspace views">
        <button role="tab" aria-selected={view === 'overview'} className={`${styles.viewTab} ${view === 'overview' ? styles.viewTabActive : ''}`} onClick={() => setView('overview')}>Overview</button>
        <button role="tab" aria-selected={view === 'queue'} className={`${styles.viewTab} ${view === 'queue' ? styles.viewTabActive : ''}`} onClick={() => setView('queue')}>Work Queue <span>{jobs.filter((job) => job.status !== 'Verified').length}</span></button>
      </div>

      {view === 'overview' ? (
        <OcrOverview jobs={jobs} counts={counts} navigate={navigate} onOpenQueue={(nextTab) => { setTab(nextTab); setView('queue'); }} />
      ) : <>

      {/* Workload indicators */}
      <div className={styles.indicators}>
        {INDICATORS.map((ind) => {
          const Icon = ind.icon;
          const active = (ind.key === 'Processing' && tab === 'processing') || (ind.key === 'Attention Required' && tab === 'attention')
            || (ind.key === 'Ready to Archive' && tab === 'ready') || (ind.key === 'Needs Verification' && tab === 'mine');
          return (
            <button key={ind.key} className={`${styles.indicator} ${styles['ind_' + ind.tone]} ${active ? styles.indActive : ''}`}
              onClick={() => setTab(ind.key === 'Processing' ? 'processing' : ind.key === 'Attention Required' ? 'attention' : ind.key === 'Ready to Archive' ? 'ready' : ind.key === 'Needs Verification' ? 'mine' : 'all')}>
              <span className={styles.indIcon}><Icon width={17} height={17} className={ind.key === 'Processing' ? 'spin' : ''} /></span>
              <span className={styles.indBody}>
                <span className={styles.indLabel}>{ind.label}</span>
                <span className={styles.indValue}>{counts[ind.key] ?? 0}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Tabs */}
      <div className={styles.tabs} role="tablist" aria-label="Queue views">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <SearchIcon width={16} height={16} aria-hidden />
          <input className={styles.searchInput} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, archival reference, year or source" aria-label="Search historical records" />
        </div>
        <MenuControl label="Status" onPick={showToast} options={['All statuses', 'Processing', 'Needs Verification', 'Quality Review', 'Ready to Archive', 'Attention Required']} />
        <MenuControl label="Record Type" onPick={showToast} options={['All types', 'Order Paper', 'Votes and Proceedings', 'Committee Report', 'Gazette', 'Petition', 'Question']} />
        <MenuControl label="Source Archive" onPick={showToast} options={['All archives', 'Parliamentary Archives', 'National Archives']} />
        <Button variant="secondary" size="sm" leftIcon={<SlidersHorizontal width={15} height={15} />} onClick={() => showToast('Filter panel — refine by year range, scan quality and assigned officer.')}>Filters</Button>
        <Button variant="secondary" size="sm" leftIcon={<Save width={15} height={15} />} onClick={() => showToast('Saved view created for this queue.')}>Save View</Button>
      </div>

      {/* Grouped queue */}
      {groups.length === 0 ? (
        <div className={styles.empty}><ScanLine width={28} height={28} /><p>No records in this view.</p></div>
      ) : (
        <div className={styles.queue}>
          {groups.map((g) => {
            const isCollapsed = collapsed[g.status];
            return (
              <section key={g.status} className={styles.group}>
                <button className={`${styles.groupHead} ${styles['gh_' + g.status.replace(/\s/g, '')]}`} onClick={() => setCollapsed((c) => ({ ...c, [g.status]: !c[g.status] }))} aria-expanded={!isCollapsed}>
                  <ChevronDown width={15} height={15} className={isCollapsed ? styles.chevCollapsed : ''} />
                  {GROUP_LABEL[g.status]} <span className={styles.groupCount}>({g.jobs.length})</span>
                </button>
                {!isCollapsed && (
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Record</th><th>Source</th><th>Pages</th><th>Processing Status</th><th>OCR Confidence</th>
                          <th>Verification Progress</th><th>Assigned To</th><th>Updated</th><th aria-label="Action"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {g.jobs.map((j) => <QueueRow key={j.id} job={j} navigate={navigate} showToast={showToast} />)}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
      </>}

      <ImportSheet open={sheet === 'import'} onClose={closeSheet} showToast={showToast} />
      <ToastHost />
    </AppShell>
  );
}

function OcrOverview({ jobs, counts, navigate, onOpenQueue }: {
  jobs: OcrJob[];
  counts: Record<string, number>;
  navigate: ReturnType<typeof useNavigate>;
  onOpenQueue: (tab: string) => void;
}) {
  const active = jobs.filter((job) => job.status !== 'Verified');
  const pages = active.reduce((sum, job) => sum + job.pageCount, 0);
  const verification = jobs.filter((job) => ['Needs Verification', 'Quality Review', 'Attention Required'].includes(job.status));
  const priority = [...active].sort((a, b) => {
    const order: Record<string, number> = { 'Attention Required': 0, 'Needs Verification': 1, 'Quality Review': 2, 'Ready to Archive': 3, Processing: 4 };
    return (order[a.status] ?? 9) - (order[b.status] ?? 9);
  }).slice(0, 4);
  const trend = [3, 5, 4, 7, 6, 8, 5, 9, 7, 10, 8, 11];
  const types = Array.from(new Set(jobs.map((job) => job.recordType))).slice(0, 5).map((type) => ({ type, count: jobs.filter((job) => job.recordType === type).length }));
  const recent = [...jobs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6);

  return (
    <div className={styles.overviewGrid}>
      <section className={styles.metricGrid} aria-label="Digitisation workload summary">
        <OverviewMetric icon={<Files width={18} height={18} />} label="Active records" value={active.length} note="Across the digitisation pipeline" tone="green" onClick={() => onOpenQueue('all')} />
        <OverviewMetric icon={<Database width={18} height={18} />} label="Pages in pipeline" value={pages} note="Scanned pages under active control" tone="gold" onClick={() => onOpenQueue('processing')} />
        <OverviewMetric icon={<UserCheck width={18} height={18} />} label="Verification workload" value={verification.length} note="Officer decision required" tone="red" onClick={() => onOpenQueue('mine')} />
        <OverviewMetric icon={<FolderArchive width={18} height={18} />} label="Ready to archive" value={counts['Ready to Archive'] ?? 0} note="Quality checks complete" tone="charcoal" onClick={() => onOpenQueue('ready')} />
      </section>

      <section className={`${styles.overviewPanel} ${styles.pipelinePanel}`}>
        <div className={styles.panelHeading}><div><p>Current workload</p><h2>Digitisation pipeline</h2></div><Gauge width={20} height={20} /></div>
        <div className={styles.pipelineTotal}><strong>{active.length}</strong><span>active records</span></div>
        <div className={styles.pipelineTicks} aria-label="Active records by processing status">
          {INDICATORS.slice(1).map((indicator) => {
            const amount = counts[indicator.key] ?? 0;
            return <button key={indicator.key} className={styles.pipelineGroup} onClick={() => onOpenQueue(indicator.key === 'Processing' ? 'processing' : indicator.key === 'Attention Required' ? 'attention' : indicator.key === 'Ready to Archive' ? 'ready' : 'mine')} aria-label={`${indicator.label}: ${amount}`}>
              <span className={`${styles.pipelineLines} ${styles['line_' + indicator.tone]}`}>{Array.from({ length: Math.max(2, amount + 1) }, (_, i) => <i key={i} />)}</span>
              <span>{indicator.label}</span><strong>{amount}</strong>
            </button>;
          })}
        </div>
      </section>

      <section className={`${styles.overviewPanel} ${styles.activityPanel}`}>
        <div className={styles.panelHeading}><div><p>Latest changes</p><h2>Recent activity</h2></div><History width={20} height={20} /></div>
        <ul className={styles.activityList}>
          {recent.map((job) => <li key={job.id}><button onClick={() => navigate(actionFor(job).to)}><span className={styles.activityIcon}><FileText width={15} height={15} /></span><span><strong>{job.title}</strong><small>{job.status} · {relTime(job.updatedAt)}</small></span></button></li>)}
        </ul>
      </section>

      <section className={`${styles.overviewPanel} ${styles.trendPanel}`}>
        <div className={styles.panelHeading}><div><p>Illustrative reporting series</p><h2>Records processed per month</h2></div><span className={styles.period}>Jan–Dec 2026</span></div>
        <div className={styles.barChart} role="img" aria-label="Illustrative monthly records processed, ranging from three to eleven records">
          {trend.map((value, index) => <div key={index} className={styles.barColumn}><span className={styles.barValue}>{value}</span><span className={styles.barTrack}>{Array.from({ length: 11 }, (_, tick) => <i key={tick} className={tick >= 11 - value ? styles.barOn : ''} />)}</span><small>{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][index]}</small></div>)}
        </div>
        <p className={styles.chartNote}>Throughput reflects records completing OCR extraction or verification in each month.</p>
      </section>

      <section className={`${styles.overviewPanel} ${styles.mixPanel}`}>
        <div className={styles.panelHeading}><div><p>Active collection</p><h2>Document types</h2></div><span className={styles.period}>{jobs.length} records</span></div>
        <ul className={styles.typeList}>{types.map((item, index) => <li key={item.type}><span className={styles.typeRank}>{index + 1}</span><span>{item.type}</span><strong>{item.count}</strong></li>)}</ul>
        <button className={styles.panelLink} onClick={() => onOpenQueue('all')}>Open complete record list</button>
      </section>

      <section className={`${styles.overviewPanel} ${styles.priorityPanel}`}>
        <div className={styles.panelHeading}><div><p>Operational priority</p><h2>Requires attention</h2></div><CircleAlert width={20} height={20} /></div>
        <ul className={styles.priorityList}>{priority.map((job) => <li key={job.id}><button onClick={() => navigate(actionFor(job).to)}><span><strong>{job.title}</strong><small>{job.reference}</small></span><OcrStatusBadge status={job.status} /></button></li>)}</ul>
        <button className={styles.panelLink} onClick={() => onOpenQueue('mine')}>Open verification queue</button>
      </section>
    </div>
  );
}

function OverviewMetric({ icon, label, value, note, tone, onClick }: { icon: React.ReactNode; label: string; value: number; note: string; tone: string; onClick: () => void }) {
  return <button className={`${styles.overviewMetric} ${styles['metric_' + tone]}`} onClick={onClick}><span className={styles.metricTop}><span>{label}</span><i>{icon}</i></span><strong>{value}</strong><small>{note}</small></button>;
}

function progressTone(status: OcrStatus): string {
  return status === 'Ready to Archive' || status === 'Verified' ? 'var(--status-success)'
    : status === 'Attention Required' ? 'var(--status-danger)'
      : status === 'Needs Verification' ? 'var(--gold-strong)' : 'var(--on-blue)';
}

function QueueRow({ job, navigate, showToast }: { job: OcrJob; navigate: ReturnType<typeof useNavigate>; showToast: (m: string) => void }) {
  const conf = job.ocrConfidence > 0 ? confidenceMeta(job.ocrConfidence) : null;
  const pct = job.pageCount ? Math.round((job.verifiedPages / job.pageCount) * 100) : 0;

  const action = actionFor(job);
  return (
    <tr className={styles.row} onClick={() => navigate(action.to)}>
      <td>
        <div className={styles.recCell}>
          <span className={styles.recIcon} aria-hidden>{job.restricted ? <Lock width={15} height={15} /> : <FileText width={15} height={15} />}</span>
          <div>
            <button className={styles.recTitle} onClick={(e) => { e.stopPropagation(); navigate(action.to); }}>{job.title}</button>
            <span className={styles.recRef}>{job.reference} · <span className={styles.recDate}>{job.dateLabel}</span></span>
          </div>
        </div>
      </td>
      <td className={styles.dim}>{job.sourceArchive}<br /><span className={styles.dim2}>{job.sourceFormat}</span></td>
      <td className={styles.dim}>{job.pageCount} pages</td>
      <td>
        <OcrStatusBadge status={job.status} />
        {job.processingStep && (
          <div className={styles.subStatus}>
            {job.status === 'Processing'
              ? <><span>{job.processingStep}</span> <span className={styles.subPct}>{job.processingProgress}%</span></>
              : <span className={styles.subWarn}>{job.processingStep}</span>}
          </div>
        )}
        {!job.processingStep && job.status === 'Ready to Archive' && <div className={styles.subStatus}>All checks complete</div>}
        {!job.processingStep && job.status === 'Quality Review' && <div className={styles.subStatus}>Ready for approval</div>}
      </td>
      <td>
        {conf ? (
          <div><span className={styles.confPct}>{job.ocrConfidence}%</span>{job.lowConfidenceRegions > 0 && <div className={styles.dim2}>{job.lowConfidenceRegions} low-confidence regions</div>}</div>
        ) : <span className={styles.dim2}>—</span>}
      </td>
      <td>
        <div className={styles.progWrap}>
          <span className={styles.progText}>{job.verifiedPages} of {job.pageCount}</span>
          <span className={styles.progBar}><span className={styles.progFill} style={{ width: `${pct}%`, background: progressTone(job.status) }} /></span>
        </div>
      </td>
      <td className={styles.dim}>{job.assignedToId ? officerName(job.assignedToId) : <span className={styles.dim2}>—</span>}</td>
      <td className={styles.dim}>{relTime(job.updatedAt)}</td>
      <td onClick={(e) => e.stopPropagation()}>
        <div className={styles.actionCell}>
          <Button size="sm" variant={action.primary ? 'primary' : 'secondary'} onClick={() => navigate(action.to)}>{action.label}</Button>
          <Popover label="More actions" align="left" trigger={({ toggle, ref }) => (
            <button ref={ref} className={styles.moreBtn} onClick={toggle} aria-label="More actions"><MoreVertical width={16} height={16} /></button>
          )}>
            {(close) => (
              <div className={styles.menu} onClick={close}>
                <button className={styles.menuItem} onClick={() => navigate(`/archive/ocr/jobs/${job.id}`)}>View processing</button>
                <button className={styles.menuItem} onClick={() => navigate(`/repository/historical-records/${job.reference.replace(/\//g, '-')}`)}>Open record detail</button>
                <button className={styles.menuItem} onClick={() => showToast('Reassign — pick another records officer.')}>Reassign</button>
              </div>
            )}
          </Popover>
        </div>
      </td>
    </tr>
  );
}

function actionFor(job: OcrJob): { label: string; to: string; primary?: boolean } {
  switch (job.status) {
    case 'Processing': return { label: 'View Processing', to: `/archive/ocr/jobs/${job.id}` };
    case 'Needs Verification': return { label: 'Continue Verification', to: `/archive/ocr/jobs/${job.id}/verify`, primary: true };
    case 'Quality Review': return { label: 'Review & Approve', to: `/archive/ocr/jobs/${job.id}/verify?sheet=quality`, primary: true };
    case 'Ready to Archive': return { label: 'Archive Record', to: `/repository/historical-records/${job.reference.replace(/\//g, '-')}?sheet=archive`, primary: true };
    case 'Attention Required': return { label: 'Review Scan', to: `/archive/ocr/jobs/${job.id}`, primary: true };
    case 'Verified': return { label: 'View Record', to: `/repository/historical-records/${job.reference.replace(/\//g, '-')}` };
    default: return { label: 'View', to: `/archive/ocr/jobs/${job.id}` };
  }
}

function MenuControl({ label, options, onPick }: { label: string; options: string[]; onPick: (m: string) => void }) {
  const [sel, setSel] = useState(options[0]);
  return (
    <Popover label={label} trigger={({ toggle, ref }) => (
      <button ref={ref} className={styles.control} onClick={toggle}>{sel === options[0] ? label : sel} <ChevronDown width={14} height={14} /></button>
    )}>
      {(close) => (
        <div className={styles.menu} onClick={close}>
          {options.map((o) => <button key={o} className={`${styles.menuItem} ${sel === o ? styles.menuItemActive : ''}`} onClick={() => { setSel(o); if (o !== options[0]) onPick(`Filtered by ${label}: ${o}.`); }}>{o}</button>)}
        </div>
      )}
    </Popover>
  );
}
