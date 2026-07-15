import { PRIMARY_RECORD_ID } from '@/data/seed';

// Central route table. Stable hash URLs so a presenter can navigate directly.
export const paths = {
  login: '/login',
  dashboard: '/dashboard',
  bills: '/bills',
  work: '/work',
  workflows: '/workflows',
  workflowsCompare: '/workflows/compare',
  workflowTemplate: (slug: string) => `/admin/workflows/${slug}`,
  legislativeNew: '/legislative/new',
  record: (id: string = PRIMARY_RECORD_ID) => `/legislative/${id}`,
  recordDraft: (id: string = PRIMARY_RECORD_ID) => `/legislative/${id}/draft`,
  recordVersions: (id: string = PRIMARY_RECORD_ID) => `/legislative/${id}/versions`,
  recordTasks: (id: string = PRIMARY_RECORD_ID) => `/legislative/${id}/tasks`,
  recordWorkflow: (id: string = PRIMARY_RECORD_ID) => `/legislative/${id}/workflow`,
  recordPbo: (id: string = PRIMARY_RECORD_ID) => `/legislative/${id}?sheet=pbo-assessment`,
  recordPublish: (id: string = PRIMARY_RECORD_ID) => `/legislative/${id}/publish`,
  search: '/search',
  searchQuery: (q: string, mode?: string) => `/search?q=${encodeURIComponent(q)}${mode && mode !== 'all' ? `&mode=${mode}` : ''}`,
  searchSaved: '/search/saved',
  searchRecent: '/search/recent',
  repository: '/repository',
  repositoryCollection: (c: string) => `/repository/${c}`,
  ocrQueue: '/archive/ocr',
  ocrJob: (id: string) => `/archive/ocr/jobs/${id}`,
  ocrVerify: (id: string) => `/archive/ocr/jobs/${id}/verify`,
  historicalRecord: (id: string) => `/repository/historical-records/${id}`,
  research: '/research',
  researchCollection: (id: string) => `/research/${id}`,
  documents: '/documents',
  documentsImport: '/documents/import',
  participation: '/participation',
  analytics: '/analytics',
  audit: '/audit',
  notifications: '/notifications',

  // Public portal (separate shell)
  publicHome: '/public',
  publicBill: (id: string = PRIMARY_RECORD_ID) => `/public/bills/${id}`,
  publicParticipate: (id: string = PRIMARY_RECORD_ID) => `/public/bills/${id}/participate`,
  publicTrack: (ref = 'PPS-2026-00841') => `/public/track/${ref}`,
} as const;

// Presenter deep-link anchors that map to the five hero screens.
export const presenterAnchors: Record<string, string> = {
  '1-command-centre': paths.dashboard,
  '2-bill-workspace': paths.record(),
  '3-drafting': paths.recordDraft(),
  '4-search': paths.search,
  '5-public-participation': paths.publicBill(),
};
