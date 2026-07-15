import type { WorkflowType, Priority } from './types';
import type { Tone } from '@/components/ui/tone';

// ---- My Work operational model (self-contained display data) ----

export type WorkState =
  | 'requires-action'
  | 'in-progress'
  | 'awaiting-review'
  | 'waiting-on-others'
  | 'completed';

export interface AssignedPerson {
  id: string;
  name: string;
  roleLabel: string;
  initials: string;
}

export interface BlockingIssue {
  severity: 'error' | 'warning';
  text: string;
}

export interface WorkItem {
  recordId: string;
  title: string;
  reference: string;
  version?: string;
  type: WorkflowType;
  workState: WorkState;
  stage: string; // display stage
  stageTone: Tone;
  requiredAction: string;
  myRole: string;
  due: string;
  dueUrgent?: boolean;
  dueThisWeek?: boolean;
  overdue?: boolean;
  priority: Priority;
  lastActivity: string;
  actionLabel: string;
  actionTo: string;
  confidentiality: 'Public' | 'Internal' | 'Restricted' | 'Confidential';
  directorate: 'DLS' | 'DLPS' | 'Joint';
  // Quick View detail
  requiredActionLong: string;
  previousStage?: string;
  currentStageSince?: string;
  nextStage?: string;
  currentTask: string;
  progress: { done: number; total: number };
  blockingIssues: BlockingIssue[];
  assignedPeople: AssignedPerson[];
  commentCount: number;
  attachmentCount: number;
}

export interface WorkStateMeta {
  id: WorkState;
  listTitle: string;
  boardTitle: string;
  tone: Tone;
  defaultCollapsed?: boolean;
}

export const WORK_STATES: WorkStateMeta[] = [
  { id: 'requires-action', listTitle: 'Requires My Action', boardTitle: 'Requires My Action', tone: 'red' },
  { id: 'in-progress', listTitle: 'In Progress', boardTitle: 'In Progress', tone: 'gold' },
  { id: 'awaiting-review', listTitle: 'Awaiting Review', boardTitle: 'Awaiting Review', tone: 'blue' },
  { id: 'waiting-on-others', listTitle: 'Waiting on Another Officer', boardTitle: 'Waiting on Others', tone: 'grey' },
  { id: 'completed', listTitle: 'Recently Completed', boardTitle: 'Completed', tone: 'green', defaultCollapsed: true },
];

const P = (id: string, name: string, roleLabel: string): AssignedPerson => ({
  id, name, roleLabel,
  initials: name === 'Office of the Clerk' ? 'OC' : name.split(' ').slice(0, 2).map((s) => s[0]).join(''),
});

const GRACE = P('dls-drafter', 'Grace Wanjiku', 'Drafter (You)');
const DAVID = P('dls-reviewer', 'David Otieno', 'Legal Reviewer');
const RUTH = P('dlps-officer', 'Ruth Naliaka', 'Procedural Reviewer');

export const workItems: WorkItem[] = [
  // ---- Requires My Action ----
  {
    recordId: 'NA-BILL-2026-015', title: 'Digital Public Services Bill, 2026', reference: 'NA/BILL/2026/015', version: '4.0',
    type: 'Bill', workState: 'requires-action', stage: 'Revision Requested', stageTone: 'red',
    requiredAction: 'Resolve blocking comment on Clause 14', myRole: 'Drafter',
    due: 'Today, 4:00 PM', dueUrgent: true, dueThisWeek: true, priority: 'High',
    lastActivity: 'Returned 36 mins ago by David Otieno', actionLabel: 'Continue Revision', actionTo: '/legislative/NA-BILL-2026-015/draft?mode=revision',
    confidentiality: 'Internal', directorate: 'DLS',
    requiredActionLong: 'Resolve the blocking comment on Clause 14 and submit a corrected version.',
    previousStage: 'Legal Review', currentStageSince: 'Since 15 July 2026 (2 days)', nextStage: 'Procedural Review',
    currentTask: 'Resolve blocking comment', progress: { done: 3, total: 4 },
    blockingIssues: [{ severity: 'error', text: '1 blocking comment' }, { severity: 'warning', text: '1 cross-reference warning' }],
    assignedPeople: [GRACE, DAVID, RUTH], commentCount: 2, attachmentCount: 2,
  },
  {
    recordId: 'NA-BILL-2026-011', title: 'Public Procurement and Asset Disposal Amendment Bill, 2026', reference: 'NA/BILL/2026/011', version: '3.1',
    type: 'Bill', workState: 'requires-action', stage: 'Legal Review', stageTone: 'green',
    requiredAction: 'Review changes to Clauses 8–11', myRole: 'Reviewer',
    due: 'Tomorrow', dueUrgent: true, dueThisWeek: true, priority: 'High',
    lastActivity: 'Version 3.1 submitted this morning', actionLabel: 'Review Draft', actionTo: '/legislative/NA-BILL-2026-011/review',
    confidentiality: 'Internal', directorate: 'DLS',
    requiredActionLong: 'Review the changes to Clauses 8–11 and record a legal review decision.',
    previousStage: 'Drafting', currentStageSince: 'Since 14 July 2026 (1 day)', nextStage: 'Legal Approval',
    currentTask: 'Review submitted changes', progress: { done: 1, total: 3 },
    blockingIssues: [], assignedPeople: [P('counsel-barasa', 'Peter Barasa', 'Drafter'), GRACE], commentCount: 3, attachmentCount: 1,
  },
  {
    recordId: 'NA-PET-2026-084', title: 'Petition on Assisted Access to Digital Government Services', reference: 'NA/PET/2026/084', version: '1.0',
    type: 'Petition', workState: 'requires-action', stage: 'Intake Verification', stageTone: 'gold',
    requiredAction: 'Confirm legal classification', myRole: 'Legal reviewer',
    due: 'Today', dueUrgent: true, dueThisWeek: true, priority: 'Medium',
    lastActivity: 'Submitted this morning', actionLabel: 'Review Petition', actionTo: '/legislative/NA-PET-2026-084',
    confidentiality: 'Public', directorate: 'DLS',
    requiredActionLong: 'Confirm the legal classification of the petition before it is routed.',
    previousStage: 'Received', currentStageSince: 'Since this morning', nextStage: 'Assignment',
    currentTask: 'Confirm classification', progress: { done: 0, total: 2 },
    blockingIssues: [], assignedPeople: [GRACE], commentCount: 0, attachmentCount: 1,
  },
  // ---- In Progress ----
  {
    recordId: 'NA-SI-2026-027', title: 'Statutory Instruments Tracking Regulations, 2026', reference: 'NA/SI/2026/027', version: '2.0',
    type: 'Statutory Instrument', workState: 'in-progress', stage: 'Drafting', stageTone: 'blue',
    requiredAction: 'Continue drafting Part III', myRole: 'Drafter',
    due: '18 July 2026', dueThisWeek: true, priority: 'Medium',
    lastActivity: 'Edited yesterday', actionLabel: 'Continue Drafting', actionTo: '/legislative/NA-SI-2026-027/draft',
    confidentiality: 'Internal', directorate: 'DLS',
    requiredActionLong: 'Continue drafting Part III of the regulations.',
    previousStage: 'Internal Review', currentStageSince: 'Since 12 July 2026', nextStage: 'Legal Review',
    currentTask: 'Draft Part III', progress: { done: 2, total: 5 },
    blockingIssues: [], assignedPeople: [GRACE], commentCount: 1, attachmentCount: 0,
  },
  {
    recordId: 'NA-BILL-2026-018', title: 'National Cybersecurity Coordination Bill, 2026', reference: 'NA/BILL/2026/018', version: '1.0',
    type: 'Bill', workState: 'in-progress', stage: 'Drafting', stageTone: 'blue',
    requiredAction: 'Complete definitions schedule', myRole: 'Drafter',
    due: '19 July 2026', dueThisWeek: true, priority: 'Medium',
    lastActivity: 'Draft updated today', actionLabel: 'Continue', actionTo: '/legislative/NA-BILL-2026-018/draft',
    confidentiality: 'Internal', directorate: 'DLS',
    requiredActionLong: 'Complete the definitions schedule for the Bill.',
    previousStage: 'Intake and Assignment', currentStageSince: 'Since 30 June 2026', nextStage: 'Legal Review',
    currentTask: 'Complete definitions', progress: { done: 1, total: 4 },
    blockingIssues: [], assignedPeople: [GRACE], commentCount: 0, attachmentCount: 1,
  },
  {
    recordId: 'NA-MOT-2026-046', title: 'Motion on Digital Accessibility in Public Institutions', reference: 'NA/MOT/2026/046', version: '2.0',
    type: 'Motion', workState: 'in-progress', stage: 'Legal Review', stageTone: 'green',
    requiredAction: 'Complete admissibility assessment', myRole: 'Reviewer',
    due: '21 July 2026', priority: 'Medium',
    lastActivity: 'Two comments unresolved', actionLabel: 'Review', actionTo: '/legislative/NA-MOT-2026-046',
    confidentiality: 'Public', directorate: 'DLS',
    requiredActionLong: 'Complete the admissibility assessment for the motion.',
    previousStage: 'Drafting', currentStageSince: 'Since 9 July 2026', nextStage: 'Procedural Review',
    currentTask: 'Admissibility assessment', progress: { done: 2, total: 3 },
    blockingIssues: [{ severity: 'warning', text: '2 unresolved comments' }], assignedPeople: [GRACE], commentCount: 2, attachmentCount: 0,
  },
  // ---- Awaiting Review ----
  {
    recordId: 'NA-BILL-2026-017', title: 'Public Service Delivery Amendment Bill, 2026', reference: 'NA/BILL/2026/017', version: '2.0',
    type: 'Bill', workState: 'awaiting-review', stage: 'Legal Review', stageTone: 'green',
    requiredAction: 'Await reviewer decision', myRole: 'Drafter',
    due: '22 July 2026', priority: 'Medium',
    lastActivity: 'Submitted yesterday', actionLabel: 'View Review Status', actionTo: '/legislative/NA-BILL-2026-017',
    confidentiality: 'Internal', directorate: 'DLS',
    requiredActionLong: 'Awaiting the reviewer’s legal review decision.',
    previousStage: 'Drafting', currentStageSince: 'Since 14 July 2026', nextStage: 'Legal Approval',
    currentTask: 'Awaiting review', progress: { done: 4, total: 4 },
    blockingIssues: [], assignedPeople: [GRACE, DAVID], commentCount: 0, attachmentCount: 2,
  },
  {
    recordId: 'NA-SI-REPORT-2026-008', title: 'Statutory Instruments Compliance Report', reference: 'NA/SI/REPORT/2026/008', version: '1.0',
    type: 'Report', workState: 'awaiting-review', stage: 'Directorate Review', stageTone: 'grey',
    requiredAction: 'Await directorate review', myRole: 'Author',
    due: '24 July 2026', priority: 'Low',
    lastActivity: 'Assigned to David Otieno', actionLabel: 'View', actionTo: '/legislative/NA-SI-REPORT-2026-008',
    confidentiality: 'Internal', directorate: 'DLS',
    requiredActionLong: 'Awaiting directorate review of the compliance report.',
    previousStage: 'Drafting', currentStageSince: 'Since 13 July 2026', nextStage: 'Finalisation',
    currentTask: 'Awaiting review', progress: { done: 3, total: 3 },
    blockingIssues: [], assignedPeople: [GRACE, DAVID], commentCount: 1, attachmentCount: 1,
  },
  // ---- Waiting on Another Officer ----
  {
    recordId: 'NA-BILL-2026-009', title: 'Public Finance Amendment Bill, 2026', reference: 'NA/BILL/2026/009', version: '2.0',
    type: 'Bill', workState: 'waiting-on-others', stage: 'Awaiting Supporting Information', stageTone: 'amber',
    requiredAction: 'PBO documentation pending', myRole: 'Drafter',
    due: '20 July 2026', dueThisWeek: true, priority: 'Medium',
    lastActivity: 'Request sent to PBO', actionLabel: 'View Request', actionTo: '/legislative/NA-BILL-2026-009',
    confidentiality: 'Internal', directorate: 'DLS',
    requiredActionLong: 'Awaiting Parliamentary Budget Office documentation before drafting can continue.',
    previousStage: 'Drafting', currentStageSince: 'Since 11 July 2026', nextStage: 'Drafting',
    currentTask: 'Awaiting PBO documentation', progress: { done: 2, total: 4 },
    blockingIssues: [{ severity: 'warning', text: 'PBO documentation pending' }], assignedPeople: [GRACE], commentCount: 0, attachmentCount: 1,
  },
  {
    recordId: 'NA-OP-2026-042', title: 'Order Paper — Sitting No. 42', reference: 'NA/OP/2026/042', version: '1.0',
    type: 'Order Paper', workState: 'waiting-on-others', stage: 'Procedural Review', stageTone: 'green',
    requiredAction: 'Awaiting DLPS confirmation', myRole: 'Collaborator',
    due: 'Tomorrow', dueUrgent: true, dueThisWeek: true, priority: 'High',
    lastActivity: 'Assigned to Ruth Naliaka', actionLabel: 'View Status', actionTo: '/legislative/NA-OP-2026-042',
    confidentiality: 'Internal', directorate: 'DLPS',
    requiredActionLong: 'Awaiting DLPS confirmation of the order of business.',
    previousStage: 'Drafting', currentStageSince: 'Since 14 July 2026', nextStage: 'Published',
    currentTask: 'Awaiting DLPS confirmation', progress: { done: 3, total: 4 },
    blockingIssues: [], assignedPeople: [RUTH, GRACE], commentCount: 0, attachmentCount: 0,
  },
  {
    recordId: 'NA-VP-2026-0714', title: 'Votes and Proceedings — 14 July 2026', reference: 'NA/VP/2026/0714', version: '1.0',
    type: 'Votes and Proceedings', workState: 'waiting-on-others', stage: 'Approval', stageTone: 'gold',
    requiredAction: 'Awaiting Clerk sign-off', myRole: 'Contributor',
    due: '16 July 2026', dueThisWeek: true, priority: 'Medium',
    lastActivity: 'Signature pending', actionLabel: 'View', actionTo: '/legislative/NA-VP-2026-0714',
    confidentiality: 'Internal', directorate: 'DLPS',
    requiredActionLong: 'Awaiting the Clerk’s sign-off on the votes and proceedings.',
    previousStage: 'Procedural Review', currentStageSince: 'Since 14 July 2026', nextStage: 'Published',
    currentTask: 'Awaiting sign-off', progress: { done: 4, total: 4 },
    blockingIssues: [], assignedPeople: [P('clerk', 'Office of the Clerk', 'Authoriser'), RUTH], commentCount: 0, attachmentCount: 0,
  },
  // ---- Recently Completed ----
  {
    recordId: 'NA-BILL-2026-008', title: 'Public Finance Management (Amendment) Bill, 2026', reference: 'NA/BILL/2026/008', version: '7.0',
    type: 'Bill', workState: 'completed', stage: 'Published', stageTone: 'green',
    requiredAction: 'Completed', myRole: 'Drafter',
    due: '1 June 2026', priority: 'Medium',
    lastActivity: 'Published 1 June 2026', actionLabel: 'View', actionTo: '/legislative/NA-BILL-2026-008',
    confidentiality: 'Public', directorate: 'DLS',
    requiredActionLong: 'This Bill has completed its legislative journey and is published.',
    previousStage: 'Signed and Sealed', currentStageSince: 'Since 1 June 2026', nextStage: 'Archived',
    currentTask: 'Complete', progress: { done: 4, total: 4 },
    blockingIssues: [], assignedPeople: [GRACE, DAVID], commentCount: 0, attachmentCount: 3,
  },
  {
    recordId: 'NA-STMT-2026-047', title: 'Statement on Data Protection Compliance', reference: 'NA/STMT/2026/047', version: '1.0',
    type: 'Statement', workState: 'completed', stage: 'Published', stageTone: 'green',
    requiredAction: 'Completed', myRole: 'Reviewer',
    due: '28 June 2026', priority: 'Low',
    lastActivity: 'Published 29 June 2026', actionLabel: 'View', actionTo: '/legislative/NA-STMT-2026-047',
    confidentiality: 'Public', directorate: 'DLPS',
    requiredActionLong: 'This statement has been published.',
    previousStage: 'Procedural Review', currentStageSince: 'Since 29 June 2026', nextStage: 'Archived',
    currentTask: 'Complete', progress: { done: 3, total: 3 },
    blockingIssues: [], assignedPeople: [DAVID], commentCount: 0, attachmentCount: 1,
  },
  {
    recordId: 'NA-MOT-2026-027', title: 'Motion on County Revenue Allocation', reference: 'NA/MOT/2026/027', version: '3.0',
    type: 'Motion', workState: 'completed', stage: 'Published', stageTone: 'green',
    requiredAction: 'Completed', myRole: 'Collaborator',
    due: '15 June 2026', priority: 'Low',
    lastActivity: 'Adopted 16 June 2026', actionLabel: 'View', actionTo: '/legislative/NA-MOT-2026-027',
    confidentiality: 'Public', directorate: 'DLPS',
    requiredActionLong: 'This motion has been adopted.',
    previousStage: 'Procedural Review', currentStageSince: 'Since 16 June 2026', nextStage: 'Archived',
    currentTask: 'Complete', progress: { done: 3, total: 3 },
    blockingIssues: [], assignedPeople: [GRACE], commentCount: 0, attachmentCount: 0,
  },
  {
    recordId: 'NA-QN-2026-138', title: 'Question on Assisted Digital Access Funding', reference: 'NA/QN/2026/138', version: '1.0',
    type: 'Question', workState: 'completed', stage: 'Published', stageTone: 'green',
    requiredAction: 'Completed', myRole: 'Author',
    due: '3 July 2026', priority: 'Low',
    lastActivity: 'Answered 4 July 2026', actionLabel: 'View', actionTo: '/legislative/NA-QN-2026-138',
    confidentiality: 'Public', directorate: 'DLPS',
    requiredActionLong: 'This question has been answered.',
    previousStage: 'Procedural Review', currentStageSince: 'Since 4 July 2026', nextStage: 'Archived',
    currentTask: 'Complete', progress: { done: 2, total: 2 },
    blockingIssues: [], assignedPeople: [GRACE], commentCount: 0, attachmentCount: 0,
  },
];

// ---- Workload indicators ----
export interface Indicator {
  id: string;
  label: string;
  value: number;
  sub: string;
  tone: Tone;
  icon: 'active' | 'action' | 'due' | 'waiting' | 'overdue';
  filter: string; // status filter applied on click
}

export const indicators: Indicator[] = [
  { id: 'active', label: 'Active Work', value: 24, sub: 'All ongoing items', tone: 'green', icon: 'active', filter: 'active' },
  { id: 'requires-action', label: 'Requires My Action', value: 7, sub: 'Needs immediate attention', tone: 'red', icon: 'action', filter: 'requires-action' },
  { id: 'due-week', label: 'Due This Week', value: 6, sub: 'Due by 20 July 2026', tone: 'gold', icon: 'due', filter: 'due-week' },
  { id: 'waiting', label: 'Waiting on Others', value: 9, sub: 'Awaiting other officers', tone: 'blue', icon: 'waiting', filter: 'waiting-on-others' },
  { id: 'overdue', label: 'Overdue', value: 2, sub: 'Past due date', tone: 'red', icon: 'overdue', filter: 'overdue' },
];

// ---- Saved views ----
export interface SavedView {
  id: string;
  label: string;
  count?: number;
  userCreated?: boolean;
}

export const savedViews: SavedView[] = [
  { id: 'all', label: 'All My Work' },
  { id: 'requires-action', label: 'Requires My Action', count: 7 },
  { id: 'due-48', label: 'Due Within 48 Hours', count: 3 },
  { id: 'awaiting-review', label: 'Awaiting Review', count: 4 },
  { id: 'returned', label: 'Returned to Me', count: 2 },
  { id: 'waiting-on-others', label: 'Waiting on Others', count: 9 },
];

export const moreSavedViews: SavedView[] = [
  { id: 'high-priority-bills', label: 'High Priority Bills', userCreated: true },
  { id: 'this-week-publications', label: 'This Week’s Publications', userCreated: true },
  { id: 'clause-reviews', label: 'Clause Reviews', userCreated: true },
];

// ---- Calendar (week of 13–19 July 2026; today = Wed 15) ----
export interface CalendarEvent {
  id: string;
  day: number; // 0 = Mon 13 … 6 = Sun 19
  start: number; // hour (24h)
  end: number;
  title: string;
  type: 'draft-due' | 'review-deadline' | 'publication-deadline' | 'sitting' | 'participation-close' | 'signature-due' | 'reminder';
  tone: Tone;
  recordId?: string;
}

export const calendarWeek = {
  label: '13 – 19 July 2026',
  days: [
    { label: 'Mon', date: 13 }, { label: 'Tue', date: 14 }, { label: 'Wed', date: 15 },
    { label: 'Thu', date: 16 }, { label: 'Fri', date: 17 }, { label: 'Sat', date: 18 }, { label: 'Sun', date: 19 },
  ],
  todayIndex: 2,
};

export const calendarEvents: CalendarEvent[] = [
  { id: 'ev1', day: 0, start: 15, end: 16, title: 'Bill drafting session', type: 'draft-due', tone: 'green' },
  { id: 'ev2', day: 1, start: 9, end: 10, title: 'Legal review meeting', type: 'review-deadline', tone: 'green' },
  { id: 'ev3', day: 1, start: 14, end: 15, title: 'PBO information follow-up', type: 'reminder', tone: 'gold', recordId: 'NA-BILL-2026-009' },
  { id: 'ev4', day: 2, start: 11, end: 12, title: 'DLS directorate briefing', type: 'reminder', tone: 'grey' },
  { id: 'ev5', day: 2, start: 16, end: 17, title: 'Clause 14 revision deadline', type: 'draft-due', tone: 'red', recordId: 'NA-BILL-2026-015' },
  { id: 'ev6', day: 3, start: 10, end: 11, title: 'Review: Public Finance Bill', type: 'review-deadline', tone: 'green', recordId: 'NA-BILL-2026-011' },
  { id: 'ev7', day: 3, start: 15, end: 16, title: 'SI Regulations drafting', type: 'draft-due', tone: 'gold', recordId: 'NA-SI-2026-027' },
  { id: 'ev8', day: 4, start: 9, end: 10, title: 'Public Service Delivery review', type: 'review-deadline', tone: 'green', recordId: 'NA-BILL-2026-017' },
  { id: 'ev9', day: 4, start: 13, end: 14, title: 'Order Paper review', type: 'sitting', tone: 'green', recordId: 'NA-OP-2026-042' },
];

// Items pinned into the sidebar by default (user-controlled; max 3–5).
export const defaultPinned = ['NA-BILL-2026-015', 'NA-BILL-2026-009', 'NA-OP-2026-042'];
export const defaultRecentlyOpened = ['NA-BILL-2026-011', 'NA-PET-2026-084', 'NA-SI-2026-027'];

export function countsByState(): Record<WorkState, number> {
  return workItems.reduce((acc, it) => {
    acc[it.workState] = (acc[it.workState] ?? 0) + 1;
    return acc;
  }, {} as Record<WorkState, number>);
}
