import type { Priority } from './types';
import type { WorkflowTone } from './types';

// ---- Bill Tasks & Workflow Control (Priority 0 sanity sprint) --------------
// A self-contained, interactive task + stage-gate model for the demonstration
// Bill at the Legal Review stage, with a blocking (overdue, escalated) PBO
// dependency. Completing that task clears the gate and lets the stage advance.

export type BillTaskStatus = 'In Progress' | 'Pending' | 'Blocked' | 'Completed' | 'Overdue';
export type ReqStatus = 'Met' | 'In Progress' | 'Blocked' | 'Pending';
export type TaskGroup = 'current' | 'dependent' | 'completed';

export interface TaskComment { authorId: string; text: string; at: string; }
export interface TaskHistoryEvent { label: string; at: string; }
export interface NotificationEvent {
  at: string; kind: string; title: string; body: string; to: string; result?: 'sent' | 'requested' | 'acknowledged';
}

export interface BillTask {
  id: string;
  title: string;
  description: string;
  status: BillTaskStatus;
  group: TaskGroup;
  assigneeId: string; // 'system' for automated entries
  reviewerId?: string;
  dueDate: string; // ISO
  dueLabel: string; // "20 Jul 2026" or "18 Jul 2026 (Overdue)"
  overdue?: boolean;
  priority: Priority;
  stage: string;
  relatedClause?: string; // "Clause 14 (Revision v1.1)"
  relatedTo?: string; // link target
  evidence?: string;
  evidenceVersion?: string;
  dependencyLabel?: string; // "Receive PBO financial impact note"
  dependencyBlocking?: boolean;
  blocksStage?: boolean; // completing is required to exit the current stage
  escalated?: boolean;
  escalatedToId?: string;
  escalatedOn?: string;
  extensionRequested?: { days: number; reason: string };
  comments: TaskComment[];
  history: TaskHistoryEvent[];
  notifications?: NotificationEvent[];
}

export interface StageReq { label: string; status: ReqStatus; note?: string; }
export interface MandatoryTaskProgress { label: string; done: number; total: number; }
export interface BlockingDependency {
  label: string; requestedOn: string; assigneeId: string; due: string; overdueDays?: number; status: string;
}

export interface StageGate {
  id: string;
  name: string;
  icon: string;
  tone: WorkflowTone;
  state: 'Completed' | 'In Progress' | 'Pending';
  dateLabel?: string; // "10 Jul 2026" or "In Progress"
  owner: string;
  entry: StageReq[];
  exit: StageReq[];
  mandatory: MandatoryTaskProgress[];
  approvals: StageReq[];
  validation: StageReq[];
  blocking: BlockingDependency[];
}

// The demonstration Bill this feature operates on.
export const TASKS_RECORD_ID = 'NA-BILL-2026-015';
export const PBO_TASK_ID = 'receive-pbo';

export const billTasksSeed: BillTask[] = [
  // ---- Current stage tasks ----
  {
    id: 'review-clause14', title: 'Review Clause 14 revision', group: 'current',
    description: 'Review the proposed amendments to Clause 14 and the suggested edits from the drafter.',
    status: 'In Progress', assigneeId: 'dls-drafter', dueDate: '2026-07-20', dueLabel: '20 Jul 2026',
    priority: 'High', stage: 'Legal Review', relatedClause: 'Clause 14 (Revision v1.1)',
    evidence: 'Draft comments', evidenceVersion: 'v1.0',
    dependencyLabel: 'Receive PBO financial impact note', dependencyBlocking: true,
    comments: [
      { authorId: 'dls-drafter', text: 'Task created for Clause 14 review.', at: '10 Jul 2026, 9:15 AM' },
      { authorId: 'dlps-officer', text: 'Please confirm the assisted-access wording aligns with the policy brief.', at: '12 Jul 2026, 2:40 PM' },
    ],
    history: [
      { label: 'Task created by Grace Wanjiku', at: '10 Jul 2026, 9:15 AM' },
      { label: 'Comment added by Ruth Naliaka', at: '12 Jul 2026, 2:40 PM' },
    ],
  },
  {
    id: 'verify-policy-brief', title: 'Verify policy-brief attachment', group: 'current',
    description: 'Confirm that the policy brief attachments match the current instruction package.',
    status: 'In Progress', assigneeId: 'dlps-officer', dueDate: '2026-07-21', dueLabel: '21 Jul 2026',
    priority: 'Medium', stage: 'Legal Review', relatedClause: 'Policy Brief v1.0', evidence: 'Checklist',
    comments: [], history: [{ label: 'Task assigned to Ruth Naliaka', at: '11 Jul 2026, 10:00 AM' }],
  },
  {
    id: 'confirm-citations', title: 'Confirm legal citation update', group: 'current',
    description: 'Confirm that the legal citations in Clause 14 reflect the latest enactments.',
    status: 'Pending', assigneeId: 'pbo-liaison', dueDate: '2026-07-23', dueLabel: '23 Jul 2026',
    priority: 'Medium', stage: 'Legal Review', relatedClause: 'Clause 14 (Legal Citations)',
    comments: [], history: [{ label: 'Task created', at: '11 Jul 2026, 10:05 AM' }],
  },
  {
    id: PBO_TASK_ID, title: 'Receive PBO financial impact note', group: 'current',
    description: 'Request and receive the Parliamentary Budget Office financial-impact note for the Bill.',
    status: 'Blocked', assigneeId: 'pbo-liaison', dueDate: '2026-07-18', dueLabel: '18 Jul 2026 (Overdue)',
    overdue: true, priority: 'High', stage: 'Legal Review', relatedClause: 'PBO Note', evidence: 'PBO Financial Note',
    dependencyLabel: 'PBO assessment', dependencyBlocking: true, blocksStage: true,
    escalated: true, escalatedToId: 'dls-reviewer', escalatedOn: '21 Jul 2026, 9:30 AM',
    extensionRequested: { days: 2, reason: 'Required to complete Legal Review before procedural submission to the House schedule.' },
    comments: [
      { authorId: 'pbo-liaison', text: 'Awaiting pending data from Treasury before the note can be finalised.', at: '21 Jul 2026, 9:35 AM' },
    ],
    history: [
      { label: 'Task created', at: '10 Jul 2026, 9:20 AM' },
      { label: 'Reminder sent to Sarah Njeri', at: '15 Jul 2026, 10:00 AM' },
      { label: 'Due date passed — overdue', at: '18 Jul 2026, 9:00 AM' },
      { label: 'Escalated to Director, Legal Services', at: '21 Jul 2026, 9:30 AM' },
    ],
    notifications: [
      { at: '15 Jul 2026, 10:00 AM', kind: 'System Reminder', title: 'System Reminder', body: 'Reminder: Provide PBO financial-impact note for Digital Public Services Bill, 2026.', to: 'Sarah Njeri', result: 'sent' },
      { at: '18 Jul 2026, 9:00 AM', kind: 'Overdue Reminder', title: 'Overdue Reminder', body: 'Task due date passed. Action required to avoid delay in Legal Review.', to: 'Sarah Njeri', result: 'sent' },
      { at: '21 Jul 2026, 9:30 AM', kind: 'Escalation Notice', title: 'Escalation Notice', body: 'Task escalated to Director, Legal Services due to non-completion.', to: 'Director, Legal Services', result: 'sent' },
      { at: '21 Jul 2026, 9:35 AM', kind: 'Assignee Update', title: 'Assignee Update', body: 'Sarah Njeri requested extension (2 days) due to pending data from Treasury.', to: 'Director, Legal Services', result: 'requested' },
      { at: '21 Jul 2026, 10:15 AM', kind: 'Manager Acknowledgement', title: 'Manager Acknowledgement', body: 'Director, Legal Services acknowledged escalation. Action expected by 22 Jul 2026.', to: 'Director, Legal Services', result: 'acknowledged' },
    ],
  },
  // ---- Dependent tasks ----
  {
    id: 'schedule-procedural', title: 'Schedule procedural review', group: 'dependent',
    description: 'Schedule the procedural review once Legal Review is complete and the PBO note is received.',
    status: 'Pending', assigneeId: 'dls-drafter', dueDate: '2026-07-25', dueLabel: '25 Jul 2026',
    priority: 'Medium', stage: 'Procedural Review', relatedClause: 'Procedural Review Plan',
    dependencyLabel: 'Requires PBO note', dependencyBlocking: false,
    comments: [], history: [{ label: 'Task created', at: '11 Jul 2026, 11:00 AM' }],
  },
  // ---- Completed tasks ----
  {
    id: 'log-receipt', title: 'Log receipt of draft for legal review', group: 'completed',
    description: 'Automated log of the draft received for legal review.',
    status: 'Completed', assigneeId: 'system', dueDate: '2026-07-10', dueLabel: '10 Jul 2026',
    priority: 'Low', stage: 'Legal Review', relatedClause: 'Draft Bill v3.1', evidence: 'System log',
    comments: [], history: [{ label: 'Completed automatically', at: '10 Jul 2026, 8:05 AM' }],
  },
  {
    id: 'validate-drafting-exit', title: 'Validate drafting stage exit criteria', group: 'completed',
    description: 'Confirm that drafting exit criteria were met before entering Legal Review.',
    status: 'Completed', assigneeId: 'dls-drafter', dueDate: '2026-07-10', dueLabel: '10 Jul 2026',
    priority: 'Low', stage: 'Drafting', relatedClause: 'Drafting Validation Report', evidence: 'Validation report',
    comments: [], history: [{ label: 'Completed by Grace Wanjiku', at: '10 Jul 2026, 8:40 AM' }],
  },
  {
    id: 'workspace-opened', title: 'Legal review workspace opened', group: 'completed',
    description: 'Automated entry when the legal review workspace was opened.',
    status: 'Completed', assigneeId: 'system', dueDate: '2026-07-10', dueLabel: '10 Jul 2026',
    priority: 'Low', stage: 'Legal Review', evidence: 'System log',
    comments: [], history: [{ label: 'Logged automatically', at: '10 Jul 2026, 8:45 AM' }],
  },
  {
    id: 'confirm-instruction-docs', title: 'Confirm instruction and policy documents', group: 'completed',
    description: 'Confirm the instruction package and policy documents are complete.',
    status: 'Completed', assigneeId: 'dls-drafter', dueDate: '2026-07-09', dueLabel: '09 Jul 2026',
    priority: 'Low', stage: 'Instruction', relatedClause: 'Instruction package', evidence: 'Checklist',
    comments: [], history: [{ label: 'Completed by Grace Wanjiku', at: '09 Jul 2026, 4:20 PM' }],
  },
];

// ---- Stage gates ----------------------------------------------------------
export const stageGatesSeed: StageGate[] = [
  {
    id: 'instruction', name: 'Instruction', icon: 'ClipboardList', tone: 'green', state: 'Completed', dateLabel: '10 Jul 2026',
    owner: 'Legal Directorate',
    entry: [{ label: 'Approved proposal received', status: 'Met' }],
    exit: [{ label: 'Bill record created', status: 'Met' }, { label: 'Initial tasks generated', status: 'Met' }],
    mandatory: [{ label: 'Confirm instruction documents', done: 1, total: 1 }],
    approvals: [{ label: 'Instruction accepted', status: 'Met' }],
    validation: [{ label: 'Instruction validated', status: 'Met' }],
    blocking: [],
  },
  {
    id: 'drafting', name: 'Drafting', icon: 'PenLine', tone: 'green', state: 'Completed', dateLabel: '15 Jul 2026',
    owner: 'Legal Directorate',
    entry: [{ label: 'Bill record created', status: 'Met' }, { label: 'Template applied', status: 'Met' }],
    exit: [{ label: 'Draft structured and validated', status: 'Met' }, { label: 'Submitted for legal review', status: 'Met' }],
    mandatory: [{ label: 'Draft clauses', done: 17, total: 17 }, { label: 'Run drafting validation', done: 1, total: 1 }],
    approvals: [{ label: 'Drafting sign-off', status: 'Met' }],
    validation: [{ label: 'Structural validation', status: 'Met' }, { label: 'Numbering validation', status: 'Met' }],
    blocking: [],
  },
  {
    id: 'legal-review', name: 'Legal Review', icon: 'Scale', tone: 'green', state: 'In Progress', dateLabel: 'In Progress',
    owner: 'Legal Directorate',
    entry: [
      { label: 'Draft submission received', status: 'Met' },
      { label: 'Drafting validation passed', status: 'Met' },
      { label: 'Workspace opened', status: 'Met' },
    ],
    exit: [
      { label: 'Legal comments resolved', status: 'In Progress' },
      { label: 'PBO financial impact note attached (if required)', status: 'Blocked' },
      { label: 'Approval by Senior Legal Counsel', status: 'Pending' },
    ],
    mandatory: [
      { label: 'Review clause revisions', done: 3, total: 5 },
      { label: 'Verify supporting documents', done: 2, total: 2 },
      { label: 'Receive PBO financial note', done: 0, total: 1 },
      { label: 'Confirm legal citations', done: 1, total: 1 },
      { label: 'Prepare legal review comments', done: 1, total: 1 },
    ],
    approvals: [
      { label: 'Legal Director Approval', status: 'Pending' },
      { label: 'Senior Legal Counsel Approval', status: 'Pending' },
    ],
    validation: [
      { label: 'All comments addressed', status: 'In Progress' },
      { label: 'Required documents attached check', status: 'Blocked' },
      { label: 'Compliance and policy alignment check', status: 'Pending' },
    ],
    blocking: [
      { label: 'PBO financial impact note', requestedOn: '12 Jul 2026', assigneeId: 'pbo-liaison', due: '18 Jul 2026', overdueDays: 3, status: 'Not received' },
    ],
  },
  {
    id: 'procedural-review', name: 'Procedural Review', icon: 'ClipboardCheck', tone: 'gold', state: 'Pending',
    owner: 'Procedural Services',
    entry: [{ label: 'Legal review approved', status: 'Pending' }, { label: 'PBO requirement satisfied', status: 'Pending' }],
    exit: [{ label: 'Procedural checks complete', status: 'Pending' }, { label: 'Routed for signature', status: 'Pending' }],
    mandatory: [{ label: 'Confirm procedural readiness', done: 0, total: 1 }],
    approvals: [{ label: 'Director, DLPS', status: 'Pending' }],
    validation: [{ label: 'Publication information confirmed', status: 'Pending' }],
    blocking: [],
  },
  {
    id: 'signature', name: 'Signature', icon: 'Signature', tone: 'blue', state: 'Pending',
    owner: 'Clerk’s Office',
    entry: [{ label: 'Procedural review complete', status: 'Pending' }],
    exit: [{ label: 'Qualified signature applied', status: 'Pending' }, { label: 'Institutional seal applied', status: 'Pending' }],
    mandatory: [{ label: 'Apply signature', done: 0, total: 1 }],
    approvals: [{ label: 'Authorised signatory', status: 'Pending' }],
    validation: [{ label: 'Version locked', status: 'Pending' }],
    blocking: [],
  },
  {
    id: 'publication', name: 'Publication', icon: 'Globe', tone: 'red', state: 'Pending',
    owner: 'Clerk’s Office',
    entry: [{ label: 'Signed and sealed version available', status: 'Pending' }],
    exit: [{ label: 'Outputs transmitted', status: 'Pending' }, { label: 'Public record available', status: 'Pending' }],
    mandatory: [{ label: 'Generate official outputs', done: 0, total: 1 }],
    approvals: [{ label: 'Clerk authorisation', status: 'Pending' }],
    validation: [{ label: 'AKN validation', status: 'Pending' }],
    blocking: [],
  },
];

// The stage the demo Bill currently sits in.
export const CURRENT_STAGE_ID = 'legal-review';

// Status → pastel tone (text + icon always accompany colour).
export const taskStatusTone: Record<BillTaskStatus, WorkflowTone> = {
  'In Progress': 'gold', Pending: 'grey', Blocked: 'red', Completed: 'green', Overdue: 'red',
};
export const reqStatusTone: Record<ReqStatus, WorkflowTone> = {
  Met: 'green', 'In Progress': 'gold', Blocked: 'red', Pending: 'grey',
};
