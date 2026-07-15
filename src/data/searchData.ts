import type {
  LegislativeRecord, OutputFormat, Passage, SeededQuery, RepositoryCollection,
  SavedSearch, RecentSearch, ResearchCollection, MatchType,
} from './types';
import type { Tone } from '@/components/ui/tone';

// ---------------------------------------------------------------------------
// Output formats — derived from a record's stage/source unless set explicitly.
// Official outputs only exist once a record has reached an approved/published
// state; historical scans carry scan + OCR-text manifestations.
// ---------------------------------------------------------------------------
export function deriveFormats(r: LegislativeRecord): OutputFormat[] {
  if (r.formats) return r.formats;
  if (r.recordSource === 'Historical scan') return ['Scan', 'OCR Text'];
  const published = ['Published'].includes(r.stage);
  const approved = ['Legal Approval', 'Procedural Review', 'Awaiting Signature', 'Signed and Sealed', 'Archived'].includes(r.stage);
  if (published) return ['PDF', 'HTML', 'AKN XML'];
  if (approved) return ['PDF', 'HTML'];
  return ['HTML'];
}

// How a passage matched → a pastel tone. NO blue/purple: "Meaning and context"
// uses the repurposed neutral charcoal token, and every chip always carries text.
export const matchTone: Record<MatchType, Tone> = {
  'Exact phrase': 'green',
  Title: 'green',
  Reference: 'green',
  'Clause text': 'green',
  'Meaning and context': 'blue', // neutral charcoal token — never actual blue
  'Related record': 'grey',
};

// ---------------------------------------------------------------------------
// Repository collections (Browse panel + repository landing).
// ---------------------------------------------------------------------------
export const repositoryCollections: RepositoryCollection[] = [
  { id: 'bills', label: 'Bills', icon: 'Scale', tone: 'green', count: '12 active · 186 archived', description: 'Primary legislation at every stage of the drafting and approval lifecycle.', to: '/repository/bills' },
  { id: 'motions', label: 'Motions', icon: 'Vote', tone: 'gold', count: '24 active · 431 archived', description: 'Substantive and procedural motions moved before the House.', to: '/repository?type=Motion' },
  { id: 'petitions', label: 'Petitions', icon: 'ScrollText', tone: 'amber', count: '18 open · 327 archived', description: 'Public petitions admitted for consideration by the House.', to: '/repository?type=Petition' },
  { id: 'order-papers', label: 'Order Papers', icon: 'ClipboardList', tone: 'grey', count: '42 records in 2026', description: 'Order of business for each sitting of the National Assembly.', to: '/repository?type=Order Paper' },
  { id: 'statutory-instruments', label: 'Statutory Instruments', icon: 'FileCog', tone: 'green', count: '27 under review', description: 'Regulations and subsidiary legislation laid before the House.', to: '/repository/statutory-instruments' },
  { id: 'historical', label: 'Historical Records', icon: 'Archive', tone: 'grey', count: '1,842 verified scans', description: 'Digitised gazettes, papers and reports from the parliamentary archive.', restrictedCount: 12, to: '/repository/historical-records' },
];

// Repository top-level tabs → which record sources / types they include.
export interface RepoTab { id: string; label: string; }
export const repositoryTabs: RepoTab[] = [
  { id: 'all', label: 'All Records' },
  { id: 'legislative', label: 'Legislative Business' },
  { id: 'publications', label: 'Official Publications' },
  { id: 'historical', label: 'Historical Archive' },
  { id: 'supporting', label: 'Supporting Material' },
];

// Saved repository collections (metadata views, not folders).
export const repositorySavedCollections = [
  { id: 'recently-published', label: 'Recently Published', filter: 'Published records, last 90 days' },
  { id: 'awaiting-signature', label: 'Awaiting Signature', filter: 'Stage: Awaiting Signature' },
  { id: 'active-participation', label: 'Bills with Active Public Participation', filter: 'Public participation: Open' },
  { id: 'signed-sealed', label: 'Signed and Sealed Records', filter: 'Signature: applied' },
  { id: 'retention-review', label: 'Records Approaching Retention Review', filter: 'Retention: due within 12 months' },
];

// ---------------------------------------------------------------------------
// Passage corpus — clause-level hits authored from the seeded legislative prose.
// Excerpts are realistic; `highlights` are wrapped in <mark> at render time.
// ---------------------------------------------------------------------------
const P = 'NA-BILL-2026-015';
export const passages: Passage[] = [
  {
    id: 'ps-015-14', recordId: P, clauseNumber: 14, clauseRef: 'Clause 14 — Protection of vulnerable users',
    matchType: 'Clause text', relevance: 98,
    excerpt: 'A public entity shall take all reasonable measures to ensure that a vulnerable user is not disadvantaged in accessing a digital public service, and shall provide an alternative non-digital channel for a vulnerable user who requires it.',
    highlights: ['vulnerable user', 'alternative non-digital channel', 'reasonable measures'],
    why: 'Contains explicit protection for vulnerable users, including a duty to provide an alternative non-digital channel.',
  },
  {
    id: 'ps-015-6', recordId: P, clauseNumber: 6, clauseRef: 'Clause 6 — Assisted digital access',
    matchType: 'Clause text', relevance: 96,
    excerpt: 'A public entity shall make available assisted digital access to a person who is unable to use a digital public service independently. Assisted digital access shall be provided at no additional cost to the person receiving it.',
    highlights: ['assisted digital access', 'no additional cost', 'unable to use a digital public service'],
    why: 'Provides for assisted digital access for citizens who cannot use a digital service independently.',
  },
  {
    id: 'ps-015-5', recordId: P, clauseNumber: 5, clauseRef: 'Clause 5 — Accessibility of digital services',
    matchType: 'Clause text', relevance: 93,
    excerpt: 'Where a digital public service does not conform to a prescribed accessibility standard, the public entity shall provide an equivalent means of accessing the service.',
    highlights: ['accessibility standard', 'equivalent means of accessing the service'],
    why: 'Requires an equivalent, accessible means of access where digital standards are not met.',
  },
  {
    id: 'ps-015-7', recordId: P, clauseNumber: 7, clauseRef: 'Clause 7 — Identity verification',
    matchType: 'Clause text', relevance: 90,
    excerpt: 'A public entity shall not require a person to create or hold a digital credential as the sole means of accessing a public service, and shall adopt a method of verification that is proportionate to the service.',
    highlights: ['sole means of accessing a public service', 'method of verification', 'proportionate'],
    why: 'Addresses identity-verification alternatives where a digital credential cannot be used.',
  },
  {
    id: 'ps-015-4', recordId: P, clauseNumber: 4, clauseRef: 'Clause 4 — Principles of digital public services',
    matchType: 'Meaning and context', relevance: 84,
    excerpt: 'A digital public service is to be accessible to every person entitled to use it, including a vulnerable user, and capable of being used without recourse to a digital channel where a person requires an alternative.',
    highlights: ['accessible to every person', 'without recourse to a digital channel', 'vulnerable user'],
    why: 'States the guiding principle of accessible, non-digital-optional public services.',
  },
  {
    id: 'ps-015-9', recordId: P, clauseNumber: 9, clauseRef: 'Clause 9 — Data minimisation',
    matchType: 'Meaning and context', relevance: 78,
    excerpt: 'A public entity shall collect only the personal data that is necessary for the provision of a digital public service, processed in accordance with the Data Protection Act, 2019.',
    highlights: ['personal data', 'Data Protection Act, 2019', 'necessary'],
    why: 'Relates data collected during identity verification to data-protection obligations.',
  },
  // Motion on Digital Accessibility
  {
    id: 'ps-mot-046', recordId: 'NA-MOT-2026-046', clauseRef: 'Resolution — Digital accessibility',
    matchType: 'Meaning and context', relevance: 76,
    excerpt: 'This House urges the Government to implement measures to ensure that assisted access and non-digital channels are available in all public institutions.',
    highlights: ['assisted access', 'non-digital channels', 'all public institutions'],
    why: 'A resolution calling for assisted access and non-digital channels across public institutions.',
  },
  // Petition on Assisted Access
  {
    id: 'ps-pet-084', recordId: 'NA-PET-2026-084', clauseRef: 'Prayer of the petition',
    matchType: 'Meaning and context', relevance: 72,
    excerpt: 'Petitioners pray that Parliament ensures all digital government services are accessible through assistance or alternative channels to persons without digital access.',
    highlights: ['accessible through assistance', 'alternative channels', 'without digital access'],
    why: 'A public petition seeking assisted and alternative access to digital government services.',
  },
  // Public Service Delivery Act, 2019 (precedent)
  {
    id: 'ps-act-023', recordId: 'NA-BILL-2019-023', clauseRef: 'Section 7 — Inclusive service delivery',
    matchType: 'Related record', relevance: 70,
    excerpt: 'Section 7 provides that public services must be provided in a manner that is fair, inclusive and accessible to all persons, including those who require assistance.',
    highlights: ['fair, inclusive and accessible', 'require assistance'],
    why: 'Enacted precedent for inclusive and accessible public-service delivery.',
  },
  // Accessibility Standards Regulations (SI)
  {
    id: 'ps-si-016', recordId: 'NA-SI-2026-016', clauseRef: 'Regulation 8 — Accessibility and accommodation',
    matchType: 'Clause text', relevance: 74,
    excerpt: 'Every public service provider shall make reasonable accommodation for persons with disabilities in the design and delivery of digital public services.',
    highlights: ['reasonable accommodation', 'persons with disabilities'],
    why: 'Prescribes accessibility standards and reasonable accommodation to accompany the Bill.',
  },
  // Affordable Housing Levy Bill, 2025 (exact-text demo)
  {
    id: 'ps-ahl-031', recordId: 'NA-BILL-2025-031', clauseRef: 'Clause 3 — Imposition of the levy',
    matchType: 'Exact phrase', relevance: 95,
    excerpt: 'There shall be paid an affordable housing levy through deductions from employee income at the rate prescribed in the Schedule.',
    highlights: ['affordable housing levy', 'deductions from employee income'],
    why: 'Contains the exact phrase "affordable housing levy" and the income-deduction mechanism.',
  },
  // Employment (Amendment) Bill, 2025 (meaning-based similar)
  {
    id: 'ps-emp-042', recordId: 'NA-BILL-2025-042', clauseRef: 'Clause 5 — Deductions from income',
    matchType: 'Meaning and context', relevance: 80,
    excerpt: 'An employer may make deductions from an employee’s income where required by a written law, including deductions applied to statutory housing contributions.',
    highlights: ['deductions from an employee’s income', 'statutory housing contributions'],
    why: 'Concerns income deductions for housing without using the exact phrase — a meaning-based match.',
  },
  // Historical scan
  {
    id: 'ps-hist-2012', recordId: 'NA-HIST-2012-ACC-003', clauseRef: 'Finding 4 — Barriers to access',
    matchType: 'Related record', relevance: 64,
    excerpt: 'The report finds that persons in rural areas face substantial barriers to accessing public services delivered by electronic means.',
    highlights: ['barriers to accessing public services', 'electronic means'],
    why: 'Historical evidence of access barriers, verified from the archived paper record.',
  },
  // Restricted result carries no excerpt — handled in the renderer.
  { id: 'ps-hrc-022', recordId: 'NA-BILL-2026-022', matchType: 'Related record', relevance: 60, excerpt: '', highlights: [], why: '' },
  // Statutory instruments (metadata retrieval demo)
  {
    id: 'ps-si-012', recordId: 'NA-SI-2026-012', clauseRef: 'Published statutory instrument',
    matchType: 'Reference', relevance: 68,
    excerpt: 'Public Finance (County Reporting) Regulations, 2026 — published regulations prescribing county reporting formats and timelines.',
    highlights: ['Public Finance (County Reporting) Regulations, 2026'],
    why: 'A published statutory instrument matching the requested record type and status.',
  },
];

export const passageById = Object.fromEntries(passages.map((p) => [p.id, p]));

// ---------------------------------------------------------------------------
// Seeded queries — deterministic, best-first result ordering + grounded answers.
// ---------------------------------------------------------------------------
export const seededQueries: SeededQuery[] = [
  {
    id: 'q-digital-access',
    keywords: ['without digital access', 'digital access', 'vulnerable', 'assisted', 'protections for citizens', 'digital inclusion'],
    answer: {
      paragraphs: [
        'The Digital Public Services Bill, 2026 contains three provisions relevant to citizens who may be unable to access fully digital services.',
        'Clause 5 requires accessible service standards, Clause 6 provides for assisted digital access, and Clause 14 contains protections for vulnerable users where standard identity-verification processes fail.',
      ],
      evidence: [
        { label: 'Clause 5 — Accessibility of digital services', recordId: P, clauseNumber: 5, passageId: 'ps-015-5' },
        { label: 'Clause 6 — Assisted digital access', recordId: P, clauseNumber: 6, passageId: 'ps-015-6' },
        { label: 'Clause 14 — Protection of vulnerable users', recordId: P, clauseNumber: 14, passageId: 'ps-015-14' },
      ],
      sourceCount: 7,
      clauseCount: 12,
    },
    passageIds: ['ps-015-14', 'ps-015-6', 'ps-015-5', 'ps-015-4', 'ps-mot-046', 'ps-pet-084', 'ps-act-023', 'ps-si-016'],
  },
  {
    id: 'q-reasonable-accommodation',
    keywords: ['reasonable accommodation', 'persons with disabilities', 'duty to provide', 'accommodation'],
    answer: {
      paragraphs: [
        'The following provisions establish a duty to provide reasonable accommodation for persons with disabilities in public services or public institutions.',
        'The most directly relevant is Clause 14 of the Digital Public Services Bill, 2026, supported by Regulation 8 of the accompanying accessibility regulations.',
      ],
      evidence: [
        { label: 'Clause 14 — Protection of vulnerable users', recordId: P, clauseNumber: 14, passageId: 'ps-015-14' },
        { label: 'Clause 6 — Assisted digital access', recordId: P, clauseNumber: 6, passageId: 'ps-015-6' },
        { label: 'Regulation 8 — Accessibility and accommodation', recordId: 'NA-SI-2026-016', passageId: 'ps-si-016' },
      ],
      sourceCount: 7,
      clauseCount: 12,
    },
    passageIds: ['ps-015-14', 'ps-015-6', 'ps-si-016', 'ps-mot-046', 'ps-act-023', 'ps-pet-084'],
  },
  {
    id: 'q-affordable-housing',
    keywords: ['affordable housing levy', 'housing levy'],
    passageIds: ['ps-ahl-031', 'ps-emp-042'],
  },
  {
    id: 'q-income-deductions',
    keywords: ['deductions from employee income', 'deductions from income', 'income for housing', 'employee income'],
    answer: {
      paragraphs: [
        'Legislation providing for deductions from employee income applied to housing is found principally in the Affordable Housing Levy Bill, 2025.',
        'The Employment (Amendment) Bill, 2025 addresses the same subject using different wording, and is surfaced here through meaning-based matching.',
      ],
      evidence: [
        { label: 'Clause 3 — Imposition of the levy', recordId: 'NA-BILL-2025-031', passageId: 'ps-ahl-031' },
        { label: 'Clause 5 — Deductions from income', recordId: 'NA-BILL-2025-042', passageId: 'ps-emp-042' },
      ],
      sourceCount: 2,
      clauseCount: 2,
    },
    passageIds: ['ps-ahl-031', 'ps-emp-042'],
  },
  {
    id: 'q-identity-verification',
    keywords: ['identity verification failure', 'identity verification', 'verification failure', 'verification fails'],
    answer: {
      paragraphs: [
        'Where identity verification cannot be completed, protections are provided in the Digital Public Services Bill, 2026.',
        'Clause 14 requires reasonable accommodation and Clause 7 prevents a digital credential from being the sole means of access.',
      ],
      evidence: [
        { label: 'Clause 14 — Protection of vulnerable users', recordId: P, clauseNumber: 14, passageId: 'ps-015-14' },
        { label: 'Clause 7 — Identity verification', recordId: P, clauseNumber: 7, passageId: 'ps-015-7' },
      ],
      sourceCount: 5,
      clauseCount: 8,
    },
    passageIds: ['ps-015-14', 'ps-015-7', 'ps-015-9', 'ps-pet-084', 'ps-hrc-022'],
  },
  {
    id: 'q-statutory-instruments-2025',
    keywords: ['published statutory instruments', 'statutory instruments from 2025', 'statutory instruments'],
    passageIds: ['ps-si-012', 'ps-si-016'],
  },
];

// Records whose passages carry no excerpt because the current user lacks access.
// (Grace is a DLS drafter; the Health Records Bill is Restricted to its assigned team.)
export const restrictedForDrafter = ['NA-BILL-2026-022'];

// Related-records map used by the preview + Related Records side sheet.
export const relatedRecords: Record<string, string[]> = {
  'NA-BILL-2026-015': ['NA-BILL-2019-023', 'NA-PET-2026-084', 'NA-MOT-2026-046', 'NA-SI-2026-016', 'NA-HIST-2012-ACC-003'],
  'NA-BILL-2025-031': ['NA-BILL-2025-042', 'NA-BILL-2026-008'],
  'NA-HIST-2012-ACC-003': ['NA-BILL-2026-015', 'NA-BILL-2019-023'],
};

// ---------------------------------------------------------------------------
// Seeded personalisation (persisted; restored on Reset).
// ---------------------------------------------------------------------------
export const savedSearchesSeed: SavedSearch[] = [
  {
    id: 'ss-1', name: 'High-priority Bills mentioning data protection', query: 'data protection',
    mode: 'all', filterSummary: 'Bills · High priority · 2025–2026', resultCount: 6,
    lastRun: '2026-07-14T09:10:00+03:00', visibility: 'Directorate', notify: true, ownerId: 'dls-drafter',
  },
  {
    id: 'ss-2', name: 'Public participation closing this month', query: 'public participation closing',
    mode: 'meaning', filterSummary: 'Public participation: Open · Bills, Petitions', resultCount: 4,
    lastRun: '2026-07-13T16:40:00+03:00', visibility: 'Only me', notify: false, ownerId: 'dls-drafter',
  },
  {
    id: 'ss-3', name: 'Statutory instruments awaiting review', query: 'statutory instruments awaiting review',
    mode: 'all', filterSummary: 'Statutory Instruments · In review', resultCount: 5,
    lastRun: '2026-07-11T11:05:00+03:00', visibility: 'Directorate', notify: true, ownerId: 'dls-drafter',
  },
];

export const recentSearchesSeed: RecentSearch[] = [
  { id: 'rs-1', query: 'Digital identity verification safeguards', mode: 'meaning', viewedAt: '2026-07-15T06:57:00+03:00', resultCount: 12, ownerId: 'dls-drafter' },
  { id: 'rs-2', query: 'Previous amendments to public service legislation', mode: 'all', viewedAt: '2026-07-14T15:20:00+03:00', resultCount: 28, ownerId: 'dls-drafter' },
  { id: 'rs-3', query: 'Petitions related to digital accessibility', mode: 'meaning', viewedAt: '2026-07-14T10:05:00+03:00', resultCount: 9, ownerId: 'dls-drafter' },
];

export const researchCollectionsSeed: ResearchCollection[] = [
  {
    id: 'rc-1', name: 'Digital Inclusion Research', ownerId: 'dls-drafter', createdAt: '2026-07-10T09:00:00+03:00',
    description: 'Precedent and provisions on assisted and non-digital access.',
    items: [
      { passageId: 'ps-015-14', recordId: 'NA-BILL-2026-015', clauseNumber: 14, clauseRef: 'Clause 14 — Protection of vulnerable users', versionLabel: 'Current working version 4.0', addedAt: '2026-07-10T09:05:00+03:00' },
      { passageId: 'ps-act-023', recordId: 'NA-BILL-2019-023', clauseRef: 'Section 7 — Inclusive service delivery', versionLabel: 'Published version', addedAt: '2026-07-10T09:07:00+03:00' },
    ],
  },
  {
    id: 'rc-2', name: 'Clause Drafting Precedent', ownerId: 'dls-drafter', createdAt: '2026-07-08T14:00:00+03:00',
    description: 'Comparable clause language across enacted legislation.',
    items: [
      { passageId: 'ps-si-016', recordId: 'NA-SI-2026-016', clauseRef: 'Regulation 8 — Accessibility and accommodation', versionLabel: 'Revised draft 2.0', addedAt: '2026-07-08T14:10:00+03:00' },
    ],
  },
];

// Suggested-search chips on the landing page.
export const suggestedSearches = [
  'Digital inclusion and assisted access',
  'Affordable housing levy',
  'Petitions concerning identity verification',
  'Recent Bills awaiting procedural review',
  'Published statutory instruments from 2025',
  'Clause 14 protections for vulnerable users',
];
