import { primaryBillContent } from './billContent';

// ---- Document structure (Parts → clauses) for the structure navigator ----
export interface DocPart {
  id: string;
  title: string;
  clauses: number[];
}

export const documentParts: DocPart[] = [
  { id: 'part-1', title: 'Part I — Preliminary', clauses: [1, 2, 3] },
  { id: 'part-2', title: 'Part II — Digital public services', clauses: [4, 5, 6, 7] },
  { id: 'part-3', title: 'Part III — Service delivery', clauses: [8, 9, 10, 11, 12, 13, 14] },
  { id: 'part-4', title: 'Part IV — General', clauses: [15, 16, 17] },
];

export const clauseTitle = (n: number) =>
  primaryBillContent.clauses.find((c) => c.number === n)?.heading ?? '';

// ---- Tracked-changes model for Clause 14 (pre-authored, deterministic) ----
export type RunType = 'normal' | 'ins' | 'del';
export interface Run {
  text: string;
  type: RunType;
  changeId?: string;
  ref?: boolean; // renders as a cross-reference link
}
export interface DraftPara {
  id: string;
  label?: string; // (1), (a) …
  indent?: 0 | 1;
  marker?: 'A' | 'D' | 'M'; // review margin marker
  runs: Run[];
}

export interface TrackChange {
  id: string;
  type: 'addition' | 'deletion' | 'modified';
  clause: string;
  by: string;
  byRole: string;
  at: string;
  reason: string;
  version: string;
  ai?: boolean;
}

const n = (text: string): Run => ({ text, type: 'normal' });
const ins = (text: string, changeId: string): Run => ({ text, type: 'ins', changeId });
const del = (text: string, changeId: string): Run => ({ text, type: 'del', changeId });

// Clause 14 with tracked changes matching the review mockups.
export const clause14Draft: DraftPara[] = [
  {
    id: 'c14-1', label: '(1)', marker: 'A',
    runs: [n('A public service provider shall take reasonable measures to ensure that vulnerable users can access and use digital public services on an equal basis with other users.')],
  },
  {
    id: 'c14-2', label: '(2)', marker: 'D',
    runs: [
      n('For the purposes of this Clause, a “vulnerable user” means a person who, because of disability, age, literacy, language, location, low digital literacy or any other socio-economic barrier, may be at a disadvantage in accessing or using digital '),
      del('public services', 'ch-2'), n('.'),
    ],
  },
  {
    id: 'c14-3', label: '(3)', marker: 'A',
    runs: [n('A public service provider shall—')],
  },
  {
    id: 'c14-3a', label: '(a)', indent: 1,
    runs: [
      n('provide accessible and inclusive interfaces and content in accordance with the accessibility standards prescribed under '),
      del('section 5', 'ch-a'), n(' '), ins('section 6', 'ch-a'), n(';'),
    ],
  },
  {
    id: 'c14-3b', label: '(b)', indent: 1,
    runs: [
      n('offer alternative channels, including assisted digital access '),
      del('or non-digital channels', 'ch-b'), n(', where necessary, to ensure service continuity;'),
    ],
  },
  {
    id: 'c14-3c', label: '(c)', indent: 1,
    runs: [
      n('provide reasonable accommodations and assistive support, '),
      ins('including through human assistance', 'ch-c'),
      n(', where identity verification '),
      del('fails', 'ch-c'), ins(', is not successful, or cannot be completed', 'ch-c'), n(';'),
    ],
  },
  {
    id: 'c14-4', label: '(4)', marker: 'M',
    runs: [
      n('A public service provider shall ensure that any personal data processed to support vulnerable users is handled in accordance with this Act and the '),
      { text: 'Data Protection Act', type: 'normal', ref: true }, n('.'),
    ],
  },
  {
    id: 'c14-5', label: '(5)', marker: 'M',
    runs: [
      n('The Cabinet Secretary may issue '),
      del('guidelines', 'ch-5'), n(' '), ins('regulations', 'ch-5'),
      n(' to promote the effective protection of vulnerable users in the provision of digital public services.'),
    ],
  },
];

export const clause14Changes: TrackChange[] = [
  { id: 'ch-a', type: 'modified', clause: 'Clause 14(3)(a)', by: 'Grace Wanjiku', byRole: 'Senior Legal Counsel', at: '15 July 2026 · 10:18 AM', reason: 'Corrected cross-reference from section 5 to section 6.', version: '4.0' },
  { id: 'ch-b', type: 'deletion', clause: 'Clause 14(3)(b)', by: 'Grace Wanjiku', byRole: 'Senior Legal Counsel', at: '15 July 2026 · 10:20 AM', reason: 'Removed redundant reference to non-digital channels.', version: '4.0' },
  { id: 'ch-c', type: 'addition', clause: 'Clause 14(3)(c)', by: 'Grace Wanjiku', byRole: 'Senior Legal Counsel', at: '15 July 2026 · 10:24 AM', reason: 'AI-assisted clarification of assisted-access obligations, inserted after confirmation.', version: '4.0', ai: true },
  { id: 'ch-2', type: 'deletion', clause: 'Clause 14(2)', by: 'Grace Wanjiku', byRole: 'Senior Legal Counsel', at: '15 July 2026 · 10:12 AM', reason: 'Removed redundant phrase.', version: '4.0' },
  { id: 'ch-5', type: 'modified', clause: 'Clause 14(5)', by: 'Grace Wanjiku', byRole: 'Senior Legal Counsel', at: '15 July 2026 · 10:26 AM', reason: 'Aligned instrument type with the Statutory Instruments Act.', version: '4.0' },
];

// Whole-document change summary (curated totals across all clauses).
export const changeSummary = { additions: 8, deletions: 3, modified: 4, metadata: 2, totalClauses: 37, reviewedClause: 14 };

// ---- Version comparison seed (v4.0 → v4.1) for the Compare view ----
export interface CompareProvision {
  id: string;
  clause: string;
  kind: 'added' | 'modified' | 'multi';
  changeCount?: string;
  oldText: string; // Version 4.0 ('' when the provision is new)
  newText: string; // Version 4.1 ('' when the provision was removed)
}
export const versionCompare = {
  from: { version: '4.0', savedAt: 'Saved on 12 May, 09:12 AM' },
  to: { version: '4.1', note: 'Current under review' },
  summary: { additions: 8, deletions: 3, modified: 4, metadata: 2 },
  provisions: [
    {
      id: 'c6', clause: 'Clause 6 — Digital service standards', kind: 'modified', changeCount: '2 changes',
      oldText: 'A public service provider shall design digital public services to meet the minimum standards prescribed by the Cabinet Secretary.',
      newText: 'A public service provider shall design and operate digital public services to meet the minimum standards for accessibility, security and usability prescribed by the Cabinet Secretary.',
    },
    {
      id: 'c9', clause: 'Clause 9 — Data minimisation', kind: 'added', changeCount: '1 change',
      oldText: '',
      newText: 'A public service provider shall collect only the personal data that is necessary to deliver the requested digital public service, and shall not retain that data for longer than is necessary for that purpose.',
    },
    {
      id: 'c14', clause: 'Clause 14 — Protection of vulnerable users', kind: 'multi', changeCount: '3 changes',
      oldText: 'A public service provider shall provide reasonable accommodations and assistive support where identity verification fails.',
      newText: 'A public service provider shall provide reasonable accommodations and assistive support, including through human assistance, where identity verification is not successful, or cannot be completed.',
    },
    {
      id: 's1', clause: 'Schedule 1 — Inclusion and accessibility', kind: 'modified', changeCount: '1 change',
      oldText: 'Digital public services shall conform to WCAG 2.0 Level AA.',
      newText: 'Digital public services shall conform to WCAG 2.2 Level AA and provide an equivalent assisted or non-digital alternative.',
    },
  ] as CompareProvision[],
  metadataChanges: [
    { field: 'Version note', from: 'Draft for internal review', to: 'Legal review revisions incorporated' },
    { field: 'Review status', from: 'Drafting', to: 'Under Legal Review' },
  ],
};

// Editor comments panel (Clause 14).
export interface EditorComment {
  id: string;
  type: 'blocking' | 'drafting' | 'procedural' | 'reference' | 'general';
  clause: string;
  by: string;
  role: string;
  ago: string;
  text: string;
}

export const editorComments: EditorComment[] = [
  { id: 'C-104', type: 'blocking', clause: 'Clause 14(3)(c)', by: 'David Otieno', role: 'Legal Counsel · DLS', ago: '36 minutes ago', text: 'Clarify whether assisted access must remain available where a digital identity check fails.' },
  { id: 'C-103', type: 'drafting', clause: 'Clause 14(3)(a)', by: 'Naomi Wambui', role: 'Principal Legislative Drafter', ago: '1 hour ago', text: 'Cross-reference updated from section 5 to section 6. Please confirm if this is the correct target provision.' },
];
export const resolvedCommentCount = 4;

// Validation for the editor panel.
export const editorValidation = {
  passed: 14,
  warnings: 1,
  errors: 0,
  warning: 'Clause 14 refers to subsection 6(4), which does not exist.',
  categories: [
    { name: 'Structure', items: ['Clause numbering valid', 'Heading hierarchy valid', 'Required sections present'] },
    { name: 'References', items: ['Cross-reference in Clause 14 requires review', 'Referenced legislation resolved', 'Defined terms introduced before use'] },
    { name: 'Metadata', items: ['Sponsor set', 'Directorate set', 'Version note required'] },
  ],
};

// AI suggestion for Clause 14 (advisory; the safe Insert / Edit-before-inserting flow).
export const clause14AiSuggestion = {
  original: 'including through human assistance, where identity verification fails, is not successful, or cannot be completed;',
  suggested: 'including through human assistance or alternative identity verification methods, where identity verification fails, is not successful, or cannot be completed;',
  explanation: 'This wording clarifies the obligation to provide assisted access and explicitly recognises alternative identity verification methods when standard checks fail.',
  related: ['Data Protection Act, 2019', 'Public Service Delivery Act, 2019'],
};
