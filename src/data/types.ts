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
  | 'Parliamentary Legislative Proposal Unit'
  | 'Parliamentary Records Service';

// The personas that can be selected at entry. `citizen` uses only the public portal.
export type RoleId =
  | 'dls-drafter'
  | 'dls-reviewer'
  | 'dlps-officer'
  | 'clerk'
  | 'participation-officer'
  | 'records-officer'
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

  // ---- Repository / search metadata (Phase 4) ----
  // How the record entered the system. Absent = a structured legislative record.
  recordSource?: 'Structured' | 'Uploaded' | 'Historical scan' | 'Public submission' | 'Generated output';
  // For historical scans: OCR verification state and provenance.
  ocrStatus?: 'Verified' | 'Awaiting verification';
  sourceArchive?: string;
  sponsor?: string;
  // Explicit official-output formats; when absent they are derived from the stage.
  formats?: OutputFormat[];
  // A short institutional label used where a record is an enacted Act, gazette, etc.
  citation?: string; // e.g. "Act No. 23 of 2019"
}

export type OutputFormat = 'PDF' | 'HTML' | 'AKN XML' | 'Accessible HTML' | 'Scan' | 'OCR Text';

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
  | 'Stage Change'
  | 'Workflow';

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

// ---- Search & Legislative Repository (Phase 4) ----

export type SearchMode = 'all' | 'exact' | 'meaning' | 'within';

// How a passage matched the query — shown on every result so relevance is never
// conveyed by colour alone.
export type MatchType =
  | 'Exact phrase'
  | 'Title'
  | 'Reference'
  | 'Clause text'
  | 'Meaning and context'
  | 'Related record';

// A single clause/passage-level search hit against a record.
export interface Passage {
  id: string;
  recordId: string;
  clauseNumber?: number;
  clauseRef?: string; // "Clause 14 — Protection of vulnerable users"
  matchType: MatchType;
  excerpt: string; // plain text; matching phrases are wrapped at render time
  highlights: string[]; // phrases to highlight within the excerpt
  why: string; // "why this matched" explanation
  relevance: number; // 0–100, deterministic
}

export interface GroundedEvidence {
  label: string; // "Clause 14 — Protection of vulnerable users"
  recordId: string;
  clauseNumber?: number;
  passageId?: string;
}

// A pre-authored, evidence-grounded answer for a question-style query.
export interface GroundedAnswer {
  paragraphs: string[];
  evidence: GroundedEvidence[];
  sourceCount: number;
  clauseCount: number;
}

// A deterministic seeded query the prototype answers convincingly.
export interface SeededQuery {
  id: string;
  keywords: string[]; // lowercased trigger terms
  answer?: GroundedAnswer; // present only for question-style searches
  passageIds: string[]; // ordered best-first
}

export interface RepositoryCollection {
  id: string;
  label: string;
  icon: string; // lucide icon name
  tone: 'green' | 'gold' | 'grey' | 'red' | 'amber' | 'blue';
  count: string; // "12 active · 186 archived"
  description: string;
  restrictedCount?: number;
  to: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  mode: SearchMode;
  filterSummary: string;
  resultCount: number;
  lastRun: string; // ISO
  visibility: 'Only me' | 'Directorate' | 'Selected users';
  notify: boolean;
  ownerId: RoleId;
}

export interface RecentSearch {
  id: string;
  query: string;
  mode: SearchMode;
  viewedAt: string; // ISO
  resultCount: number;
  ownerId: RoleId;
  pinned?: boolean;
}

export interface ResearchItem {
  passageId?: string;
  recordId: string;
  clauseNumber?: number;
  clauseRef?: string;
  excerpt?: string;
  versionLabel?: string;
  note?: string;
  addedAt: string;
}

export interface ResearchCollection {
  id: string;
  name: string;
  description?: string;
  ownerId: RoleId;
  items: ResearchItem[];
  createdAt: string;
}

export interface AccessRequest {
  id: string;
  recordId: string;
  requesterId: RoleId;
  accessLevel: string;
  purpose: string;
  duration: string;
  approver: string;
  note?: string;
  status: 'Pending' | 'Approved' | 'Declined';
  requestedAt: string;
}

// ---- OCR & Historical Records (Phase 5) ----

export type OcrStatus =
  | 'Awaiting Processing'
  | 'Processing'
  | 'Needs Verification'
  | 'Quality Review'
  | 'Ready to Archive'
  | 'Verified'
  | 'Attention Required';

export type OcrLineKind = 'title' | 'heading' | 'subheading' | 'body' | 'page-number' | 'margin';

// A single extracted line of text, positioned on the scan for region overlays.
export interface OcrLine {
  id: string;
  n: number;
  text: string;
  kind: OcrLineKind;
  confidence: number; // 0–100 extraction confidence
  low?: boolean; // flagged low-confidence region
  corrected?: boolean;
  originalText?: string; // OCR value before correction
  // Region rectangle on the scan page, as percentages of page dimensions.
  region?: { top: number; left: number; width: number; height: number };
}

export type OcrPageState = 'not-reviewed' | 'in-progress' | 'verified' | 'needs-review' | 'missing';

export interface OcrPage {
  n: number;
  state: OcrPageState;
  confidence: number;
  issues: number;
  lines: OcrLine[];
}

export type OcrIssueSeverity = 'blocking' | 'review' | 'info';
export type OcrIssueStatus = 'open' | 'resolved' | 'accepted' | 'unreadable' | 'flagged';

export interface OcrIssue {
  id: string;
  page: number;
  lineId?: string;
  severity: OcrIssueSeverity;
  type: string; // "Low confidence text", "Possible spelling error", …
  title: string;
  explanation?: string;
  location: string; // "Page 7 · Paragraph 3 · Lines 8–10"
  confidence?: number;
  originalOcr?: string;
  suggestion?: string;
  status: OcrIssueStatus;
}

export interface OcrCorrection {
  id: string;
  page: number;
  lineId: string;
  original: string;
  corrected: string;
  officerId: RoleId | string;
  at: string;
  confidenceBefore: number;
}

export interface OcrStructureNode {
  id: string;
  label: string;
  kind: 'title' | 'section' | 'subsection';
  confirmed?: boolean;
  children?: OcrStructureNode[];
}

export interface OcrMetaField {
  field: string;
  value: string;
  state: 'Suggested' | 'Confirmed' | 'Needs Review';
}

export interface OcrChecklistItem {
  id: string;
  label: string;
  done: boolean;
  optional?: boolean;
}

// A digitisation job — one imported historical document moving through the pipeline.
export interface OcrJob {
  id: string; // HIST-OCR-2026-0048
  reference: string; // HIST/OP/1984/0612
  title: string;
  dateLabel: string; // "12 June 1984"
  recordType: WorkflowType | 'Committee Report' | 'Gazette' | 'Correspondence' | 'Other archival record';
  sourceArchive: string;
  sourceFormat: string; // "Scanned PDF"
  pageCount: number;
  status: OcrStatus;
  processingStep?: string; // "Detecting structure"
  processingProgress?: number; // 0–100 for actively processing
  ocrConfidence: number;
  lowConfidenceRegions: number;
  verifiedPages: number;
  issueCount: number;
  assignedToId?: RoleId | string;
  reviewerId?: RoleId | string;
  updatedAt: string;
  classification: Confidentiality;
  restricted?: boolean;
  physicalRef?: string;
  shelf?: string;
  language: string;
  notes?: string;
  importedById: RoleId | string;
  importedAt: string;
  checksum: string;
  // Rich content for the primary demonstration record.
  pages?: OcrPage[];
  issues?: OcrIssue[];
  corrections?: OcrCorrection[];
  structure?: OcrStructureNode[];
  metadata?: OcrMetaField[];
  checklist?: OcrChecklistItem[];
  // Flags used by exception-state demos.
  suspectedMissingPage?: number;
  suspectedDuplicateOf?: string;
}

// ---- Workflow Catalogue & Configuration (Priority 0 sanity sprint) ----

// Reuse the pastel tone vocabulary from the design system. "blue" is repurposed
// to neutral charcoal — never an actual blue (standing palette override).
export type WorkflowTone = 'green' | 'gold' | 'grey' | 'red' | 'amber' | 'blue';

// Whether the configuration is live (published) or still being edited (draft).
export type WorkflowPublishState = 'Published' | 'Draft';

// A coarse health/configuration signal shown on the catalogue.
export type WorkflowConfigStatus = 'Active' | 'Complete' | 'Needs Review' | 'Draft';

// One configurable stage inside a workflow template. Every field maps to a real
// control in the Template Detail screen and the Edit Workflow Stage side sheet.
export interface WorkflowStageDef {
  id: string; // 'legal-review'
  name: string; // 'Legal Review'
  icon: string; // lucide icon name resolved at render time
  tone: WorkflowTone; // pastel tone for the stage card
  description: string; // one line, shown on cards that carry descriptions
  owner: string; // 'Legal Reviewer'
  sla: number; // service-level target
  slaUnit: 'Days' | 'Hours';
  requiredApproval: string; // 'Required' · 'Director, DLPS' · 'None'
  escalationTrigger: string; // 'After 48 hours'
  allowRework: boolean;
  autoAdvance: boolean;
  active: boolean;
  // The eight configuration facets rendered as cards / tabs.
  entryConditions: string[];
  exitConditions: string[];
  roles: string[];
  tasks: string[];
  documents: string[];
  notifications: string[];
  escalations: string[]; // "Overdue review > 48 hours → Escalate to Director, DLS"
  auditEvents: string[];
  outputs: string[]; // required-output chips
}

// A quick-preview notification shown in the catalogue side sheet.
export interface WorkflowPreviewNote {
  category: 'Review' | 'Deadline' | 'Approval' | 'System';
  title: string;
  body: string;
  at: string; // display label, e.g. "Today, 10:42 AM"
}

// A single workflow instance in the comparison matrix.
export interface WorkflowComparisonFacet {
  directorate: string;
  version: string;
  status: WorkflowPublishState;
  stages: number;
  activeRecords: number;
  approvals: number;
  pboDependency: string; // "Often (assessment required)" · "Not required" · …
  keyDocuments: string[];
  duration: string; // "Weeks to months"
}

// A configured legislative workflow template. All ten required legislative types
// appear in the catalogue; Bills / Order Paper / Supply carry full stage configs.
export interface WorkflowTemplate {
  type: WorkflowType;
  slug: string; // 'bills' — used in /admin/workflows/:slug
  name: string; // 'Bills Workflow'
  workflowId: string; // 'WF-BILLS-001'
  description: string;
  directorate: string; // full directorate name
  directorateAbbrev: string; // 'DLS' · 'DLPS' · 'DLS / DLPS'
  version: string; // 'v3.2'
  publishState: WorkflowPublishState;
  configStatus: WorkflowConfigStatus;
  activeRecords: number;
  lastUpdated: string; // ISO date
  lastUpdatedBy: string; // display name
  adminId: string; // officer id of the responsible administrator
  illustrative: boolean; // show the SOP-confirmation notice
  stages: WorkflowStageDef[];
  approvalsCount: number;
  outputs: OutputFormat[];
  rolesSummary: string[]; // role chips for the quick preview
  previewNotes: WorkflowPreviewNote[];
  comparison: WorkflowComparisonFacet; // row used by the comparison matrix
  // Set true once a published workflow is edited — publishing clears it and
  // rolls the version forward (never overwrites active records silently).
  hasUnpublishedChanges?: boolean;
}
