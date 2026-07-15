// Seed data + defaults for the New Legislative Instruction Wizard.
// The wizard is pre-filled with the Digital Public Services Bill example (matching
// the inspiration) and, on Create Workspace, generates a fresh, non-colliding
// reference (015 already exists as the canonical Bill, so the proposal uses 014).

export interface BillTemplate {
  id: string;
  name: string;
  version: string;
  effective: string; // display
  status: 'Approved';
  numberingRules: string;
  sections: string[];
  description: string;
}

export const billTemplates: BillTemplate[] = [
  {
    id: 'tpl-standard', name: 'Bill Template — Standard', version: 'v3.2', effective: 'Effective 15 Jan 2025', status: 'Approved',
    numberingRules: 'Sequential (Per Bill)',
    sections: ['Short title', 'Interpretation', 'Substantive clauses', 'Regulations', 'Transitional provisions', 'Commencement'],
    description: 'The standard structure for a Government Bill — long title, interpretation, substantive parts, regulations and commencement.',
  },
  {
    id: 'tpl-short', name: 'Bill Template — Short Form', version: 'v2.1', effective: 'Effective 01 Aug 2024', status: 'Approved',
    numberingRules: 'Sequential (Per Bill)',
    sections: ['Short title', 'Interpretation', 'Substantive clauses', 'Commencement'],
    description: 'A condensed structure for short Bills with a limited number of substantive clauses.',
  },
  {
    id: 'tpl-money', name: 'Bill Template — Money Bill', version: 'v1.4', effective: 'Effective 10 Mar 2025', status: 'Approved',
    numberingRules: 'Sequential (Per Bill)',
    sections: ['Short title', 'Interpretation', 'Imposition and financial provisions', 'Schedules', 'Commencement'],
    description: 'Structure for a Money Bill, including financial provisions and schedules, with additional financial-clearance steps.',
  },
  {
    id: 'tpl-amendment', name: 'Bill Template — Amendment', version: 'v2.0', effective: 'Effective 01 Jan 2024', status: 'Approved',
    numberingRules: 'Amendment referencing (per parent Act)',
    sections: ['Short title', 'Amendments to the principal Act', 'Consequential amendments', 'Commencement'],
    description: 'Structure for a Bill that amends an existing Act, keyed to the sections of the parent legislation.',
  },
  {
    id: 'tpl-consolidation', name: 'Bill Template — Consolidation', version: 'v1.2', effective: 'Effective 20 Feb 2024', status: 'Approved',
    numberingRules: 'Sequential (consolidated)',
    sections: ['Short title', 'Interpretation', 'Consolidated provisions', 'Repeals and savings', 'Commencement'],
    description: 'Structure for consolidating several enactments into a single, restated Act.',
  },
];

export const LEGISLATIVE_TYPES = ['Bill', 'Motion', 'Statutory Instrument', 'Petition'];
export const PRIORITIES = ['Normal', 'High', 'Urgent — Sitting Related'];
export const CONFIDENTIALITIES = ['Internal', 'Internal — Restricted', 'Confidential', 'Public after creation'];
export const ORIGINATING_OFFICES = [
  'Parliamentary Legislative Proposal Unit', 'Clerk’s Office',
  'Office of the Leader of the Majority Party', 'Departmental Committee', 'Cabinet Secretary',
];
export const SPONSORS = [
  'Departmental Committee on Communication, Information and Innovation',
  'Hon. John Mwangi (MP — Westlands)', 'Leader of the Majority Party', 'Cabinet Secretary, ICT',
];
export const DIRECTORATES = [
  'Directorate of Legal Services',
  'Directorate of Legislative and Procedural Services',
];
export const LANGUAGES = ['English', 'Kiswahili', 'Bilingual (where configured)'];
export const NUMBERING_RULES = ['Sequential (Per Bill)', 'Amendment referencing (per parent Act)', 'Sequential (consolidated)'];
export const REQUIRED_APPROVALS = ['Legal + Procedural + Speaker', 'Legal + Procedural', 'Legal + Financial + Procedural'];
export const REMINDER_FREQUENCIES = ['1 day before due date', '3 days before due date', '1 week before due date'];
export const ESCALATE_BY = ['1 day', '2 days', '3 days'];
export const ESCALATE_TO = ['Directorate Head', 'Clerk’s Office', 'Sitting Coordinator'];
export const RELATIONSHIP_TYPES = ['References', 'Amends', 'Related policy', 'Previous proposal', 'Supporting record'];

// Officers assignable as owner / drafter / reviewers / collaborators (persona ids).
export const ASSIGNABLE = [
  'dls-drafter', 'dls-reviewer', 'dlps-officer', 'counsel-mumo', 'counsel-barasa', 'clerk',
];
export const COLLABORATOR_OPTIONS = ['counsel-mumo', 'counsel-barasa', 'pbo-liaison'];

export interface WizardFile { name: string; type: string; size: string; uploaded: string; }
export interface RelatedItem { id: string; title: string; kind: string; }
export interface WizardTaskSeed { title: string; assigneeId: string; due: string; dueLabel: string; }

export const defaultSupportingFiles: WizardFile[] = [
  { name: 'Policy_Statement_Digital_Gov.pdf', type: 'PDF', size: '1.4 MB', uploaded: '14 Jul 2026' },
  { name: 'Cabinet_Memo_No._23_2026.pdf', type: 'PDF', size: '2.1 MB', uploaded: '14 Jul 2026' },
  { name: 'Comparative_Analysis_2026.docx', type: 'DOCX', size: '890 KB', uploaded: '14 Jul 2026' },
];

export const defaultFinancialDocs: WizardFile[] = [
  { name: 'Financial_Impact_Note_Draft.xlsx', type: 'XLSX', size: '560 KB', uploaded: '14 Jul 2026' },
];

export const defaultRelatedLegislation: RelatedItem[] = [
  { id: 'rl-dpa', title: 'Data Protection Act, 2019', kind: 'Act' },
  { id: 'rl-kica', title: 'Kenya Information and Communications Act, 1998', kind: 'Act' },
  { id: 'rl-eta', title: 'Electronic Transactions Act, 2011', kind: 'Act' },
];

export const RELATED_LEGISLATION_LIBRARY: RelatedItem[] = [
  ...defaultRelatedLegislation,
  { id: 'rl-atia', title: 'Access to Information Act, 2016', kind: 'Act' },
  { id: 'rl-psc', title: 'Public Service Commission Act, 2017', kind: 'Act' },
  { id: 'rl-cma', title: 'Computer Misuse and Cybercrimes Act, 2018', kind: 'Act' },
];

// Stage deadlines (target dates) keyed to the Bills workflow stage ids.
export const defaultDeadlines: Record<string, string> = {
  instruction: '2026-07-16',
  drafting: '2026-08-31',
  'legal-review': '2026-09-30',
  'procedural-review': '2026-10-21',
  signature: '2026-10-30',
  publication: '2026-11-20',
};

// Initial tasks generated on workspace creation (assignees are canonical people).
export const initialTaskSeed: WizardTaskSeed[] = [
  { title: 'Draft initial Bill skeleton', assigneeId: 'dls-drafter', due: '2026-07-16', dueLabel: '16 Jul 2026' },
  { title: 'Confirm policy-brief attachments', assigneeId: 'counsel-mumo', due: '2026-07-22', dueLabel: '22 Jul 2026' },
  { title: 'Request PBO financial-impact assessment', assigneeId: 'pbo-liaison', due: '2026-07-24', dueLabel: '24 Jul 2026' },
  { title: 'Assign legal-review schedule', assigneeId: 'dls-reviewer', due: '2026-07-30', dueLabel: '30 Jul 2026' },
];

export const PERMISSION_ROWS: Array<{ role: string; right: string }> = [
  { role: 'Owner', right: 'Full control' },
  { role: 'Drafter', right: 'Edit during drafting' },
  { role: 'Legal reviewer', right: 'Comment and review' },
  { role: 'Procedural reviewer', right: 'Review only until publication' },
  { role: 'PBO liaison', right: 'Upload assessment response' },
  { role: 'Observer', right: 'View only' },
];

export interface WizardForm {
  title: string;
  legislativeType: string;
  priority: string;
  confidentiality: string;
  originatingOffice: string;
  dueDate: string; // ISO
  sponsor: string;
  directorate: string;
  description: string;
  templateId: string;
  language: string;
  numberingRules: string;
  requiredApprovals: string;
  supportingFiles: WizardFile[];
  relatedLegislation: RelatedItem[];
  pboRequired: boolean;
  financialDocs: WizardFile[];
  publicParticipation: boolean;
  ownerId: string;
  drafterId: string;
  legalReviewerId: string;
  proceduralReviewerId: string;
  collaboratorIds: string[];
  deadlines: Record<string, string>;
  reminderFrequency: string;
  escalateBy: string;
  escalateTo: string;
}

export const defaultForm: WizardForm = {
  title: 'Digital Public Services Bill, 2026',
  legislativeType: 'Bill',
  priority: 'High',
  confidentiality: 'Internal — Restricted',
  originatingOffice: 'Parliamentary Legislative Proposal Unit',
  dueDate: '2026-09-30',
  sponsor: 'Departmental Committee on Communication, Information and Innovation',
  directorate: 'Directorate of Legal Services',
  description: 'A Bill to provide for a legal and regulatory framework for the provision of digital public services by the national and county governments, including assisted access, identity-verification safeguards and service-delivery standards, and for connected purposes.',
  templateId: 'tpl-standard',
  language: 'English',
  numberingRules: 'Sequential (Per Bill)',
  requiredApprovals: 'Legal + Procedural + Speaker',
  supportingFiles: defaultSupportingFiles,
  relatedLegislation: defaultRelatedLegislation,
  pboRequired: true,
  financialDocs: defaultFinancialDocs,
  publicParticipation: true,
  ownerId: 'dls-drafter',
  drafterId: 'dls-drafter',
  legalReviewerId: 'dls-reviewer',
  proceduralReviewerId: 'dlps-officer',
  collaboratorIds: ['counsel-mumo', 'counsel-barasa'],
  deadlines: defaultDeadlines,
  reminderFrequency: '3 days before due date',
  escalateBy: '3 days',
  escalateTo: 'Directorate Head',
};

// Display helpers
export function fmtDate(iso: string): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[m - 1]} ${y}`;
}

export const WIZARD_STEPS = [
  { id: 'instruction', label: 'Instruction Details' },
  { id: 'template', label: 'Template & Workflow' },
  { id: 'supporting', label: 'Supporting Information' },
  { id: 'assignment', label: 'Assignment & Deadlines' },
  { id: 'review', label: 'Review & Create' },
];

export const DRAFT_KEY = 'lims-instruction-wizard-draft';
