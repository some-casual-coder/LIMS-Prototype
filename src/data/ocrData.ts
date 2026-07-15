import type {
  OcrJob, OcrPage, OcrLine, OcrIssue, OcrStructureNode, OcrMetaField, OcrChecklistItem, OcrCorrection,
} from './types';

export const PRIMARY_JOB_ID = 'HIST-OCR-2026-0048';
export const PRIMARY_HIST_REF = 'HIST/OP/1984/0612';
export const PRIMARY_HIST_ID = 'HIST-OP-1984-0612';

// ---------------------------------------------------------------------------
// Primary demonstration page (page 7) — the recurring focal page across the
// processing, verification and detail screens. Realistic 1984 Order Paper prose.
// ---------------------------------------------------------------------------
const page7Lines: OcrLine[] = [
  { id: 'p7-l1', n: 1, text: '12th June, 1984]                                   245', kind: 'page-number', confidence: 97 },
  { id: 'p7-l2', n: 2, text: 'NATIONAL ASSEMBLY', kind: 'title', confidence: 98, region: { top: 8, left: 20, width: 60, height: 5 } },
  { id: 'p7-l3', n: 3, text: 'TUESDAY, 12TH JUNE, 1984', kind: 'subheading', confidence: 98, region: { top: 15, left: 26, width: 48, height: 4 } },
  { id: 'p7-l4', n: 4, text: 'The House met at 2.30 p.m.', kind: 'body', confidence: 95 },
  { id: 'p7-l5', n: 5, text: 'PRAYERS', kind: 'heading', confidence: 98 },
  { id: 'p7-l6', n: 6, text: 'The Speaker (Mr. G. E. Kiraitu) in the Chair.', kind: 'body', confidence: 96 },
  { id: 'p7-l7', n: 7, text: 'ORDERS OF THE DAY', kind: 'heading', confidence: 92 },
  { id: 'p7-l8', n: 8, text: '1.  COMMUNICATION FROM THE CHAIR', kind: 'subheading', confidence: 92 },
  { id: 'p7-l9', n: 9, text: 'The Speaker conveyed the following Communication—', kind: 'body', confidence: 92 },
  {
    id: 'p7-l10', n: 10,
    text: '“Honourable Members, I wish to draw your attention to the Business for this Aftrenoon as set out in the Order Paper.”',
    kind: 'body', confidence: 68, low: true, originalText: 'Aftrenoon',
    region: { top: 60, left: 8, width: 84, height: 11 },
  },
  { id: 'p7-l11', n: 11, text: 'I would like to remind Honourable Members that Questions should be brief and to the point.', kind: 'body', confidence: 93 },
  { id: 'p7-l12', n: 12, text: 'You are now aware of the arrangements for the disposal of Government Business and I would ask for your co-operation.', kind: 'body', confidence: 94 },
];

// Lighter representative lines for the surrounding pages so the scan + thumbnails
// render believably without hand-authoring all twelve pages in full.
function repLines(page: number): OcrLine[] {
  return [
    { id: `p${page}-l1`, n: 1, text: `12th June, 1984]                                   ${238 + page}`, kind: 'page-number', confidence: 96 },
    { id: `p${page}-l2`, n: 2, text: 'ORDERS OF THE DAY—(Contd.)', kind: 'heading', confidence: 94 },
    { id: `p${page}-l3`, n: 3, text: 'The Minister for Finance laid on the Table the following Paper—', kind: 'body', confidence: 93 },
    { id: `p${page}-l4`, n: 4, text: 'The Report and Financial Statements of the Public Service Commission for the year ended 30th June, 1983.', kind: 'body', confidence: 92 },
    { id: `p${page}-l5`, n: 5, text: 'THAT, this House resolves to adopt the Report of the Committee on the Order Paper.', kind: 'body', confidence: 91 },
    { id: `p${page}-l6`, n: 6, text: 'Question proposed.', kind: 'body', confidence: 90 },
  ];
}

const pageStates: { state: OcrPage['state']; confidence: number; issues: number }[] = [
  { state: 'verified', confidence: 98, issues: 0 },      // 1
  { state: 'verified', confidence: 96, issues: 0 },      // 2
  { state: 'verified', confidence: 95, issues: 0 },      // 3
  { state: 'verified', confidence: 92, issues: 0 },      // 4
  { state: 'verified', confidence: 90, issues: 0 },      // 5
  { state: 'verified', confidence: 96, issues: 0 },      // 6
  { state: 'in-progress', confidence: 89, issues: 5 },   // 7 (focus)
  { state: 'needs-review', confidence: 85, issues: 2 },  // 8
  { state: 'not-reviewed', confidence: 83, issues: 1 },  // 9
  { state: 'not-reviewed', confidence: 81, issues: 0 },  // 10
  { state: 'not-reviewed', confidence: 80, issues: 0 },  // 11
  { state: 'not-reviewed', confidence: 79, issues: 0 },  // 12
];

const primaryPages: OcrPage[] = pageStates.map((s, i) => ({
  n: i + 1,
  state: s.state,
  confidence: s.confidence,
  issues: s.issues,
  lines: i === 6 ? page7Lines : repLines(i + 1),
}));

const primaryIssues: OcrIssue[] = [
  {
    id: 'LCI-1984-0612-007-0010', page: 7, lineId: 'p7-l10', severity: 'review', type: 'Low confidence text',
    title: 'Low-confidence transcription', location: 'Page 7 · Paragraph 3 · Lines 8–10', confidence: 68,
    originalOcr: '“Honourable Members, I wish to draw your attention to the Business for this Aftrenoon as set out in the Order Paper.”',
    suggestion: '“Honourable Members, I wish to draw your attention to the Business for this Afternoon as set out in the Order Paper.”',
    status: 'open',
  },
  {
    id: 'ISS-007-2', page: 7, lineId: 'p7-l10', severity: 'review', type: 'Possible spelling error',
    title: 'Possible spelling error', location: 'Page 7 · Line 10', confidence: 68,
    originalOcr: 'Aftrenoon', suggestion: 'Afternoon', status: 'open',
  },
  {
    id: 'ISS-007-3', page: 7, lineId: 'p7-l9', severity: 'review', type: 'Punctuation unclear',
    title: 'Punctuation unclear', location: 'Page 7 · Line 9', confidence: 75,
    explanation: "Missing comma after 'attention'.", status: 'open',
  },
  {
    id: 'ISS-007-4', page: 7, severity: 'info', type: 'Handwritten note detected',
    title: 'Handwritten note detected', location: 'Page 7 · Margin right',
    explanation: 'A small handwritten note was detected in the right margin. Mark it for second review.', status: 'open',
  },
  {
    id: 'ISS-007-5', page: 7, lineId: 'p7-l7', severity: 'review', type: 'Section boundary',
    title: 'Unconfirmed section boundary', location: 'Page 7', confidence: 80,
    explanation: "Check the heading level for 'Orders of the Day'.", status: 'open',
  },
];

const primaryStructure: OcrStructureNode[] = [
  { id: 's1', label: 'Document Title — NATIONAL ASSEMBLY', kind: 'title', confirmed: true },
  { id: 's2', label: 'Sitting Information — Tuesday, 12th June, 1984', kind: 'section', confirmed: true },
  { id: 's3', label: 'Prayers', kind: 'section', confirmed: true },
  {
    id: 's4', label: 'Orders of the Day', kind: 'section', confirmed: true, children: [
      { id: 's4a', label: '1. Communication from the Chair', kind: 'subsection', confirmed: true },
      { id: 's4b', label: '2. Questions', kind: 'subsection' },
      { id: 's4c', label: '3. Statements', kind: 'subsection' },
      { id: 's4d', label: '4. Motions', kind: 'subsection' },
      { id: 's4e', label: '5. Notices of Motion', kind: 'subsection' },
      { id: 's4f', label: '6. Business of Government', kind: 'subsection' },
    ],
  },
  { id: 's5', label: 'Adjournment', kind: 'section' },
];

const primaryMetadata: OcrMetaField[] = [
  { field: 'Document Type', value: 'Order Paper', state: 'Suggested' },
  { field: 'Date', value: '12 June 1984', state: 'Suggested' },
  { field: 'Legislature', value: 'National Assembly', state: 'Suggested' },
  { field: 'Sitting', value: 'Tuesday, 12th June 1984', state: 'Needs Review' },
  { field: 'Language', value: 'English', state: 'Suggested' },
  { field: 'Source Archive', value: 'Parliamentary Archives', state: 'Suggested' },
];

const primaryChecklist: OcrChecklistItem[] = [
  { id: 'c1', label: 'All pages reviewed', done: false },
  { id: 'c2', label: 'Blocking issues resolved', done: true },
  { id: 'c3', label: 'Document type confirmed', done: false },
  { id: 'c4', label: 'Title and date confirmed', done: false },
  { id: 'c5', label: 'Structure reviewed', done: false },
  { id: 'c6', label: 'Access classification confirmed', done: true },
  { id: 'c7', label: 'Source archive confirmed', done: true },
  { id: 'c8', label: 'Quality reviewer assigned', done: false },
  { id: 'c9', label: 'Legislative relationships confirmed', done: false, optional: true },
  { id: 'c10', label: 'AKN conversion requested', done: false, optional: true },
  { id: 'c11', label: 'Public-search visibility approved', done: false, optional: true },
];

const primaryCorrections: OcrCorrection[] = [
  { id: 'cor-1', page: 3, lineId: 'p3-l4', original: 'Financia1 Statements', corrected: 'Financial Statements', officerId: 'records-officer', at: '2026-07-18T10:04:00+03:00', confidenceBefore: 71 },
  { id: 'cor-2', page: 5, lineId: 'p5-l5', original: 'adont', corrected: 'adopt', officerId: 'records-officer', at: '2026-07-18T10:09:00+03:00', confidenceBefore: 66 },
];

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------
export const primaryJob: OcrJob = {
  id: PRIMARY_JOB_ID, reference: PRIMARY_HIST_REF, title: 'National Assembly Order Paper — 12 June 1984',
  dateLabel: '12 June 1984', recordType: 'Order Paper', sourceArchive: 'Parliamentary Archives', sourceFormat: 'Scanned PDF',
  pageCount: 12, status: 'Needs Verification', ocrConfidence: 91, lowConfidenceRegions: 8, verifiedPages: 7, issueCount: 8,
  assignedToId: 'records-officer', reviewerId: 'quality-reviewer', updatedAt: '2026-07-18T11:00:00+03:00',
  classification: 'Internal until publication', physicalRef: 'Box OP-1984-06', shelf: 'Folder 12', language: 'English',
  notes: 'Digitised as part of the 1984 Parliamentary Records Project.',
  importedById: 'records-officer', importedAt: '2026-07-15T10:42:00+03:00', checksum: 'a3f2…9b7e',
  pages: primaryPages, issues: primaryIssues, corrections: primaryCorrections,
  structure: primaryStructure, metadata: primaryMetadata, checklist: primaryChecklist,
};

export const otherJobs: OcrJob[] = [
  {
    id: 'HIST-OCR-2026-0051', reference: 'HIST/SIR/2008/002', title: 'Statutory Instrument Register — 2008',
    dateLabel: '2008', recordType: 'Statutory Instrument', sourceArchive: 'Parliamentary Archives', sourceFormat: 'Scanned PDF',
    pageCount: 26, status: 'Processing', processingStep: 'Detecting structure', processingProgress: 64,
    ocrConfidence: 0, lowConfidenceRegions: 0, verifiedPages: 0, issueCount: 0,
    updatedAt: '2026-07-18T10:54:00+03:00', classification: 'Internal until publication', language: 'English',
    importedById: 'records-officer', importedAt: '2026-07-18T10:40:00+03:00', checksum: 'c19d…2f4a',
  },
  {
    id: 'HIST-OCR-2026-0052', reference: 'HIST/GN/1992/033', title: 'Gazette Notice Collection — 1992',
    dateLabel: '1992', recordType: 'Gazette', sourceArchive: 'National Archives', sourceFormat: 'Scanned PDF',
    pageCount: 15, status: 'Processing', processingStep: 'Extracting text', processingProgress: 38,
    ocrConfidence: 0, lowConfidenceRegions: 0, verifiedPages: 0, issueCount: 0,
    updatedAt: '2026-07-18T10:48:00+03:00', classification: 'Public', language: 'English',
    importedById: 'records-officer', importedAt: '2026-07-18T10:36:00+03:00', checksum: 'd8b1…77c2',
  },
  {
    id: 'HIST-OCR-2026-0044', reference: 'HIST/CR/2004/007', title: 'Committee Report on Public Service Reform, 2004',
    dateLabel: '2004', recordType: 'Committee Report', sourceArchive: 'Parliamentary Archives', sourceFormat: 'Scanned PDF',
    pageCount: 42, status: 'Needs Verification', ocrConfidence: 94, lowConfidenceRegions: 6, verifiedPages: 14, issueCount: 6,
    assignedToId: 'records-officer', updatedAt: '2026-07-18T10:00:00+03:00', classification: 'Internal until publication',
    language: 'English', importedById: 'records-officer', importedAt: '2026-07-17T14:20:00+03:00', checksum: 'ff01…9a3b',
  },
  {
    id: 'HIST-OCR-2026-0039', reference: 'HIST/QOA/1990/041', title: 'Questions for Oral Answer — 1990',
    dateLabel: '1990', recordType: 'Question', sourceArchive: 'Parliamentary Archives', sourceFormat: 'Scanned PDF',
    pageCount: 8, status: 'Needs Verification', ocrConfidence: 88, lowConfidenceRegions: 2, verifiedPages: 3, issueCount: 2,
    assignedToId: 'records-wanjiru', updatedAt: '2026-07-18T09:00:00+03:00', classification: 'Public',
    language: 'English', importedById: 'records-wanjiru', importedAt: '2026-07-17T11:10:00+03:00', checksum: 'ab77…3e10',
  },
  {
    id: 'HIST-OCR-2026-0031', reference: 'HIST/VP/1998/0317', title: 'Votes and Proceedings — 17 March 1998',
    dateLabel: '17 March 1998', recordType: 'Votes and Proceedings', sourceArchive: 'Parliamentary Archives', sourceFormat: 'Scanned PDF',
    pageCount: 18, status: 'Quality Review', ocrConfidence: 97, lowConfidenceRegions: 0, verifiedPages: 18, issueCount: 0,
    assignedToId: 'records-officer', reviewerId: 'quality-reviewer', updatedAt: '2026-07-18T10:25:00+03:00',
    classification: 'Internal until publication', language: 'English', importedById: 'records-officer', importedAt: '2026-07-16T09:00:00+03:00', checksum: '5c2e…d90f',
  },
  {
    id: 'HIST-OCR-2026-0026', reference: 'HIST/PT/1978/009', title: 'Petition on Land Administration — 1978',
    dateLabel: '1978', recordType: 'Petition', sourceArchive: 'Parliamentary Archives', sourceFormat: 'Scanned PDF',
    pageCount: 11, status: 'Ready to Archive', ocrConfidence: 93, lowConfidenceRegions: 0, verifiedPages: 11, issueCount: 0,
    assignedToId: 'records-officer', reviewerId: 'quality-reviewer', updatedAt: '2026-07-18T08:00:00+03:00',
    classification: 'Public', language: 'English', importedById: 'records-officer', importedAt: '2026-07-15T15:00:00+03:00', checksum: '7a44…c1b8',
  },
  {
    id: 'HIST-OCR-2026-0014', reference: 'HIST/GN/1976/014', title: 'Gazette Notice Collection — 1976',
    dateLabel: '1976', recordType: 'Gazette', sourceArchive: 'Parliamentary Archives', sourceFormat: 'Scanned PDF',
    pageCount: 9, status: 'Attention Required', processingStep: 'Possible missing pages',
    ocrConfidence: 72, lowConfidenceRegions: 1, verifiedPages: 2, issueCount: 1, suspectedMissingPage: 6,
    assignedToId: 'records-officer', updatedAt: '2026-07-18T10:15:00+03:00', classification: 'Public',
    language: 'English', importedById: 'records-officer', importedAt: '2026-07-18T09:30:00+03:00', checksum: 'e330…41aa',
  },
  {
    id: 'HIST-OCR-2026-0009', reference: 'HIST/CORR/1981/002', title: 'Speaker’s Correspondence File — 1981 (Restricted)',
    dateLabel: '1981', recordType: 'Correspondence', sourceArchive: 'Parliamentary Archives', sourceFormat: 'Scanned PDF',
    pageCount: 14, status: 'Verified', ocrConfidence: 90, lowConfidenceRegions: 0, verifiedPages: 14, issueCount: 0,
    restricted: true, assignedToId: 'records-officer', reviewerId: 'quality-reviewer', updatedAt: '2026-07-16T16:00:00+03:00',
    classification: 'Restricted', language: 'English', importedById: 'records-officer', importedAt: '2026-07-14T10:00:00+03:00', checksum: 'b012…7f5d',
  },
];

export const allJobsSeed: OcrJob[] = [primaryJob, ...otherJobs];

// The six-stage processing pipeline shown on the OCR Processing screen.
export const ocrPipeline = [
  { id: 'prepare', label: 'Preparing Pages', detail: '12 pages detected' },
  { id: 'enhance', label: 'Enhancing Scan', detail: 'Contrast & deskew' },
  { id: 'extract', label: 'Extracting Text', detail: 'Reading page content' },
  { id: 'structure', label: 'Detecting Structure', detail: 'Finding sections' },
  { id: 'metadata', label: 'Suggesting Metadata', detail: 'Identifying details' },
  { id: 'confidence', label: 'Checking Confidence', detail: 'Analysing quality' },
] as const;

// Verified record identity added to the Repository/Search on archive.
export const verifiedHistoricalRecordSeed = {
  id: PRIMARY_HIST_ID,
  reference: PRIMARY_HIST_REF,
  title: 'National Assembly Order Paper — 12 June 1984',
  citation: 'HIST/OP/1984/0612',
};
