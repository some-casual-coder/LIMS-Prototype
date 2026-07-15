import type {
  LegislativeRecord, Version, Task, AppNotification, Submission,
  AuditEvent, Comment, ValidationIssue, BillContent,
} from './types';
import { allRecordsSeed } from './records';
import { primaryBillContent } from './billContent';
import {
  versionsSeed, tasksSeed, notificationsSeed, submissionsSeed,
  commentsSeed, validationSeed,
} from './seedSupporting';
import { auditSeed } from './audit';

// The full mutable dataset the running prototype operates on. `buildInitialState`
// returns a fresh deep copy so that "Reset" restores pristine seeded data.
export interface SeededData {
  records: LegislativeRecord[];
  versions: Version[];
  tasks: Task[];
  notifications: AppNotification[];
  submissions: Submission[];
  auditEvents: AuditEvent[];
  comments: Comment[];
  validationIssues: ValidationIssue[];
  billContent: BillContent;
}

export function buildInitialState(): SeededData {
  // structuredClone keeps the seed arrays immutable between resets.
  return structuredClone({
    records: allRecordsSeed,
    versions: versionsSeed,
    tasks: tasksSeed,
    notifications: notificationsSeed,
    submissions: submissionsSeed,
    auditEvents: auditSeed,
    comments: commentsSeed,
    validationIssues: validationSeed,
    billContent: primaryBillContent,
  });
}

export const PRIMARY_RECORD_ID = 'NA-BILL-2026-015';
