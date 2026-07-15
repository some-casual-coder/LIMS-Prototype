import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Layers, CalendarDays, User as UserIcon, Info, X, ChevronRight,
  PenLine, UploadCloud, ArrowLeftRight, History, Download,
  LogIn, LogOut, Users, ListChecks, FileText, Bell, TriangleAlert, ShieldCheck,
  Plus, ArrowRight, CircleAlert,
} from 'lucide-react';
import { AppShell, type Crumb } from '@/components/shell';
import {
  Button, StatusBadge, SegmentedControl, Popover, SideSheet, toneVars,
} from '@/components/ui';
import { useDemoStore } from '@/store/demoStore';
import { officers } from '@/data/personas';
import { paths } from '@/routes/paths';
import { recordAudit } from '@/mocks/mockApi';
import { useToast } from '@/features/search/Toast';
import { stageTone } from '@/components/ui/tone';
import {
  StageIcon, publishMeta, canConfigureWorkflows, CONFIGURE_HINT,
} from './workflowShared';
import type { WorkflowTemplate, WorkflowStageDef } from '@/data/types';
import styles from './WorkflowTemplateDetail.module.css';

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[m - 1]} ${y}`;
}
function nextVersion(v: string): string {
  const m = v.match(/^v?(\d+)\.(\d+)$/);
  return m ? `v${m[1]}.${Number(m[2]) + 1}` : v;
}

const CONFIG_CARDS: Array<{ key: keyof WorkflowStageDef; title: string; icon: typeof LogIn; add: string }> = [
  { key: 'entryConditions', title: 'Entry Conditions', icon: LogIn, add: 'Add condition' },
  { key: 'exitConditions', title: 'Exit Conditions', icon: LogOut, add: 'Add condition' },
  { key: 'roles', title: 'Responsible Roles', icon: Users, add: 'Manage roles' },
  { key: 'tasks', title: 'Required Tasks', icon: ListChecks, add: 'Add task' },
  { key: 'documents', title: 'Required Documents', icon: FileText, add: 'Add document' },
  { key: 'notifications', title: 'Notifications', icon: Bell, add: 'Manage notifications' },
  { key: 'escalations', title: 'Escalation Rules', icon: TriangleAlert, add: 'Add escalation rule' },
  { key: 'auditEvents', title: 'Audit Events', icon: ShieldCheck, add: 'Manage audit events' },
];

const BOTTOM_TABS = [
  { id: 'records', label: 'Workflow Records' },
  { id: 'version-history', label: 'Version History' },
  { id: 'change-log', label: 'Change Log' },
  { id: 'notes', label: 'Notes' },
];

export function WorkflowTemplateDetail() {
  const { slug = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const role = useDemoStore((s) => s.currentRole);
  const templates = useDemoStore((s) => s.workflowTemplates);
  const records = useDemoStore((s) => s.records);
  const auditEvents = useDemoStore((s) => s.auditEvents);
  const publishWorkflow = useDemoStore((s) => s.publishWorkflow);
  const { showToast, ToastHost } = useToast();
  const canConfig = canConfigureWorkflows(role);

  const template = templates.find((t) => t.slug === slug);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [stageView, setStageView] = useState<'stages' | 'details'>('stages');

  const stageParam = params.get('stage');
  const selectedStageId = stageParam && template?.stages.some((s) => s.id === stageParam)
    ? stageParam
    : template?.stages.find((s) => s.name === 'Legal Review')?.id ?? template?.stages[2]?.id ?? template?.stages[0]?.id ?? '';
  const selectedStage = template?.stages.find((s) => s.id === selectedStageId) ?? template?.stages[0];

  const bottomTab = params.get('tab') && BOTTOM_TABS.some((t) => t.id === params.get('tab')) ? params.get('tab')! : 'records';
  const sheetOpen = params.get('sheet') === 'edit-stage';

  // Record a 'Workflow viewed' audit event on entry (append-only trail).
  const viewed = useRef<string>('');
  useEffect(() => {
    if (template && viewed.current !== template.slug) {
      viewed.current = template.slug;
      recordAudit({ recordId: template.workflowId, actorId: role ?? 'ict-admin', actionType: 'Workflow', description: `Workflow configuration viewed: ${template.name}.` });
    }
  }, [template, role]);

  const breadcrumb: Crumb[] = [
    { label: 'Home', to: '/dashboard' },
    { label: 'Workflow Catalogue', to: paths.workflows },
    { label: template ? `${template.name} Template` : 'Workflow Template' },
  ];

  const workflowRecords = useMemo(
    () => (template ? records.filter((r) => r.workflowType === template.type) : []),
    [records, template],
  );
  const changeLog = useMemo(
    () => (template ? auditEvents.filter((e) => e.recordId === template.workflowId) : []),
    [auditEvents, template],
  );

  if (!template) {
    return (
      <AppShell breadcrumb={breadcrumb}>
        <div className={styles.notFound}>
          <h1>Workflow not found</h1>
          <p>No workflow configuration matches this address.</p>
          <Button variant="primary" to={paths.workflows}>Back to Workflow Catalogue</Button>
        </div>
      </AppShell>
    );
  }

  const t = template;
  const pm = publishMeta(t.publishState);
  const admin = officers.find((o) => o.id === t.adminId);
  const showPublish = t.publishState === 'Draft' || t.hasUnpublishedChanges;

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params);
    if (value === null) next.delete(key); else next.set(key, value);
    setParams(next, { replace: false });
  }

  function onPublish() {
    const newV = nextVersion(t.version);
    publishWorkflow(t.slug);
    recordAudit({ recordId: t.workflowId, actorId: role ?? 'ict-admin', actionType: 'Workflow', description: `Workflow published as ${newV}.`, previousValue: t.version, newValue: newV });
    showToast(`${t.name} published as ${newV}.`);
  }

  return (
    <AppShell breadcrumb={breadcrumb}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{t.name}</h1>
            <StatusBadge tone={pm.tone} icon={<pm.icon width={13} height={13} />}>{t.publishState}</StatusBadge>
            {t.hasUnpublishedChanges && <StatusBadge tone="gold" icon={<PenLine width={13} height={13} />}>Unpublished changes</StatusBadge>}
          </div>
          <p className={styles.subMeta}>
            Workflow Template · Version {t.version} · Primary Directorate: <strong>{t.directorate} ({t.directorateAbbrev})</strong>
          </p>
        </div>
        <div className={styles.headerActions}>
          <Popover
            align="right"
            label="More actions"
            trigger={({ toggle, ref, open }) => (
              <button ref={ref} className={styles.moreBtn} onClick={toggle} aria-expanded={open}>
                More actions <ChevronRight width={15} height={15} className={styles.moreChevron} />
              </button>
            )}
          >
            {(close) => (
              <div className={styles.menu}>
                <button className={styles.menuItem} onClick={() => { close(); downloadSummary(t); showToast('Configuration summary downloaded.'); }}>
                  <Download width={15} height={15} /> Download configuration summary
                </button>
                <button className={styles.menuItem} onClick={() => { close(); setParam('tab', 'change-log'); }}>
                  <History width={15} height={15} /> View change log
                </button>
                <button className={styles.menuItem} onClick={() => { close(); navigate(paths.workflowsCompare); }}>
                  <ArrowLeftRight width={15} height={15} /> Compare workflows
                </button>
              </div>
            )}
          </Popover>
          {showPublish ? (
            <span title={canConfig ? undefined : CONFIGURE_HINT}>
              <Button variant="primary" leftIcon={<UploadCloud width={16} height={16} />} disabled={!canConfig} onClick={onPublish}>
                Publish Workflow
              </Button>
            </span>
          ) : (
            <span title={canConfig ? undefined : CONFIGURE_HINT}>
              <Button variant="primary" leftIcon={<PenLine width={16} height={16} />} disabled={!canConfig} onClick={() => setParam('sheet', 'edit-stage')}>
                Edit Workflow
              </Button>
            </span>
          )}
        </div>
      </div>

      {/* Summary tiles */}
      <div className={styles.tiles}>
        <Tile tone="green" icon={<Layers width={20} height={20} />} value={String(t.stages.length)} label="Stages" sub="in this workflow" />
        <Tile tone="blue" icon={<PenLine width={20} height={20} />} value={String(t.activeRecords)} label="Active records" sub="using this workflow" />
        <Tile tone="gold" icon={<CalendarDays width={20} height={20} />} value={fmtDate(t.lastUpdated)} label="Last updated" sub={`By ${t.lastUpdatedBy}`} small />
        <Tile tone="grey" icon={<UserIcon width={20} height={20} />} value={admin?.name ?? '—'} label="Responsible Administrator" sub={t.directorate} small />
      </div>

      {/* Illustrative notice */}
      {t.illustrative && !bannerDismissed && (
        <div className={styles.notice} role="note">
          <Info width={17} height={17} className={styles.noticeIcon} aria-hidden />
          <span>Illustrative workflow stages — subject to confirmation against National Assembly SOPs.</span>
          <button className={styles.noticeClose} onClick={() => setBannerDismissed(true)} aria-label="Dismiss notice"><X width={16} height={16} /></button>
        </div>
      )}

      {/* Unpublished-changes banner */}
      {t.hasUnpublishedChanges && (
        <div className={styles.changeBanner} role="status">
          <CircleAlert width={17} height={17} aria-hidden />
          <span>You have unpublished configuration changes. Publishing will create version <strong>{nextVersion(t.version)}</strong> without altering active records on the current version.</span>
          <span title={canConfig ? undefined : CONFIGURE_HINT}>
            <Button size="sm" variant="primary" disabled={!canConfig} onClick={onPublish}>Publish {nextVersion(t.version)}</Button>
          </span>
        </div>
      )}

      {/* Stage map */}
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Workflow Stages ({t.version})</h2>
            <p className={styles.panelSub}>Select a stage to view and configure its rules, tasks and approvals.</p>
          </div>
          <SegmentedControl
            ariaLabel="Stage view"
            value={stageView}
            onChange={(v) => setStageView(v as 'stages' | 'details')}
            options={[{ value: 'stages', label: 'Stages' }, { value: 'details', label: 'Details' }]}
          />
        </div>

        {stageView === 'stages' ? (
          <ol className={styles.stageMap}>
            {t.stages.map((s, i) => {
              const active = s.id === selectedStageId;
              const tv = toneVars[s.tone];
              return (
                <li key={s.id} className={styles.stageItem}>
                  <button
                    className={`${styles.stageCard} ${active ? styles.stageCardActive : ''} ${!s.active ? styles.stageInactive : ''}`}
                    style={active ? { borderColor: tv.dot } : undefined}
                    onClick={() => setParam('stage', s.id)}
                    aria-pressed={active}
                  >
                    <span className={styles.stageNum}>{i + 1}</span>
                    <span className={styles.stageIcon} style={{ background: tv.bg, color: tv.fg }} aria-hidden>
                      <StageIcon name={s.icon} width={22} height={22} />
                    </span>
                    <span className={styles.stageName}>{s.name}</span>
                    {!s.active && <span className={styles.stageOff}>Inactive</span>}
                  </button>
                  {i < t.stages.length - 1 && <ArrowRight width={18} height={18} className={styles.stageArrow} aria-hidden />}
                </li>
              );
            })}
          </ol>
        ) : (
          <div className={styles.detailsTable}>
            <table className={styles.stagesTable}>
              <thead><tr><th>#</th><th>Stage</th><th>Owner</th><th>SLA</th><th>Approval</th><th>Auto-advance</th><th>Status</th></tr></thead>
              <tbody>
                {t.stages.map((s, i) => (
                  <tr key={s.id} className={s.id === selectedStageId ? styles.stageRowActive : ''} onClick={() => setParam('stage', s.id)} tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') setParam('stage', s.id); }} role="button">
                    <td>{i + 1}</td>
                    <td className={styles.stageRowName}><StageIcon name={s.icon} width={16} height={16} /> {s.name}</td>
                    <td>{s.owner}</td>
                    <td>{s.sla} {s.slaUnit}</td>
                    <td>{s.requiredApproval}</td>
                    <td>{s.autoAdvance ? 'Yes' : 'No'}</td>
                    <td>{s.active ? <StatusBadge tone="green" size="sm">Active</StatusBadge> : <StatusBadge tone="grey" size="sm">Inactive</StatusBadge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Selected-stage config cards */}
      {selectedStage && (
        <>
          <div className={styles.configHead}>
            <span className={styles.configStageIcon} style={{ background: toneVars[selectedStage.tone].bg, color: toneVars[selectedStage.tone].fg }} aria-hidden>
              <StageIcon name={selectedStage.icon} width={18} height={18} />
            </span>
            <h2 className={styles.configTitle}>{selectedStage.name} — configuration</h2>
            <span className={styles.configOwner}>Owner: {selectedStage.owner} · SLA {selectedStage.sla} {selectedStage.slaUnit} · Approval: {selectedStage.requiredApproval}</span>
          </div>
          <div className={styles.configGrid}>
            {CONFIG_CARDS.map((c) => {
              const items = selectedStage[c.key] as string[];
              return (
                <div key={c.key} className={styles.configCard}>
                  <div className={styles.configCardHead}>
                    <span className={styles.configCardTitle}><c.icon width={16} height={16} /> {c.title}</span>
                    <button className={styles.editLink} disabled={!canConfig} title={canConfig ? undefined : CONFIGURE_HINT} onClick={() => setParam('sheet', 'edit-stage')}>Edit</button>
                  </div>
                  <ul className={styles.configList}>
                    {items.map((it, idx) => <li key={idx}>{it}</li>)}
                  </ul>
                  <button className={styles.addLink} disabled={!canConfig} title={canConfig ? undefined : CONFIGURE_HINT} onClick={() => setParam('sheet', 'edit-stage')}>
                    <Plus width={13} height={13} /> {c.add}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Bottom tabs panel */}
      <section className={styles.panel}>
        <div className={styles.tabBar} role="tablist" aria-label="Workflow detail">
          {BOTTOM_TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={bottomTab === tab.id}
              className={`${styles.tab} ${bottomTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setParam('tab', tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className={styles.tabBody}>
          {bottomTab === 'records' && (
            workflowRecords.length ? (
              <ul className={styles.recordList}>
                {workflowRecords.map((r) => (
                  <li key={r.id}>
                    <Link to={paths.record(r.id)} className={styles.recordRow}>
                      <span className={styles.recordRef}>{r.reference}</span>
                      <span className={styles.recordTitle}>{r.shortTitle}</span>
                      <StatusBadge tone={(stageTone[r.stage] ?? 'grey') as never} size="sm">{r.stage}</StatusBadge>
                      <ChevronRight width={16} height={16} className={styles.recordChevron} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.tabEmpty}>No active records are currently using this workflow in the demonstration dataset.</p>
            )
          )}
          {bottomTab === 'version-history' && (
            <ol className={styles.timeline}>
              <li>
                <span className={styles.tlDot} />
                <div>
                  <div className={styles.tlTitle}>{t.version} — {t.publishState === 'Published' ? 'Published configuration' : 'Draft configuration'}</div>
                  <div className={styles.tlMeta}>{fmtDate(t.lastUpdated)} · {t.lastUpdatedBy}</div>
                </div>
              </li>
              <li>
                <span className={styles.tlDot} />
                <div>
                  <div className={styles.tlTitle}>{t.version.replace(/(\d+)$/, (n) => String(Math.max(0, Number(n) - 1)))} — Superseded</div>
                  <div className={styles.tlMeta}>Earlier configuration retained for reference. No version is ever deleted.</div>
                </div>
              </li>
            </ol>
          )}
          {bottomTab === 'change-log' && (
            changeLog.length ? (
              <ol className={styles.timeline}>
                {changeLog.map((e) => (
                  <li key={e.id}>
                    <span className={styles.tlDot} />
                    <div>
                      <div className={styles.tlTitle}>{e.description}</div>
                      <div className={styles.tlMeta}>{new Date(e.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} · {e.actorRole} · Integrity {e.integrity}</div>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className={styles.tabEmpty}>No configuration changes have been recorded in this session. Editing a stage or publishing the workflow appends an immutable change event here.</p>
            )
          )}
          {bottomTab === 'notes' && (
            <div className={styles.notes}>
              <p><strong>Configuration owner’s note.</strong> Stage rules and approvals reflect the {t.illustrative ? 'illustrative' : 'agreed'} configuration for {t.type.toLowerCase()} business. {t.illustrative ? 'Final stages and rules are confirmed against National Assembly SOPs during inception.' : 'Changes follow the versioned publish process and are recorded in the change log.'}</p>
              <p className={styles.tabEmpty}>Notes are read-only in this prototype.</p>
            </div>
          )}
        </div>
      </section>

      {/* Edit workflow stage side sheet */}
      {sheetOpen && selectedStage && (
        <EditStageSheet
          template={t}
          stage={selectedStage}
          stageIndex={t.stages.findIndex((s) => s.id === selectedStage.id)}
          canConfig={canConfig}
          onClose={() => setParam('sheet', null)}
          onSaved={(msg) => { setParam('sheet', null); showToast(msg); }}
        />
      )}

      <ToastHost />
    </AppShell>
  );
}

function Tile({ tone, icon, value, label, sub, small }: {
  tone: 'green' | 'gold' | 'blue' | 'grey'; icon: React.ReactNode; value: string; label: string; sub: string; small?: boolean;
}) {
  return (
    <div className={styles.tile}>
      <span className={styles.tileIcon} style={{ background: toneVars[tone].bg, color: toneVars[tone].fg }} aria-hidden>{icon}</span>
      <div className={styles.tileText}>
        <div className={small ? styles.tileValueSm : styles.tileValue}>{value}</div>
        <div className={styles.tileLabel}>{label}</div>
        <div className={styles.tileSub}>{sub}</div>
      </div>
    </div>
  );
}

// ---- Edit Workflow Stage side sheet ---------------------------------------
function EditStageSheet({ template, stage, stageIndex, canConfig, onClose, onSaved }: {
  template: WorkflowTemplate;
  stage: WorkflowStageDef;
  stageIndex: number;
  canConfig: boolean;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const updateWorkflowStage = useDemoStore((s) => s.updateWorkflowStage);
  const role = useDemoStore((s) => s.currentRole);
  const [owner, setOwner] = useState(stage.owner);
  const [sla, setSla] = useState(String(stage.sla));
  const [slaUnit, setSlaUnit] = useState(stage.slaUnit);
  const [approval, setApproval] = useState(stage.requiredApproval);
  const [outputs, setOutputs] = useState<string[]>(stage.outputs);
  const [notifications, setNotifications] = useState<string[]>(stage.notifications);
  const [escalationTrigger, setEscalationTrigger] = useState(stage.escalationTrigger);
  const [allowRework, setAllowRework] = useState(stage.allowRework);
  const [autoAdvance, setAutoAdvance] = useState(stage.autoAdvance);
  const [active, setActive] = useState(stage.active);
  const tv = toneVars[stage.tone];

  function save() {
    updateWorkflowStage(template.slug, stage.id, {
      owner, sla: Number(sla) || stage.sla, slaUnit, requiredApproval: approval,
      outputs, notifications, escalationTrigger, allowRework, autoAdvance, active,
    });
    recordAudit({
      recordId: template.workflowId, actorId: role ?? 'ict-admin', actionType: 'Workflow',
      description: `Workflow stage edited: ${stage.name} (${template.name}).`,
      previousValue: `${stage.name} · SLA ${stage.sla} ${stage.slaUnit}`,
      newValue: `${stage.name} · SLA ${sla} ${slaUnit}`,
    });
    // Announce for screen readers.
    const live = document.getElementById('wf-live');
    if (live) live.textContent = `${stage.name} stage configuration saved.${template.publishState === 'Published' ? ' The workflow now has unpublished changes.' : ''}`;
    onSaved(`${stage.name} configuration saved.`);
  }

  return (
    <SideSheet
      open
      onClose={onClose}
      size="md"
      title="Edit Workflow Stage"
      footer={
        <div className={styles.sheetFooter}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <span title={canConfig ? undefined : CONFIGURE_HINT}>
            <Button variant="primary" disabled={!canConfig} onClick={save}>Save changes</Button>
          </span>
        </div>
      }
    >
      <div id="wf-live" className="sr-only" role="status" aria-live="polite" />
      {!canConfig && (
        <div className={styles.readOnlyNote} role="note">
          <Info width={16} height={16} /> You have view-only access. {CONFIGURE_HINT}
        </div>
      )}

      <div className={styles.stageHeadCard}>
        <span className={styles.stageHeadIcon} style={{ background: tv.bg, color: tv.fg }} aria-hidden><StageIcon name={stage.icon} width={20} height={20} /></span>
        <div className={styles.stageHeadText}>
          <div className={styles.stageHeadName}>Stage {stageIndex + 1}: {stage.name}</div>
          <div className={styles.stageHeadSub}>Configure settings for this stage</div>
        </div>
        <select className={styles.miniSelect} name="stage-active" value={active ? 'Active' : 'Inactive'} onChange={(e) => setActive(e.target.value === 'Active')} disabled={!canConfig} aria-label="Stage active state">
          <option>Active</option><option>Inactive</option>
        </select>
      </div>

      <Field label="Stage Owner" required>
        <input className={styles.input} name="stage-owner" value={owner} onChange={(e) => setOwner(e.target.value)} disabled={!canConfig} />
      </Field>

      <Field label="Service Level Agreement (SLA)" required hint="Target time to complete this stage.">
        <div className={styles.slaRow}>
          <input className={styles.input} name="stage-sla" type="number" min={0} value={sla} onChange={(e) => setSla(e.target.value)} disabled={!canConfig} />
          <select className={styles.unitSelect} name="stage-sla-unit" value={slaUnit} onChange={(e) => setSlaUnit(e.target.value as 'Days' | 'Hours')} disabled={!canConfig}>
            <option>Days</option><option>Hours</option>
          </select>
        </div>
      </Field>

      <Field label="Required Approval" required hint="Approval must be recorded to proceed to the next stage.">
        <input className={styles.input} name="stage-approval" value={approval} onChange={(e) => setApproval(e.target.value)} disabled={!canConfig} list="approval-options" />
        <datalist id="approval-options">
          <option>Required</option><option>None</option><option>Director, DLS</option><option>Director, DLPS</option><option>Clerk / Presiding Officer</option>
        </datalist>
      </Field>

      <Field label="Required Outputs" required>
        <ChipEditor chips={outputs} onChange={setOutputs} placeholder="Add output…" name="stage-output" disabled={!canConfig} />
      </Field>

      <Field label="Stage Notifications">
        <ChipEditor chips={notifications} onChange={setNotifications} placeholder="Add notification…" name="stage-notification" disabled={!canConfig} />
      </Field>

      <Field label="Escalation Trigger" required hint="Escalate if this stage is not completed in time.">
        <input className={styles.input} name="stage-escalation" value={escalationTrigger} onChange={(e) => setEscalationTrigger(e.target.value)} disabled={!canConfig} />
      </Field>

      <Toggle label="Allow rework" hint="Allow the record to return to a previous stage if needed." on={allowRework} onToggle={() => setAllowRework((v) => !v)} disabled={!canConfig} />
      <Toggle label="Auto-advance on approval" hint="Automatically move to the next stage when approval is recorded." on={autoAdvance} onToggle={() => setAutoAdvance((v) => !v)} disabled={!canConfig} />
      <Toggle label="Stage is active" hint="Inactive stages are hidden from the running workflow." on={active} onToggle={() => setActive((v) => !v)} disabled={!canConfig} />
    </SideSheet>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}{required && <span className={styles.req}>*</span>}</label>
      {children}
      {hint && <p className={styles.fieldHint}>{hint}</p>}
    </div>
  );
}

function Toggle({ label, hint, on, onToggle, disabled }: { label: string; hint: string; on: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleText}>
        <div className={styles.toggleLabel}>{label}</div>
        <div className={styles.toggleHint}>{hint}</div>
      </div>
      <button
        role="switch"
        aria-checked={on}
        aria-label={label}
        className={`${styles.switch} ${on ? styles.switchOn : ''}`}
        onClick={onToggle}
        disabled={disabled}
        type="button"
      >
        <span className={styles.switchKnob} />
      </button>
    </div>
  );
}

function ChipEditor({ chips, onChange, placeholder, name, disabled }: {
  chips: string[]; onChange: (c: string[]) => void; placeholder: string; name: string; disabled?: boolean;
}) {
  const [val, setVal] = useState('');
  function add() {
    const v = val.trim();
    if (v && !chips.includes(v)) onChange([...chips, v]);
    setVal('');
  }
  return (
    <div className={styles.chipEditor}>
      <div className={styles.chipList}>
        {chips.map((c, i) => (
          <span key={i} className={styles.editChip}>
            {c}
            {!disabled && (
              <button className={styles.chipX} onClick={() => onChange(chips.filter((_, idx) => idx !== i))} aria-label={`Remove ${c}`}><X width={12} height={12} /></button>
            )}
          </span>
        ))}
      </div>
      {!disabled && (
        <div className={styles.chipInputRow}>
          <input
            className={styles.chipInput}
            name={name}
            value={val}
            placeholder={placeholder}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          />
          <button className={styles.chipAdd} onClick={add} type="button" aria-label="Add"><Plus width={15} height={15} /></button>
        </div>
      )}
    </div>
  );
}

// Build a printable HTML summary of the workflow configuration and download it.
function downloadSummary(t: WorkflowTemplate) {
  const rows = t.stages.map((s, i) => `
    <h3>${i + 1}. ${s.name} <small>(${s.active ? 'Active' : 'Inactive'})</small></h3>
    <p><b>Owner:</b> ${s.owner} &nbsp; <b>SLA:</b> ${s.sla} ${s.slaUnit} &nbsp; <b>Approval:</b> ${s.requiredApproval}</p>
    <p><b>Entry:</b> ${s.entryConditions.join('; ')}</p>
    <p><b>Exit:</b> ${s.exitConditions.join('; ')}</p>
    <p><b>Tasks:</b> ${s.tasks.join('; ')}</p>
  `).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${t.name} — Configuration</title>
    <style>body{font-family:Georgia,serif;max-width:720px;margin:40px auto;color:#17211b}h1{margin-bottom:4px}small{color:#657168;font-weight:400}</style></head>
    <body><h1>${t.name}</h1><p>${t.directorate} · Version ${t.version} · ${t.publishState}</p>
    ${t.illustrative ? '<p><i>Illustrative workflow — stages and rules subject to National Assembly SOP confirmation.</i></p>' : ''}
    <hr>${rows}</body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${t.slug}-workflow-configuration.html`;
  a.click();
  URL.revokeObjectURL(url);
}
