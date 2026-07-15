import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search as SearchIcon, SlidersHorizontal,
  MoreVertical, ArrowLeftRight, Plus, ExternalLink, Settings, Layers,
  CalendarDays, User as UserIcon, Bell, GitBranch, History, ChevronDown,
  ClipboardList,
} from 'lucide-react';
import { ShelledPage } from '@/features/common/ShelledPage';
import {
  Button, StatusBadge, SegmentedControl, Popover, Avatar, SideSheet, toneVars,
} from '@/components/ui';
import { useDemoStore } from '@/store/demoStore';
import { officers } from '@/data/personas';
import { paths } from '@/routes/paths';
import { recordAudit } from '@/mocks/mockApi';
import { useToast } from '@/features/search/Toast';
import {
  TYPE_META, StageIcon, configStatusMeta, publishMeta,
  canConfigureWorkflows, CONFIGURE_HINT,
} from './workflowShared';
import type { WorkflowTemplate, WorkflowType } from '@/data/types';
import styles from './WorkflowCatalogue.module.css';

const TODAY = '2026-07-15';
const WEEK_START = '2026-07-11'; // "this week" window for the summary card

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[m - 1]} ${y}`;
}

function officerName(id: string): string {
  return officers.find((o) => o.id === id)?.name ?? 'Unassigned';
}

const DIRECTORATES = ['All Directorates', 'DLS', 'DLPS', 'DLS / DLPS'];
const STATUSES = ['All Configuration Status', 'Active', 'Complete', 'Needs Review'];

export function WorkflowCatalogue() {
  const navigate = useNavigate();
  const role = useDemoStore((s) => s.currentRole);
  const templates = useDemoStore((s) => s.workflowTemplates);
  const addWorkflowTemplate = useDemoStore((s) => s.addWorkflowTemplate);
  const { showToast, ToastHost } = useToast();
  const canConfig = canConfigureWorkflows(role);

  const [query, setQuery] = useState('');
  const [directorate, setDirectorate] = useState(DIRECTORATES[0]);
  const [status, setStatus] = useState(STATUSES[0]);
  const [publish, setPublish] = useState<'all' | 'Published' | 'Draft'>('all');
  const [sort, setSort] = useState<'type' | 'updated' | 'records'>('type');
  const [view, setView] = useState<'list' | 'card'>('list');
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const counts = useMemo(() => ({
    total: templates.length,
    published: templates.filter((t) => t.publishState === 'Published').length,
    draft: templates.filter((t) => t.publishState === 'Draft').length,
    thisWeek: templates.filter((t) => t.lastUpdated >= WEEK_START).length,
  }), [templates]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = templates.filter((t) => {
      if (q && !t.name.toLowerCase().includes(q) && !t.type.toLowerCase().includes(q) &&
        !officerName(t.adminId).toLowerCase().includes(q)) return false;
      if (directorate !== DIRECTORATES[0] && t.directorateAbbrev !== directorate) return false;
      if (status !== STATUSES[0] && t.configStatus !== status) return false;
      if (publish !== 'all' && t.publishState !== publish) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === 'updated') return b.lastUpdated.localeCompare(a.lastUpdated);
      if (sort === 'records') return b.activeRecords - a.activeRecords;
      return 0; // 'type' keeps the seeded (numbered) order
    });
    return list;
  }, [templates, query, directorate, status, publish, sort]);

  const filtersActive = directorate !== DIRECTORATES[0] || status !== STATUSES[0] || publish !== 'all' || sort !== 'type';
  const preview = templates.find((t) => t.slug === previewSlug) ?? null;

  function openWorkflow(t: WorkflowTemplate) {
    navigate(paths.workflowTemplate(t.slug));
  }

  return (
    <ShelledPage
      breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Workflow Management' }, { label: 'Workflow Catalogue' }]}
      title="Workflow Catalogue"
      subtitle="Manage and review all configured legislative workflow types."
      actions={
        <>
          <Button variant="secondary" leftIcon={<ArrowLeftRight width={16} height={16} />} to={paths.workflowsCompare}>
            Compare workflows
          </Button>
          <span title={canConfig ? undefined : CONFIGURE_HINT}>
            <Button variant="primary" leftIcon={<Plus width={16} height={16} />} onClick={() => setCreateOpen(true)} disabled={!canConfig}>
              Create Workflow
            </Button>
          </span>
        </>
      }
    >
      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <SearchIcon width={16} height={16} className={styles.searchIcon} aria-hidden />
          <input
            className={styles.search}
            name="workflow-search"
            placeholder="Search workflow type or administrator…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search workflows"
          />
        </div>

        <Popover
          label="Filter and sort workflows"
          trigger={({ toggle, ref, open }) => (
            <button ref={ref} className={`${styles.filterBtn} ${filtersActive ? styles.filterBtnActive : ''}`} onClick={toggle} aria-expanded={open}>
              <SlidersHorizontal width={15} height={15} aria-hidden />
              Filters{filtersActive ? ' ·' : ''}
            </button>
          )}
        >
          {() => (
            <div className={styles.filterPanel}>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Published state</span>
                <div className={styles.radioRow}>
                  {(['all', 'Published', 'Draft'] as const).map((p) => (
                    <button key={p} className={`${styles.chip} ${publish === p ? styles.chipOn : ''}`} onClick={() => setPublish(p)}>
                      {p === 'all' ? 'All' : p}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Sort by</span>
                <div className={styles.radioRow}>
                  {([['type', 'Catalogue order'], ['updated', 'Last updated'], ['records', 'Active records']] as const).map(([v, lbl]) => (
                    <button key={v} className={`${styles.chip} ${sort === v ? styles.chipOn : ''}`} onClick={() => setSort(v)}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
              <button className={styles.filterReset} onClick={() => { setPublish('all'); setSort('type'); setDirectorate(DIRECTORATES[0]); setStatus(STATUSES[0]); }}>
                Reset filters
              </button>
            </div>
          )}
        </Popover>

        <div className={styles.selectWrap}>
          <select className={styles.select} name="workflow-directorate" value={directorate} onChange={(e) => setDirectorate(e.target.value)} aria-label="Filter by directorate">
            {DIRECTORATES.map((d) => <option key={d}>{d}</option>)}
          </select>
          <ChevronDown width={15} height={15} className={styles.selectChevron} aria-hidden />
        </div>
        <div className={styles.selectWrap}>
          <select className={styles.select} name="workflow-status" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by configuration status">
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown width={15} height={15} className={styles.selectChevron} aria-hidden />
        </div>

        <div className={styles.spacer} />

        <SegmentedControl
          ariaLabel="View mode"
          value={view}
          onChange={(v) => setView(v as 'list' | 'card')}
          options={[{ value: 'list', label: 'List' }, { value: 'card', label: 'Cards' }]}
        />
      </div>

      {/* Summary cards */}
      <div className={styles.summary}>
        <SummaryCard tone="green" icon={<Layers width={20} height={20} />} value={counts.total} label="Workflow types" sub="All configured" />
        <SummaryCard tone="green" icon={<StageIcon name="CheckCircle2" width={20} height={20} />} value={counts.published} label="Published" sub="Active in use" />
        <SummaryCard tone="gold" icon={<ClipboardList width={20} height={20} />} value={counts.draft} label="Draft" sub="Under configuration" />
        <SummaryCard tone="blue" icon={<CalendarDays width={20} height={20} />} value={counts.thisWeek} label="Updated this week" sub="Recent changes" />
      </div>

      {/* Table / cards */}
      {view === 'list' ? (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thType}>Workflow Type</th>
                <th>Primary Directorate</th>
                <th className={styles.num}>Active Records</th>
                <th>Workflow Version</th>
                <th className={styles.center}>Stages</th>
                <th>Configuration Status</th>
                <th>Last Updated</th>
                <th>Responsible Administrator</th>
                <th>Configuration State</th>
                <th className={styles.thActions}><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const tm = TYPE_META[t.type as WorkflowType];
                const cs = configStatusMeta(t.configStatus);
                const pm = publishMeta(t.publishState);
                const selected = t.slug === previewSlug;
                return (
                  <tr
                    key={t.slug}
                    className={`${styles.row} ${selected ? styles.rowSelected : ''}`}
                    onClick={() => setPreviewSlug(t.slug)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Preview ${t.name}`}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPreviewSlug(t.slug); } }}
                  >
                    <td className={styles.tdType}>
                      <span className={styles.typeIcon} style={{ background: toneVars[tm.tone].bg, color: toneVars[tm.tone].fg }} aria-hidden>
                        <StageIcon name={tm.icon} width={18} height={18} />
                      </span>
                      <span className={styles.typeName}>{t.name.replace(' Workflow', '')}</span>
                    </td>
                    <td>{t.directorateAbbrev}</td>
                    <td className={styles.num}>{t.activeRecords}</td>
                    <td>{t.version}</td>
                    <td className={styles.center}><span className={styles.stagePill}>{t.stages.length}</span></td>
                    <td><StatusBadge tone={cs.tone} icon={<cs.icon width={13} height={13} />}>{t.configStatus}</StatusBadge></td>
                    <td className={styles.muted}>{fmtDate(t.lastUpdated)}</td>
                    <td>{officerName(t.adminId)}</td>
                    <td><StatusBadge tone={pm.tone} icon={<pm.icon width={13} height={13} />}>{t.publishState}</StatusBadge></td>
                    <td className={styles.tdActions} onClick={(e) => e.stopPropagation()}>
                      <Popover
                        align="right"
                        label={`Actions for ${t.name}`}
                        trigger={({ toggle, ref, open }) => (
                          <button ref={ref} className={styles.rowMenu} onClick={toggle} aria-expanded={open} aria-label={`Actions for ${t.name}`}>
                            <MoreVertical width={17} height={17} />
                          </button>
                        )}
                      >
                        {(close) => (
                          <div className={styles.menu}>
                            <button className={styles.menuItem} onClick={() => { close(); openWorkflow(t); }}>
                              <ExternalLink width={15} height={15} /> Open workflow
                            </button>
                            <button className={styles.menuItem} onClick={() => { close(); setPreviewSlug(t.slug); }}>
                              <Layers width={15} height={15} /> Quick preview
                            </button>
                            <button className={styles.menuItem} onClick={() => { close(); navigate(`${paths.workflowTemplate(t.slug)}?tab=version-history`); }}>
                              <History width={15} height={15} /> Version history
                            </button>
                            <button
                              className={styles.menuItem}
                              disabled={!canConfig}
                              title={canConfig ? undefined : CONFIGURE_HINT}
                              onClick={() => { close(); navigate(`${paths.workflowTemplate(t.slug)}?sheet=edit-stage`); }}
                            >
                              <Settings width={15} height={15} /> Edit configuration
                            </button>
                          </div>
                        )}
                      </Popover>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr><td colSpan={10} className={styles.empty}>No workflows match your filters.</td></tr>
              )}
            </tbody>
          </table>
          <div className={styles.tableFoot}>
            <span>Showing 1 to {rows.length} of {templates.length} workflow types</span>
            <div className={styles.pager}>
              <button className={styles.pagerBtn} disabled title="Only one page of results">Previous</button>
              <span className={styles.pagerPage}>1</span>
              <button className={styles.pagerBtn} disabled title="Only one page of results">Next</button>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.cardGrid}>
          {rows.map((t) => {
            const tm = TYPE_META[t.type as WorkflowType];
            const cs = configStatusMeta(t.configStatus);
            const pm = publishMeta(t.publishState);
            return (
              <button key={t.slug} className={styles.wfCard} onClick={() => setPreviewSlug(t.slug)}>
                <div className={styles.wfCardHead}>
                  <span className={styles.typeIconLg} style={{ background: toneVars[tm.tone].bg, color: toneVars[tm.tone].fg }} aria-hidden>
                    <StageIcon name={tm.icon} width={22} height={22} />
                  </span>
                  <StatusBadge tone={pm.tone} icon={<pm.icon width={13} height={13} />}>{t.publishState}</StatusBadge>
                </div>
                <h3 className={styles.wfCardTitle}>{t.name}</h3>
                <p className={styles.wfCardDir}>{t.directorate}</p>
                <div className={styles.wfCardMeta}>
                  <span><GitBranch width={13} height={13} /> {t.version}</span>
                  <span><Layers width={13} height={13} /> {t.stages.length} stages</span>
                  <span><UserIcon width={13} height={13} /> {t.activeRecords} records</span>
                </div>
                <div className={styles.wfCardFoot}>
                  <StatusBadge tone={cs.tone} size="sm" icon={<cs.icon width={12} height={12} />}>{t.configStatus}</StatusBadge>
                  <span className={styles.wfCardAdmin}>{officerName(t.adminId)}</span>
                </div>
              </button>
            );
          })}
          {rows.length === 0 && <p className={styles.empty}>No workflows match your filters.</p>}
        </div>
      )}

      {/* Quick preview side sheet */}
      <QuickPreviewSheet
        template={preview}
        canConfig={canConfig}
        onClose={() => setPreviewSlug(null)}
        onOpen={(t) => { setPreviewSlug(null); openWorkflow(t); }}
        onEdit={(t) => { setPreviewSlug(null); navigate(`${paths.workflowTemplate(t.slug)}?sheet=edit-stage`); }}
      />

      {/* Create workflow side sheet (admin) */}
      <CreateWorkflowSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(t) => {
          addWorkflowTemplate(t);
          recordAudit({ recordId: t.workflowId, actorId: role ?? 'ict-admin', actionType: 'Workflow', description: `Workflow draft created: ${t.name}.`, newValue: t.name });
          setCreateOpen(false);
          showToast(`${t.name} created as a draft configuration.`);
          navigate(paths.workflowTemplate(t.slug));
        }}
      />

      <ToastHost />
    </ShelledPage>
  );
}

function SummaryCard({ tone, icon, value, label, sub }: {
  tone: 'green' | 'gold' | 'blue'; icon: React.ReactNode; value: number; label: string; sub: string;
}) {
  return (
    <div className={styles.summaryCard}>
      <span className={styles.summaryIcon} style={{ background: toneVars[tone].bg, color: toneVars[tone].fg }} aria-hidden>{icon}</span>
      <div>
        <div className={styles.summaryValue}>{value}</div>
        <div className={styles.summaryLabel}>{label}</div>
        <div className={styles.summarySub}>{sub}</div>
      </div>
    </div>
  );
}

// ---- Quick Preview side sheet ---------------------------------------------
function QuickPreviewSheet({ template, canConfig, onClose, onOpen, onEdit }: {
  template: WorkflowTemplate | null;
  canConfig: boolean;
  onClose: () => void;
  onOpen: (t: WorkflowTemplate) => void;
  onEdit: (t: WorkflowTemplate) => void;
}) {
  if (!template) return null;
  const t = template;
  const tm = TYPE_META[t.type as WorkflowType];
  const pm = publishMeta(t.publishState);
  const admin = officers.find((o) => o.id === t.adminId);
  const rolesShown = t.rolesSummary.slice(0, 4);
  const rolesRest = t.rolesSummary.length - rolesShown.length;

  return (
    <SideSheet
      open
      onClose={onClose}
      size="md"
      title="Workflow Quick Preview"
      footer={
        <div className={styles.sheetFooter}>
          <Button variant="primary" block leftIcon={<ExternalLink width={16} height={16} />} onClick={() => onOpen(t)}>
            Open workflow
          </Button>
          <span title={canConfig ? undefined : CONFIGURE_HINT} className={styles.footerWide}>
            <Button variant="secondary" block leftIcon={<Settings width={16} height={16} />} disabled={!canConfig} onClick={() => onEdit(t)}>
              Edit configuration
            </Button>
          </span>
        </div>
      }
    >
      <div className={styles.previewHead}>
        <span className={styles.typeIconLg} style={{ background: toneVars[tm.tone].bg, color: toneVars[tm.tone].fg }} aria-hidden>
          <StageIcon name={tm.icon} width={24} height={24} />
        </span>
        <div>
          <h3 className={styles.previewTitle}>{t.name}</h3>
        </div>
        <div className={styles.previewBadge}><StatusBadge tone={pm.tone} icon={<pm.icon width={13} height={13} />}>{t.publishState}</StatusBadge></div>
      </div>

      <dl className={styles.previewMeta}>
        <div><dt>Primary Directorate</dt><dd>{t.directorateAbbrev}</dd></div>
        <div><dt>Workflow Version</dt><dd>{t.version}</dd></div>
        <div><dt>Configuration State</dt><dd>{t.publishState}</dd></div>
        <div>
          <dt>Responsible Administrator</dt>
          <dd className={styles.previewAdmin}>
            {admin && <Avatar initials={admin.initials} name={admin.name} size={26} />}
            <span>{admin?.name}<br /><span className={styles.muted}>{admin?.directorate}</span></span>
          </dd>
        </div>
        <div><dt>Last Updated</dt><dd>{fmtDate(t.lastUpdated)}</dd></div>
        <div><dt>Stages</dt><dd>{t.stages.length}</dd></div>
      </dl>

      <section className={styles.previewSection}>
        <h4 className={styles.previewH4}>Workflow lifecycle</h4>
        <ol className={styles.lifecycle}>
          {t.stages.map((s) => (
            <li key={s.id} className={styles.lifecycleStep}>
              <span className={styles.lifecycleDot} aria-hidden><StageIcon name={s.icon} width={13} height={13} /></span>
              <span className={styles.lifecycleLabel}>{s.name}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.previewSection}>
        <h4 className={styles.previewH4}>Roles</h4>
        <div className={styles.roleChips}>
          {rolesShown.map((r) => <span key={r} className={styles.roleChip}>{r}</span>)}
          {rolesRest > 0 && <span className={styles.roleChipMore}>+{rolesRest} more</span>}
        </div>
      </section>

      <section className={styles.previewSection}>
        <h4 className={styles.previewH4}>Recent activity</h4>
        <ul className={styles.noteList}>
          {t.previewNotes.map((n, i) => (
            <li key={i} className={styles.note}>
              <Bell width={14} height={14} className={styles.noteIcon} aria-hidden />
              <div>
                <div className={styles.noteTitle}>{n.title}<span className={styles.noteAt}>{n.at}</span></div>
                <div className={styles.noteBody}>{n.body}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.previewSection}>
        <h4 className={styles.previewH4}>Required outputs</h4>
        <div className={styles.outputChips}>
          {t.outputs.map((o) => <span key={o} className={styles.outputChip}>{o}</span>)}
        </div>
      </section>
    </SideSheet>
  );
}

// ---- Create workflow side sheet (admin) -----------------------------------
const CREATE_TYPES: WorkflowType[] = [
  'Bill', 'Motion', 'Statutory Instrument', 'Petition', 'Order Paper',
  'Votes and Proceedings', 'Question', 'Statement', 'Papers Laid', 'Supply',
];

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function CreateWorkflowSheet({ open, onClose, onCreate }: {
  open: boolean; onClose: () => void; onCreate: (t: WorkflowTemplate) => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<WorkflowType>('Bill');
  const [directorate, setDirectorate] = useState('DLS');
  const valid = name.trim().length >= 3;

  function build(): WorkflowTemplate {
    const dirFull = directorate === 'DLPS'
      ? 'Directorate of Legislative and Procedural Services'
      : directorate === 'DLS / DLPS'
        ? 'Directorate of Legal Services'
        : 'Directorate of Legal Services';
    const base = `wf-draft-${slugify(name)}`;
    return {
      type, slug: base, name: name.trim().endsWith('Workflow') ? name.trim() : `${name.trim()} Workflow`,
      workflowId: `WF-${slugify(name).slice(0, 6).toUpperCase() || 'NEW'}-001`,
      description: `New ${type.toLowerCase()} workflow configuration (draft).`,
      directorate: dirFull, directorateAbbrev: directorate,
      version: 'v0.1', publishState: 'Draft', configStatus: 'Draft', activeRecords: 0,
      lastUpdated: TODAY, lastUpdatedBy: 'ICT Administrator', adminId: 'ict-admin', illustrative: true,
      approvalsCount: 1, outputs: ['PDF', 'HTML'], rolesSummary: ['Owner', 'Reviewer'],
      previewNotes: [{ category: 'System', title: 'Draft created', body: 'New workflow configuration started.', at: 'Just now' }],
      comparison: {
        directorate, version: 'v0.1', status: 'Draft', stages: 3, activeRecords: 0, approvals: 1,
        pboDependency: 'Not configured', keyDocuments: ['Working document'], duration: 'To be confirmed',
      },
      stages: [
        { id: 'intake', name: 'Intake', icon: 'Inbox', tone: 'grey', description: 'Receive and register the record.', owner: 'Owner', sla: 2, slaUnit: 'Days', requiredApproval: 'None', escalationTrigger: 'After 2 days', allowRework: true, autoAdvance: true, active: true, entryConditions: ['Record created'], exitConditions: ['Intake complete'], roles: ['Owner'], tasks: ['Register record'], documents: ['Working document'], notifications: ['Stage assigned'], escalations: ['Overdue > 2 days → Escalate to directorate head'], auditEvents: ['Stage entered', 'Stage advanced'], outputs: ['Intake checklist'] },
        { id: 'review', name: 'Review', icon: 'Search', tone: 'blue', description: 'Review and validate.', owner: 'Reviewer', sla: 3, slaUnit: 'Days', requiredApproval: 'Required', escalationTrigger: 'After 3 days', allowRework: true, autoAdvance: true, active: true, entryConditions: ['Intake complete'], exitConditions: ['Review complete', 'Approval recorded'], roles: ['Reviewer'], tasks: ['Review record', 'Record decision'], documents: ['Review checklist'], notifications: ['Review requested', 'Review completed'], escalations: ['Overdue > 3 days → Escalate to directorate head'], auditEvents: ['Stage entered', 'Approval recorded', 'Stage advanced'], outputs: ['Review checklist'] },
        { id: 'publication', name: 'Publication', icon: 'Globe', tone: 'green', description: 'Publish the approved record.', owner: 'Publication Officer', sla: 1, slaUnit: 'Days', requiredApproval: 'Required', escalationTrigger: 'After 1 day', allowRework: false, autoAdvance: false, active: true, entryConditions: ['Review approved'], exitConditions: ['Published'], roles: ['Publication Officer'], tasks: ['Generate outputs', 'Publish'], documents: ['Official PDF'], notifications: ['Publication ready', 'Publication completed'], escalations: ['Overdue > 1 day → Escalate to directorate head'], auditEvents: ['Stage entered', 'Publication completed'], outputs: ['Official PDF', 'Accessible HTML'] },
      ],
    };
  }

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      size="md"
      title="Create Workflow"
      subtitle="Start a new legislative workflow configuration as a draft."
      footer={
        <div className={styles.sheetFooterRow}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!valid} onClick={() => onCreate(build())}>Create draft workflow</Button>
        </div>
      }
    >
      <div className={styles.formField}>
        <label className={styles.formLabel} htmlFor="wf-name">Workflow name<span className={styles.req}>*</span></label>
        <input id="wf-name" className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Amendment Bill Workflow" />
      </div>
      <div className={styles.formField}>
        <label className={styles.formLabel} htmlFor="wf-type">Legislative type</label>
        <select id="wf-type" className={styles.input} value={type} onChange={(e) => setType(e.target.value as WorkflowType)}>
          {CREATE_TYPES.map((ty) => <option key={ty}>{ty}</option>)}
        </select>
      </div>
      <div className={styles.formField}>
        <label className={styles.formLabel} htmlFor="wf-dir">Primary directorate</label>
        <select id="wf-dir" className={styles.input} value={directorate} onChange={(e) => setDirectorate(e.target.value)}>
          <option>DLS</option><option>DLPS</option><option>DLS / DLPS</option>
        </select>
      </div>
      <p className={styles.formHint}>
        A new workflow starts as a draft with a starter stage set (Intake → Review → Publication). Stages, rules and roles
        are configured on the template detail screen. Publishing rolls the draft into a versioned, active configuration.
      </p>
    </SideSheet>
  );
}
