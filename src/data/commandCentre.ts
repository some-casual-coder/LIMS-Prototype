import type { RoleId, WorkflowType, Priority } from './types';
import { countByStatus, countByStage, worklistFor } from './myWork';

// Presentation model for the Legislative Command Centre. Kept separate from the
// canonical record model because these are role-specific operational views.

export type Tone = 'green' | 'gold' | 'amber' | 'red' | 'grey' | 'blue';

export interface QueueRow {
  recordId: string;
  title: string;
  reference: string;
  version?: string;
  type: WorkflowType;
  stage: string;
  stageTone: Tone;
  requiredAction: string;
  ownerId: string;
  ownerName: string;
  due: string;
  dueUrgent?: boolean;
  priority: Priority;
  activity: string;
  actionLabel: string;
  actionTo: string;
}

export interface QueueGroup {
  id: string;
  title: string;
  tone: Tone;
  rows: QueueRow[];
  collapsed?: boolean;
  // For "Recently Completed" we show a count without listing every row.
  overflowCount?: number;
}

export interface SummaryCard {
  id: string;
  label: string;
  value: number;
  sub: string;
  tone: Tone;
  icon: 'action' | 'due' | 'returned' | 'review';
  to?: string;
  /** True when the same total is already represented by the primary queue group. */
  repeatsQueue?: boolean;
}

export interface ReadinessItem { label: string; count: number; tone: Tone; to?: string }
export interface AttentionItem { title: string; sub: string; tone: Tone; to: string; importance?: 'High' | 'Medium' }
export interface ActivityItem { time: string; text: string; ref?: string; to?: string }
export interface RecentItem {
  recordId: string; title: string; reference: string; version?: string;
  stage: string; stageTone: Tone; actionLabel: string; to: string;
}

/** A record actively being progressed, with completion % (functional link). */
export interface ProgressRecord { title: string; sub: string; pct: number; tone: Tone; to: string; icon: 'draft' | 'publish' }
/** Distribution of the officer's active caseload across legislative stages. */
export interface StageDatum { stage: string; count: number; tone: Tone; to: string }
/** External inputs a record depends on (PBO, public participation). */
export interface SupportingInput { label: string; count: number; sub: string; tone: Tone; to: string }

export interface CommandCentreData {
  attentionCount: number;
  contextDate: string;
  summaryCards: SummaryCard[];
  groups: QueueGroup[];
  /** Extra groups shown only in the "Directorate Work" view. */
  directorateExtra?: QueueGroup[];
  /** Records being actively progressed, with completion % — replaces the
      old readiness-duplicating pipeline. */
  progressRecords: ProgressRecord[];
  /** Active caseload by legislative stage (drill-down to filtered My Work). */
  workByStage: StageDatum[];
  /** PBO and public-participation dependencies awaiting action. */
  supportingInputs: SupportingInput[];
  readiness: {
    nextSitting: string;
    items: ReadinessItem[];
  };
  attention: AttentionItem[];
  activity: ActivityItem[];
  recent: RecentItem[];
}

// Active caseload grouped by stage → top 5 stages + aggregated "Other".
// One bar segment = one record; drilling in opens My Work filtered by stage.
// Display-tone overrides for the stage distribution — keeps the palette varied
// and meaningful (Drafting reads as gold rather than charcoal).
const STAGE_TONE: Record<string, Tone> = { Drafting: 'gold' };

function computeWorkByStage(role: RoleId): StageDatum[] {
  const active = worklistFor(role).filter((i) => i.workState !== 'completed');
  const map = new Map<string, { count: number; tone: Tone }>();
  active.forEach((i) => {
    const entry = map.get(i.stage) ?? { count: 0, tone: STAGE_TONE[i.stage] ?? i.stageTone };
    entry.count += 1;
    map.set(i.stage, entry);
  });
  const rows = [...map.entries()]
    .map(([stage, { count, tone }]) => ({ stage, count, tone, to: `/work?stage=${encodeURIComponent(stage)}` }))
    .sort((a, b) => b.count - a.count);
  const top = rows.slice(0, 4);
  const rest = rows.slice(4);
  if (rest.length) {
    top.push({ stage: 'Other stages', count: rest.reduce((n, r) => n + r.count, 0), tone: 'grey', to: '/work?status=active' });
  }
  return top;
}

const CONTEXT_DATE = 'Directorate of Legal Services · Wednesday, 15 July 2026';

// Counts derived from the drafter worklist so each card matches the list it
// opens (e.g. "Awaiting My Review" shows exactly the number of awaiting-review
// records at /work?status=awaiting-review).
const DRAFTER_ACTION = countByStatus('requires-action', 'dls-drafter');
const DRAFTER_DUE_48 = countByStatus('due-48', 'dls-drafter');
const DRAFTER_RETURNED = countByStatus('returned', 'dls-drafter');
const DRAFTER_REVIEW = countByStatus('awaiting-review', 'dls-drafter');
const DRAFTER_DUE_48_HIGH = worklistFor('dls-drafter').filter((i) => i.dueUrgent && i.priority === 'High').length;
const DRAFTER_SUPPORTING = countByStage('Awaiting Supporting Information', 'dls-drafter');
const DRAFTER_PETITIONS = countByStage('Intake Verification', 'dls-drafter');

// ---- DLS Drafter (Grace Wanjiku) — fully specified per the Phase 1 brief ----
const drafterData: CommandCentreData = {
  attentionCount: DRAFTER_ACTION,
  contextDate: CONTEXT_DATE,
  summaryCards: [
    { id: 'action', label: 'Requires My Action', value: DRAFTER_ACTION, sub: '2 added today', tone: 'gold', icon: 'action', to: '/work?status=requires-action', repeatsQueue: true },
    { id: 'due', label: 'Due Within 48 Hours', value: DRAFTER_DUE_48, sub: `${DRAFTER_DUE_48_HIGH} marked high priority`, tone: 'amber', icon: 'due', to: '/work?status=due-48' },
    { id: 'returned', label: 'Returned for Revision', value: DRAFTER_RETURNED, sub: 'Rework and resubmit', tone: 'red', icon: 'returned', to: '/work?status=returned' },
    { id: 'review', label: 'Awaiting My Review', value: DRAFTER_REVIEW, sub: 'Oldest waiting 2 days', tone: 'green', icon: 'review', to: '/work?status=awaiting-review' },
  ],
  groups: [
    {
      id: 'requires-action', title: 'Requires My Action', tone: 'gold',
      rows: [
        {
          recordId: 'NA-BILL-2026-015', title: 'Digital Public Services Bill, 2026', reference: 'NA/BILL/2026/015', version: '4.0',
          type: 'Bill', stage: 'Revision Requested', stageTone: 'red',
          requiredAction: 'Resolve blocking comment on Clause 14', ownerId: 'dls-drafter', ownerName: 'Grace Wanjiku',
          due: 'Today, 4:00 PM', dueUrgent: true, priority: 'High',
          activity: 'Returned 36 min ago by David Otieno', actionLabel: 'Continue Revision', actionTo: '/legislative/NA-BILL-2026-015/draft?mode=revision',
        },
        {
          recordId: 'NA-BILL-2026-011', title: 'Public Procurement and Asset Disposal Amendment Bill, 2026', reference: 'NA/BILL/2026/011',
          type: 'Bill', stage: 'Legal Review', stageTone: 'green',
          requiredAction: 'Review changes to Clauses 8–11', ownerId: 'dls-drafter', ownerName: 'Grace Wanjiku',
          due: 'Tomorrow', dueUrgent: true, priority: 'High',
          activity: 'Awaiting your review', actionLabel: 'Review Draft', actionTo: '/legislative/NA-BILL-2026-011',
        },
        {
          recordId: 'NA-PET-2026-084', title: 'Petition on Assisted Access to Digital Government Services', reference: 'NA/PET/2026/084',
          type: 'Petition', stage: 'Intake Verification', stageTone: 'gold',
          requiredAction: 'Confirm legal classification', ownerId: 'dls-drafter', ownerName: 'Grace Wanjiku',
          due: 'Today', dueUrgent: true, priority: 'Medium',
          activity: 'Submitted this morning', actionLabel: 'Review Petition', actionTo: '/legislative/NA-PET-2026-084',
        },
      ],
    },
    {
      id: 'in-progress', title: 'In Progress', tone: 'green',
      rows: [
        {
          recordId: 'NA-SI-2026-027', title: 'Statutory Instruments Tracking Regulations, 2026', reference: 'NA/SI/2026/027',
          type: 'Statutory Instrument', stage: 'Drafting', stageTone: 'blue',
          requiredAction: 'Continue drafting Part III', ownerId: 'dls-drafter', ownerName: 'Grace Wanjiku',
          due: '18 Jul 2026', priority: 'Medium', activity: 'Last edited yesterday', actionLabel: 'Continue', actionTo: '/legislative/NA-SI-2026-027/draft',
        },
        {
          recordId: 'NA-BILL-2026-009', title: 'Public Finance Amendment Bill, 2026', reference: 'NA/BILL/2026/009',
          type: 'Bill', stage: 'Awaiting Information', stageTone: 'amber',
          requiredAction: 'Review received PBO documentation', ownerId: 'dls-drafter', ownerName: 'Grace Wanjiku',
          due: '20 Jul 2026', priority: 'Medium', activity: 'PBO documents attached', actionLabel: 'Open', actionTo: '/legislative/NA-BILL-2026-009',
        },
        {
          recordId: 'NA-MOT-2026-046', title: 'Motion on Digital Accessibility in Public Institutions', reference: 'NA/MOT/2026/046',
          type: 'Motion', stage: 'Legal Review', stageTone: 'green',
          requiredAction: 'Complete admissibility review', ownerId: 'dls-drafter', ownerName: 'Grace Wanjiku',
          due: '21 Jul 2026', priority: 'Medium', activity: 'Pending task comments', actionLabel: 'Review', actionTo: '/legislative/NA-MOT-2026-046',
        },
        {
          recordId: 'NA-BILL-2026-018', title: 'National Cybersecurity Coordination Bill, 2026', reference: 'NA/BILL/2026/018',
          type: 'Bill', stage: 'Drafting', stageTone: 'blue',
          requiredAction: 'Complete definition schedule', ownerId: 'dls-drafter', ownerName: 'Grace Wanjiku',
          due: '19 Jul 2026', priority: 'Medium', activity: 'Draft updated today', actionLabel: 'Continue', actionTo: '/legislative/NA-BILL-2026-018/draft',
        },
      ],
    },
    {
      id: 'awaiting-officer', title: 'Awaiting Another Officer', tone: 'grey',
      overflowCount: 3,
      rows: [
        {
          recordId: 'NA-OP-2026-042', title: 'Order Paper — Sitting No. 42', reference: 'NA/OP/2026/042',
          type: 'Order Paper', stage: 'Procedural Review', stageTone: 'green',
          requiredAction: 'Awaiting DLPS confirmation', ownerId: 'dlps-officer', ownerName: 'Ruth Naliaka',
          due: 'Tomorrow', dueUrgent: true, priority: 'High', activity: 'With DLPS', actionLabel: 'View', actionTo: '/legislative/NA-OP-2026-042',
        },
        {
          recordId: 'NA-VP-2026-0714', title: 'Votes and Proceedings — 14 July 2026', reference: 'NA/VP/2026/0714',
          type: 'Votes and Proceedings', stage: 'Approval', stageTone: 'gold',
          requiredAction: 'Awaiting sign-off', ownerId: 'clerk', ownerName: 'Office of the Clerk',
          due: '16 Jul 2026', priority: 'Medium', activity: 'Pending signature', actionLabel: 'View', actionTo: '/legislative/NA-VP-2026-0714',
        },
      ],
    },
    {
      id: 'recently-completed', title: 'Recently Completed', tone: 'green', collapsed: true, overflowCount: 8,
      rows: [],
    },
  ],
  directorateExtra: [
    {
      id: 'colleagues', title: 'Colleagues’ Active Work', tone: 'blue',
      rows: [
        {
          recordId: 'NA-BILL-2026-022', title: 'Health Records Confidentiality Bill, 2026', reference: 'NA/BILL/2026/022',
          type: 'Bill', stage: 'Revised Draft', stageTone: 'blue',
          requiredAction: 'Drafting in progress', ownerId: 'counsel-mumo', ownerName: 'Alice Mumo',
          due: '2 Aug 2026', priority: 'Medium', activity: 'Restricted record', actionLabel: 'View', actionTo: '/legislative/NA-BILL-2026-022',
        },
        {
          recordId: 'NA-SI-2026-016', title: 'Digital Services (Accessibility Standards) Regulations, 2026', reference: 'NA/SI/2026/016',
          type: 'Statutory Instrument', stage: 'Legal Review', stageTone: 'green',
          requiredAction: 'Align with Clause 5 standards', ownerId: 'counsel-mumo', ownerName: 'Alice Mumo',
          due: '26 Jul 2026', priority: 'Medium', activity: 'Updated yesterday', actionLabel: 'View', actionTo: '/legislative/NA-SI-2026-016',
        },
      ],
    },
  ],
  progressRecords: [
    { title: 'Digital Public Services Bill', sub: 'Version 4.0 · Legal review', pct: 72, tone: 'green', to: '/legislative/NA-BILL-2026-015/draft', icon: 'draft' },
    { title: 'Publication package', sub: 'Signature and seal pending', pct: 84, tone: 'gold', to: '/legislative/NA-BILL-2026-012/publish', icon: 'publish' },
  ],
  workByStage: computeWorkByStage('dls-drafter'),
  supportingInputs: [
    { label: 'Awaiting PBO documentation', count: DRAFTER_SUPPORTING, sub: 'Public Finance Bill + 1 record', tone: 'amber', to: '/work?stage=Awaiting%20Supporting%20Information' },
    { label: 'Petitions to classify', count: DRAFTER_PETITIONS, sub: 'Assisted-access petition', tone: 'gold', to: '/work?stage=Intake%20Verification' },
  ],
  readiness: {
    nextSitting: 'Tuesday, 21 July · 2:30 PM',
    items: [
      // Sitting-pipeline readiness → the page that owns each concern.
      { label: 'Ready for procedural review', count: 4, tone: 'green', to: '/bills' },
      { label: 'Awaiting signature', count: 2, tone: 'blue', to: '/legislative/NA-BILL-2026-015/publish' },
      { label: 'Publication checks incomplete', count: 1, tone: 'gold', to: '/legislative/NA-BILL-2026-015/publish' },
      { label: 'At risk', count: 2, tone: 'red', to: '/work?status=overdue' },
    ],
  },
  attention: [
    { title: 'Clause 14 has a blocking review comment', sub: 'Digital Public Services Bill, 2026', tone: 'red', to: '/legislative/NA-BILL-2026-015/draft#clause-14', importance: 'High' },
    { title: 'Publication deadline is tomorrow', sub: 'Order Paper — Sitting No. 42', tone: 'amber', to: '/legislative/NA-OP-2026-042', importance: 'Medium' },
    { title: 'PBO response overdue by 5 days', sub: 'Public Finance Amendment Bill, 2026', tone: 'amber', to: '/legislative/NA-BILL-2026-009', importance: 'Medium' },
  ],
  activity: [
    { time: '10:42', text: 'Version 4.0 submitted for review', ref: 'Digital Public Services Bill, 2026', to: '/legislative/NA-BILL-2026-015/draft?mode=review' },
    { time: '10:18', text: 'Validation completed successfully', ref: 'Consumer Protection (Digital Commerce) Bill', to: '/legislative/NA-BILL-2026-021/draft' },
    { time: '09:54', text: 'Two public submissions linked', ref: 'Petition on Assisted Access', to: '/legislative/NA-PET-2026-084' },
    { time: 'Yesterday', text: 'Drafting task reassigned', ref: 'Electronic Transactions Bill, 2026', to: '/legislative/NA-BILL-2026-019/draft' },
  ],
  recent: [
    { recordId: 'NA-BILL-2026-015', title: 'Digital Public Services Bill, 2026', reference: 'NA/BILL/2026/015', version: '4.0', stage: 'Revision Requested', stageTone: 'red', actionLabel: 'Continue', to: '/legislative/NA-BILL-2026-015/draft?mode=revision' },
    { recordId: 'NA-SI-2026-027', title: 'Statutory Instruments Tracking Regulations, 2026', reference: 'NA/SI/2026/027', stage: 'Drafting', stageTone: 'blue', actionLabel: 'Continue', to: '/legislative/NA-SI-2026-027/draft' },
    { recordId: 'NA-MOT-2026-046', title: 'Motion on Digital Accessibility in Public Institutions', reference: 'NA/MOT/2026/046', stage: 'Legal Review', stageTone: 'green', actionLabel: 'Open', to: '/legislative/NA-MOT-2026-046' },
  ],
};

// ---- DLS Reviewer (David Otieno) — same shell, review-focused content ----
const reviewerData: CommandCentreData = {
  ...drafterData,
  attentionCount: countByStatus('requires-action', 'dls-reviewer'),
  summaryCards: [
    { id: 'review', label: 'Awaiting My Review', value: countByStatus('requires-action', 'dls-reviewer'), sub: 'Submitted for legal review', tone: 'green', icon: 'review', to: '/work?status=requires-action', repeatsQueue: true },
    { id: 'due', label: 'Due Within 48 Hours', value: countByStatus('due-48', 'dls-reviewer'), sub: 'Sitting-critical reviews', tone: 'amber', icon: 'due', to: '/work?status=due-48' },
    { id: 'returned', label: 'Returned to Drafters', value: countByStatus('waiting-on-others', 'dls-reviewer'), sub: 'Awaiting rework', tone: 'red', icon: 'returned', to: '/work?status=waiting-on-others' },
    { id: 'approved', label: 'Recently Approved', value: countByStatus('completed', 'dls-reviewer'), sub: 'This period', tone: 'gold', icon: 'action', to: '/work?status=completed' },
  ],
  workByStage: computeWorkByStage('dls-reviewer'),
  supportingInputs: [
    { label: 'Awaiting drafter rework', count: countByStatus('waiting-on-others', 'dls-reviewer'), sub: 'Returned records', tone: 'amber', to: '/work?status=waiting-on-others' },
    { label: 'Overdue reviews', count: countByStatus('overdue', 'dls-reviewer'), sub: 'Past due date', tone: 'red', to: '/work?status=overdue' },
  ],
  progressRecords: [
    { title: 'Digital Public Services Bill', sub: 'Version 4.0 · Legal review', pct: 50, tone: 'green', to: '/legislative/NA-BILL-2026-015/review', icon: 'draft' },
    { title: 'E-Government Services Bill', sub: 'Version 2.0 · Legal review', pct: 33, tone: 'green', to: '/legislative/NA-BILL-2026-016/review', icon: 'draft' },
  ],
  groups: [
    {
      id: 'requires-action', title: 'Awaiting My Review', tone: 'green',
      rows: [
        {
          recordId: 'NA-BILL-2026-015', title: 'Digital Public Services Bill, 2026', reference: 'NA/BILL/2026/015', version: '4.0',
          type: 'Bill', stage: 'Legal Review', stageTone: 'green',
          requiredAction: 'Review submitted draft and resolve Clause 14 comment', ownerId: 'dls-reviewer', ownerName: 'David Otieno',
          due: 'Today, 4:00 PM', dueUrgent: true, priority: 'High', activity: 'Submitted 36 min ago by Grace Wanjiku', actionLabel: 'Open Review', actionTo: '/legislative/NA-BILL-2026-015/draft?mode=review',
        },
        {
          recordId: 'NA-STMT-2026-050', title: 'Statement on Digital Public Services Rollout', reference: 'NA/STMT/2026/050',
          type: 'Statement', stage: 'Legal Review', stageTone: 'green',
          requiredAction: 'Complete legal review', ownerId: 'dls-reviewer', ownerName: 'David Otieno',
          due: 'Tomorrow', priority: 'Medium', activity: 'Awaiting your review', actionLabel: 'Review', actionTo: '/legislative/NA-STMT-2026-050',
        },
      ],
    },
    { ...drafterData.groups[1], title: 'In Review Across DLS' },
    drafterData.groups[3],
  ],
};

// ---- DLPS Officer (Ruth Naliaka) — procedural / publication focused ----
const dlpsData: CommandCentreData = {
  ...drafterData,
  attentionCount: countByStatus('requires-action', 'dlps-officer'),
  contextDate: 'Directorate of Legislative and Procedural Services · Wednesday, 15 July 2026',
  summaryCards: [
    { id: 'procedural', label: 'Awaiting Procedural Review', value: countByStatus('requires-action', 'dlps-officer'), sub: 'Requires your action', tone: 'gold', icon: 'action', to: '/work?status=requires-action', repeatsQueue: true },
    { id: 'signature', label: 'Awaiting Signature', value: countByStage('Awaiting Signature', 'dlps-officer'), sub: 'Sitting-critical', tone: 'amber', icon: 'due', to: '/work?stage=Awaiting%20Signature' },
    { id: 'due', label: 'Due Within 48 Hours', value: countByStatus('due-48', 'dlps-officer'), sub: 'Time-critical', tone: 'red', icon: 'returned', to: '/work?status=due-48' },
    { id: 'ready', label: 'Recently Published', value: countByStatus('completed', 'dlps-officer'), sub: 'This period', tone: 'green', icon: 'review', to: '/work?status=completed' },
  ],
  workByStage: computeWorkByStage('dlps-officer'),
  supportingInputs: [
    { label: 'Awaiting legal clearance', count: countByStatus('waiting-on-others', 'dlps-officer'), sub: 'With DLS', tone: 'amber', to: '/work?status=waiting-on-others' },
    { label: 'Publications in preparation', count: countByStatus('in-progress', 'dlps-officer'), sub: 'Cyber Harassment Bill', tone: 'gold', to: '/work?status=in-progress' },
  ],
  progressRecords: [
    { title: 'County Governments Bill', sub: 'Awaiting signature', pct: 80, tone: 'gold', to: '/legislative/NA-BILL-2026-004/publish', icon: 'publish' },
    { title: 'Cyber Harassment Bill', sub: 'Publication preparation', pct: 60, tone: 'green', to: '/legislative/NA-BILL-2026-012', icon: 'draft' },
  ],
  groups: [
    {
      id: 'requires-action', title: 'Requires My Action', tone: 'gold',
      rows: [
        {
          recordId: 'NA-OP-2026-042', title: 'Order Paper — Sitting No. 42', reference: 'NA/OP/2026/042',
          type: 'Order Paper', stage: 'Procedural Review', stageTone: 'green',
          requiredAction: 'Confirm order of business', ownerId: 'dlps-officer', ownerName: 'Ruth Naliaka',
          due: 'Tomorrow', dueUrgent: true, priority: 'High', activity: 'Awaiting DLPS confirmation', actionLabel: 'Confirm', actionTo: '/legislative/NA-OP-2026-042',
        },
        {
          recordId: 'NA-BILL-2026-004', title: 'County Governments (Public Participation) Bill, 2026', reference: 'NA/BILL/2026/004',
          type: 'Bill', stage: 'Awaiting Signature', stageTone: 'amber',
          requiredAction: 'Route for signature', ownerId: 'dlps-officer', ownerName: 'Ruth Naliaka',
          due: 'Today', dueUrgent: true, priority: 'High', activity: 'Legal approval complete', actionLabel: 'Route', actionTo: '/legislative/NA-BILL-2026-004/publish',
        },
      ],
    },
    drafterData.groups[3],
  ],
};

// ---- Clerk — oversight focused; retains the same design system ----
const clerkData: CommandCentreData = {
  ...drafterData,
  attentionCount: countByStatus('requires-action', 'clerk'),
  contextDate: 'Office of the Clerk · Wednesday, 15 July 2026',
  summaryCards: [
    { id: 'approvals', label: 'Pending Authorisation', value: countByStatus('requires-action', 'clerk'), sub: 'Awaiting your sign-off', tone: 'gold', icon: 'action', to: '/work?status=requires-action', repeatsQueue: true },
    { id: 'atrisk', label: 'At-Risk Business', value: countByStatus('overdue', 'clerk'), sub: 'May miss the next sitting', tone: 'red', icon: 'returned', to: '/work?status=overdue' },
    { id: 'signature', label: 'Awaiting Signature', value: countByStage('Awaiting Signature', 'clerk'), sub: 'Ready to authorise', tone: 'amber', icon: 'due', to: '/work?stage=Awaiting%20Signature' },
    { id: 'authorised', label: 'Recently Authorised', value: countByStatus('completed', 'clerk'), sub: 'This period', tone: 'green', icon: 'review', to: '/work?status=completed' },
  ],
  workByStage: computeWorkByStage('clerk'),
  supportingInputs: [
    { label: 'Awaiting DLPS confirmation', count: countByStatus('waiting-on-others', 'clerk'), sub: 'Order Paper — Sitting No. 42', tone: 'amber', to: '/work?status=waiting-on-others' },
    { label: 'At risk of missing sitting', count: countByStatus('overdue', 'clerk'), sub: 'Cyber Harassment Bill', tone: 'red', to: '/work?status=overdue' },
  ],
  progressRecords: [
    { title: 'County Governments Bill', sub: 'Awaiting authorisation', pct: 80, tone: 'gold', to: '/legislative/NA-BILL-2026-004/publish', icon: 'publish' },
    { title: 'Cyber Harassment Bill', sub: 'At risk · awaiting sign-off', pct: 80, tone: 'red', to: '/legislative/NA-BILL-2026-012', icon: 'publish' },
  ],
  groups: [
    {
      id: 'requires-action', title: 'Requires Authorisation', tone: 'gold',
      rows: [
        {
          recordId: 'NA-VP-2026-0714', title: 'Votes and Proceedings — 14 July 2026', reference: 'NA/VP/2026/0714',
          type: 'Votes and Proceedings', stage: 'Approval', stageTone: 'gold',
          requiredAction: 'Authorise sign-off', ownerId: 'clerk', ownerName: 'Office of the Clerk',
          due: 'Today', dueUrgent: true, priority: 'Medium', activity: 'Pending signature', actionLabel: 'Review', actionTo: '/legislative/NA-VP-2026-0714',
        },
        {
          recordId: 'NA-BILL-2026-004', title: 'County Governments (Public Participation) Bill, 2026', reference: 'NA/BILL/2026/004',
          type: 'Bill', stage: 'Awaiting Signature', stageTone: 'amber',
          requiredAction: 'Authorise signature', ownerId: 'clerk', ownerName: 'Office of the Clerk',
          due: 'Tomorrow', priority: 'High', activity: 'Routed by Ruth Naliaka', actionLabel: 'Review', actionTo: '/legislative/NA-BILL-2026-004/publish',
        },
      ],
    },
    drafterData.groups[3],
  ],
};

const byRole: Partial<Record<RoleId, CommandCentreData>> = {
  'dls-drafter': drafterData,
  'dls-reviewer': reviewerData,
  'dlps-officer': dlpsData,
  clerk: clerkData,
};

export function getCommandCentre(role: RoleId | null): CommandCentreData {
  return (role && byRole[role]) || drafterData;
}
