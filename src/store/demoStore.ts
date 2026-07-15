import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  RoleId, LegislativeRecord, Version, Task, AppNotification, Submission,
  AuditEvent, Comment, ValidationIssue, BillContent, WorkflowStage,
  SavedSearch, RecentSearch, ResearchCollection, ResearchItem, AccessRequest,
  OcrJob, OcrCorrection, OcrPageState, OcrIssueStatus,
} from '@/data/types';
import { buildInitialState } from '@/data/seed';
import { defaultPinned, defaultRecentlyOpened } from '@/data/myWork';
import {
  savedSearchesSeed, recentSearchesSeed, researchCollectionsSeed,
} from '@/data/searchData';
import { allJobsSeed } from '@/data/ocrData';

// Runtime demo state. The persona layer (role, offline) plus all mutable
// legislative data live here, persisted to localStorage. A single reset
// action restores the pristine seeded dataset.
interface DemoState {
  // Session / presenter state
  currentRole: RoleId | null;
  offline: boolean;

  // My Work personalisation
  pinned: string[];
  recentlyOpened: string[];

  // Search & Repository personalisation (Phase 4)
  savedSearches: SavedSearch[];
  recentSearches: RecentSearch[];
  researchCollections: ResearchCollection[];
  accessRequests: AccessRequest[];

  // OCR & Historical Records (Phase 5)
  ocrJobs: OcrJob[];

  // Mutable legislative data
  records: LegislativeRecord[];
  versions: Version[];
  tasks: Task[];
  notifications: AppNotification[];
  submissions: Submission[];
  auditEvents: AuditEvent[];
  comments: Comment[];
  validationIssues: ValidationIssue[];
  billContent: BillContent;

  // Actions
  setRole: (role: RoleId | null) => void;
  toggleOffline: () => void;
  reset: () => void;

  togglePin: (recordId: string) => void;
  markRecentlyOpened: (recordId: string) => void;

  updateRecord: (id: string, patch: Partial<LegislativeRecord>) => void;
  setStage: (recordId: string, stage: WorkflowStage) => void;

  addVersion: (version: Version) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;

  addNotification: (n: AppNotification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (recipientId: RoleId) => void;

  addSubmission: (s: Submission) => void;
  updateSubmission: (id: string, patch: Partial<Submission>) => void;

  addAuditEvent: (e: AuditEvent) => void;
  resolveComment: (id: string) => void;
  addComment: (c: Comment) => void;
  resolveValidation: (id: string) => void;
  updateClauseText: (clauseNumber: number, paragraphs: string[]) => void;

  // Search & Repository actions
  addSavedSearch: (s: SavedSearch) => void;
  removeSavedSearch: (id: string) => void;
  logRecentSearch: (r: RecentSearch) => void;
  toggleRecentPin: (id: string) => void;
  removeRecentSearch: (id: string) => void;
  createResearchCollection: (c: ResearchCollection) => void;
  addToResearchCollection: (collectionId: string, item: ResearchItem) => void;
  requestAccess: (req: AccessRequest) => void;

  // OCR & Historical Records actions
  addOcrJob: (job: OcrJob) => void;
  updateOcrJob: (id: string, patch: Partial<OcrJob>) => void;
  setOcrPageState: (jobId: string, page: number, state: OcrPageState) => void;
  correctOcrLine: (jobId: string, page: number, lineId: string, corrected: string) => void;
  setOcrIssueStatus: (jobId: string, issueId: string, status: OcrIssueStatus) => void;
  confirmOcrMeta: (jobId: string, field: string) => void;
  toggleOcrChecklist: (jobId: string, itemId: string) => void;
  addRecord: (record: LegislativeRecord) => void;
}

const initial = buildInitialState();

export const useDemoStore = create<DemoState>()(
  persist(
    (set) => ({
      currentRole: null,
      offline: false,
      pinned: [...defaultPinned],
      recentlyOpened: [...defaultRecentlyOpened],
      savedSearches: structuredClone(savedSearchesSeed),
      recentSearches: structuredClone(recentSearchesSeed),
      researchCollections: structuredClone(researchCollectionsSeed),
      accessRequests: [],
      ocrJobs: structuredClone(allJobsSeed),
      ...initial,

      setRole: (role) => set({ currentRole: role }),
      toggleOffline: () => set((s) => ({ offline: !s.offline })),
      reset: () => set({
        currentRole: null, offline: false,
        pinned: [...defaultPinned], recentlyOpened: [...defaultRecentlyOpened],
        savedSearches: structuredClone(savedSearchesSeed),
        recentSearches: structuredClone(recentSearchesSeed),
        researchCollections: structuredClone(researchCollectionsSeed),
        accessRequests: [],
        ocrJobs: structuredClone(allJobsSeed),
        ...buildInitialState(),
      }),

      togglePin: (recordId) =>
        set((s) => ({
          pinned: s.pinned.includes(recordId)
            ? s.pinned.filter((id) => id !== recordId)
            : [recordId, ...s.pinned].slice(0, 5),
        })),
      markRecentlyOpened: (recordId) =>
        set((s) => ({
          recentlyOpened: [recordId, ...s.recentlyOpened.filter((id) => id !== recordId)].slice(0, 4),
        })),

      updateRecord: (id, patch) =>
        set((s) => ({
          records: s.records.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),

      setStage: (recordId, stage) =>
        set((s) => ({
          records: s.records.map((r) =>
            r.id === recordId ? { ...r, stage, lastUpdated: new Date().toISOString() } : r,
          ),
        })),

      addVersion: (version) => set((s) => ({ versions: [...s.versions, version] })),
      addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
      updateTask: (id, patch) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),

      addNotification: (n) => set((s) => ({ notifications: [n, ...s.notifications] })),
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      markAllNotificationsRead: (recipientId) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.recipientId === recipientId ? { ...n, read: true } : n,
          ),
        })),

      addSubmission: (sub) => set((s) => ({ submissions: [sub, ...s.submissions] })),
      updateSubmission: (id, patch) =>
        set((s) => ({
          submissions: s.submissions.map((sub) => (sub.id === id ? { ...sub, ...patch } : sub)),
        })),

      addAuditEvent: (e) => set((s) => ({ auditEvents: [e, ...s.auditEvents] })),
      resolveComment: (id) =>
        set((s) => ({
          comments: s.comments.map((c) => (c.id === id ? { ...c, resolved: true } : c)),
        })),
      addComment: (c) => set((s) => ({ comments: [c, ...s.comments] })),
      resolveValidation: (id) =>
        set((s) => ({
          validationIssues: s.validationIssues.map((v) =>
            v.id === id ? { ...v, resolved: true } : v,
          ),
        })),
      updateClauseText: (clauseNumber, paragraphs) =>
        set((s) => ({
          billContent: {
            ...s.billContent,
            clauses: s.billContent.clauses.map((c) =>
              c.number === clauseNumber ? { ...c, paragraphs, changed: true } : c,
            ),
          },
        })),

      addSavedSearch: (saved) => set((s) => ({ savedSearches: [saved, ...s.savedSearches] })),
      removeSavedSearch: (id) => set((s) => ({ savedSearches: s.savedSearches.filter((x) => x.id !== id) })),
      logRecentSearch: (r) =>
        set((s) => {
          // Collapse repeat queries; keep the 12 most recent, preserving pins.
          const withoutDup = s.recentSearches.filter(
            (x) => !(x.query.toLowerCase() === r.query.toLowerCase() && x.ownerId === r.ownerId) || x.pinned,
          );
          return { recentSearches: [r, ...withoutDup].slice(0, 12) };
        }),
      toggleRecentPin: (id) =>
        set((s) => ({
          recentSearches: s.recentSearches.map((x) => (x.id === id ? { ...x, pinned: !x.pinned } : x)),
        })),
      removeRecentSearch: (id) => set((s) => ({ recentSearches: s.recentSearches.filter((x) => x.id !== id) })),
      createResearchCollection: (c) => set((s) => ({ researchCollections: [c, ...s.researchCollections] })),
      addToResearchCollection: (collectionId, item) =>
        set((s) => ({
          researchCollections: s.researchCollections.map((c) =>
            c.id === collectionId ? { ...c, items: [...c.items, item] } : c,
          ),
        })),
      requestAccess: (req) => set((s) => ({ accessRequests: [req, ...s.accessRequests] })),

      addOcrJob: (job) => set((s) => ({ ocrJobs: [job, ...s.ocrJobs] })),
      updateOcrJob: (id, patch) =>
        set((s) => ({ ocrJobs: s.ocrJobs.map((j) => (j.id === id ? { ...j, ...patch, updatedAt: new Date().toISOString() } : j)) })),
      setOcrPageState: (jobId, page, state) =>
        set((s) => ({
          ocrJobs: s.ocrJobs.map((j) => {
            if (j.id !== jobId || !j.pages) return j;
            const pages = j.pages.map((p) => (p.n === page ? { ...p, state } : p));
            return { ...j, pages, verifiedPages: pages.filter((p) => p.state === 'verified').length };
          }),
        })),
      correctOcrLine: (jobId, page, lineId, corrected) =>
        set((s) => ({
          ocrJobs: s.ocrJobs.map((j) => {
            if (j.id !== jobId || !j.pages) return j;
            let entry: OcrCorrection | null = null;
            const pages = j.pages.map((p) => {
              if (p.n !== page) return p;
              const lines = p.lines.map((l) => {
                if (l.id !== lineId) return l;
                entry = {
                  id: `cor-${Date.now().toString(36)}`, page, lineId,
                  original: l.originalText ?? l.text, corrected, officerId: s.currentRole ?? 'records-officer',
                  at: new Date().toISOString(), confidenceBefore: l.confidence,
                };
                return { ...l, text: corrected, corrected: true, low: false, confidence: 100 };
              });
              return { ...p, lines };
            });
            return { ...j, pages, corrections: entry ? [...(j.corrections ?? []), entry] : j.corrections };
          }),
        })),
      setOcrIssueStatus: (jobId, issueId, status) =>
        set((s) => ({
          ocrJobs: s.ocrJobs.map((j) => {
            if (j.id !== jobId || !j.issues) return j;
            const issues = j.issues.map((i) => (i.id === issueId ? { ...i, status } : i));
            const openOnPage = (pg: number) => issues.filter((i) => i.page === pg && i.status === 'open').length;
            const pages = j.pages?.map((p) => ({ ...p, issues: openOnPage(p.n) }));
            return {
              ...j, issues, pages,
              issueCount: issues.filter((i) => i.status === 'open').length,
              lowConfidenceRegions: issues.filter((i) => i.status === 'open' && i.confidence != null).length,
            };
          }),
        })),
      confirmOcrMeta: (jobId, field) =>
        set((s) => ({
          ocrJobs: s.ocrJobs.map((j) =>
            j.id === jobId && j.metadata
              ? { ...j, metadata: j.metadata.map((m) => (m.field === field ? { ...m, state: 'Confirmed' } : m)) }
              : j,
          ),
        })),
      toggleOcrChecklist: (jobId, itemId) =>
        set((s) => ({
          ocrJobs: s.ocrJobs.map((j) =>
            j.id === jobId && j.checklist
              ? { ...j, checklist: j.checklist.map((c) => (c.id === itemId ? { ...c, done: !c.done } : c)) }
              : j,
          ),
        })),
      addRecord: (record) =>
        set((s) => (s.records.some((r) => r.id === record.id) ? {} : { records: [record, ...s.records] })),
    }),
    {
      name: 'lims-national-assembly',
      version: 5,
      // On a data-model change, discard stale persisted data and reseed. Prototype
      // personalisation (role/pins/searches) is intentionally reset with the data.
      migrate: () => ({
        currentRole: null,
        offline: false,
        pinned: [...defaultPinned],
        recentlyOpened: [...defaultRecentlyOpened],
        savedSearches: structuredClone(savedSearchesSeed),
        recentSearches: structuredClone(recentSearchesSeed),
        researchCollections: structuredClone(researchCollectionsSeed),
        accessRequests: [],
        ocrJobs: structuredClone(allJobsSeed),
        ...buildInitialState(),
      }),
    },
  ),
);
