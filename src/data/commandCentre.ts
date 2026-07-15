import type { RoleId, WorkflowType, Priority } from './types';

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

export interface ReadinessItem { label: string; count: number; tone: Tone }
export interface AttentionItem { title: string; sub: string; tone: Tone; to: string }
export interface ActivityItem { time: string; text: string }
export interface RecentItem {
  recordId: string; title: string; reference: string; version?: string;
  stage: string; stageTone: Tone; actionLabel: string; to: string;
}

export interface CommandCentreData {
  attentionCount: number;
  contextDate: string;
  summaryCards: SummaryCard[];
  groups: QueueGroup[];
  /** Extra groups shown only in the "Directorate Work" view. */
  directorateExtra?: QueueGroup[];
  readiness: {
    nextSitting: string;
    items: ReadinessItem[];
  };
  attention: AttentionItem[];
  activity: ActivityItem[];
  recent: RecentItem[];
}

const CONTEXT_DATE = 'Directorate of Legal Services · Wednesday, 15 July 2026';

// ---- DLS Drafter (Grace Wanjiku) — fully specified per the Phase 1 brief ----
const drafterData: CommandCentreData = {
  attentionCount: 7,
  contextDate: CONTEXT_DATE,
  summaryCards: [
    { id: 'action', label: 'Requires My Action', value: 7, sub: '2 added today', tone: 'gold', icon: 'action', to: '/work?status=requires-action', repeatsQueue: true },
    { id: 'due', label: 'Due Within 48 Hours', value: 3, sub: '1 marked high priority', tone: 'amber', icon: 'due', to: '/work?status=due-48' },
    { id: 'returned', label: 'Returned for Revision', value: 1, sub: 'Blocking comment unresolved', tone: 'red', icon: 'returned', to: '/work?status=returned' },
    { id: 'review', label: 'Awaiting My Review', value: 4, sub: 'Oldest waiting 2 days', tone: 'green', icon: 'review', to: '/work?status=awaiting-review' },
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
          type: 'Bill', stage: 'Awaiting Supporting Information', stageTone: 'amber',
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
  readiness: {
    nextSitting: 'Tuesday, 21 July · 2:30 PM',
    items: [
      { label: 'Ready for procedural review', count: 4, tone: 'green' },
      { label: 'Awaiting signature', count: 2, tone: 'blue' },
      { label: 'Publication checks incomplete', count: 1, tone: 'gold' },
      { label: 'At risk', count: 2, tone: 'red' },
    ],
  },
  attention: [
    { title: 'Clause 14 has a blocking review comment', sub: 'Digital Public Services Bill, 2026', tone: 'red', to: '/legislative/NA-BILL-2026-015?highlight=clause-14' },
    { title: 'Publication deadline is tomorrow', sub: 'Order Paper — Sitting No. 42', tone: 'amber', to: '/legislative/NA-OP-2026-042' },
  ],
  activity: [
    { time: '10:42', text: 'Version 4.0 submitted for review' },
    { time: '10:18', text: 'Validation completed successfully' },
    { time: '09:54', text: 'Two public submissions linked' },
    { time: 'Yesterday', text: 'Drafting task reassigned' },
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
  attentionCount: 5,
  summaryCards: [
    { id: 'review', label: 'Awaiting My Review', value: 5, sub: '1 submitted today', tone: 'green', icon: 'review', to: '/work?status=awaiting-review', repeatsQueue: true },
    { id: 'blocking', label: 'Blocking Issues', value: 2, sub: 'Across 2 records', tone: 'red', icon: 'returned', to: '/work?status=requires-action' },
    { id: 'due', label: 'Due Within 48 Hours', value: 3, sub: '2 marked high priority', tone: 'amber', icon: 'due', to: '/work?status=due-48' },
    { id: 'approved', label: 'Recently Approved', value: 6, sub: 'This week', tone: 'gold', icon: 'action', to: '/work?status=completed' },
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
  attentionCount: 6,
  contextDate: 'Directorate of Legislative and Procedural Services · Wednesday, 15 July 2026',
  summaryCards: [
    { id: 'procedural', label: 'Awaiting Procedural Review', value: 3, sub: '1 due today', tone: 'gold', icon: 'action', to: '/work?status=requires-action', repeatsQueue: true },
    { id: 'signature', label: 'Awaiting Signature', value: 2, sub: 'Sitting-critical', tone: 'amber', icon: 'due', to: '/work?status=waiting-on-others' },
    { id: 'checks', label: 'Publication Checks', value: 1, sub: '1 incomplete', tone: 'red', icon: 'returned' },
    { id: 'ready', label: 'Ready to Publish', value: 4, sub: 'Cleared today', tone: 'green', icon: 'review', to: '/work?status=completed' },
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
  attentionCount: 8,
  contextDate: 'Office of the Clerk · Wednesday, 15 July 2026',
  summaryCards: [
    { id: 'atrisk', label: 'At-Risk Business', value: 2, sub: 'May miss the next sitting', tone: 'red', icon: 'returned', to: '/work?status=due-48' },
    { id: 'approvals', label: 'Pending Approvals', value: 3, sub: '1 awaiting authorisation', tone: 'gold', icon: 'action', to: '/work?status=requires-action', repeatsQueue: true },
    { id: 'bottleneck', label: 'Bottleneck Stage', value: 5, sub: 'Legal Review — 5 items', tone: 'amber', icon: 'due', to: '/work?status=awaiting-review' },
    { id: 'compliance', label: 'Compliance Exceptions', value: 1, sub: 'Review this week', tone: 'green', icon: 'review' },
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
