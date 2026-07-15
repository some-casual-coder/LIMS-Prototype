import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  RoleId, LegislativeRecord, Version, Task, AppNotification, Submission,
  AuditEvent, Comment, ValidationIssue, BillContent, WorkflowStage,
  SavedSearch, RecentSearch, ResearchCollection, ResearchItem, AccessRequest,
  OcrJob, OcrCorrection, OcrPageState, OcrIssueStatus,
  WorkflowTemplate, WorkflowStageDef,
  StructuredBillDraft, StructuredDraftBlock, StructuredDraftSection,
} from '@/data/types';
import { buildInitialState } from '@/data/seed';
import { defaultPinned, defaultRecentlyOpened, type WorkItem } from '@/data/myWork';
import {
  savedSearchesSeed, recentSearchesSeed, researchCollectionsSeed,
} from '@/data/searchData';
import { allJobsSeed } from '@/data/ocrData';
import { workflowTemplatesSeed } from '@/data/workflows';
import {
  billTasksSeed, stageGatesSeed, CURRENT_STAGE_ID, PBO_TASK_ID,
  type BillTask, type StageGate,
} from '@/data/billTasks';
import {
  pboSeed, PBO_GATEWAY_REF, PBO_FIN_NOTE, PBO_RESPONSE_SUMMARY, type PboAssessment,
} from '@/data/pbo';
import { publicationSeed, type PublicationRecord } from '@/data/publication';
import { buildStructuredDraftSeed } from '@/data/structuredDrafts';

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

  // Workflow Catalogue & Configuration (Priority 0 sanity sprint)
  workflowTemplates: WorkflowTemplate[];

  // My Work items created at runtime by the instruction wizard (reset-safe).
  createdWorkItems: WorkItem[];

  // Bill Tasks & Workflow Control (Priority 0 sanity sprint)
  billTasks: BillTask[];
  stageGates: StageGate[];
  currentStageId: string;

  // PBO Assessment Integration (Priority 0 sanity sprint)
  pbo: PboAssessment;

  // Signature, Seal & Publication Centre (Priority 0 sanity sprint)
  publication: PublicationRecord;

  // Browser-persisted Akoma Ntoso drafting documents, keyed by record id.
  structuredDrafts: Record<string, StructuredBillDraft>;

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
  addStructuredDraft: (draft: StructuredBillDraft) => void;
  replaceStructuredDraft: (draft: StructuredBillDraft) => void;
  updateStructuredDraftMeta: (recordId: string, patch: Partial<StructuredBillDraft>) => void;
  setStructuredDraftActiveSection: (recordId: string, sectionId: string) => void;
  addStructuredDraftSection: (recordId: string, section: StructuredDraftSection) => void;
  addStructuredDraftBlock: (recordId: string, sectionId: string, block: StructuredDraftBlock) => void;
  updateStructuredDraftBlock: (recordId: string, blockId: string, patch: Partial<StructuredDraftBlock>) => void;
  removeStructuredDraftBlock: (recordId: string, blockId: string) => void;
  saveStructuredDraftRevision: (recordId: string, actorId: string, note: string) => void;

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

  // Workflow configuration actions
  updateWorkflowStage: (slug: string, stageId: string, patch: Partial<WorkflowStageDef>) => void;
  publishWorkflow: (slug: string) => void;
  addWorkflowTemplate: (template: WorkflowTemplate) => void;
  addWorkItem: (item: WorkItem) => void;

  // Bill task & stage-gate actions
  completeBillTask: (id: string) => void;
  reassignBillTask: (id: string, toId: string) => void;
  requestBillTaskExtension: (id: string, days: number, reason: string) => void;
  escalateBillTask: (id: string, toId: string) => void;
  returnBillTask: (id: string) => void;
  addBillTask: (task: BillTask) => void;
  advanceBillStage: () => void;

  // PBO assessment actions
  sendPboRequest: () => void;
  receivePboResponse: () => void;
  markPboSatisfied: () => void;
  failPboGateway: () => void;
  retryPboRequest: () => void;
  preparePboManualTransfer: () => void;

  // Signature, seal & publication actions
  applyPublicationSignature: () => void;
  applyPublicationSeal: () => void;
  markPublicationReady: () => void;
  publishRecord: (note: string) => void;
  failPublicationDestination: () => void;
  retryPublicationDestination: () => void;
}

// Roll a version label forward one minor step, e.g. "v3.2" -> "v3.3".
function bumpVersion(v: string): string {
  const m = v.match(/^v?(\d+)\.(\d+)$/);
  if (!m) return v;
  return `v${m[1]}.${Number(m[2]) + 1}`;
}

// Append a history entry to the blocking PBO task as its request/response
// state changes, so the task's Activity trail reflects the PBO exchange.
function appendPboHistory(tasks: BillTask[], label: string): BillTask[] {
  return tasks.map((t) =>
    t.id === PBO_TASK_ID ? { ...t, history: [...t.history, { label, at: 'Just now' }] } : t,
  );
}

const initial = buildInitialState();
const initialStructuredDrafts = buildStructuredDraftSeed(initial.records);

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
      workflowTemplates: structuredClone(workflowTemplatesSeed),
      createdWorkItems: [],
      billTasks: structuredClone(billTasksSeed),
      stageGates: structuredClone(stageGatesSeed),
      currentStageId: CURRENT_STAGE_ID,
      pbo: structuredClone(pboSeed),
      publication: structuredClone(publicationSeed),
      structuredDrafts: structuredClone(initialStructuredDrafts),
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
        workflowTemplates: structuredClone(workflowTemplatesSeed),
        createdWorkItems: [],
        billTasks: structuredClone(billTasksSeed),
        stageGates: structuredClone(stageGatesSeed),
        currentStageId: CURRENT_STAGE_ID,
        pbo: structuredClone(pboSeed),
        publication: structuredClone(publicationSeed),
        structuredDrafts: structuredClone(buildStructuredDraftSeed(buildInitialState().records)),
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

      addStructuredDraft: (draft) =>
        set((s) => ({ structuredDrafts: { ...s.structuredDrafts, [draft.recordId]: draft } })),
      replaceStructuredDraft: (draft) =>
        set((s) => ({ structuredDrafts: { ...s.structuredDrafts, [draft.recordId]: draft } })),
      updateStructuredDraftMeta: (recordId, patch) =>
        set((s) => {
          const draft = s.structuredDrafts[recordId];
          if (!draft) return {};
          return {
            structuredDrafts: {
              ...s.structuredDrafts,
              [recordId]: { ...draft, ...patch, recordId, updatedAt: new Date().toISOString() },
            },
          };
        }),
      setStructuredDraftActiveSection: (recordId, sectionId) =>
        set((s) => {
          const draft = s.structuredDrafts[recordId];
          if (!draft || !draft.sections.some((section) => section.id === sectionId)) return {};
          return {
            structuredDrafts: {
              ...s.structuredDrafts,
              [recordId]: { ...draft, activeSectionId: sectionId },
            },
          };
        }),
      addStructuredDraftSection: (recordId, section) =>
        set((s) => {
          const draft = s.structuredDrafts[recordId];
          if (!draft || draft.sections.some((item) => item.tag === section.tag)) return {};
          const sections = [...draft.sections, section];
          const sectionOrder = ['meta', 'coverPage', 'preface', 'preamble', 'body', 'amendmentBody', 'collectionBody', 'debateBody', 'judgmentBody', 'mainBody', 'conclusions', 'attachments', 'components'];
          sections.sort((a, b) => sectionOrder.indexOf(a.tag) - sectionOrder.indexOf(b.tag));
          return {
            structuredDrafts: {
              ...s.structuredDrafts,
              [recordId]: { ...draft, sections, activeSectionId: section.id, updatedAt: new Date().toISOString() },
            },
          };
        }),
      addStructuredDraftBlock: (recordId, sectionId, block) =>
        set((s) => {
          const draft = s.structuredDrafts[recordId];
          if (!draft) return {};
          return {
            structuredDrafts: {
              ...s.structuredDrafts,
              [recordId]: {
                ...draft,
                activeSectionId: sectionId,
                updatedAt: new Date().toISOString(),
                sections: draft.sections.map((section) => section.id === sectionId
                  ? { ...section, blocks: [...section.blocks, block] }
                  : section),
              },
            },
          };
        }),
      updateStructuredDraftBlock: (recordId, blockId, patch) =>
        set((s) => {
          const draft = s.structuredDrafts[recordId];
          if (!draft) return {};
          return {
            structuredDrafts: {
              ...s.structuredDrafts,
              [recordId]: {
                ...draft,
                updatedAt: new Date().toISOString(),
                sections: draft.sections.map((section) => ({
                  ...section,
                  blocks: section.blocks.map((block) => block.id === blockId ? { ...block, ...patch } : block),
                })),
              },
            },
          };
        }),
      removeStructuredDraftBlock: (recordId, blockId) =>
        set((s) => {
          const draft = s.structuredDrafts[recordId];
          if (!draft) return {};
          return {
            structuredDrafts: {
              ...s.structuredDrafts,
              [recordId]: {
                ...draft,
                updatedAt: new Date().toISOString(),
                sections: draft.sections.map((section) => ({
                  ...section,
                  blocks: section.blocks.filter((block) => block.id !== blockId),
                })),
              },
            },
          };
        }),
      saveStructuredDraftRevision: (recordId, actorId, note) =>
        set((s) => {
          const draft = s.structuredDrafts[recordId];
          if (!draft) return {};
          const [major, minor] = draft.currentVersion.split('.').map(Number);
          const version = `${Number.isFinite(major) ? major : 0}.${(Number.isFinite(minor) ? minor : 0) + 1}`;
          const savedAt = new Date().toISOString();
          const revision = {
            id: `revision-${recordId}-${Date.now().toString(36)}`,
            version,
            savedAt,
            savedBy: actorId,
            note,
            sections: structuredClone(draft.sections),
          };
          return {
            structuredDrafts: {
              ...s.structuredDrafts,
              [recordId]: { ...draft, currentVersion: version, revisions: [...draft.revisions, revision], updatedAt: savedAt },
            },
            records: s.records.map((record) => record.id === recordId
              ? { ...record, currentVersion: version, currentVersionLabel: 'Structured working draft', lastUpdated: savedAt }
              : record),
          };
        }),

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

      updateWorkflowStage: (slug, stageId, patch) =>
        set((s) => ({
          workflowTemplates: s.workflowTemplates.map((w) => {
            if (w.slug !== slug) return w;
            const stages = w.stages.map((st) => (st.id === stageId ? { ...st, ...patch } : st));
            // Editing a published workflow does not silently alter active records —
            // it marks unpublished changes that a later Publish rolls into a new version.
            return {
              ...w,
              stages,
              hasUnpublishedChanges: w.publishState === 'Published' ? true : w.hasUnpublishedChanges,
              lastUpdated: new Date().toISOString().slice(0, 10),
            };
          }),
        })),

      publishWorkflow: (slug) =>
        set((s) => ({
          workflowTemplates: s.workflowTemplates.map((w) =>
            w.slug === slug
              ? {
                  ...w,
                  publishState: 'Published',
                  configStatus: 'Complete',
                  hasUnpublishedChanges: false,
                  version: w.hasUnpublishedChanges || w.publishState === 'Draft' ? bumpVersion(w.version) : w.version,
                  lastUpdated: new Date().toISOString().slice(0, 10),
                }
              : w,
          ),
        })),
      addWorkflowTemplate: (template) =>
        set((s) => (s.workflowTemplates.some((w) => w.slug === template.slug)
          ? {}
          : { workflowTemplates: [template, ...s.workflowTemplates] })),
      addWorkItem: (item) =>
        set((s) => (s.createdWorkItems.some((w) => w.recordId === item.recordId)
          ? {}
          : { createdWorkItems: [item, ...s.createdWorkItems] })),

      completeBillTask: (id) =>
        set((s) => {
          const billTasks = s.billTasks.map((t) =>
            t.id === id
              ? { ...t, status: 'Completed' as const, group: 'completed' as const, overdue: false, escalated: false,
                  history: [...t.history, { label: 'Task completed', at: 'Just now' }] }
              : t);
          // Completing the PBO dependency clears the Legal Review blocking gate.
          const stageGates = id === PBO_TASK_ID
            ? s.stageGates.map((g) => (g.id === 'legal-review'
                ? {
                    ...g,
                    blocking: [],
                    exit: g.exit.map((e) => (e.label.startsWith('PBO') ? { ...e, status: 'Met' as const } : e)),
                    validation: g.validation.map((v) => (v.label.includes('Required documents') ? { ...v, status: 'Met' as const } : v)),
                    mandatory: g.mandatory.map((m) => (m.label.includes('PBO') ? { ...m, done: m.total } : m)),
                  }
                : g))
            : s.stageGates;
          return { billTasks, stageGates };
        }),

      reassignBillTask: (id, toId) =>
        set((s) => ({
          billTasks: s.billTasks.map((t) => (t.id === id
            ? { ...t, assigneeId: toId, escalated: false, history: [...t.history, { label: 'Task reassigned', at: 'Just now' }] } : t)),
        })),

      requestBillTaskExtension: (id, days, reason) =>
        set((s) => ({
          billTasks: s.billTasks.map((t) => {
            if (t.id !== id) return t;
            const d = new Date(t.dueDate);
            d.setDate(d.getDate() + days);
            const iso = d.toISOString().slice(0, 10);
            const label = `${new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
            return { ...t, dueDate: iso, dueLabel: label, overdue: false, status: t.status === 'Overdue' ? 'In Progress' : t.status,
              extensionRequested: { days, reason }, history: [...t.history, { label: `Extension granted (${days} days)`, at: 'Just now' }] };
          }),
        })),

      escalateBillTask: (id, toId) =>
        set((s) => ({
          billTasks: s.billTasks.map((t) => (t.id === id
            ? { ...t, escalated: true, escalatedToId: toId, escalatedOn: 'Just now', history: [...t.history, { label: 'Task escalated', at: 'Just now' }] } : t)),
        })),

      returnBillTask: (id) =>
        set((s) => ({
          billTasks: s.billTasks.map((t) => (t.id === id
            ? { ...t, status: 'Pending' as const, history: [...t.history, { label: 'Task returned', at: 'Just now' }] } : t)),
        })),

      addBillTask: (task) => set((s) => ({ billTasks: [task, ...s.billTasks] })),

      advanceBillStage: () =>
        set((s) => ({
          currentStageId: 'procedural-review',
          stageGates: s.stageGates.map((g) => {
            if (g.id === 'legal-review') return { ...g, state: 'Completed' as const, dateLabel: 'Just now' };
            if (g.id === 'procedural-review') return { ...g, state: 'In Progress' as const, dateLabel: 'In Progress' };
            return g;
          }),
        })),

      // ---- PBO assessment ---------------------------------------------------
      sendPboRequest: () =>
        set((s) => ({
          pbo: {
            ...s.pbo, state: 'sent', gatewayRef: PBO_GATEWAY_REF, requestSentAt: 'Just now',
            deliveryStatus: 'Delivered', expectedResponse: '08 Aug 2026', errorCode: undefined,
            timeline: [
              { label: 'Package prepared', at: 'Just now', done: true },
              { label: 'Request queued', at: 'Just now', done: true },
              { label: 'Gateway accepted', at: 'Just now', done: true },
              { label: 'Delivered to PBO', at: 'Just now', done: true },
              { label: 'Awaiting assessment', done: false },
            ],
          },
          billTasks: appendPboHistory(s.billTasks, 'PBO request sent to Parliamentary Budget Office'),
        })),

      receivePboResponse: () =>
        set((s) => ({
          pbo: {
            ...s.pbo, state: 'received', responseAt: 'Just now', finNote: PBO_FIN_NOTE, finNoteSize: '1.2 MB',
            responseSummary: PBO_RESPONSE_SUMMARY, validation: 'Validated',
            linkedRecordRef: `PBO Assessment #${PBO_GATEWAY_REF}`,
            timeline: s.pbo.timeline.map((t) => (t.done ? t : { ...t, at: 'Just now', done: true })),
          },
          billTasks: appendPboHistory(s.billTasks, 'PBO financial-impact note received'),
        })),

      // Satisfying the requirement completes the PBO task and clears the Legal
      // Review gate — the same transition as completeBillTask(PBO_TASK_ID).
      markPboSatisfied: () =>
        set((s) => ({
          pbo: { ...s.pbo, state: 'satisfied', validation: 'Validated' },
          billTasks: s.billTasks.map((t) =>
            t.id === PBO_TASK_ID
              ? { ...t, status: 'Completed' as const, group: 'completed' as const, overdue: false, escalated: false,
                  history: [...t.history, { label: 'PBO requirement satisfied — task completed', at: 'Just now' }] }
              : t),
          stageGates: s.stageGates.map((g) => (g.id === 'legal-review'
            ? {
                ...g,
                blocking: [],
                exit: g.exit.map((e) => (e.label.startsWith('PBO') ? { ...e, status: 'Met' as const } : e)),
                validation: g.validation.map((v) => (v.label.includes('Required documents') ? { ...v, status: 'Met' as const } : v)),
                mandatory: g.mandatory.map((m) => (m.label.includes('PBO') ? { ...m, done: m.total } : m)),
              }
            : g)),
        })),

      failPboGateway: () =>
        set((s) => ({
          pbo: { ...s.pbo, state: 'failed', lastAttemptAt: 'Just now', errorCode: 'GW-503', retryCount: (s.pbo.retryCount ?? 0) + 1 },
          billTasks: appendPboHistory(s.billTasks, 'PBO gateway unavailable — request safely queued'),
        })),

      retryPboRequest: () =>
        set((s) => ({
          pbo: {
            ...s.pbo, state: 'sent', gatewayRef: PBO_GATEWAY_REF, requestSentAt: 'Just now',
            deliveryStatus: 'Delivered', expectedResponse: '08 Aug 2026', errorCode: undefined,
            timeline: [
              { label: 'Package prepared', at: 'Just now', done: true },
              { label: 'Request re-queued', at: 'Just now', done: true },
              { label: 'Gateway accepted', at: 'Just now', done: true },
              { label: 'Delivered to PBO', at: 'Just now', done: true },
              { label: 'Awaiting assessment', done: false },
            ],
          },
          billTasks: appendPboHistory(s.billTasks, 'PBO request retried and delivered'),
        })),

      preparePboManualTransfer: () =>
        set((s) => ({
          pbo: { ...s.pbo, state: 'manual-transfer', manifestRef: `MTX-${PBO_GATEWAY_REF}` },
          billTasks: appendPboHistory(s.billTasks, 'Secure manual-transfer package prepared for PBO'),
        })),

      // ---- Signature, seal & publication ----------------------------------
      applyPublicationSignature: () =>
        set((s) => ({
          publication: {
            ...s.publication,
            state: 'seal-required',
            signatureStatus: 'Verified',
            signatureAppliedAt: '18 Jul 2026, 11:02 AM EAT',
            signatureAuditRef: 'SIG-2026-00047',
            outputs: s.publication.outputs.map((o) => ({ ...o, signatureState: 'Verified' as const })),
          },
          records: s.records.map((r) => (r.id === s.publication.recordId
            ? {
                ...r,
                stage: 'Awaiting Signature' as const,
                currentVersion: '5.0',
                currentVersionLabel: 'Approved Publication Version',
                lastUpdated: new Date().toISOString(),
              }
            : r)),
        })),

      applyPublicationSeal: () =>
        set((s) => ({
          publication: {
            ...s.publication,
            state: 'ready-to-publish',
            sealStatus: 'Applied',
            sealAppliedAt: '18 Jul 2026, 11:18 AM EAT',
            outputs: s.publication.outputs.map((o) => ({ ...o, sealState: 'Verified' as const })),
            destinations: s.publication.destinations.map((d) => (
              d.status === 'Not configured' ? d : { ...d, status: 'Ready' as const }
            )),
          },
          records: s.records.map((r) => (r.id === s.publication.recordId
            ? { ...r, stage: 'Signed and Sealed' as const, currentVersion: '5.0', currentVersionLabel: 'Approved Publication Version', lastUpdated: new Date().toISOString() }
            : r)),
        })),

      markPublicationReady: () =>
        set((s) => ({
          publication: {
            ...s.publication,
            state: 'ready-to-publish',
            destinations: s.publication.destinations.map((d) => (
              d.status === 'Pending' ? { ...d, status: 'Ready' as const } : d
            )),
          },
        })),

      publishRecord: (note) =>
        set((s) => ({
          publication: {
            ...s.publication,
            state: 'published',
            transmissionNote: note,
            publicationTimestamp: '18 Jul 2026, 11:35 AM EAT',
            publicUrl: 'https://www.assembly.go.ke/acts/2026/12',
            immutableAuditRef: 'PUB-2026-00047',
            destinations: s.publication.destinations.map((d) => (
              d.status === 'Ready' ? { ...d, status: 'Complete' as const } : d
            )),
          },
          records: s.records.map((r) => (r.id === s.publication.recordId
            ? {
                ...r,
                stage: 'Published' as const,
                confidentiality: 'Public' as const,
                currentVersion: '5.0',
                currentVersionLabel: 'Published Version',
                publicParticipation: 'Open' as const,
                formats: ['PDF', 'HTML', 'AKN XML'],
                citation: 'Act No. 12 of 2026 (illustrative)',
                lastUpdated: new Date().toISOString(),
              }
            : r)),
        })),

      failPublicationDestination: () =>
        set((s) => ({
          publication: {
            ...s.publication,
            state: 'partially-transmitted',
            signatureStatus: 'Verified',
            signatureAppliedAt: s.publication.signatureAppliedAt ?? '18 Jul 2026, 11:02 AM EAT',
            signatureAuditRef: s.publication.signatureAuditRef ?? 'SIG-2026-00047',
            sealStatus: 'Applied',
            sealAppliedAt: s.publication.sealAppliedAt ?? '18 Jul 2026, 11:18 AM EAT',
            publicationTimestamp: '18 Jul 2026, 11:35 AM EAT',
            publicUrl: undefined,
            immutableAuditRef: 'PUB-2026-00047-PARTIAL',
            outputs: s.publication.outputs.map((o) => ({ ...o, signatureState: 'Verified' as const, sealState: 'Verified' as const })),
            destinations: s.publication.destinations.map((d) => {
              if (d.id === 'na-website') return { ...d, status: 'Failed' as const };
              if (d.id === 'repository' || d.id === 'search-index' || d.status === 'Ready') return { ...d, status: 'Complete' as const };
              return d;
            }),
          },
          records: s.records.map((r) => (r.id === s.publication.recordId
            ? {
                ...r,
                stage: 'Signed and Sealed' as const,
                currentVersion: '5.0',
                currentVersionLabel: 'Approved Publication Version',
                lastUpdated: new Date().toISOString(),
              }
            : r)),
        })),

      retryPublicationDestination: () =>
        set((s) => ({
          publication: {
            ...s.publication,
            state: 'published',
            publicUrl: 'https://www.assembly.go.ke/acts/2026/12',
            immutableAuditRef: 'PUB-2026-00047',
            destinations: s.publication.destinations.map((d) => (
              d.id === 'na-website' || d.status === 'Ready' ? { ...d, status: 'Complete' as const } : d
            )),
          },
          records: s.records.map((r) => (r.id === s.publication.recordId
            ? {
                ...r,
                stage: 'Published' as const,
                confidentiality: 'Public' as const,
                currentVersion: '5.0',
                currentVersionLabel: 'Published Version',
                publicParticipation: 'Open' as const,
                formats: ['PDF', 'HTML', 'AKN XML'],
                citation: 'Act No. 12 of 2026 (illustrative)',
                lastUpdated: new Date().toISOString(),
              }
            : r)),
        })),
    }),
    {
      name: 'lims-national-assembly',
      version: 12,
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
        workflowTemplates: structuredClone(workflowTemplatesSeed),
        createdWorkItems: [],
        billTasks: structuredClone(billTasksSeed),
        stageGates: structuredClone(stageGatesSeed),
        currentStageId: CURRENT_STAGE_ID,
        pbo: structuredClone(pboSeed),
        publication: structuredClone(publicationSeed),
        structuredDrafts: structuredClone(buildStructuredDraftSeed(buildInitialState().records)),
        ...buildInitialState(),
      }),
    },
  ),
);
