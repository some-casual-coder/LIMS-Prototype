import { useDemoStore } from '@/store/demoStore';
import type {
  AuditEvent, AppNotification, AuditActionType, NotificationCategory,
  RoleId, WorkflowStage, Version,
} from '@/data/types';
import { officers } from '@/data/personas';

// Simulated network latency so actions feel asynchronous (600–1500ms).
export function delay(min = 600, max = 1500): Promise<void> {
  const ms = Math.floor(min + Math.random() * (max - min));
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let seq = 0;
function id(prefix: string): string {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}-${seq}`;
}

function roleTitle(actorId: RoleId | string): string {
  return officers.find((o) => o.id === actorId)?.roleTitle ?? 'User';
}

// Append an audit event. The audit log is append-only.
export function recordAudit(input: {
  recordId: string;
  actorId: RoleId | string;
  actionType: AuditActionType;
  description: string;
  previousValue?: string;
  newValue?: string;
  version?: string;
  result?: AuditEvent['result'];
}): AuditEvent {
  const event: AuditEvent = {
    id: id('aud'),
    recordId: input.recordId,
    timestamp: new Date().toISOString(),
    actorId: input.actorId,
    actorRole: roleTitle(input.actorId),
    actionType: input.actionType,
    description: input.description,
    previousValue: input.previousValue,
    newValue: input.newValue,
    version: input.version,
    session: 'S-LIVE',
    result: input.result ?? 'Success',
    integrity: 'Verified',
  };
  useDemoStore.getState().addAuditEvent(event);
  return event;
}

// Create a notification for a recipient.
export function notify(input: {
  category: NotificationCategory;
  recipientId: RoleId;
  recordId?: string;
  title: string;
  body: string;
}): AppNotification {
  const n: AppNotification = {
    id: id('n'),
    category: input.category,
    recipientId: input.recipientId,
    recordId: input.recordId,
    title: input.title,
    body: input.body,
    createdAt: new Date().toISOString(),
    read: false,
  };
  useDemoStore.getState().addNotification(n);
  return n;
}

export interface ActionResult {
  ok: boolean;
  message: string;
}

// ---- Primary-path actions (expanded through Phase 2). Each mutates local
// state, appends an audit event, may create a notification and returns a result.

export async function submitForReview(recordId: string, actorId: RoleId): Promise<ActionResult> {
  await delay();
  const store = useDemoStore.getState();
  store.setStage(recordId, 'Legal Review');
  recordAudit({
    recordId, actorId, actionType: 'Stage Change',
    description: 'Draft submitted for legal review.',
    previousValue: 'Drafting', newValue: 'Legal Review',
  });
  notify({
    category: 'Review', recipientId: 'dls-reviewer', recordId,
    title: 'Legal review requested',
    body: 'A draft has been submitted for your legal review.',
  });
  return { ok: true, message: 'Submitted for legal review.' };
}

export async function insertAiSuggestion(
  recordId: string, actorId: RoleId, clauseNumber: number, edited: boolean,
): Promise<ActionResult> {
  await delay(400, 900);
  recordAudit({
    recordId, actorId, actionType: 'AI Suggestion',
    description: `AI suggestion ${edited ? 'edited and ' : ''}inserted into Clause ${clauseNumber} after human confirmation.`,
    newValue: `Clause ${clauseNumber} wording`,
  });
  return { ok: true, message: 'Suggestion inserted and recorded in the activity log.' };
}

export async function resolveValidationIssue(
  recordId: string, actorId: RoleId, issueId: string, clauseNumber?: number,
): Promise<ActionResult> {
  await delay(400, 900);
  useDemoStore.getState().resolveValidation(issueId);
  recordAudit({
    recordId, actorId, actionType: 'Edit',
    description: `Validation issue resolved${clauseNumber ? ` on Clause ${clauseNumber}` : ''}.`,
  });
  return { ok: true, message: 'Validation issue resolved.' };
}

export async function returnForRevision(
  recordId: string, actorId: RoleId, reason: string,
): Promise<ActionResult> {
  await delay();
  const store = useDemoStore.getState();
  store.setStage(recordId, 'Revision Requested');
  recordAudit({
    recordId, actorId, actionType: 'Return',
    description: `Draft returned for revision: ${reason}`,
    previousValue: 'Legal Review', newValue: 'Revision Requested',
  });
  notify({
    category: 'Return', recipientId: 'dls-drafter', recordId,
    title: 'Draft returned for revision',
    body: reason,
  });
  return { ok: true, message: 'Draft returned for revision.' };
}

export async function approveLegalStage(recordId: string, actorId: RoleId): Promise<ActionResult> {
  await delay();
  const store = useDemoStore.getState();
  store.setStage(recordId, 'Procedural Review');
  recordAudit({
    recordId, actorId, actionType: 'Approval',
    description: 'Legal review approved; routed to procedural review.',
    previousValue: 'Legal Review', newValue: 'Procedural Review',
  });
  notify({
    category: 'Approval', recipientId: 'dlps-officer', recordId,
    title: 'Procedural review assigned',
    body: 'Legal review is complete. The record is ready for procedural review.',
  });
  return { ok: true, message: 'Legal review approved.' };
}

export async function createVersion(
  recordId: string, actorId: RoleId, version: Omit<Version, 'id'>,
): Promise<ActionResult> {
  await delay();
  const store = useDemoStore.getState();
  store.addVersion({ ...version, id: id('v') });
  recordAudit({
    recordId, actorId, actionType: 'Create',
    description: `Created Version ${version.version}.`,
    newValue: `Version ${version.version}`, version: version.version,
  });
  return { ok: true, message: `Version ${version.version} created.` };
}

export async function advanceStage(
  recordId: string, actorId: RoleId, from: WorkflowStage, to: WorkflowStage,
): Promise<ActionResult> {
  await delay();
  useDemoStore.getState().setStage(recordId, to);
  recordAudit({
    recordId, actorId, actionType: 'Stage Change',
    description: `Workflow advanced from ${from} to ${to}.`,
    previousValue: from, newValue: to,
  });
  return { ok: true, message: `Advanced to ${to}.` };
}

export const mockApi = {
  delay,
  recordAudit,
  notify,
  submitForReview,
  insertAiSuggestion,
  resolveValidationIssue,
  returnForRevision,
  approveLegalStage,
  createVersion,
  advanceStage,
};
