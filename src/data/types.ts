// Domain model for the LIMS prototype.
// These types describe the seeded legislative data and the runtime demo state.

export type WorkflowType =
  | 'Bill'
  | 'Motion'
  | 'Question'
  | 'Statement'
  | 'Petition'
  | 'Order Paper'
  | 'Votes and Proceedings'
  | 'Papers Laid'
  | 'Statutory Instrument'
  | 'Supply'
  | 'Report';

// The illustrative configured workflow stage machine.
export type WorkflowStage =
  | 'Instruction Received'
  | 'Intake and Assignment'
  | 'Drafting'
  | 'Legal Review'
  | 'Revision Requested'
  | 'Legal Approval'
  | 'Procedural Review'
  | 'Awaiting Signature'
  | 'Signed and Sealed'
  | 'Published'
  | 'Archived';

export type Priority = 'High' | 'Medium' | 'Low';

export type Confidentiality =
  | 'Internal until publication'
  | 'Restricted'
  | 'Public'
  | 'Confidential';

export type Directorate =
  | 'Directorate of Legal Services'
  | 'Directorate of Legislative and Procedural Services'
  | 'Office of the Clerk'
  | 'Parliamentary Legislative Proposal Unit';

// The personas that can be selected at entry. `citizen` uses only the public portal.
export type RoleId =
  | 'dls-drafter'
  | 'dls-reviewer'
  | 'dlps-officer'
  | 'clerk'
  | 'participation-officer'
  | 'ict-admin'
  | 'citizen';

export interface Persona {
  id: RoleId;
  name: string;
  roleTitle: string;
  directorate: Directorate | 'Public';
  initials: string;
  internal: boolean;
  summary: string;
}

export interface Officer {
  id: string;
  name: string;
  roleTitle: string;
  directorate: Directorate | 'Public';
  initials: string;
}

// A legislative record — a Bill, Motion, Petition, etc.
export interface LegislativeRecord {
  id: string; // e.g. NA-BILL-2026-015
  reference: string; // e.g. NA/BILL/2026/015
  title: string;
  shortTitle: string;
  workflowType: WorkflowType;
  stage: WorkflowStage;
  priority: Priority;
  confidentiality: Confidentiality;
  directorate: Directorate;
  originatingOffice: string;
  drafterId: string;
  reviewerId: string;
  proceduralOfficerId?: string;
  currentVersion: string; // e.g. "4.0"
  currentVersionLabel: string; // e.g. "Legal Review Draft"
  dueDate: string; // ISO date
  createdDate: string;
  lastUpdated: string; // ISO datetime
  year: number;
  restricted: boolean;
  publicParticipation: 'Not applicable' | 'Anticipated' | 'Open' | 'Closed';
  submissionCount: number;
  summary: string; // plain-language / institutional summary
  isPrimary?: boolean;
}

export interface Clause {
  number: number;
  heading: string;
  // Legislative prose. Sub-paragraphs separated for structured rendering later.
  paragraphs: string[];
  changed?: boolean; // changed since previous version (redline aid)
  commentCount?: number;
  hasWarning?: boolean;
}

export interface BillContent {
  recordId: string;
  longTitle: string;
  preamble: string;
  clauses: Clause[];
}

export type VersionStatus =
  | 'Initial Draft'
  | 'Internal Review Draft'
  | 'Revised Draft'
  | 'Legal Review Draft'
  | 'Correction'
  | 'Approved Legal Version'
  | 'Published Version';

export interface Version {
  id: string;
  recordId: string;
  version: string; // "4.0"
  label: string;
  status: VersionStatus;
  createdById: string;
  createdAt: string; // ISO datetime
  reason: string;
  approvalState: 'Draft' | 'Submitted' | 'Approved' | 'Published' | 'Superseded' | 'Not yet available';
  recordIdentifier: string; // permanent record id
  outputs: Array<'PDF' | 'HTML' | 'AKN XML'>;
  isOfficial?: boolean;
}

export type TaskStatus = 'Open' | 'In Progress' | 'Blocked' | 'Completed';

export interface Task {
  id: string;
  recordId: string;
  title: string;
  assigneeId: string;
  dueDate: string;
  status: TaskStatus;
  stage: WorkflowStage;
  dependency?: string;
  completedAt?: string;
}

export type NotificationCategory =
  | 'Assignment'
  | 'Review'
  | 'Deadline'
  | 'Return'
  | 'Approval'
  | 'Public Submission'
  | 'Publication'
  | 'System';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  recipientId: string;
  recordId?: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export type SubmissionPosition =
  | 'Support'
  | 'Oppose'
  | 'Suggest amendment'
  | 'General observation';

export type CitizenStatus =
  | 'Received'
  | 'Completeness check'
  | 'Under parliamentary review'
  | 'Associated with legislative process'
  | 'Consideration completed'
  | 'Closed';

export interface Submission {
  id: string; // PPS-2026-00841
  recordId: string;
  participantType: 'Individual' | 'Organisation';
  participantName: string;
  organisation?: string;
  email: string;
  phone?: string;
  county: string;
  clauseNumber?: number;
  position: SubmissionPosition;
  text: string;
  attachments: string[];
  submittedAt: string;
  citizenStatus: CitizenStatus;
  completeness: 'Complete' | 'Incomplete';
  duplicateRisk: 'None' | 'Low' | 'Possible';
  assignedOfficerId?: string;
  internalNote?: string;
  citizenMessage?: string;
  lastUpdated: string;
}

export type AuditActionType =
  | 'Create'
  | 'Edit'
  | 'AI Suggestion'
  | 'Comment'
  | 'Approval'
  | 'Return'
  | 'Signature'
  | 'Seal'
  | 'Publication'
  | 'Access'
  | 'Submission'
  | 'Stage Change';

export interface AuditEvent {
  id: string;
  recordId: string;
  timestamp: string;
  actorId: string;
  actorRole: string;
  actionType: AuditActionType;
  description: string;
  previousValue?: string;
  newValue?: string;
  version?: string;
  session?: string;
  result: 'Success' | 'Blocked' | 'Pending';
  integrity: 'Verified';
}

export interface Comment {
  id: string;
  recordId: string;
  clauseNumber?: number;
  authorId: string;
  text: string;
  createdAt: string;
  blocking: boolean;
  resolved: boolean;
}

// A pre-authored AI suggestion tied to a clause (advisory only).
export interface AiSuggestion {
  id: string;
  recordId: string;
  clauseNumber: number;
  kind: 'Clearer wording' | 'Consistency' | 'Ambiguity' | 'Explanatory note';
  targetText: string;
  suggestedText: string;
  explanation: string;
}

export interface ValidationIssue {
  id: string;
  recordId: string;
  clauseNumber?: number;
  severity: 'Error' | 'Warning' | 'Info';
  message: string;
  resolved: boolean;
  resolvable: boolean;
}
