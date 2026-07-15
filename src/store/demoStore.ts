import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  RoleId, LegislativeRecord, Version, Task, AppNotification, Submission,
  AuditEvent, Comment, ValidationIssue, BillContent, WorkflowStage,
} from '@/data/types';
import { buildInitialState } from '@/data/seed';
import { defaultPinned, defaultRecentlyOpened } from '@/data/myWork';

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
}

const initial = buildInitialState();

export const useDemoStore = create<DemoState>()(
  persist(
    (set) => ({
      currentRole: null,
      offline: false,
      pinned: [...defaultPinned],
      recentlyOpened: [...defaultRecentlyOpened],
      ...initial,

      setRole: (role) => set({ currentRole: role }),
      toggleOffline: () => set((s) => ({ offline: !s.offline })),
      reset: () => set({
        currentRole: null, offline: false,
        pinned: [...defaultPinned], recentlyOpened: [...defaultRecentlyOpened],
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
    }),
    {
      name: 'lims-national-assembly',
      version: 1,
    },
  ),
);
