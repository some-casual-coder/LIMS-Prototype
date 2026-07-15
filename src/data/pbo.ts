import type { Tone } from '@/components/ui';
import { TASKS_RECORD_ID, PBO_TASK_ID } from './billTasks';

// ---- PBO Assessment Integration (Priority 0 sanity sprint) -----------------
// A gateway-mediated exchange with the Parliamentary Budget Office: request →
// sent → received → satisfied, plus a gateway-failure / manual-transfer
// fallback. This is NOT a payments feature. Marking the requirement satisfied
// completes the blocking PBO task and clears the Legal Review stage gate
// (see the store's markPboSatisfied / completeBillTask).

export type PboState =
  | 'required'         // Required — not sent (Mock-up A)
  | 'sent'             // Request sent / delivered (Mock-up B)
  | 'received'         // Assessment received (Mock-up C)
  | 'satisfied'        // Requirement satisfied — workflow unblocked
  | 'failed'           // Gateway unavailable — safely queued (Mock-up D)
  | 'manual-transfer'; // Manual secure-transfer fallback prepared

export type PboDocRequirement = 'Required' | 'If applicable' | 'Optional';

export interface PboDoc {
  name: string;
  format: string;   // PDF / XLSX
  size: string;     // "1.4 MB"
  requirement: PboDocRequirement;
  available: boolean;
  version?: string; // "v4.0"
  checksum?: string;
}

export interface PboTimelineStep {
  label: string;
  at?: string;
  done: boolean;
}

export interface PboAssessment {
  recordId: string;
  taskId: string;
  state: PboState;
  requiringStage: string;      // "Legal Review"
  reason: string;              // why the assessment is required
  requestingOfficerId: string; // 'dls-drafter' — Grace Wanjiku
  liaisonId: string;           // 'pbo-liaison' — Sarah Njeri
  classification: string;      // "Internal — Restricted"
  dueDate: string;             // ISO
  dueLabel: string;            // "31 Jul 2026"
  dueInLabel: string;          // "In 16 days"
  documents: PboDoc[];

  // Request (set on send)
  gatewayRef?: string;         // "PBO-REQ-2026-00847"
  requestSentAt?: string;
  receivingOffice?: string;    // "Parliamentary Budget Office"
  deliveryStatus?: string;     // "Delivered"
  expectedResponse?: string;   // "08 Aug 2026"
  timeline: PboTimelineStep[];

  // Response (set on receive)
  responseAt?: string;
  finNote?: string;            // "FIN-PBO-2026-00847.pdf"
  finNoteSize?: string;
  responseSummary?: string;
  validation?: 'Validated' | 'Pending';
  linkedRecordRef?: string;    // "PBO Assessment #PBO-REQ-2026-00847"

  // Failure / manual transfer
  lastAttemptAt?: string;
  errorCode?: string;          // "GW-503"
  retryCount?: number;
  manifestRef?: string;        // manual secure-transfer manifest
}

export const PBO_GATEWAY_REF = 'PBO-REQ-2026-00847';
export const PBO_FIN_NOTE = 'FIN-PBO-2026-00847.pdf';

// Illustrative (not an actual PBO determination) financial-impact summary.
export const PBO_RESPONSE_SUMMARY =
  'The Bill is expected to require an estimated additional allocation of KES 1.38 billion over the medium term. Phased implementation and annual review are recommended.';

export const pboSeed: PboAssessment = {
  recordId: TASKS_RECORD_ID,
  taskId: PBO_TASK_ID,
  state: 'required',
  requiringStage: 'Legal Review',
  reason:
    'PBO assessment is mandatory as per the Standing Orders and the Public Finance Management Act provisions.',
  requestingOfficerId: 'dls-drafter', // Grace Wanjiku, Senior Legal Counsel
  liaisonId: 'pbo-liaison',           // Sarah Njeri, Parliamentary Budget Office
  classification: 'Internal — Restricted',
  dueDate: '2026-07-31',
  dueLabel: '31 Jul 2026',
  dueInLabel: 'In 16 days',
  documents: [
    { name: 'Draft Bill (latest version)', format: 'PDF', size: '1.4 MB', requirement: 'Required', available: true, version: 'v4.0', checksum: 'a1f3…9c' },
    { name: 'Explanatory Memorandum', format: 'PDF', size: '2.1 MB', requirement: 'Required', available: true, checksum: '7be0…42' },
    { name: 'Financial Impact Summary', format: 'XLSX', size: '560 KB', requirement: 'Required', available: true, checksum: 'c4d9…18' },
    { name: 'Data / Costing Assumptions', format: 'PDF', size: '890 KB', requirement: 'If applicable', available: true, checksum: 'e6a2…7f' },
  ],
  receivingOffice: 'Parliamentary Budget Office',
  timeline: [],
};

// State → pastel tone + label + short description for status surfaces.
// No blue/purple: "in progress" states use the neutral charcoal ('blue') tone.
export const pboStatusMeta: Record<PboState, { tone: Tone; label: string; short: string }> = {
  required: { tone: 'amber', label: 'PBO Assessment Required', short: 'Financial-impact assessment is required before this Bill can move beyond Legal Review.' },
  sent: { tone: 'blue', label: 'PBO Assessment In Progress', short: 'Request sent to the Parliamentary Budget Office; awaiting the financial-impact note.' },
  received: { tone: 'green', label: 'PBO Assessment Received', short: 'Financial-impact note received. Mark the requirement satisfied to unblock the workflow.' },
  satisfied: { tone: 'green', label: 'PBO Assessment Complete', short: 'Financial-impact assessment received. The workflow is unblocked.' },
  failed: { tone: 'red', label: 'PBO Integration Issue', short: 'Unable to reach the PBO gateway. The request is safely queued.' },
  'manual-transfer': { tone: 'blue', label: 'PBO Manual Transfer', short: 'A secure package has been prepared for manual transfer to the PBO.' },
};
