import type {
  AkomaBlockType,
  AkomaSectionTag,
  LegislativeRecord,
  StructuredBillDraft,
  StructuredDraftAttachment,
  StructuredDraftBlock,
  StructuredDraftSection,
} from './types';

const sectionNames: Record<AkomaSectionTag, string> = {
  meta: 'Document metadata',
  coverPage: 'Cover page',
  preface: 'Preface and long title',
  preamble: 'Preamble and enacting formula',
  body: 'Bill body',
  amendmentBody: 'Amendment body',
  collectionBody: 'Document collection',
  debateBody: 'Debate body',
  judgmentBody: 'Judgment body',
  mainBody: 'Main body',
  conclusions: 'Conclusions and signatures',
  attachments: 'Attachments',
  components: 'Components and schedules',
};

export const akomaSectionOptions: Array<{ tag: AkomaSectionTag; description: string }> = [
  { tag: 'coverPage', description: 'Optional cover matter associated with the document.' },
  { tag: 'preface', description: 'Document name, number, sponsor, long title and other opening matter.' },
  { tag: 'preamble', description: 'Enacting formula, legal basis and recitals.' },
  { tag: 'conclusions', description: 'Concluding matter, dates and signatures.' },
  { tag: 'attachments', description: 'Annexes, appendices, related Bills and treaties.' },
  { tag: 'components', description: 'Independent schedules, tables and component documents.' },
];

export const akomaBlockOptions: Array<{ type: AkomaBlockType; label: string; description: string }> = [
  { type: 'part', label: 'Part', description: 'A numbered division of the Bill body.' },
  { type: 'clause', label: 'Clause', description: 'A numbered legislative provision.' },
  { type: 'subclause', label: 'Subclause', description: 'A numbered subdivision within a clause.' },
  { type: 'paragraph', label: 'Paragraph', description: 'A general paragraph or block of text.' },
  { type: 'definition', label: 'Definition', description: 'A term and its legislative meaning.' },
  { type: 'heading', label: 'Heading', description: 'A structural heading without legislative effect.' },
  { type: 'formula', label: 'Enacting formula', description: 'The formal source of legislative authority.' },
  { type: 'recital', label: 'Recital', description: 'Legal basis, context or preparatory statement.' },
  { type: 'crossReference', label: 'Cross-reference', description: 'A link to another provision or record.' },
  { type: 'table', label: 'Table', description: 'Structured rows and columns.' },
  { type: 'schedule', label: 'Schedule', description: 'A schedule represented as a component.' },
  { type: 'annotation', label: 'Annotation', description: 'An internal drafting note.' },
];

export function makeDraftBlock(type: AkomaBlockType, ordinal = 1): StructuredDraftBlock {
  const option = akomaBlockOptions.find((item) => item.type === type);
  const defaults: Partial<Record<AkomaBlockType, string>> = {
    part: `Part ${ordinal}`,
    clause: 'Enter the legislative provision.',
    subclause: 'Enter the subclause text.',
    paragraph: 'Enter text.',
    definition: '“defined term” means ',
    heading: 'Enter heading',
    formula: 'ENACTED by the Parliament of Kenya, as follows—',
    recital: 'WHEREAS ',
    crossReference: 'Refer to section ',
    table: 'Column 1 | Column 2',
    schedule: 'Schedule title',
    annotation: 'Drafting note',
    longTitle: 'A Bill for an Act of Parliament to ',
  };
  return {
    id: `akn-block-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    label: option?.label ?? (type === 'longTitle' ? 'Long title' : 'Block'),
    text: defaults[type] ?? '',
    number: ['clause', 'subclause'].includes(type) ? String(ordinal) : undefined,
  };
}

export function makeDraftSection(tag: AkomaSectionTag): StructuredDraftSection {
  const seedBlocks: StructuredDraftBlock[] = tag === 'preamble'
    ? [makeDraftBlock('formula')]
    : tag === 'preface'
      ? [makeDraftBlock('longTitle')]
      : tag === 'body'
        ? [makeDraftBlock('part'), makeDraftBlock('clause')]
        : [];
  return {
    id: `akn-section-${tag}-${Date.now().toString(36)}`,
    tag,
    title: sectionNames[tag],
    required: tag === 'meta' || tag === 'body',
    blocks: seedBlocks,
  };
}

export function createStructuredDraft(
  record: LegislativeRecord,
  options?: {
    language?: string;
    supportingFiles?: Array<{ name: string; type: string; size: string; uploaded: string }>;
    financialDocs?: Array<{ name: string; type: string; size: string; uploaded: string }>;
  },
): StructuredBillDraft {
  const metadata = makeDraftSection('meta');
  const preface = makeDraftSection('preface');
  if (preface.blocks[0]) {
    preface.blocks[0] = {
      ...preface.blocks[0],
      text: `A Bill for an Act of Parliament to ${record.summary.trim().replace(/^A Bill to\s+/i, '').replace(/\.$/, '')}.`,
    };
  }
  const preamble = makeDraftSection('preamble');
  const body = makeDraftSection('body');
  const attachments: StructuredDraftAttachment[] = [
    ...(options?.supportingFiles ?? []).map((file, index) => ({ ...file, id: `supporting-${index}-${file.name}`, category: 'supporting' as const })),
    ...(options?.financialDocs ?? []).map((file, index) => ({ ...file, id: `financial-${index}-${file.name}`, category: 'financial' as const })),
  ];
  return {
    recordId: record.id,
    documentType: record.workflowType,
    bodyType: 'body',
    language: options?.language ?? 'English',
    title: record.title,
    reference: record.reference,
    sponsor: record.sponsor ?? '',
    authoringBody: record.originatingOffice,
    currentVersion: record.currentVersion,
    activeSectionId: body.id,
    sections: [metadata, preface, preamble, body],
    attachments,
    revisions: [],
    comments: [],
    updatedAt: record.lastUpdated,
  };
}

export function buildStructuredDraftSeed(records: LegislativeRecord[]): Record<string, StructuredBillDraft> {
  return Object.fromEntries(
    records
      .filter((record) => record.recordSource === 'Structured' || record.isPrimary)
      .map((record) => [record.id, createStructuredDraft(record)]),
  );
}
