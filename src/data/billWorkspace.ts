// Curated Bill Workspace Overview data for the primary record.

export type StageState = 'completed' | 'current' | 'returned' | 'upcoming';
export interface LifecycleStage {
  id: string;
  label: string;
  state: StageState;
  date?: string;
}

export const lifecycle: LifecycleStage[] = [
  { id: 'instruction', label: 'Instruction', state: 'completed', date: 'Completed 08 Jul 2026' },
  { id: 'drafting', label: 'Drafting', state: 'completed', date: 'Completed 10 Jul 2026' },
  { id: 'legal-review', label: 'Legal Review', state: 'returned', date: 'Returned for revision 15 Jul 2026' },
  { id: 'procedural', label: 'Procedural Review', state: 'upcoming', date: 'Upcoming' },
  { id: 'signature', label: 'Signature', state: 'upcoming', date: 'Upcoming' },
  { id: 'publication', label: 'Publication', state: 'upcoming', date: 'Upcoming' },
];

export type ChecklistStatus = 'completed' | 'in-progress' | 'blocked' | 'pending';
export interface ChecklistItem {
  label: string;
  status: ChecklistStatus;
}

export const stageChecklist: ChecklistItem[] = [
  { label: 'Resolve all blocking comments', status: 'completed' },
  { label: 'Correct Clause 14 cross-reference', status: 'completed' },
  { label: 'Run structural validation', status: 'in-progress' },
  { label: 'Add revision note', status: 'pending' },
  { label: 'Submit Version 4.1 for review', status: 'pending' },
];

export interface GeneratedOutput {
  format: 'PDF' | 'HTML' | 'XML';
  label: string;
  note: string;
  file: string;
  generatedAt: string;
}

export const generatedOutputs: GeneratedOutput[] = [
  { format: 'PDF', label: 'PDF Preview', note: 'Generated from Version 4.0 · Not an official publication', file: 'digital-public-services-bill-2026.pdf', generatedAt: 'Generated today 10:42 AM' },
  { format: 'HTML', label: 'Accessible HTML', note: 'Preview generated from Version 4.0', file: 'digital-public-services-bill-2026.html', generatedAt: 'Generated today 10:42 AM' },
  { format: 'XML', label: 'Akoma Ntoso XML', note: 'Structured canonical representation', file: 'digital-public-services-bill-2026.xml', generatedAt: 'Generated today 10:42 AM' },
];

export interface RelatedRecord {
  title: string;
  relation: string;
  to?: string;
  kind: 'act' | 'business' | 'submission' | 'assessment';
}

export const relatedRecords: RelatedRecord[] = [
  { title: 'Public Service Delivery Act, 2019', relation: 'Referenced legislation', kind: 'act' },
  { title: 'Motion on Digital Accessibility in Public Institutions', relation: 'Related parliamentary business', to: '/legislative/NA-MOT-2026-046', kind: 'business' },
  { title: 'Petition on Assisted Access to Digital Government Services', relation: 'Related public submission', to: '/legislative/NA-PET-2026-084', kind: 'submission' },
  { title: 'PBO Financial Impact Note', relation: 'Supporting assessment', kind: 'assessment' },
];

export const participationSummary = {
  status: 'Scheduled',
  opening: '27 July 2026',
  closing: '21 August 2026',
  received: 0,
  publicPage: 'Draft',
};

export const approvalSummary = [
  { label: 'Drafting completed', done: true },
  { label: 'Legal approval pending', done: false },
  { label: 'Procedural review not started', done: false },
  { label: 'Signature not requested', done: false },
];

export const accessInfo = {
  classification: 'Internal',
  visibleTo: 'Assigned DLS and DLPS officers',
  publicVisibility: 'None',
};

export const keyDates = [
  { label: 'Instruction received', value: '8 July 2026' },
  { label: 'Current task due', value: 'Today, 4:00 PM', urgent: true },
  { label: 'Target completion', value: '24 July 2026' },
  { label: 'Public participation', value: '27 July – 21 August 2026' },
];

// ---- Workflow & Approvals side sheet ----
export const workflowSheet = {
  currentStage: 'Revision Requested',
  entered: 'Entered 15 July 2026',
  stageOwner: 'Grace Wanjiku',
  checklist: [
    { label: 'Resolve blocking comments', status: 'blocked' as ChecklistStatus },
    { label: 'Pass validation', status: 'in-progress' as ChecklistStatus },
    { label: 'Create revision note', status: 'pending' as ChecklistStatus },
    { label: 'Submit new version', status: 'pending' as ChecklistStatus },
  ],
  stageHistory: [
    { label: 'Instruction Received', date: '08 Jul 2026', state: 'completed' as StageState },
    { label: 'Drafting', date: '10 Jul 2026', state: 'completed' as StageState },
    { label: 'Legal Review', date: '12 Jul 2026', state: 'current' as StageState },
    { label: 'Revision Requested', date: '15 Jul 2026', state: 'returned' as StageState },
  ],
  approvalHistory: [
    { by: 'David Otieno', role: 'Legal Reviewer', decision: 'Returned for revision', at: '15 July 2026 · 9:38 AM', version: '4.0' },
  ],
  permissionMessage: 'You may submit a corrected version, but final legal approval requires the Director of Legal Services role.',
};
