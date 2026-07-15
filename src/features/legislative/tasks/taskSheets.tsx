import { useState } from 'react';
import {
  CheckCircle2, UserCog, GitBranch, Clock3, TriangleAlert, Undo2, ExternalLink,
  Bell, CircleCheck, CircleDot, ArrowLeft, Landmark,
} from 'lucide-react';
import { SideSheet, Button, StatusBadge, Avatar } from '@/components/ui';
import { useDemoStore } from '@/store/demoStore';
import { recordAudit, notify } from '@/mocks/mockApi';
import { TASKS_RECORD_ID, PBO_TASK_ID, type BillTask } from '@/data/billTasks';
import { officerName, officerRole, officerInitials, TaskStatusPill } from './taskShared';
import styles from './BillTasksControl.module.css';

const REASSIGN_OPTIONS = ['dls-drafter', 'dls-reviewer', 'dlps-officer', 'counsel-mumo', 'counsel-barasa', 'pbo-liaison'];
const ESCALATE_OPTIONS = ['dls-reviewer', 'clerk'];

type ActionMode = null | 'reassign' | 'extend' | 'escalate' | 'return' | 'dependency';

export function TaskDetailSheet({ task, roleId, onClose, onToast, onOpenPbo }: {
  task: BillTask; roleId: string | null; onClose: () => void; onToast: (m: string) => void; onOpenPbo?: () => void;
}) {
  const isPbo = task.id === PBO_TASK_ID;
  const completeBillTask = useDemoStore((s) => s.completeBillTask);
  const reassignBillTask = useDemoStore((s) => s.reassignBillTask);
  const requestBillTaskExtension = useDemoStore((s) => s.requestBillTaskExtension);
  const escalateBillTask = useDemoStore((s) => s.escalateBillTask);
  const returnBillTask = useDemoStore((s) => s.returnBillTask);

  const [tab, setTab] = useState<'details' | 'activity'>('details');
  const [action, setAction] = useState<ActionMode>(null);
  const [reassignTo, setReassignTo] = useState(REASSIGN_OPTIONS[0]);
  const [escalateTo, setEscalateTo] = useState(ESCALATE_OPTIONS[0]);
  const [extDays, setExtDays] = useState('2');
  const [reason, setReason] = useState('');
  const [dep, setDep] = useState('PBO assessment');

  const escalated = task.escalated;
  // A task is un-completable while it depends on ANOTHER unresolved task. The
  // stage-blocking task itself (the PBO note) is the source, so it stays completable.
  const blockedByDep = task.dependencyBlocking && !task.blocksStage && task.status !== 'Completed';
  const canComplete = task.status !== 'Completed' && !blockedByDep;

  function audit(desc: string) {
    recordAudit({ recordId: TASKS_RECORD_ID, actorId: (roleId as string) ?? 'dls-reviewer', actionType: 'Edit', description: desc });
  }

  function doComplete() {
    completeBillTask(task.id);
    audit(`Task completed: ${task.title}.`);
    if (task.blocksStage) {
      notify({ category: 'Approval', recipientId: 'dls-reviewer', recordId: TASKS_RECORD_ID, title: 'Blocking dependency cleared', body: `${task.title} completed — Legal Review can now advance.` });
    }
    onToast(`${task.title} marked complete.`);
    onClose();
  }

  const title = escalated ? 'Escalated Task Detail' : 'Task Detail';

  return (
    <SideSheet open onClose={onClose} size="xl" title={title}>
      <div className={styles.taskSheetHead}>
        <div className={styles.taskSheetTitleRow}>
          {escalated ? <TriangleAlert width={17} height={17} className={styles.overdueIcon} /> : <CircleDot width={17} height={17} className={styles.muted} />}
          <span className={styles.taskSheetTitle}>{task.title}</span>
          <TaskStatusPill status={task.overdue ? 'Overdue' : task.status} />
        </div>
        <div className={styles.taskId}>Task ID: TASK-2026-014-{task.id.slice(0, 4).toUpperCase()}</div>
      </div>

      {isPbo && onOpenPbo && (
        <div style={{ marginBottom: 14 }}>
          <Button variant="secondary" block leftIcon={<Landmark width={16} height={16} />} onClick={onOpenPbo}>Open PBO Assessment</Button>
        </div>
      )}

      <div className={styles.sheetTabs} role="tablist">
        <button role="tab" aria-selected={tab === 'details'} className={`${styles.sheetTab} ${tab === 'details' ? styles.sheetTabOn : ''}`} onClick={() => setTab('details')}>Details</button>
        <button role="tab" aria-selected={tab === 'activity'} className={`${styles.sheetTab} ${tab === 'activity' ? styles.sheetTabOn : ''}`} onClick={() => setTab('activity')}>Activity</button>
      </div>

      {/* Action sub-forms */}
      {action ? (
        <ActionForm
          mode={action}
          reassignTo={reassignTo} setReassignTo={setReassignTo}
          escalateTo={escalateTo} setEscalateTo={setEscalateTo}
          extDays={extDays} setExtDays={setExtDays}
          reason={reason} setReason={setReason}
          dep={dep} setDep={setDep}
          onCancel={() => setAction(null)}
          onConfirm={() => {
            if (action === 'reassign') { reassignBillTask(task.id, reassignTo); audit(`Task reassigned to ${officerName(reassignTo)}: ${task.title}.`); onToast(`Reassigned to ${officerName(reassignTo)}.`); }
            if (action === 'extend') { const d = Number(extDays) || 1; requestBillTaskExtension(task.id, d, reason || 'Extension requested.'); audit(`Extension granted (${d} days): ${task.title}.`); onToast(`Extension of ${d} days granted.`); }
            if (action === 'escalate') { escalateBillTask(task.id, escalateTo); audit(`Task escalated to ${officerName(escalateTo)}: ${task.title}.`); notify({ category: 'Deadline', recipientId: 'dls-reviewer', recordId: TASKS_RECORD_ID, title: 'Task escalated', body: `${task.title} escalated to ${officerName(escalateTo)}.` }); onToast(`Escalated to ${officerName(escalateTo)}.`); }
            if (action === 'return') { returnBillTask(task.id); audit(`Task returned: ${task.title}.`); onToast('Task returned to assignee.'); }
            if (action === 'dependency') { audit(`Dependency added (${dep}): ${task.title}.`); onToast(`Dependency "${dep}" added.`); }
            setAction(null);
          }}
        />
      ) : tab === 'details' ? (
        <>
          <Field label="Description"><p className={styles.fieldText}>{task.description}</p></Field>

          {escalated && (
            <>
              <Field label="Original Assignee"><Person id={task.assigneeId} /></Field>
              <Field label="Escalated To"><Person id={task.escalatedToId} /></Field>
            </>
          )}
          {!escalated && <Field label="Assignee"><Person id={task.assigneeId} /></Field>}

          <div className={styles.fieldGrid}>
            <Field label="Due Date"><span className={task.overdue ? styles.overdueText : ''}>{task.dueLabel}</span></Field>
            <Field label="Priority"><StatusBadge tone={task.priority === 'High' ? 'red' : task.priority === 'Medium' ? 'amber' : 'grey'} size="sm">{task.priority}</StatusBadge></Field>
          </div>

          {task.relatedClause && (
            <Field label="Related Clause / Document">
              <span className={styles.linkText}>{task.relatedClause} <ExternalLink width={12} height={12} /></span>
            </Field>
          )}

          {task.dependencyLabel && (
            <Field label="Dependencies">
              <div className={styles.depRow}>
                <span>{task.dependencyLabel}</span>
                {task.dependencyBlocking && <StatusBadge tone="red" size="sm">Blocking</StatusBadge>}
              </div>
            </Field>
          )}

          {task.extensionRequested && (
            <Field label="Extension Requested">
              <span>Yes <span className={styles.muted}>(Requested {task.extensionRequested.days} days)</span></span>
              <p className={styles.fieldSub}>{task.extensionRequested.reason}</p>
            </Field>
          )}

          {task.evidence && (
            <Field label="Completion Evidence">
              <div className={styles.evidenceRow}>
                <span>{task.evidence}</span>
                {task.evidenceVersion && <span className={styles.versionChip}>{task.evidenceVersion}</span>}
              </div>
            </Field>
          )}

          {escalated && (
            <Field label="Related Information">
              <dl className={styles.relInfo}>
                <div><dt>Stage</dt><dd>{task.stage}</dd></div>
                <div><dt>Impact</dt><dd>Blocks stage exit</dd></div>
                <div><dt>Next Stage</dt><dd>Procedural Review</dd></div>
              </dl>
            </Field>
          )}
        </>
      ) : (
        // Activity tab
        <div className={styles.activityWrap}>
          {escalated && task.notifications ? (
            <>
              <h4 className={styles.actH4}>Notification History</h4>
              <ol className={styles.notifTimeline}>
                {task.notifications.map((n, i) => (
                  <li key={i} className={styles.notifRow}>
                    <span className={styles.notifDot} aria-hidden><Bell width={11} height={11} /></span>
                    <div className={styles.notifBody}>
                      <div className={styles.notifTop}><span className={styles.notifKind}>{n.kind}</span><span className={styles.notifAt}>{n.at}</span></div>
                      <p className={styles.notifText}>{n.body}</p>
                      <div className={styles.notifTo}>{n.result === 'acknowledged' ? <CircleCheck width={12} height={12} /> : <Bell width={12} height={12} />} {n.result === 'requested' ? 'Extension requested' : n.result === 'acknowledged' ? 'Acknowledged' : `Sent to: ${n.to}`}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <>
              <h4 className={styles.actH4}>Comments &amp; History</h4>
              <ul className={styles.commentList}>
                {task.comments.map((c, i) => (
                  <li key={i}><Avatar initials={officerInitials(c.authorId)} name={officerName(c.authorId)} size={24} /><div><div className={styles.commentAuthor}>{officerName(c.authorId)} <span className={styles.commentAt}>{c.at}</span></div><p className={styles.commentText}>{c.text}</p></div></li>
                ))}
                {task.history.map((h, i) => (
                  <li key={`h${i}`} className={styles.historyRow}><CircleDot width={13} height={13} className={styles.muted} /><span>{h.label}</span><span className={styles.commentAt}>{h.at}</span></li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {/* Action buttons */}
      {!action && (
        <div className={styles.taskActions}>
          <span title={canComplete ? undefined : 'Resolve the blocking dependency before completing this task.'} className={styles.actionFull}>
            <Button variant="primary" block leftIcon={<CheckCircle2 width={16} height={16} />} disabled={!canComplete} onClick={doComplete}>Complete Task</Button>
          </span>
          <Button variant="secondary" block leftIcon={<UserCog width={16} height={16} />} onClick={() => setAction('reassign')}>{escalated ? 'Assign / Reassign' : 'Reassign Task'}</Button>
          {!escalated && <Button variant="secondary" block leftIcon={<GitBranch width={16} height={16} />} onClick={() => setAction('dependency')}>Add Dependency</Button>}
          <Button variant="secondary" block leftIcon={<Clock3 width={16} height={16} />} onClick={() => setAction('extend')}>Request Extension</Button>
          <Button variant="secondary" block leftIcon={<TriangleAlert width={16} height={16} />} onClick={() => setAction('escalate')}>Escalate Task</Button>
          <Button variant="danger" block leftIcon={<Undo2 width={16} height={16} />} onClick={() => setAction('return')}>Return Task</Button>
        </div>
      )}
    </SideSheet>
  );
}

function ActionForm({ mode, reassignTo, setReassignTo, escalateTo, setEscalateTo, extDays, setExtDays, reason, setReason, dep, setDep, onCancel, onConfirm }: {
  mode: Exclude<ActionMode, null>;
  reassignTo: string; setReassignTo: (v: string) => void;
  escalateTo: string; setEscalateTo: (v: string) => void;
  extDays: string; setExtDays: (v: string) => void;
  reason: string; setReason: (v: string) => void;
  dep: string; setDep: (v: string) => void;
  onCancel: () => void; onConfirm: () => void;
}) {
  const heading = { reassign: 'Assign / Reassign', extend: 'Request Extension', escalate: 'Escalate Task', return: 'Return Task', dependency: 'Add Dependency' }[mode];
  return (
    <div className={styles.actionForm}>
      <button className={styles.actionBack} onClick={onCancel}><ArrowLeft width={14} height={14} /> Back to details</button>
      <h4 className={styles.actH4}>{heading}</h4>
      {mode === 'reassign' && (
        <Field label="Assign to"><select className={styles.select} value={reassignTo} onChange={(e) => setReassignTo(e.target.value)} name="reassign-to">{REASSIGN_OPTIONS.map((id) => <option key={id} value={id}>{officerName(id)} ({officerRole(id)})</option>)}</select></Field>
      )}
      {mode === 'escalate' && (
        <Field label="Escalate to"><select className={styles.select} value={escalateTo} onChange={(e) => setEscalateTo(e.target.value)} name="escalate-to">{ESCALATE_OPTIONS.map((id) => <option key={id} value={id}>{officerName(id)} ({officerRole(id)})</option>)}</select></Field>
      )}
      {mode === 'extend' && (
        <Field label="Additional days"><input className={styles.select} type="number" min={1} value={extDays} onChange={(e) => setExtDays(e.target.value)} name="ext-days" /></Field>
      )}
      {mode === 'dependency' && (
        <Field label="Depends on"><select className={styles.select} value={dep} onChange={(e) => setDep(e.target.value)} name="dep-on"><option>PBO assessment</option><option>Legal approval</option><option>Signature</option><option>External response</option></select></Field>
      )}
      {(mode === 'extend' || mode === 'escalate' || mode === 'return') && (
        <Field label="Reason"><textarea className={styles.textarea} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Provide a brief reason…" name="reason" /></Field>
      )}
      <div className={styles.actionFormFooter}>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={onConfirm}>Confirm</Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.sheetField}>
      <div className={styles.sheetFieldLabel}>{label}</div>
      {children}
    </div>
  );
}
function Person({ id }: { id?: string }) {
  return (
    <div className={styles.personRow}>
      <Avatar initials={officerInitials(id)} name={officerName(id)} size={28} />
      <div><div className={styles.personName}>{officerName(id)}</div><div className={styles.personRole}>{officerRole(id)}</div></div>
    </div>
  );
}

// ---- Add Task sheet -------------------------------------------------------
export function AddTaskSheet({ onClose, onToast }: { onClose: () => void; onToast: (m: string) => void }) {
  const addBillTask = useDemoStore((s) => s.addBillTask);
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('dls-drafter');
  const [due, setDue] = useState('2026-07-28');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const valid = title.trim().length >= 3;

  function create() {
    addBillTask({
      id: `task-new-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 12)}`,
      title: title.trim(), description: title.trim(), status: 'Pending', group: 'current',
      assigneeId: assignee, dueDate: due, dueLabel: new Date(due).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      priority, stage: 'Legal Review', comments: [], history: [{ label: 'Task created', at: 'Just now' }],
    });
    recordAudit({ recordId: TASKS_RECORD_ID, actorId: 'dls-reviewer', actionType: 'Create', description: `Task created: ${title.trim()}.` });
    onToast(`Task "${title.trim()}" added.`);
    onClose();
  }

  return (
    <SideSheet open onClose={onClose} size="md" title="Add Task" subtitle="Create a new task for the current stage."
      footer={<div className={styles.actionFormFooter}><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" disabled={!valid} onClick={create}>Add task</Button></div>}>
      <Field label="Task title"><input className={styles.select} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Confirm assisted-access wording" name="task-title" /></Field>
      <Field label="Assignee"><select className={styles.select} value={assignee} onChange={(e) => setAssignee(e.target.value)} name="task-assignee">{REASSIGN_OPTIONS.map((id) => <option key={id} value={id}>{officerName(id)}</option>)}</select></Field>
      <div className={styles.fieldGrid}>
        <Field label="Due date"><input type="date" className={styles.select} value={due} onChange={(e) => setDue(e.target.value)} name="task-due" /></Field>
        <Field label="Priority"><select className={styles.select} value={priority} onChange={(e) => setPriority(e.target.value as 'High' | 'Medium' | 'Low')} name="task-priority"><option>High</option><option>Medium</option><option>Low</option></select></Field>
      </div>
    </SideSheet>
  );
}
